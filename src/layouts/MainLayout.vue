<script setup>
import { computed, inject, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useRoute, useRouter } from 'vue-router';
import LegalFooter from '../components/LegalFooter.vue';
import { useAuthStore } from '../stores/auth';
import { useScreeningStore } from '../stores/screening';
import { useReportsStore } from '../stores/reports';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const screeningStore = useScreeningStore();
const reportsStore = useReportsStore();
const authLock = inject('authLock', null);

const { profile } = storeToRefs(authStore);
const drawer = ref(true);

const topLevelItems = [
  { title: 'Dashboard', icon: 'mdi-view-dashboard-outline', to: { name: 'dashboard' } },
  { title: 'Manage Data Subjects', icon: 'mdi-account-multiple-outline', to: { name: 'manage-data-subjects' } },
  { title: 'Screening Results', icon: 'mdi-file-document-outline', to: { name: 'screening-results' } },
];

const reportItems = [
  { title: 'Match Reports', icon: 'mdi-account-search-outline', to: { name: 'reports-match' } },
  { title: 'Screening Reports', icon: 'mdi-chart-bar', to: { name: 'reports-screening' } },
  { title: 'Cost Report', icon: 'mdi-cash-multiple', to: { name: 'reports-cost' } },
];

const userDisplayName = computed(
  () => profile.value?.name || profile.value?.nickname || profile.value?.email || 'Authenticated User',
);
const companyDisplay = computed(() => profile.value?.company || 'Easefica Screening');
const roleDisplay = computed(() => profile.value?.role || 'Screening Analyst');
const showBusy = computed(() => screeningStore.isLoading || reportsStore.isLoading);

const reportsOpen = ref(route.path.startsWith('/reports'));

watch(
  () => route.path,
  (value) => {
    if (value.startsWith('/reports')) {
      reportsOpen.value = true;
    }
  },
);

function isActiveRoute(targetName) {
  return route.name === targetName;
}

function logout() {
  authLock?.logout();
}

function navigate(to) {
  router.push(to);
}
</script>

<template>
  <v-layout class="app-shell">
    <v-navigation-drawer
      v-model="drawer"
      width="200"
      expand-on-hover
      color="primary"
      class="shell-drawer"
      permanent
    >
      <div class="logo-wrap">
        <v-img class="brand-logo" contain src="../assets/logo.svg" width="120" />
      </div>

      <v-list nav density="comfortable" class="shell-nav">
        <v-list-item
          v-for="item in topLevelItems"
          :key="item.title"
          :prepend-icon="item.icon"
          :title="item.title"
          :active="isActiveRoute(item.to.name)"
          class="shell-nav-item"
          @click="navigate(item.to)"
        />

        <v-list-group v-model="reportsOpen" value="reports">
          <template #activator="{ props }">
            <v-list-item
              v-bind="props"
              prepend-icon="mdi-file-chart-outline"
              title="Reports"
              :active="route.path.startsWith('/reports')"
              class="shell-nav-item"
            />
          </template>

          <v-list-item
            v-for="item in reportItems"
            :key="item.title"
            :prepend-icon="item.icon"
            :title="item.title"
            :active="isActiveRoute(item.to.name)"
            class="shell-nav-item shell-nav-item--child"
            @click="navigate(item.to)"
          />
        </v-list-group>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar color="transparent" flat class="shell-header">
      <v-toolbar-title class="d-flex align-center">
        <v-img class="brand-logo mr-4" contain src="../assets/logo.svg" width="120" />
      </v-toolbar-title>
      <v-card class="info-card info-card--accent" elevation="10">
        <div class="info-card__inner">
          <v-icon icon="mdi-laptop" />
          <div class="role-copy">{{ companyDisplay }}<br>{{ roleDisplay }}</div>
        </div>
      </v-card>

      <v-spacer />

      <v-card class="info-card info-card--primary" elevation="10">
        <div class="info-card__inner">
          <v-icon icon="mdi-account" />
          <div class="role-copy">{{ userDisplayName }}</div>
          <v-btn icon="mdi-logout-variant" variant="text" color="white" @click="logout" />
        </div>
      </v-card>
    </v-app-bar>

    <v-main class="content-wrapper">
      <router-view />
      <v-progress-circular v-if="showBusy" class="global-loader" color="accent" indeterminate />
    </v-main>
  </v-layout>
  <footer class="app-footer">
    <LegalFooter />
  </footer>
</template>

<style scoped>
.app-shell {
  min-height: calc(100vh - 56px);
}

.shell-drawer {
  opacity: 0.9;
}

.logo-wrap {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.brand-logo {
  opacity: 0.72;
  filter: brightness(0) invert(1);
}

.shell-header {
  color: #fff;
  padding-inline: 8px 32px;
}

.content-wrapper {
  position: relative;
  padding: 24px 16px;
}

.global-loader {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1000;
}

.app-footer {
  position: sticky;
  bottom: 0;
  background: rgba(10, 124, 185, 0.67);
}

.shell-nav {
  padding-inline: 8px;
}

.shell-nav-item {
  margin-top: 8px;
  border-radius: 999px;
  color: white;
  font-weight: 300;
}

.shell-nav-item--child {
  margin-left: 12px;
}

.shell-nav-item :deep(.v-list-item__prepend > .v-icon) {
  border: 2px solid rgba(230, 230, 230, 0.67);
  border-radius: 16px;
  min-width: 32px;
  width: 32px;
  height: 32px;
  padding: 2px;
}

.shell-nav-item :deep(.v-list-item-title) {
  font-weight: 300;
}

.shell-nav-item :deep(.v-list-item__overlay) {
  opacity: 0;
}

.shell-nav-item.v-list-item--active {
  background: rgb(var(--v-theme-accent));
}

.info-card {
  margin-top: -16px;
  border-top-left-radius: 0 !important;
  border-top-right-radius: 0 !important;
  opacity: 0.92;
}

.info-card--accent {
  margin-left: 48px;
  background: rgb(var(--v-theme-accent));
}

.info-card--primary {
  margin-right: 32px;
  background: rgb(var(--v-theme-primary));
}

.info-card__inner {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 56px;
  padding: 0 12px;
  color: white;
}

.role-copy {
  font-size: 12px;
  font-weight: 300;
  line-height: 1.25;
}
</style>
