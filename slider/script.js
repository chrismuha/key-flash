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

function buildTicks(container, min, max, step, majorEvery, unit, input, render) {
    container.innerHTML = '';
    const total = (max - min) / step;
    for (let i = 0; i <= total; i++) {
        const val = min + i * step;
        const pct = ((val - min) / (max - min)) * 100;

        // Tick line
        const t = document.createElement('div');
        const isMajor = ((val - min) % (step * majorEvery) === 0);
        t.className = 'tick' + (isMajor ? ' major' : '');
        t.style.left = pct + '%';

        // Make tick clickable
        t.style.cursor = 'pointer';
        t.addEventListener('click', () => {
            input.value = val;
            render();
        });

        container.appendChild(t);

        // Tick label
        if (isMajor) {
            const lbl = document.createElement('div');
            lbl.className = 'tick-label';
            lbl.style.left = pct + '%';
            lbl.textContent = unit === '%' ? `${val}%` : `${val}${unit}`;

            // Make label clickable
            lbl.style.cursor = 'pointer';
            lbl.addEventListener('click', () => {
                input.value = val;
                render();
            });

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

    const majorEvery = options.majorEvery || (unit === '%' ? 2 : 2);

    function render() {
        const val = Number(input.value);
        valueEl.textContent = formatValue(val, unit);
        setProgressCSS(input);
        updateAria(input, unit);
    }

    // Build clickable ticks
    buildTicks(ticksEl, min, max, step, majorEvery, unit, input, render);

    input.addEventListener('input', render);
    input.addEventListener('change', render);

    // Keyboard enhancements
    input.addEventListener('keydown', (e) => {
        let val = Number(input.value);
        const page = (max - min) / 10;
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
initSlider('volume-wrap', '%', { majorEvery: 2 });
initSlider('font-wrap', 'px', { majorEvery: 2 });
