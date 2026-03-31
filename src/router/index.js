import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      meta: { public: true, title: 'Login' },
    },
    {
      path: '/',
      component: () => import('../layouts/MainLayout.vue'),
      children: [
        {
          path: '',
          redirect: { name: 'dashboard' },
        },
        {
          path: 'dashboard',
          name: 'dashboard',
          component: () => import('../views/DashboardView.vue'),
          meta: { title: 'Dashboard' },
        },
        {
          path: 'manage-data-subjects',
          name: 'manage-data-subjects',
          component: () => import('../views/ManageDataSubjectsView.vue'),
          meta: { title: 'Manage Data Subjects' },
        },
        {
          path: 'screening-results',
          name: 'screening-results',
          component: () => import('../views/ScreeningResultsView.vue'),
          meta: { title: 'Screening Results' },
        },
        {
          path: 'reports/match',
          name: 'reports-match',
          component: () => import('../views/MatchReportsView.vue'),
          meta: { title: 'Match Reports' },
        },
        {
          path: 'reports/match/:id',
          name: 'reports-match-detail',
          component: () => import('../views/MatchReportDetailView.vue'),
          meta: { title: 'Match Report Detail' },
          props: true,
        },
        {
          path: 'reports/screening',
          name: 'reports-screening',
          component: () => import('../views/ScreeningReportsView.vue'),
          meta: { title: 'Screening Reports' },
        },
        {
          path: 'reports/cost',
          name: 'reports-cost',
          component: () => import('../views/CostReportView.vue'),
          meta: { title: 'Cost Report' },
        },
      ],
    },
  ],
})

router.beforeEach((to) => {
  const authStore = useAuthStore();
  authStore.restoreFromStorage();
  if (!to.meta.public && !authStore.isAuthenticated) {
    return { name: 'login' };
  }
  if (to.name === 'login' && authStore.isAuthenticated) {
    return { name: 'dashboard' };
  }
  return true;
});

router.afterEach((to) => {
  document.title = to.meta?.title || 'easefica screening';
});

export default router
