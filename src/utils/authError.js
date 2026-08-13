const TERMINAL_REFRESH_STATUSES = new Set([400, 401, 403])

// Refresh token 자체가 거부된 경우에만 세션을 폐기한다.
// 네트워크 단절, 타임아웃, 서버 장애(5xx)는 다음 요청/앱 실행 때 다시 시도할 수 있다.
export const isTerminalRefreshError = (error) => {
  const status = Number(error?.response?.status)
  return TERMINAL_REFRESH_STATUSES.has(status)
}
