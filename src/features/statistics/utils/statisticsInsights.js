import { isVpipAction } from '../../../utils/handLogHandAnalysis.js'

const WIN_RESULTS = new Set(['SHOWDOWN_WIN', 'NON_SHOWDOWN_WIN', 'WIN'])

const numberValue = (value) => Number(value) || 0
const compactAmount = (value) => {
  const amount = Math.round(numberValue(value))
  if (Math.abs(amount) >= 10_000) {
    const man = amount / 10_000
    return `${Number.isInteger(man) ? man : man.toFixed(1)}만`
  }
  return amount.toLocaleString('ko-KR')
}

export const totalBuyInOf = (session) => {
  const buyInPerEntry = numberValue(session?.buyInPerEntry)
  const entries = Math.max(1, numberValue(session?.entries))
  const discount = numberValue(session?.discount)
  if (buyInPerEntry > 0) return Math.max(0, buyInPerEntry * entries - discount)
  return Math.max(0, numberValue(session?.totalBuyIn))
}

const profitOf = (session) => numberValue(session?.prize) - totalBuyInOf(session)
const actionOf = (hand) => hand?.actionType || hand?.preflopAction || ''

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
  const totalBuyIn = sessions.reduce((sum, session) => sum + totalBuyInOf(session), 0)
  const totalPrize = sessions.reduce((sum, session) => sum + numberValue(session.prize), 0)
  const cashed = sessions.filter((session) => numberValue(session.prize) > 0)
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
  } else if (totalProfit < 0 && totalBuyIn > 0) {
    const recoveryRate = totalPrize * 100 / totalBuyIn
    insights.push(sessionInsight(
      'bankroll-recovery',
      `바인 ${compactAmount(totalBuyIn)} 중 ${compactAmount(totalPrize)}을 상금으로 회수했어요`,
      `${sessions.length}개 대회 중 ${cashed.length}개에서 상금을 받았고, 바인 대비 회수율은 ${recoveryRate.toFixed(1)}%입니다.`,
      sessions.length,
      { type: 'tournaments', label: '대회 기록 보기' },
      'caution',
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
    .filter((venue) => venue.list.length >= 5 && venue.buyIn > 0)
    .map((venue) => ({ ...venue, roi: venue.profit * 100 / venue.buyIn }))
    .sort((a, b) => b.roi - a.roi)
  if (comparableVenues.length >= 2 && comparableVenues[0].roi - comparableVenues.at(-1).roi >= 20) {
    const bestVenue = comparableVenues[0]
    const worstVenue = comparableVenues.at(-1)
    const bestVenueTitle = bestVenue.roi >= 0
      ? `${venueNameOf(bestVenue.id)}에서 기록상 ROI가 가장 높아요`
      : `${venueNameOf(bestVenue.id)}에서 손실이 상대적으로 적었어요`
    insights.push(sessionInsight(
      'venue-comparison',
      bestVenueTitle,
      `각 5회 이상 방문한 매장 중 ROI ${bestVenue.roi.toFixed(1)}%로, ${venueNameOf(worstVenue.id)}보다 ${(bestVenue.roi - worstVenue.roi).toFixed(1)}%p 높습니다.`,
      bestVenue.list.length,
      { type: 'venue', venueId: bestVenue.id, label: '이 매장 근거 보기' },
      bestVenue.roi >= 0 ? 'positive' : 'caution',
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

  const participated = hands.filter((hand) => isVpipAction(actionOf(hand)))
  const decided = participated.filter((hand) => String(hand.resultType || hand.result || '').trim())
  const missingResults = participated.length - decided.length
  const wins = decided.filter((hand) => WIN_RESULTS.has(String(hand.resultType || hand.result).toUpperCase())).length
  const winRate = decided.length ? wins / decided.length : 0
  if (participated.length >= 10 && missingResults / participated.length >= 0.3) {
    insights.push({
      key: 'hand-result-missing',
      title: '결과가 비어 있는 참여 핸드가 많아요',
      description: `참여 핸드 ${participated.length}개 중 ${missingResults}개의 결과가 비어 있어 승패 경향을 해석하기 어렵습니다.`,
      sample: participated.length,
      confidence: confidenceForSample(participated.length, [15, 30]),
      action: { type: 'hands', label: '핸드별 근거 보기' },
      tone: 'caution',
    })
  }
  if (decided.length >= 5 && (winRate >= 0.8 || winRate <= 0.2)) {
    const resultLabel = winRate >= 0.8 ? '승리' : '패배'
    insights.push({
      key: 'hand-result-bias',
      title: `결과 기록이 ${resultLabel}에 크게 치우쳐 있어요`,
      description: `결과가 기록된 참여 핸드 ${decided.length}개 중 ${wins}개가 승리했습니다. 선택적으로 기록했다면 실제 플레이 경향과 다를 수 있어요.`,
      sample: decided.length,
      confidence: confidenceForSample(decided.length, [10, 30]),
      action: { type: 'hands', label: '핸드별 근거 보기' },
      tone: 'caution',
    })
  }
  return insights.slice(0, 2)
}
