<template>
  <section class="panel">
    <div class="panel-head">
      <div class="panel-title-row">
        <h2>1) Field Builder</h2>
        <button
          v-if="hasCategoryField"
          type="button"
          class="builder-info-btn"
          title="Category behavior info"
          aria-label="Category behavior info"
          @click="showCategoryInfo = !showCategoryInfo"
        >
          <i class="bi bi-info-lg" aria-hidden="true"></i>
        </button>
      </div>
      <p>Choose the columns your dataset should use.</p>
    </div>
    <form class="field-form" autocomplete="off" @submit.prevent="submitField">
      <input v-model.trim="name" type="text" placeholder="Field name (example: Month)" required :disabled="!settings.canEditFields" />
      <select v-model="type" required :disabled="!settings.canEditFields">
        <option value="text">Text</option>
        <option value="number">Number</option>
        <option value="date">Date</option>
      </select>
      <button type="submit" :disabled="!settings.canEditFields">Add Field</button>
    </form>

    <div class="field-list">
      <div v-for="field in store.sortedFields" :key="field.id" class="field-pill">
        <span>{{ field.name }} ({{ field.type }})</span>
        <button type="button" :disabled="!settings.canEditFields" @click="remove(field.id)">x</button>
      </div>
    </div>
    <p v-if="!settings.canEditFields" class="settings-note field-info-note">
      Current role cannot change field structure.
    </p>

    <p v-if="showCategoryInfo" class="settings-note field-info-note">
      Category handling: Settings category list blocks duplicates case-insensitively (for example, Retail and retail are treated the same there), but manually typed Data Entry values are stored exactly as typed, so capitalization differences are treated as separate chart categories.
    </p>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useDataStore } from '../stores/dataStore';
import { useChartStore } from '../stores/chartStore';
import { useSettingsStore } from '../stores/settingsStore';

const store = useDataStore();
const chartStore = useChartStore();
const settings = useSettingsStore();
const name = ref('');
const type = ref('text');
const showCategoryInfo = ref(false);
const hasCategoryField = computed(() => store.sortedFields.some((field) => isCategoryField(field)));

function submitField() {
  if (!settings.canEditFields) return;
  store.addField(name.value, type.value);
  chartStore.requireManualRefresh('Fields changed. Click Generate Chart to apply the new structure.');
  name.value = '';
  type.value = 'text';
}

function remove(id) {
  if (!settings.canEditFields) return;
  store.removeField(id);
  chartStore.requireManualRefresh('Fields changed. Click Generate Chart to apply the new structure.');
}

function isCategoryField(field) {
  return String(field?.name || '').trim().toLowerCase() === 'category';
}
</script>
