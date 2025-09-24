(() => {
  const THEME_KEY = "app.theme";
  const THEMES = ["system", "light", "dark", "solarized", "contrast"];
  const media = matchMedia("(prefers-color-scheme: dark)");

  function resolveTheme(source) {
    if (source === "system") return media.matches ? "dark" : "light";
    return source;
  }

  function applyTheme(source) {
    const resolved = resolveTheme(source);
    document.documentElement.setAttribute("data-theme", resolved);
    document.documentElement.setAttribute("data-theme-source", source);
    document.dispatchEvent(new CustomEvent("themechange", { detail: { source, theme: resolved } }));
  }

  function getSavedTheme() {
    try { return localStorage.getItem(THEME_KEY) || "system"; } catch { return "system"; }
  }

  function saveTheme(theme) { try { localStorage.setItem(THEME_KEY, theme); } catch { } }

  function makeFlasher(el, baseMs = 150, pulseMs = 90, color = "yellow") {
    const base = document.createElement("span");
    Object.assign(base.style, {
      position: "absolute",
      inset: "0",
      background: color,
      opacity: "0",
      pointerEvents: "none",
      borderRadius: "inherit",
      transition: "none"
    });
    const ring = document.createElement("span");
    Object.assign(ring.style, {
      position: "absolute",
      inset: "-4px",
      borderRadius: "inherit",
      boxShadow: "0 0 0 6px rgba(255,255,0,0)",
      pointerEvents: "none",
      transition: "none"
    });
    el.style.position = "relative";
    el.appendChild(base);
    el.appendChild(ring);
    let lastOn = 0;
    let pulseStart = -1;
    function loop(t) {
      const on = t - lastOn < baseMs;
      base.style.opacity = on ? "1" : "0";
      const p = pulseStart < 0 ? 1 : (t - pulseStart) / pulseMs;
      if (p < 1) {
        const k = 1 - p;
        ring.style.boxShadow = `0 0 0 ${6 + 6 * (1 - k)}px rgba(255,255,0,${0.45 * k})`;
      } else {
        ring.style.boxShadow = "0 0 0 6px rgba(255,255,0,0)";
      }
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
    return function flash() {
      const now = performance.now();
      lastOn = now;
      pulseStart = now;
    };
  }

  function buildSwitch(currentSource) {
    const wrap = document.createElement("div");
    wrap.id = "theme-switch";
    Object.assign(wrap.style, { position: "fixed", top: "16px", right: "16px", zIndex: "99999" });

    const root = document.createElement("div");
    root.className = "ts-root";
    root.setAttribute("role", "radiogroup");
    root.setAttribute("aria-label", "Theme");
    wrap.appendChild(root);

    const track = document.createElement("div");
    track.className = "ts-track";
    root.appendChild(track);

    const thumb = document.createElement("div");
    thumb.className = "ts-thumb";
    track.appendChild(thumb);

    const flash = makeFlasher(thumb, 150, 90, "yellow");

    let currentIndex = THEMES.indexOf(currentSource);

    THEMES.forEach((t, i) => {
      const btn = document.createElement("button");
      btn.className = "ts-option";
      btn.type = "button";
      btn.setAttribute("role", "radio");
      btn.setAttribute("aria-checked", String(i === currentIndex));
      btn.setAttribute("tabindex", i === currentIndex ? "0" : "-1");
      btn.dataset.index = String(i);
      btn.textContent = t[0].toUpperCase() + t.slice(1);
      btn.addEventListener("click", (ev) => { if (!dragging) select(i); ev.stopPropagation(); });
      btn.addEventListener("keydown", (e) => {
        if (e.key === "ArrowRight") return select((i + 1) % THEMES.length, true);
        if (e.key === "ArrowLeft") return select((i - 1 + THEMES.length) % THEMES.length, true);
        if (e.key === "Home") return select(0, true);
        if (e.key === "End") return select(THEMES.length - 1, true);
        if (e.key === " " || e.key === "Enter") return select(i, true);
      });
      root.appendChild(btn);
    });

    function options() { return root.querySelectorAll(".ts-option"); }

    let meas = [];
    function measure() {
      const opts = options();
      if (!opts.length) return;
      const firstLeft = opts[0].getBoundingClientRect().left;
      meas = Array.from(opts).map(el => {
        const r = el.getBoundingClientRect();
        return { left: r.left - firstLeft, width: r.width, center: (r.left - firstLeft) + r.width / 2 };
      });
    }

    function positionThumb(i, scale = 1) {
      const m = meas[i];
      if (!m) return;
      thumb.style.width = m.width + "px";
      thumb.style.transform = `translateX(${m.left}px) scale(${scale})`;
    }

    let pendingIndex = currentIndex;
    let pendingFocus = false;
    let scheduled = false;

    function applyPending() {
      scheduled = false;
      const i = pendingIndex;
      const changed = i !== currentIndex;
      if (changed) {
        currentIndex = i;
        const source = THEMES[i];
        saveTheme(source);
        applyTheme(source);
      }
      const opts = options();
      opts.forEach((b, j) => {
        const isSel = j === i;
        b.setAttribute("aria-checked", String(isSel));
        b.setAttribute("tabindex", isSel ? "0" : "-1");
        if (pendingFocus && isSel) b.focus();
      });
      pendingFocus = false;
      positionThumb(i);
      flash();
    }

    function scheduleUpdate() {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(applyPending);
    }

    function select(i, focus = false) {
      pendingIndex = i;
      pendingFocus = focus || pendingFocus;
      scheduleUpdate();
    }

    function nearestIndexFromClientX(clientX) {
      if (!meas.length) return currentIndex;
      const firstLeft = options()[0].getBoundingClientRect().left;
      const x = clientX - firstLeft;
      let best = 0, bestD = Infinity;
      for (let i = 0; i < meas.length; i++) {
        const d = Math.abs(x - meas[i].center);
        if (d < bestD) { bestD = d; best = i; }
      }
      return best;
    }

    let dragging = false;
    let pointerId = null;

    root.addEventListener("pointerdown", (e) => {
      if (e.button !== 0) return;
      dragging = true;
      pointerId = e.pointerId;
      root.setPointerCapture(pointerId);
      measure();
      const idx = nearestIndexFromClientX(e.clientX);
      pendingIndex = idx;
      positionThumb(idx, 1.06);
      e.preventDefault();
    });

    root.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      const idx = nearestIndexFromClientX(e.clientX);
      if (idx !== pendingIndex) {
        pendingIndex = idx;
        positionThumb(idx, 1.06);
        const opts = options();
        opts.forEach((b, j) => b.setAttribute("aria-checked", String(j === idx)));
      }
      e.preventDefault();
    });

    function endDrag(e) {
      if (!dragging) return;
      dragging = false;
      if (pointerId != null) {
        try { root.releasePointerCapture(pointerId); } catch { }
        pointerId = null;
      }
      positionThumb(pendingIndex, 1);
      select(pendingIndex);
    }

    root.addEventListener("pointerup", endDrag);
    root.addEventListener("pointercancel", endDrag);
    root.addEventListener("click", (e) => {
      if (dragging) e.preventDefault();
    }, true);

    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(() => {
      measure();
      positionThumb(currentIndex);
    }) : null;
    if (ro) ro.observe(root);

    window.addEventListener("resize", () => {
      measure();
      positionThumb(currentIndex);
    });

    requestAnimationFrame(() => {
      measure();
      positionThumb(currentIndex);
    });

    const handleMediaChange = () => {
      if ((getSavedTheme() || "system") === "system") applyTheme("system");
    };
    if (media.addEventListener) media.addEventListener("change", handleMediaChange);
    else if (media.addListener) media.addListener(handleMediaChange);

    return wrap;
  }

  const Theme = {
    init({ mount = document.body, defaultTheme = "system" } = {}) {
      const saved = THEMES.includes(getSavedTheme()) ? getSavedTheme() : defaultTheme;
      applyTheme(saved);
      const ui = buildSwitch(saved);
      mount.appendChild(ui);
    },
    set(theme) {
      if (!THEMES.includes(theme)) return;
      saveTheme(theme);
      applyTheme(theme);
    },
    get() { return getSavedTheme(); },
    onChange(cb) { document.addEventListener("themechange", e => cb(e.detail.theme, e.detail.source)); }
  };

  window.ThemeToggle = Theme;
})();

window.addEventListener("DOMContentLoaded", () => {
  ThemeToggle.init();
  ThemeToggle.onChange((resolved, source) => console.log("Theme is now:", resolved, `(source: ${source})`));
});
