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
      name: 'home',
      component: () => import('../views/HomeView.vue'),
      meta: { title: 'Home' },
    },
  ],
})

router.beforeEach((to) => {
  const authStore = useAuthStore();
  if (!to.meta.public && !authStore.isAuthenticated) {
    return { name: 'login' };
  }
  if (to.name === 'login' && authStore.isAuthenticated) {
    return { name: 'home' };
  }
  return true;
});

router.afterEach((to) => {
  document.title = to.meta?.title || 'easefica screening';
});

export default router
