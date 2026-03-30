<script setup>
import { getCurrentInstance } from 'vue';
import { useAuthStore } from '../stores/auth';

const authStore = useAuthStore();
const authLock = getCurrentInstance()?.appContext.config.globalProperties.$authLock;

function logout() {
  authLock?.logout();
}
</script>

<template>
  <v-container class="py-10">
    <v-card class="pa-6">
      <v-card-title class="text-h6">Authenticated</v-card-title>
      <v-card-text>
        <p>You are signed in.</p>
        <p v-if="authStore.profile">
          User: {{ authStore.profile.name || authStore.profile.nickname || 'Unknown' }}
        </p>
      </v-card-text>
      <v-card-actions>
        <v-btn color="primary" @click="logout">Logout</v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>
