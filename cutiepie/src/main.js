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
import { migrateSettings, migrateState } from './services/migrationService';

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
let isWorkspaceSyncing = false;

function syncWorkspaceSnapshot() {
  isWorkspaceSyncing = true;
  dataStore.syncActiveWorkspace(chartStore.snapshotForWorkspace());
  isWorkspaceSyncing = false;
}

function buildStatePayload() {
  syncWorkspaceSnapshot();
  return {
    version: 4,
    workspaces: dataStore.workspaces,
    activeWorkspaceId: dataStore.activeWorkspaceId,
    updatedAt: new Date().toISOString()
  };
}

function buildSettingsPayload() {
  return {
    version: 3,
    autoSave: settingsStore.autoSave,
    subtleSeparators: settingsStore.subtleSeparators,
    useSavedCategoriesDropdown: settingsStore.useSavedCategoriesDropdown,
    savedCategories: settingsStore.sortedSavedCategories,
    roleView: settingsStore.roleView,
    dashboardHistoryLimit: settingsStore.dashboardHistoryLimit,
    performanceMode: settingsStore.performanceMode,
    alertThresholds: settingsStore.normalizedAlertThresholds,
    chartGoalEnabled: settingsStore.chartGoalEnabled,
    chartGoalValue: settingsStore.chartGoalValue,
    onboardingCompleted: settingsStore.onboardingCompleted,
    updatedAt: new Date().toISOString()
  };
}

function buildComparableSnapshot() {
  return JSON.stringify({
    fields: dataStore.fields,
    rows: dataStore.rows,
    draftRows: dataStore.draftRows,
    templates: dataStore.templates,
    customFormulas: dataStore.customFormulas,
    formulaFields: dataStore.formulaFields,
    reportExportCount: dataStore.reportExportCount,
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
    performanceMode: settingsStore.performanceMode,
    alertThresholds: settingsStore.normalizedAlertThresholds,
    chartGoalEnabled: settingsStore.chartGoalEnabled,
    chartGoalValue: settingsStore.chartGoalValue,
    onboardingCompleted: settingsStore.onboardingCompleted
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

async function persistSettings() {
  const payload = buildSettingsPayload();
  const result = await saveSettings(payload);
  if (result?.ok) {
    appStore.markSettingsSaved(payload.updatedAt);
  } else {
    appStore.saveStatus = 'Settings save failed';
  }
  return result;
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
  settingsSaveTimer = setTimeout(() => {
    persistSettings();
  }, 140);
}

async function hydrate() {
  appStore.isHydrating = true;

  const loadedSettings = await loadSettings();
  if (loadedSettings.ok && loadedSettings.settings) {
    const settings = migrateSettings(loadedSettings.settings);
    settingsStore.autoSave = settings.autoSave === true;
    settingsStore.subtleSeparators = settings.subtleSeparators !== false;
    settingsStore.useSavedCategoriesDropdown = settings.useSavedCategoriesDropdown === true;
    settingsStore.roleView = ['analyst', 'editor', 'manager', 'viewer'].includes(settings.roleView)
      ? settings.roleView
      : 'editor';
    settingsStore.dashboardHistoryLimit = Number.isFinite(settings.dashboardHistoryLimit)
      ? Math.max(5, Math.min(200, Math.round(settings.dashboardHistoryLimit)))
      : 40;
    settingsStore.performanceMode = ['balanced', 'fast', 'quality'].includes(settings.performanceMode)
      ? settings.performanceMode
      : 'balanced';
    settingsStore.chartGoalEnabled = settings.chartGoalEnabled === true;
    settingsStore.chartGoalValue = Number.isFinite(Number(settings.chartGoalValue))
      ? Number(settings.chartGoalValue)
      : 100;
    settingsStore.onboardingCompleted = settings.onboardingCompleted === true;
    settingsStore.alertThresholds = {
      ...settingsStore.alertThresholds,
      ...(settings.alertThresholds && typeof settings.alertThresholds === 'object'
        ? settings.alertThresholds
        : {})
    };
    settingsStore.savedCategories = Array.isArray(settings.savedCategories)
      ? settings.savedCategories
          .map((item) => String(item || '').trim())
          .filter(Boolean)
      : [];
  }

  const loadedState = await loadState();
  if (loadedState.ok && loadedState.state) {
    const state = migrateState(loadedState.state);
    dataStore.hydrateFromState(state);
    chartStore.applyWorkspaceSnapshot(
      dataStore.activeWorkspace?.chartState,
      dataStore.fields,
      dataStore.activeWorkspace?.generatedTracks
    );
    const savedAt = typeof state.updatedAt === 'string' ? state.updatedAt : null;
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
    dataStore.customFormulas,
    dataStore.formulaFields,
    dataStore.reportExportCount,
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
    if (isWorkspaceSyncing) return;
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
    settingsStore.performanceMode,
    settingsStore.alertThresholds,
    settingsStore.chartGoalEnabled,
    settingsStore.chartGoalValue,
    settingsStore.onboardingCompleted
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
window.__CUTIEPIE_PERSIST_SETTINGS = () => persistSettings();
