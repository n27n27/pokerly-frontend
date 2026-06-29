import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import {
  bulkMoveHandLogHands,
  copyHandLogBlindLevelsFromEvent,
  createHandLogBlindLevel,
  createHandLogEvent,
  createHandLogHand,
  deleteHandLogBlindLevel,
  deleteHandLogHand,
  fetchHandLogBlindLevel,
  fetchHandLogEvent,
  fetchHandLogEvents,
  fetchHandLogHand,
  moveHandLogHand,
  updateHandLogBlindLevel,
  updateHandLogHand,
} from 'src/api/handLogApi'

import { getHandStrength } from 'src/utils/handLogHandAnalysis'

export const useHandLogStore = defineStore('handLog', () => {
  const events = ref([])
  const selectedEvent = ref(null)
  const selectedBlindLevel = ref(null)
  const selectedHand = ref(null)

  const loading = ref(false)
  const detailLoading = ref(false)
  const levelLoading = ref(false)
  const handLoading = ref(false)
  const saving = ref(false)
  const eventPage = ref(0)
  const eventSize = ref(10)
  const eventHasNext = ref(false)
  const loadingMoreEvents = ref(false)
  let fetchingMoreEvents = false

  const logs = ref([])

  const eventItems = computed(() => {
    return events.value
      .map((event) => ({
        ...event,
        handCount: event.handCount ?? 0,
        reviewRequiredCount: event.reviewRequiredCount ?? 0,
        importantCount: event.importantCount ?? event.reviewRequiredCount ?? 0,
        levelCount: event.levelCount ?? event.blindLevels?.length ?? 0,
        blindLevelCount:
          event.blindLevelCount ?? event.levelCount ?? event.blindLevels?.length ?? 0,
      }))
      .sort((a, b) => {
        const eventAtCompare = String(b.eventAt || '').localeCompare(String(a.eventAt || ''))

        if (eventAtCompare !== 0) return eventAtCompare

        return String(b.createdAt || '').localeCompare(String(a.createdAt || ''))
      })
  })

  const normalizeHand = (hand) => {
    if (!hand) return null

    const holeCards = hand.holeCards || hand.hand || ''
    const handStrength = getHandStrength(holeCards)

    return {
      ...hand,
      holeCards,
      hand: hand.hand || holeCards,
      reviewRequired: Boolean(hand.reviewRequired),
      important: Boolean(hand.reviewRequired),
      handStrengthTier: hand.handStrengthTier || handStrength.tier,
      handStrengthLabel: hand.handStrengthLabel || handStrength.label,
      handStrengthColor: hand.handStrengthColor || handStrength.color,
    }
  }

  const normalizeBlindLevel = (level) => {
    if (!level) return null

    const hands = Array.isArray(level.hands) ? level.hands.map(normalizeHand).filter(Boolean) : []
    const reviewRequiredCount =
      level.reviewRequiredCount ?? hands.filter((hand) => hand.reviewRequired).length

    return {
      ...level,
      hands,
      handCount: level.handCount ?? hands.length,
      reviewRequiredCount,
      editableStartStack: Boolean(level.editableStartStack),
    }
  }

  const formatDateOnly = (value) => {
    if (!value) return ''

    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return ''

    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')

    return `${year}-${month}-${day}`
  }

  const normalizeEvent = (event) => {
    if (!event) return null

    const blindLevels = Array.isArray(event.blindLevels)
      ? event.blindLevels.map(normalizeBlindLevel).filter(Boolean)
      : []

    const handCount =
      event.handCount ??
      blindLevels.reduce((sum, level) => sum + (level.handCount ?? level.hands?.length ?? 0), 0)

    const reviewRequiredCount =
      event.reviewRequiredCount ??
      blindLevels.reduce((sum, level) => sum + (level.reviewRequiredCount ?? 0), 0)

    return {
      ...event,
      date: event.date || formatDateOnly(event.eventAt || event.createdAt),
      blindLevels,
      handCount,
      reviewRequiredCount,
      importantCount: event.importantCount ?? reviewRequiredCount,
      levelCount: event.levelCount ?? blindLevels.length,
      blindLevelCount: event.blindLevelCount ?? event.levelCount ?? blindLevels.length,
    }
  }

  const sortBlindLevels = (levels) => {
    return [...levels].sort((a, b) => {
      const levelCompare = Number(a.levelNo || 0) - Number(b.levelNo || 0)
      if (levelCompare !== 0) return levelCompare
      return String(a.createdAt || '').localeCompare(String(b.createdAt || ''))
    })
  }

  const sortHands = (hands) => {
    return [...hands].sort((a, b) =>
      String(a.createdAt || '').localeCompare(String(b.createdAt || '')),
    )
  }

  const upsertEvent = (event) => {
    const normalized = normalizeEvent(event)
    if (!normalized) return null

    const index = events.value.findIndex((item) => String(item.id) === String(normalized.id))

    if (index >= 0) events.value[index] = normalized
    else events.value.unshift(normalized)

    if (selectedEvent.value && String(selectedEvent.value.id) === String(normalized.id)) {
      selectedEvent.value = normalized
    }

    return normalized
  }

  const updateEventCountsFromLevels = (event) => {
    if (!event) return null

    const blindLevels = Array.isArray(event.blindLevels) ? event.blindLevels : []

    event.levelCount = blindLevels.length
    event.blindLevelCount = blindLevels.length
    event.handCount = blindLevels.reduce((sum, level) => sum + (level.handCount ?? 0), 0)
    event.reviewRequiredCount = blindLevels.reduce(
      (sum, level) => sum + (level.reviewRequiredCount ?? 0),
      0,
    )
    event.importantCount = event.reviewRequiredCount

    return event
  }

  const upsertHandToLevelState = (eventId, levelId, hand) => {
    const normalizedHand = normalizeHand(hand)
    if (!normalizedHand) return null

    const level = getBlindLevelById(eventId, levelId)

    if (level) {
      const hands = Array.isArray(level.hands) ? [...level.hands] : []
      const handIndex = hands.findIndex((item) => String(item.id) === String(normalizedHand.id))

      if (handIndex >= 0) hands[handIndex] = normalizedHand
      else hands.push(normalizedHand)

      level.hands = sortHands(hands)
      level.handCount = level.hands.length
      level.reviewRequiredCount = level.hands.filter((item) => item.reviewRequired).length
      selectedBlindLevel.value = normalizeBlindLevel(level)
    }

    const event = getEventById(eventId)

    if (event && level) {
      const levels = Array.isArray(event.blindLevels) ? [...event.blindLevels] : []
      const levelIndex = levels.findIndex((item) => String(item.id) === String(levelId))

      if (levelIndex >= 0) levels[levelIndex] = normalizeBlindLevel(level)

      event.blindLevels = sortBlindLevels(levels)
      updateEventCountsFromLevels(event)

      const normalizedEvent = upsertEvent(event)
      selectedEvent.value = normalizedEvent
    }

    selectedHand.value = normalizedHand
    return normalizedHand
  }

  const removeHandFromLevelState = (eventId, levelId, handId) => {
    const level = getBlindLevelById(eventId, levelId)

    if (level) {
      const hands = Array.isArray(level.hands) ? [...level.hands] : []

      level.hands = hands.filter((hand) => String(hand.id) !== String(handId))
      level.handCount = level.hands.length
      level.reviewRequiredCount = level.hands.filter((hand) => hand.reviewRequired).length
      selectedBlindLevel.value = normalizeBlindLevel(level)
    }

    const event = getEventById(eventId)

    if (event && level) {
      const levels = Array.isArray(event.blindLevels) ? [...event.blindLevels] : []
      const levelIndex = levels.findIndex((item) => String(item.id) === String(levelId))

      if (levelIndex >= 0) levels[levelIndex] = normalizeBlindLevel(level)

      event.blindLevels = sortBlindLevels(levels)
      updateEventCountsFromLevels(event)

      const normalizedEvent = upsertEvent(event)
      selectedEvent.value = normalizedEvent
    }

    if (selectedHand.value && String(selectedHand.value.id) === String(handId)) {
      selectedHand.value = null
    }
  }

  const fetchEvents = async ({ reset = true } = {}) => {
    if (reset) {
      loading.value = true
      eventPage.value = 0
      eventHasNext.value = false
    } else {
      loadingMoreEvents.value = true
    }

    try {
      const data = await fetchHandLogEvents({
        page: reset ? 0 : eventPage.value + 1,
        size: eventSize.value,
      })

      const content = Array.isArray(data?.content) ? data.content : []
      const normalizedEvents = content.map(normalizeEvent).filter(Boolean)

      if (reset) {
        events.value = normalizedEvents
      } else {
        const existingIds = new Set(events.value.map((event) => String(event.id)))
        const appended = normalizedEvents.filter((event) => !existingIds.has(String(event.id)))
        events.value = [...events.value, ...appended]
      }

      eventPage.value = Number(data?.page ?? 0)
      eventHasNext.value = Boolean(data?.hasNext)

      return events.value
    } finally {
      if (reset) loading.value = false
      else loadingMoreEvents.value = false
    }
  }

  const fetchMoreEvents = async () => {
    if (fetchingMoreEvents || loadingMoreEvents.value || !eventHasNext.value) {
      return events.value
    }

    fetchingMoreEvents = true

    try {
      return await fetchEvents({ reset: false })
    } finally {
      fetchingMoreEvents = false
    }
  }

  const createEvent = async (payload) => {
    if (!payload?.name?.trim()) return null

    saving.value = true

    try {
      const saved = await createHandLogEvent({
        name: payload.name.trim(),
        startingStack: payload.startingStack ?? null,
      })

      const normalized = upsertEvent(saved)
      selectedEvent.value = normalized

      return normalized?.id ?? null
    } finally {
      saving.value = false
    }
  }

  const fetchEventDetail = async (eventId) => {
    if (!eventId) {
      selectedEvent.value = null
      return null
    }

    detailLoading.value = true

    try {
      const data = await fetchHandLogEvent(eventId)
      const normalized = upsertEvent(data)

      selectedEvent.value = normalized
      return normalized
    } finally {
      detailLoading.value = false
    }
  }

  const getEventById = (eventId) => {
    if (selectedEvent.value && String(selectedEvent.value.id) === String(eventId)) {
      return selectedEvent.value
    }

    return events.value.find((event) => String(event.id) === String(eventId)) || null
  }

  const getLogsByEventId = () => []
  const getBlindLevelsByEventId = (eventId) => getEventById(eventId)?.blindLevels || []

  const getBlindLevelById = (eventId, levelId) => {
    if (
      selectedBlindLevel.value &&
      String(selectedBlindLevel.value.eventId) === String(eventId) &&
      String(selectedBlindLevel.value.id) === String(levelId)
    ) {
      return selectedBlindLevel.value
    }

    return (
      getBlindLevelsByEventId(eventId).find((level) => String(level.id) === String(levelId)) || null
    )
  }

  const getHandById = (eventId, levelId, handId) => {
    if (
      selectedHand.value &&
      String(selectedHand.value.eventId) === String(eventId) &&
      String(selectedHand.value.blindLevelId) === String(levelId) &&
      String(selectedHand.value.id) === String(handId)
    ) {
      return selectedHand.value
    }

    const level = getBlindLevelById(eventId, levelId)
    const hands = level?.hands || []

    return hands.find((hand) => String(hand.id) === String(handId)) || null
  }

  const addBlindLevel = async (eventId, payload) => {
    if (!eventId) return null

    saving.value = true

    try {
      const saved = await createHandLogBlindLevel(eventId, {
        levelNo: Number(payload.levelNo),
        smallBlind: Number(payload.smallBlind),
        bigBlind: Number(payload.bigBlind),
        ante: Number(payload.ante || 0),
        startStack: payload.startStack ?? null,
        endStack: payload.endStack ?? null,
        averageStack: payload.averageStack ?? null,
        memo: payload.memo ?? null,
      })

      const normalizedLevel = normalizeBlindLevel(saved)
      const event = getEventById(eventId)

      if (event && normalizedLevel) {
        const levels = Array.isArray(event.blindLevels) ? [...event.blindLevels] : []
        const index = levels.findIndex((level) => String(level.id) === String(normalizedLevel.id))

        if (index >= 0) levels[index] = normalizedLevel
        else levels.push(normalizedLevel)

        event.blindLevels = sortBlindLevels(levels)
        updateEventCountsFromLevels(event)

        const normalizedEvent = upsertEvent(event)
        selectedEvent.value = normalizedEvent
      } else {
        await fetchEventDetail(eventId)
      }

      return normalizedLevel
    } finally {
      saving.value = false
    }
  }

  const updateBlindLevel = async (eventId, blindLevelId, payload) => {
    if (!eventId || !blindLevelId) return null

    saving.value = true

    try {
      const saved = await updateHandLogBlindLevel(eventId, blindLevelId, {
        levelNo: Number(payload.levelNo),
        smallBlind: Number(payload.smallBlind),
        bigBlind: Number(payload.bigBlind),
        ante: Number(payload.ante || 0),
        startStack: payload.startStack ?? null,
        endStack: payload.endStack ?? null,
        averageStack: payload.averageStack ?? null,
        memo: payload.memo ?? null,
      })

      const normalizedLevel = normalizeBlindLevel(saved)

      if (
        selectedBlindLevel.value &&
        String(selectedBlindLevel.value.id) === String(blindLevelId)
      ) {
        selectedBlindLevel.value = normalizedLevel
      }

      await fetchEventDetail(eventId)

      return normalizedLevel
    } finally {
      saving.value = false
    }
  }

  const deleteBlindLevel = async (eventId, blindLevelId) => {
    if (!eventId || !blindLevelId) return false

    saving.value = true

    try {
      await deleteHandLogBlindLevel(eventId, blindLevelId)

      if (
        selectedBlindLevel.value &&
        String(selectedBlindLevel.value.id) === String(blindLevelId)
      ) {
        selectedBlindLevel.value = null
      }

      await fetchEventDetail(eventId)
      return true
    } finally {
      saving.value = false
    }
  }

  const copyBlindLevelsFromEvent = async (targetEventId, sourceEventId) => {
    if (!targetEventId || !sourceEventId) return null

    saving.value = true

    try {
      const copiedEvent = await copyHandLogBlindLevelsFromEvent(targetEventId, sourceEventId)
      const normalized = upsertEvent(copiedEvent)

      selectedEvent.value = normalized
      return normalized
    } finally {
      saving.value = false
    }
  }

  const fetchBlindLevelDetail = async (eventId, blindLevelId) => {
    if (!eventId || !blindLevelId) {
      selectedBlindLevel.value = null
      return null
    }

    levelLoading.value = true

    try {
      const data = await fetchHandLogBlindLevel(eventId, blindLevelId)
      const normalizedLevel = normalizeBlindLevel(data)

      selectedBlindLevel.value = normalizedLevel

      const event = getEventById(eventId)

      if (event && normalizedLevel) {
        const levels = Array.isArray(event.blindLevels) ? [...event.blindLevels] : []
        const index = levels.findIndex((level) => String(level.id) === String(normalizedLevel.id))

        if (index >= 0) levels[index] = normalizedLevel
        else levels.push(normalizedLevel)

        event.blindLevels = sortBlindLevels(levels)
        updateEventCountsFromLevels(event)

        const normalizedEvent = upsertEvent(event)
        selectedEvent.value = normalizedEvent
      }

      return normalizedLevel
    } finally {
      levelLoading.value = false
    }
  }

  const addHandToBlindLevel = async (eventId, levelId, payload) => {
    if (!eventId || !levelId) return null

    const handValue = payload.hand || payload.holeCards?.trim() || ''
    const handStrength = getHandStrength(handValue)

    saving.value = true

    try {
      const saved = await createHandLogHand(eventId, levelId, {
        holeCards: payload.holeCards?.trim() || handValue,
        hand: payload.hand || handValue,
        firstRank: payload.firstRank || null,
        secondRank: payload.secondRank || null,
        suited: Boolean(payload.suited),
        position: payload.position || null,
        actionType: payload.actionType || null,
        actionLabel: payload.actionLabel || '',
        preflopAllIn: Boolean(payload.preflopAllIn),
        resultType: payload.resultType || 'NOT_RECORDED',
        resultLabel: payload.resultLabel || '',
        reviewRequired: Boolean(payload.reviewRequired),
        memo: payload.memo || '',
        handStrengthTier: payload.handStrengthTier || handStrength.tier,
        handStrengthLabel: payload.handStrengthLabel || handStrength.label,
        handStrengthColor: payload.handStrengthColor || handStrength.color,
      })

      const normalizedHand = upsertHandToLevelState(eventId, levelId, saved)

      try {
        await fetchEventDetail(eventId)
      } catch (syncError) {
        console.warn('[HAND_CREATE_SYNC_FAILED]', syncError)
      }

      return normalizedHand
    } finally {
      saving.value = false
    }
  }

  const fetchHandDetail = async (eventId, levelId, handId) => {
    if (!eventId || !levelId || !handId) {
      selectedHand.value = null
      return null
    }

    handLoading.value = true

    try {
      const data = await fetchHandLogHand(eventId, levelId, handId)
      const normalizedHand = upsertHandToLevelState(eventId, levelId, data)

      selectedHand.value = normalizedHand
      return normalizedHand
    } finally {
      handLoading.value = false
    }
  }

  const updateHandInBlindLevel = async (eventId, levelId, handId, payload) => {
    if (!eventId || !levelId || !handId) return null

    const handValue = payload.hand || payload.holeCards?.trim() || ''
    const handStrength = getHandStrength(handValue)

    saving.value = true

    try {
      const saved = await updateHandLogHand(eventId, levelId, handId, {
        holeCards: payload.holeCards?.trim() || handValue,
        hand: payload.hand || handValue,
        firstRank: payload.firstRank || null,
        secondRank: payload.secondRank || null,
        suited: Boolean(payload.suited),
        position: payload.position || null,
        actionType: payload.actionType || null,
        actionLabel: payload.actionLabel || '',
        preflopAllIn: Boolean(payload.preflopAllIn),
        resultType: payload.resultType || 'NOT_RECORDED',
        resultLabel: payload.resultLabel || '',
        reviewRequired: Boolean(payload.reviewRequired),
        memo: payload.memo || '',
        handStrengthTier: payload.handStrengthTier || handStrength.tier,
        handStrengthLabel: payload.handStrengthLabel || handStrength.label,
        handStrengthColor: payload.handStrengthColor || handStrength.color,
      })

      const normalizedHand = upsertHandToLevelState(eventId, levelId, saved)
      await fetchEventDetail(eventId)

      return normalizedHand
    } finally {
      saving.value = false
    }
  }

  const moveHandToBlindLevel = async (eventId, currentLevelId, handId, targetLevelId) => {
    if (!eventId || !currentLevelId || !handId || !targetLevelId) return null

    saving.value = true

    try {
      const movedHand = await moveHandLogHand(eventId, currentLevelId, handId, targetLevelId)
      const normalizedHand = normalizeHand(movedHand)

      if (String(currentLevelId) !== String(targetLevelId)) {
        removeHandFromLevelState(eventId, currentLevelId, handId)
        upsertHandToLevelState(eventId, targetLevelId, movedHand)
      } else {
        upsertHandToLevelState(eventId, currentLevelId, movedHand)
      }

      selectedHand.value = normalizedHand

      return normalizedHand
    } finally {
      saving.value = false
    }
  }

  const moveHandsToBlindLevel = async (eventId, currentLevelId, handIds, targetLevelId) => {
    if (
      !eventId ||
      !currentLevelId ||
      !Array.isArray(handIds) ||
      handIds.length === 0 ||
      !targetLevelId
    ) {
      return []
    }

    saving.value = true

    try {
      await bulkMoveHandLogHands(eventId, currentLevelId, handIds, targetLevelId)

      handIds.forEach((handId) => {
        removeHandFromLevelState(eventId, currentLevelId, handId)
      })

      return handIds
    } finally {
      saving.value = false
    }
  }

  const deleteHandFromBlindLevel = async (eventId, levelId, handId) => {
    if (!eventId || !levelId || !handId) return false

    saving.value = true

    try {
      await deleteHandLogHand(eventId, levelId, handId)
      removeHandFromLevelState(eventId, levelId, handId)
      await fetchEventDetail(eventId)

      return true
    } finally {
      saving.value = false
    }
  }

  const addLog = () => {}
  const saveReview = () => {}

  return {
    events,
    logs,
    selectedEvent,
    selectedBlindLevel,
    selectedHand,

    loading,
    detailLoading,
    levelLoading,
    handLoading,
    saving,

    eventItems,

    fetchEvents,
    createEvent,
    fetchEventDetail,

    getEventById,
    getLogsByEventId,
    getBlindLevelsByEventId,
    getBlindLevelById,
    getHandById,

    addBlindLevel,
    updateBlindLevel,
    deleteBlindLevel,
    copyBlindLevelsFromEvent,
    fetchBlindLevelDetail,
    addHandToBlindLevel,

    fetchHandDetail,
    updateHandInBlindLevel,
    moveHandToBlindLevel,
    moveHandsToBlindLevel,
    deleteHandFromBlindLevel,

    addLog,
    saveReview,
    eventHasNext,
    loadingMoreEvents,
    fetchMoreEvents,
  }
})
