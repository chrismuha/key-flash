<template>
  <div v-if="appStore.showQuitModal" class="quit-overlay" role="dialog" aria-modal="true" aria-labelledby="quit-title">
    <div class="quit-modal">
      <p class="quit-kicker">Quit Protection</p>
      <h2 id="quit-title">Leave CutiePie?</h2>
      <p class="quit-text">You are about to quit the app. Unsaved active edits may be lost.</p>
      <div class="quit-actions">
        <button type="button" class="soft" @click="keepWorking">Keep Working</button>
        <button type="button" class="quit-now" @click="quitApp">Quit App</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAppStore } from '../stores/appStore';
import { cancelQuit, confirmQuit } from '../services/quitService';

const appStore = useAppStore();

async function keepWorking() {
  appStore.showQuitModal = false;
  await cancelQuit();
}

async function quitApp() {
  await confirmQuit();
}
</script>
