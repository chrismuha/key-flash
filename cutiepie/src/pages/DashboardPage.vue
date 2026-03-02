<template>
  <section class="panel">
    <div class="panel-head">
      <h2>Dashboard</h2>
      <p>Generated charts history.</p>
    </div>

    <p v-if="!chartStore.generatedTracks.length" class="settings-note">
      No charts generated yet. Use the Builder page to generate charts.
    </p>

    <div v-else class="tracks-grid">
      <article v-for="track in chartStore.generatedTracks" :key="track.id" class="track-card">
        <h3>{{ track.title }}</h3>
        <p class="settings-note">Generated: {{ fmt(track.generatedAt) }}</p>
        <p class="settings-note">Rows used: {{ track.pointsCount }}</p>
        <p class="settings-note">Labels used: {{ track.labelsCount }}</p>
      </article>
    </div>
  </section>
</template>

<script setup>
import { useChartStore } from '../stores/chartStore';

const chartStore = useChartStore();

function fmt(value) {
  if (!value) return 'Unknown';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return 'Unknown';
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
}
</script>
