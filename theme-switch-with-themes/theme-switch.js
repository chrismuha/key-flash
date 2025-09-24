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

  function makeFlasher(el, duration = 150, color = "yellow") {
    const overlay = document.createElement("span");
    Object.assign(overlay.style, {
      position: "absolute",
      inset: "0",
      background: color,
      opacity: "0",
      pointerEvents: "none",
      borderRadius: "inherit",
      transition: "none"
    });
    el.style.position = "relative";
    el.appendChild(overlay);

    let lastOn = 0;
    function loop(t) {
      overlay.style.opacity = t - lastOn < duration ? 1 : 0;
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);

    return function flash() {
      lastOn = performance.now();
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

    const flash = makeFlasher(thumb, 150, "yellow");

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
      btn.addEventListener("click", () => select(i));
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
      const firstLeft = opts[0].offsetLeft;
      meas = Array.from(opts).map(el => ({
        left: el.offsetLeft - firstLeft,
        width: el.offsetWidth
      }));
    }

    function positionThumb(i) {
      const m = meas[i];
      if (!m) return;
      thumb.style.width = m.width + "px";
      thumb.style.transform = "translateX(" + m.left + "px)";
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
