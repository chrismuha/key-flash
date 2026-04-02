export function createFlashController(state, flashLayer) {
  function getNextColor() {
    const colors = state.settings.colors.length ? state.settings.colors : ['#ffffff'];
    const color = colors[state.colorIndex % colors.length];
    state.colorIndex += 1;
    return color;
  }

  function performFlash(colorOverride) {
    const color = colorOverride || getNextColor();
    const duration = Math.max(20, state.settings.flashDurationMs);
    const opacity = Math.max(0.1, Math.min(1, state.settings.flashOpacity));

    state.lastFlashAt = Date.now();

    flashLayer.style.transition = 'none';
    flashLayer.style.background = color;
    flashLayer.style.opacity = String(opacity);

    requestAnimationFrame(() => {
      flashLayer.style.transition = `opacity ${duration}ms linear`;
      setTimeout(() => {
        flashLayer.style.opacity = '0';
      }, 16);
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

  return {
    scheduleFlash,
    previewFlash(color) {
      performFlash(color);
    }
  };
}
