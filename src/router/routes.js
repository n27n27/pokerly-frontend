const routes = [
  // 🔹 공개 페이지 (AuthLayout 사용)
  {
    path: '/login',
    component: () => import('layouts/AuthLayout.vue'),
    children: [{ path: '', component: () => import('pages/LoginView.vue') }],
  },
  {
    path: '/signup',
    component: () => import('layouts/AuthLayout.vue'),
    children: [{ path: '', component: () => import('pages/SignupView.vue') }],
  },

  // 🔹 인증 필요한 페이지 (MainLayout 사용)
  {
    path: '/app',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: 'dashboard',
        component: () => import('pages/DashboardPage.vue'),
        meta: { requiresAuth: true },
      },

      // My Poker
      {
        path: 'mypoker/ledger',
        component: () => import('pages/MyPokerLedgerPage.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'mypoker/hand-review',
        component: () => import('pages/MyPokerHandReviewPage.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'mypoker/journal',
        component: () => import('pages/MyPokerJournalPage.vue'),
        meta: { requiresAuth: true },
      },

      // Statistics
      {
        path: 'statistics/month',
        component: () => import('pages/StatisticsMonthlyPage.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'statistics/session',
        component: () => import('pages/StatisticsSessionPage.vue'),
        meta: { requiresAuth: true },
      },

      // Venues
      {
        path: 'venues/list',
        component: () => import('pages/VenuesListPage.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'venues/points',
        component: () => import('pages/VenuesPointsPage.vue'),
        meta: { requiresAuth: true },
      },

      // 기본 /app 진입 시 대시보드로 리다이렉트
      { path: '', redirect: '/app/dashboard' },
    ],
  },

  // 🔹 404 페이지
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
