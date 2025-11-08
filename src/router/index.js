// src/router/index.js
import { route } from 'quasar/wrappers'
import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router'
import routes from './routes'
import { useAuthStore } from 'stores/auth' // 추가

export default route(function () {
  const createHistory =
    process.env.VUE_ROUTER_MODE === 'history' ? createWebHistory : createWebHashHistory

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    history: createHistory(process.env.VUE_ROUTER_BASE),
  })

  // ✅ 로그인 가드
  Router.beforeEach((to, _from, next) => {
    const auth = useAuthStore()
    const needsAuth = to.matched.some((r) => r.meta.requiresAuth)

    if (needsAuth && !auth.user) {
      next('/login')
    } else if ((to.path === '/login' || to.path === '/signup') && auth.user) {
      next('/ledger')
    } else {
      next()
    }
  })

  return Router
})
