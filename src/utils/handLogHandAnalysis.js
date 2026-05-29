const RANKS = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2']

const PREMIUM_HANDS = new Set(['AA', 'KK', 'QQ', 'JJ', 'AKs', 'AKo'])

const STRONG_HANDS = new Set(['TT', '99', 'AQs', 'AQo', 'AJs', 'KQs'])

const PLAYABLE_HANDS = new Set([
  '88',
  '77',
  'ATs',
  'AJo',
  'KJs',
  'KQo',
  'KTs',
  'QJs',
  'QTs',
  'JTs',
  'T9s',
  '98s',
])

const SPECULATIVE_HANDS = new Set([
  // Small pocket pairs
  '66',
  '55',
  '44',
  '33',
  '22',

  // Suited aces
  'A9s',
  'A8s',
  'A7s',
  'A6s',
  'A5s',
  'A4s',
  'A3s',
  'A2s',

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
  // Offsuit aces
  'ATo',
  'A9o',
  'A8o',
  'A7o',
  'A6o',
  'A5o',
  'A4o',
  'A3o',
  'A2o',

  // Offsuit broadway / high-card hands
  'KJo',
  'KTo',
  'K9o',
  'QJo',
  'QTo',
  'Q9o',
  'JTo',
  'J9o',
  'T9o',

  // Some offsuit connectors
  '98o',
  '87o',
  '76o',
  '65o',

  // Suited high-card marginal hands
  'K9s',
  'K8s',
  'K7s',
  'K6s',
  'K5s',
  'K4s',
  'K3s',
  'K2s',
  'Q9s',
  'Q8s',
  'Q7s',
  'J9s',
  'J8s',
  'J7s',

  // Weaker suited connected/gapped hands
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

const getRankIndex = (rank) => {
  return RANKS.indexOf(rank)
}

const normalizeHand = (hand) => {
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

export const getHandStrength = (hand) => {
  const normalized = normalizeHand(hand)

  if (!normalized) {
    return {
      tier: 'TRASH',
      ...TIER_META.TRASH,
    }
  }

  if (PREMIUM_HANDS.has(normalized)) {
    return {
      tier: 'PREMIUM',
      ...TIER_META.PREMIUM,
    }
  }

  if (STRONG_HANDS.has(normalized)) {
    return {
      tier: 'STRONG',
      ...TIER_META.STRONG,
    }
  }

  if (PLAYABLE_HANDS.has(normalized)) {
    return {
      tier: 'PLAYABLE',
      ...TIER_META.PLAYABLE,
    }
  }

  if (SPECULATIVE_HANDS.has(normalized)) {
    return {
      tier: 'SPECULATIVE',
      ...TIER_META.SPECULATIVE,
    }
  }

  if (MARGINAL_HANDS.has(normalized)) {
    return {
      tier: 'MARGINAL',
      ...TIER_META.MARGINAL,
    }
  }

  return {
    tier: 'TRASH',
    ...TIER_META.TRASH,
  }
}
