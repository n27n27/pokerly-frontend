import { getHandStrength } from 'src/utils/handLogHandAnalysis'

const ACTION_LABEL_MAP = {
  FOLD: '폴드',
  CHECK: '체크',
  LIMP: '림프',
  CALL: '콜',
  OPEN: '오픈',
  THREE_BET: '3벳',
  FOUR_BET_PLUS: '4벳+',
  BB_DEFENSE: 'BB 방어',
}

const RESULT_LABEL_MAP = {
  FOLD: '폴드',
  NON_SHOWDOWN_WIN: '노쇼다운 승리',
  SHOWDOWN_WIN: '쇼다운 승리',
  SHOWDOWN_LOSS: '쇼다운 패배',
  CHOP: '찹',
  NOT_RECORDED: '',
}

const formatNumber = (value) => {
  if (value === null || value === undefined || value === '') {
    return ''
  }

  return Number(value).toLocaleString('ko-KR')
}

const formatDateTime = (value) => {
  if (!value) {
    return ''
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
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

const getHandStrengthLabel = (hand) => {
  const handValue = getHandValue(hand)

  return hand?.handStrengthLabel || getHandStrength(handValue).label
}

const getHandMetaLines = (hand) => {
  const lines = []

  const positionText = hand?.positionLabel || hand?.position || ''
  const actionText = hand?.actionLabel || ACTION_LABEL_MAP[hand?.actionType] || ''
  const resultText =
    hand?.resultType && hand.resultType !== 'NOT_RECORDED'
      ? hand?.resultLabel || RESULT_LABEL_MAP[hand.resultType] || ''
      : ''

  if (positionText) {
    lines.push(`   포지션: ${positionText}`)
  }

  if (actionText) {
    lines.push(`   액션: ${actionText}${hand?.preflopAllIn ? ' 올인' : ''}`)
  } else if (hand?.preflopAllIn) {
    lines.push('   액션: 올인')
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

  return lines
}

const formatHandBlock = (hand, index) => {
  const header = `${index + 1}. ${getHandValue(hand)} [${getHandStrengthLabel(hand)}]`
  const metaLines = getHandMetaLines(hand)

  if (metaLines.length === 0) {
    return header
  }

  return [header, ...metaLines].join('\n')
}

export const buildLevelReviewText = ({
  event,
  blindLevel,
  hands,
  heroStack,
  averageStack,
  note,
}) => {
  const orderedHands = sortByCreatedAtAsc(hands)

  const lines = [
    '[Pokerly 레벨 복기 요청]',
    '',
    `대회: ${event?.name || '대회명 미입력'}`,
    `구간: L${blindLevel?.levelNo || '-'} · ${formatBlind(blindLevel)}`,
  ]

  if (heroStack) {
    lines.push(`내 스택: ${formatNumber(heroStack)}`)
  }

  if (averageStack) {
    lines.push(`에버 스택: ${formatNumber(averageStack)}`)
  }

  if (note?.trim()) {
    lines.push(`추가 메모: ${note.trim()}`)
  }

  lines.push('', `기록 핸드: ${orderedHands.length}개`, '')

  if (orderedHands.length === 0) {
    lines.push('핸드 기록 없음')
  } else {
    lines.push('핸드 기록:')
    lines.push('')

    orderedHands.forEach((hand, index) => {
      lines.push(formatHandBlock(hand, index))
      lines.push('')
    })
  }

  lines.push('위 핸드들을 기록 순서대로 보고, 이 레벨의 운영과 주요 판단을 복기해줘.')

  return lines.join('\n').trim()
}

export const buildEventReviewText = (event) => {
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

  const lines = ['[Pokerly 대회 전체 복기 요청]', '', `대회: ${event?.name || '대회명 미입력'}`]

  const eventTime = formatDateTime(event?.eventAt || event?.createdAt)

  if (eventTime) {
    lines.push(`대회 시각: ${eventTime}`)
  }

  lines.push('', '전체 요약:')
  lines.push(`기록 핸드: ${totalHands}개`)
  lines.push(`복기 필요: ${reviewRequiredCount}개`)
  lines.push('')
  lines.push('블라인드별 핸드 기록:')
  lines.push('')

  if (levels.length === 0) {
    lines.push('등록된 블라인드 구간 없음')
  }

  levels.forEach((level) => {
    const orderedHands = sortByCreatedAtAsc(level.hands || [])

    lines.push(`[L${level.levelNo || '-'} · ${formatBlind(level)}]`)

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

  lines.push('이 대회 전체 흐름을 보고, 레벨별 운영과 반복되는 실수를 중심으로 복기해줘.')

  return lines.join('\n').trim()
}
