export function setupKeyboard(state, { onNewKey, onKeysChanged, onToggleFullscreen }) {
  function keyLabel(event) {
    if (event.key === ' ') return 'Space';
    if (event.key.length === 1) return event.key.toUpperCase();
    return event.key;
  }

  window.addEventListener('keydown', (event) => {
    if (event.key === 'F11') {
      event.preventDefault();
      onToggleFullscreen?.();
      return;
    }

    const label = keyLabel(event);
    const alreadyHeld = state.pressedKeys.has(label);
    state.pressedKeys.add(label);
    onKeysChanged?.([...state.pressedKeys]);

    if (!alreadyHeld) {
      onNewKey?.();
    }
  });

  window.addEventListener('keyup', (event) => {
    const label = keyLabel(event);
    state.pressedKeys.delete(label);
    onKeysChanged?.([...state.pressedKeys]);
  });

  window.addEventListener('blur', () => {
    state.pressedKeys.clear();
    onKeysChanged?.([]);
  });
}
