import { defineStore } from 'pinia'
import { ref } from 'vue'
import { fetchHands, simpleAnalyzeAndSave } from 'src/api/handreview'
import { fetchSessionOptions } from 'src/api/gameSession' // 세션 옵션 전용 API

export const useHandReviewStore = defineStore('handReview', () => {
  const hands = ref([])
  const handsLoading = ref(false)

  const sessionOptions = ref([])
  const sessionsLoading = ref(false)

  // ---------- 세션 옵션 ----------
  const loadSessionOptions = async () => {
    if (sessionsLoading.value) return
    // 이미 로드했다면 다시 안 불러도 됨 (필요하면 이 조건 지워도 OK)
    if (sessionOptions.value.length) return

    sessionsLoading.value = true
    try {
      const list = await fetchSessionOptions()
      sessionOptions.value = list || []
    } finally {
      sessionsLoading.value = false
    }
  }

  // ---------- 핸드 목록 ----------
  const loadHands = async () => {
    if (handsLoading.value) return

    handsLoading.value = true
    try {
      const list = await fetchHands()
      hands.value = list || []
    } finally {
      handsLoading.value = false
    }
  }

  const loadInitial = async () => {
    await Promise.all([loadSessionOptions(), loadHands()])
  }

  const addLocalHand = (hand) => {
    // 새 핸드는 항상 맨 앞에
    hands.value.unshift(hand)
  }

  const replaceHandById = (id, newHand) => {
    const idx = hands.value.findIndex((h) => h.id === id)
    if (idx !== -1) {
      hands.value[idx] = newHand
    } else {
      hands.value.unshift(newHand)
    }
  }

  // ---------- Simple 분석 + 저장 ----------
  const analyzeAndSaveSimple = async (hand, simpleForm) => {
    const body = {
      sessionId: hand.sessionId || null,

      title: hand.title,
      heroHand: hand.heroHand || null,
      position: hand.position || null,
      blinds: hand.blinds || null,
      stackBb: hand.stackBb || null,
      description: hand.description || null,
      question: hand.question || null,

      simpleMainStreet: simpleForm.mainStreet,
      simplePotType: simpleForm.potType,
      simpleBoardTexture: simpleForm.boardTexture,
      simpleHeroStrength: simpleForm.heroHandStrength,
      simpleHeroLine: simpleForm.heroLine,
    }

    const saved = await simpleAnalyzeAndSave(body)
    replaceHandById(hand.id, saved)
    return saved
  }

  return {
    // state
    hands,
    handsLoading,
    sessionOptions,
    sessionsLoading,
    // actions
    loadInitial,
    loadHands,
    loadSessionOptions,
    addLocalHand,
    replaceHandById,
    analyzeAndSaveSimple,
  }
})
