import { defineStore } from 'pinia';
import { chartTypes } from '../charts/catalog';

export const useChartStore = defineStore('chart', {
  state: () => ({
    chartType: 'pie',
    selectedLabelFieldId: '',
    selectedValueFieldId: '',
    selectedSecondaryValueFieldId: '',
    selectedSeriesFieldId: '',
    message: '',
    manualRefreshRequired: false,
    hasRenderedChart: false,
    renderedCategoryLabels: [],
    generatedTracks: []
  }),
  getters: {
    pinnedTracks(state) {
      return state.generatedTracks.filter((track) => track.pinned === true);
    }
  },
  actions: {
    hydrateFromState(state, fields) {
      if (chartTypes.has(state.chartType)) this.chartType = state.chartType;

      const hasField = (id) => fields.some((field) => field.id === id);
      const hasNumeric = (id) => fields.some((field) => field.id === id && field.type === 'number');

      if (hasField(state.selectedLabelFieldId)) this.selectedLabelFieldId = state.selectedLabelFieldId;
      if (hasNumeric(state.selectedValueFieldId)) this.selectedValueFieldId = state.selectedValueFieldId;
      if (hasNumeric(state.selectedSecondaryValueFieldId)) this.selectedSecondaryValueFieldId = state.selectedSecondaryValueFieldId;
      if (hasField(state.selectedSeriesFieldId)) this.selectedSeriesFieldId = state.selectedSeriesFieldId;

      if (Array.isArray(state.generatedTracks)) {
        this.generatedTracks = state.generatedTracks
          .filter((track) => track && typeof track === 'object')
          .map((track) => ({
            id: typeof track.id === 'string' && track.id ? track.id : crypto.randomUUID(),
            generatedAt: typeof track.generatedAt === 'string' ? track.generatedAt : new Date().toISOString(),
            chartType: typeof track.chartType === 'string' ? track.chartType : 'unknown',
            labelsCount: Number.isFinite(track.labelsCount) ? track.labelsCount : 0,
            pointsCount: Number.isFinite(track.pointsCount) ? track.pointsCount : 0,
            title: typeof track.title === 'string' && track.title ? track.title : 'Chart',
            pinned: track.pinned === true,
            note: typeof track.note === 'string' ? track.note : ''
          }));
      }
    },
    requireManualRefresh(text) {
      this.manualRefreshRequired = true;
      this.message = text;
    },
    completeRender(labels, meta = {}) {
      this.manualRefreshRequired = false;
      this.message = '';
      this.hasRenderedChart = true;
      this.renderedCategoryLabels = labels;

      const track = {
        id: crypto.randomUUID(),
        generatedAt: new Date().toISOString(),
        chartType: this.chartType,
        labelsCount: Array.isArray(labels) ? labels.length : 0,
        pointsCount: Number.isFinite(meta.pointsCount) ? meta.pointsCount : 0,
        title: meta.title || this.chartType,
        pinned: false,
        note: ''
      };

      this.generatedTracks.unshift(track);
      if (this.generatedTracks.length > 100) {
        this.generatedTracks.length = 100;
      }
    },
    clearGeneratedTracks() {
      this.generatedTracks = [];
    },
    snapshotForWorkspace() {
      return {
        chartState: {
          chartType: this.chartType,
          selectedLabelFieldId: this.selectedLabelFieldId,
          selectedValueFieldId: this.selectedValueFieldId,
          selectedSecondaryValueFieldId: this.selectedSecondaryValueFieldId,
          selectedSeriesFieldId: this.selectedSeriesFieldId
        },
        generatedTracks: this.generatedTracks.map((track) => ({ ...track }))
      };
    },
    applyWorkspaceSnapshot(chartState, fields, generatedTracks) {
      const state = chartState && typeof chartState === 'object' ? chartState : {};
      this.hydrateFromState(state, fields || []);
      this.generatedTracks = Array.isArray(generatedTracks)
        ? generatedTracks.map((track) => ({
            id: typeof track.id === 'string' && track.id ? track.id : crypto.randomUUID(),
            generatedAt: typeof track.generatedAt === 'string' ? track.generatedAt : new Date().toISOString(),
            chartType: typeof track.chartType === 'string' ? track.chartType : 'unknown',
            labelsCount: Number.isFinite(track.labelsCount) ? track.labelsCount : 0,
            pointsCount: Number.isFinite(track.pointsCount) ? track.pointsCount : 0,
            title: typeof track.title === 'string' && track.title ? track.title : 'Chart',
            pinned: track.pinned === true,
            note: typeof track.note === 'string' ? track.note : ''
          }))
        : [];
    },
    setTrackPinned(trackId, next) {
      const track = this.generatedTracks.find((item) => item.id === trackId);
      if (!track) return;
      track.pinned = Boolean(next);
    },
    setTrackNote(trackId, note) {
      const track = this.generatedTracks.find((item) => item.id === trackId);
      if (!track) return;
      track.note = String(note || '');
    }
  }
});
