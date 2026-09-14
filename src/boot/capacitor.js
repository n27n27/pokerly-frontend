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

  const dismissKeyboardOutsideInput = (event) => {
    const activeElement = document.activeElement
    if (!activeElement?.matches?.('input, textarea, [contenteditable="true"]')) return
    if (
      event.target?.closest?.(
        'input, textarea, select, button, a, [contenteditable="true"], [role="button"], [role="option"], [role="menuitem"]',
      )
    )
      return
    activeElement.blur()
    Keyboard.hide().catch(() => {})
  }
  document.addEventListener('pointerdown', dismissKeyboardOutsideInput, true)

  const syncKeyboardContext = () => {
    const root = document.documentElement
    const isBottomSheetField = Boolean(document.activeElement?.closest?.('.q-dialog__inner--bottom'))
    root.classList.toggle('keyboard-in-bottom-sheet', isBottomSheetField)
  }

  await Keyboard.addListener('keyboardWillShow', () => {
    const root = document.documentElement
    root.classList.add('keyboard-visible')
    syncKeyboardContext()
    // iOS can emit keyboardWillShow before focus has left a just-closed sheet.
    // Re-evaluate after the focus transaction completes.
    window.requestAnimationFrame(() => {
      syncKeyboardContext()
    })
  })
  await Keyboard.addListener('keyboardWillHide', () => {
    const root = document.documentElement
    root.classList.remove('keyboard-visible')
    root.classList.remove('keyboard-in-bottom-sheet')
  })
  document.addEventListener('focusin', () => {
    if (!document.documentElement.classList.contains('keyboard-visible')) return
    syncKeyboardContext()
  })

  const syncStatusBarStyle = (path) => {
    const usesDarkBackground = !path.startsWith('/app')
    document.documentElement.classList.toggle('status-bar-dark-bg', usesDarkBackground)
    return StatusBar.setStyle({
      // Capacitor's Dark style means light status-bar content for dark pages.
      style: usesDarkBackground ? Style.Dark : Style.Light,
    }).catch(() => {})
  }

  await StatusBar.setOverlaysWebView({ overlay: true }).catch(() => {})
  await syncStatusBarStyle(router.currentRoute.value.path)
  router.afterEach((to) => syncStatusBarStyle(to.path))
  await SplashScreen.hide().catch(() => {})
})
