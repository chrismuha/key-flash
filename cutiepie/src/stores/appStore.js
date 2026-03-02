import { defineStore } from 'pinia';

export const useAppStore = defineStore('app', {
  state: () => ({
    saveStatus: 'Ready',
    lastSavedAt: null,
    lastUpdatedAt: null,
    lastSavedSnapshot: '',
    hasUnsavedChanges: false,
    isHydrating: true,
    showQuitModal: false
  }),
  actions: {
    markSaved(savedAt, snapshot) {
      this.lastSavedAt = savedAt || new Date().toISOString();
      this.lastSavedSnapshot = snapshot || '';
      this.lastUpdatedAt = null;
      this.hasUnsavedChanges = false;
      this.saveStatus = 'Saved to disk';
    },
    markUpdated(snapshot) {
      this.lastUpdatedAt = new Date().toISOString();
      this.refreshUnsaved(snapshot);
    },
    refreshUnsaved(snapshot) {
      if (!this.lastSavedSnapshot) {
        this.hasUnsavedChanges = Boolean(this.lastUpdatedAt);
      } else {
        this.hasUnsavedChanges = snapshot !== this.lastSavedSnapshot;
      }
    },
    markSettingsSaved(savedAt) {
      this.lastSavedAt = savedAt || new Date().toISOString();
      this.saveStatus = 'Settings saved to disk';
    }
  }
});
