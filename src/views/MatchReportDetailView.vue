<script setup>
import { computed, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useRoute } from 'vue-router';
import { useReportsStore } from '../stores/reports';

const route = useRoute();
const reportsStore = useReportsStore();
const { activeMatchReport, error } = storeToRefs(reportsStore);

const reportId = computed(() => String(route.params.id || ''));

onMounted(() => {
  reportsStore.loadMatchReport(reportId.value);
});
</script>

<template>
  <v-container fluid class="screen-page">
    <v-row>
      <v-col cols="12">
        <h1 class="text-h5 mb-4 screen-page__title">Match Report Detail</h1>
      </v-col>
    </v-row>
    <v-row v-if="activeMatchReport">
      <v-col cols="12" md="5">
        <v-card class="pa-4 screen-panel">
          <div class="text-caption">Subject</div>
          <div class="text-h6">{{ activeMatchReport.subjectName }}</div>
          <div class="text-caption mt-3">Reference</div>
          <div>{{ activeMatchReport.referenceId }}</div>
          <div class="text-caption mt-3">Submitted</div>
          <div>{{ new Date(activeMatchReport.submittedAt).toLocaleString() }}</div>
        </v-card>
      </v-col>
      <v-col cols="12" md="7">
        <v-card class="screen-panel">
          <v-card-title class="screen-panel__title">Matched Lists</v-card-title>
          <v-divider />
          <v-list>
            <v-list-item v-for="(item, index) in activeMatchReport.matches" :key="index">
              <v-list-item-title>{{ item.sourceList }} - {{ item.matchedName }}</v-list-item-title>
              <v-list-item-subtitle>
                Confidence: {{ Math.round((item.confidence || 0) * 100) }}%
              </v-list-item-subtitle>
              <template #append>{{ item.details }}</template>
            </v-list-item>
            <v-list-item v-if="!activeMatchReport.matches?.length">
              <v-list-item-title>No detailed matches available.</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
    </v-row>
    <v-alert v-if="error" type="error" variant="tonal">
      {{ error }}
    </v-alert>
  </v-container>
</template>
