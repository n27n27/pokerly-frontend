import { api } from 'boot/axios'

const data = (response) => response.data.data

export const fetchTournamentPlayers = async () => data(await api.get('/players'))
export const createTournamentPlayer = async (payload) => data(await api.post('/players', payload))
export const updateTournamentPlayer = async (id, payload) =>
  data(await api.put(`/players/${id}`, payload))
export const deleteTournamentPlayer = async (id) => data(await api.delete(`/players/${id}`))

export const fetchTournamentSeats = async (sessionId) =>
  data(await api.get(`/game-sessions/${sessionId}/seats`))
export const saveTournamentSeat = async (sessionId, seatNumber, payload) =>
  data(await api.put(`/game-sessions/${sessionId}/seats/${seatNumber}`, payload))
export const deleteTournamentSeat = async (sessionId, seatNumber) =>
  data(await api.delete(`/game-sessions/${sessionId}/seats/${seatNumber}`))
export const resetTournamentSeats = async (sessionId) =>
  data(await api.delete(`/game-sessions/${sessionId}/seats`))
