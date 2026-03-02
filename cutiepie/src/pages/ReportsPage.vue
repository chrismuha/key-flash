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
      <button type="button" @click="printReport">Print / Save PDF</button>
    </div>

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

const chartStore = useChartStore();
const pinnedOnly = ref(false);

const nowText = computed(() => `${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`);

const tracksForReport = computed(() => {
  if (!pinnedOnly.value) return chartStore.generatedTracks;
  return chartStore.generatedTracks.filter((track) => track.pinned === true);
});

function printReport() {
  window.print();
}

function fmt(value) {
  if (!value) return 'Unknown';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return 'Unknown';
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
}
</script>
