<template>
  <section class="panel">
    <div class="panel-head">
      <h2>Diagnostics</h2>
      <p>Storage paths, save health, and runtime diagnostics.</p>
    </div>

    <div class="settings-actions">
      <button type="button" class="soft" @click="refresh">Refresh</button>
    </div>

    <p v-if="!diagnostics" class="settings-note">Loading diagnostics...</p>
    <div v-else class="wizard-grid">
      <p class="settings-note"><strong>App version:</strong> {{ diagnostics.appVersion }}</p>
      <p class="settings-note"><strong>Platform:</strong> {{ diagnostics.platform }}</p>
      <p class="settings-note"><strong>User data path:</strong> {{ diagnostics.userDataPath }}</p>
      <p class="settings-note"><strong>State file:</strong> {{ diagnostics.statePath }} ({{ diagnostics.stateExists ? `${diagnostics.stateBytes} bytes` : 'missing' }})</p>
      <p class="settings-note"><strong>State updated:</strong> {{ fmt(diagnostics.stateUpdatedAt) }}</p>
      <p class="settings-note"><strong>Settings file:</strong> {{ diagnostics.settingsPath }} ({{ diagnostics.settingsExists ? `${diagnostics.settingsBytes} bytes` : 'missing' }})</p>
      <p class="settings-note"><strong>Settings updated:</strong> {{ fmt(diagnostics.settingsUpdatedAt) }}</p>
      <p class="settings-note"><strong>Backup dir:</strong> {{ diagnostics.backupDirPath }} ({{ diagnostics.backupCount }} files)</p>
      <p class="settings-note"><strong>Exports dir:</strong> {{ diagnostics.exportsDirPath }}</p>
      <p class="settings-note"><strong>Current save status:</strong> {{ appStore.saveStatus }}</p>
      <p class="settings-note"><strong>Total chart renders:</strong> {{ chartStore.renderTelemetry.totalRenders }}</p>
      <p class="settings-note"><strong>Last render ms:</strong> {{ round(chartStore.renderTelemetry.lastRenderMs) }}</p>
      <p class="settings-note"><strong>Average render ms:</strong> {{ round(chartStore.renderTelemetry.averageRenderMs) }}</p>
      <p class="settings-note"><strong>Last render points:</strong> {{ chartStore.renderTelemetry.lastPointsCount }}</p>
      <p class="settings-note"><strong>Workspace rows:</strong> {{ dataStore.rows.length }}</p>
      <p class="settings-note"><strong>Formula fields:</strong> {{ dataStore.formulaFields.length }}</p>
      <p v-if="rowWarning" class="settings-note">{{ rowWarning }}</p>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { getDiagnostics } from '../services/diagnosticsService';
import { useAppStore } from '../stores/appStore';
import { useChartStore } from '../stores/chartStore';
import { useDataStore } from '../stores/dataStore';
import { useSettingsStore } from '../stores/settingsStore';

const appStore = useAppStore();
const chartStore = useChartStore();
const dataStore = useDataStore();
const settingsStore = useSettingsStore();
const diagnostics = ref(null);

async function refresh() {
  const result = await getDiagnostics();
  diagnostics.value = result?.ok ? result.diagnostics : null;
}

function fmt(value) {
  if (!value) return 'N/A';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return 'N/A';
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
}

function round(value) {
  return Math.round((Number(value) || 0) * 100) / 100;
}

const rowWarning = computed(() => {
  const max = Number(settingsStore.normalizedAlertThresholds.maxRowsPerChart || 0);
  if (max > 0 && dataStore.rows.length > max) {
    return `Warning: workspace row count ${dataStore.rows.length} exceeds max-rows threshold ${max}.`;
  }
  return '';
});

onMounted(() => {
  refresh();
});
</script>
