const RANKS = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2']

const PREMIUM_HANDS = new Set(['AA', 'KK', 'QQ', 'JJ', 'AKs', 'AKo'])

const STRONG_HANDS = new Set(['TT', '99', 'AQs', 'AQo', 'AJs', 'ATs', 'KQs'])

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

// 169개 스타팅 핸드 고정 순위.
// 목적: "이번 대회/레벨에서 내가 얼마나 좋은 핸드를 받았는가"를 보기 위한 분포 통계.
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
      minRank: null,
      maxRank: null,
    }
  }

  const bucket = findPreflopRankBucket(rank)

  return {
    hand: normalized,
    rank,
    percentile: Number(((rank / PREFLOP_169_RANKING.length) * 100).toFixed(1)),
    bucketKey: bucket?.key || 'UNKNOWN',
    bucketLabel: bucket?.label || '알 수 없음',
    minRank: bucket?.minRank || null,
    maxRank: bucket?.maxRank || null,
  }
}

export const createPreflopRankDistribution = (hands = []) => {
  const distribution = PREFLOP_RANK_BUCKETS.map((bucket) => ({
    ...bucket,
    count: 0,
  }))

  const bucketMap = new Map(distribution.map((bucket) => [bucket.key, bucket]))

  hands.forEach((item) => {
    const hand =
      typeof item === 'string'
        ? item
        : item?.hand || item?.holeCards || item?.cards || item?.startingHand

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

export const createHandTierDistribution = (hands = []) => {
  const distribution = Object.keys(TIER_META).map((tier) => ({
    tier,
    ...TIER_META[tier],
    count: 0,
  }))

  const tierMap = new Map(distribution.map((item) => [item.tier, item]))

  hands.forEach((item) => {
    const hand =
      typeof item === 'string'
        ? item
        : item?.hand || item?.holeCards || item?.cards || item?.startingHand

    const strength = getHandStrength(hand)
    const target = tierMap.get(strength.tier)

    if (target) {
      target.count += 1
    }
  })

  return distribution
}
