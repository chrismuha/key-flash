(() => {
  const STORAGE_KEY = "boxify.counts";
  const ENABLED_KEY = "boxify.enabled";
  const TEMPLATES_KEY = "boxify.templates";

  function loadCounts() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); }
    catch { return {}; }
  }
  function saveCounts(map) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(map)); } catch { }
  }

  function loadEnabled() {
    try {
      const raw = localStorage.getItem(ENABLED_KEY);
      if (!raw) return [];
      const arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr.map(String) : [];
    } catch { return []; }
  }
  function saveEnabled(list) {
    try { localStorage.setItem(ENABLED_KEY, JSON.stringify(Array.from(list || []))); } catch { }
  }

  const DEFAULT_TEMPLATES = [
    'SSD', 'RAM', 'GPU', 'CPU', 'Motherboard', 'Power Supply', 'Cooling', 'Case', 'Monitor', 'Accessory'
  ];
  function loadTemplates() {
    try {
      const raw = localStorage.getItem(TEMPLATES_KEY);
      if (!raw) return DEFAULT_TEMPLATES.slice();
      const arr = JSON.parse(raw);
      return Array.isArray(arr) && arr.length ? arr.map(String) : DEFAULT_TEMPLATES.slice();
    } catch { return DEFAULT_TEMPLATES.slice(); }
  }
  function saveTemplates(list) {
    try { localStorage.setItem(TEMPLATES_KEY, JSON.stringify(Array.from(list || []))); } catch { }
  }

  function ensureWrapper(el, label) {
    const wrapper = document.createElement("div");
    wrapper.className = "boxify";
    wrapper.setAttribute("data-boxify-id", label.toLowerCase().replace(/\s+/g, "-"));
    wrapper.setAttribute("aria-label", label + " quantity");
    wrapper.setAttribute("aria-live", "polite");
    wrapper.tabIndex = 0;

    const title = document.createElement("div");
    title.className = "boxify-title";
    title.textContent = label;

    const controls = document.createElement("div");
    controls.className = "boxify-controls";

    const minusBtn = document.createElement("button");
    minusBtn.type = "button";
    minusBtn.className = "boxify-btn minus";
    minusBtn.textContent = "-";
    minusBtn.setAttribute("aria-label", "Decrease " + label);

    const qty = document.createElement("div");
    qty.className = "boxify-qty";
    qty.textContent = "0";

    const plusBtn = document.createElement("button");
    plusBtn.type = "button";
    plusBtn.className = "boxify-btn plus";
    plusBtn.textContent = "+";
    plusBtn.setAttribute("aria-label", "Increase " + label);

    controls.appendChild(minusBtn);
    controls.appendChild(qty);
    controls.appendChild(plusBtn);

    const contentHolder = document.createElement("div");
    contentHolder.style.font = "400 12px/1.2 Arial, sans-serif";
    contentHolder.style.opacity = "0.8";
    while (el.firstChild) contentHolder.appendChild(el.firstChild);

    wrapper.appendChild(title);
    if (contentHolder.childNodes.length) wrapper.appendChild(contentHolder);
    wrapper.appendChild(controls);

    el.replaceWith(wrapper);
    return wrapper;
  }

  // Create a box wrapper from just a label (no source element)
  function createWrapper(label) {
    const wrapper = document.createElement("div");
    wrapper.className = "boxify";
    wrapper.setAttribute("data-boxify-id", label.toLowerCase().replace(/\s+/g, "-"));
    wrapper.setAttribute("aria-label", label + " quantity");
    wrapper.setAttribute("aria-live", "polite");
    wrapper.tabIndex = 0;

    const title = document.createElement("div");
    title.className = "boxify-title";
    title.textContent = label;

    const controls = document.createElement("div");
    controls.className = "boxify-controls";

    const minusBtn = document.createElement("button");
    minusBtn.type = "button";
    minusBtn.className = "boxify-btn minus";
    minusBtn.textContent = "-";
    minusBtn.setAttribute("aria-label", "Decrease " + label);

    const qty = document.createElement("div");
    qty.className = "boxify-qty";
    qty.textContent = "0";

    const plusBtn = document.createElement("button");
    plusBtn.type = "button";
    plusBtn.className = "boxify-btn plus";
    plusBtn.textContent = "+";
    plusBtn.setAttribute("aria-label", "Increase " + label);

    controls.appendChild(minusBtn);
    controls.appendChild(qty);
    controls.appendChild(plusBtn);

    wrapper.appendChild(title);
    wrapper.appendChild(controls);
    return wrapper;
  }

  function getLogPanel() {
    let panel = document.getElementById("boxify-log");
    if (!panel) {
      panel = document.createElement("div");
      panel.id = "boxify-log";
      panel.style.position = "fixed";
      panel.style.bottom = "12px";
      panel.style.right = "12px";
      panel.style.background = "rgba(0,0,0,0.75)";
      panel.style.color = "#fff";
      panel.style.font = "12px/1.4 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace";
      panel.style.padding = "10px 12px";
      panel.style.borderRadius = "8px";
      panel.style.maxWidth = "40vw";
      panel.style.maxHeight = "40vh";
      panel.style.overflow = "auto";
      panel.style.zIndex = "999999";
      panel.style.transition = "opacity 100ms ease";
      panel.setAttribute("aria-label", "Boxify status");
      document.body.appendChild(panel);
    }
    return panel;
  }

  function getLabelById(id) {
    const t = document.querySelector('[data-boxify-id="' + id + '"] .boxify-title');
    return t ? t.textContent.trim() : id;
  }

  function updateLogLine(id, qty) {
    const panel = getLogPanel();
    let line = panel.querySelector('[data-log-id="' + id + '"]');
    if (!line) {
      line = document.createElement("div");
      line.setAttribute("data-log-id", id);
      panel.appendChild(line);
    }
    line.textContent = getLabelById(id) + " = " + qty;
  }

  function listBoxes() {
    return Array.from(document.querySelectorAll(".boxify"));
  }
  function focusIndex(i) {
    const boxes = listBoxes();
    if (i < 0 || i >= boxes.length) return;
    boxes[i].focus();
  }
  function indexOfBox(el) {
    return listBoxes().indexOf(el);
  }
  function gridCols(fromEl) {
    const grid = fromEl.closest("#inventory") || document.querySelector("#inventory");
    if (!grid) return 1;
    const s = getComputedStyle(grid).gridTemplateColumns || "";
    const cols = s.split(" ").filter(Boolean).length;
    return Math.max(1, cols);
  }

  function applyHandlers(wrapper, id, counts, onChange) {
    const minusBtn = wrapper.querySelector(".boxify-btn.minus");
    const plusBtn = wrapper.querySelector(".boxify-btn.plus");
    const qtyEl = wrapper.querySelector(".boxify-qty");

    function setQty(n) {
      if (n < 0) n = 0;
      counts[id] = n;
      qtyEl.textContent = String(n);
      wrapper.setAttribute("aria-label", id + " quantity " + n);
      saveCounts(counts);
      updateLogLine(id, n);
      saveCounts(counts);
      if (onChange) onChange({ id, quantity: n, el: wrapper });
      updateLogLine(id, n);
    }
    function getQty() { return Number(counts[id] || 0); }

    plusBtn.addEventListener("click", (e) => { e.stopPropagation(); setQty(getQty() + 1); });
    minusBtn.addEventListener("click", (e) => { e.stopPropagation(); setQty(getQty() - 1); });

    wrapper.addEventListener("click", (e) => {
      if (e.target.closest(".boxify-btn")) return;
      if (e.shiftKey) { e.preventDefault(); setQty(0); return; }
      if (!(e.metaKey || e.ctrlKey)) { e.preventDefault(); return; }
      setQty(getQty() + 1);
    });

    wrapper.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      setQty(getQty() - 1);
    });

    wrapper.addEventListener("auxclick", (e) => {
      if (e.button === 1) { }
    });

    wrapper.addEventListener("keydown", (e) => {
      if (e.altKey && (e.key === "ArrowLeft" || e.key === "ArrowRight" || e.key === "ArrowUp" || e.key === "ArrowDown")) {
        e.preventDefault();
        const idx = indexOfBox(wrapper);
        const cols = gridCols(wrapper);
        let delta = 0;
        if (e.key === "ArrowLeft") delta = -1;
        else if (e.key === "ArrowRight") delta = 1;
        else if (e.key === "ArrowUp") delta = -cols;
        else if (e.key === "ArrowDown") delta = cols;
        const next = Math.min(Math.max(0, idx + delta), listBoxes().length - 1);
        if (next !== idx) focusIndex(next);
        return;
      }
      if (e.key === "ArrowUp" || e.key === "ArrowRight") { e.preventDefault(); setQty(getQty() + 1); }
      else if (e.key === "ArrowDown" || e.key === "ArrowLeft") { e.preventDefault(); setQty(getQty() - 1); }
      else if (e.key === "Backspace" || e.key === "Delete") { e.preventDefault(); setQty(0); }
      else if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setQty(getQty() + 1); }
    });

    setQty(getQty());
  }

  window.Boxify = {
    init(opts) {
      const selector = opts && opts.selector ? opts.selector : ".ui-item";
      const gridSelector = opts && opts.gridSelector ? opts.gridSelector : null;
      const onChange = opts && opts.onChange ? opts.onChange : null;
      const enabledFromOpts = opts && Array.isArray(opts.enabled) ? opts.enabled.map(String) : null;
      const enabled = new Set(enabledFromOpts && enabledFromOpts.length ? enabledFromOpts : loadEnabled());

      let grid = null;
      if (gridSelector) {
        grid = document.querySelector(gridSelector);
        if (grid && !grid.classList.contains("box-grid")) grid.classList.add("box-grid");
      }

      const counts = loadCounts();
      const nodes = Array.from(document.querySelectorAll(selector));
      const wrappers = [];

      // If nothing is enabled, do not create any boxes by default
      if (enabled.size === 0) {
        return wrappers;
      }

      // Hide original placeholders; render boxes contiguously in the grid
      nodes.forEach(el => { el.style.display = "none"; });

      const enabledList = Array.from(enabled);
      const sourceLabels = nodes.map((el, idx) =>
        el.getAttribute("data-label") || el.getAttribute("aria-label") || el.textContent.trim() || ("Item " + (idx + 1))
      );
      const templateLabels = loadTemplates();

      const getLabelFor = (key) => {
        const slugKey = String(key).toLowerCase();
        // 1) Match source slugs (legacy placeholders)
        const srcIdx = sourceLabels.findIndex(l => l.toLowerCase().replace(/\s+/g, "-") === slugKey);
        if (srcIdx >= 0) return sourceLabels[srcIdx];
        // 2) Match template slugs
        const tmpl = templateLabels.find(l => l.toLowerCase().replace(/\s+/g, "-") === slugKey);
        if (tmpl) return tmpl;
        // 3) Fallback to key as label
        return String(key);
      };

      if (grid) {
        // Remove any existing rendered boxes (keep other content like reset button)
        Array.from(grid.querySelectorAll('.boxify')).forEach(n => n.remove());
      }

      enabledList.forEach((key, i) => {
        const label = getLabelFor(key);
        const wrapper = createWrapper(label);
        const id = wrapper.getAttribute("data-boxify-id") || ("item-" + (i + 1));
        // Ensure wrapper is in the DOM before wiring handlers so the log picks up the correct label
        if (grid) {
          grid.insertBefore(wrapper, grid.querySelector('#reset-all') || null);
        }
        applyHandlers(wrapper, id, counts, onChange);
        wrappers.push(wrapper);
      });

      return wrappers;
    },

    // Persist and apply enabled list for which boxes should render
    setEnabled(list) {
      const arr = Array.isArray(list) ? list.map(String) : [];
      saveEnabled(arr);
      return arr;
    },
    setTemplates(list) {
      const arr = Array.isArray(list) ? list.map(String) : [];
      saveTemplates(arr);
      return arr;
    },

    setQuantity(id, qty) {
      const counts = loadCounts();
      counts[id] = Math.max(0, Number(qty || 0));
      saveCounts(counts);
      const el = document.querySelector('[data-boxify-id="' + id + '"]');
      if (el) {
        const badge = el.querySelector(".boxify-qty");
        if (badge) badge.textContent = String(counts[id]);
        el.setAttribute("aria-label", id + " quantity " + counts[id]);
      }
      updateLogLine(id, Number(counts[id] || 0));
      return counts[id];
    },

    getQuantity(id) {
      const counts = loadCounts();
      return Number(counts[id] || 0);
    },

    getAll() {
      return loadCounts();
    },

    resetAll() {
      localStorage.removeItem(STORAGE_KEY);
      location.reload();
    }
  };

  let hideTimeout;
  window.addEventListener("scroll", () => {
    const panel = document.getElementById("boxify-log");
    if (!panel) return;
    panel.style.opacity = "0";
    clearTimeout(hideTimeout);
    hideTimeout = setTimeout(() => {
      panel.style.opacity = "1";
    }, 100);
  });

  document.addEventListener("keydown", (e) => {
    if (e.altKey && e.code === "KeyR") {
      e.preventDefault();
      if (window.Boxify && typeof window.Boxify.resetAll === "function") {
        window.Boxify.resetAll();
      } else {
        localStorage.removeItem(STORAGE_KEY);
        location.reload();
      }
    }
  });
})();
