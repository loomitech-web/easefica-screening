import { getAuthLockService } from './auth-lock';
import {
  getMockCostReport,
  getMockDashboardSummary,
  getMockMatchReport,
  getMockScreeningHistory,
} from './screening-mock-data';

function shouldUseMock(resource) {
  const resourceFlag = import.meta.env[`VITE_SCREENING_USE_MOCK_${resource.toUpperCase()}`];
  const globalFlag = import.meta.env.VITE_SCREENING_USE_MOCK_ALL;
  if (resourceFlag !== undefined) return resourceFlag === 'true';
  return globalFlag === 'true';
}

function getClient() {
  const authLock = getAuthLockService();
  if (!authLock?.isAuthorised()) return null;
  return authLock.createClient();
}

function mapScreeningItem(entry) {
  return {
    id: entry.id || entry.ID || entry.screeningId,
    subjectName: entry.subjectName || entry.Name || entry.subject || 'Unknown',
    referenceId: entry.referenceId || entry.ReferenceId || entry.refId || '-',
    submittedAt: entry.submittedAt || entry.CreatedAt || entry.createdAt || new Date().toISOString(),
    status: entry.status || entry.Result || 'CLEAR',
    totalMatches: entry.totalMatches || entry.MatchCount || 0,
    screenedLists: entry.screenedLists || entry.Lists || [],
    cost: Number(entry.cost || entry.Cost || 0),
  };
}

async function tryRequest(resource, executor, fallback) {
  if (shouldUseMock(resource)) return fallback();
  try {
    const client = getClient();
    if (!client) return fallback();
    return await executor(client);
  } catch {
    return fallback();
  }
}

export async function fetchDashboardSummary() {
  return tryRequest(
    'dashboard',
    async (client) => {
      const [summaryResponse, recentResponse] = await Promise.all([
        client.get('/ScreeningDashboardSummary'),
        client.get('/Screenings', { params: { $top: 5, $orderby: 'submittedAt desc' } }),
      ]);
      return {
        total: summaryResponse.data.total || 0,
        matchFound: summaryResponse.data.matchFound || 0,
        clear: summaryResponse.data.clear || 0,
        recent: (recentResponse.data.value || []).map(mapScreeningItem),
      };
    },
    () => getMockDashboardSummary(),
  );
}

export async function fetchScreeningHistory(params) {
  return tryRequest(
    'history',
    async (client) => {
      const page = Number(params.page || 1);
      const pageSize = Number(params.pageSize || 10);
      const skip = (page - 1) * pageSize;
      const filter = params.search
        ? `contains(subjectName,'${params.search.replace(/'/g, "''")}')`
        : undefined;

      const response = await client.get('/Screenings', {
        params: {
          $top: pageSize,
          $skip: skip,
          $count: true,
          $orderby: 'submittedAt desc',
          ...(filter ? { $filter: filter } : {}),
        },
      });

      return {
        items: (response.data.value || []).map(mapScreeningItem),
        total: response.data['@odata.count'] || 0,
      };
    },
    () => getMockScreeningHistory(params),
  );
}

export async function fetchMatchReport(id) {
  return tryRequest(
    'matchreport',
    async (client) => {
      const response = await client.get(`/MatchReports(${id})`);
      return response.data;
    },
    () => getMockMatchReport(id),
  );
}

export async function fetchCostReport() {
  return tryRequest(
    'costreport',
    async (client) => {
      const response = await client.get('/ScreeningCostReport');
      return response.data;
    },
    () => getMockCostReport(),
  );
}
