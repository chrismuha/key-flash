<script setup>
defineProps({
  open: {
    type: Boolean,
    required: true
  },
  history: {
    type: Array,
    required: true
  }
});

defineEmits(['clear-history', 'copy', 'toggle']);
</script>

<template>
  <section class="history-panel">
    <button class="history-header" type="button" @click="$emit('toggle')">
      <span>View Password History</span>
      <span class="chevron">›</span>
    </button>

    <div class="history-list" v-if="open && history.length">
      <button class="history-clear" type="button" @click="$emit('clear-history')">Clear History</button>
      <article v-for="entry in history" :key="`${entry.value}-${entry.createdAt}`" class="history-item">
        <button class="history-copy" type="button" @click="$emit('copy', entry.value)">
          <div class="history-value">{{ entry.value }}</div>
          <div class="history-meta">{{ entry.length }} chars · {{ entry.createdAt }}</div>
        </button>
      </article>
    </div>

    <div class="history-list" v-else-if="open">
      <article class="history-item">
        <div class="history-value">No generated passwords yet.</div>
        <div class="history-meta">Use Generate Password to add entries here.</div>
      </article>
    </div>
  </section>
</template>
