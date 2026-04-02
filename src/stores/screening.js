import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import { fetchDashboardSummary, fetchScreeningHistory } from '../services/server';

export const useScreeningStore = defineStore('screening', () => {
  const summary = ref({
    totalNumberOfScreenings: 0,
    latestScreening: null,
  });
  const history = ref([]);
  const query = ref({
    search: '',
    page: 1,
    pageSize: 10,
  });
  const total = ref(0);
  const isLoading = ref(false);
  const error = ref('');

  const pagination = computed(() => ({
    page: query.value.page,
    pageSize: query.value.pageSize,
    total: total.value,
    pageCount: Math.max(1, Math.ceil(total.value / query.value.pageSize)),
  }));

  async function loadDashboard(aiId) {
    isLoading.value = true;
    error.value = '';
    console.log('Loading dashboard for AI ID:', aiId);
    try {
      summary.value = await fetchDashboardSummary(aiId);
      const historyResponse = await fetchScreeningHistory({
        aiId,
        page: query.value.page,
        pageSize: query.value.pageSize,
      });
      history.value = historyResponse.history || [];
      total.value = historyResponse.count || history.value.length;
      console.log('Dashboard loaded:', summary.value);
      console.log('History loaded:', history.value);
    } catch (err) {
      console.error('Error loading dashboard:', err);
      error.value = err?.message || 'Could not load dashboard data.';
    } finally {
      isLoading.value = false;
    }
  }

  async function loadHistory(overrides = {}) {
    query.value = {
      ...query.value,
      ...overrides,
    };
    isLoading.value = true;
    error.value = '';
    try {
      const response = await fetchScreeningHistory(query.value);
      history.value = response.history || [];
      total.value = response.count || history.value.length;
    } catch (err) {
      error.value = err?.message || 'Could not load screening history.';
    } finally {
      isLoading.value = false;
    }
  }

  return {
    summary,
    history,
    query,
    total,
    isLoading,
    error,
    pagination,
    loadDashboard,
    loadHistory,
  };
});
