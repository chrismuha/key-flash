
import { ui } from './components/ui.js';
import { createFlashController } from './components/flash.js';
import { setupKeyboard } from './components/keyboard.js';
import { load, save } from './components/settings.js';

const DEFAULTS = {
  flashDelayMs: 0,
  flashDurationMs: 140,
  colors: ['red','orange','yellow','green','blue','indigo','violet']
};

const state = {
  settings: DEFAULTS,
  keys: new Set(),
  i: 0,
  last: 0
};

async function init() {
  const UI = ui();
  state.settings = await load(window.keyFlashAPI, DEFAULTS);

  const flash = createFlashController(state, UI.flash);
  setupKeyboard(state, () => flash.schedule());

  UI.save.onclick = () => save(window.keyFlashAPI, state.settings);
}

init();
