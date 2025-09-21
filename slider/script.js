function clamp(val, min, max) {
    return Math.min(max, Math.max(min, val));
}

function roundToStep(val, step, min) {
    const offset = val - min;
    return Math.round(offset / step) * step + min;
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

function setProgressCSS(input, trackWidth) {
    const min = Number(input.min || 0);
    const max = Number(input.max || 100);
    const val = Number(input.value);
    const pct = ((val - min) / (max - min)) * 100;

    input.style.setProperty('--_progress', pct.toFixed(6) + '%');

    const px = Math.round((pct / 100) * trackWidth);
    input.style.setProperty('--_progress_px', px + 'px');
}

function buildTicks(container, min, max, step, majorEvery, unit, input, render, position) {
    if (!container) return;
    container.innerHTML = '';
    const steps = Math.round((max - min) / step);
    const w = Math.round(container.getBoundingClientRect().width);

    for (let i = 0; i <= steps; i++) {
        const val = min + i * step;
        const ratio = steps === 0 ? 0 : (i / steps);
        const x = Math.round(ratio * w);

        // Tick line
        const t = document.createElement('div');
        const isMajor = (i % majorEvery) === 0;
        t.className = 'tick' + (isMajor ? ' major' : '');
        t.style.left = x + 'px';

        if (position === 'top') {
            t.style.top = 'auto';
            t.style.bottom = '0';
        }

        // Clickable tick
        t.style.cursor = 'pointer';
        t.addEventListener('click', () => {
            input.value = val;
            render();
        });
        container.appendChild(t);

        // Labels only on bottom row
        if (position === 'bottom' && isMajor) {
            const lbl = document.createElement('div');
            lbl.className = 'tick-label';
            lbl.style.left = x + 'px';
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
    if (!wrap) return;

    const input = wrap.querySelector('input[type="range"]');
    const valueEl = wrap.querySelector('.value');
    const ticksBottom = wrap.querySelector('.ticks.bottom');
    const ticksTop = wrap.querySelector('.ticks.top');
    if (!input || !valueEl) return;

    const min = Number(input.min);
    const max = Number(input.max);
    const step = Number(input.step);
    const majorEvery = options.majorEvery || 2;

    let trackWidth = 0;

    function measure() {
        // Use the input’s rendered width as the track width proxy
        trackWidth = Math.round(input.getBoundingClientRect().width);
    }

    function render() {
        const val = Number(input.value);
        valueEl.textContent = formatValue(val, unit);
        setProgressCSS(input, trackWidth);
        updateAria(input, unit);
    }

    function rebuildTicks() {
        buildTicks(ticksBottom, min, max, step, majorEvery, unit, input, render, 'bottom');
        buildTicks(ticksTop, min, max, step, majorEvery, unit, input, render, 'top');
    }

    // Events
    input.addEventListener('input', render);
    input.addEventListener('change', render);

    // Keyboard support
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

    // Handle resizes for perfect alignment
    const resizeHandler = () => { measure(); rebuildTicks(); render(); };
    window.addEventListener('resize', resizeHandler);

    // Initial paint
    measure();
    rebuildTicks();
    render();
}

// Initialize sliders
initSlider('volume-wrap', '%', { majorEvery: 2 }); // labels every 20%
initSlider('font-wrap', 'px', { majorEvery: 2 });  // labels every 4px
