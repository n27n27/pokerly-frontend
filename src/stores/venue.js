import { defineStore } from 'pinia'
import { ref } from 'vue'
import { fetchVenues, fetchVenue, createVenue, updateVenue, deleteVenue } from 'src/api/venue'

export const useVenueStore = defineStore('venue', () => {
  const venues = ref([])
  const loading = ref(false)
  const currentVenue = ref(null)

  // 매장 목록 불러오기
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

  // 단일 매장 조회
  const loadVenue = async (id) => {
    const v = await fetchVenue(id)
    currentVenue.value = v
    return v
  }

  // 매장 추가
  const addVenue = async (payload) => {
    const res = await createVenue(payload)
    if (res) {
      venues.value.push(res)
    }
    return res
  }

  // 매장 수정
  const editVenue = async (id, payload) => {
    const res = await updateVenue(id, payload)

    // 목록에서도 반영
    const idx = venues.value.findIndex((v) => v.id === id)
    if (idx !== -1) venues.value[idx] = res

    currentVenue.value = res
    return res
  }

  // 매장 삭제
  const removeVenue = async (id) => {
    await deleteVenue(id)

    // 목록에서도 제거
    venues.value = venues.value.filter((v) => v.id !== id)

    // 상세페이지에서 보고 있었다면 제거
    if (currentVenue.value?.id === id) {
      currentVenue.value = null
    }
  }

  return {
    venues,
    currentVenue,
    loading,

    loadVenues,
    loadVenue,
    addVenue,
    editVenue,
    removeVenue,
  }
})
