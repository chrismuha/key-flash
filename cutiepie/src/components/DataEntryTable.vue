<template>
  <section class="panel">
    <div class="panel-head">
      <h2>2) Data Entry</h2>
      <p>Add rows using your custom fields.</p>
    </div>

    <div class="table-wrap" :class="{ 'subtle-separators': settings.subtleSeparators }">
      <table>
        <thead>
          <tr>
            <th v-for="field in dataStore.sortedFields" :key="field.id">{{ field.name }}</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, rowIndex) in dataStore.draftRows" :key="rowIndex">
            <td v-for="field in dataStore.sortedFields" :key="field.id">
              <select
                v-if="shouldUseCategoryDropdown(field)"
                class="table-input"
                :disabled="!settings.canEditData"
                :value="row[field.id] || ''"
                @change="dataStore.updateDraftCell(rowIndex, field.id, $event.target.value)"
              >
                <option value="">Select category</option>
                <option v-for="category in categoryOptions(row[field.id])" :key="`${field.id}-${category}`" :value="category">
                  {{ category }}
                </option>
              </select>
              <input
                v-else
                class="table-input"
                :type="field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'"
                :placeholder="field.name"
                :disabled="!settings.canEditData"
                :value="row[field.id] || ''"
                @input="dataStore.updateDraftCell(rowIndex, field.id, $event.target.value)"
              />
            </td>
            <td>
              <div class="row-actions">
                <button type="button" class="row-action-btn row-apply" :disabled="!settings.canEditData" @click="applyRow(rowIndex)">Apply</button>
                <button type="button" class="row-action-btn row-delete" :disabled="!settings.canEditData" @click="dataStore.deleteRow(rowIndex)">
                  <i class="bi bi-trash-fill text-white" aria-hidden="true"></i>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="settings-actions">
      <button type="button" class="soft" :disabled="!settings.canEditData" @click="dataStore.addRow">Add Row</button>
      <button type="button" class="soft" :disabled="!settings.canEditData" @click="dataStore.applyAllRows">Apply All</button>
    </div>
    <p v-if="!settings.canEditData" class="settings-note">Current role is read-only for row data editing.</p>
  </section>
</template>

<script setup>
import { useDataStore } from '../stores/dataStore';
import { useSettingsStore } from '../stores/settingsStore';

const dataStore = useDataStore();
const settings = useSettingsStore();

function applyRow(index) {
  if (!settings.canEditData) return;
  dataStore.applyRow(index);
}

function shouldUseCategoryDropdown(field) {
  return settings.useSavedCategoriesDropdown && field.type === 'text';
}

function categoryOptions(currentValue) {
  const base = settings.sortedSavedCategories;
  const current = String(currentValue || '').trim();
  if (!current || base.includes(current)) return base;
  return [...base, current].sort((a, b) => a.localeCompare(b));
}
</script>
