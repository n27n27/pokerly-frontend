import { api } from 'boot/axios'

// 매장 목록 가져오기
export async function fetchVenues() {
  const res = await api.get('/venues')
  return res.data.data || []
}

// 매장 등록
export async function createVenue(payload) {
  const res = await api.post('/venues', payload)
  return res.data.data // 생성된 VenueResponse
}
