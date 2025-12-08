import { api } from 'boot/axios'

const unwrap = (res) => {
  const raw = res.data
  return raw && typeof raw === 'object' && 'data' in raw ? raw.data : raw
}

/**
 * 월간 통계 조회
 * GET /api/statistics/monthly?year=YYYY&month=MM
 */
export const fetchMonthlyStatistics = async (year, month) => {
  const res = await api.get('/statistics/monthly', {
    params: { year, month },
  })
  return unwrap(res) // MonthlyStatisticsResponse
}

/**
 * 세션 분석 통계 조회
 * GET /api/statistics/sessions
 */
export const fetchSessionStatistics = async () => {
  const res = await api.get('/statistics/sessions')
  return unwrap(res) // StatisticsSessionResponse
}

/**
 * 매장별 통계 조회
 * GET /api/statistics/venues
 */
export const fetchVenueStatistics = async () => {
  const res = await api.get('/statistics/venues')
  return unwrap(res) // VenueStatsResponse
}
