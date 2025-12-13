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
    settingsLabelSelects: 'restaurant.settings.labelSelects',
    settingsTitleSelects: 'restaurant.settings.titleSelects',
    settingsResetOnDeselect: 'restaurant.settings.resetOnDeselect',
    settingsResetDisables: 'restaurant.settings.resetDisables',
      settingsResetKeepOpen: 'restaurant.settings.resetKeepOpen',
      settingsAutoDisableEmpty: 'restaurant.settings.autoDisableEmpty',
      settingsAutoDisableSection: 'restaurant.settings.autoDisableSection',
      settingsQtyRight: 'restaurant.settings.qtyRight',
      settingsPillArrowOnly: 'restaurant.settings.pillArrowOnly'
    };

  // Section: Utility helpers
  const docEl = document.documentElement;

  function $(sel, ctx = document) { return ctx.querySelector(sel); }
  function $all(sel, ctx = document) { return Array.from((ctx || document).querySelectorAll(sel)); }

  function safeParseJSON(v, fallback) {
    try { return JSON.parse(v); } catch { return fallback; }
  }

  // Section: Persisted settings variables (defaults set further down)
  let labelSelects = true;
  let titleSelects = true;
  // Track which theme family is active; default to restaurant styling
  let currentThemeChoice = 'restaurant';

  // Section: Data helpers
  function saveIngredientsToStorage(data) {
    try {
      localStorage.setItem(STORAGE_KEYS.ingredients, JSON.stringify(data || {}));
    } catch { /* ignore */ }
  }

  function loadIngredientsFromStorage() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.ingredients) || '{}');
    } catch { return {}; }
  }

  // Section: DOM utilities
  function findParentSection(el) {
    if (!el) return null;
    return el.closest('.section');
  }

  // Section: Builder helpers
  function updateIngredientInputsFromData(data) {
    if (!data) data = {};
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
    const target = document.getElementById(hash);
    if (!target) return;
    // Bring the section into view and focus its heading when possible
    const summary = target.querySelector('.menu-summary');
    if (summary) summary.focus({ preventScroll: false });
    else target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // Section: Page Initialization
  document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    const mobileQuery = window.matchMedia('(max-width: 768px)');
    const isMobileView = () => mobileQuery.matches;

    const orderTypeChips = Array.from(document.querySelectorAll('.order-type-chip'));

    const settingsOverlay = document.getElementById('settings-overlay');
    const settingsBtn = document.getElementById('settings-btn') || document.querySelector('.settings-button');
    const settingsCloseBtn = document.getElementById('settings-close') || document.querySelector('.settings-close');
    const settingLabelSelects = document.getElementById('setting-label-selects') || document.querySelector('.setting-label-selects');
    const settingTitleSelects = document.getElementById('setting-title-selects') || document.querySelector('.setting-title-selects');
    const settingResetOnDeselect = document.getElementById('setting-reset-on-deselect') || document.querySelector('.setting-reset-on-deselect');
    const settingResetDisables = document.getElementById('setting-reset-disables') || document.querySelector('.setting-reset-disables');
    const settingResetKeepOpen = document.getElementById('setting-reset-keep-open') || document.querySelector('.setting-reset-keep-open');
    const settingAutoDisableEmpty = document.getElementById('setting-auto-disable-empty') || document.querySelector('.setting-auto-disable-empty');
    const settingAutoDisableSection = document.getElementById('setting-auto-disable-section') || document.querySelector('.setting-auto-disable-section');
    const settingQtyRight = document.getElementById('setting-qty-right') || document.querySelector('.setting-qty-right');
    const settingPillArrowOnly = document.getElementById('setting-pill-arrow-only') || document.querySelector('.setting-pill-arrow-only');
    const settingsResetBtn = document.getElementById('settings-reset') || document.querySelector('.settings-reset');

    const navToggleBtn = document.getElementById('nav-toggle-btn') || document.querySelector('.nav-toggle');
    const themeModeBtns = Array.from(document.querySelectorAll('.theme-mode-btn, .theme-mode-toggle'));

    const updateNavOffset = () => {
      const nav = document.querySelector('.left-rail');
      if (!nav) return;
      const h = nav.offsetHeight || 0;
      document.documentElement.style.setProperty('--nav-offset', `${h}px`);
    };
    window.addEventListener('resize', updateNavOffset);

    // Lock Page 2/3 navigation until prerequisites are met
    function hasOrderTypeSelected() {
      try { return !!localStorage.getItem(STORAGE_KEYS.orderType); } catch { return false; }
    }
    function hasMenuSelection() {
      // Align with builder rules: at least one section active; if Sauces active, at least one sauce
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
        const n = localStorage.getItem(STORAGE_KEYS.deliveryName) || '';
        const ph = localStorage.getItem(STORAGE_KEYS.deliveryPhone) || '';
        const a = localStorage.getItem(STORAGE_KEYS.deliveryAddress) || '';
        const z = localStorage.getItem(STORAGE_KEYS.deliveryZip) || '';
        return !!(n && ph && a && z);
      } catch { return false; }
    }

    const updatePage3NavState = () => {
      const anchors = Array.from(document.querySelectorAll('.nav a[href="#page3"]'));
      anchors.forEach((a) => {
        const okType = hasOrderTypeSelected();
        const okMenu = hasMenuSelection();
        const typeNow = localStorage.getItem(STORAGE_KEYS.orderType) || '';
        if (okType && okMenu && (typeNow !== 'delivery' || hasValidDeliveryDetails())) {
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

    let navInitialEnabled = isMobileView();
    if (!navInitialEnabled) {
      try {
        navInitialEnabled = localStorage.getItem(STORAGE_KEYS.navEnabled) === 'true';
      } catch { navInitialEnabled = false; }
    }

    const setNavEnabled = (enabled) => {
      body.classList.toggle('nav-enabled', !!enabled);
      try { localStorage.setItem(STORAGE_KEYS.navEnabled, String(!!enabled)); } catch { }
      updateNavToggleLabel();
    };

    const updateThemeModeLabel = () => {
      if (!themeModeBtns.length) return;
      const isDark = body.classList.contains('theme-dark');
      const mobile = isMobileView();
      const label = isDark ? 'Switch to light mode' : 'Switch to dark mode';
      themeModeBtns.forEach((btn) => {
        btn.textContent = mobile ? (isDark ? '☀️' : '🌙') : (isDark ? 'Light Mode' : 'Dark Mode');
        btn.setAttribute('aria-label', label);
      });
    };

    const updateNavToggleLabel = () => {
      if (!navToggleBtn) return;
      const navEnabled = body.classList.contains('nav-enabled');
      navToggleBtn.textContent = navEnabled ? 'Disable Navigation' : 'Enable Navigation';
    };

    // Go Back button (pages 2/3)
    const backBtn = document.querySelector('.go-back');
    if (backBtn) {
      body.classList.add('has-go-back');
      backBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (body.classList.contains('page3')) {
          window.location.href = 'page2.html';
        } else {
          window.location.href = 'index.html';
        }
      });
    }

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
      if (!skipSave) persistThemeState();
    };

    const restoreThemeFromStorage = () => {
      let saved = 'restaurant-light';
      try {
        saved = localStorage.getItem(STORAGE_KEYS.theme) || saved;
      } catch { /* ignore */ }
      const isBoxify = String(saved || '').startsWith('boxify');
      const isDark = String(saved || '').includes('dark');
      applyThemeChoice(isBoxify ? 'boxify' : 'restaurant', { skipSave: true });
      body.classList.toggle('theme-dark', isDark);
      updateThemeModeLabel();
    };

    // Load settings from storage
    try {
      const v = localStorage.getItem(STORAGE_KEYS.settingsLabelSelects);
      labelSelects = v === null ? true : v === 'true';
    } catch { labelSelects = true; }
    if (settingLabelSelects) settingLabelSelects.checked = labelSelects;

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

    // Auto-disable section when only required items remain: default OFF
    let autoDisableEmpty = false;
    try {
      const v = localStorage.getItem(STORAGE_KEYS.settingsAutoDisableEmpty);
      autoDisableEmpty = v === 'true';
    } catch { autoDisableEmpty = false; }
    if (settingAutoDisableEmpty) settingAutoDisableEmpty.checked = autoDisableEmpty;

    // Auto-disable section toggle: default OFF
    let autoDisableSection = false;
    try {
      const v = localStorage.getItem(STORAGE_KEYS.settingsAutoDisableSection);
      autoDisableSection = v === 'true';
    } catch { autoDisableSection = false; }
    if (settingAutoDisableSection) settingAutoDisableSection.checked = autoDisableSection;

    // Keep section open after reset: default ON
    let resetKeepOpen = true;
    try {
      const v = localStorage.getItem(STORAGE_KEYS.settingsResetKeepOpen);
      resetKeepOpen = v === null ? true : v === 'true';
    } catch { resetKeepOpen = true; }
    if (settingResetKeepOpen) settingResetKeepOpen.checked = resetKeepOpen;

    // Quantity dropdown placement: default BEFORE label (setting unchecked)
    let qtyRight = false;
    try {
      const v = localStorage.getItem(STORAGE_KEYS.settingsQtyRight);
      qtyRight = v === null ? false : v === 'true';
    } catch { qtyRight = false; }
    if (settingQtyRight) settingQtyRight.checked = qtyRight;

    // Menu pills: default allow clicking anywhere on the pill
    let pillArrowOnly = false;
    try {
      const v = localStorage.getItem(STORAGE_KEYS.settingsPillArrowOnly);
      pillArrowOnly = v === null ? false : v === 'true';
    } catch { pillArrowOnly = false; }
    if (settingPillArrowOnly) settingPillArrowOnly.checked = pillArrowOnly;

    // Ensure the settings overlay has a deterministic initial hidden state.
    // If you want the settings to persist open between reloads, implement a storage key.
    if (settingsOverlay) {
      // If the DOM has the overlay visible by default, force it closed on load.
      // This avoids the "starts open and won't close" issue.
      settingsOverlay.hidden = true;
      settingsOverlay.setAttribute('aria-hidden', 'true');
      body.classList.remove('settings-open');
      if (settingsBtn) settingsBtn.setAttribute('aria-expanded', 'false');
    }

    // Apply initial nav and theme state from storage
    setNavEnabled(navInitialEnabled);
    restoreThemeFromStorage();

    const closeSettings = () => {
      if (!settingsOverlay) return;
      settingsOverlay.hidden = true;
      settingsOverlay.setAttribute('aria-hidden', 'true');
      body.classList.remove('settings-open');
      if (settingsBtn) settingsBtn.setAttribute('aria-expanded', 'false');
    };

    const openSettings = () => {
      if (!settingsOverlay) return;
      settingsOverlay.hidden = false;
      settingsOverlay.setAttribute('aria-hidden', 'false');
      body.classList.add('settings-open');
      if (settingsBtn) settingsBtn.setAttribute('aria-expanded', 'true');
      // Focus first focusable control for keyboard users if present
      const first = settingsOverlay.querySelector('input, button, [tabindex]:not([tabindex="-1"])');
      if (first && typeof first.focus === 'function') first.focus();
    };

    if (settingsResetBtn) {
      settingsResetBtn.addEventListener('click', () => {
        // Defaults: all ON
        labelSelects = true;
        titleSelects = true;
        // Defaults: reset-related toggles OFF (except keep-open ON)
        resetOnDeselect = false;
        resetDisables = false;
        resetKeepOpen = true;
        autoDisableEmpty = false;
        autoDisableSection = false;
        // Default: quantity dropdowns before the label
        qtyRight = false;
        // Default: menu pills open/close via the whole pill
        pillArrowOnly = false;
        try {
          localStorage.setItem(STORAGE_KEYS.settingsLabelSelects, 'true');
          localStorage.setItem(STORAGE_KEYS.settingsTitleSelects, 'true');
          localStorage.setItem(STORAGE_KEYS.settingsResetOnDeselect, 'false');
          localStorage.setItem(STORAGE_KEYS.settingsResetDisables, 'false');
          localStorage.setItem(STORAGE_KEYS.settingsResetKeepOpen, 'true');
          localStorage.setItem(STORAGE_KEYS.settingsAutoDisableEmpty, 'false');
          localStorage.setItem(STORAGE_KEYS.settingsAutoDisableSection, 'false');
          localStorage.setItem(STORAGE_KEYS.settingsQtyRight, 'false');
          localStorage.setItem(STORAGE_KEYS.settingsPillArrowOnly, 'false');
        } catch { }
        if (settingLabelSelects) settingLabelSelects.checked = true;
        if (settingTitleSelects) settingTitleSelects.checked = true;
        if (settingResetOnDeselect) settingResetOnDeselect.checked = false;
        if (settingResetDisables) settingResetDisables.checked = false;
        if (settingResetKeepOpen) settingResetKeepOpen.checked = true;
        if (settingAutoDisableEmpty) settingAutoDisableEmpty.checked = false;
        if (settingAutoDisableSection) settingAutoDisableSection.checked = false;
        if (settingQtyRight) settingQtyRight.checked = false;
        if (settingPillArrowOnly) settingPillArrowOnly.checked = false;
      });
    }

    const syncMobileUiState = () => {
      const mobile = isMobileView();
      body.classList.toggle('mobile-ui', mobile);
      if (mobile) {
        body.classList.add('mobile-ui');
      } else {
        body.classList.remove('mobile-ui');
      }
      updateThemeModeLabel();
      updateNavToggleLabel();
    };

    // Delegate clicks on ingredient labels to toggle their checkbox when enabled.
    document.addEventListener('click', (e) => {
      if (!labelSelects) return;
      const tag = (e.target.tagName || '').toLowerCase();
      // Don't treat clicks on interactive controls as label toggles
      if (['select', 'option', 'button', 'textarea'].includes(tag)) return;
      if (tag === 'input' && e.target.type && e.target.type !== 'checkbox') return;
      const lbl = e.target.closest && e.target.closest('label');
      if (!lbl) return;
      const cb = lbl.querySelector('input[type="checkbox"][name]');
      if (!cb || cb.disabled) return;
      if (cb.dataset && cb.dataset.required === 'true') return;
      if (e.target !== cb) {
        cb.checked = !cb.checked;
        cb.dispatchEvent(new Event('change', { bubbles: true }));
        e.preventDefault();
      }
    });

    // Example: order flow specific initialization
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
          setOrderType(type);
          setActive(card);
        });
      });

      function setOrderType(type) {
        try { localStorage.setItem(STORAGE_KEYS.orderType, type); } catch { }
        updatePage3NavState();
      }

      function getOrderType() {
        try { return localStorage.getItem(STORAGE_KEYS.orderType) || ''; } catch { return ''; }
      }

      // Attach handlers for toggles on section title spans
      const sectionTitles = document.querySelectorAll('.section .section-title');
      sectionTitles.forEach((span) => {
        span.addEventListener('click', (e) => {
          if (!titleSelects) return;
          const t = span.querySelector('.section-toggle');
          if (t) {
            t.checked = !t.checked;
            t.dispatchEvent(new Event('change', { bubbles: true }));
          }
        });
      });

      // Live update builder error on any relevant change
      const updateBuilderError = () => {
        const err = document.getElementById('builder-error');
        if (!err) return;
        const togglesArr = Array.from(document.querySelectorAll('.section-toggle'));
        const active = togglesArr.some(t => t.checked);
        if (!active) {
          err.hidden = false;
          err.textContent = 'Please choose at least one section from the menu';
        } else {
          // If sauces section is active, ensure at least one sauce selected
          const saucesToggle = document.querySelector('.section[data-id="sauces"] .section-toggle');
          if (saucesToggle && saucesToggle.checked) {
            const ing = loadIngredientsFromStorage();
            const sauces = Array.isArray(ing['sauces_ingredients[]']) ? ing['sauces_ingredients[]'] : [];
            if (!sauces.length) {
              err.hidden = false;
              err.textContent = 'Please select at least one sauce';
              return;
            }
          }
          err.hidden = true;
          err.textContent = '';
        }
      };

      // Example of hooking checkbox changes to persist state
      const ingredientCheckboxes = document.querySelectorAll('input[type="checkbox"][name]');
      ingredientCheckboxes.forEach((cb) => {
        cb.addEventListener('change', () => {
          // Gather selections
          const data = {};
          const all = document.querySelectorAll('input[type="checkbox"][name]');
          all.forEach((i) => {
            const nm = i.getAttribute('name');
            data[nm] = data[nm] || [];
            if (i.checked) data[nm].push(i.value);
          });
          saveIngredientsToStorage(data);
          updateBuilderError();
          updatePage3NavState();
        });
      });

      // initialize builder error state
      updateBuilderError();
    }

    // Page 2: menu overlays + pills
    if (body.classList.contains('page2')) {
      const overlays = Array.from(document.querySelectorAll('.menu-overlay[data-section]'));
      const menuLaunchButtons = Array.from(document.querySelectorAll('.menu-launch[data-target]'));
      const sectionToggles = Array.from(document.querySelectorAll('.section-toggle[data-section]'));
      const sectionTitles = Array.from(document.querySelectorAll('.menu-summary span'));
      const ingredientCheckboxes = Array.from(document.querySelectorAll('input[type="checkbox"][name]'));
      const builderError = document.getElementById('builder-error');
      const disabledSections = new Set(['sauces']);
      const requiredCheckboxes = Array.from(document.querySelectorAll('input[type="checkbox"][data-required="true"]'));
      const requiredBySection = {};

      const saveAllIngredientSelections = () => {
        const data = {};
        document.querySelectorAll('input[type="checkbox"][name]').forEach((i) => {
          const nm = i.getAttribute('name');
          data[nm] = data[nm] || [];
          if (i.checked) data[nm].push(i.value);
        });
        saveIngredientsToStorage(data);
      };

      // Associate required checkboxes with their section and ensure they start checked
      requiredCheckboxes.forEach((cb) => {
        const sectionEl = cb.closest('.menu-overlay');
        const sectionId = (sectionEl && sectionEl.dataset.section) || (cb.closest('.menu-section') && cb.closest('.menu-section').id);
        if (sectionId) {
          requiredBySection[sectionId] = requiredBySection[sectionId] || [];
          requiredBySection[sectionId].push(cb);
        }
        cb.checked = true;
        // Keep required items checked even if clicked directly
        cb.addEventListener('change', () => {
          if (!cb.checked) cb.checked = true;
        });
      });

      // Restore active sections from storage (guard against null/undefined)
      const savedSectionsRaw = localStorage.getItem(STORAGE_KEYS.activeSections);
      const savedSections = safeParseJSON(savedSectionsRaw, {});
      sectionToggles.forEach((toggle) => {
        const sec = toggle.dataset.section;
        if (!sec) return;
        const isDisabled = disabledSections.has(sec);
        if (isDisabled) {
          toggle.checked = false;
          toggle.disabled = true;
          toggle.setAttribute('aria-disabled', 'true');
          return;
        }
        if (savedSections && savedSections[sec]) toggle.checked = true;
      });

      const syncRequiredCheckboxes = () => {
        sectionToggles.forEach((toggle) => {
          const sec = toggle.dataset.section;
          if (!sec) return;
          const reqList = requiredBySection[sec] || [];
          const isActive = !!toggle.checked && !toggle.disabled;
          reqList.forEach((cb) => {
            cb.checked = true;
            cb.disabled = !isActive;
            const lbl = cb.closest('label');
            if (lbl) {
              lbl.classList.toggle('required-disabled', !isActive);
              const extras = Array.from(lbl.querySelectorAll('select, input:not([type=\"checkbox\"])'));
              extras.forEach((el) => { el.disabled = !isActive; });
            }
          });
        });
      };

      const ensureSectionEnabledForCheckbox = (cb) => {
        if (!cb) return;
        const sectionEl = cb.closest('.menu-section');
        const secId = sectionEl && sectionEl.id;
        if (!secId) return;
        const toggle = document.querySelector(`.section-toggle[data-section="${secId}"]`);
        if (!toggle || toggle.disabled) return;
        if (!toggle.checked) {
          toggle.checked = true;
          toggle.dispatchEvent(new Event('change', { bubbles: true }));
        }
        // After enabling section, allow the checkbox to be toggled
        cb.disabled = false;
      };

      const ensureSectionActiveForCheckbox = (cb) => {
        if (!cb) return;
        const sectionEl = cb.closest('.menu-section');
        const secId = sectionEl && sectionEl.id;
        if (!secId) return;
        const toggle = document.querySelector(`.section-toggle[data-section="${secId}"]`);
        if (!toggle || toggle.disabled) return;
        if (!toggle.checked) {
          toggle.checked = true;
          toggle.dispatchEvent(new Event('change', { bubbles: true }));
        }
      };

      // Track when an auto-disable is driving the section toggle change
      let autoDisableTrigger = '';
      const unlockManualDisable = (sec) => {
        if (!sec) return;
        const toggle = document.querySelector(`.section-toggle[data-section="${sec}"]`);
        if (toggle && toggle.disabled && toggle.dataset && toggle.dataset.manualDisabled === 'true') {
          toggle.disabled = false;
          toggle.removeAttribute('aria-disabled');
          delete toggle.dataset.manualDisabled;
        }
      };

      const autoDisableIfEmpty = (secId) => {
        if (!autoDisableEmpty) return;
        if (!secId || disabledSections.has(secId)) return;
        const toggle = document.querySelector(`.section-toggle[data-section="${secId}"]`);
        if (!toggle || toggle.disabled) return;
        const sectionEl = document.getElementById(secId);
        if (!sectionEl) return;
        const inputs = Array.from(sectionEl.querySelectorAll('input[type="checkbox"][name]'));
        const anyOptionalChecked = inputs.some((input) => input.checked && input.dataset.required !== 'true');
        const hasOptionals = inputs.some((input) => input.dataset.required !== 'true');
        if (!anyOptionalChecked && hasOptionals) {
          autoDisableTrigger = secId;
          try {
            toggle.checked = false;
            toggle.dispatchEvent(new Event('change', { bubbles: true }));
          } finally {
            autoDisableTrigger = '';
          }
          // Close the overlay when auto-disabling due to no optional ingredients.
          closeOverlay(secId);
        }
      };

      const resetGroupByName = (group) => {
        if (!group) return;
        const inputs = Array.from(document.querySelectorAll(`input[type="checkbox"][name="${group}"]`));
        if (!inputs.length) return;
        inputs.forEach((cb) => {
          const isRequired = cb.dataset.required === 'true';
          cb.checked = isRequired;
          const lbl = cb.closest('label');
          const qty = lbl && lbl.querySelector('select.ingredient-qty');
          if (qty) {
            qty.disabled = !cb.checked;
            if (!cb.checked && qty.options.length) qty.value = qty.options[0].value;
          }
          cb.dispatchEvent(new Event('change', { bubbles: true }));
        });
        saveAllIngredientSelections();
        syncRequiredCheckboxes();
        updateBuilderError();
        updatePage3NavState();

        if (resetDisables) {
          let section = '';
          if (group.startsWith('pizza_')) section = 'pizza';
          else if (group.startsWith('burger_')) section = 'burger';
          else if (group.startsWith('sauces_')) section = 'sauces';
          else if (group.startsWith('sub_')) section = 'sub';
          if (section) {
            const toggle = document.querySelector(`.section-toggle[data-section="${section}"]`);
            if (toggle && toggle.checked) {
              toggle.checked = false;
              toggle.dispatchEvent(new Event('change', { bubbles: true }));
            }
            try {
              const act = safeParseJSON(localStorage.getItem(STORAGE_KEYS.activeSections), {});
              act[section] = false;
              localStorage.setItem(STORAGE_KEYS.activeSections, JSON.stringify(act));
            } catch { /* ignore */ }
          }
          if (!resetKeepOpen) {
            closeOverlay(section);
          }
        }
      };

      // Restore saved ingredient selections
      updateIngredientInputsFromData(loadIngredientsFromStorage());
      syncRequiredCheckboxes();

      // Build lookup for pills by section
      const menuLaunchLookup = {};
      menuLaunchButtons.forEach((btn) => {
        const target = btn.dataset.target;
        if (!target) return;
        if (disabledSections.has(target)) {
          btn.disabled = true;
          btn.setAttribute('aria-disabled', 'true');
        }
        menuLaunchLookup[target] = menuLaunchLookup[target] || [];
        menuLaunchLookup[target].push(btn);
        btn.setAttribute('aria-expanded', 'false');
      });

      const updateArrowState = (section, isOpen) => {
        const btns = menuLaunchLookup[section] || [];
        btns.forEach((btn) => {
          const arrow = btn.querySelector('.menu-launch-arrow');
          if (arrow) arrow.textContent = isOpen ? '▴' : '▸';
          btn.setAttribute('aria-expanded', String(!!isOpen));
        });
      };

      const ensureMenuLaunchArrow = (btn) => {
        let arrow = btn.querySelector('.menu-launch-arrow');
        if (!arrow) {
          arrow = document.createElement('span');
          arrow.className = 'menu-launch-arrow';
          arrow.setAttribute('aria-hidden', 'true');
          arrow.textContent = '▸';
          btn.appendChild(arrow);
        }
        return arrow;
      };

      const anyOverlayOpen = () => overlays.some((o) => !o.hidden);
      const getOverlay = (section) => overlays.find((o) => o.dataset.section === section) || null;

      const closeAllOverlays = () => {
        overlays.forEach((o) => {
          o.hidden = true;
          o.setAttribute('aria-hidden', 'true');
          updateArrowState(o.dataset.section, false);
        });
        body.classList.remove('menu-overlay-open');
      };

      const closeOverlay = (overlayOrSection) => {
        const overlay = typeof overlayOrSection === 'string' ? getOverlay(overlayOrSection) : overlayOrSection;
        if (!overlay) return;
        overlay.hidden = true;
        overlay.setAttribute('aria-hidden', 'true');
        updateArrowState(overlay.dataset.section, false);
        if (!anyOverlayOpen()) body.classList.remove('menu-overlay-open');
      };

      const openOverlay = (section) => {
        if (disabledSections.has(section)) return;
        const overlay = getOverlay(section);
        if (!overlay) return;
        closeAllOverlays();
        overlay.hidden = false;
        overlay.setAttribute('aria-hidden', 'false');
        updateArrowState(section, true);
        body.classList.add('menu-overlay-open');
        const focusable = overlay.querySelector('input, button, select, [tabindex]:not([tabindex="-1"])');
        if (focusable && focusable.focus) focusable.focus({ preventScroll: true });
      };

      const toggleOverlay = (section) => {
        if (disabledSections.has(section)) return;
        const overlay = getOverlay(section);
        if (!overlay) return;
        if (overlay.hidden) openOverlay(section);
        else closeOverlay(overlay);
      };

      const persistActiveSections = () => {
        const active = {};
        sectionToggles.forEach((t) => {
          const sec = t.dataset.section;
          const isActive = !!t.checked;
          if (sec) active[sec] = isActive;
          if (sec && menuLaunchLookup[sec]) {
            menuLaunchLookup[sec].forEach((btn) => btn.classList.toggle('menu-launch-active', isActive));
          }
        });
        try { localStorage.setItem(STORAGE_KEYS.activeSections, JSON.stringify(active)); } catch { }
        syncRequiredCheckboxes();
      };

      const updateBuilderError = () => {
        if (!builderError) return;
        const anyActive = sectionToggles.some((t) => t.checked);
        if (!anyActive) {
          builderError.hidden = false;
          builderError.textContent = 'Please choose at least one section from the menu';
          return;
        }
        const saucesToggle = sectionToggles.find((t) => t.dataset.section === 'sauces');
        if (saucesToggle && saucesToggle.checked) {
          const ing = loadIngredientsFromStorage();
          const sauces = Array.isArray(ing['sauces_ingredients[]']) ? ing['sauces_ingredients[]'] : [];
          if (!sauces.length) {
            builderError.hidden = false;
            builderError.textContent = 'Please select at least one sauce';
            return;
          }
        }
        builderError.hidden = true;
        builderError.textContent = '';
      };

      // Attach pill/arrow handlers
      menuLaunchButtons.forEach((btn) => {
        const target = btn.dataset.target;
        if (!target) return;
        const arrow = ensureMenuLaunchArrow(btn);
        const isArrowTarget = (el) => arrow && (el === arrow || arrow.contains(el));
        const guardNonArrow = (evt) => {
          if (!pillArrowOnly) return false;
          if (isArrowTarget(evt.target)) return false;
          evt.preventDefault();
          evt.stopImmediatePropagation();
          return true;
        };
        ['pointerdown', 'mousedown', 'touchstart'].forEach((evtName) => {
          btn.addEventListener(evtName, (evt) => { guardNonArrow(evt); }, true);
        });

        btn.addEventListener('click', (evt) => {
          // If this section was manually disabled, unlock it so it can be re-enabled.
          unlockManualDisable(target);
          if (guardNonArrow(evt)) return;
          toggleOverlay(target);
        });
        if (arrow) {
          arrow.addEventListener('click', (evt) => {
            evt.stopPropagation();
            unlockManualDisable(target);
            toggleOverlay(target);
          });
        }
      });

      overlays.forEach((overlay) => {
        overlay.setAttribute('aria-hidden', overlay.hidden ? 'true' : 'false');
        overlay.addEventListener('click', (e) => {
          if (e.target === overlay) closeOverlay(overlay);
        });
        const closeBtn = overlay.querySelector('.close-overlay');
        if (closeBtn) closeBtn.addEventListener('click', () => closeOverlay(overlay));
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          closeAllOverlays();
        }
      });

      // Persist ingredient selections
      ingredientCheckboxes.forEach((cb) => {
        cb.addEventListener('change', () => {
          if (cb.checked) {
            ensureSectionActiveForCheckbox(cb);
          }
          const secEl = cb.closest('.menu-section');
          if (secEl && secEl.id) {
            autoDisableIfEmpty(secEl.id);
          }
          saveAllIngredientSelections();
          updateBuilderError();
          updatePage3NavState();
        });
      });

      // If a disabled ingredient is clicked, enable its section toggle first, then check it
      const tryActivateDisabledCheckbox = (evt) => {
        // Handle when the target is a disabled checkbox or within its label
        let cb = null;
        if (evt.target && evt.target.matches && evt.target.matches('input[type="checkbox"][name]')) {
          cb = evt.target;
        } else {
          const lbl = evt.target.closest && evt.target.closest('label');
          if (lbl) cb = lbl.querySelector('input[type="checkbox"][name]');
        }
        if (!cb || !cb.disabled) return;
        ensureSectionEnabledForCheckbox(cb);
        ensureSectionActiveForCheckbox(cb);
        if (cb.disabled) return;
        cb.checked = true;
        cb.dispatchEvent(new Event('change', { bubbles: true }));
        evt.preventDefault();
        evt.stopPropagation();
      };
      // Capture early so the browser doesn't swallow the click on a disabled input
      document.addEventListener('pointerdown', tryActivateDisabledCheckbox, true);
      document.addEventListener('click', tryActivateDisabledCheckbox, true);

      // Hook up individual reset buttons
      document.querySelectorAll('.reset-group[data-group]').forEach((btn) => {
        btn.addEventListener('click', () => resetGroupByName(btn.getAttribute('data-group')));
      });

      // Allow clicking section titles to toggle the section checkbox (when enabled)
      sectionTitles.forEach((title) => {
        title.tabIndex = 0;
        title.addEventListener('click', () => {
          if (!titleSelects) return;
          const toggle = title.closest('.menu-summary')?.querySelector('.section-toggle');
          if (!toggle || toggle.disabled) return;
          toggle.checked = !toggle.checked;
          toggle.dispatchEvent(new Event('change', { bubbles: true }));
        });
        title.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            title.click();
          }
        });
      });

      // Persist active section toggles
      sectionToggles.forEach((t) => {
        t.addEventListener('change', () => {
          const sec = t.dataset.section;
          const isAuto = autoDisableTrigger && sec === autoDisableTrigger;
          // If the user manually disables the section and the setting is on, lock it and close its overlay.
          if (!t.checked && !isAuto && autoDisableSection) {
            t.disabled = true;
            t.setAttribute('aria-disabled', 'true');
            t.dataset.manualDisabled = 'true';
            if (sec) closeOverlay(sec);
          }
          // Clear manual disable if re-enabled later.
          if (t.checked && t.disabled) {
            t.disabled = false;
            t.removeAttribute('aria-disabled');
            delete t.dataset.manualDisabled;
          }
          persistActiveSections();
          updateBuilderError();
          updatePage3NavState();
        });
      });

      // Initial sync
      persistActiveSections();
      updateBuilderError();
      updatePage3NavState();
    }

    // Settings change listeners
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
    if (settingAutoDisableEmpty) {
      settingAutoDisableEmpty.addEventListener('change', () => {
        autoDisableEmpty = !!settingAutoDisableEmpty.checked;
        try { localStorage.setItem(STORAGE_KEYS.settingsAutoDisableEmpty, String(autoDisableEmpty)); } catch { }
      });
    }
    if (settingAutoDisableSection) {
      settingAutoDisableSection.addEventListener('change', () => {
        autoDisableSection = !!settingAutoDisableSection.checked;
        try { localStorage.setItem(STORAGE_KEYS.settingsAutoDisableSection, String(autoDisableSection)); } catch { }
      });
    }
    if (settingResetKeepOpen) {
      settingResetKeepOpen.addEventListener('change', () => {
        resetKeepOpen = !!settingResetKeepOpen.checked;
        try { localStorage.setItem(STORAGE_KEYS.settingsResetKeepOpen, String(resetKeepOpen)); } catch { }
      });
    }
    if (settingQtyRight) {
      settingQtyRight.addEventListener('change', () => {
        qtyRight = !!settingQtyRight.checked;
        try { localStorage.setItem(STORAGE_KEYS.settingsQtyRight, String(qtyRight)); } catch { }
      });
    }
    if (settingPillArrowOnly) {
      settingPillArrowOnly.addEventListener('change', () => {
        pillArrowOnly = !!settingPillArrowOnly.checked;
        try { localStorage.setItem(STORAGE_KEYS.settingsPillArrowOnly, String(pillArrowOnly)); } catch { }
      });
    }

    // Settings open/close
    if (settingsBtn) {
      settingsBtn.addEventListener('click', (e) => {
        // Toggle visibility instead of always forcing open
        if (!settingsOverlay) return;
        if (settingsOverlay.hidden) openSettings();
        else closeSettings();
      });
    }
    if (navToggleBtn) {
      navToggleBtn.addEventListener('click', () => {
        setNavEnabled(!body.classList.contains('nav-enabled'));
      });
    }
    if (themeModeBtns.length) {
      themeModeBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
          body.classList.toggle('theme-dark');
          persistThemeState();
          updateThemeModeLabel();
        });
      });
    }
    if (settingsCloseBtn) {
      settingsCloseBtn.addEventListener('click', closeSettings);
    }

    // Allow backdrop click to close settings (clicking the overlay but not the content)
    if (settingsOverlay) {
      settingsOverlay.addEventListener('click', (e) => {
        if (e.target === settingsOverlay) {
          closeSettings();
        }
      });
    }

    // Close on ESC for convenience
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' || e.key === 'Esc') {
        closeSettings();
      }
    });

    // initial sync
    syncMobileUiState();
    updateNavOffset();
    updateThemeModeLabel();
    updateNavToggleLabel();
    updatePage3NavState();

    // Re-open section if hash present
    openSectionFromHash();

    // Keep theme label in sync on viewport changes (for emoji on small screens)
    if (mobileQuery && typeof mobileQuery.addEventListener === 'function') {
      mobileQuery.addEventListener('change', updateThemeModeLabel);
    }
  });

  // small helper to stop nav click when disabled
  function preventNavClick(e) {
    e.preventDefault();
    e.stopImmediatePropagation();
  }

  // Expose to window for debugging
  window.__restaurant = {
    STORAGE_KEYS,
    toggleLabelSelects: (v) => { labelSelects = !!v; try { localStorage.setItem(STORAGE_KEYS.settingsLabelSelects, String(labelSelects)); } catch { } },
    toggleTitleSelects: (v) => { titleSelects = !!v; try { localStorage.setItem(STORAGE_KEYS.settingsTitleSelects, String(titleSelects)); } catch { } }
  };

})();
