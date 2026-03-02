import { defineStore } from 'pinia';

function defaultThresholds() {
  return {
    minGeneratedCharts: 1,
    minPinnedCharts: 1,
    minRowsPerChart: 2,
    minLabelsPerChart: 2,
    maxRowsPerChart: 500
  };
}

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    autoSave: false,
    subtleSeparators: true,
    useSavedCategoriesDropdown: false,
    savedCategories: [],
    roleView: 'editor',
    dashboardHistoryLimit: 40,
    performanceMode: 'balanced',
    alertThresholds: defaultThresholds()
  }),
  getters: {
    sortedSavedCategories(state) {
      return [...state.savedCategories].sort((a, b) => a.localeCompare(b));
    },
    canEditFields(state) {
      return state.roleView === 'editor';
    },
    canEditData(state) {
      return state.roleView === 'editor' || state.roleView === 'manager';
    },
    canGenerateCharts(state) {
      return state.roleView !== 'viewer';
    },
    canAnnotateCharts(state) {
      return state.roleView !== 'viewer';
    },
    normalizedAlertThresholds(state) {
      const raw = state.alertThresholds || {};
      return {
        minGeneratedCharts: Math.max(0, Math.round(Number(raw.minGeneratedCharts) || 0)),
        minPinnedCharts: Math.max(0, Math.round(Number(raw.minPinnedCharts) || 0)),
        minRowsPerChart: Math.max(0, Math.round(Number(raw.minRowsPerChart) || 0)),
        minLabelsPerChart: Math.max(0, Math.round(Number(raw.minLabelsPerChart) || 0)),
        maxRowsPerChart: Math.max(1, Math.round(Number(raw.maxRowsPerChart) || 1))
      };
    }
  },
  actions: {
    addSavedCategory(value) {
      const normalized = String(value || '').trim();
      if (!normalized) return;
      const exists = this.savedCategories.some((item) => item.toLowerCase() === normalized.toLowerCase());
      if (exists) return;
      this.savedCategories.push(normalized);
    },
    removeSavedCategory(value) {
      this.savedCategories = this.savedCategories.filter((item) => item !== value);
    }
  }
});
