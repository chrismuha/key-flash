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
            <RouterLink to="/settings">Settings</RouterLink>
            <RouterLink to="/about">About</RouterLink>
          </nav>
        </div>
        <h1>Business chart studio with separated Vue pages and components.</h1>
      </header>

      <RouterView />
    </main>
  </div>
</template>

<script setup>
import QuitModal from './components/QuitModal.vue';
</script>
