import test from 'node:test'
import assert from 'node:assert/strict'

import { allocateRoundedTotal } from '../src/utils/icmCalculator.js'

test('균등 찹이 나누어떨어지지 않아도 표시 금액 합계를 보존한다', () => {
  const allocated = allocateRoundedTotal([250.25, 250.25, 250.25, 250.25], 1001)

  assert.deepEqual(allocated, [251, 250, 250, 250])
  assert.equal(allocated.reduce((sum, value) => sum + value, 0), 1001)
})

test('소수점이 큰 순서대로 나머지를 안정적으로 배분한다', () => {
  const allocated = allocateRoundedTotal([10.1, 20.8, 30.6], 62)

  assert.deepEqual(allocated, [10, 21, 31])
  assert.equal(allocated.reduce((sum, value) => sum + value, 0), 62)
})

test('빈 배분 대상은 안전하게 빈 결과를 반환한다', () => {
  assert.deepEqual(allocateRoundedTotal([], 100), [])
})
