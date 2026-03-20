<script setup>
defineProps({
  password: {
    type: String,
    required: true
  },
  infoOpen: {
    type: Boolean,
    required: true
  },
  length: {
    type: Number,
    required: true
  },
  securityLabel: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: true
  }
});

defineEmits(['generate', 'copy', 'toggle-info']);
</script>

<template>
  <section class="hero-panel">
    <div class="hero-heading">
      <div class="hero-title-row">
        <h1>password-generator</h1>
        <button class="info-button" type="button" aria-label="What is entropy?" @click="$emit('toggle-info')">
          <i class="bi bi-info-circle"></i>
        </button>
      </div>
      <div v-if="infoOpen" class="info-panel">
        <p><strong>Entropy</strong> is an estimate of how hard the password is to guess.</p>
        <p><strong>Not secure:</strong> under 40 bits.</p>
        <p><strong>Somewhat secure:</strong> 40 to 59 bits.</p>
        <p><strong>Secure:</strong> 60 to 99 bits.</p>
        <p><strong>Very secure:</strong> 100+ bits.</p>
      </div>
    </div>

    <div class="result-card">
      <div class="result-value">{{ password }}</div>
      <div class="result-meta">{{ length }} characters · {{ securityLabel }}</div>
      <button class="result-action" type="button" @click="$emit('generate')">Generate Password</button>
      <button class="result-action" type="button" @click="$emit('copy')">Copy to Clipboard</button>
    </div>

    <div class="status-line">{{ status }}</div>
  </section>
</template>
