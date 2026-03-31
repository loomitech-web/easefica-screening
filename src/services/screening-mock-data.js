const mockScreeningHistory = [
  {
    id: 'scr-1001',
    subjectName: 'Atlas Mining Holdings',
    referenceId: 'REF-2026-001',
    submittedAt: '2026-03-30T09:22:00.000Z',
    status: 'MATCH_FOUND',
    totalMatches: 2,
    screenedLists: ['PEP', 'Sanctions'],
    cost: 34.5,
  },
  {
    id: 'scr-1002',
    subjectName: 'Starlight Medical',
    referenceId: 'REF-2026-002',
    submittedAt: '2026-03-29T14:50:00.000Z',
    status: 'CLEAR',
    totalMatches: 0,
    screenedLists: ['Sanctions'],
    cost: 12.0,
  },
  {
    id: 'scr-1003',
    subjectName: 'Copperline Logistics',
    referenceId: 'REF-2026-003',
    submittedAt: '2026-03-28T11:15:00.000Z',
    status: 'MATCH_FOUND',
    totalMatches: 1,
    screenedLists: ['Adverse Media'],
    cost: 18.5,
  },
];

export function getMockScreeningHistory({ search = '', page = 1, pageSize = 10 } = {}) {
  const safeSearch = search.toLowerCase().trim();
  const filtered = mockScreeningHistory.filter((item) => {
    if (!safeSearch) return true;
    return (
      item.subjectName.toLowerCase().includes(safeSearch) ||
      item.referenceId.toLowerCase().includes(safeSearch)
    );
  });

  const start = (page - 1) * pageSize;
  const pagedItems = filtered.slice(start, start + pageSize);
  return {
    items: pagedItems,
    total: filtered.length,
  };
}

export function getMockDashboardSummary() {
  const total = mockScreeningHistory.length;
  const matchFound = mockScreeningHistory.filter((item) => item.status === 'MATCH_FOUND').length;
  const clear = total - matchFound;
  return {
    total,
    matchFound,
    clear,
    recent: mockScreeningHistory.slice(0, 5),
  };
}

export function getMockMatchReport(id) {
  const record = mockScreeningHistory.find((item) => item.id === id) || mockScreeningHistory[0];
  return {
    id: record.id,
    subjectName: record.subjectName,
    referenceId: record.referenceId,
    submittedAt: record.submittedAt,
    status: record.status,
    matches: [
      {
        sourceList: 'Global Sanctions',
        matchedName: `${record.subjectName} Ltd`,
        confidence: 0.89,
        details: 'Possible legal entity name overlap with sanctioned profile.',
      },
      {
        sourceList: 'PEP Watchlist',
        matchedName: `${record.subjectName} Holdings`,
        confidence: 0.76,
        details: 'Director appears in politically exposed persons list.',
      },
    ].slice(0, Math.max(record.totalMatches, 1)),
  };
}

export function getMockCostReport() {
  const totalScreenings = mockScreeningHistory.length;
  const totalCost = mockScreeningHistory.reduce((sum, item) => sum + item.cost, 0);
  return {
    totalScreenings,
    totalCost,
    averageCost: totalCost / totalScreenings,
  };
}
