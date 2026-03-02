<template>
  <section class="panel">
    <div class="panel-head">
      <h2>3) Chart Generator</h2>
      <p>Pick chart type and fields.</p>
    </div>

    <div class="controls">
      <label>
        Chart Type
        <select v-model="chartStore.chartType" :disabled="!settings.canGenerateCharts">
          <optgroup v-for="group in chartGroups" :key="group.label" :label="group.label">
            <option v-for="opt in group.options" :key="opt[0]" :value="opt[0]">{{ opt[1] }}</option>
          </optgroup>
        </select>
      </label>

      <label>
        Label / X Axis
        <select v-model="chartStore.selectedLabelFieldId" :disabled="!settings.canGenerateCharts">
          <option v-for="field in dataStore.sortedFields" :key="field.id" :value="field.id">{{ field.name }} ({{ field.type }})</option>
        </select>
      </label>

      <label>
        Value / Y Axis
        <select v-model="chartStore.selectedValueFieldId" :disabled="!settings.canGenerateCharts">
          <option v-for="field in dataStore.sortedNumericFields" :key="field.id" :value="field.id">{{ field.name }} ({{ field.type }})</option>
        </select>
      </label>

      <label>
        Secondary Value
        <select v-model="chartStore.selectedSecondaryValueFieldId" :disabled="!settings.canGenerateCharts">
          <option value="">None</option>
          <option v-for="field in dataStore.sortedNumericFields" :key="`secondary-${field.id}`" :value="field.id">{{ field.name }} ({{ field.type }})</option>
        </select>
      </label>

      <label>
        Series / Group
        <select v-model="chartStore.selectedSeriesFieldId" :disabled="!settings.canGenerateCharts">
          <option value="">None</option>
          <option v-for="field in dataStore.sortedFields" :key="`series-${field.id}`" :value="field.id">{{ field.name }} ({{ field.type }})</option>
        </select>
      </label>

      <button type="button" :disabled="!settings.canGenerateCharts" @click="$emit('generate')">Generate Chart</button>
    </div>

    <p v-if="!settings.canGenerateCharts" class="settings-note">
      Viewer role is read-only. Switch role in Settings to generate charts.
    </p>
    <p v-if="chartStore.message" class="message">{{ chartStore.message }}</p>
  </section>
</template>

<script setup>
import { chartGroups } from '../charts/catalog';
import { useChartStore } from '../stores/chartStore';
import { useDataStore } from '../stores/dataStore';
import { useSettingsStore } from '../stores/settingsStore';

defineEmits(['generate']);

const chartStore = useChartStore();
const dataStore = useDataStore();
const settings = useSettingsStore();
</script>
