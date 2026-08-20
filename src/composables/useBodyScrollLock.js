import { onBeforeUnmount, watch } from 'vue'

let activeLocks = 0

const isMenuScroll = (target) => target instanceof Element
  && Boolean(target.closest('.stats-filter-menu, .tournament-venue-menu'))

const preventBackgroundScroll = (event) => {
  if (isMenuScroll(event.target)) return
  event.preventDefault()
}

const lockBody = () => {
  if (activeLocks++ > 0) return

  document.addEventListener('wheel', preventBackgroundScroll, { passive: false })
  document.addEventListener('touchmove', preventBackgroundScroll, { passive: false })
}

const unlockBody = () => {
  if (activeLocks === 0 || --activeLocks > 0) return

  document.removeEventListener('wheel', preventBackgroundScroll)
  document.removeEventListener('touchmove', preventBackgroundScroll)
}

export const useBodyScrollLock = (locked) => {
  let ownsLock = false

  watch(locked, (shouldLock) => {
    if (shouldLock === ownsLock) return
    ownsLock = shouldLock
    if (shouldLock) lockBody()
    else unlockBody()
  }, { immediate: true })

  onBeforeUnmount(() => {
    if (!ownsLock) return
    ownsLock = false
    unlockBody()
  })
}
