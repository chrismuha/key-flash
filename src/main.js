import './style.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { createState, DEFAULTS } from './components/state.js';
import { loadSettings, saveSettings, getNormalizedSettings, parseColors } from './components/settings.js';
import { createFlashController } from './components/flash.js';
import { setupKeyboard } from './components/keyboard.js';
import { renderApp } from './components/ui.js';

const state = createState();
const HEX_COLOR_PATTERN = /^#([0-9a-f]{6}|[0-9a-f]{3})$/i;

async function init() {
  const ui = renderApp();
  let isSettingsOpen = false;
  let isKeyTesterMode = false;
  let activeContext = 'home';
  let activeTab = 'play';
  state.settings = await loadSettings(window.keyFlashAPI);
  ui.setFormValues(state.settings);
  ui.renderPressedKeys([]);
  ui.setFullscreenState(false);
  ui.setSettingsOpen(false);
  ui.setAppContext(activeContext);
  ui.setActiveTab(activeTab);

  const flash = createFlashController(state, ui.refs.flashLayer);

  const syncPreviewFromInputs = () => {
    const draft = getNormalizedSettings(ui.getFormValues());
    state.settings = { ...state.settings, ...draft };
    ui.updateValueLabels(draft);
    ui.setDisplayOptions(draft);
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
    flash.previewFlash();
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

  function syncDisplayFromInputs() {
    const draft = getNormalizedSettings(ui.getFormValues());
    state.settings = { ...state.settings, ...draft };
    ui.setDisplayOptions(state.settings);
  }

  function setSettingsOpen(nextValue) {
    isSettingsOpen = Boolean(nextValue);
    ui.setSettingsOpen(isSettingsOpen);
  }

  function toggleSettings() {
    setSettingsOpen(!isSettingsOpen);
  }

  function toggleFocusMode() {
    if (activeTab !== 'play') return;
    ui.refs.focusMode.checked = !ui.refs.focusMode.checked;
    syncDisplayFromInputs();
  }

  function revealSettings() {
    setSettingsOpen(true);
  }

  function setKeyTesterInfoOpen(nextValue) {
    ui.setKeyTesterInfoOpen(Boolean(nextValue));
  }

  function setKeyTesterMode(nextValue) {
    isKeyTesterMode = Boolean(nextValue);
    ui.setKeyTesterMode(isKeyTesterMode);
    if (isKeyTesterMode) {
      state.pressedKeys.clear();
      ui.renderPressedKeys([]);
      flash.stopHeldFlashLoop();
    }
  }

  function setAppContext(nextContext) {
    activeContext = nextContext;
    ui.setAppContext(activeContext);
    setSettingsOpen(false);
    if (activeContext === 'home') {
      setKeyTesterMode(false);
      return;
    }
    setActiveTab(activeTab);
  }

  function setActiveTab(nextTab) {
    activeTab = nextTab;
    ui.setActiveTab(activeTab);
    setKeyTesterMode(activeContext === 'app' && activeTab === 'tester');
  }

  function restorePlayScreen() {
    state.settings = {
      ...state.settings,
      focusMode: false,
      showHero: true
    };
    ui.refs.focusMode.checked = false;
    ui.refs.showHero.checked = true;
    ui.setDisplayOptions(state.settings);
  }

  function goToMainScreen() {
    activeTab = 'play';
    setKeyTesterInfoOpen(false);
    setSettingsOpen(false);
    setKeyTesterMode(false);
    state.pressedKeys.clear();
    ui.renderPressedKeys([]);
    flash.stopHeldFlashLoop();
    ui.setActiveTab(activeTab);
    setAppContext('home');
  }

  ui.refs.playContextBtn.addEventListener('click', () => {
    activeTab = 'play';
    restorePlayScreen();
    setAppContext('app');
  });
  ui.refs.diagnoseContextBtn.addEventListener('click', () => {
    activeTab = 'tester';
    setSettingsOpen(false);
    setAppContext('app');
  });
  ui.refs.homeTabBtn.addEventListener('click', goToMainScreen);
  ui.refs.mainScreenBtn.addEventListener('click', goToMainScreen);
  ui.refs.testerMainScreenBtn.addEventListener('click', goToMainScreen);
  ui.refs.playTabBtn.addEventListener('click', () => setActiveTab('play'));
  ui.refs.testerTabBtn.addEventListener('click', () => setActiveTab('tester'));
  ui.refs.fullscreenBtn.addEventListener('click', toggleFullscreen);
  ui.refs.hideUiBtn.addEventListener('click', toggleFocusMode);
  ui.refs.settingsBtn.addEventListener('click', toggleSettings);
  ui.refs.keyTesterInfoBtn.addEventListener('click', () => setKeyTesterInfoOpen(true));
  ui.refs.closeKeyTesterInfoBtn.addEventListener('click', () => setKeyTesterInfoOpen(false));
  ui.refs.focusMode.addEventListener('change', syncDisplayFromInputs);
  ui.refs.showHero.addEventListener('change', syncDisplayFromInputs);
  ui.refs.hideStatus.addEventListener('change', syncDisplayFromInputs);
  ui.refs.closeSettingsOnOutsideClick.addEventListener('change', syncDisplayFromInputs);

  document.addEventListener('pointerdown', (event) => {
    if (!isSettingsOpen || !state.settings.closeSettingsOnOutsideClick) return;
    const target = event.target;
    if (!(target instanceof Node)) return;
    if (!ui.refs.keyTesterInfoOverlay.hidden && ui.refs.keyTesterInfoOverlay === target) {
      setKeyTesterInfoOpen(false);
      return;
    }
    if (ui.refs.settingsPanel.contains(target) || ui.refs.settingsBtn.contains(target)) return;
    setSettingsOpen(false);
  });

  window.addEventListener('keydown', (event) => {
    if (!isKeyTesterMode) return;
    ui.renderKeyTest(event);
  }, true);

  setupKeyboard(state, {
    onNewKey: () => {
      if (activeContext === 'app' && activeTab === 'play') flash.scheduleFlash();
    },
    onHeldKeysActive: () => {
      if (activeContext === 'app' && activeTab === 'play') flash.startHeldFlashLoop();
    },
    onHeldKeysInactive: () => flash.stopHeldFlashLoop(),
    onKeysChanged: (keys) => ui.renderPressedKeys(keys),
    onToggleFullscreen: toggleFullscreen,
    onToggleUi: toggleFocusMode,
    onRevealUi: revealSettings
  });
}

init();
