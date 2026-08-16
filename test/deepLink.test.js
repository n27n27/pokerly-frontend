import test from 'node:test'
import assert from 'node:assert/strict'
import { routeFromDeepLink } from '../src/utils/deepLink.js'

test('maps the Pokerly custom scheme to an app route', () => {
  assert.equal(
    routeFromDeepLink('pokerly://app/tournament/running?source=push'),
    '/app/tournament/running?source=push',
  )
})

test('maps trusted HTTPS and hash links', () => {
  assert.equal(routeFromDeepLink('https://pokerly.kr/app/home'), '/app/home')
  assert.equal(routeFromDeepLink('https://www.pokerly.kr/#/app/tools'), '/app/tools')
})

test('rejects foreign and unsafe links', () => {
  assert.equal(routeFromDeepLink('https://example.com/app/home'), null)
  assert.equal(routeFromDeepLink('javascript:alert(1)'), null)
  assert.equal(routeFromDeepLink('not a url'), null)
})
