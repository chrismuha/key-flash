<template>
  <div v-if="open" class="quit-overlay" role="dialog" aria-modal="true" aria-labelledby="onboard-title" tabindex="0" @keydown="onKeydown">
    <div class="quit-modal role-modal">
      <p class="quit-kicker">First Launch Tour</p>
      <h2 id="onboard-title">{{ steps[index].title }}</h2>
      <p class="quit-text">{{ steps[index].text }}</p>
      <p class="settings-note">Step {{ index + 1 }} of {{ steps.length }}</p>
      <div class="settings-toggle" style="margin-top: 0.4rem;">
        <input id="dont-show" v-model="dontShowAgain" type="checkbox" />
        <label for="dont-show">Don't show again</label>
      </div>
      <div class="quit-actions">
        <button type="button" class="soft" @click="skip">Skip</button>
        <button type="button" class="soft" :disabled="index === 0" @click="prev">Back</button>
        <button v-if="index < steps.length - 1" type="button" class="soft" @click="next">Next</button>
        <button v-else type="button" class="soft" @click="finish">Done</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useSettingsStore } from '../stores/settingsStore';

const props = defineProps({ open: { type: Boolean, default: false } });
const emit = defineEmits(['close']);

const router = useRouter();
const settings = useSettingsStore();
const index = ref(0);
const dontShowAgain = ref(false);

const steps = [
  { title: 'Builder', text: 'Create fields, enter row data, validate it, and generate charts from your dataset.' , route: '/builder' },
  { title: 'Dashboard', text: 'Review generated charts, pin important ones, add notes, and track KPI/threshold alerts.', route: '/dashboard' },
  { title: 'Settings', text: 'Control roles, save behavior, thresholds, backups, export options, and startup behavior.', route: '/settings' }
];

function goToCurrent() {
  const step = steps[index.value];
  if (step?.route) router.push(step.route);
}

function next() {
  if (index.value < steps.length - 1) {
    index.value += 1;
    goToCurrent();
  }
}

function prev() {
  if (index.value > 0) {
    index.value -= 1;
    goToCurrent();
  }
}

function closeTour(markComplete = true) {
  if (markComplete || dontShowAgain.value) settings.onboardingCompleted = true;
  emit('close');
}

function finish() {
  closeTour(true);
}

function skip() {
  closeTour(dontShowAgain.value);
}

function onKeydown(event) {
  const key = String(event.key || '').toLowerCase();
  if (key === 'arrowright') {
    event.preventDefault();
    if (index.value < steps.length - 1) next();
    else finish();
    return;
  }
  if (key === 'arrowleft') {
    event.preventDefault();
    prev();
    return;
  }
  if (key === 'escape') {
    event.preventDefault();
    skip();
    return;
  }
  if (key === 'enter') {
    event.preventDefault();
    if (index.value < steps.length - 1) next();
    else finish();
  }
}
</script>
