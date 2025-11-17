// src/api/session.js
import { api } from 'boot/axios'

/**
 * 월별 세션 목록 가져오기
 *
 */
export async function fetchSessionsByMonth(year, month, venueId = null) {
  const params = { year, month }
  if (venueId) params.venueId = venueId

  const res = await api.get('/game-sessions', { params })
  return res.data.data || []
}

/**
 * 세션 추가
 */
export async function createSession(payload) {
  const res = await api.post('/game-sessions', payload)
  return res.data.data
}

/**
 * 세션 수정
 */
export async function updateSession(id, payload) {
  const res = await api.put(`/game-sessions/${id}`, payload)
  return res.data.data
}

/**
 * 세션 삭제
 */
export async function deleteSession(id) {
  await api.delete(`/game-sessions/${id}`)
  return true
}
