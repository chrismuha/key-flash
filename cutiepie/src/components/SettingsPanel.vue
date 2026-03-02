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
      </div>
      <p class="settings-note">Status: {{ appStore.saveStatus }}</p>
      <p class="settings-note">Last saved: {{ fmt(appStore.lastSavedAt) }}</p>
      <p v-if="appStore.hasUnsavedChanges" class="settings-note">Last updated: {{ fmt(appStore.lastUpdatedAt) }} (not yet saved)</p>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue';
import { useAppStore } from '../stores/appStore';
import { useSettingsStore } from '../stores/settingsStore';

const appStore = useAppStore();
const settings = useSettingsStore();
const categoryDraft = ref('');

function saveNow() {
  if (window.__CUTIEPIE_PERSIST_STATE) window.__CUTIEPIE_PERSIST_STATE();
  if (window.__CUTIEPIE_PERSIST_SETTINGS) window.__CUTIEPIE_PERSIST_SETTINGS();
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
