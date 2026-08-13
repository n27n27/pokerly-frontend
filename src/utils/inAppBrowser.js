export const isKakaoInAppBrowser = (userAgent = navigator.userAgent) =>
  /KAKAOTALK/i.test(userAgent)

export const openInSystemBrowser = (url = window.location.href) => {
  if (isKakaoInAppBrowser()) {
    window.location.href = `kakaotalk://web/openExternal?url=${encodeURIComponent(url)}`
    return
  }

  window.open(url, '_blank', 'noopener,noreferrer')
}
