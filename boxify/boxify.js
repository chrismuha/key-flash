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
    const wrapper = document.createElement("button");
    wrapper.type = "button";
    wrapper.tabIndex = 0;
    wrapper.className = "boxify";
    wrapper.setAttribute("data-boxify-id", label.toLowerCase().replace(/\s+/g, "-"));
    wrapper.setAttribute("aria-label", label + " quantity");
    wrapper.setAttribute("aria-live", "polite");

    const title = document.createElement("div");
    title.className = "boxify-title";
    title.textContent = label;

    const qty = document.createElement("div");
    qty.className = "boxify-qty";
    qty.textContent = "0";

    const contentHolder = document.createElement("div");
    contentHolder.style.font = "400 12px/1.2 Arial, sans-serif";
    contentHolder.style.opacity = "0.8";

    while (el.firstChild) contentHolder.appendChild(el.firstChild);

    wrapper.appendChild(title);
    if (contentHolder.childNodes.length) wrapper.appendChild(contentHolder);
    wrapper.appendChild(qty);

    el.replaceWith(wrapper);
    return wrapper;
  }

  function applyHandlers(wrapper, id, counts, onChange) {
    function setQty(n) {
      if (n < 0) n = 0;
      counts[id] = n;
      wrapper.querySelector(".boxify-qty").textContent = String(n);
      wrapper.setAttribute("aria-label", id + " quantity " + n);
      saveCounts(counts);
      if (onChange) onChange({ id, quantity: n, el: wrapper });
    }

    function getQty() {
      return Number(counts[id] || 0);
    }

    wrapper.addEventListener("click", (e) => {
      if (e.shiftKey) {
        setQty(0);           // Shift+Click now resets
        return;
      }
      setQty(getQty() + 1);
    });

    wrapper.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      setQty(getQty() - 1);  // Right-click still decreases
    });

    wrapper.addEventListener("auxclick", (e) => {
      // Middle-click (button === 1) no longer resets
      if (e.button === 1) { /* no-op */ }
    });

    wrapper.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setQty(getQty() + 1);
      }
      if (e.key === "Backspace" || e.key === "Delete" || e.key === "-") {
        e.preventDefault();
        setQty(getQty() - 1);
      }
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
})();
