import { boot } from 'quasar/wrappers'
import VueApexCharts from 'vue3-apexcharts'

const LISTENER_KEY = Symbol.for('pokerly.apexcharts.unhandledrejection')
const handleUnhandledRejection = (event) => {
  const reason = event.reason
  if (reason && reason.message === 'Element not found') event.preventDefault()
}

export default boot(({ app }) => {
  app.component('ApexChart', VueApexCharts)

  // vue3-apexcharts가 언마운트 타이밍에 던지는 "Element not found" 에러 무시
  if (typeof window !== 'undefined' && !window[LISTENER_KEY]) {
    window[LISTENER_KEY] = handleUnhandledRejection
    window.addEventListener('unhandledrejection', handleUnhandledRejection)
  }
})

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    const listener = window[LISTENER_KEY]
    if (!listener) return
    window.removeEventListener('unhandledrejection', listener)
    delete window[LISTENER_KEY]
  })
}
