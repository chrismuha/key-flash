// Section: IIFE Wrapper
(function () {
  // Section: Storage Keys
  const STORAGE_KEYS = {
    orderType: 'restaurant.orderType',
    ingredients: 'restaurant.ingredients',
    theme: 'restaurant.theme',
    deliveryName: 'restaurant.delivery.name',
    deliveryPhone: 'restaurant.delivery.phone',
    deliveryAddress: 'restaurant.delivery.address',
    deliveryType: 'restaurant.delivery.type',
    deliveryCity: 'restaurant.delivery.city',
    deliveryZip: 'restaurant.delivery.zip',
    activeSections: 'restaurant.activeSections',
    navEnabled: 'restaurant.nav.enabled',
    settingsExpandOnly: 'restaurant.settings.expandOnly',
    settingsLabelSelects: 'restaurant.settings.labelSelects',
    settingsTitleSelects: 'restaurant.settings.titleSelects',
    settingsResetOnDeselect: 'restaurant.settings.resetOnDeselect',
    settingsResetDisables: 'restaurant.settings.resetDisables',
    settingsQtyRight: 'restaurant.settings.qtyRight',
    quantities: 'restaurant.quantities',
    quantitiesSections: 'restaurant.quantities.sections'
  };

  // Section: Text Utils
  function titleCase(str) {
    if (!str) return '';
    return String(str)
      .replace(/[_-]+/g, ' ')
      .split(/\s+/)
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }
  // Strip any trailing inline quantity like (x12) that might have been
  // embedded into labels by UI controls on the builder page.
  function stripInlineQty(str) {
    if (!str) return '';
    return String(str).replace(/\(x\d+\)/gi, '').replace(/\s{2,}/g, ' ').trim();
  }

  // Section: Order Type (Save/Get)
  function saveOrderType(type) {
    try {
      localStorage.setItem(STORAGE_KEYS.orderType, type);
    } catch { }
  }

  function getOrderType() {
    try {
      return localStorage.getItem(STORAGE_KEYS.orderType) || '';
    } catch { return ''; }
  }

  // Section: Ingredients (Read from DOM)
  function readIngredientsFromDOM() {
    const data = {};
    const inputs = document.querySelectorAll('input[type="checkbox"][name]');
    inputs.forEach((input) => {
      const name = input.getAttribute('name');
      if (!data[name]) data[name] = [];
      if (input.checked) {
        // Find the associated label and strip any dynamic controls (e.g., quantity widgets)
        let labelText = '';
        const label = input.closest('label') || document.querySelector(`label[for="${input.id}"]`);
        if (label) {
          const clone = label.cloneNode(true);
          // Remove the checkbox itself and any qty controls inside labels
          clone.querySelectorAll('input, select, .sauce-qty, .qty-controls, button').forEach((el) => el.remove());
          labelText = (clone.textContent || '').trim();
        }
        data[name].push({ value: input.value, label: labelText || titleCase(input.value) });
      }
    });
    return data;
  }

  // Section: Ingredients (Save to Storage)
  function saveIngredients() {
    const data = readIngredientsFromDOM();
    try {
      localStorage.setItem(STORAGE_KEYS.ingredients, JSON.stringify(data));
    } catch { }
  }

  // Section: Ingredients (Restore from Storage)
  function restoreIngredients() {
    let data = {};
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.ingredients);
      if (raw) data = JSON.parse(raw);
    } catch { }

    const inputs = document.querySelectorAll('input[type="checkbox"][name]');
    inputs.forEach((input) => {
      const name = input.getAttribute('name');
      const values = data[name] || [];
      // Back-compat: array of strings OR array of {value,label}
      const selectedValues = values.map(v => (typeof v === 'string' ? v : v && v.value)).filter(Boolean);
      input.checked = selectedValues.includes(input.value);
    });
  }

  // Section: Navigation (Open section from hash)
  function openSectionFromHash() {
    const hash = (location.hash || '').replace('#', '').trim();
    if (!hash) return;
    const details = document.getElementById(hash);
    if (details && details.tagName.toLowerCase() === 'details') {
      details.open = true;
      // optional: focus the summary for visibility
      const summary = details.querySelector('summary');
      if (summary) summary.focus({ preventScroll: false });
    }
  }

  // Section: Page Initialization
  document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;



    // Migration: rename legacy ingredient value 'tomato' -> 'tomatoes' (pizza/burger)
    (function migrateLegacyIngredients() {
      try {
        const raw = localStorage.getItem(STORAGE_KEYS.ingredients);
        if (!raw) return;
        let data = {};
        try { data = JSON.parse(raw) || {}; } catch { data = {}; }
        const groups = ['pizza_ingredients[]', 'burger_ingredients[]'];
        let changed = false;
        groups.forEach((g) => {
          const arr = Array.isArray(data[g]) ? data[g] : [];
          const newArr = arr.map((it) => {
            if (typeof it === 'string') {
              if (it === 'tomato') { changed = true; return 'tomatoes'; }
              return it;
            }
            if (it && typeof it === 'object') {
              const v = it.value;
              if (v === 'tomato') { changed = true; return { ...it, value: 'tomatoes', label: (it.label || '').replace(/Tomato\b/i, 'Tomatoes') || 'Tomatoes' }; }
              return it;
            }
            return it;
          });
          if (changed) data[g] = newArr;
        });
        if (changed) localStorage.setItem(STORAGE_KEYS.ingredients, JSON.stringify(data));
      } catch { /* ignore */ }
    })();

    // Disable nav bar interactions (dev only)
    const navLinks = Array.from(document.querySelectorAll('.left-rail a'));
    const preventNavClick = (event) => event.preventDefault();
    const setNavState = (enabled) => {
      if (!navLinks.length) return;
      if (enabled) {
        body.classList.add('nav-enabled');
        navLinks.forEach((link) => {
          link.removeAttribute('tabindex');
          link.removeAttribute('aria-disabled');
          link.removeEventListener('click', preventNavClick);
        });
      } else {
        body.classList.remove('nav-enabled');
        navLinks.forEach((link) => {
          link.setAttribute('tabindex', '-1');
          link.setAttribute('aria-disabled', 'true');
          link.removeEventListener('click', preventNavClick);
          link.addEventListener('click', preventNavClick);
        });
      }
    };

    // Lock Page 2/3 navigation until prerequisites are met
    function hasOrderTypeSelected() {
      try { return !!localStorage.getItem(STORAGE_KEYS.orderType); } catch { return false; }
    }
    function hasMenuSelection() {
      // Align with builder rules: at least one section active; if Sauces active, at least one sauce selected
      let activeSections = {};
      try { activeSections = JSON.parse(localStorage.getItem(STORAGE_KEYS.activeSections) || '{}'); } catch { activeSections = {}; }
      const anySectionActive = Object.values(activeSections).some(Boolean);
      if (!anySectionActive) return false;
      const saucesActive = !!activeSections.sauces;
      if (!saucesActive) return true;
      try {
        const ing = JSON.parse(localStorage.getItem(STORAGE_KEYS.ingredients) || '{}');
        const sauces = Array.isArray(ing['sauces_ingredients[]']) ? ing['sauces_ingredients[]'] : [];
        return sauces.length > 0;
      } catch { return false; }
    }
    function hasValidDeliveryDetails() {
      // Validate saved delivery details (used to unlock Page 2 for delivery)
      try {
        const name = (localStorage.getItem(STORAGE_KEYS.deliveryName) || '').trim();
        const phone = (localStorage.getItem(STORAGE_KEYS.deliveryPhone) || '').replace(/\D+/g, '');
        const addr = (localStorage.getItem(STORAGE_KEYS.deliveryAddress) || '').trim();
        const type = (localStorage.getItem(STORAGE_KEYS.deliveryType) || '').trim();
        const city = (localStorage.getItem(STORAGE_KEYS.deliveryCity) || '').trim();
        const rawZip = (localStorage.getItem(STORAGE_KEYS.deliveryZip) || '').trim();
        const z = rawZip.replace(/\D+/g, '');
        const zipOk = (z.length === 5 && z === '13309') || (z.length === 9 && z.slice(0, 5) === '13309');
        return !!(name && phone.length === 10 && addr && type && city && zipOk);
      } catch {
        return false;
      }
    }
    function updatePageNavLocks() {
      const okType = hasOrderTypeSelected();
      const okMenu = hasMenuSelection();
      // Page 2 unlocks with order type unless it's Delivery, which needs valid delivery details
      let okPage2 = okType;
      let typeNow = '';
      try { typeNow = localStorage.getItem(STORAGE_KEYS.orderType) || ''; } catch { typeNow = ''; }
      if (typeNow === 'delivery') okPage2 = okType && hasValidDeliveryDetails();
      // Page 3: if Delivery, also require valid delivery details in addition to menu validity
      const okPage3 = okType && okMenu && (typeNow !== 'delivery' || hasValidDeliveryDetails());

      document.querySelectorAll('.left-rail a[href$="page2.html"]').forEach((a) => {
        if (okPage2) {
          a.removeAttribute('aria-disabled');
          a.removeAttribute('tabindex');
          a.removeEventListener('click', preventNavClick);
          a.removeAttribute('title');
        } else {
          a.setAttribute('aria-disabled', 'true');
          a.setAttribute('tabindex', '-1');
          a.addEventListener('click', preventNavClick);
          let tip = 'Select an order type to enable Page 2';
          try {
            const t = localStorage.getItem(STORAGE_KEYS.orderType) || '';
            if (t === 'delivery' && okType && !hasValidDeliveryDetails()) {
              tip = 'Complete delivery details to enable Page 2';
            }
          } catch { }
          a.setAttribute('title', tip);
        }
      });
      document.querySelectorAll('.left-rail a[href$="page3.html"]').forEach((a) => {
        if (okPage3) {
          a.removeAttribute('aria-disabled');
          a.removeAttribute('tabindex');
          a.removeEventListener('click', preventNavClick);
          a.removeAttribute('title');
        } else {
          a.setAttribute('aria-disabled', 'true');
          a.setAttribute('tabindex', '-1');
          a.addEventListener('click', preventNavClick);
          const needsType = !okType;
          const needsMenu = !okMenu;
          const needsDelivery = (typeNow === 'delivery') && !hasValidDeliveryDetails();
          let msg = '';
          if (needsType && needsMenu) {
            msg = 'Select an order type and choose at least one menu item to enable Page 3';
          } else if (needsType) {
            msg = 'Select an order type to enable Page 3';
          } else if (needsDelivery) {
            msg = 'Complete delivery details to enable Page 3';
          } else {
            msg = 'Choose at least one menu item to enable Page 3';
          }
          a.setAttribute('title', msg);
        }
      });
    }

    // Ensure initial validation state is visible on load
    if (body.classList.contains('page2')) {
      updateBuilderError();
    }

    let navInitialEnabled = false;
    try {
      navInitialEnabled = localStorage.getItem(STORAGE_KEYS.navEnabled) === 'true';
    } catch { }
    setNavState(navInitialEnabled);
    // Apply initial page navigation locks
    updatePageNavLocks();

    // If user refreshes a non-index page, redirect to index
    try {
      const nav = performance.getEntriesByType && performance.getEntriesByType('navigation')[0];
      const isReload = nav && nav.type === 'reload';
      if (!body.classList.contains('order-type') && isReload) {
        window.location.replace('index.html');
        return;
      }
    } catch { }

    // Go Back button handler: cycle within pages 1-3
    const backBtn = document.querySelector('.go-back');
    if (backBtn) {
      backBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (body.classList.contains('page3')) {
          window.location.href = 'page2.html';
        } else if (body.classList.contains('page2')) {
          window.location.href = 'index.html';
        } else {
          window.location.href = 'index.html';
        }
      });
    }

    // Theme init
    try {
      const savedTheme = localStorage.getItem(STORAGE_KEYS.theme);
      if (savedTheme === 'dark') body.classList.add('theme-dark');
    } catch { }
    const themeDropdown = document.querySelector('.theme-dropdown');
    const themeBtn = themeDropdown ? themeDropdown.querySelector('.theme-toggle') : null;
    const themeMenu = themeDropdown ? themeDropdown.querySelector('.theme-menu') : null;
    const themeModeBtn = themeDropdown ? themeDropdown.querySelector('.theme-mode-toggle') : null;
    const navToggleBtn = themeDropdown ? themeDropdown.querySelector('.nav-toggle') : null;
    const themeChoiceBtns = themeDropdown ? themeDropdown.querySelectorAll('.theme-choice') : [];
    const themeViews = document.querySelectorAll('[data-theme-view]');
    const boxifyGrid = document.getElementById('boxify-inventory');
    const boxifyResetBtn = document.querySelector('.boxify-reset');
    let boxifyInitialized = false;
    let currentThemeChoice = 'restaurant';
    const docEl = document.documentElement;

    const setThemeView = (view) => {
      if (!themeViews.length) return;
      themeViews.forEach((panel) => {
        const name = panel.dataset.themeView || 'restaurant';
        panel.hidden = name !== view;
      });
    };

    const ensureBoxifyInit = () => {
      if (boxifyInitialized) return;
      if (!boxifyGrid) return;
      if (!window.Boxify || typeof window.Boxify.init !== 'function') return;
      window.Boxify.init({ selector: '#boxify-inventory .ui-item', gridSelector: '#boxify-inventory' });
      boxifyInitialized = true;
    };

    const toggleBoxifyLog = (show) => {
      const logPanel = document.getElementById('boxify-log');
      if (!logPanel) return;
      logPanel.style.display = show ? '' : 'none';
    };

    const updateThemeChoiceUI = () => {
      if (!themeChoiceBtns || !themeChoiceBtns.length) return;
      themeChoiceBtns.forEach((btn) => {
        const target = btn.dataset.theme || 'restaurant';
        btn.setAttribute('aria-checked', String(target === currentThemeChoice));
      });
    };

    const updateThemeModeLabel = () => {
      if (!themeModeBtn) return;
      const isDark = body.classList.contains('theme-dark');
      themeModeBtn.textContent = isDark ? 'Light Mode' : 'Dark Mode';
    };

    const updateNavToggleLabel = () => {
      if (!navToggleBtn) return;
      const navEnabled = body.classList.contains('nav-enabled');
      navToggleBtn.textContent = navEnabled ? 'Disable Navigation' : 'Enable Navigation';
    };

    const persistThemeState = () => {
      const isDark = body.classList.contains('theme-dark');
      const key = currentThemeChoice === 'boxify'
        ? (isDark ? 'boxify-dark' : 'boxify-light')
        : (isDark ? 'restaurant-dark' : 'restaurant-light');
      try { localStorage.setItem(STORAGE_KEYS.theme, key); } catch { }
    };

    const applyThemeChoice = (choice, { skipSave = false } = {}) => {
      currentThemeChoice = choice === 'boxify' ? 'boxify' : 'restaurant';
      const isBoxify = currentThemeChoice === 'boxify';
      body.classList.toggle('theme-boxify', isBoxify);
      docEl.classList.toggle('theme-boxify-root', isBoxify);
      setThemeView(currentThemeChoice);
      if (isBoxify) {
        ensureBoxifyInit();
        toggleBoxifyLog(true);
      } else {
        toggleBoxifyLog(false);
      }
      updateThemeChoiceUI();
      updateThemeModeLabel();
      updateNavToggleLabel();
      if (!skipSave) persistThemeState();
    };

    const parseSavedTheme = () => {
      let stored = 'restaurant-light';
      try {
        stored = localStorage.getItem(STORAGE_KEYS.theme) || 'restaurant-light';
      } catch { stored = 'restaurant-light'; }
      switch (stored) {
        case 'dark':
          return { choice: 'restaurant', dark: true };
        case 'light':
          return { choice: 'restaurant', dark: false };
        case 'boxify':
          return { choice: 'boxify', dark: false };
        case 'boxify-dark':
          return { choice: 'boxify', dark: true };
        case 'boxify-light':
          return { choice: 'boxify', dark: false };
        case 'restaurant-dark':
          return { choice: 'restaurant', dark: true };
        case 'restaurant-light':
        default:
          return { choice: 'restaurant', dark: false };
      }
    };

    const initialTheme = parseSavedTheme();
    body.classList.toggle('theme-dark', initialTheme.dark);
    applyThemeChoice(initialTheme.choice, { skipSave: true });

    // Settings (gear) in left rail
    const settingsBtn = document.querySelector('.settings-button');
    const settingsPanel = document.getElementById('settings-panel');
    const settingExpandOnly = document.querySelector('.setting-expand-only');
    const settingLabelSelects = document.querySelector('.setting-label-selects');
    const settingTitleSelects = document.querySelector('.setting-title-selects');
    const settingResetOnDeselect = document.querySelector('.setting-reset-on-deselect');
    const settingResetDisables = document.querySelector('.setting-reset-disables');
    const settingQtyRight = document.querySelector('.setting-qty-right');
    const settingsResetBtn = document.querySelector('.settings-reset');
    // Settings defaults: all ON by default
    let expandOnly = true;
    try {
      const v = localStorage.getItem(STORAGE_KEYS.settingsExpandOnly);
      expandOnly = v === null ? true : v === 'true';
    } catch { expandOnly = true; }
    if (settingExpandOnly) settingExpandOnly.checked = expandOnly;
    let labelSelects = true;
    try {
      const v = localStorage.getItem(STORAGE_KEYS.settingsLabelSelects);
      labelSelects = v === null ? true : v === 'true';
    } catch { labelSelects = true; }
    if (settingLabelSelects) settingLabelSelects.checked = labelSelects;
    let titleSelects = true;
    try {
      const v = localStorage.getItem(STORAGE_KEYS.settingsTitleSelects);
      titleSelects = v === null ? true : v === 'true';
    } catch { titleSelects = true; }
    if (settingTitleSelects) settingTitleSelects.checked = titleSelects;
    // Reset-on-deselect: default OFF
    let resetOnDeselect = false;
    try {
      const v = localStorage.getItem(STORAGE_KEYS.settingsResetOnDeselect);
      resetOnDeselect = v === 'true';
    } catch { resetOnDeselect = false; }
    if (settingResetOnDeselect) settingResetOnDeselect.checked = resetOnDeselect;
    // Reset button disables item: default OFF
    let resetDisables = false;
    try {
      const v = localStorage.getItem(STORAGE_KEYS.settingsResetDisables);
      resetDisables = v === 'true';
    } catch { resetDisables = false; }
    if (settingResetDisables) settingResetDisables.checked = resetDisables;
    // Quantity dropdown placement: default RIGHT of label
    let qtyRight = true;
    try {
      const v = localStorage.getItem(STORAGE_KEYS.settingsQtyRight);
      qtyRight = v === null ? true : v === 'true';
    } catch { qtyRight = true; }
    if (settingQtyRight) settingQtyRight.checked = qtyRight;

    const closeSettings = () => {
      if (!settingsPanel || !settingsBtn) return;
      settingsPanel.hidden = true;
      settingsBtn.setAttribute('aria-expanded', 'false');
    };
    const openSettings = () => {
      if (!settingsPanel || !settingsBtn) return;
      settingsPanel.hidden = false;
      settingsBtn.setAttribute('aria-expanded', 'true');
    };
    if (settingsBtn && settingsPanel) {
      settingsBtn.addEventListener('click', () => {
        if (settingsPanel.hidden) openSettings(); else closeSettings();
      });
      document.addEventListener('click', (evt) => {
        if (settingsPanel.hidden) return;
        if (!document.querySelector('.left-rail')?.contains(evt.target)) closeSettings();
      });
      document.addEventListener('keydown', (evt) => {
        if (evt.key === 'Escape') closeSettings();
      });
    }
    if (settingExpandOnly) {
      settingExpandOnly.addEventListener('change', () => {
        expandOnly = !!settingExpandOnly.checked;
        try { localStorage.setItem(STORAGE_KEYS.settingsExpandOnly, String(expandOnly)); } catch { }
      });
    }
    if (settingLabelSelects) {
      settingLabelSelects.addEventListener('change', () => {
        labelSelects = !!settingLabelSelects.checked;
        try { localStorage.setItem(STORAGE_KEYS.settingsLabelSelects, String(labelSelects)); } catch { }
      });
    }
    if (settingTitleSelects) {
      settingTitleSelects.addEventListener('change', () => {
        titleSelects = !!settingTitleSelects.checked;
        try { localStorage.setItem(STORAGE_KEYS.settingsTitleSelects, String(titleSelects)); } catch { }
      });
    }
    if (settingResetOnDeselect) {
      settingResetOnDeselect.addEventListener('change', () => {
        resetOnDeselect = !!settingResetOnDeselect.checked;
        try { localStorage.setItem(STORAGE_KEYS.settingsResetOnDeselect, String(resetOnDeselect)); } catch { }
      });
    }
    if (settingResetDisables) {
      settingResetDisables.addEventListener('change', () => {
        resetDisables = !!settingResetDisables.checked;
        try { localStorage.setItem(STORAGE_KEYS.settingsResetDisables, String(resetDisables)); } catch { }
      });
    }

    if (settingsResetBtn) {
      settingsResetBtn.addEventListener('click', () => {
        // Defaults: all ON
        expandOnly = true;
        labelSelects = true;
        titleSelects = true;
        // Defaults: reset-related toggles OFF
        resetOnDeselect = false;
        resetDisables = false;
        qtyRight = true;
        try {
          localStorage.setItem(STORAGE_KEYS.settingsExpandOnly, 'true');
          localStorage.setItem(STORAGE_KEYS.settingsLabelSelects, 'true');
          localStorage.setItem(STORAGE_KEYS.settingsTitleSelects, 'true');
          localStorage.setItem(STORAGE_KEYS.settingsResetOnDeselect, 'false');
          localStorage.setItem(STORAGE_KEYS.settingsResetDisables, 'false');
          localStorage.setItem(STORAGE_KEYS.settingsQtyRight, 'true');
        } catch { }
        if (settingExpandOnly) settingExpandOnly.checked = true;
        if (settingLabelSelects) settingLabelSelects.checked = true;
        if (settingTitleSelects) settingTitleSelects.checked = true;
        if (settingResetOnDeselect) settingResetOnDeselect.checked = false;
        if (settingResetDisables) settingResetDisables.checked = false;
        if (settingQtyRight) settingQtyRight.checked = true;
      });
    }

    const closeThemeMenu = () => {
      if (!themeMenu || !themeBtn) return;
      themeMenu.hidden = true;
      themeBtn.setAttribute('aria-expanded', 'false');
    };

    const openThemeMenu = () => {
      if (!themeMenu || !themeBtn) return;
      themeMenu.hidden = false;
      themeBtn.setAttribute('aria-expanded', 'true');
      const firstOption = themeMenu.querySelector('.theme-option');
      if (firstOption) {
        try {
          firstOption.focus({ preventScroll: true });
        } catch {
          firstOption.focus();
        }
      }
    };

    if (themeBtn && themeMenu) {
      themeBtn.addEventListener('click', () => {
        if (themeMenu.hidden) {
          openThemeMenu();
        } else {
          closeThemeMenu();
        }
      });
    }

    if (themeModeBtn) {
      themeModeBtn.addEventListener('click', () => {
        body.classList.toggle('theme-dark');
        updateThemeModeLabel();
        closeThemeMenu();
        try {
          const isDark = body.classList.contains('theme-dark');
          localStorage.setItem(STORAGE_KEYS.theme, isDark ? 'dark' : 'light');
        } catch { }
      });
    }

    if (navToggleBtn) {
      navToggleBtn.addEventListener('click', () => {
        const navEnabled = body.classList.contains('nav-enabled');
        const nextState = !navEnabled;
        setNavState(nextState);
        updateNavToggleLabel();
        closeThemeMenu();
        try {
          localStorage.setItem(STORAGE_KEYS.navEnabled, String(nextState));
        } catch { }
      });
    }

    if (themeDropdown && themeMenu) {
      document.addEventListener('click', (event) => {
        if (!themeDropdown.contains(event.target)) {
          closeThemeMenu();
        }
      });

      document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
          if (themeMenu.hidden) return;
          closeThemeMenu();
          if (themeBtn) {
            try {
              themeBtn.focus({ preventScroll: true });
            } catch {
              themeBtn.focus();
            }
          }
        }
      });
    }

    updateThemeModeLabel();
    updateNavToggleLabel();

    const applyQtyPlacement = () => {
      document.querySelectorAll('select.ingredient-qty').forEach((sel) => {
        const lbl = sel.closest('label');
        if (!lbl) return;
        if (qtyRight) {
          lbl.appendChild(sel);
        } else {
          const cb = lbl.querySelector('input[type="checkbox"]');
          if (cb) cb.insertAdjacentElement('afterend', sel);
        }
      });
    };
    if (settingQtyRight) {
      settingQtyRight.addEventListener('change', () => {
        qtyRight = !!settingQtyRight.checked;
        try { localStorage.setItem(STORAGE_KEYS.settingsQtyRight, String(qtyRight)); } catch { }
        applyQtyPlacement();
      });
    }

    // [H1] INDEX: ORDER TYPE
    if (body.classList.contains('order-type')) {
      // Track delivery submit failures to show fallback help after 2 failed attempts
      let deliveryFailCount = 0;
      // Do not clear persisted state on return; keep order type, delivery details, and builder selections
      const dFormInit = document.getElementById('delivery-details');
      if (dFormInit) {
        const savedType = getOrderType();
        const show = savedType === 'delivery';
        dFormInit.hidden = !show;
        const errEl = document.getElementById('delivery-error');
        if (errEl) errEl.hidden = true;
      }

      const cards = document.querySelectorAll('.order-card');
      const setActive = (clicked) => {
        cards.forEach(c => {
          if (c === clicked) {
            c.classList.add('selected');
          } else {
            c.classList.remove('selected');
            // Hard reset any transient inline styles just in case
            c.style.background = '';
            c.style.boxShadow = '';
          }
        });
      };
      cards.forEach((card) => {
        card.addEventListener('click', (e) => {
          const type = card.dataset.type || '';
          if (!type) return;
          setActive(card);
          // Always persist the user's latest choice
          saveOrderType(type);
          updatePageNavLocks();
          if (type === 'delivery') {
            // Expand delivery details instead of navigating immediately
            e.preventDefault();
            const form = document.getElementById('delivery-details');
            if (form) {
              form.hidden = false;
              // Restore previous values if any
              try {
                const n = localStorage.getItem(STORAGE_KEYS.deliveryName) || '';
                const ph = localStorage.getItem(STORAGE_KEYS.deliveryPhone) || '';
                const a = localStorage.getItem(STORAGE_KEYS.deliveryAddress) || '';
                const t = localStorage.getItem(STORAGE_KEYS.deliveryType) || 'House';
                const c = localStorage.getItem(STORAGE_KEYS.deliveryCity) || '';
                const z = localStorage.getItem(STORAGE_KEYS.deliveryZip) || '';
                if (n) form.querySelector('#delivery-name').value = n;
                if (ph) form.querySelector('#delivery-phone').value = ph;
                if (a) form.querySelector('#delivery-address').value = a;
                const sel = form.querySelector('#delivery-type'); if (sel) sel.value = t;
                if (c) form.querySelector('#delivery-city').value = c;
                if (z) form.querySelector('#delivery-zip').value = z;
              } catch { }
              // Focus first input
              const first = form.querySelector('input');
              if (first) first.focus();
              // Attach live validation
              attachDeliveryLiveValidation(form);
            }
          } else {
            // Dine/Carryout: clear previous selection and navigate immediately
            e.preventDefault();
            const form = document.getElementById('delivery-details');
            if (form) form.hidden = true;
            setActive(card);
            const href = card.getAttribute('href') || 'page2.html';
            window.location.href = href;
          }
        });
      });

      // Restore visual selection if user returns
      const selected = getOrderType();
      if (selected) {
        // Ensure only one visual selection is active
        cards.forEach(c => c.classList.remove('selected'));
        const el = document.querySelector(`.order-card[data-type="${selected}"]`);
        if (el) el.classList.add('selected');
        // If prior choice was delivery, show details
        if (selected === 'delivery') {
          const form = document.getElementById('delivery-details');
          if (form) {
            form.hidden = false;
            try {
              const n = localStorage.getItem(STORAGE_KEYS.deliveryName) || '';
              const ph = localStorage.getItem(STORAGE_KEYS.deliveryPhone) || '';
              const a = localStorage.getItem(STORAGE_KEYS.deliveryAddress) || '';
              const t = localStorage.getItem(STORAGE_KEYS.deliveryType) || 'House';
              const c = localStorage.getItem(STORAGE_KEYS.deliveryCity) || '';
              const z = localStorage.getItem(STORAGE_KEYS.deliveryZip) || '';
              if (n) form.querySelector('#delivery-name').value = n;
              if (ph) form.querySelector('#delivery-phone').value = ph;
              if (a) form.querySelector('#delivery-address').value = a;
              const sel = form.querySelector('#delivery-type'); if (sel) sel.value = t;
              if (c) form.querySelector('#delivery-city').value = c;
              if (z) form.querySelector('#delivery-zip').value = z;
            } catch { }
          }
        }
      }

      // Handle delivery form submit
      const dForm = document.getElementById('delivery-details');
      if (dForm) {
        // Live formatting helpers
        const phoneEl = dForm.querySelector('#delivery-phone');
        const zipEl = dForm.querySelector('#delivery-zip');
        const formatPhone = (v) => {
          const d = String(v || '').replace(/\D+/g, '').slice(0, 10);
          const a = d.slice(0, 3);
          const b = d.slice(3, 6);
          const c = d.slice(6, 10);
          let out = '';
          if (!a) {
            out = '';
          } else if (a.length < 3) {
            // Don't show parentheses until 3 digits entered
            out = a;
          } else {
            out = `(${a})`;
          }
          if (b) out += `-${b}`;
          if (c) out += `-${c}`;
          return out;
        };
        const formatZipPlus4 = (v) => {
          const d = String(v || '').replace(/\D+/g, '').slice(0, 9);
          const first = d.slice(0, 5);
          const plus4 = d.slice(5);
          return plus4 ? `${first}-${plus4}` : first;
        };
        if (phoneEl) {
          if (phoneEl.value) phoneEl.value = formatPhone(phoneEl.value);
          phoneEl.addEventListener('input', () => {
            phoneEl.value = formatPhone(phoneEl.value);
            const d = phoneEl.value.replace(/\D+/g, '');
            if (d.length === 10 || d.length === 0) {
              // proactively clear any lingering tooltip in Chrome
              try {
                phoneEl.setCustomValidity('');
                if (typeof phoneEl.reportValidity === 'function') phoneEl.reportValidity();
              } catch { }
            }
          });
          // Special handling for Backspace so formatting characters don't block deletion
          phoneEl.addEventListener('keydown', (e) => {
            if (e.key !== 'Backspace') return; // do not handle Delete or others
            // Compute digit index before the caret
            const caret = phoneEl.selectionStart || 0;
            const raw = String(phoneEl.value || '');
            const digits = raw.replace(/\D+/g, '');
            const digitsBefore = raw.slice(0, caret).replace(/\D+/g, '');
            if (digitsBefore.length === 0) return; // nothing to delete
            e.preventDefault();
            const deleteIndex = digitsBefore.length - 1; // remove the digit just before caret
            const newDigits = digits.slice(0, deleteIndex) + digits.slice(deleteIndex + 1);
            const formatted = formatPhone(newDigits);
            // place caret after the deleted digit's position in the new formatted string
            let targetDigitPos = deleteIndex; // number of digits before caret
            let newCaret = 0, seen = 0;
            for (let i = 0; i < formatted.length; i++) {
              if (/\d/.test(formatted[i])) {
                if (seen === targetDigitPos) { newCaret = i; break; }
                seen++;
                newCaret = i + 1; // default to after last processed digit
              }
            }
            phoneEl.value = formatted;
            // Set caret, clamped within bounds
            const pos = Math.min(newCaret, formatted.length);
            phoneEl.setSelectionRange(pos, pos);
            // Trigger form-level input handler so live validator re-evaluates
            try { phoneEl.dispatchEvent(new Event('input', { bubbles: true })); } catch { }
          });
        }
        if (zipEl) {
          if (zipEl.value) zipEl.value = formatZipPlus4(zipEl.value);
          zipEl.addEventListener('input', () => {
            zipEl.value = formatZipPlus4(zipEl.value);
            const z = zipEl.value.replace(/\D+/g, '');
            const ok = (z.length === 5 && z === '13309') || (z.length === 9 && z.slice(0, 5) === '13309') || z.length === 0;
            if (ok) {
              try {
                zipEl.setCustomValidity('');
                if (typeof zipEl.reportValidity === 'function') zipEl.reportValidity();
              } catch { }
            }
          });
        }
        // attach live validation once form is visible
        attachDeliveryLiveValidation(dForm);

        dForm.addEventListener('submit', (e) => {
          e.preventDefault();
          const name = dForm.querySelector('#delivery-name').value.trim();
          const phoneEl = dForm.querySelector('#delivery-phone');
          const phone = phoneEl ? phoneEl.value.replace(/\D+/g, '') : '';
          const addr = dForm.querySelector('#delivery-address').value.trim();
          const type = (dForm.querySelector('#delivery-type')?.value || '').trim();
          const city = dForm.querySelector('#delivery-city').value.trim();
          const zipEl = dForm.querySelector('#delivery-zip');
          const zip = zipEl ? zipEl.value.trim() : '';
          // Do not clear tooltips preemptively; validate first
          const errEl = document.getElementById('delivery-error');
          // run live validation function for message + highlights
          const { ok, message } = validateDeliveryForm(dForm);
          if (!ok) {
            deliveryFailCount += 1;
            if (errEl && message) {
              let finalMsg = message;
              if (deliveryFailCount >= 2) {
                finalMsg += ' Please contact us if you are having trouble placing your order online. Please let us know what the issue is so we can have it fixed in a timely manner.';
              }
              errEl.textContent = finalMsg;
              errEl.hidden = false;
            }
            return;
          } else {
            // reset failure counter on successful validation
            deliveryFailCount = 0;
          }
          // At this point, live validation has passed; proceed
          try {
            localStorage.setItem(STORAGE_KEYS.deliveryName, name);
            localStorage.setItem(STORAGE_KEYS.deliveryPhone, phone);
            localStorage.setItem(STORAGE_KEYS.deliveryAddress, addr);
            localStorage.setItem(STORAGE_KEYS.deliveryType, type || 'House');
            localStorage.setItem(STORAGE_KEYS.deliveryCity, city);
            localStorage.setItem(STORAGE_KEYS.deliveryZip, zip);
          } catch { }
          saveOrderType('delivery');
          // Navigate to page 2
          window.location.href = 'page2.html';
        });

        // Clear all text/tel fields and reset validation
        const clearBtn = document.querySelector('.delivery-clear');
        if (clearBtn) {
          clearBtn.addEventListener('click', () => {
            dForm.querySelectorAll('input[type="text"], input[type="tel"]').forEach((el) => {
              el.value = '';
              el.setCustomValidity && el.setCustomValidity('');
            });
            const typeSel = dForm.querySelector('#delivery-type');
            if (typeSel) {
              // Default to House explicitly
              const target = 'House';
              const hasHouse = Array.from(typeSel.options).some(o => o.value === target || o.text === target);
              if (hasHouse) typeSel.value = target; else typeSel.selectedIndex = 0;
            }
            // Hide inline error if shown
            const errEl = document.getElementById('delivery-error');
            if (errEl) errEl.hidden = true;
            // Clear persisted delivery details
            try {
              localStorage.removeItem(STORAGE_KEYS.deliveryName);
              localStorage.removeItem(STORAGE_KEYS.deliveryPhone);
              localStorage.removeItem(STORAGE_KEYS.deliveryAddress);
              localStorage.removeItem(STORAGE_KEYS.deliveryType);
              localStorage.removeItem(STORAGE_KEYS.deliveryCity);
              localStorage.removeItem(STORAGE_KEYS.deliveryZip);
            } catch { }
          });
        }
      }
    }

    // Live validation utilities for delivery form
    function validateDeliveryForm(form) {
      const errEl = document.getElementById('delivery-error');
      const name = form.querySelector('#delivery-name');
      const phoneEl = form.querySelector('#delivery-phone');
      const addr = form.querySelector('#delivery-address');
      const typeSel = form.querySelector('#delivery-type');
      const city = form.querySelector('#delivery-city');
      const zipEl = form.querySelector('#delivery-zip');

      // Clear previous highlights
      form.querySelectorAll('.field').forEach(f => f.classList.remove('invalid'));

      const missing = [];
      if (!name.value.trim()) { missing.push('Name'); name.closest('.field')?.classList.add('invalid'); }
      const phoneDigits = (phoneEl?.value || '').replace(/\D+/g, '');
      if (!phoneDigits) { missing.push('Phone Number'); phoneEl.closest('.field')?.classList.add('invalid'); phoneEl.setCustomValidity('It has to have 10 digits.'); }
      if (!addr.value.trim()) { missing.push('Street Address'); addr.closest('.field')?.classList.add('invalid'); }
      if (!typeSel.value.trim()) { missing.push('Residence Type'); typeSel.closest('.field')?.classList.add('invalid'); }
      if (!city.value.trim()) { missing.push('City'); city.closest('.field')?.classList.add('invalid'); }
      if (!zipEl.value.trim()) { missing.push('Zip'); zipEl.closest('.field')?.classList.add('invalid'); }

      if (missing.length > 0) {
        return { ok: false, message: `Please complete the following required fields: ${missing.join(', ')}.` };
      }
      // specific checks
      if (phoneDigits.length > 0 && phoneDigits.length !== 10) {
        phoneEl.closest('.field')?.classList.add('invalid');
        // Set tooltip message on the input itself in addition to inline error
        phoneEl.setCustomValidity('It has to have 10 digits.');
        return { ok: false, message: 'It has to have 10 digits.' };
      } else {
        phoneEl.setCustomValidity('');
      }
      const zDigits = zipEl.value.replace(/\D+/g, '');
      const okZip = (zDigits.length === 5 && zDigits === '13309') || (zDigits.length === 9 && zDigits.slice(0, 5) === '13309');
      if (zDigits.length > 0 && !okZip) {
        zipEl.closest('.field')?.classList.add('invalid');
        // Set tooltip error for invalid service area zip
        zipEl.setCustomValidity('Sorry, we cannot accept your order. We currently serve zip code 13309 only.');
        return { ok: false, message: 'Sorry, we cannot accept your order. We currently serve zip code 13309 only.' };
      } else {
        // Clear sticky tooltip when corrected
        zipEl.setCustomValidity('');
      }
      return { ok: true, message: '' };
    }

    // Helper: force-clear any lingering UA tooltip on an input
    function clearInputTooltip(el) {
      if (!el) return;
      try {
        el.setCustomValidity('');
        if (typeof el.reportValidity === 'function') el.reportValidity();
        // Chrome sometimes keeps the bubble until focus changes
        el.blur();
        el.focus({ preventScroll: true });
      } catch { }
    }

    function attachDeliveryLiveValidation(form) {
      const handler = () => {
        const res = validateDeliveryForm(form);
        const errEl = document.getElementById('delivery-error');
        if (!res.ok) {
          if (errEl) { errEl.textContent = res.message; errEl.hidden = false; }
          // If phone invalid, trigger tooltip immediately
          const phoneEl = form.querySelector('#delivery-phone');
          const phoneDigits = (phoneEl?.value || '').replace(/\D+/g, '');
          if (phoneEl && phoneDigits.length > 0 && phoneDigits.length !== 10) {
            phoneEl.setCustomValidity('It has to have 10 digits.');
            if (document.activeElement === phoneEl && typeof phoneEl.reportValidity === 'function') {
              phoneEl.reportValidity();
            }
          }
          // If zip invalid, trigger tooltip immediately
          const zipEl = form.querySelector('#delivery-zip');
          const zDigits = (zipEl?.value || '').replace(/\D+/g, '');
          const zipBad = !((zDigits.length === 5 && zDigits === '13309') || (zDigits.length === 9 && zDigits.slice(0, 5) === '13309'));
          if (zipEl && zDigits.length > 0 && zipBad) {
            zipEl.setCustomValidity('Sorry, we cannot accept your order. We currently serve zip code 13309 only.');
            if (document.activeElement === zipEl && typeof zipEl.reportValidity === 'function') {
              zipEl.reportValidity();
            }
          }
        } else {
          if (errEl) errEl.hidden = true;
          // Force-clear any lingering tooltip bubbles in Chrome
          clearInputTooltip(form.querySelector('#delivery-phone'));
          clearInputTooltip(form.querySelector('#delivery-zip'));
        }
      };
      ['input', 'change'].forEach(evt => form.addEventListener(evt, handler));
    }

    // [H2] PAGE 2: MENU BUILDER
    if (body.classList.contains('page2')) {
      // Restore previous selections
      restoreIngredients();
      // Auto-open a section from hash (e.g., #pizza or #burger)
      openSectionFromHash();
      // Enforce required Burger Patty and Bun to be checked
      const patty = document.querySelector('input[type="checkbox"][name="burger_ingredients[]"][value="patty"]');
      const bun = document.querySelector('input[type="checkbox"][name="burger_ingredients[]"][value="bun"]');
      const pizzaSauce = document.querySelector('input[type="checkbox"][name="pizza_ingredients[]"][value="tomato_sauce"]');
      const enforceReq = (el) => {
        if (!el) return;
        el.checked = true;
      };
      enforceReq(patty);
      enforceReq(bun);
      enforceReq(pizzaSauce);
      // Ensure storage includes them
      saveIngredients();
      // Build ingredient quantity dropdowns (Regular/Extra/x3/x4)
      (function attachIngredientQuantities() {
        const options = [
          { label: 'Regular', value: '1' },
          { label: 'Extra', value: '2' },
          { label: 'x3', value: '3' },
          { label: 'x4', value: '4' }
        ];
        document.querySelectorAll('input[type="checkbox"][name$="_ingredients[]"]').forEach((cb) => {
          const lbl = cb.closest('label');
          if (!lbl) return;
          const key = `${cb.name}|${cb.value}`;
          let sel = lbl.querySelector('select.ingredient-qty');
          if (!sel) {
            sel = document.createElement('select');
            sel.className = 'ingredient-qty';
            options.forEach((opt) => {
              const o = document.createElement('option');
              o.value = opt.value;
              o.textContent = opt.label;
              sel.appendChild(o);
            });
            lbl.appendChild(sel);
          }
          let stored = 1;
          try { stored = Math.max(1, Math.min(4, parseInt((JSON.parse(localStorage.getItem(STORAGE_KEYS.quantities) || '{}'))[key] || '1', 10) || 1)); } catch { stored = 1; }
          sel.value = String(stored);
          sel.disabled = !cb.checked;
          const persistQty = (val) => {
            try {
              const qm = JSON.parse(localStorage.getItem(STORAGE_KEYS.quantities) || '{}');
              qm[key] = val;
              localStorage.setItem(STORAGE_KEYS.quantities, JSON.stringify(qm));
            } catch { }
          };
          sel.addEventListener('change', () => {
            const next = Math.max(1, Math.min(4, parseInt(sel.value, 10) || 1));
            sel.value = String(next);
            persistQty(next);
          });
          cb.addEventListener('change', () => {
            sel.disabled = !cb.checked;
            if (cb.checked) {
              const qm = (() => { try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.quantities) || '{}'); } catch { return {}; } })();
              if (!qm[key] || qm[key] === 0) {
                sel.value = '1';
                persistQty(1);
              }
            } else {
              persistQty(0);
            }
          });
        });
        applyQtyPlacement();
      })();

      // Hard-lock required items so they cannot be unchecked directly
      try {
        document.querySelectorAll('input[type="checkbox"][data-required="true"]').forEach((cb) => {
          // Block click toggling
          cb.addEventListener('click', (e) => {
            // Keep it checked and suppress default toggle
            if (!cb.checked) cb.checked = true;
            e.preventDefault();
            e.stopPropagation();
          });
          // Block programmatic/user change events
          cb.addEventListener('change', () => {
            if (!cb.checked) cb.checked = true;
          });
        });
      } catch { }

      // Load/save quantities for sections (pizza/burger) and sauces
      let qtySections = {};
      try { qtySections = JSON.parse(localStorage.getItem(STORAGE_KEYS.quantitiesSections) || '{}'); } catch { qtySections = {}; }
      let qtyMap = {};
      try { qtyMap = JSON.parse(localStorage.getItem(STORAGE_KEYS.quantities) || '{}'); } catch { qtyMap = {}; }
      const saveQtySections = () => { try { localStorage.setItem(STORAGE_KEYS.quantitiesSections, JSON.stringify(qtySections)); } catch { } };
      const saveQtyMap = () => { try { localStorage.setItem(STORAGE_KEYS.quantities, JSON.stringify(qtyMap)); } catch { } };

      // Helper: ensure Burger "Tomato(s)" label reflects Burger item quantity
      const updateBurgerTomatoLabel = () => {
        try {
          const burgerQty = Math.max(0, parseInt(qtySections['burger'] || '0', 10) || 0);
          const tomatoInput = document.querySelector('input[type="checkbox"][name="burger_ingredients[]"][value="tomatoes"], input[type="checkbox"][name="burger_ingredients[]"][value="tomato"]');
          if (!tomatoInput) return;
          const labelEl = tomatoInput.closest('label');
          if (!labelEl) return;
          // Clean any previously injected text/duplicates
          labelEl.querySelectorAll('.label-text').forEach(el => el.remove());
          // Remove stray text nodes so we don't end up with "Tomato Tomatoes"
          Array.from(labelEl.childNodes).forEach((node) => {
            if (node.nodeType === 3) { // text node
              const t = String(node.textContent || '').trim();
              if (t) node.parentNode.removeChild(node);
            }
          });
          // Insert a single normalized label immediately after the input
          const textSpan = document.createElement('span');
          textSpan.className = 'label-text';
          const word = burgerQty > 1 ? 'Tomatoes' : 'Tomato';
          textSpan.textContent = ` ${word}`;
          if (tomatoInput.nextSibling) {
            labelEl.insertBefore(textSpan, tomatoInput.nextSibling);
          } else {
            labelEl.appendChild(textSpan);
          }
        } catch { }
      };

      // Decorate section summaries (Pizza/Burger) with quantity controls (1-12)
      ['pizza', 'burger'].forEach((sec) => {
        const d = document.getElementById(sec);
        if (!d) return;
        const summary = d.querySelector('summary.menu-summary');
        if (!summary) return;
        // Avoid duplicate controls
        if (summary.querySelector('.qty-controls')) return;
        // Allow zero so an unselected section shows (x0)
        let current = Math.max(0, Math.min(12, parseInt(qtySections[sec] || '0', 10) || 0));
        const wrap = document.createElement('span');
        wrap.className = 'qty-controls';
        wrap.style.marginLeft = '12px';
        const label = document.createElement('span');
        label.textContent = `(x${current})`;
        label.style.marginRight = '6px';
        const dec = document.createElement('button');
        dec.type = 'button'; dec.textContent = '−'; dec.setAttribute('aria-label', `Decrease ${sec} quantity`);
        dec.style.marginRight = '4px';
        dec.classList.add('pointer');
        const inc = document.createElement('button');
        inc.type = 'button'; inc.textContent = '+'; inc.setAttribute('aria-label', `Increase ${sec} quantity`);
        inc.classList.add('pointer');
        const update = (next) => {
          current = Math.max(0, Math.min(12, (next | 0)));
          qtySections[sec] = current; saveQtySections();
          label.textContent = `(x${current})`;
          // If quantity reaches 0, deselect the section checkbox to make the item inactive
          if (current === 0) {
            const toggle = d.querySelector('.section-toggle');
            if (toggle && toggle.checked) {
              toggle.checked = false;
              toggle.dispatchEvent(new Event('change', { bubbles: true }));
            }
          } else {
            // Ensure the section is active when qty goes from 0 -> 1+
            const toggle = d.querySelector('.section-toggle');
            if (toggle && !toggle.checked) {
              toggle.checked = true;
              toggle.dispatchEvent(new Event('change', { bubbles: true }));
            }
          }
          if (sec === 'burger') updateBurgerTomatoLabel();
        };
        dec.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); update(current - 1); });
        inc.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); update(current + 1); });
        wrap.appendChild(label); wrap.appendChild(dec); wrap.appendChild(inc);
        summary.appendChild(wrap);
      });

      // Initialize Burger tomato label once on load
      updateBurgerTomatoLabel();

      // Add per-ingredient qty controls for Sauces on builder (shown when checked)
      document.querySelectorAll('input[type="checkbox"][name="sauces_ingredients[]"]').forEach((cb) => {
        const labelEl = cb.closest('label');
        if (!labelEl) return;
        // Avoid duplicate
        if (labelEl.querySelector('.sauce-qty')) {
          return;
        }
        const value = cb.value;
        const qKey = `sauces_ingredients[]|${value}`;
        let current = Math.max(1, Math.min(12, parseInt(qtyMap[qKey] || '1', 10) || 1));
        const wrap = document.createElement('span');
        wrap.className = 'sauce-qty';
        wrap.style.marginLeft = '8px';
        const txt = document.createElement('span');
        txt.textContent = `(x${current})`;
        txt.style.marginRight = '4px';
        const dec = document.createElement('button'); dec.type = 'button'; dec.textContent = '−'; dec.style.marginRight = '2px'; dec.classList.add('pointer');
        const inc = document.createElement('button'); inc.type = 'button'; inc.textContent = '+'; inc.classList.add('pointer');
        const update = (next) => {
          current = Math.max(1, Math.min(12, (next | 0)));
          qtyMap[qKey] = current; saveQtyMap();
          txt.textContent = `(x${current})`;
          // If quantity reaches 0 (via minus click from 1), uncheck the sauce to make it inactive
          if (current === 0) {
            if (cb.checked) {
              cb.checked = false;
              cb.dispatchEvent(new Event('change', { bubbles: true }));
            }
          } else {
            // Ensure it's checked if qty increased from 0 -> 1
            if (!cb.checked) {
              cb.checked = true;
              cb.dispatchEvent(new Event('change', { bubbles: true }));
            }
          }
        };
        dec.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); update(current - 1); });
        inc.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); update(current + 1); });
        wrap.appendChild(txt); wrap.appendChild(dec); wrap.appendChild(inc);
        // Show controls only when checked
        const setVisible = () => { wrap.style.display = cb.checked ? 'inline-flex' : 'none'; };
        setVisible();
        cb.addEventListener('change', () => {
          if (!cb.checked) {
            // If item is not selected, its quantity becomes 0
            qtyMap[qKey] = 0; saveQtyMap();
            txt.textContent = `(x0)`;
          } else {
            // When re-checked, if stored 0 bump back to 1 (do not show 0 when rechecked)
            const prev = (qtyMap[qKey] | 0);
            if (prev === 0) {
              qtyMap[qKey] = 1; saveQtyMap();
              txt.textContent = `(x1)`;
            }
          }
          setVisible();
        });
        labelEl.appendChild(wrap);
      });

      // Add per-ingredient qty controls for Burger Patty (max 3)
      (function addPattyQty() {
        const cb = document.querySelector('input[type="checkbox"][name="burger_ingredients[]"][value="patty"]');
        if (!cb) return;
        const labelEl = cb.closest('label');
        if (!labelEl) return;
        if (labelEl.querySelector('.patty-qty')) return;
        const qKey = 'burger_ingredients[]|patty';
        let current = 1;
        try { current = Math.max(1, Math.min(3, parseInt(qtyMap[qKey] || '1', 10) || 1)); } catch { current = 1; }
        const wrap = document.createElement('span');
        wrap.className = 'patty-qty';
        wrap.style.marginLeft = '8px';
        const txt = document.createElement('span'); txt.textContent = `(x${current})`; txt.style.marginRight = '4px';
        const dec = document.createElement('button'); dec.type = 'button'; dec.textContent = '−'; dec.style.marginRight = '2px'; dec.classList.add('pointer');
        const inc = document.createElement('button'); inc.type = 'button'; inc.textContent = '+'; inc.classList.add('pointer');
        // Suppress parent label tooltip when hovering buttons
        const stashTitle = () => { if (!labelEl) return ''; const t = labelEl.getAttribute('title'); labelEl.removeAttribute('title'); return t; };
        const restoreTitle = (t) => { if (!labelEl) return; if (t) labelEl.setAttribute('title', t); };
        let savedTitle = null;
        ['mouseenter', 'focus'].forEach(evt => {
          dec.addEventListener(evt, () => { if (savedTitle === null) savedTitle = stashTitle(); });
          inc.addEventListener(evt, () => { if (savedTitle === null) savedTitle = stashTitle(); });
        });
        ['mouseleave', 'blur'].forEach(evt => {
          dec.addEventListener(evt, () => { if (savedTitle !== null) { restoreTitle(savedTitle); savedTitle = null; } });
          inc.addEventListener(evt, () => { if (savedTitle !== null) { restoreTitle(savedTitle); savedTitle = null; } });
        });
        const savePatty = () => { qtyMap[qKey] = current; try { localStorage.setItem(STORAGE_KEYS.quantities, JSON.stringify(qtyMap)); } catch { } };
        const update = (next) => { current = Math.max(1, Math.min(3, (next | 0))); txt.textContent = `(x${current})`; savePatty(); };
        dec.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); update(current - 1); });
        inc.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); update(current + 1); });
        wrap.appendChild(txt); wrap.appendChild(dec); wrap.appendChild(inc);
        const setVisible = () => { wrap.style.display = cb.checked ? 'inline-flex' : 'none'; };
        setVisible();
        cb.addEventListener('change', () => { setVisible(); });
        labelEl.appendChild(wrap);
      })();

      // Add per-ingredient qty controls for Burger ingredients (except doneness options)
      (function addBurgerIngredientQty() {
        const cbs = document.querySelectorAll('input[type="checkbox"][name="burger_ingredients[]"]');
        cbs.forEach((cb) => {
          const value = cb.value;
          // Skip controls we already handle or should exclude
          if (value === 'patty' || value === 'well_done' || value === 'medium_well' || value === 'rare') return;
          const labelEl = cb.closest('label');
          if (!labelEl) return;
          if (labelEl.querySelector('.burger-qty')) return;
          const qKey = `burger_ingredients[]|${value}`;
          let current = 1;
          try { current = Math.max(1, Math.min(12, parseInt((JSON.parse(localStorage.getItem(STORAGE_KEYS.quantities) || '{}'))[qKey] || '1', 10) || 1)); } catch { current = 1; }
          const wrap = document.createElement('span');
          wrap.className = 'burger-qty';
          wrap.style.marginLeft = '8px';
          const txt = document.createElement('span'); txt.textContent = `(x${current})`; txt.style.marginRight = '4px';
          const dec = document.createElement('button'); dec.type = 'button'; dec.textContent = '−'; dec.style.marginRight = '2px'; dec.classList.add('pointer');
          const inc = document.createElement('button'); inc.type = 'button'; inc.textContent = '+'; inc.classList.add('pointer');
          const save = () => {
            try {
              const qm = JSON.parse(localStorage.getItem(STORAGE_KEYS.quantities) || '{}');
              qm[qKey] = current; localStorage.setItem(STORAGE_KEYS.quantities, JSON.stringify(qm));
            } catch { }
          };
          const update = (next) => { current = Math.max(1, Math.min(12, (next | 0))); txt.textContent = `(x${current})`; save(); };
          dec.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); update(current - 1); });
          inc.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); update(current + 1); });
          wrap.appendChild(txt); wrap.appendChild(dec); wrap.appendChild(inc);
          const setVisible = () => { wrap.style.display = cb.checked ? 'inline-flex' : 'none'; };
          setVisible();
          cb.addEventListener('change', () => {
            if (!cb.checked) {
              // When item is unchecked, set quantity to 0 for storage and hide
              try {
                const qm = JSON.parse(localStorage.getItem(STORAGE_KEYS.quantities) || '{}');
                qm[qKey] = 0; localStorage.setItem(STORAGE_KEYS.quantities, JSON.stringify(qm));
              } catch { }
            } else {
              // When re-checked, if stored 0 bump to 1 and reflect
              try {
                const qm = JSON.parse(localStorage.getItem(STORAGE_KEYS.quantities) || '{}');
                if ((qm[qKey] | 0) === 0) { current = 1; txt.textContent = `(x1)`; qm[qKey] = 1; localStorage.setItem(STORAGE_KEYS.quantities, JSON.stringify(qm)); }
              } catch { }
            }
            setVisible();
          });
          labelEl.appendChild(wrap);
        });
      })();

      // Section toggles: require checkbox to expand
      const toggles = document.querySelectorAll('.section-toggle');
      const detailsBySection = {
        pizza: document.getElementById('pizza'),
        burger: document.getElementById('burger'),
        sauces: document.getElementById('sauces')
      };
      // Restore previously saved active sections (so Go Back preserves state)
      let activeSections = {};
      try { activeSections = JSON.parse(localStorage.getItem(STORAGE_KEYS.activeSections) || '{}'); } catch { activeSections = {}; }
      toggles.forEach((t) => {
        const section = t.dataset.section;
        const d = detailsBySection[section];
        const isActive = !!activeSections[section];
        t.checked = isActive;
        if (d) d.open = isActive;
        // If active on restore, enforce required items
        if (isActive && d) {
          d.querySelectorAll('input[type="checkbox"][data-required="true"]').forEach((cb) => { cb.checked = true; });
        }
        // Prevent checkbox click from toggling summary directly
        t.addEventListener('click', (ev) => { ev.stopPropagation(); });
        t.addEventListener('change', () => {
          const d2 = detailsBySection[section];
          if (d2) d2.open = t.checked;
          if (t.checked && d2) {
            // Enforce required when activating
            d2.querySelectorAll('input[type="checkbox"][data-required="true"]').forEach((cb) => { cb.checked = true; });
            saveIngredients();
            // If activating Pizza/Burger, ensure quantity is at least 1 (was 0 when deselected)
            if (section === 'pizza' || section === 'burger') {
              try {
                let qtySections = JSON.parse(localStorage.getItem(STORAGE_KEYS.quantitiesSections) || '{}');
                const cur = parseInt(qtySections[section] || '0', 10) || 0;
                if (cur <= 0) {
                  qtySections[section] = 1;
                  localStorage.setItem(STORAGE_KEYS.quantitiesSections, JSON.stringify(qtySections));
                  const sum = d2.querySelector('summary.menu-summary .qty-controls span');
                  if (sum) sum.textContent = `(x1)`;
                }
              } catch { }
            }
          }
          if (!t.checked && d2) {
            // Clear all selections in that section when deactivating
            d2.querySelectorAll('input[type="checkbox"][name]').forEach((cb) => { cb.checked = false; });
            saveIngredients();
            // If the menu item (section) is not selected, its quantity becomes 0
            if (section === 'pizza' || section === 'burger') {
              try {
                let qtySections = JSON.parse(localStorage.getItem(STORAGE_KEYS.quantitiesSections) || '{}');
                qtySections[section] = 0;
                localStorage.setItem(STORAGE_KEYS.quantitiesSections, JSON.stringify(qtySections));
              } catch { }
              const sum = d2.querySelector('summary.menu-summary .qty-controls span');
              if (sum) sum.textContent = `(x0)`;
            }
          }
          activeSections[section] = t.checked;
          try { localStorage.setItem(STORAGE_KEYS.activeSections, JSON.stringify(activeSections)); } catch { }
          updatePageNavLocks();
        });
      });
      // Summary behavior:
      // - If titleSelects is ON, clicking the title text toggles the checkbox (not expand)
      // - If expandOnly is ON, clicking elsewhere on summary expands/collapses
      // - Otherwise (default), clicking summary toggles the checkbox
      document.querySelectorAll('summary.menu-summary').forEach((s) => {
        s.addEventListener('click', (e) => {
          const titleEl = s.querySelector('span');
          const isTitleClick = titleEl && titleEl.contains(e.target);
          if (titleSelects && isTitleClick) {
            e.preventDefault();
            e.stopPropagation();
            const t = s.querySelector('.section-toggle');
            if (t) {
              t.checked = !t.checked;
              t.dispatchEvent(new Event('change', { bubbles: true }));
            }
            return;
          }
          if (expandOnly) {
            e.preventDefault();
            e.stopPropagation();
            const d = s.parentElement;
            if (d && d.tagName && d.tagName.toLowerCase() === 'details') {
              d.open = !d.open;
            }
            return;
          }
          // Default: toggle checkbox when clicking summary (anywhere)
          e.preventDefault();
          e.stopPropagation();
          const t = s.querySelector('.section-toggle');
          if (t) {
            t.checked = !t.checked;
            t.dispatchEvent(new Event('change', { bubbles: true }));
          }
        });
      });
      // Delegate clicks on ingredient labels to toggle their checkbox when enabled
      if (labelSelects) {
        document.addEventListener('click', (e) => {
          const lbl = e.target.closest('label');
          if (!lbl) return;
          const cb = lbl.querySelector('input[type="checkbox"][name]');
          if (!cb) return;
          if (cb.disabled) return;
          // Do NOT toggle required items (e.g., Patty, Bun, Tomato Sauce)
          if (cb.dataset && cb.dataset.required === 'true') return;
          // Ensure only non-checkbox clicks trigger the manual toggle
          if (e.target !== cb) {
            cb.checked = !cb.checked;
            cb.dispatchEvent(new Event('change', { bubbles: true }));
            e.preventDefault();
          }
        });
      }

      // Live update builder error on any relevant change
      const updateBuilderError = () => {
        const err = document.getElementById('builder-error');
        if (!err) return;
        const togglesArr = Array.from(document.querySelectorAll('.section-toggle'));
        const anySectionActive = togglesArr.some((t) => t.checked);
        const saucesActive = togglesArr.some((t) => t.dataset.section === 'sauces' && t.checked);
        const saucesSelected = Array.from(document.querySelectorAll('input[type="checkbox"][name="sauces_ingredients[]"]:checked')).length > 0;
        let message = '';
        if (!anySectionActive) {
          message = 'Please select at least one menu category before continuing.';
        } else if (saucesActive && !saucesSelected) {
          message = 'Please select at least one sauce or uncheck Sauces.';
        }
        // Clear previous invalid highlights
        document.querySelectorAll('summary.menu-summary').forEach((s) => s.classList.remove('invalid'));
        if (!anySectionActive) {
          // highlight all summaries when nothing is selected
          document.querySelectorAll('summary.menu-summary').forEach((s) => s.classList.add('invalid'));
        } else if (saucesActive && !saucesSelected) {
          const s = document.querySelector('#sauces > summary.menu-summary');
          if (s) s.classList.add('invalid');
        }
        if (message) {
          err.textContent = message;
          err.hidden = false;
        } else {
          err.hidden = true;
        }
      };
      // Hook into changes for live validation
      document.querySelectorAll('.section-toggle, input[type="checkbox"][name^="sauces_ingredients"]').forEach((el) => {
        el.addEventListener('change', updateBuilderError);
      });
      // Save on any change and auto-activate section when ingredient is checked
      document.addEventListener('change', (e) => {
        const t = e.target;
        if (t && t.matches && t.matches('input[type="checkbox"][name]')) {
          // If a non-required ingredient inside a section is checked, ensure the section is activated
          const name = t.getAttribute('name') || '';
          const isRequired = t.dataset && t.dataset.required === 'true';
          if (!isRequired && t.checked) {
            let section = '';
            if (name.startsWith('pizza_')) section = 'pizza';
            else if (name.startsWith('burger_')) section = 'burger';
            else if (name.startsWith('sauces_')) section = 'sauces';
            if (section) {
              const d = detailsBySection[section];
              const toggle = d ? d.querySelector('.section-toggle') : null;
              if (toggle && !toggle.checked) {
                toggle.checked = true;
                toggle.dispatchEvent(new Event('change', { bubbles: true }));
              }
            }
          }
          saveIngredients();
          updateBuilderError();
          updatePageNavLocks();
        }
      });
      // Reset buttons per group
      document.querySelectorAll('.reset-group[data-group]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const group = btn.getAttribute('data-group');
          if (!group) return;
          document.querySelectorAll(`input[type="checkbox"][name="${group}"]`).forEach((cb) => {
            if (cb.dataset.required === 'true' || cb.disabled) {
              // keep required selections checked
              cb.checked = true;
            } else {
              cb.checked = false;
            }
          });
          saveIngredients();
          // Additionally normalize key quantities for the group being reset
          try {
            let qm = JSON.parse(localStorage.getItem(STORAGE_KEYS.quantities) || '{}');
            if (group.startsWith('burger_')) {
              const pattyKey = 'burger_ingredients[]|patty';
              // Patty quantity has a minimum of 1, even if disabling the item
              qm[pattyKey] = 1;
              localStorage.setItem(STORAGE_KEYS.quantities, JSON.stringify(qm));
              // Update visible Patty qty widget on builder if present
              const pattyCb = document.querySelector('input[type="checkbox"][name="burger_ingredients[]"][value="patty"]');
              const pattyLabel = pattyCb ? pattyCb.closest('label') : null;
              const pattyQtyTxt = pattyLabel ? pattyLabel.querySelector('.patty-qty > span') : null;
              if (pattyQtyTxt) pattyQtyTxt.textContent = `(x1)`;
            }
          } catch { }
          if (resetDisables) {
            // Map group to section key
            let section = '';
            if (group.startsWith('pizza_')) section = 'pizza';
            else if (group.startsWith('burger_')) section = 'burger';
            else if (group.startsWith('sauces_')) section = 'sauces';
            if (section) {
              const d2 = document.getElementById(section);
              const toggle = d2 ? d2.querySelector('.section-toggle') : null;
              if (toggle && toggle.checked) {
                toggle.checked = false;
                toggle.dispatchEvent(new Event('change', { bubbles: true }));
              }
              // Ensure activeSections reflects disabled
              try {
                let act = JSON.parse(localStorage.getItem(STORAGE_KEYS.activeSections) || '{}');
                act[section] = false;
                localStorage.setItem(STORAGE_KEYS.activeSections, JSON.stringify(act));
              } catch { }
              // Reset quantities as appropriate
              if (section === 'pizza' || section === 'burger') {
                try {
                  let qs = JSON.parse(localStorage.getItem(STORAGE_KEYS.quantitiesSections) || '{}');
                  qs[section] = 0;
                  localStorage.setItem(STORAGE_KEYS.quantitiesSections, JSON.stringify(qs));
                } catch { }
                const sum = d2 && d2.querySelector('summary.menu-summary .qty-controls span');
                if (sum) sum.textContent = `(x0)`;
              } else if (section === 'sauces') {
                // Zero out all sauce qtys
                try {
                  let qm = JSON.parse(localStorage.getItem(STORAGE_KEYS.quantities) || '{}');
                  Object.keys(qm).forEach((k) => { if (k.startsWith('sauces_ingredients[]|')) qm[k] = 0; });
                  localStorage.setItem(STORAGE_KEYS.quantities, JSON.stringify(qm));
                } catch { }
                // Hide sauce qty widgets if present
                document.querySelectorAll('.sauce-qty').forEach(el => el.style.display = 'none');
              }
            }
          }
        });
      });
      // Next: must have at least one menu section checked; if Sauces is active, require at least one sauce
      const next = document.querySelector('.next-button');
      if (next) {
        next.addEventListener('click', (e) => {
          saveIngredients();
          const err = document.getElementById('builder-error');
          const togglesArr = Array.from(document.querySelectorAll('.section-toggle'));
          const anySectionActive = togglesArr.some((t) => t.checked);
          const saucesActive = togglesArr.some((t) => t.dataset.section === 'sauces' && t.checked);
          const saucesSelected = Array.from(document.querySelectorAll('input[type="checkbox"][name="sauces_ingredients[]"]:checked')).length > 0;
          let message = '';
          if (!anySectionActive) {
            message = 'Please select at least one menu category before continuing.';
          } else if (saucesActive && !saucesSelected) {
            message = 'Please select at least one sauce or uncheck Sauces.';
          }
          if (message) {
            e.preventDefault();
            if (err) {
              err.textContent = message;
              err.hidden = false;
              err.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
          } else {
            if (err) err.hidden = true;
          }
        });
      }
    }

    // [H3] PAGE 3: ORDER SUMMARY
    if (body.classList.contains('page3')) {
      const container = document.getElementById('order-summary');
      if (container) {
        const type = getOrderType();
        let ingredients = {};
        try {
          const raw = localStorage.getItem(STORAGE_KEYS.ingredients);
          ingredients = raw ? JSON.parse(raw) : {};
        } catch { ingredients = {}; }
        let activeSections = {};
        try { activeSections = JSON.parse(localStorage.getItem(STORAGE_KEYS.activeSections) || '{}'); } catch { activeSections = {}; }

        // Build summary HTML
        const frag = document.createDocumentFragment();
        if (type) {
          const h3 = document.createElement('h3');
          h3.textContent = 'Order Type';
          frag.appendChild(h3);
          const p = document.createElement('p');
          p.textContent = (type === 'dine' ? 'Dine In/Carryout' : 'Delivery');
          frag.appendChild(p);
        }

        // Delivery details block (multi-line formatting)
        if (type === 'delivery') {
          const d = document.createElement('div');
          const h = document.createElement('h3');
          h.textContent = 'Delivery Details';
          d.appendChild(h);

          const dn = localStorage.getItem(STORAGE_KEYS.deliveryName) || '';
          const dph = localStorage.getItem(STORAGE_KEYS.deliveryPhone) || '';
          const da = localStorage.getItem(STORAGE_KEYS.deliveryAddress) || '';
          const dt = localStorage.getItem(STORAGE_KEYS.deliveryType) || '';
          const city = localStorage.getItem(STORAGE_KEYS.deliveryCity) || '';
          const zip = localStorage.getItem(STORAGE_KEYS.deliveryZip) || '';

          const block = document.createElement('div');
          block.className = 'address-block';

          if (dn || dt) {
            const line = document.createElement('div');
            line.textContent = dt ? `${dn} (${dt})` : dn;
            block.appendChild(line);
          }
          if (dph) {
            const line = document.createElement('div');
            const pretty = (function (v) {
              const d = String(v || '').replace(/\D+/g, '').slice(0, 10);
              const a = d.slice(0, 3), b = d.slice(3, 6), c = d.slice(6, 10);
              let out = ''; if (a) out = `(${a}`; if (a.length === 3) out += `)`; if (b) out += `-${b}`; if (c) out += `-${c}`; return out || v;
            })(dph);
            line.textContent = `Phone: ${pretty}`;
            block.appendChild(line);
          }
          if (da) {
            const line = document.createElement('div');
            line.textContent = da;
            block.appendChild(line);
          }
          // Street line removed; Street Address is shown via 'da'
          if (city || zip) {
            const line = document.createElement('div');
            line.textContent = [city, zip].filter(Boolean).join(' ');
            block.appendChild(line);
          }

          d.appendChild(block);
          frag.appendChild(d);
        }

        const h3i = document.createElement('h3');
        h3i.textContent = 'Selections';
        frag.appendChild(h3i);

        const entries = Object.entries(ingredients || {});
        // Load saved per-ingredient quantities (legacy, not used for display now)
        let qtyMap = {};
        try { qtyMap = JSON.parse(localStorage.getItem(STORAGE_KEYS.quantities) || '{}'); } catch { qtyMap = {}; }
        // Load per-section quantities (pizza/burger)
        let qtySections = {};
        try { qtySections = JSON.parse(localStorage.getItem(STORAGE_KEYS.quantitiesSections) || '{}'); } catch { qtySections = {}; }
        const nonEmpty = entries.filter(([, arr]) => Array.isArray(arr) && arr.length > 0);
        if (entries.length === 0 || nonEmpty.length === 0) {
          const none = document.createElement('p');
          none.textContent = 'No ingredients selected yet.';
          frag.appendChild(none);
        } else {
          nonEmpty.forEach(([group, values]) => {
            const key = group.replace(/_ingredients\[\]$/, '');
            const prettyGroup = key.replace(/_/g, ' ');
            // Skip categories that are not active (checkbox not selected on Page 2)
            if (!activeSections[key]) return;
            // Also skip Pizza/Burger if their section quantity is 0
            if ((key === 'pizza' || key === 'burger')) {
              let qv = 0;
              try { qv = parseInt(qtySections[key] || '0', 10) || 0; } catch { qv = 0; }
              if (qv <= 0) return;
            }

            const header = document.createElement('div');
            const listTitle = document.createElement('strong');
            listTitle.textContent = prettyGroup.charAt(0).toUpperCase() + prettyGroup.slice(1);
            header.appendChild(listTitle);

            const edit = document.createElement('a');
            edit.href = `page2.html#${key}`;
            edit.textContent = 'Edit';
            edit.style.marginLeft = '8px';
            header.appendChild(edit);

            // Section-level quantity controls for Pizza and Burger
            if (key === 'pizza' || key === 'burger') {
              const qWrap = document.createElement('span');
              qWrap.style.marginLeft = '12px';
              const qKey = key; // 'pizza' or 'burger'
              // Allow 0 if previously set via deselection; otherwise controls clamp to 1..12
              let current = Math.max(0, Math.min(12, parseInt(qtySections[qKey] || '0', 10) || 0));

              const labelSpan = document.createElement('span');
              labelSpan.textContent = `(x${current})`;
              labelSpan.style.marginRight = '6px';

              const dec = document.createElement('button');
              dec.type = 'button';
              dec.textContent = '−';
              dec.setAttribute('aria-label', `Decrease ${key} quantity`);
              dec.style.marginRight = '4px';

              const inc = document.createElement('button');
              inc.type = 'button';
              inc.textContent = '+';
              inc.setAttribute('aria-label', `Increase ${key} quantity`);

              const updateQty = (next) => {
                const val = Math.max(0, Math.min(12, (next | 0)));
                current = val;
                qtySections[qKey] = val;
                try { localStorage.setItem(STORAGE_KEYS.quantitiesSections, JSON.stringify(qtySections)); } catch { }
                labelSpan.textContent = `(x${val})`;
                if (val === 0) {
                  // Deselect item on Page 2 state: deactivate section and clear its ingredients
                  try {
                    // activeSections
                    let act = JSON.parse(localStorage.getItem(STORAGE_KEYS.activeSections) || '{}');
                    act[key] = false;
                    localStorage.setItem(STORAGE_KEYS.activeSections, JSON.stringify(act));
                    // ingredients
                    let ing = JSON.parse(localStorage.getItem(STORAGE_KEYS.ingredients) || '{}');
                    const gname = key + '_ingredients[]';
                    ing[gname] = [];
                    localStorage.setItem(STORAGE_KEYS.ingredients, JSON.stringify(ing));
                  } catch { }
                  // Remove this section from summary immediately
                  const listEl = header.nextElementSibling;
                  if (listEl && listEl.tagName && listEl.tagName.toLowerCase() === 'ul') {
                    listEl.remove();
                  }
                  header.remove();
                }
              };

              dec.addEventListener('click', () => { updateQty(current - 1); });
              inc.addEventListener('click', () => { updateQty(current + 1); });

              qWrap.appendChild(labelSpan);
              qWrap.appendChild(dec);
              qWrap.appendChild(inc);
              header.appendChild(qWrap);
            }

            frag.appendChild(header);
            const ul = document.createElement('ul');
            values.forEach((item) => {
              const li = document.createElement('li');
              const value = (typeof item === 'string') ? item : (item && item.value ? item.value : '');
              // Tomato/tomatoes display rules
              let normValue = value;
              // Pizza: always "Tomatoes"
              if (key === 'pizza' && value === 'tomato') normValue = 'tomatoes';
              // Build initial label from value or provided label
              let label = (typeof item === 'string') ? titleCase(normValue) : (item && item.label ? item.label : titleCase(normValue));
              // Burger: pluralize based on burger item quantity (>1 -> "Tomatoes", else "Tomato")
              if (key === 'burger' && (value === 'tomato' || value === 'tomatoes' || /\bTomato\b/i.test(label))) {
                let bq = 0;
                try { bq = parseInt(qtySections['burger'] || '0', 10) || 0; } catch { bq = 0; }
                const desired = bq > 1 ? 'Tomatoes' : 'Tomato';
                label = label.replace(/\bTomatoes\b|\bTomato\b/i, desired);
              }
              label = stripInlineQty(label);

              if (key === 'sauces') {
                // Per-ingredient quantity controls for sauces
                const qKey = `${group}|${normValue}`;
                let current = Math.max(1, Math.min(12, parseInt(qtyMap[qKey] || '1', 10) || 1));

                const nameSpan = document.createElement('span');
                nameSpan.textContent = `${label} (x${current})`;
                nameSpan.style.marginRight = '8px';
                li.appendChild(nameSpan);

                const dec = document.createElement('button');
                dec.type = 'button';
                dec.textContent = '−';
                dec.setAttribute('aria-label', `Decrease ${label}`);
                dec.style.marginRight = '4px';

                const inc = document.createElement('button');
                inc.type = 'button';
                inc.textContent = '+';
                inc.setAttribute('aria-label', `Increase ${label}`);

                const updateQty = (next) => {
                  const val = Math.max(0, Math.min(12, next | 0));
                  current = val;
                  qtyMap[qKey] = current;
                  try { localStorage.setItem(STORAGE_KEYS.quantities, JSON.stringify(qtyMap)); } catch { }
                  if (val === 0) {
                    // Remove from stored ingredients and UI, and possibly deactivate Sauces section if empty
                    try {
                      let ing = JSON.parse(localStorage.getItem(STORAGE_KEYS.ingredients) || '{}');
                      const arr = Array.isArray(ing[group]) ? ing[group] : [];
                      const filtered = arr.filter((it) => {
                        const v = (typeof it === 'string') ? it : (it && it.value);
                        return v && v !== value;
                      });
                      ing[group] = filtered;
                      localStorage.setItem(STORAGE_KEYS.ingredients, JSON.stringify(ing));
                      // If no sauces left, deactivate section
                      if (filtered.length === 0) {
                        let act = JSON.parse(localStorage.getItem(STORAGE_KEYS.activeSections) || '{}');
                        act['sauces'] = false;
                        localStorage.setItem(STORAGE_KEYS.activeSections, JSON.stringify(act));
                        // Remove header and list from summary
                        const ulEl = li.parentElement;
                        const hdr = ulEl ? ulEl.previousElementSibling : null;
                        // Remove just this li; if ul becomes empty, remove header and ul
                        li.remove();
                        if (ulEl && ulEl.children.length === 0) {
                          ulEl.remove();
                          if (hdr) hdr.remove();
                        }
                        return;
                      }
                    } catch { }
                    // Remove just this li from UI
                    li.remove();
                    return;
                  }
                  nameSpan.textContent = `${label} (x${val})`;
                };

                dec.addEventListener('click', () => { updateQty(current - 1); });
                inc.addEventListener('click', () => { updateQty(current + 1); });

                li.appendChild(dec);
                li.appendChild(inc);
              } else if (key === 'burger' && normValue === 'patty') {
                // Patty has per-ingredient quantity controls (max 3)
                const qKey = `${group}|${normValue}`;
                let current = 1;
                try { current = Math.max(1, Math.min(3, parseInt(qtyMap[qKey] || '1', 10) || 1)); } catch { current = 1; }

                const nameSpan = document.createElement('span');
                nameSpan.textContent = `${label} (x${current})`;
                nameSpan.style.marginRight = '8px';
                li.appendChild(nameSpan);

                const dec = document.createElement('button');
                dec.type = 'button'; dec.textContent = '−'; dec.style.marginRight = '4px';
                dec.classList.add('pointer');
                const inc = document.createElement('button');
                inc.type = 'button'; inc.textContent = '+'; inc.classList.add('pointer');

                const updateQty = (next) => {
                  current = Math.max(1, Math.min(3, next | 0));
                  qtyMap[qKey] = current;
                  try { localStorage.setItem(STORAGE_KEYS.quantities, JSON.stringify(qtyMap)); } catch { }
                  nameSpan.textContent = `${label} (x${current})`;
                };
                dec.addEventListener('click', () => { updateQty(current - 1); });
                inc.addEventListener('click', () => { updateQty(current + 1); });
                li.appendChild(dec);
                li.appendChild(inc);
              } else {
                // Generic ingredient; display quantity if >1
                const qKey = `${group}|${normValue}`;
                let qv = 1;
                try { qv = Math.max(1, Math.min(4, parseInt(qtyMap[qKey] || '1', 10) || 1)); } catch { qv = 1; }
                li.textContent = qv > 1 ? `${label} (x${qv})` : label;
              }
              ul.appendChild(li);
            });
            frag.appendChild(ul);
          });
        }

        container.innerHTML = '';
        container.appendChild(frag);
      }
    }
  });
})();
