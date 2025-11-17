import { defineStore } from 'pinia'
import { fetchVenues, createVenue } from 'src/api/venue'

export const useVenueStore = defineStore('venue', {
  state: () => ({
    venues: [],
    loading: false,
  }),

  actions: {
    async fetchAll() {
      if (this.loading) return
      this.loading = true
      try {
        const list = await fetchVenues()
        this.venues = list || []
      } finally {
        this.loading = false
      }
    },

    // 매장 등록 + 스토어에 반영
    async addVenue(payload) {
      const created = await createVenue(payload)
      if (created) {
        this.venues.push(created)
      }
      return created
    },
  },
})
