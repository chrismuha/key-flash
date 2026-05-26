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
      <div id="keyTesterInfoOverlay" class="modal-overlay" hidden>
        <div class="modal-card glass" role="dialog" aria-modal="true" aria-labelledby="keyTesterInfoTitle">
          <div class="panel-header">
            <h2 id="keyTesterInfoTitle">Key tester info</h2>
            <button id="closeKeyTesterInfoBtn" class="secondary-btn compact-btn" type="button">Close</button>
          </div>
          <div class="info-list">
            <div><strong>Meta</strong><span>Command on Mac</span></div>
            <div><strong>Ctrl</strong><span>Control</span></div>
            <div><strong>Alt</strong><span>Option or Alt</span></div>
            <div><strong>Shift</strong><span>Shift</span></div>
            <div><strong>location 0</strong><span>standard key area</span></div>
            <div><strong>location 1</strong><span>left-side key</span></div>
            <div><strong>location 2</strong><span>right-side key</span></div>
            <div><strong>location 3</strong><span>numpad or keypad area</span></div>
          </div>
        </div>
      </div>

      <div id="chrome" class="chrome">
        <main id="homeView" class="home-view">
          <div class="home-heading">
            <h1>KeyFlash</h1>
            <h2>Select a context.</h2>
          </div>
          <div class="context-grid" aria-label="KeyFlash contexts">
            <button id="playContextBtn" class="context-card" type="button">
              <i class="bi bi-play-fill context-icon" aria-hidden="true"></i>
              <span class="context-title">Play</span>
              <span class="context-note">Open KeyFlash</span>
            </button>
            <button id="diagnoseContextBtn" class="context-card" type="button">
              <i class="bi bi-activity context-icon" aria-hidden="true"></i>
              <span class="context-title">Diagnose</span>
              <span class="context-note">Test keyboard input</span>
            </button>
          </div>
        </main>

        <main id="appView" class="app-view" hidden>
          <nav class="app-tabs" aria-label="KeyFlash sections">
            <button id="homeTabBtn" class="tab-btn main-screen-btn" type="button">Main Screen</button>
            <button id="playTabBtn" class="tab-btn active" type="button" aria-selected="true">Play</button>
            <button id="testerTabBtn" class="tab-btn" type="button" aria-selected="false">Diagnose</button>
          </nav>

          <section id="playPanel" class="tab-panel">
            <div id="heroSection" class="hero">
              <div class="hero-card glass">
                <div class="eyebrow">Keyboard reactive screen flasher</div>
                <h1>KeyFlash</h1>
                <p class="hero-copy">
                  Press any key and the screen flashes through your chosen color set.
                </p>
                <div class="hero-actions">
                  <button id="previewBtn" class="primary-btn">Preview flash</button>
                  <button id="fullscreenBtn" class="secondary-btn">Toggle fullscreen</button>
                  <button id="hideUiBtn" class="ghost-btn" type="button">Focus mode</button>
                  <button id="mainScreenBtn" class="secondary-btn" type="button">Main screen</button>
                </div>
              </div>
            </div>
          </section>

          <section id="testerPanel" class="tab-panel tester-panel" hidden>
            <div class="panel glass tester-card">
              <div class="panel-header">
                <div>
                  <h2>Key Tester</h2>
                  <p class="panel-copy">Press a key to inspect its browser key values without triggering a flash.</p>
                </div>
                <div class="tester-actions">
                  <button id="testerMainScreenBtn" class="secondary-btn compact-btn" type="button">Main screen</button>
                  <button id="keyTesterInfoBtn" class="secondary-btn compact-btn" type="button">Info</button>
                </div>
              </div>
              <div id="keyTesterOutput" class="key-tester-output">
                <span class="empty">Press any key to test it</span>
              </div>
            </div>

            <aside id="statusPanel" class="panel glass status-panel diagnose-status">
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
          </section>
        </main>

        <section id="settingsPanel" class="panel glass settings-panel" aria-label="Settings">
          <div class="panel-header">
            <h2>Settings</h2>
            <span class="hint">Changes save locally</span>
          </div>

          <div class="display-options">
            <label id="focusModeSetting" class="switch-row play-only-setting">
              <input id="focusMode" type="checkbox" />
              <span>Focus mode</span>
            </label>
            <label class="switch-row">
              <input id="showHero" type="checkbox" />
              <span>Show welcome panel</span>
            </label>
            <label class="switch-row">
              <input id="hideStatus" type="checkbox" />
              <span>Hide status</span>
            </label>
            <label class="switch-row">
              <input id="closeSettingsOnOutsideClick" type="checkbox" />
              <span>Click outside closes Settings</span>
            </label>
            <label class="switch-row">
              <input id="fullscreenOnLaunch" type="checkbox" />
              <span>Start maximized on launch</span>
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

          <div class="button-row">
            <button id="saveBtn" class="primary-btn">Save settings</button>
            <button id="resetBtn" class="secondary-btn">Reset rainbow</button>
          </div>
        </section>
      </div>
    </div>
  `;

  const refs = {
    flashLayer: document.getElementById('flashLayer'),
    chrome: document.getElementById('chrome'),
    homeView: document.getElementById('homeView'),
    appView: document.getElementById('appView'),
    playPanel: document.getElementById('playPanel'),
    testerPanel: document.getElementById('testerPanel'),
    heroSection: document.getElementById('heroSection'),
    settingsPanel: document.getElementById('settingsPanel'),
    statusPanel: document.getElementById('statusPanel'),
    keyTesterInfoOverlay: document.getElementById('keyTesterInfoOverlay'),
    keyTesterInfoBtn: document.getElementById('keyTesterInfoBtn'),
    closeKeyTesterInfoBtn: document.getElementById('closeKeyTesterInfoBtn'),
    settingsBtn: document.getElementById('settingsBtn'),
    playContextBtn: document.getElementById('playContextBtn'),
    diagnoseContextBtn: document.getElementById('diagnoseContextBtn'),
    homeTabBtn: document.getElementById('homeTabBtn'),
    playTabBtn: document.getElementById('playTabBtn'),
    testerTabBtn: document.getElementById('testerTabBtn'),
    mainScreenBtn: document.getElementById('mainScreenBtn'),
    testerMainScreenBtn: document.getElementById('testerMainScreenBtn'),
    previewBtn: document.getElementById('previewBtn'),
    fullscreenBtn: document.getElementById('fullscreenBtn'),
    hideUiBtn: document.getElementById('hideUiBtn'),
    saveBtn: document.getElementById('saveBtn'),
    resetBtn: document.getElementById('resetBtn'),
    addColorBtn: document.getElementById('addColorBtn'),
    hexColorInput: document.getElementById('hexColorInput'),
    palettePreview: document.getElementById('palettePreview'),
    keyTesterOutput: document.getElementById('keyTesterOutput'),
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
    focusModeSetting: document.getElementById('focusModeSetting'),
    focusMode: document.getElementById('focusMode'),
    showHero: document.getElementById('showHero'),
    hideStatus: document.getElementById('hideStatus'),
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
      refs.hideStatus.checked = settings.showStatusPanel === false;
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
        showSettingsPanel: false,
        showStatusPanel: !refs.hideStatus.checked,
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
    renderKeyTest(event) {
      const modifiers = [
        event.metaKey ? 'Meta' : '',
        event.ctrlKey ? 'Ctrl' : '',
        event.altKey ? 'Alt' : '',
        event.shiftKey ? 'Shift' : ''
      ].filter(Boolean).join(' + ') || 'none';

      refs.keyTesterOutput.innerHTML = `
        <div><span>key</span><strong>${escapeHtml(event.key || '(empty)')}</strong></div>
        <div><span>code</span><strong>${escapeHtml(event.code || '(empty)')}</strong></div>
        <div><span>location</span><strong>${escapeHtml(event.location)}</strong></div>
        <div><span>repeat</span><strong>${event.repeat ? 'yes' : 'no'}</strong></div>
        <div><span>modifiers</span><strong>${escapeHtml(modifiers)}</strong></div>
      `;
    },
    setAppContext(context) {
      const isHome = context === 'home';
      refs.homeView.hidden = !isHome;
      refs.appView.hidden = isHome;
      document.body.classList.toggle('home-context', isHome);
      document.body.classList.toggle('app-context', !isHome);
    },
    setActiveTab(tab) {
      const isTester = tab === 'tester';
      refs.playPanel.hidden = isTester;
      refs.testerPanel.hidden = !isTester;
      refs.focusModeSetting.hidden = isTester;
      refs.playTabBtn.classList.toggle('active', !isTester);
      refs.testerTabBtn.classList.toggle('active', isTester);
      refs.playTabBtn.setAttribute('aria-selected', String(!isTester));
      refs.testerTabBtn.setAttribute('aria-selected', String(isTester));
    },
    setKeyTesterMode(isActive) {
      document.body.classList.toggle('key-tester-mode', isActive);
    },
    setKeyTesterInfoOpen(isOpen) {
      refs.keyTesterInfoOverlay.hidden = !isOpen;
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
      refs.settingsPanel.scrollTop = 0;
      document.body.classList.toggle('settings-open', isOpen);
      refs.settingsBtn.setAttribute('aria-expanded', String(isOpen));
    },
    setDisplayOptions(settings) {
      document.body.classList.toggle('focus-mode', Boolean(settings.focusMode));
      document.body.classList.toggle('hide-hero', settings.showHero === false);
      document.body.classList.toggle('hide-status-panel', settings.showStatusPanel === false);
      refs.hideUiBtn.textContent = settings.focusMode ? 'Show panels' : 'Focus mode';
    }
  };
}
