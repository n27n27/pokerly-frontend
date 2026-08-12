import test from 'node:test'
import assert from 'node:assert/strict'

import { buildEventReviewText } from '../src/utils/handLogExportText.js'

const event = {
  name: '테스트 대회',
  blindLevels: [],
}

test('대회 복기 텍스트에 입력된 테이블 정보를 포함한다', () => {
  const text = buildEventReviewText(event, {
    seats: [
      { seatNumber: 4, nickname: '견대입구', hero: true },
      {
        seatNumber: 2,
        nickname: '빌런',
        handSelection: '루즈',
        aggression: '공격적',
        types: ['매니악'],
        exploitPoints: ['블러프 자주'],
        memo: '리버 오버벳 주의',
      },
    ],
  })

  assert.match(text, /테이블 정보:/)
  assert.match(text, /2번: 빌런/)
  assert.match(text, /성향: 루즈 · 공격적/)
  assert.match(text, /특징: 매니악, 블러프 자주/)
  assert.match(text, /4번: 견대입구 \(나\)/)
})

test('입력된 좌석이 없으면 테이블 영역을 생략한다', () => {
  const text = buildEventReviewText(event)
  assert.doesNotMatch(text, /테이블 정보:/)
})

test('보드와 액션 타임라인을 구조화된 데이터로 내보낸다', () => {
  const text = buildEventReviewText({
    name: '상세 대회',
    blindLevels: [
      {
        levelNo: 3,
        smallBlind: 500,
        bigBlind: 1_000,
        ante: 1_000,
        hands: [
          {
            firstRank: 'A',
            firstSuit: '♥',
            secondRank: 'K',
            secondSuit: '♥',
            holeCards: 'AKs',
            position: 'BTN',
            handedCount: 8,
            actionType: 'OPEN',
            resultType: 'SHOWDOWN_WIN',
            boardCards: JSON.stringify([
              { key: 'flop', cards: [{ rank: 'A', suit: '♠' }, { rank: '7', suit: '♦' }, { rank: '2', suit: '♣' }] },
            ]),
            actionTimeline: JSON.stringify({
              trackedPlayers: ['BTN', 'BB'],
              potSize: 12_000,
              actions: [
                { street: 'PREFLOP', player: 'BTN', type: 'OPEN', amount: 2_500, potAfter: 5_500 },
              ],
            }),
          },
        ],
      },
    ],
  })

  assert.doesNotMatch(text, /복기해줘|복기 요청/)
  assert.match(text, /홀카드: A♥ K♥/)
  assert.match(text, /테이블 인원: 8명/)
  assert.match(text, /보드 FLOP: A♠ 7♦ 2♣/)
  assert.match(text, /PREFLOP \| BTN \| 오픈 2,500 \| 팟 5,500/)
  assert.match(text, /최종 팟: 12,000/)
})

test('일반 패는 쇼다운 패배로 바꾸지 않고 내보낸다', () => {
  const text = buildEventReviewText({
    name: '결과 테스트',
    blindLevels: [
      {
        levelNo: 3,
        smallBlind: 300,
        bigBlind: 500,
        ante: 500,
        hands: [
          {
            holeCards: 'K6s',
            position: 'UTG',
            handedCount: 10,
            actionType: 'CALL',
            actionLabel: '콜 → 폴드',
            resultType: 'LOSS',
          },
        ],
      },
    ],
  })

  assert.match(text, /결과: 패/)
  assert.doesNotMatch(text, /결과: 쇼다운 패배/)
})

test('기존 쇼다운 승패 기록도 복사할 때 일반 승패로 내보낸다', () => {
  const text = buildEventReviewText({
    name: '기존 결과 테스트',
    blindLevels: [
      {
        levelNo: 2,
        smallBlind: 200,
        bigBlind: 300,
        ante: 300,
        hands: [
          { holeCards: 'AA', position: 'UTG', resultType: 'SHOWDOWN_WIN' },
          { holeCards: 'K6s', position: 'BB', resultType: 'SHOWDOWN_LOSS' },
        ],
      },
    ],
  })

  assert.match(text, /결과: 승/)
  assert.match(text, /결과: 패/)
  assert.doesNotMatch(text, /쇼다운 승리|쇼다운 패배/)
})
