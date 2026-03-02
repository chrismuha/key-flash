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
              <input
                class="table-input"
                :type="field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'"
                :placeholder="field.name"
                :value="row[field.id] || ''"
                @input="dataStore.updateDraftCell(rowIndex, field.id, $event.target.value)"
              />
            </td>
            <td>
              <div class="row-actions">
                <button type="button" class="row-action-btn row-apply" @click="applyRow(rowIndex)">Apply</button>
                <button type="button" class="row-action-btn row-delete" @click="dataStore.deleteRow(rowIndex)">
                  <i class="bi bi-trash-fill text-white" aria-hidden="true"></i>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="settings-actions">
      <button type="button" class="soft" @click="dataStore.addRow">Add Row</button>
      <button type="button" class="soft" @click="dataStore.applyAllRows">Apply All</button>
    </div>
  </section>
</template>

<script setup>
import { useDataStore } from '../stores/dataStore';
import { useSettingsStore } from '../stores/settingsStore';

const dataStore = useDataStore();
const settings = useSettingsStore();

function applyRow(index) {
  dataStore.applyRow(index);
}
</script>
