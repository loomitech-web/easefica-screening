<script setup>
import { computed, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import PageHeader from '../components/PageHeader.vue';
import DynamicTable from '../components/DynamicTable.vue';
import { useScreeningStore } from '../stores/screening';
import { useAuthStore } from '../stores/auth';
//import dashboardMonitorIcon from '../assets/dashboard-monitor.svg';

const screeningStore = useScreeningStore();
const { summary, history, error } = storeToRefs(screeningStore);
const authStore = useAuthStore();
const { token } = storeToRefs(authStore);
const { profile } = storeToRefs(authStore);

const aiId = computed(() => profile.value?.['https://admin.easefica.co.za/metadata']?.aiId || null);
const totalCount = computed(() => summary.value?.totalNumberOfScreenings || 0);
const page = computed(() => screeningStore.query.page);
const pageSize = computed(() => screeningStore.query.pageSize);

const lastScreenedAt = computed(() => summary.value?.latestScreening?.timestamp || null);

function formatScreeningDate(dateString) {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-ZA', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

onMounted(() => {
  if (token.value && profile.value) {
    if (aiId.value) {
      screeningStore.loadDashboard(aiId.value)

    }
    else {
      console.error("AI ID not found");
    }
  }
});

const headers = [
  { key: 'numberOfDataSubjects', title: 'Number of Data Subjects' },
  { key: 'screenedLists', title: 'Screened Lists' },
  { key: 'screenedAt', title: 'Screened At' },
  { key: 'totalMatches', title: 'Subjects with Matches' },
];

const content = computed(() => {
  const rows = (history.value || []).map((screening) => {
    return {
      numberOfDataSubjects: screening?.totalDataSubjects || 0,
      screenedLists: (screening?.selectedLists || []).join(', '),
      screenedAt: formatScreeningDate(screening?.timestamp),
      totalMatches: screening?.subjectsWithMatches || 0,
      listsScreenedAgainst: (screening?.selectedLists || []).join(', '),
    }
  })

  console.log('DashboardView | table props', {
    historyLength: history.value?.length || 0,
    rowCount: rows.length,
    totalCount: totalCount.value,
    page: page.value,
    pageSize: pageSize.value,
    firstRow: rows[0] || null,
  });

  return rows
})

const filterControls = {
  search: true,
  dateFilter: true,
  categoryFilter: true,
  categoryFilters: ['PEP', 'Sanctions', 'Adverse Media'],
}

function onPageChange(nextPage) {
  console.log('DashboardView | page change requested', {
    currentPage: page.value,
    nextPage,
    aiId: aiId.value,
  });

  if (!aiId.value) return;
  screeningStore.loadHistory({ aiId: aiId.value, page: nextPage });
}

function onPageSizeChange(nextPageSize) {
  console.log('DashboardView | page size change requested', {
    currentPageSize: pageSize.value,
    nextPageSize,
    aiId: aiId.value,
  });

  if (!aiId.value) return;
  screeningStore.loadHistory({ aiId: aiId.value, page: 1, pageSize: nextPageSize });
}

function formatScreeningLists() {
  return (history.value || []).map((screening) => {
    return screening?.selectedLists || [];
  }).flat().filter((list, index, self) => self.indexOf(list) === index).join(', ');
}

</script>

<template>
  <v-container fluid class="screen-container">
    <div class="screen">
      <!-- <div class="page-icon-container">
        <img v-if="iconSrc" :src="iconSrc" alt="" class="page-icon-image">
        <i v-else-if="icon.startsWith('fi ')" :class="icon" class="page-icon" aria-hidden="true" />
        <v-icon v-else :icon="icon" size="48" />
      </div> -->

      <PageHeader title="Screening Dashboard" />

      <v-row class="dashboard-stats-row">
        <v-col cols="12" md="4">
          <div class="stat-card">
            <span class="stat-number">{{ summary.totalNumberOfScreenings }}</span>
            <div class="stat-label">Total screenings</div>
          </div>
        </v-col>
        <v-col cols="12" md="4">
          <div class="stat-card">
            <span class="stat-number">{{ formatScreeningDate(lastScreenedAt) }}</span>
            <div class="stat-label">Date last screened</div>
          </div>
        </v-col>
        <v-col cols="12" md="4">
          <div class="stat-card">
            <span class="stat-number">{{ formatScreeningLists() }}</span>
            <div class="stat-label">Lists screened against</div>
          </div>
        </v-col>
      </v-row>

      <div class="dynamic-table-container">
        <DynamicTable :headers="headers" :content="content" :filterControls="filterControls" :totalCount="totalCount"
          :page="page" :pageSize="pageSize" @update:page="onPageChange" @update:pageSize="onPageSizeChange" />
      </div>
    </div>
    <v-alert v-if="error" class="mt-4" type="error" variant="tonal">
      {{ error }}
    </v-alert>
  </v-container>
</template>

<style scoped>
.screen {
  width: min(100%, 1240px);
  padding: 20px;
}

.dashboard-stats-row {
  margin-top: 8px;
}

.stat-card {
  text-align: center;
  padding: 16px;
  border-radius: 8px;
  background: var(--ef-surface);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  min-height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.stat-number {
  font-size: 2rem;
  font-weight: bold;
  color: #1976d2;
  display: block;
  line-height: 1.2;
  word-break: break-word;
}

.stat-label {
  font-size: 0.9rem;
  color: #666;
  margin-top: 4px;
}

@media (max-width: 960px) {
  .screen {
    padding: 16px;
  }

  .stat-card {
    padding: 14px;
  }

  .stat-number {
    font-size: 1.75rem;
  }
}

@media (max-width: 600px) {
  .screen {
    padding: 12px;
  }

  .stat-card {
    padding: 12px;
  }

  .stat-number {
    font-size: 1.4rem;
  }

  .stat-label {
    font-size: 0.85rem;
  }
}

.dynamic-table-container {
  margin-top: 20px;
}
</style>
