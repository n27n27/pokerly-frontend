import test from 'node:test'
import assert from 'node:assert/strict'

import { isTerminalRefreshError } from '../src/utils/authError.js'

test('refresh token이 거부된 경우에만 세션 만료로 판단한다', () => {
  assert.equal(isTerminalRefreshError({ response: { status: 400 } }), true)
  assert.equal(isTerminalRefreshError({ response: { status: 401 } }), true)
  assert.equal(isTerminalRefreshError({ response: { status: 403 } }), true)
})

test('네트워크 및 서버 장애에서는 로그인 세션을 보존한다', () => {
  assert.equal(isTerminalRefreshError({ code: 'ECONNABORTED' }), false)
  assert.equal(isTerminalRefreshError({ response: { status: 500 } }), false)
  assert.equal(isTerminalRefreshError({ response: { status: 503 } }), false)
})
