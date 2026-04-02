
export function setupKeyboard(state, onKey) {
  window.addEventListener('keydown', e => {
    if (!state.keys.has(e.key)) {
      state.keys.add(e.key);
      onKey();
    }
  });
  window.addEventListener('keyup', e => state.keys.delete(e.key));
}
