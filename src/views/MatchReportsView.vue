<script setup>
import { onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';
import { useScreeningStore } from '../stores/screening';

const router = useRouter();
const screeningStore = useScreeningStore();
const { history } = storeToRefs(screeningStore);

onMounted(() => {
  screeningStore.loadHistory({ page: 1 });
});

function openDetail(id) {
  router.push({ name: 'reports-match-detail', params: { id } });
}
</script>

<template>
  <v-container fluid class="screen-page">
    <v-row>
      <v-col cols="12">
        <h1 class="text-h5 mb-4 screen-page__title">Match Reports</h1>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
        <v-card class="screen-panel">
          <v-list>
            <v-list-item
              v-for="item in history.filter((entry) => entry.totalMatches > 0)"
              :key="item.id"
              :title="item.subjectName"
              :subtitle="`${item.referenceId} | ${item.totalMatches} match(es)`"
            >
              <template #append>
                <v-btn size="small" color="primary" variant="tonal" @click="openDetail(item.id)">
                  Open
                </v-btn>
              </template>
            </v-list-item>
            <v-list-item v-if="history.filter((entry) => entry.totalMatches > 0).length === 0">
              <v-list-item-title>No matched screenings found.</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
