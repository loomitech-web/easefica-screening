<script setup>
import { onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useReportsStore } from '../stores/reports';

const reportsStore = useReportsStore();
const { costReport, error } = storeToRefs(reportsStore);

onMounted(() => {
  reportsStore.loadCostReport();
});
</script>

<template>
  <v-container fluid class="screen-page">
    <v-row>
      <v-col cols="12">
        <h1 class="text-h5 mb-4 screen-page__title">Cost Report</h1>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" md="4">
        <v-card class="pa-4 screen-panel">
          <div class="text-caption">Total Screenings</div>
          <div class="text-h4">{{ costReport.totalScreenings }}</div>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card class="pa-4 screen-panel">
          <div class="text-caption">Total Cost</div>
          <div class="text-h4">R {{ Number(costReport.totalCost || 0).toFixed(2) }}</div>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card class="pa-4 screen-panel">
          <div class="text-caption">Average Cost / Screening</div>
          <div class="text-h4">R {{ Number(costReport.averageCost || 0).toFixed(2) }}</div>
        </v-card>
      </v-col>
    </v-row>
    <v-alert v-if="error" class="mt-4" type="error" variant="tonal">
      {{ error }}
    </v-alert>
  </v-container>
</template>
