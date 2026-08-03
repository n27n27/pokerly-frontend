import { boot } from 'quasar/wrappers'

export default boot(() => {
  const current = window.VERSION_HASH || 'dev'
  const stored = localStorage.getItem('APP_VERSION')

  if (stored !== current) {
    // 배포 버전이 바뀌어도 로그인과 진행 중 기록은 유지한다.
    // 인증 규격이 실제로 변경되는 경우에만 별도의 명시적 마이그레이션을 둔다.
    localStorage.setItem('APP_VERSION', current)
  }
})
