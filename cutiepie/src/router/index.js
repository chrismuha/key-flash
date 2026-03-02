import { createRouter, createWebHashHistory } from 'vue-router';
import BuilderPage from '../pages/BuilderPage.vue';
import DashboardPage from '../pages/DashboardPage.vue';
import SettingsPage from '../pages/SettingsPage.vue';
import AboutPage from '../pages/AboutPage.vue';

const routes = [
  { path: '/', redirect: '/builder' },
  { path: '/builder', component: BuilderPage },
  { path: '/dashboard', component: DashboardPage },
  { path: '/settings', component: SettingsPage },
  { path: '/about', component: AboutPage }
];

export default createRouter({
  history: createWebHashHistory(),
  routes
});
