import { api } from 'boot/axios'

// 매장 목록
export async function fetchVenues() {
  const res = await api.get('/venues')
  return res.data.data || []
}

// 매장 상세
export async function fetchVenue(id) {
  const res = await api.get(`/venues/${id}`)
  return res.data.data
}

// 매장 등록
export async function createVenue(payload) {
  const res = await api.post('/venues', payload)
  return res.data.data // 생성된 VenueResponse
}

// 매장 수정
export async function updateVenue(id, payload) {
  const res = await api.put(`/venues/${id}`, payload)
  return res.data.data
}

// 매장 삭제
export async function deleteVenue(id) {
  const res = await api.delete(`/venues/${id}`)
  return res.data
}
