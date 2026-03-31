<script setup>
import { onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useScreeningStore } from '../stores/screening';

const screeningStore = useScreeningStore();
const { summary } = storeToRefs(screeningStore);

onMounted(() => {
  screeningStore.loadDashboard();
});
</script>

<template>
  <v-container fluid class="screen-page">
    <v-row>
      <v-col cols="12">
        <h1 class="text-h5 mb-4 screen-page__title">Screening Reports</h1>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" md="6">
        <v-card class="pa-4 screen-panel">
          <div class="text-caption">Screening Throughput</div>
          <div class="text-h4">{{ summary.total }}</div>
          <div class="text-caption mt-2">Total screenings processed in current dataset.</div>
        </v-card>
      </v-col>
      <v-col cols="12" md="6">
        <v-card class="pa-4 screen-panel">
          <div class="text-caption">Risk Distribution</div>
          <div class="d-flex ga-2 mt-2">
            <v-chip color="error">Matches {{ summary.matchFound }}</v-chip>
            <v-chip color="success">Clear {{ summary.clear }}</v-chip>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
