export function setupKeyboard(state, { onNewKey, onKeysChanged, onToggleFullscreen, onToggleUi, onRevealUi }) {
  function keyLabel(event) {
    if (event.key === ' ') return 'Space';
    if (event.key.length === 1) return event.key.toUpperCase();
    return event.key;
  }

  function isEditableTarget(target) {
    if (!(target instanceof HTMLElement)) return false;
    if (target.isContentEditable) return true;
    const tagName = target.tagName;
    return tagName === 'INPUT' || tagName === 'TEXTAREA' || tagName === 'SELECT';
  }

  window.addEventListener('keydown', (event) => {
    if (event.key === 'F11') {
      event.preventDefault();
      onToggleFullscreen?.();
      return;
    }

    if (!isEditableTarget(event.target) && event.ctrlKey && !event.metaKey && !event.altKey && event.key.toLowerCase() === 'h') {
      event.preventDefault();
      onToggleUi?.();
      return;
    }

    if (event.key === 'Escape') {
      onRevealUi?.();
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
