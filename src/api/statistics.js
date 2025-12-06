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
