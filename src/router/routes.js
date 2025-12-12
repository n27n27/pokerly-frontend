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
      // Dashboard
      { path: 'dashboard', component: () => import('pages/DashboardPage.vue') },

      // -------------------------------------------------
      // My Poker
      // -------------------------------------------------
      { path: 'mypoker/ledger', component: () => import('pages/MyPokerLedgerPage.vue') },
      { path: 'mypoker/hand-review', component: () => import('pages/MyPokerHandReviewPage.vue') },
      { path: 'mypoker/journal', component: () => import('pages/MyPokerJournalPage.vue') },

      // -------------------------------------------------
      // Statistics
      // -------------------------------------------------
      { path: 'statistics/month', component: () => import('pages/statistics/MonthlyPage.vue') },
      { path: 'statistics/session', component: () => import('pages/statistics/SessionPage.vue') },
      {
        path: 'statistics/venue',
        component: () => import('pages/statistics/VenueStatsPage.vue'),
      },

      // -------------------------------------------------
      // Tools (도구)
      // -------------------------------------------------
      { path: 'tools/call-ev', component: () => import('pages/tools/CallEVPage.vue') },
      {
        path: 'tools/tournament-ev',
        component: () => import('pages/tools/TournamentEVPage.vue'),
      },
      {
        path: 'tools/reentry-ev',
        component: () => import('pages/tools/ReEntryEVPage.vue'),
      },
      { path: 'tools/iso-3bet', component: () => import('pages/tools/Iso3BetPage.vue') },
      { path: 'tools/icm', component: () => import('pages/tools/ICMCalculatorPage.vue') },
      { path: 'tools/spr', component: () => import('pages/tools/SPRCalculatorPage.vue') },
      {
        path: 'tools/implied-odds',
        component: () => import('pages/tools/ImpliedOddsPage.vue'),
      },

      // -------------------------------------------------
      // Venues
      // -------------------------------------------------
      { path: 'venues/list', component: () => import('pages/VenueListPage.vue') },
      { path: 'venues/:id', component: () => import('pages/VenueDetailPage.vue') },

      // -------------------------------------------------
      // feedback
      // -------------------------------------------------
      {
        path: 'support/feedback',
        component: () => import('pages/support/FeedbackView.vue'),
      },
    ],
  },

  // 🔹 404
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
