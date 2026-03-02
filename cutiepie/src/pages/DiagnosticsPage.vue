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
    </div>
  </section>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { getDiagnostics } from '../services/diagnosticsService';
import { useAppStore } from '../stores/appStore';

const appStore = useAppStore();
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

onMounted(() => {
  refresh();
});
</script>
