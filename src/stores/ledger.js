// src/stores/ledger.js
import { defineStore } from 'pinia'
import { fetchSessionsByMonth, createSession, updateSession, deleteSession } from 'src/api/session'

export const useLedgerStore = defineStore('ledger', {
  state: () => ({
    sessions: {}, // { '2025-05': [ ...sessions ] }
    loading: false,
  }),

  getters: {
    sessionsByMonth: (state) => (ym) => {
      return state.sessions[ym] || []
    },

    /**
     * 월 요약 계산
     */
    monthSummary: (state) => (ym) => {
      const list = state.sessions[ym]
      if (!list || list.length === 0) return null

      let totalCashIn = 0
      let totalCashOut = 0
      let profitCashRealized = 0

      let totalPointIn = 0
      let totalEarnedPoint = 0
      let totalEV = 0

      list.forEach((s) => {
        totalCashIn += s.totalCashIn || 0
        totalCashOut += s.cashOut || 0
        profitCashRealized += s.profitCashRealized || 0

        totalPointIn += s.totalPointIn || 0
        totalEarnedPoint += s.earnedPoint || 0
        totalEV += s.profitIncludingPoints || 0
      })

      return {
        totalCashIn,
        totalCashOut,
        profitCashRealized,
        totalPointIn,
        totalEarnedPoint,
        totalEV,
      }
    },
  },

  actions: {
    /**
     * 월별 세션 조회
     */
    async fetchMonth(ym) {
      this.loading = true
      try {
        const [year, month] = ym.split('-').map(Number)
        const list = await fetchSessionsByMonth(year, month)

        list.forEach((s) => {
          s.venueName = s.venueName || `매장 #${s.venueId}`
        })

        this.sessions[ym] = list
      } finally {
        this.loading = false
      }
    },

    /**
     * 세션 추가
     */
    async addSession(payload) {
      const created = await createSession(payload)

      const ym = created.playDate.slice(0, 7)
      if (!this.sessions[ym]) {
        this.sessions[ym] = []
      }
      this.sessions[ym].push(created)
      return created
    },

    /**
     * 세션 수정
     */
    async updateSession(id, payload) {
      const updated = await updateSession(id, payload)
      const ym = updated.playDate.slice(0, 7)

      if (!this.sessions[ym]) {
        this.sessions[ym] = []
      }

      const idx = this.sessions[ym].findIndex((s) => s.id === id)
      if (idx >= 0) {
        this.sessions[ym][idx] = updated
      }

      return updated
    },

    /**
     * 세션 삭제
     */
    async removeSession(id) {
      await deleteSession(id)

      Object.keys(this.sessions).forEach((ym) => {
        this.sessions[ym] = this.sessions[ym].filter((s) => s.id !== id)
      })
    },
  },
})
