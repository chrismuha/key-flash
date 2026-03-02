<template>
  <div class="page-grid">
    <WorkspaceManager />
    <FieldBuilder />
    <DataEntryTable />
    <FormulaBuilder />
    <TemplateManager />
    <DataExchangePanel />
    <ChartControls @generate="generate" />
    <ChartSurface ref="surfaceRef" />
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue';
import WorkspaceManager from '../components/WorkspaceManager.vue';
import FieldBuilder from '../components/FieldBuilder.vue';
import DataEntryTable from '../components/DataEntryTable.vue';
import FormulaBuilder from '../components/FormulaBuilder.vue';
import TemplateManager from '../components/TemplateManager.vue';
import DataExchangePanel from '../components/DataExchangePanel.vue';
import ChartControls from '../components/ChartControls.vue';
import ChartSurface from '../components/ChartSurface.vue';
import { useChartStore } from '../stores/chartStore';
import { useSettingsStore } from '../stores/settingsStore';

const chartStore = useChartStore();
const settings = useSettingsStore();
const surfaceRef = ref(null);
let liveTimer = null;

function generate() {
  if (surfaceRef.value?.render) {
    surfaceRef.value.render();
  }
}

watch(
  () => [
    chartStore.chartType,
    chartStore.selectedLabelFieldId,
    chartStore.selectedValueFieldId,
    chartStore.selectedSecondaryValueFieldId,
    chartStore.selectedSeriesFieldId
  ],
  () => {
    if (chartStore.manualRefreshRequired) return;

    if (liveTimer) clearTimeout(liveTimer);
    const delay = settings.performanceMode === 'fast' ? 80 : settings.performanceMode === 'quality' ? 260 : 150;
    liveTimer = setTimeout(() => {
      generate();
    }, delay);
  }
);

onMounted(() => generate());
</script>
