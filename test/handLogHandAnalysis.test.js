import assert from 'node:assert/strict'
import test from 'node:test'

import {
  createStartingHandRunSummary,
  getPreflopRankStat,
  getStartingHandComboCount,
  isThreeBetPlusHand,
  orderHoleCardFields,
  orderHoleCards,
  PREFLOP_169_RANKING,
  STARTING_HAND_RUN_BUCKETS,
  TOTAL_STARTING_HAND_COMBOS,
} from '../src/utils/handLogHandAnalysis.js'

const legacyRunSummary = (hands) => {
  const boundaries = [17, 42, 102, 169]
  const counts = [0, 0, 0, 0]
  const rankMap = new Map(PREFLOP_169_RANKING.map((hand, index) => [hand, index + 1]))

  hands.forEach((hand) => {
    const rank = rankMap.get(hand)
    const bucketIndex = boundaries.findIndex((maxRank) => rank <= maxRank)
    if (bucketIndex >= 0) counts[bucketIndex] += 1
  })

  return counts
}

test('169개 순위표의 실제 콤보 누적 경계가 10%, 25%, 60%에 가장 가깝다', () => {
  assert.equal(PREFLOP_169_RANKING.length, 169)
  assert.equal(
    PREFLOP_169_RANKING.reduce((total, hand) => total + getStartingHandComboCount(hand), 0),
    TOTAL_STARTING_HAND_COMBOS,
  )

  const cumulativeCombos = (maxRank) =>
    PREFLOP_169_RANKING.slice(0, maxRank).reduce(
      (total, hand) => total + getStartingHandComboCount(hand),
      0,
    )

  assert.equal(cumulativeCombos(24), 134)
  assert.equal(cumulativeCombos(56), 330)
  assert.equal(cumulativeCombos(125), 798)
  assert.deepEqual(
    STARTING_HAND_RUN_BUCKETS.map(({ minRank, maxRank }) => [minRank, maxRank]),
    [
      [1, 24],
      [25, 56],
      [57, 125],
      [126, 169],
    ],
  )
})

test('개별 핸드 백분위는 해당 순위까지의 누적 콤보 확률을 사용한다', () => {
  assert.equal(getPreflopRankStat('AA').percentile, 0.5)
  assert.equal(getPreflopRankStat('A8s').rank, 24)
  assert.equal(getPreflopRankStat('A8s').percentile, 10.1)
  assert.equal(getPreflopRankStat('76s').rank, 56)
  assert.equal(getPreflopRankStat('76s').percentile, 24.9)
  assert.equal(getPreflopRankStat('K6o').rank, 125)
  assert.equal(getPreflopRankStat('K6o').percentile, 60.2)
  assert.equal(getPreflopRankStat('72o').percentile, 100)
})

test('기존 대회 핸드를 새 콤보 경계로 재분류하고 분석 가능한 핸드 수를 보존한다', () => {
  const tournamentHands = [
    'AA',
    'AQo',
    'A8s',
    'Q9s',
    '76s',
    'T7s',
    'K6o',
    '86o',
    '72o',
  ].map((holeCards, index) => ({ id: index + 1, holeCards }))

  assert.deepEqual(legacyRunSummary(tournamentHands.map((hand) => hand.holeCards)), [1, 3, 2, 3])

  const summary = createStartingHandRunSummary(tournamentHands)
  assert.deepEqual(
    summary.buckets.map((bucket) => bucket.count),
    [3, 2, 2, 2],
  )
  assert.equal(summary.total, tournamentHands.length)
  assert.equal(
    summary.buckets.reduce((total, bucket) => total + bucket.count, 0),
    summary.total,
  )
})

test('분류할 수 없는 기록은 구간 합계와 분석 가능 전체에서 함께 제외한다', () => {
  const summary = createStartingHandRunSummary([
    { holeCards: 'AA' },
    { holeCards: 'KQo' },
    { holeCards: '' },
    { holeCards: 'invalid' },
  ])

  assert.equal(summary.total, 2)
  assert.equal(summary.buckets.reduce((total, bucket) => total + bucket.count, 0), 2)
})

test('후속 액션의 3벳 이상을 3벳+ 핸드로 집계한다', () => {
  assert.equal(isThreeBetPlusHand({ actionType: 'CALL', secondaryAction: 'THREE_BET_PLUS' }), true)
  assert.equal(isThreeBetPlusHand({ actionType: 'OPEN', secondaryAction: 'FOUR_BET_PLUS' }), true)
  assert.equal(isThreeBetPlusHand({ actionType: 'THREE_BET' }), true)
  assert.equal(isThreeBetPlusHand({ actionType: 'OPEN', secondaryAction: 'CALL' }), false)
})

test('표시할 홀카드는 높은 랭크가 앞에 오도록 수트와 함께 정렬한다', () => {
  assert.deepEqual(
    orderHoleCardFields({ firstRank: '2', firstSuit: '♥', secondRank: '8', secondSuit: '♥' }),
    { firstRank: '8', firstSuit: '♥', secondRank: '2', secondSuit: '♥' },
  )
  assert.deepEqual(
    orderHoleCardFields({ firstRank: '2', firstSuit: '♥', secondRank: 'K', secondSuit: '♦' }),
    { firstRank: 'K', firstSuit: '♦', secondRank: '2', secondSuit: '♥' },
  )
  assert.deepEqual(
    orderHoleCardFields({ firstRank: '8', firstSuit: '♠', secondRank: '8', secondSuit: '♣' }),
    { firstRank: '8', firstSuit: '♠', secondRank: '8', secondSuit: '♣' },
  )
})

test('쇼다운 카드 배열도 높은 랭크가 앞에 오도록 정렬한다', () => {
  const low = { rank: 'K', suit: '♦' }
  const high = { rank: 'A', suit: '♥' }

  assert.deepEqual(orderHoleCards([low, high]), [high, low])
  assert.deepEqual(orderHoleCards([high, low]), [high, low])
})
