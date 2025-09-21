function clamp(val, min, max) {
    return Math.min(max, Math.max(min, val));
}

function roundToStep(val, step, min) {
    const offset = val - min;
    return Math.round(offset / step) * step + min;
}

function setProgressCSS(input) {
    const min = Number(input.min || 0);
    const max = Number(input.max || 100);
    const val = Number(input.value);
    const pct = ((val - min) / (max - min)) * 100;
    input.style.setProperty('--_progress', pct + '%');
}

function formatValue(val, unit) {
    return unit === '%' ? `${val}%` : `${val}${unit}`;
}

function updateAria(input, unit) {
    input.setAttribute('aria-valuenow', input.value);
    const vt = unit === '%'
        ? `${input.value} percent`
        : `${input.value} ${unit === 'px' ? 'pixels' : unit}`;
    input.setAttribute('aria-valuetext', vt);
}

function buildTicks(container, min, max, step, majorEvery, unit) {
    container.innerHTML = '';
    const total = (max - min) / step;
    for (let i = 0; i <= total; i++) {
        const val = min + i * step;
        const pct = ((val - min) / (max - min)) * 100;
        const t = document.createElement('div');
        const isMajor = ((val - min) % (step * majorEvery) === 0);
        t.className = 'tick' + (isMajor ? ' major' : '');
        t.style.left = pct + '%';
        container.appendChild(t);
        if (isMajor) {
            const lbl = document.createElement('div');
            lbl.className = 'tick-label';
            lbl.style.left = pct + '%';
            lbl.textContent = unit === '%' ? `${val}%` : `${val}${unit}`;
            container.appendChild(lbl);
        }
    }
}

function initSlider(wrapperId, unit, options = {}) {
    const wrap = document.getElementById(wrapperId);
    const input = wrap.querySelector('input[type="range"]');
    const valueEl = wrap.querySelector('.value');
    const ticksEl = wrap.querySelector('.ticks');
    const min = Number(input.min);
    const max = Number(input.max);
    const step = Number(input.step);

    // Build ticks (major label every N steps)
    const majorEvery = options.majorEvery || (unit === '%' ? 2 : 2);
    buildTicks(ticksEl, min, max, step, majorEvery, unit);

    function render() {
        const val = Number(input.value);
        valueEl.textContent = formatValue(val, unit);
        setProgressCSS(input);
        updateAria(input, unit);
    }

    // Pointer change
    input.addEventListener('input', render);
    input.addEventListener('change', render);

    // Keyboard enhancements
    input.addEventListener('keydown', (e) => {
        let val = Number(input.value);
        const page = (max - min) / 10; // page jump = 10% of range
        if (e.key === 'ArrowLeft') { val -= step; e.preventDefault(); }
        else if (e.key === 'ArrowRight') { val += step; e.preventDefault(); }
        else if (e.key === 'PageDown') { val -= page; e.preventDefault(); }
        else if (e.key === 'PageUp') { val += page; e.preventDefault(); }
        else if (e.key === 'Home') { val = min; e.preventDefault(); }
        else if (e.key === 'End') { val = max; e.preventDefault(); }
        val = roundToStep(val, step, min);
        input.value = String(clamp(val, min, max));
        render();
    });

    // Initialize
    render();
}

// Initialize sliders
initSlider('volume-wrap', '%', { majorEvery: 2 }); // labels every 20%
initSlider('font-wrap', 'px', { majorEvery: 2 });  // labels every 4px
