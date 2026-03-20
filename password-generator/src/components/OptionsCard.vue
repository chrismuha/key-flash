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
  charsetInfoOpen: {
    type: Boolean,
    required: true
  },
  entropyBits: {
    type: Number,
    required: true
  },
  entropyInfoOpen: {
    type: Boolean,
    required: true
  }
});

const emit = defineEmits([
  'close-charset-info',
  'close-entropy-info',
  'toggle-charset-info',
  'toggle-entropy-info',
  'update:state',
  'update:groups',
  'update:chars-per-group'
]);

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
        <span class="metric-label metric-label-row">
          <span>Charset</span>
          <button class="metric-info-button" type="button" aria-label="What is charset?" @click="$emit('toggle-charset-info')">
            <i class="bi bi-info-circle"></i>
          </button>
        </span>
        <strong>{{ charsetSize }} characters</strong>
      </div>
      <div>
        <span class="metric-label metric-label-row">
          <span>Entropy</span>
          <button class="metric-info-button" type="button" aria-label="What is entropy?" @click="$emit('toggle-entropy-info')">
            <i class="bi bi-info-circle"></i>
          </button>
        </span>
        <strong>{{ entropyBits }} bits</strong>
      </div>
    </div>

    <section v-if="charsetInfoOpen" class="info-overlay" @click.self="$emit('close-charset-info')">
      <div class="info-modal">
        <div class="info-modal-header">
          <span>Charset</span>
          <button class="info-modal-close" type="button" aria-label="Close charset help" @click="$emit('close-charset-info')">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
        <div class="info-panel">
          <p><strong>Charset</strong> is the number of different characters the generator can currently choose from.</p>
          <p>If it says <strong>58</strong>, the password can be built from 58 possible characters based on your current settings.</p>
          <p>More available characters usually means more entropy and a harder password to guess.</p>
        </div>
      </div>
    </section>

    <section v-if="entropyInfoOpen" class="info-overlay" @click.self="$emit('close-entropy-info')">
      <div class="info-modal">
        <div class="info-modal-header">
          <span>Entropy</span>
          <button class="info-modal-close" type="button" aria-label="Close entropy help" @click="$emit('close-entropy-info')">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
        <div class="info-panel">
          <p><strong>Entropy</strong> is an estimate of how hard the password is to guess.</p>
          <p><strong>Not secure:</strong> under 40 bits.</p>
          <p><strong>Somewhat secure:</strong> 40 to 59 bits.</p>
          <p><strong>Secure:</strong> 60 to 99 bits.</p>
          <p><strong>Very secure:</strong> 100+ bits.</p>
        </div>
      </div>
    </section>
  </section>
</template>
