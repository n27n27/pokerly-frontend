import { api } from 'boot/axios'

export const createGameSession = async (payload) => {
  const res = await api.post('/game-sessions', payload)
  return res.data.data
}

export const updateGameSession = async (id, payload) => {
  const res = await api.put(`/game-sessions/${id}`, payload)
  return res.data.data
}

export const deleteGameSession = async (id) => {
  const res = await api.delete(`/game-sessions/${id}`)
  return res.data.data
}

export const fetchMonthlySessions = async (year, month) => {
  const res = await api.get('/game-sessions', {
    params: { year, month },
  })
  return res.data.data
}

export const fetchGameSession = async (id) => {
  const res = await api.get(`/game-sessions/${id}`)
  return res.data.data
}
