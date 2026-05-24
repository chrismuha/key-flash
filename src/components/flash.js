export function createFlashController(state, flashLayer) {
  let heldFlashLoop = null;
  let fadeFrame = null;
  let fadeTimer = null;
  const heldFlashStartDelay = 3000;

  function getNextColor() {
    const colors = state.settings.colors.length ? state.settings.colors : ['#ffffff'];
    if (state.settings.colorOrder === 'random') {
      return colors[Math.floor(Math.random() * colors.length)];
    }

    const color = colors[state.colorIndex % colors.length];
    state.colorIndex += 1;
    return color;
  }

  function performFlash(colorOverride) {
    const color = colorOverride || getNextColor();
    const duration = Math.max(20, state.settings.flashDurationMs);
    const opacity = Math.max(0.1, Math.min(1, state.settings.flashOpacity));

    state.lastFlashAt = Date.now();

    if (fadeFrame !== null) {
      cancelAnimationFrame(fadeFrame);
      fadeFrame = null;
    }
    if (fadeTimer !== null) {
      clearTimeout(fadeTimer);
      fadeTimer = null;
    }

    flashLayer.style.transition = 'none';
    flashLayer.style.background = color;
    flashLayer.style.opacity = String(opacity);
    flashLayer.getBoundingClientRect();

    fadeFrame = requestAnimationFrame(() => {
      fadeFrame = null;
      fadeTimer = setTimeout(() => {
        fadeTimer = null;
        flashLayer.style.transition = `opacity ${duration}ms linear`;
        flashLayer.style.opacity = '0';
      }, 32);
    });
  }

  function scheduleFlash() {
    const now = Date.now();
    const waitForGap = Math.max(
      0,
      state.settings.minTimeBetweenFlashesMs - (now - state.lastFlashAt)
    );

    const totalDelay = state.settings.flashDelayMs + waitForGap;

    if (state.queuedFlash) {
      clearTimeout(state.queuedFlash);
    }

    state.queuedFlash = setTimeout(() => {
      performFlash();
      state.queuedFlash = null;
    }, totalDelay);
  }

  function stopHeldFlashLoop() {
    if (!heldFlashLoop) return;
    clearTimeout(heldFlashLoop);
    heldFlashLoop = null;
  }

  function runHeldFlashLoop() {
    stopHeldFlashLoop();

    if (!state.pressedKeys.size) {
      return;
    }

    const gap = Math.max(0, state.settings.minTimeBetweenFlashesMs);
    const delay = Math.max(0, state.settings.flashDelayMs);
    const repeatDelay = Math.max(20, gap + delay);

    scheduleFlash();

    heldFlashLoop = setTimeout(() => {
      heldFlashLoop = null;
      if (!state.pressedKeys.size) return;
      runHeldFlashLoop();
    }, repeatDelay);
  }

  return {
    scheduleFlash,
    startHeldFlashLoop() {
      stopHeldFlashLoop();
      heldFlashLoop = setTimeout(() => {
        heldFlashLoop = null;
        runHeldFlashLoop();
      }, heldFlashStartDelay);
    },
    stopHeldFlashLoop,
    previewFlash(color) {
      performFlash(color);
    }
  };
}
