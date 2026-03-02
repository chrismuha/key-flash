<template>
  <section class="panel report-page">
    <div class="panel-head print-hide">
      <h2>Reports</h2>
      <p>Print this page or save as PDF from the print dialog.</p>
    </div>

    <div class="settings-actions print-hide">
      <label class="settings-toggle">
        <input v-model="pinnedOnly" type="checkbox" />
        Include only pinned charts
      </label>
      <button type="button" :disabled="isExporting" @click="exportReportPdf">
        {{ isExporting ? 'Exporting PDF...' : 'Export Report PDF' }}
      </button>
      <button type="button" class="soft danger" :disabled="reportExportCount === 0" @click="clearReportCounter">
        Clear Report Counter
      </button>
    </div>
    <p v-if="exportStatus" class="settings-note print-hide">{{ exportStatus }}</p>
    <div class="settings-actions print-hide">
      <button
        type="button"
        class="builder-info-btn"
        title="KPI info"
        aria-label="KPI info"
        @click="showKpiInfo = !showKpiInfo"
      >
        <i class="bi bi-info-lg" aria-hidden="true"></i>
      </button>
    </div>
    <p v-if="showKpiInfo" class="settings-note print-hide">KPI means Key Performance Indicator. It is a tracked metric used to quickly measure performance.</p>

    <header class="report-header">
      <h1>CutiePie Chart Report</h1>
      <p>Generated {{ nowText }}</p>
    </header>

    <div class="kpi-grid">
      <article class="track-card">
        <h3>Total Generated</h3>
        <p class="kpi-value">{{ chartStore.generatedTracks.length }}</p>
      </article>
      <article class="track-card">
        <h3>Included in Report</h3>
        <p class="kpi-value">{{ tracksForReport.length }}</p>
      </article>
      <article class="track-card">
        <h3>Pinned</h3>
        <p class="kpi-value">{{ chartStore.pinnedTracks.length }}</p>
      </article>
      <article class="track-card">
        <h3>Report Exports</h3>
        <p class="kpi-value">{{ reportExportCount }}</p>
      </article>
    </div>

    <article v-for="track in tracksForReport" :key="track.id" class="track-card report-track">
      <h3>{{ track.title }}</h3>
      <p class="settings-note">Generated: {{ fmt(track.generatedAt) }}</p>
      <p class="settings-note">Rows used: {{ track.pointsCount }}</p>
      <p class="settings-note">Labels used: {{ track.labelsCount }}</p>
      <p v-if="track.note" class="settings-note"><strong>Note:</strong> {{ track.note }}</p>
    </article>

    <p v-if="!tracksForReport.length" class="settings-note">No report rows available with current filter.</p>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useChartStore } from '../stores/chartStore';
import { exportCurrentPagePdf } from '../services/pdfService';

const chartStore = useChartStore();
const pinnedOnly = ref(false);
const isExporting = ref(false);
const exportStatus = ref('');
const reportExportCount = ref(0);
const showKpiInfo = ref(false);

const nowText = computed(() => `${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`);

const tracksForReport = computed(() => {
  if (!pinnedOnly.value) return chartStore.generatedTracks;
  return chartStore.generatedTracks.filter((track) => track.pinned === true);
});

async function exportReportPdf() {
  if (isExporting.value) return;
  isExporting.value = true;
  const result = await exportCurrentPagePdf('reports');
  if (result?.ok) {
    reportExportCount.value += 1;
    exportStatus.value = `PDF exported: ${result.fileName}`;
  } else if (result?.canceled) {
    exportStatus.value = 'PDF export canceled.';
  } else {
    exportStatus.value = 'PDF export failed.';
  }
  isExporting.value = false;
}

function clearReportCounter() {
  reportExportCount.value = 0;
  exportStatus.value = 'Report export counter reset.';
}

function fmt(value) {
  if (!value) return 'Unknown';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return 'Unknown';
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
}
</script>
