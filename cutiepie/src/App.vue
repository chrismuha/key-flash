<template>
  <div>
    <QuitModal />
    <OnboardingTourModal :open="showOnboarding" @close="showOnboarding = false" />
    <RoleStartupModal :open="showRoleStartup" @close="closeRoleStartup" />

    <div class="ambient ambient-a"></div>
    <div class="ambient ambient-b"></div>

    <main class="app-shell">
      <header class="hero">
        <div class="hero-top">
          <p class="eyebrow">CutiePie</p>
          <div class="hero-actions">
            <nav class="nav-tabs">
              <RouterLink to="/builder">Builder</RouterLink>
              <RouterLink to="/dashboard">Dashboard</RouterLink>
              <RouterLink to="/reports">Reports</RouterLink>
              <RouterLink to="/settings">Settings</RouterLink>
              <RouterLink to="/diagnostics">Diagnostics</RouterLink>
              <RouterLink to="/changelog">Changelog</RouterLink>
              <RouterLink to="/about">About</RouterLink>
            </nav>
            <button type="button" class="hero-export-btn" :disabled="isExporting" @click="exportPagePdf">
              {{ isExporting ? 'Exporting PDF...' : 'Export Page as PDF' }}
            </button>
          </div>
        </div>
        <h1>Chart Studio</h1>
        <p>CutiePie is a chart-building workspace that helps manage your business by automating chart creation from custom data fields, so you can quickly track performance, compare results, and make decisions with up-to-date visuals.</p>
        <p v-if="exportStatus" class="hero-status">{{ exportStatus }}</p>
      </header>

      <RouterView />
    </main>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import QuitModal from './components/QuitModal.vue';
import RoleStartupModal from './components/RoleStartupModal.vue';
import OnboardingTourModal from './components/OnboardingTourModal.vue';
import { exportCurrentPagePdf } from './services/pdfService';
import { useSettingsStore } from './stores/settingsStore';
import { useDataStore } from './stores/dataStore';

const route = useRoute();
const isExporting = ref(false);
const exportStatus = ref('');
const settings = useSettingsStore();
const dataStore = useDataStore();
const showRoleStartup = ref(true);
const showOnboarding = ref(false);

function closeRoleStartup() {
  showRoleStartup.value = false;
  if (settings.onboardingCompleted !== true) {
    showOnboarding.value = true;
  }
}

async function exportPagePdf() {
  if (isExporting.value) return;
  isExporting.value = true;
  const pageName = String(route.path || 'page').replaceAll('/', '-') || 'page';
  const result = await exportCurrentPagePdf(pageName);

  if (result?.ok) {
    exportStatus.value = `PDF exported: ${result.fileName}`;
  } else if (result?.canceled) {
    exportStatus.value = 'PDF export canceled.';
  } else {
    exportStatus.value = 'PDF export failed.';
  }

  isExporting.value = false;
}

function onKeydown(event) {
  const isMod = event.metaKey || event.ctrlKey;
  if (!isMod) return;
  const key = String(event.key || '').toLowerCase();

  if (key === 's') {
    event.preventDefault();
    if (window.__CUTIEPIE_PERSIST_STATE) window.__CUTIEPIE_PERSIST_STATE();
    if (window.__CUTIEPIE_PERSIST_SETTINGS) window.__CUTIEPIE_PERSIST_SETTINGS();
    return;
  }

  if (key === 'z' && !event.shiftKey) {
    event.preventDefault();
    dataStore.undo();
    return;
  }

  if ((key === 'z' && event.shiftKey) || key === 'y') {
    event.preventDefault();
    dataStore.redo();
  }
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown);
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown);
});
</script>
