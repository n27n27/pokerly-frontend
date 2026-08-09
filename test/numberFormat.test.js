import test from 'node:test'
import assert from 'node:assert/strict'

import { formatCompactNumber } from '../src/utils/numberFormat.js'

test('한국어 금액을 만·억 단위로 축약한다', () => {
  assert.equal(formatCompactNumber(11_900_000, { signDisplay: 'exceptZero' }), '+1,190만')
  assert.equal(formatCompactNumber(-100_000, { signDisplay: 'exceptZero' }), '-10만')
  assert.equal(formatCompactNumber(123_456_789), '1.2억')
})

test('영어 로케일에서는 K·M 단위로 축약한다', () => {
  assert.equal(
    formatCompactNumber(11_900_000, { locale: 'en-US', signDisplay: 'exceptZero' }),
    '+11.9M',
  )
})
