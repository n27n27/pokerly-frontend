import { api } from 'boot/axios'

// 월간 대시보드 조회
export const fetchDashboardMonthly = async (year, month) => {
  const res = await api.get('/dashboard/monthly', {
    params: { year, month },
  })
  return res.data.data
}
