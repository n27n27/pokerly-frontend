import assert from 'node:assert/strict'
import test from 'node:test'
import { groupHandsByRanking } from '../src/features/statistics/utils/playAnalysis.js'

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
