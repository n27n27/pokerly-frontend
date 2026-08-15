import assert from 'node:assert/strict'
import test from 'node:test'
import {
  buildBankInsights,
  buildPlayInsights,
  confidenceForSample,
  totalBuyInOf,
} from '../src/features/statistics/utils/statisticsInsights.js'

test('할인과 엔트리를 반영해 실제 총 바인을 계산한다', () => {
  assert.equal(totalBuyInOf({ buyInPerEntry: 50_000, entries: 2, discount: 10_000 }), 90_000)
  assert.equal(totalBuyInOf({ totalBuyIn: 70_000 }), 70_000)
})

test('표본 수에 따라 인사이트 신뢰도를 구분한다', () => {
  assert.equal(confidenceForSample(4).key, 'low')
  assert.equal(confidenceForSample(5).key, 'medium')
  assert.equal(confidenceForSample(15).key, 'high')
})

test('한 대회에 수익이 집중되면 변동성 인사이트를 만든다', () => {
  const sessions = [
    { id: 1, totalBuyIn: 10_000, prize: 110_000 },
    { id: 2, totalBuyIn: 10_000, prize: 10_000 },
    { id: 3, totalBuyIn: 10_000, prize: 10_000 },
    { id: 4, totalBuyIn: 10_000, prize: 10_000 },
    { id: 5, totalBuyIn: 10_000, prize: 10_000 },
  ]

  const insights = buildBankInsights(sessions)

  assert.equal(insights[0].key, 'profit-concentration')
  assert.match(insights[0].description, /100%/)
})

test('각 2회 이상 기록된 매장끼리 ROI를 비교한다', () => {
  const sessions = [
    { venueId: 1, totalBuyIn: 100, prize: 200 },
    { venueId: 1, totalBuyIn: 100, prize: 200 },
    { venueId: 2, totalBuyIn: 100, prize: 0 },
    { venueId: 2, totalBuyIn: 100, prize: 0 },
    { venueId: 3, totalBuyIn: 100, prize: 100 },
  ]

  const insight = buildBankInsights(sessions, (id) => ({ 1: 'A', 2: 'B' })[id])
    .find((item) => item.key === 'venue-comparison')

  assert.equal(insight.title, 'A에서 성과가 가장 좋았어요')
  assert.equal(insight.action.venueId, '1')
  assert.match(insight.description, /200.0%p/)
})

test('모든 비교 매장이 손실이면 상대적으로 손실이 적다고 안내한다', () => {
  const sessions = [
    { venueId: 1, totalBuyIn: 100, prize: 20 },
    { venueId: 1, totalBuyIn: 100, prize: 20 },
    { venueId: 2, totalBuyIn: 100, prize: 10 },
    { venueId: 2, totalBuyIn: 100, prize: 10 },
    { venueId: 3, totalBuyIn: 100, prize: 0 },
  ]

  const insight = buildBankInsights(sessions, (id) => ({ 1: 'A', 2: 'B' })[id])
    .find((item) => item.key === 'venue-comparison')

  assert.equal(insight.title, 'A에서 손실이 상대적으로 적었어요')
  assert.equal(insight.tone, 'caution')
})

test('기록 핸드가 적으면 수치를 단정하지 않는다', () => {
  const insights = buildPlayInsights(Array.from({ length: 9 }, () => ({ position: 'BTN', actionType: 'OPEN' })))

  assert.deepEqual(insights.map((item) => item.key), ['hand-sample'])
  assert.equal(insights[0].confidence.key, 'low')
})

test('충분히 기록된 포지션의 참여 패턴과 근거 링크를 만든다', () => {
  const hands = [
    ...Array.from({ length: 6 }, () => ({ position: 'BTN', actionType: 'OPEN' })),
    ...Array.from({ length: 4 }, () => ({ position: 'BTN', actionType: 'FOLD' })),
    ...Array.from({ length: 5 }, () => ({ position: 'BB', actionType: 'FOLD' })),
  ]

  const insight = buildPlayInsights(hands).find((item) => item.key === 'position')

  assert.equal(insight.title, 'BTN에서 가장 자주 참여했어요')
  assert.match(insight.description, /VPIP 60.0%/)
  assert.deepEqual(insight.action, { type: 'position', position: 'BTN', label: 'BTN 근거 보기' })
})
