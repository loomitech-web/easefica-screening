import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import { fetchDashboardSummary, fetchScreeningHistory } from '../services/screening-api';

export const useScreeningStore = defineStore('screening', () => {
  const summary = ref({
    total: 0,
    matchFound: 0,
    clear: 0,
    recent: [],
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

  async function loadDashboard() {
    isLoading.value = true;
    error.value = '';
    try {
      summary.value = await fetchDashboardSummary();
    } catch (err) {
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
      history.value = response.items;
      total.value = response.total;
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
