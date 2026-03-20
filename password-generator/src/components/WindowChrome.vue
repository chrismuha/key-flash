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
    <div class="traffic-lights" aria-hidden="true">
      <span class="light red"></span>
      <span class="light yellow"></span>
      <span class="light green"></span>
    </div>
    <div class="window-title">{{ title }}</div>
  </header>
</template>
