// Simple persistence for order type and ingredient selections using localStorage

(function () {
  const STORAGE_KEYS = {
    orderType: 'restaurant.orderType',
    ingredients: 'restaurant.ingredients'
  };

  function titleCase(str) {
    if (!str) return '';
    return String(str)
      .replace(/[_-]+/g, ' ')
      .split(/\s+/)
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }

  function saveOrderType(type) {
    try {
      localStorage.setItem(STORAGE_KEYS.orderType, type);
    } catch {}
  }

  function getOrderType() {
    try {
      return localStorage.getItem(STORAGE_KEYS.orderType) || '';
    } catch { return ''; }
  }

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

  function saveIngredients() {
    const data = readIngredientsFromDOM();
    try {
      localStorage.setItem(STORAGE_KEYS.ingredients, JSON.stringify(data));
    } catch {}
  }

  function restoreIngredients() {
    let data = {};
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.ingredients);
      if (raw) data = JSON.parse(raw);
    } catch {}

    const inputs = document.querySelectorAll('input[type="checkbox"][name]');
    inputs.forEach((input) => {
      const name = input.getAttribute('name');
      const values = data[name] || [];
      // Back-compat: array of strings OR array of {value,label}
      const selectedValues = values.map(v => (typeof v === 'string' ? v : v && v.value)).filter(Boolean);
      input.checked = selectedValues.includes(input.value);
    });
  }

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

  document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;

    // Index (order type) page logic
    if (body.classList.contains('order-type')) {
      const cards = document.querySelectorAll('.order-card');
      cards.forEach((card) => {
        card.addEventListener('click', () => {
          const type = card.dataset.type || '';
          if (type) saveOrderType(type);
        });
      });

      // Restore visual selection if user returns
      const selected = getOrderType();
      if (selected) {
        const el = document.querySelector(`.order-card[data-type="${selected}"]`);
        if (el) el.classList.add('selected');
      }
    }

    // Page 2 (menu builder) logic
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
      // Also save when clicking Next
      const next = document.querySelector('.next-button');
      if (next) {
        next.addEventListener('click', () => {
          saveIngredients();
        });
      }
    }

    // Page 3: render order summary
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
