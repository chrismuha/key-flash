import './style.css';
import { createState, DEFAULTS } from './components/state.js';
import { loadSettings, saveSettings, getNormalizedSettings, parseColors } from './components/settings.js';
import { createFlashController } from './components/flash.js';
import { setupKeyboard } from './components/keyboard.js';
import { renderApp } from './components/ui.js';

const state = createState();
const HEX_COLOR_PATTERN = /^#([0-9a-f]{6}|[0-9a-f]{3})$/i;

async function init() {
  const ui = renderApp();
  let isChromeHidden = false;
  state.settings = await loadSettings(window.keyFlashAPI);
  ui.setFormValues(state.settings);
  ui.renderPressedKeys([]);
  ui.setFullscreenState(false);
  ui.setChromeHidden(false);

  const flash = createFlashController(state, ui.refs.flashLayer);

  const syncPreviewFromInputs = () => {
    const draft = getNormalizedSettings(ui.getFormValues());
    ui.updateValueLabels(draft);
    ui.renderPalette(parseColors(ui.refs.colorsInput.value).length ? parseColors(ui.refs.colorsInput.value) : DEFAULTS.colors);
  };

  ui.refs.flashDelayMs.addEventListener('input', syncPreviewFromInputs);
  ui.refs.minTimeBetweenFlashesMs.addEventListener('input', syncPreviewFromInputs);
  ui.refs.flashDurationMs.addEventListener('input', syncPreviewFromInputs);
  ui.refs.colorOrder.addEventListener('change', syncPreviewFromInputs);
  ui.refs.flashOpacity.addEventListener('input', syncPreviewFromInputs);
  ui.refs.colorsInput.addEventListener('input', syncPreviewFromInputs);

  function appendHexColor() {
    const rawValue = ui.refs.hexColorInput.value.trim();
    const nextColor = rawValue.startsWith('#') ? rawValue : `#${rawValue}`;
    if (!HEX_COLOR_PATTERN.test(nextColor)) {
      ui.refs.hexColorInput.value = nextColor;
      ui.refs.hexColorInput.focus();
      ui.refs.hexColorInput.select();
      return;
    }

    ui.appendHexColor(nextColor.toLowerCase());
    syncPreviewFromInputs();
    ui.refs.hexColorInput.focus();
  }

  ui.refs.addColorBtn.addEventListener('click', appendHexColor);
  ui.refs.hexColorInput.addEventListener('input', () => {
    const value = ui.refs.hexColorInput.value.trim();
    if (!value) return;
    if (!value.startsWith('#')) {
      ui.refs.hexColorInput.value = `#${value.replace(/^#+/, '')}`;
    }
  });
  ui.refs.hexColorInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      appendHexColor();
    }
  });

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

  function setChromeHidden(nextValue) {
    isChromeHidden = Boolean(nextValue);
    ui.setChromeHidden(isChromeHidden);
  }

  function toggleChrome() {
    setChromeHidden(!isChromeHidden);
  }

  function revealChrome() {
    if (!isChromeHidden) return;
    setChromeHidden(false);
  }

  ui.refs.fullscreenBtn.addEventListener('click', toggleFullscreen);
  ui.refs.hideUiBtn.addEventListener('click', toggleChrome);
  ui.refs.showUiBtn.addEventListener('click', revealChrome);

  setupKeyboard(state, {
    onNewKey: () => flash.scheduleFlash(),
    onKeysChanged: (keys) => ui.renderPressedKeys(keys),
    onToggleFullscreen: toggleFullscreen,
    onToggleUi: toggleChrome,
    onRevealUi: revealChrome
  });
}

init();
