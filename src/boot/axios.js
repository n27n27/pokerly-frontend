// src/boot/axios.js
import { boot } from 'quasar/wrappers'
import axios from 'axios'

// --- Axios 인스턴스 생성 ---
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: Number(import.meta.env.VITE_API_TIMEOUT || 10000),
})

// --- 토큰 헬퍼 ---
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

// --- 요청 인터셉터: Authorization 자동 주입 ---
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

// --- 응답 인터셉터: 401 시 자동 refresh ---
let isRefreshing = false
let pendingRequests = []

const processQueue = (error, token = null) => {
  pendingRequests.forEach((promise) => {
    if (error) {
      promise.reject(error)
    } else {
      promise.resolve(token)
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

  // ⚠️ baseURL 에 이미 /api 가 있으므로 여기서는 /auth/refresh 만!
  const res = await api.post('/auth/refresh', { refreshToken: rt })

  const payload = unwrap(res) // AuthResponse 또는 ApiResponse<AuthResponse>.data

  if (!payload || !payload.accessToken) {
    // 서버가 에러 형식으로 응답해서 data 없을 경우 방어
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

    if (!error.response) return Promise.reject(error)
    const { status } = error.response

    // 401 이 아니거나 이미 재시도한 요청이면 그대로 실패
    if (status !== 401 || originalRequest._retry) {
      return Promise.reject(error)
    }

    originalRequest._retry = true

    if (isRefreshing) {
      // 이미 refresh 중이면 큐에 넣고 기다렸다가 재시도
      return new Promise((resolve, reject) => {
        pendingRequests.push({
          resolve: (token) => {
            if (token) {
              originalRequest.headers.Authorization = `Bearer ${token}`
            }
            resolve(api(originalRequest))
          },
          reject: (err) => reject(err),
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
      processQueue(refreshError, null)
      clearTokens()
      console.error('axios refresh 실패', refreshError)
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  },
)

// --- 앱 시작 시 사용할 부트스트랩 함수 ---
export const bootstrapAuth = async () => {
  const at = getAT()
  const rt = getRT()

  // 둘 다 없으면 할 일 없음
  if (!at && !rt) return

  // AccessToken 이 없고 RefreshToken 만 있으면 미리 한 번 갱신 시도
  if (!at && rt) {
    try {
      await requestRefresh()
    } catch (e) {
      clearTokens()
      console.error('bootstrapAuth: 토큰 갱신 실패', e)
    }
  }
}

// --- Quasar boot 등록 ---
export default boot(({ app }) => {
  app.config.globalProperties.$axios = axios
  app.config.globalProperties.$api = api
})

export { api }
