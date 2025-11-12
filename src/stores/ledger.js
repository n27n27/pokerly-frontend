// src/stores/ledger.js
import { defineStore } from 'pinia'

function genId() {
  return Math.random().toString(36).slice(2, 10)
}
function ymd(date) {
  // date: 'YYYY-MM-DD' or Date
  if (typeof date === 'string') return date.slice(0, 10)
  const d = new Date(date)
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mm}-${dd}`
}
function ym(dateStr) {
  return dateStr.slice(0, 7) // 'YYYY-MM'
}

export const useLedgerStore = defineStore('ledger', {
  state: () => ({
    sessions: [
      // 예시 데이터(원하면 지워도 됨)
      // { id:'abc', date:'2025-11-01', venue:'Poker Pub A', buyInTotal:100000, cashOut:160000, note:'첫 기록' },
    ],
  }),
  getters: {
    sessionsByMonth: (s) => (yyyyMM) =>
      s.sessions.filter((x) => ym(x.date) === yyyyMM).sort((a, b) => (a.date < b.date ? 1 : -1)),
    monthSummary: (s) => (yyyyMM) => {
      const arr = s.sessions.filter((x) => ym(x.date) === yyyyMM)
      const totalIn = arr.reduce((a, v) => a + (v.buyInTotal || 0), 0)
      const totalOut = arr.reduce((a, v) => a + (v.cashOut || 0), 0)
      return {
        totalIn,
        totalOut,
        profit: totalOut - totalIn,
        count: arr.length,
      }
    },
  },
  actions: {
    addSession(payload) {
      const item = {
        id: genId(),
        date: ymd(payload.date),
        venue: payload.venue?.trim() || '',
        buyInTotal: Number(payload.buyInTotal || 0),
        cashOut: Number(payload.cashOut || 0),
        note: payload.note?.trim() || '',
      }
      this.sessions.push(item)
      return item.id
    },
    updateSession(id, patch) {
      const idx = this.sessions.findIndex((s) => s.id === id)
      if (idx === -1) return false
      this.sessions[idx] = { ...this.sessions[idx], ...patch }
      return true
    },
    removeSession(id) {
      this.sessions = this.sessions.filter((s) => s.id !== id)
    },
  },
})
