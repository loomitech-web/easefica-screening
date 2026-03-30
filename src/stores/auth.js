import { computed, ref } from 'vue';
import { defineStore } from 'pinia';

const TOKEN_KEY = 'token';
const PROFILE_KEY = 'profile';

export const useAuthStore = defineStore('auth', () => {
  const token = ref(null);
  const profile = ref(null);
  const isLoading = ref(false);

  const isAuthenticated = computed(() => Boolean(token.value?.accessToken));

  function restoreFromStorage() {
    try {
      const savedToken = localStorage.getItem(TOKEN_KEY);
      const savedProfile = localStorage.getItem(PROFILE_KEY);
      token.value = savedToken ? JSON.parse(savedToken) : null;
      profile.value = savedProfile ? JSON.parse(savedProfile) : null;
    } catch {
      clearSession();
    }
  }

  function setSession({ authResult, userProfile }) {
    token.value = authResult;
    profile.value = userProfile;
    localStorage.setItem(TOKEN_KEY, JSON.stringify(authResult));
    localStorage.setItem(PROFILE_KEY, JSON.stringify(userProfile));
  }

  function clearSession() {
    token.value = null;
    profile.value = null;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(PROFILE_KEY);
  }

  return {
    token,
    profile,
    isLoading,
    isAuthenticated,
    restoreFromStorage,
    setSession,
    clearSession,
  };
});
