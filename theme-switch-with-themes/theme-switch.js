(() => {
  const THEME_KEY = "app.theme";
  const THEMES = ["system", "light", "dark", "solarized", "contrast"];

  const media = matchMedia("(prefers-color-scheme: dark)");
  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    document.dispatchEvent(new CustomEvent("themechange", { detail: { theme } }));
  }
  function getSavedTheme() {
    try { return localStorage.getItem(THEME_KEY) || "system"; } catch { return "system"; }
  }
  function saveTheme(theme) { try { localStorage.setItem(THEME_KEY, theme); } catch {} }

  function buildSwitch(current) {
    const wrap = document.createElement("div");
    wrap.id = "theme-switch";
    wrap.style.position = "fixed";
    wrap.style.top = "16px";
    wrap.style.right = "16px";
    wrap.style.zIndex = "99999";

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

    let currentIndex = THEMES.indexOf(current);

    THEMES.forEach((t, i) => {
      const btn = document.createElement("button");
      btn.className = "ts-option";
      btn.type = "button";
      btn.setAttribute("role", "radio");
      btn.setAttribute("aria-checked", String(i === currentIndex));
      btn.dataset.index = i;
      btn.textContent = t[0].toUpperCase() + t.slice(1);
      btn.addEventListener("click", () => select(i));
      btn.addEventListener("keydown", (e) => {
        if (e.key === "ArrowRight") select((i + 1) % THEMES.length, true);
        if (e.key === "ArrowLeft") select((i - 1 + THEMES.length) % THEMES.length, true);
      });
      root.appendChild(btn);
    });

    function positionThumb(i) {
      const opts = root.querySelectorAll(".ts-option");
      const el = opts[i];
      const rect = el.getBoundingClientRect();
      const first = opts[0].getBoundingClientRect();
      thumb.style.width = rect.width + "px";
      thumb.style.transform = "translateX(" + (rect.left - first.left) + "px)";
    }

    function select(i, focus = false) {
      currentIndex = i;
      const theme = THEMES[i];
      saveTheme(theme);
      applyTheme(theme);
      root.querySelectorAll(".ts-option").forEach((b, j) => {
        b.setAttribute("aria-checked", String(j === i));
        if (focus && j === i) b.focus();
      });
      requestAnimationFrame(() => positionThumb(i));
    }

    window.addEventListener("resize", () => positionThumb(currentIndex));
    requestAnimationFrame(() => positionThumb(currentIndex));

    media.addEventListener("change", () => {
      if ((localStorage.getItem(THEME_KEY) || "system") === "system") {
        applyTheme("system");
      }
    });

    return wrap;
  }

  const Theme = {
    init({ mount = document.body, defaultTheme = "system" } = {}) {
      const saved = THEMES.includes(getSavedTheme()) ? getSavedTheme() : defaultTheme;
      document.documentElement.setAttribute("data-theme", saved);
      const ui = buildSwitch(saved);
      mount.appendChild(ui);
    },
    set(theme) {
      if (!THEMES.includes(theme)) return;
      saveTheme(theme);
      applyTheme(theme);
    },
    get() { return getSavedTheme(); },
    onChange(cb) { document.addEventListener("themechange", e => cb(e.detail.theme)); }
  };

  window.ThemeToggle = Theme;
})();
