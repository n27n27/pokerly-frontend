import { computed, reactive, ref } from 'vue'

const STREETS = ['PREFLOP', 'FLOP', 'TURN', 'RIVER']
const PREFLOP_ORDER = ['UTG', 'UTG+1', 'UTG+2', 'MP', 'LJ', 'HJ', 'CO', 'BTN', 'SB', 'BB']
const POSTFLOP_ORDER = ['SB', 'BB', 'UTG', 'UTG+1', 'UTG+2', 'MP', 'LJ', 'HJ', 'CO', 'BTN']

const ordered = (players, street) => {
  const order = street === 'PREFLOP' ? PREFLOP_ORDER : POSTFLOP_ORDER
  return order.filter((position) => players.includes(position))
}

export const useHandActionTimeline = ({ bigBlind = 0, ante = 0 } = {}) => {
  const started = ref(false)
  const street = ref('PREFLOP')
  const trackedPlayers = ref([])
  const alivePlayers = ref([])
  const pendingPlayers = ref([])
  const currentBet = ref(Number(bigBlind) || 0)
  const lastRaiseSize = ref(Number(bigBlind) || 0)
  const lastAggressor = ref('')
  const potSize = ref(0)
  const actions = ref([])
  const history = ref([])
  const contributions = reactive({})

  const currentPlayer = computed(() => pendingPlayers.value[0] || '')
  const streetComplete = computed(
    () => started.value && (pendingPlayers.value.length === 0 || alivePlayers.value.length <= 1),
  )
  const handComplete = computed(
    () => alivePlayers.value.length <= 1 || (street.value === 'RIVER' && streetComplete.value),
  )
  const showdownRequired = computed(() => {
    if (street.value !== 'RIVER' || !streetComplete.value || alivePlayers.value.length < 2) {
      return false
    }
    const riverActions = actions.value.filter((action) => action.street === 'RIVER')
    const aggressionIndex = riverActions.findLastIndex((action) =>
      ['BET', 'RAISE'].includes(action.type),
    )
    return (
      aggressionIndex >= 0 &&
      riverActions.slice(aggressionIndex + 1).some((action) => action.type === 'CALL')
    )
  })
  const showdownPlayers = computed(() =>
    showdownRequired.value ? [...alivePlayers.value] : [],
  )
  const currentContribution = computed(() => Number(contributions[currentPlayer.value] || 0))
  const facingBet = computed(() => currentBet.value > currentContribution.value)
  const callAmount = computed(() =>
    Math.max(0, currentBet.value - currentContribution.value),
  )
  const minRaiseAmount = computed(() => {
    if (currentBet.value === 0) return 1
    return currentBet.value + Math.max(1, lastRaiseSize.value)
  })

  const availableActions = computed(() => {
    if (!currentPlayer.value || streetComplete.value) return []
    if (street.value === 'PREFLOP' && !lastAggressor.value) {
      if (!facingBet.value) return ['CHECK', 'RAISE']
      return ['FOLD', 'LIMP', 'OPEN']
    }
    if (!facingBet.value) return ['CHECK', lastAggressor.value ? 'RAISE' : 'BET']
    return ['FOLD', 'CALL', 'RAISE']
  })

  const snapshot = () => ({
    street: street.value,
    alivePlayers: [...alivePlayers.value],
    pendingPlayers: [...pendingPlayers.value],
    currentBet: currentBet.value,
    lastRaiseSize: lastRaiseSize.value,
    lastAggressor: lastAggressor.value,
    potSize: potSize.value,
    actions: [...actions.value],
    contributions: { ...contributions },
  })

  const restore = (state) => {
    street.value = state.street
    alivePlayers.value = [...state.alivePlayers]
    pendingPlayers.value = [...state.pendingPlayers]
    currentBet.value = state.currentBet
    lastRaiseSize.value = state.lastRaiseSize
    lastAggressor.value = state.lastAggressor
    potSize.value = Number(state.potSize) || 0
    actions.value = [...state.actions]
    Object.keys(contributions).forEach((key) => delete contributions[key])
    Object.assign(contributions, state.contributions)
  }

  const start = (players, tablePlayers = players) => {
    trackedPlayers.value = ordered([...new Set(players)], 'PREFLOP')
    alivePlayers.value = [...trackedPlayers.value]
    pendingPlayers.value = [...trackedPlayers.value]
    street.value = 'PREFLOP'
    currentBet.value = Number(bigBlind) || 0
    lastRaiseSize.value = Number(bigBlind) || 0
    lastAggressor.value = ''
    const tablePositions = [...new Set(tablePlayers)]
    potSize.value =
      (tablePositions.includes('SB') ? currentBet.value / 2 : 0) +
      (tablePositions.includes('BB') ? currentBet.value : 0) +
      (Number(ante) || 0)
    actions.value = []
    history.value = []
    Object.keys(contributions).forEach((key) => delete contributions[key])
    if (trackedPlayers.value.includes('SB')) contributions.SB = currentBet.value / 2
    if (trackedPlayers.value.includes('BB')) contributions.BB = currentBet.value
    started.value = true
  }

  const reset = () => {
    started.value = false
    street.value = 'PREFLOP'
    trackedPlayers.value = []
    alivePlayers.value = []
    pendingPlayers.value = []
    currentBet.value = Number(bigBlind) || 0
    lastRaiseSize.value = Number(bigBlind) || 0
    lastAggressor.value = ''
    potSize.value = 0
    actions.value = []
    history.value = []
    Object.keys(contributions).forEach((key) => delete contributions[key])
  }

  const recordAction = (type, amount = null) => {
    const player = currentPlayer.value
    if (!player || !availableActions.value.includes(type)) return false

    history.value.push(snapshot())
    const numericAmount = amount === null || amount === '' ? null : Number(amount)
    const aggressive = ['OPEN', 'BET', 'RAISE'].includes(type)
    const previousContribution = Number(contributions[player] || 0)

    if (type === 'FOLD') {
      alivePlayers.value = alivePlayers.value.filter((item) => item !== player)
    } else if (['CALL', 'LIMP'].includes(type)) {
      contributions[player] = currentBet.value
    } else if (aggressive) {
      if (!numericAmount || numericAmount < minRaiseAmount.value) {
        history.value.pop()
        return false
      }
      lastRaiseSize.value = numericAmount - currentBet.value
      contributions[player] = numericAmount
      currentBet.value = numericAmount
      lastAggressor.value = player
    }

    const addedToPot = Math.max(0, Number(contributions[player] || 0) - previousContribution)
    potSize.value += addedToPot

    actions.value.push({
      id: `${Date.now()}-${actions.value.length}`,
      street: street.value,
      player,
      type,
      amount: aggressive ? numericAmount : null,
      callAmount: currentBet.value,
      potAfter: potSize.value,
    })

    if (aggressive) {
      const order = ordered(alivePlayers.value, street.value)
      const playerIndex = order.indexOf(player)
      pendingPlayers.value = [
        ...order.slice(playerIndex + 1),
        ...order.slice(0, playerIndex),
      ].filter((item) => item !== player)
    } else {
      pendingPlayers.value = pendingPlayers.value.slice(1)
    }

    if (alivePlayers.value.length <= 1) pendingPlayers.value = []
    return true
  }

  const advanceStreet = () => {
    if (!streetComplete.value || handComplete.value) return false
    history.value.push(snapshot())
    const nextIndex = STREETS.indexOf(street.value) + 1
    street.value = STREETS[nextIndex]
    pendingPlayers.value = ordered(alivePlayers.value, street.value)
    currentBet.value = 0
    lastRaiseSize.value = 1
    lastAggressor.value = ''
    Object.keys(contributions).forEach((key) => delete contributions[key])
    return true
  }

  const undo = () => {
    const previous = history.value.pop()
    if (!previous) return false
    restore(previous)
    return true
  }

  const rewindTo = (actionIndex, tablePlayers = trackedPlayers.value) => {
    const savedActions = actions.value.slice(0, Math.max(0, actionIndex))
    const savedPlayers = [...trackedPlayers.value]
    if (!savedPlayers.length) return false

    start(savedPlayers, tablePlayers)
    for (const savedAction of savedActions) {
      while (
        street.value !== savedAction.street &&
        streetComplete.value &&
        !handComplete.value
      ) {
        if (!advanceStreet()) return false
      }
      if (
        street.value !== savedAction.street ||
        currentPlayer.value !== savedAction.player ||
        !recordAction(savedAction.type, savedAction.amount)
      ) {
        return false
      }
      actions.value[actions.value.length - 1] = {
        ...actions.value[actions.value.length - 1],
        id: savedAction.id,
      }
    }
    return true
  }

  const recalculatePot = (savedActions = []) => {
    let calculatedPot = (Number(bigBlind) || 0) * 1.5 + (Number(ante) || 0)
    let calculatedStreet = 'PREFLOP'
    let calculatedBet = Number(bigBlind) || 0
    const calculatedContributions = {
      SB: (Number(bigBlind) || 0) / 2,
      BB: Number(bigBlind) || 0,
    }

    return savedActions.map((action) => {
      if (action.street !== calculatedStreet) {
        calculatedStreet = action.street
        calculatedBet = 0
        Object.keys(calculatedContributions).forEach(
          (key) => delete calculatedContributions[key],
        )
      }

      const previous = Number(calculatedContributions[action.player] || 0)
      if (['CALL', 'LIMP'].includes(action.type)) {
        calculatedContributions[action.player] = calculatedBet
      } else if (['OPEN', 'BET', 'RAISE'].includes(action.type)) {
        calculatedBet = Number(action.amount) || calculatedBet
        calculatedContributions[action.player] = calculatedBet
      }
      calculatedPot += Math.max(
        0,
        Number(calculatedContributions[action.player] || 0) - previous,
      )
      return { ...action, potAfter: calculatedPot }
    })
  }

  const serialize = () => ({
    version: 2,
    bigBlind: Number(bigBlind) || 0,
    ante: Number(ante) || 0,
    trackedPlayers: [...trackedPlayers.value],
    ...snapshot(),
  })

  const hydrate = (data) => {
    if (!data?.trackedPlayers?.length) return false
    const hydratedActions =
      Number(data.version || 1) < 2
        ? recalculatePot(data.actions || [])
        : data.actions || []
    trackedPlayers.value = [...data.trackedPlayers]
    restore({
      street: data.street || 'PREFLOP',
      alivePlayers: data.alivePlayers || data.trackedPlayers,
      pendingPlayers: data.pendingPlayers || [],
      currentBet: Number(data.currentBet) || 0,
      lastRaiseSize: Number(data.lastRaiseSize) || 1,
      lastAggressor: data.lastAggressor || '',
      potSize:
        (Number(data.version || 1) >= 2 ? data.potSize : null) ??
        hydratedActions.at(-1)?.potAfter ??
        (Number(bigBlind) || 0) * 1.5 + (Number(ante) || 0),
      actions: hydratedActions,
      contributions: data.contributions || {},
    })
    history.value = []
    started.value = true
    return true
  }

  return {
    started,
    street,
    trackedPlayers,
    alivePlayers,
    currentPlayer,
    currentBet,
    callAmount,
    minRaiseAmount,
    lastAggressor,
    potSize,
    actions,
    availableActions,
    streetComplete,
    handComplete,
    showdownRequired,
    showdownPlayers,
    start,
    reset,
    recordAction,
    advanceStreet,
    undo,
    rewindTo,
    serialize,
    hydrate,
  }
}
