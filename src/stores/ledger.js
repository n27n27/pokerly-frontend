import { defineStore } from 'pinia'
import { SessionApi } from 'src/services/sessionApi'

function ym(dateStr) {
  return dateStr.slice(0, 7)
}
function rangeOfMonth(yyyyMM) {
  const [y, m] = yyyyMM.split('-').map(Number)
  const first = new Date(y, m - 1, 1)
  const last = new Date(y, m, 0) // 말일
  const f = `${first.getFullYear()}-${String(first.getMonth() + 1).padStart(2, '0')}-01`
  const t = `${last.getFullYear()}-${String(last.getMonth() + 1).padStart(2, '0')}-${String(last.getDate()).padStart(2, '0')}`
  return { from: f, to: t }
}

export const useLedgerStore = defineStore('ledger', {
  state: () => ({
    sessions: [],
    loading: false,
    error: null,
    currentYM: null, // 'YYYY-MM'
  }),
  getters: {
    sessionsByMonth: (s) => (yyyyMM) =>
      s.sessions.filter((x) => ym(x.date) === yyyyMM).sort((a, b) => (a.date < b.date ? 1 : -1)),
    monthSummary: (s) => (yyyyMM) => {
      const arr = s.sessions.filter((x) => ym(x.date) === yyyyMM)
      const totalIn = arr.reduce((a, v) => a + (v.buyInTotal || 0), 0)
      const totalOut = arr.reduce((a, v) => a + (v.cashOut || 0), 0)
      return { totalIn, totalOut, profit: totalOut - totalIn, count: arr.length }
    },
  },
  actions: {
    async fetchMonth(yyyyMM) {
      this.loading = true
      this.error = null
      try {
        const { from, to } = rangeOfMonth(yyyyMM)
        const data = await SessionApi.listByRange({ from, to })
        // 같은 월 데이터만 넣도록: 서버가 범위로 주므로 그대로 대체
        // (원하면 캐시/머지 전략으로 변경 가능)
        const others = this.sessions.filter((s) => ym(s.date) !== yyyyMM)
        this.sessions = [...others, ...data]
        this.currentYM = yyyyMM
      } catch (e) {
        this.error = e?.response?.data?.message || e.message || 'Failed to fetch'
      } finally {
        this.loading = false
      }
    },

    async addSession(payload) {
      const created = await SessionApi.create(payload)
      this.sessions.push(created)
      // 필요시 현재 월이면 그대로 반영, 아니면 무시
      return created.id
    },

    async updateSession(id, patch) {
      const updated = await SessionApi.update(id, patch)
      const idx = this.sessions.findIndex((s) => s.id === id)
      if (idx !== -1) this.sessions[idx] = updated
      return true
    },

    async removeSession(id) {
      await SessionApi.remove(id)
      this.sessions = this.sessions.filter((s) => s.id !== id)
    },
  },
})
