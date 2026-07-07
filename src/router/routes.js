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
        path: 'tournament/start',
        name: 'tournament-start',
        meta: { hideHeader: true },
        component: () => import('src/features/tournament/pages/TournamentStartPage.vue'),
      },
      {
        path: 'tournament/create',
        name: 'tournament-create',
        meta: { hideHeader: true },
        component: () => import('src/features/tournament/pages/TournamentCreatePage.vue'),
      },
      {
        path: 'tournament/presets',
        name: 'tournament-presets',
        meta: { hideHeader: true },
        component: () => import('src/features/tournament/pages/TournamentPresetPage.vue'),
      },
      {
        path: 'tournament/start/setup',
        name: 'tournament-start-setup',
        meta: { hideHeader: true },
        component: () => import('src/features/tournament/pages/TournamentStartSetupPage.vue'),
      },
      {
        path: 'tournament/:tournamentId/summary',
        name: 'tournament-summary',
        meta: { hideHeader: true },
        component: () => import('src/features/tournament/pages/TournamentSummaryPage.vue'),
      },
      {
        path: 'tournament/:tournamentId/review-hands',
        name: 'tournament-review-hands',
        meta: { hideHeader: true },
        component: () => import('src/features/tournament/pages/TournamentReviewHandsPage.vue'),
      },
      {
        path: 'tournament/:tournamentId/stats/:statType',
        name: 'tournament-stats',
        meta: { hideHeader: true },
        component: () => import('src/features/tournament/pages/TournamentStatsPage.vue'),
      },
      {
        path: 'tournament/running',
        name: 'tournament-running',
        meta: { hideHeader: true },
        component: () => import('src/features/tournament/pages/TournamentRunningPage.vue'),
      },
      {
        path: 'tournament/running/level/:levelName',
        name: 'tournament-level-detail',
        meta: { hideHeader: true },
        component: () => import('src/features/tournament/pages/TournamentLevelDetailPage.vue'),
      },
      {
        path: 'tournament/running/level/:levelName/hand/new',
        name: 'tournament-hand-record',
        meta: { hideHeader: true },
        component: () => import('src/features/tournament/pages/TournamentHandRecordPage.vue'),
      },
      {
        path: 'tournament/running/level/:levelName/hand/:handId/edit',
        name: 'tournament-hand-edit',
        meta: { hideHeader: true },
        component: () => import('src/features/tournament/pages/TournamentHandEditPage.vue'),
      },
      {
        path: 'tournament/running/level/:levelName/hand/:handId',
        name: 'tournament-hand-detail',
        meta: { hideHeader: true },
        component: () => import('src/features/tournament/pages/TournamentHandDetailPage.vue'),
      },
      {
        path: 'statistics',
        name: 'statistics',
        meta: { hideHeader: true },
        component: () => import('src/features/statistics/pages/StatisticsHomePage.vue'),
      },
      {
        path: 'statistics/position',
        name: 'statistics-position',
        meta: { hideHeader: true },
        component: () => import('src/features/statistics/pages/StatisticsPositionPage.vue'),
      },
      {
        path: 'statistics/hands',
        name: 'statistics-hands',
        meta: { hideHeader: true },
        component: () => import('src/features/statistics/pages/StatisticsHandPage.vue'),
      },
      {
        path: 'tools',
        name: 'tools',
        meta: { hideHeader: true },
        component: () => import('src/features/tools/pages/ToolsPage.vue'),
      },
      {
        path: 'tools/preflop-chart',
        name: 'preflop-chart',
        meta: { hideHeader: true },
        component: () => import('src/features/tools/pages/PreflopChartPage.vue'),
      },
      {
        path: 'tools/equity-calculator',
        name: 'equity-calculator',
        meta: { hideHeader: true },
        component: () => import('src/features/tools/pages/EquityCalculatorPage.vue'),
      },
      {
        path: 'tools/pot-odds-calculator',
        name: 'pot-odds-calculator',
        meta: { hideHeader: true },
        component: () => import('src/features/tools/pages/PotOddsCalculatorPage.vue'),
      },
      {
        path: 'tools/icm-calculator',
        name: 'icm-calculator',
        meta: { hideHeader: true },
        component: () => import('src/features/tools/pages/IcmCalculatorPage.vue'),
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
