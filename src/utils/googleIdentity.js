const GOOGLE_SCRIPT_URL = 'https://accounts.google.com/gsi/client'
const LOAD_TIMEOUT_MS = 10000

let loadingPromise = null

const appendGoogleScript = () =>
  new Promise((resolve, reject) => {
    const staleScript = document.querySelector(`script[src^="${GOOGLE_SCRIPT_URL}"]`)
    staleScript?.remove()

    const script = document.createElement('script')
    const timeoutId = window.setTimeout(() => {
      script.remove()
      reject(new Error('Google Identity Services script load timed out'))
    }, LOAD_TIMEOUT_MS)

    const finish = (callback) => {
      window.clearTimeout(timeoutId)
      callback()
    }

    script.src = GOOGLE_SCRIPT_URL
    script.async = true
    script.defer = true
    script.onload = () => {
      if (window.google?.accounts?.id) {
        finish(resolve)
      } else {
        finish(() => reject(new Error('Google Identity Services is unavailable')))
      }
    }
    script.onerror = () => finish(() => reject(new Error('Google Identity Services script failed')))
    document.head.appendChild(script)
  })

export const loadGoogleIdentity = () => {
  if (window.google?.accounts?.id) return Promise.resolve()

  if (!loadingPromise) {
    loadingPromise = appendGoogleScript().catch((error) => {
      loadingPromise = null
      throw error
    })
  }

  return loadingPromise
}
