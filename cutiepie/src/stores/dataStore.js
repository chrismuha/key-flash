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
      draftRows: [{}, {}, {}]
    };
  },
  getters: {
    numericFields(state) {
      return state.fields.filter((field) => field.type === 'number');
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
    hydrateFromState(state) {
      const fields = this.sanitizeFields(state.fields);
      if (fields.length > 0) this.fields = fields;

      const rows = this.sanitizeRows(state.rows, this.fields);
      this.rows = rows.length > 0 ? rows : [{}, {}, {}];

      const drafts = this.sanitizeRows(state.draftRows, this.fields);
      this.draftRows = drafts.length > 0 ? drafts : this.rows.map((row) => ({ ...row }));
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
    }
  }
});
