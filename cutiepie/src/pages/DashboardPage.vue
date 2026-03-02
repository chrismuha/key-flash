<template>
  <section class="panel">
    <div class="panel-head">
      <h2>Dashboard</h2>
      <p>Generated charts history and quick KPI summary.</p>
    </div>

    <div class="kpi-grid">
      <article class="track-card" :class="{ 'alert-card': chartStore.generatedTracks.length < thresholds.minGeneratedCharts }">
        <h3>Total Generated</h3>
        <p class="kpi-value">{{ chartStore.generatedTracks.length }}</p>
      </article>
      <article class="track-card" :class="{ 'alert-card': chartStore.pinnedTracks.length < thresholds.minPinnedCharts }">
        <h3>Pinned Charts</h3>
        <p class="kpi-value">{{ chartStore.pinnedTracks.length }}</p>
      </article>
      <article class="track-card">
        <h3>Most Used Type</h3>
        <p class="kpi-value">{{ mostUsedType }}</p>
      </article>
      <article class="track-card">
        <h3>Last Generated</h3>
        <p class="kpi-value kpi-date">{{ lastGenerated }}</p>
      </article>
    </div>
    <div v-if="alerts.length" class="threshold-alerts">
      <p class="settings-note"><strong>Threshold Alerts</strong></p>
      <p v-for="(alert, index) in alerts" :key="`alert-${index}`" class="settings-note">{{ alert }}</p>
    </div>

    <div class="settings-actions">
      <button
        type="button"
        class="soft danger"
        :disabled="!chartStore.generatedTracks.length"
        @click="chartStore.clearGeneratedTracks()"
      >
        Clear History
      </button>
      <button
        type="button"
        class="builder-info-btn"
        title="Clear History info"
        aria-label="Clear History info"
        @click="showClearInfo = !showClearInfo"
      >
        <i class="bi bi-info-lg" aria-hidden="true"></i>
      </button>
    </div>
    <p v-if="showClearInfo" class="settings-note field-info-note">
      Clear History only removes generated chart history on this Dashboard. It does not remove your data fields, rows, saved settings, or backup files.
    </p>

    <p v-if="!chartStore.generatedTracks.length" class="settings-note">
      No charts generated yet. Use the Builder page to generate charts.
    </p>

    <div v-else class="tracks-grid">
      <article v-for="track in visibleTracks" :key="track.id" class="track-card">
        <div class="track-head-row">
          <h3>{{ track.title }}</h3>
          <button
            type="button"
            class="soft pin-btn"
            :disabled="!settings.canAnnotateCharts"
            @click="chartStore.setTrackPinned(track.id, !track.pinned)"
          >
            {{ track.pinned ? 'Unpin' : 'Pin' }}
          </button>
        </div>
        <p class="settings-note">Generated: {{ fmt(track.generatedAt) }}</p>
        <p class="settings-note">Rows used: {{ track.pointsCount }}</p>
        <p class="settings-note">Labels used: {{ track.labelsCount }}</p>
        <textarea
          class="track-note"
          placeholder="Add note for this generated chart"
          :value="track.note"
          :disabled="!settings.canAnnotateCharts"
          @input="chartStore.setTrackNote(track.id, $event.target.value)"
        ></textarea>
      </article>
    </div>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useChartStore } from '../stores/chartStore';
import { useSettingsStore } from '../stores/settingsStore';

const chartStore = useChartStore();
const settings = useSettingsStore();
const showClearInfo = ref(false);
const thresholds = computed(() => settings.normalizedAlertThresholds);

const visibleTracks = computed(() => {
  const ordered = [...chartStore.generatedTracks].sort((a, b) => {
    if (a.pinned === b.pinned) {
      return new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime();
    }
    return a.pinned ? -1 : 1;
  });

  return ordered.slice(0, Math.max(5, Number(settings.dashboardHistoryLimit || 40)));
});

const mostUsedType = computed(() => {
  if (!chartStore.generatedTracks.length) return 'N/A';
  const tally = new Map();
  chartStore.generatedTracks.forEach((track) => {
    tally.set(track.title, (tally.get(track.title) || 0) + 1);
  });
  return [...tally.entries()].sort((a, b) => b[1] - a[1])[0][0];
});

const lastGenerated = computed(() => {
  const first = chartStore.generatedTracks[0];
  return first ? fmt(first.generatedAt) : 'N/A';
});

const alerts = computed(() => {
  const next = [];
  if (chartStore.generatedTracks.length < thresholds.value.minGeneratedCharts) {
    next.push(`KPI alert: Total Generated is below threshold (${chartStore.generatedTracks.length} < ${thresholds.value.minGeneratedCharts}).`);
  }
  if (chartStore.pinnedTracks.length < thresholds.value.minPinnedCharts) {
    next.push(`KPI alert: Pinned Charts is below threshold (${chartStore.pinnedTracks.length} < ${thresholds.value.minPinnedCharts}).`);
  }

  visibleTracks.value.forEach((track) => {
    if (track.pointsCount < thresholds.value.minRowsPerChart) {
      next.push(`Chart alert: ${track.title} has too few rows (${track.pointsCount} < ${thresholds.value.minRowsPerChart}).`);
    }
    if (track.pointsCount > thresholds.value.maxRowsPerChart) {
      next.push(`Chart alert: ${track.title} exceeds max rows (${track.pointsCount} > ${thresholds.value.maxRowsPerChart}).`);
    }
    if (track.labelsCount < thresholds.value.minLabelsPerChart) {
      next.push(`Chart alert: ${track.title} has too few labels (${track.labelsCount} < ${thresholds.value.minLabelsPerChart}).`);
    }
  });

  return next.slice(0, 12);
});

function fmt(value) {
  if (!value) return 'Unknown';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return 'Unknown';
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
}
</script>
