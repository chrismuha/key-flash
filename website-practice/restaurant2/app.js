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
    manualDisabledSections: 'restaurant.manualDisabledSections',
    navEnabled: 'restaurant.nav.enabled',
    settingsLabelSelects: 'restaurant.settings.labelSelects',
    settingsTitleSelects: 'restaurant.settings.titleSelects',
    settingsResetDisables: 'restaurant.settings.resetDisables',
    settingsResetKeepOpen: 'restaurant.settings.resetKeepOpen',
    settingsAutoDisableEmpty: 'restaurant.settings.autoDisableEmpty',
    settingsAutoDisableSection: 'restaurant.settings.autoDisableSection',
    settingsPillArrowOnly: 'restaurant.settings.pillArrowOnly',
    settingsNextClosesOverlay: 'restaurant.settings.nextClosesOverlay',
    settingsQuantityCanDisable: 'restaurant.settings.quantityCanDisable',
    settingsToastEnabled: 'restaurant.settings.toastEnabled',
    settingsToastPage2Long: 'restaurant.settings.toastPage2Long',
    redirectReason: 'restaurant.redirectReason',
    quantities: 'restaurant.quantities',
    quantitiesSections: 'restaurant.quantitiesSections',
    pizzaSize: 'restaurant.pizza.size',
    // OLD (hidden line reference): ingredientCatalog was last key before orderItems.
    ingredientCatalog: 'restaurant.ingredientCatalog',
    orderItems: 'restaurant.orderItems'
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
    'pizza_ingredients[]|thin_crust': 'Thin crust',
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

    'calzone_ingredients[]|ricotta_cheese': 'Ricotta cheese',
    'calzone_ingredients[]|shredded_mozzarella': 'Shredded mozzarella',
    'calzone_ingredients[]|grated_parmesan_or_pecorino': 'Grated parmesan or pecorino',
    'calzone_ingredients[]|salt': 'Salt',
    'calzone_ingredients[]|black_pepper': 'Black pepper',
    'calzone_ingredients[]|italian_seasoning': 'Italian seasoning',
    'calzone_ingredients[]|garlic_powder': 'Garlic powder',
    'calzone_ingredients[]|olive_oil': 'Olive oil',
    'calzone_ingredients[]|bacon_bits': 'Bacon bits',
    'calzone_ingredients[]|meatballs': 'Meatballs',
    'calzone_ingredients[]|broccoli': 'Broccoli',
    'calzone_ingredients[]|onion': 'Onion',
    'calzone_ingredients[]|steak': 'Steak',
    'calzone_ingredients[]|hot_peppers': 'Hot peppers',
    'calzone_ingredients[]|banana_peppers': 'Banana peppers',
    'calzone_ingredients[]|eggplant': 'Eggplant',
    'calzone_ingredients[]|cheddar_cheese': 'Cheddar cheese',
    'calzone_ingredients[]|feta_cheese': 'Feta cheese',
    'calzone_ingredients[]|greens': 'Greens',
    'calzone_ingredients[]|jalapenos': 'Jalapeño',
    'calzone_ingredients[]|roasted_red_peppers': 'Roasted red peppers',
    'calzone_ingredients[]|pineapple': 'Pineapple',
    'calzone_ingredients[]|spinach': 'Spinach',
    'calzone_ingredients[]|swiss_cheese': 'Swiss cheese',
    'calzone_ingredients[]|american_cheese': 'American cheese',
    'calzone_ingredients[]|tomatoes': 'Tomatoes',
    'calzone_ingredients[]|pepperoni': 'Pepperoni',
    'calzone_ingredients[]|salami': 'Salami',
    'calzone_ingredients[]|ham': 'Ham',

    'chicken_wings_ingredients[]|garlic': 'Garlic',
    'chicken_wings_ingredients[]|butter_sauce': 'Butter sauce',
    'chicken_wings_ingredients[]|hot_sauce': 'Hot sauce',
    'chicken_wings_ingredients[]|medium_sauce': 'Medium sauce',
    'chicken_wings_ingredients[]|plain_extra_hot_sauce': 'Plain extra hot sauce',
    'chicken_wings_ingredients[]|honey': 'Honey',
    'chicken_wings_ingredients[]|mustard': 'Mustard',
    'chicken_wings_ingredients[]|hot_and_spicy_barbecue_sauce': 'Hot and spicy barbecue sauce',
    'chicken_wings_ingredients[]|mild_sauce': 'Mild sauce',
    'chicken_wings_ingredients[]|spicy_garlic_parm_sauce': 'Spicy garlic parm sauce',

    'salad_ingredients[]|cucumbers': 'Cucumbers',
    'salad_ingredients[]|italian_dressing': 'Italian dressing',
    'salad_ingredients[]|red_onion': 'Red onion',
    'salad_ingredients[]|tomato': 'Tomato',
    'salad_ingredients[]|ham': 'Ham',
    'salad_ingredients[]|olives': 'Olives',
    'salad_ingredients[]|provolone_cheese': 'Provolone cheese',
    'salad_ingredients[]|salami': 'Salami',
    'salad_ingredients[]|banana_peppers': 'Banana peppers',
    'salad_ingredients[]|green_peppers': 'Green peppers',
    'salad_ingredients[]|red_peppers': 'Red peppers',

    'sub_ingredients[]|bacon': 'Bacon',
    'sub_ingredients[]|bologna': 'Bologna',
    'sub_ingredients[]|cheese': 'Cheese',
    'sub_ingredients[]|ham': 'Ham',
    'sub_ingredients[]|jalapenos': 'Jalapeños',
    'sub_ingredients[]|lettuce': 'Lettuce',
    'sub_ingredients[]|mushrooms': 'Mushrooms',
    'sub_ingredients[]|olives': 'Olives',
    'sub_ingredients[]|onion': 'Onion',
    'sub_ingredients[]|pepperoni': 'Pepperoni',
    'sub_ingredients[]|pickles': 'Pickles',
    'sub_ingredients[]|salami': 'Salami',
    'sub_ingredients[]|tomatoes': 'Tomatoes',
    'sub_ingredients[]|toasted': 'Toasted',
    'sub_ingredients[]|white': 'Bread: White (Required)',
    'sub_ingredients[]|wheat': 'Bread: Wheat (Required)',

    'wrap_ingredients[]|bacon': 'Bacon',
    'wrap_ingredients[]|bologna': 'Bologna',
    'wrap_ingredients[]|cheese': 'Cheese',
    'wrap_ingredients[]|ham': 'Ham',
    'wrap_ingredients[]|jalapenos': 'Jalapeños',
    'wrap_ingredients[]|lettuce': 'Lettuce',
    'wrap_ingredients[]|mushrooms': 'Mushrooms',
    'wrap_ingredients[]|olives': 'Olives',
    'wrap_ingredients[]|onion': 'Onion',
    'wrap_ingredients[]|pepperoni': 'Pepperoni',
    'wrap_ingredients[]|pickles': 'Pickles',
    'wrap_ingredients[]|salami': 'Salami',
    'wrap_ingredients[]|tomatoes': 'Tomatoes',
    'wrap_ingredients[]|turkey': 'Turkey',
    'wrap_ingredients[]|white': 'Tortilla: White (Required)',
    'wrap_ingredients[]|wheat': 'Tortilla: Wheat (Required)',
    'wrap_ingredients[]|tomato_basil': 'Tortilla: Tomato Basil',
    'wrap_ingredients[]|spinach': 'Tortilla: Spinach',

    'sauces_ingredients[]|bbq': 'BBQ',
    'sauces_ingredients[]|butter_milk_ranch': 'Butter Milk Ranch',
    'sauces_ingredients[]|honey_bbq': 'Honey BBQ',
    'sauces_ingredients[]|honey_mustard': 'Honey Mustard',
    'sauces_ingredients[]|mayonnaise': 'Mayonnaise',
    'sauces_ingredients[]|mustard': 'Mustard',
    'sauces_ingredients[]|ranch': 'Ranch'
  };

  const JALAPENO_VALUE = 'jalapenos';
  const JALAPENO_LABEL_RE = /jalapenos|jalapeños/i;
  const JALAPENO_LABEL_GLOBAL = /jalapenos|jalapeños/gi;

  function titleCase(str) {
    if (!str) return '';
    return String(str)
      .replace(/[_-]+/g, ' ')
      .split(/\s+/)
      .map((word) => word ? word.charAt(0).toUpperCase() + word.slice(1) : '')
      .join(' ')
      .trim();
  }

  function stripInlineQty(str) {
    if (!str) return '';
    return String(str).replace(/\(x\d+\)/gi, '').replace(/\s{2,}/g, ' ').trim();
  }

  function normalizeJalapenoValue(val) {
    if (typeof val !== 'string') return val;
    return JALAPENO_LABEL_RE.test(val) ? JALAPENO_VALUE : val;
  }

  function normalizeJalapenoLabel(str) {
    if (!str) return str;
    return String(str).replace(JALAPENO_LABEL_GLOBAL, 'Jalapeños');
  }

  const DEFAULT_PIZZA_SIZE = 'large';
  const PIZZA_SIZE_LABELS = {
    small: 'Small',
    medium: 'Medium',
    large: 'Large'
  };

  const INGREDIENT_GROUPS = [
    'pizza_ingredients[]',
    'burger_ingredients[]',
    'calzone_ingredients[]',
    'chicken_wings_ingredients[]',
    'salad_ingredients[]',
    'sub_ingredients[]',
    'wrap_ingredients[]',
    'sauces_ingredients[]'
  ];

  const SECTION_INGREDIENT_GROUPS = {
    pizza: ['pizza_ingredients[]'],
    burger: ['burger_ingredients[]'],
    calzone: ['calzone_ingredients[]'],
    chicken_wings: ['chicken_wings_ingredients[]'],
    salad: ['salad_ingredients[]'],
    sub: ['sub_ingredients[]'],
    wrap: ['wrap_ingredients[]'],
    sauces: ['sauces_ingredients[]']
  };

  const SECTION_LABELS = {
    pizza: 'Pizza',
    burger: 'Burger',
    calzone: 'Calzone',
    chicken_wings: 'Chicken Wings',
    salad: 'Salad',
    sub: 'Sub',
    wrap: 'Wrap',
    sauces: 'Sauces',
    order: 'Order'
  };

  const SECTION_QUANTITY_DEFAULT_MIN = 1;
  const SECTION_QUANTITY_MAX = 12;
  const SECTION_QUANTITY_SECTIONS = ['pizza', 'burger', 'calzone', 'chicken_wings', 'salad', 'sub', 'wrap', 'sauces'];
  const SECTION_QUANTITY_ALLOW_DISABLE_DEFAULT = true;
  let quantityCanDisable = SECTION_QUANTITY_ALLOW_DISABLE_DEFAULT;
  let sectionQuantities = {};
  let applyQuantitySettingState = null;

  function savePizzaSize(value) {
    try {
      localStorage.setItem(STORAGE_KEYS.pizzaSize, String(value || DEFAULT_PIZZA_SIZE));
    } catch { /* ignore */ }
  }

  function loadPizzaSize() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.pizzaSize);
      return stored || DEFAULT_PIZZA_SIZE;
    } catch { return DEFAULT_PIZZA_SIZE; }
  }

  function normalizeIngredientData(data) {
    if (!data || typeof data !== 'object') return data;
    const normalized = {};
    Object.entries(data).forEach(([group, values]) => {
      if (!Array.isArray(values)) {
        normalized[group] = values;
        return;
      }
      normalized[group] = values.map((value) => normalizeJalapenoValue(value));
    });
    return normalized;
  }

  function getSectionFromGroupName(group) {
    if (!group) return '';
    return String(group).replace(/_ingredients\[\]$/, '');
  }

  function extractIngredientLabel(input) {
    if (!input) return '';
    const label = input.closest('label') || document.querySelector(`label[for="${input.id}"]`);
    if (!label) return titleCase(input.value || '');
    const clone = label.cloneNode(true);
    clone.querySelectorAll('input, select, textarea, button, .sauce-qty, .qty-controls').forEach((el) => el.remove());
    const txt = (clone.textContent || '').replace(/\s+/g, ' ').trim();
    return normalizeJalapenoLabel(stripInlineQty(txt || titleCase(input.value || '')));
  }

  function buildIngredientCatalogFromDOM() {
    const catalog = {};
    document.querySelectorAll('input[type="checkbox"][name$="_ingredients[]"]').forEach((input) => {
      const group = input.getAttribute('name');
      const section = getSectionFromGroupName(group);
      if (!group || !section) return;
      if (!catalog[section]) catalog[section] = [];
      const value = normalizeJalapenoValue(input.value);
      const label = extractIngredientLabel(input);
      const required = input.dataset && input.dataset.required === 'true';
      if (catalog[section].some((item) => item && item.value === value)) return;
      catalog[section].push({ group, value, label, required });
    });
    return catalog;
  }

  function saveIngredientCatalogFromDOM() {
    try {
      localStorage.setItem(STORAGE_KEYS.ingredientCatalog, JSON.stringify(buildIngredientCatalogFromDOM()));
    } catch { /* ignore */ }
  }

  function loadIngredientCatalogFromStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.ingredientCatalog);
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch { return {}; }
  }

  // Section: Utility helpers
  const docEl = document.documentElement;
  const CONFIRM_DIALOG_ID = 'custom-confirm-dialog';
  let confirmDialogInstance = null;

  function $(sel, ctx = document) { return ctx.querySelector(sel); }
  function $all(sel, ctx = document) { return Array.from((ctx || document).querySelectorAll(sel)); }

  function ensureCustomConfirmDialog() {
    if (confirmDialogInstance) return confirmDialogInstance;

    const overlay = document.createElement('div');
    overlay.className = 'custom-confirm-overlay';
    overlay.hidden = true;
    overlay.setAttribute('aria-hidden', 'true');

    const modal = document.createElement('div');
    modal.className = 'custom-confirm-modal';
    modal.id = CONFIRM_DIALOG_ID;
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', `${CONFIRM_DIALOG_ID}-title`);
    modal.setAttribute('aria-describedby', `${CONFIRM_DIALOG_ID}-message`);

    const title = document.createElement('h2');
    title.id = `${CONFIRM_DIALOG_ID}-title`;
    title.textContent = 'Confirm Action';

    const message = document.createElement('p');
    message.id = `${CONFIRM_DIALOG_ID}-message`;
    message.className = 'custom-confirm-message';

    const actions = document.createElement('div');
    actions.className = 'custom-confirm-actions';

    const cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.className = 'custom-confirm-cancel';
    cancelBtn.textContent = 'No';

    const confirmBtn = document.createElement('button');
    confirmBtn.type = 'button';
    confirmBtn.className = 'custom-confirm-accept';
    confirmBtn.textContent = 'Yes';

    actions.appendChild(cancelBtn);
    actions.appendChild(confirmBtn);
    modal.appendChild(title);
    modal.appendChild(message);
    modal.appendChild(actions);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    confirmDialogInstance = {
      overlay,
      message,
      cancelBtn,
      confirmBtn,
      onDecision: null,
      lastFocused: null,
      restoreFocus: true
    };

    const closeDialog = (approved) => {
      if (!confirmDialogInstance) return;
      const state = confirmDialogInstance;
      state.overlay.hidden = true;
      state.overlay.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('custom-confirm-open');
      const decisionHandler = state.onDecision;
      state.onDecision = null;
      if (state.restoreFocus && state.lastFocused && typeof state.lastFocused.focus === 'function') {
        state.lastFocused.focus();
      }
      state.lastFocused = null;
      state.restoreFocus = true;
      if (typeof decisionHandler === 'function') {
        decisionHandler(!!approved);
      }
    };

    overlay.addEventListener('click', (evt) => {
      if (evt.target === overlay) closeDialog(false);
    });
    cancelBtn.addEventListener('click', () => closeDialog(false));
    confirmBtn.addEventListener('click', () => closeDialog(true));
    document.addEventListener('keydown', (evt) => {
      if (evt.key !== 'Escape') return;
      if (!confirmDialogInstance || confirmDialogInstance.overlay.hidden) return;
      evt.preventDefault();
      closeDialog(false);
    });

    return confirmDialogInstance;
  }

  function openCustomConfirm(messageText, onDecision, options = {}) {
    const dialog = ensureCustomConfirmDialog();
    dialog.message.textContent = String(messageText || 'Are you sure?');
    dialog.onDecision = onDecision;
    dialog.lastFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    dialog.restoreFocus = options.restoreFocus !== false;
    dialog.overlay.hidden = false;
    dialog.overlay.setAttribute('aria-hidden', 'false');
    document.body.classList.add('custom-confirm-open');
    window.requestAnimationFrame(() => {
      dialog.confirmBtn.focus();
    });
  }

  function safeParseJSON(v, fallback) {
    try { return JSON.parse(v); } catch { return fallback; }
  }

  function getQuantityMin() {
    return quantityCanDisable ? 0 : SECTION_QUANTITY_DEFAULT_MIN;
  }

  function clampSectionQuantity(value) {
    const min = getQuantityMin();
    const num = Number(value);
    if (!Number.isFinite(num)) return min;
    return Math.min(SECTION_QUANTITY_MAX, Math.max(min, Math.floor(num)));
  }

  function loadSectionQuantities() {
    const stored = safeParseJSON(localStorage.getItem(STORAGE_KEYS.quantitiesSections), {}) || {};
    const normalized = {};
    SECTION_QUANTITY_SECTIONS.forEach((sec) => {
      normalized[sec] = clampSectionQuantity(stored[sec]);
    });
    return normalized;
  }

  function saveSectionQuantities() {
    try {
      localStorage.setItem(STORAGE_KEYS.quantitiesSections, JSON.stringify(sectionQuantities));
    } catch { /* ignore */ }
  }

  function getSectionQuantity(section) {
    const key = String(section || '').toLowerCase();
    if (!SECTION_QUANTITY_SECTIONS.includes(key)) return getQuantityMin();
    const stored = sectionQuantities[key];
    return clampSectionQuantity(stored);
  }

  function setSectionQuantity(section, value) {
    const key = String(section || '').toLowerCase();
    if (!SECTION_QUANTITY_SECTIONS.includes(key)) return getQuantityMin();
    if (!sectionQuantities || typeof sectionQuantities !== 'object') {
      sectionQuantities = {};
    }
    const next = clampSectionQuantity(value);
    sectionQuantities[key] = next;
    saveSectionQuantities();
    return next;
  }

  function resetSectionQuantitiesToDefaults() {
    const min = getQuantityMin();
    sectionQuantities = SECTION_QUANTITY_SECTIONS.reduce((acc, sec) => {
      acc[sec] = min;
      return acc;
    }, {});
    saveSectionQuantities();
  }

  const DEFAULT_TOAST_DURATION = 500;
  const PAGE2_TOAST_SHORT_DURATION = 2500;
  const PAGE2_TOAST_LONG_DURATION = 4000;
  const PAGE3_REDIRECT_TOAST_MESSAGE = 'Rerouting to the menu builder because all items were removed.';
  const PAGE3_REDIRECT_DELAY = 4500;

  const cartToast = (() => {
    const el = document.createElement('div');
    el.className = 'cart-toast';
    el.setAttribute('aria-live', 'polite');
    document.body.appendChild(el);
    return el;
  })();

  let cartToastTimer = null;
  function hideCartToast() {
    if (!cartToast) return;
    cartToast.classList.remove('visible');
    if (cartToastTimer) {
      clearTimeout(cartToastTimer);
      cartToastTimer = null;
    }
  }

  const redirectNotice = (() => {
    const el = document.createElement('div');
    el.className = 'redirect-notice';
    el.setAttribute('aria-live', 'polite');
    document.body.appendChild(el);
    return el;
  })();

  let redirectNoticeTimer = null;
  function hideRedirectNotice() {
    if (!redirectNotice) return;
    redirectNotice.classList.remove('visible');
    if (redirectNoticeTimer) {
      clearTimeout(redirectNoticeTimer);
      redirectNoticeTimer = null;
    }
  }

  function showRedirectNotice(message, duration = 4500) {
    if (!redirectNotice || !message) return;
    redirectNotice.textContent = message;
    redirectNotice.classList.add('visible');
    if (redirectNoticeTimer) clearTimeout(redirectNoticeTimer);
    redirectNoticeTimer = setTimeout(() => hideRedirectNotice(), duration);
  }

  function setRedirectReason(reason) {
    try {
      if (reason) {
        localStorage.setItem(STORAGE_KEYS.redirectReason, reason);
      } else {
        localStorage.removeItem(STORAGE_KEYS.redirectReason);
      }
    } catch { /* ignore */ }
  }

  function consumeRedirectReason() {
    try {
      const value = localStorage.getItem(STORAGE_KEYS.redirectReason);
      if (!value) return '';
      localStorage.removeItem(STORAGE_KEYS.redirectReason);
      return value;
    } catch { return ''; }
  }

  function maybeShowPage2RedirectReason(bodyEl) {
    if (!bodyEl || !bodyEl.classList.contains('page2')) return;
    const reason = consumeRedirectReason();
    if (!reason) return;
    showRedirectNotice(reason);
  }

  function showCartToast(section, isActive, overrideMessage, options = {}) {
    const delayOptions = options || {};
    if (!cartToast || !section || (!toastEnabled && !delayOptions.force)) return;
    const label = SECTION_LABELS[section] || section;
    const defaultMessage = isActive ? `${label} added to cart` : `${label} removed from cart`;
    const message = overrideMessage || defaultMessage;
    cartToast.textContent = message;
    cartToast.classList.add('visible');
    if (cartToastTimer) clearTimeout(cartToastTimer);
    if (!delayOptions.persistUntilHide) {
      const explicitDuration = Number.isFinite(delayOptions.duration) ? delayOptions.duration : null;
      const isPage2 = document.body && document.body.classList && document.body.classList.contains('page2');
      const page2Delay = toastPage2Long ? PAGE2_TOAST_LONG_DURATION : PAGE2_TOAST_SHORT_DURATION;
      const delay = explicitDuration ?? (isPage2 ? page2Delay : DEFAULT_TOAST_DURATION);
      cartToastTimer = setTimeout(() => hideCartToast(), delay);
    }
  }

  window.addEventListener('beforeunload', hideCartToast);

  function getIngredientGroupsForSection(section) {
    if (!section) return [];
    const key = String(section).toLowerCase();
    return SECTION_INGREDIENT_GROUPS[key] || [];
  }

  function removeIngredientGroupsForSection(section) {
    const groups = getIngredientGroupsForSection(section);
    if (!groups.length) return;
    const stored = safeParseJSON(localStorage.getItem(STORAGE_KEYS.ingredients), {});
    if (!stored || typeof stored !== 'object') return;
    let mutated = false;
    groups.forEach((group) => {
      if (group in stored) {
        delete stored[group];
        mutated = true;
      }
    });
    if (mutated) {
      saveIngredientsToStorage(stored);
    }
  }

  function removeQuantitiesForSection(section) {
    const groups = getIngredientGroupsForSection(section);
    if (!groups.length) return;
    try {
      const quantities = safeParseJSON(localStorage.getItem(STORAGE_KEYS.quantities), {});
      if (!quantities || typeof quantities !== 'object') return;
      let mutated = false;
      const prefixes = groups.map((group) => `${group}|`);
      Object.keys(quantities).forEach((key) => {
        if (prefixes.some((prefix) => key.startsWith(prefix))) {
          delete quantities[key];
          mutated = true;
        }
      });
      if (mutated) {
        localStorage.setItem(STORAGE_KEYS.quantities, JSON.stringify(quantities));
      }
    } catch { /* ignore */ }
  }

  function readManualDisabledSections() {
    const stored = safeParseJSON(localStorage.getItem(STORAGE_KEYS.manualDisabledSections), []);
    if (!Array.isArray(stored)) return [];
    return stored.map((sec) => String(sec || '').toLowerCase()).filter(Boolean);
  }

  function persistManualDisabledSections(sections) {
    const list = Array.isArray(sections) ? sections : [];
    const normalized = Array.from(new Set(list.filter(Boolean).map((sec) => String(sec).toLowerCase())));
    try {
      localStorage.setItem(STORAGE_KEYS.manualDisabledSections, JSON.stringify(normalized));
    } catch { /* ignore */ }
  }

  function markSectionManualDisabled(section) {
    if (!section) return;
    const normalized = String(section).toLowerCase();
    const manual = new Set(readManualDisabledSections());
    if (manual.has(normalized)) return;
    manual.add(normalized);
    persistManualDisabledSections(Array.from(manual));
  }

  function markSectionInactive(section) {
    if (!section) return;
    const normalized = String(section).toLowerCase();
    try {
      const active = safeParseJSON(localStorage.getItem(STORAGE_KEYS.activeSections), {});
      if (!active || typeof active !== 'object') return;
      active[normalized] = false;
      localStorage.setItem(STORAGE_KEYS.activeSections, JSON.stringify(active));
    } catch { /* ignore */ }
  }

  // Section: Persisted settings variables (defaults set further down)
  let labelSelects = true;
  let titleSelects = true;
  let toastEnabled = true;
  let toastPage2Long = true;
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
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.ingredients) || '{}');
      return normalizeIngredientData(stored) || {};
    } catch { return {}; }
  }

  function loadOrderItemsFromStorage() {
    try {
      const stored = safeParseJSON(localStorage.getItem(STORAGE_KEYS.orderItems), []);
      return Array.isArray(stored) ? stored : [];
    } catch { return []; }
  }

  function saveOrderItemsToStorage(items) {
    try {
      localStorage.setItem(STORAGE_KEYS.orderItems, JSON.stringify(Array.isArray(items) ? items : []));
    } catch { /* ignore */ }
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

  // Section: Menu + Ingredient Alphabetizing
  const ALPHABET_COLLATOR = new Intl.Collator(undefined, { sensitivity: 'base', numeric: true });

  function getMenuText(node) {
    if (!node) return '';
    const txt = node.textContent || '';
    return txt.replace(/\s+/g, ' ').trim();
  }

  function getIngredientLabelText(label) {
    if (!label) return '';
    const clone = label.cloneNode(true);
    clone.querySelectorAll('input, select, textarea, button, .sauce-qty, .qty-controls').forEach((el) => el.remove());
    return (clone.textContent || '')
      .replace(/\(required\)/ig, '')
      .replace(/\(x\d+\)/ig, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function sortDirectChildren(parent, items, getText) {
    if (!parent || !Array.isArray(items) || items.length < 2) return false;
    const mapped = items.map((node, idx) => ({ node, idx, text: getText(node) }));
    const sorted = [...mapped].sort((a, b) => {
      const cmp = ALPHABET_COLLATOR.compare(a.text, b.text);
      return cmp || (a.idx - b.idx);
    });
    const changed = sorted.some((entry, idx) => entry.node !== items[idx]);
    if (!changed) return false;
    sorted.forEach((entry) => parent.appendChild(entry.node));
    return true;
  }

  function sortIngredientFieldset(fieldset) {
    if (!fieldset) return false;
    const children = Array.from(fieldset.children);
    const pairs = [];
    for (let i = 0; i < children.length; i += 1) {
      const node = children[i];
      if (!node || node.tagName !== 'LABEL') continue;
      const hasIngredient = !!node.querySelector('input[type="checkbox"][name$="_ingredients[]"]');
      if (!hasIngredient) continue;
      const next = children[i + 1];
      const br = next && next.tagName === 'BR' ? next : null;
      pairs.push({ label: node, br });
      if (br) i += 1;
    }
    if (pairs.length < 2) return false;
    const sorted = [...pairs].sort((a, b) => {
      const cmp = ALPHABET_COLLATOR.compare(getIngredientLabelText(a.label), getIngredientLabelText(b.label));
      return cmp;
    });
    const changed = sorted.some((entry, idx) => entry.label !== pairs[idx].label);
    if (!changed) return false;
    const tailNode = (pairs[pairs.length - 1].br || pairs[pairs.length - 1].label).nextSibling;
    sorted.forEach((entry) => {
      fieldset.insertBefore(entry.label, tailNode);
      if (entry.br) fieldset.insertBefore(entry.br, tailNode);
    });
    return true;
  }

  function applyAutomaticAlphabetizing() {
    let changed = false;

    const menuActions = document.querySelector('.menu-actions');
    if (menuActions) {
      const cards = Array.from(menuActions.querySelectorAll(':scope > .menu-action-card'));
      changed = sortDirectChildren(
        menuActions,
        cards,
        (card) => getMenuText(card.querySelector('.menu-launch-label') || card.querySelector('.menu-launch'))
      ) || changed;
    }

    const swiperTrack = document.querySelector('.mobile-menu-swiper .swiper-track');
    if (swiperTrack) {
      const chips = Array.from(swiperTrack.querySelectorAll(':scope > .menu-launch[data-target]'));
      changed = sortDirectChildren(
        swiperTrack,
        chips,
        (chip) => getMenuText(chip.querySelector('.menu-launch-label') || chip)
      ) || changed;
    }

    const main = document.querySelector('main');
    if (main) {
      const overlays = Array.from(main.querySelectorAll(':scope > .menu-overlay[data-section]'));
      changed = sortDirectChildren(
        main,
        overlays,
        (overlay) => getMenuText(overlay.querySelector('.overlay-header h2') || overlay.querySelector('.menu-summary-label'))
      ) || changed;
    }

    document.querySelectorAll('fieldset').forEach((fieldset) => {
      changed = sortIngredientFieldset(fieldset) || changed;
    });

    return changed;
  }

  function installAutomaticAlphabetizeObserver() {
    const root = document.querySelector('main') || document.body;
    if (!root) return;
    let queued = false;
    const schedule = () => {
      if (queued) return;
      queued = true;
      const run = () => {
        queued = false;
        applyAutomaticAlphabetizing();
      };
      if (typeof window.requestAnimationFrame === 'function') window.requestAnimationFrame(run);
      else setTimeout(run, 0);
    };
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'characterData') {
          schedule();
          return;
        }
        if (mutation.type === 'childList' && (mutation.addedNodes.length || mutation.removedNodes.length)) {
          schedule();
          return;
        }
      }
    });
    observer.observe(root, { childList: true, subtree: true, characterData: true });
  }

  const CASE_EXCEPTION_WORDS = new Set(['and', 'or', 'of', 'the', 'a', 'an', 'in', 'on', 'for', 'to']);
  const CASE_EXCEPTION_SELECTOR = 'main fieldset label, body.page3 #order-summary li, body.page3 #order-summary .summary-inline-option span';

  function applyIngredientCaseExceptions(root = document) {
    if (!root || !root.querySelectorAll) return;
    const targets = Array.from(root.querySelectorAll(CASE_EXCEPTION_SELECTOR));
    targets.forEach((target) => {
      target.querySelectorAll('span.case-exception').forEach((span) => {
        span.replaceWith(document.createTextNode(span.textContent || ''));
      });
      const walker = document.createTreeWalker(target, NodeFilter.SHOW_TEXT, {
        acceptNode(node) {
          if (!node || !node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
          const parent = node.parentElement;
          if (!parent) return NodeFilter.FILTER_REJECT;
          if (parent.closest('select, option, button, script, style, textarea')) return NodeFilter.FILTER_REJECT;
          if (parent.classList && parent.classList.contains('case-exception')) return NodeFilter.FILTER_REJECT;
          return NodeFilter.FILTER_ACCEPT;
        }
      });
      const textNodes = [];
      let current = walker.nextNode();
      while (current) {
        textNodes.push(current);
        current = walker.nextNode();
      }
      textNodes.forEach((node) => {
        const txt = node.nodeValue || '';
        const next = txt.replace(/\b([A-Za-z]+)\b/g, (full, word) => {
          const lower = String(word).toLowerCase();
          return CASE_EXCEPTION_WORDS.has(lower) ? lower : full;
        });
        if (next !== txt) node.nodeValue = next;
      });
    });
  }

  function installIngredientCaseExceptionObserver() {
    const root = document.body;
    if (!root) return;
    let queued = false;
    const schedule = () => {
      if (queued) return;
      queued = true;
      const run = () => {
        queued = false;
        applyIngredientCaseExceptions(document);
      };
      if (typeof window.requestAnimationFrame === 'function') window.requestAnimationFrame(run);
      else setTimeout(run, 0);
    };
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'characterData') { schedule(); return; }
        if (mutation.type === 'childList' && (mutation.addedNodes.length || mutation.removedNodes.length)) { schedule(); return; }
      }
    });
    observer.observe(root, { childList: true, subtree: true, characterData: true });
  }

  // Section: Page Initialization
  document.addEventListener('DOMContentLoaded', () => {
    applyAutomaticAlphabetizing();
    installAutomaticAlphabetizeObserver();
    applyIngredientCaseExceptions(document);
    installIngredientCaseExceptionObserver();
    let lastTouchEnd = 0;
    document.addEventListener('touchend', (event) => {
      const now = performance.now();
      if (now - lastTouchEnd < 300) {
        event.preventDefault();
      }
      lastTouchEnd = now;
    }, { passive: false });
    const body = document.body;
    const mobileQuery = window.matchMedia('(max-width: 768px)');
    const isMobileView = () => mobileQuery.matches;
    const getNavToggleIcon = (enabled) => (enabled ? '↑' : '↓');

    let orderTypeChips = Array.from(document.querySelectorAll('.order-type-chip'));
    const orderTypeEditButtons = Array.from(document.querySelectorAll('.order-type-chip__edit'));
    const orderTypeHeading = document.querySelector('body.order-type main h1');
    const orderNoteEl = document.querySelector('body.order-type .order-note');
    const orderHeadingDefaultText = orderTypeHeading ? orderTypeHeading.textContent.trim() : 'Select your order type';
    const orderNoteDefaultText = orderNoteEl ? (orderNoteEl.textContent.trim() || 'Select your order type') : 'Select your order type';
    const refreshOrderPrompts = (type) => {
      if (orderTypeHeading) {
        const hideHeading = type === 'delivery';
        orderTypeHeading.hidden = hideHeading;
        if (!hideHeading && orderHeadingDefaultText) {
          orderTypeHeading.textContent = orderHeadingDefaultText;
        }
      }
      if (orderNoteEl) {
        if (type) {
          orderNoteEl.hidden = true;
          orderNoteEl.textContent = '';
        } else {
          orderNoteEl.hidden = false;
          orderNoteEl.textContent = orderNoteDefaultText;
        }
      }
    };

    const settingsOverlay = document.getElementById('settings-overlay');
    const settingsBtn = document.getElementById('settings-btn') || document.querySelector('.settings-button');
    const navSettingsMobileBtn = document.querySelector('.nav-settings-mobile');
    const settingsToggleBtns = Array.from(new Set([settingsBtn, navSettingsMobileBtn].filter(Boolean)));
    const settingsCloseBtn = document.getElementById('settings-close') || document.querySelector('.settings-close');
    const settingLabelSelects = document.getElementById('setting-label-selects') || document.querySelector('.setting-label-selects');
    const settingTitleSelects = document.getElementById('setting-title-selects') || document.querySelector('.setting-title-selects');
    const settingResetDisables = document.getElementById('setting-reset-disables') || document.querySelector('.setting-reset-disables');
    const settingResetKeepOpen = document.getElementById('setting-reset-keep-open') || document.querySelector('.setting-reset-keep-open');
    const settingAutoDisableEmpty = document.getElementById('setting-auto-disable-empty') || document.querySelector('.setting-auto-disable-empty');
    const settingAutoDisableSection = document.getElementById('setting-auto-disable-section') || document.querySelector('.setting-auto-disable-section');
    const settingQuantityCanDisable = document.getElementById('setting-quantity-can-disable') || document.querySelector('.setting-quantity-can-disable');
    const settingPillArrowOnly = document.getElementById('setting-pill-arrow-only') || document.querySelector('.setting-pill-arrow-only');
    const settingNextClosesOverlay = document.getElementById('setting-next-closes-overlay') || document.querySelector('.setting-next-closes-overlay');
    const settingToastEnabled = document.getElementById('setting-toast-enabled');
    const settingToastPage2Long = document.getElementById('setting-toast-page2-long');
    const settingsResetBtn = document.getElementById('settings-reset') || document.querySelector('.settings-reset');

    const navToggleBtn = document.getElementById('nav-toggle-btn') || document.querySelector('.nav-toggle');
    const themeModeBtns = Array.from(document.querySelectorAll('.theme-mode-btn, .theme-mode-toggle'));
    const footerNext = document.querySelector('.next-button');
    let page3NavEnabled = false;
    let page3NavBlockedMessage = '';

    const updateNavOffset = () => {
      const nav = document.querySelector('.left-rail');
      if (!nav) return;
      const h = nav.offsetHeight || 0;
      document.documentElement.style.setProperty('--nav-offset', `${h}px`);
    };
    window.addEventListener('resize', updateNavOffset);

    const evaluatePage3Requirements = () => {
      const okType = hasOrderTypeSelected();
      const okMenu = hasMenuSelection();
      const typeNow = (() => { try { return localStorage.getItem(STORAGE_KEYS.orderType) || ''; } catch { return ''; } })();
      const okDelivery = (typeNow !== 'delivery') || hasValidDeliveryDetails();
      const enablePage2 = okType && okDelivery;
      const enablePage3 = okType && okMenu && okDelivery;
      const needsType = !okType;
      const needsMenu = !okMenu;
      const needsDelivery = (typeNow === 'delivery') && !okDelivery;
      let tooltip = '';
      let generalMessage = '';
      if (!enablePage3) {
        if (needsType && needsMenu) {
          tooltip = 'Select an order type and choose at least one menu item to enable Page 3';
          generalMessage = 'Select an order type and choose at least one menu item to proceed';
        } else if (needsType) {
          tooltip = 'Select an order type to enable Page 3';
          generalMessage = 'Select an order type to proceed';
        } else if (needsDelivery) {
          tooltip = 'Complete delivery details to enable Page 3';
          generalMessage = 'Complete delivery details to proceed';
        } else {
          tooltip = 'Choose at least one menu item to enable Page 3';
          generalMessage = 'Choose at least one menu item to proceed';
        }
      }
      return { okType, okMenu, okDelivery, enablePage2, enablePage3, typeNow, tooltip, generalMessage };
    };

    const updateFooterNextState = () => {
      if (!footerNext) return;
      if (page3NavEnabled) {
        footerNext.removeAttribute('aria-disabled');
        footerNext.classList.remove('next-disabled');
      } else {
        footerNext.setAttribute('aria-disabled', 'true');
        footerNext.classList.add('next-disabled');
      }
    };

    const orderChip = orderTypeChips[0] || null;
    const orderChipOrigin = orderChip ? {
      parent: orderChip.parentElement,
      nextSibling: orderChip.nextElementSibling
    } : null;
    const moveOrderChipForMobile = () => {
      if (!orderChip || !orderChipOrigin || !body.classList.contains('page2')) return;
      if (mobileQuery.matches) {
        const heading = document.querySelector('body.order-type main h1');
        if (!heading) return;
        if (orderChip.parentElement !== heading.parentElement) {
          heading.insertAdjacentElement('afterend', orderChip);
          orderTypeChips = Array.from(document.querySelectorAll('.order-type-chip'));
          updateNavOffset();
        }
      } else if (orderChip.parentElement !== orderChipOrigin.parent) {
        if (orderChipOrigin.nextSibling) {
          orderChipOrigin.parent.insertBefore(orderChip, orderChipOrigin.nextSibling);
        } else {
          orderChipOrigin.parent.appendChild(orderChip);
        }
        orderTypeChips = Array.from(document.querySelectorAll('.order-type-chip'));
        updateNavOffset();
      }
    };
    moveOrderChipForMobile();
    if (mobileQuery && typeof mobileQuery.addEventListener === 'function') {
      mobileQuery.addEventListener('change', moveOrderChipForMobile);
    }

    // Lock Page 2/3 navigation until prerequisites are met
    function hasOrderTypeSelected() {
      try { return !!localStorage.getItem(STORAGE_KEYS.orderType); } catch { return false; }
    }
    function hasMenuSelection() {
      const orderItems = loadOrderItemsFromStorage();
      if (Array.isArray(orderItems) && orderItems.length > 0) return true;
      // Align with builder rules: at least one section active; if Sauces active, at least one sauce
      let activeSections = {};
      try { activeSections = JSON.parse(localStorage.getItem(STORAGE_KEYS.activeSections) || '{}'); } catch { activeSections = {}; }
      const anySectionActive = Object.values(activeSections).some(Boolean);
      if (!anySectionActive) return false;
      const saucesActive = !!activeSections.sauces;
      if (!saucesActive) return true;
      try {
        const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.ingredients) || '{}');
        const ing = normalizeIngredientData(stored) || {};
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
        const d = readDeliveryData();
        const parts = [d.name, d.address, d.suite, [d.city, d.zip].filter(Boolean).join(' ')].filter(Boolean);
        if (parts.length) {
          const inline = `${label} --- ${parts.join(', ')}`;
          const stacked = `${label}\n${parts.join('\n')}`;
          const primaryChip = orderTypeChips[0];
          let needsStacked = isMobileView();
          if (!needsStacked && primaryChip) {
            const primaryValueEl = primaryChip.querySelector('.order-type-chip__value');
            if (primaryValueEl) {
              primaryValueEl.textContent = inline;
              needsStacked = primaryChip.scrollWidth > primaryChip.clientWidth;
            }
          }
          label = needsStacked ? stacked : inline;
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
      refreshOrderPrompts(type);
    };

    const updatePage3NavState = () => {
      const {
        enablePage2,
        enablePage3,
        typeNow,
        tooltip,
        generalMessage
      } = evaluatePage3Requirements();

      const lockAnchor = (anchor, enabled, hint) => {
        if (enabled) {
          anchor.removeAttribute('aria-disabled');
          anchor.removeAttribute('tabindex');
          anchor.removeEventListener('click', preventNavClick);
          anchor.removeAttribute('title');
        } else {
          anchor.setAttribute('aria-disabled', 'true');
          anchor.setAttribute('tabindex', '-1');
          anchor.addEventListener('click', preventNavClick);
          if (hint) anchor.setAttribute('title', hint);
        }
      };

      document.querySelectorAll('.left-rail a[href$="page2.html"]').forEach((a) => {
        const tip = enablePage2 ? '' : (typeNow === 'delivery' ? 'Complete delivery details to enable Page 2' : 'Select an order type to enable Page 2');
        lockAnchor(a, enablePage2, tip);
      });

      document.querySelectorAll('.left-rail a[href$="page3.html"]').forEach((a) => {
        lockAnchor(a, enablePage3, tooltip);
      });

      page3NavEnabled = enablePage3;
      page3NavBlockedMessage = generalMessage;
      updateFooterNextState();
    }

    let navInitialEnabled = null;
    try {
      const storedNav = localStorage.getItem(STORAGE_KEYS.navEnabled);
      if (storedNav !== null) {
        navInitialEnabled = storedNav === 'true';
      }
    } catch { /* ignore */ }
    if (navInitialEnabled === null) {
      navInitialEnabled = true;
    }

    const setNavEnabled = (enabled) => {
      body.classList.toggle('nav-enabled', !!enabled);
      try { localStorage.setItem(STORAGE_KEYS.navEnabled, String(!!enabled)); } catch { }
      updateNavOffset();
      updateNavToggleLabel();
    };

    const updateThemeModeLabel = () => {
      if (!themeModeBtns.length) return;
      const isDark = body.classList.contains('theme-dark');
      const label = isDark ? 'Switch to light mode' : 'Switch to dark mode';
      const modeText = isDark ? 'Light Mode' : 'Dark Mode';
      const iconText = isDark ? '☀️' : '🌙';
      themeModeBtns.forEach((btn) => {
        const iconEl = btn.querySelector('.theme-icon');
        const labelEl = btn.querySelector('.theme-label');
        if (iconEl) {
          iconEl.textContent = iconText;
        } else if (btn.classList.contains('mobile-theme-toggle')) {
          btn.textContent = iconText;
        }
        if (labelEl) {
          labelEl.textContent = modeText;
        } else if (!btn.classList.contains('mobile-theme-toggle')) {
          btn.textContent = modeText;
        }
        btn.setAttribute('aria-label', label);
      });
    };

    const updateNavToggleLabel = () => {
      if (!navToggleBtn) return;
      const navEnabled = body.classList.contains('nav-enabled');
      const labelText = navEnabled ? 'Disable Navigation' : 'Enable Navigation';
      const labelEl = navToggleBtn.querySelector('.theme-label');
      const iconEl = navToggleBtn.querySelector('.theme-icon');
      if (labelEl) {
        labelEl.textContent = labelText;
      } else {
        navToggleBtn.textContent = labelText;
      }
      if (iconEl) {
        iconEl.textContent = getNavToggleIcon(navEnabled);
      }
      navToggleBtn.setAttribute('aria-label', labelText);
    };

    if (orderTypeEditButtons.length) {
      orderTypeEditButtons.forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          window.location.href = 'page2.html';
        });
      });
    }

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

    try {
      const v = localStorage.getItem(STORAGE_KEYS.settingsToastEnabled);
      toastEnabled = v === null ? true : v === 'true';
    } catch { toastEnabled = true; }
    if (settingToastEnabled) settingToastEnabled.checked = toastEnabled;

    try {
      const v = localStorage.getItem(STORAGE_KEYS.settingsToastPage2Long);
      toastPage2Long = v === null ? true : v === 'true';
    } catch { toastPage2Long = true; }
    if (settingToastPage2Long) settingToastPage2Long.checked = toastPage2Long;

    try {
      const v = localStorage.getItem(STORAGE_KEYS.settingsQuantityCanDisable);
      quantityCanDisable = v === null ? true : v === 'true';
    } catch { quantityCanDisable = true; }
    if (settingQuantityCanDisable) settingQuantityCanDisable.checked = quantityCanDisable;
    if (typeof applyQuantitySettingState === 'function') applyQuantitySettingState();

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

    // Footer Next behavior: default OFF
    let nextClosesOverlay = false;
    try {
      const v = localStorage.getItem(STORAGE_KEYS.settingsNextClosesOverlay);
      nextClosesOverlay = v === 'true';
    } catch { nextClosesOverlay = false; }
    if (settingNextClosesOverlay) settingNextClosesOverlay.checked = nextClosesOverlay;

    // Next arrow toggle: default OFF
    // Ensure the settings overlay has a deterministic initial hidden state.
    // If you want the settings to persist open between reloads, implement a storage key.
    if (settingsOverlay) {
      // If the DOM has the overlay visible by default, force it closed on load.
      // This avoids the "starts open and won't close" issue.
      settingsOverlay.hidden = true;
      settingsOverlay.setAttribute('aria-hidden', 'true');
      body.classList.remove('settings-open');
      docEl.classList.remove('settings-open');
      body.style.position = '';
      body.style.top = '';
      body.style.left = '';
      body.style.right = '';
      body.style.width = '';
      settingsToggleBtns.forEach((btn) => btn.setAttribute('aria-expanded', 'false'));
    }

    // Apply initial nav and theme state from storage
    setNavEnabled(navInitialEnabled);
    restoreThemeFromStorage();

    const collectSettingState = () => ({
      labelSelects,
      titleSelects,
      pillArrowOnly
    });
    const detectSettingConflicts = (state) => {
      const issues = [];
      if (!state.labelSelects && !state.titleSelects && state.pillArrowOnly) {
        issues.push('With both "Ingredient label toggles checkbox" and "Section title toggles checkbox" turned off while "Menu item arrow expands/collapses only" is on, clicking menu titles or labels will not toggle selections; only the tiny arrow area will work.');
      }
      return issues;
    };
    const maybeWarnSettingConflicts = (prevState, revertFn, onProceed) => {
      const issues = detectSettingConflicts(collectSettingState());
      if (!issues.length) {
        if (typeof onProceed === 'function') onProceed();
        return;
      }
      const msg = `Warning: These settings may make menus feel unresponsive:\n- ${issues.join('\n- ')}\n\nContinue with this combination?`;
      openCustomConfirm(msg, (proceed) => {
        if (!proceed && typeof revertFn === 'function') {
          revertFn(prevState);
          return;
        }
        if (proceed && typeof onProceed === 'function') onProceed();
      });
    };

    let settingsScrollY = 0;
    const lockSettingsScroll = () => {
      if (body.classList.contains('settings-open')) return;
      settingsScrollY = window.scrollY || window.pageYOffset || 0;
      body.classList.add('settings-open');
      docEl.classList.add('settings-open');
      body.style.position = 'fixed';
      body.style.top = `-${settingsScrollY}px`;
      body.style.left = '0';
      body.style.right = '0';
      body.style.width = '100%';
    };
    const unlockSettingsScroll = () => {
      if (!body.classList.contains('settings-open')) return;
      body.classList.remove('settings-open');
      docEl.classList.remove('settings-open');
      body.style.position = '';
      body.style.top = '';
      body.style.left = '';
      body.style.right = '';
      body.style.width = '';
      window.scrollTo(0, settingsScrollY || 0);
      settingsScrollY = 0;
    };

    const closeSettings = () => {
      if (!settingsOverlay) return;
      settingsOverlay.hidden = true;
      settingsOverlay.setAttribute('aria-hidden', 'true');
      unlockSettingsScroll();
      settingsToggleBtns.forEach((btn) => btn.setAttribute('aria-expanded', 'false'));
    };

    const openSettings = () => {
      if (!settingsOverlay) return;
      settingsOverlay.hidden = false;
      settingsOverlay.setAttribute('aria-hidden', 'false');
      lockSettingsScroll();
      settingsToggleBtns.forEach((btn) => btn.setAttribute('aria-expanded', 'true'));
      // Focus first focusable control for keyboard users if present
      const first = settingsOverlay.querySelector('input, button, [tabindex]:not([tabindex="-1"])');
      if (first && typeof first.focus === 'function') first.focus();
    };

    const resetSettingsToDefaults = () => {
      labelSelects = true;
      titleSelects = true;
      resetDisables = false;
      resetKeepOpen = true;
      autoDisableEmpty = false;
      autoDisableSection = false;
      quantityCanDisable = true;
      pillArrowOnly = false;
      nextClosesOverlay = false;
      toastEnabled = true;
      toastPage2Long = true;
      try {
        localStorage.setItem(STORAGE_KEYS.settingsLabelSelects, 'true');
        localStorage.setItem(STORAGE_KEYS.settingsTitleSelects, 'true');
        localStorage.setItem(STORAGE_KEYS.settingsResetDisables, 'false');
        localStorage.setItem(STORAGE_KEYS.settingsResetKeepOpen, 'true');
        localStorage.setItem(STORAGE_KEYS.settingsAutoDisableEmpty, 'false');
        localStorage.setItem(STORAGE_KEYS.settingsAutoDisableSection, 'false');
        localStorage.setItem(STORAGE_KEYS.settingsQuantityCanDisable, 'true');
        localStorage.setItem(STORAGE_KEYS.settingsPillArrowOnly, 'false');
        localStorage.setItem(STORAGE_KEYS.settingsNextClosesOverlay, 'false');
        localStorage.setItem(STORAGE_KEYS.settingsToastEnabled, 'true');
        localStorage.setItem(STORAGE_KEYS.settingsToastPage2Long, 'true');
      } catch { }
      if (settingLabelSelects) settingLabelSelects.checked = true;
      if (settingTitleSelects) settingTitleSelects.checked = true;
      if (settingResetDisables) settingResetDisables.checked = false;
      if (settingResetKeepOpen) settingResetKeepOpen.checked = true;
      if (settingAutoDisableEmpty) settingAutoDisableEmpty.checked = false;
      if (settingAutoDisableSection) settingAutoDisableSection.checked = false;
      if (settingQuantityCanDisable) settingQuantityCanDisable.checked = true;
      if (settingPillArrowOnly) settingPillArrowOnly.checked = false;
      if (settingNextClosesOverlay) settingNextClosesOverlay.checked = false;
      if (settingToastEnabled) settingToastEnabled.checked = true;
      if (settingToastPage2Long) settingToastPage2Long.checked = true;
      if (typeof applyQuantitySettingState === 'function') applyQuantitySettingState();
    };

    if (settingsResetBtn) {
      settingsResetBtn.addEventListener('click', resetSettingsToDefaults);
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
    maybeShowPage2RedirectReason(body);
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
      const formatPhoneInput = (v) => {
        const digits = String(v || '').replace(/\D+/g, '').slice(0, 10);
        const area = digits.slice(0, 3);
        const prefix = digits.slice(3, 6);
        const line = digits.slice(6, 10);
        let out = '';
        if (!area) {
          out = '';
        } else if (area.length < 3) {
          out = area;
        } else {
          out = `(${area})`;
        }
        if (prefix) out += `-${prefix}`;
        if (line) out += `-${line}`;
        return out;
      };
      const getCaretFromDigitCount = (value, digitCount) => {
        let seen = 0;
        for (let i = 0; i < value.length; i++) {
          if (/\d/.test(value[i])) {
            seen++;
            if (seen === digitCount) {
              return i + 1;
            }
          }
        }
        return value.length;
      };

      const installPhoneFormatter = () => {
        const phoneInput = deliveryFields.phone;
        if (!phoneInput) return;
        if (phoneInput.value) phoneInput.value = formatPhoneInput(phoneInput.value);
        phoneInput.addEventListener('input', () => {
          const rawValue = phoneInput.value;
          const selectionStart = phoneInput.selectionStart || 0;
          const digitsBefore = rawValue.slice(0, selectionStart).replace(/\D+/g, '').length;
          const formatted = formatPhoneInput(rawValue);
          phoneInput.value = formatted;
          const digits = formatted.replace(/\D+/g, '');
          const targetCaret = getCaretFromDigitCount(formatted, digitsBefore);
          const pos = Math.min(targetCaret, formatted.length);
          phoneInput.setSelectionRange(pos, pos);
          if (digits.length === 10 || digits.length === 0) {
            try {
              phoneInput.setCustomValidity('');
              if (typeof phoneInput.reportValidity === 'function') phoneInput.reportValidity();
            } catch { }
          }
        });
      };

      const showDeliveryForm = (show) => {
        if (!dFormInit) return;
        dFormInit.hidden = !show;
        if (!show && deliveryError) deliveryError.hidden = true;
        body.classList.toggle('delivery-open', !!show);
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
        showDeliveryForm(show);
        const errEl = document.getElementById('delivery-error');
        if (errEl) errEl.hidden = true;
        populateDeliveryFieldsFromStorage();
        installPhoneFormatter();
      }

      const cards = document.querySelectorAll('.order-card');
      const deliveryCloseBtn = document.querySelector('.delivery-close-button');
      const clearCardSelection = () => cards.forEach((c) => c.classList.remove('selected'));

      if (deliveryCloseBtn) {
        deliveryCloseBtn.addEventListener('click', () => {
          setOrderType('');
          clearCardSelection();
          showDeliveryForm(false);
        });
      }

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
        try {
          if (typeof type === 'string' && type) {
            localStorage.setItem(STORAGE_KEYS.orderType, type);
          } else {
            localStorage.removeItem(STORAGE_KEYS.orderType);
          }
        } catch { }
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
          err.textContent = 'Please choose at least one menu item.';
        } else {
          // If sauces section is active, ensure at least one sauce selected
          const saucesToggle = document.querySelector('.section[data-id="sauces"] .section-toggle');
          if (saucesToggle && saucesToggle.checked) {
            const ing = loadIngredientsFromStorage();
            const sauces = Array.isArray(ing['sauces_ingredients[]']) ? ing['sauces_ingredients[]'] : [];
            if (!sauces.length) {
              err.hidden = false;
              err.textContent = 'Select at least one sauce';
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
      saveIngredientCatalogFromDOM();
      const overlays = Array.from(document.querySelectorAll('.menu-overlay[data-section]'));
      const menuLaunchButtons = Array.from(document.querySelectorAll('.menu-launch[data-target]'));
      const backToMenuBtn = document.querySelector('.back-to-menu');
      const backToMenuOriginalParent = backToMenuBtn ? backToMenuBtn.parentElement : null;
      const backToMenuOriginalNext = backToMenuBtn ? backToMenuBtn.nextElementSibling : null;
      const sliderTrack = document.querySelector('.mobile-menu-swiper .swiper-track');
      const sliderChips = sliderTrack ? Array.from(sliderTrack.querySelectorAll('.swiper-chip')) : [];
      const sliderPrev = document.querySelector('.mobile-menu-swiper .swiper-arrow-prev');
      const sliderNext = document.querySelector('.mobile-menu-swiper .swiper-arrow-next');
      const sliderState = {
        start: 0,
        visibleCount: 0,
        maxStart: 0,
      };
      const SLIDER_EDGE_EPSILON = 6;

      const syncSliderStateFromScroll = () => {
        if (!sliderTrack || !sliderChips.length) return;
        const sl = sliderTrack.scrollLeft || 0;
        const maxScroll = Math.max(0, sliderTrack.scrollWidth - sliderTrack.clientWidth);
        const trackStyle = getComputedStyle(sliderTrack);
        const paddingLeft = parseFloat(trackStyle.paddingLeft) || 0;

        let idx = 0;
        for (let i = 0; i < sliderChips.length; i++) {
          const chip = sliderChips[i];
          const left = chip.offsetLeft - paddingLeft;
          if (left <= sl + 1) idx = i;
          else break;
        }

        const atLeftEdge = sl <= SLIDER_EDGE_EPSILON;
        const atRightEdge = sl >= (maxScroll - SLIDER_EDGE_EPSILON);
        if (atLeftEdge) idx = 0;
        else if (atRightEdge) idx = sliderState.maxStart || 0;

        sliderState.start = Math.min(Math.max(0, idx), sliderState.maxStart || 0);
        if (sliderPrev) sliderPrev.disabled = maxScroll <= 1 || atLeftEdge;
        if (sliderNext) sliderNext.disabled = maxScroll <= 1 || atRightEdge;
      };

      const renderSliderWindow = () => {
        if (!sliderTrack || !sliderChips.length) return;
        const targetIndex = Math.min(sliderState.start, sliderChips.length - 1);
        const targetChip = sliderChips[targetIndex];
        
        if (sliderState.start === 0) {
          sliderTrack.scrollLeft = 0;
        } else if (targetChip) {
          const trackStyle = getComputedStyle(sliderTrack);
          const paddingLeft = parseFloat(trackStyle.paddingLeft) || 0;
          const gap = parseFloat(trackStyle.gap) || 0;
          let offset = targetChip.offsetLeft - paddingLeft;
          if (sliderState.start > 0) {
            offset -= gap;
          }
          sliderTrack.scrollLeft = Math.max(0, offset);
        }
        syncSliderStateFromScroll();
        requestAnimationFrame(syncSliderStateFromScroll);
      };

      const moveSlider = (delta) => {
        if (!sliderTrack || !sliderChips.length) return;
        const sl = sliderTrack.scrollLeft || 0;
        const maxScroll = Math.max(0, sliderTrack.scrollWidth - sliderTrack.clientWidth);
        if (maxScroll <= 1) {
          syncSliderStateFromScroll();
          return;
        }
        const step = Math.max(48, Math.floor(sliderTrack.clientWidth * 0.8));
        let targetLeft = sl + (delta * step);
        targetLeft = Math.min(Math.max(0, targetLeft), maxScroll);
        if (Math.abs(targetLeft - sl) <= 1) {
          syncSliderStateFromScroll();
          return;
        }
        sliderTrack.scrollTo({ left: targetLeft, behavior: 'smooth' });
        requestAnimationFrame(syncSliderStateFromScroll);
      };

      const getVisibleCount = () => {
        if (!sliderTrack) return 1;
        const swiper = sliderTrack.closest('.mobile-menu-swiper');
        if (!swiper) return 1;
        const count = parseInt(getComputedStyle(swiper).getPropertyValue('--slider-visible-count'), 10);
        if (Number.isFinite(count) && count > 0) return Math.min(count, sliderChips.length);
        return Math.max(1, sliderChips.length);
      };

      const updateNavScrollVisibility = () => {
        if (!sliderTrack) return;
        const swiper = sliderTrack.closest('.mobile-menu-swiper');
        if (!swiper) return;
        const show = window.innerWidth >= 1764 && window.innerHeight >= 1858;
        swiper.classList.toggle('show-scroll', show);
      };

      const ensureSliderAlignment = () => {
        if (!sliderTrack || !sliderChips.length) return;
        sliderState.visibleCount = getVisibleCount();
        sliderState.maxStart = Math.max(0, sliderChips.length - 1);
        sliderState.start = Math.min(sliderState.start, sliderState.maxStart);
        renderSliderWindow();
      };

      const bindSliderArrow = (btn, delta) => {
        if (!btn) return;
        let lastPointerMoveAt = 0;
        const runMove = (evt) => {
          if (evt) {
            evt.preventDefault();
            evt.stopPropagation();
          }
          ensureSliderAlignment();
          syncSliderStateFromScroll();
          moveSlider(delta);
        };
        if (window.PointerEvent) {
          btn.addEventListener('pointerdown', (evt) => {
            if (evt.button != null && evt.button !== 0) return;
            lastPointerMoveAt = performance.now();
            runMove(evt);
          });
        } else {
          btn.addEventListener('mousedown', (evt) => {
            if (evt.button != null && evt.button !== 0) return;
            lastPointerMoveAt = performance.now();
            runMove(evt);
          });
          btn.addEventListener('touchstart', (evt) => {
            lastPointerMoveAt = performance.now();
            runMove(evt);
          }, { passive: false });
        }
        btn.addEventListener('click', (evt) => {
          if (performance.now() - lastPointerMoveAt < 450) {
            evt.preventDefault();
            evt.stopPropagation();
            return;
          }
          runMove(evt);
        });
      };
      bindSliderArrow(sliderPrev, -1);
      bindSliderArrow(sliderNext, 1);
      if (footerNext) {
        footerNext.addEventListener('click', (event) => {
          if (nextClosesOverlay && typeof anyOverlayOpen === 'function' && anyOverlayOpen()) {
            event.preventDefault();
            if (typeof closeAllOverlays === 'function') closeAllOverlays();
            return;
          }
          const state = evaluatePage3Requirements();
          page3NavEnabled = state.enablePage3;
          page3NavBlockedMessage = state.generalMessage;
          updateFooterNextState();
          if (!page3NavEnabled) {
            event.preventDefault();
            if (builderError) {
              builderError.hidden = false;
              builderError.textContent = page3NavBlockedMessage || 'Please choose at least one menu item.';
              if (typeof ensureBuilderErrorVisible === 'function') {
                ensureBuilderErrorVisible();
              }
            }
          }
        });
      }
      const footerResetBtn = document.querySelector('.footer-reset');
      if (footerResetBtn) {
        footerResetBtn.addEventListener('click', (event) => {
          event.preventDefault();
          openCustomConfirm('Reset all selections and settings?', (confirmed) => {
            if (!confirmed) return;
            resetMenuSelections();
            if (typeof footerResetBtn.focus === 'function') {
              footerResetBtn.focus({ preventScroll: true });
            }
          }, { restoreFocus: false });
        });
      }
      if (sliderTrack) {
        const handleResize = () => {
          ensureSliderAlignment();
          updateNavScrollVisibility();
        };
        window.addEventListener('resize', handleResize);
        window.requestAnimationFrame(handleResize);

        let sliderScrollRaf = null;
        const updateStartFromScroll = () => {
          syncSliderStateFromScroll();
        };
        sliderTrack.addEventListener('scroll', () => {
          if (sliderScrollRaf) cancelAnimationFrame(sliderScrollRaf);
          sliderScrollRaf = requestAnimationFrame(updateStartFromScroll);
        }, { passive: true });
      }
      const moveBackButtonToOverlay = (overlay) => {
        if (!backToMenuBtn || !overlay) return;
        const header = overlay.querySelector('.overlay-header');
        if (!header) return;
        if (header.parentElement && header.parentElement.contains(backToMenuBtn)) return;
        header.insertAdjacentElement('beforebegin', backToMenuBtn);
      };
      const restoreBackButton = () => {
        if (!backToMenuBtn || !backToMenuOriginalParent) return;
        if (backToMenuBtn.parentElement === backToMenuOriginalParent) return;
        if (backToMenuOriginalNext && backToMenuOriginalNext.parentElement === backToMenuOriginalParent) {
          backToMenuOriginalParent.insertBefore(backToMenuBtn, backToMenuOriginalNext);
        } else {
          backToMenuOriginalParent.appendChild(backToMenuBtn);
        }
      };
      const sectionToggles = Array.from(document.querySelectorAll('.section-toggle[data-section]'));
      const pizzaSizeRadios = Array.from(document.querySelectorAll('input[name="pizza_size"]'));
      const sectionTitles = Array.from(document.querySelectorAll('.menu-summary .menu-summary-label'));
      const ingredientCheckboxes = Array.from(document.querySelectorAll('input[type="checkbox"][name]'));
      const builderError = document.getElementById('builder-error');
      const manualDisabledSet = new Set(readManualDisabledSections());
      const updateSectionQuantityControl = (wrap, sec) => {
        if (!wrap) return;
        const countSpan = wrap.querySelector('.qty-controls-value');
        const qty = getSectionQuantity(sec);
        if (countSpan) countSpan.textContent = `(x${qty})`;
        const dec = wrap.querySelector('.qty-control-decrement');
        const min = getQuantityMin();
        if (dec) dec.disabled = qty <= min;
      };
      const ensureSectionQuantityControl = (sec) => {
        const sectionEl = document.getElementById(sec);
        if (!sectionEl) return;
        const summary = sectionEl.querySelector('.menu-summary');
        if (!summary) return;
        let wrap = summary.querySelector('.qty-controls');
        if (!wrap) {
          wrap = document.createElement('span');
          wrap.className = 'qty-controls';
          wrap.dataset.section = sec;
          const count = document.createElement('span');
          count.className = 'qty-controls-value';
          const dec = document.createElement('button');
          dec.type = 'button';
          dec.className = 'qty-control-decrement';
          dec.textContent = '−';
          dec.setAttribute('aria-label', `Decrease ${SECTION_LABELS[sec] || sec} quantity`);
          const inc = document.createElement('button');
          inc.type = 'button';
          inc.className = 'qty-control-increment';
          inc.textContent = '+';
          inc.setAttribute('aria-label', `Increase ${SECTION_LABELS[sec] || sec} quantity`);
          const adjust = (delta) => {
            const current = getSectionQuantity(sec);
            const next = setSectionQuantity(sec, current + delta);
            if (next === null) return;
            const toggle = document.querySelector(`.section-toggle[data-section="${sec}"]`);
            if (toggle && !toggle.disabled) {
              if (quantityCanDisable && next === 0) {
                if (toggle.checked) {
                  quantityDisableTrigger = sec;
                  try {
                    toggle.checked = false;
                    toggle.dispatchEvent(new Event('change', { bubbles: true }));
                  } finally {
                    quantityDisableTrigger = '';
                  }
                }
              } else if (!toggle.checked) {
                toggle.checked = true;
                toggle.dispatchEvent(new Event('change', { bubbles: true }));
              }
            }
            updateSectionQuantityControl(wrap, sec);
          };
          ['click', 'pointerdown', 'mousedown', 'touchstart'].forEach((evt) => {
            wrap.addEventListener(evt, (event) => event.stopPropagation());
          });
          const bindAdjustButton = (btn, delta) => {
            let lastPointerAdjustAt = 0;
            const triggerAdjust = (evt) => {
              evt.preventDefault();
              evt.stopPropagation();
              lastPointerAdjustAt = performance.now();
              adjust(delta);
            };
            if (window.PointerEvent) {
              btn.addEventListener('pointerdown', (evt) => {
                if (evt.button != null && evt.button !== 0) return;
                triggerAdjust(evt);
              });
            } else {
              btn.addEventListener('mousedown', (evt) => {
                if (evt.button != null && evt.button !== 0) return;
                triggerAdjust(evt);
              });
              btn.addEventListener('touchstart', triggerAdjust, { passive: false });
            }
            btn.addEventListener('click', (evt) => {
              evt.preventDefault();
              evt.stopPropagation();
              // Ignore synthetic click that follows pointer/touch/mouse press.
              if (performance.now() - lastPointerAdjustAt < 450) return;
              adjust(delta);
            });
          };
          bindAdjustButton(dec, -1);
          bindAdjustButton(inc, 1);
          wrap.appendChild(count);
          wrap.appendChild(dec);
          wrap.appendChild(inc);
          summary.appendChild(wrap);
        }
        updateSectionQuantityControl(wrap, sec);
      };
      const refreshSectionQuantityControls = () => {
        SECTION_QUANTITY_SECTIONS.forEach((sec) => ensureSectionQuantityControl(sec));
      };
      function applySectionQuantityStateImpl() {
        sectionQuantities = loadSectionQuantities();
        if (!quantityCanDisable) {
          const min = getQuantityMin();
          SECTION_QUANTITY_SECTIONS.forEach((sec) => {
            const current = getSectionQuantity(sec);
            if (current < min) {
              setSectionQuantity(sec, min);
              const toggle = document.querySelector(`.section-toggle[data-section="${sec}"]`);
              if (toggle && !toggle.disabled && !toggle.checked) {
                toggle.checked = true;
                toggle.dispatchEvent(new Event('change', { bubbles: true }));
              }
            }
          });
        }
        refreshSectionQuantityControls();
      }
      applyQuantitySettingState = applySectionQuantityStateImpl;
      applySectionQuantityStateImpl();
      sectionToggles.forEach((toggle) => {
        const sec = toggle.dataset.section;
        if (!sec) return;
        if (manualDisabledSet.has(sec)) {
          toggle.checked = false;
          toggle.disabled = true;
          toggle.setAttribute('aria-disabled', 'true');
          toggle.dataset.manualDisabled = 'true';
        }
      });
      let sauceDisabled = false;
      const isSectionDisabled = (sec) => sec === 'sauces' && sauceDisabled;
      const requiredCheckboxes = Array.from(document.querySelectorAll('input[type="checkbox"][data-required="true"]'));
      const requiredBySection = {};
      const resettingSections = new Set();
      const ensurePizzaToggleActive = () => {
        const pizzaToggle = sectionToggles.find((t) => t.dataset.section === 'pizza');
        if (!pizzaToggle || pizzaToggle.disabled) return;
        if (!pizzaToggle.checked) {
          pizzaToggle.checked = true;
          pizzaToggle.dispatchEvent(new Event('change', { bubbles: true }));
        }
      };
      const savedPizzaSize = loadPizzaSize();
      pizzaSizeRadios.forEach((radio) => {
        if (radio.value === savedPizzaSize) {
          radio.checked = true;
        }
        radio.addEventListener('change', () => {
          if (!radio.checked) return;
          savePizzaSize(radio.value);
          ensurePizzaToggleActive();
        });
      });

      const saveAllIngredientSelections = () => {
        const data = {};
        document.querySelectorAll('input[type="checkbox"][name]').forEach((i) => {
          const nm = i.getAttribute('name');
          data[nm] = data[nm] || [];
          if (i.checked) {
            const labelEl = i.closest('label');
            const selectEl = labelEl ? labelEl.querySelector('select.ingredient-qty[data-no-qty="true"]') : null;
            const rawValue = (selectEl && selectEl.value) ? selectEl.value : i.value;
            data[nm].push(normalizeJalapenoValue(rawValue));
          }
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
      let resetDisableTrigger = '';
      let quantityDisableTrigger = '';
      let suppressAutoDisable = false;
      let suppressEnsureActive = false;
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

      const getSectionForGroup = (group) => {
        if (!group) return '';
        if (group.startsWith('pizza_')) return 'pizza';
        if (group.startsWith('burger_')) return 'burger';
        if (group.startsWith('calzone_')) return 'calzone';
        if (group.startsWith('chicken_wings_')) return 'chicken_wings';
        if (group.startsWith('salad_')) return 'salad';
        if (group.startsWith('sauces_')) return 'sauces';
        if (group.startsWith('sub_')) return 'sub';
        if (group.startsWith('wrap_')) return 'wrap';
        return '';
      };

      const resetGroupByName = (group, options = {}) => {
        const { skipConfirm = false } = options || {};
        if (!group) return;
        const inputs = Array.from(document.querySelectorAll(`input[type="checkbox"][name="${group}"]`));
        if (!inputs.length) return;
        const groupingSection = getSectionForGroup(group);
        if (!skipConfirm) {
          const sectionLabel = SECTION_LABELS[groupingSection] || (groupingSection ? groupingSection.charAt(0).toUpperCase() + groupingSection.slice(1) : 'this item');
          openCustomConfirm(`Reset ${sectionLabel} and remove selected items?`, (confirmed) => {
            if (!confirmed) return;
            resetGroupByName(group, { ...options, skipConfirm: true });
          });
          return;
        }
        const sectionToggle = groupingSection ? document.querySelector(`.section-toggle[data-section="${groupingSection}"]`) : null;
        const initialToggleState = sectionToggle ? {
          checked: sectionToggle.checked,
          disabled: sectionToggle.disabled,
          manualDisabled: sectionToggle.dataset && sectionToggle.dataset.manualDisabled === 'true'
        } : null;
        const previousSuppression = suppressEnsureActive;
        suppressEnsureActive = true;
        const shouldGuardSection = (sectionToggle && sectionToggle.disabled) || (resetDisables && groupingSection);
        if (shouldGuardSection && groupingSection) resettingSections.add(groupingSection);
        try {
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
        } finally {
          if (shouldGuardSection && groupingSection) resettingSections.delete(groupingSection);
          suppressEnsureActive = previousSuppression;
        }
        saveAllIngredientSelections();
        syncRequiredCheckboxes();
        updateBuilderError();
        updatePage3NavState();

        if (groupingSection) {
          setSectionQuantity(groupingSection, SECTION_QUANTITY_DEFAULT_MIN);
          refreshSectionQuantityControls();
        }

        if (resetDisables) {
          const section = groupingSection;
          if (section) {
            const toggle = document.querySelector(`.section-toggle[data-section="${section}"]`);
            if (toggle && toggle.checked) {
              resetDisableTrigger = section;
              try {
                toggle.checked = false;
                toggle.dispatchEvent(new Event('change', { bubbles: true }));
              } finally {
                resetDisableTrigger = '';
              }
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
        if (!resetDisables && sectionToggle && initialToggleState) {
          sectionToggle.checked = initialToggleState.checked;
          if (initialToggleState.disabled) {
            sectionToggle.disabled = true;
            sectionToggle.setAttribute('aria-disabled', 'true');
          } else {
            sectionToggle.disabled = false;
            sectionToggle.removeAttribute('aria-disabled');
          }
          if (initialToggleState.manualDisabled) {
            sectionToggle.dataset.manualDisabled = 'true';
          } else {
            delete sectionToggle.dataset.manualDisabled;
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
          { label: 'Light', value: '2' },
          { label: 'Extra', value: '3' },
          { label: 'x3', value: '4' },
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
              const syncSelect = (persist) => {
                const nextValue = ownSelect.value;
                if (nextValue) cb.value = nextValue;
                if (persist && cb.checked) {
                  saveAllIngredientSelections();
                  updateBuilderError();
                  updatePage3NavState();
                }
              };
              ownSelect.addEventListener('change', () => syncSelect(true));
              syncSelect(false);
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

      const syncOverlayPrices = () => {
        document.querySelectorAll('.overlay-header-price').forEach((priceEl) => {
          const overlay = priceEl.closest('.menu-overlay');
          const section = overlay?.dataset.section || '';
          if (!section) return;
          const launchPrice = document.querySelector(`.menu-launch[data-target="${section}"] .menu-launch-price`);
          if (launchPrice) {
            priceEl.textContent = launchPrice.textContent;
          }
        });
      };
      syncOverlayPrices();

      const updateArrowState = (section, isOpen) => {
        const btns = menuLaunchLookup[section] || [];
        btns.forEach((btn) => {
          const arrow = btn.querySelector('.menu-launch-arrow');
          if (arrow) {
            const icon = arrow.querySelector('.icon');
            if (icon) icon.textContent = isOpen ? '▴' : '▸';
            else arrow.textContent = isOpen ? '▴' : '▸';
          }
          btn.setAttribute('aria-expanded', String(!!isOpen));
        });
      };

      const ensureMenuLaunchArrow = (btn) => {
        let arrow = btn.querySelector('.menu-launch-arrow');
        if (!arrow) {
          arrow = document.createElement('button');
          arrow.type = 'button';
          arrow.className = 'menu-launch-arrow';
          arrow.setAttribute('aria-hidden', 'true');
          const icon = document.createElement('span');
          icon.className = 'icon';
          icon.textContent = '▸';
          arrow.appendChild(icon);
          btn.appendChild(arrow);
        }
        const iconEl = arrow.querySelector('.icon') || arrow;
        if (!iconEl.textContent || !iconEl.textContent.trim()) {
          iconEl.textContent = '▸';
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
        restoreBackButton();
      };

      const closeOverlay = (overlayOrSection) => {
        const overlay = typeof overlayOrSection === 'string' ? getOverlay(overlayOrSection) : overlayOrSection;
        if (!overlay) return;
        overlay.hidden = true;
        overlay.setAttribute('aria-hidden', 'true');
        updateArrowState(overlay.dataset.section, false);
        if (!anyOverlayOpen()) {
          body.classList.remove('menu-overlay-open');
          restoreBackButton();
        }
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
        moveBackButtonToOverlay(overlay);
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

      const focusSectionFromHash = (section) => {
        if (!section || isSectionDisabled(section)) return false;
        const overlay = getOverlay(section);
        if (!overlay) return false;
        openOverlay(section);
        const sectionBody = overlay.querySelector(`#${section}`) || overlay.querySelector('.menu-section');
        if (sectionBody) {
          sectionBody.scrollIntoView({ behavior: 'smooth', block: 'start' });
          const focusable = sectionBody.querySelector('input[type="checkbox"], button, select, [tabindex]:not([tabindex="-1"])');
          if (focusable && focusable.focus) {
            focusable.focus({ preventScroll: true });
          }
        }
        return true;
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
        // Sauces should remain available even when no other sections are selected.
        setSaucesDisabled(false);
      };

      const persistActiveSections = () => {
        const active = {};
        sectionToggles.forEach((t) => {
          const sec = t.dataset.section;
          const isActive = !!t.checked;
          if (sec) active[sec] = isActive;

          // OLD SECTION (kept for reference): menu launch active-state toggle
          // if (sec && menuLaunchLookup[sec]) {
          //   menuLaunchLookup[sec].forEach((btn) =>
          //     btn.classList.toggle('menu-launch-active', isActive)
          //   );
          // }

          if (sec && menuLaunchLookup[sec]) menuLaunchLookup[sec].forEach((btn) => btn.classList.remove('menu-launch-active'));
        });
        try { localStorage.setItem(STORAGE_KEYS.activeSections, JSON.stringify(active)); } catch { }
        syncRequiredCheckboxes();
      };

      const ensureBuilderErrorVisible = () => {
        if (!builderError || builderError.hidden) return;
        const footer = document.querySelector('.page-footer');
        const footerHeight = footer ? footer.offsetHeight : 0;
        const buffer = footerHeight + 24;
        const rect = builderError.getBoundingClientRect();
        const overlap = rect.bottom - (window.innerHeight - buffer);
        if (overlap > 0) {
          window.scrollBy({ top: overlap + 12, behavior: 'smooth' });
        }
      };

      const updateBuilderError = () => {
        if (!builderError) return;
        const orderItems = loadOrderItemsFromStorage();
        if (Array.isArray(orderItems) && orderItems.length > 0) {
          builderError.hidden = true;
          builderError.textContent = '';
          return;
        }
        const anyActive = sectionToggles.some((t) => t.checked);
        if (!anyActive) {
          builderError.hidden = false;
          builderError.textContent = 'Please choose at least one menu item.';
          ensureBuilderErrorVisible();
          return;
        }
        const saucesToggle = sectionToggles.find((t) => t.dataset.section === 'sauces');
        if (saucesToggle && saucesToggle.checked) {
          const ing = loadIngredientsFromStorage();
          const sauces = Array.isArray(ing['sauces_ingredients[]']) ? ing['sauces_ingredients[]'] : [];
          if (!sauces.length) {
            builderError.hidden = false;
            builderError.textContent = 'Select at least one sauce';
            ensureBuilderErrorVisible();
            return;
          }
        }
        builderError.hidden = true;
        builderError.textContent = '';
      };

      function resetMenuSelections() {
        const clearMenuLaunchVisualState = () => {
          menuLaunchButtons.forEach((btn) => {
            btn.classList.remove('menu-launch-active');
            btn.setAttribute('aria-expanded', 'false');
            if (typeof btn.blur === 'function') btn.blur();
            const arrowBtn = btn.querySelector('.menu-launch-arrow');
            if (arrowBtn) {
              if (typeof arrowBtn.blur === 'function') arrowBtn.blur();
              const icon = arrowBtn.querySelector('.icon');
              if (icon) icon.textContent = '▸';
            }
          });
        };

        const blurMenuLaunchFocus = () => {
          const activeEl = document.activeElement;
          if (
            activeEl instanceof HTMLElement
            && (
              activeEl.classList.contains('menu-launch')
              || activeEl.classList.contains('menu-launch-arrow')
              || activeEl.closest('.menu-launch')
            )
          ) {
            activeEl.blur();
          }
        };

        // Defensive focus clear: run now and next frame to catch delayed focus restore.
        clearMenuLaunchVisualState();
        blurMenuLaunchFocus();
        resetSectionQuantitiesToDefaults();
        resetSettingsToDefaults();
        try { localStorage.removeItem(STORAGE_KEYS.orderItems); } catch { /* ignore */ }
        if (typeof closeAllOverlays === 'function') closeAllOverlays();
        clearMenuLaunchVisualState();
        INGREDIENT_GROUPS.forEach((group) => resetGroupByName(group, { skipConfirm: true }));
        pizzaSizeRadios.forEach((radio) => {
          radio.checked = radio.value === DEFAULT_PIZZA_SIZE;
        });
        savePizzaSize(DEFAULT_PIZZA_SIZE);

        sectionToggles.forEach((toggle) => {
          toggle.checked = false;
          if (toggle.disabled) {
            toggle.disabled = false;
            toggle.removeAttribute('aria-disabled');
          }
          if (toggle.dataset) {
            delete toggle.dataset.manualDisabled;
          }
        });

        persistActiveSections();
        syncSaucesEnabled();
        if (builderError) {
          builderError.hidden = true;
          builderError.textContent = '';
        }
        updateBuilderError();
        updatePage3NavState();
        refreshSectionQuantityControls();
        clearMenuLaunchVisualState();
        blurMenuLaunchFocus();
        requestAnimationFrame(() => {
          clearMenuLaunchVisualState();
          blurMenuLaunchFocus();
        });
        setTimeout(() => {
          clearMenuLaunchVisualState();
          blurMenuLaunchFocus();
        }, 0);
      }

      // Attach pill/arrow handlers
      menuLaunchButtons.forEach((btn) => {
        const target = btn.dataset.target;
        if (!target) return;
        // OLD (hidden line reference): const arrow = btn.querySelector('.menu-launch-arrow');
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

      const sectionDoneButtons = Array.from(document.querySelectorAll('.section-done[data-section]'));
      let suppressSectionToast = '';
      const qtyLabelMapForDone = { '2': 'Light', '3': 'Extra', '4': 'x3' };
      const resolveIngredientValue = (raw) => {
        if (raw == null) return '';
        if (typeof raw === 'string' || typeof raw === 'number' || typeof raw === 'boolean') return normalizeJalapenoValue(String(raw));
        if (typeof raw === 'object') {
          return normalizeJalapenoValue(String(raw.value ?? raw.key ?? raw.name ?? raw.label ?? raw.text ?? ''));
        }
        return '';
      };
      const buildOrderItemFromSection = (section) => {
        const groups = Array.isArray(SECTION_INGREDIENT_GROUPS[section]) ? SECTION_INGREDIENT_GROUPS[section] : [];
        if (!groups.length) return null;
        const ingredientsState = loadIngredientsFromStorage();
        const qtyMapLocal = safeParseJSON(localStorage.getItem(STORAGE_KEYS.quantities), {}) || {};
        const ingredientRows = [];
        groups.forEach((group) => {
          const values = Array.isArray(ingredientsState[group]) ? ingredientsState[group] : [];
          values.forEach((raw) => {
            const value = resolveIngredientValue(raw);
            if (!value) return;
            const mapKey = `${group}|${value}`;
            const label = normalizeJalapenoLabel(INGREDIENT_LABELS[mapKey] || titleCase(String(value).replace(/_/g, ' ')));
            const qRaw = qtyMapLocal[mapKey];
            const qStr = qRaw == null || qRaw === '' ? '1' : String(qRaw);
            const qtyLabel = qStr === '1' ? 'Regular' : (qtyLabelMapForDone[qStr] || `x${qStr}`);
            ingredientRows.push({ group, value, label, qtyLabel });
          });
        });
        if (!ingredientRows.length) return null;
        const sectionQty = Math.max(SECTION_QUANTITY_DEFAULT_MIN, clampSectionQuantity(getSectionQuantity(section)));
        return {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          section,
          sectionLabel: SECTION_LABELS[section] || titleCase(String(section || '').replace(/_/g, ' ')),
          sectionQty,
          pizzaSize: section === 'pizza' ? loadPizzaSize() : '',
          ingredients: ingredientRows
        };
      };
      const clearSectionOnPage2AfterDone = (section) => {
        if (!section) return;
        suppressSectionToast = section;
        const groups = Array.isArray(SECTION_INGREDIENT_GROUPS[section]) ? SECTION_INGREDIENT_GROUPS[section] : [];
        try {
          const ing = loadIngredientsFromStorage();
          groups.forEach((group) => { ing[group] = []; });
          saveIngredientsToStorage(ing);
        } catch { /* ignore */ }
        clearOptionalSelections(section);
        const toggle = document.querySelector(`.section-toggle[data-section="${section}"]`);
        if (toggle && toggle.checked) {
          toggle.checked = false;
          toggle.dispatchEvent(new Event('change', { bubbles: true }));
        } else {
          suppressSectionToast = '';
          updateBuilderError();
          updatePage3NavState();
        }
      };
      sectionDoneButtons.forEach((btn) => {
        btn.addEventListener('click', (evt) => {
          evt.stopPropagation();
          evt.preventDefault();
          const section = btn.dataset.section;
          if (!section) return;
          const item = buildOrderItemFromSection(section);
          if (!item) {
            closeOverlay(section);
            return;
          }
          const orderItems = loadOrderItemsFromStorage();
          orderItems.push(item);
          saveOrderItemsToStorage(orderItems);
          clearSectionOnPage2AfterDone(section);
          closeOverlay(section);
        });
      });

      if (backToMenuBtn) {
        backToMenuBtn.addEventListener('click', (evt) => {
          evt.preventDefault();
          closeAllOverlays();
        });
      }

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          closeAllOverlays();
        }
      });

      const openHashTarget = () => {
        const sectionFromHash = (location.hash || '').replace('#', '').trim();
        if (!sectionFromHash) return;
        if (focusSectionFromHash(sectionFromHash)) return;
        const fallback = document.getElementById(sectionFromHash);
        if (fallback) {
          fallback.scrollIntoView({ behavior: 'smooth', block: 'start' });
          if (fallback.focus) fallback.focus({ preventScroll: true });
        }
      };

      // Persist ingredient selections
      ingredientCheckboxes.forEach((cb) => {
        cb.addEventListener('change', () => {
          const secEl = cb.closest('.menu-section');
          const secId = secEl && secEl.id;
          if (!suppressEnsureActive && cb.checked && !(secId && resettingSections.has(secId))) {
            ensureSectionActiveForCheckbox(cb);
          }
          if (secEl && secId) {
            if (!suppressAutoDisable) {
              autoDisableIfEmpty(secId);
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
        if (!suppressEnsureActive) ensureSectionActiveForCheckbox(cb);
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
          const isResetDisable = resetDisableTrigger && sec === resetDisableTrigger;
          const isQuantityDisable = quantityDisableTrigger && sec === quantityDisableTrigger;
          const keepOverlayOpenOnDisable = !!resetKeepOpen && (isResetDisable || isQuantityDisable);
          if (sec && t.checked && SECTION_QUANTITY_SECTIONS.includes(sec)) {
            const currentQty = getSectionQuantity(sec);
            if (currentQty < SECTION_QUANTITY_DEFAULT_MIN) {
              setSectionQuantity(sec, SECTION_QUANTITY_DEFAULT_MIN);
              refreshSectionQuantityControls();
            }
          }
          if (sec && !t.checked) {
            // Reset-button disables should preserve the item quantity at x1.
            const nextQty = isResetDisable ? SECTION_QUANTITY_DEFAULT_MIN : getQuantityMin();
            setSectionQuantity(sec, nextQty);
            refreshSectionQuantityControls();
          }
          // If the user manually disables the section and the setting is on, lock it and close its overlay.
          if (!t.checked && !isAuto && autoDisableSection) {
            if (sec) clearOptionalSelections(sec);
            t.disabled = true;
            t.setAttribute('aria-disabled', 'true');
            t.dataset.manualDisabled = 'true';
            if (sec && !keepOverlayOpenOnDisable) closeOverlay(sec);
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
          if (sec) {
            if (suppressSectionToast === sec) {
              suppressSectionToast = '';
            } else {
              showCartToast(sec, !!t.checked);
            }
          }
        });
      });

      // Initial sync
      syncSaucesEnabled();
      persistActiveSections();
      updateBuilderError();
      updatePage3NavState();
      openHashTarget();
      window.addEventListener('hashchange', openHashTarget);
    }

    // Settings change listeners
    if (settingLabelSelects) {
      settingLabelSelects.addEventListener('change', () => {
        const prev = collectSettingState();
        labelSelects = !!settingLabelSelects.checked;
        const revert = (state) => {
          labelSelects = state.labelSelects;
          if (settingLabelSelects) settingLabelSelects.checked = state.labelSelects;
          try { localStorage.setItem(STORAGE_KEYS.settingsLabelSelects, String(labelSelects)); } catch { }
        };
        maybeWarnSettingConflicts(prev, revert, () => {
          try { localStorage.setItem(STORAGE_KEYS.settingsLabelSelects, String(labelSelects)); } catch { }
        });
      });
    }
    if (settingTitleSelects) {
      settingTitleSelects.addEventListener('change', () => {
        const prev = collectSettingState();
        titleSelects = !!settingTitleSelects.checked;
        const revert = (state) => {
          titleSelects = state.titleSelects;
          if (settingTitleSelects) settingTitleSelects.checked = state.titleSelects;
          try { localStorage.setItem(STORAGE_KEYS.settingsTitleSelects, String(titleSelects)); } catch { }
        };
        maybeWarnSettingConflicts(prev, revert, () => {
          try { localStorage.setItem(STORAGE_KEYS.settingsTitleSelects, String(titleSelects)); } catch { }
        });
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
    if (settingQuantityCanDisable) {
      settingQuantityCanDisable.addEventListener('change', () => {
        quantityCanDisable = !!settingQuantityCanDisable.checked;
        try { localStorage.setItem(STORAGE_KEYS.settingsQuantityCanDisable, String(quantityCanDisable)); } catch { }
        if (typeof applyQuantitySettingState === 'function') applyQuantitySettingState();
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
        const prev = collectSettingState();
        pillArrowOnly = !!settingPillArrowOnly.checked;
        const revert = (state) => {
          pillArrowOnly = state.pillArrowOnly;
          if (settingPillArrowOnly) settingPillArrowOnly.checked = state.pillArrowOnly;
          try { localStorage.setItem(STORAGE_KEYS.settingsPillArrowOnly, String(pillArrowOnly)); } catch { }
        };
        maybeWarnSettingConflicts(prev, revert, () => {
          try { localStorage.setItem(STORAGE_KEYS.settingsPillArrowOnly, String(pillArrowOnly)); } catch { }
        });
      });
    }

    if (settingNextClosesOverlay) {
      settingNextClosesOverlay.addEventListener('change', () => {
        nextClosesOverlay = !!settingNextClosesOverlay.checked;
        try { localStorage.setItem(STORAGE_KEYS.settingsNextClosesOverlay, String(nextClosesOverlay)); } catch { }
      });
    }
    if (settingToastEnabled) {
      settingToastEnabled.addEventListener('change', () => {
        toastEnabled = !!settingToastEnabled.checked;
        try { localStorage.setItem(STORAGE_KEYS.settingsToastEnabled, String(toastEnabled)); } catch { }
      });
    }
    if (settingToastPage2Long) {
      settingToastPage2Long.addEventListener('change', () => {
        toastPage2Long = !!settingToastPage2Long.checked;
        try { localStorage.setItem(STORAGE_KEYS.settingsToastPage2Long, String(toastPage2Long)); } catch { }
      });
    }

    // Settings open/close
    if (settingsToggleBtns.length) {
      settingsToggleBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
          if (!settingsOverlay) return;
          if (settingsOverlay.hidden) openSettings();
        });
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

    // Settings closes only via the dedicated close button.

    // initial sync
    syncMobileUiState();
    updateNavOffset();
    updateThemeModeLabel();
    updateNavToggleLabel();
    updatePage3NavState();
    updateOrderTypeChip();

    // Re-open section if hash present
    openSectionFromHash();

    // Keep theme/nav controls in sync when the viewport crosses the mobile breakpoint
    if (mobileQuery && typeof mobileQuery.addEventListener === 'function') {
      mobileQuery.addEventListener('change', syncMobileUiState);
    }

    // Page 3: Order summary rendering
    if (body.classList.contains('page3')) {
      const container = document.getElementById('order-summary');
      if (!container) return;

      function redirectIfNoActiveSections() {
        if (!document.body.classList.contains('page3')) return false;
        const orderItems = loadOrderItemsFromStorage();
        if (Array.isArray(orderItems) && orderItems.length > 0) return false;
        const active = safeParseJSON(localStorage.getItem(STORAGE_KEYS.activeSections), {});
        const hasActive = Object.values(active || {}).some((v) => !!v);
        if (hasActive) return false;
        const page2ReasonMessage = 'No more items were selected on Page 3, so you were rerouted back to the menu builder.';
        setRedirectReason(page2ReasonMessage);
        showCartToast('order', false, PAGE3_REDIRECT_TOAST_MESSAGE, { persistUntilHide: true, force: true });
        let redirectTimer = null;
        const handleRedirect = () => {
          if (redirectTimer) {
            clearTimeout(redirectTimer);
            redirectTimer = null;
          }
          window.location.href = 'page2.html';
        };
        redirectTimer = setTimeout(handleRedirect, PAGE3_REDIRECT_DELAY);
        return true;
      }

      function handleRemoveSection(section, options = {}) {
        const { skipConfirm = false } = options || {};
        const normalized = String(section || '').toLowerCase();
        if (!normalized) return;
        if (!skipConfirm) {
          const sectionLabel = SECTION_LABELS[normalized] || (normalized.charAt(0).toUpperCase() + normalized.slice(1));
          openCustomConfirm(`Remove ${sectionLabel} from your order?`, (confirmed) => {
            if (!confirmed) return;
            handleRemoveSection(normalized, { ...options, skipConfirm: true });
          });
          return;
        }
        setSectionQuantity(normalized, getQuantityMin());
        removeIngredientGroupsForSection(normalized);
        removeQuantitiesForSection(normalized);
        markSectionManualDisabled(normalized);
        markSectionInactive(normalized);
        renderOrderSummary();
        if (typeof updatePage3NavState === 'function') updatePage3NavState();
        if (!redirectIfNoActiveSections()) {
          showCartToast(normalized, false);
        }
      }

      function handleAdjustSectionQuantity(section, delta) {
        const normalized = String(section || '').toLowerCase();
        const step = Number(delta);
        if (!normalized || !Number.isFinite(step) || !step) return;
        const current = Math.max(SECTION_QUANTITY_DEFAULT_MIN, getSectionQuantity(normalized));
        const next = Math.min(SECTION_QUANTITY_MAX, Math.max(SECTION_QUANTITY_DEFAULT_MIN, current + step));
        if (next === current) return;
        setSectionQuantity(normalized, next);
        renderOrderSummary();
        if (typeof updatePage3NavState === 'function') updatePage3NavState();
      }
      const bindSummaryAdjustButton = (btn, section, delta) => {
        let lastPointerAdjustAt = 0;
        const triggerAdjust = (evt) => {
          // OLD (hidden line reference): lastPointerAdjustAt = performance.now();
          // OLD (hidden line reference): handleAdjustSectionQuantity(section, delta);
          evt.preventDefault();
          evt.stopPropagation();
          lastPointerAdjustAt = performance.now();
          handleAdjustSectionQuantity(section, delta);
        };
        if (window.PointerEvent) {
          btn.addEventListener('pointerdown', (evt) => {
            if (evt.button != null && evt.button !== 0) return;
            triggerAdjust(evt);
          });
        } else {
          btn.addEventListener('mousedown', (evt) => {
            if (evt.button != null && evt.button !== 0) return;
            triggerAdjust(evt);
          });
          btn.addEventListener('touchstart', triggerAdjust, { passive: false });
        }
        btn.addEventListener('click', (evt) => {
          evt.preventDefault();
          evt.stopPropagation();
          // Ignore synthetic click that follows pointer/touch/mouse press.
          if (performance.now() - lastPointerAdjustAt < 450) return;
          handleAdjustSectionQuantity(section, delta);
        });
      };

      function renderOrderSummary() {
        const readJSON = (key, fallback) => {
          try { return safeParseJSON(localStorage.getItem(key), fallback); } catch { return fallback; }
        };
        const writeOrderItems = (items) => saveOrderItemsToStorage(items);
        const orderItems = loadOrderItemsFromStorage();
        const d = readDeliveryData();
        const orderType = (() => { try { return localStorage.getItem(STORAGE_KEYS.orderType) || ''; } catch { return ''; } })();
        const ingredients = normalizeIngredientData(readJSON(STORAGE_KEYS.ingredients, {})) || {};
        const activeSections = readJSON(STORAGE_KEYS.activeSections, {}) || {};
        const qtyMap = readJSON(STORAGE_KEYS.quantities, {});
        const qtySections = readJSON(STORAGE_KEYS.quantitiesSections, {}) || {};
        const pizzaSize = loadPizzaSize();
        const pizzaSizeLabel = PIZZA_SIZE_LABELS[pizzaSize] || pizzaSize || '';
        container.innerHTML = '';
        const frag = document.createDocumentFragment();
        const createSummaryBlock = () => {
          const block = document.createElement('div');
          block.className = 'summary-block';
          return block;
        };

        if (orderType) {
          const typeBlock = createSummaryBlock();
          const h3 = document.createElement('h3');
          h3.textContent = 'Order Type';
          typeBlock.appendChild(h3);
          const p = document.createElement('p');
          p.textContent = orderType === 'delivery' ? 'Delivery' : 'Dine In/Carryout';
          typeBlock.appendChild(p);
          frag.appendChild(typeBlock);
        }

        if (orderType === 'delivery') {
          const deliveryBlock = createSummaryBlock();
          const h = document.createElement('h3');
          h.textContent = 'Delivery Details';
          deliveryBlock.appendChild(h);

          const addressBlock = document.createElement('div');
          addressBlock.className = 'address-block';

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
            addressBlock.appendChild(line);
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
            addressBlock.appendChild(line);
          }
          if (da) {
            const line = document.createElement('div');
            line.textContent = da;
            addressBlock.appendChild(line);
          }
          if (ds) {
            const line = document.createElement('div');
            line.textContent = ds;
            addressBlock.appendChild(line);
          }
          if (city || zip) {
            const line = document.createElement('div');
            line.textContent = [city, zip].filter(Boolean).join(' ');
            addressBlock.appendChild(line);
          }

          deliveryBlock.appendChild(addressBlock);
          frag.appendChild(deliveryBlock);
        }

        const selectionsBlock = createSummaryBlock();
        const h3 = document.createElement('h3');
        h3.textContent = 'Selections';
        selectionsBlock.appendChild(h3);

        const qtyLabelMap = { '2': 'Light', '3': 'Extra', '4': 'x3' };
        if (Array.isArray(orderItems) && orderItems.length > 0) {
          const sectionsContainer = document.createElement('div');
          sectionsContainer.className = 'summary-sections';
          const catalog = loadIngredientCatalogFromStorage();
          const clampOrderItemQty = (value) => {
            const n = parseInt(value, 10) || SECTION_QUANTITY_DEFAULT_MIN;
            return Math.max(SECTION_QUANTITY_DEFAULT_MIN, Math.min(SECTION_QUANTITY_MAX, n));
          };
          const updateOrderItemQty = (itemId, nextQty) => {
            const clamped = clampOrderItemQty(nextQty);
            const nextItems = loadOrderItemsFromStorage().map((it) => {
              if (!it || it.id !== itemId) return it;
              return { ...it, sectionQty: clamped };
            });
            writeOrderItems(nextItems);
            renderOrderSummary();
            if (typeof updatePage3NavState === 'function') updatePage3NavState();
          };
          orderItems.forEach((item, idx) => {
            if (!item || !item.section) return;
            const sectionWrap = document.createElement('div');
            sectionWrap.className = 'summary-section';
            const header = document.createElement('div');
            header.className = 'summary-section-header';
            const title = document.createElement('strong');
            const sectionLabel = item.sectionLabel || SECTION_LABELS[item.section] || titleCase(String(item.section).replace(/_/g, ' '));
            title.textContent = `${sectionLabel} #${idx + 1}`;
            header.appendChild(title);

            const actions = document.createElement('div');
            actions.className = 'summary-section-actions';

            const edit = document.createElement('button');
            edit.type = 'button';
            edit.textContent = 'Edit';
            edit.className = 'summary-edit-btn';
            // OLD SECTION (hidden old behavior): header.appendChild(edit);
            actions.appendChild(edit);

            const remove = document.createElement('button');
            remove.type = 'button';
            remove.className = 'summary-remove-btn';
            remove.textContent = 'Remove';
            remove.setAttribute('aria-label', `Remove ${title.textContent}`);
            remove.addEventListener('click', (evt) => {
              evt.preventDefault();
              evt.stopPropagation();
              const next = loadOrderItemsFromStorage().filter((it) => it && it.id !== item.id);
              writeOrderItems(next);
              if (!next.length) redirectIfNoActiveSections();
              renderOrderSummary();
            });
            // OLD SECTION (hidden old behavior): header.appendChild(remove);
            actions.appendChild(remove);

            const currentItemQty = clampOrderItemQty(item.sectionQty);
            const qtyWrap = document.createElement('span');
            qtyWrap.className = 'qty-controls summary-qty-controls';
            ['click', 'pointerdown', 'mousedown', 'touchstart'].forEach((evtName) => {
              qtyWrap.addEventListener(evtName, (evt) => evt.stopPropagation());
            });
            const qtyCount = document.createElement('span');
            qtyCount.className = 'qty-controls-value summary-qty-value';
            qtyCount.textContent = `(x${currentItemQty})`;
            const dec = document.createElement('button');
            dec.type = 'button';
            dec.className = 'qty-control-decrement summary-qty-decrement';
            dec.textContent = '−';
            dec.setAttribute('aria-label', `Decrease ${title.textContent} quantity`);
            dec.disabled = currentItemQty <= SECTION_QUANTITY_DEFAULT_MIN;
            const inc = document.createElement('button');
            inc.type = 'button';
            inc.className = 'qty-control-increment summary-qty-increment';
            inc.textContent = '+';
            inc.setAttribute('aria-label', `Increase ${title.textContent} quantity`);
            inc.disabled = currentItemQty >= SECTION_QUANTITY_MAX;
            dec.addEventListener('click', (evt) => {
              evt.preventDefault();
              evt.stopPropagation();
              updateOrderItemQty(item.id, currentItemQty - 1);
            });
            inc.addEventListener('click', (evt) => {
              evt.preventDefault();
              evt.stopPropagation();
              updateOrderItemQty(item.id, currentItemQty + 1);
            });
            qtyWrap.appendChild(qtyCount);
            qtyWrap.appendChild(dec);
            qtyWrap.appendChild(inc);
            actions.appendChild(qtyWrap);
            sectionWrap.appendChild(header);
            sectionWrap.appendChild(actions);

            if (item.section === 'pizza' && item.pizzaSize) {
              const sizeLine = document.createElement('div');
              sizeLine.className = 'summary-section-size';
              const sizeLabel = PIZZA_SIZE_LABELS[item.pizzaSize] || item.pizzaSize;
              sizeLine.textContent = `Size: ${sizeLabel}`;
              sectionWrap.appendChild(sizeLine);
            }

            const ul = document.createElement('ul');
            const itemIngredients = Array.isArray(item.ingredients) ? item.ingredients : [];
            itemIngredients.forEach((row) => {
              if (!row || !row.value) return;
              const li = document.createElement('li');
              const qtyLabel = row.qtyLabel || 'Regular';
              li.textContent = `${normalizeJalapenoLabel(row.label || titleCase(String(row.value).replace(/_/g, ' ')))} (${qtyLabel})`;
              ul.appendChild(li);
            });
            sectionWrap.appendChild(ul);

            const optionsRaw = Array.isArray(catalog[item.section]) ? catalog[item.section] : [];
            const options = optionsRaw.length
              ? optionsRaw.map((opt) => ({
                group: opt.group || `${item.section}_ingredients[]`,
                value: normalizeJalapenoValue(opt.value),
                label: normalizeJalapenoLabel(opt.label || titleCase(String(opt.value || '').replace(/_/g, ' '))),
                required: !!opt.required
              })).filter((opt) => !!opt.value)
              : itemIngredients.map((row) => ({
                group: row.group || `${item.section}_ingredients[]`,
                value: normalizeJalapenoValue(row.value),
                label: normalizeJalapenoLabel(row.label || titleCase(String(row.value || '').replace(/_/g, ' '))),
                required: false
              }));
            const selectedValues = new Set(itemIngredients.map((row) => normalizeJalapenoValue(row.value)).filter(Boolean));
            const editor = document.createElement('div');
            editor.className = 'summary-inline-editor';
            editor.hidden = true;
            const editorList = document.createElement('div');
            editorList.className = 'summary-inline-editor-list';
            options.forEach((opt, optIdx) => {
              if (!opt || !opt.value) return;
              const id = `summary-item-edit-${idx}-${optIdx}`;
              const row = document.createElement('label');
              row.className = 'summary-inline-option';
              row.setAttribute('for', id);
              const cb = document.createElement('input');
              cb.type = 'checkbox';
              cb.id = id;
              cb.value = opt.value;
              cb.checked = !!opt.required || selectedValues.has(opt.value);
              if (opt.required) cb.disabled = true;
              const txt = document.createElement('span');
              txt.textContent = opt.label || titleCase(String(opt.value).replace(/_/g, ' '));
              row.appendChild(cb);
              row.appendChild(txt);
              editorList.appendChild(row);
            });
            editor.appendChild(editorList);
            const editorActions = document.createElement('div');
            editorActions.className = 'summary-inline-editor-actions';
            const saveBtn = document.createElement('button');
            saveBtn.type = 'button';
            saveBtn.className = 'summary-inline-save-btn';
            saveBtn.textContent = 'Save';
            const cancelBtn = document.createElement('button');
            cancelBtn.type = 'button';
            cancelBtn.className = 'summary-inline-cancel-btn';
            cancelBtn.textContent = 'Cancel';
            editorActions.appendChild(saveBtn);
            editorActions.appendChild(cancelBtn);
            editor.appendChild(editorActions);
            sectionWrap.appendChild(editor);

            edit.addEventListener('click', () => {
              editor.hidden = !editor.hidden;
            });
            cancelBtn.addEventListener('click', () => {
              editor.hidden = true;
            });
            saveBtn.addEventListener('click', () => {
              const checked = new Set(Array.from(editor.querySelectorAll('input[type="checkbox"]:checked')).map((el) => normalizeJalapenoValue(el.value)));
              const updatedIngredients = options
                .filter((opt) => checked.has(normalizeJalapenoValue(opt.value)))
                .map((opt) => {
                  const normalizedValue = normalizeJalapenoValue(opt.value);
                  const rowKey = `${opt.group}|${normalizedValue}`;
                  const qRaw = qtyMap[rowKey];
                  const qStr = qRaw == null || qRaw === '' ? '1' : String(qRaw);
                  const qtyText = qStr === '1' ? 'Regular' : (qtyLabelMap[qStr] || `x${qStr}`);
                  return {
                    group: opt.group,
                    value: normalizedValue,
                    label: normalizeJalapenoLabel(opt.label || titleCase(String(normalizedValue).replace(/_/g, ' '))),
                    qtyLabel: qtyText
                  };
                });
              const next = loadOrderItemsFromStorage().map((it) => {
                if (!it || it.id !== item.id) return it;
                return { ...it, ingredients: updatedIngredients };
              });
              writeOrderItems(next);
              renderOrderSummary();
            });
            sectionsContainer.appendChild(sectionWrap);
          });

          if (sectionsContainer.childNodes.length) selectionsBlock.appendChild(sectionsContainer);
          else {
            const p = document.createElement('p');
            p.textContent = 'No ingredients selected yet.';
            selectionsBlock.appendChild(p);
          }

          frag.appendChild(selectionsBlock);
          container.appendChild(frag);
          return;
        }

        const entries = Object.entries(ingredients || {});
        const nonEmpty = entries.filter(([, arr]) => Array.isArray(arr) && arr.length > 0);
        const resolveIngredientValueKey = (rawValue) => {
          if (rawValue == null) return '';
          if (typeof rawValue === 'string' || typeof rawValue === 'number' || typeof rawValue === 'boolean') {
            return String(rawValue);
          }
          if (Array.isArray(rawValue)) {
            return rawValue.map(resolveIngredientValueKey).filter(Boolean).join(',');
          }
          if (typeof rawValue === 'object') {
            const candidate = rawValue.value ?? rawValue.key ?? rawValue.name ?? rawValue.label ?? rawValue.text;
            if (candidate !== undefined) {
              return resolveIngredientValueKey(candidate);
            }
            try {
              return JSON.stringify(rawValue);
            } catch {
              return String(rawValue);
            }
          }
          return '';
        };

        const qtyLabel = (group, keyValue) => {
          const key = `${group}|${keyValue}`;
          const q = qtyMap && qtyMap[key];
          const qStr = q == null || q === '' ? '1' : String(q);
          if (qStr === '1') return ' (Regular)';
          const label = qtyLabelMap[qStr];
          return label ? ` (${label})` : ` (x${qStr})`;
        };

        if (!nonEmpty.length) {
          const p = document.createElement('p');
          p.textContent = 'No ingredients selected yet.';
          selectionsBlock.appendChild(p);
        } else {
          const sectionsContainer = document.createElement('div');
          sectionsContainer.className = 'summary-sections';
          nonEmpty.forEach(([group, values]) => {
            const sec = group.replace(/_ingredients\[\]$/, '');

            if (!activeSections[sec]) return;
            const sectionWrap = document.createElement('div');
            sectionWrap.className = 'summary-section';
            const header = document.createElement('div');
            header.className = 'summary-section-header';
            const title = document.createElement('strong');
            title.textContent = sec.charAt(0).toUpperCase() + sec.slice(1);
            header.appendChild(title);

            const actions = document.createElement('div');
            actions.className = 'summary-section-actions';
            const edit = document.createElement('button');
            edit.type = 'button';
            edit.textContent = 'Edit';
            edit.className = 'summary-edit-btn';

            // OLD SECTION (kept for reference): summary edit link behavior
            // const edit = document.createElement('a');
            // edit.href = `page2.html#${sec}`;
            // edit.textContent = 'Edit';
            // edit.className = 'summary-edit-btn';
            // OLD SECTION (hidden old behavior): header.appendChild(edit);

            actions.appendChild(edit);

            const remove = document.createElement('button');
            remove.type = 'button';
            remove.className = 'summary-remove-btn';
            remove.textContent = 'Remove';
            remove.setAttribute('aria-label', `Remove ${title.textContent}`);
            remove.addEventListener('click', (evt) => {
              evt.preventDefault();
              evt.stopPropagation();
              handleRemoveSection(sec);
            });
            // OLD SECTION (hidden old behavior): header.appendChild(remove);
            actions.appendChild(remove);

            if (SECTION_QUANTITY_SECTIONS.includes(sec)) {
              const qtyValue = Math.max(SECTION_QUANTITY_DEFAULT_MIN, clampSectionQuantity(qtySections[sec]));
              const qtyWrap = document.createElement('span');
              qtyWrap.className = 'qty-controls summary-qty-controls';
              ['click', 'pointerdown', 'mousedown', 'touchstart'].forEach((evt) => {
                qtyWrap.addEventListener(evt, (event) => event.stopPropagation());
              });

              const qtyCount = document.createElement('span');
              qtyCount.className = 'qty-controls-value summary-qty-value';
              qtyCount.textContent = `(x${qtyValue})`;

              const dec = document.createElement('button');
              dec.type = 'button';
              dec.className = 'qty-control-decrement summary-qty-decrement';
              dec.textContent = '−';
              dec.setAttribute('aria-label', `Decrease ${title.textContent} quantity`);
              dec.disabled = qtyValue <= SECTION_QUANTITY_DEFAULT_MIN;
              bindSummaryAdjustButton(dec, sec, -1);

              const inc = document.createElement('button');
              inc.type = 'button';
              inc.className = 'qty-control-increment summary-qty-increment';
              inc.textContent = '+';
              inc.setAttribute('aria-label', `Increase ${title.textContent} quantity`);
              inc.disabled = qtyValue >= SECTION_QUANTITY_MAX;
              bindSummaryAdjustButton(inc, sec, 1);

              qtyWrap.appendChild(qtyCount);
              qtyWrap.appendChild(dec);
              qtyWrap.appendChild(inc);
              actions.appendChild(qtyWrap);
            }

            sectionWrap.appendChild(header);
            sectionWrap.appendChild(actions);

            if (sec === 'pizza' && pizzaSizeLabel) {
              const sizeLine = document.createElement('div');
              sizeLine.className = 'summary-section-size';
              sizeLine.textContent = `Size: ${pizzaSizeLabel}`;
              sectionWrap.appendChild(sizeLine);
            }

            const ul = document.createElement('ul');
            values.forEach((val) => {
              const li = document.createElement('li');
              const valueKey = normalizeJalapenoValue(resolveIngredientValueKey(val));
              const mapKey = `${group}|${valueKey}`;
              const fallback = valueKey ? String(valueKey).replace(/_/g, ' ') : '';
              const pretty = INGREDIENT_LABELS[mapKey] || fallback;
              li.textContent = normalizeJalapenoLabel(pretty) + qtyLabel(group, valueKey);
              ul.appendChild(li);
            });
            sectionWrap.appendChild(ul);

            const catalog = loadIngredientCatalogFromStorage();
            const sectionOptions = Array.isArray(catalog[sec]) ? catalog[sec] : [];
            const options = sectionOptions.length
              ? sectionOptions
              : values.map((val) => {
                const raw = normalizeJalapenoValue(resolveIngredientValueKey(val));
                const mapKey = `${group}|${raw}`;
                return {
                  group,
                  value: raw,
                  label: normalizeJalapenoLabel(INGREDIENT_LABELS[mapKey] || String(raw || '').replace(/_/g, ' ')),
                  required: false
                };
              });
            const selectedValues = new Set(values.map((val) => normalizeJalapenoValue(resolveIngredientValueKey(val))).filter(Boolean));
            const editor = document.createElement('div');
            editor.className = 'summary-inline-editor';
            editor.hidden = true;
            const editorList = document.createElement('div');
            editorList.className = 'summary-inline-editor-list';
            options.forEach((opt, idx) => {
              if (!opt || !opt.value) return;
              const id = `summary-edit-${sec}-${idx}`;
              const row = document.createElement('label');
              row.className = 'summary-inline-option';
              row.setAttribute('for', id);
              const cb = document.createElement('input');
              cb.type = 'checkbox';
              cb.id = id;
              cb.value = opt.value;
              cb.checked = !!opt.required || selectedValues.has(opt.value);
              if (opt.required) cb.disabled = true;
              const txt = document.createElement('span');
              txt.textContent = opt.label || String(opt.value).replace(/_/g, ' ');
              row.appendChild(cb);
              row.appendChild(txt);
              editorList.appendChild(row);
            });
            editor.appendChild(editorList);
            const editorActions = document.createElement('div');
            editorActions.className = 'summary-inline-editor-actions';
            const saveBtn = document.createElement('button');
            saveBtn.type = 'button';
            saveBtn.className = 'summary-inline-save-btn';
            saveBtn.textContent = 'Save';
            const cancelBtn = document.createElement('button');
            cancelBtn.type = 'button';
            cancelBtn.className = 'summary-inline-cancel-btn';
            cancelBtn.textContent = 'Cancel';
            editorActions.appendChild(saveBtn);
            editorActions.appendChild(cancelBtn);
            editor.appendChild(editorActions);
            sectionWrap.appendChild(editor);

            edit.addEventListener('click', () => {
              editor.hidden = !editor.hidden;
            });
            cancelBtn.addEventListener('click', () => {
              editor.hidden = true;
            });
            saveBtn.addEventListener('click', () => {
              const checked = new Set(
                Array.from(editor.querySelectorAll('input[type="checkbox"]:checked')).map((i) => normalizeJalapenoValue(i.value))
              );
              const next = options
                .map((opt) => normalizeJalapenoValue(opt && opt.value))
                .filter((value) => value && checked.has(value));
              try {
                const ing = normalizeIngredientData(readJSON(STORAGE_KEYS.ingredients, {})) || {};
                ing[group] = next;
                localStorage.setItem(STORAGE_KEYS.ingredients, JSON.stringify(ing));
              } catch { /* ignore */ }
              try {
                const act = readJSON(STORAGE_KEYS.activeSections, {}) || {};
                act[sec] = next.length > 0;
                localStorage.setItem(STORAGE_KEYS.activeSections, JSON.stringify(act));
              } catch { /* ignore */ }
              renderOrderSummary();
            });
            sectionsContainer.appendChild(sectionWrap);
          });

          if (sectionsContainer.childNodes.length) {
            selectionsBlock.appendChild(sectionsContainer);
          } else {
            const p = document.createElement('p');
            p.textContent = 'No ingredients selected yet.';
            selectionsBlock.appendChild(p);
          }
        }

        frag.appendChild(selectionsBlock);
        container.appendChild(frag);
      }

      renderOrderSummary();
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
