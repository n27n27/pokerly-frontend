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
      // V2 이전 핸드 로그 URL을 새 토너먼트 화면으로 연결한다.
      {
        path: 'mypoker/hand-log',
        redirect: { name: 'tournament-list' },
      },
      {
        path: 'mypoker/hand-log/:eventId/levels/:levelId/hands/:handId',
        redirect: (to) => ({
          name: 'tournament-hand-detail',
          params: { levelName: to.params.levelId, handId: to.params.handId },
          query: { legacyEventId: to.params.eventId },
        }),
      },
      {
        path: 'mypoker/hand-log/:eventId/levels/:levelId',
        redirect: (to) => ({
          name: 'tournament-level-detail',
          params: { levelName: to.params.levelId },
          query: { legacyEventId: to.params.eventId, view: 'summary' },
        }),
      },
      {
        path: 'mypoker/hand-log/:eventId',
        redirect: (to) => ({
          name: 'tournament-summary',
          params: { tournamentId: `event-${to.params.eventId}` },
          query: { legacyEventId: to.params.eventId },
        }),
      },
      {
        path: 'home',
        name: 'home',
        component: () => import('src/features/home/pages/HomePage.vue'),
      },
      {
        path: 'simple-record',
        name: 'simple-record',
        meta: { hideHeader: true, disableBottomNavigation: true },
        component: () => import('src/features/home/pages/SimpleRecordPage.vue'),
      },
      {
        path: 'bank-records',
        name: 'bank-records',
        meta: { hideHeader: true },
        component: () => import('src/features/home/pages/BankRecordListPage.vue'),
      },
      {
        path: 'tournament/start',
        name: 'tournament-start',
        meta: { hideHeader: true },
        component: () => import('src/features/tournament/pages/TournamentStartPage.vue'),
      },
      {
        path: 'tournaments',
        name: 'tournament-list',
        meta: { hideHeader: true },
        component: () => import('src/features/tournament/pages/TournamentListPage.vue'),
      },
      {
        path: 'tournament/create',
        name: 'tournament-create',
        meta: { hideHeader: true, disableBottomNavigation: true },
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
        meta: { hideHeader: true, disableBottomNavigation: true },
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
        path: 'tournament/:tournamentId/stats/position/:position',
        name: 'tournament-position-stats',
        meta: { hideHeader: true },
        component: () => import('src/features/tournament/pages/TournamentPositionStatsPage.vue'),
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
        path: 'tournament/running/manage',
        name: 'tournament-manage',
        meta: { hideHeader: true },
        component: () => import('src/features/tournament/pages/TournamentManagePage.vue'),
      },
      {
        path: 'tournament/running/finish',
        name: 'tournament-finish',
        meta: { hideHeader: true, disableBottomNavigation: true },
        component: () => import('src/features/tournament/pages/TournamentFinishPage.vue'),
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
        meta: { hideHeader: true, disableBottomNavigation: true },
        component: () => import('src/features/tournament/pages/TournamentHandRecordPage.vue'),
      },
      {
        path: 'tournament/running/level/:levelName/hand/:handId/edit',
        name: 'tournament-hand-edit',
        meta: { hideHeader: true, disableBottomNavigation: true },
        component: () => import('src/features/tournament/pages/TournamentHandRecordPage.vue'),
      },
      {
        path: 'tournament/running/level/:levelName/hand/:handId/review',
        name: 'tournament-hand-review-edit',
        meta: { hideHeader: true, disableBottomNavigation: true },
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
        path: 'statistics/position/:position',
        name: 'statistics-position-detail',
        meta: { hideHeader: true },
        component: () => import('src/features/statistics/pages/StatisticsPositionDetailPage.vue'),
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
        path: 'tools/basic-probabilities',
        name: 'basic-probabilities',
        meta: { hideHeader: true },
        component: () => import('src/features/tools/pages/BasicProbabilityPage.vue'),
      },
      {
        path: 'my',
        name: 'my',
        meta: { hideHeader: true },
        component: () => import('src/features/my/pages/MyPage.vue'),
      },
      {
        path: 'my/feedback',
        name: 'my-feedback',
        meta: { hideHeader: true },
        component: () => import('src/pages/support/FeedbackView.vue'),
      },
      {
        path: 'my/account',
        name: 'my-account',
        meta: { hideHeader: true },
        component: () => import('src/features/my/pages/MyAccountPage.vue'),
      },
      {
        path: 'my/saved-data',
        name: 'my-saved-data',
        meta: { hideHeader: true },
        component: () => import('src/features/my/pages/SavedDataManagementPage.vue'),
      },
      {
        path: 'my/document/opensource',
        name: 'my-open-source-licenses',
        meta: { hideHeader: true },
        component: () => import('src/features/my/pages/MyDocumentPage.vue'),
      },
      {
        path: 'my/document/:documentType',
        name: 'my-policy-document',
        meta: { hideHeader: true },
        component: () => import('src/features/my/pages/PolicyDocumentPage.vue'),
      },
    ],
  },

  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
