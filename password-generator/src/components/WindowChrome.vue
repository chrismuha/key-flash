<script setup>
defineProps({
  title: {
    type: String,
    required: true
  }
});
</script>

<template>
  <header class="window-chrome">
    <div class="window-title">{{ title }}</div>
  </header>
</template>
