import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('pokerly_user') || 'null'),
  }),
  actions: {
    signup({ id, password, nickname }) {
      const user = { id, password, nickname }
      localStorage.setItem('pokerly_user', JSON.stringify(user))
      this.user = user
    },
    login({ id, password }) {
      const saved = JSON.parse(localStorage.getItem('pokerly_user') || 'null')
      console.log(saved)
      if (saved && saved.id === id && saved.password === password) {
        this.user = saved
        return true
      }
      return false
    },
    logout() {
      localStorage.removeItem('pokerly_user')
      this.user = null
    },
  },
})
