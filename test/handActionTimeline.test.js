import test from 'node:test'
import assert from 'node:assert/strict'

import { useHandActionTimeline } from '../src/features/tournament/composables/useHandActionTimeline.js'

const createTimeline = () => useHandActionTimeline({ bigBlind: 200, ante: 200 })

test('블라인드와 앤티를 포함해 프리플랍 팟과 액션 순서를 계산한다', () => {
  const timeline = createTimeline()
  timeline.start(['HJ', 'CO', 'SB', 'BB'], ['HJ', 'CO', 'BTN', 'SB', 'BB'])

  assert.equal(timeline.currentPlayer.value, 'HJ')
  assert.equal(timeline.potSize.value, 500)
  assert.deepEqual(timeline.availableActions.value, ['FOLD', 'LIMP', 'OPEN'])

  assert.equal(timeline.recordAction('OPEN', 500), true)
  assert.equal(timeline.potSize.value, 1000)
  assert.equal(timeline.currentPlayer.value, 'CO')
  assert.equal(timeline.callAmount.value, 500)

  assert.equal(timeline.recordAction('RAISE', 1600), true)
  assert.equal(timeline.potSize.value, 2600)
  assert.equal(timeline.currentPlayer.value, 'SB')
  assert.equal(timeline.callAmount.value, 1500)
})

test('모두 콜하면 체크 순서로 다음 스트리트를 진행한다', () => {
  const timeline = createTimeline()
  timeline.start(['HJ', 'CO', 'BB'], ['HJ', 'CO', 'SB', 'BB'])

  assert.equal(timeline.recordAction('OPEN', 500), true)
  assert.equal(timeline.recordAction('CALL'), true)
  assert.equal(timeline.recordAction('CALL'), true)
  assert.equal(timeline.streetComplete.value, true)
  assert.equal(timeline.advanceStreet(), true)
  assert.equal(timeline.street.value, 'FLOP')
  assert.equal(timeline.currentPlayer.value, 'BB')
  assert.deepEqual(timeline.availableActions.value, ['CHECK', 'BET'])

  assert.equal(timeline.recordAction('CHECK'), true)
  assert.equal(timeline.recordAction('CHECK'), true)
  assert.equal(timeline.recordAction('CHECK'), true)
  assert.equal(timeline.streetComplete.value, true)
  assert.equal(timeline.advanceStreet(), true)
  assert.equal(timeline.street.value, 'TURN')
})

test('숏스택 올인 콜은 필요한 금액까지만 팟에 더하고 액션 대상에서 제외한다', () => {
  const timeline = createTimeline()
  timeline.start(['HJ', 'CO', 'BB'], ['HJ', 'CO', 'SB', 'BB'])

  timeline.recordAction('OPEN', 1000)
  assert.equal(
    timeline.recordAction('CALL', null, { isAllIn: true, allInStack: 600 }),
    true,
  )
  assert.equal(timeline.potSize.value, 2100)
  assert.deepEqual(timeline.allInPlayers.value, ['CO'])
  assert.equal(timeline.currentPlayer.value, 'BB')
})

test('마지막 취소는 팟, 차례, 올인 상태를 액션 전으로 복원한다', () => {
  const timeline = createTimeline()
  timeline.start(['HJ', 'CO', 'BB'], ['HJ', 'CO', 'SB', 'BB'])
  timeline.recordAction('OPEN', 500)
  timeline.recordAction('CALL', null, { isAllIn: true, allInStack: 500 })

  assert.equal(timeline.undo(), true)
  assert.equal(timeline.currentPlayer.value, 'CO')
  assert.equal(timeline.potSize.value, 1000)
  assert.deepEqual(timeline.allInPlayers.value, [])
  assert.equal(timeline.actions.value.length, 1)
})

test('턴까지 기록한 액션을 프리플랍 중간으로 되감아 동일하게 재생한다', () => {
  const timeline = createTimeline()
  timeline.start(['HJ', 'CO', 'BB'], ['HJ', 'CO', 'SB', 'BB'])
  timeline.recordAction('OPEN', 500)
  timeline.recordAction('CALL')
  timeline.recordAction('CALL')
  timeline.advanceStreet()
  timeline.recordAction('CHECK')
  timeline.recordAction('CHECK')
  timeline.recordAction('CHECK')
  timeline.advanceStreet()

  assert.equal(timeline.rewindTo(2, ['HJ', 'CO', 'SB', 'BB']), true)
  assert.equal(timeline.street.value, 'PREFLOP')
  assert.equal(timeline.actions.value.length, 2)
  assert.equal(timeline.currentPlayer.value, 'BB')
  assert.equal(timeline.potSize.value, 1500)
})

test('직렬화한 진행 상태를 다시 불러와 이어서 기록할 수 있다', () => {
  const original = createTimeline()
  original.start(['HJ', 'CO', 'BB'], ['HJ', 'CO', 'SB', 'BB'])
  original.recordAction('OPEN', 500)
  original.recordAction('CALL')

  const restored = createTimeline()
  assert.equal(restored.hydrate(original.serialize()), true)
  assert.equal(restored.currentPlayer.value, 'BB')
  assert.equal(restored.potSize.value, 1500)
  assert.equal(restored.recordAction('FOLD'), true)
  assert.equal(restored.streetComplete.value, true)
  assert.equal(restored.advanceStreet(), true)
  assert.equal(restored.street.value, 'FLOP')
})

test('최소 레이즈보다 작은 일반 레이즈는 상태를 변경하지 않는다', () => {
  const timeline = createTimeline()
  timeline.start(['HJ', 'CO', 'BB'], ['HJ', 'CO', 'SB', 'BB'])
  timeline.recordAction('OPEN', 500)

  assert.equal(timeline.minRaiseAmount.value, 800)
  assert.equal(timeline.recordAction('RAISE', 700), false)
  assert.equal(timeline.currentPlayer.value, 'CO')
  assert.equal(timeline.potSize.value, 1000)
  assert.equal(timeline.actions.value.length, 1)
})
