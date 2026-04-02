import axios from 'axios';
import { getAuthLockService } from './auth-lock';

function getBaseUrl() {
  const host = window.location.hostname;

  if (host === 'localhost' || host === '127.0.0.1') {
    console.log("URL: http://localhost:4601");
    return 'http://localhost:4601';
  }

  console.log("URL: https://odata42s.easefica.co.za");
  return 'https://odata42s.easefica.co.za';
}

function getClient() {
  const authLock = getAuthLockService();
  const headers = authLock?.isAuthorised() ? authLock.headers() : {};
  return axios.create({
    baseURL: getBaseUrl(),
    timeout: 10000,
    headers,
  });
}

// function mapScreeningItem(entry) {
//   return {
//     id: entry.id || entry.ID || entry.screeningId,
//     subjectName: entry.subjectName || entry.Name || entry.subject || 'Unknown',
//     referenceId: entry.referenceId || entry.ReferenceId || entry.refId || '-',
//     submittedAt: entry.submittedAt || entry.CreatedAt || entry.createdAt || new Date().toISOString(),
//     status: entry.status || entry.Result || 'CLEAR',
//     totalMatches: entry.totalMatches || entry.MatchCount || 0,
//     screenedLists: entry.screenedLists || entry.Lists || [],
//     cost: Number(entry.cost || entry.Cost || 0),
//   };
// }

async function tryRequest(executor) {
  const client = getClient();
  return await executor(client);
}

export async function fetchDashboardSummary(aiId) {
  return tryRequest(async (client) => {
    if (!aiId) {
      throw new Error('AI ID is required to load dashboard summary.');
    }

    const statsResponse = await client.get(`/easefica-screening/screening/screening/getDashboardScreeningStats`, {
      params: { aiId },
    });
    return statsResponse.data;
  });
}

export async function fetchScreeningHistory(params = {}) {
  return tryRequest(async (client) => {
    if (!params.aiId) {
      throw new Error('AI ID is required to load screening history.');
    }

    const page = Number(params.page || 1);
    const pageSize = Number(params.pageSize || 10);
    const response = await client.get('/easefica-screening/screening/screening/getScreeningHistory', {
      params: {
        aiId: params.aiId,
        ...(params.startDate ? { startDate: params.startDate } : {}),
        ...(params.endDate ? { endDate: params.endDate } : {}),
        page: page,
        pageSize: pageSize,
      },
    });

    return response.data;
  });
}

export async function fetchMatchReport(id) {
  return tryRequest(async (client) => {
    const response = await client.get('/easefica-screening/screening/screening/getScreeningResults', {
      params: { screeningId: id },
    });
    return response.data;
  });
}

export async function fetchCostReport(aiId, isScreening = true) {
  return tryRequest(async (client) => {
    if (!aiId) {
      throw new Error('AI ID is required to load cost report.');
    }

    const response = await client.post('/easefica-screening/credit/calc/calcCost', {
      aiId,
      isScreening,
    });

    const cost = Number(response.data?.cost || 0);
    const totalScreenings = Number(response.data?.numberOfScreenings || 0);

    return {
      totalScreenings,
      totalCost: cost,
      averageCost: totalScreenings > 0 ? cost / totalScreenings : 0,
      effectiveDataSubjects: Number(response.data?.effectiveDataSubjects || 0),
      previousMonth: response.data?.previousMonth || null,
      thisMonth: response.data?.thisMonth || null,
    };
  });
}

export async function fetchAIFromEaseFica(aiId) {
  return tryRequest(async (client) => {
    if (!aiId) {
      throw new Error('AI ID is required to fetch AI details.');
    }

    const response = await client.get(
      '/easefica-screening/auth/auth/getAIFromEaseFica',
      { params: { aiId } },
    );
    return response.data;
  });
}

export async function fetchUserRoleByEmail(email) {
  return tryRequest(async (client) => {
    if (!email) {
      throw new Error('Email is required to fetch user role.');
    }

    const response = await client.get('/easefica-screening/auth/auth/getUser', {
      params: { id: email },
    });
    return response.data;
  });
}
