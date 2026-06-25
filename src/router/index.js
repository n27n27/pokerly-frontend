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

  Router.beforeEach(async (to, _from, next) => {
    const auth = useAuthStore()

    const needsAuth = to.matched.some((r) => r.meta?.requiresAuth)
    const requiredRole = to.matched.find((r) => r.meta?.role)?.meta?.role

    // 🔸 A. 로그인 / 회원가입 라우트: 여기서도 "토큰 있으면 자동 로그인"을 한 번 시도
    if (to.path === '/login' || to.path === '/signup') {
      // 이미 로그인 상태라면 바로 /app 으로
      if (auth.user) {
        return next('/app')
      }

      const hasAccessToken = !!localStorage.getItem('accessToken')
      const hasRefreshToken = !!localStorage.getItem('refreshToken')

      // 토큰이 있고 아직 부트스트랩 안 했으면 한 번만 시도
      if ((hasAccessToken || hasRefreshToken) && !authBootstrapped) {
        authBootstrapped = true
        try {
          // 1) refresh 기반 부트스트랩 (accessToken 재발급 등)
          await bootstrapAuth()
        } catch (e) {
          console.error('bootstrapAuth 실패', e)
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
        }

        // 2) 그래도 user가 비어 있고 accessToken 이 남아 있으면 /me 로 복구 시도
        if (!auth.user) {
          const at = localStorage.getItem('accessToken')
          if (at) {
            try {
              await auth.fetchMe()
            } catch (e) {
              console.error('fetchMe 실패(로그인 라우트)', e)
              localStorage.removeItem('accessToken')
              localStorage.removeItem('refreshToken')
            }
          }
        }
      }

      // 부트스트랩/복구 후 user 가 채워졌으면 /app 으로
      if (auth.user) {
        return next('/app')
      }

      // 아니면 로그인 페이지 그대로 보여줌
      return next()
    }

    // 🔸 B. 인증 필요한 페이지에 처음 접근 시, refresh 기반 부트스트랩 (한 번만)
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

    // 🔸 C. 인증 필요한 페이지이고 user 비어있고, 로컬에 accessToken 있으면 /me 로 복구 시도
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

    // 🔸 D. 인증이 필요한데 여전히 로그인 안 됨 → /login 으로
    if (needsAuth && !auth.user) {
      return next({ path: '/login', query: { redirect: to.fullPath } })
    }

    // 🔸 D-1. 소셜 미연동 기존 계정은 /link-social 강제
    if (
      auth.user &&
      auth.user.socialLinked === false &&
      to.path !== '/link-social' &&
      to.path !== '/login'
    ) {
      return next('/link-social')
    }

    // 🔸 D-2. 백엔드가 온보딩 필요하다고 판단한 경우만 /onboarding 강제
    if (auth.user && auth.user.onboardingRequired === true && to.path !== '/onboarding') {
      return next('/onboarding')
    }

    // 🔸 D-3. 이미 소셜 연결된 사용자는 /link-social 접근 방지
    if (auth.user && auth.user.socialLinked === true && to.path === '/link-social') {
      return next('/app/dashboard')
    }

    // 🔸 E. 역할 가드
    if (requiredRole && auth.user && auth.user.role !== requiredRole) {
      return next('/')
    }

    // 통과
    return next()
  })

  return Router
})
