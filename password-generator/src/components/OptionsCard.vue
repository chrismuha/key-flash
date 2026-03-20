<script setup>
import { computed } from 'vue';
import OptionRow from './OptionRow.vue';

const props = defineProps({
  state: {
    type: Object,
    required: true
  },
  charsetSize: {
    type: Number,
    required: true
  },
  entropyBits: {
    type: Number,
    required: true
  }
});

const emit = defineEmits(['update:state', 'update:groups', 'update:chars-per-group']);

const separators = [
  { label: 'Dot', value: '.', noSeparators: false },
  { label: '-', value: '-', noSeparators: false },
  { label: 'Space', value: ' ', noSeparators: false },
  { label: 'None', value: '', noSeparators: true }
];
const symbolPresets = ['Minimal', 'Dot', 'Standard', 'Extended'];

const separatorLabel = computed(() => {
  const current = separators.find((item) => (
    item.noSeparators === props.state.noSeparators
    && item.value === (props.state.noSeparators ? '' : props.state.separator)
  ));

  return current?.label || 'Dot';
});

function patchState(patch) {
  emit('update:state', { ...props.state, ...patch });
}

function cycleValue(values, current) {
  const currentIndex = values.findIndex((value) => value === current || value.label === current);
  const nextIndex = (currentIndex + 1) % values.length;
  return values[nextIndex];
}

function cycleSeparator() {
  const nextSeparator = cycleValue(separators, separatorLabel.value);
  patchState({
    noSeparators: nextSeparator.noSeparators,
    separator: nextSeparator.noSeparators ? '' : nextSeparator.value
  });
}

function cycleSymbolPreset() {
  patchState({ symbolPreset: cycleValue(symbolPresets, props.state.symbolPreset) });
}
</script>

<template>
  <section class="options-panel">
    <h2>Options</h2>

    <div class="list-card">
      <OptionRow
        label="Groups"
        kind="stepper"
        :value="`${state.groups} groups`"
        @decrement="$emit('update:groups', state.groups - 1)"
        @increment="$emit('update:groups', state.groups + 1)"
      />
      <OptionRow
        label="Include uppercase"
        kind="toggle"
        :checked="state.includeUppercase"
        @toggle="patchState({ includeUppercase: !state.includeUppercase })"
      />
      <OptionRow
        label="Include random number"
        kind="toggle"
        :checked="state.includeNumbers"
        @toggle="patchState({ includeNumbers: !state.includeNumbers })"
      />
      <OptionRow
        label="Include special character"
        kind="toggle"
        :checked="state.includeSymbols"
        @toggle="patchState({ includeSymbols: !state.includeSymbols })"
      />
      <OptionRow
        label="Exclude ambiguous"
        kind="toggle"
        :checked="state.excludeAmbiguous"
        @toggle="patchState({ excludeAmbiguous: !state.excludeAmbiguous })"
      />
      <OptionRow
        label="Save only copied passwords"
        kind="toggle"
        :checked="state.historyOnCopyOnly"
        @toggle="patchState({ historyOnCopyOnly: !state.historyOnCopyOnly })"
      />
      <OptionRow
        label="Special characters"
        :value="state.symbolPreset"
        @click="cycleSymbolPreset"
      />
      <OptionRow
        label="Separator"
        :value="separatorLabel"
        @click="cycleSeparator"
      />
      <OptionRow
        label="Characters per group"
        kind="stepper"
        :value="`${state.charsPerGroup} chars`"
        @decrement="$emit('update:chars-per-group', state.charsPerGroup - 1)"
        @increment="$emit('update:chars-per-group', state.charsPerGroup + 1)"
      />
    </div>

    <div class="metrics-card">
      <div>
        <span class="metric-label">Charset</span>
        <strong>{{ charsetSize }} characters</strong>
      </div>
      <div>
        <span class="metric-label">Entropy</span>
        <strong>{{ entropyBits }} bits</strong>
      </div>
    </div>
  </section>
</template>
