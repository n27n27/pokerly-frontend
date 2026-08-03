import test from 'node:test'
import assert from 'node:assert/strict'

import { formatLocalDate } from '../src/utils/localDate.js'

test('로컬 날짜를 UTC 변환 없이 포맷한다', () => {
  const date = new Date(2026, 7, 3, 0, 5)
  assert.equal(formatLocalDate(date), '2026-08-03')
  assert.equal(formatLocalDate(date, '.'), '2026.08.03')
})
