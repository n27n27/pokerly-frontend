import assert from 'node:assert/strict'
import test from 'node:test'

import { normalizeHand } from '../src/utils/handLogHandAnalysis.js'

test('카드 입력 순서와 10 표기를 표준 프리플랍 표기로 합친다', () => {
  assert.equal(normalizeHand('JAo'), 'AJo')
  assert.equal(normalizeHand('AJo'), 'AJo')
  assert.equal(normalizeHand('J10s'), 'JTs')
  assert.equal(normalizeHand('10Js'), 'JTs')
})
