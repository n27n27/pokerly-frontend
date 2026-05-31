const RANKS = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2']

const PREMIUM_HANDS = new Set(['AA', 'KK', 'QQ', 'JJ', 'AKs', 'AKo', 'AQs'])

const STRONG_HANDS = new Set(['TT', '99', 'AQo', 'AJs', 'ATs', 'KQs'])

const PLAYABLE_HANDS = new Set([
  '88',
  '77',

  // Playable broadway / high-card hands
  'AJo',
  'KJs',
  'KQo',
  'KTs',
  'QJs',
  'QTs',
  'JTs',
  'T9s',
  '98s',

  // Wheel suited aces
  // A blocker + nut flush + wheel straight potential
  'A5s',
  'A4s',
  'A3s',
  'A2s',
])

const SPECULATIVE_HANDS = new Set([
  // Small pocket pairs
  '66',
  '55',
  '44',
  '33',
  '22',

  // Other suited aces
  'A9s',
  'A8s',
  'A7s',
  'A6s',

  // Suited connectors
  '87s',
  '76s',
  '65s',
  '54s',

  // Suited one-gappers
  'T8s',
  '97s',
  '86s',
  '75s',
  '64s',
])

const MARGINAL_HANDS = new Set([
  // Offsuit aces that can be played in late position or specific spots
  'ATo',
  'A9o',
  'A8o',

  // Offsuit broadway hands
  'KJo',
  'KTo',
  'QJo',
  'QTo',
  'JTo',

  // Borderline suited high-card hands
  'K9s',
  'K8s',
  'K7s',
  'Q9s',
  'Q8s',
  'J9s',
  'J8s',

  // Borderline suited/gapped hands
  'T7s',
  '96s',
  '85s',
  '74s',
  '63s',
  '43s',
  '32s',
])

const HIGH_POCKET_HANDS = new Set(['AA', 'KK', 'QQ', 'JJ', 'TT'])

const TIER_META = {
  PREMIUM: {
    label: 'Premium',
    color: 'deep-purple',
  },
  STRONG: {
    label: 'Strong',
    color: 'primary',
  },
  PLAYABLE: {
    label: 'Playable',
    color: 'teal',
  },
  SPECULATIVE: {
    label: 'Speculative',
    color: 'orange',
  },
  MARGINAL: {
    label: 'Marginal',
    color: 'blue-grey',
  },
  TRASH: {
    label: 'Trash',
    color: 'grey-7',
  },
}

export const POSITION_OPTIONS = [
  { label: 'UTG', value: 'UTG' },
  { label: 'UTG+1', value: 'UTG+1' },
  { label: 'UTG+2', value: 'UTG+2' },
  { label: 'MP', value: 'MP' },
  { label: 'LJ', value: 'LJ' },
  { label: 'HJ', value: 'HJ' },
  { label: 'CO', value: 'CO' },
  { label: 'BTN', value: 'BTN' },
  { label: 'SB', value: 'SB' },
  { label: 'BB', value: 'BB' },
]

export const ACTION_OPTIONS = [
  { label: '폴드', value: 'FOLD' },
  { label: '체크', value: 'CHECK' },

  { label: '림프', value: 'LIMP' },
  { label: '콜', value: 'CALL' },
  { label: 'BB 방어', value: 'BB_DEFENSE' },

  { label: '오픈', value: 'OPEN' },
  { label: '아이솔레이션', value: 'ISO_RAISE' },

  { label: '3벳', value: 'THREE_BET' },
  { label: '4벳+', value: 'FOUR_BET_PLUS' },

  { label: '오픈 후 3벳 폴드', value: 'OPEN_FOLD_TO_3BET' },
  { label: '오픈 후 3벳 콜', value: 'OPEN_CALL_3BET' },
  { label: '오픈 후 4벳+', value: 'OPEN_4BET_PLUS' },
]

export const RESULT_OPTIONS = [
  { label: '미기록', value: 'NOT_RECORDED' },
  { label: '프리플랍 폴드', value: 'PREFLOP_FOLD' },
  { label: '포스트플랍 폴드', value: 'POSTFLOP_FOLD' },
  { label: '노쇼다운 승리', value: 'NON_SHOWDOWN_WIN' },
  { label: '쇼다운 승리', value: 'SHOWDOWN_WIN' },
  { label: '쇼다운 패배', value: 'SHOWDOWN_LOSS' },
  { label: '찹', value: 'CHOP' },
]

export const ACTION_LABEL_MAP = ACTION_OPTIONS.reduce((acc, option) => {
  acc[option.value] = option.label
  return acc
}, {})

export const RESULT_LABEL_MAP = RESULT_OPTIONS.reduce(
  (acc, option) => {
    acc[option.value] = option.label
    return acc
  },
  {
    // 기존 데이터 호환용
    FOLD: '폴드',
  },
)

export const VPIP_ACTIONS = new Set([
  'LIMP',
  'CALL',
  'BB_DEFENSE',
  'OPEN',
  'ISO_RAISE',
  'THREE_BET',
  'FOUR_BET_PLUS',
  'OPEN_FOLD_TO_3BET',
  'OPEN_CALL_3BET',
  'OPEN_4BET_PLUS',
])

export const PFR_ACTIONS = new Set([
  'OPEN',
  'ISO_RAISE',
  'THREE_BET',
  'FOUR_BET_PLUS',
  'OPEN_FOLD_TO_3BET',
  'OPEN_CALL_3BET',
  'OPEN_4BET_PLUS',
])

export const THREE_BET_PLUS_ACTIONS = new Set(['THREE_BET', 'FOUR_BET_PLUS', 'OPEN_4BET_PLUS'])

export const SHOWDOWN_RESULTS = new Set(['SHOWDOWN_WIN', 'SHOWDOWN_LOSS'])

export const ALL_IN_COMPATIBLE_ACTIONS = new Set([
  'CALL',
  'BB_DEFENSE',
  'OPEN',
  'ISO_RAISE',
  'THREE_BET',
  'FOUR_BET_PLUS',
  'OPEN_CALL_3BET',
  'OPEN_4BET_PLUS',
])

export const PREFLOP_RANK_BUCKETS = [
  { key: 'P1_10', label: '1~10%', minRank: 1, maxRank: 17 },
  { key: 'P11_20', label: '11~20%', minRank: 18, maxRank: 34 },
  { key: 'P21_30', label: '21~30%', minRank: 35, maxRank: 51 },
  { key: 'P31_40', label: '31~40%', minRank: 52, maxRank: 68 },
  { key: 'P41_50', label: '41~50%', minRank: 69, maxRank: 85 },
  { key: 'P51_60', label: '51~60%', minRank: 86, maxRank: 102 },
  { key: 'P61_70', label: '61~70%', minRank: 103, maxRank: 119 },
  { key: 'P71_80', label: '71~80%', minRank: 120, maxRank: 136 },
  { key: 'P81_90', label: '81~90%', minRank: 137, maxRank: 153 },
  { key: 'P91_100', label: '91~100%', minRank: 154, maxRank: 169 },
]

export const PREFLOP_RANK_SUMMARY_BUCKETS = [
  {
    key: 'TOP',
    label: '상위 20%',
    description: '1~34위',
    minRank: 1,
    maxRank: 34,
    colorClass: 'rank-summary-card--top',
  },
  {
    key: 'MIDDLE',
    label: '중간 21~60%',
    description: '35~102위',
    minRank: 35,
    maxRank: 102,
    colorClass: 'rank-summary-card--middle',
  },
  {
    key: 'LOW',
    label: '하위 61~100%',
    description: '103~169위',
    minRank: 103,
    maxRank: 169,
    colorClass: 'rank-summary-card--low',
  },
]

// 169개 스타팅 핸드 고정 순위.
// 목적: "이번 대회/레벨에서 내가 얼마나 좋은 핸드를 받았는가"를 보기 위한 통계.
// 티어 배지와는 별개로 사용한다.
export const PREFLOP_169_RANKING = [
  'AA',
  'KK',
  'QQ',
  'AKs',
  'JJ',
  'AQs',
  'KQs',
  'AJs',
  'KJs',
  'TT',
  'AKo',
  'ATs',
  'QJs',
  'KTs',
  'QTs',
  'JTs',
  '99',
  'AQo',
  'A9s',
  'KQo',

  '88',
  'K9s',
  'T9s',
  'A8s',
  'Q9s',
  'J9s',
  'AJo',
  'A5s',
  '77',
  'A7s',
  'KJo',
  'A4s',
  'A3s',
  'A6s',
  'QJo',
  '66',
  'K8s',
  'T8s',
  'A2s',
  '98s',

  'J8s',
  'ATo',
  'Q8s',
  'K7s',
  'KTo',
  '55',
  'JTo',
  '87s',
  'QTo',
  '44',
  '33',
  '22',
  'K6s',
  '97s',
  'K5s',
  '76s',
  'T7s',
  'K4s',
  'K3s',
  'K2s',

  'Q7s',
  '86s',
  '65s',
  'J7s',
  '54s',
  'Q6s',
  '75s',
  '96s',
  'Q5s',
  '64s',
  'Q4s',
  'Q3s',
  'T9o',
  'T6s',
  'Q2s',
  'A9o',
  '53s',
  '85s',
  'J6s',
  'J9o',

  'K9o',
  'J5s',
  'Q9o',
  '43s',
  '74s',
  'J4s',
  'J3s',
  '95s',
  'J2s',
  '63s',
  'A8o',
  '52s',
  'T5s',
  '84s',
  'T4s',
  'T3s',
  '42s',
  'T2s',
  '98o',
  'T8o',

  'A5o',
  'A7o',
  '73s',
  'A4o',
  '32s',
  '94s',
  '93s',
  'J8o',
  'A3o',
  '62s',
  '92s',
  'K8o',
  'A6o',
  '87o',
  'Q8o',
  '83s',
  'A2o',
  '82s',
  '97o',
  '72s',

  '76o',
  'K7o',
  '65o',
  'T7o',
  'K6o',
  '86o',
  '54o',
  'K5o',
  'J7o',
  '75o',
  'Q7o',
  'K4o',
  'K3o',
  '96o',
  'K2o',
  '64o',
  'Q6o',
  '53o',
  '85o',
  'T6o',

  'Q5o',
  '43o',
  'Q4o',
  'Q3o',
  '74o',
  'Q2o',
  'J6o',
  '63o',
  'J5o',
  '95o',
  '52o',
  'J4o',
  'J3o',
  '42o',
  'J2o',
  '84o',
  'T5o',
  'T4o',
  '32o',
  'T3o',

  '73o',
  'T2o',
  '62o',
  '94o',
  '93o',
  '92o',
  '83o',
  '82o',
  '72o',
]

const PREFLOP_RANK_MAP = new Map(PREFLOP_169_RANKING.map((hand, index) => [hand, index + 1]))

const getRankIndex = (rank) => {
  return RANKS.indexOf(rank)
}

export const normalizeHand = (hand) => {
  const value = String(hand || '')
    .trim()
    .replace(/10/g, 'T')

  if (value.length < 2) {
    return ''
  }

  const firstRank = value[0]?.toUpperCase()
  const secondRank = value[1]?.toUpperCase()
  const suitedMark = value[2]?.toLowerCase() || ''

  if (!RANKS.includes(firstRank) || !RANKS.includes(secondRank)) {
    return ''
  }

  if (firstRank === secondRank) {
    return `${firstRank}${secondRank}`
  }

  const firstIndex = getRankIndex(firstRank)
  const secondIndex = getRankIndex(secondRank)

  const highRank = firstIndex < secondIndex ? firstRank : secondRank
  const lowRank = firstIndex < secondIndex ? secondRank : firstRank
  const suffix = suitedMark === 's' ? 's' : 'o'

  return `${highRank}${lowRank}${suffix}`
}

const findPreflopRankBucket = (rank) => {
  return PREFLOP_RANK_BUCKETS.find((bucket) => {
    return rank >= bucket.minRank && rank <= bucket.maxRank
  })
}

const findPreflopRankSummaryBucket = (rank) => {
  return PREFLOP_RANK_SUMMARY_BUCKETS.find((bucket) => {
    return rank >= bucket.minRank && rank <= bucket.maxRank
  })
}

export const getHandInputValue = (item) => {
  if (typeof item === 'string') {
    return item
  }

  return (
    item?.hand ||
    item?.holeCards ||
    item?.cards ||
    item?.startingHand ||
    item?.handCode ||
    item?.preflopHand ||
    item?.cardText ||
    ''
  )
}

export const getActionLabel = (actionType) => {
  return ACTION_LABEL_MAP[actionType] || actionType || ''
}

export const getResultLabel = (resultType) => {
  return RESULT_LABEL_MAP[resultType] || resultType || ''
}

export const isVpipAction = (action) => {
  return VPIP_ACTIONS.has(action)
}

export const isPfrAction = (action) => {
  return PFR_ACTIONS.has(action)
}

export const isThreeBetPlusAction = (action) => {
  return THREE_BET_PLUS_ACTIONS.has(action)
}

export const isShowdownResult = (result) => {
  return SHOWDOWN_RESULTS.has(result)
}

export const getHandStrength = (hand) => {
  const normalized = normalizeHand(hand)

  if (!normalized) {
    return {
      hand: '',
      tier: 'TRASH',
      ...TIER_META.TRASH,
    }
  }

  if (PREMIUM_HANDS.has(normalized)) {
    return {
      hand: normalized,
      tier: 'PREMIUM',
      ...TIER_META.PREMIUM,
    }
  }

  if (STRONG_HANDS.has(normalized)) {
    return {
      hand: normalized,
      tier: 'STRONG',
      ...TIER_META.STRONG,
    }
  }

  if (PLAYABLE_HANDS.has(normalized)) {
    return {
      hand: normalized,
      tier: 'PLAYABLE',
      ...TIER_META.PLAYABLE,
    }
  }

  if (SPECULATIVE_HANDS.has(normalized)) {
    return {
      hand: normalized,
      tier: 'SPECULATIVE',
      ...TIER_META.SPECULATIVE,
    }
  }

  if (MARGINAL_HANDS.has(normalized)) {
    return {
      hand: normalized,
      tier: 'MARGINAL',
      ...TIER_META.MARGINAL,
    }
  }

  return {
    hand: normalized,
    tier: 'TRASH',
    ...TIER_META.TRASH,
  }
}

export const getPreflopRankStat = (hand) => {
  const normalized = normalizeHand(hand)
  const rank = PREFLOP_RANK_MAP.get(normalized)

  if (!rank) {
    return {
      hand: normalized,
      rank: null,
      percentile: null,
      bucketKey: 'UNKNOWN',
      bucketLabel: '알 수 없음',
      summaryKey: 'UNKNOWN',
      summaryLabel: '알 수 없음',
      minRank: null,
      maxRank: null,
    }
  }

  const bucket = findPreflopRankBucket(rank)
  const summaryBucket = findPreflopRankSummaryBucket(rank)

  return {
    hand: normalized,
    rank,
    percentile: Number(((rank / PREFLOP_169_RANKING.length) * 100).toFixed(1)),
    bucketKey: bucket?.key || 'UNKNOWN',
    bucketLabel: bucket?.label || '알 수 없음',
    summaryKey: summaryBucket?.key || 'UNKNOWN',
    summaryLabel: summaryBucket?.label || '알 수 없음',
    minRank: bucket?.minRank || null,
    maxRank: bucket?.maxRank || null,
  }
}

export const isPocketPair = (hand) => {
  const normalized = normalizeHand(hand)

  return Boolean(normalized && normalized.length === 2 && normalized[0] === normalized[1])
}

export const isHighPocketPair = (hand) => {
  const normalized = normalizeHand(hand)

  return HIGH_POCKET_HANDS.has(normalized)
}

export const createPreflopRankDistribution = (hands = []) => {
  const distribution = PREFLOP_RANK_BUCKETS.map((bucket) => ({
    ...bucket,
    count: 0,
  }))

  const bucketMap = new Map(distribution.map((bucket) => [bucket.key, bucket]))

  hands.forEach((item) => {
    const hand = getHandInputValue(item)
    const stat = getPreflopRankStat(hand)

    if (!stat.bucketKey || stat.bucketKey === 'UNKNOWN') {
      return
    }

    const bucket = bucketMap.get(stat.bucketKey)

    if (bucket) {
      bucket.count += 1
    }
  })

  return distribution
}

export const createPreflopRankSummary = (hands = []) => {
  const summary = PREFLOP_RANK_SUMMARY_BUCKETS.map((bucket) => ({
    ...bucket,
    count: 0,
    percent: 0,
  }))

  const summaryMap = new Map(summary.map((bucket) => [bucket.key, bucket]))

  const normalizedHands = hands
    .map((item) => normalizeHand(getHandInputValue(item)))
    .filter(Boolean)

  normalizedHands.forEach((hand) => {
    const stat = getPreflopRankStat(hand)

    if (!stat.summaryKey || stat.summaryKey === 'UNKNOWN') {
      return
    }

    const bucket = summaryMap.get(stat.summaryKey)

    if (bucket) {
      bucket.count += 1
    }
  })

  const total = normalizedHands.length

  summary.forEach((bucket) => {
    bucket.percent = total ? Math.round((bucket.count / total) * 100) : 0
  })

  return summary
}

export const createPocketPairSummary = (hands = []) => {
  const normalizedHands = hands
    .map((item) => normalizeHand(getHandInputValue(item)))
    .filter(Boolean)

  const pocketPairCount = normalizedHands.filter((hand) => isPocketPair(hand)).length
  const highPocketCount = normalizedHands.filter((hand) => isHighPocketPair(hand)).length
  const total = normalizedHands.length

  return {
    total,
    pocketPairCount,
    pocketPairPercent: total ? Math.round((pocketPairCount / total) * 100) : 0,
    highPocketCount,
    highPocketPercent: total ? Math.round((highPocketCount / total) * 100) : 0,
  }
}

export const createHandRankOverview = (hands = []) => {
  return {
    rankSummary: createPreflopRankSummary(hands),
    pocketSummary: createPocketPairSummary(hands),
  }
}

export const createHandTierDistribution = (hands = []) => {
  const distribution = Object.keys(TIER_META).map((tier) => ({
    tier,
    ...TIER_META[tier],
    count: 0,
  }))

  const tierMap = new Map(distribution.map((item) => [item.tier, item]))

  hands.forEach((item) => {
    const hand = getHandInputValue(item)
    const strength = getHandStrength(hand)
    const target = tierMap.get(strength.tier)

    if (target) {
      target.count += 1
    }
  })

  return distribution
}
