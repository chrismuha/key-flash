<template>
  <section class="panel">
    <div class="panel-head">
      <h2>6) Formula Builder</h2>
      <p>Add calculated numeric fields using reusable formula files.</p>
    </div>

    <div class="field-form">
      <label>
        Formula
        <select v-model="selectedFormulaId" @change="resetInputsForFormula">
          <option v-for="formula in formulas" :key="formula.id" :value="formula.id">{{ formula.name }}</option>
        </select>
      </label>

      <label>
        Output Field Name
        <input v-model.trim="outputFieldName" type="text" placeholder="Example: Profit" />
      </label>

      <button type="button" :disabled="!canApply" @click="applyFormula">Apply Formula Field</button>
    </div>

    <div v-if="currentFormula" class="wizard-grid">
      <label v-for="(inputLabel, index) in currentFormula.inputs" :key="`input-${index}`">
        {{ inputLabel }}
        <select v-model="inputFieldIds[index]">
          <option value="">Select numeric field</option>
          <option v-for="field in dataStore.sortedNumericFields" :key="`${index}-${field.id}`" :value="field.id">
            {{ field.name }}
          </option>
        </select>
      </label>
      <p class="settings-note">{{ currentFormula.name }} formula is loaded from its own file in <code>src/formulas/</code>.</p>
    </div>

    <p v-if="status" class="settings-note">{{ status }}</p>
  </section>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { formulas, formulaMap } from '../formulas';
import { useDataStore } from '../stores/dataStore';
import { useChartStore } from '../stores/chartStore';

const dataStore = useDataStore();
const chartStore = useChartStore();

const selectedFormulaId = ref(formulas[0]?.id || '');
const outputFieldName = ref('');
const inputFieldIds = ref([]);
const status = ref('');

const currentFormula = computed(() => formulaMap.get(selectedFormulaId.value) || null);

const canApply = computed(() => {
  if (!currentFormula.value) return false;
  if (!dataStore.sortedNumericFields.length) return false;
  return currentFormula.value.inputs.every((_, index) => Boolean(inputFieldIds.value[index]));
});

function resetInputsForFormula() {
  const formula = currentFormula.value;
  if (!formula) {
    inputFieldIds.value = [];
    return;
  }
  inputFieldIds.value = formula.inputs.map(() => '');
}

function applyFormula() {
  const formula = currentFormula.value;
  if (!formula) return;
  const result = dataStore.applyFormula({
    formulaId: formula.id,
    outputName: outputFieldName.value || formula.name,
    inputFieldIds: inputFieldIds.value
  });

  if (!result?.ok) {
    status.value = 'Unable to apply formula field. Check your selections.';
    return;
  }

  chartStore.requireManualRefresh('Formula field added. Click Generate Chart to include it.');
  status.value = `Formula applied. New field: ${result.fieldName}`;
  outputFieldName.value = '';
  resetInputsForFormula();
}

watch(
  () => selectedFormulaId.value,
  () => {
    resetInputsForFormula();
  },
  { immediate: true }
);
</script>
