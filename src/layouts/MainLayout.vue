<script setup>
import { computed, inject, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useRoute, useRouter } from 'vue-router';
import LegalFooter from '../components/LegalFooter.vue';
import logoWhite from '../assets/logo-white.png';
import { useAuthStore } from '../stores/auth';
import { useScreeningStore } from '../stores/screening';
import { useReportsStore } from '../stores/reports';
import { useUserStore } from '../stores/user';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const screeningStore = useScreeningStore();
const reportsStore = useReportsStore();
const userStore = useUserStore();
const authLock = inject('authLock', null);
const logoSrc = logoWhite;

const { profile } = storeToRefs(authStore);
const drawer = ref(true);

const topLevelItems = [
  { title: 'Dashboard', icon: 'mdi-view-dashboard-outline', to: { name: 'dashboard' } },
  { title: 'Manage Data Subjects', icon: 'mdi-account-multiple-outline', to: { name: 'manage-data-subjects' } },
];

const reportItems = [
  { title: 'Match Reports', icon: 'mdi-account-search-outline', to: { name: 'reports-match' } },
  { title: 'Screening Reports', icon: 'mdi-chart-bar', to: { name: 'reports-screening' } },
  { title: 'Cost Report', icon: 'mdi-cash-multiple', to: { name: 'reports-cost' } },
];

const userDisplayName = computed(
  () => profile.value?.nickname || profile.value?.email || 'Authenticated User',
);
console.log("profile: ", JSON.stringify(profile.value, null, 2));
const companyDisplay = computed(() => profile.value?.company || 'Easefica Screening');
const roleDisplay = computed(() => profile.value?.role || 'Screening Analyst');
const showBusy = computed(() => screeningStore.isLoading || reportsStore.isLoading);

const reportsOpen = ref(route.path.startsWith('/reports'));

watch(
  () => profile.value,
  (value) => {
    if (value) {
      userStore.hydrateFromOData();
    }
  },
  { immediate: true },
);

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
    <v-navigation-drawer app v-model="drawer" class="shell-drawer main-layout-drawer" style="opacity:0.9"
      color="primary" width="224" rail-width="72" rail expand-on-hover permanent>

      <div style="height:64px; width:224px;padding:0px 16px">
        <v-row>
          <v-col>
            <v-img class="drawer-logo" contain src="../assets/" width=" 120" />
          </v-col>
        </v-row>
      </div>

      <v-list density="compact" nav>
        <v-list-item v-for="item in topLevelItems" :key="item.title" :prepend-icon="item.icon" :title="item.title"
          :active="isActiveRoute(item.to.name)" class="shell-nav-item" color="accent" @click="navigate(item.to)" />

        <v-list-group v-model="reportsOpen" value="reports" class="shell-nav-group">
          <template #activator="{ props }">
            <v-list-item v-bind="props" prepend-icon="mdi-file-chart-outline" title="Reports"
              :active="route.path.startsWith('/reports')" class="shell-nav-item" color="accent" />
          </template>

          <v-list-item v-for="item in reportItems" :key="item.title" :prepend-icon="item.icon" :title="item.title"
            :active="isActiveRoute(item.to.name)" class="shell-nav-item shell-nav-item--child" color="accent"
            @click="navigate(item.to)" />
        </v-list-group>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar color="transparent" flat class="shell-header" app>
      <v-toolbar-title>
        <v-row align="center" no-gutters>
          <v-col cols="auto">
            <v-img class="shrink" contain :src="logoSrc" transition="scale-transition" width="120" />
          </v-col>

          <v-col cols="auto">
            <v-card class="info-card info-card--accent" elevation="10">
              <div class="info-card__inner">
                <v-icon icon="mdi-laptop" />
                <div class="role-copy">{{ companyDisplay }}<br>{{ roleDisplay }}</div>
              </div>
            </v-card>
          </v-col>
        </v-row>
      </v-toolbar-title>

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

    <v-footer app class="app-footer">
      <LegalFooter />
    </v-footer>
  </v-layout>

</template>

<style scoped>
.app-shell {
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.shell-header {
  color: #fff;
  padding-inline: 8px 32px;
  height: 64px;
  min-height: 64px;
}

.shell-header :deep(.v-toolbar__content) {
  padding-top: 0 !important;
  padding-bottom: 0 !important;
  align-items: flex-start !important;
}

/* Vuetify v-app-bar wrapper content */
.shell-header :deep(.v-app-bar__content) {
  padding-top: 0 !important;
  padding-bottom: 0 !important;
  align-items: flex-start !important;
}

.shell-header :deep(.v-toolbar__title),
.shell-header :deep(.v-toolbar-title) {
  padding-top: 0 !important;
  padding-bottom: 0 !important;
  margin: 0 !important;
}

.content-wrapper {
  position: relative;
  padding: 24px 16px;
  flex: 1 1 auto;
  overflow-x: hidden;
  z-index: 1;
  background: transparent;
}

.content-wrapper :deep(.v-main__wrap) {
  height: 100%;
  overflow-y: auto;
}

.global-loader {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #0a7cb9;
  z-index: 1000;
}

.app-footer {
  flex: 0 0 auto;
  background: rgba(10, 124, 185, 0.67);
  z-index: 10;
  padding: 0;
}

.shell-nav-item--child {
  margin-left: 0;
}

.shell-drawer {
  z-index: 20;
}

.shell-nav-group :deep(.v-list-group__items) {
  margin: 6px 0 0 12px;
  padding: 6px;
  background: rgba(255, 255, 255, 0.14);
  border-radius: var(--border-radius);
}

.shell-nav-group :deep(.v-list-group__items .shell-nav-item) {
  margin-top: 0;
  min-height: 40px;
  justify-content: flex-start;
  padding-left: 8px !important;
  padding-right: 8px !important;
}

.shell-nav-group :deep(.v-list-group__items .v-list-item + .v-list-item) {
  margin-top: 4px;
}

.shell-nav-group :deep(.v-list-group__items .v-list-item__prepend) {
  margin-inline-end: 0 !important;
}

.shell-nav-group :deep(.v-list-group__items .v-list-item-title) {
  font-size: 0.95rem;
  opacity: 1;
}

.shell-nav-group :deep(.v-list-group__items .v-list-item__content) {
  margin-left: -6px;
}

.shell-nav-group :deep(.v-list-group__items .v-list-item--active),
.shell-nav-group :deep(.v-list-group__items .v-list-item[aria-current='page']) {
  background: rgba(242, 104, 151, 1);
  border-radius: var(--border-radius);
}

/* MainLayout wants the full-row pink highlight. */
.main-layout-drawer :deep(.v-list-item--active),
.main-layout-drawer :deep(.v-list-item[aria-current='page']) {
  background: rgba(242, 104, 151, 1);
  border-radius: var(--border-radius);
}

.main-layout-drawer :deep(.v-list-item--active .v-icon),
.main-layout-drawer :deep(.v-list-item[aria-current='page'] .v-icon) {
  background: transparent;
  border-color: rgba(230, 230, 230, 0.67);
}

/* Compact nav rows: highlight hugs icon + label (rail + expanded). */
.main-layout-drawer :deep(.v-list--nav) {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding-inline: 4px;
}

.main-layout-drawer.v-navigation-drawer--rail:not(.v-navigation-drawer--is-hovering) :deep(.v-list--nav) {
  align-items: center;
}

.main-layout-drawer.v-navigation-drawer--rail:not(.v-navigation-drawer--is-hovering) :deep(.v-list-item__content),
.main-layout-drawer.v-navigation-drawer--rail:not(.v-navigation-drawer--is-hovering) :deep(.v-list-item-title),
.main-layout-drawer.v-navigation-drawer--rail:not(.v-navigation-drawer--is-hovering) :deep(.v-list-item-subtitle) {
  display: none !important;
}

.main-layout-drawer.v-navigation-drawer--rail:not(.v-navigation-drawer--is-hovering) :deep(.shell-nav-item) {
  width: 48px;
  min-width: 48px;
  justify-content: center;
  padding-inline: 0 !important;
  --v-list-prepend-gap: 0;
}

.main-layout-drawer.v-navigation-drawer--rail:not(.v-navigation-drawer--is-hovering) :deep(.shell-nav-item .v-list-item__prepend) {
  margin-inline-end: 0 !important;
  width: 40px;
  height: 40px;
  display: grid;
  place-items: center;
  border-radius: var(--border-radius);
}

.main-layout-drawer.v-navigation-drawer--rail:not(.v-navigation-drawer--is-hovering) :deep(.v-list-item--active),
.main-layout-drawer.v-navigation-drawer--rail:not(.v-navigation-drawer--is-hovering) :deep(.v-list-item[aria-current='page']) {
  background: transparent;
}

.main-layout-drawer.v-navigation-drawer--rail:not(.v-navigation-drawer--is-hovering) :deep(.v-list-item__overlay) {
  opacity: 0 !important;
}

.main-layout-drawer.v-navigation-drawer--rail:not(.v-navigation-drawer--is-hovering) :deep(.v-list-item--active .v-list-item__prepend),
.main-layout-drawer.v-navigation-drawer--rail:not(.v-navigation-drawer--is-hovering) :deep(.v-list-item[aria-current='page'] .v-list-item__prepend) {
  background: rgba(242, 104, 151, 1);
}

.main-layout-drawer :deep(.shell-nav-group) {
  width: fit-content;
  max-width: 100%;
}

.main-layout-drawer :deep(.shell-nav-item) {
  width: fit-content;
  max-width: 100%;
  padding-inline: 10px !important;
  --v-list-prepend-gap: 10px;
}

.info-card {
  margin-top: 0 !important;
  border-top-left-radius: 0 !important;
  border-top-right-radius: 0 !important;
  opacity: 0.92;
}

.info-card--accent {
  margin-left: 16px;
  background: rgb(242, 104, 151);
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
  color: rgba(255, 255, 255, 0.75);
  font-size: 12px;
  font-weight: 500;
  line-height: 1.25;
}
</style>
