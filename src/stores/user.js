import { ref } from 'vue';
import { defineStore, storeToRefs } from 'pinia';
import { useAuthStore } from './auth';
import {
  fetchAI,
  fetchUserRoleByEmail,
} from '../services/server';

export const useUserStore = defineStore('user', () => {
  const user = ref(null);
  const isLoading = ref(false);
  const isHydrated = ref(false);
  const error = ref('');

  const authStore = useAuthStore();
  const { profile, token } = storeToRefs(authStore);

  async function hydrateFromOData() {
    if (isLoading.value || isHydrated.value) return;
    if (!profile.value) return;

    const email = profile.value?.email;
    const aiId = profile.value?.['https://admin.easefica.co.za/metadata']?.aiId;

    if (!email || !aiId) return;

    if (!token.value) return;

    isLoading.value = true;
    error.value = '';
    try {
      const [ai, userRecord] = await Promise.all([
        fetchAI(aiId),
        fetchUserRoleByEmail(email),
      ]);

      const aiName =
        ai?.regName
          ? ai?.regName
          : null;
      const role =
        userRecord?.role
          ? userRecord?.role
          : null;

      const updatedProfile = {
        ...profile.value,
        ...(aiName ? { company: aiName } : {}),
        ...(role ? { role } : {}),
      };

      authStore.setSession({
        authResult: token.value,
        userProfile: updatedProfile,
      });

      isHydrated.value = true;
    } catch (err) {
      error.value = err?.message || 'Failed to hydrate user from OData.';
      console.error('hydrateFromOData failed:', err);
    } finally {
      isLoading.value = false;
    }
  }

  return {
    user,
    isLoading,
    isHydrated,
    error,
    hydrateFromOData,
  };
});
