import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { getHandStrength } from 'src/utils/handLogHandAnalysis'

export const useHandLogStore = defineStore('handLog', () => {
  const events = ref([])
  const logs = ref([])

  const eventItems = computed(() => {
    return events.value
      .map((event) => {
        const eventLogs = logs.value.filter((log) => String(log.eventId) === String(event.id))
        const levelHands = getHandsFromBlindLevels(event)

        const importantCount =
          eventLogs.filter((log) => log.important).length +
          levelHands.filter((hand) => hand.reviewRequired || hand.important).length

        return {
          ...event,
          handCount: eventLogs.length + levelHands.length,
          importantCount,
          levelCount: event.blindLevels?.length || 0,
        }
      })
      .sort((a, b) => {
        const dateCompare = String(b.date || '').localeCompare(String(a.date || ''))

        if (dateCompare !== 0) {
          return dateCompare
        }

        return String(b.createdAt || '').localeCompare(String(a.createdAt || ''))
      })
  })

  const getTodayDate = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')

    return `${year}-${month}-${day}`
  }

  const createTempId = (prefix) => {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  }

  const getHandsFromBlindLevels = (event) => {
    if (!Array.isArray(event?.blindLevels)) {
      return []
    }

    return event.blindLevels.reduce((acc, level) => {
      if (Array.isArray(level.hands)) {
        acc.push(...level.hands)
      }

      return acc
    }, [])
  }

  const createEvent = (payload) => {
    if (!payload?.name?.trim()) {
      return
    }

    const id = Date.now()

    events.value.push({
      id,
      name: payload.name.trim(),
      date: payload.date || getTodayDate(),

      // 추후 매장 연동용
      venueId: null,
      venueName: '',

      // 레벨/블라인드 구간
      blindLevels: [],

      createdAt: new Date().toISOString(),
    })

    return id
  }

  const getEventById = (eventId) => {
    return events.value.find((event) => String(event.id) === String(eventId)) || null
  }

  const getLogsByEventId = (eventId) => {
    return logs.value.filter((log) => String(log.eventId) === String(eventId))
  }

  const getBlindLevelsByEventId = (eventId) => {
    const event = getEventById(eventId)

    if (!event) {
      return []
    }

    if (!Array.isArray(event.blindLevels)) {
      event.blindLevels = []
    }

    return event.blindLevels
  }

  const getBlindLevelById = (eventId, levelId) => {
    const blindLevels = getBlindLevelsByEventId(eventId)

    return (
      blindLevels.find((level) => {
        return String(level.id || level.tempId) === String(levelId)
      }) || null
    )
  }

  const addBlindLevel = (eventId, payload) => {
    const event = getEventById(eventId)

    if (!event) {
      return
    }

    if (!Array.isArray(event.blindLevels)) {
      event.blindLevels = []
    }

    event.blindLevels.push({
      // DB 연동 전까지만 사용하는 프론트 임시 식별자
      tempId: createTempId('level'),

      levelNo: Number(payload.levelNo),
      smallBlind: Number(payload.smallBlind),
      bigBlind: Number(payload.bigBlind),
      ante: Number(payload.ante || 0),

      hands: [],

      createdAt: new Date().toISOString(),
    })
  }

  const addLog = (eventId, payload) => {
    if (!eventId || !payload?.holeCards?.trim()) {
      return
    }

    logs.value.push({
      id: Date.now(),
      eventId: Number(eventId),
      levelNo: payload.levelNo || null,
      blindText: payload.blindText || '',
      holeCards: payload.holeCards.trim(),
      position: payload.position || null,
      actionType: payload.actionType || null,
      resultType: payload.resultType || null,
      important: Boolean(payload.important),
      memo: payload.memo || '',
      createdAt: new Date().toISOString(),
      review: null,
    })
  }

  const saveReview = (logId, payload) => {
    const targetLog = logs.value.find((log) => String(log.id) === String(logId))

    if (!targetLog) {
      return
    }

    targetLog.review = {
      preflop: payload.preflop || '',
      flop: payload.flop || '',
      turn: payload.turn || '',
      river: payload.river || '',
      opponentHand: payload.opponentHand || '',
      opponentType: payload.opponentType || '',
      myThought: payload.myThought || '',
      reviewResult: payload.reviewResult || '',
    }
  }

  const addHandToBlindLevel = (eventId, levelId, payload) => {
    const targetLevel = getBlindLevelById(eventId, levelId)

    const handValue = payload.hand || payload.holeCards?.trim() || ''
    const handStrength = getHandStrength(handValue)

    if (!targetLevel) {
      return
    }

    if (!Array.isArray(targetLevel.hands)) {
      targetLevel.hands = []
    }

    targetLevel.hands.push({
      tempId: createTempId('hand'),

      holeCards: payload.holeCards?.trim() || '',
      hand: payload.hand || payload.holeCards?.trim() || '',

      handStrengthTier: handStrength.tier,
      handStrengthLabel: handStrength.label,
      handStrengthColor: handStrength.color,

      firstRank: payload.firstRank || null,
      secondRank: payload.secondRank || null,
      suited: Boolean(payload.suited),

      position: payload.position || null,
      positionLabel: payload.positionLabel || payload.position || '',

      actionType: payload.actionType || null,
      actionLabel: payload.actionLabel || '',

      preflopAllIn: Boolean(payload.preflopAllIn),

      resultType: payload.resultType || 'NOT_RECORDED',
      resultLabel: payload.resultLabel || '',

      important: Boolean(payload.important),
      reviewRequired: Boolean(payload.reviewRequired || payload.important),

      memo: payload.memo || '',

      levelNo: payload.levelNo || targetLevel.levelNo || null,
      blindText:
        payload.blindText ||
        `${targetLevel.smallBlind} / ${targetLevel.bigBlind} / ${targetLevel.ante || 0}`,

      createdAt: new Date().toISOString(),
      review: null,
    })
  }

  return {
    events,
    logs,
    eventItems,

    createEvent,
    getEventById,
    getLogsByEventId,
    getBlindLevelsByEventId,
    getBlindLevelById,
    addBlindLevel,
    addLog,
    saveReview,
    addHandToBlindLevel,
  }
})
