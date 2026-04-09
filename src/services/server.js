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

export async function fetchAI(aiId) {
  return tryRequest(async (client) => {
    if (!aiId) {
      throw new Error('AI ID is required to fetch AI details.');
    }

    const response = await client.get(
      '/easefica-screening/auth/auth/getAIFromEaseFica',
      { params: { aiId } },
    );
    console.log('response', response);
    if (!response.data) {
      console.error('Failed to fetch AI details from easefica.', response);
      throw new Error('Failed to fetch AI details.');
    }

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

function filenameFromContentDisposition(header) {
  if (!header || typeof header !== 'string') return null;
  const utf8Match = header.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match) {
    try {
      return decodeURIComponent(utf8Match[1].trim());
    } catch {
      return utf8Match[1].trim();
    }
  }
  const quoted = header.match(/filename="([^"]+)"/i);
  if (quoted) return quoted[1];
  const simple = header.match(/filename=([^;\s]+)/i);
  if (simple) return simple[1].replace(/^["']|["']$/g, '');
  return null;
}

/**
 * Active data subjects for the AI (paged). Uses OData-style $skip / $top / $count on the backend.
 */
export async function fetchDataSubjects(params = {}) {
  return tryRequest(async (client) => {
    if (!params.aiId) {
      throw new Error('AI ID is required to load data subjects.');
    }
    const page = Math.max(1, Number(params.page || 1));
    const pageSize = Math.max(1, Number(params.pageSize || 10));
    const $skip = (page - 1) * pageSize;
    const $top = pageSize;

    const response = await client.get('/easefica-screening/screening/screening/getDataSubjects', {
      params: {
        aiId: params.aiId,
        $skip,
        $top,
        $count: true,
      },
    });

    const body = response.data;
    if (body && Array.isArray(body.value) && body['@odata.count'] != null) {
      return {
        items: body.value,
        total: Number(body['@odata.count']) || 0,
      };
    }
    if (body && Array.isArray(body.dataSubjects)) {
      return {
        items: body.dataSubjects,
        total: Number(body.totalCount) || body.dataSubjects.length,
      };
    }
    return { items: [], total: 0 };
  });
}

export async function downloadDataSubjectsTemplate() {
  return tryRequest(async (client) => {
    const response = await client.get('/easefica-screening/screening/screening/getTemplate', {
      responseType: 'arraybuffer',
    });
    const blob = new Blob([response.data], {
      type:
        response.headers['content-type'] ||
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const filename = filenameFromContentDisposition(response.headers['content-disposition']);
    return { blob, filename };
  });
}

export async function downloadLastUploadedDataSubjects(aiId) {
  return tryRequest(async (client) => {
    if (!aiId) {
      throw new Error('AI ID is required to download the last upload.');
    }
    const response = await client.get('/easefica-screening/screening/screening/downloadLastUpload', {
      params: { aiId },
      responseType: 'arraybuffer',
    });
    const blob = new Blob([response.data], {
      type:
        response.headers['content-type'] ||
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const filename = filenameFromContentDisposition(response.headers['content-disposition']);
    return { blob, filename };
  });
}
