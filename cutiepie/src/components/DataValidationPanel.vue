<template>
  <section class="panel">
    <div class="panel-head">
      <h2>3) Data Validation</h2>
      <p>Find invalid cells and jump directly to the row.</p>
    </div>

    <p v-if="!issues.length" class="settings-note">No validation issues found in draft rows.</p>

    <div v-else class="tracks-grid">
      <article v-for="issue in issues" :key="issue.id" class="track-card">
        <h3>Row {{ issue.rowIndex + 1 }}: {{ issue.fieldName }}</h3>
        <p class="settings-note">{{ issue.message }}</p>
        <p class="settings-note">Value: {{ issue.value }}</p>
        <div class="settings-actions">
          <button type="button" class="soft" @click="goToRow(issue.rowIndex)">Go to Row</button>
          <button type="button" class="soft" @click="clearCell(issue)">Clear Cell</button>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue';
import { useDataStore } from '../stores/dataStore';

const dataStore = useDataStore();

const issues = computed(() => {
  const next = [];
  dataStore.draftRows.forEach((row, rowIndex) => {
    dataStore.fields.forEach((field) => {
      const raw = String(row[field.id] || '').trim();
      if (!raw) return;

      if (field.type === 'number' && !Number.isFinite(Number(raw))) {
        next.push({
          id: `${rowIndex}-${field.id}-number`,
          rowIndex,
          fieldId: field.id,
          fieldName: field.name,
          value: raw,
          message: 'Expected a numeric value.'
        });
      }

      if (field.type === 'date') {
        const dateOk = /^\d{4}-\d{2}-\d{2}$/.test(raw) || !Number.isNaN(new Date(raw).getTime());
        if (!dateOk) {
          next.push({
            id: `${rowIndex}-${field.id}-date`,
            rowIndex,
            fieldId: field.id,
            fieldName: field.name,
            value: raw,
            message: 'Expected a valid date (YYYY-MM-DD recommended).'
          });
        }
      }
    });
  });
  return next.slice(0, 100);
});

function goToRow(rowIndex) {
  dataStore.setFocusRow(rowIndex);
}

function clearCell(issue) {
  dataStore.updateDraftCell(issue.rowIndex, issue.fieldId, '');
}
</script>
