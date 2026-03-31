# Screening Endpoint Parity Checklist

- [ ] `GET /ScreeningDashboardSummary` provides `total`, `matchFound`, `clear`
- [ ] `GET /Screenings` supports `$top`, `$skip`, `$count`, `$orderby`, `$filter`
- [ ] Screening items include `id`, `subjectName`, `referenceId`, `submittedAt`, `status`, `totalMatches`
- [ ] `GET /MatchReports(:id)` returns report detail and `matches[]`
- [ ] `GET /ScreeningCostReport` returns `totalScreenings`, `totalCost`, `averageCost`
- [ ] Error shape standardized for frontend toast handling
- [ ] Auth headers (`Authorization`, `apiKey`) accepted by all above endpoints
