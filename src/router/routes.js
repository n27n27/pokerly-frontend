const routes = [
  // Auth 영역은 기존 유지
  {
    path: '/login',
    component: () => import('layouts/AuthLayout.vue'),
    children: [{ path: '', component: () => import('pages/LoginView.vue') }],
  },
  {
    path: '/legacy-login',
    component: () => import('layouts/AuthLayout.vue'),
    children: [{ path: '', component: () => import('pages/LegacyLoginView.vue') }],
  },
  {
    path: '/signup',
    component: () => import('layouts/AuthLayout.vue'),
    children: [{ path: '', component: () => import('pages/SignupView.vue') }],
  },
  {
    path: '/onboarding',
    component: () => import('layouts/AuthLayout.vue'),
    meta: { requiresAuth: true },
    children: [{ path: '', component: () => import('pages/OnboardingView.vue') }],
  },
  {
    path: '/link-social',
    component: () => import('layouts/AuthLayout.vue'),
    meta: { requiresAuth: true },
    children: [{ path: '', component: () => import('pages/LinkSocialView.vue') }],
  },

  { path: '/', redirect: '/login' },

  // V2 App Shell
  {
    path: '/app',
    component: () => import('layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    redirect: '/app/home',
    children: [
      {
        path: 'home',
        name: 'home',
        component: () => import('src/features/home/pages/HomePage.vue'),
      },
      {
        path: 'statistics',
        name: 'statistics',
        component: () => import('src/features/statistics/pages/StatisticsHomePage.vue'),
      },
      {
        path: 'tools',
        name: 'tools',
        component: () => import('src/features/tools/pages/ToolsPage.vue'),
      },
      {
        path: 'my',
        name: 'my',
        component: () => import('src/features/my/pages/MyPage.vue'),
      },
    ],
  },

  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
