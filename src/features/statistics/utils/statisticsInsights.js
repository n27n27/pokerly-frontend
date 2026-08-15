import { isPfrAction, isVpipAction } from '../../../utils/handLogHandAnalysis.js'

const WIN_RESULTS = new Set(['SHOWDOWN_WIN', 'NON_SHOWDOWN_WIN', 'WIN'])

const numberValue = (value) => Number(value) || 0

export const totalBuyInOf = (session) => {
  const buyInPerEntry = numberValue(session?.buyInPerEntry)
  const entries = Math.max(1, numberValue(session?.entries))
  const discount = numberValue(session?.discount)
  if (buyInPerEntry > 0) return Math.max(0, buyInPerEntry * entries - discount)
  return Math.max(0, numberValue(session?.totalBuyIn))
}

const profitOf = (session) => numberValue(session?.prize) - totalBuyInOf(session)
const actionOf = (hand) => hand?.actionType || hand?.preflopAction || ''
const normalizePosition = (position) => {
  const value = String(position || '').trim().toUpperCase()
  if (value === 'UTG+1') return 'UTG'
  if (['UTG+2', 'UTG+3'].includes(value)) return 'MP'
  return value
}

export const confidenceForSample = (sample, thresholds = [5, 15]) => {
  if (sample < thresholds[0]) return { key: 'low', label: '참고', description: '표본이 적어 경향만 확인하세요.' }
  if (sample < thresholds[1]) return { key: 'medium', label: '보통', description: '기록이 더 쌓이면 판단이 선명해집니다.' }
  return { key: 'high', label: '충분', description: '현재 기록에서 반복되는 경향입니다.' }
}

const sessionInsight = (key, title, description, sample, action = null, tone = 'neutral') => ({
  key,
  title,
  description,
  sample,
  confidence: confidenceForSample(sample),
  action,
  tone,
})

export const buildBankInsights = (sessions, venueNameOf = () => '기타') => {
  if (!sessions.length) return []
  const insights = []
  const totalProfit = sessions.reduce((sum, session) => sum + profitOf(session), 0)
  const profitable = sessions.filter((session) => profitOf(session) > 0)
  const best = sessions.reduce((current, session) =>
    !current || profitOf(session) > profitOf(current) ? session : current, null)
  const bestProfit = profitOf(best)
  const concentration = totalProfit > 0 && bestProfit > 0 ? bestProfit / totalProfit : 0

  if (sessions.length < 5) {
    insights.push(sessionInsight(
      'sample',
      '기록을 더 모으는 단계예요',
      `현재 ${sessions.length}개 대회 기준입니다. 수익 패턴은 최소 5개부터 비교해 보세요.`,
      sessions.length,
    ))
  } else if (concentration >= 0.7) {
    insights.push(sessionInsight(
      'profit-concentration',
      '수익이 한 대회에 크게 집중됐어요',
      `최고 수익 대회 한 번이 현재 순수익의 ${Math.round(concentration * 100)}%를 만들었습니다. 장기 성과로 단정하기보다 변동성을 함께 보세요.`,
      sessions.length,
      { type: 'tournaments', label: '대회 기록 보기' },
      'caution',
    ))
  } else {
    insights.push(sessionInsight(
      'profit-frequency',
      totalProfit >= 0 ? '수익 대회가 고르게 쌓이고 있어요' : '손실 빈도를 먼저 확인해 보세요',
      `${sessions.length}개 중 ${profitable.length}개가 수익 대회이며, 전체 순수익은 ${totalProfit >= 0 ? '플러스' : '마이너스'}입니다.`,
      sessions.length,
      { type: 'tournaments', label: '대회 기록 보기' },
      totalProfit >= 0 ? 'positive' : 'caution',
    ))
  }

  const venueGroups = new Map()
  sessions.forEach((session) => {
    const key = session.venueId == null ? 'other' : String(session.venueId)
    const group = venueGroups.get(key) || []
    group.push(session)
    venueGroups.set(key, group)
  })
  const comparableVenues = [...venueGroups.entries()]
    .map(([id, list]) => ({
      id,
      list,
      profit: list.reduce((sum, session) => sum + profitOf(session), 0),
      buyIn: list.reduce((sum, session) => sum + totalBuyInOf(session), 0),
    }))
    .filter((venue) => venue.list.length >= 2 && venue.buyIn > 0)
    .map((venue) => ({ ...venue, roi: venue.profit * 100 / venue.buyIn }))
    .sort((a, b) => b.roi - a.roi)
  if (comparableVenues.length >= 2) {
    const bestVenue = comparableVenues[0]
    const worstVenue = comparableVenues.at(-1)
    const bestVenueTitle = bestVenue.roi >= 0
      ? `${venueNameOf(bestVenue.id)}에서 성과가 가장 좋았어요`
      : `${venueNameOf(bestVenue.id)}에서 손실이 상대적으로 적었어요`
    insights.push(sessionInsight(
      'venue-comparison',
      bestVenueTitle,
      `각 2회 이상 방문한 매장 중 ROI ${bestVenue.roi.toFixed(1)}%로, ${venueNameOf(worstVenue.id)}보다 ${(bestVenue.roi - worstVenue.roi).toFixed(1)}%p 높습니다.`,
      bestVenue.list.length,
      { type: 'venue', venueId: bestVenue.id, label: '이 매장 근거 보기' },
      bestVenue.roi >= 0 ? 'positive' : 'caution',
    ))
  }

  const reentrySessions = sessions.filter((session) => Math.max(1, numberValue(session.entries)) > 1)
  const singleEntrySessions = sessions.filter((session) => Math.max(1, numberValue(session.entries)) === 1)
  if (reentrySessions.length >= 3 && singleEntrySessions.length >= 3) {
    const roiOf = (list) => {
      const buyIn = list.reduce((sum, session) => sum + totalBuyInOf(session), 0)
      return buyIn ? list.reduce((sum, session) => sum + profitOf(session), 0) * 100 / buyIn : 0
    }
    const reentryRoi = roiOf(reentrySessions)
    const singleRoi = roiOf(singleEntrySessions)
    insights.push(sessionInsight(
      'reentry',
      reentryRoi < singleRoi ? '리엔트리 대회의 비용 효율이 낮아요' : '리엔트리 대회 성과가 더 좋아요',
      `리엔트리 대회 ROI ${reentryRoi.toFixed(1)}%, 단일 엔트리 ROI ${singleRoi.toFixed(1)}%입니다.`,
      reentrySessions.length,
      { type: 'tournaments', label: '대회 기록 보기' },
      reentryRoi < singleRoi ? 'caution' : 'positive',
    ))
  }

  return insights.slice(0, 3)
}

export const buildPlayInsights = (hands) => {
  if (!hands.length) return []
  const insights = []
  const confidence = confidenceForSample(hands.length, [10, 30])
  if (hands.length < 10) {
    insights.push({
      key: 'hand-sample',
      title: '플레이 패턴을 모으는 단계예요',
      description: `기록된 ${hands.length}핸드만 기준으로는 포지션·핸드 성향을 단정하기 어렵습니다.`,
      sample: hands.length,
      confidence,
      action: { type: 'hands', label: '기록 핸드 보기' },
      tone: 'neutral',
    })
    return insights
  }

  const positions = new Map()
  hands.forEach((hand) => {
    const position = normalizePosition(hand.position)
    if (!position) return
    const group = positions.get(position) || []
    group.push(hand)
    positions.set(position, group)
  })
  const positionRows = [...positions.entries()]
    .filter(([, list]) => list.length >= 3)
    .map(([position, list]) => ({
      position,
      sample: list.length,
      vpip: list.filter((hand) => isVpipAction(actionOf(hand))).length * 100 / list.length,
      pfr: list.filter((hand) => isPfrAction(actionOf(hand))).length * 100 / list.length,
    }))
    .sort((a, b) => b.vpip - a.vpip)
  if (positionRows.length) {
    const row = positionRows[0]
    insights.push({
      key: 'position',
      title: `${row.position}에서 가장 자주 참여했어요`,
      description: `기록된 ${row.sample}핸드에서 VPIP ${row.vpip.toFixed(1)}%, PFR ${row.pfr.toFixed(1)}%입니다. 실제로 기록한 핸드만 비교한 수치입니다.`,
      sample: row.sample,
      confidence: confidenceForSample(row.sample, [5, 15]),
      action: { type: 'position', position: row.position, label: `${row.position} 근거 보기` },
      tone: 'neutral',
    })
  }

  const participated = hands.filter((hand) => isVpipAction(actionOf(hand)))
  const decided = participated.filter((hand) => String(hand.resultType || hand.result || '').trim())
  const wins = decided.filter((hand) => WIN_RESULTS.has(String(hand.resultType || hand.result).toUpperCase())).length
  if (decided.length >= 5) {
    insights.push({
      key: 'recorded-results',
      title: '참여 핸드 결과를 확인해 보세요',
      description: `결과가 기록된 참여 핸드 ${decided.length}개 중 ${wins}개가 승리했습니다. 칩 수익률이 아니라 기록된 승패 비율입니다.`,
      sample: decided.length,
      confidence: confidenceForSample(decided.length, [10, 30]),
      action: { type: 'hands', label: '핸드별 근거 보기' },
      tone: wins * 2 >= decided.length ? 'positive' : 'caution',
    })
  }
  return insights.slice(0, 2)
}
