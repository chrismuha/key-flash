<template>
  <div class="page-grid">
    <ChartControls @generate="generate" />
    <ChartSurface ref="surfaceRef" />
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue';
import ChartControls from '../components/ChartControls.vue';
import ChartSurface from '../components/ChartSurface.vue';
import { useChartStore } from '../stores/chartStore';

const chartStore = useChartStore();
const surfaceRef = ref(null);

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
    if (!chartStore.manualRefreshRequired) generate();
  }
);

onMounted(() => generate());
</script>
