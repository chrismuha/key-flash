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
    deliveryZip: 'restaurant.delivery.zip'
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
      const cards = document.querySelectorAll('.order-card');
      cards.forEach((card) => {
        card.addEventListener('click', (e) => {
          const type = card.dataset.type || '';
          if (!type) return;
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
        // Helpers for inputs
        const phoneEl = dForm.querySelector('#delivery-phone');
        const zipEl = dForm.querySelector('#delivery-zip');

        // Live phone formatting to (000)-000-0000
        const formatPhone = (digits) => {
          const d = digits.replace(/\D+/g, '').slice(0, 10);
          const a = d.slice(0, 3);
          const b = d.slice(3, 6);
          const c = d.slice(6, 10);
          let out = '';
          if (a) out = `(${a}`;
          if (a.length === 3) out += `)`;
          if (b) out += `-${b}`;
          if (c) out += `-${c}`;
          return out;
        };

        const formatZipPlus4 = (value) => {
          // Keep only digits, limit to 9 (ZIP+4)
          const d = (value || '').replace(/\D+/g, '').slice(0, 9);
          const first = d.slice(0, 5);
          const plus4 = d.slice(5);
          return plus4 ? `${first}-${plus4}` : first;
        };

        if (phoneEl) {
          if (phoneEl.value) phoneEl.value = formatPhone(phoneEl.value);
          phoneEl.addEventListener('input', () => {
            phoneEl.value = formatPhone(phoneEl.value);
            if (phoneEl.maxLength > 0 && phoneEl.value.length > phoneEl.maxLength) {
              phoneEl.value = phoneEl.value.slice(0, phoneEl.maxLength);
            }
          });
        }

        // Zip: live-format to ZIP+4 (#####-####), max 10 chars
        if (zipEl) {
          if (zipEl.value) zipEl.value = formatZipPlus4(zipEl.value);
          zipEl.addEventListener('input', () => {
            zipEl.setCustomValidity('');
            zipEl.value = formatZipPlus4(zipEl.value);
            if (zipEl.maxLength > 0 && zipEl.value.length > zipEl.maxLength) {
              zipEl.value = zipEl.value.slice(0, zipEl.maxLength);
            }
          });
        }
        dForm.addEventListener('submit', (e) => {
          e.preventDefault();
          const name = dForm.querySelector('#delivery-name').value.trim();
          const phone = phoneEl ? phoneEl.value.replace(/\D+/g, '') : '';
          const addr = dForm.querySelector('#delivery-address').value.trim();
          const type = (dForm.querySelector('#delivery-type')?.value || '').trim();
          const city = dForm.querySelector('#delivery-city').value.trim();
          const zip = zipEl ? (zipEl.value || '').trim() : '';
          // clear any previous custom validity
          if (phoneEl) phoneEl.setCustomValidity('');
          if (zipEl) zipEl.setCustomValidity('');
          const errEl = document.getElementById('delivery-error');
          if (errEl) errEl.hidden = true;
          // clear any previous custom validity
          if (phoneEl) phoneEl.setCustomValidity('');
          if (zipEl) zipEl.setCustomValidity('');
          if (!name || !phone || !addr || !city || !type || !zip) {
            // basic UI feedback
            dForm.querySelectorAll('input[required], select[required]').forEach((inp) => {
              if (!inp.value.trim()) inp.reportValidity?.();
            });
            return;
          }
          // Phone must be exactly 10 digits
          if (phone.length !== 10) {
            if (phoneEl) {
              const msg = 'Please contact us if you are having trouble placing your order online. Please let us know what the issue is so we can have it fixed in a timely manner.';
              phoneEl.setCustomValidity(msg);
              phoneEl.reportValidity();
            }
            // Optional inline helper display (same single message)
            const errEl = document.getElementById('delivery-error');
            if (errEl) {
              errEl.textContent = 'Please contact us if you are having trouble placing your order online. Please let us know what the issue is so we can have it fixed in a timely manner.';
              errEl.hidden = false;
            }
            return;
          }
          // Enforce service area zip with single custom message (compare digits only)
          // Expect ZIP+4: 9 digits where first 5 must be 13309
          const zipDigits = zip.replace(/\D+/g, '');
          if (zipDigits.length !== 9 || zipDigits.slice(0, 5) !== '13309') {
            if (zipEl) {
              zipEl.setCustomValidity('Sorry, we cannot accept your order. We currently serve zip code 13309 only.');
              zipEl.reportValidity();
              // Do not set a timeout reset; cleared on next submit attempt above
            }
            if (errEl) {
              errEl.textContent = 'Sorry, we cannot accept your order. We currently serve zip code 13309 only.';
              errEl.hidden = false;
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
      }
    }

    // [H2] PAGE 2: MENU BUILDER
    if (body.classList.contains('page2')) {
      // Restore previous selections
      restoreIngredients();
      // Auto-open a section from hash (e.g., #pizza or #burger)
      openSectionFromHash();
      // Enforce required Burger Patty to be checked but styled like normal
      const patty = document.querySelector('input[type="checkbox"][name="burger_ingredients[]"][value="patty"]');
      if (patty) {
        const enforceChecked = (e) => {
          if (e) e.preventDefault();
          patty.checked = true;
          saveIngredients();
        };
        // Ensure it's set
        enforceChecked();
        // The input is disabled, so no further event handling needed
      }
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
      // Also save when clicking Next
      const next = document.querySelector('.next-button');
      if (next) {
        next.addEventListener('click', () => {
          saveIngredients();
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

        // Build summary HTML
        const frag = document.createDocumentFragment();
        const h3 = document.createElement('h3');
        h3.textContent = 'Order Type';
        frag.appendChild(h3);
        const p = document.createElement('p');
        p.textContent = type ? (type === 'dine' ? 'Dine In/Carryout' : 'Delivery') : 'Not selected';
        frag.appendChild(p);

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
          const zipRaw = localStorage.getItem(STORAGE_KEYS.deliveryZip) || '';
          const zip = (function(){
            const d = String(zipRaw).replace(/\D+/g,'').slice(0,9);
            if (!d) return '';
            return d.length > 5 ? d.slice(0,5) + '-' + d.slice(5) : d;
          })();

          const block = document.createElement('div');
          block.className = 'address-block';

          if (dn || dt) {
            const line = document.createElement('div');
            line.textContent = dt ? `${dn} (${dt})` : dn;
            block.appendChild(line);
          }
          if (dph) {
            const line = document.createElement('div');
            // format saved digits for display as (000)-000-0000
            const prettyPhone = (function () {
              const d = String(dph).replace(/\D+/g, '').slice(0, 10);
              const a = d.slice(0, 3);
              const b = d.slice(3, 6);
              const c = d.slice(6, 10);
              let out = '';
              if (a) out = `(${a}`;
              if (a.length === 3) out += `)`;
              if (b) out += `-${b}`;
              if (c) out += `-${c}`;
              return out || dph;
            })();
            line.textContent = `Phone: ${prettyPhone}`;
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
