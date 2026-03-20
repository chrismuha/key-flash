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

defineEmits(['clear-history', 'close', 'copy']);
</script>

<template>
  <section v-if="open" class="history-overlay" @click.self="$emit('close')">
    <div class="history-panel">
      <div class="history-header">
        <div class="history-heading">
          <p class="history-kicker">Saved Passwords</p>
          <h2>Password History</h2>
          <p class="history-subtitle">
            <span>{{ history.length }} {{ history.length === 1 ? 'entry' : 'entries' }}</span>
            <span>Click any saved password to copy it again.</span>
          </p>
        </div>
        <div class="history-header-actions">
          <button v-if="history.length" class="history-clear" type="button" @click="$emit('clear-history')">Clear</button>
          <button class="history-close" type="button" aria-label="Close history" @click="$emit('close')">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
      </div>

      <div class="history-list" v-if="history.length">
        <article v-for="entry in history" :key="`${entry.value}-${entry.createdAt}`" class="history-item">
          <button class="history-copy" type="button" @click="$emit('copy', entry.value)">
            <div class="history-value">{{ entry.value }}</div>
            <div class="history-meta">{{ entry.length }} chars · {{ entry.createdAt }}</div>
          </button>
        </article>
      </div>

      <div class="history-list" v-else>
        <article class="history-item">
          <div class="history-value">No generated passwords yet.</div>
          <div class="history-meta">Use Generate Password to add entries here.</div>
        </article>
      </div>
    </div>
  </section>
</template>
