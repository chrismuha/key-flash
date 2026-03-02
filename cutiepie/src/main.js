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

function syncWorkspaceSnapshot() {
  dataStore.syncActiveWorkspace(chartStore.snapshotForWorkspace());
}

function buildStatePayload() {
  syncWorkspaceSnapshot();
  return {
    version: 3,
    workspaces: dataStore.workspaces,
    activeWorkspaceId: dataStore.activeWorkspaceId,
    updatedAt: new Date().toISOString()
  };
}

function buildSettingsPayload() {
  return {
    version: 2,
    autoSave: settingsStore.autoSave,
    subtleSeparators: settingsStore.subtleSeparators,
    useSavedCategoriesDropdown: settingsStore.useSavedCategoriesDropdown,
    savedCategories: settingsStore.sortedSavedCategories,
    roleView: settingsStore.roleView,
    dashboardHistoryLimit: settingsStore.dashboardHistoryLimit,
    performanceMode: settingsStore.performanceMode,
    updatedAt: new Date().toISOString()
  };
}

function buildComparableSnapshot() {
  return JSON.stringify({
    fields: dataStore.fields,
    rows: dataStore.rows,
    draftRows: dataStore.draftRows,
    templates: dataStore.templates,
    chartType: chartStore.chartType,
    selectedLabelFieldId: chartStore.selectedLabelFieldId,
    selectedValueFieldId: chartStore.selectedValueFieldId,
    selectedSecondaryValueFieldId: chartStore.selectedSecondaryValueFieldId,
    selectedSeriesFieldId: chartStore.selectedSeriesFieldId,
    generatedTracks: chartStore.generatedTracks,
    workspaces: dataStore.workspaces,
    activeWorkspaceId: dataStore.activeWorkspaceId,
    roleView: settingsStore.roleView,
    dashboardHistoryLimit: settingsStore.dashboardHistoryLimit,
    performanceMode: settingsStore.performanceMode
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
    settingsStore.autoSave = loadedSettings.settings.autoSave === true;
    settingsStore.subtleSeparators = loadedSettings.settings.subtleSeparators !== false;
    settingsStore.useSavedCategoriesDropdown = loadedSettings.settings.useSavedCategoriesDropdown === true;
    settingsStore.roleView = ['analyst', 'editor', 'manager', 'viewer'].includes(loadedSettings.settings.roleView)
      ? loadedSettings.settings.roleView
      : 'editor';
    settingsStore.dashboardHistoryLimit = Number.isFinite(loadedSettings.settings.dashboardHistoryLimit)
      ? Math.max(5, Math.min(200, Math.round(loadedSettings.settings.dashboardHistoryLimit)))
      : 40;
    settingsStore.performanceMode = ['balanced', 'fast', 'quality'].includes(loadedSettings.settings.performanceMode)
      ? loadedSettings.settings.performanceMode
      : 'balanced';
    settingsStore.savedCategories = Array.isArray(loadedSettings.settings.savedCategories)
      ? loadedSettings.settings.savedCategories
          .map((item) => String(item || '').trim())
          .filter(Boolean)
      : [];
  }

  const loadedState = await loadState();
  if (loadedState.ok && loadedState.state) {
    dataStore.hydrateFromState(loadedState.state);
    chartStore.applyWorkspaceSnapshot(
      dataStore.activeWorkspace?.chartState,
      dataStore.fields,
      dataStore.activeWorkspace?.generatedTracks
    );
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
    dataStore.templates,
    dataStore.workspaces,
    dataStore.activeWorkspaceId,
    chartStore.chartType,
    chartStore.selectedLabelFieldId,
    chartStore.selectedValueFieldId,
    chartStore.selectedSecondaryValueFieldId,
    chartStore.selectedSeriesFieldId,
    chartStore.generatedTracks
  ],
  () => {
    if (appStore.isHydrating) return;
    appStore.markUpdated(buildComparableSnapshot());
    scheduleStateSave();
  },
  { deep: true }
);

watch(
  () => [
    settingsStore.autoSave,
    settingsStore.subtleSeparators,
    settingsStore.useSavedCategoriesDropdown,
    settingsStore.savedCategories,
    settingsStore.roleView,
    settingsStore.dashboardHistoryLimit,
    settingsStore.performanceMode
  ],
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
window.__CUTIEPIE_PERSIST_SETTINGS = () => saveSettings(buildSettingsPayload());
