<script setup>
import { onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import PageHeader from '../components/PageHeader.vue';
import DynamicTable from '../components/DynamicTable.vue';
import { useScreeningStore } from '../stores/screening';

const screeningStore = useScreeningStore();
const { summary, error } = storeToRefs(screeningStore);

onMounted(() => {
  screeningStore.loadDashboard();
});

const headers = [
  { key: 'numberOfDataSubjects', title: 'Number of Data Subjects' },
  { key: 'screenedLists', title: 'Screened Lists' },
  { key: 'screenedAt', title: 'Screened At' },
  { key: 'totalMatches', title: 'Total Matches' },
];

const content = [
  { numberOfDataSubjects: 100, screenedLists: 'PEP, Sanctions', screenedAt: '2026-03-30T09:22:00.000Z', totalMatches: 2 },
  { numberOfDataSubjects: 100, screenedLists: 'PEP, Sanctions', screenedAt: '2026-03-29T14:50:00.000Z', totalMatches: 0 },
  { numberOfDataSubjects: 100, screenedLists: 'PEP, Sanctions', screenedAt: '2026-03-28T11:15:00.000Z', totalMatches: 1 },
  { numberOfDataSubjects: 100, screenedLists: 'PEP, Sanctions', screenedAt: '2026-03-28T11:15:00.000Z', totalMatches: 1 },
]

const filterControls = {
  search: false,
  dateFilter: true,
  categoryFilter: true,
  categoryFilters: ['PEP', 'Sanctions', 'Adverse Media'],
}

</script>

<template>
  <v-container fluid class="screen-container">
    <div class="screen">

      <PageHeader title="Screening Dashboard" />

      <v-row class="dashboard-stats-row">
        <v-col cols="12" md="4">
          <v-card class="screenStatCard">
            <v-card-text class="screenStatCard__body">
              <div class="screenStatCard__eyebrow">Overview</div>
              <div class="screenStatCard__title">Total Screenings</div>
              <div class="screenStatCard__value">{{ summary.total }}</div>
              <div class="screenStatCard__meta">Number of screenings</div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" md="4">
          <v-card class="screenStatCard screenStatCard--a">
            <v-card-text class="screenStatCard__body">
              <div class="screenStatCard__eyebrow">Monitoring</div>
              <div class="screenStatCard__title">Date Last Screened</div>
              <div class="screenStatCard__value">{{ summary.matchFound }}</div>
              <div class="screenStatCard__meta">Last screening was {{ daysLastScreenedToString }}</div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" md="4">
          <v-card class="screenStatCard">
            <v-card-text class="screenStatCard__body">
              <div class="screenStatCard__eyebrow">Reporting</div>
              <div class="screenStatCard__title">Cost Window</div>
              <div class="screenStatCard__value">{{ summary.clear }}</div>
              <div class="screenStatCard__meta">
                Costs from <span class="screenStatCard__meta-strong">2026-03-23</span> to
                <span class="screenStatCard__meta-strong">2026-03-22</span>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <div class="dynamic-table-container">
        <DynamicTable :headers="headers" :content="content" :filterControls="filterControls" />
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

.screenStatCard {
  background: var(--ef-surface);
  border: 1px solid rgba(230, 230, 230, 0.9);
  box-shadow: 0 6px 16px rgba(16, 54, 82, 0.08) !important;
  border-radius: 12px !important;
  min-height: 100%;
  overflow: hidden;
}

/* .screenStatCard--accent {
  background: linear-gradient(180deg, rgba(242, 104, 151, 0.12), rgba(255, 255, 255, 0.98));
} */

.screenStatCard__body {
  padding: 12px !important;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.screenStatCard__eyebrow {
  color: var(--ef-text-soft);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.screenStatCard__title {
  color: var(--ef-secondary);
  font-size: 15px;
  font-weight: 500;
  line-height: 1.3;
  margin-top: 6px;
  min-height: 36px;
}

.screenStatCard__value {
  color: #173042;
  font-size: clamp(20px, 2.4vw, 28px);
  font-weight: 700;
  line-height: 1.1;
  margin-top: 10px;
}

.screenStatCard__meta {
  color: var(--ef-text-soft);
  font-size: 11px;
  line-height: 1.35;
  margin-top: 8px;
}

.screenStatCard__meta-strong {
  color: var(--ef-primary);
  font-weight: 600;
}

@media (max-width: 960px) {
  .screen {
    padding: 16px;
  }

  .screenStatCard__body {
    padding: 11px !important;
  }

  .screenStatCard__title {
    min-height: auto;
  }

  .screenStatCard__value {
    font-size: 20px;
  }
}

@media (max-width: 600px) {
  .screen {
    padding: 12px;
  }

  .screenStatCard {
    border-radius: 10px !important;
  }

  .screenStatCard__body {
    padding: 10px !important;
  }

  .screenStatCard__title {
    font-size: 14px;
  }

  .screenStatCard__value {
    font-size: 18px;
  }
}

.dynamic-table-container {
  margin-top: 20px;
}
</style>
