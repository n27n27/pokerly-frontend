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

  { path: '/', redirect: '/login' },

  // 🔹 인증 필요한 페이지 (MainLayout 사용)
  {
    path: '/app',
    component: () => import('layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    redirect: '/app/dashboard',
    children: [
      { path: 'dashboard', component: () => import('pages/DashboardPage.vue') },

      // My Poker
      { path: 'mypoker/ledger', component: () => import('pages/MyPokerLedgerPage.vue') },
      { path: 'mypoker/hand-review', component: () => import('pages/MyPokerHandReviewPage.vue') },
      { path: 'mypoker/journal', component: () => import('pages/MyPokerJournalPage.vue') },

      // Statistics
      { path: 'statistics/month', component: () => import('pages/StatisticsMonthlyPage.vue') },
      { path: 'statistics/session', component: () => import('pages/StatisticsSessionPage.vue') },

      // Venues
      { path: 'venues/list', component: () => import('pages/VenueListPage.vue') },
      { path: 'venues/:id', component: () => import('pages/VenueDetailPage.vue') },
    ],
  },

  // 🔹 404 페이지
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
