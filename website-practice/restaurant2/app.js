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
    deliverySuite: 'restaurant.delivery.suite',
    deliveryType: 'restaurant.delivery.type',
    deliveryCity: 'restaurant.delivery.city',
    deliveryZip: 'restaurant.delivery.zip',
    activeSections: 'restaurant.activeSections',
    navEnabled: 'restaurant.nav.enabled',
    settingsLabelSelects: 'restaurant.settings.labelSelects',
    settingsTitleSelects: 'restaurant.settings.titleSelects',
    settingsResetDisables: 'restaurant.settings.resetDisables',
    settingsResetKeepOpen: 'restaurant.settings.resetKeepOpen',
    settingsAutoDisableEmpty: 'restaurant.settings.autoDisableEmpty',
    settingsAutoDisableSection: 'restaurant.settings.autoDisableSection',
    settingsPillArrowOnly: 'restaurant.settings.pillArrowOnly',
    quantities: 'restaurant.quantities'
  };

  // Pretty labels for summary display (keyed by `${name}|${value}`)
  const INGREDIENT_LABELS = {
    'pizza_ingredients[]|bacon': 'Bacon',
    'pizza_ingredients[]|cheese': 'Cheese',
    'pizza_ingredients[]|jalapenos': 'Jalapeños',
    'pizza_ingredients[]|lettuce': 'Lettuce',
    'pizza_ingredients[]|mushrooms': 'Mushrooms',
    'pizza_ingredients[]|olives': 'Olives',
    'pizza_ingredients[]|onion': 'Onion',
    'pizza_ingredients[]|pickles': 'Pickles',
    'pizza_ingredients[]|pineapple': 'Pineapples',
    'pizza_ingredients[]|tomatoes': 'Tomatoes',
    'pizza_ingredients[]|tomato_sauce': 'Tomato Sauce (Required)',
    'pizza_ingredients[]|well_done': 'Well-done',

    'burger_ingredients[]|bacon': 'Bacon',
    'burger_ingredients[]|bun': 'Bun (Required)',
    'burger_ingredients[]|cheese': 'Cheese',
    'burger_ingredients[]|jalapenos': 'Jalapeños',
    'burger_ingredients[]|lettuce': 'Lettuce',
    'burger_ingredients[]|mushrooms': 'Mushrooms',
    'burger_ingredients[]|olives': 'Olives',
    'burger_ingredients[]|onion': 'Onion',
    'burger_ingredients[]|patty': 'Patty (Required)',
    'burger_ingredients[]|pickles': 'Pickles',
    'burger_ingredients[]|tomatoes': 'Tomatoes',
    'burger_ingredients[]|well_done': 'Well-done',
    'burger_ingredients[]|medium_well': 'Medium-well',
    'burger_ingredients[]|rare': 'Rare',
    'burger_ingredients[]|tomato_sauce': 'Sauce',

    'sub_ingredients[]|bacon': 'Bacon',
    'sub_ingredients[]|cheese': 'Cheese',
    'sub_ingredients[]|jalapenos': 'Jalapeños',
    'sub_ingredients[]|lettuce': 'Lettuce',
    'sub_ingredients[]|mushrooms': 'Mushrooms',
    'sub_ingredients[]|olives': 'Olives',
    'sub_ingredients[]|onion': 'Onion',
    'sub_ingredients[]|ham': 'Ham',
    'sub_ingredients[]|turkey': 'Turkey',
    'sub_ingredients[]|pepperoni': 'Pepperoni',
    'sub_ingredients[]|pickles': 'Pickles',
    'sub_ingredients[]|tomatoes': 'Tomatoes',
    'sub_ingredients[]|toasted': 'Toasted',
    'sub_ingredients[]|white': 'Bread: White',
    'sub_ingredients[]|wheat': 'Bread: Wheat',

    'sauces_ingredients[]|bbq': 'BBQ',
    'sauces_ingredients[]|butter_milk_ranch': 'Butter Milk Ranch',
    'sauces_ingredients[]|honey_bbq': 'Honey BBQ',
    'sauces_ingredients[]|honey_mustard': 'Honey Mustard',
    'sauces_ingredients[]|mayonnaise': 'Mayonnaise',
    'sauces_ingredients[]|mustard': 'Mustard',
    'sauces_ingredients[]|ranch': 'Ranch'
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

  // Delivery helpers
  function readDeliveryData() {
    const data = {
      name: '',
      phone: '',
      address: '',
      suite: '',
      type: '',
      city: '',
      zip: ''
    };
    try {
      data.name = (localStorage.getItem(STORAGE_KEYS.deliveryName) || '').trim();
      data.phone = (localStorage.getItem(STORAGE_KEYS.deliveryPhone) || '').replace(/\D+/g, '');
      data.address = (localStorage.getItem(STORAGE_KEYS.deliveryAddress) || '').trim();
      data.suite = (localStorage.getItem(STORAGE_KEYS.deliverySuite) || '').trim();
      data.type = (localStorage.getItem(STORAGE_KEYS.deliveryType) || '').trim();
      data.city = (localStorage.getItem(STORAGE_KEYS.deliveryCity) || '').trim();
      data.zip = (localStorage.getItem(STORAGE_KEYS.deliveryZip) || '').trim();
    } catch { /* ignore */ }
    return data;
  }

  function hasValidDeliveryDetails() {
    try {
      const d = readDeliveryData();
      const zipDigits = (d.zip || '').replace(/\D+/g, '');
      const zipOk = (zipDigits.length === 5 && zipDigits === '13309') || (zipDigits.length === 9 && zipDigits.slice(0, 5) === '13309');
      const phoneOk = (d.phone || '').length === 10;
      return !!(d.name && phoneOk && d.address && d.type && d.city && zipOk);
    } catch { return false; }
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
    const settingResetDisables = document.getElementById('setting-reset-disables') || document.querySelector('.setting-reset-disables');
    const settingResetKeepOpen = document.getElementById('setting-reset-keep-open') || document.querySelector('.setting-reset-keep-open');
    const settingAutoDisableEmpty = document.getElementById('setting-auto-disable-empty') || document.querySelector('.setting-auto-disable-empty');
    const settingAutoDisableSection = document.getElementById('setting-auto-disable-section') || document.querySelector('.setting-auto-disable-section');
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
    const updateOrderTypeChip = () => {
      let type = '';
      try { type = localStorage.getItem(STORAGE_KEYS.orderType) || ''; } catch { type = ''; }
      let label = 'Not selected';
      if (type === 'delivery') {
        label = 'Delivery';
        // On desktop, append delivery address for quick glance
        const d = readDeliveryData();
        const parts = [d.name, d.address, d.suite, [d.city, d.zip].filter(Boolean).join(' ')].filter(Boolean);
        const desktop = !isMobileView();
        if (desktop && parts.length) {
          label = `${label} --- ${parts.join(', ')}`;
        }
      } else if (type === 'dine') {
        label = 'Dine In/Carryout';
      }
      const empty = !type;
      orderTypeChips.forEach((chip) => {
        const valueEl = chip.querySelector('.order-type-chip__value');
        if (valueEl) valueEl.textContent = label;
        chip.dataset.empty = empty ? 'true' : 'false';
      });
    };

    const updatePage3NavState = () => {
      const okType = hasOrderTypeSelected();
      const okMenu = hasMenuSelection();
      const typeNow = (() => { try { return localStorage.getItem(STORAGE_KEYS.orderType) || ''; } catch { return ''; } })();
      const okDelivery = (typeNow !== 'delivery') || hasValidDeliveryDetails();
      const enablePage2 = okType && okDelivery;
      const enablePage3 = okType && okMenu && okDelivery;

      const lockAnchor = (anchor, enabled, tooltip) => {
        if (enabled) {
          anchor.removeAttribute('aria-disabled');
          anchor.removeAttribute('tabindex');
          anchor.removeEventListener('click', preventNavClick);
          anchor.removeAttribute('title');
        } else {
          anchor.setAttribute('aria-disabled', 'true');
          anchor.setAttribute('tabindex', '-1');
          anchor.addEventListener('click', preventNavClick);
          if (tooltip) anchor.setAttribute('title', tooltip);
        }
      };

      document.querySelectorAll('.left-rail a[href$="page2.html"]').forEach((a) => {
        const tip = enablePage2 ? '' : (typeNow === 'delivery' ? 'Complete delivery details to enable Page 2' : 'Select an order type to enable Page 2');
        lockAnchor(a, enablePage2, tip);
      });

      document.querySelectorAll('.left-rail a[href$="page3.html"]').forEach((a) => {
        let msg = '';
        const needsType = !okType;
        const needsMenu = !okMenu;
        const needsDelivery = (typeNow === 'delivery') && !okDelivery;
        if (!enablePage3) {
          if (needsType && needsMenu) msg = 'Select an order type and choose at least one menu item to enable Page 3';
          else if (needsType) msg = 'Select an order type to enable Page 3';
          else if (needsDelivery) msg = 'Complete delivery details to enable Page 3';
          else msg = 'Choose at least one menu item to enable Page 3';
        }
        lockAnchor(a, enablePage3, msg);
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

    // Reset-on-deselect: always ON (setting removed for Restaurant 2)
    const resetOnDeselect = true;

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
        resetDisables = false;
        resetKeepOpen = true;
        autoDisableEmpty = false;
        autoDisableSection = false;
        // Default: menu pills open/close via the whole pill
        pillArrowOnly = false;
        try {
          localStorage.setItem(STORAGE_KEYS.settingsLabelSelects, 'true');
          localStorage.setItem(STORAGE_KEYS.settingsTitleSelects, 'true');
          localStorage.setItem(STORAGE_KEYS.settingsResetDisables, 'false');
          localStorage.setItem(STORAGE_KEYS.settingsResetKeepOpen, 'true');
          localStorage.setItem(STORAGE_KEYS.settingsAutoDisableEmpty, 'false');
          localStorage.setItem(STORAGE_KEYS.settingsAutoDisableSection, 'false');
          localStorage.setItem(STORAGE_KEYS.settingsPillArrowOnly, 'false');
        } catch { }
        if (settingLabelSelects) settingLabelSelects.checked = true;
        if (settingTitleSelects) settingTitleSelects.checked = true;
        if (settingResetDisables) settingResetDisables.checked = false;
        if (settingResetKeepOpen) settingResetKeepOpen.checked = true;
        if (settingAutoDisableEmpty) settingAutoDisableEmpty.checked = false;
        if (settingAutoDisableSection) settingAutoDisableSection.checked = false;
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
      const tag = (e.target.tagName || '').toLowerCase();
      // Don't treat clicks on interactive controls as label toggles
      if (['select', 'option', 'button', 'textarea'].includes(tag)) return;
      if (tag === 'input' && e.target.type && e.target.type !== 'checkbox') return;
      const lbl = e.target.closest && e.target.closest('label');
      if (!lbl) return;
      const cb = lbl.querySelector('input[type="checkbox"][name]');
      if (!cb || cb.disabled) return;
      if (cb.dataset && cb.dataset.required === 'true') return;
      // When label toggling is disabled, swallow label clicks (but still allow direct checkbox clicks)
      if (!labelSelects && e.target !== cb) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
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
      const deliveryError = document.getElementById('delivery-error');
      const deliveryClearBtn = document.querySelector('.delivery-clear');
      const deliveryFields = {
        name: document.getElementById('delivery-name'),
        phone: document.getElementById('delivery-phone'),
        address: document.getElementById('delivery-address'),
        suite: document.getElementById('delivery-suite'),
        type: document.getElementById('delivery-type'),
        city: document.getElementById('delivery-city'),
        zip: document.getElementById('delivery-zip')
      };

      const showDeliveryForm = (show) => {
        if (!dFormInit) return;
        dFormInit.hidden = !show;
        if (!show && deliveryError) deliveryError.hidden = true;
      };

      const saveDeliveryDetails = () => {
        try {
          if (deliveryFields.name) localStorage.setItem(STORAGE_KEYS.deliveryName, deliveryFields.name.value.trim());
          if (deliveryFields.phone) localStorage.setItem(STORAGE_KEYS.deliveryPhone, deliveryFields.phone.value.trim());
          if (deliveryFields.address) localStorage.setItem(STORAGE_KEYS.deliveryAddress, deliveryFields.address.value.trim());
          if (deliveryFields.suite) localStorage.setItem(STORAGE_KEYS.deliverySuite, deliveryFields.suite.value.trim());
          if (deliveryFields.type) localStorage.setItem(STORAGE_KEYS.deliveryType, deliveryFields.type.value.trim());
          if (deliveryFields.city) localStorage.setItem(STORAGE_KEYS.deliveryCity, deliveryFields.city.value.trim());
          if (deliveryFields.zip) localStorage.setItem(STORAGE_KEYS.deliveryZip, deliveryFields.zip.value.trim());
        } catch { /* ignore */ }
      };

      const populateDeliveryFieldsFromStorage = () => {
        const d = readDeliveryData();
        if (deliveryFields.name) deliveryFields.name.value = d.name || '';
        if (deliveryFields.phone) deliveryFields.phone.value = d.phone || '';
        if (deliveryFields.address) deliveryFields.address.value = d.address || '';
        if (deliveryFields.suite) deliveryFields.suite.value = d.suite || '';
        if (deliveryFields.type && d.type) deliveryFields.type.value = d.type;
        if (deliveryFields.city) deliveryFields.city.value = d.city || '';
        if (deliveryFields.zip) deliveryFields.zip.value = d.zip || '';
      };

      const validateDeliveryDetails = () => {
        const name = (deliveryFields.name?.value || '').trim();
        const phoneDigits = (deliveryFields.phone?.value || '').replace(/\D+/g, '');
        const address = (deliveryFields.address?.value || '').trim();
        const type = (deliveryFields.type?.value || '').trim();
        const city = (deliveryFields.city?.value || '').trim();
        const zipRaw = (deliveryFields.zip?.value || '').trim();
        const zipDigits = zipRaw.replace(/\D+/g, '');
        const zipOk = (zipDigits.length === 5 && zipDigits === '13309') || (zipDigits.length === 9 && zipDigits.slice(0, 5) === '13309');
        if (!name || !address || !type || !city || !zipRaw) {
          return { ok: false, message: 'Please complete all required delivery fields.' };
        }
        if (phoneDigits.length !== 10) {
          return { ok: false, message: 'Enter a valid 10-digit phone number.' };
        }
        if (!zipOk) {
          return { ok: false, message: 'Sorry, we currently serve zip code 13309 only.' };
        }
        return { ok: true, message: '' };
      };

      const focusFirstDeliveryField = () => {
        if (!dFormInit) return;
        const first = dFormInit.querySelector('input, select');
        if (first && typeof first.focus === 'function') first.focus();
      };

      if (dFormInit) {
        const savedType = getOrderType();
        const show = savedType === 'delivery';
        dFormInit.hidden = !show;
        const errEl = document.getElementById('delivery-error');
        if (errEl) errEl.hidden = true;
        populateDeliveryFieldsFromStorage();
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
          e.preventDefault();
          const type = card.dataset.type || '';
          if (!type) return;
          setOrderType(type);
          setActive(card);
          updateOrderTypeChip();
          const isDelivery = type === 'delivery';
          showDeliveryForm(isDelivery);
          if (isDelivery) {
            focusFirstDeliveryField();
          } else {
            window.location.href = 'page2.html';
          }
        });
      });

      function setOrderType(type) {
        try { localStorage.setItem(STORAGE_KEYS.orderType, type); } catch { }
        updatePage3NavState();
        updateOrderTypeChip();
      }

      function getOrderType() {
        try { return localStorage.getItem(STORAGE_KEYS.orderType) || ''; } catch { return ''; }
      }

      if (deliveryClearBtn) {
        deliveryClearBtn.addEventListener('click', () => {
          Object.values(deliveryFields).forEach((field) => {
            if (field) field.value = '';
          });
          if (deliveryError) deliveryError.hidden = true;
          try {
            localStorage.removeItem(STORAGE_KEYS.deliveryName);
            localStorage.removeItem(STORAGE_KEYS.deliveryPhone);
            localStorage.removeItem(STORAGE_KEYS.deliveryAddress);
            localStorage.removeItem(STORAGE_KEYS.deliverySuite);
            localStorage.removeItem(STORAGE_KEYS.deliveryType);
            localStorage.removeItem(STORAGE_KEYS.deliveryCity);
            localStorage.removeItem(STORAGE_KEYS.deliveryZip);
          } catch { /* ignore */ }
          updatePage3NavState();
        });
      }

      if (dFormInit) {
        dFormInit.addEventListener('submit', (evt) => {
          evt.preventDefault();
          const { ok, message } = validateDeliveryDetails();
          if (!ok) {
            deliveryFailCount += 1;
            if (deliveryError) {
              deliveryError.textContent = message;
              deliveryError.hidden = false;
            }
            return;
          }
          if (deliveryError) deliveryError.hidden = true;
          saveDeliveryDetails();
          setOrderType('delivery');
          updatePage3NavState();
          window.location.href = 'page2.html';
        });
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
      const primarySections = ['pizza', 'burger', 'sub'];
      let sauceDisabled = false;
      const isSectionDisabled = (sec) => sec === 'sauces' && sauceDisabled;
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
        const isDisabled = isSectionDisabled(sec);
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
      let suppressAutoDisable = false;
      const clearOptionalSelections = (secId) => {
        if (!secId) return;
        const sectionEl = document.getElementById(secId);
        if (!sectionEl) return;
        const inputs = Array.from(sectionEl.querySelectorAll('input[type="checkbox"][name]'));
        suppressAutoDisable = true;
        try {
          inputs.forEach((cb) => {
            if (cb.dataset && cb.dataset.required === 'true') return;
            cb.checked = false;
            const lbl = cb.closest('label');
            const qty = lbl && lbl.querySelector('select.ingredient-qty');
            if (qty) {
              qty.disabled = true;
              qty.value = '1';
            }
            cb.dispatchEvent(new Event('change', { bubbles: true }));
          });
          saveAllIngredientSelections();
        } finally {
          suppressAutoDisable = false;
        }
      };
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
        if (!secId || isSectionDisabled(secId)) return;
        const toggle = document.querySelector(`.section-toggle[data-section="${secId}"]`);
        if (!toggle || toggle.disabled) return;
        const sectionEl = document.getElementById(secId);
        if (!sectionEl) return;
        const inputs = Array.from(sectionEl.querySelectorAll('input[type="checkbox"][name]'));
        const anyOptionalChecked = inputs.some((input) => input.checked && input.dataset.required !== 'true');
        const hasOptionals = inputs.some((input) => input.dataset.required !== 'true');
        if (!anyOptionalChecked && hasOptionals) {
          clearOptionalSelections(secId);
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

      // Attach ingredient quantity dropdowns (Regular/Extra/x3/x4)
      const attachIngredientQuantities = () => {
        let qtyMap = {};
        try { qtyMap = safeParseJSON(localStorage.getItem(STORAGE_KEYS.quantities), {}); } catch { qtyMap = {}; }
        if (!qtyMap || typeof qtyMap !== 'object') qtyMap = {};
        const options = [
          { label: 'Regular', value: '1' },
          { label: 'Light', value: '0.5' },
          { label: 'Extra', value: '2' },
          { label: 'x3', value: '3' },
          { label: 'x4', value: '4' }
        ];
        const optionValues = new Set(options.map((o) => String(o.value)));
        const persistQty = () => {
          try { localStorage.setItem(STORAGE_KEYS.quantities, JSON.stringify(qtyMap)); } catch { /* ignore */ }
        };

        document.querySelectorAll('input[type="checkbox"][name$="_ingredients[]"]').forEach((cb) => {
          const lbl = cb.closest('label');
          if (!lbl) return;

          // Items that provide their own dropdown (e.g., bread choice) should not get a qty select
          if (cb.dataset && cb.dataset.noQty === 'true') {
            const ownSelect = lbl.querySelector('select.ingredient-qty');
            if (ownSelect) {
              ownSelect.disabled = !cb.checked;
              ownSelect.hidden = !cb.checked;
            }
            return;
          }

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

          const stored = optionValues.has(String(qtyMap[key])) ? String(qtyMap[key]) : '1';
          sel.value = stored;
          sel.disabled = !cb.checked;
          sel.hidden = !cb.checked;

          sel.addEventListener('change', () => {
            const next = optionValues.has(sel.value) ? sel.value : '1';
            sel.value = next;
            qtyMap[key] = next;
            persistQty();
          });

          cb.addEventListener('change', () => {
            sel.disabled = !cb.checked;
            sel.hidden = !cb.checked;
            if (cb.checked) {
              if (!qtyMap[key] || qtyMap[key] === '0' || qtyMap[key] === 0) {
                sel.value = '1';
                qtyMap[key] = '1';
                persistQty();
              }
            } else if (resetOnDeselect) {
              sel.value = '1';
              qtyMap[key] = '1';
              persistQty();
            }
          });
        });
      };

      // Restore saved ingredient selections
      updateIngredientInputsFromData(loadIngredientsFromStorage());
      syncRequiredCheckboxes();
      attachIngredientQuantities();

      // Build lookup for pills by section
      const menuLaunchLookup = {};
      menuLaunchButtons.forEach((btn) => {
        const target = btn.dataset.target;
        if (!target) return;
        if (isSectionDisabled(target)) {
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
        if (isSectionDisabled(section)) return;
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
        if (isSectionDisabled(section)) return;
        const overlay = getOverlay(section);
        if (!overlay) return;
        if (overlay.hidden) openOverlay(section);
        else closeOverlay(overlay);
      };

      const setSaucesDisabled = (disabled) => {
        sauceDisabled = !!disabled;
        const saucesToggle = sectionToggles.find((t) => t.dataset.section === 'sauces');
        if (saucesToggle) {
          saucesToggle.disabled = sauceDisabled;
          if (sauceDisabled) {
            saucesToggle.checked = false;
            saucesToggle.setAttribute('aria-disabled', 'true');
          } else {
            saucesToggle.removeAttribute('aria-disabled');
          }
        }
        const pills = menuLaunchLookup['sauces'] || [];
        pills.forEach((btn) => {
          btn.disabled = sauceDisabled;
          if (sauceDisabled) btn.setAttribute('aria-disabled', 'true');
          else btn.removeAttribute('aria-disabled');
        });
        if (sauceDisabled) closeOverlay('sauces');
      };

      const syncSaucesEnabled = () => {
        const anyPrimaryActive = sectionToggles.some((t) => primarySections.includes(t.dataset.section) && t.checked);
        setSaucesDisabled(!anyPrimaryActive);
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
            if (!suppressAutoDisable) {
              autoDisableIfEmpty(secEl.id);
            }
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
            if (sec) clearOptionalSelections(sec);
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
          syncSaucesEnabled();
          persistActiveSections();
          updateBuilderError();
          updatePage3NavState();
        });
      });

      // Initial sync
      syncSaucesEnabled();
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
    updateOrderTypeChip();

    // Re-open section if hash present
    openSectionFromHash();

    // Keep theme label in sync on viewport changes (for emoji on small screens)
    if (mobileQuery && typeof mobileQuery.addEventListener === 'function') {
      mobileQuery.addEventListener('change', updateThemeModeLabel);
    }

    // Page 3: Order summary rendering
    if (body.classList.contains('page3')) {
      const container = document.getElementById('order-summary');
      if (container) {
        const readJSON = (key, fallback) => {
          try { return safeParseJSON(localStorage.getItem(key), fallback); } catch { return fallback; }
        };
        const d = readDeliveryData();
        const orderType = (() => { try { return localStorage.getItem(STORAGE_KEYS.orderType) || ''; } catch { return ''; } })();
        const ingredients = readJSON(STORAGE_KEYS.ingredients, {});
        const activeSections = readJSON(STORAGE_KEYS.activeSections, {});
        const qtyMap = readJSON(STORAGE_KEYS.quantities, {});
        container.innerHTML = '';
        const frag = document.createDocumentFragment();

        // Order type
        if (orderType) {
          const h3 = document.createElement('h3');
          h3.textContent = 'Order Type';
          frag.appendChild(h3);
          const p = document.createElement('p');
          p.textContent = orderType === 'delivery' ? 'Delivery' : 'Dine In/Carryout';
          frag.appendChild(p);
        }

        // Delivery details block
        if (orderType === 'delivery') {
          const d = document.createElement('div');
          const h = document.createElement('h3');
          h.textContent = 'Delivery Details';
          d.appendChild(h);

          const block = document.createElement('div');
          block.className = 'address-block';

          const dn = d.name;
          const dph = d.phone;
          const da = d.address;
          const ds = d.suite;
          const dt = d.type;
          const city = d.city;
          const zip = d.zip;

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
              let out = '';
              if (a) out = `(${a}`;
              if (a.length === 3) out += `)`;
              if (b) out += `-${b}`;
              if (c) out += `-${c}`;
              return out || v;
            })(dph);
            line.textContent = `Phone: ${pretty}`;
            block.appendChild(line);
          }
          if (da) {
            const line = document.createElement('div');
            line.textContent = da;
            block.appendChild(line);
          }
          if (ds) {
            const line = document.createElement('div');
            line.textContent = ds;
            block.appendChild(line);
          }
          if (city || zip) {
            const line = document.createElement('div');
            line.textContent = [city, zip].filter(Boolean).join(' ');
            block.appendChild(line);
          }

          d.appendChild(block);
          frag.appendChild(d);
        }

        const h3 = document.createElement('h3');
        h3.textContent = 'Selections';
        frag.appendChild(h3);

        const entries = Object.entries(ingredients || {});
        const nonEmpty = entries.filter(([, arr]) => Array.isArray(arr) && arr.length > 0);
        const qtyLabel = (group, val) => {
          const key = `${group}|${val}`;
          const q = qtyMap && qtyMap[key];
          if (!q || q === '1') return '';
          if (q === '0.5') return ' (Light)';
          if (q === '2') return ' (Extra)';
          return ` (x${q})`;
        };

        if (!nonEmpty.length) {
          const p = document.createElement('p');
          p.textContent = 'No ingredients selected yet.';
          frag.appendChild(p);
        } else {
          nonEmpty.forEach(([group, values]) => {
            const sec = group.replace(/_ingredients\[\]$/, '');
            if (!activeSections[sec]) return;
            const sectionWrap = document.createElement('div');
            const title = document.createElement('strong');
            title.textContent = sec.charAt(0).toUpperCase() + sec.slice(1);
            sectionWrap.appendChild(title);

            const edit = document.createElement('a');
            edit.href = `page2.html#${sec}`;
            edit.textContent = 'Edit';
            edit.className = 'summary-edit-btn';
            sectionWrap.appendChild(edit);

            const ul = document.createElement('ul');
            values.forEach((val) => {
              const li = document.createElement('li');
              const mapKey = `${group}|${val}`;
              const pretty = INGREDIENT_LABELS[mapKey] || String(val || '').replace(/_/g, ' ');
              li.textContent = pretty + qtyLabel(group, val);
              ul.appendChild(li);
            });
            sectionWrap.appendChild(ul);
            frag.appendChild(sectionWrap);
          });
        }

        container.appendChild(frag);
      }
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
