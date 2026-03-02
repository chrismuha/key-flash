import { defineStore } from 'pinia';
import { formulaMap } from '../formulas';
import { evaluateCustomExpression } from '../formulas/customFormulaTools';
import {
  FIELD_TYPES,
  createDefaultWorkspace,
  makeField,
  normalizeOutputName,
  roundNumber,
  toFiniteNumber
} from './modules/dataHelpers';

export const useDataStore = defineStore('data', {
  state: () => {
    const workspace = createDefaultWorkspace();
    return {
      workspaces: [workspace],
      activeWorkspaceId: workspace.id,
      fields: workspace.fields,
      rows: workspace.rows,
      draftRows: workspace.draftRows,
      templates: workspace.templates,
      customFormulas: workspace.customFormulas,
      formulaFields: workspace.formulaFields,
      reportExportCount: workspace.reportExportCount,
      focusRowIndex: null,
      undoStack: [],
      redoStack: []
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
    },
    formulaExecutionPlan(state) {
      return [...state.formulaFields].sort((a, b) => String(a.createdAt || '').localeCompare(String(b.createdAt || '')));
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
    sanitizeCustomFormulas(formulas) {
      if (!Array.isArray(formulas)) return [];
      return formulas
        .filter((formula) => formula && typeof formula === 'object')
        .map((formula) => ({
          id: typeof formula.id === 'string' && formula.id ? formula.id : `custom:${crypto.randomUUID()}`,
          name: String(formula.name || '').trim() || 'Custom Formula',
          expression: String(formula.expression || '').trim(),
          inputLabels: Array.isArray(formula.inputLabels) && formula.inputLabels.length
            ? formula.inputLabels.slice(0, 8).map((item, index) => String(item || '').trim() || `Value ${index + 1}`)
            : ['Value 1'],
          createdAt: typeof formula.createdAt === 'string' ? formula.createdAt : new Date().toISOString(),
          updatedAt: typeof formula.updatedAt === 'string' ? formula.updatedAt : new Date().toISOString()
        }))
        .filter((formula) => formula.expression);
    },
    sanitizeFormulaFields(formulaFields) {
      if (!Array.isArray(formulaFields)) return [];
      return formulaFields
        .filter((item) => item && typeof item === 'object')
        .map((item) => ({
          outputFieldId: String(item.outputFieldId || ''),
          outputFieldName: String(item.outputFieldName || '').trim(),
          formulaId: String(item.formulaId || ''),
          inputFieldIds: Array.isArray(item.inputFieldIds) ? item.inputFieldIds.map((id) => String(id || '')).filter(Boolean) : [],
          createdAt: typeof item.createdAt === 'string' ? item.createdAt : new Date().toISOString()
        }))
        .filter((item) => item.outputFieldId && item.formulaId && item.inputFieldIds.length > 0);
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
        customFormulas: this.sanitizeCustomFormulas(workspace.customFormulas),
        formulaFields: this.sanitizeFormulaFields(workspace.formulaFields),
        reportExportCount: Math.max(0, Math.round(Number(workspace.reportExportCount) || 0)),
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
        this.customFormulas = workspace.customFormulas;
        this.formulaFields = workspace.formulaFields;
        this.reportExportCount = workspace.reportExportCount;
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
      this.customFormulas = workspace.customFormulas.map((formula) => ({
        ...formula,
        inputLabels: [...formula.inputLabels]
      }));
      this.formulaFields = workspace.formulaFields.map((item) => ({
        ...item,
        inputFieldIds: [...item.inputFieldIds]
      }));
      this.reportExportCount = workspace.reportExportCount;
      this.focusRowIndex = null;
      this.undoStack = [];
      this.redoStack = [];
    },
    syncActiveWorkspace(extra = {}) {
      const index = this.workspaces.findIndex((workspace) => workspace.id === this.activeWorkspaceId);
      if (index < 0) return;

      const current = this.workspaces[index];
      const nextWorkspace = {
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
        customFormulas: this.customFormulas.map((formula) => ({
          ...formula,
          inputLabels: [...formula.inputLabels]
        })),
        formulaFields: this.formulaFields.map((item) => ({
          ...item,
          inputFieldIds: [...item.inputFieldIds]
        })),
        reportExportCount: this.reportExportCount,
        chartState: extra.chartState ? { ...extra.chartState } : current.chartState,
        generatedTracks: Array.isArray(extra.generatedTracks)
          ? extra.generatedTracks.map((track) => ({ ...track }))
          : current.generatedTracks
      };

      const currentComparable = JSON.stringify({
        fields: current.fields,
        rows: current.rows,
        draftRows: current.draftRows,
        templates: current.templates,
        customFormulas: current.customFormulas,
        formulaFields: current.formulaFields,
        reportExportCount: current.reportExportCount,
        chartState: current.chartState,
        generatedTracks: current.generatedTracks
      });
      const nextComparable = JSON.stringify({
        fields: nextWorkspace.fields,
        rows: nextWorkspace.rows,
        draftRows: nextWorkspace.draftRows,
        templates: nextWorkspace.templates,
        customFormulas: nextWorkspace.customFormulas,
        formulaFields: nextWorkspace.formulaFields,
        reportExportCount: nextWorkspace.reportExportCount,
        chartState: nextWorkspace.chartState,
        generatedTracks: nextWorkspace.generatedTracks
      });

      if (currentComparable === nextComparable) return;
      this.workspaces[index] = nextWorkspace;
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
    cloneWorkspace(workspaceId) {
      const source = this.workspaces.find((workspace) => workspace.id === workspaceId);
      if (!source) return null;

      const clone = {
        ...source,
        id: crypto.randomUUID(),
        name: `${source.name} Copy`,
        fields: source.fields.map((field) => ({ ...field })),
        rows: source.rows.map((row) => ({ ...row })),
        draftRows: source.draftRows.map((row) => ({ ...row })),
        templates: source.templates.map((template) => ({
          ...template,
          id: crypto.randomUUID(),
          fields: template.fields.map((field) => ({ ...field })),
          rows: template.rows.map((row) => ({ ...row })),
          draftRows: template.draftRows.map((row) => ({ ...row }))
        })),
        customFormulas: source.customFormulas.map((formula) => ({
          ...formula,
          id: `custom:${crypto.randomUUID()}`,
          inputLabels: [...formula.inputLabels]
        })),
        formulaFields: source.formulaFields.map((item) => ({
          ...item,
          inputFieldIds: [...item.inputFieldIds]
        }))
      };

      this.workspaces.push(clone);
      return clone.id;
    },
    resetActiveWorkspace() {
      const current = this.activeWorkspace;
      if (!current) return false;
      const reset = createDefaultWorkspace(current.name);
      reset.id = current.id;
      this.workspaces = this.workspaces.map((workspace) => (workspace.id === current.id ? reset : workspace));
      this.loadActiveWorkspace();
      return true;
    },
    snapshotForUndo() {
      return {
        fields: this.fields.map((field) => ({ ...field })),
        rows: this.rows.map((row) => ({ ...row })),
        draftRows: this.draftRows.map((row) => ({ ...row })),
        templates: this.templates.map((template) => ({
          ...template,
          fields: template.fields.map((field) => ({ ...field })),
          rows: template.rows.map((row) => ({ ...row })),
          draftRows: template.draftRows.map((row) => ({ ...row }))
        })),
        customFormulas: this.customFormulas.map((formula) => ({
          ...formula,
          inputLabels: [...formula.inputLabels]
        })),
        formulaFields: this.formulaFields.map((item) => ({
          ...item,
          inputFieldIds: [...item.inputFieldIds]
        }))
      };
    },
    restoreFromUndo(snapshot) {
      if (!snapshot) return;
      this.fields = snapshot.fields.map((field) => ({ ...field }));
      this.rows = snapshot.rows.map((row) => ({ ...row }));
      this.draftRows = snapshot.draftRows.map((row) => ({ ...row }));
      this.templates = snapshot.templates.map((template) => ({
        ...template,
        fields: template.fields.map((field) => ({ ...field })),
        rows: template.rows.map((row) => ({ ...row })),
        draftRows: template.draftRows.map((row) => ({ ...row }))
      }));
      this.customFormulas = snapshot.customFormulas.map((formula) => ({
        ...formula,
        inputLabels: [...formula.inputLabels]
      }));
      this.formulaFields = snapshot.formulaFields.map((item) => ({
        ...item,
        inputFieldIds: [...item.inputFieldIds]
      }));
    },
    pushUndoSnapshot() {
      this.undoStack.push(this.snapshotForUndo());
      if (this.undoStack.length > 40) this.undoStack.shift();
      this.redoStack = [];
    },
    undo() {
      if (!this.undoStack.length) return false;
      const prev = this.undoStack.pop();
      this.redoStack.push(this.snapshotForUndo());
      this.restoreFromUndo(prev);
      return true;
    },
    redo() {
      if (!this.redoStack.length) return false;
      const next = this.redoStack.pop();
      this.undoStack.push(this.snapshotForUndo());
      this.restoreFromUndo(next);
      return true;
    },
    setFocusRow(rowIndex) {
      this.focusRowIndex = Number.isFinite(rowIndex) ? rowIndex : null;
    },
    clearFocusRow() {
      this.focusRowIndex = null;
    },
    incrementReportExportCount() {
      this.reportExportCount += 1;
    },
    clearReportExportCount() {
      this.reportExportCount = 0;
    },
    addField(name, type) {
      const trimmed = String(name || '').trim();
      if (!trimmed) return;
      this.pushUndoSnapshot();
      this.fields.push(makeField(trimmed, type));
    },
    removeField(fieldId) {
      this.pushUndoSnapshot();
      this.fields = this.fields.filter((field) => field.id !== fieldId);
      this.formulaFields = this.formulaFields.filter((item) => item.outputFieldId !== fieldId && !item.inputFieldIds.includes(fieldId));
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
      this.pushUndoSnapshot();
      this.draftRows.push({});
    },
    updateDraftCell(rowIndex, fieldId, value) {
      if (!this.draftRows[rowIndex]) this.draftRows[rowIndex] = {};
      this.draftRows[rowIndex][fieldId] = value;
    },
    applyAllRows() {
      this.pushUndoSnapshot();
      this.rows = this.draftRows.map((row) => ({ ...row }));
    },
    applyRow(rowIndex) {
      if (!this.draftRows[rowIndex]) return;
      this.pushUndoSnapshot();
      while (this.rows.length <= rowIndex) this.rows.push({});
      this.rows[rowIndex] = { ...this.draftRows[rowIndex] };
    },
    deleteRow(rowIndex) {
      this.pushUndoSnapshot();
      this.draftRows.splice(rowIndex, 1);
      if (rowIndex < this.rows.length) this.rows.splice(rowIndex, 1);
      if (this.draftRows.length === 0) this.draftRows.push({});
      if (this.rows.length === 0) this.rows.push({});
    },
    replaceDataset({ fields, rows, draftRows }) {
      const sanitizedFields = this.sanitizeFields(fields);
      if (!sanitizedFields.length) return;
      this.pushUndoSnapshot();

      const sanitizedRows = this.sanitizeRows(rows, sanitizedFields);
      const sanitizedDrafts = this.sanitizeRows(draftRows, sanitizedFields);

      this.fields = sanitizedFields;
      this.rows = sanitizedRows.length ? sanitizedRows : [{}];
      this.draftRows = sanitizedDrafts.length ? sanitizedDrafts : this.rows.map((row) => ({ ...row }));
      this.formulaFields = [];
    },
    saveTemplate(name, chartSelection) {
      const trimmed = String(name || '').trim();
      if (!trimmed) return null;
      this.pushUndoSnapshot();

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
      this.pushUndoSnapshot();
      this.templates = this.templates.filter((template) => template.id !== templateId);
    },
    applyTemplate(templateId) {
      const template = this.templates.find((item) => item.id === templateId);
      if (!template) return null;
      this.pushUndoSnapshot();
      this.replaceDataset({
        fields: template.fields,
        rows: template.rows,
        draftRows: template.draftRows
      });
      return template.chartSelection || null;
    },
    applyFormula({ formulaId, outputName, inputFieldIds }) {
      const formula = formulaMap.get(formulaId);
      const customFormula = this.customFormulas.find((item) => item.id === formulaId);
      if (!formula && !customFormula) return { ok: false, error: 'formula_not_found' };
      const inputCount = formula ? formula.inputs.length : customFormula.inputLabels.length;

      const ids = Array.isArray(inputFieldIds) ? inputFieldIds : [];
      if (ids.length !== inputCount || ids.some((id) => !id)) {
        return { ok: false, error: 'invalid_formula_inputs' };
      }

      this.pushUndoSnapshot();
      const fieldName = normalizeOutputName(outputName || (formula ? formula.name : customFormula.name), this.fields);
      const outputField = makeField(fieldName, 'number');

      const applyToRows = (rows) => rows.map((row, rowIndex, allRows) => {
        const next = { ...row };
        let value = null;
        if (formula) {
          value = formula.compute({
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
        } else {
          const values = ids.map((id) => toFiniteNumber(row[id]));
          const result = evaluateCustomExpression(customFormula.expression, values, rowIndex);
          value = result.ok ? result.value : null;
        }

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
      this.formulaFields.push({
        outputFieldId: outputField.id,
        outputFieldName: outputField.name,
        formulaId,
        inputFieldIds: [...ids],
        createdAt: new Date().toISOString()
      });
      return { ok: true, fieldId: outputField.id, fieldName: outputField.name };
    },
    recalculateFormulaFields() {
      const plan = this.formulaExecutionPlan;
      if (!plan.length) return { ok: true, count: 0 };

      const applyPlan = (rows) => rows.map((row, rowIndex, allRows) => {
        const next = { ...row };
        plan.forEach((item) => {
          const formula = formulaMap.get(item.formulaId);
          const customFormula = this.customFormulas.find((custom) => custom.id === item.formulaId);
          if (!formula && !customFormula) return;

          let value = null;
          if (formula) {
            value = formula.compute({
              row: next,
              rowIndex,
              rows: allRows,
              inputFieldIds: item.inputFieldIds,
              numberAt(inputIndex, targetRowIndex = rowIndex) {
                const fieldId = item.inputFieldIds[inputIndex];
                if (!fieldId) return null;
                const targetRow = allRows[targetRowIndex];
                if (!targetRow) return null;
                return toFiniteNumber(targetRow[fieldId]);
              }
            });
          } else {
            const values = item.inputFieldIds.map((id) => toFiniteNumber(next[id]));
            const result = evaluateCustomExpression(customFormula.expression, values, rowIndex);
            value = result.ok ? result.value : null;
          }

          next[item.outputFieldId] = Number.isFinite(value) ? String(roundNumber(value)) : '';
        });
        return next;
      });

      this.rows = applyPlan(this.rows);
      this.draftRows = applyPlan(this.draftRows);
      return { ok: true, count: plan.length };
    },
    upsertCustomFormula(formula) {
      const normalized = this.sanitizeCustomFormulas([formula])[0];
      if (!normalized) return { ok: false, error: 'invalid_custom_formula' };
      this.pushUndoSnapshot();

      const existingIndex = this.customFormulas.findIndex((item) => item.id === normalized.id);
      if (existingIndex >= 0) {
        normalized.createdAt = this.customFormulas[existingIndex].createdAt;
        normalized.updatedAt = new Date().toISOString();
        this.customFormulas.splice(existingIndex, 1, normalized);
      } else {
        this.customFormulas.push(normalized);
      }
      return { ok: true, formula: normalized };
    },
    deleteCustomFormula(formulaId) {
      this.pushUndoSnapshot();
      this.customFormulas = this.customFormulas.filter((formula) => formula.id !== formulaId);
    }
  }
});
