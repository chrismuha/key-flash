<script setup>
import { computed, ref, watch } from 'vue';
import WindowChrome from './components/WindowChrome.vue';
import PasswordPanel from './components/PasswordPanel.vue';
import OptionsCard from './components/OptionsCard.vue';
import HistoryCard from './components/HistoryCard.vue';

const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const NUMBERS = '0123456789';
const SYMBOL_PRESETS = {
  Minimal: '!.',
  Dot: '.',
  Standard: '!@#$%^&*',
  Extended: '!@#$%^&*()_+-=[]{}:;,.?/'
};
const AMBIGUOUS = new Set(['0', 'O', 'o', '1', 'l', 'I', '|']);

const state = ref({
  groups: 4,
  charsPerGroup: 4,
  includeUppercase: true,
  includeNumbers: true,
  includeSymbols: true,
  excludeAmbiguous: true,
  historyOnCopyOnly: true,
  noSeparators: true,
  separator: '',
  symbolPreset: 'Minimal'
});

const password = ref('');
const status = ref('Ready');
const history = ref([]);
const historyOpen = ref(false);
const entropyInfoOpen = ref(false);

function secureRandomInt(maxExclusive) {
  const values = new Uint32Array(1);
  const maxUint = 0x100000000;
  const limit = maxUint - (maxUint % maxExclusive);
  let value = 0;

  do {
    crypto.getRandomValues(values);
    value = values[0];
  } while (value >= limit);

  return value % maxExclusive;
}

const symbolCharacters = computed(() => SYMBOL_PRESETS[state.value.symbolPreset] || SYMBOL_PRESETS.Minimal);

const activePools = computed(() => {
  const pools = [LOWERCASE];

  if (state.value.includeUppercase) pools.push(UPPERCASE);
  if (state.value.includeNumbers) pools.push(NUMBERS);
  if (state.value.includeSymbols) pools.push(symbolCharacters.value);

  if (!state.value.excludeAmbiguous) return pools;

  return pools.map((pool) => Array.from(pool).filter((character) => !AMBIGUOUS.has(character)).join('')).filter(Boolean);
});

const combinedCharset = computed(() => activePools.value.join(''));

const totalCharacters = computed(() => state.value.groups * state.value.charsPerGroup);
const renderedLength = computed(() => {
  const separatorLength = state.value.noSeparators ? 0 : (state.value.groups - 1) * state.value.separator.length;
  return totalCharacters.value + separatorLength;
});
const entropyBits = computed(() => {
  if (!combinedCharset.value.length) return 0;
  return totalCharacters.value * Math.log2(combinedCharset.value.length);
});
const entropyWholeBits = computed(() => Math.round(entropyBits.value));
const securityLabel = computed(() => {
  if (entropyWholeBits.value < 40) return 'not secure';
  if (entropyWholeBits.value < 60) return 'somewhat secure';
  if (entropyWholeBits.value < 100) return 'secure';
  return 'very secure';
});

function shuffle(items) {
  const clone = items.slice();

  for (let index = clone.length - 1; index > 0; index -= 1) {
    const swapIndex = secureRandomInt(index + 1);
    [clone[index], clone[swapIndex]] = [clone[swapIndex], clone[index]];
  }

  return clone;
}

function choose(pool) {
  return pool[secureRandomInt(pool.length)];
}

function addHistoryEntry(value) {
  if (!value) return;

  const newestEntry = history.value[0];
  if (newestEntry?.value === value) return;

  history.value.unshift({
    value,
    length: value.length,
    createdAt: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
  });

  history.value = history.value.slice(0, 10);
}

function buildPassword(recordHistory = true) {
  if (!combinedCharset.value.length) {
    password.value = '';
    status.value = 'Select at least one usable character set.';
    return;
  }

  const characters = [];

  for (const pool of activePools.value) {
    if (characters.length < totalCharacters.value) {
      characters.push(choose(pool));
    }
  }

  while (characters.length < totalCharacters.value) {
    characters.push(choose(combinedCharset.value));
  }

  const groups = [];
  const shuffled = shuffle(characters);

  for (let index = 0; index < shuffled.length; index += state.value.charsPerGroup) {
    groups.push(shuffled.slice(index, index + state.value.charsPerGroup).join(''));
  }

  password.value = state.value.noSeparators ? groups.join('') : groups.join(state.value.separator);
  status.value = 'Generated password';

  if (recordHistory && !state.value.historyOnCopyOnly) {
    addHistoryEntry(password.value);
  }
}

async function copyPassword() {
  if (!password.value) {
    status.value = 'Nothing to copy';
    return;
  }

  await navigator.clipboard.writeText(password.value);
  if (state.value.historyOnCopyOnly) {
    addHistoryEntry(password.value);
    status.value = 'Copied to clipboard and saved to history';
    return;
  }

  status.value = 'Copied to clipboard';
}

async function copyHistoryValue(value) {
  await navigator.clipboard.writeText(value);
  status.value = 'Copied history item to clipboard';
}

function clearHistory() {
  history.value = [];
  status.value = 'Password history cleared';
}

function updateGroups(nextValue) {
  state.value.groups = Math.max(1, Math.min(12, nextValue));
}

function updateCharsPerGroup(nextValue) {
  state.value.charsPerGroup = Math.max(1, Math.min(32, nextValue));
}

watch(() => state.value.noSeparators, (isDisabled) => {
  if (isDisabled) {
    status.value = 'Separators disabled';
  }
});

watch(state, () => {
  buildPassword(false);
}, { deep: true });

buildPassword(false);
</script>

<template>
  <div class="app-shell">
    <WindowChrome title="password-generator" />

    <main class="app-frame">
      <PasswordPanel
        :password="password"
        :info-open="entropyInfoOpen"
        :length="renderedLength"
        :security-label="securityLabel"
        :status="status"
        @generate="buildPassword()"
        @copy="copyPassword"
        @toggle-info="entropyInfoOpen = !entropyInfoOpen"
      />

      <OptionsCard
        :state="state"
        :charset-size="combinedCharset.length"
        :entropy-bits="entropyWholeBits"
        @update:state="state = $event"
        @update:groups="updateGroups"
        @update:chars-per-group="updateCharsPerGroup"
      />

      <HistoryCard
        :open="historyOpen"
        :history="history"
        @clear-history="clearHistory"
        @toggle="historyOpen = !historyOpen"
        @copy="copyHistoryValue"
      />
    </main>
  </div>
</template>
