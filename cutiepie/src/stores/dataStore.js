import { defineStore } from 'pinia';
import { formulaMap } from '../formulas';

const FIELD_TYPES = new Set(['text', 'number', 'date']);

const makeField = (name, type) => ({ id: crypto.randomUUID(), name, type });

function createDefaultDataset() {
  const day = makeField('Day', 'date');
  const category = makeField('Category', 'text');
  const value = makeField('Value', 'number');
  return {
    fields: [day, category, value],
    rows: [{}, {}, {}],
    draftRows: [{}, {}, {}],
    templates: []
  };
}

function createDefaultWorkspace(name = 'Default Workspace') {
  const dataset = createDefaultDataset();
  return {
    id: crypto.randomUUID(),
    name,
    fields: dataset.fields,
    rows: dataset.rows,
    draftRows: dataset.draftRows,
    templates: dataset.templates,
    chartState: null,
    generatedTracks: []
  };
}

function toFiniteNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function normalizeOutputName(base, fields) {
  const trimmed = String(base || '').trim() || 'Formula Result';
  const existing = new Set(fields.map((field) => field.name.toLowerCase()));
  if (!existing.has(trimmed.toLowerCase())) return trimmed;

  let i = 2;
  while (existing.has(`${trimmed} ${i}`.toLowerCase())) i += 1;
  return `${trimmed} ${i}`;
}

function roundNumber(value) {
  return Math.round(value * 10000) / 10000;
}

export const useDataStore = defineStore('data', {
  state: () => {
    const workspace = createDefaultWorkspace();
    return {
      workspaces: [workspace],
      activeWorkspaceId: workspace.id,
      fields: workspace.fields,
      rows: workspace.rows,
      draftRows: workspace.draftRows,
      templates: workspace.templates
    };
  },
  getters: {
    activeWorkspace(state) {
      return state.workspaces.find((workspace) => workspace.id === state.activeWorkspaceId) || null;
    },
    numericFields(state) {
      return state.fields.filter((field) => field.type === 'number');
    },
    sortedFields(state) {
      return [...state.fields].sort((a, b) => a.name.localeCompare(b.name));
    },
    sortedNumericFields() {
      return this.sortedFields.filter((field) => field.type === 'number');
    },
    sortedWorkspaces(state) {
      return [...state.workspaces].sort((a, b) => a.name.localeCompare(b.name));
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
    sanitizeWorkspace(workspace) {
      if (!workspace || typeof workspace !== 'object') return null;
      const fields = this.sanitizeFields(workspace.fields);
      if (!fields.length) return null;
      const rows = this.sanitizeRows(workspace.rows, fields);
      const draftRows = this.sanitizeRows(workspace.draftRows, fields);
      return {
        id: typeof workspace.id === 'string' && workspace.id ? workspace.id : crypto.randomUUID(),
        name: String(workspace.name || '').trim() || 'Workspace',
        fields,
        rows: rows.length ? rows : [{}],
        draftRows: draftRows.length ? draftRows : (rows.length ? rows : [{}]).map((row) => ({ ...row })),
        templates: this.sanitizeTemplates(workspace.templates),
        chartState: workspace.chartState && typeof workspace.chartState === 'object'
          ? {
              chartType: String(workspace.chartState.chartType || ''),
              selectedLabelFieldId: String(workspace.chartState.selectedLabelFieldId || ''),
              selectedValueFieldId: String(workspace.chartState.selectedValueFieldId || ''),
              selectedSecondaryValueFieldId: String(workspace.chartState.selectedSecondaryValueFieldId || ''),
              selectedSeriesFieldId: String(workspace.chartState.selectedSeriesFieldId || '')
            }
          : null,
        generatedTracks: Array.isArray(workspace.generatedTracks) ? workspace.generatedTracks : []
      };
    },
    hydrateFromState(state) {
      const rawWorkspaces = Array.isArray(state.workspaces)
        ? state.workspaces.map((workspace) => this.sanitizeWorkspace(workspace)).filter(Boolean)
        : [];

      if (!rawWorkspaces.length) {
        const workspace = createDefaultWorkspace();
        this.workspaces = [workspace];
        this.activeWorkspaceId = workspace.id;
        this.fields = workspace.fields;
        this.rows = workspace.rows;
        this.draftRows = workspace.draftRows;
        this.templates = workspace.templates;
        return;
      }

      this.workspaces = rawWorkspaces;
      this.activeWorkspaceId = this.workspaces.some((item) => item.id === state.activeWorkspaceId)
        ? state.activeWorkspaceId
        : this.workspaces[0].id;

      this.loadActiveWorkspace();
    },
    loadActiveWorkspace() {
      const workspace = this.activeWorkspace;
      if (!workspace) return;
      this.fields = workspace.fields.map((field) => ({ ...field }));
      this.rows = workspace.rows.map((row) => ({ ...row }));
      this.draftRows = workspace.draftRows.map((row) => ({ ...row }));
      this.templates = workspace.templates.map((template) => ({
        ...template,
        fields: template.fields.map((field) => ({ ...field })),
        rows: template.rows.map((row) => ({ ...row })),
        draftRows: template.draftRows.map((row) => ({ ...row }))
      }));
    },
    syncActiveWorkspace(extra = {}) {
      const index = this.workspaces.findIndex((workspace) => workspace.id === this.activeWorkspaceId);
      if (index < 0) return;

      const current = this.workspaces[index];
      this.workspaces[index] = {
        ...current,
        fields: this.fields.map((field) => ({ ...field })),
        rows: this.rows.map((row) => ({ ...row })),
        draftRows: this.draftRows.map((row) => ({ ...row })),
        templates: this.templates.map((template) => ({
          ...template,
          fields: template.fields.map((field) => ({ ...field })),
          rows: template.rows.map((row) => ({ ...row })),
          draftRows: template.draftRows.map((row) => ({ ...row }))
        })),
        chartState: extra.chartState ? { ...extra.chartState } : current.chartState,
        generatedTracks: Array.isArray(extra.generatedTracks)
          ? extra.generatedTracks.map((track) => ({ ...track }))
          : current.generatedTracks
      };
    },
    setActiveWorkspace(workspaceId) {
      if (!this.workspaces.some((workspace) => workspace.id === workspaceId)) return null;
      this.activeWorkspaceId = workspaceId;
      this.loadActiveWorkspace();
      return this.activeWorkspace;
    },
    createWorkspace(name) {
      const trimmed = String(name || '').trim() || `Workspace ${this.workspaces.length + 1}`;
      const workspace = createDefaultWorkspace(trimmed);
      this.workspaces.push(workspace);
      this.activeWorkspaceId = workspace.id;
      this.loadActiveWorkspace();
      return workspace.id;
    },
    renameWorkspace(workspaceId, name) {
      const trimmed = String(name || '').trim();
      if (!trimmed) return;
      const workspace = this.workspaces.find((item) => item.id === workspaceId);
      if (!workspace) return;
      workspace.name = trimmed;
    },
    deleteWorkspace(workspaceId) {
      if (this.workspaces.length <= 1) return false;
      const index = this.workspaces.findIndex((workspace) => workspace.id === workspaceId);
      if (index < 0) return false;
      this.workspaces.splice(index, 1);

      if (this.activeWorkspaceId === workspaceId) {
        this.activeWorkspaceId = this.workspaces[0].id;
        this.loadActiveWorkspace();
      }
      return true;
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
    },
    applyFormula({ formulaId, outputName, inputFieldIds }) {
      const formula = formulaMap.get(formulaId);
      if (!formula) return { ok: false, error: 'formula_not_found' };

      const ids = Array.isArray(inputFieldIds) ? inputFieldIds : [];
      if (ids.length !== formula.inputs.length || ids.some((id) => !id)) {
        return { ok: false, error: 'invalid_formula_inputs' };
      }

      const fieldName = normalizeOutputName(outputName || formula.name, this.fields);
      const outputField = makeField(fieldName, 'number');

      const applyToRows = (rows) => rows.map((row, rowIndex, allRows) => {
        const next = { ...row };
        const value = formula.compute({
          row,
          rowIndex,
          rows: allRows,
          inputFieldIds: ids,
          numberAt(inputIndex, targetRowIndex = rowIndex) {
            const fieldId = ids[inputIndex];
            if (!fieldId) return null;
            const targetRow = allRows[targetRowIndex];
            if (!targetRow) return null;
            return toFiniteNumber(targetRow[fieldId]);
          }
        });

        if (Number.isFinite(value)) {
          next[outputField.id] = String(roundNumber(value));
        } else {
          next[outputField.id] = '';
        }

        return next;
      });

      this.fields.push(outputField);
      this.rows = applyToRows(this.rows);
      this.draftRows = applyToRows(this.draftRows);
      return { ok: true, fieldId: outputField.id, fieldName: outputField.name };
    }
  }
});
