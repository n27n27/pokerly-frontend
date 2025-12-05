import { route } from 'quasar/wrappers'
import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router'
import routes from './routes'
import { useAuthStore } from 'stores/auth'
import { bootstrapAuth } from 'boot/axios'

// 🔹 refresh 토큰 기반 부트스트랩은 한 번만 실행
let authBootstrapped = false

export default route(function () {
  const createHistory =
    process.env.VUE_ROUTER_MODE === 'history' ? createWebHistory : createWebHashHistory

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    history: createHistory(process.env.VUE_ROUTER_BASE),
  })

  // ✅ 로그인/권한 가드
  Router.beforeEach(async (to, _from, next) => {
    const auth = useAuthStore()

    const needsAuth = to.matched.some((r) => r.meta?.requiresAuth)
    const requiredRole = to.matched.find((r) => r.meta?.role)?.meta?.role

    // 🔸 A. 로그인/회원가입 페이지로 가는 경우는 최대한 건드리지 않기
    if (to.path === '/login' || to.path === '/signup') {
      // 이미 로그인 돼 있으면 앱 메인으로 보냄
      if (auth.user) {
        return next('/app')
      }
      // 비로그인 상태면 그대로 통과
      return next()
    }

    // 🔸 B. 인증 필요한 페이지에 처음 접근 시 refresh 기반 부트스트랩 (한 번만)
    if (needsAuth && !authBootstrapped) {
      authBootstrapped = true
      try {
        await bootstrapAuth()
      } catch (e) {
        console.error('bootstrapAuth 실패', e)
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
      }
    }

    // 🔸 C. 인증 필요한 페이지인데 user가 비어 있고, 로컬에 accessToken 이 있으면 /me 로 복구 시도
    if (needsAuth && !auth.user) {
      const at = localStorage.getItem('accessToken')
      if (at) {
        try {
          await auth.fetchMe()
        } catch (_error) {
          console.error('fetchMe 실패', _error)
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
        }
      }
    }

    // 🔸 D. 인증이 필요한데 여전히 로그인 안 됨 → /login으로
    if (needsAuth && !auth.user) {
      return next({ path: '/login', query: { redirect: to.fullPath } })
    }

    // 🔸 E. 역할 가드: meta.role 이 있고 불일치하면 홈으로
    if (requiredRole && auth.user && auth.user.role !== requiredRole) {
      return next('/')
    }

    // 통과
    return next()
  })

  return Router
})
