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
    renderedCategoryLabels: []
  }),
  actions: {
    hydrateFromState(state, fields) {
      if (chartTypes.has(state.chartType)) this.chartType = state.chartType;

      const hasField = (id) => fields.some((field) => field.id === id);
      const hasNumeric = (id) => fields.some((field) => field.id === id && field.type === 'number');

      if (hasField(state.selectedLabelFieldId)) this.selectedLabelFieldId = state.selectedLabelFieldId;
      if (hasNumeric(state.selectedValueFieldId)) this.selectedValueFieldId = state.selectedValueFieldId;
      if (hasNumeric(state.selectedSecondaryValueFieldId)) this.selectedSecondaryValueFieldId = state.selectedSecondaryValueFieldId;
      if (hasField(state.selectedSeriesFieldId)) this.selectedSeriesFieldId = state.selectedSeriesFieldId;
    },
    requireManualRefresh(text) {
      this.manualRefreshRequired = true;
      this.message = text;
    },
    completeRender(labels) {
      this.manualRefreshRequired = false;
      this.message = '';
      this.hasRenderedChart = true;
      this.renderedCategoryLabels = labels;
    }
  }
});
