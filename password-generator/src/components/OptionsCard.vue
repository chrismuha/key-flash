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

const emit = defineEmits(['update:state', 'update:groups', 'update:separator']);

const separators = ['.', '-', '_', 'None'];
const symbolPresets = ['Minimal', 'Dot', 'Standard', 'Extended'];

const separatorLabel = computed(() => props.state.noSeparators ? 'None' : props.state.separator === '.' ? 'Dot' : props.state.separator);

function patchState(patch) {
  emit('update:state', { ...props.state, ...patch });
}

function cycleValue(values, current) {
  const currentIndex = values.indexOf(current);
  const nextIndex = (currentIndex + 1) % values.length;
  return values[nextIndex];
}

function cycleSeparator() {
  const nextLabel = cycleValue(separators, separatorLabel.value);

  if (nextLabel === 'None') {
    patchState({ noSeparators: true });
    emit('update:separator', '.');
    return;
  }

  patchState({ noSeparators: false });
  emit('update:separator', nextLabel === 'Dot' ? '.' : nextLabel);
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
        :value="String(state.charsPerGroup)"
        @click="patchState({ charsPerGroup: state.charsPerGroup >= 8 ? 3 : state.charsPerGroup + 1 })"
      />
    </div>

    <div class="metrics-card">
      <div>
        <span class="metric-label">Charset</span>
        <strong>{{ charsetSize }} characters</strong>
      </div>
      <div>
        <span class="metric-label">Entropy</span>
        <strong>{{ entropyBits.toFixed(1) }} bits</strong>
      </div>
    </div>
  </section>
</template>
