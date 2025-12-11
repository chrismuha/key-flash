// ---------- Settings / LocalStorage ----------
const SETTINGS_KEY = "pdf_page_sorter_settings_v1";

const defaultSettings = {
    ocrEnabled: true,
    ocrLang: "eng",
    remember: true
};

let settings = { ...defaultSettings };

function loadSettingsFromStorage() {
    try {
        const raw = localStorage.getItem(SETTINGS_KEY);
        if (!raw) return;
        const parsed = JSON.parse(raw);
        settings = { ...defaultSettings, ...parsed };
    } catch (e) {
        console.warn("Failed to load settings:", e);
    }
}

function saveSettingsToStorage() {
    if (!settings.remember) return;
    try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
        console.warn("Failed to save settings:", e);
    }
}

function syncSettingsToUI() {
    document.getElementById("ocrToggle").checked = settings.ocrEnabled;
    document.getElementById("ocrLang").value = settings.ocrLang;
    document.getElementById("rememberSettings").checked = settings.remember;
}

function syncSettingsFromUI() {
    settings.ocrEnabled = document.getElementById("ocrToggle").checked;
    settings.ocrLang = document.getElementById("ocrLang").value;
    settings.remember = document.getElementById("rememberSettings").checked;
    saveSettingsToStorage();
}

// ---------- Logging ----------
const logEl = document.getElementById("log");
const previewGrid = document.getElementById("previewGrid");
const previewTitle = document.getElementById("previewTitle");

function logLine(msg, type = "normal") {
    const div = document.createElement("div");
    if (type === "strong") div.className = "log-line-strong";
    else if (type === "ok") div.className = "log-line-ok";
    else if (type === "warn") div.className = "log-line-warn";
    else if (type === "err") div.className = "log-line-err";
    div.textContent = msg;
    logEl.appendChild(div);
    logEl.scrollTop = logEl.scrollHeight;
}

function resetPreviews(message = "Drop a PDF to see page thumbnails.") {
    previewGrid.className = "preview-grid empty";
    previewGrid.innerHTML = `<div class="preview-empty">${message}</div>`;
    previewTitle.textContent = "Idle";
}

function ensurePreviewGrid() {
    if (previewGrid.classList.contains("empty")) {
        previewGrid.classList.remove("empty");
        previewGrid.innerHTML = "";
    }
}

async function renderThumbnail(page, pageNumber) {
    const viewport = page.getViewport({ scale: 0.35 });
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    await page.render({ canvasContext: ctx, viewport }).promise;
    const url = canvas.toDataURL("image/png");
    canvas.width = canvas.height = 0;
    ensurePreviewGrid();
    const wrap = document.createElement("div");
    wrap.className = "thumb";
    const img = document.createElement("img");
    img.src = url;
    img.alt = `Page ${pageNumber}`;
    const label = document.createElement("div");
    label.className = "thumb-label";
    label.textContent = `Page ${pageNumber}`;
    wrap.appendChild(img);
    wrap.appendChild(label);
    previewGrid.appendChild(wrap);
}

// ---------- File list UI ----------
let files = []; // { id, file, status }

const fileListEl = document.getElementById("fileList");
const processBtn = document.getElementById("processBtn");
const clearBtn = document.getElementById("clearBtn");
const fileInput = document.getElementById("fileInput");
const dropZone = document.getElementById("dropZone");

function humanSize(bytes) {
    if (!bytes && bytes !== 0) return "";
    const units = ["B", "KB", "MB", "GB"];
    let i = 0;
    let v = bytes;
    while (v > 1024 && i < units.length - 1) {
        v /= 1024;
        i++;
    }
    return v.toFixed(i === 0 ? 0 : 1) + " " + units[i];
}

function renderFileList() {
    if (!files.length) {
        fileListEl.className = "file-list empty";
        fileListEl.innerHTML = "No files added yet. Drop PDFs above to get started.";
        return;
    }

    fileListEl.className = "file-list";
    fileListEl.innerHTML = "";

    files.forEach((entry) => {
        const row = document.createElement("div");
        row.className = "file-row";

        const nameCol = document.createElement("div");
        const name = document.createElement("div");
        name.className = "file-name";
        name.textContent = entry.file.name;
        const size = document.createElement("div");
        size.className = "file-size";
        size.textContent = humanSize(entry.file.size);
        nameCol.appendChild(name);
        nameCol.appendChild(size);

        const statusCol = document.createElement("div");
        const pill = document.createElement("div");
        pill.className = "status-pill " + entry.status;
        const dot = document.createElement("span");
        dot.className = "status-icon";
        const text = document.createElement("span");
        text.textContent =
            entry.status === "idle" ? "Queued" :
                entry.status === "running" ? "Processing" :
                    entry.status === "done" ? "Done" :
                        "Error";
        pill.appendChild(dot);
        pill.appendChild(text);
        statusCol.appendChild(pill);

        const removeCol = document.createElement("div");
        const removeBtn = document.createElement("button");
        removeBtn.className = "remove-btn";
        removeBtn.innerHTML = "&times;";
        removeBtn.addEventListener("click", () => removeFile(entry.id));
        removeCol.appendChild(removeBtn);

        row.appendChild(nameCol);
        row.appendChild(statusCol);
        row.appendChild(removeCol);

        fileListEl.appendChild(row);
    });
}

function addFiles(fileList) {
    const added = [];
    for (const f of fileList) {
        if (f.type !== "application/pdf" && !f.name.toLowerCase().endsWith(".pdf")) continue;
        const id = `${Date.now()}_${Math.random().toString(16).slice(2)}`;
        files.push({ id, file: f, status: "idle" });
        added.push(f.name);
    }
    if (added.length) {
        logLine(`Added ${added.length} PDF(s): ${added.join(", ")}`, "strong");
    }
    renderFileList();
}

function removeFile(id) {
    files = files.filter(f => f.id !== id);
    renderFileList();
}

// ---------- Drag and drop ----------
dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.classList.add("dragover");
});

dropZone.addEventListener("dragleave", (e) => {
    e.preventDefault();
    dropZone.classList.remove("dragover");
});

dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropZone.classList.remove("dragover");
    const dt = e.dataTransfer;
    if (dt.items) {
        const filesToAdd = [];
        for (const item of dt.items) {
            if (item.kind === "file") {
                const file = item.getAsFile();
                if (file) filesToAdd.push(file);
            }
        }
        addFiles(filesToAdd);
    } else {
        addFiles(dt.files);
    }
});

fileInput.addEventListener("change", (e) => {
    addFiles(e.target.files);
    fileInput.value = "";
});

clearBtn.addEventListener("click", () => {
    files = [];
    renderFileList();
    logLine("Cleared file list.");
    resetPreviews("Drop a PDF to see page thumbnails.");
});

// ---------- Page number detection ----------
function detectPageNumber(text) {
    if (!text) return null;
    text = text.toLowerCase();

    let match;
    // page 3
    match = text.match(/\bpage\s+(\d{1,4})\b/);
    if (match) return parseInt(match[1]);

    // page 3 of 10
    match = text.match(/\bpage\s+(\d{1,4})\s+of\s+\d{1,4}\b/);
    if (match) return parseInt(match[1]);

    // p. 3
    match = text.match(/\bp\.\s*(\d{1,4})\b/);
    if (match) return parseInt(match[1]);

    // fallback: last bare integer
    const nums = text.match(/\b(\d{1,4})\b/g);
    if (nums && nums.length) {
        return parseInt(nums[nums.length - 1]);
    }
    return null;
}

// ---------- OCR helper ----------
async function extractWithOCR(page, lang) {
    // render page to canvas
    const viewport = page.getViewport({ scale: 2.0 });
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    const renderContext = { canvasContext: ctx, viewport };
    await page.render(renderContext).promise;

    const { data: { text } } = await Tesseract.recognize(canvas, lang);
    return text;
}

// ---------- Processing ----------
async function processSingleFile(entry) {
    const file = entry.file;
    logLine(`\n=== Processing "${file.name}" ===`, "strong");

    entry.status = "running";
    renderFileList();

    const arrayBuffer = await file.arrayBuffer();
    previewTitle.textContent = file.name;
    previewGrid.classList.remove("empty");
    previewGrid.innerHTML = "";

    // PDF.js worker config (safe default)
    if (pdfjsLib.GlobalWorkerOptions && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
        pdfjsLib.GlobalWorkerOptions.workerSrc =
            "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.7.107/pdf.worker.min.js";
    }

    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    logLine(`Loaded PDF. Pages: ${pdf.numPages}`);

    const pagesInfo = []; // { index, pageNum }
    const maxThumbs = 24;
    let thumbCount = 0;

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        let text = "";

        try {
            const textContent = await page.getTextContent();
            text = textContent.items.map(item => item.str).join(" ");
        } catch (e) {
            logLine(`Page ${i}: text extraction failed (${e})`, "warn");
        }

        if (!text.trim() && settings.ocrEnabled) {
            logLine(`Page ${i}: No text detected, using OCR (${settings.ocrLang})…`, "warn");
            try {
                text = await extractWithOCR(page, settings.ocrLang);
                logLine(`Page ${i}: OCR complete.`, "ok");
            } catch (e) {
                logLine(`Page ${i}: OCR failed (${e})`, "err");
            }
        }

        const pageNum = detectPageNumber(text);
        pagesInfo.push({ index: i - 1, pageNum });

        if (pageNum != null) {
            logLine(`Page ${i}: detected page number → ${pageNum}`);
        } else {
            logLine(`Page ${i}: no page number detected`, "warn");
        }

        if (thumbCount < maxThumbs) {
            await renderThumbnail(page, i);
            thumbCount++;
        }
    }

    const withNumbers = pagesInfo.filter(p => p.pageNum != null)
        .sort((a, b) => a.pageNum - b.pageNum);
    const withoutNumbers = pagesInfo.filter(p => p.pageNum == null);

    const sorted = [...withNumbers, ...withoutNumbers];

    if (pdf.numPages > maxThumbs) {
        const more = document.createElement("div");
        more.className = "preview-empty";
        more.textContent = `+ ${pdf.numPages - maxThumbs} more page(s) not shown`;
        previewGrid.appendChild(more);
    }

    logLine("Rebuilding PDF in sorted order…");

    const originalPdf = await PDFLib.PDFDocument.load(arrayBuffer);
    const newPdf = await PDFLib.PDFDocument.create();

    for (let idx = 0; idx < sorted.length; idx++) {
        const srcIndex = sorted[idx].index;
        const [copied] = await newPdf.copyPages(originalPdf, [srcIndex]);
        newPdf.addPage(copied);
        logLine(`  → Output position ${idx + 1}: original page ${srcIndex + 1}`);
    }

    const sortedBytes = await newPdf.save();
    const blob = new Blob([sortedBytes], { type: "application/pdf" });

    const baseName = file.name.replace(/\.pdf$/i, "");
    const outName = `${baseName}_sorted.pdf`;

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = outName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    logLine(`Finished "${file.name}". Downloaded as "${outName}".`, "ok");

    entry.status = "done";
    renderFileList();
}

async function processAll() {
    if (!files.length) {
        logLine("No files to process.", "warn");
        return;
    }

    syncSettingsFromUI();
    processBtn.disabled = true;

    for (const entry of files) {
        try {
            await processSingleFile(entry);
        } catch (e) {
            entry.status = "error";
            renderFileList();
            logLine(`Error while processing "${entry.file.name}": ${e}`, "err");
        }
    }

    logLine("\nAll jobs finished.");
    processBtn.disabled = false;
}

processBtn.addEventListener("click", () => {
    processAll();
});

// ---------- Settings wiring ----------
document.getElementById("ocrToggle").addEventListener("change", syncSettingsFromUI);
document.getElementById("ocrLang").addEventListener("change", syncSettingsFromUI);
document.getElementById("rememberSettings").addEventListener("change", syncSettingsFromUI);

// ---------- Init ----------
(function init() {
    loadSettingsFromStorage();
    syncSettingsToUI();
    renderFileList();
    logLine("Ready. Add PDFs to start.");
    resetPreviews();
})();
