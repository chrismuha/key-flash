function colorSwatchMarkup(color) {
  return `
    <span class="swatch-badge">
      <span class="swatch-color" style="background:${color}"></span>
      <span>${escapeHtml(color)}</span>
    </span>
  `;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function renderApp() {
  document.querySelector('#app').innerHTML = `
    <div class="app-shell">
      <div id="flashLayer" class="flash-layer"></div>
      <button id="settingsBtn" class="settings-btn" type="button" aria-expanded="false" title="Settings">Settings</button>

      <div id="chrome" class="chrome">
        <div id="heroSection" class="hero">
          <div class="hero-card glass">
            <div class="eyebrow">Keyboard reactive screen flasher</div>
            <h1>KeyFlash Pro</h1>
            <p class="hero-copy">
              Press any key and the screen flashes through your chosen color set.
            </p>
            <div class="hero-actions">
              <button id="previewBtn" class="primary-btn">Preview flash</button>
              <button id="fullscreenBtn" class="secondary-btn">Toggle fullscreen</button>
              <button id="hideUiBtn" class="ghost-btn" type="button">Focus mode</button>
            </div>
          </div>
        </div>

        <div class="layout">
          <section id="settingsPanel" class="panel glass settings-panel">
            <div class="panel-header">
              <h2>Settings</h2>
              <span class="hint">Changes save locally</span>
            </div>

            <div class="display-options">
              <label class="switch-row">
                <input id="focusMode" type="checkbox" />
                <span>Focus mode</span>
              </label>
              <label class="switch-row">
                <input id="showHero" type="checkbox" />
                <span>Show welcome panel</span>
              </label>
              <label class="switch-row">
                <input id="showSettingsPanel" type="checkbox" />
                <span>Show settings panel</span>
              </label>
              <label class="switch-row">
                <input id="showStatusPanel" type="checkbox" />
                <span>Show status panel</span>
              </label>
              <label class="switch-row">
                <input id="closeSettingsOnOutsideClick" type="checkbox" />
                <span>Click outside closes Settings</span>
              </label>
            </div>

            <div class="field">
              <div class="field-row">
                <label for="flashDelayMs">Delay before flash</label>
                <span id="flashDelayMsValue" class="value-pill">0 ms</span>
              </div>
              <input id="flashDelayMs" type="range" min="0" max="1000" step="10" />
            </div>

            <div class="field">
              <div class="field-row">
                <label for="minTimeBetweenFlashesMs">Minimum time between flashes</label>
                <span id="minTimeBetweenFlashesMsValue" class="value-pill">120 ms</span>
              </div>
              <input id="minTimeBetweenFlashesMs" type="range" min="0" max="1000" step="10" />
            </div>

          <div class="field">
            <div class="field-row">
              <label for="flashDurationMs">Flash duration</label>
              <span id="flashDurationMsValue" class="value-pill">160 ms</span>
            </div>
            <input id="flashDurationMs" type="range" min="20" max="1200" step="10" />
          </div>

            <div class="field">
              <label for="colorOrder">Color order</label>
              <select id="colorOrder">
                <option value="sequence">Cycle in order</option>
                <option value="random">Random each flash</option>
              </select>
            </div>

            <div class="field">
              <div class="field-row">
                <label for="flashOpacity">Flash strength</label>
                <span id="flashOpacityValue" class="value-pill">100%</span>
              </div>
              <input id="flashOpacity" type="range" min="0.1" max="1" step="0.05" />
            </div>

            <div class="field">
              <label for="colorsInput">Colors</label>
              <div class="add-color-row">
                <input id="hexColorInput" type="text" inputmode="text" placeholder="#ff00aa" maxlength="7" />
                <button id="addColorBtn" class="secondary-btn" type="button">Add hex</button>
              </div>
              <textarea id="colorsInput" placeholder="#ff0000, #00ff00, #0000ff"></textarea>
              <div id="palettePreview" class="palette"></div>
            </div>

            <label class="check-row">
              <input id="fullscreenOnLaunch" type="checkbox" />
              <span>Start maximized on launch</span>
            </label>

            <div class="button-row">
              <button id="saveBtn" class="primary-btn">Save settings</button>
              <button id="resetBtn" class="secondary-btn">Reset rainbow</button>
            </div>
          </section>

          <aside id="statusPanel" class="panel glass status-panel">
            <div class="panel-header">
              <h2>Status</h2>
              <span class="hint">Live activity</span>
            </div>

            <div class="metric-grid">
              <div class="metric-card">
                <div class="metric-label">Fullscreen</div>
                <div id="fullscreenStatus" class="metric-value">Off</div>
              </div>
              <div class="metric-card">
                <div class="metric-label">Active keys</div>
                <div id="activeKeyCount" class="metric-value">0</div>
              </div>
            </div>

            <div class="field active-keys-field">
              <label>Keys currently held</label>
              <div id="keyList" class="key-list">
                <span class="empty">None</span>
              </div>
            </div>

            <div class="field tips-field">
              <label>Tips</label>
              <div class="tips">
                <div class="tip">F11 toggles fullscreen</div>
                <div class="tip">Ctrl+H hides or shows the controls</div>
                <div class="tip">Escape brings the controls back</div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  `;

  const refs = {
    flashLayer: document.getElementById('flashLayer'),
    chrome: document.getElementById('chrome'),
    heroSection: document.getElementById('heroSection'),
    settingsPanel: document.getElementById('settingsPanel'),
    statusPanel: document.getElementById('statusPanel'),
    settingsBtn: document.getElementById('settingsBtn'),
    previewBtn: document.getElementById('previewBtn'),
    fullscreenBtn: document.getElementById('fullscreenBtn'),
    hideUiBtn: document.getElementById('hideUiBtn'),
    saveBtn: document.getElementById('saveBtn'),
    resetBtn: document.getElementById('resetBtn'),
    addColorBtn: document.getElementById('addColorBtn'),
    hexColorInput: document.getElementById('hexColorInput'),
    palettePreview: document.getElementById('palettePreview'),
    keyList: document.getElementById('keyList'),
    activeKeyCount: document.getElementById('activeKeyCount'),
    fullscreenStatus: document.getElementById('fullscreenStatus'),
    flashDelayMs: document.getElementById('flashDelayMs'),
    minTimeBetweenFlashesMs: document.getElementById('minTimeBetweenFlashesMs'),
    flashDurationMs: document.getElementById('flashDurationMs'),
    colorOrder: document.getElementById('colorOrder'),
    flashOpacity: document.getElementById('flashOpacity'),
    colorsInput: document.getElementById('colorsInput'),
    fullscreenOnLaunch: document.getElementById('fullscreenOnLaunch'),
    focusMode: document.getElementById('focusMode'),
    showHero: document.getElementById('showHero'),
    showSettingsPanel: document.getElementById('showSettingsPanel'),
    showStatusPanel: document.getElementById('showStatusPanel'),
    closeSettingsOnOutsideClick: document.getElementById('closeSettingsOnOutsideClick'),
    flashDelayMsValue: document.getElementById('flashDelayMsValue'),
    minTimeBetweenFlashesMsValue: document.getElementById('minTimeBetweenFlashesMsValue'),
    flashDurationMsValue: document.getElementById('flashDurationMsValue'),
    flashOpacityValue: document.getElementById('flashOpacityValue')
  };

  return {
    refs,
    setFormValues(settings) {
      refs.flashDelayMs.value = settings.flashDelayMs;
      refs.minTimeBetweenFlashesMs.value = settings.minTimeBetweenFlashesMs;
      refs.flashDurationMs.value = settings.flashDurationMs;
      refs.colorOrder.value = settings.colorOrder;
      refs.flashOpacity.value = settings.flashOpacity;
      refs.colorsInput.value = settings.colors.join(', ');
      refs.fullscreenOnLaunch.checked = Boolean(settings.fullscreenOnLaunch);
      refs.focusMode.checked = Boolean(settings.focusMode);
      refs.showHero.checked = settings.showHero !== false;
      refs.showSettingsPanel.checked = settings.showSettingsPanel !== false;
      refs.showStatusPanel.checked = settings.showStatusPanel !== false;
      refs.closeSettingsOnOutsideClick.checked = settings.closeSettingsOnOutsideClick !== false;
      this.updateValueLabels(settings);
      this.renderPalette(settings.colors);
      this.setDisplayOptions(settings);
    },
    getFormValues() {
      return {
        flashDelayMs: refs.flashDelayMs.value,
        minTimeBetweenFlashesMs: refs.minTimeBetweenFlashesMs.value,
        flashDurationMs: refs.flashDurationMs.value,
        colorOrder: refs.colorOrder.value,
        flashOpacity: refs.flashOpacity.value,
        colorsText: refs.colorsInput.value,
        fullscreenOnLaunch: refs.fullscreenOnLaunch.checked,
        focusMode: refs.focusMode.checked,
        showHero: refs.showHero.checked,
        showSettingsPanel: refs.showSettingsPanel.checked,
        showStatusPanel: refs.showStatusPanel.checked,
        closeSettingsOnOutsideClick: refs.closeSettingsOnOutsideClick.checked
      };
    },
    updateValueLabels(values) {
      refs.flashDelayMsValue.textContent = `${Math.round(Number(values.flashDelayMs))} ms`;
      refs.minTimeBetweenFlashesMsValue.textContent = `${Math.round(Number(values.minTimeBetweenFlashesMs))} ms`;
      refs.flashDurationMsValue.textContent = `${Math.round(Number(values.flashDurationMs))} ms`;
      refs.flashOpacityValue.textContent = `${Math.round(Number(values.flashOpacity) * 100)}%`;
    },
    renderPalette(colors) {
      if (!colors?.length) {
        refs.palettePreview.innerHTML = '<span class="empty">No colors</span>';
        return;
      }
      refs.palettePreview.innerHTML = colors.map(colorSwatchMarkup).join('');
    },
    renderPressedKeys(keys) {
      refs.activeKeyCount.textContent = String(keys.length);
      if (!keys.length) {
        refs.keyList.innerHTML = '<span class="empty">None</span>';
        return;
      }
      refs.keyList.innerHTML = keys.map((key) => `<span class="key-badge">${escapeHtml(key)}</span>`).join('');
    },
    setFullscreenState(isFullscreen) {
      refs.fullscreenStatus.textContent = isFullscreen ? 'On' : 'Off';
    },
    appendHexColor(color) {
      const existing = refs.colorsInput.value.trim();
      refs.colorsInput.value = existing ? `${existing}, ${color}` : color;
      refs.hexColorInput.value = '';
    },
    setSettingsOpen(isOpen) {
      document.body.classList.toggle('settings-open', isOpen);
      refs.settingsBtn.setAttribute('aria-expanded', String(isOpen));
    },
    setDisplayOptions(settings) {
      document.body.classList.toggle('focus-mode', Boolean(settings.focusMode));
      document.body.classList.toggle('hide-hero', settings.showHero === false);
      document.body.classList.toggle('hide-settings-panel', settings.showSettingsPanel === false);
      document.body.classList.toggle('hide-status-panel', settings.showStatusPanel === false);
      refs.hideUiBtn.textContent = settings.focusMode ? 'Show panels' : 'Focus mode';
    }
  };
}
