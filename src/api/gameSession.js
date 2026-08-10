import { api } from 'boot/axios'

export const createGameSession = async (payload) => {
  const res = await api.post('/game-sessions', payload)
  return res.data.data
}

export const updateGameSession = async (id, payload) => {
  const res = await api.put(`/game-sessions/${id}`, payload)
  return res.data.data
}

export const updateGameSessionProgress = async (id, payload) => {
  const res = await api.patch(`/game-sessions/${id}/progress`, payload)
  return res.data.data
}

export const updateSimpleGameSession = async (id, payload) => {
  const res = await api.put(`/game-sessions/${id}/simple-record`, payload)
  return res.data.data
}

export const deleteGameSession = async (id) => {
  const res = await api.delete(`/game-sessions/${id}`)
  return res.data.data
}

export const fetchMonthlySessions = async (year, month) => {
  const res = await api.get('/game-sessions', {
    params: { year, month, _: Date.now() },
  })
  return res.data.data
}

export const fetchGameSession = async (id) => {
  const res = await api.get(`/game-sessions/${id}`)
  return res.data.data
}

export const fetchRecentGameSessions = async () => {
  const res = await api.get('/game-sessions/recent')
  return res.data.data
}

export const fetchRunningGameSession = async () => {
  const res = await api.get('/game-sessions/running', {
    params: { _: Date.now() },
  })
  return res.data.data
}

export const fetchAllGameSessions = async () => {
  const res = await api.get('/game-sessions/all', {
    params: { _: Date.now() },
  })
  return res.data.data
}

export const fetchSessionOptions = async () => {
  const res = await api.get('/game-sessions/options')
  return res.data.data
}
