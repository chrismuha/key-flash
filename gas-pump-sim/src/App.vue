<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import gasolinePumpNozzle from './assets/gasoline-pump-nozzle.png';

const priceInput = ref('3.79');
const gallonsThousandths = ref(0);
const isPumping = ref(false);
const cashierMessage = ref(false);
const flowRateThousandthsPerSecond = 92;
const holdDelayMs = 120;
const maxSaleCents = 999999;
const maxManualPrice = '9999.99';
const maxWholeDigits = 4;
const maxDecimalDigits = 2;
let animationFrame = null;
let previousTime = 0;
let pendingThousandths = 0;
let holdTimer = null;

const pricePerGallonMills = computed(() => parseDecimalToScaledInt(priceInput.value, 2) * 10);
const saleCents = computed(() => Math.round((gallonsThousandths.value * pricePerGallonMills.value) / 10000));
const gallonsDisplay = computed(() => formatScaledInt(gallonsThousandths.value, 3));
const saleDisplay = computed(() => formatScaledInt(saleCents.value, 2));
const priceDisplay = computed(() => formatScaledInt(Math.round(pricePerGallonMills.value / 10), 2));
const saleDigitsClass = computed(() => getDigitsClass(`$${saleDisplay.value}`.length));
const priceDigitsClass = computed(() => getDigitsClass(priceInput.value.length));
const maxGallonsThousandths = computed(() => {
  if (pricePerGallonMills.value <= 0) {
    return Number.MAX_SAFE_INTEGER;
  }

  return Math.floor((maxSaleCents * 10000) / pricePerGallonMills.value);
});

function parseDecimalToScaledInt(value, digits) {
  const normalizedValue = value.trim();

  if (!normalizedValue) {
    return 0;
  }

  const [wholePart = '0', decimalPart = ''] = normalizedValue.split('.');
  const sanitizedWhole = wholePart.replace(/\D/g, '') || '0';
  const sanitizedDecimals = decimalPart.replace(/\D/g, '').slice(0, digits).padEnd(digits, '0');

  return Number.parseInt(`${sanitizedWhole}${sanitizedDecimals}`, 10);
}

function formatScaledInt(value, digits) {
  if (!Number.isFinite(value)) {
    return digits > 0 ? `0.${'0'.repeat(digits)}` : '0';
  }

  const sign = value < 0 ? '-' : '';
  const absoluteValue = Math.abs(value);
  const divisor = 10 ** digits;
  const whole = Math.floor(absoluteValue / divisor);
  const remainder = absoluteValue % divisor;

  if (digits === 0) {
    return `${sign}${whole}`;
  }

  return `${sign}${whole}.${String(remainder).padStart(digits, '0')}`;
}

function getDigitsClass(length) {
  if (length >= 18) {
    return 'digits-micro';
  }

  if (length >= 15) {
    return 'digits-mini';
  }

  if (length >= 12) {
    return 'digits-compact';
  }

  if (length >= 9) {
    return 'digits-tight';
  }

  return '';
}

function resetPump() {
  gallonsThousandths.value = 0;
  pendingThousandths = 0;
  previousTime = 0;
  cashierMessage.value = false;
}

function stopPump() {
  isPumping.value = false;

  if (animationFrame) {
    cancelAnimationFrame(animationFrame);
    animationFrame = null;
  }
}

function clearHoldTimer() {
  if (holdTimer) {
    clearTimeout(holdTimer);
    holdTimer = null;
  }
}

function tick(timestamp) {
  if (!isPumping.value) {
    return;
  }

  if (!previousTime) {
    previousTime = timestamp;
  }

  const elapsedSeconds = (timestamp - previousTime) / 1000;
  previousTime = timestamp;
  pendingThousandths += flowRateThousandthsPerSecond * elapsedSeconds;

  if (pendingThousandths >= 1) {
    const steps = Math.floor(pendingThousandths);
    const nextGallons = Math.min(gallonsThousandths.value + steps, maxGallonsThousandths.value);
    gallonsThousandths.value = nextGallons;
    pendingThousandths -= steps;
  }

  if (gallonsThousandths.value >= maxGallonsThousandths.value || saleCents.value >= maxSaleCents) {
    cashierMessage.value = true;
    pendingThousandths = 0;
    stopPump();
    return;
  }

  animationFrame = requestAnimationFrame(tick);
}

function startPump() {
  if (isPumping.value || cashierMessage.value) {
    return;
  }

  isPumping.value = true;
  previousTime = 0;
  animationFrame = requestAnimationFrame(tick);
}

function beginPumpHold() {
  normalizePriceOnBlur();
  clearHoldTimer();
  holdTimer = setTimeout(() => {
    startPump();
    holdTimer = null;
  }, holdDelayMs);
}

function endPumpHold() {
  clearHoldTimer();
  stopPump();
}

function updatePrice(event) {
  const sanitizedValue = event.target.value.replace(/[^0-9.]/g, '');
  const firstDecimalIndex = sanitizedValue.indexOf('.');
  cashierMessage.value = false;

  if (firstDecimalIndex === -1) {
    priceInput.value = sanitizedValue;
    return;
  }

  const wholeDigits = sanitizedValue.slice(0, firstDecimalIndex);
  const decimalDigits = sanitizedValue.slice(firstDecimalIndex + 1).replace(/\./g, '');
  const whole = `${wholeDigits}.`;
  const decimals = decimalDigits;
  const nextValue = `${whole}${decimals}`;
  priceInput.value = nextValue;
}

function blockInvalidPriceKeys(event) {
  const allowedKeys = [
    'Backspace',
    'Delete',
    'Tab',
    'ArrowLeft',
    'ArrowRight',
    'ArrowUp',
    'ArrowDown',
    'Home',
    'End',
    '.',
  ];

  if (event.ctrlKey || event.metaKey) {
    return;
  }

  if (allowedKeys.includes(event.key)) {
    return;
  }

  if (!/^\d$/.test(event.key)) {
    event.preventDefault();
  }
}

function normalizePriceOnBlur() {
  if (!priceInput.value || priceInput.value === '.') {
    priceInput.value = '0.00';
    return;
  }

  const numericValue = Number.parseFloat(priceInput.value);
  const [wholePart = '', decimalPart = ''] = priceInput.value.split('.');
  const exceedsVisualLimit = wholePart.length > maxWholeDigits || decimalPart.length > maxDecimalDigits;

  if (!Number.isFinite(numericValue) || numericValue < 0) {
    priceInput.value = '0.00';
    return;
  }

  if (numericValue > Number.parseFloat(maxManualPrice) || exceedsVisualLimit) {
    priceInput.value = maxManualPrice;
    return;
  }

  priceInput.value = numericValue.toFixed(2);
}

function exceedsManualPriceCap(value) {
  if (!value || value === '.') {
    return false;
  }

  const numericValue = Number.parseFloat(value);
  return Number.isFinite(numericValue) && numericValue > Number.parseFloat(maxManualPrice);
}

function handleKeydown(event) {
  if (event.code === 'Space') {
    event.preventDefault();
    startPump();
  }

  if (event.code === 'KeyR') {
    event.preventDefault();
    stopPump();
    resetPump();
  }
}

function handleKeyup(event) {
  if (event.code === 'Space') {
    event.preventDefault();
    stopPump();
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
  window.addEventListener('keyup', handleKeyup);
});

onBeforeUnmount(() => {
  stopPump();
  window.removeEventListener('keydown', handleKeydown);
  window.removeEventListener('keyup', handleKeyup);
});
</script>

<template>
  <main class="app-shell container-fluid py-4 py-lg-5">
    <section class="pump mx-auto">
      <div class="pump-top d-flex flex-column flex-lg-row justify-content-between align-items-lg-start gap-3">
        <div class="brand">
          <h1>Gas Pump Simulator</h1>
          <p>Hold <strong>Space</strong> or hold the handle to pump.</p>
        </div>

        <div class="status-light align-self-start" :class="{ live: isPumping }">
          {{ isPumping ? 'FUELING' : 'READY' }}
        </div>
      </div>

      <div class="row g-3">
        <div class="col-12 col-lg-4">
          <article class="display-card h-100">
            <span class="label">Sale</span>
            <span v-if="cashierMessage" class="message-display">Please see cashier.</span>
            <span v-else class="money" :class="saleDigitsClass">${{ saleDisplay }}</span>
          </article>
        </div>

        <div class="col-12 col-lg-4">
          <article class="display-card h-100">
            <span class="label">Gallons</span>
            <span class="digits">{{ gallonsDisplay }}</span>
          </article>
        </div>

        <div class="col-12 col-lg-4">
          <article class="display-card price-card h-100">
            <label class="label" for="price">Price Per Gallon</label>
            <div class="price-input-row">
              <span class="prefix">$</span>
              <input
                id="price"
                :value="priceInput"
                :class="['price-input', 'form-control', 'border-0', 'shadow-none', priceDigitsClass]"
                type="text"
                inputmode="decimal"
                spellcheck="false"
                @keydown="blockInvalidPriceKeys"
                @input="updatePrice"
                @blur="normalizePriceOnBlur"
              />
            </div>
            <span class="hint">Display price:${{ priceDisplay }}</span>
          </article>
        </div>
      </div>

      <div class="row g-3 mt-1">
        <div class="col-12 col-lg-8">
          <button
            class="handle w-100"
            :class="{ active: isPumping }"
            @pointerdown="beginPumpHold"
            @pointerup="endPumpHold"
            @pointerleave="endPumpHold"
            @pointercancel="endPumpHold"
          >
            <img
              class="handle-image"
              :class="{ active: isPumping }"
              :src="gasolinePumpNozzle"
              alt="Gas pump nozzle"
            />
            <span class="handle-label">{{ isPumping ? 'Release Handle' : 'Hold Handle' }}</span>
          </button>
        </div>

        <div class="col-12 col-lg-4">
          <div class="controls h-100 d-flex flex-column justify-content-center">
            <button
              class="action-button btn"
              @pointerdown="beginPumpHold"
              @pointerup="endPumpHold"
              @pointerleave="endPumpHold"
              @pointercancel="endPumpHold"
            >
              Hold To Pump
            </button>
            <button class="action-button secondary btn" @click="stopPump(); resetPump();">
              Reset
            </button>
            <p class="mb-0">Keyboard: hold <strong>Space</strong> to pump, <strong>R</strong> reset.</p>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>
