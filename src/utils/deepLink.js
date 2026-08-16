const ALLOWED_WEB_HOSTS = new Set(['pokerly.kr', 'www.pokerly.kr'])

const normalizePath = (path) => {
  if (!path || path === '/') return '/app/home'
  return path.startsWith('/') ? path : `/${path}`
}

export const routeFromDeepLink = (rawUrl) => {
  if (typeof rawUrl !== 'string' || rawUrl.length > 2048) return null

  try {
    const url = new URL(rawUrl)

    if (url.protocol === 'pokerly:') {
      const path = [url.hostname, url.pathname.replace(/^\/+/, '')].filter(Boolean).join('/')
      return `${normalizePath(path)}${url.search}${url.hash}`
    }

    if (url.protocol !== 'https:' || !ALLOWED_WEB_HOSTS.has(url.hostname)) return null

    const hashRoute = url.hash.startsWith('#/') ? url.hash.slice(1) : null
    return hashRoute || `${normalizePath(url.pathname)}${url.search}`
  } catch {
    return null
  }
}
