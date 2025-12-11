import { boot } from 'quasar/wrappers'

export default boot(() => {
  const current = window.VERSION_HASH || 'dev'

  const stored = localStorage.getItem('APP_VERSION')

  if (stored !== current) {
    localStorage.clear()
    sessionStorage.clear()
    localStorage.setItem('APP_VERSION', current)
    window.location.reload()
  }
})
