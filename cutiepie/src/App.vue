<template>
  <div>
    <QuitModal />

    <div class="ambient ambient-a"></div>
    <div class="ambient ambient-b"></div>

    <main class="app-shell">
      <header class="hero">
        <div class="hero-top">
          <p class="eyebrow">CutiePie</p>
          <nav class="nav-tabs">
            <RouterLink to="/builder">Builder</RouterLink>
            <RouterLink to="/dashboard">Dashboard</RouterLink>
            <RouterLink to="/reports">Reports</RouterLink>
            <RouterLink to="/settings">Settings</RouterLink>
            <RouterLink to="/about">About</RouterLink>
          </nav>
        </div>
        <h1>Chart Studio</h1>
        <p>CutiePie is a chart-building workspace that helps manage your business by automating chart creation from custom data fields, so you can quickly track performance, compare results, and make decisions with up-to-date visuals.</p>
      </header>

      <RouterView />
    </main>
  </div>
</template>

<script setup>
import QuitModal from './components/QuitModal.vue';
</script>
