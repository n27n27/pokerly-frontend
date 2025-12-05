import { boot } from 'quasar/wrappers'
import VueApexCharts from 'vue3-apexcharts'

export default boot(({ app }) => {
  app.component('ApexChart', VueApexCharts)

  // vue3-apexcharts가 언마운트 타이밍에 던지는 "Element not found" 에러 무시
  if (typeof window !== 'undefined') {
    window.addEventListener('unhandledrejection', (event) => {
      const reason = event.reason
      if (reason && reason.message === 'Element not found') {
        // 콘솔에 에러 안 찍히도록 기본 동작 막기
        event.preventDefault()
      }
    })
  }
})
