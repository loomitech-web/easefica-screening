<script setup>
import { onMounted, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';
import BaseInput from '../components/fields/BaseInput.vue';
import { useScreeningStore } from '../stores/screening';

const router = useRouter();
const screeningStore = useScreeningStore();
const { history, pagination, query, error } = storeToRefs(screeningStore);
const search = ref('');

onMounted(() => {
  screeningStore.loadHistory();
});

watch(search, (value) => {
  screeningStore.loadHistory({ search: value, page: 1 });
});

function onPageChange(page) {
  screeningStore.loadHistory({ page });
}

function statusColor(status) {
  return status === 'MATCH_FOUND' ? 'error' : 'success';
}

function openReport(item) {
  router.push({ name: 'reports-match-detail', params: { id: item.id } });
}
</script>

<template>
  <v-container fluid class="screen-page">
    <v-row class="screen-toolbar">
      <v-col cols="12">
        <h1 class="text-h5 mb-4 screen-page__title">Screening Results</h1>
      </v-col>
      <v-col cols="12" md="4">
        <BaseInput
          v-model="search"
          label="Search"
          placeholder="Search by subject or reference"
          clearable
        />
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <v-card class="screen-panel">
          <v-table class="screen-table">
            <thead>
              <tr>
                <th>Subject</th>
                <th>Reference</th>
                <th>Submitted</th>
                <th>Status</th>
                <th class="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in history" :key="item.id">
                <td>{{ item.subjectName }}</td>
                <td>{{ item.referenceId }}</td>
                <td>{{ new Date(item.submittedAt).toLocaleString() }}</td>
                <td>
                  <v-chip size="small" :color="statusColor(item.status)">
                    {{ item.status === 'MATCH_FOUND' ? 'Matches Found' : 'Clear' }}
                  </v-chip>
                </td>
                <td class="text-right">
                  <v-btn size="small" variant="text" color="primary" @click="openReport(item)">
                    View Report
                  </v-btn>
                </td>
              </tr>
              <tr v-if="history.length === 0">
                <td colspan="5" class="text-center py-8">No screening results available.</td>
              </tr>
            </tbody>
          </v-table>
          <v-divider />
          <v-card-actions class="justify-space-between">
            <div class="text-caption">
              Page {{ pagination.page }} of {{ pagination.pageCount }} | {{ pagination.total }} result(s)
            </div>
            <v-pagination
              :model-value="query.page"
              :length="pagination.pageCount"
              :total-visible="7"
              @update:model-value="onPageChange"
            />
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <v-alert v-if="error" class="mt-4" type="error" variant="tonal">
      {{ error }}
    </v-alert>
  </v-container>
</template>
