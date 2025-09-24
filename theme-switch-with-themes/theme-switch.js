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

    function positionThumb(i) {
      const opts = options();
      const el = opts[i];
      const rect = el.getBoundingClientRect();
      const first = opts[0].getBoundingClientRect();
      thumb.style.width = rect.width + "px";
      thumb.style.transform = "translateX(" + (rect.left - first.left) + "px)";
    }

    function select(i, focus = false) {
      currentIndex = i;
      const source = THEMES[i];
      saveTheme(source);
      applyTheme(source);

      options().forEach((b, j) => {
        const isSel = j === i;
        b.setAttribute("aria-checked", String(isSel));
        b.setAttribute("tabindex", isSel ? "0" : "-1");
        if (focus && isSel) b.focus();
      });

      requestAnimationFrame(() => {
        positionThumb(i);

        requestAnimationFrame(() => {
          thumb.classList.remove("flash");
          void thumb.offsetWidth;
          thumb.classList.add("flash");
          thumb.addEventListener("animationend", () => {
            thumb.classList.remove("flash");
          }, { once: true });
        });
      });
    }


    const ro = new ResizeObserver(() => positionThumb(currentIndex));
    ro.observe(root);
    window.addEventListener("resize", () => positionThumb(currentIndex));
    requestAnimationFrame(() => positionThumb(currentIndex));

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
