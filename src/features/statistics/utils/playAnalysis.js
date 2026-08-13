import { isPfrAction, isVpipAction } from '../../../utils/handLogHandAnalysis.js'

const WIN_RESULTS = new Set(['SHOWDOWN_WIN', 'NON_SHOWDOWN_WIN', 'WIN'])
const LOSS_RESULTS = new Set(['SHOWDOWN_LOSS', 'PREFLOP_FOLD', 'POSTFLOP_FOLD', 'LOSS', 'FOLD'])
const DRAW_RESULTS = new Set(['CHOP', 'DRAW', 'TIE'])

const ACTION_GROUPS = [
  {
    key: 'open',
    label: '오픈',
    actions: new Set(['OPEN', 'ISO_RAISE', 'OPEN_FOLD_TO_3BET', 'OPEN_CALL_3BET']),
    showResult: true,
  },
  {
    key: 'call',
    label: '림프·콜',
    actions: new Set(['LIMP', 'CALL', 'BB_DEFENSE']),
    showResult: true,
  },
  {
    key: 'threeBet',
    label: '3벳',
    actions: new Set(['THREE_BET']),
    showResult: true,
  },
  {
    key: 'fourBet',
    label: '4벳+',
    actions: new Set(['FOUR_BET_PLUS', 'OPEN_4BET_PLUS']),
    showResult: true,
  },
  { key: 'check', label: '체크', actions: new Set(['CHECK']), showResult: true },
  {
    key: 'walk',
    label: '앞에서 올폴드',
    actions: new Set(['WALK']),
    showResult: false,
  },
  {
    key: 'fold',
    label: '폴드',
    actions: new Set(['FOLD']),
    showResult: false,
  },
]

const POSITION_ORDER = ['UTG', 'MP', 'LJ', 'HJ', 'CO', 'BTN', 'SB', 'BB']

const normalizePosition = (position) => {
  const value = String(position || '').trim().toUpperCase()
  if (value === 'UTG+1') return 'UTG'
  if (['UTG+2', 'UTG+3'].includes(value)) return 'MP'
  return POSITION_ORDER.includes(value) ? value : ''
}

const actionOf = (hand) => String(hand?.actionType || hand?.preflopAction || '').toUpperCase()
const secondaryActionOf = (hand) => String(hand?.secondaryAction || '').toUpperCase()
const resultOf = (hand) => String(hand?.resultType || hand?.result || '').toUpperCase()
const actionGroupKeyOf = (hand) => {
  if (['FOUR_BET_PLUS', 'FIVE_BET_PLUS'].includes(secondaryActionOf(hand))) return 'fourBet'
  if (secondaryActionOf(hand) === 'THREE_BET_PLUS') return 'threeBet'
  const action = actionOf(hand)
  return ACTION_GROUPS.find((group) => group.actions.has(action))?.key || ''
}

const countResults = (hands) => hands.reduce((counts, hand) => {
  const result = resultOf(hand)
  if (WIN_RESULTS.has(result)) counts.wins += 1
  else if (LOSS_RESULTS.has(result)) counts.losses += 1
  else if (DRAW_RESULTS.has(result)) counts.draws += 1
  else if (actionOf(hand) === 'FOLD') counts.losses += 1
  else counts.unrecorded += 1
  return counts
}, { wins: 0, losses: 0, draws: 0, unrecorded: 0 })

export const formatAnalysisRate = (value) => {
  const rate = Number(value || 0)
  return `${rate === 0 || rate === 100 ? rate.toFixed(0) : rate.toFixed(1)}%`
}

export const groupHandsByRanking = (hands, ranking, handOf) => {
  const grouped = new Map()

  hands.forEach((hand) => {
    const key = handOf(hand) || ''
    const current = grouped.get(key) || { key, label: key || '핸드 미기록', count: 0, hands: [] }
    current.count += 1
    current.hands.push(hand)
    grouped.set(key, current)
  })

  const rankMap = new Map(ranking.map((hand, index) => [hand, index]))
  return [...grouped.values()].sort((a, b) => {
    const aRank = rankMap.get(a.key) ?? Number.MAX_SAFE_INTEGER
    const bRank = rankMap.get(b.key) ?? Number.MAX_SAFE_INTEGER
    return aRank - bRank || a.label.localeCompare(b.label)
  })
}

export const buildPlaySummary = (hands) => {
  const total = hands.length
  const vpip = hands.filter((hand) => isVpipAction(actionOf(hand))).length
  const pfr = hands.filter((hand) => isPfrAction(actionOf(hand))).length
  return {
    total,
    vpip,
    pfr,
    vpipRate: total ? vpip * 100 / total : 0,
    pfrRate: total ? pfr * 100 / total : 0,
  }
}

export const buildAnalysisRows = (keys, hands, keyOf) => keys.map((key) => {
  const matchedHands = hands.filter((hand) => keyOf(hand) === key)
  const participatedHands = matchedHands.filter((hand) => isVpipAction(actionOf(hand)))
  const participated = participatedHands.length
  const results = countResults(matchedHands)
  const participatedResults = countResults(participatedHands)
  const recordedParticipatedResults = participatedResults.wins
    + participatedResults.losses
    + participatedResults.draws
  const groupedActions = ACTION_GROUPS.map((group) => {
    const actionHands = matchedHands.filter((hand) => actionGroupKeyOf(hand) === group.key)
    return {
      key: group.key,
      label: group.label,
      count: actionHands.length,
      showResult: group.showResult,
      hands: actionHands,
      ...countResults(actionHands),
    }
  }).filter((group) => group.count > 0)

  const groupedCount = groupedActions.reduce((sum, group) => sum + group.count, 0)
  const unknownActions = matchedHands.length - groupedCount
  if (unknownActions > 0) {
    const unknownHands = matchedHands.filter((hand) => !actionGroupKeyOf(hand))
    groupedActions.push({
      key: 'unknown',
      label: '기타·미기록',
      count: unknownActions,
      showResult: false,
      hands: unknownHands,
      wins: 0,
      losses: 0,
      draws: 0,
      unrecorded: unknownActions,
    })
  }

  const positions = POSITION_ORDER.map((position) => {
    const positionHands = matchedHands.filter((hand) => normalizePosition(hand.position) === position)
    const positionParticipatedHands = positionHands.filter((hand) => isVpipAction(actionOf(hand)))
    return {
      key: position,
      label: position,
      count: positionHands.length,
      participated: positionParticipatedHands.length,
      ...countResults(positionParticipatedHands),
    }
  }).filter((position) => position.count > 0)

  return {
    key,
    label: key,
    total: matchedHands.length,
    participated,
    participationRate: matchedHands.length ? participated * 100 / matchedHands.length : 0,
    winRate: recordedParticipatedResults
      ? participatedResults.wins * 100 / recordedParticipatedResults
      : 0,
    participatedWins: participatedResults.wins,
    participatedLosses: participatedResults.losses,
    participatedDraws: participatedResults.draws,
    participatedUnrecorded: participatedResults.unrecorded,
    actions: groupedActions,
    hands: matchedHands,
    positions,
    ...results,
  }
})
