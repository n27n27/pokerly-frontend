import { boot } from 'quasar/wrappers'
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: Number(import.meta.env.VITE_API_TIMEOUT || 10000),
})

// --- Access/Refresh 토큰 헬퍼 ---
// localStorage에는 "순수 accessToken"만 저장 (Bearer 붙여 저장하지 않음)
const getAT = () => localStorage.getItem('accessToken') || ''
const getRT = () => localStorage.getItem('refreshToken') || ''
const setAT = (t) => localStorage.setItem('accessToken', t || '')
const setRT = (t) =>
  t ? localStorage.setItem('refreshToken', t) : localStorage.removeItem('refreshToken')
const clearTokens = () => {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
}

// --- 요청 인터셉터: Authorization 자동 주입 ---
api.interceptors.request.use((config) => {
  const at = getAT()
  if (at) {
    config.headers.Authorization = `Bearer ${at}`
  }
  return config
})

// --- 응답 인터셉터: 401 처리(단일 refresh 큐) ---
let isRefreshing = false
let pendingQueue = []

async function callRefresh() {
  const rt = getRT()
  if (!rt) throw new Error('No refresh token')

  // 백엔드 스펙에 맞춰 경로/바디 수정
  const resp = await axios.post(
    `${import.meta.env.VITE_API_BASE_URL}/auth/refresh`,
    { refreshToken: rt },
    { timeout: Number(import.meta.env.VITE_API_TIMEOUT || 10000) },
  )
  return resp.data // { accessToken, refreshToken? }
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const { response, config } = error

    // 로그인, 회원가입 요청은 refresh 시도하지 않음
    if (config.url.includes('/auth/login') || config.url.includes('/users/register')) {
      return Promise.reject(error)
    }
    if (!response) return Promise.reject(error)

    // 다른 에러는 통과
    if (response.status !== 401 || config._retry) {
      return Promise.reject(error)
    }

    // 401 최초 1회만 refresh
    config._retry = true

    if (isRefreshing) {
      // refresh 중이면 큐에 넣고 refresh 완료 후 재시도
      return new Promise((resolve, reject) => {
        pendingQueue.push({ resolve, reject, config })
      })
    }

    isRefreshing = true
    try {
      const data = await callRefresh()
      if (data?.accessToken) setAT(data.accessToken)
      if (data?.refreshToken) setRT(data.refreshToken)

      // 대기중 모두 재시도
      pendingQueue.forEach(({ resolve }) => resolve(api(config)))
      pendingQueue = []
      return api(config)
    } catch (e) {
      // 모두 실패 처리 & 토큰 제거
      pendingQueue.forEach(({ reject }) => reject(e))
      pendingQueue = []
      clearTokens()
      return Promise.reject(e)
    } finally {
      isRefreshing = false
    }
  },
)

export default boot(({ app }) => {
  // Options API 에서 this.$axios / this.$api 사용 가능
  app.config.globalProperties.$axios = axios
  app.config.globalProperties.$api = api
})

// Composition API에서 import해 쓰기 위함
export { api }
