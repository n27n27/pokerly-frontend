import { onBeforeUnmount, watch } from 'vue'

let activeLocks = 0
let scrollY = 0
let bodyStyles = null
let htmlOverflow = ''

const lockBody = () => {
  if (activeLocks++ > 0) return

  scrollY = window.scrollY
  bodyStyles = {
    position: document.body.style.position,
    top: document.body.style.top,
    width: document.body.style.width,
    overflow: document.body.style.overflow,
  }
  htmlOverflow = document.documentElement.style.overflow

  document.documentElement.style.overflow = 'hidden'
  Object.assign(document.body.style, {
    position: 'fixed',
    top: `-${scrollY}px`,
    width: '100%',
    overflow: 'hidden',
  })
}

const unlockBody = () => {
  if (activeLocks === 0 || --activeLocks > 0) return

  document.documentElement.style.overflow = htmlOverflow
  Object.assign(document.body.style, bodyStyles)
  window.scrollTo(0, scrollY)
  bodyStyles = null
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
