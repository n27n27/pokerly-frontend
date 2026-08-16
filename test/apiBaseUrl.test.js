import test from 'node:test'
import assert from 'node:assert/strict'
import { resolveApiBaseUrl } from '../src/utils/apiBaseUrl.js'

test('웹에서는 상대 API 주소를 유지한다', () => {
  assert.equal(
    resolveApiBaseUrl({
      configuredBaseUrl: '/api',
      location: { protocol: 'https:', hostname: 'pokerly.kr' },
    }),
    '/api',
  )
})

test('iOS Capacitor에서는 운영 API 절대 주소를 사용한다', () => {
  assert.equal(
    resolveApiBaseUrl({
      configuredBaseUrl: '/api',
      location: { protocol: 'capacitor:', hostname: 'localhost' },
    }),
    'https://pokerly.kr/api',
  )
})

test('Android Capacitor에서도 운영 API 절대 주소를 사용한다', () => {
  assert.equal(
    resolveApiBaseUrl({
      configuredBaseUrl: '/api',
      location: { protocol: 'https:', hostname: 'localhost' },
    }),
    'https://pokerly.kr/api',
  )
})

test('명시적인 네이티브 API 주소를 우선한다', () => {
  assert.equal(
    resolveApiBaseUrl({
      configuredBaseUrl: '/api',
      nativeBaseUrl: 'https://staging.pokerly.kr/api',
      location: { protocol: 'capacitor:', hostname: 'localhost' },
    }),
    'https://staging.pokerly.kr/api',
  )
})
