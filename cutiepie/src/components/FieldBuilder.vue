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
          @click="showCategoryInfo = !showCategoryInfo"
        >
          i
        </button>
      </div>
      <p>Choose the columns your dataset should use.</p>
    </div>
    <form class="field-form" autocomplete="off" @submit.prevent="submitField">
      <input v-model.trim="name" type="text" placeholder="Field name (example: Month)" required />
      <select v-model="type" required>
        <option value="text">Text</option>
        <option value="number">Number</option>
        <option value="date">Date</option>
      </select>
      <button type="submit">Add Field</button>
    </form>

    <div class="field-list">
      <div v-for="field in store.sortedFields" :key="field.id" class="field-pill">
        <span>{{ field.name }} ({{ field.type }})</span>
        <button type="button" @click="remove(field.id)">x</button>
      </div>
    </div>

    <p v-if="showCategoryInfo" class="settings-note field-info-note">
      Category handling: Settings category list blocks duplicates case-insensitively (for example, Retail and retail are treated the same there), but manually typed Data Entry values are stored exactly as typed, so capitalization differences are treated as separate chart categories.
    </p>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useDataStore } from '../stores/dataStore';
import { useChartStore } from '../stores/chartStore';

const store = useDataStore();
const chartStore = useChartStore();
const name = ref('');
const type = ref('text');
const showCategoryInfo = ref(false);
const hasCategoryField = computed(() => store.sortedFields.some((field) => isCategoryField(field)));

function submitField() {
  store.addField(name.value, type.value);
  chartStore.requireManualRefresh('Fields changed. Click Generate Chart to apply the new structure.');
  name.value = '';
  type.value = 'text';
}

function remove(id) {
  store.removeField(id);
  chartStore.requireManualRefresh('Fields changed. Click Generate Chart to apply the new structure.');
}

function isCategoryField(field) {
  return String(field?.name || '').trim().toLowerCase() === 'category';
}
</script>
