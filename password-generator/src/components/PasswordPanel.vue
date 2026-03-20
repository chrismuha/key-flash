<script setup>
defineProps({
  password: {
    type: String,
    required: true
  },
  historyCount: {
    type: Number,
    required: true
  },
  length: {
    type: Number,
    required: true
  },
  securityLabel: {
    type: String,
    required: true
  }
});

defineEmits(['generate', 'copy', 'toggle-history']);
</script>

<template>
  <section class="hero-panel">
    <div class="hero-heading">
      <div class="hero-title-row">
        <h1>password-generator</h1>
        <div class="hero-toolbar">
          <button class="toolbar-button" type="button" aria-label="Password history" @click="$emit('toggle-history')">
            <i class="bi bi-clock-history"></i>
            <span class="toolbar-count">{{ historyCount }}</span>
          </button>
        </div>
      </div>
    </div>

    <div class="result-card">
      <div class="result-value">{{ password }}</div>
      <div class="result-meta">{{ length }} characters · {{ securityLabel }}</div>
      <button class="result-action" type="button" @click="$emit('generate')">Generate Password</button>
      <button class="result-action" type="button" @click="$emit('copy')">Copy to Clipboard</button>
    </div>
  </section>
</template>
