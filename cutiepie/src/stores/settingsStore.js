import { defineStore } from 'pinia';

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    autoSave: true,
    subtleSeparators: true
  })
});
