<template>
  <q-page class="preflop-page tournament-analysis-page">
    <header class="detail-topbar tournament-analysis-topbar">
      <button type="button" aria-label="뒤로 가기" @click="router.back()">
        <q-icon name="chevron_left" size="28px" />
      </button>
      <h1>프리플랍 분석</h1>
      <span aria-hidden="true"></span>
    </header>

    <section class="feature-summary" aria-labelledby="feature-summary-title">
      <h2 id="feature-summary-title">이번 대회 특징</h2>
      <div class="feature-card">
        <ul v-if="tournamentFeatures.length">
          <li v-for="feature in tournamentFeatures" :key="feature">{{ feature }}</li>
        </ul>
        <p v-else>아직 요약할 핸드 기록이 없습니다.</p>
      </div>
    </section>

    <section class="kpi-grid" aria-label="핵심 지표">
      <div v-for="metric in metrics" :key="metric.label">
        <span>{{ metric.label }}</span>
        <strong>{{ metric.value }}</strong>
      </div>
    </section>

    <section class="stats-section">
      <h2>프리플랍 액션 분포</h2>
      <div class="action-card">
        <div v-for="item in actions" :key="item.label" class="action-row">
          <span>{{ item.label }}</span>
          <i><b :style="{ width: item.rate }"></b></i>
          <strong>{{ item.rate }}</strong>
          <small>{{ item.count }}회</small>
        </div>
      </div>
    </section>

    <section class="stats-section">
      <h2>포지션별 참여율</h2>
      <PlayAnalysisAccordionList
        :rows="positionRows"
        summary-mode="rates"
        row-detail
        @row-detail="openPositionDetail"
      />
    </section>

  </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { fetchGameSession } from 'src/api/gameSession'
import { useAlert } from 'src/composables/useAlert'
import { useHandLogStore } from 'src/stores/handLog'
import PlayAnalysisAccordionList from 'src/features/statistics/components/PlayAnalysisAccordionList.vue'
import { buildAnalysisRows } from 'src/features/statistics/utils/playAnalysis'
import {
  THREE_BET_PLUS_ACTIONS,
  isPfrAction,
  isVpipAction,
  normalizeHand,
} from 'src/utils/handLogHandAnalysis'

const route = useRoute()
const router = useRouter()
const alert = useAlert()
const handLogStore = useHandLogStore()
const tournamentId = computed(() => route.params.tournamentId)
const session = ref(null)
const eventId = computed(() => route.query.legacyEventId || session.value?.handLogEventId || null)
const event = computed(() =>
  String(handLogStore.selectedEvent?.id) === String(eventId.value)
    ? handLogStore.selectedEvent
    : null,
)
const allHands = computed(() =>
  (event.value?.blindLevels || []).flatMap((level) => level.hands || []),
)

const metrics = computed(() => {
  const hands = allHands.value
  const total = hands.length
  const vpipCount = hands.filter((hand) =>
    isVpipAction(hand.actionType || hand.preflopAction || ''),
  ).length
  const pfrCount = hands.filter((hand) =>
    isPfrAction(hand.actionType || hand.preflopAction || ''),
  ).length
  const threeBetCount = hands.filter((hand) =>
    THREE_BET_PLUS_ACTIONS.has(hand.actionType || hand.preflopAction || ''),
  ).length

  return [
    { label: 'VPIP', value: formatRate(vpipCount, total) },
    { label: 'PFR', value: formatRate(pfrCount, total) },
    { label: '3Bet', value: formatRate(threeBetCount, total) },
    { label: '참여 핸드 수', value: String(vpipCount) },
  ]
})

const positionOrder = ['UTG', 'UTG+1', 'UTG+2', 'MP', 'LJ', 'HJ', 'CO', 'BTN', 'SB', 'BB']
const formatRate = (count, total) => (total > 0 ? `${Math.round((count / total) * 100)}%` : '-')
const actionType = (hand) => hand.actionType || hand.preflopAction || ''
const actionGroups = [
  { label: '폴드', matches: (value) => value === 'FOLD' },
  { label: '콜', matches: (value) => ['LIMP', 'CALL', 'BB_DEFENSE'].includes(value) },
  {
    label: '오픈',
    matches: (value) =>
      ['OPEN', 'ISO_RAISE', 'OPEN_FOLD_TO_3BET', 'OPEN_CALL_3BET'].includes(value),
  },
  { label: '3Bet+', matches: (value) => THREE_BET_PLUS_ACTIONS.has(value) },
]
const actions = computed(() =>
  actionGroups.map((group) => {
    const count = allHands.value.filter((hand) => group.matches(actionType(hand))).length
    return {
      label: group.label,
      count,
      rate: allHands.value.length ? formatRate(count, allHands.value.length) : '0%',
    }
  }),
)
const joinKorean = (values) => {
  if (values.length <= 1) return values[0] || ''
  return `${values.slice(0, -1).join(', ')}와 ${values.at(-1)}`
}
const tournamentFeatures = computed(() => {
  const hands = allHands.value
  if (!hands.length) return []

  const features = []
  const participatedByPosition = new Map()
  hands.forEach((hand) => {
    if (!hand.position || !isVpipAction(actionType(hand))) return
    participatedByPosition.set(
      hand.position,
      (participatedByPosition.get(hand.position) || 0) + 1,
    )
  })
  const maxPositionCount = Math.max(0, ...participatedByPosition.values())
  if (maxPositionCount > 0) {
    const topPositions = positionOrder.filter(
      (position) => participatedByPosition.get(position) === maxPositionCount,
    )
    features.push(`${joinKorean(topPositions)}에서 가장 많이 참여했습니다.`)
  }

  const maxActionCount = Math.max(0, ...actions.value.map((item) => item.count))
  if (maxActionCount > 0) {
    const topActions = actions.value
      .filter((item) => item.count === maxActionCount)
      .map((item) => item.label)
    const label = joinKorean(topActions)
    const particle = topActions.length > 1 || ['폴드', '3Bet+'].includes(label) ? '가' : '이'
    features.push(`${label}${particle} 가장 많이 기록된 프리플랍 액션입니다.`)
  }

  const threeBetCount = hands.filter((hand) =>
    THREE_BET_PLUS_ACTIONS.has(actionType(hand)),
  ).length
  if (threeBetCount > 0) features.push(`3Bet은 ${threeBetCount}회 기록했습니다.`)

  const bbDefenseCount = hands.filter(
    (hand) =>
      hand.position === 'BB' &&
      ['CALL', 'BB_DEFENSE'].includes(actionType(hand)),
  ).length
  if (bbDefenseCount > 0) features.push(`BB 방어는 ${bbDefenseCount}회 기록했습니다.`)

  const premiumHands = new Set(['AA', 'KK', 'QQ', 'JJ', 'TT', 'AKs', 'AKo', 'AK', 'AQs'])
  const premiumCount = hands.filter((hand) =>
    premiumHands.has(normalizeHand(hand.holeCards || hand.hand)),
  ).length
  if (premiumCount > 0) features.push(`프리미엄 핸드는 ${premiumCount}회 기록했습니다.`)

  return features.slice(0, 4)
})

const normalizePosition = (position) => {
  const value = String(position || '').trim().toUpperCase()
  if (value === 'UTG+1') return 'UTG'
  if (['UTG+2', 'UTG+3'].includes(value)) return 'MP'
  return value
}
const positionRows = computed(() => buildAnalysisRows(
  ['UTG', 'MP', 'LJ', 'HJ', 'CO', 'BTN', 'SB', 'BB'],
  allHands.value,
  (hand) => normalizePosition(hand.position),
))
const openPositionDetail = (row) => router.push({
  name: 'tournament-position-stats',
  params: { tournamentId: tournamentId.value, position: row.key },
  query: {
    ...(eventId.value ? { eventId: eventId.value } : {}),
    ...(route.query.legacyEventId ? { legacyEventId: route.query.legacyEventId } : {}),
  },
})

onMounted(async () => {
  if (!tournamentId.value) return
  if (!route.query.legacyEventId) {
    try {
      session.value = await fetchGameSession(tournamentId.value)
    } catch {
      session.value = null
      alert.show('프리플랍 통계를 불러오지 못했습니다.', 'error')
      return
    }
  }

  if (!eventId.value) {
    handLogStore.selectedEvent = null
    return
  }

  try {
    await handLogStore.fetchEventDetail(eventId.value)
  } catch (error) {
    handLogStore.selectedEvent = null
    if (error?.response?.status !== 404) {
      alert.show('프리플랍 통계를 불러오지 못했습니다.', 'error')
    }
  }
})

</script>

<style scoped>
.preflop-page,
.preflop-page *,
.preflop-page *::before,
.preflop-page *::after {
  box-sizing: border-box;
}

.preflop-page {
  display: flex;
  min-height: 100%;
  flex-direction: column;
  padding: var(--v2-page-padding-top) var(--v2-page-padding-x) 112px;
}

.detail-topbar {
  display: grid;
  width: 100%;
  height: 36px;
  min-height: 36px;
  max-height: 36px;
  flex: 0 0 36px;
  grid-template-columns: 40px minmax(0, 1fr) 40px;
  align-items: center;
  gap: 10px;
}

.detail-topbar button {
  display: grid;
  width: 36px;
  height: 36px;
  place-items: center;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--v2-text-main);
}

.detail-topbar h1 {
  margin: 0;
  font-size: 21px;
  font-weight: 650;
  line-height: 1.2;
  text-align: center;
}

.feature-summary {
  display: grid;
  gap: 9px;
  margin-top: 20px;
}

.feature-summary h2 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.feature-card {
  padding: 14px 16px;
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-lg);
  background: #fff;
  box-shadow: 0 5px 14px rgba(28, 18, 60, 0.025);
}

.feature-card ul {
  display: grid;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.feature-card li {
  position: relative;
  padding-left: 12px;
  color: #4f495a;
  font-size: 12px;
  line-height: 1.5;
}

.feature-card li::before {
  position: absolute;
  top: .65em;
  left: 0;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--v2-primary);
  content: '';
}

.feature-card p {
  margin: 0;
  color: var(--v2-text-sub);
  font-size: 12px;
  text-align: center;
}

.kpi-grid {
  display: grid;
  overflow: hidden;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  margin-top: 20px;
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-lg);
  background: #fff;
}

.kpi-grid div {
  display: grid;
  min-height: 76px;
  place-items: center;
  align-content: center;
  gap: 8px;
  padding: 10px 4px;
  border-right: 1px solid var(--v2-border);
  text-align: center;
}

.kpi-grid div:last-child {
  border-right: 0;
}

.kpi-grid span {
  color: var(--v2-text-sub);
  font-size: 11px;
  line-height: 1.2;
}

.kpi-grid strong {
  color: var(--v2-primary);
  font-size: 20px;
  font-weight: 600;
}

.stats-section {
  display: grid;
  gap: 9px;
  margin-top: 20px;
}

.stats-section h2 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.action-card,
.data-table {
  overflow: hidden;
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-lg);
  background: #fff;
  box-shadow: 0 5px 14px rgba(28, 18, 60, 0.025);
}

.action-card {
  display: grid;
  gap: 14px;
  padding: 16px 14px;
}

.action-row {
  display: grid;
  grid-template-columns: 42px minmax(80px, 1fr) 38px 38px;
  align-items: center;
  gap: 9px;
}

.action-row > span,
.action-row strong,
.action-row small {
  font-size: 12px;
}

.action-row > span {
  font-weight: 540;
}

.action-row > i {
  height: 8px;
  overflow: hidden;
  border-radius: 999px;
  background: #efedf5;
}

.action-row > i b {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #8c6ff0, var(--v2-primary));
}

.action-row strong,
.action-row small {
  text-align: right;
}

.action-row small {
  color: var(--v2-text-sub);
}

.data-table > div {
  display: grid;
  min-height: 43px;
  align-items: center;
  padding: 0 14px;
  border-bottom: 1px solid var(--v2-border);
  font-size: 12px;
}

.data-table > div:last-child {
  border-bottom: 0;
}

.data-table .table-head {
  min-height: 39px;
  background: #faf9fd;
  color: var(--v2-text-sub);
  font-size: 11px;
}

.position-table > div {
  grid-template-columns: minmax(58px, 1fr) repeat(3, minmax(48px, .75fr));
}

.rank-table > div {
  grid-template-columns: minmax(90px, 1.3fr) repeat(2, minmax(60px, 1fr));
}

.data-table span:not(:first-child) {
  text-align: right;
}

.data-table strong {
  font-weight: 560;
}

@media (max-width: 390px) {
  .kpi-grid span {
    font-size: 10px;
  }

  .kpi-grid strong {
    font-size: 18px;
  }
}
</style>
