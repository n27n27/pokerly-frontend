// src/router/index.js
import { route } from 'quasar/wrappers'
import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router'
import routes from './routes'
import { useAuthStore } from 'stores/auth'

export default route(function () {
  const createHistory =
    process.env.VUE_ROUTER_MODE === 'history' ? createWebHistory : createWebHashHistory

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    history: createHistory(process.env.VUE_ROUTER_BASE),
  })

  // ✅ 로그인/권한 가드 (새로고침 복구 + requiresAuth + role)
  Router.beforeEach(async (to, _from, next) => {
    const auth = useAuthStore()

    // 1) 새로고침 후 user 비어있지만 accessToken이 있으면 /me로 복구 시도
    if (!auth.user) {
      const at = localStorage.getItem('accessToken')
      if (at) {
        try {
          await auth.fetchMe() // 실패시 무시하고 진행
        } catch (_error) {
          console.error('fetchMe 실패', _error)
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
        }
      }
    }

    const needsAuth = to.matched.some((r) => r.meta?.requiresAuth)
    const requiredRole = to.matched.find((r) => r.meta?.role)?.meta?.role

    // 2) 인증이 필요한데 로그인 안됨 → /login 로 리다이렉트 (+원래 가려던 경로)
    if (needsAuth && !auth.user) {
      return next({ path: '/login', query: { redirect: to.fullPath } })
    }

    // 3) 이미 로그인했는데 /login 또는 /signup 접근 → /ledger로 보냄
    if ((to.path === '/login' || to.path === '/signup') && auth.user) {
      return next('/ledger')
    }

    // 4) 역할 가드: meta.role 이 있고 불일치하면 홈으로
    if (requiredRole && auth.user && auth.user.role !== requiredRole) {
      return next('/')
    }

    // 통과
    return next()
  })

  return Router
})
