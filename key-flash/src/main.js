import './style.css';
import { createState, DEFAULTS } from './components/state.js';
import { loadSettings, saveSettings, getNormalizedSettings, parseColors } from './components/settings.js';
import { createFlashController } from './components/flash.js';
import { setupKeyboard } from './components/keyboard.js';
import { renderApp } from './components/ui.js';

const state = createState();

async function init() {
  const ui = renderApp();
  state.settings = await loadSettings(window.keyFlashAPI);
  ui.setFormValues(state.settings);
  ui.renderPressedKeys([]);
  ui.setFullscreenState(false);

  const flash = createFlashController(state, ui.refs.flashLayer);

  const syncPreviewFromInputs = () => {
    const draft = getNormalizedSettings(ui.getFormValues());
    ui.updateValueLabels(draft);
    ui.renderPalette(parseColors(ui.refs.colorsInput.value).length ? parseColors(ui.refs.colorsInput.value) : DEFAULTS.colors);
  };

  ui.refs.flashDelayMs.addEventListener('input', syncPreviewFromInputs);
  ui.refs.minTimeBetweenFlashesMs.addEventListener('input', syncPreviewFromInputs);
  ui.refs.flashDurationMs.addEventListener('input', syncPreviewFromInputs);
  ui.refs.flashOpacity.addEventListener('input', syncPreviewFromInputs);
  ui.refs.colorsInput.addEventListener('input', syncPreviewFromInputs);

  ui.refs.previewBtn.addEventListener('click', () => {
    const draft = getNormalizedSettings(ui.getFormValues());
    state.settings = { ...draft };
    flash.previewFlash(draft.colors[0]);
  });

  ui.refs.saveBtn.addEventListener('click', async () => {
    const next = getNormalizedSettings(ui.getFormValues());
    state.settings = await saveSettings(window.keyFlashAPI, next);
    ui.setFormValues(state.settings);
  });

  ui.refs.resetBtn.addEventListener('click', async () => {
    state.settings = await saveSettings(window.keyFlashAPI, { ...DEFAULTS });
    ui.setFormValues(state.settings);
  });

  async function toggleFullscreen() {
    state.isFullscreen = await window.keyFlashAPI.toggleFullscreen();
    ui.setFullscreenState(state.isFullscreen);
  }

  ui.refs.fullscreenBtn.addEventListener('click', toggleFullscreen);

  setupKeyboard(state, {
    onNewKey: () => flash.scheduleFlash(),
    onKeysChanged: (keys) => ui.renderPressedKeys(keys),
    onToggleFullscreen: toggleFullscreen
  });
}

init();
