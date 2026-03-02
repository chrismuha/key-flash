<template>
  <section class="panel">
    <div class="panel-head">
      <h2>6) Formula Builder</h2>
      <p>Add calculated numeric fields and create custom formulas with validation/test preview.</p>
    </div>

    <div class="wizard-tabs">
      <button type="button" class="soft" :class="{ active: mode === 'apply' }" @click="mode = 'apply'">Apply Formula</button>
      <button type="button" class="soft" :class="{ active: mode === 'custom' }" @click="mode = 'custom'">Custom Formula Editor</button>
    </div>

    <div v-if="mode === 'apply'" class="wizard-block">
      <div class="field-form">
        <label>
          Formula
          <select v-model="selectedFormulaId" @change="resetInputsForFormula">
            <option v-for="formula in allFormulas" :key="formula.id" :value="formula.id">{{ formula.name }}</option>
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
        <p class="settings-note" v-if="currentFormula.isCustom">
          Custom formula expression: <code>{{ currentFormula.expression }}</code>
        </p>
        <p class="settings-note" v-else>
          {{ currentFormula.name }} formula is loaded from its own file in <code>src/formulas/</code>.
        </p>
      </div>
    </div>

    <div v-else class="wizard-block">
      <div class="field-form">
        <label>
          Name
          <input v-model.trim="customName" type="text" placeholder="Example: Revenue Per Unit" />
        </label>

        <label>
          Input Count (v1..vN)
          <input v-model.number="customInputCount" type="number" min="1" max="8" />
        </label>

        <label>
          Expression
          <input v-model.trim="customExpression" type="text" placeholder="Example: (v1 - v2) / v3" />
        </label>
      </div>

      <p class="settings-note">
        Allowed: <code>v1..v8</code>, <code>rowIndex</code>, operators, and math helpers like <code>min()</code>, <code>max()</code>, <code>round()</code>, <code>sqrt()</code>.
      </p>

      <div class="field-form">
        <label>
          Test Values (comma separated)
          <input v-model.trim="testValuesInput" type="text" placeholder="Example: 100,40,5" />
        </label>
        <button type="button" class="soft" @click="runPreview">Run Test Preview</button>
        <button type="button" :disabled="!canSaveCustom" @click="saveCustomFormula">Save Custom Formula</button>
      </div>

      <p v-if="previewMessage" class="settings-note">{{ previewMessage }}</p>
      <p v-if="customValidationMessage" class="settings-note">{{ customValidationMessage }}</p>

      <div class="field-list">
        <div v-for="formula in customFormulaOptions" :key="formula.id" class="field-pill">
          <span>{{ formula.name }} | {{ formula.expression }}</span>
          <button type="button" @click="removeCustomFormula(formula.id)">x</button>
        </div>
      </div>
    </div>

    <p v-if="status" class="settings-note">{{ status }}</p>
  </section>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { formulas, formulaMap } from '../formulas';
import { evaluateCustomExpression, makeCustomFormulaDefinition, validateCustomExpression } from '../formulas/customFormulaTools';
import { useDataStore } from '../stores/dataStore';
import { useChartStore } from '../stores/chartStore';

const dataStore = useDataStore();
const chartStore = useChartStore();

const mode = ref('apply');
const selectedFormulaId = ref(formulas[0]?.id || '');
const outputFieldName = ref('');
const inputFieldIds = ref([]);
const status = ref('');

const customName = ref('');
const customInputCount = ref(2);
const customExpression = ref('');
const testValuesInput = ref('');
const previewMessage = ref('');
const customValidationMessage = ref('');

const customFormulaOptions = computed(() => dataStore.customFormulas.map((formula) => ({
  id: formula.id,
  name: `Custom: ${formula.name}`,
  expression: formula.expression,
  inputs: formula.inputLabels,
  isCustom: true
})));

const allFormulas = computed(() => {
  const builtIn = formulas.map((formula) => ({ ...formula, isCustom: false }));
  return [...builtIn, ...customFormulaOptions.value].sort((a, b) => a.name.localeCompare(b.name));
});

const currentFormula = computed(() => {
  const builtIn = formulaMap.get(selectedFormulaId.value);
  if (builtIn) return { ...builtIn, isCustom: false };
  return customFormulaOptions.value.find((formula) => formula.id === selectedFormulaId.value) || null;
});

const canApply = computed(() => {
  if (!currentFormula.value) return false;
  if (!dataStore.sortedNumericFields.length) return false;
  return currentFormula.value.inputs.every((_, index) => Boolean(inputFieldIds.value[index]));
});

const canSaveCustom = computed(() => {
  const result = makeCustomFormulaDefinition({
    name: customName.value,
    expression: customExpression.value,
    inputCount: customInputCount.value
  });
  return result.ok;
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

function parseTestValues() {
  const max = Math.max(1, Math.min(8, Math.round(Number(customInputCount.value) || 1)));
  const values = String(testValuesInput.value || '')
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length)
    .slice(0, max)
    .map((item) => Number(item));

  while (values.length < max) values.push(0);
  return values;
}

function runPreview() {
  customValidationMessage.value = '';
  const validation = validateCustomExpression(customExpression.value, customInputCount.value);
  if (!validation.ok) {
    previewMessage.value = '';
    customValidationMessage.value = `Validation failed: ${validation.error}`;
    return;
  }

  const result = evaluateCustomExpression(customExpression.value, parseTestValues(), 0);
  if (!result.ok) {
    previewMessage.value = '';
    customValidationMessage.value = `Preview failed: ${result.error}`;
    return;
  }

  previewMessage.value = `Preview result: ${Math.round(result.value * 10000) / 10000}`;
}

function saveCustomFormula() {
  const built = makeCustomFormulaDefinition({
    name: customName.value,
    expression: customExpression.value,
    inputCount: customInputCount.value
  });

  if (!built.ok) {
    customValidationMessage.value = `Validation failed: ${built.error}`;
    return;
  }

  const saved = dataStore.upsertCustomFormula(built.formula);
  if (!saved.ok) {
    customValidationMessage.value = 'Unable to save custom formula.';
    return;
  }

  selectedFormulaId.value = saved.formula.id;
  status.value = `Custom formula saved: ${saved.formula.name}`;
  customName.value = '';
  customExpression.value = '';
  customInputCount.value = 2;
  testValuesInput.value = '';
  previewMessage.value = '';
  customValidationMessage.value = '';
}

function removeCustomFormula(formulaId) {
  dataStore.deleteCustomFormula(formulaId);
  if (selectedFormulaId.value === formulaId) {
    selectedFormulaId.value = formulas[0]?.id || '';
  }
  status.value = 'Custom formula removed.';
}

watch(
  () => selectedFormulaId.value,
  () => {
    resetInputsForFormula();
  },
  { immediate: true }
);

watch(
  () => [customInputCount.value, customExpression.value],
  () => {
    const validation = validateCustomExpression(customExpression.value, customInputCount.value);
    customValidationMessage.value = validation.ok || !String(customExpression.value || '').trim()
      ? ''
      : `Validation failed: ${validation.error}`;
  }
);
</script>
