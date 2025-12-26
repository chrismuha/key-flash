(() => {
  'use strict';

  const workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.7.107/pdf.worker.min.js';
  if (window.pdfjsLib && pdfjsLib.GlobalWorkerOptions) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;
  }

  const els = {};
  const queue = [];

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const log = (msg, level = 'info') => {
    if (!els.log) return;
    const div = document.createElement('div');
    div.textContent = msg;
    const clsMap = {
      info: 'log-line-strong',
      ok: 'log-line-ok',
      warn: 'log-line-warn',
      err: 'log-line-err'
    };
    div.className = clsMap[level] || clsMap.info;
    els.log.appendChild(div);
    els.log.scrollTop = els.log.scrollHeight;
  };

  const statusClassMap = {
    idle: 'status-pill idle',
    running: 'status-pill running',
    done: 'status-pill done',
    error: 'status-pill error'
  };

  const renderFileList = () => {
    if (!els.fileList) return;
    if (!queue.length) {
      els.fileList.classList.add('empty');
      els.fileList.textContent = 'No files added yet. Drop PDFs above to get started.';
      return;
    }
    els.fileList.classList.remove('empty');
    els.fileList.innerHTML = '';
    const frag = document.createDocumentFragment();
    queue.forEach((item, idx) => {
      const row = document.createElement('div');
      row.className = 'file-row';

      const name = document.createElement('div');
      name.className = 'file-name';
      name.textContent = item.file.name;

      const size = document.createElement('div');
      size.className = 'file-size';
      size.textContent = formatBytes(item.file.size);

      const status = document.createElement('div');
      status.className = statusClassMap[item.status] || statusClassMap.idle;
      status.innerHTML = `<span class="status-icon"></span>${item.status}`;
      status.dataset.index = idx;

      const remove = document.createElement('button');
      remove.className = 'remove-btn';
      remove.innerHTML = '&times;';
      remove.addEventListener('click', () => {
        queue.splice(idx, 1);
        renderFileList();
      });

      row.append(name, size, status, remove);
      frag.appendChild(row);
    });
    els.fileList.appendChild(frag);
  };

  const updateStatus = (idx, status) => {
    const item = queue[idx];
    if (!item) return;
    item.status = status;
    const pill = els.fileList.querySelector(`.status-pill[data-index="${idx}"]`);
    if (pill) {
      pill.className = statusClassMap[status] || statusClassMap.idle;
      pill.innerHTML = `<span class="status-icon"></span>${status}`;
    }
  };

  const readFileAsArrayBuffer = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });

  const computeDeskewAngleFromText = (items = []) => {
    const angles = [];
    for (const item of items) {
      if (!item.transform) continue;
      const [a, b] = item.transform;
      if (typeof a !== 'number' || typeof b !== 'number') continue;
      if (Math.abs(a) < 1e-6 && Math.abs(b) < 1e-6) continue;
      const angle = Math.atan2(b, a);
      if (Math.abs(angle) > Math.PI / 6) continue;
      angles.push(angle);
    }
    if (!angles.length) return 0;
    const avg = angles.reduce((sum, value) => sum + value, 0) / angles.length;
    if (Math.abs(avg) < 0.002) return 0;
    const deg = -avg * (180 / Math.PI);
    return Math.max(-15, Math.min(15, deg));
  };

  const estimateSkewAngleFromCanvas = (canvas) => {
    if (!canvas) return 0;
    const ctx = canvas.getContext('2d');
    const { width, height } = canvas;
    const data = ctx.getImageData(0, 0, width, height).data;
    let sumX = 0;
    let sumY = 0;
    let sumXX = 0;
    let sumYY = 0;
    let sumXY = 0;
    let count = 0;
    const threshold = 220;

    for (let idx = 0; idx < data.length; idx += 4) {
      const grey = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
      if (grey > threshold) continue;
      const pixelIndex = idx / 4;
      const x = pixelIndex % width;
      const y = Math.floor(pixelIndex / width);
      sumX += x;
      sumY += y;
      sumXX += x * x;
      sumYY += y * y;
      sumXY += x * y;
      count++;
    }

    if (count < 50) return 0;
    const meanX = sumX / count;
    const meanY = sumY / count;
    const covXX = sumXX / count - meanX * meanX;
    const covYY = sumYY / count - meanY * meanY;
    const covXY = sumXY / count - meanX * meanY;
    const angle = 0.5 * Math.atan2(2 * covXY, covXX - covYY);
    const deg = angle * (180 / Math.PI);
    return Math.max(-15, Math.min(15, -deg));
  };

  const renderPageToCanvas = async (page, scale = 0.5) => {
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    await page.render({ canvasContext: ctx, viewport }).promise;
    return canvas;
  };

  const ocrPageNumber = async ({ page, canvas, scale = 0.4 } = {}) => {
    if (!window.Tesseract) return '';
    const needsCleanup = !canvas;
    const targetCanvas = canvas || await renderPageToCanvas(page, scale);
    try {
      const config = {
        tessedit_char_whitelist: '0123456789Pageof ()',
        tessedit_pageseg_mode: window.Tesseract?.PSM?.SINGLE_BLOCK || 6
      };
      const result = await Tesseract.recognize(targetCanvas, 'eng', config);
      return result?.data?.text || '';
    } finally {
      if (needsCleanup) targetCanvas.remove();
    }
  };

  const guessPageNumber = (text, totalPages) => {
    const lower = text.toLowerCase();
    const pageOf = lower.match(/page\s+(\d{1,4})\s+of\s+(\d{1,4})/i);
    if (pageOf) {
      const current = parseInt(pageOf[1], 10);
      const total = parseInt(pageOf[2], 10);
      if (!isNaN(current) && !isNaN(total) && (totalPages === total || total > 0)) {
        return current;
      }
    }

    const pageOnly = lower.match(/page\s+(\d{1,4})/i);
    if (pageOnly) {
      const v = parseInt(pageOnly[1], 10);
      if (!isNaN(v) && v >= 1 && v <= (totalPages || 9999)) return v;
    }

    const numbers = [...text.matchAll(/\b(\d{1,4})\b/g)].map((m) => parseInt(m[1], 10)).filter((n) => !isNaN(n));
    const inRange = numbers.find((n) => n >= 1 && n <= (totalPages || 9999));
    if (inRange) return inRange;

    return null;
  };

  const detectOrder = async (bytes) => {
    if (!window.pdfjsLib) throw new Error('PDF.js not available');
    const task = pdfjsLib.getDocument({ data: bytes });
    const pdf = await task.promise;
    const detections = [];
    const skewAngles = [];
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const text = textContent.items.map((t) => t.str).join(' ');
      const pageCanvas = await renderPageToCanvas(page, 0.6);
      const imageSkew = estimateSkewAngleFromCanvas(pageCanvas);
      const textSkew = computeDeskewAngleFromText(textContent.items);
      const deskewAngle = Math.abs(imageSkew) >= Math.abs(textSkew) ? imageSkew : textSkew;
      let num = guessPageNumber(text, pdf.numPages);
      if (!num && window.Tesseract) {
        try {
          const ocrText = await ocrPageNumber({ canvas: pageCanvas });
          const ocrNum = guessPageNumber(ocrText, pdf.numPages);
          if (ocrNum) num = ocrNum;
        } catch (err) {
          console.warn('OCR error', err);
        }
      }
      skewAngles.push(deskewAngle);
      detections.push({ pageIndex: i - 1, number: num });
      pageCanvas.remove();
    }
    await task.destroy();
    const safeNumber = (entry) => (typeof entry.number === 'number' ? entry.number : entry.pageIndex + 1);
    const ordered = [...detections].sort((a, b) => (safeNumber(a) - safeNumber(b)) || (a.pageIndex - b.pageIndex));
    return { order: ordered.map((d) => d.pageIndex), deskewAngles: skewAngles };
  };

  const rebuildPdf = async (bytes, order, { autoStraighten = true, rotation = 0, deskewAngles = [] } = {}) => {
    if (!window.PDFLib) throw new Error('pdf-lib not available');
    const src = await PDFLib.PDFDocument.load(bytes);
    const next = await PDFLib.PDFDocument.create();
    const copied = await next.copyPages(src, order);
    copied.forEach((p, idx) => {
      const srcPage = src.getPage(order[idx]);
      const { width, height } = srcPage.getSize();
      let rotateDeg = (rotation || 0) % 360;
      // auto-straighten: rotate landscape pages to portrait
      if (autoStraighten && width > height) rotateDeg += 90;
      rotateDeg = ((rotateDeg % 360) + 360) % 360;
      const combinedRotation = rotateDeg + (deskewAngles[order[idx]] || 0);
      if (combinedRotation) p.setRotation(PDFLib.degrees(combinedRotation));
      next.addPage(p);
    });
    return next.save();
  };

  const downloadFile = (bytes, name) => {
    const blob = new Blob([bytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name.endsWith('.pdf') ? name : `${name}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const renderPreview = async (file) => {
    if (!els.previewGrid || !window.pdfjsLib) return;
    els.previewGrid.classList.remove('empty');
    els.previewGrid.innerHTML = '';
    const card = document.createElement('div');
    card.className = 'thumb';
    const img = document.createElement('img');
    img.alt = `${file.name} preview`;
    const label = document.createElement('div');
    label.className = 'thumb-label';
    label.textContent = file.name;
    card.append(img, label);
    els.previewGrid.appendChild(card);

    try {
      const data = await readFileAsArrayBuffer(file);
      const task = pdfjsLib.getDocument({ data });
      const pdf = await task.promise;
      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 0.5 });
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      await page.render({ canvasContext: ctx, viewport }).promise;
      img.src = canvas.toDataURL('image/png');
      els.previewTitle.textContent = `Previewing ${file.name}`;
      await task.destroy();
    } catch (err) {
      img.remove();
      label.textContent = `${file.name} (preview unavailable)`;
      els.previewTitle.textContent = 'Preview unavailable';
    }
  };

  const addFiles = (fileList) => {
    const fresh = Array.from(fileList).filter((f) => f.type === 'application/pdf');
    fresh.forEach((file) => {
      queue.push({ file, status: 'idle' });
    });
    renderFileList();
    if (queue.length && fresh.length) renderPreview(queue[0].file);
  };

  const setProcessingState = (running) => {
    if (els.processBtn) {
      els.processBtn.disabled = running || !queue.length;
      els.processBtn.textContent = running ? 'Processing…' : '▶️ Process all';
    }
    if (els.clearBtn) els.clearBtn.disabled = running;
  };

  const processQueue = async () => {
    if (!queue.length) return;
    const straighten = {
      autoStraighten: !!(els.autoStraighten && els.autoStraighten.checked),
      rotation: els.rotation ? parseInt(els.rotation.value, 10) || 0 : 0,
      deskew: !!(els.deskewToggle && els.deskewToggle.checked)
    };
    setProcessingState(true);
    for (let i = 0; i < queue.length; i++) {
      updateStatus(i, 'running');
      const item = queue[i];
      try {
        const bytes = await readFileAsArrayBuffer(item.file);
        const { order, deskewAngles } = await detectOrder(bytes.slice(0));
        log(`Detected page order for ${item.file.name}: [${order.map((o) => o + 1).join(', ')}]`, 'info');
        const deskewPayload = straighten.deskew ? { deskewAngles } : {};
        const rebuilt = await rebuildPdf(bytes.slice(0), order, { ...straighten, ...deskewPayload });
        downloadFile(rebuilt, item.file.name);
        updateStatus(i, 'done');
        const straightenNote = straighten.rotation ? `; rotation ${straighten.rotation}°` : '';
        const autoNote = straighten.autoStraighten ? '; auto-straighten on' : '';
        const deskewNote = straighten.deskew && deskewAngles.some((angle) => Math.abs(angle) > 0.0001) ? '; deskew applied' : '';
        log(`Downloaded ${item.file.name} with original filename${autoNote}${straightenNote}${deskewNote}`, 'ok');
      } catch (err) {
        console.error(err);
        updateStatus(i, 'error');
        log(`Error processing ${item.file.name}: ${err.message}`, 'err');
      }
    }
    setProcessingState(false);
  };

  const bindEvents = () => {
    if (els.fileInput) {
      els.fileInput.addEventListener('change', (e) => {
        addFiles(e.target.files || []);
        els.fileInput.value = '';
      });
    }

    if (els.dropZone) {
      ['dragenter', 'dragover'].forEach((evt) => {
        els.dropZone.addEventListener(evt, (e) => {
          e.preventDefault();
          e.stopPropagation();
          els.dropZone.classList.add('dragover');
        });
      });
      ['dragleave', 'drop'].forEach((evt) => {
        els.dropZone.addEventListener(evt, (e) => {
          e.preventDefault();
          e.stopPropagation();
          els.dropZone.classList.remove('dragover');
        });
      });
      els.dropZone.addEventListener('drop', (e) => {
        const files = e.dataTransfer ? e.dataTransfer.files : [];
        addFiles(files);
      });
    }

    if (els.processBtn) {
      els.processBtn.addEventListener('click', () => processQueue());
    }

    if (els.clearBtn) {
      els.clearBtn.addEventListener('click', () => {
        queue.splice(0, queue.length);
        renderFileList();
        if (els.previewGrid) {
          els.previewGrid.classList.add('empty');
          els.previewGrid.innerHTML = '<div class="preview-empty">Drop a PDF to see page thumbnails.</div>';
        }
        if (els.previewTitle) els.previewTitle.textContent = 'Idle';
      });
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    els.dropZone = document.getElementById('dropZone');
    els.fileInput = document.getElementById('fileInput');
    els.fileList = document.getElementById('fileList');
    els.processBtn = document.getElementById('processBtn');
    els.clearBtn = document.getElementById('clearBtn');
    els.log = document.getElementById('log');
    els.previewGrid = document.getElementById('previewGrid');
    els.previewTitle = document.getElementById('previewTitle');
    els.autoStraighten = document.getElementById('autoStraighten');
    els.rotation = document.getElementById('rotation');
    els.deskewToggle = document.getElementById('deskewToggle');

    renderFileList();
    bindEvents();
  });
})();
