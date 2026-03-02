import { defineStore } from 'pinia';

const makeField = (name, type) => ({ id: crypto.randomUUID(), name, type });
const FIELD_TYPES = new Set(['text', 'number', 'date']);

export const useDataStore = defineStore('data', {
  state: () => {
    const day = makeField('Day', 'date');
    const category = makeField('Category', 'text');
    const value = makeField('Value', 'number');

    return {
      fields: [day, category, value],
      rows: [{}, {}, {}],
      draftRows: [{}, {}, {}],
      templates: []
    };
  },
  getters: {
    numericFields(state) {
      return state.fields.filter((field) => field.type === 'number');
    },
    sortedFields(state) {
      return [...state.fields].sort((a, b) => a.name.localeCompare(b.name));
    },
    sortedNumericFields() {
      return this.sortedFields.filter((field) => field.type === 'number');
    }
  },
  actions: {
    sanitizeFields(fields) {
      if (!Array.isArray(fields)) return [];
      return fields
        .filter((field) => field && typeof field === 'object')
        .map((field) => ({
          id: typeof field.id === 'string' && field.id ? field.id : crypto.randomUUID(),
          name: String(field.name || '').trim(),
          type: FIELD_TYPES.has(field.type) ? field.type : 'text'
        }))
        .filter((field) => field.name);
    },
    sanitizeRows(rows, fields) {
      if (!Array.isArray(rows)) return [];
      const ids = new Set(fields.map((field) => field.id));
      return rows
        .filter((row) => row && typeof row === 'object')
        .map((row) => {
          const next = {};
          Object.keys(row).forEach((key) => {
            if (!ids.has(key) || row[key] == null) return;
            next[key] = String(row[key]);
          });
          return next;
        });
    },
    sanitizeTemplates(templates) {
      if (!Array.isArray(templates)) return [];
      return templates
        .filter((template) => template && typeof template === 'object')
        .map((template) => {
          const fields = this.sanitizeFields(template.fields);
          const rows = this.sanitizeRows(template.rows, fields);
          const draftRows = this.sanitizeRows(template.draftRows, fields);
          return {
            id: typeof template.id === 'string' && template.id ? template.id : crypto.randomUUID(),
            name: String(template.name || '').trim() || 'Template',
            createdAt: typeof template.createdAt === 'string' ? template.createdAt : new Date().toISOString(),
            updatedAt: typeof template.updatedAt === 'string' ? template.updatedAt : new Date().toISOString(),
            fields,
            rows,
            draftRows: draftRows.length ? draftRows : rows.map((row) => ({ ...row })),
            chartSelection: template.chartSelection && typeof template.chartSelection === 'object'
              ? {
                  chartType: String(template.chartSelection.chartType || ''),
                  selectedLabelFieldId: String(template.chartSelection.selectedLabelFieldId || ''),
                  selectedValueFieldId: String(template.chartSelection.selectedValueFieldId || ''),
                  selectedSecondaryValueFieldId: String(template.chartSelection.selectedSecondaryValueFieldId || ''),
                  selectedSeriesFieldId: String(template.chartSelection.selectedSeriesFieldId || '')
                }
              : null
          };
        });
    },
    hydrateFromState(state) {
      const fields = this.sanitizeFields(state.fields);
      if (fields.length > 0) this.fields = fields;

      const rows = this.sanitizeRows(state.rows, this.fields);
      this.rows = rows.length > 0 ? rows : [{}, {}, {}];

      const drafts = this.sanitizeRows(state.draftRows, this.fields);
      this.draftRows = drafts.length > 0 ? drafts : this.rows.map((row) => ({ ...row }));

      this.templates = this.sanitizeTemplates(state.templates);
    },
    addField(name, type) {
      const trimmed = String(name || '').trim();
      if (!trimmed) return;
      this.fields.push(makeField(trimmed, type));
    },
    removeField(fieldId) {
      this.fields = this.fields.filter((field) => field.id !== fieldId);
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
      if (this.fields.length === 0) {
        this.fields.push(makeField('Value', 'number'));
      }
    },
    addRow() {
      this.draftRows.push({});
    },
    updateDraftCell(rowIndex, fieldId, value) {
      if (!this.draftRows[rowIndex]) this.draftRows[rowIndex] = {};
      this.draftRows[rowIndex][fieldId] = value;
    },
    applyAllRows() {
      this.rows = this.draftRows.map((row) => ({ ...row }));
    },
    applyRow(rowIndex) {
      if (!this.draftRows[rowIndex]) return;
      while (this.rows.length <= rowIndex) this.rows.push({});
      this.rows[rowIndex] = { ...this.draftRows[rowIndex] };
    },
    deleteRow(rowIndex) {
      this.draftRows.splice(rowIndex, 1);
      if (rowIndex < this.rows.length) this.rows.splice(rowIndex, 1);
      if (this.draftRows.length === 0) this.draftRows.push({});
      if (this.rows.length === 0) this.rows.push({});
    },
    replaceDataset({ fields, rows, draftRows }) {
      const sanitizedFields = this.sanitizeFields(fields);
      if (!sanitizedFields.length) return;

      const sanitizedRows = this.sanitizeRows(rows, sanitizedFields);
      const sanitizedDrafts = this.sanitizeRows(draftRows, sanitizedFields);

      this.fields = sanitizedFields;
      this.rows = sanitizedRows.length ? sanitizedRows : [{}];
      this.draftRows = sanitizedDrafts.length ? sanitizedDrafts : this.rows.map((row) => ({ ...row }));
    },
    saveTemplate(name, chartSelection) {
      const trimmed = String(name || '').trim();
      if (!trimmed) return null;

      const now = new Date().toISOString();
      const existing = this.templates.find((item) => item.name.toLowerCase() === trimmed.toLowerCase());
      const payload = {
        id: existing?.id || crypto.randomUUID(),
        name: trimmed,
        createdAt: existing?.createdAt || now,
        updatedAt: now,
        fields: this.fields.map((field) => ({ ...field })),
        rows: this.rows.map((row) => ({ ...row })),
        draftRows: this.draftRows.map((row) => ({ ...row })),
        chartSelection: chartSelection ? { ...chartSelection } : null
      };

      if (existing) {
        const index = this.templates.findIndex((item) => item.id === existing.id);
        this.templates.splice(index, 1, payload);
      } else {
        this.templates.push(payload);
      }
      return payload.id;
    },
    deleteTemplate(templateId) {
      this.templates = this.templates.filter((template) => template.id !== templateId);
    },
    applyTemplate(templateId) {
      const template = this.templates.find((item) => item.id === templateId);
      if (!template) return null;
      this.replaceDataset({
        fields: template.fields,
        rows: template.rows,
        draftRows: template.draftRows
      });
      return template.chartSelection || null;
    }
  }
});
