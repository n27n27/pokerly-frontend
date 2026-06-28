// src/boot/axios.js
import { boot } from 'quasar/wrappers'
import axios from 'axios'

// =============================
//  Axios 인스턴스
// =============================
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: Number(import.meta.env.VITE_API_TIMEOUT || 30000),
})

// =============================
//  토큰 헬퍼
// =============================
const AT_KEY = 'accessToken'
const RT_KEY = 'refreshToken'

const getAT = () => localStorage.getItem(AT_KEY) || ''
const getRT = () => localStorage.getItem(RT_KEY) || ''

const setAT = (t) => localStorage.setItem(AT_KEY, t || '')
const setRT = (t) => (t ? localStorage.setItem(RT_KEY, t) : localStorage.removeItem(RT_KEY))

const clearTokens = () => {
  localStorage.removeItem(AT_KEY)
  localStorage.removeItem(RT_KEY)
}

// ApiResponse<T> 이든 T 이든 공통 처리
const unwrap = (res) => {
  const raw = res.data
  return raw && typeof raw === 'object' && 'data' in raw ? raw.data : raw
}

// =============================
//  요청 인터셉터: Authorization 주입
// =============================
api.interceptors.request.use(
  (config) => {
    const at = getAT()
    if (at) {
      config.headers.Authorization = `Bearer ${at}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// =============================
//  응답 인터셉터: 401 → refresh 처리
// =============================
let isRefreshing = false
let pendingRequests = []

const processQueue = (error, token = null) => {
  pendingRequests.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error)
    } else {
      resolve(token)
    }
  })
  pendingRequests = []
}

// 🔹 refresh 호출
const requestRefresh = async () => {
  const rt = getRT()
  if (!rt) {
    throw new Error('No refresh token')
  }

  // VITE_API_BASE_URL 에 이미 /api 가 들어있다고 가정 → 여기서는 /auth/refresh 만 사용
  const res = await api.post('/auth/refresh', { refreshToken: rt })

  const payload = unwrap(res) // AuthResponse 또는 ApiResponse<AuthResponse>.data

  if (!payload || !payload.accessToken) {
    throw new Error('Unexpected refresh response shape')
  }

  const { accessToken, refreshToken } = payload

  setAT(accessToken)
  if (refreshToken) setRT(refreshToken)

  return { accessToken }
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (!error.response) {
      return Promise.reject(error)
    }

    const { status, config } = error.response

    // 로그인/리프레시 요청 자체에서 401 나면 재시도 X
    const isAuthUrl =
      config?.url?.includes('/auth/login') ||
      config?.url?.includes('/auth/refresh') ||
      config?.url?.includes('/auth/oauth/google') ||
      config?.url?.includes('/auth/oauth/apple')

    if (status !== 401 || originalRequest._retry || isAuthUrl) {
      return Promise.reject(error)
    }

    originalRequest._retry = true

    // 이미 refresh 중이면 큐에 넣고 기다렸다가 재시도
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingRequests.push({
          resolve: (token) => {
            if (token) {
              originalRequest.headers.Authorization = `Bearer ${token}`
            }
            resolve(api(originalRequest))
          },
          reject,
        })
      })
    }

    isRefreshing = true

    try {
      const { accessToken } = await requestRefresh()

      processQueue(null, accessToken)

      originalRequest.headers.Authorization = `Bearer ${accessToken}`
      return api(originalRequest)
    } catch (refreshError) {
      // 🔥 refresh 실패: 토큰 모두 삭제 + 로그인 페이지로 이동
      processQueue(refreshError, null)
      clearTokens()
      console.error('axios refresh 실패', refreshError)

      // 여기서 SPA가 "멍" 때리지 않도록 강제로 로그인 페이지로 돌려보낸다.
      if (typeof window !== 'undefined') {
        // 라우트 경로는 프로젝트에 맞게 수정 가능
        if (window.location.pathname !== '/login') {
          window.location.href = '/login'
        }
      }

      // 호출 측에서 필요하면 에러를 캐치해서 따로 처리할 수 있게 그대로 reject
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  },
)

// =============================
//  앱 시작 시 사용할 bootstrapAuth
// =============================
// (선택) main-layout 진입 전에 토큰만 미리 한 번 정리해두고 싶을 때 사용
export const bootstrapAuth = async () => {
  const at = getAT()
  const rt = getRT()

  // 둘 다 없으면 아무 것도 안 함
  if (!at && !rt) return

  // AccessToken 이 없고 RefreshToken 만 있으면 미리 갱신 시도
  if (!at && rt) {
    try {
      await requestRefresh()
    } catch (e) {
      clearTokens()
      console.error('bootstrapAuth: 토큰 갱신 실패', e)
    }
  }
}

// =============================
//  Quasar boot 등록
// =============================
export default boot(({ app }) => {
  app.config.globalProperties.$axios = axios
  app.config.globalProperties.$api = api
})

// 로그아웃 등에서 쓸 수 있게 export
export { api, clearTokens }
