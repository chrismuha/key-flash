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
      <div class="settings-actions">
        <button type="button" class="soft" @click="saveNow">Save Now</button>
      </div>
      <p class="settings-note">Status: {{ appStore.saveStatus }}</p>
      <p class="settings-note">Last saved: {{ fmt(appStore.lastSavedAt) }}</p>
      <p v-if="appStore.hasUnsavedChanges" class="settings-note">Last updated: {{ fmt(appStore.lastUpdatedAt) }} (not yet saved)</p>
    </div>
  </section>
</template>

<script setup>
import { useAppStore } from '../stores/appStore';
import { useSettingsStore } from '../stores/settingsStore';

const appStore = useAppStore();
const settings = useSettingsStore();

function saveNow() {
  if (window.__CUTIEPIE_PERSIST_STATE) window.__CUTIEPIE_PERSIST_STATE();
}

function fmt(value) {
  if (!value) return 'Never';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return 'Invalid date';
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
}
</script>
