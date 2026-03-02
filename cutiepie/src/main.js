import { createApp, watch } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import './style.css';
import { useAppStore } from './stores/appStore';
import { useSettingsStore } from './stores/settingsStore';
import { useDataStore } from './stores/dataStore';
import { useChartStore } from './stores/chartStore';
import { loadState, saveState } from './services/stateService';
import { loadSettings, saveSettings } from './services/settingsService';
import { subscribeQuitRequests } from './services/quitService';

const app = createApp(App);
const pinia = createPinia();
app.use(pinia);
app.use(router);

const appStore = useAppStore();
const settingsStore = useSettingsStore();
const dataStore = useDataStore();
const chartStore = useChartStore();

let stateSaveTimer = null;
let settingsSaveTimer = null;

function buildStatePayload() {
  return {
    version: 1,
    fields: dataStore.fields,
    rows: dataStore.rows,
    draftRows: dataStore.draftRows,
    chartType: chartStore.chartType,
    selectedLabelFieldId: chartStore.selectedLabelFieldId,
    selectedValueFieldId: chartStore.selectedValueFieldId,
    selectedSecondaryValueFieldId: chartStore.selectedSecondaryValueFieldId,
    selectedSeriesFieldId: chartStore.selectedSeriesFieldId,
    updatedAt: new Date().toISOString()
  };
}

function buildSettingsPayload() {
  return {
    version: 1,
    autoSave: settingsStore.autoSave,
    subtleSeparators: settingsStore.subtleSeparators,
    updatedAt: new Date().toISOString()
  };
}

function buildComparableSnapshot() {
  return JSON.stringify({
    fields: dataStore.fields,
    rows: dataStore.rows,
    draftRows: dataStore.draftRows,
    chartType: chartStore.chartType,
    selectedLabelFieldId: chartStore.selectedLabelFieldId,
    selectedValueFieldId: chartStore.selectedValueFieldId,
    selectedSecondaryValueFieldId: chartStore.selectedSecondaryValueFieldId,
    selectedSeriesFieldId: chartStore.selectedSeriesFieldId
  });
}

async function persistState(force = false) {
  if (!force && !settingsStore.autoSave) return;
  const payload = buildStatePayload();
  const result = await saveState(payload);
  if (result.ok) {
    const snapshot = buildComparableSnapshot();
    appStore.markSaved(payload.updatedAt, snapshot);
  } else {
    appStore.saveStatus = 'Save failed';
  }
}

function scheduleStateSave() {
  if (!settingsStore.autoSave) return;
  if (stateSaveTimer) clearTimeout(stateSaveTimer);
  stateSaveTimer = setTimeout(() => {
    persistState(false);
  }, 220);
}

function scheduleSettingsSave() {
  if (settingsSaveTimer) clearTimeout(settingsSaveTimer);
  settingsSaveTimer = setTimeout(async () => {
    await saveSettings(buildSettingsPayload());
  }, 140);
}

async function hydrate() {
  appStore.isHydrating = true;

  const loadedSettings = await loadSettings();
  if (loadedSettings.ok && loadedSettings.settings) {
    settingsStore.autoSave = loadedSettings.settings.autoSave !== false;
    settingsStore.subtleSeparators = loadedSettings.settings.subtleSeparators !== false;
  }

  const loadedState = await loadState();
  if (loadedState.ok && loadedState.state) {
    dataStore.hydrateFromState(loadedState.state);
    chartStore.hydrateFromState(loadedState.state, dataStore.fields);
    const savedAt = typeof loadedState.state.updatedAt === 'string' ? loadedState.state.updatedAt : null;
    appStore.markSaved(savedAt, buildComparableSnapshot());
    appStore.saveStatus = 'Loaded saved data';
  } else {
    appStore.saveStatus = 'No saved data found';
  }

  appStore.isHydrating = false;
  appStore.refreshUnsaved(buildComparableSnapshot());
}

watch(
  () => [
    dataStore.fields,
    dataStore.rows,
    dataStore.draftRows,
    chartStore.chartType,
    chartStore.selectedLabelFieldId,
    chartStore.selectedValueFieldId,
    chartStore.selectedSecondaryValueFieldId,
    chartStore.selectedSeriesFieldId
  ],
  () => {
    if (appStore.isHydrating) return;
    appStore.markUpdated(buildComparableSnapshot());
    scheduleStateSave();
  },
  { deep: true }
);

watch(
  () => [settingsStore.autoSave, settingsStore.subtleSeparators],
  () => {
    if (appStore.isHydrating) return;
    scheduleSettingsSave();
  }
);

watch(
  () => appStore.hasUnsavedChanges,
  (value) => {
    window.__CUTIEPIE_HAS_UNSAVED = value === true;
  },
  { immediate: true }
);

subscribeQuitRequests(() => {
  appStore.showQuitModal = true;
});

hydrate().finally(() => {
  app.mount('#app');
});

window.__CUTIEPIE_PERSIST_STATE = () => persistState(true);
