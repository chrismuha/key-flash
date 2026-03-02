<template>
  <section class="panel">
    <div class="panel-head">
      <h2>4) Import / Export</h2>
      <p>Load CSV files and export current dataset for Excel or sharing.</p>
    </div>

    <div class="settings-actions">
      <label class="soft file-btn" :class="{ disabled: !settings.canEditData }">
        <input type="file" accept=".csv,text/csv" :disabled="!settings.canEditData" @change="onImportCsv" />
        Import CSV
      </label>
      <button type="button" class="soft" @click="downloadCsv">Export CSV</button>
      <button type="button" class="soft" @click="downloadJson">Export JSON</button>
    </div>

    <p class="settings-note">
      CSV export opens directly in Excel. Import replaces current fields and rows.
    </p>
    <p v-if="status" class="settings-note">{{ status }}</p>
  </section>
</template>

<script setup>
import { ref } from 'vue';
import { useDataStore } from '../stores/dataStore';
import { useSettingsStore } from '../stores/settingsStore';

const dataStore = useDataStore();
const settings = useSettingsStore();
const status = ref('');

function inferType(values) {
  const nonEmpty = values.map((value) => String(value || '').trim()).filter(Boolean);
  if (!nonEmpty.length) return 'text';

  const allNumbers = nonEmpty.every((value) => Number.isFinite(Number(value)));
  if (allNumbers) return 'number';

  const allDates = nonEmpty.every((value) => /^\d{4}-\d{2}-\d{2}$/.test(value) || !Number.isNaN(new Date(value).getTime()));
  if (allDates) return 'date';

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

function toCsvCell(value) {
  const text = String(value ?? '');
  if (text.includes(',') || text.includes('"') || text.includes('\n')) {
    return `"${text.replaceAll('"', '""')}"`;
  }
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

async function onImportCsv(event) {
  const file = event.target?.files?.[0];
  if (!file) return;

  try {
    const text = await file.text();
    const lines = text
      .split(/\r?\n/)
      .map((line) => line.trimEnd())
      .filter((line) => line.length > 0);

    if (lines.length < 2) {
      status.value = 'Import failed: CSV needs a header row and at least one data row.';
      return;
    }

    const headers = parseCsvLine(lines[0]).map((header) => header.trim()).filter(Boolean);
    if (!headers.length) {
      status.value = 'Import failed: no header names found.';
      return;
    }

    const matrix = lines.slice(1).map((line) => parseCsvLine(line));
    const columnValues = headers.map((_, colIndex) => matrix.map((row) => row[colIndex] || ''));

    const fields = headers.map((name, index) => ({
      id: crypto.randomUUID(),
      name,
      type: inferType(columnValues[index])
    }));

    const rows = matrix.map((cells) => {
      const row = {};
      fields.forEach((field, index) => {
        const value = String(cells[index] || '').trim();
        if (value) row[field.id] = value;
      });
      return row;
    });

    dataStore.replaceDataset({ fields, rows, draftRows: rows.map((row) => ({ ...row })) });
    status.value = `Imported ${rows.length} rows from ${file.name}.`;
  } catch (_error) {
    status.value = 'Import failed: unable to parse CSV file.';
  } finally {
    event.target.value = '';
  }
}

function downloadCsv() {
  const headers = dataStore.sortedFields.map((field) => field.name);
  const body = dataStore.rows.map((row) => dataStore.sortedFields.map((field) => toCsvCell(row[field.id] || '')).join(','));
  const csv = [headers.join(','), ...body].join('\n');
  downloadBlob('cutiepie-export.csv', csv, 'text/csv;charset=utf-8');
  status.value = 'CSV exported.';
}

function downloadJson() {
  const payload = {
    exportedAt: new Date().toISOString(),
    fields: dataStore.fields,
    rows: dataStore.rows,
    draftRows: dataStore.draftRows
  };
  downloadBlob('cutiepie-export.json', JSON.stringify(payload, null, 2), 'application/json;charset=utf-8');
  status.value = 'JSON exported.';
}
</script>
