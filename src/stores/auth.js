import { defineStore } from 'pinia'
import { api } from 'boot/axios'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    loading: false,
  }),
  getters: {
    isAuthenticated: (s) => !!s.user,
  },
  actions: {
    async register({ nickname, password }) {
      await api.post('/users/register', { nickname, password })
    },
    async login({ nickname, password }) {
      this.loading = true
      try {
        const { data } = await api.post('/auth/login', { nickname, password })
        // { accessToken, refreshToken? }
        localStorage.setItem('accessToken', data.accessToken)
        if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken)
        await this.fetchMe()
      } finally {
        this.loading = false
      }
    },
    async fetchMe() {
      const { data } = await api.get('/users/me')
      this.user = data
    },
    logout() {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      this.user = null
    },
    async callAdminOnly() {
      const { data } = await api.get('/admin-only') // @PreAuthorize("hasRole('ADMIN')")
      return data
    },
  },
})
