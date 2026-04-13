<script setup>
import { computed, onMounted, ref } from 'vue';
import { storeToRefs } from 'pinia';

import PageHeader from '../components/PageHeader.vue';
import DynamicTable from '../components/DynamicTable.vue';
import { useAuthStore } from '../stores/auth';
import {
  fetchDataSubjects,
  fetchStagedDataSubjects,
  downloadDataSubjectsTemplate,
  downloadLastUploadedDataSubjects,
  uploadDataSubjectsExcel,
  downloadDuplicateRowsReport,
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
const uploadLoading = ref(false);
const fileInputKey = ref(0);
const lastUploadFileId = ref('');
const uploadSummary = ref(null);
const uploadInvalidRows = ref([]);
const uploadDuplicateRows = ref([]);
/** Saved subjects in DB (stat card + “download previous upload”). */
const databaseTotalCount = ref(0);
/** 'db' = MongoDB list; 'staging' = deduplicated Redis preview after upload. */
const tableMode = ref('db');

const hasUpload = computed(() => databaseTotalCount.value > 0);
const viewingStagedUpload = computed(() => tableMode.value === 'staging' && !!lastUploadFileId.value);
const hasDuplicateRemoval = computed(
  () => Number(uploadSummary.value?.duplicateCount) > 0,
);

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

/** Row shape from Redis after Excel processing (`processRow` result). */
function mapStagedEntryToRow(entry) {
  const row = entry?.data && typeof entry.data === 'object' ? entry.data : entry;
  const ok = entry?.reason == null;
  return {
    isValid: ok ? 'Yes' : 'No',
    firstName: row?.firstName ?? '',
    secondName: row?.secondName ?? '',
    thirdName: row?.thirdName ?? '',
    fourthName: row?.fourthName ?? '',
    lastName: row?.lastName ?? '',
    alias1: row?.alias1 ?? '',
    alias2: row?.alias2 ?? '',
    id: row?.id ?? row?.id_reg_number ?? '',
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

function cellStr(v) {
  if (v == null || v === '') return '';
  return String(v);
}

/** Display label for an invalid-row payload (`data` or nested `data.data`). */
function formatSubjectPreview(entry) {
  const row = entry?.data && typeof entry.data === 'object' ? entry.data : entry;
  if (!row || typeof row !== 'object') return '';
  const parts = [
    cellStr(row.firstName),
    cellStr(row.secondName),
    cellStr(row.thirdName),
    cellStr(row.fourthName),
    cellStr(row.lastName),
  ].filter(Boolean);
  const name = parts.join(' ').trim();
  const idPart = cellStr(row.id ?? row.id_reg_number);
  if (name && idPart) return `${name} — ID: ${idPart}`;
  if (name) return name;
  if (idPart) return `ID: ${idPart}`;
  return '(empty row)';
}

async function onUploadFileSelected(file) {
  error.value = '';
  uploadSummary.value = null;
  uploadInvalidRows.value = [];
  uploadDuplicateRows.value = [];
  lastUploadFileId.value = '';

  if (!aiId.value) {
    error.value = 'AI ID not found in profile.';
    fileInputKey.value += 1;
    return;
  }

  uploadLoading.value = true;
  try {
    const res = await uploadDataSubjectsExcel(file);
    if (res?.fileId) {
      lastUploadFileId.value = res.fileId;
    }
    uploadSummary.value = {
      message: res?.message || '',
      count: res?.count,
      uniqueCount: res?.uniqueCount,
      duplicateCount: res?.duplicateCount,
      invalidRowsCount: res?.invalidRowsCount,
      timeTaken: res?.timeTaken,
    };
    uploadInvalidRows.value = Array.isArray(res?.invalidRows) ? res.invalidRows : [];
    uploadDuplicateRows.value = Array.isArray(res?.duplicateRows) ? res.duplicateRows : [];
    tableMode.value = 'staging';
    page.value = 1;
    await loadStagedDataSubjects();
  } catch (err) {
    console.error('ManageDataSubjectsView | upload failed', err);
    const data = err?.response?.data;
    const msg = data?.details || data?.error || err?.message || 'Upload failed.';
    error.value = typeof msg === 'string' ? msg : JSON.stringify(msg);
  } finally {
    uploadLoading.value = false;
    fileInputKey.value += 1;
  }
}

async function onDownloadDuplicateReport() {
  if (!lastUploadFileId.value) return;
  error.value = '';
  try {
    const { blob, filename } = await downloadDuplicateRowsReport(lastUploadFileId.value);
    triggerFileDownload(blob, filename);
  } catch (err) {
    console.error('ManageDataSubjectsView | duplicate report failed', err);
    error.value = err?.response?.data?.error || err?.message || 'Could not download duplicate report.';
  }
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
    databaseTotalCount.value = total;
  } catch (err) {
    console.error('ManageDataSubjectsView | load failed', err);
    error.value = err?.message || 'Could not load data subjects.';
    content.value = [];
    totalCount.value = 0;
  } finally {
    isLoading.value = false;
  }
}

async function loadStagedDataSubjects() {
  if (!lastUploadFileId.value) return;
  isLoading.value = true;
  error.value = '';
  try {
    const { items, totalCount: stagedTotal } = await fetchStagedDataSubjects({
      fileId: lastUploadFileId.value,
      page: page.value,
      pageSize: pageSize.value,
    });
    content.value = (items || []).map(mapStagedEntryToRow);
    totalCount.value = stagedTotal;
  } catch (err) {
    console.error('ManageDataSubjectsView | staged load failed', err);
    error.value = err?.message || 'Could not load staged upload.';
    content.value = [];
    totalCount.value = 0;
    tableMode.value = 'db';
    if (aiId.value) {
      await loadDataSubjects();
    }
  } finally {
    isLoading.value = false;
  }
}

function showSavedDataSubjects() {
  tableMode.value = 'db';
  page.value = 1;
  loadDataSubjects();
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
  if (tableMode.value === 'staging') {
    loadStagedDataSubjects();
  } else {
    loadDataSubjects();
  }
}

function onPageSizeChange(nextPageSize) {
  pageSize.value = nextPageSize;
  page.value = 1;
  if (tableMode.value === 'staging') {
    loadStagedDataSubjects();
  } else {
    loadDataSubjects();
  }
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
          <span class="stat-number">{{ databaseTotalCount }}</span>
          <div class="stat-label">Data subjects to be screened <span class="accent-text"> after midnight</span>
          </div>
          <div v-if="viewingStagedUpload" class="text-caption text-medium-emphasis mt-2">
            Table preview: {{ totalCount }} unique row(s) from your file (duplicates removed).
          </div>
        </div>
      </v-col>

      <v-alert v-if="viewingStagedUpload && uploadSummary && !error" class="mt-4" type="success" variant="tonal">
        <div class="text-body-1 font-weight-medium">Showing deduplicated data in the table</div>
        <p class="text-body-2 mt-2 mb-0">
          Each row appears once. If the same person appeared multiple times in the spreadsheet, we kept the first row
          and skipped the rest.
          <template v-if="hasDuplicateRemoval">
            <strong> {{ uploadSummary.duplicateCount }} duplicate row(s)</strong> were not added to this list.
          </template>
          <template v-else> No duplicate rows were detected in this file. </template>
        </p>
        <div class="staged-upload-actions mt-3">
          <v-btn v-if="lastUploadFileId && hasDuplicateRemoval" size="small" variant="flat" color="primary"
            prepend-icon="mdi-file-download-outline" @click="onDownloadDuplicateReport">
            Download duplicate report (removed rows)
          </v-btn>
          <v-btn size="small" variant="outlined" prepend-icon="mdi-database-eye-outline" @click="showSavedDataSubjects">
            Show saved data subjects (database)
          </v-btn>
        </div>
      </v-alert>

      <div class="dynamic-table-container">
        <DynamicTable :headers="headers" :content="content" :filterControls="filterControls" :totalCount="totalCount"
          :page="page" :pageSize="pageSize" :file-input-key="fileInputKey" :upload-loading="uploadLoading"
          :loading="isLoading" @update:page="onPageChange" @update:pageSize="onPageSizeChange" @download="onDownload"
          @file-selected="onUploadFileSelected" />
      </div>
      <div class="button-container">
        <v-btn v-if="viewingStagedUpload" size="small" variant="flat" class="save-data-subjects-button"
          prepend-icon="mdi-database-plus-outline" @click="saveToDataSubjects">
          Save data subjects
        </v-btn>
      </div>


    </div>
    <v-alert v-if="error" class="mt-4" type="error" variant="tonal">
      {{ error }}
    </v-alert>

    <v-alert v-if="uploadSummary && !error" class="mt-4" type="info" variant="tonal">
      <div class="upload-summary">{{ uploadSummary.message }}</div>
      <div v-if="uploadSummary.timeTaken != null" class="text-caption mt-1">
        Processing time: {{ uploadSummary.timeTaken }} ms
      </div>
    </v-alert>

    <v-card v-if="uploadInvalidRows.length && !error" class="mt-4 pa-4" variant="outlined">
      <div class="text-subtitle-1 mb-2">Rows that failed validation ({{ uploadInvalidRows.length }})</div>
      <p class="text-body-2 text-medium-emphasis mb-3">
        These rows are still listed in the staging payload; fix the sheet and re-upload before saving to the database.
      </p>
      <v-table density="compact" class="upload-issues-table">
        <thead>
          <tr>
            <th class="text-left">Row</th>
            <th class="text-left">Reason</th>
            <th class="text-left">Content</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, idx) in uploadInvalidRows" :key="'inv-' + idx + '-' + row.rowNumber">
            <td>{{ row.rowNumber }}</td>
            <td>{{ row.reason }}</td>
            <td>{{ formatSubjectPreview(row) }}</td>
          </tr>
        </tbody>
      </v-table>
    </v-card>

    <v-card v-if="uploadDuplicateRows.length && !error" class="mt-4 pa-4" variant="outlined">
      <div class="text-subtitle-1 mb-2">Duplicate rows skipped ({{ uploadDuplicateRows.length }})</div>
      <p class="text-body-2 text-medium-emphasis mb-3">
        Only the first occurrence of each subject (same ID, or same name fields if no ID) is kept. Later rows are not
        loaded into staging.
      </p>
      <v-table density="compact" class="upload-issues-table">
        <thead>
          <tr>
            <th class="text-left">Row</th>
            <th class="text-left">Same as row</th>
            <th class="text-left">Subject</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, idx) in uploadDuplicateRows" :key="'dup-' + idx + '-' + row.rowNumber">
            <td>{{ row.rowNumber }}</td>
            <td>{{ row.duplicateOfRowNumber }}</td>
            <td>{{ formatSubjectPreview(row.fields || row) }}</td>
          </tr>
        </tbody>
      </v-table>
    </v-card>
  </v-container>
</template>

<style scoped>
.save-data-subjects-button {
  background-color: var(--ef-primary);
  color: white;
  border-color: var(--ef-accent);
  border-radius: var(--border-radius);
}

.button-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

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

.staged-upload-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
</style>
