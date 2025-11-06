//
// Restaurant Demo App JS
// - See section tags [A]..[H] for navigation
//

(function () {
  // [A] STORAGE KEYS
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
    navEnabled: 'restaurant.nav.enabled'
  };

  // [B] TEXT UTILS
  function titleCase(str) {
    if (!str) return '';
    return String(str)
      .replace(/[_-]+/g, ' ')
      .split(/\s+/)
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }

  // [C] ORDER TYPE: SAVE/GET
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

  // [D] INGREDIENTS: READ FROM DOM
  function readIngredientsFromDOM() {
    const data = {};
    const inputs = document.querySelectorAll('input[type="checkbox"][name]');
    inputs.forEach((input) => {
      const name = input.getAttribute('name');
      if (!data[name]) data[name] = [];
      if (input.checked) {
        // Try to find the label text associated with this input
        let labelText = '';
        const label = input.closest('label') || document.querySelector(`label[for="${input.id}"]`);
        if (label) {
          // Get text content without the input's value
          labelText = (label.textContent || '').trim();
        }
        data[name].push({ value: input.value, label: labelText || titleCase(input.value) });
      }
    });
    return data;
  }

  // [E] INGREDIENTS: SAVE TO STORAGE
  function saveIngredients() {
    const data = readIngredientsFromDOM();
    try {
      localStorage.setItem(STORAGE_KEYS.ingredients, JSON.stringify(data));
    } catch { }
  }

  // [F] INGREDIENTS: RESTORE FROM STORAGE
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

  // [G] NAV: OPEN SECTION FROM URL HASH
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

  // [H] PAGE INITIALIZATION
  document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;

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
    let navInitialEnabled = false;
    try {
      navInitialEnabled = localStorage.getItem(STORAGE_KEYS.navEnabled) === 'true';
    } catch { }
    setNavState(navInitialEnabled);

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

    // [H1] INDEX: ORDER TYPE
    if (body.classList.contains('order-type')) {
      // Track delivery submit failures to show fallback help after 2 failed attempts
      let deliveryFailCount = 0;
      // On page load/refresh of index, reset any previously saved order + delivery details
      try {
        localStorage.removeItem(STORAGE_KEYS.orderType);
        localStorage.removeItem(STORAGE_KEYS.deliveryName);
        localStorage.removeItem(STORAGE_KEYS.deliveryPhone);
        localStorage.removeItem(STORAGE_KEYS.deliveryAddress);
        localStorage.removeItem(STORAGE_KEYS.deliveryType);
        localStorage.removeItem(STORAGE_KEYS.deliveryCity);
        localStorage.removeItem(STORAGE_KEYS.deliveryZip);
        localStorage.removeItem(STORAGE_KEYS.ingredients);
        localStorage.removeItem(STORAGE_KEYS.activeSections);
      } catch { }
      const dFormInit = document.getElementById('delivery-details');
      if (dFormInit) {
        dFormInit.hidden = true;
        dFormInit.querySelectorAll('input[type="text"], input[type="tel"]').forEach((el) => { el.value = ''; el.setCustomValidity && el.setCustomValidity(''); });
        const typeSel = dFormInit.querySelector('#delivery-type');
        if (typeSel) typeSel.value = 'House';
        const errEl = document.getElementById('delivery-error');
        if (errEl) errEl.hidden = true;
      }

      const cards = document.querySelectorAll('.order-card');
      const setActive = (clicked) => {
        cards.forEach(c => c.classList.toggle('selected', c === clicked));
      };
      cards.forEach((card) => {
        card.addEventListener('click', (e) => {
          const type = card.dataset.type || '';
          if (!type) return;
          setActive(card);
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
            // Dine/Carryout proceeds immediately
            saveOrderType(type);
          }
        });
      });

      // Restore visual selection if user returns
      const selected = getOrderType();
      if (selected) {
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
          }
          if (!t.checked && d2) {
            // Clear all selections in that section when deactivating
            d2.querySelectorAll('input[type="checkbox"][name]').forEach((cb) => { cb.checked = false; });
            saveIngredients();
          }
          activeSections[section] = t.checked;
          try { localStorage.setItem(STORAGE_KEYS.activeSections, JSON.stringify(activeSections)); } catch { }
        });
      });
      // Summary click toggles the section checkbox (and thus open state)
      document.querySelectorAll('summary.menu-summary').forEach((s) => {
        s.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const t = s.querySelector('.section-toggle');
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
      // Save on any change
      document.addEventListener('change', (e) => {
        const t = e.target;
        if (t && t.matches && t.matches('input[type="checkbox"][name]')) {
          saveIngredients();
          updateBuilderError();
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
        h3i.textContent = 'Selected Ingredients';
        frag.appendChild(h3i);

        const entries = Object.entries(ingredients || {});
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

            const header = document.createElement('div');
            const listTitle = document.createElement('strong');
            listTitle.textContent = prettyGroup.charAt(0).toUpperCase() + prettyGroup.slice(1);
            header.appendChild(listTitle);

            const edit = document.createElement('a');
            edit.href = `page2.html#${key}`;
            edit.textContent = 'Edit';
            edit.style.marginLeft = '8px';
            header.appendChild(edit);

            frag.appendChild(header);
            const ul = document.createElement('ul');
            values.forEach((item) => {
              const li = document.createElement('li');
              const label = (typeof item === 'string') ? titleCase(item) : (item && item.label ? item.label : titleCase(item && item.value));
              li.textContent = label;
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
