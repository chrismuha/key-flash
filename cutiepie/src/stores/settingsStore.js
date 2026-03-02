import { defineStore } from 'pinia';

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    autoSave: false,
    subtleSeparators: true,
    useSavedCategoriesDropdown: false,
    savedCategories: [],
    roleView: 'editor',
    dashboardHistoryLimit: 40,
    performanceMode: 'balanced'
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
