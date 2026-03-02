import { defineStore } from 'pinia';

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    autoSave: true,
    subtleSeparators: true,
    useSavedCategoriesDropdown: false,
    savedCategories: []
  }),
  getters: {
    sortedSavedCategories(state) {
      return [...state.savedCategories].sort((a, b) => a.localeCompare(b));
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
