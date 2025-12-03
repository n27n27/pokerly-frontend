import { defineStore } from 'pinia'
import { ref } from 'vue'
import { fetchDashboardMonthly } from 'src/api/dashboard'

export const useDashboardStore = defineStore('dashboard', () => {
  const loading = ref(false)
  const error = ref(null)
  const monthly = ref(null)

  const year = ref(null)
  const month = ref(null)

  const loadMonthly = async (y, m) => {
    loading.value = true
    error.value = null

    try {
      // 기본값: 현재 년월
      if (!y || !m) {
        const now = new Date()
        year.value = now.getFullYear()
        month.value = now.getMonth() + 1
      } else {
        year.value = y
        month.value = m
      }

      const data = await fetchDashboardMonthly(year.value, month.value)
      monthly.value = data
    } catch (err) {
      console.error(err)
      error.value = err.message || '대시보드 데이터를 불러오지 못했습니다.'
    } finally {
      loading.value = false
    }
  }

  return {
    year,
    month,
    monthly,
    loading,
    error,
    loadMonthly,
  }
})
