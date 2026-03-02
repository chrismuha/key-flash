<template>
  <section class="panel">
    <div class="panel-head">
      <h2>5) Templates</h2>
      <p>Save field and row structures as reusable templates.</p>
    </div>

    <div class="field-form">
      <input v-model.trim="templateName" type="text" placeholder="Template name" :disabled="!settings.canEditData" />
      <button type="button" :disabled="!settings.canEditData || !templateName" @click="saveTemplate">Save Template</button>
    </div>

    <div class="field-list">
      <div v-for="template in sortedTemplates" :key="template.id" class="field-pill template-pill">
        <span>{{ template.name }}</span>
        <button type="button" class="soft template-btn" @click="applyTemplate(template.id)">Load</button>
        <button type="button" class="soft template-btn" :disabled="!settings.canEditData" @click="removeTemplate(template.id)">Delete</button>
      </div>
    </div>

    <p v-if="!sortedTemplates.length" class="settings-note">No templates saved yet.</p>
    <p v-if="status" class="settings-note">{{ status }}</p>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useDataStore } from '../stores/dataStore';
import { useChartStore } from '../stores/chartStore';
import { useSettingsStore } from '../stores/settingsStore';

const dataStore = useDataStore();
const chartStore = useChartStore();
const settings = useSettingsStore();
const templateName = ref('');
const status = ref('');

const sortedTemplates = computed(() => [...dataStore.templates].sort((a, b) => a.name.localeCompare(b.name)));

function saveTemplate() {
  if (!settings.canEditData) return;
  const id = dataStore.saveTemplate(templateName.value, {
    chartType: chartStore.chartType,
    selectedLabelFieldId: chartStore.selectedLabelFieldId,
    selectedValueFieldId: chartStore.selectedValueFieldId,
    selectedSecondaryValueFieldId: chartStore.selectedSecondaryValueFieldId,
    selectedSeriesFieldId: chartStore.selectedSeriesFieldId
  });
  if (!id) return;
  status.value = `Template saved: ${templateName.value}`;
  templateName.value = '';
}

function applyTemplate(templateId) {
  const selection = dataStore.applyTemplate(templateId);
  if (selection) {
    chartStore.chartType = selection.chartType || chartStore.chartType;
    chartStore.selectedLabelFieldId = selection.selectedLabelFieldId || '';
    chartStore.selectedValueFieldId = selection.selectedValueFieldId || '';
    chartStore.selectedSecondaryValueFieldId = selection.selectedSecondaryValueFieldId || '';
    chartStore.selectedSeriesFieldId = selection.selectedSeriesFieldId || '';
  }
  status.value = 'Template loaded.';
}

function removeTemplate(templateId) {
  if (!settings.canEditData) return;
  dataStore.deleteTemplate(templateId);
  status.value = 'Template deleted.';
}
</script>
