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
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', redirect: '/ledger' },
      {
        path: 'ledger',
        component: () => import('pages/LedgerView.vue'),
        meta: { requiresAuth: true },
      },
    ],
  },

  // 🔹 404 페이지
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
