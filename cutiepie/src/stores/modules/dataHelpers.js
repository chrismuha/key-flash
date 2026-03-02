export const FIELD_TYPES = new Set(['text', 'number', 'date']);

export const makeField = (name, type) => ({ id: crypto.randomUUID(), name, type });

export function createDefaultDataset() {
  const day = makeField('Day', 'date');
  const category = makeField('Category', 'text');
  const value = makeField('Value', 'number');
  return {
    fields: [day, category, value],
    rows: [{}, {}, {}],
    draftRows: [{}, {}, {}],
    templates: [],
    customFormulas: [],
    formulaFields: [],
    reportExportCount: 0
  };
}

export function createDefaultWorkspace(name = 'Default Workspace') {
  const dataset = createDefaultDataset();
  return {
    id: crypto.randomUUID(),
    name,
    fields: dataset.fields,
    rows: dataset.rows,
    draftRows: dataset.draftRows,
    templates: dataset.templates,
    customFormulas: dataset.customFormulas,
    formulaFields: dataset.formulaFields,
    reportExportCount: dataset.reportExportCount,
    chartState: null,
    generatedTracks: []
  };
}

export function toFiniteNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export function normalizeOutputName(base, fields) {
  const trimmed = String(base || '').trim() || 'Formula Result';
  const existing = new Set(fields.map((field) => field.name.toLowerCase()));
  if (!existing.has(trimmed.toLowerCase())) return trimmed;

  let i = 2;
  while (existing.has(`${trimmed} ${i}`.toLowerCase())) i += 1;
  return `${trimmed} ${i}`;
}

export function roundNumber(value) {
  return Math.round(value * 10000) / 10000;
}
