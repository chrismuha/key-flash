<template>
  <section class="panel">
    <div class="panel-head">
      <h2>1) Field Builder</h2>
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
  </section>
</template>

<script setup>
import { ref } from 'vue';
import { useDataStore } from '../stores/dataStore';
import { useChartStore } from '../stores/chartStore';

const store = useDataStore();
const chartStore = useChartStore();
const name = ref('');
const type = ref('text');

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
</script>
