import { defineStore } from 'pinia'
import { ref } from 'vue'
import { fetchVenueStatistics } from 'src/api/statistics'

export const useVenueStatsStore = defineStore('venueStats', () => {
  const data = ref(null) // VenueStatsResponse 전체
  const loading = ref(false)
  const error = ref(null)

  const load = async () => {
    loading.value = true
    error.value = null
    try {
      const res = await fetchVenueStatistics()
      data.value = res
    } catch (e) {
      console.error('Failed to load venue stats', e)
      error.value = e
    } finally {
      loading.value = false
    }
  }

  return {
    data,
    loading,
    error,
    load,
  }
})
