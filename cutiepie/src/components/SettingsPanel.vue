<template>
  <section class="panel settings-panel">
    <div class="panel-head">
      <h2>Program Settings</h2>
      <p>Settings are stored in a separate settings file.</p>
    </div>
    <div class="settings-grid">
      <label class="settings-toggle">
        <input v-model="settings.autoSave" type="checkbox" />
        Auto-save data to disk
      </label>
      <label class="settings-toggle">
        <input v-model="settings.subtleSeparators" type="checkbox" />
        Subtle separators between fields
      </label>
      <label class="settings-toggle">
        <input v-model="settings.useSavedCategoriesDropdown" type="checkbox" />
        Use saved categories dropdown in text fields
      </label>

      <label>
        Role View
        <select v-model="settings.roleView">
          <option value="analyst">Analyst</option>
          <option value="editor">Editor</option>
          <option value="manager">Manager</option>
          <option value="viewer">Viewer</option>
        </select>
      </label>

      <label>
        Dashboard History Limit
        <input v-model.number="settings.dashboardHistoryLimit" type="number" min="5" max="200" />
      </label>

      <label>
        <span class="panel-title-row">
          <span>Performance Mode</span>
          <button
            type="button"
            class="builder-info-btn"
            title="Performance mode info"
            aria-label="Performance mode info"
            @click="showPerformanceInfo = !showPerformanceInfo"
          >
            <i class="bi bi-info-lg" aria-hidden="true"></i>
          </button>
        </span>
        <select v-model="settings.performanceMode">
          <option value="balanced">Balanced</option>
          <option value="fast">Fast updates</option>
          <option value="quality">Quality rendering</option>
        </select>
      </label>
      <div v-if="showPerformanceInfo" class="role-info">
        <p class="settings-note">
          Performance Mode controls how quickly live charts re-render after changes in Builder.
        </p>
        <p class="settings-note"><strong>Fast updates:</strong> shortest delay before re-render (more immediate, more CPU activity).</p>
        <p class="settings-note"><strong>Balanced:</strong> middle delay (default tradeoff).</p>
        <p class="settings-note"><strong>Quality rendering:</strong> longest delay (fewer redraws, smoother/stabler on heavier datasets).</p>
      </div>
      <label class="settings-toggle">
        <input v-model="settings.chartGoalEnabled" type="checkbox" />
        Enable chart goal marker line
      </label>
      <label>
        Chart Goal Value
        <input v-model.number="settings.chartGoalValue" type="number" />
      </label>
      <label class="settings-toggle">
        <input v-model="settings.onboardingCompleted" type="checkbox" />
        Skip onboarding tour at startup
      </label>

      <div class="wizard-grid">
        <p class="settings-note"><strong>Threshold Alerts</strong></p>
        <label>
          Min Generated Charts (KPI)
          <input v-model.number="settings.alertThresholds.minGeneratedCharts" type="number" min="0" />
        </label>
        <label>
          Min Pinned Charts (KPI)
          <input v-model.number="settings.alertThresholds.minPinnedCharts" type="number" min="0" />
        </label>
        <label>
          Min Rows Per Chart
          <input v-model.number="settings.alertThresholds.minRowsPerChart" type="number" min="0" />
        </label>
        <label>
          Min Labels Per Chart
          <input v-model.number="settings.alertThresholds.minLabelsPerChart" type="number" min="0" />
        </label>
        <label>
          Max Rows Per Chart
          <input v-model.number="settings.alertThresholds.maxRowsPerChart" type="number" min="1" />
        </label>
      </div>

      <div class="field-form">
        <input
          v-model.trim="categoryDraft"
          type="text"
          placeholder="Add category (example: Retail)"
          @keydown.enter.prevent="addCategory"
        />
        <button type="button" class="soft" @click="addCategory">Add Category</button>
      </div>

      <div class="field-list">
        <div v-for="category in settings.sortedSavedCategories" :key="category" class="field-pill">
          <span>{{ category }}</span>
          <button type="button" @click="settings.removeSavedCategory(category)">x</button>
        </div>
      </div>

      <div class="settings-actions">
        <button type="button" class="soft" @click="saveNow">Save Now</button>
        <button type="button" class="soft" @click="backupNow">Create Backup</button>
        <button type="button" class="soft danger" @click="restoreBackup">Restore Latest Backup</button>
        <button type="button" class="soft" @click="exportWorkspacePackage">Export Workspace Package</button>
      </div>
      <p class="settings-note">Status: {{ appStore.saveStatus }}</p>
      <p class="settings-note">Last saved: {{ fmt(appStore.lastSavedAt) }}</p>
      <p v-if="appStore.hasUnsavedChanges" class="settings-note">Last updated: {{ fmt(appStore.lastUpdatedAt) }} (not yet saved)</p>
    </div>
  </section>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useAppStore } from '../stores/appStore';
import { useSettingsStore } from '../stores/settingsStore';
import { useDataStore } from '../stores/dataStore';
import { createBackup, listBackups, restoreLatestBackup } from '../services/backupService';
import { saveTextExport } from '../services/exportService';

const appStore = useAppStore();
const settings = useSettingsStore();
const dataStore = useDataStore();
const categoryDraft = ref('');
const showPerformanceInfo = ref(false);

watch(
  () => settings.dashboardHistoryLimit,
  (value) => {
    if (!Number.isFinite(value)) {
      settings.dashboardHistoryLimit = 40;
      return;
    }
    settings.dashboardHistoryLimit = Math.max(5, Math.min(200, Math.round(value)));
  }
);

watch(
  () => settings.alertThresholds,
  (value) => {
    settings.alertThresholds.minGeneratedCharts = Math.max(0, Math.round(Number(value.minGeneratedCharts) || 0));
    settings.alertThresholds.minPinnedCharts = Math.max(0, Math.round(Number(value.minPinnedCharts) || 0));
    settings.alertThresholds.minRowsPerChart = Math.max(0, Math.round(Number(value.minRowsPerChart) || 0));
    settings.alertThresholds.minLabelsPerChart = Math.max(0, Math.round(Number(value.minLabelsPerChart) || 0));
    settings.alertThresholds.maxRowsPerChart = Math.max(1, Math.round(Number(value.maxRowsPerChart) || 1));
  },
  { deep: true }
);

watch(
  () => settings.chartGoalValue,
  (value) => {
    settings.chartGoalValue = Number.isFinite(Number(value)) ? Number(value) : 0;
  }
);

function saveNow() {
  if (window.__CUTIEPIE_PERSIST_STATE) window.__CUTIEPIE_PERSIST_STATE();
  if (window.__CUTIEPIE_PERSIST_SETTINGS) window.__CUTIEPIE_PERSIST_SETTINGS();
}

async function backupNow() {
  const result = await createBackup();
  if (!result?.ok) {
    appStore.saveStatus = 'Backup failed';
    return;
  }
  appStore.saveStatus = `Backup created (${result.fileName})`;
}

async function restoreBackup() {
  const result = await restoreLatestBackup();
  if (!result?.ok) {
    appStore.saveStatus = result?.error === 'no_backup_found' ? 'No backup found' : 'Restore failed';
    return;
  }

  appStore.saveStatus = `Backup restored (${result.fileName})`;
  window.location.reload();
}

async function exportWorkspacePackage() {
  const backupResult = await listBackups();
  const workspace = dataStore.activeWorkspace;
  const payload = {
    exportedAt: new Date().toISOString(),
    workspaceId: dataStore.activeWorkspaceId,
    workspaceName: workspace?.name || 'Unknown Workspace',
    workspace,
    settings: {
      roleView: settings.roleView,
      performanceMode: settings.performanceMode,
      dashboardHistoryLimit: settings.dashboardHistoryLimit,
      alertThresholds: settings.normalizedAlertThresholds,
      chartGoalEnabled: settings.chartGoalEnabled,
      chartGoalValue: settings.chartGoalValue
    },
    backupMetadata: backupResult?.ok ? backupResult.backups : []
  };

  const result = await saveTextExport({
    content: JSON.stringify(payload, null, 2),
    defaultName: `cutiepie-workspace-${String(workspace?.name || 'workspace').replace(/[^a-z0-9_-]+/gi, '-').toLowerCase()}.json`,
    filters: [{ name: 'JSON', extensions: ['json'] }]
  });
  appStore.saveStatus = result?.ok
    ? `Workspace package exported (${result.fileName})`
    : (result?.canceled ? 'Workspace package export canceled' : 'Workspace package export failed');
}

function addCategory() {
  settings.addSavedCategory(categoryDraft.value);
  categoryDraft.value = '';
}

function fmt(value) {
  if (!value) return 'Never';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return 'Invalid date';
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
}
</script>
