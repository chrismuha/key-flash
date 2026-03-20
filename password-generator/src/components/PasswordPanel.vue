<script setup>
defineProps({
  password: {
    type: String,
    required: true
  },
  length: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    required: true
  }
});

defineEmits(['generate', 'copy']);
</script>

<template>
  <section class="hero-panel">
    <div class="hero-heading">
      <h1>password-generator</h1>
    </div>

    <div class="result-card">
      <div class="result-value">{{ password }}</div>
      <div class="result-meta">{{ length }} characters</div>
      <button class="result-action" type="button" @click="$emit('generate')">Generate Password</button>
      <button class="result-action" type="button" @click="$emit('copy')">Copy to Clipboard</button>
    </div>

    <div class="status-line">{{ status }}</div>
  </section>
</template>
