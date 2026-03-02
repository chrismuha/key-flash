import { createRouter, createWebHashHistory } from 'vue-router';

const routes = [
  { path: '/', redirect: '/builder' },
  { path: '/builder', component: () => import('../pages/BuilderPage.vue') },
  { path: '/dashboard', component: () => import('../pages/DashboardPage.vue') },
  { path: '/reports', component: () => import('../pages/ReportsPage.vue') },
  { path: '/settings', component: () => import('../pages/SettingsPage.vue') },
  { path: '/diagnostics', component: () => import('../pages/DiagnosticsPage.vue') },
  { path: '/changelog', component: () => import('../pages/ChangelogPage.vue') },
  { path: '/about', component: () => import('../pages/AboutPage.vue') }
];

export default createRouter({
  history: createWebHashHistory(),
  routes
});
