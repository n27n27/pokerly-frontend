import test from 'node:test'
import assert from 'node:assert/strict'

import {
  allocateRoundedTotal,
  calculateIcmFinishProbabilities,
} from '../src/utils/icmCalculator.js'

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

test('ICM 소수점 2자리 배분도 총합을 정확히 보존한다', () => {
  const allocated = allocateRoundedTotal([1 / 3, 1 / 3, 1 / 3], 1, 2)

  assert.deepEqual(allocated, [0.34, 0.33, 0.33])
  assert.equal(allocated.reduce((sum, value) => sum + value, 0), 1)
})

test('동일 스택 ICM 순위 확률은 모든 플레이어에게 동일하다', () => {
  const probabilities = calculateIcmFinishProbabilities([100, 100, 100])
  probabilities.forEach((row) => {
    row.forEach((probability) => assert.ok(Math.abs(probability - 1 / 3) < 1e-12))
  })
})

test('ICM의 각 순위 확률 합계는 1을 보존한다', () => {
  const probabilities = calculateIcmFinishProbabilities([500, 300, 200, 100])
  for (let place = 0; place < probabilities.length; place += 1) {
    const total = probabilities.reduce((sum, row) => sum + row[place], 0)
    assert.ok(Math.abs(total - 1) < 1e-12)
  }
})
