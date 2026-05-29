import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import {
  createHandLogBlindLevel,
  createHandLogEvent,
  createHandLogHand,
  fetchHandLogBlindLevel,
  fetchHandLogEvent,
  fetchHandLogEvents,
} from 'src/api/handLogApi'

import { getHandStrength } from 'src/utils/handLogHandAnalysis'

export const useHandLogStore = defineStore('handLog', () => {
  const events = ref([])
  const selectedEvent = ref(null)
  const selectedBlindLevel = ref(null)

  const loading = ref(false)
  const detailLoading = ref(false)
  const levelLoading = ref(false)
  const saving = ref(false)

  // 예전 코드 호환용. 새 구조에서는 사용하지 않음.
  const logs = ref([])

  const eventItems = computed(() => {
    return events.value
      .map((event) => ({
        ...event,
        handCount: event.handCount ?? 0,
        reviewRequiredCount: event.reviewRequiredCount ?? 0,

        // 예전 프론트 코드 호환용 alias
        importantCount: event.importantCount ?? event.reviewRequiredCount ?? 0,

        levelCount: event.levelCount ?? event.blindLevels?.length ?? 0,
      }))
      .sort((a, b) => {
        const eventAtCompare = String(b.eventAt || '').localeCompare(String(a.eventAt || ''))

        if (eventAtCompare !== 0) {
          return eventAtCompare
        }

        return String(b.createdAt || '').localeCompare(String(a.createdAt || ''))
      })
  })

  const normalizeHand = (hand) => {
    if (!hand) {
      return null
    }

    const holeCards = hand.holeCards || hand.hand || ''
    const handStrength = getHandStrength(holeCards)

    return {
      ...hand,

      holeCards,
      hand: hand.hand || holeCards,

      reviewRequired: Boolean(hand.reviewRequired),

      // 기존 화면에서 아직 hand.important를 보는 곳이 있을 수 있어서 임시 alias 유지
      important: Boolean(hand.reviewRequired),

      handStrengthTier: hand.handStrengthTier || handStrength.tier,
      handStrengthLabel: hand.handStrengthLabel || handStrength.label,
      handStrengthColor: hand.handStrengthColor || handStrength.color,
    }
  }

  const normalizeBlindLevel = (level) => {
    if (!level) {
      return null
    }

    const hands = Array.isArray(level.hands) ? level.hands.map(normalizeHand).filter(Boolean) : []

    const reviewRequiredCount =
      level.reviewRequiredCount ?? hands.filter((hand) => hand.reviewRequired).length

    return {
      ...level,

      hands,

      handCount: level.handCount ?? hands.length,
      reviewRequiredCount,
    }
  }

  const formatDateOnly = (value) => {
    if (!value) {
      return ''
    }

    const date = new Date(value)

    if (Number.isNaN(date.getTime())) {
      return ''
    }

    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')

    return `${year}-${month}-${day}`
  }

  const normalizeEvent = (event) => {
    if (!event) {
      return null
    }

    const blindLevels = Array.isArray(event.blindLevels)
      ? event.blindLevels.map(normalizeBlindLevel).filter(Boolean)
      : []

    const handCount =
      event.handCount ??
      blindLevels.reduce((sum, level) => {
        return sum + (level.handCount ?? level.hands?.length ?? 0)
      }, 0)

    const reviewRequiredCount =
      event.reviewRequiredCount ??
      blindLevels.reduce((sum, level) => {
        return sum + (level.reviewRequiredCount ?? 0)
      }, 0)

    return {
      ...event,

      // 기존 리스트 컴포넌트 호환용
      // 현재는 생성 시점의 eventAt을 대회 날짜로 사용
      date: event.date || formatDateOnly(event.eventAt || event.createdAt),

      blindLevels,

      handCount,
      reviewRequiredCount,

      importantCount: event.importantCount ?? reviewRequiredCount,

      levelCount: event.levelCount ?? blindLevels.length,
    }
  }

  const sortBlindLevels = (levels) => {
    return [...levels].sort((a, b) => {
      const levelCompare = Number(a.levelNo || 0) - Number(b.levelNo || 0)

      if (levelCompare !== 0) {
        return levelCompare
      }

      return String(a.createdAt || '').localeCompare(String(b.createdAt || ''))
    })
  }

  const upsertEvent = (event) => {
    const normalized = normalizeEvent(event)

    if (!normalized) {
      return null
    }

    const index = events.value.findIndex((item) => String(item.id) === String(normalized.id))

    if (index >= 0) {
      events.value[index] = normalized
    } else {
      events.value.unshift(normalized)
    }

    if (selectedEvent.value && String(selectedEvent.value.id) === String(normalized.id)) {
      selectedEvent.value = normalized
    }

    return normalized
  }

  const updateEventCountsFromLevels = (event) => {
    if (!event) {
      return null
    }

    const blindLevels = Array.isArray(event.blindLevels) ? event.blindLevels : []

    event.levelCount = blindLevels.length
    event.handCount = blindLevels.reduce((sum, level) => sum + (level.handCount ?? 0), 0)
    event.reviewRequiredCount = blindLevels.reduce(
      (sum, level) => sum + (level.reviewRequiredCount ?? 0),
      0,
    )
    event.importantCount = event.reviewRequiredCount

    return event
  }

  const fetchEvents = async () => {
    loading.value = true

    try {
      const data = await fetchHandLogEvents()
      events.value = Array.isArray(data) ? data.map(normalizeEvent).filter(Boolean) : []
      return events.value
    } finally {
      loading.value = false
    }
  }

  const createEvent = async (payload) => {
    if (!payload?.name?.trim()) {
      return null
    }

    saving.value = true

    try {
      const saved = await createHandLogEvent({
        name: payload.name.trim(),
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

  const getLogsByEventId = () => {
    return []
  }

  const getBlindLevelsByEventId = (eventId) => {
    const event = getEventById(eventId)
    return event?.blindLevels || []
  }

  const getBlindLevelById = (eventId, levelId) => {
    if (
      selectedBlindLevel.value &&
      String(selectedBlindLevel.value.eventId) === String(eventId) &&
      String(selectedBlindLevel.value.id) === String(levelId)
    ) {
      return selectedBlindLevel.value
    }

    const blindLevels = getBlindLevelsByEventId(eventId)

    return blindLevels.find((level) => String(level.id) === String(levelId)) || null
  }

  const addBlindLevel = async (eventId, payload) => {
    if (!eventId) {
      return null
    }

    saving.value = true

    try {
      const saved = await createHandLogBlindLevel(eventId, {
        levelNo: Number(payload.levelNo),
        smallBlind: Number(payload.smallBlind),
        bigBlind: Number(payload.bigBlind),
        ante: Number(payload.ante || 0),
      })

      const normalizedLevel = normalizeBlindLevel(saved)
      const event = getEventById(eventId)

      if (event && normalizedLevel) {
        const levels = Array.isArray(event.blindLevels) ? [...event.blindLevels] : []
        const index = levels.findIndex((level) => String(level.id) === String(normalizedLevel.id))

        if (index >= 0) {
          levels[index] = normalizedLevel
        } else {
          levels.push(normalizedLevel)
        }

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

        if (index >= 0) {
          levels[index] = normalizedLevel
        } else {
          levels.push(normalizedLevel)
        }

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
    if (!eventId || !levelId) {
      return null
    }

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

      const normalizedHand = normalizeHand(saved)

      const level = getBlindLevelById(eventId, levelId)

      if (level && normalizedHand) {
        const hands = Array.isArray(level.hands) ? [...level.hands] : []

        level.hands = [...hands, normalizedHand]
        level.handCount = level.hands.length
        level.reviewRequiredCount = level.hands.filter((hand) => hand.reviewRequired).length

        selectedBlindLevel.value = normalizeBlindLevel(level)
      }

      // 대회 상세의 handCount/reviewRequiredCount를 서버 기준으로 다시 맞춤
      await fetchEventDetail(eventId)

      return normalizedHand
    } finally {
      saving.value = false
    }
  }

  // 예전 구조 호환용. 새 hand-log 구조에서는 사용하지 않음.
  const addLog = () => {}
  const saveReview = () => {}

  return {
    events,
    logs,
    selectedEvent,
    selectedBlindLevel,

    loading,
    detailLoading,
    levelLoading,
    saving,

    eventItems,

    fetchEvents,
    createEvent,
    fetchEventDetail,

    getEventById,
    getLogsByEventId,
    getBlindLevelsByEventId,
    getBlindLevelById,

    addBlindLevel,
    fetchBlindLevelDetail,
    addHandToBlindLevel,

    addLog,
    saveReview,
  }
})
