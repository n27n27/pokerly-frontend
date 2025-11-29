import { defineStore } from 'pinia'
import { api } from 'boot/axios'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const loading = ref(false)

  const isAuthenticated = computed(() => !!user.value)

  // 공통: ApiResponse<T> 이든 T 이든 둘 다 처리
  const unwrap = (res) => {
    const raw = res.data
    return raw && typeof raw === 'object' && 'data' in raw ? raw.data : raw
  }

  // 회원가입
  const register = async ({ nickname, password }) => {
    await api.post('/users/register', { nickname, password })
  }

  // 로그인
  const login = async ({ nickname, password }) => {
    loading.value = true
    try {
      const res = await api.post('/auth/login', { nickname, password })
      const payload = unwrap(res) // { accessToken, refreshToken, user }

      const { accessToken, refreshToken, user: userPayload } = payload

      localStorage.setItem('accessToken', accessToken)
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken)
      }

      user.value = userPayload
    } finally {
      loading.value = false
    }
  }

  // /me로 유저 정보 복구
  const fetchMe = async () => {
    const res = await api.get('/users/me')
    const payload = unwrap(res) // UserResponse
    user.value = payload
  }

  // 로그아웃 (백엔드 + 로컬 둘 다 정리)
  const logout = async () => {
    try {
      await api.post('/auth/logout')
    } catch (e) {
      // 토큰 만료 등으로 실패해도 상관 없으니 로그만
      console.error('logout error (ignored)', e)
    } finally {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      user.value = null
    }
  }

  // ADMIN 전용 테스트 호출 예시
  const callAdminOnly = async () => {
    const res = await api.get('/admin-only')
    return unwrap(res)
  }

  return {
    // state
    user,
    loading,
    // getters
    isAuthenticated,
    // actions
    register,
    login,
    fetchMe,
    logout,
    callAdminOnly,
  }
})
