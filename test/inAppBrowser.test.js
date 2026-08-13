import test from 'node:test'
import assert from 'node:assert/strict'

import { isKakaoInAppBrowser } from '../src/utils/inAppBrowser.js'

test('Android 카카오톡 인앱 브라우저를 감지한다', () => {
  const androidKakao =
    'Mozilla/5.0 (Linux; Android 14; SM-S928N) AppleWebKit/537.36 KAKAOTALK 25.6.3'

  assert.equal(isKakaoInAppBrowser(androidKakao), true)
})

test('iOS 카카오톡 인앱 브라우저를 감지한다', () => {
  const iosKakao =
    'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 KAKAOTALK 25.6.3'

  assert.equal(isKakaoInAppBrowser(iosKakao), true)
})

test('일반 Android 브라우저는 외부 브라우저 전환 대상으로 감지하지 않는다', () => {
  const androidChrome =
    'Mozilla/5.0 (Linux; Android 14; SM-S928N) AppleWebKit/537.36 Chrome/138.0 Mobile Safari/537.36'

  assert.equal(isKakaoInAppBrowser(androidChrome), false)
})
