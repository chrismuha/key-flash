(() => {
  const { createApp } = Vue;
  const FIELD_TYPES = new Set(['text', 'number', 'date']);
  const ALL_CHART_TYPES = new Set([
    'bar', 'column', 'stacked_bar', 'treemap', 'pareto', 'radar',
    'line', 'area', 'step', 'candlestick', 'sparkline',
    'pie', 'donut', 'funnel', 'waterfall', 'stacked_area',
    'scatter', 'bubble', 'sankey',
    'histogram', 'boxplot', 'dot',
    'geo_map', 'bubble_map', 'heatmap_map',
    'gantt', 'pictograph', 'heatmap',
    'bump', 'slope', 'chord'
  ]);
  const makeField = (name, type) => ({ id: crypto.randomUUID(), name, type });

  createApp({
    data() {
      const dayField = makeField('Day', 'date');
      const categoryField = makeField('Category', 'text');
      const valueField = makeField('Value', 'number');

      return {
        fields: [dayField, categoryField, valueField],
        rows: [{}, {}, {}],
        draftRows: [{}, {}, {}],
        newFieldName: '',
        newFieldType: 'text',
        chartType: 'pie',
        selectedLabelFieldId: dayField.id,
        selectedValueFieldId: valueField.id,
        selectedSecondaryValueFieldId: '',
        selectedSeriesFieldId: '',
        chart: null,
        activeRenderer: 'canvas',
        detachQuitListener: null,
        showQuitModal: false,
        refreshTimer: null,
        saveTimer: null,
        settingsSaveTimer: null,
        settingsMenuOpen: false,
        settings: {
          autoSave: true,
          subtleSeparators: true
        },
        saveStatus: 'Ready',
        lastSavedAt: null,
        lastUpdatedAt: null,
        lastSavedSnapshot: '',
        hasUnsavedChanges: false,
        isHydrating: true,
        manualRefreshRequired: false,
        hasRenderedChart: false,
        renderedCategoryLabels: [],
        message: ''
      };
    },
    computed: {
      numericFields() {
        return this.fields.filter((field) => field.type === 'number');
      }
    },
    async mounted() {
      window.__CUTIEPIE_HAS_UNSAVED = false;

      if (window.cutiepieDesktop?.onQuitRequested) {
        this.detachQuitListener = window.cutiepieDesktop.onQuitRequested(() => {
          this.showQuitModal = true;
        });
      }

      await this.loadPersistedSettings();
      await this.loadPersistedState();
      this.isHydrating = false;
      this.refreshSaveStateDifference();
      this.ensureChartSelectionsAreValid();
      this.scheduleChartRefresh();
    },
    beforeUnmount() {
      if (this.refreshTimer) {
        clearTimeout(this.refreshTimer);
      }
      if (this.saveTimer) {
        clearTimeout(this.saveTimer);
      }
      if (this.settingsSaveTimer) {
        clearTimeout(this.settingsSaveTimer);
      }
      if (typeof this.detachQuitListener === 'function') {
        this.detachQuitListener();
      }
      if (this.chart) {
        this.chart.destroy();
      }
      if (window.Plotly && this.$refs?.plotContainer) {
        window.Plotly.purge(this.$refs.plotContainer);
      }
    },
    watch: {
      chartType() {
        if (this.isHydrating) return;
        this.markActiveWorkUpdated();
        if (!this.manualRefreshRequired) {
          this.scheduleChartRefresh();
        }
        this.scheduleStateSave();
      },
      selectedLabelFieldId() {
        if (this.isHydrating) return;
        this.markActiveWorkUpdated();
        if (!this.manualRefreshRequired) {
          this.scheduleChartRefresh();
        }
        this.scheduleStateSave();
      },
      selectedValueFieldId() {
        if (this.isHydrating) return;
        this.markActiveWorkUpdated();
        if (!this.manualRefreshRequired) {
          this.scheduleChartRefresh();
        }
        this.scheduleStateSave();
      },
      selectedSecondaryValueFieldId() {
        if (this.isHydrating) return;
        this.markActiveWorkUpdated();
        if (!this.manualRefreshRequired) {
          this.scheduleChartRefresh();
        }
        this.scheduleStateSave();
      },
      selectedSeriesFieldId() {
        if (this.isHydrating) return;
        this.markActiveWorkUpdated();
        if (!this.manualRefreshRequired) {
          this.scheduleChartRefresh();
        }
        this.scheduleStateSave();
      },
      settings: {
        deep: true,
        handler() {
          if (this.isHydrating) return;
          this.scheduleSettingsSave();
          if (this.settings.autoSave) {
            this.saveStatus = 'Auto-save enabled';
            this.scheduleStateSave();
          } else {
            this.saveStatus = 'Auto-save off. Click Save Now to save future changes.';
          }
        }
      },
      fields: {
        deep: true,
        handler() {
          if (this.isHydrating) return;
          this.markActiveWorkUpdated();
          this.ensureChartSelectionsAreValid();
          if (!this.manualRefreshRequired) {
            this.scheduleChartRefresh();
          }
          this.scheduleStateSave();
        }
      },
      draftRows: {
        deep: true,
        handler() {
          if (this.isHydrating) return;
          this.markActiveWorkUpdated();
          this.scheduleStateSave();
        }
      },
      rows: {
        deep: true,
        handler() {
          if (this.isHydrating) return;
          this.markActiveWorkUpdated();
          if (this.detectNewCategoriesSinceLastRender()) {
            this.requireManualRefresh('New categories were added. Click Generate Chart to update the chart.');
            this.scheduleStateSave();
            return;
          }

          if (!this.manualRefreshRequired) {
            this.scheduleChartRefresh();
          }
          this.scheduleStateSave();
        }
      }
    },
    methods: {
      makeField(name, type) {
        return makeField(name, type);
      },
      sanitizeFields(input) {
        if (!Array.isArray(input)) {
          return [];
        }

        const cleaned = [];
        input.forEach((field) => {
          if (!field || typeof field !== 'object') {
            return;
          }

          const name = String(field.name || '').trim();
          const type = FIELD_TYPES.has(field.type) ? field.type : 'text';
          if (!name) {
            return;
          }

          cleaned.push({
            id: typeof field.id === 'string' && field.id ? field.id : crypto.randomUUID(),
            name,
            type
          });
        });

        return cleaned;
      },
      sanitizeRows(input, fields) {
        if (!Array.isArray(input)) {
          return [];
        }

        const fieldIds = new Set(fields.map((field) => field.id));
        const cleaned = input
          .filter((row) => row && typeof row === 'object')
          .map((row) => {
            const next = {};
            Object.keys(row).forEach((key) => {
              if (!fieldIds.has(key) || row[key] == null) {
                return;
              }
              next[key] = String(row[key]);
            });
            return next;
          });

        return cleaned;
      },
      cloneRows(rows) {
        if (!Array.isArray(rows)) {
          return [];
        }
        return rows.map((row) => ({ ...row }));
      },
      formatTimestamp(timestamp) {
        if (!timestamp) {
          return 'Never';
        }

        const date = new Date(timestamp);
        if (Number.isNaN(date.getTime())) {
          return 'Invalid date';
        }

        return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
      },
      buildComparableStatePayload() {
        const base = this.buildPersistedStatePayload();
        return {
          fields: base.fields,
          rows: base.rows,
          draftRows: base.draftRows,
          chartType: base.chartType,
          selectedLabelFieldId: base.selectedLabelFieldId,
          selectedValueFieldId: base.selectedValueFieldId,
          selectedSecondaryValueFieldId: base.selectedSecondaryValueFieldId,
          selectedSeriesFieldId: base.selectedSeriesFieldId
        };
      },
      refreshSaveStateDifference() {
        const currentSnapshot = JSON.stringify(this.buildComparableStatePayload());
        if (!this.lastSavedSnapshot) {
          this.hasUnsavedChanges = Boolean(this.lastUpdatedAt);
          window.__CUTIEPIE_HAS_UNSAVED = this.hasUnsavedChanges;
          return;
        }

        this.hasUnsavedChanges = currentSnapshot !== this.lastSavedSnapshot;
        window.__CUTIEPIE_HAS_UNSAVED = this.hasUnsavedChanges;
      },
      markActiveWorkUpdated() {
        if (this.isHydrating) {
          return;
        }

        this.lastUpdatedAt = new Date().toISOString();
        this.refreshSaveStateDifference();
      },
      buildPersistedStatePayload() {
        const safeFields = this.fields.map((field) => ({
          id: String(field.id || ''),
          name: String(field.name || ''),
          type: FIELD_TYPES.has(field.type) ? field.type : 'text'
        }));

        const fieldIds = new Set(safeFields.map((field) => field.id));
        const safeRows = this.rows.map((row) => {
          const next = {};
          Object.keys(row || {}).forEach((key) => {
            if (!fieldIds.has(key) || row[key] == null) {
              return;
            }
            next[key] = String(row[key]);
          });
          return next;
        });

        const safeDraftRows = this.draftRows.map((row) => {
          const next = {};
          Object.keys(row || {}).forEach((key) => {
            if (!fieldIds.has(key) || row[key] == null) {
              return;
            }
            next[key] = String(row[key]);
          });
          return next;
        });

        return {
          version: 1,
          fields: safeFields,
          rows: safeRows,
          draftRows: safeDraftRows,
          chartType: ALL_CHART_TYPES.has(this.chartType) ? this.chartType : 'pie',
          selectedLabelFieldId: String(this.selectedLabelFieldId || ''),
          selectedValueFieldId: String(this.selectedValueFieldId || ''),
          selectedSecondaryValueFieldId: String(this.selectedSecondaryValueFieldId || ''),
          selectedSeriesFieldId: String(this.selectedSeriesFieldId || ''),
          updatedAt: new Date().toISOString()
        };
      },
      buildPersistedSettingsPayload() {
        return {
          version: 1,
          autoSave: this.settings.autoSave !== false,
          subtleSeparators: this.settings.subtleSeparators !== false,
          updatedAt: new Date().toISOString()
        };
      },
      async loadPersistedSettings() {
        const settingsApi = window.cutiepieDesktop?.settings;
        if (!settingsApi) {
          this.saveStatus = 'Desktop settings API unavailable';
          return;
        }

        try {
          const result = await settingsApi.load();
          if (!result || !result.ok) {
            this.saveStatus = 'Failed to load settings';
            return;
          }

          const parsed = result.settings;
          if (!parsed || typeof parsed !== 'object') {
            this.saveStatus = 'Using default settings';
            return;
          }

          this.settings.autoSave = parsed.autoSave !== false;
          this.settings.subtleSeparators = parsed.subtleSeparators !== false;
          this.saveStatus = 'Loaded settings';
        } catch (error) {
          this.saveStatus = 'Failed to load settings';
        }
      },
      async loadPersistedState() {
        const stateApi = window.cutiepieDesktop?.state;
        if (!stateApi) {
          this.saveStatus = 'Desktop storage API unavailable';
          return;
        }

        try {
          const result = await stateApi.load();
          if (!result || !result.ok) {
            this.saveStatus = 'Failed to load saved data';
            return;
          }

          const parsed = result.state;
          if (!parsed) {
            this.saveStatus = 'No saved data found';
            return;
          }

          const loadedFields = this.sanitizeFields(parsed.fields);
          if (loadedFields.length > 0) {
            this.fields = loadedFields;
          }

          const loadedRows = this.sanitizeRows(parsed.rows, this.fields);
          this.rows = loadedRows.length > 0 ? loadedRows : [{}, {}, {}];
          const loadedDraftRows = this.sanitizeRows(parsed.draftRows, this.fields);
          this.draftRows = loadedDraftRows.length > 0 ? loadedDraftRows : this.cloneRows(this.rows);

          if (ALL_CHART_TYPES.has(parsed.chartType)) {
            this.chartType = parsed.chartType;
          }

          if (parsed.selectedLabelFieldId && this.fields.some((field) => field.id === parsed.selectedLabelFieldId)) {
            this.selectedLabelFieldId = parsed.selectedLabelFieldId;
          }

          if (parsed.selectedValueFieldId && this.numericFields.some((field) => field.id === parsed.selectedValueFieldId)) {
            this.selectedValueFieldId = parsed.selectedValueFieldId;
          }
          if (parsed.selectedSecondaryValueFieldId && this.numericFields.some((field) => field.id === parsed.selectedSecondaryValueFieldId)) {
            this.selectedSecondaryValueFieldId = parsed.selectedSecondaryValueFieldId;
          }
          if (parsed.selectedSeriesFieldId && this.fields.some((field) => field.id === parsed.selectedSeriesFieldId)) {
            this.selectedSeriesFieldId = parsed.selectedSeriesFieldId;
          }

          this.lastSavedAt = typeof parsed.updatedAt === 'string' ? parsed.updatedAt : null;
          this.lastSavedSnapshot = JSON.stringify(this.buildComparableStatePayload());
          this.hasUnsavedChanges = false;
          this.lastUpdatedAt = null;
          this.saveStatus = 'Loaded saved data';
        } catch (error) {
          this.saveStatus = 'Failed to load saved data';
        }
      },
      async saveLocalState(force = false) {
        if (!force && !this.settings.autoSave) {
          return;
        }

        const stateApi = window.cutiepieDesktop?.state;
        if (!stateApi) {
          this.saveStatus = 'Desktop storage API unavailable';
          return;
        }

        try {
          const payload = this.buildPersistedStatePayload();

          const result = await stateApi.save(payload);
          if (!result || !result.ok) {
            this.saveStatus = 'Save failed';
            return;
          }

          this.lastSavedAt = payload.updatedAt;
          this.lastSavedSnapshot = JSON.stringify(this.buildComparableStatePayload());
          this.hasUnsavedChanges = false;
          this.lastUpdatedAt = null;
          this.saveStatus = force ? 'Saved to disk (manual)' : 'Saved to disk';
        } catch (error) {
          this.saveStatus = 'Save failed';
        }
      },
      async clearLocalState() {
        const stateApi = window.cutiepieDesktop?.state;
        if (!stateApi) {
          this.saveStatus = 'Desktop storage API unavailable';
          return;
        }

        try {
          const result = await stateApi.clear();
          if (!result || !result.ok) {
            this.saveStatus = 'Could not clear saved data';
            return;
          }

          this.lastSavedAt = null;
          this.lastSavedSnapshot = '';
          this.lastUpdatedAt = new Date().toISOString();
          this.refreshSaveStateDifference();
          this.saveStatus = 'Saved data cleared';
        } catch (error) {
          this.saveStatus = 'Could not clear saved data';
        }
      },
      async saveSettings() {
        const settingsApi = window.cutiepieDesktop?.settings;
        if (!settingsApi) {
          this.saveStatus = 'Desktop settings API unavailable';
          return;
        }

        try {
          const payload = this.buildPersistedSettingsPayload();
          const result = await settingsApi.save(payload);
          if (!result || !result.ok) {
            this.saveStatus = 'Settings save failed';
            return;
          }
        } catch (error) {
          this.saveStatus = 'Settings save failed';
        }
      },
      scheduleSettingsSave() {
        if (this.settingsSaveTimer) {
          clearTimeout(this.settingsSaveTimer);
        }

        this.settingsSaveTimer = setTimeout(() => {
          void this.saveSettings();
        }, 160);
      },
      scheduleStateSave() {
        if (!this.settings.autoSave) {
          return;
        }

        if (this.saveTimer) {
          clearTimeout(this.saveTimer);
        }

        this.saveTimer = setTimeout(() => {
          void this.saveLocalState();
        }, 220);
      },
      toggleSettingsMenu() {
        this.settingsMenuOpen = !this.settingsMenuOpen;
      },
      async cancelQuit() {
        this.showQuitModal = false;
        if (window.cutiepieDesktop?.quit?.cancel) {
          await window.cutiepieDesktop.quit.cancel();
        }
      },
      async confirmQuit() {
        if (window.cutiepieDesktop?.quit?.confirm) {
          await window.cutiepieDesktop.quit.confirm();
        }
      },
      inputType(type) {
        if (type === 'number') return 'number';
        if (type === 'date') return 'date';
        return 'text';
      },
      addField() {
        if (!this.newFieldName) return;

        const field = this.makeField(this.newFieldName, this.newFieldType);
        this.fields.push(field);
        this.newFieldName = '';
        this.newFieldType = 'text';
        this.ensureChartSelectionsAreValid();
        this.requireManualRefresh('Fields changed. Click Generate Chart to apply the new structure.');
      },
      removeField(fieldId) {
        const index = this.fields.findIndex((field) => field.id === fieldId);
        if (index === -1) return;

        this.fields.splice(index, 1);

        if (this.fields.length === 0) {
          this.fields.push(this.makeField('Value', 'number'));
        }

        this.rows = this.rows.map((row) => {
          const next = { ...row };
          delete next[fieldId];
          return next;
        });

        this.draftRows = this.draftRows.map((row) => {
          const next = { ...row };
          delete next[fieldId];
          return next;
        });

        this.ensureChartSelectionsAreValid();
        this.requireManualRefresh('Fields changed. Click Generate Chart to apply the new structure.');
      },
      addRow() {
        this.draftRows.push({});
      },
      updateCell(rowIndex, fieldId, value) {
        this.draftRows[rowIndex][fieldId] = value;
      },
      applyDataEntries() {
        this.rows = this.cloneRows(this.draftRows);
        this.saveStatus = 'Applied all data entries';
        if (!this.manualRefreshRequired) {
          this.scheduleChartRefresh();
        }
      },
      applyRowEntry(rowIndex) {
        if (rowIndex < 0 || rowIndex >= this.draftRows.length) {
          return;
        }

        const rowCopy = { ...this.draftRows[rowIndex] };
        if (rowIndex >= this.rows.length) {
          this.rows.push(...Array.from({ length: rowIndex - this.rows.length + 1 }, () => ({})));
        }
        this.rows[rowIndex] = rowCopy;
        this.saveStatus = `Applied row ${rowIndex + 1}`;

        if (!this.manualRefreshRequired) {
          this.scheduleChartRefresh();
        }
      },
      deleteRow(rowIndex) {
        if (rowIndex < 0 || rowIndex >= this.draftRows.length) {
          return;
        }

        this.draftRows.splice(rowIndex, 1);
        if (rowIndex < this.rows.length) {
          this.rows.splice(rowIndex, 1);
        }

        if (this.draftRows.length === 0) {
          this.draftRows.push({});
        }
        if (this.rows.length === 0) {
          this.rows.push({});
        }

        this.saveStatus = `Deleted row ${rowIndex + 1}`;
        if (!this.manualRefreshRequired) {
          this.scheduleChartRefresh();
        }
      },
      scheduleChartRefresh() {
        if (this.refreshTimer) {
          clearTimeout(this.refreshTimer);
        }

        this.refreshTimer = setTimeout(() => {
          this.generateChart();
        }, 100);
      },
      requireManualRefresh(text) {
        this.manualRefreshRequired = true;
        this.message = text;
      },
      ensureChartSelectionsAreValid() {
        if (!this.fields.find((field) => field.id === this.selectedLabelFieldId)) {
          this.selectedLabelFieldId = this.fields[0]?.id || '';
        }

        if (!this.numericFields.find((field) => field.id === this.selectedValueFieldId)) {
          this.selectedValueFieldId = this.numericFields[0]?.id || '';
        }

        if (!this.numericFields.find((field) => field.id === this.selectedSecondaryValueFieldId)) {
          this.selectedSecondaryValueFieldId = '';
        }

        if (!this.fields.find((field) => field.id === this.selectedSeriesFieldId)) {
          this.selectedSeriesFieldId = '';
        }
      },
      collectChartData() {
        const points = this.rows
          .map((row) => ({
            label: row[this.selectedLabelFieldId],
            value: Number(row[this.selectedValueFieldId]),
            secondaryValue: this.selectedSecondaryValueFieldId ? Number(row[this.selectedSecondaryValueFieldId]) : null,
            series: this.selectedSeriesFieldId ? String(row[this.selectedSeriesFieldId] || '') : ''
          }))
          .filter((point) => point.label && Number.isFinite(point.value));

        const labelField = this.fields.find((field) => field.id === this.selectedLabelFieldId);
        if (['line', 'area', 'step', 'sparkline', 'stacked_area', 'bump', 'slope'].includes(this.chartType) && labelField?.type === 'date') {
          points.sort((a, b) => new Date(a.label).getTime() - new Date(b.label).getTime());
        }

        return points;
      },
      aggregateByLabel(points) {
        const byLabel = new Map();
        points.forEach((point) => {
          const key = String(point.label);
          byLabel.set(key, (byLabel.get(key) || 0) + point.value);
        });
        return [...byLabel.entries()].map(([label, value]) => ({ label, value }));
      },
      buildStackedBySeries(points) {
        const labels = [...new Set(points.map((p) => String(p.label)))];
        const seriesNames = [...new Set(points.map((p) => p.series || 'Series'))];
        const palette = ['#e44f6b', '#1f9cc2', '#f7a541', '#5f7cff', '#5abf90', '#8d63c7', '#ec6f4c'];
        const datasets = seriesNames.map((seriesName, idx) => {
          const data = labels.map((label) =>
            points
              .filter((p) => String(p.label) === label && (p.series || 'Series') === seriesName)
              .reduce((sum, p) => sum + p.value, 0)
          );
          return {
            label: seriesName,
            data,
            backgroundColor: palette[idx % palette.length],
            borderColor: palette[idx % palette.length],
            fill: this.chartType === 'stacked_area'
          };
        });

        return { labels, datasets };
      },
      clearPreviousChartOutput() {
        if (this.chart) {
          this.chart.destroy();
          this.chart = null;
        }
        if (window.Plotly && this.$refs?.plotContainer) {
          window.Plotly.purge(this.$refs.plotContainer);
          this.$refs.plotContainer.innerHTML = '';
        }
      },
      renderPlotly(figureData, layout = {}) {
        if (!window.Plotly || !this.$refs?.plotContainer) {
          this.message = 'Plotly did not load.';
          return false;
        }
        this.activeRenderer = 'plotly';
        window.Plotly.newPlot(this.$refs.plotContainer, figureData, {
          margin: { l: 44, r: 22, t: 24, b: 42 },
          paper_bgcolor: 'rgba(0,0,0,0)',
          plot_bgcolor: 'rgba(0,0,0,0)',
          ...layout
        }, { responsive: true, displaylogo: false });
        return true;
      },
      toStateCode(value) {
        const normalized = String(value || '').trim().toUpperCase();
        if (/^[A-Z]{2}$/.test(normalized)) return normalized;
        return '';
      },
      renderChordDiagram(points) {
        if (!window.d3 || !this.$refs?.plotContainer) {
          this.message = 'D3 did not load.';
          return false;
        }
        if (!this.selectedSeriesFieldId) {
          this.message = 'Chord diagram needs a Series / Group field.';
          return false;
        }

        const container = this.$refs.plotContainer;
        container.innerHTML = '';
        this.activeRenderer = 'd3';

        const nodes = [...new Set(points.flatMap((p) => [String(p.label), String(p.series || 'Series')]))];
        const indexMap = new Map(nodes.map((name, index) => [name, index]));
        const matrix = Array.from({ length: nodes.length }, () => Array.from({ length: nodes.length }, () => 0));
        points.forEach((point) => {
          const src = indexMap.get(String(point.label));
          const dst = indexMap.get(String(point.series || 'Series'));
          if (src == null || dst == null) return;
          matrix[src][dst] += point.value;
        });

        const width = Math.max(720, container.clientWidth || 720);
        const height = 420;
        const outerRadius = Math.min(width, height) * 0.45;
        const innerRadius = outerRadius - 20;
        const color = window.d3.scaleOrdinal(window.d3.schemeTableau10);

        const svg = window.d3.create('svg').attr('viewBox', `${-width / 2} ${-height / 2} ${width} ${height}`);
        const chord = window.d3.chordDirected().padAngle(0.04).sortSubgroups(window.d3.descending)(matrix);
        const arc = window.d3.arc().innerRadius(innerRadius).outerRadius(outerRadius);
        const ribbon = window.d3.ribbonArrow().radius(innerRadius - 1).padAngle(1 / innerRadius);

        svg.append('g')
          .selectAll('path')
          .data(chord.groups)
          .join('path')
          .attr('fill', (d) => color(d.index))
          .attr('stroke', '#ffffff')
          .attr('d', arc);

        svg.append('g')
          .attr('fill-opacity', 0.78)
          .selectAll('path')
          .data(chord)
          .join('path')
          .attr('d', ribbon)
          .attr('fill', (d) => color(d.target.index))
          .attr('stroke', '#d6deee');

        svg.append('g')
          .attr('font-size', 10)
          .attr('font-family', 'Manrope, sans-serif')
          .selectAll('text')
          .data(chord.groups)
          .join('text')
          .each((d) => {
            d.angle = (d.startAngle + d.endAngle) / 2;
          })
          .attr('dy', '0.35em')
          .attr('transform', (d) => `
            rotate(${(d.angle * 180) / Math.PI - 90})
            translate(${outerRadius + 6})
            ${d.angle > Math.PI ? 'rotate(180)' : ''}
          `)
          .attr('text-anchor', (d) => (d.angle > Math.PI ? 'end' : null))
          .text((d) => nodes[d.index].slice(0, 18));

        container.appendChild(svg.node());
        return true;
      },
      renderPictograph(points) {
        if (!this.$refs?.plotContainer) return false;
        const container = this.$refs.plotContainer;
        container.innerHTML = '';
        this.activeRenderer = 'plotly';

        const rows = this.aggregateByLabel(points).slice(0, 8);
        const maxVal = Math.max(...rows.map((r) => r.value), 1);
        const wrapper = document.createElement('div');
        wrapper.style.padding = '12px';
        wrapper.style.fontFamily = 'Manrope, sans-serif';
        rows.forEach((row) => {
          const line = document.createElement('div');
          line.style.display = 'flex';
          line.style.alignItems = 'center';
          line.style.gap = '10px';
          line.style.margin = '8px 0';

          const label = document.createElement('div');
          label.style.width = '160px';
          label.style.fontWeight = '700';
          label.textContent = row.label;

          const icons = document.createElement('div');
          const count = Math.max(1, Math.round((row.value / maxVal) * 20));
          icons.textContent = '■'.repeat(count);
          icons.style.color = '#1f9cc2';
          icons.style.letterSpacing = '1px';

          const value = document.createElement('div');
          value.textContent = String(row.value);
          value.style.color = '#5d6784';

          line.append(label, icons, value);
          wrapper.appendChild(line);
        });
        container.appendChild(wrapper);
        return true;
      },
      detectNewCategoriesSinceLastRender() {
        if (!this.hasRenderedChart) {
          return false;
        }

        const currentLabels = [
          ...new Set(
            this.collectChartData()
              .map((point) => String(point.label))
              .filter(Boolean)
          )
        ];

        return currentLabels.some((label) => !this.renderedCategoryLabels.includes(label));
      },
      generateChart() {
        this.ensureChartSelectionsAreValid();

        if (this.refreshTimer) {
          clearTimeout(this.refreshTimer);
        }

        if (!this.selectedValueFieldId) {
          this.message = 'Please add at least one number field for chart values.';
          return;
        }

        const points = this.collectChartData();
        if (points.length === 0) {
          this.message = 'Add at least one valid row before generating a chart.';
          return;
        }

        this.clearPreviousChartOutput();
        this.activeRenderer = 'canvas';

        const palette = ['#e44f6b', '#1f9cc2', '#f7a541', '#5f7cff', '#5abf90', '#8d63c7', '#ec6f4c'];

        let chartConfig = null;
        const aggregate = this.aggregateByLabel(points);

        if (this.chartType === 'bar' || this.chartType === 'column' || this.chartType === 'line' || this.chartType === 'area' || this.chartType === 'step' || this.chartType === 'sparkline' || this.chartType === 'radar' || this.chartType === 'pie' || this.chartType === 'donut' || this.chartType === 'funnel') {
          const typeMap = {
            bar: 'bar',
            column: 'bar',
            line: 'line',
            area: 'line',
            step: 'line',
            sparkline: 'line',
            radar: 'radar',
            pie: 'pie',
            donut: 'doughnut',
            funnel: 'bar'
          };
          const values = aggregate.map((item) => item.value);
          if (this.chartType === 'funnel') {
            aggregate.sort((a, b) => b.value - a.value);
          }

          chartConfig = {
            type: typeMap[this.chartType],
            data: {
              labels: aggregate.map((item) => item.label),
              datasets: [
                {
                  label: 'Dataset',
                  data: this.chartType === 'funnel' ? aggregate.map((item) => item.value) : values,
                  borderColor: '#1f9cc2',
                  backgroundColor: aggregate.map((_, i) => palette[i % palette.length]),
                  pointBackgroundColor: '#e44f6b',
                  pointRadius: this.chartType === 'sparkline' ? 0 : 4,
                  tension: 0.28,
                  stepped: this.chartType === 'step',
                  fill: this.chartType === 'area'
                }
              ]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: this.chartType !== 'sparkline',
                  position: 'bottom'
                }
              },
              indexAxis: this.chartType === 'bar' || this.chartType === 'funnel' ? 'y' : 'x',
              scales: this.chartType === 'sparkline' ? { x: { display: false }, y: { display: false } } : { y: { beginAtZero: true } }
            }
          };
        } else if (this.chartType === 'stacked_bar' || this.chartType === 'stacked_area') {
          const stacked = this.buildStackedBySeries(points);
          chartConfig = {
            type: this.chartType === 'stacked_area' ? 'line' : 'bar',
            data: stacked,
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { display: true, position: 'bottom' } },
              scales: { x: { stacked: true }, y: { stacked: true, beginAtZero: true } }
            }
          };
        } else if (this.chartType === 'pareto') {
          const sorted = this.aggregateByLabel(points).sort((a, b) => b.value - a.value);
          const total = sorted.reduce((sum, item) => sum + item.value, 0) || 1;
          let running = 0;
          const cumulative = sorted.map((item) => {
            running += item.value;
            return (running / total) * 100;
          });
          chartConfig = {
            type: 'bar',
            data: {
              labels: sorted.map((item) => item.label),
              datasets: [
                { type: 'bar', label: 'Value', data: sorted.map((item) => item.value), backgroundColor: sorted.map((_, i) => palette[i % palette.length]) },
                { type: 'line', label: 'Cumulative %', data: cumulative, borderColor: '#1f9cc2', yAxisID: 'y1', tension: 0.25 }
              ]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              scales: { y: { beginAtZero: true }, y1: { beginAtZero: true, max: 100, position: 'right' } },
              plugins: { legend: { display: true, position: 'bottom' } }
            }
          };
        } else if (this.chartType === 'waterfall') {
          const ordered = points.map((p) => ({ label: String(p.label), value: p.value }));
          let running = 0;
          const floating = ordered.map((item) => {
            const start = running;
            running += item.value;
            return [start, running];
          });
          chartConfig = {
            type: 'bar',
            data: {
              labels: ordered.map((item) => item.label),
              datasets: [{ label: 'Waterfall', data: floating, backgroundColor: ordered.map((item) => (item.value >= 0 ? '#5abf90' : '#c84b62')) }]
            },
            options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true } }, plugins: { legend: { display: true, position: 'bottom' } } }
          };
        } else if (this.chartType === 'scatter' || this.chartType === 'dot') {
          const labelField = this.fields.find((f) => f.id === this.selectedLabelFieldId);
          const scatterPoints = points.map((point, idx) => ({
            x: labelField?.type === 'number' ? Number(point.label) : labelField?.type === 'date' ? new Date(point.label).getTime() : idx + 1,
            y: this.chartType === 'dot' ? point.value : point.value
          })).filter((p) => Number.isFinite(p.x) && Number.isFinite(p.y));

          chartConfig = {
            type: 'scatter',
            data: { datasets: [{ label: this.chartType === 'dot' ? 'Dot Plot' : 'Scatter', data: scatterPoints, backgroundColor: '#1f9cc2' }] },
            options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true } }, plugins: { legend: { display: true, position: 'bottom' } } }
          };
        } else if (this.chartType === 'bubble') {
          const labelField = this.fields.find((f) => f.id === this.selectedLabelFieldId);
          const bubblePoints = points.map((point, idx) => {
            const x = labelField?.type === 'number' ? Number(point.label) : labelField?.type === 'date' ? new Date(point.label).getTime() : idx + 1;
            const sizeSource = Number.isFinite(point.secondaryValue) ? point.secondaryValue : Math.abs(point.value);
            return { x, y: point.value, r: Math.max(4, Math.min(24, Math.abs(sizeSource))) };
          }).filter((p) => Number.isFinite(p.x) && Number.isFinite(p.y));

          chartConfig = {
            type: 'bubble',
            data: { datasets: [{ label: 'Bubble', data: bubblePoints, backgroundColor: 'rgba(31,156,194,0.5)', borderColor: '#1f9cc2' }] },
            options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true } }, plugins: { legend: { display: true, position: 'bottom' } } }
          };
        } else if (this.chartType === 'histogram') {
          const values = points.map((point) => point.value);
          const min = Math.min(...values);
          const max = Math.max(...values);
          const bins = Math.min(12, Math.max(5, Math.round(Math.sqrt(values.length))));
          const span = max - min || 1;
          const width = span / bins;
          const counts = Array.from({ length: bins }, () => 0);
          values.forEach((v) => {
            const idx = Math.min(bins - 1, Math.floor((v - min) / width));
            counts[idx] += 1;
          });
          const labels = counts.map((_, idx) => {
            const start = min + idx * width;
            const end = start + width;
            return `${start.toFixed(1)}-${end.toFixed(1)}`;
          });
          chartConfig = {
            type: 'bar',
            data: { labels, datasets: [{ label: 'Frequency', data: counts, backgroundColor: '#1f9cc2' }] },
            options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true } }, plugins: { legend: { display: true, position: 'bottom' } } }
          };
        } else if (this.chartType === 'slope') {
          const ordered = this.aggregateByLabel(points);
          if (ordered.length < 2) {
            this.message = 'Slope chart needs at least two labels.';
            return;
          }
          const first = ordered[0];
          const last = ordered[ordered.length - 1];
          chartConfig = {
            type: 'line',
            data: {
              labels: [first.label, last.label],
              datasets: [{ label: 'Slope', data: [first.value, last.value], borderColor: '#1f9cc2', backgroundColor: '#e44f6b', tension: 0 }]
            },
            options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true } }, plugins: { legend: { display: true, position: 'bottom' } } }
          };
        } else if (this.chartType === 'bump') {
          if (!this.selectedSeriesFieldId) {
            this.message = 'Bump chart needs a Series / Group field.';
            return;
          }
          const labels = [...new Set(points.map((p) => String(p.label)))];
          const seriesNames = [...new Set(points.map((p) => p.series || 'Series'))];
          const byLabel = new Map();
          labels.forEach((label) => {
            const seriesValues = seriesNames.map((series) => ({
              series,
              value: points
                .filter((p) => String(p.label) === label && (p.series || 'Series') === series)
                .reduce((sum, p) => sum + p.value, 0)
            })).sort((a, b) => b.value - a.value);
            byLabel.set(label, seriesValues);
          });
          chartConfig = {
            type: 'line',
            data: {
              labels,
              datasets: seriesNames.map((series, idx) => ({
                label: series,
                data: labels.map((label) => {
                  const ranked = byLabel.get(label) || [];
                  const rankIndex = ranked.findIndex((item) => item.series === series);
                  return rankIndex === -1 ? null : rankIndex + 1;
                }),
                borderColor: palette[idx % palette.length],
                backgroundColor: palette[idx % palette.length],
                spanGaps: true,
                tension: 0.2
              }))
            },
            options: { responsive: true, maintainAspectRatio: false, scales: { y: { reverse: true, beginAtZero: false, ticks: { precision: 0 } } }, plugins: { legend: { display: true, position: 'bottom' } } }
          };
        } else if (this.chartType === 'treemap') {
          this.renderPlotly([{
            type: 'treemap',
            labels: points.map((p) => String(p.label)),
            parents: points.map((p) => String(p.series || 'All')),
            values: points.map((p) => p.value),
            textinfo: 'label+value'
          }]);
        } else if (this.chartType === 'candlestick') {
          const x = points.map((p) => String(p.label));
          const close = points.map((p) => p.value);
          const open = points.map((p, i) => Number.isFinite(p.secondaryValue) ? p.secondaryValue : (i === 0 ? p.value : close[i - 1]));
          const high = close.map((c, i) => Math.max(c, open[i]) + Math.abs(c - open[i]) * 0.6 + 1);
          const low = close.map((c, i) => Math.min(c, open[i]) - Math.abs(c - open[i]) * 0.6 - 1);
          this.renderPlotly([{ type: 'candlestick', x, open, high, low, close }]);
        } else if (this.chartType === 'sankey') {
          if (!this.selectedSeriesFieldId) {
            this.message = 'Sankey needs a Series / Group field.';
            return;
          }
          const nodeNames = [...new Set(points.flatMap((p) => [String(p.label), String(p.series || 'Series')]))];
          const nodeIndex = new Map(nodeNames.map((name, idx) => [name, idx]));
          this.renderPlotly([{
            type: 'sankey',
            node: { label: nodeNames, pad: 12, thickness: 16 },
            link: {
              source: points.map((p) => nodeIndex.get(String(p.label))),
              target: points.map((p) => nodeIndex.get(String(p.series || 'Series'))),
              value: points.map((p) => p.value)
            }
          }]);
        } else if (this.chartType === 'boxplot') {
          const grouped = new Map();
          points.forEach((p) => {
            const key = String(p.label);
            if (!grouped.has(key)) grouped.set(key, []);
            grouped.get(key).push(p.value);
          });
          this.renderPlotly([...grouped.entries()].map(([label, values]) => ({
            type: 'box',
            name: label,
            y: values,
            boxpoints: 'outliers'
          })));
        } else if (this.chartType === 'geo_map' || this.chartType === 'heatmap_map') {
          const aggregateStates = this.aggregateByLabel(points)
            .map((p) => ({ code: this.toStateCode(p.label), value: p.value }))
            .filter((p) => p.code);
          if (aggregateStates.length === 0) {
            this.message = 'Geo map needs US state codes in Label field (example: CA, NY, TX).';
            return;
          }
          this.renderPlotly([{
            type: 'choropleth',
            locationmode: 'USA-states',
            locations: aggregateStates.map((p) => p.code),
            z: aggregateStates.map((p) => p.value),
            colorscale: this.chartType === 'heatmap_map' ? 'YlOrRd' : 'Blues',
            colorbar: { title: 'Value' }
          }], { geo: { scope: 'usa' } });
        } else if (this.chartType === 'bubble_map') {
          const aggregateStates = this.aggregateByLabel(points)
            .map((p) => ({ code: this.toStateCode(p.label), value: p.value }))
            .filter((p) => p.code);
          if (aggregateStates.length === 0) {
            this.message = 'Bubble map needs US state codes in Label field (example: CA, NY, TX).';
            return;
          }
          this.renderPlotly([{
            type: 'scattergeo',
            locationmode: 'USA-states',
            locations: aggregateStates.map((p) => p.code),
            text: aggregateStates.map((p) => `${p.code}: ${p.value}`),
            marker: {
              size: aggregateStates.map((p) => Math.max(8, Math.min(40, p.value))),
              color: aggregateStates.map((p) => p.value),
              colorscale: 'Viridis',
              line: { width: 1, color: '#ffffff' }
            },
            mode: 'markers'
          }], { geo: { scope: 'usa' } });
        } else if (this.chartType === 'gantt') {
          if (!this.selectedSeriesFieldId) {
            this.message = 'Gantt needs Series / Group as start date field.';
            return;
          }
          const tasks = points
            .map((p) => {
              const start = new Date(String(p.series));
              if (Number.isNaN(start.getTime())) return null;
              const end = new Date(start.getTime() + Math.max(1, p.value) * 24 * 60 * 60 * 1000);
              return { task: String(p.label), start, end, value: p.value };
            })
            .filter(Boolean);
          if (tasks.length === 0) {
            this.message = 'Gantt needs valid date values in Series / Group and numeric duration in Value.';
            return;
          }
          this.renderPlotly([{
            type: 'bar',
            orientation: 'h',
            y: tasks.map((t) => t.task),
            x: tasks.map((t) => (t.end.getTime() - t.start.getTime()) / 86400000),
            base: tasks.map((t) => t.start.toISOString()),
            marker: { color: '#1f9cc2' }
          }], { barmode: 'stack', xaxis: { type: 'date' } });
        } else if (this.chartType === 'pictograph') {
          if (!this.renderPictograph(points)) return;
        } else if (this.chartType === 'heatmap') {
          if (!this.selectedSeriesFieldId) {
            this.message = 'Heatmap needs a Series / Group field.';
            return;
          }
          const x = [...new Set(points.map((p) => String(p.label)))];
          const y = [...new Set(points.map((p) => String(p.series || 'Series')))];
          const z = y.map((series) =>
            x.map((label) =>
              points
                .filter((p) => String(p.label) === label && String(p.series || 'Series') === series)
                .reduce((sum, p) => sum + p.value, 0)
            )
          );
          this.renderPlotly([{ type: 'heatmap', x, y, z, colorscale: 'YlGnBu' }]);
        } else if (this.chartType === 'chord') {
          if (!this.renderChordDiagram(points)) return;
        }

        if (!chartConfig) {
          if (this.activeRenderer === 'plotly' || this.activeRenderer === 'd3') {
            this.hasRenderedChart = true;
            this.renderedCategoryLabels = [...new Set(points.map((point) => String(point.label)).filter(Boolean))];
            this.manualRefreshRequired = false;
            this.message = '';
            this.scheduleStateSave();
            return;
          }
          this.message = 'Could not generate this chart with current data.';
          return;
        }

        this.chart = new Chart(this.$refs.chartCanvas, chartConfig);

        this.hasRenderedChart = true;
        this.renderedCategoryLabels = [...new Set(points.map((point) => String(point.label)).filter(Boolean))];
        this.manualRefreshRequired = false;
        this.message = '';
        this.scheduleStateSave();
      }
    }
  }).mount('#app');
})();
