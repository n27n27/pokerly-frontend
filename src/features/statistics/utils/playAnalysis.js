import { isPfrAction, isVpipAction } from 'src/utils/handLogHandAnalysis'

const WIN_RESULTS = new Set(['SHOWDOWN_WIN', 'NON_SHOWDOWN_WIN', 'WIN'])
const LOSS_RESULTS = new Set(['SHOWDOWN_LOSS', 'PREFLOP_FOLD', 'POSTFLOP_FOLD', 'LOSS'])
const DRAW_RESULTS = new Set(['CHOP', 'DRAW', 'TIE'])

const ACTION_GROUPS = [
  {
    key: 'fold',
    label: '폴드',
    actions: new Set(['FOLD']),
    showResult: false,
  },
  {
    key: 'walk',
    label: '앞에서 올폴드',
    actions: new Set(['WALK']),
    showResult: false,
  },
  { key: 'check', label: '체크', actions: new Set(['CHECK']), showResult: true },
  {
    key: 'call',
    label: '림프·콜',
    actions: new Set(['LIMP', 'CALL', 'BB_DEFENSE']),
    showResult: true,
  },
  {
    key: 'open',
    label: '오픈',
    actions: new Set(['OPEN', 'ISO_RAISE', 'OPEN_FOLD_TO_3BET', 'OPEN_CALL_3BET']),
    showResult: true,
  },
  {
    key: 'threeBet',
    label: '3벳+',
    actions: new Set(['THREE_BET', 'FOUR_BET_PLUS', 'OPEN_4BET_PLUS']),
    showResult: true,
  },
]

const actionOf = (hand) => String(hand?.actionType || hand?.preflopAction || '').toUpperCase()
const resultOf = (hand) => String(hand?.resultType || hand?.result || '').toUpperCase()

const countResults = (hands) => hands.reduce((counts, hand) => {
  const result = resultOf(hand)
  if (WIN_RESULTS.has(result)) counts.wins += 1
  else if (LOSS_RESULTS.has(result)) counts.losses += 1
  else if (DRAW_RESULTS.has(result)) counts.draws += 1
  else counts.unrecorded += 1
  return counts
}, { wins: 0, losses: 0, draws: 0, unrecorded: 0 })

export const formatAnalysisRate = (value) => `${Number(value || 0).toFixed(1)}%`

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
  const participated = matchedHands.filter((hand) => isVpipAction(actionOf(hand))).length
  const results = countResults(matchedHands)
  const groupedActions = ACTION_GROUPS.map((group) => {
    const actionHands = matchedHands.filter((hand) => group.actions.has(actionOf(hand)))
    return {
      key: group.key,
      label: group.label,
      count: actionHands.length,
      showResult: group.showResult,
      ...countResults(actionHands),
    }
  }).filter((group) => group.count > 0)

  const groupedCount = groupedActions.reduce((sum, group) => sum + group.count, 0)
  const unknownActions = matchedHands.length - groupedCount
  if (unknownActions > 0) {
    groupedActions.push({
      key: 'unknown',
      label: '기타·미기록',
      count: unknownActions,
      showResult: false,
      wins: 0,
      losses: 0,
      draws: 0,
      unrecorded: unknownActions,
    })
  }

  return {
    key,
    label: key,
    total: matchedHands.length,
    participated,
    participationRate: matchedHands.length ? participated * 100 / matchedHands.length : 0,
    actions: groupedActions,
    ...results,
  }
})
