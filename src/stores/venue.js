import { defineStore } from 'pinia'
import { fetchVenues, createVenue } from 'src/api/venue'
import { ref } from 'vue'

export const useVenueStore = defineStore('venue', () => {
  const venues = ref([])
  const loading = ref(false)

  const loadVenues = async () => {
    if (loading.value) return
    loading.value = true
    try {
      const list = await fetchVenues()
      venues.value = list || []
    } finally {
      loading.value = false
    }
  }

  const addVenue = async (payload) => {
    const res = await createVenue(payload)

    if (res) {
      venues.value.push(res)
    }
    return res
  }

  return { venues, loadVenues, addVenue }
})
