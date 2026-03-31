<script setup>
import { onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useScreeningStore } from '../stores/screening';

const screeningStore = useScreeningStore();
const { summary, error } = storeToRefs(screeningStore);

onMounted(() => {
  screeningStore.loadDashboard();
});

function statusColor(status) {
  return status === 'MATCH_FOUND' ? 'error' : 'success';
}

function statusLabel(status) {
  return status === 'MATCH_FOUND' ? 'Matches Found' : 'Clear';
}
</script>

<template>
  <v-container fluid class="screen-page">
    <v-row>
      <v-col cols="12">
        <h1 class="text-h5 mb-4 screen-page__title">Dashboard</h1>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" md="4">
        <v-card class="pa-4 screen-panel">
          <div class="text-caption">Total Screenings</div>
          <div class="text-h4">{{ summary.total }}</div>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card class="pa-4 screen-panel">
          <div class="text-caption">Matches Found</div>
          <div class="text-h4 text-error">{{ summary.matchFound }}</div>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card class="pa-4 screen-panel">
          <div class="text-caption">Clear</div>
          <div class="text-h4 text-success">{{ summary.clear }}</div>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-4">
      <v-col cols="12">
        <v-card class="screen-panel">
          <v-card-title class="screen-panel__title">Recent Screenings</v-card-title>
          <v-divider />
          <v-list>
            <v-list-item
              v-for="item in summary.recent"
              :key="item.id"
              :title="item.subjectName"
              :subtitle="item.referenceId"
            >
              <template #append>
                <v-chip :color="statusColor(item.status)" size="small">
                  {{ statusLabel(item.status) }}
                </v-chip>
              </template>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
    </v-row>

    <v-alert v-if="error" class="mt-4" type="error" variant="tonal">
      {{ error }}
    </v-alert>
  </v-container>
</template>
