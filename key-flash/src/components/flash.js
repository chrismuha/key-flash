
export function createFlashController(state, el) {
  function flash() {
    const c = state.settings.colors[state.i++ % state.settings.colors.length];
    el.style.background = c;
    el.style.opacity = '1';
    setTimeout(()=> el.style.opacity='0', state.settings.flashDurationMs);
    state.last = Date.now();
  }

  function schedule() {
    const delay = state.settings.flashDelayMs;
    setTimeout(flash, delay);
  }

  return { schedule };
}
