import { defineStore } from 'pinia'
import { ref } from 'vue'
import { fetchSessionStatistics } from 'src/api/statistics'

export const useStatisticsSessionStore = defineStore('statisticsSession', () => {
  const loading = ref(false)
  const error = ref(null)

  const summary = ref(null)
  const byType = ref([])
  const byBuyInLevel = ref([])
  const byVenue = ref([])

  const itmPattern = ref(null)
  const profitDistribution = ref(null)

  const conditionAnalysis = ref({
    byCondition: [],
    byMental: [],
    byFatigue: [],
  })

  const topSessions = ref([])
  const worstSessions = ref([])

  const load = async () => {
    loading.value = true
    error.value = null
    try {
      const data = await fetchSessionStatistics()

      summary.value = data.summary ?? null
      byType.value = data.byType ?? []
      byBuyInLevel.value = data.byBuyInLevel ?? []
      byVenue.value = data.byVenue ?? []

      itmPattern.value = data.itmpattern ?? null
      profitDistribution.value = data.profitDistribution ?? null

      conditionAnalysis.value = data.conditionAnalysis ?? {
        byCondition: [],
        byMental: [],
        byFatigue: [],
      }

      topSessions.value = data.topSessions ?? []
      worstSessions.value = data.worstSessions ?? []
    } catch (e) {
      console.error('failed to load session statistics', e)
      error.value = e
    } finally {
      loading.value = false
    }
  }

  return {
    // state
    loading,
    error,
    summary,
    byType,
    byBuyInLevel,
    byVenue,
    itmPattern,
    profitDistribution,
    conditionAnalysis,
    topSessions,
    worstSessions,
    // actions
    load,
  }
})
