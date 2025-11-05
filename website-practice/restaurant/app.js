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
    activeSections: 'restaurant.activeSections'
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
    try {
      document.querySelectorAll('.left-rail a').forEach((a) => {
        a.setAttribute('tabindex', '-1');
        a.setAttribute('aria-disabled', 'true');
        a.addEventListener('click', (e) => e.preventDefault());
      });
    } catch {}

    // If user refreshes a non-index page, redirect to index
    try {
      const nav = performance.getEntriesByType && performance.getEntriesByType('navigation')[0];
      const isReload = nav && nav.type === 'reload';
      if (!body.classList.contains('order-type') && isReload) {
        window.location.replace('index.html');
        return;
      }
    } catch {}

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
    const themeBtn = document.querySelector('.theme-toggle');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        body.classList.toggle('theme-dark');
        try {
          const isDark = body.classList.contains('theme-dark');
          localStorage.setItem(STORAGE_KEYS.theme, isDark ? 'dark' : 'light');
        } catch { }
      });
    }

    // [H1] INDEX: ORDER TYPE
    if (body.classList.contains('order-type')) {
      // On page load/refresh of index, reset any previously saved order + delivery details
      try {
        localStorage.removeItem(STORAGE_KEYS.orderType);
        localStorage.removeItem(STORAGE_KEYS.deliveryName);
        localStorage.removeItem(STORAGE_KEYS.deliveryPhone);
        localStorage.removeItem(STORAGE_KEYS.deliveryAddress);
        localStorage.removeItem(STORAGE_KEYS.deliveryType);
        localStorage.removeItem(STORAGE_KEYS.deliveryCity);
        localStorage.removeItem(STORAGE_KEYS.deliveryZip);
      } catch {}
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
              } catch {}
              // Focus first input
              const first = form.querySelector('input');
              if (first) first.focus();
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
            } catch {}
          }
        }
      }

      // Handle delivery form submit
      const dForm = document.getElementById('delivery-details');
      if (dForm) {
        // Restrict phone to digits only
        const phoneEl = dForm.querySelector('#delivery-phone');
        if (phoneEl) {
          phoneEl.addEventListener('input', () => {
            phoneEl.value = phoneEl.value.replace(/\D+/g, '');
          });
        }
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
          // clear any previous custom validity
          if (phoneEl) phoneEl.setCustomValidity('');
          if (zipEl) zipEl.setCustomValidity('');
          const errEl = document.getElementById('delivery-error');
          if (errEl) errEl.hidden = true;
          if (!name || !phone || !addr || !city || !type || !zip) {
            const missing = [];
            if (!name) missing.push('Name');
            if (!phone) missing.push('Phone Number');
            if (!addr) missing.push('Street Address');
            if (!type) missing.push('Residence Type');
            if (!city) missing.push('City');
            if (!zip) missing.push('Zip');
            if (errEl) {
              errEl.textContent = `Please complete the following required fields: ${missing.join(', ')}.`;
              errEl.hidden = false;
            }
            return;
          }
          // Phone must be exactly 10 digits
          if (phone.length !== 10) {
            if (phoneEl) {
              phoneEl.setCustomValidity('Enter a 10-digit phone number');
              phoneEl.reportValidity();
              setTimeout(() => phoneEl.setCustomValidity(''), 1500);
            }
            return;
          }
          // Enforce service area zip with single custom message
          if (zip !== '13309') {
            if (zipEl) {
              zipEl.setCustomValidity('Sorry, we cannot accept your order. We currently serve zip code 13309 only.');
              zipEl.reportValidity();
              // Do not set a timeout reset; cleared on next submit attempt above
            }
            return;
          }
          try {
            localStorage.setItem(STORAGE_KEYS.deliveryName, name);
            localStorage.setItem(STORAGE_KEYS.deliveryPhone, phone);
            localStorage.setItem(STORAGE_KEYS.deliveryAddress, addr);
            localStorage.setItem(STORAGE_KEYS.deliveryType, type || 'House');
            localStorage.setItem(STORAGE_KEYS.deliveryCity, city);
            localStorage.setItem(STORAGE_KEYS.deliveryZip, zip);
          } catch {}
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
            } catch {}
          });
        }
      }
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
      // Reset on load: clear any previously saved active sections and start unchecked/closed
      try { localStorage.removeItem(STORAGE_KEYS.activeSections); } catch {}
      let activeSections = {};
      toggles.forEach((t) => {
        const section = t.dataset.section;
        t.checked = false;
        const d = detailsBySection[section];
        if (d) d.open = false;
        // Ensure clicking the checkbox doesn't bubble to summary
        t.addEventListener('click', (ev) => {
          ev.stopPropagation();
        });
        t.addEventListener('change', () => {
          const d2 = detailsBySection[section];
          if (d2) d2.open = t.checked;
          // If activated, enforce required items in that section
          if (t.checked && d2) {
            d2.querySelectorAll('input[type="checkbox"][data-required="true"]').forEach((cb) => {
              cb.checked = true;
            });
            saveIngredients();
          }
          // If deactivated, clear all selections (including required) in that section
          if (!t.checked && d2) {
            d2.querySelectorAll('input[type="checkbox"][name]').forEach((cb) => {
              cb.checked = false;
            });
            saveIngredients();
          }
          activeSections[section] = t.checked;
          try { localStorage.setItem(STORAGE_KEYS.activeSections, JSON.stringify(activeSections)); } catch {}
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
      // Save on any change
      document.addEventListener('change', (e) => {
        const t = e.target;
        if (t && t.matches && t.matches('input[type="checkbox"][name]')) {
          saveIngredients();
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
      // Next simply saves and allows navigation; no extra ingredient requirement
      const next = document.querySelector('.next-button');
      if (next) {
        next.addEventListener('click', () => {
          saveIngredients();
          const err = document.getElementById('builder-error');
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
            line.textContent = `Phone: ${dph}`;
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

            // Burger now allowed with only required items; no special skip

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
