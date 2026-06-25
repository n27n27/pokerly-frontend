import { defineStore } from 'pinia'
import { api, clearTokens } from 'boot/axios'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const loading = ref(false)

  const isAuthenticated = computed(() => !!user.value)
  const onboardingRequired = computed(() => {
    if (!user.value) return false
    return user.value.socialLinked === false || user.value.termsAgreed === false
  })

  const unwrap = (res) => {
    const raw = res.data
    return raw && typeof raw === 'object' && 'data' in raw ? raw.data : raw
  }

  const saveAuthPayload = (payload) => {
    const { accessToken, refreshToken, user: userPayload } = payload

    localStorage.setItem('accessToken', accessToken)

    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken)
    } else {
      localStorage.removeItem('refreshToken')
    }

    user.value = userPayload

    return payload
  }

  // 기존 회원 전환용 Local 로그인
  const login = async ({ nickname, password }) => {
    loading.value = true
    try {
      const res = await api.post('/auth/login', { nickname, password })
      return saveAuthPayload(unwrap(res))
    } finally {
      loading.value = false
    }
  }

  // 기존 local 회원가입. 정식 전환 후에는 제거 예정
  const register = async ({ nickname, password }) => {
    await api.post('/users/register', { nickname, password })
  }

  // Google 로그인/가입
  const loginWithGoogle = async ({ idToken, language = 'ko', timezone = 'Asia/Seoul' }) => {
    loading.value = true
    try {
      const res = await api.post('/auth/oauth/google', {
        idToken,
        language,
        timezone,
      })
      return saveAuthPayload(unwrap(res))
    } finally {
      loading.value = false
    }
  }

  // Apple 로그인/가입
  const loginWithApple = async ({ idToken, language = 'ko', timezone = 'Asia/Seoul' }) => {
    loading.value = true
    try {
      const res = await api.post('/auth/oauth/apple', {
        idToken,
        language,
        timezone,
      })
      return saveAuthPayload(unwrap(res))
    } finally {
      loading.value = false
    }
  }

  // 기존 계정에 Google 연결
  const linkGoogle = async ({ idToken }) => {
    const res = await api.post('/auth/link/google', { idToken })
    user.value = unwrap(res)
    return user.value
  }

  // 기존 계정에 Apple 연결
  const linkApple = async ({ idToken }) => {
    const res = await api.post('/auth/link/apple', { idToken })
    user.value = unwrap(res)
    return user.value
  }

  // 온보딩 완료
  const completeOnboarding = async ({
    nickname,
    language,
    timezone,
    termsAgreed,
    privacyAgreed,
  }) => {
    const res = await api.post('/users/me/onboarding', {
      nickname,
      language,
      timezone,
      termsAgreed,
      privacyAgreed,
    })

    user.value = unwrap(res)
    return user.value
  }

  // /me로 유저 정보 복구
  const fetchMe = async () => {
    try {
      const res = await api.get('/users/me')
      user.value = unwrap(res)
    } catch (e) {
      console.warn('fetchMe 실패', e)
      user.value = null
    }
  }

  const checkNickname = async (nickname) => {
    const res = await api.get('/users/nickname/check', {
      params: { nickname },
    })
    return unwrap(res)
  }

  const logout = async () => {
    clearTokens()
    user.value = null
  }
  return {
    user,
    loading,

    isAuthenticated,
    onboardingRequired,

    register,
    login,
    loginWithGoogle,
    loginWithApple,
    linkGoogle,
    linkApple,
    completeOnboarding,
    fetchMe,
    checkNickname,
    logout,
  }
})
