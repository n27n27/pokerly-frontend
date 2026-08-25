import { api } from 'boot/axios'

const CACHE_TTL_MS = 2 * 60 * 1000
const MAX_CACHE_ENTRIES = 100
const MAX_CONCURRENT_REQUESTS = 4

const cache = new Map()
const inFlight = new Map()
const queue = []
let activeRequests = 0

const abortError = () => new DOMException('The operation was aborted', 'AbortError')

const pruneCache = () => {
  const now = Date.now()
  for (const [key, entry] of cache) {
    if (entry.expiresAt <= now) cache.delete(key)
  }
  while (cache.size > MAX_CACHE_ENTRIES) cache.delete(cache.keys().next().value)
}

const readCache = (key) => {
  const entry = cache.get(key)
  if (!entry) return undefined
  if (entry.expiresAt <= Date.now()) {
    cache.delete(key)
    return undefined
  }
  cache.delete(key)
  cache.set(key, entry)
  return entry.value
}

const runNext = () => {
  while (activeRequests < MAX_CONCURRENT_REQUESTS && queue.length) {
    const task = queue.shift()
    if (task.controller.signal.aborted) {
      task.reject(abortError())
      continue
    }
    activeRequests += 1
    task.run().then(task.resolve, task.reject).finally(() => {
      activeRequests -= 1
      runNext()
    })
  }
}

const schedule = (run, controller) => new Promise((resolve, reject) => {
  queue.push({ run, controller, resolve, reject })
  runNext()
})

const createRequest = (key) => {
  const controller = new AbortController()
  const request = {
    controller,
    consumers: new Set(),
    settled: false,
    promise: null,
  }
  request.promise = schedule(async () => {
    const response = await api.get(`/hand-log/events/${key}`, { signal: controller.signal })
    const value = response.data.data
    cache.set(key, { value, expiresAt: Date.now() + CACHE_TTL_MS })
    pruneCache()
    return value
  }, controller).finally(() => {
    request.settled = true
    if (inFlight.get(key) === request) inFlight.delete(key)
  })
  // A consumer may abort before another consumer attaches. Keep rejection handled.
  request.promise.catch(() => {})
  inFlight.set(key, request)
  return request
}

const subscribe = (request, signal) => new Promise((resolve, reject) => {
  if (signal?.aborted) {
    reject(abortError())
    return
  }

  const consumer = {}
  request.consumers.add(consumer)
  const cleanup = () => {
    signal?.removeEventListener('abort', onAbort)
    request.consumers.delete(consumer)
  }
  const onAbort = () => {
    cleanup()
    if (!request.settled && request.consumers.size === 0) request.controller.abort()
    reject(abortError())
  }
  signal?.addEventListener('abort', onAbort, { once: true })
  request.promise.then(
    (value) => {
      cleanup()
      resolve(value)
    },
    (error) => {
      cleanup()
      reject(error)
    },
  )
})

export const getStatisticsEvent = (eventId, { signal, force = false } = {}) => {
  const key = String(eventId)
  if (!force) {
    const cached = readCache(key)
    if (cached !== undefined) return Promise.resolve(cached)
  }
  const existingRequest = inFlight.get(key)
  return subscribe(
    existingRequest && !existingRequest.controller.signal.aborted
      ? existingRequest
      : createRequest(key),
    signal,
  )
}

export const getStatisticsEvents = (eventIds, { signal } = {}) =>
  Promise.all([...new Set(eventIds.filter(Boolean).map(String))].map((eventId) =>
    getStatisticsEvent(eventId, { signal }).catch((error) => {
      if (error?.name === 'AbortError') throw error
      return null
    })))

export const invalidateStatisticsEvent = (eventId) => {
  if (eventId != null) cache.delete(String(eventId))
}

export const clearStatisticsEventCache = () => cache.clear()

export const statisticsEventRepositoryConfig = Object.freeze({
  cacheTtlMs: CACHE_TTL_MS,
  maxCacheEntries: MAX_CACHE_ENTRIES,
  maxConcurrentRequests: MAX_CONCURRENT_REQUESTS,
})
