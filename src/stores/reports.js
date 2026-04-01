import { ref } from 'vue';
import { defineStore } from 'pinia';
import { fetchCostReport, fetchMatchReport } from '../services/server';

export const useReportsStore = defineStore('reports', () => {
  const activeMatchReport = ref(null);
  const costReport = ref({
    totalScreenings: 0,
    totalCost: 0,
    averageCost: 0,
  });
  const isLoading = ref(false);
  const error = ref('');

  async function loadMatchReport(id) {
    if (!id) return;
    isLoading.value = true;
    error.value = '';
    try {
      activeMatchReport.value = await fetchMatchReport(id);
    } catch (err) {
      error.value = err?.message || 'Could not load match report.';
    } finally {
      isLoading.value = false;
    }
  }

  async function loadCostReport() {
    isLoading.value = true;
    error.value = '';
    try {
      costReport.value = await fetchCostReport();
    } catch (err) {
      error.value = err?.message || 'Could not load cost report.';
    } finally {
      isLoading.value = false;
    }
  }

  return {
    activeMatchReport,
    costReport,
    isLoading,
    error,
    loadMatchReport,
    loadCostReport,
  };
});
