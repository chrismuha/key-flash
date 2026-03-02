<template>
  <div>
    <QuitModal />

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
              <RouterLink to="/about">About</RouterLink>
            </nav>
            <button type="button" class="hero-export-btn" :disabled="isExporting" @click="exportPagePdf">
              {{ isExporting ? 'Exporting PDF...' : 'Export This Page PDF' }}
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
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import QuitModal from './components/QuitModal.vue';
import { exportCurrentPagePdf } from './services/pdfService';

const route = useRoute();
const isExporting = ref(false);
const exportStatus = ref('');

async function exportPagePdf() {
  if (isExporting.value) return;
  isExporting.value = true;
  const pageName = String(route.path || 'page').replaceAll('/', '-') || 'page';
  const result = await exportCurrentPagePdf(pageName);

  if (result?.ok) {
    exportStatus.value = `PDF exported: ${result.fileName}`;
  } else {
    exportStatus.value = 'PDF export failed.';
  }

  isExporting.value = false;
}
</script>
