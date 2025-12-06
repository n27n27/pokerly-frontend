import { defineStore } from 'pinia'
import { ref } from 'vue'
import { fetchMonthlyStatistics } from 'src/api/statistics'

export const useStatisticsStore = defineStore('statistics', () => {
  // ---- 월간 통계 상태 ----
  const monthly = ref(null) // MonthlyStatisticsResponse
  const monthlyLoading = ref(false)
  const monthlyError = ref('')

  const loadMonthly = async (year, month) => {
    monthlyLoading.value = true
    monthlyError.value = ''
    try {
      const data = await fetchMonthlyStatistics(year, month)
      monthly.value = data
    } catch (e) {
      console.error('loadMonthly 실패', e)
      monthly.value = null
      monthlyError.value = '월간 통계를 불러오는 중 오류가 발생했습니다.'
    } finally {
      monthlyLoading.value = false
    }
  }

  return {
    // state
    monthly,
    monthlyLoading,
    monthlyError,
    // actions
    loadMonthly,
  }
})
