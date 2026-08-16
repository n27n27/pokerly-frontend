import { boot } from 'quasar/wrappers'
import { App } from '@capacitor/app'
import { Capacitor } from '@capacitor/core'
import { Keyboard } from '@capacitor/keyboard'
import { Network } from '@capacitor/network'
import { SplashScreen } from '@capacitor/splash-screen'
import { StatusBar, Style } from '@capacitor/status-bar'
import { routeFromDeepLink } from 'src/utils/deepLink'

const setConnectionState = (connected) => {
  document.documentElement.classList.toggle('is-offline', !connected)
  window.dispatchEvent(new CustomEvent('pokerly:network', { detail: { connected } }))
}

export default boot(async ({ router }) => {
  if (!Capacitor.isNativePlatform()) return

  document.documentElement.classList.add('is-native', `is-${Capacitor.getPlatform()}`)

  const openDeepLink = async (url) => {
    const route = routeFromDeepLink(url)
    if (route) await router.push(route).catch(() => {})
  }

  await App.addListener('appUrlOpen', ({ url }) => openDeepLink(url))
  await App.addListener('backButton', ({ canGoBack }) => {
    if (canGoBack && window.history.length > 1) {
      router.back()
      return
    }

    if (router.currentRoute.value.path !== '/app/home') {
      router.replace('/app/home')
      return
    }

    App.exitApp()
  })

  const initialUrl = await App.getLaunchUrl()
  if (initialUrl?.url) await openDeepLink(initialUrl.url)

  const initialNetwork = await Network.getStatus()
  setConnectionState(initialNetwork.connected)
  await Network.addListener('networkStatusChange', ({ connected }) => setConnectionState(connected))

  await Keyboard.addListener('keyboardWillShow', () =>
    document.documentElement.classList.add('keyboard-visible'),
  )
  await Keyboard.addListener('keyboardWillHide', () =>
    document.documentElement.classList.remove('keyboard-visible'),
  )

  await StatusBar.setOverlaysWebView({ overlay: true }).catch(() => {})
  await StatusBar.setStyle({ style: Style.Light }).catch(() => {})
  await SplashScreen.hide().catch(() => {})
})
