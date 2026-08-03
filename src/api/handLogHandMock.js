const STORAGE_KEY = 'pokerly-hand-log-mock-hands-v1'

export const handLogMockEnabled =
  import.meta.env.DEV && import.meta.env.VITE_HAND_LOG_USE_API !== 'true'

const keyOf = (eventId, blindLevelId, handId) =>
  `${String(eventId)}:${String(blindLevelId)}:${String(handId)}`

const readState = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { hands: {}, deleted: [] }
  } catch {
    return { hands: {}, deleted: [] }
  }
}

const writeState = (state) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export const findMockHand = (eventId, blindLevelId, handId) => {
  const state = readState()
  return state.hands[keyOf(eventId, blindLevelId, handId)] || null
}

export const saveMockHand = (eventId, blindLevelId, hand) => {
  const state = readState()
  const now = new Date().toISOString()
  const saved = {
    ...hand,
    id: hand.id || `mock-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    eventId,
    blindLevelId,
    createdAt: hand.createdAt || now,
    updatedAt: now,
  }
  const key = keyOf(eventId, blindLevelId, saved.id)
  state.hands[key] = saved
  state.deleted = state.deleted.filter((item) => item !== key)
  writeState(state)
  return saved
}

export const removeMockHand = (eventId, blindLevelId, handId) => {
  const state = readState()
  const key = keyOf(eventId, blindLevelId, handId)
  delete state.hands[key]
  if (!state.deleted.includes(key)) state.deleted.push(key)
  writeState(state)
  return true
}

export const mergeMockHands = (eventId, blindLevelId, hands = []) => {
  if (!handLogMockEnabled) return hands

  const state = readState()
  const prefix = `${String(eventId)}:${String(blindLevelId)}:`
  const merged = new Map(
    hands
      .filter((hand) => !state.deleted.includes(keyOf(eventId, blindLevelId, hand.id)))
      .map((hand) => [String(hand.id), hand]),
  )

  Object.entries(state.hands).forEach(([key, hand]) => {
    if (key.startsWith(prefix)) merged.set(String(hand.id), hand)
  })

  return [...merged.values()].sort((a, b) =>
    String(a.createdAt || '').localeCompare(String(b.createdAt || '')),
  )
}

export const mergeMockLevel = (eventId, level) => {
  if (!level || !handLogMockEnabled) return level
  const hands = mergeMockHands(eventId, level.id, level.hands || [])
  const state = readState()
  const prefix = `${String(eventId)}:${String(level.id)}:`
  const hasLocalChanges =
    Object.keys(state.hands).some((key) => key.startsWith(prefix)) ||
    state.deleted.some((key) => key.startsWith(prefix))

  if (!Array.isArray(level.hands) && !hasLocalChanges) return level

  return {
    ...level,
    hands,
    handCount: hands.length,
    reviewRequiredCount: hands.filter((hand) => hand.reviewRequired).length,
  }
}

export const mergeMockEvent = (event) => {
  if (!event || !handLogMockEnabled) return event
  const blindLevels = (event.blindLevels || []).map((level) => mergeMockLevel(event.id, level))
  return {
    ...event,
    blindLevels,
    handCount: blindLevels.reduce(
      (sum, level) => sum + (level.handCount ?? level.hands?.length ?? 0),
      0,
    ),
    reviewRequiredCount: blindLevels.reduce(
      (sum, level) =>
        sum +
        (level.reviewRequiredCount ??
          level.hands?.filter((hand) => hand.reviewRequired).length ??
          0),
      0,
    ),
  }
}
