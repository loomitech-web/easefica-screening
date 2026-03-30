<template>
  <v-container fluid>
    <v-row>
      <v-col>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { getCurrentInstance, onMounted } from 'vue';

const authLock = getCurrentInstance()?.appContext.config.globalProperties.$authLock;

onMounted(() => {
  authLock?.login();
});
</script>
