<template>
  <section class="panel">
    <div class="panel-head">
      <h2>4) Import / Export Wizards</h2>
      <p>Preview and configure before apply/import/export.</p>
    </div>

    <div class="wizard-tabs">
      <button type="button" class="soft" :class="{ active: mode === 'import' }" @click="mode = 'import'">Import Wizard</button>
      <button type="button" class="soft" :class="{ active: mode === 'export' }" @click="mode = 'export'">Export Wizard</button>
    </div>

    <div v-if="mode === 'import'" class="wizard-block">
      <div class="settings-actions">
        <label class="soft file-btn" :class="{ disabled: !settings.canEditData }">
          <input type="file" accept=".csv,.json,text/csv,application/json" :disabled="!settings.canEditData" @change="onImportFile" />
          Select CSV / JSON
        </label>
        <button type="button" class="soft" :disabled="!canApplyImport || !settings.canEditData" @click="applyImport">Apply Import</button>
      </div>

      <p class="settings-note">Step 1: File Preview</p>
      <p v-if="importFileName" class="settings-note">File: {{ importFileName }} ({{ importFormat.toUpperCase() }})</p>
      <div v-if="previewHeaders.length" class="table-wrap">
        <table>
          <thead>
            <tr>
              <th v-for="header in previewHeaders" :key="`head-${header}`">{{ header }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, rowIndex) in previewRows" :key="`row-${rowIndex}`">
              <td v-for="header in previewHeaders" :key="`cell-${rowIndex}-${header}`">{{ row[header] || '' }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="columnConfigs.length" class="wizard-grid">
        <p class="settings-note">Step 2: Column Mapping</p>
        <table>
          <thead>
            <tr>
              <th>Source Column</th>
              <th>Target</th>
              <th>New Name (if needed)</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="config in columnConfigs" :key="`map-${config.source}`">
              <td>{{ config.source }}</td>
              <td>
                <select v-model="config.target">
                  <option value="ignore">Ignore</option>
                  <option value="new">Create New Field</option>
                  <option
                    v-for="field in existingFieldOptions"
                    :key="`existing-${config.source}-${field.id}`"
                    :value="`existing:${field.id}`"
                  >
                    Existing: {{ field.name }}
                  </option>
                </select>
              </td>
              <td>
                <input
                  type="text"
                  :disabled="config.target !== 'new'"
                  v-model.trim="config.newName"
                  placeholder="New field name"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="columnConfigs.length" class="wizard-grid">
        <p class="settings-note">Step 3: Type + Invalid Value Handling</p>
        <table>
          <thead>
            <tr>
              <th>Column</th>
              <th>Type</th>
              <th>Invalid Value Rule</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="config in activeConfigs" :key="`type-${config.source}`">
              <td>{{ resolvedTargetName(config) }}</td>
              <td>
                <select v-model="config.type">
                  <option value="text">Text</option>
                  <option value="number">Number</option>
                  <option value="date">Date</option>
                </select>
              </td>
              <td>
                <select v-model="config.invalidRule">
                  <option value="blank">Leave blank</option>
                  <option value="skipRow">Skip row</option>
                  <option value="text">Keep original text</option>
                  <option v-if="config.type === 'number'" value="zero">Set to 0</option>
                </select>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-else class="wizard-block">
      <p class="settings-note">Export wizard for all export types.</p>
      <div class="wizard-grid">
        <label>
          Export Type
          <select v-model="exportType">
            <option value="csv">CSV</option>
            <option value="json">JSON</option>
            <option value="pdf">PDF</option>
          </select>
        </label>

        <label v-if="exportType !== 'pdf'">
          Data Source
          <select v-model="exportRowsSource">
            <option value="applied">Applied Rows</option>
            <option value="draft">Draft Rows</option>
          </select>
        </label>

        <label>
          Include Timestamp In Filename
          <select v-model="includeTimestampInFileName">
            <option :value="true">Yes</option>
            <option :value="false">No</option>
          </select>
        </label>
      </div>

      <p class="settings-note">
        Preview: {{ exportPreviewFields }} fields, {{ exportPreviewRows }} rows, type {{ exportType.toUpperCase() }}.
      </p>

      <div class="settings-actions">
        <button type="button" :disabled="isExporting" @click="runExport">
          {{ isExporting ? 'Exporting...' : `Export ${exportType.toUpperCase()}` }}
        </button>
      </div>
    </div>

    <p v-if="status" class="settings-note">{{ status }}</p>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useDataStore } from '../stores/dataStore';
import { useSettingsStore } from '../stores/settingsStore';
import { exportCurrentPagePdf } from '../services/pdfService';

const route = useRoute();
const dataStore = useDataStore();
const settings = useSettingsStore();

const mode = ref('import');
const status = ref('');

const importFileName = ref('');
const importFormat = ref('csv');
const previewHeaders = ref([]);
const previewData = ref([]);
const columnConfigs = ref([]);

const exportType = ref('csv');
const exportRowsSource = ref('applied');
const includeTimestampInFileName = ref(true);
const isExporting = ref(false);

const previewRows = computed(() => previewData.value.slice(0, 20));
const existingFieldOptions = computed(() => dataStore.sortedFields);
const activeConfigs = computed(() => columnConfigs.value.filter((config) => config.target !== 'ignore'));
const canApplyImport = computed(() => previewHeaders.value.length > 0 && activeConfigs.value.length > 0);
const exportRows = computed(() => (exportRowsSource.value === 'draft' ? dataStore.draftRows : dataStore.rows));
const exportPreviewRows = computed(() => exportRows.value.length);
const exportPreviewFields = computed(() => dataStore.sortedFields.length);

function inferType(values) {
  const nonEmpty = values.map((value) => String(value || '').trim()).filter(Boolean);
  if (!nonEmpty.length) return 'text';
  if (nonEmpty.every((value) => Number.isFinite(Number(value)))) return 'number';
  if (nonEmpty.every((value) => /^\d{4}-\d{2}-\d{2}$/.test(value) || !Number.isNaN(new Date(value).getTime()))) return 'date';
  return 'text';
}

function parseCsvLine(line) {
  const out = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    const next = line[i + 1];
    if (ch === '"' && inQuotes && next === '"') {
      current += '"';
      i += 1;
      continue;
    }
    if (ch === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (ch === ',' && !inQuotes) {
      out.push(current);
      current = '';
      continue;
    }
    current += ch;
  }
  out.push(current);
  return out;
}

function normalizeImported(headers, rawRows) {
  previewHeaders.value = headers;
  previewData.value = rawRows;

  columnConfigs.value = headers.map((header) => {
    const existing = dataStore.fields.find((field) => field.name.toLowerCase() === header.toLowerCase());
    const values = rawRows.map((row) => row[header] || '');

    return {
      source: header,
      target: existing ? `existing:${existing.id}` : 'new',
      newName: existing ? '' : header,
      type: existing?.type || inferType(values),
      invalidRule: 'blank'
    };
  });
}

async function onImportFile(event) {
  const file = event.target?.files?.[0];
  if (!file) return;

  try {
    const rawText = await file.text();
    const lower = file.name.toLowerCase();

    if (lower.endsWith('.json')) {
      importFormat.value = 'json';
      const parsed = JSON.parse(rawText);

      if (Array.isArray(parsed)) {
        const headers = [...new Set(parsed.flatMap((row) => Object.keys(row || {})))];
        const rows = parsed.map((entry) => {
          const out = {};
          headers.forEach((header) => {
            out[header] = String(entry?.[header] ?? '');
          });
          return out;
        });
        normalizeImported(headers, rows);
      } else if (parsed && Array.isArray(parsed.fields) && Array.isArray(parsed.rows)) {
        const idToName = new Map(parsed.fields.map((field) => [String(field.id || ''), String(field.name || '').trim()]).filter((pair) => pair[0] && pair[1]));
        const headers = [...idToName.values()];
        const rows = parsed.rows.map((row) => {
          const out = {};
          headers.forEach((header) => {
            const fieldId = [...idToName.entries()].find((entry) => entry[1] === header)?.[0];
            out[header] = String((fieldId && row?.[fieldId]) ?? '');
          });
          return out;
        });
        normalizeImported(headers, rows);
      } else {
        throw new Error('Unsupported JSON format');
      }
    } else {
      importFormat.value = 'csv';
      const lines = rawText
        .split(/\r?\n/)
        .map((line) => line.trimEnd())
        .filter((line) => line.length > 0);

      if (lines.length < 2) {
        throw new Error('CSV needs header + rows');
      }

      const headers = parseCsvLine(lines[0]).map((header) => header.trim()).filter(Boolean);
      const rows = lines.slice(1).map((line) => {
        const cells = parseCsvLine(line);
        const out = {};
        headers.forEach((header, index) => {
          out[header] = String(cells[index] || '').trim();
        });
        return out;
      });
      normalizeImported(headers, rows);
    }

    importFileName.value = file.name;
    status.value = `Loaded ${file.name}. Review mapping and type rules before applying.`;
  } catch (_error) {
    previewHeaders.value = [];
    previewData.value = [];
    columnConfigs.value = [];
    status.value = 'Import load failed. Use valid CSV or JSON.';
  } finally {
    event.target.value = '';
  }
}

function validateNumber(value) {
  return Number.isFinite(Number(value));
}

function validateDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) || !Number.isNaN(new Date(value).getTime());
}

function normalizeValue(rawValue, config) {
  const value = String(rawValue || '').trim();
  if (!value) return { ok: true, value: '' };

  let valid = true;
  if (config.type === 'number') valid = validateNumber(value);
  if (config.type === 'date') valid = validateDate(value);

  if (valid) return { ok: true, value };

  if (config.invalidRule === 'skipRow') return { ok: false, skipRow: true };
  if (config.invalidRule === 'zero' && config.type === 'number') return { ok: true, value: '0' };
  if (config.invalidRule === 'text') return { ok: true, value };
  return { ok: true, value: '' };
}

function resolvedTargetName(config) {
  if (config.target === 'new') return config.newName || config.source;
  if (config.target.startsWith('existing:')) {
    const id = config.target.split(':')[1];
    return dataStore.fields.find((field) => field.id === id)?.name || config.source;
  }
  return config.source;
}

function buildFileName(base, ext) {
  if (!includeTimestampInFileName.value) return `${base}.${ext}`;
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  return `${base}-${stamp}.${ext}`;
}

function toCsvCell(value) {
  const text = String(value ?? '');
  if (text.includes(',') || text.includes('"') || text.includes('\n')) return `"${text.replaceAll('"', '""')}"`;
  return text;
}

function downloadBlob(fileName, content, mime) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}

function applyImport() {
  if (!canApplyImport.value || !settings.canEditData) return;

  const mapped = activeConfigs.value.map((config) => {
    const targetName = resolvedTargetName(config).trim();
    return {
      ...config,
      finalName: targetName || config.source
    };
  });

  const fields = mapped.map((config) => ({
    id: crypto.randomUUID(),
    name: config.finalName,
    type: config.type
  }));

  const rows = [];
  previewData.value.forEach((sourceRow) => {
    const row = {};
    let skip = false;

    mapped.forEach((config, index) => {
      const result = normalizeValue(sourceRow[config.source], config);
      if (result.skipRow) {
        skip = true;
        return;
      }
      row[fields[index].id] = result.value;
    });

    if (!skip) rows.push(row);
  });

  dataStore.replaceDataset({ fields, rows, draftRows: rows.map((row) => ({ ...row })) });
  status.value = `Import applied: ${rows.length} rows, ${fields.length} fields.`;
}

async function runExport() {
  if (isExporting.value) return;
  isExporting.value = true;

  try {
    if (exportType.value === 'csv') {
      const headers = dataStore.sortedFields.map((field) => field.name);
      const body = exportRows.value.map((row) => dataStore.sortedFields.map((field) => toCsvCell(row[field.id] || '')).join(','));
      const csv = [headers.join(','), ...body].join('\n');
      downloadBlob(buildFileName('cutiepie-export', 'csv'), csv, 'text/csv;charset=utf-8');
      status.value = 'CSV export complete.';
    } else if (exportType.value === 'json') {
      const payload = {
        exportedAt: new Date().toISOString(),
        fields: dataStore.fields,
        rows: exportRows.value,
        source: exportRowsSource.value
      };
      downloadBlob(buildFileName('cutiepie-export', 'json'), JSON.stringify(payload, null, 2), 'application/json;charset=utf-8');
      status.value = 'JSON export complete.';
    } else {
      const pageName = String(route.path || 'page').replaceAll('/', '-') || 'page';
      const result = await exportCurrentPagePdf(pageName);
      status.value = result?.ok ? `PDF export complete: ${result.fileName}` : 'PDF export failed.';
    }
  } catch (_error) {
    status.value = 'Export failed.';
  } finally {
    isExporting.value = false;
  }
}
</script>
