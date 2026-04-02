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
      <button id="showUiBtn" class="show-ui-btn" type="button" hidden>Show controls</button>

      <div id="chrome" class="chrome">
        <div class="hero">
          <div class="hero-card glass">
            <div class="eyebrow">Keyboard reactive screen flasher</div>
            <h1>KeyFlash Pro</h1>
            <p class="hero-copy">
              Press any key and the screen flashes through your chosen color set. Includes live preview, sliders, fullscreen mode, and saved settings.
            </p>
            <div class="hero-actions">
              <button id="previewBtn" class="primary-btn">Preview flash</button>
              <button id="fullscreenBtn" class="secondary-btn">Toggle fullscreen</button>
              <button id="hideUiBtn" class="ghost-btn" type="button">Hide controls</button>
            </div>
          </div>
        </div>

        <div class="layout">
          <section class="panel glass">
            <div class="panel-header">
              <h2>Settings</h2>
              <span class="hint">Changes save locally</span>
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
              <div class="field-row">
                <label for="flashOpacity">Flash strength</label>
                <span id="flashOpacityValue" class="value-pill">100%</span>
              </div>
              <input id="flashOpacity" type="range" min="0.1" max="1" step="0.05" />
            </div>

            <div class="field">
              <label for="colorsInput">Colors</label>
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

          <aside class="panel glass">
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

            <div class="field">
              <label>Keys currently held</label>
              <div id="keyList" class="key-list">
                <span class="empty">None</span>
              </div>
            </div>

            <div class="field">
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
    previewBtn: document.getElementById('previewBtn'),
    fullscreenBtn: document.getElementById('fullscreenBtn'),
    hideUiBtn: document.getElementById('hideUiBtn'),
    showUiBtn: document.getElementById('showUiBtn'),
    saveBtn: document.getElementById('saveBtn'),
    resetBtn: document.getElementById('resetBtn'),
    palettePreview: document.getElementById('palettePreview'),
    keyList: document.getElementById('keyList'),
    activeKeyCount: document.getElementById('activeKeyCount'),
    fullscreenStatus: document.getElementById('fullscreenStatus'),
    flashDelayMs: document.getElementById('flashDelayMs'),
    minTimeBetweenFlashesMs: document.getElementById('minTimeBetweenFlashesMs'),
    flashDurationMs: document.getElementById('flashDurationMs'),
    flashOpacity: document.getElementById('flashOpacity'),
    colorsInput: document.getElementById('colorsInput'),
    fullscreenOnLaunch: document.getElementById('fullscreenOnLaunch'),
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
      refs.flashOpacity.value = settings.flashOpacity;
      refs.colorsInput.value = settings.colors.join(', ');
      refs.fullscreenOnLaunch.checked = Boolean(settings.fullscreenOnLaunch);
      this.updateValueLabels(settings);
      this.renderPalette(settings.colors);
    },
    getFormValues() {
      return {
        flashDelayMs: refs.flashDelayMs.value,
        minTimeBetweenFlashesMs: refs.minTimeBetweenFlashesMs.value,
        flashDurationMs: refs.flashDurationMs.value,
        flashOpacity: refs.flashOpacity.value,
        colorsText: refs.colorsInput.value,
        fullscreenOnLaunch: refs.fullscreenOnLaunch.checked
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
    setChromeHidden(isHidden) {
      document.body.classList.toggle('chrome-hidden', isHidden);
      refs.showUiBtn.hidden = !isHidden;
      refs.hideUiBtn.textContent = isHidden ? 'Show controls' : 'Hide controls';
    }
  };
}
