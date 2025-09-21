(() => {
  const STORAGE_KEY = "boxify.counts";

  function loadCounts() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); }
    catch { return {}; }
  }
  function saveCounts(map) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(map)); } catch { }
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
      panel.setAttribute("aria-label", "Boxify status");
      document.body.appendChild(panel);
    }
    return panel;
  }

  function updateLogLine(id, qty) {
    const panel = getLogPanel();
    let line = panel.querySelector('[data-log-id="' + id + '"]');
    if (!line) {
      line = document.createElement("div");
      line.setAttribute("data-log-id", id);
      panel.appendChild(line);
    }
    line.textContent = id + " = " + qty;
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
      if (onChange) onChange({ id, quantity: n, el: wrapper });
      updateLogLine(id, n);
    }
    function getQty() { return Number(counts[id] || 0); }

    plusBtn.addEventListener("click", (e) => { e.stopPropagation(); setQty(getQty() + 1); });
    minusBtn.addEventListener("click", (e) => { e.stopPropagation(); setQty(getQty() - 1); });

    wrapper.addEventListener("click", (e) => {
      if (e.target.closest(".boxify-btn")) return;
      if (!(e.metaKey || e.ctrlKey)) { e.preventDefault(); return; }
      if (e.shiftKey) { setQty(0); return; }
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
      if (e.key === "ArrowUp" || e.key === "ArrowRight") { e.preventDefault(); setQty(getQty() + 1); }
      if (e.key === "ArrowDown" || e.key === "ArrowLeft") { e.preventDefault(); setQty(getQty() - 1); }
      if (e.key === "Backspace" || e.key === "Delete") { e.preventDefault(); setQty(0); }
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setQty(getQty() + 1); }
    });

    setQty(getQty());
  }

  window.Boxify = {
    init(opts) {
      const selector = opts && opts.selector ? opts.selector : ".ui-item";
      const gridSelector = opts && opts.gridSelector ? opts.gridSelector : null;
      const onChange = opts && opts.onChange ? opts.onChange : null;

      if (gridSelector) {
        const grid = document.querySelector(gridSelector);
        if (grid && !grid.classList.contains("box-grid")) grid.classList.add("box-grid");
      }

      const counts = loadCounts();
      const nodes = Array.from(document.querySelectorAll(selector));
      const wrappers = [];

      nodes.forEach((el, idx) => {
        const label =
          el.getAttribute("data-label") ||
          el.getAttribute("aria-label") ||
          el.textContent.trim() ||
          "Item " + (idx + 1);

        const wrapper = ensureWrapper(el, label);
        const id = wrapper.getAttribute("data-boxify-id") || ("item-" + (idx + 1));
        applyHandlers(wrapper, id, counts, onChange);
        wrappers.push(wrapper);
      });

      return wrappers;
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
    }
  };

  document.addEventListener("keydown", (e) => {
    if (e.key.toLowerCase() === "r" && e.altKey) {
      e.preventDefault();
      const resetBtn = document.getElementById("reset-all");
      if (resetBtn) resetBtn.click();
    }
  });
})();
