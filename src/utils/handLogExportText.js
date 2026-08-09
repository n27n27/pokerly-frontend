import { getActionLabel, getResultLabel } from './handLogHandAnalysis.js'

const formatNumber = (value) => {
  if (value === null || value === undefined || value === '') {
    return ''
  }

  return Number(value).toLocaleString('ko-KR')
}

const formatBlind = (level) => {
  if (!level) {
    return ''
  }

  return `${formatNumber(level.smallBlind)} / ${formatNumber(level.bigBlind)} / ${formatNumber(
    level.ante || 0,
  )}`
}

const sortByCreatedAtAsc = (items) => {
  return [...(items || [])].sort((a, b) => {
    const createdCompare = String(a.createdAt || '').localeCompare(String(b.createdAt || ''))

    if (createdCompare !== 0) {
      return createdCompare
    }

    return Number(a.id || 0) - Number(b.id || 0)
  })
}

const sortLevelsAsc = (levels) => {
  return [...(levels || [])].sort((a, b) => {
    const levelCompare = Number(a.levelNo || 0) - Number(b.levelNo || 0)

    if (levelCompare !== 0) {
      return levelCompare
    }

    return String(a.createdAt || '').localeCompare(String(b.createdAt || ''))
  })
}

const getHandValue = (hand) => {
  return hand?.holeCards || hand?.hand || '핸드 미입력'
}

const parseJson = (value, fallback) => {
  if (!value) return fallback
  if (typeof value !== 'string') return value
  try {
    return JSON.parse(value)
  } catch {
    return fallback
  }
}

const formatCard = (card) => {
  if (!card) return ''
  if (typeof card === 'string') return card
  return `${card.rank || ''}${card.suit || ''}`
}

const formatHoleCards = (hand) => {
  const exactCards = [
    formatCard({ rank: hand?.firstRank, suit: hand?.firstSuit }),
    formatCard({ rank: hand?.secondRank, suit: hand?.secondSuit }),
  ].filter((card) => card && card !== 'undefinedundefined')
  return exactCards.length === 2 ? exactCards.join(' ') : getHandValue(hand)
}

const ACTION_TEXT = {
  FOLD: '폴드',
  CHECK: '체크',
  CALL: '콜',
  LIMP: '림프',
  OPEN: '오픈',
  BET: '베팅',
  RAISE: '레이즈',
}

const formatTimeline = (hand) => {
  const timeline = parseJson(hand?.actionTimeline, null)
  if (!timeline) return []

  const lines = []
  if (timeline.trackedPlayers?.length) {
    lines.push(`   참여 포지션: ${timeline.trackedPlayers.join(', ')}`)
  }

  const board = parseJson(hand?.boardCards, [])
  board.forEach((street) => {
    const cards = (street.cards || []).map(formatCard).filter(Boolean)
    if (cards.length) lines.push(`   보드 ${String(street.key || street.name || '').toUpperCase()}: ${cards.join(' ')}`)
  })

  const showdownEntries = Object.entries(timeline.showdownCards || {}).filter(([, cards]) =>
    cards?.some(Boolean),
  )
  showdownEntries.forEach(([player, cards]) => {
    lines.push(`   쇼다운 ${player}: ${cards.map(formatCard).filter(Boolean).join(' ')}`)
  })

  if (timeline.actions?.length) {
    lines.push('   액션:')
    timeline.actions.forEach((action, index) => {
      const actionName = ACTION_TEXT[action.type] || action.type || '-'
      const amount = Number(action.isAllIn ? action.allInStack || action.amount : action.amount)
      const amountText = amount > 0 ? ` ${formatNumber(amount)}` : ''
      const allInText = action.isAllIn ? ' · 올인' : ''
      const potText = Number(action.potAfter) > 0 ? ` | 팟 ${formatNumber(action.potAfter)}` : ''
      lines.push(
        `     ${index + 1}. ${action.street || '-'} | ${action.player || '-'} | ${actionName}${amountText}${allInText}${potText}`,
      )
    })
  }
  if (Number(timeline.potSize) > 0) lines.push(`   최종 팟: ${formatNumber(timeline.potSize)}`)
  return lines
}

const getActionText = (hand) => {
  if (!hand?.actionType && !hand?.preflopAllIn) {
    return ''
  }

  const actionText = hand?.actionLabel || getActionLabel(hand?.actionType)

  if (actionText && hand?.preflopAllIn) {
    return `${actionText} 올인`
  }

  if (actionText) {
    return actionText
  }

  return hand?.preflopAllIn ? '올인' : ''
}

const getResultText = (hand) => {
  if (!hand?.resultType || hand.resultType === 'NOT_RECORDED') {
    return ''
  }

  return hand?.resultLabel || getResultLabel(hand.resultType)
}

const getHandMetaLines = (hand) => {
  const lines = []

  const positionText = hand?.positionLabel || hand?.position || ''
  const actionText = getActionText(hand)
  const resultText = getResultText(hand)

  lines.push(`   홀카드: ${formatHoleCards(hand)}`)
  if (positionText) lines.push(`   포지션: ${positionText}`)
  if (hand?.handedCount) lines.push(`   테이블 인원: ${hand.handedCount}명`)

  if (actionText) {
    lines.push(`   액션: ${actionText}`)
  }

  if (resultText) {
    lines.push(`   결과: ${resultText}`)
  }

  if (hand?.reviewRequired) {
    lines.push('   복기 필요: 예')
  }

  if (hand?.memo) {
    lines.push(`   메모: ${hand.memo}`)
  }

  lines.push(...formatTimeline(hand))

  return lines
}

const formatHandBlock = (hand, index) => {
  const header = `[핸드 ${index + 1}]`
  const metaLines = getHandMetaLines(hand)

  if (metaLines.length === 0) {
    return header
  }

  return [header, ...metaLines].join('\n')
}

export const buildLevelReviewText = ({ event, blindLevel, hands }) => {
  const orderedHands = sortByCreatedAtAsc(hands)

  const lines = [
    '[대회]',
    `이름: ${event?.name || '-'}`,
    '',
    '[레벨]',
    `레벨: L${blindLevel?.levelNo || '-'}`,
    `블라인드: ${formatBlind(blindLevel)}`,
  ]

  const startStack = blindLevel?.startStack
  const endStack = blindLevel?.endStack
  const averageStackValue = blindLevel?.averageStack
  const levelMemo = blindLevel?.memo

  if (startStack) {
    lines.push(`시작 스택: ${formatNumber(startStack)}`)
  }

  if (endStack) {
    lines.push(`마감 스택: ${formatNumber(endStack)}`)
  }

  if (averageStackValue) {
    lines.push(`에버 스택: ${formatNumber(averageStackValue)}`)
  }

  if (levelMemo?.trim()) {
    lines.push(`레벨 메모: ${levelMemo.trim()}`)
  }

  lines.push(`핸드 수: ${orderedHands.length}`, '')

  if (orderedHands.length === 0) {
    lines.push('핸드 기록 없음')
  } else {
    orderedHands.forEach((hand, index) => {
      lines.push(formatHandBlock(hand, index))
      lines.push('')
    })
  }

  return lines.join('\n').trim()
}

const buildSeatReviewLines = (seats = []) => {
  const assignedSeats = [...seats]
    .filter((seat) => seat && Number(seat.seatNumber) > 0)
    .sort((a, b) => Number(a.seatNumber) - Number(b.seatNumber))

  if (!assignedSeats.length) return []

  const lines = ['', '테이블 정보:']
  assignedSeats.forEach((seat) => {
    const nickname = seat.hero ? `${seat.nickname || '나'} (나)` : seat.nickname || '닉네임 미입력'
    const tendencies = [seat.handSelection, seat.aggression].filter(Boolean)
    const tags = [...(seat.types || []), ...(seat.exploitPoints || [])].filter(Boolean)

    lines.push(`- ${seat.seatNumber}번: ${nickname}`)
    if (tendencies.length) lines.push(`  성향: ${tendencies.join(' · ')}`)
    if (tags.length) lines.push(`  특징: ${tags.join(', ')}`)
    if (seat.memo?.trim()) lines.push(`  메모: ${seat.memo.trim()}`)
  })

  return lines
}

export const buildEventReviewText = (event, { seats = [] } = {}) => {
  const levels = sortLevelsAsc(event?.blindLevels || [])

  const totalHands = levels.reduce((sum, level) => {
    return sum + (level.hands?.length || level.handCount || 0)
  }, 0)

  const reviewRequiredCount = levels.reduce((sum, level) => {
    if (Array.isArray(level.hands)) {
      return sum + level.hands.filter((hand) => hand.reviewRequired).length
    }

    return sum + (level.reviewRequiredCount || 0)
  }, 0)

  const lines = ['[대회]', `이름: ${event?.name || '-'}`]

  lines.push(`기록 핸드: ${totalHands}`)
  lines.push(`복기 필요: ${reviewRequiredCount}`)
  lines.push(...buildSeatReviewLines(seats))
  lines.push('')

  if (levels.length === 0) {
    lines.push('등록된 블라인드 구간 없음')
  }

  levels.forEach((level) => {
    const orderedHands = sortByCreatedAtAsc(level.hands || [])

    lines.push(`[레벨 L${level.levelNo || '-'}]`)
    lines.push(`블라인드: ${formatBlind(level)}`)
    if (level.startStack) lines.push(`시작 스택: ${formatNumber(level.startStack)}`)
    if (level.endStack) lines.push(`마감 스택: ${formatNumber(level.endStack)}`)
    if (level.averageStack) lines.push(`평균 스택: ${formatNumber(level.averageStack)}`)
    if (level.memo?.trim()) lines.push(`레벨 메모: ${level.memo.trim()}`)
    lines.push(`핸드 수: ${orderedHands.length}`)

    if (orderedHands.length === 0) {
      lines.push('핸드 기록 없음')
      lines.push('')
      return
    }

    orderedHands.forEach((hand, index) => {
      lines.push(formatHandBlock(hand, index))
      lines.push('')
    })
  })

  return lines.join('\n').trim()
}
