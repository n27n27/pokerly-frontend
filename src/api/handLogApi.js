import { api } from 'boot/axios'
import { invalidateStatisticsEvent } from 'src/services/statisticsEventRepository'

export const fetchHandLogEvents = async ({ page = 0, size = 10, signal } = {}) => {
  const res = await api.get('/hand-log/events', {
    params: {
      page,
      size,
    },
    signal,
  })

  return res.data.data
}

export const createHandLogEvent = async (payload) => {
  const res = await api.post('/hand-log/events', payload)
  return res.data.data
}

export const fetchHandLogEvent = async (eventId, { signal } = {}) => {
  const res = await api.get(`/hand-log/events/${eventId}`, { signal })
  return res.data.data
}

export const updateHandLogEvent = async (eventId, payload) => {
  const res = await api.put(`/hand-log/events/${eventId}`, payload)
  invalidateStatisticsEvent(eventId)
  return res.data.data
}

export const deleteHandLogEvent = async (eventId) => {
  const res = await api.delete(`/hand-log/events/${eventId}`)
  invalidateStatisticsEvent(eventId)
  return res.data.data
}

export const createHandLogBlindLevel = async (eventId, payload) => {
  const res = await api.post(`/hand-log/events/${eventId}/blind-levels`, payload)
  invalidateStatisticsEvent(eventId)
  return res.data.data
}

export const fetchHandLogBlindLevel = async (eventId, blindLevelId, { signal } = {}) => {
  const res = await api.get(`/hand-log/events/${eventId}/blind-levels/${blindLevelId}`, { signal })
  return res.data.data
}

export const copyHandLogBlindLevelsFromEvent = async (eventId, sourceEventId) => {
  const res = await api.post(`/hand-log/events/${eventId}/blind-levels/copy-from-event`, {
    sourceEventId,
  })

  invalidateStatisticsEvent(eventId)
  return res.data.data
}

export const createHandLogHand = async (eventId, blindLevelId, payload) => {
  const res = await api.post(
    `/hand-log/events/${eventId}/blind-levels/${blindLevelId}/hands`,
    payload,
  )

  invalidateStatisticsEvent(eventId)
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

  invalidateStatisticsEvent(eventId)
  return res.data.data
}

export const deleteHandLogHand = async (eventId, blindLevelId, handId) => {
  const res = await api.delete(
    `/hand-log/events/${eventId}/blind-levels/${blindLevelId}/hands/${handId}`,
  )

  invalidateStatisticsEvent(eventId)
  return res.data.data
}

export const moveHandLogHand = async (eventId, blindLevelId, handId, targetBlindLevelId) => {
  const res = await api.patch(
    `/hand-log/events/${eventId}/blind-levels/${blindLevelId}/hands/${handId}/move`,
    {
      targetBlindLevelId,
    },
  )

  invalidateStatisticsEvent(eventId)
  return res.data.data
}

export const bulkMoveHandLogHands = async (eventId, blindLevelId, handIds, targetBlindLevelId) => {
  const res = await api.patch(
    `/hand-log/events/${eventId}/blind-levels/${blindLevelId}/hands/bulk-move`,
    {
      handIds,
      targetBlindLevelId,
    },
  )

  invalidateStatisticsEvent(eventId)
  return res.data.data
}
export const updateHandLogBlindLevelStructure = async (eventId, blindLevelId, payload) => {
  const res = await api.put(
    `/hand-log/events/${eventId}/blind-levels/${blindLevelId}/structure`,
    payload,
  )
  invalidateStatisticsEvent(eventId)
  return res.data.data
}

export const updateHandLogBlindLevelInfo = async (eventId, blindLevelId, payload) => {
  const res = await api.put(
    `/hand-log/events/${eventId}/blind-levels/${blindLevelId}/info`,
    payload,
  )
  invalidateStatisticsEvent(eventId)
  return res.data.data
}

export const deleteHandLogBlindLevel = async (eventId, blindLevelId) => {
  const res = await api.delete(`/hand-log/events/${eventId}/blind-levels/${blindLevelId}`)
  invalidateStatisticsEvent(eventId)
  return res.data.data
}
