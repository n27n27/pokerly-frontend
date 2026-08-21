import assert from 'node:assert/strict'
import test from 'node:test'
import {
  buildAnalysisRows,
  buildPrimaryActionDistribution,
  formatAnalysisRate,
  groupHandsByRanking,
  normalizePosition,
} from '../src/features/statistics/utils/playAnalysis.js'

test('동일 핸드를 집계하고 169핸드 랭킹 순으로 정렬한다', () => {
  const hands = [
    { notation: '92o', id: 1 },
    { notation: 'AQo', id: 2 },
    { notation: '92o', id: 3 },
    { notation: 'J5o', id: 4 },
    { notation: 'AQo', id: 5 },
  ]
  const ranking = ['AA', 'AQo', 'J5o', '92o']

  const result = groupHandsByRanking(hands, ranking, (hand) => hand.notation)

  assert.deepEqual(result.map(({ label, count }) => ({ label, count })), [
    { label: 'AQo', count: 2 },
    { label: 'J5o', count: 1 },
    { label: '92o', count: 2 },
  ])
  assert.deepEqual(result[0].hands.map((hand) => hand.id), [2, 5])
})

test('핸드 미기록 항목도 누락하지 않고 마지막에 합친다', () => {
  const hands = [{ notation: '' }, {}, { notation: 'AA' }]

  const result = groupHandsByRanking(hands, ['AA'], (hand) => hand.notation)

  assert.deepEqual(result.map(({ label, count }) => ({ label, count })), [
    { label: 'AA', count: 1 },
    { label: '핸드 미기록', count: 2 },
  ])
})

test('참여율 양 끝값은 소수점 없이 표시한다', () => {
  assert.equal(formatAnalysisRate(0), '0%')
  assert.equal(formatAnalysisRate(100), '100%')
  assert.equal(formatAnalysisRate(11.111), '11.1%')
})

test('후속 액션으로 기록된 3벳 이상도 액션 필터에 집계한다', () => {
  const hands = [
    { position: 'UTG', actionType: 'CALL', secondaryAction: 'THREE_BET_PLUS' },
    { position: 'UTG', actionType: 'OPEN', secondaryAction: 'FOUR_BET_PLUS' },
  ]

  const [row] = buildAnalysisRows(['UTG'], hands, (hand) => hand.position)

  assert.equal(row.actions.find((action) => action.key === 'threeBet')?.count, 1)
  assert.equal(row.actions.find((action) => action.key === 'fourBet')?.count, 1)
})

test('기본 액션 분포는 후속 3벳과 4벳을 중복 집계하지 않는다', () => {
  const hands = [
    { actionType: 'FOLD' },
    { actionType: 'CALL', secondaryAction: 'THREE_BET_PLUS' },
    { actionType: 'OPEN', secondaryAction: 'FOUR_BET_PLUS' },
    { actionType: 'THREE_BET', secondaryAction: 'CALL' },
  ]

  const distribution = buildPrimaryActionDistribution(hands)

  assert.deepEqual(distribution.map(({ label, count }) => ({ label, count })), [
    { label: '폴드', count: 1 },
    { label: '콜', count: 1 },
    { label: '오픈', count: 1 },
    { label: '3Bet+', count: 1 },
  ])
  assert.equal(distribution.reduce((sum, item) => sum + item.count, 0), hands.length)
})

test('모든 통계 화면이 동일한 8개 포지션 정규화 규칙을 사용한다', () => {
  assert.equal(normalizePosition('utg+1'), 'UTG')
  assert.equal(normalizePosition('UTG+2'), 'MP')
  assert.equal(normalizePosition('UTG+3'), 'MP')
  assert.equal(normalizePosition('BTN'), 'BTN')
  assert.equal(normalizePosition('unknown'), '')
})
