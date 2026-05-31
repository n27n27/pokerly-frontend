import { api } from 'boot/axios'

export const fetchHandLogEvents = async () => {
  const res = await api.get('/hand-log/events')
  return res.data.data
}

export const createHandLogEvent = async (payload) => {
  const res = await api.post('/hand-log/events', payload)
  return res.data.data
}

export const fetchHandLogEvent = async (eventId) => {
  const res = await api.get(`/hand-log/events/${eventId}`)
  return res.data.data
}

export const createHandLogBlindLevel = async (eventId, payload) => {
  const res = await api.post(`/hand-log/events/${eventId}/blind-levels`, payload)
  return res.data.data
}

export const fetchHandLogBlindLevel = async (eventId, blindLevelId) => {
  const res = await api.get(`/hand-log/events/${eventId}/blind-levels/${blindLevelId}`)
  return res.data.data
}

export const copyHandLogBlindLevelsFromEvent = async (eventId, sourceEventId) => {
  const res = await api.post(`/hand-log/events/${eventId}/blind-levels/copy-from-event`, {
    sourceEventId,
  })

  return res.data.data
}
export const createHandLogHand = async (eventId, blindLevelId, payload) => {
  const res = await api.post(
    `/hand-log/events/${eventId}/blind-levels/${blindLevelId}/hands`,
    payload,
  )

  return res.data.data
}

export const fetchHandLogHand = async (eventId, blindLevelId, handId) => {
  const res = await api.get(
    `/hand-log/events/${eventId}/blind-levels/${blindLevelId}/hands/${handId}`,
  )

  return res.data.data
}

export const updateHandLogHand = async (eventId, blindLevelId, handId, payload) => {
  const res = await api.put(
    `/hand-log/events/${eventId}/blind-levels/${blindLevelId}/hands/${handId}`,
    payload,
  )

  return res.data.data
}

export const deleteHandLogHand = async (eventId, blindLevelId, handId) => {
  const res = await api.delete(
    `/hand-log/events/${eventId}/blind-levels/${blindLevelId}/hands/${handId}`,
  )

  return res.data.data
}

export const moveHandLogHand = async (eventId, blindLevelId, handId, targetBlindLevelId) => {
  const res = await api.patch(
    `/hand-log/events/${eventId}/blind-levels/${blindLevelId}/hands/${handId}/move`,
    {
      targetBlindLevelId,
    },
  )

  return res.data.data
}

export const updateHandLogBlindLevel = async (eventId, blindLevelId, payload) => {
  const res = await api.put(`/hand-log/events/${eventId}/blind-levels/${blindLevelId}`, payload)
  return res.data.data
}

export const deleteHandLogBlindLevel = async (eventId, blindLevelId) => {
  const res = await api.delete(`/hand-log/events/${eventId}/blind-levels/${blindLevelId}`)
  return res.data.data
}
