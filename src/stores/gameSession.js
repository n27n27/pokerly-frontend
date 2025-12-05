import { defineStore } from 'pinia'
import {
  createGameSession,
  updateGameSession,
  deleteGameSession,
  fetchMonthlySessions,
  fetchGameSession,
} from 'src/api/gameSession'
import { ref } from 'vue'

export const useGameSessionStore = defineStore('gameSession', () => {
  const sessions = ref([])
  const loading = ref(false)
  const currentSession = ref(null)

  // 날짜 + id 기준 정렬 (서버 정렬과 맞추기 위해 playDate ASC)
  const sortSessions = () => {
    sessions.value.sort((a, b) => {
      if (a.playDate === b.playDate) {
        return (a.id || 0) - (b.id || 0)
      }
      // 'YYYY-MM-DD' 문자열이니까 localeCompare 로 OK
      return a.playDate.localeCompare(b.playDate)
    })
  }

  const loadMonthly = async (year, month) => {
    loading.value = true
    try {
      const raw = await fetchMonthlySessions(year, month)
      sessions.value = raw
      sortSessions()
    } finally {
      loading.value = false
    }
  }

  const loadOne = async (id) => {
    currentSession.value = await fetchGameSession(id)
    return currentSession.value
  }

  const addSession = async (payload) => {
    const res = await createGameSession(payload)
    sessions.value.push(res)
    sortSessions()
    return res
  }

  const editSession = async (id, payload) => {
    const res = await updateGameSession(id, payload)
    const idx = sessions.value.findIndex((s) => s.id === id)
    if (idx !== -1) {
      sessions.value[idx] = res
      sortSessions()
    }
    return res
  }

  const removeSession = async (id) => {
    await deleteGameSession(id)
    sessions.value = sessions.value.filter((s) => s.id !== id)
    sortSessions()
  }

  return {
    sessions,
    currentSession,
    loading,
    loadMonthly,
    loadOne,
    addSession,
    editSession,
    removeSession,
  }
})
