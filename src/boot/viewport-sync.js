import { boot } from 'quasar/wrappers'

const EDITABLE_SELECTOR = 'input, textarea, select, [contenteditable="true"]'
const KEYBOARD_THRESHOLD = 120

export default boot(() => {
  if (typeof window === 'undefined' || !window.visualViewport) return
  if (document.documentElement.classList.contains('is-native')) return

  const viewport = window.visualViewport
  const root = document.documentElement
  let baselineHeight = Math.max(window.innerHeight, viewport.height)
  let keyboardVisible = false
  let keyboardSettling = false
  let settleTimer = null

  const hasEditableFocus = () => document.activeElement?.matches?.(EDITABLE_SELECTOR) === true

  const resyncHitTesting = () => {
    const scrollLeft = window.scrollX
    const scrollTop = window.scrollY

    root.style.setProperty('--visual-viewport-height', `${viewport.height}px`)
    root.classList.add('viewport-resyncing')

    window.requestAnimationFrame(() => {
      window.dispatchEvent(new Event('resize'))
      window.scrollTo(scrollLeft, scrollTop)

      window.requestAnimationFrame(() => {
        root.classList.remove('viewport-resyncing')
      })
    })
  }

  const updateViewport = () => {
    const focused = hasEditableFocus()
    const heightDifference = baselineHeight - viewport.height
    const nextKeyboardVisible = focused && heightDifference > KEYBOARD_THRESHOLD

    if (!focused && viewport.height > baselineHeight - KEYBOARD_THRESHOLD) {
      baselineHeight = Math.max(baselineHeight, viewport.height, window.innerHeight)
    }

    root.style.setProperty('--visual-viewport-height', `${viewport.height}px`)
    root.classList.toggle('keyboard-visible', nextKeyboardVisible)

    if (keyboardVisible && !nextKeyboardVisible) keyboardSettling = true
    if (keyboardSettling && !nextKeyboardVisible) {
      window.clearTimeout(settleTimer)
      settleTimer = window.setTimeout(() => {
        keyboardSettling = false
        resyncHitTesting()
      }, 160)
    }
    keyboardVisible = nextKeyboardVisible
  }

  viewport.addEventListener('resize', updateViewport)
  viewport.addEventListener('scroll', updateViewport)
  window.addEventListener('focusin', updateViewport)
  window.addEventListener('focusout', updateViewport)
  window.addEventListener('pageshow', resyncHitTesting)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') resyncHitTesting()
  })

  updateViewport()
})
