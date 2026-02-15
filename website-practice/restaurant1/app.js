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
    deliverySuite: 'restaurant.delivery.suite',
    activeSections: 'restaurant.activeSections',
    navEnabled: 'restaurant.nav.enabled',
    settingsLabelSelects: 'restaurant.settings.labelSelects',
    settingsTitleSelects: 'restaurant.settings.titleSelects',
    settingsResetOnDeselect: 'restaurant.settings.resetOnDeselect',
    settingsResetDisables: 'restaurant.settings.resetDisables',
    settingsAutoDisableEmpty: 'restaurant.settings.autoDisableEmpty',
    settingsAutoCollapseDisabled: 'restaurant.settings.autoCollapseDisabled',
    settingsQtyRight: 'restaurant.settings.qtyRight',
    settingsPillArrowOnly: 'restaurant.settings.pillArrowOnly',
    settingsArrowActivates: 'restaurant.settings.arrowActivates',
    settingsNextClosesOverlay: 'restaurant.settings.nextClosesOverlay',
    quantities: 'restaurant.quantities',
    quantitiesSections: 'restaurant.quantities.sections',
    pizzaSize: 'restaurant.pizza.size',
    ingredientCatalog: 'restaurant.ingredientCatalog'
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

  const JALAPENO_VALUE = 'jalapenos';
  const JALAPENO_LABEL_RE = /jalapenos|jalapeños/i;
  const JALAPENO_LABEL_GLOBAL = /jalapenos|jalapeños/gi;

  function normalizeJalapenoValue(val) {
    if (typeof val !== 'string') return val;
    return JALAPENO_LABEL_RE.test(val) ? JALAPENO_VALUE : val;
  }

  function normalizeJalapenoLabel(str) {
    if (!str) return str;
    return String(str).replace(JALAPENO_LABEL_GLOBAL, 'Jalapeños');
  }

  function normalizeStoredIngredients(data) {
    if (!data || typeof data !== 'object') return data;
    const normalized = {};
    Object.entries(data).forEach(([group, items]) => {
      if (!Array.isArray(items)) {
        normalized[group] = items;
        return;
      }
      normalized[group] = items.map((entry) => {
        if (!entry) return entry;
        if (typeof entry === 'string') {
          return normalizeJalapenoValue(entry);
        }
        if (typeof entry === 'object') {
          const next = { ...entry };
          if (next.value) next.value = normalizeJalapenoValue(next.value);
          if (next.label) next.label = normalizeJalapenoLabel(next.label);
          return next;
        }
        return entry;
      });
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
    clone.querySelectorAll('input, select, .sauce-qty, .qty-controls, button').forEach((el) => el.remove());
    let txt = (clone.textContent || '').replace(/\s+/g, ' ').trim();
    if (!txt) txt = titleCase(input.value || '');
    return normalizeJalapenoLabel(stripInlineQty(txt));
  }

  function buildIngredientCatalogFromDOM() {
    const catalog = {};
    const inputs = document.querySelectorAll('input[type="checkbox"][name$="_ingredients[]"]');
    inputs.forEach((input) => {
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
      const catalog = buildIngredientCatalogFromDOM();
      localStorage.setItem(STORAGE_KEYS.ingredientCatalog, JSON.stringify(catalog));
    } catch { }
  }

  function loadIngredientCatalogFromStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.ingredientCatalog);
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch { return {}; }
  }

  function getSelectChoiceText(label) {
    if (!label) return '';
    const select = label.querySelector('select');
    if (!select) return '';
    const option = select.options[select.selectedIndex];
    return (option && option.textContent ? option.textContent : select.value || '').trim();
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

  // Section: Pizza Size (Save/Get)
  function savePizzaSize(size) {
    try { localStorage.setItem(STORAGE_KEYS.pizzaSize, size); } catch { }
  }

  function getPizzaSize() {
    try { return localStorage.getItem(STORAGE_KEYS.pizzaSize) || ''; } catch { return ''; }
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
          const selectChoice = getSelectChoiceText(label);
          const clone = label.cloneNode(true);
          // Remove the checkbox itself and any qty controls inside labels
          clone.querySelectorAll('input, select, .sauce-qty, .qty-controls, button').forEach((el) => el.remove());
          labelText = (clone.textContent || '').trim();
          const hasRequired = /\(required\)/i.test(labelText);
          const baseLabel = labelText.replace(/\(required\)/i, '').trim() || titleCase(input.value);
          if (selectChoice) {
            labelText = `${baseLabel}: ${selectChoice}${hasRequired ? ' (Required)' : ''}`.trim();
          } else {
            labelText = labelText || titleCase(input.value);
          }
        }
        const normalizedValue = normalizeJalapenoValue(input.value);
        const normalizedLabel = normalizeJalapenoLabel(labelText || titleCase(normalizedValue));
        data[name].push({ value: normalizedValue, label: normalizedLabel });
      }
    });
    return data;
  }

  // Section: Ingredients (Save to Storage)
  function saveIngredients() {
    const data = normalizeStoredIngredients(readIngredientsFromDOM());
    try {
      localStorage.setItem(STORAGE_KEYS.ingredients, JSON.stringify(data));
    } catch { }
  }

  // Section: Ingredients (Restore from Storage)
  function restoreIngredients() {
    let data = {};
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.ingredients);
      if (raw) {
        const parsed = JSON.parse(raw);
        data = normalizeStoredIngredients(parsed);
      }
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
    const target = document.getElementById(hash);
    if (!target) return;
    // If the target is a native <details>, expand it so its contents are visible
    if (target.tagName && target.tagName.toLowerCase() === 'details') {
      target.open = true;
    }
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
    const main = document.querySelector('main');

    if (main) {
      const sectionBlocks = Array.from(main.querySelectorAll(':scope > section'))
        .filter((section) => !!section.querySelector(':scope > details[id]'));
      changed = sortDirectChildren(
        main,
        sectionBlocks,
        (section) => getMenuText(section.querySelector(':scope > details[id] > summary span') || section.querySelector(':scope > details[id] > summary'))
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

  // Section: Page Initialization
  document.addEventListener('DOMContentLoaded', () => {
    applyAutomaticAlphabetizing();
    installAutomaticAlphabetizeObserver();
    const body = document.body;
    const CONFIRM_DIALOG_ID = 'custom-confirm-dialog';
    let confirmDialogInstance = null;
    const mobileQuery = window.matchMedia('(max-width: 768px)');
    const smallQuery = window.matchMedia('(max-width: 540px)');
    const isMobileView = () => mobileQuery.matches;



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
      // Ensure special controls are reparented/returned so they render above the blurred main
      try { updateMovedControls(enabled); } catch (err) { /* ignore */ }
    };

    // Helpers: move theme / go-back controls out of <main> when nav opens so they are not blurred
    const movedControls = new Map();
    function moveOutToBody(el, cls) {
      if (!el || movedControls.has(el)) return;
      try {
        movedControls.set(el, { parent: el.parentNode, next: el.nextSibling });
        el.classList.add('moved-to-body');
        if (cls) el.classList.add(cls);
        document.body.appendChild(el);
      } catch (err) { /* ignore */ }
    }
    function moveBackToOriginal(el) {
      if (!el || !movedControls.has(el)) return;
      const info = movedControls.get(el);
      try {
        if (info.next && info.next.parentNode === info.parent) info.parent.insertBefore(el, info.next);
        else info.parent.appendChild(el);
      } catch (err) {
        try { info.parent.appendChild(el); } catch (e) { /* ignore */ }
      }
      el.classList.remove('moved-to-body', 'moved-theme', 'moved-go-back');
      movedControls.delete(el);
    }
    function updateMovedControls(enabled) {
      try {
        const theme = document.querySelector('.theme-dropdown');
        const goback = document.querySelector('.go-back');
        const small = window.matchMedia('(max-width: 540px)').matches;
        if (enabled && small) {
          moveOutToBody(theme, 'moved-theme');
          moveOutToBody(goback, 'moved-go-back');
        } else {
          moveBackToOriginal(theme);
          moveBackToOriginal(goback);
        }
      } catch (err) { /* ignore */ }
    }

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

    let navInitialEnabled = isMobileView();
    if (!navInitialEnabled) {
      try {
        navInitialEnabled = localStorage.getItem(STORAGE_KEYS.navEnabled) === 'true';
      } catch { navInitialEnabled = false; }
    }
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
      body.classList.add('has-go-back');
      backBtn.addEventListener('click', (e) => {
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
    const themeModeBtns = Array.from(document.querySelectorAll('.theme-mode-toggle'));
    const navToggleBtn = document.querySelector('.nav-toggle');
    const themeChoiceBtns = document.querySelectorAll('.theme-choice');
    const themeViews = document.querySelectorAll('[data-theme-view]');
    const boxifyGrid = document.getElementById('boxify-inventory');
    const boxifyResetBtn = document.querySelector('.boxify-reset');
    let boxifyInitialized = false;
    let currentThemeChoice = 'restaurant';
    const docEl = document.documentElement;

    const ensureCustomConfirmDialog = () => {
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
        lastFocused: null
      };

      const closeDialog = (approved) => {
        if (!confirmDialogInstance) return;
        const state = confirmDialogInstance;
        state.overlay.hidden = true;
        state.overlay.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('custom-confirm-open');
        const decisionHandler = state.onDecision;
        state.onDecision = null;
        if (state.lastFocused && typeof state.lastFocused.focus === 'function') {
          state.lastFocused.focus();
        }
        state.lastFocused = null;
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
    };

    const openCustomConfirm = (messageText, onDecision) => {
      const dialog = ensureCustomConfirmDialog();
      dialog.message.textContent = String(messageText || 'Are you sure?');
      dialog.onDecision = onDecision;
      dialog.lastFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      dialog.overlay.hidden = false;
      dialog.overlay.setAttribute('aria-hidden', 'false');
      document.body.classList.add('custom-confirm-open');
      window.requestAnimationFrame(() => {
        dialog.confirmBtn.focus();
      });
    };

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
      const mobile = isMobileView();
      const leftArrow = '\u25C0'; // ◀
      const rightArrow = '\u25B6'; // ▶
      navToggleBtn.textContent = mobile ? (navEnabled ? leftArrow : rightArrow) : (navEnabled ? 'Disable Navigation' : 'Enable Navigation');
      navToggleBtn.setAttribute('aria-label', navEnabled ? 'Disable navigation' : 'Enable navigation');
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
    // Theme dropdown/menu
    const themeToggleBtn = document.querySelector('.theme-toggle');
    const themeMenu = document.getElementById('theme-menu');
    const updateThemeToggleLabel = () => {
      if (!themeToggleBtn) return;
      const mobile = isMobileView();
      if (mobile) {
        themeToggleBtn.textContent = '☰';
        themeToggleBtn.setAttribute('aria-label', 'Open menu');
      } else {
        themeToggleBtn.textContent = 'Themes';
        themeToggleBtn.setAttribute('aria-label', 'Open theme menu');
      }
    };
    const syncThemeMenuClass = (open) => {
      body.classList.toggle('theme-menu-open', open);
    };

    const closeThemeMenu = () => {
      if (!themeMenu || !themeToggleBtn) return;
      themeMenu.hidden = true;
      themeToggleBtn.setAttribute('aria-expanded', 'false');
      syncThemeMenuClass(false);
    };
    const openThemeMenu = () => {
      if (!themeMenu || !themeToggleBtn) return;
      themeMenu.hidden = false;
      themeToggleBtn.setAttribute('aria-expanded', 'true');
      syncThemeMenuClass(true);
    };
    closeThemeMenu();
    if (themeToggleBtn && themeMenu) {
      themeToggleBtn.addEventListener('click', (e) => {
        const expanded = themeToggleBtn.getAttribute('aria-expanded') === 'true';
        if (expanded) closeThemeMenu(); else openThemeMenu();
      });
      document.addEventListener('click', (e) => {
        if (!themeMenu || !themeToggleBtn) return;
        if (themeMenu.contains(e.target) || themeToggleBtn.contains(e.target)) return;
        closeThemeMenu();
      });
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeThemeMenu();
      });
      themeMenu.addEventListener('click', () => closeThemeMenu());
      updateThemeToggleLabel();
    }

    // Settings (gear) in left rail
    const settingsBtn = document.querySelector('.settings-button');
    const settingsPanel = document.getElementById('settings-panel');
    const settingsOverlay = document.getElementById('settings-overlay');
    const settingsModal = document.querySelector('.settings-modal');
    const settingsCloseBtn = document.querySelector('.settings-close');
    const settingLabelSelects = document.querySelector('.setting-label-selects');
    const settingTitleSelects = document.querySelector('.setting-title-selects');
    const settingResetOnDeselect = document.querySelector('.setting-reset-on-deselect');
    const settingResetDisables = document.querySelector('.setting-reset-disables');
    const settingAutoDisableEmpty = document.querySelector('.setting-auto-disable-empty');
    const settingAutoCollapseDisabled = document.querySelector('.setting-auto-collapse-disabled');
    const settingsResetBtn = document.querySelector('.settings-reset');
    const settingQtyRight = document.querySelector('.setting-qty-right');
    const settingPillArrowOnly = document.querySelector('.setting-pill-arrow-only');
    const settingArrowActivates = document.querySelector('.setting-arrow-activates');
    const settingNextClosesOverlay = document.querySelector('.setting-next-closes-overlay');
    // Settings defaults: all ON by default
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
      resetOnDeselect = v === null ? false : v === 'true';
    } catch { resetOnDeselect = false; }
    if (settingResetOnDeselect) settingResetOnDeselect.checked = resetOnDeselect;
    // Reset button disables item: default OFF
    let resetDisables = false;
    try {
      const v = localStorage.getItem(STORAGE_KEYS.settingsResetDisables);
      resetDisables = v === null ? false : v === 'true';
    } catch { resetDisables = false; }
    if (settingResetDisables) settingResetDisables.checked = resetDisables;
    // Auto-disable section when optional ingredients are all unchecked: default OFF
    let autoDisableEmpty = false;
    try {
      const v = localStorage.getItem(STORAGE_KEYS.settingsAutoDisableEmpty);
      autoDisableEmpty = v === 'true';
    } catch { autoDisableEmpty = false; }
    if (settingAutoDisableEmpty) settingAutoDisableEmpty.checked = autoDisableEmpty;
    // Auto-collapse section when item is disabled: default ON
    let autoCollapseDisabled = true;
    try {
      const v = localStorage.getItem(STORAGE_KEYS.settingsAutoCollapseDisabled);
      autoCollapseDisabled = v === null ? true : v === 'true';
    } catch { autoCollapseDisabled = true; }
    if (settingAutoCollapseDisabled) settingAutoCollapseDisabled.checked = autoCollapseDisabled;
    // Quantity dropdown placement: default BEFORE label (setting unchecked)
    let qtyRight = false;
    try {
      const v = localStorage.getItem(STORAGE_KEYS.settingsQtyRight);
      qtyRight = v === null ? false : v === 'true';
    } catch { qtyRight = false; }
    if (settingQtyRight) settingQtyRight.checked = qtyRight;
    // Menu pills: respect stored value; default OFF unless saved
    let pillArrowOnly = false;
    try {
      const v = localStorage.getItem(STORAGE_KEYS.settingsPillArrowOnly);
      if (v === null) {
        pillArrowOnly = settingPillArrowOnly ? !!settingPillArrowOnly.defaultChecked : false;
      } else {
        pillArrowOnly = v === 'true';
      }
    } catch { pillArrowOnly = settingPillArrowOnly ? !!settingPillArrowOnly.defaultChecked : false; }
    if (settingPillArrowOnly) settingPillArrowOnly.checked = pillArrowOnly;
    window.pillArrowOnly = pillArrowOnly;
    let nextClosesOverlay = false;
    try {
      const v = localStorage.getItem(STORAGE_KEYS.settingsNextClosesOverlay);
      nextClosesOverlay = v === 'true';
    } catch { nextClosesOverlay = false; }
    if (settingNextClosesOverlay) settingNextClosesOverlay.checked = nextClosesOverlay;
    // Arrow click also activates section checkbox: default ON
    let arrowActivates = true;
    try {
      const v = localStorage.getItem(STORAGE_KEYS.settingsArrowActivates);
      arrowActivates = v === null ? true : v === 'true';
    } catch { arrowActivates = true; }
    if (settingArrowActivates) settingArrowActivates.checked = arrowActivates;
    window.arrowActivates = arrowActivates;
    const hasOverlay = !!settingsOverlay;

    // Setting conflict helper
    const collectSettingState = () => ({
      labelSelects,
      titleSelects,
      pillArrowOnly,
      arrowActivates
    });

    const detectSettingConflicts = (state) => {
      const issues = [];
      if (!state.labelSelects && !state.titleSelects && state.pillArrowOnly) {
        issues.push('With both "Ingredient label toggles checkbox" and "Section title toggles checkbox" turned off while "Menu item arrow expands/collapses only" is on, clicking menu titles will not toggle checkboxes and only tiny arrow areas respond.');
      }
      if (state.pillArrowOnly && !state.arrowActivates) {
        issues.push('"Menu item arrow expands/collapses only" is on but "Arrow also activates menu item" is off, so arrows will not turn sections on; you must check boxes manually.');
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

    const closeSettings = () => {
      if (!settingsBtn) return;
      if (hasOverlay) {
        settingsOverlay.hidden = true;
        settingsOverlay.style.display = 'none';
        settingsOverlay.setAttribute('aria-hidden', 'true');
        if (settingsPanel) {
          settingsPanel.hidden = true;
          settingsPanel.style.display = 'none';
          settingsPanel.setAttribute('aria-hidden', 'true');
        }
      } else if (settingsPanel) {
        settingsPanel.hidden = true;
        settingsPanel.style.display = 'none';
        settingsPanel.setAttribute('aria-hidden', 'true');
      }
      body.classList.remove('settings-open');
      document.documentElement.classList.remove('settings-open');
      settingsBtn.setAttribute('aria-expanded', 'false');
    };
    const openSettings = () => {
      if (!settingsBtn) return;
      if (hasOverlay) {
        settingsOverlay.hidden = false;
        settingsOverlay.style.display = 'flex';
        settingsOverlay.setAttribute('aria-hidden', 'false');
        if (settingsPanel) {
          settingsPanel.hidden = false;
          settingsPanel.style.display = 'block';
          settingsPanel.setAttribute('aria-hidden', 'false');
        }
      } else if (settingsPanel) {
        settingsPanel.hidden = false;
        settingsPanel.style.display = 'block';
        settingsPanel.setAttribute('aria-hidden', 'false');
      }
      settingsBtn.setAttribute('aria-expanded', 'true');
      body.classList.add('settings-open');
      document.documentElement.classList.add('settings-open');
    };
    // ensure closed on fresh load
    closeSettings();
    if (settingsBtn) {
      settingsBtn.addEventListener('click', () => {
        const isOpen = settingsBtn.getAttribute('aria-expanded') === 'true';
        if (isOpen) closeSettings(); else openSettings();
      });
      document.addEventListener('keydown', (evt) => {
        if (evt.key === 'Escape') closeSettings();
      });
    }
    if (settingsCloseBtn) settingsCloseBtn.addEventListener('click', closeSettings);
    // Safety: delegate close actions for any dynamically rendered close buttons
    document.addEventListener('click', (evt) => {
      if (evt.target.closest('.settings-close')) {
        closeSettings();
      }
    });
    if (hasOverlay && settingsOverlay) {
      settingsOverlay.addEventListener('click', (evt) => {
        const clickedInsideModal = settingsModal && settingsModal.contains(evt.target);
        if (!clickedInsideModal) closeSettings();
      });
      // Close overlay before page is hidden/back/forward cache restores
      window.addEventListener('pagehide', closeSettings);
    }
    // Force-closed on initial load in case prior state left it open
    closeSettings();
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
    if (settingPillArrowOnly) {
      settingPillArrowOnly.addEventListener('change', () => {
        const prev = collectSettingState();
        pillArrowOnly = !!settingPillArrowOnly.checked;
        window.pillArrowOnly = pillArrowOnly;
        document.dispatchEvent(new Event('pillArrowOnlyChanged'));
        const revert = (state) => {
          pillArrowOnly = state.pillArrowOnly;
          window.pillArrowOnly = pillArrowOnly;
          if (settingPillArrowOnly) settingPillArrowOnly.checked = pillArrowOnly;
          document.dispatchEvent(new Event('pillArrowOnlyChanged'));
          try { localStorage.setItem(STORAGE_KEYS.settingsPillArrowOnly, String(pillArrowOnly)); } catch { }
        };
        maybeWarnSettingConflicts(prev, revert, () => {
          try { localStorage.setItem(STORAGE_KEYS.settingsPillArrowOnly, String(pillArrowOnly)); } catch { }
        });
      });
    }
    if (settingArrowActivates) {
      settingArrowActivates.addEventListener('change', () => {
        const prev = collectSettingState();
        arrowActivates = !!settingArrowActivates.checked;
        window.arrowActivates = arrowActivates;
        const revert = (state) => {
          arrowActivates = state.arrowActivates;
          window.arrowActivates = arrowActivates;
          if (settingArrowActivates) settingArrowActivates.checked = arrowActivates;
          try { localStorage.setItem(STORAGE_KEYS.settingsArrowActivates, String(arrowActivates)); } catch { }
        };
        maybeWarnSettingConflicts(prev, revert, () => {
          try { localStorage.setItem(STORAGE_KEYS.settingsArrowActivates, String(arrowActivates)); } catch { }
        });
      });
    }
    if (settingNextClosesOverlay) {
      settingNextClosesOverlay.addEventListener('change', () => {
        nextClosesOverlay = !!settingNextClosesOverlay.checked;
        try { localStorage.setItem(STORAGE_KEYS.settingsNextClosesOverlay, String(nextClosesOverlay)); } catch { }
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
    if (settingAutoCollapseDisabled) {
      settingAutoCollapseDisabled.addEventListener('change', () => {
        autoCollapseDisabled = !!settingAutoCollapseDisabled.checked;
        try { localStorage.setItem(STORAGE_KEYS.settingsAutoCollapseDisabled, String(autoCollapseDisabled)); } catch { }
        if (autoCollapseDisabled) {
          document.querySelectorAll('.section-toggle').forEach((toggle) => {
            const details = toggle.closest('details');
            if (!details) return;
            if (!toggle.checked || toggle.disabled) {
              details.open = false;
            }
          });
        }
      });
    }

    const triggerSettingChange = (el) => {
      if (!el) return;
      el.dispatchEvent(new Event('change', { bubbles: true }));
    };

    if (settingsResetBtn) {
      settingsResetBtn.addEventListener('click', () => {
        // Defaults per current design
        labelSelects = true;
        titleSelects = true;
        pillArrowOnly = settingPillArrowOnly ? !!settingPillArrowOnly.defaultChecked : false;
        // Defaults: reset-related toggles
        resetOnDeselect = false;
        resetDisables = false;
        autoDisableEmpty = false;
        autoCollapseDisabled = true;
        // Default: quantity dropdowns before the label
        qtyRight = false;
        arrowActivates = true;
        try {
          localStorage.setItem(STORAGE_KEYS.settingsLabelSelects, 'true');
          localStorage.setItem(STORAGE_KEYS.settingsTitleSelects, 'true');
          localStorage.setItem(STORAGE_KEYS.settingsPillArrowOnly, String(pillArrowOnly));
          localStorage.setItem(STORAGE_KEYS.settingsArrowActivates, 'true');
          localStorage.setItem(STORAGE_KEYS.settingsResetOnDeselect, 'false');
          localStorage.setItem(STORAGE_KEYS.settingsResetDisables, 'false');
          localStorage.setItem(STORAGE_KEYS.settingsAutoDisableEmpty, 'false');
          localStorage.setItem(STORAGE_KEYS.settingsAutoCollapseDisabled, 'true');
          localStorage.setItem(STORAGE_KEYS.settingsQtyRight, 'false');
          localStorage.setItem(STORAGE_KEYS.settingsNextClosesOverlay, 'false');
        } catch { }
        if (settingLabelSelects) settingLabelSelects.checked = true;
        if (settingTitleSelects) settingTitleSelects.checked = true;
        if (settingPillArrowOnly) settingPillArrowOnly.checked = pillArrowOnly;
        if (settingArrowActivates) settingArrowActivates.checked = true;
        if (settingResetOnDeselect) settingResetOnDeselect.checked = false;
        if (settingResetDisables) settingResetDisables.checked = false;
        if (settingAutoDisableEmpty) settingAutoDisableEmpty.checked = false;
        if (settingAutoCollapseDisabled) settingAutoCollapseDisabled.checked = true;
        if (settingQtyRight) settingQtyRight.checked = false;
        if (settingNextClosesOverlay) settingNextClosesOverlay.checked = false;
        nextClosesOverlay = false;
        window.pillArrowOnly = pillArrowOnly;
        document.dispatchEvent(new Event('pillArrowOnlyChanged'));
        // Re-run change handlers to apply live behavior
        triggerSettingChange(settingLabelSelects);
        triggerSettingChange(settingTitleSelects);
        triggerSettingChange(settingPillArrowOnly);
        triggerSettingChange(settingResetOnDeselect);
        triggerSettingChange(settingResetDisables);
        triggerSettingChange(settingAutoDisableEmpty);
        triggerSettingChange(settingAutoCollapseDisabled);
        triggerSettingChange(settingQtyRight);
        triggerSettingChange(settingArrowActivates);
        applyQtyPlacement();
        updatePageNavLocks();
      });
    }

    const syncMobileUiState = () => {
      const mobile = isMobileView();
      body.classList.toggle('mobile-ui', mobile);
      if (navToggleBtn) {
        navToggleBtn.hidden = false;
        navToggleBtn.setAttribute('aria-hidden', 'false');
        navToggleBtn.disabled = false;
      }
      // Reapply current nav state so tabindex/aria stay in sync after viewport changes
      setNavState(body.classList.contains('nav-enabled'));
      updateThemeToggleLabel();
      updateThemeModeLabel();
      updateNavToggleLabel();
      updatePageNavLocks();
    };
    syncMobileUiState();
    mobileQuery.addEventListener('change', syncMobileUiState);
    // Ensure moved controls are properly reparented when viewport crosses the mobile threshold
    try {
      smallQuery.addEventListener('change', () => {
        try { updateMovedControls(document.body.classList.contains('nav-enabled')); } catch (err) { /* ignore */ }
      });
    } catch (err) { /* ignore */ }
    // On resize, debounce and re-evaluate placement as well (handles minimize/maximize transitions)
    (function () {
      let resizeTimer = null;
      window.addEventListener('resize', () => {
        if (resizeTimer) clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
          try { updateMovedControls(document.body.classList.contains('nav-enabled')); } catch (err) { /* ignore */ }
        }, 150);
      });
    })();

    if (themeModeBtns.length) {
      themeModeBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
          body.classList.toggle('theme-dark');
          updateThemeModeLabel();
          persistThemeState();
        });
      });
    }

    if (navToggleBtn) {
      navToggleBtn.addEventListener('click', () => {
        const navEnabled = body.classList.contains('nav-enabled');
        const nextState = !navEnabled;
        setNavState(nextState);
        updateNavToggleLabel();
        try {
          localStorage.setItem(STORAGE_KEYS.navEnabled, String(nextState));
        } catch { }
        // Re-apply page access rules anytime nav visibility changes
        updatePageNavLocks();
      });
    }

    const applyQtyPlacement = () => {
      body.classList.toggle('qty-right', qtyRight);
      document.querySelectorAll('select.ingredient-qty').forEach((sel) => {
        if (sel.dataset && sel.dataset.noQty === 'true') return;
        const lbl = sel.closest('label');
        if (!lbl) return;
        const cb = lbl.querySelector('input[type="checkbox"]');
        if (qtyRight) {
          lbl.appendChild(sel);
        } else {
          if (cb) cb.insertAdjacentElement('afterend', sel);
        }
        if (cb) {
          const isChecked = !!cb.checked;
          sel.hidden = !isChecked;
          sel.disabled = !isChecked;
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
    // Apply initial placement/class once quantities are available
    applyQtyPlacement();

    updateThemeModeLabel();
    updateNavToggleLabel();

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
                const s = localStorage.getItem(STORAGE_KEYS.deliverySuite) || '';
                if (n) form.querySelector('#delivery-name').value = n;
                if (ph) form.querySelector('#delivery-phone').value = ph;
                if (a) form.querySelector('#delivery-address').value = a;
                if (s) {
                  const suiteEl = form.querySelector('#delivery-suite');
                  if (suiteEl) suiteEl.value = s;
                }
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
              const s = localStorage.getItem(STORAGE_KEYS.deliverySuite) || '';
              if (n) form.querySelector('#delivery-name').value = n;
              if (ph) form.querySelector('#delivery-phone').value = ph;
              if (a) form.querySelector('#delivery-address').value = a;
              if (s) {
                const suiteEl = form.querySelector('#delivery-suite');
                if (suiteEl) suiteEl.value = s;
              }
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
        const formatZipPlus4 = (v) => {
          const d = String(v || '').replace(/\D+/g, '').slice(0, 9);
          const first = d.slice(0, 5);
          const plus4 = d.slice(5);
          return plus4 ? `${first}-${plus4}` : first;
        };
        if (phoneEl) {
          if (phoneEl.value) phoneEl.value = formatPhone(phoneEl.value);
          phoneEl.addEventListener('input', () => {
            const rawValue = phoneEl.value;
            const selectionStart = phoneEl.selectionStart || 0;
            const digitsBefore = rawValue.slice(0, selectionStart).replace(/\D+/g, '').length;
            const formatted = formatPhone(rawValue);
            phoneEl.value = formatted;
            const d = formatted.replace(/\D+/g, '');
            const targetCaret = getCaretFromDigitCount(formatted, digitsBefore);
            const pos = Math.min(targetCaret, formatted.length);
            phoneEl.setSelectionRange(pos, pos);
            if (d.length === 10 || d.length === 0) {
              // proactively clear any lingering tooltip in Chrome
              try {
                phoneEl.setCustomValidity('');
                if (typeof phoneEl.reportValidity === 'function') phoneEl.reportValidity();
              } catch { }
            }
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
          const name = dForm.querySelector('#delivery-name').value.trim();
          const phoneEl = dForm.querySelector('#delivery-phone');
          const phone = phoneEl ? phoneEl.value.replace(/\D+/g, '') : '';
          const addr = dForm.querySelector('#delivery-address').value.trim();
          const type = (dForm.querySelector('#delivery-type')?.value || '').trim();
          const city = dForm.querySelector('#delivery-city').value.trim();
          const zipEl = dForm.querySelector('#delivery-zip');
          const zip = zipEl ? zipEl.value.trim() : '';
          const suiteEl = dForm.querySelector('#delivery-suite');
          const suite = suiteEl ? suiteEl.value.trim() : '';
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
            localStorage.setItem(STORAGE_KEYS.deliverySuite, suite);
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
              localStorage.removeItem(STORAGE_KEYS.deliverySuite);
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
      saveIngredientCatalogFromDOM();
      // Restore previous selections
      restoreIngredients();
      // Restore saved pizza size and attach change handlers to save when changed
      try {
        const radios = Array.from(document.querySelectorAll('input[type="radio"][name="pizza_size"]'));
        if (radios.length) {
          const stored = getPizzaSize();
          if (stored) {
            const el = document.querySelector(`input[type="radio"][name="pizza_size"][value="${stored}"]`);
            if (el) el.checked = true;
          }
          // If nothing stored yet, persist the currently checked default so summary can always show it
          if (!stored) {
            const checked = radios.find(r => r.checked);
            if (checked) savePizzaSize(checked.value);
          }
          radios.forEach((r) => r.addEventListener('change', (ev) => {
            if (r.checked) savePizzaSize(r.value);
          }));
        }
      } catch (err) { /* ignore */ }

      // Auto-open a section from hash (e.g., #pizza or #burger)"
      openSectionFromHash();
      // Enforce required Burger Patty and Bun to be checked
      const patty = document.querySelector('input[type="checkbox"][name="burger_ingredients[]"][value="patty"]');
      const bun = document.querySelector('input[type="checkbox"][name="burger_ingredients[]"][value="bun"]');
      const pizzaSauce = document.querySelector('input[type="checkbox"][name="pizza_ingredients[]"][value="tomato_sauce"]');
      const subBread = document.getElementById('sub-bread-checkbox');
      const subBreadSelect = document.getElementById('sub-bread-select');
      const wrapBread = document.getElementById('wrap-bread-checkbox');
      const wrapBreadSelect = document.getElementById('wrap-bread-select');
      const enforceReq = (el) => {
        if (!el) return;
        el.checked = true;
      };
      const applyBreadChoice = (field, val, choices) => {
        if (!field) return;
        const choice = choices.includes(val) ? val : choices[0];
        if (field.select) field.select.value = choice;
        if (field.checkbox) field.checkbox.value = choice;
      };
      const restoreBreadChoice = (config) => {
        const { field, choices, storageKey } = config;
        if (!field || !field.checkbox || !field.select) return;
        let stored = choices[0];
        try {
          const raw = localStorage.getItem(STORAGE_KEYS.ingredients);
          if (raw) {
            const data = JSON.parse(raw) || {};
            const arr = Array.isArray(data[storageKey]) ? data[storageKey] : [];
            const found = arr.find((item) => {
              if (typeof item === 'string') return choices.includes(item);
              if (item && typeof item === 'object') return choices.includes(item.value);
              return false;
            });
            if (found) stored = typeof found === 'string' ? found : found.value;
          }
        } catch { stored = choices[0]; }
        applyBreadChoice(field, stored, choices);
      };
      const breadFieldConfigs = [
        {
          storageKey: 'sub_ingredients[]',
          choices: ['white', 'wheat'],
          field: { checkbox: subBread, select: subBreadSelect }
        },
        {
          storageKey: 'wrap_ingredients[]',
          choices: ['white', 'wheat', 'tomato_basil', 'spinach'],
          field: { checkbox: wrapBread, select: wrapBreadSelect }
        }
      ];
      enforceReq(patty);
      enforceReq(bun);
      enforceReq(pizzaSauce);
      breadFieldConfigs.forEach((config) => {
        const { field, choices } = config;
        restoreBreadChoice(config);
        if (field.checkbox) {
          enforceReq(field.checkbox);
        }
        if (field.select) {
          field.select.addEventListener('change', () => {
            applyBreadChoice(field, field.select.value, choices);
            saveIngredients();
          });
        }
      });
      // Ensure storage includes them
      saveIngredients();
      // Build ingredient quantity dropdowns (Regular/Extra/x3/x4)
      (function attachIngredientQuantities() {
        let qtyMap = {};
        try { qtyMap = JSON.parse(localStorage.getItem(STORAGE_KEYS.quantities) || '{}'); } catch { qtyMap = {}; }
        const options = [
          { label: 'Regular', value: '1' },
          { label: 'Light', value: '2' },
          { label: 'Extra', value: '3' },
          { label: 'x3', value: '4' },
        ];
        document.querySelectorAll('input[type="checkbox"][name$=\"_ingredients[]\"]').forEach((cb) => {
          // Some items (e.g., Sub bread) use the dropdown for a custom choice, not quantity
          if (cb.dataset && cb.dataset.noQty === 'true') {
            const ownSelect = cb.closest('label')?.querySelector('select.ingredient-qty');
            if (ownSelect) {
              ownSelect.disabled = !cb.checked;
              ownSelect.hidden = !cb.checked;
              const syncSelect = (persist) => {
                const next = ownSelect.value;
                if (next) cb.value = next;
                if (persist) {
                  saveIngredients();
                  updateBuilderError();
                  updatePageNavLocks();
                }
              };
              ownSelect.addEventListener('change', () => syncSelect(true));
              syncSelect(false);
            }
            return;
          }
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
          const stored = Math.max(1, Math.min(4, parseInt(qtyMap[key] || '1', 10) || 1));
          sel.value = String(stored);
          sel.disabled = !cb.checked;
          sel.hidden = !cb.checked;
          const persistQty = (val) => {
            qtyMap[key] = val;
            try { localStorage.setItem(STORAGE_KEYS.quantities, JSON.stringify(qtyMap)); } catch { }
          };
          sel.addEventListener('change', () => {
            const next = Math.max(1, Math.min(4, parseInt(sel.value, 10) || 1));
            sel.value = String(next);
            persistQty(next);
          });
          cb.addEventListener('change', () => {
            sel.disabled = !cb.checked;
            sel.hidden = !cb.checked;
            if (cb.checked) {
              if (!qtyMap[key] || qtyMap[key] === 0) {
                sel.value = '1';
                persistQty(1);
              }
            } else {
              if (resetOnDeselect) {
                sel.value = '1';
                persistQty(1);
              }
            }
          });
        });
      })();

      // Menu overlay helpers
      const overlays = Array.from(document.querySelectorAll('.menu-overlay'));
      const menuLaunchButtons = Array.from(document.querySelectorAll('.menu-launch[data-target]'));
      const mobileMenuSwiper = document.querySelector('.mobile-menu-swiper');
      const mobileSwiperTrack = mobileMenuSwiper ? mobileMenuSwiper.querySelector('.swiper-track') : null;
      const mobileSwiperPrev = mobileMenuSwiper ? mobileMenuSwiper.querySelector('.swiper-arrow-prev') : null;
      const mobileSwiperNext = mobileMenuSwiper ? mobileMenuSwiper.querySelector('.swiper-arrow-next') : null;
      const updateSwiperArrows = () => {
        if (!mobileMenuSwiper || !mobileSwiperTrack || !isMobileView()) return;
        const maxScroll = mobileSwiperTrack.scrollWidth - mobileSwiperTrack.clientWidth;
        const atStart = mobileSwiperTrack.scrollLeft <= 0;
        const atEnd = mobileSwiperTrack.scrollLeft >= (maxScroll - 1);
        if (mobileSwiperPrev) mobileSwiperPrev.disabled = atStart;
        if (mobileSwiperNext) mobileSwiperNext.disabled = atEnd;
      };
      const scrollSwiper = (dir = 1) => {
        if (!mobileSwiperTrack) return;
        const step = Math.max(160, Math.floor(mobileSwiperTrack.clientWidth * 0.6));
        mobileSwiperTrack.scrollBy({ left: step * dir, behavior: 'smooth' });
        setTimeout(updateSwiperArrows, 220);
      };
      const focusMenuChip = (section) => {
        if (!section || !mobileSwiperTrack || !isMobileView()) return;
        const chip = mobileSwiperTrack.querySelector(`.menu-launch[data-target="${section}"]`);
        if (chip) chip.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      };
      if (mobileSwiperPrev) mobileSwiperPrev.addEventListener('click', () => scrollSwiper(-1));
      if (mobileSwiperNext) mobileSwiperNext.addEventListener('click', () => scrollSwiper(1));
      if (mobileSwiperTrack) {
        mobileSwiperTrack.addEventListener('scroll', () => {
          if (!isMobileView()) return;
          updateSwiperArrows();
        });
        mobileQuery.addEventListener('change', updateSwiperArrows);
      }
      updateSwiperArrows();
      const closeOverlay = (overlay) => {
        if (!overlay) return;
        overlay.hidden = true;
        overlay.classList.remove('visible');
        if (!overlays.some(o => !o.hidden)) {
          body.classList.remove('menu-overlay-open');
        }
      };
      const closeAllOverlays = () => {
        let closedAny = false;
        overlays.forEach((overlay) => {
          if (!overlay.hidden) {
            closedAny = true;
            closeOverlay(overlay);
          }
        });
        return closedAny;
      };
      const openOverlay = (section) => {
        const overlay = overlays.find(o => o.dataset.section === section);
        if (!overlay) return;
        overlays.forEach(o => { if (o !== overlay) closeOverlay(o); });
        overlay.hidden = false;
        overlay.classList.add('visible');
        body.classList.add('menu-overlay-open');
        const summary = overlay.querySelector('.menu-summary');
        if (summary) summary.focus({ preventScroll: true });
        focusMenuChip(section);
        updateSwiperArrows();
      };
      const syncMenuLaunchState = () => {
        // OLD SECTION (kept for reference): querySelector/active lookup for launch state
        // const activeLookup = {};
        // document.querySelectorAll('.section-toggle').forEach((toggle) => {
        //   const sec = toggle.dataset.section;
        //   if (sec) activeLookup[sec] = toggle.checked;
        // });
        // menuLaunchButtons.forEach((btn) => {
        //   const target = btn.getAttribute('data-target');
        //   const isActive = target ? !!activeLookup[target] : false;
        //   btn.classList.toggle('menu-launch-active', isActive);
        // });

        menuLaunchButtons.forEach((btn) => {
          btn.classList.remove('menu-launch-active');
        });
      };
      const ensureMenuLaunchArrow = (btn) => {
        let arrow = btn.querySelector('.menu-launch-arrow');
        if (!arrow) {
          arrow = document.createElement('span');
          arrow.className = 'menu-launch-arrow';
          arrow.setAttribute('aria-hidden', 'true');
          btn.appendChild(arrow);
        }
        // Provide a visible triangle if markup/CSS hasn't injected one
        if (!arrow.textContent || !arrow.textContent.trim()) {
          arrow.textContent = '\u25B8';
        }
        return arrow;
      };
      const isPillArrowSettingOn = () => {
        try { return !!window.pillArrowOnly; } catch { return false; }
      };
      menuLaunchButtons.forEach((btn) => {
        const arrow = ensureMenuLaunchArrow(btn);
        const openTarget = () => {
          const target = btn.getAttribute('data-target');
          if (target) openOverlay(target);
        };
        const isArrowTarget = (t) => {
          if (!arrow) return false;
          if (arrow === t) return true;
          if (arrow.contains(t)) return true;
          if (t && t.closest) {
            const viaClosest = t.closest('.menu-launch-arrow');
            if (viaClosest && viaClosest === arrow) return true;
          }
          return false;
        };
        const blockIfNeeded = (evt) => {
          if (!isPillArrowSettingOn()) return false;
          const arrowClicked = isArrowTarget(evt.target);
          if (!arrowClicked) {
            evt.stopImmediatePropagation();
            return true;
          }
          return false;
        };
        ['mousedown', 'pointerdown', 'touchstart'].forEach((evtName) => {
          btn.addEventListener(evtName, (evt) => {
            // Don't call preventDefault here — only stop propagation so native scrolling (touch/pan)
            // still works. We only want to prevent other JS handlers from running, not cancel native gestures.
            if (isPillArrowSettingOn()) {
              const arrowClicked = isArrowTarget(evt.target);
              if (!arrowClicked) {
                // allow default (so scrolling isn't blocked) but prevent other handlers from running
                evt.stopImmediatePropagation();
              }
            }
          }, true);
        });
        btn.addEventListener('click', (e) => {
          if (blockIfNeeded(e)) return;
          openTarget();
        });
        if (arrow) {
          arrow.addEventListener('click', (e) => {
            e.stopPropagation();
            openTarget();
          });
        }
      });

      // Guard: block non-arrow clicks when pillArrowOnly is enabled, even if other listeners exist
      document.addEventListener('click', (e) => {
        const pill = e.target.closest && e.target.closest('.menu-launch[data-target]');
        if (!pill) return;
        if (!isPillArrowSettingOn()) return;
        const arrowHit = e.target.closest('.menu-launch-arrow');
        if (!arrowHit) {
          e.stopImmediatePropagation();
        }
      }, true);
      overlays.forEach((overlay) => {
        overlay.addEventListener('click', (e) => {
          if (e.target === overlay) closeOverlay(overlay);
        });
        const closeBtn = overlay.querySelector('.close-overlay');
        if (closeBtn) closeBtn.addEventListener('click', () => closeOverlay(overlay));
      });
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          const active = overlays.find(o => !o.hidden);
          if (active) closeOverlay(active);
        }
      });
      const collapseOpenMenuDetails = () => {
        const details = Array.from(document.querySelectorAll('details'));
        const openSections = details.filter((d) => d.open);
        if (!openSections.length) return false;
        openSections.forEach((d) => { d.open = false; });
        return true;
      };
      const pageNextButton = document.querySelector('.next-button');
      const resetAllBtn = document.querySelector('.reset-all');
      if (pageNextButton) {
        pageNextButton.addEventListener('click', (e) => {
          const closed = closeAllOverlays();
          const collapsedDetails = closed ? false : collapseOpenMenuDetails();
          if (nextClosesOverlay && (closed || collapsedDetails)) {
            e.preventDefault();
            e.stopImmediatePropagation();
            return;
          }
          if (closed || collapsedDetails) {
            const menuActions = document.querySelector('.menu-actions');
            if (menuActions) menuActions.scrollIntoView({ behavior: 'smooth', block: 'start' });
            const firstButton = document.querySelector('.menu-launch');
            if (firstButton) firstButton.focus({ preventScroll: true });
          }
        });
      }
      if (resetAllBtn) {
        resetAllBtn.addEventListener('click', () => {
          const groups = new Set();
          document.querySelectorAll('.reset-group[data-group]').forEach((btn) => {
            const g = btn.getAttribute('data-group');
            if (g) groups.add(g);
          });
          groups.forEach((g) => resetGroupByName(g, { forceDisable: true }));
          saveIngredients();
          updateBuilderError();
          updatePageNavLocks();
          closeAllOverlays();
          collapseOpenMenuDetails();
        });
      }
      if (location.hash) {
        const hashSection = location.hash.replace('#', '').trim();
        if (hashSection) openOverlay(hashSection);
      }

      // Hard-lock required items so they cannot be unchecked directly
      try {
        document.querySelectorAll('input[type="checkbox"][data-required="true"]').forEach((cb) => {
          // Block click toggling
          cb.addEventListener('click', (e) => {
            // Keep it checked and suppress default toggle
            if (!cb.checked) cb.checked = true;
            e.stopPropagation();
          });
          // Block programmatic/user change events
          cb.addEventListener('change', () => {
            if (!cb.checked) cb.checked = true;
          });
        });
      } catch { }

      // Load/save quantities for sections and sauces
      let qtySections = {};
      try { qtySections = JSON.parse(localStorage.getItem(STORAGE_KEYS.quantitiesSections) || '{}'); } catch { qtySections = {}; }
      let qtyMap = {};
      try { qtyMap = JSON.parse(localStorage.getItem(STORAGE_KEYS.quantities) || '{}'); } catch { qtyMap = {}; }
      const saveQtySections = () => { try { localStorage.setItem(STORAGE_KEYS.quantitiesSections, JSON.stringify(qtySections)); } catch { } };
      const saveQtyMap = () => { try { localStorage.setItem(STORAGE_KEYS.quantities, JSON.stringify(qtyMap)); } catch { } };
      const SECTION_QTY_KEYS = ['pizza', 'burger', 'calzone', 'chicken_wings', 'salad', 'sub', 'wrap'];
      const syncSectionQtyControlVisibility = () => {
        SECTION_QTY_KEYS.forEach((sec) => {
          const sectionEl = document.getElementById(sec);
          if (!sectionEl) return;
          const sectionToggle = sectionEl.querySelector('.section-toggle');
          const qtyWrap = sectionEl.querySelector('.menu-summary .qty-controls');
          if (!qtyWrap) return;
          const active = sectionToggle ? sectionToggle.checked : true;
          qtyWrap.style.display = active ? 'inline-flex' : 'none';
        });
      };

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

      // Decorate section summaries with quantity controls (1-12)
      SECTION_QTY_KEYS.forEach((sec) => {
        const d = document.getElementById(sec);
        if (!d) return;
        const summary = d.querySelector('.menu-summary');
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
        const sectionToggle = d.querySelector('.section-toggle');
        const setQtyVisible = () => {
          const active = sectionToggle ? sectionToggle.checked : true;
          wrap.style.display = active ? 'inline-flex' : 'none';
        };
        const getStoredQty = () => {
          let stored = 0;
          try {
            const qs = JSON.parse(localStorage.getItem(STORAGE_KEYS.quantitiesSections) || '{}');
            stored = parseInt(qs[sec] || '0', 10) || 0;
          } catch { stored = parseInt(qtySections[sec] || '0', 10) || 0; }
          // fall back to visible label if storage is stale
          if (!stored) {
            const labelNum = parseInt((label.textContent || '').replace(/\D+/g, ''), 10);
            if (!Number.isNaN(labelNum)) stored = labelNum;
          }
          return Math.max(0, Math.min(12, stored));
        };
        const update = (next) => {
          current = Math.max(0, Math.min(12, (next | 0)));
          qtySections[sec] = current; saveQtySections();
          try {
            const qs = JSON.parse(localStorage.getItem(STORAGE_KEYS.quantitiesSections) || '{}');
            qs[sec] = current;
            localStorage.setItem(STORAGE_KEYS.quantitiesSections, JSON.stringify(qs));
          } catch { }
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
        dec.addEventListener('click', (e) => {
          e.stopPropagation();
          current = getStoredQty();
          update(current - 1);
        });
        inc.addEventListener('click', (e) => {
          e.stopPropagation();
          current = getStoredQty();
          update(current + 1);
        });
        wrap.appendChild(label); wrap.appendChild(dec); wrap.appendChild(inc);
        summary.appendChild(wrap);
        setQtyVisible();
        if (sectionToggle) sectionToggle.addEventListener('change', setQtyVisible);
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
        const syncCurrent = () => {
          try {
            const qm = JSON.parse(localStorage.getItem(STORAGE_KEYS.quantities) || '{}');
            current = Math.max(1, Math.min(12, parseInt(qm[qKey] || txt.textContent.replace(/\D+/g, '') || '1', 10) || 1));
          } catch { current = Math.max(1, current || 1); }
        };
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
        dec.addEventListener('click', (e) => { e.stopPropagation(); syncCurrent(); update(current - 1); });
        inc.addEventListener('click', (e) => { e.stopPropagation(); syncCurrent(); update(current + 1); });
        wrap.appendChild(txt); wrap.appendChild(dec); wrap.appendChild(inc);
        // Show controls only when checked
        const setVisible = () => { wrap.style.display = cb.checked ? 'inline-flex' : 'none'; };
        setVisible();
        cb.addEventListener('change', () => {
          if (!cb.checked) {
            if (resetOnDeselect) {
              // If item is not selected, its quantity resets to default
              qtyMap[qKey] = 1; saveQtyMap();
              txt.textContent = `(x1)`;
              current = 1;
            }
          } else {
            // When re-checked, if stored 0 bump back to 1 (do not show 0 when rechecked)
            const prev = (qtyMap[qKey] | 0);
            if (prev === 0) {
              qtyMap[qKey] = 1; saveQtyMap();
              txt.textContent = `(x1)`;
              current = 1;
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
        const syncPatty = () => {
          try {
            const qm = JSON.parse(localStorage.getItem(STORAGE_KEYS.quantities) || '{}');
            current = Math.max(1, Math.min(3, parseInt(qm[qKey] || txt.textContent.replace(/\D+/g, '') || '1', 10) || 1));
          } catch { current = Math.max(1, current || 1); }
        };
        const savePatty = () => { qtyMap[qKey] = current; try { localStorage.setItem(STORAGE_KEYS.quantities, JSON.stringify(qtyMap)); } catch { } };
        const update = (next) => { current = Math.max(1, Math.min(3, (next | 0))); txt.textContent = `(x${current})`; savePatty(); };
        dec.addEventListener('click', (e) => { e.stopPropagation(); syncPatty(); update(current - 1); });
        inc.addEventListener('click', (e) => { e.stopPropagation(); syncPatty(); update(current + 1); });
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
          const syncCurrent = () => {
            try {
              const qm = JSON.parse(localStorage.getItem(STORAGE_KEYS.quantities) || '{}');
              current = Math.max(1, Math.min(12, parseInt(qm[qKey] || txt.textContent.replace(/\D+/g, '') || '1', 10) || 1));
            } catch { current = Math.max(1, current || 1); }
          };
          const update = (next) => { current = Math.max(1, Math.min(12, (next | 0))); txt.textContent = `(x${current})`; save(); };
          dec.addEventListener('click', (e) => { e.stopPropagation(); syncCurrent(); update(current - 1); });
          inc.addEventListener('click', (e) => { e.stopPropagation(); syncCurrent(); update(current + 1); });
          wrap.appendChild(txt); wrap.appendChild(dec); wrap.appendChild(inc);
          const setVisible = () => { wrap.style.display = cb.checked ? 'inline-flex' : 'none'; };
          setVisible();
          cb.addEventListener('change', () => {
            if (!cb.checked) {
              // When item is unchecked, optionally reset quantity based on setting
              if (resetOnDeselect) {
                try {
                  const qm = JSON.parse(localStorage.getItem(STORAGE_KEYS.quantities) || '{}');
                  qm[qKey] = 1; localStorage.setItem(STORAGE_KEYS.quantities, JSON.stringify(qm));
                  txt.textContent = `(x1)`;
                  current = 1;
                } catch { }
              }
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

      // Section toggles: track active menu sections
      const toggles = document.querySelectorAll('.section-toggle');
      const detailsBySection = {
        pizza: document.getElementById('pizza'),
        burger: document.getElementById('burger'),
        sauces: document.getElementById('sauces'),
        sub: document.getElementById('sub'),
        wrap: document.getElementById('wrap')
      };
      const openSectionDetails = (section) => {
        const d = detailsBySection[section];
        if (!d || !d.tagName || d.tagName.toLowerCase() !== 'details') return;
        d.open = true;
      };
      const collapseSectionIfInactive = (section) => {
        if (!autoCollapseDisabled) return;
        const d = detailsBySection[section];
        if (!d || !d.tagName || d.tagName.toLowerCase() !== 'details') return;
        const toggle = d.querySelector('.section-toggle');
        if (!toggle) return;
        if (!toggle.checked || toggle.disabled) {
          d.open = false;
        }
      };
      const requiredCheckboxes = Array.from(document.querySelectorAll('input[type="checkbox"][data-required="true"]'));
      const requiredBySection = {};
      const ensureRequiredLabelTag = (cb) => {
        if (!cb) return;
        const lbl = cb.closest('label');
        if (!lbl) return;
        // Avoid duplicating the tag if it already exists
        const already = lbl.querySelector('.required-tag');
        if (already) {
          already.textContent = ' (Required)';
          return;
        }
        if (/\(Required\)/i.test(lbl.textContent || '')) return;
        const tag = document.createElement('span');
        tag.className = 'required-tag';
        tag.textContent = ' (Required)';
        lbl.appendChild(tag);
      };
      requiredCheckboxes.forEach((cb) => {
        ensureRequiredLabelTag(cb);
        const sectionEl = cb.closest('details');
        const sectionId = sectionEl ? sectionEl.id : '';
        if (sectionId) {
          requiredBySection[sectionId] = requiredBySection[sectionId] || [];
          requiredBySection[sectionId].push(cb);
        }
        cb.checked = true;
        cb.addEventListener('change', () => {
          if (!cb.checked) cb.checked = true;
        });
      });
      const syncRequiredCheckboxes = () => {
        toggles.forEach((t) => {
          const section = t.dataset.section;
          if (!section) return;
          const list = requiredBySection[section] || [];
          const isActive = !!t.checked && !t.disabled;
          list.forEach((cb) => {
            cb.checked = true;
            cb.disabled = !isActive;
            const lbl = cb.closest('label');
            if (lbl) {
              lbl.classList.toggle('required-disabled', !isActive);
              const extras = Array.from(lbl.querySelectorAll('select, input:not([type="checkbox"])'));
              extras.forEach((el) => { el.disabled = !isActive; });
            }
          });
        });
      };
      // Restore previously saved active sections (so Go Back preserves state)
      let activeSections = {};
      try { activeSections = JSON.parse(localStorage.getItem(STORAGE_KEYS.activeSections) || '{}'); } catch { activeSections = {}; }
      toggles.forEach((t) => {
        const section = t.dataset.section;
        const d = detailsBySection[section];
        const isActive = !!activeSections[section];
        t.checked = isActive;
        // If active on restore, enforce required items
        if (isActive && d) {
          d.querySelectorAll('input[type="checkbox"][data-required="true"]').forEach((cb) => { cb.checked = true; });
        }
        // Prevent checkbox click from toggling summary directly
        t.addEventListener('click', (ev) => { ev.stopPropagation(); });
        t.addEventListener('change', (evt) => {
          const d2 = detailsBySection[section];
          if (t.checked && d2) {
            // Enforce required when activating
            d2.querySelectorAll('input[type="checkbox"][data-required="true"]').forEach((cb) => { cb.checked = true; });
            saveIngredients();
            // If activating a section with quantity controls, ensure quantity is at least 1 (was 0 when deselected)
            if (SECTION_QTY_KEYS.includes(section)) {
              try {
                let qtySections = JSON.parse(localStorage.getItem(STORAGE_KEYS.quantitiesSections) || '{}');
                const cur = parseInt(qtySections[section] || '0', 10) || 0;
                if (cur <= 0) {
                  const last = (!resetOnDeselect && t.dataset && t.dataset.lastQty) ? parseInt(t.dataset.lastQty, 10) || 1 : 1;
                  qtySections[section] = Math.max(1, last);
                  localStorage.setItem(STORAGE_KEYS.quantitiesSections, JSON.stringify(qtySections));
                  const sum = d2.querySelector('.menu-summary .qty-controls span');
                  if (sum) sum.textContent = `(x${qtySections[section]})`;
                  if (t.dataset) delete t.dataset.lastQty;
                }
              } catch { }
            }
            // Auto-expand when checked
            openSectionDetails(section);
          }
          if (!t.checked && d2) {
            // Clear all selections in that section when deactivating
            d2.querySelectorAll('input[type="checkbox"][name]').forEach((cb) => { cb.checked = false; });
            saveIngredients();
            // Auto-collapse is optional (controlled by setting)
            // If the menu item (section) is not selected, its quantity becomes 0
            if (SECTION_QTY_KEYS.includes(section)) {
              try {
                let qtySections = JSON.parse(localStorage.getItem(STORAGE_KEYS.quantitiesSections) || '{}');
                const currentQty = parseInt(qtySections[section] || '0', 10) || 0;
                if (!resetOnDeselect && t.dataset) {
                  t.dataset.lastQty = String(Math.max(1, currentQty || 1));
                }
                qtySections[section] = resetOnDeselect ? 1 : 0;
                localStorage.setItem(STORAGE_KEYS.quantitiesSections, JSON.stringify(qtySections));
              } catch { }
              const sum = d2.querySelector('.menu-summary .qty-controls span');
              if (sum) sum.textContent = `(x${resetOnDeselect ? 1 : 0})`;
            }
            collapseSectionIfInactive(section);
          }
          activeSections[section] = t.checked;
          try { localStorage.setItem(STORAGE_KEYS.activeSections, JSON.stringify(activeSections)); } catch { }
          updatePageNavLocks();
          syncMenuLaunchState();
          syncRequiredCheckboxes();
        });
      });
      // Quantity controls are created before toggles are restored, so re-sync after restore.
      syncSectionQtyControlVisibility();
      syncMenuLaunchState();
      syncRequiredCheckboxes();
      if (autoCollapseDisabled) {
        Object.keys(detailsBySection).forEach(collapseSectionIfInactive);
      }
      // Summary behavior:
      // - If titleSelects is ON, clicking the title text toggles the checkbox (not expand)
      // - Otherwise, clicking summary toggles the checkbox
      const usesNativeDetails = !!document.querySelector('details .menu-summary');
      document.querySelectorAll('.menu-summary').forEach((s) => {
        s.addEventListener('click', (e) => {
          const titleEl = s.querySelector('span');
          const isTitleClick = titleEl && titleEl.contains(e.target);
          const toggle = s.querySelector('.section-toggle');
          if (!toggle) return;
          const clickedCheckbox = toggle === e.target || toggle.contains(e.target);
          const detailsParent = s.closest('details');
          const rect = s.getBoundingClientRect();
          const hitRight = typeof e.clientX === 'number' && e.clientX >= (rect.right - 36);
          const hitLeft = typeof e.clientX === 'number' && e.clientX <= (rect.left + 32);
          const hitArrow = !!(e.target.closest('.menu-summary-arrow') || e.target.closest('.menu-launch-arrow'));
          const arrowArea = hitRight || hitLeft || hitArrow;
          const allowActivate = (typeof window.arrowActivates === 'boolean') ? window.arrowActivates : true;
          const openDetailsIfChecked = () => {
            if (detailsParent && toggle.checked) detailsParent.open = true;
          };
          // Direct arrow handling (works whether arrow-only is on or off)
          if (arrowArea && !clickedCheckbox) {
            e.preventDefault();
            e.stopPropagation();
            if (allowActivate && !toggle.disabled) {
              toggle.checked = !toggle.checked;
              toggle.dispatchEvent(new Event('change', { bubbles: true }));
            }
            if (detailsParent) {
              if (allowActivate) {
                detailsParent.open = !!toggle.checked;
              } else {
                detailsParent.open = !detailsParent.open;
              }
              detailsParent.dispatchEvent(new Event('toggle', { bubbles: true }));
            }
            return;
          }
          // Respect arrow-only setting: block non-arrow clicks on the summary itself
          try {
            const arrowOnly = !!window.pillArrowOnly;
            if (arrowOnly && !clickedCheckbox) {
              if (titleSelects && isTitleClick) {
                e.preventDefault();
                e.stopPropagation();
                toggle.checked = !toggle.checked;
                toggle.dispatchEvent(new Event('change', { bubbles: true }));
                openDetailsIfChecked();
                return;
              }
              // Non-arrow clicks do nothing when arrow-only is on
              e.preventDefault();
              e.stopPropagation();
              return;
            }
          } catch { /* ignore */ }
          // If the setting is off, let native summary behavior run but never toggle the checkbox
          if (!titleSelects && !clickedCheckbox) {
            return;
          }
          // Title click toggles only when setting enabled
          if (titleSelects && isTitleClick && !clickedCheckbox) {
            e.preventDefault();
            e.stopPropagation();
            toggle.checked = !toggle.checked;
            toggle.dispatchEvent(new Event('change', { bubbles: true }));
            openDetailsIfChecked();
            return;
          }
          // Let native <summary> clicks expand the <details> while still toggling the checkbox
          if (titleSelects && usesNativeDetails && !clickedCheckbox) {
            e.preventDefault();
            e.stopPropagation();
            toggle.checked = !toggle.checked;
            toggle.dispatchEvent(new Event('change', { bubbles: true }));
            openDetailsIfChecked();
            return;
          }
          if (titleSelects && !clickedCheckbox) {
            e.preventDefault();
            e.stopPropagation();
            toggle.checked = !toggle.checked;
            toggle.dispatchEvent(new Event('change', { bubbles: true }));
            openDetailsIfChecked();
          }
        });
      });
      // Collapse helpers
      const collapseAllBtn = document.querySelector('.collapse-all');
      const collapseSectionBtns = document.querySelectorAll('.collapse-section[data-target]');
      const pageActions = document.querySelector('.page-actions');
      const collapseAllFooter = (function makeFooterCollapse() {
        if (!collapseAllBtn || !pageActions) return null;
        const btn = collapseAllBtn.cloneNode(true);
        btn.classList.add('collapse-footer');
        // ensure only one footer button
        btn.id = '';
        pageActions.insertBefore(btn, pageActions.querySelector('.reset-all') || pageActions.firstChild);
        return btn;
      })();
      const collapseAllSections = () => {
        document.querySelectorAll('details').forEach((d) => { d.open = false; });
      };
      const closeDetails = (targetId) => {
        if (!targetId) return;
        const d = document.getElementById(targetId);
        if (d && d.tagName && d.tagName.toLowerCase() === 'details') {
          d.open = false;
        }
      };
      if (collapseAllBtn) {
        collapseAllBtn.addEventListener('click', collapseAllSections);
      }
      if (collapseAllFooter) {
        collapseAllFooter.addEventListener('click', collapseAllSections);
      }
      collapseSectionBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
          const tgt = btn.getAttribute('data-target');
          closeDetails(tgt);
        });
      });
      // If label-select setting is OFF, block native label toggling (so only the checkbox itself toggles)
      document.addEventListener('click', (e) => {
        if (labelSelects) return;
        const lbl = e.target.closest && e.target.closest('label');
        if (!lbl) return;
        const cb = lbl.querySelector('input[type="checkbox"][name]');
        if (!cb) return;
        if (e.target === cb) return;
        if (e.target.closest('[data-ignore-label-toggle="true"]')) return;
        if (e.target.closest('select, button, input:not([type="checkbox"]), textarea')) return;
        // Block the default label-to-checkbox toggle when the setting is off
        e.preventDefault();
        e.stopImmediatePropagation();
      }, true);
      // Delegate clicks on ingredient labels to toggle their checkbox when enabled
      document.addEventListener('click', (e) => {
        if (!labelSelects) return;
        const lbl = e.target.closest('label');
        if (!lbl) return;
        if (e.target.closest('[data-ignore-label-toggle="true"]')) return;
        if (e.target.closest('select, button, input:not([type="checkbox"]), textarea')) return;
        const cb = lbl.querySelector('input[type="checkbox"][name]');
        if (!cb) return;
        if (cb.disabled) return;
        // Do NOT toggle required items (e.g., Patty, Bun, Tomato Sauce)
        if (cb.dataset && cb.dataset.required === 'true') return;
        // Ensure only non-checkbox clicks trigger the manual toggle
        if (e.target !== cb) {
          // Prevent the native label toggle so we only flip the checkbox once
          e.preventDefault();
          cb.checked = !cb.checked;
          cb.dispatchEvent(new Event('change', { bubbles: true }));
        }
      });

      function updateNextButtonState() {
        if (!pageNextButton) return;
        const okMenu = hasMenuSelection();
        if (okMenu) {
          pageNextButton.removeAttribute('aria-disabled');
          pageNextButton.removeAttribute('tabindex');
        } else {
          pageNextButton.setAttribute('aria-disabled', 'true');
          pageNextButton.setAttribute('tabindex', '-1');
        }
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
          message = 'Select at least one menu item.';
        } else if (saucesActive && !saucesSelected) {
          message = 'Select at least one sauce or uncheck Sauces.';
        }
        // Clear previous invalid highlights
        document.querySelectorAll('.menu-summary').forEach((s) => s.classList.remove('invalid'));
        if (!anySectionActive) {
          // highlight all summaries when nothing is selected
          document.querySelectorAll('.menu-summary').forEach((s) => s.classList.add('invalid'));
        } else if (saucesActive && !saucesSelected) {
          const s = document.querySelector('#sauces .menu-summary');
          if (s) s.classList.add('invalid');
        }
        if (message) {
          err.textContent = message;
          err.hidden = false;
        } else {
          err.hidden = true;
        }
        updateNextButtonState();
      };
      const autoDisableIfEmpty = (section) => {
        if (!autoDisableEmpty) return;
        if (!section) return;
        const d = detailsBySection[section];
        const toggle = d ? d.querySelector('.section-toggle') : null;
        if (!toggle || toggle.disabled) return;
        const inputs = Array.from((d || document).querySelectorAll('input[type="checkbox"][name]')).filter((i) => {
          const nm = i.getAttribute('name') || '';
          return nm.startsWith(`${section}_ingredients`);
        });
        const optionals = inputs.filter((i) => i.dataset.required !== 'true');
        if (!optionals.length) return;
        const anyOptionalChecked = optionals.some((i) => i.checked);
        if (!anyOptionalChecked) {
          toggle.checked = false;
          toggle.dispatchEvent(new Event('change', { bubbles: true }));
          if (d && d.tagName && d.tagName.toLowerCase() === 'details') d.open = false;
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
          let section = '';
          if (name.startsWith('pizza_')) section = 'pizza';
          else if (name.startsWith('burger_')) section = 'burger';
          else if (name.startsWith('sauces_')) section = 'sauces';
          else if (name.startsWith('sub_')) section = 'sub';
          else if (name.startsWith('wrap_')) section = 'wrap';
          const isRequired = t.dataset && t.dataset.required === 'true';
          if (!isRequired && t.checked) {
            if (section) {
              const d = detailsBySection[section];
              const toggle = d ? d.querySelector('.section-toggle') : null;
              if (toggle && !toggle.checked) {
                toggle.checked = true;
                toggle.dispatchEvent(new Event('change', { bubbles: true }));
              } else {
                // If already active, ensure section expands when selecting an ingredient
                openSectionDetails(section);
              }
            }
          }
          if (section) {
            autoDisableIfEmpty(section);
          }
          syncRequiredCheckboxes();
          saveIngredients();
          updateBuilderError();
          updatePageNavLocks();
        }
      });
      // Ensure builder validation state is accurate after initial render/restore
      updateBuilderError();
      // Reset buttons per group
      const resetGroupByName = (group, { forceDisable = false } = {}) => {
        if (!group) return;
        const shouldDisable = forceDisable || resetDisables;
        document.querySelectorAll(`input[type="checkbox"][name="${group}"]`).forEach((cb) => {
          if (cb.dataset.required === 'true' || cb.disabled) {
            // keep required selections checked
            cb.checked = true;
          } else {
            cb.checked = false;
          }
          const sel = cb.closest('label')?.querySelector('select.ingredient-qty');
          if (sel) {
            sel.disabled = !cb.checked;
            sel.hidden = !cb.checked;
            if (sel.id === 'sub-bread-select' || sel.id === 'wrap-bread-select') {
              sel.value = 'white';
            } else {
              sel.value = '1';
            }
          }
          // fire change so any per-item handlers (e.g., sauce qty) run
          cb.dispatchEvent(new Event('change', { bubbles: true }));
        });
        saveIngredients();
        syncRequiredCheckboxes();
        // Additionally normalize key quantities for the group being reset
        try {
          let qm = JSON.parse(localStorage.getItem(STORAGE_KEYS.quantities) || '{}');
          if (group.startsWith('burger_')) {
            const pattyKey = 'burger_ingredients[]|patty';
            qm[pattyKey] = 1;
            localStorage.setItem(STORAGE_KEYS.quantities, JSON.stringify(qm));
            const pattyCb = document.querySelector('input[type="checkbox"][name="burger_ingredients[]"][value="patty"]');
            const pattyLabel = pattyCb ? pattyCb.closest('label') : null;
            const pattyQtyTxt = pattyLabel ? pattyLabel.querySelector('.patty-qty > span') : null;
            if (pattyQtyTxt) pattyQtyTxt.textContent = `(x1)`;
          } else if (group.startsWith('sauces_')) {
            Object.keys(qm).forEach((k) => {
              if (k.startsWith('sauces_ingredients[]|')) qm[k] = shouldDisable ? 0 : 1;
            });
            localStorage.setItem(STORAGE_KEYS.quantities, JSON.stringify(qm));
          } else {
            localStorage.setItem(STORAGE_KEYS.quantities, JSON.stringify(qm));
          }
        } catch { }
        if (shouldDisable) {
          let section = '';
          if (group.startsWith('pizza_')) section = 'pizza';
          else if (group.startsWith('burger_')) section = 'burger';
          else if (group.startsWith('calzone_')) section = 'calzone';
          else if (group.startsWith('chicken_wings_')) section = 'chicken_wings';
          else if (group.startsWith('salad_')) section = 'salad';
          else if (group.startsWith('sauces_')) section = 'sauces';
          else if (group.startsWith('sub_')) section = 'sub';
          else if (group.startsWith('wrap_')) section = 'wrap';
          if (section) {
            const d2 = document.getElementById(section);
            const toggle = d2 ? d2.querySelector('.section-toggle') : null;
            if (toggle && toggle.checked) {
              toggle.checked = false;
              toggle.dispatchEvent(new Event('change', { bubbles: true }));
            }
            try {
              let act = JSON.parse(localStorage.getItem(STORAGE_KEYS.activeSections) || '{}');
              act[section] = false;
              localStorage.setItem(STORAGE_KEYS.activeSections, JSON.stringify(act));
            } catch { }
            if (SECTION_QTY_KEYS.includes(section)) {
              try {
                let qs = JSON.parse(localStorage.getItem(STORAGE_KEYS.quantitiesSections) || '{}');
                qs[section] = 0;
                localStorage.setItem(STORAGE_KEYS.quantitiesSections, JSON.stringify(qs));
              } catch { }
              const sum = d2 && d2.querySelector('.menu-summary .qty-controls span');
              if (sum) sum.textContent = `(x0)`;
            } else if (section === 'sauces') {
              try {
                let qm = JSON.parse(localStorage.getItem(STORAGE_KEYS.quantities) || '{}');
                Object.keys(qm).forEach((k) => { if (k.startsWith('sauces_ingredients[]|')) qm[k] = 0; });
                localStorage.setItem(STORAGE_KEYS.quantities, JSON.stringify(qm));
              } catch { }
              document.querySelectorAll('.sauce-qty').forEach(el => el.style.display = 'none');
            }
          }
        }
      };

      document.querySelectorAll('.reset-group[data-group]').forEach((btn) => {
        btn.addEventListener('click', () => {
          resetGroupByName(btn.getAttribute('data-group'));
        });
      });
      // Next: must have at least one menu section checked; if Sauces is active, require at least one sauce
      if (pageNextButton) {
        pageNextButton.addEventListener('click', (e) => {
          saveIngredients();
          const err = document.getElementById('builder-error');
          const togglesArr = Array.from(document.querySelectorAll('.section-toggle'));
          const anySectionActive = togglesArr.some((t) => t.checked);
          const saucesActive = togglesArr.some((t) => t.dataset.section === 'sauces' && t.checked);
          const saucesSelected = Array.from(document.querySelectorAll('input[type="checkbox"][name="sauces_ingredients[]"]:checked')).length > 0;
          let message = '';
          if (!anySectionActive) {
            message = 'Select at least one menu item.';
          } else if (saucesActive && !saucesSelected) {
            message = 'Select at least one sauce or uncheck Sauces.';
          }
          if (message) {
            if (err) {
              err.textContent = message;
              err.hidden = false;
              err.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
            e.preventDefault();
            e.stopImmediatePropagation();
            return;
          }
          if (err) err.hidden = true;
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
        ingredients = normalizeStoredIngredients(ingredients);
        let activeSections = {};
        try { activeSections = JSON.parse(localStorage.getItem(STORAGE_KEYS.activeSections) || '{}'); } catch { activeSections = {}; }

        // Build summary HTML
        const createSummaryBlock = () => {
          const block = document.createElement('div');
          block.className = 'summary-block';
          return block;
        };

        const frag = document.createDocumentFragment();
        if (type) {
          const typeBlock = createSummaryBlock();
          const h3 = document.createElement('h3');
          h3.textContent = 'Order Type';
          typeBlock.appendChild(h3);
          const p = document.createElement('p');
          p.textContent = (type === 'dine' ? 'Dine In/Carryout' : 'Delivery');
          typeBlock.appendChild(p);
          frag.appendChild(typeBlock);
        }

        // Delivery details block (multi-line formatting)
        if (type === 'delivery') {
          const deliveryBlock = createSummaryBlock();
          const h = document.createElement('h3');
          h.textContent = 'Delivery Details';
          deliveryBlock.appendChild(h);

          const dn = localStorage.getItem(STORAGE_KEYS.deliveryName) || '';
          const dph = localStorage.getItem(STORAGE_KEYS.deliveryPhone) || '';
          const da = localStorage.getItem(STORAGE_KEYS.deliveryAddress) || '';
          const ds = localStorage.getItem(STORAGE_KEYS.deliverySuite) || '';
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

          deliveryBlock.appendChild(block);
          frag.appendChild(deliveryBlock);
        }

        const selectionsBlock = createSummaryBlock();
        const h3i = document.createElement('h3');
        h3i.textContent = 'Selections';
        selectionsBlock.appendChild(h3i);

        const entries = Object.entries(ingredients || {});
        // Load saved per-ingredient quantities (legacy, not used for display now)
        let qtyMap = {};
        try { qtyMap = JSON.parse(localStorage.getItem(STORAGE_KEYS.quantities) || '{}'); } catch { qtyMap = {}; }
        // Load per-section quantities
        let qtySections = {};
        try { qtySections = JSON.parse(localStorage.getItem(STORAGE_KEYS.quantitiesSections) || '{}'); } catch { qtySections = {}; }
        const SECTION_QTY_KEYS = ['pizza', 'burger', 'calzone', 'chicken_wings', 'salad', 'sub', 'wrap'];
        const qtyLabelMap = { 1: 'Regular', 2: 'Light', 3: 'Extra', 4: 'x3' };
        const nonEmpty = entries.filter(([, arr]) => Array.isArray(arr) && arr.length > 0);

        if (entries.length === 0 || nonEmpty.length === 0) {
          const none = document.createElement('p');
          none.textContent = 'No ingredients selected yet.';
          selectionsBlock.appendChild(none);
        } else {
          const sectionsContainer = document.createElement('div');
          sectionsContainer.className = 'summary-sections';
          nonEmpty.forEach(([group, values]) => {
            const key = group.replace(/_ingredients\[\]$/, '');
            const prettyGroup = key.replace(/_/g, ' ');

            // Skip categories that are not active (checkbox not selected on Page 2)
            if (!activeSections[key]) return;
            // Skip sections with quantity controls if quantity is 0
            if (SECTION_QTY_KEYS.includes(key)) {
              let qv = 0;
              try { qv = parseInt(qtySections[key] || '0', 10) || 0; } catch { qv = 0; }
              if (qv <= 0) return;
            }

            const sectionWrap = document.createElement('div');
            sectionWrap.className = 'summary-section';
            const header = document.createElement('div');
            header.className = 'summary-section-header';
            let sectionQtyRow = null;
            const listTitle = document.createElement('strong');
            listTitle.textContent = prettyGroup.charAt(0).toUpperCase() + prettyGroup.slice(1);
            header.appendChild(listTitle);

            const edit = document.createElement('button');
            edit.type = 'button';
            edit.textContent = 'Edit';
            edit.className = 'summary-edit-btn';

            // OLD SECTION (kept for reference): summary edit link behavior
            // const edit = document.createElement('a');
            // edit.href = `page2.html#${key}`;
            // edit.textContent = 'Edit';
            // edit.className = 'summary-edit-btn';

            header.appendChild(edit);

            const remove = document.createElement('button');
            remove.type = 'button';
            remove.textContent = 'Remove';
            remove.className = 'summary-remove-btn';
            remove.setAttribute('aria-label', `Remove ${prettyGroup} from order`);
            remove.addEventListener('click', () => {
              try {
                const ing = JSON.parse(localStorage.getItem(STORAGE_KEYS.ingredients) || '{}');
                ing[group] = [];
                localStorage.setItem(STORAGE_KEYS.ingredients, JSON.stringify(ing));
              } catch { }
              try {
                const act = JSON.parse(localStorage.getItem(STORAGE_KEYS.activeSections) || '{}');
                act[key] = false;
                localStorage.setItem(STORAGE_KEYS.activeSections, JSON.stringify(act));
              } catch { }
              if (SECTION_QTY_KEYS.includes(key)) {
                try {
                  const qs = JSON.parse(localStorage.getItem(STORAGE_KEYS.quantitiesSections) || '{}');
                  qs[key] = 0;
                  localStorage.setItem(STORAGE_KEYS.quantitiesSections, JSON.stringify(qs));
                } catch { }
              }
              if (key === 'sauces') {
                try {
                  const qm = JSON.parse(localStorage.getItem(STORAGE_KEYS.quantities) || '{}');
                  Object.keys(qm).forEach((k) => {
                    if (k.startsWith(`${group}|`)) qm[k] = 0;
                  });
                  localStorage.setItem(STORAGE_KEYS.quantities, JSON.stringify(qm));
                } catch { }
              }

              sectionWrap.remove();
              if (sectionsContainer.childElementCount === 0) {
                sectionsContainer.remove();
                const none = document.createElement('p');
                none.textContent = 'No ingredients selected yet.';
                selectionsBlock.appendChild(none);
              }
            });
            header.appendChild(remove);

            // Section-level quantity controls
            if (SECTION_QTY_KEYS.includes(key)) {
              const qWrap = document.createElement('div');
              qWrap.className = 'summary-section-qty-row';
              const qKey = key;
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
                  sectionWrap.remove();
                }
              };

              dec.addEventListener('click', () => { updateQty(current - 1); });
              inc.addEventListener('click', () => { updateQty(current + 1); });

              qWrap.appendChild(labelSpan);
              qWrap.appendChild(dec);
              qWrap.appendChild(inc);
              sectionQtyRow = qWrap;
            }

            sectionWrap.appendChild(header);
            if (sectionQtyRow) sectionWrap.appendChild(sectionQtyRow);
            const ul = document.createElement('ul');
            values.forEach((item) => {
              const li = document.createElement('li');
              const value = (typeof item === 'string') ? item : (item && item.value ? item.value : '');
              let normValue = value;
              if (key === 'pizza' && value === 'tomato') normValue = 'tomatoes';
              let label = (typeof item === 'string') ? titleCase(normValue) : (item && item.label ? item.label : titleCase(normValue));
              if (key === 'burger' && (value === 'tomato' || value === 'tomatoes' || /\bTomato\b/i.test(label))) {
                let bq = 0;
                try { bq = parseInt(qtySections['burger'] || '0', 10) || 0; } catch { bq = 0; }
                const desired = bq > 1 ? 'Tomatoes' : 'Tomato';
                label = label.replace(/\bTomatoes\b|\bTomato\b/i, desired);
              }
              label = stripInlineQty(label);
              label = normalizeJalapenoLabel(label);

              if (key === 'sauces') {
                const qKey = `${group}|${normValue}`;
                let current = Math.max(1, Math.min(12, parseInt(qtyMap[qKey] || '1', 10) || 1));
                li.classList.add('summary-item-with-qty');

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
                    try {
                      let ing = JSON.parse(localStorage.getItem(STORAGE_KEYS.ingredients) || '{}');
                      const arr = Array.isArray(ing[group]) ? ing[group] : [];
                      const filtered = arr.filter((it) => {
                        const v = (typeof it === 'string') ? it : (it && it.value);
                        return v && v !== value;
                      });
                      ing[group] = filtered;
                      localStorage.setItem(STORAGE_KEYS.ingredients, JSON.stringify(ing));
                      if (filtered.length === 0) {
                        let act = JSON.parse(localStorage.getItem(STORAGE_KEYS.activeSections) || '{}');
                        act['sauces'] = false;
                        localStorage.setItem(STORAGE_KEYS.activeSections, JSON.stringify(act));
                        sectionWrap.remove();
                      }
                    } catch { }
                    li.remove();
                  }
                };

                dec.addEventListener('click', () => { updateQty(current - 1); });
                inc.addEventListener('click', () => { updateQty(current + 1); });

                const controlsRow = document.createElement('div');
                controlsRow.className = 'summary-item-qty-controls';
                controlsRow.appendChild(dec);
                controlsRow.appendChild(inc);
                li.appendChild(controlsRow);
              } else if (key === 'burger' && normValue === 'patty') {
                const qKey = `${group}|${normValue}`;
                let current = 1;
                try { current = Math.max(1, Math.min(3, parseInt(qtyMap[qKey] || '1', 10) || 1)); } catch { current = 1; }
                li.classList.add('summary-item-with-qty');

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
                const controlsRow = document.createElement('div');
                controlsRow.className = 'summary-item-qty-controls';
                controlsRow.appendChild(dec);
                controlsRow.appendChild(inc);
                li.appendChild(controlsRow);
              } else {
                const qKey = `${group}|${normValue}`;
                let qv = 1;
                try { qv = Math.max(1, Math.min(4, parseInt(qtyMap[qKey] || '1', 10) || 1)); } catch { qv = 1; }
                if (qv > 1) {
                  const suffix = qtyLabelMap[qv] || `x${qv}`;
                  li.textContent = `${label} (${suffix})`;
                } else {
                  li.textContent = label;
                }
              }
              ul.appendChild(li);
            });
            sectionWrap.appendChild(ul);

            const catalog = loadIngredientCatalogFromStorage();
            const sectionOptions = Array.isArray(catalog[key]) ? catalog[key] : [];
            const options = sectionOptions.length
              ? sectionOptions
              : values.map((item) => {
                const value = typeof item === 'string' ? item : (item && item.value ? item.value : '');
                const label = typeof item === 'string' ? titleCase(value) : (item && item.label ? item.label : titleCase(value));
                return { group, value, label, required: false };
              });
            const selectedSet = new Set(
              values
                .map((item) => (typeof item === 'string' ? item : (item && item.value ? item.value : '')))
                .filter(Boolean)
            );
            const editor = document.createElement('div');
            editor.className = 'summary-inline-editor';
            editor.hidden = true;
            const editorList = document.createElement('div');
            editorList.className = 'summary-inline-editor-list';
            options.forEach((opt, idx) => {
              if (!opt || !opt.value) return;
              const id = `summary-edit-${key}-${idx}`;
              const row = document.createElement('label');
              row.className = 'summary-inline-option';
              row.setAttribute('for', id);
              const cb = document.createElement('input');
              cb.type = 'checkbox';
              cb.id = id;
              cb.value = opt.value;
              const isRequired = !!opt.required;
              cb.checked = isRequired || selectedSet.has(opt.value);
              if (isRequired) cb.disabled = true;
              const text = document.createElement('span');
              text.textContent = opt.label || titleCase(opt.value);
              row.appendChild(cb);
              row.appendChild(text);
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
              const checkedValues = Array.from(editor.querySelectorAll('input[type="checkbox"]:checked')).map((i) => normalizeJalapenoValue(i.value));
              const nextValues = options
                .filter((opt) => opt && checkedValues.includes(normalizeJalapenoValue(opt.value)))
                .map((opt) => ({ value: normalizeJalapenoValue(opt.value), label: normalizeJalapenoLabel(opt.label || titleCase(opt.value)) }));
              try {
                const ing = normalizeStoredIngredients(JSON.parse(localStorage.getItem(STORAGE_KEYS.ingredients) || '{}')) || {};
                ing[group] = nextValues;
                localStorage.setItem(STORAGE_KEYS.ingredients, JSON.stringify(ing));
              } catch { }
              try {
                const act = JSON.parse(localStorage.getItem(STORAGE_KEYS.activeSections) || '{}');
                act[key] = nextValues.length > 0;
                localStorage.setItem(STORAGE_KEYS.activeSections, JSON.stringify(act));
              } catch { }
              location.reload();
            });

            // Append pizza size at end of section if present
            if (key === 'pizza') {
              try {
                const size = getPizzaSize();
                if (size) {
                  const sizeDiv = document.createElement('div');
                  sizeDiv.className = 'summary-size';
                  sizeDiv.style.marginTop = '8px';
                  sizeDiv.textContent = `Size: ${titleCase(size)}`;
                  sectionWrap.appendChild(sizeDiv);
                }
              } catch (err) { /* ignore */ }
            }

            sectionsContainer.appendChild(sectionWrap);
          });

          if (sectionsContainer.childNodes.length) {
            selectionsBlock.appendChild(sectionsContainer);
          } else {
            const none = document.createElement('p');
            none.textContent = 'No ingredients selected yet.';
            selectionsBlock.appendChild(none);
          }
        }

        frag.appendChild(selectionsBlock);

        container.innerHTML = '';
        container.appendChild(frag);
        // Ensure moved controls are correct after initial rendering / navigation
        try { updateMovedControls(document.body.classList.contains('nav-enabled')); } catch (err) { /* ignore */ }
      }
    }
  });
})();


/* ===================================================================
   App merged fixes: "pill arrow only" behavior for both
   - .menu-launch[data-target] "pills"
   - <summary class="menu-summary"> inside <details>
   This file augments existing app.js behavior to ensure menus only
   open when the arrow is activated if the global setting
   `window.pillArrowOnly` (or a checkbox with class `.setting-pill-arrow-only`)
   is enabled.
   =================================================================== */

(function () {
  'use strict';

  // Utility: determine whether the "pill arrow only" setting is enabled.
  function isPillArrowOnlyEnabled() {
    try {
      if (typeof window.pillArrowOnly !== 'undefined') return !!window.pillArrowOnly;
      const el = document.querySelector('.setting-pill-arrow-only');
      if (el) return !!el.checked;
    } catch (err) { /* ignore */ }
    return false;
  }

  // Record the last user activation (useful for debugging and for safe checks)
  window._lastActivation = window._lastActivation || null;
  ['pointerdown', 'mousedown', 'touchstart', 'keydown'].forEach(ev =>
    document.addEventListener(ev, function (e) {
      try {
        const t = e.target;
        window._lastActivation = {
          time: Date.now(),
          eventType: ev,
          tag: t && t.tagName,
          id: t && t.id,
          cls: t && (t.className || ''),
          closestMenuLaunch: !!(t && t.closest && t.closest('.menu-launch[data-target]')),
          closestSummary: !!(t && t.closest && t.closest('summary.menu-summary')),
          closestArrow: !!(t && t.closest && (t.closest('.menu-launch-arrow') || t.closest('.menu-summary-arrow'))),
          selector: (t && (t.id ? '#' + t.id : (t.className ? '.' + t.className.split(/\s+/).join('.') : t.tagName))) || null
        };
      } catch (err) { /* ignore */ }
    }, true)
  );

  /* ----------------------
     Guard: capture-phase event blocking for .menu-launch pills
     Blocks pointerdown/clicks inside .menu-launch[data-target] unless the arrow
     or an interactive control was the activation target.
     ---------------------- */
  (function installPillLaunchGuard() {
    const interactiveSelector = 'input, select, textarea, button, a[href], label, [contenteditable="true"]';

    function shouldBlockForPill(e) {
      if (!isPillArrowOnlyEnabled()) return false;
      const el = e.target;
      if (!el || !el.closest) return false;
      const pill = el.closest('.menu-launch[data-target]');
      if (!pill) return false;
      // allow interactive controls inside the pill
      if (el.closest(interactiveSelector)) return false;
      // allow arrow
      if (el.closest('.menu-launch-arrow')) return false;
      return true;
    }

    ['pointerdown', 'mousedown', 'touchstart'].forEach((evtName) => {
      document.addEventListener(evtName, (e) => {
        try {
          if (shouldBlockForPill(e)) {
            e.stopImmediatePropagation();
          }
        } catch (err) { console.error('pillLaunchGuard error', err); }
      }, true);
    });

    document.addEventListener('click', (e) => {
      try {
        if (shouldBlockForPill(e)) {
          e.stopImmediatePropagation();
        }
      } catch (err) { console.error('pillLaunchGuard click error', err); }
    }, true);
  })();


  /* ----------------------
     Summary-based UI support: for <summary class="menu-summary"> markup
     Adds an explicit arrow button (re-using .menu-launch-arrow CSS) and
     blocks native toggling on non-arrow clicks when pill-arrow-only is enabled.
     ---------------------- */
  (function installSummaryAugmentation() {
    function ensureArrowForSummary(summary) {
      // If an arrow already exists, return it
      let arrow = summary.querySelector('.menu-summary-arrow, .menu-launch-arrow');
      if (arrow) return arrow;

      // Create a button arrow and append it to summary
      arrow = document.createElement('button');
      arrow.type = 'button';
      arrow.className = 'menu-launch-arrow menu-summary-arrow';
      arrow.setAttribute('aria-hidden', 'true');
      arrow.setAttribute('tabindex', '-1');
      if (!arrow.textContent || !arrow.textContent.trim()) {
        arrow.textContent = '\u25B8';
      }
      // Use a small triangle glyph as a fallback; stylesheet may override content.
      // clicking the arrow toggles the details element
      arrow.addEventListener('click', function (ev) {
        ev.stopPropagation();
        try {
          const details = summary.closest('details');
          if (details) {
            details.open = !details.open;
            // fire a synthetic toggle event in case the app listens
            const toggleEv = new Event('toggle', { bubbles: true });
            details.dispatchEvent(toggleEv);
          }
        } catch (err) { /* ignore */ }
      });

      // append arrow at the end of the summary
      summary.appendChild(arrow);
      return arrow;
    }

    function applyToAllSummaries() {
      const summaries = Array.from(document.querySelectorAll('summary.menu-summary'));
      summaries.forEach((summary) => {
        const arrow = ensureArrowForSummary(summary);

        // Remove existing handlers if re-applying
        if (summary._pillHandler) {
          summary.removeEventListener('click', summary._pillHandler, true);
          ['pointerdown', 'mousedown', 'touchstart'].forEach(ev => {
            summary.removeEventListener(ev, summary._pillPointerHandler, true);
          });
        }

        // Handler: click phase (capture) - block unless arrow or interactive control
        summary._pillHandler = function (e) {
          if (!isPillArrowOnlyEnabled()) return;
          const el = e.target;
          if (!el) return;
          // allow if click was on arrow or on interactive controls inside summary
          const interactive = el.closest('input, select, textarea, button, a[href], label, [contenteditable="true"]');
          const arrowHit = el.closest('.menu-summary-arrow') || el.closest('.menu-launch-arrow') || el === arrow;
          if (!arrowHit && !interactive) {
            e.stopImmediatePropagation();
          }
        };

        // Handler: pointer/touch start to preempt native toggling on some browsers
        summary._pillPointerHandler = function (e) {
          if (!isPillArrowOnlyEnabled()) return;
          const el = e.target;
          if (!el) return;
          const interactive = el.closest('input, select, textarea, button, a[href], label, [contenteditable="true"]');
          const arrowHit = el.closest('.menu-summary-arrow') || el.closest('.menu-launch-arrow') || el === arrow;
          if (!arrowHit && !interactive) {
            e.stopImmediatePropagation();
          }
        };

        summary.addEventListener('click', summary._pillHandler, true);
        ['pointerdown', 'mousedown', 'touchstart'].forEach(ev => {
          summary.addEventListener(ev, summary._pillPointerHandler, true);
        });
      });
    }

    // Apply initially and reapply on DOM mutations (in case summaries are added later)
    document.addEventListener('DOMContentLoaded', applyToAllSummaries);
    // Also apply immediately if DOMContentLoaded already fired
    if (document.readyState === 'interactive' || document.readyState === 'complete') {
      applyToAllSummaries();
    }

    // Re-apply when the pill setting changes (if there's a checkbox for it)
    const pillCheckbox = document.querySelector('.setting-pill-arrow-only');
    if (pillCheckbox) {
      pillCheckbox.addEventListener('change', applyToAllSummaries);
    }

    // observe additions of new summary elements and ensure they get arrows/handlers
    const observer = new MutationObserver((mutations) => {
      let found = false;
      for (const m of mutations) {
        for (const n of Array.from(m.addedNodes || [])) {
          if (n && n.querySelectorAll) {
            if (n.querySelectorAll('summary.menu-summary').length > 0) found = true;
            if (n.matches && n.matches('summary.menu-summary')) found = true;
          }
        }
      }
      if (found) applyToAllSummaries();
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
  })();


  /* ----------------------
     Extra defensive patch: if the app exposes an `openOverlay` function which
     opens menus by target name, patch it so it respects pillArrowOnly setting.
     This prevents other code paths from opening pills unless arrow activated.
     ---------------------- */
  (function patchOpenOverlayIfPresent() {
    try {
      if (typeof window.openOverlay === 'function') {
        const original = window.openOverlay;
        window.openOverlay = function (targetName, ...rest) {
          try {
            // If targetName is a selector or id for a menu-launch or details,
            // verify last activation occurred on an arrow when pillArrowOnly is enabled.
            if (isPillArrowOnlyEnabled()) {
              const last = window._lastActivation || null;
              // If last activation wasn't on an arrow, find element and block open.
              if (last && !last.closestArrow) {
                // Attempt additional DOM check: if last activation element is inside summary/pill but not on arrow, block.
                if (last.closestMenuLaunch || last.closestSummary) {
                  console.debug('openOverlay blocked due to pillArrowOnly and last activation not on arrow', last);
                  return; // don't open
                }
              }
            }
          } catch (err) { /* ignore */ }
          return original.apply(this, [targetName, ...rest]);
        };
      }
    } catch (err) { console.error('patchOpenOverlayIfPresent error', err); }
  })();


  /* ----------------------
     Public helper: flip pillArrowOnly global and re-run summary handlers.
     Useful for programmatic toggling.
     ---------------------- */
  window.setPillArrowOnly = function (enabled) {
    try {
      window.pillArrowOnly = !!enabled;
      const ev = new Event('pillArrowOnlyChanged');
      document.dispatchEvent(ev);
    } catch (err) { /* ignore */ }
  };

})(); // end merged fixes IIFE

/* End of merged fixes */


/* ===================================================================
   Non-intrusive summary handlers (v2)
   - Removes any previously-injected .menu-summary-arrow elements created
     by the earlier patch to avoid changing visual styling.
   - If there is no existing arrow element, uses a right-edge "hit area"
     heuristic (last 36px of the summary) to act as the arrow target, so
     the visual layout is NOT modified.
   - Keeps interactive controls (inputs, labels, buttons, anchors) usable.
   =================================================================== */
(function () {
  'use strict';

  function isPillArrowOnlyEnabled() {
    try {
      if (typeof window.pillArrowOnly !== 'undefined') return !!window.pillArrowOnly;
      const el = document.querySelector('.setting-pill-arrow-only');
      if (el) return !!el.checked;
    } catch (err) { }
    return false;
  }

  function initSummaryHandlers() {
    const summaries = Array.from(document.querySelectorAll('summary.menu-summary'));
    const allowToggleCheckbox = () => {
      try {
        const lbl = document.querySelector('.setting-label-selects');
        const ttl = document.querySelector('.setting-title-selects');
        const lblOn = lbl ? !!lbl.checked : true;
        const ttlOn = ttl ? !!ttl.checked : true;
        return lblOn || ttlOn;
      } catch { return true; }
    };
    const isTitleToggleEnabled = () => {
      try { return !!titleSelects; } catch { return true; }
    };

    summaries.forEach((summary) => {
      // Remove any older v1 handlers so they don't block clicks
      if (summary._pillHandler) {
        summary.removeEventListener('click', summary._pillHandler, true);
        ['pointerdown', 'mousedown', 'touchstart'].forEach(ev => {
          summary.removeEventListener(ev, summary._pillPointerHandler, true);
        });
        summary._pillHandler = null;
        summary._pillPointerHandler = null;
      }
      // Remove previously injected arrow nodes we created earlier, but do not remove arrows
      // that were present before (we try to only remove arrows whose textContent was the fallback glyph).
      const injected = Array.from(summary.querySelectorAll('.menu-summary-arrow, .menu-launch-arrow')).filter(el => {
        // If the element has no CSS classes beyond these or has our fallback glyph, treat as injected.
        return false;
      });
      injected.forEach(el => el.remove());

      // Determine if there is still an arrow element provided by CSS/HTML
      const existingArrow = summary.querySelector('.menu-summary-arrow, .menu-launch-arrow');
      const useHitArea = !existingArrow;

      // Remove old handlers if any
      if (summary._pillHandlerV2) {
        summary.removeEventListener('click', summary._pillHandlerV2, true);
        ['pointerdown', 'mousedown', 'touchstart'].forEach(evt => {
          summary.removeEventListener(evt, summary._pillPointerHandlerV2, true);
        });
      }

      // Helper: check if event target is an interactive element inside the summary
      function isInteractive(el) {
        return !!(el && el.closest && el.closest('input, select, textarea, button, a[href], label, [contenteditable="true"]'));
      }

      // Helper: compute whether event location is inside the right-edge hit area
      function isInRightHitArea(e, summaryEl) {
        if (!e || !summaryEl || !summaryEl.getBoundingClientRect) return false;
        const rect = summaryEl.getBoundingClientRect();
        // Use 36px from the right edge as the arrow "hit area"
        const threshold = 36;
        // Some events (keyboard) don't have clientX; treat keyboard as allowed only when focused on arrow-like element.
        if (typeof e.clientX !== 'number') {
          // if focus is inside an existing arrow element, allow; otherwise disallow
          const active = document.activeElement;
          return !!(active && (active.closest && (active.closest('.menu-summary-arrow') || active.closest('.menu-launch-arrow'))));
        }
        return e.clientX >= (rect.right - threshold);
      }

      // Helper: allow clicking the left-side triangle marker to count as an arrow hit
      function isInLeftHitArea(e, summaryEl) {
        if (!e || !summaryEl || !summaryEl.getBoundingClientRect) return false;
        if (typeof e.clientX !== 'number') return false;
        const rect = summaryEl.getBoundingClientRect();
        const threshold = 32;
        return e.clientX <= (rect.left + threshold);
      }

      // Click phase handler (capture)
      summary._pillHandlerV2 = function (e) {
        if (!isPillArrowOnlyEnabled()) return;
        const el = e.target;
        if (!el) return;
        if (isInteractive(el)) return; // allow interactions
        // Allow title clicks through when title-select is enabled
        const titleEl = summary.querySelector('span');
        const isTitleClick = titleEl && titleEl.contains(el);
        if (isTitleClick && isTitleToggleEnabled()) return;
        const arrowHit = !!(el.closest && (el.closest('.menu-summary-arrow') || el.closest('.menu-launch-arrow')));
        if (!arrowHit) {
          // if using hit area, check coordinates
          if ((useHitArea && isInRightHitArea(e, summary)) || isInLeftHitArea(e, summary)) {
            return; // allow
          }
          // Arrow-only: block non-arrow clicks entirely
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
        }
      };

      // Pointer/touchstart handler to preempt native toggling on some browsers
      summary._pillPointerHandlerV2 = function (e) {
        if (!isPillArrowOnlyEnabled()) return;
        const el = e.target;
        if (!el) return;
        if (isInteractive(el)) return;
        const titleEl = summary.querySelector('span');
        const isTitleClick = titleEl && titleEl.contains(el);
        if (isTitleClick && isTitleToggleEnabled()) return;
        const arrowHit = !!(el.closest && (el.closest('.menu-summary-arrow') || el.closest('.menu-launch-arrow')));
        if (!arrowHit) {
          if ((useHitArea && isInRightHitArea(e, summary)) || isInLeftHitArea(e, summary)) {
            return;
          }
          // Arrow-only: block non-arrow clicks entirely
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
        }
      };

      summary.addEventListener('click', summary._pillHandlerV2, true);
      ['pointerdown', 'mousedown', 'touchstart'].forEach(evt => {
        summary.addEventListener(evt, summary._pillPointerHandlerV2, true);
      });
    });
  }

  // Run on DOM ready and also when new nodes are added
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSummaryHandlers);
  } else {
    initSummaryHandlers();
  }

  // Re-apply when pill-arrow-only changes so handlers stay in sync
  document.addEventListener('pillArrowOnlyChanged', initSummaryHandlers);

  const observer = new MutationObserver((mutations) => {
    let added = false;
    for (const m of mutations) {
      for (const n of Array.from(m.addedNodes || [])) {
        if (n && n.querySelectorAll && n.querySelectorAll('summary.menu-summary').length > 0) {
          added = true; break;
        }
      }
      if (added) break;
    }
    if (added) initSummaryHandlers();
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });

  // Expose for debugging
  window._summaryHandlersV2Active = true;
})(); // end non-intrusive summary handlers (v2)


/* Runtime cleanup: remove any injected arrow elements and prevent future insertions from showing.
   This runs on DOMContentLoaded and also uses a MutationObserver to strip any newly-added arrow nodes.
*/
(function () {
  'use strict';
  function removeInjectedArrows(root = document) {
    try {
      root.querySelectorAll('.menu-launch-arrow, .menu-summary-arrow').forEach(el => {
        // Only remove elements that have no meaningful content (defensive)
        const txt = (el.textContent || '').trim();
        const hasMeaningfulText = txt.length > 0;
        // If element has roles/handlers but empty text, still remove to match user's request
        if (!hasMeaningfulText) {
          el.remove();
        } else {
          // If it has text, remove only if it's empty whitespace or original glyph (already removed earlier)
          if (txt === '') el.remove();
        }
      });
    } catch (err) { /* ignore */ }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => removeInjectedArrows(document));
  } else {
    removeInjectedArrows(document);
  }

  // Observe future additions and remove arrows as they appear
  const observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      for (const n of Array.from(m.addedNodes || [])) {
        try {
          if (n && n.querySelectorAll) {
            const found = n.querySelectorAll('.menu-launch-arrow, .menu-summary-arrow');
            if (found.length) removeInjectedArrows(n);
          }
          // If the added node itself matches selector, remove it too
          if (n && n.matches && (n.matches('.menu-launch-arrow') || n.matches('.menu-summary-arrow'))) {
            n.remove();
          }
        } catch (err) { /* ignore */ }
      }
    }
  });
  observer.observe(document.documentElement || document, { childList: true, subtree: true });

  // Expose for debugging
  window._removedInjectedArrows = true;
})(); // end runtime cleanup




// --- control-box safe-area helper ---
// Adjusts page padding/scroll offsets when a bottom "control box" overlay is present.
// Customize selector '.control-box' if your control uses a different class.
(function () {
  'use strict';
  const CONTROL_SELECTOR = '.control-box'; // CHANGE THIS if your control uses a different class
  const EXTRA_GAP_PX = 12; // space between content and control

  const ctrl = document.querySelector(CONTROL_SELECTOR);
  if (!ctrl) {
    // nothing to do
    return;
  }

  function updateControlHeight() {
    // Measure height and set CSS variable
    const h = ctrl.offsetHeight || 0;
    document.documentElement.style.setProperty('--control-height', h + 'px');

    // Add a class so CSS can add padding if desired
    if (ctrl.offsetParent !== null && getComputedStyle(ctrl).display !== 'none') {
      document.body.classList.add('with-control-box');
    } else {
      document.body.classList.remove('with-control-box');
    }
  }

  // Observe size changes of control (e.g., responsive/hide/show)
  try {
    const ro = new ResizeObserver(updateControlHeight);
    ro.observe(ctrl);
  } catch (e) {
    // fallback: window resize
    window.addEventListener('resize', updateControlHeight);
  }

  // Also run on load
  window.addEventListener('load', updateControlHeight);
  // and when the control is shown/hidden through DOM changes
  const mo = new MutationObserver(updateControlHeight);
  mo.observe(document.body, { attributes: true, childList: true, subtree: true });

  // Ensure focused elements are scrolled into view with offset
  document.addEventListener('focusin', (ev) => {
    const el = ev.target;
    if (!(el instanceof HTMLElement)) return;
    // Only adjust for inputs/textareas/selects and elements inside the main content area
    const tag = el.tagName.toLowerCase();
    if (!['input', 'textarea', 'select', 'button', 'a'].includes(tag)) return;

    // Compute target position accounting for control height
    const controlHeight = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--control-height')) || 0;
    const extra = controlHeight + EXTRA_GAP_PX;
    const rect = el.getBoundingClientRect();
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    // If element bottom is covered by control, scroll it up
    const elBottom = rect.bottom;
    const coveredThreshold = viewportHeight - extra;
    if (elBottom > coveredThreshold) {
      const targetY = window.scrollY + rect.top - Math.max(12, (viewportHeight / 6)); // try to place element in upper part
      // fine-tune so bottom sits above control
      const adjust = Math.min(rect.top, extra + 8);
      window.scrollTo({ top: targetY - adjust, behavior: 'smooth' });
    }
  }, true);
})();
