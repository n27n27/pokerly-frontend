import assert from 'node:assert/strict'
import test from 'node:test'

import {
  isThreeBetPlusHand,
  orderHoleCardFields,
  orderHoleCards,
} from '../src/utils/handLogHandAnalysis.js'

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
