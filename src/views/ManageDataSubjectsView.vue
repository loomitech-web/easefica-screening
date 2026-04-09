<script setup>
import { computed, onMounted, ref } from 'vue';
import { storeToRefs } from 'pinia';

import PageHeader from '../components/PageHeader.vue';
import DynamicTable from '../components/DynamicTable.vue';
import { useAuthStore } from '../stores/auth';
import {
  fetchDataSubjects,
  downloadDataSubjectsTemplate,
  downloadLastUploadedDataSubjects,
} from '../services/server';

const authStore = useAuthStore();
const { token, profile } = storeToRefs(authStore);

const aiId = computed(
  () => profile.value?.['https://admin.easefica.co.za/metadata']?.aiId || null,
);

const page = ref(1);
const pageSize = ref(10);
const totalCount = ref(0);
const content = ref([]);
const error = ref('');
const isLoading = ref(false);

const hasUpload = computed(() => totalCount.value > 0);

const filterControls = computed(() => ({
  search: true,
  dateFilter: false,
  dateRangeFilter: false,
  categoryFilter: false,
  manageDataSubjects: true,
  hasUpload: hasUpload.value,
}));

const headers = [
  { key: 'isValid', title: 'Valid' },
  { key: 'firstName', title: 'First Name' },
  { key: 'secondName', title: 'Second Name' },
  { key: 'thirdName', title: 'Third Name' },
  { key: 'fourthName', title: 'Fourth Name' },
  { key: 'lastName', title: 'Last Name' },
  { key: 'alias1', title: 'Alias 1' },
  { key: 'alias2', title: 'Alias 2' },
  { key: 'id', title: 'ID' },
];

function mapDocToRow(doc) {
  const ds = doc.dataSubject || {};
  return {
    isValid: doc.isActive === true ? 'Yes' : 'No',
    firstName: ds.firstName ?? '',
    secondName: ds.secondName ?? '',
    thirdName: ds.thirdName ?? '',
    fourthName: ds.fourthName ?? '',
    lastName: ds.lastName ?? '',
    alias1: ds.alias1 ?? '',
    alias2: ds.alias2 ?? '',
    id: ds.id ?? ds.id_reg_number ?? '',
  };
}

function triggerFileDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

async function loadDataSubjects() {
  if (!aiId.value) return;
  isLoading.value = true;
  error.value = '';
  try {
    const { items, total } = await fetchDataSubjects({
      aiId: aiId.value,
      page: page.value,
      pageSize: pageSize.value,
    });
    content.value = (items || []).map(mapDocToRow);
    totalCount.value = total;
  } catch (err) {
    console.error('ManageDataSubjectsView | load failed', err);
    error.value = err?.message || 'Could not load data subjects.';
    content.value = [];
    totalCount.value = 0;
  } finally {
    isLoading.value = false;
  }
}

onMounted(() => {
  if (token.value && profile.value) {
    if (aiId.value) {
      loadDataSubjects();
    } else {
      error.value = 'AI ID not found in profile.';
    }
  }
});

function onPageChange(nextPage) {
  page.value = nextPage;
  loadDataSubjects();
}

function onPageSizeChange(nextPageSize) {
  pageSize.value = nextPageSize;
  page.value = 1;
  loadDataSubjects();
}

async function onDownload() {
  error.value = '';
  try {
    if (hasUpload.value) {
      if (!aiId.value) {
        error.value = 'AI ID is required to download the last upload.';
        return;
      }
      const { blob, filename } = await downloadLastUploadedDataSubjects(aiId.value);
      triggerFileDownload(blob, filename || 'data_subjects_last_upload.xlsx');
    } else {
      const { blob, filename } = await downloadDataSubjectsTemplate();
      triggerFileDownload(blob, filename || 'data_subjects_template.xlsx');
    }
  } catch (err) {
    console.error('ManageDataSubjectsView | download failed', err);
    error.value = err?.message || 'Download failed.';
  }
}
</script>

<template>
  <v-container fluid class="screen-container dashboard-container">
    <div class="screen">
      <PageHeader title="Manage Data Subjects" />

      <v-col cols="12" md="auto">
        <div class="stat-card">
          <span class="stat-number">{{ totalCount }}</span>
          <div class="stat-label">Data subjects to be screened <span class="accent-text"> after midnight</span>
          </div>
        </div>
      </v-col>

      <div class="dynamic-table-container">
        <DynamicTable :headers="headers" :content="content" :filterControls="filterControls" :totalCount="totalCount"
          :page="page" :pageSize="pageSize" @update:page="onPageChange" @update:pageSize="onPageSizeChange"
          @download="onDownload" />
      </div>
    </div>
    <v-alert v-if="error" class="mt-4" type="error" variant="tonal">
      {{ error }}
    </v-alert>
  </v-container>
</template>

<style scoped>
.controls-container {
  display: flex;
  flex-direction: row;
  gap: 16px;
  justify-content: flex-start;
  align-items: center;
  margin-bottom: 16px;
}

.dynamic-table-container {
  margin-top: 20px;
}
</style>
