function clamp(val, min, max) {
    return Math.min(max, Math.max(min, val));
}

function roundToStep(val, step, min) {
    const offset = val - min;
    return Math.round(offset / step) * step + min;
}

function formatValue(val, unit) {
    // show up to 2 decimals, trim trailing zeros
    const s = Number(val).toFixed(2).replace(/\.?0+$/, '');
    return unit === '%' ? `${s}%` : `${s}${unit}`;
}

function updateAria(input, unit) {
    input.setAttribute('aria-valuenow', input.value);
    const vt = unit === '%'
        ? `${input.value} percent`
        : `${input.value} ${unit === 'px' ? 'pixels' : unit}`;
    input.setAttribute('aria-valuetext', vt);
}

// Helper: read --thumb-size (px) from the input
function getThumbSizePx(input) {
    const cs = getComputedStyle(input);
    const v = cs.getPropertyValue('--thumb-size') || '0';
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : 0;
}

// Paint WebKit progress width to the *thumb center* (px)
function setProgressCSS(input, trackWidth) {
    const min = Number(input.min || 0);
    const max = Number(input.max || 100);
    const val = Number(input.value);
    const ratio = (val - min) / (max - min);

    const thumb = getThumbSizePx(input);
    const eff = Math.max(0, trackWidth - thumb);
    const centerPx = eff * ratio + thumb / 2;

    input.style.setProperty('--_progress', (ratio * 100) + '%');
    input.style.setProperty('--_progress_px', centerPx + 'px');
}

function buildTicks(container, min, max, step, majorEvery, unit, input, render, position, trackWidth) {
    if (!container) return;
    container.innerHTML = '';

    const steps = Math.round((max - min) / step);
    const thumb = getThumbSizePx(input);
    const eff = Math.max(0, trackWidth - thumb);

    for (let i = 0; i <= steps; i++) {
        const val = min + i * step;
        const ratio = steps === 0 ? 0 : (i / steps);
        const x = eff * ratio + thumb / 2; // center of thumb, no rounding

        const t = document.createElement('div');
        const isMajor = (i % majorEvery) === 0;
        t.className = 'tick' + (isMajor ? ' major' : '');
        t.style.left = x + 'px';

        if (position === 'top') {
            t.style.top = 'auto';
            t.style.bottom = '0';
        }

        // Clicking a tick snaps to the discrete step
        t.addEventListener('click', () => {
            input.value = val;
            render();
            input.dispatchEvent(new Event('input', { bubbles: true }));
        });
        container.appendChild(t);

        // Labels - bottom row
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
                input.dispatchEvent(new Event('input', { bubbles: true }));
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

    // preserve original step for keyboard/ticks; allow override
    const originalStep = input.step === 'any' ? NaN : Number(input.step);
    const discreteStep = Number.isFinite(originalStep)
        ? originalStep
        : Number(options.discreteStep || 1);

    // Enable free (non-snapped) dragging
    input.step = 'any';

    const majorEvery = options.majorEvery || 2;

    let trackWidth = 0;

    function measure() {
        // match the exact box the track paints into
        trackWidth = input.getBoundingClientRect().width;
    }

    function render() {
        const val = Number(input.value);
        valueEl.textContent = formatValue(val, unit);
        setProgressCSS(input, trackWidth);
        updateAria(input, unit);
    }

    function rebuildTicks() {
        buildTicks(ticksBottom, min, max, discreteStep, majorEvery, unit, input, render, 'bottom', trackWidth);
        buildTicks(ticksTop, min, max, discreteStep, majorEvery, unit, input, render, 'top', trackWidth);
    }

    // Pointer/drag: free movement (no snapping)
    input.addEventListener('input', render);
    input.addEventListener('change', render);

    // Keyboard: snap to discrete steps
    input.addEventListener('keydown', (e) => {
        let val = Number(input.value);
        const page = (max - min) / 10;
        if (e.key === 'ArrowLeft') { val -= discreteStep; e.preventDefault(); }
        else if (e.key === 'ArrowRight') { val += discreteStep; e.preventDefault(); }
        else if (e.key === 'PageDown') { val -= page; e.preventDefault(); }
        else if (e.key === 'PageUp') { val += page; e.preventDefault(); }
        else if (e.key === 'Home') { val = min; e.preventDefault(); }
        else if (e.key === 'End') { val = max; e.preventDefault(); }
        val = roundToStep(val, discreteStep, min);
        input.value = String(clamp(val, min, max));
        render();
        input.dispatchEvent(new Event('input', { bubbles: true }));
    });

    // Resize -> recompute exact pixel positions
    const resizeHandler = () => { measure(); rebuildTicks(); render(); };
    window.addEventListener('resize', resizeHandler);

    // Initial paint
    measure();
    rebuildTicks();
    render();
}

// Initialize sliders
initSlider('volume-wrap', '%', { majorEvery: 2, discreteStep: 10 }); // drag free, ticks at 0/10/20...
initSlider('font-wrap', 'px', { majorEvery: 2, discreteStep: 2 });  // drag free, ticks at 10/12/14...
