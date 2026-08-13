<template>
  <q-page class="detail-page position-detail-page">
    <StatisticsDetailHeader
      :title="position"
      :initial-filter="filter"
      @change="applyFilters"
    />

    <section v-if="!loading && !loadError" class="position-summary">
      <div class="position-summary__heading">
        <h1>{{ position }}</h1>
        <span>총 {{ positionRow.total }}회</span>
      </div>
      <div class="position-summary__metrics">
        <span>참여 <strong>{{ formatAnalysisRate(positionRow.participationRate) }}</strong></span>
        <span>참여 승률 <strong>{{ formatAnalysisRate(positionRow.winRate) }}</strong></span>
      </div>
      <p>{{ playSummary }}</p>
    </section>

    <div v-if="!loading && !loadError" class="action-filter" role="radiogroup" aria-label="프리플랍 액션">
      <button
        v-for="option in actionOptions"
        :key="option.key"
        type="button"
        role="radio"
        :aria-checked="selectedAction === option.key"
        :class="{ active: selectedAction === option.key }"
        @click="selectedAction = option.key"
      >
        {{ option.label }}
      </button>
    </div>

    <section class="hand-distribution">
      <div v-if="loading" class="analysis-state">포지션 상세를 불러오는 중입니다.</div>
      <div v-else-if="loadError" class="analysis-state analysis-state--error">{{ loadError }}</div>
      <template v-else>
        <header>
          <h2>{{ handSectionTitle }}</h2>
          <span>{{ selectedHands.length }}회</span>
        </header>
        <div v-if="!handRows.length" class="analysis-state analysis-state--compact">
          {{ emptyStateMessage }}
        </div>
        <div
          v-else
          class="hand-distribution__list"
          :class="selectedAction === 'all'
            ? 'hand-distribution__list--all'
            : selectedAction === 'fold'
              ? 'hand-distribution__list--fold'
              : 'hand-distribution__list--action-results'"
        >
          <div v-for="row in handRows" :key="row.key || 'unrecorded'">
            <span class="hand-distribution__name">
              <strong>{{ row.label }}</strong>
              <small v-if="selectedAction === 'all'">×{{ row.total }}</small>
            </span>
            <span v-if="selectedAction === 'all'" class="hand-distribution__participation">
              <span>참여 <strong>{{ formatAnalysisRate(row.participationRate) }}</strong></span>
              <span class="participation-bar" aria-hidden="true">
                <i :style="{ width: `${row.participationRate}%` }" />
              </span>
            </span>
            <span v-else class="hand-distribution__action-count">
              ×{{ row.total }}
            </span>
            <span
              v-if="selectedAction !== 'all' && selectedAction !== 'fold'"
              class="hand-distribution__result"
            >
              {{ formatActionResult(row) }}
            </span>
          </div>
        </div>
      </template>
    </section>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { fetchAllGameSessions, fetchMonthlySessions } from 'src/api/gameSession'
import { fetchHandLogEvent } from 'src/api/handLogApi'
import { getHandInputValue, normalizeHand, PREFLOP_169_RANKING } from 'src/utils/handLogHandAnalysis'
import StatisticsDetailHeader from '../components/StatisticsDetailHeader.vue'
import { buildAnalysisRows, formatAnalysisRate } from '../utils/playAnalysis'

const route = useRoute()
const router = useRouter()
const position = computed(() => String(route.params.position || '').toUpperCase())
const filter = ref({
  year: Number(route.query.year) || new Date().getFullYear(),
  month: Number(route.query.month) || new Date().getMonth() + 1,
  allPeriod: route.query.allPeriod === '1',
  venueId: route.query.venueId === '' || route.query.venueId == null
    ? null
    : route.query.venueId,
})
const hands = ref([])
const loading = ref(false)
const loadError = ref('')
const selectedAction = ref('all')

const normalizePosition = (value) => {
  const normalized = String(value || '').trim().toUpperCase()
  if (normalized === 'UTG+1') return 'UTG'
  if (['UTG+2', 'UTG+3'].includes(normalized)) return 'MP'
  return normalized
}
const positionHands = computed(() => hands.value.filter(
  (hand) => normalizePosition(hand.position) === position.value,
))
const positionRow = computed(() => buildAnalysisRows(
  [position.value],
  positionHands.value,
  (hand) => normalizePosition(hand.position),
)[0])
const actionHands = (key) => positionRow.value.actions.find(
  (option) => option.key === key,
)?.hands || []
const actionOptions = computed(() => [
  { key: 'all', label: '전체', hands: positionHands.value },
  { key: 'open', label: '오픈', showResult: true, hands: actionHands('open') },
  { key: 'call', label: '림프·콜', showResult: true, hands: actionHands('call') },
  {
    key: 'threeBetPlus',
    label: '3벳+',
    showResult: true,
    hands: [...actionHands('threeBet'), ...actionHands('fourBet')],
  },
  { key: 'fold', label: '폴드', showResult: false, hands: actionHands('fold') },
])
const playSummary = computed(() => {
  const summaryActions = [
    { label: '오픈', hands: actionHands('open') },
    { label: '림프/콜', hands: actionHands('call') },
    { label: '3벳+', hands: [...actionHands('threeBet'), ...actionHands('fourBet')] },
  ]
  const actionParts = summaryActions
    .filter((action) => action.hands.length > 0)
    .map((action) => `${action.label} ${action.hands.length}`)
  return [`${positionRow.value.participated}회 참여`, ...actionParts].join(' · ')
})
const selectedHands = computed(() =>
  actionOptions.value.find((option) => option.key === selectedAction.value)?.hands || [],
)
const selectedActionLabel = computed(() => actionOptions.value.find(
  (option) => option.key === selectedAction.value,
)?.label || '')
const handSectionTitle = computed(() => selectedAction.value === 'all'
  ? '핸드별 기록'
  : `${selectedActionLabel.value} 핸드`)
const emptyStateMessage = computed(() => selectedAction.value === 'all'
  ? '아직 기록된 핸드가 없습니다.'
  : `아직 ${selectedActionLabel.value} 기록이 없습니다.`)
const formatActionResult = (row) => {
  const recorded = row.wins + row.losses + row.draws
  if (recorded === 0) return '결과 미기록'
  if (recorded === 1) {
    if (row.wins) return '1승'
    if (row.losses) return '1패'
    return '1무'
  }
  return [
    `${row.wins}승`,
    `${row.losses}패`,
    row.draws ? `${row.draws}무` : '',
  ].filter(Boolean).join(' · ')
}
const handRows = computed(() => buildAnalysisRows(
  PREFLOP_169_RANKING,
  selectedHands.value,
  (hand) => normalizeHand(getHandInputValue(hand)),
).filter((row) => row.total > 0))
const filterByVenue = (sessions) => {
  if (filter.value.venueId === null) return sessions
  if (filter.value.venueId === 'other') return sessions.filter((item) => item.venueId == null)
  return sessions.filter((item) => Number(item.venueId) === Number(filter.value.venueId))
}
const load = async () => {
  loading.value = true
  loadError.value = ''
  try {
    const sessions = filter.value.allPeriod
      ? await fetchAllGameSessions()
      : await fetchMonthlySessions(filter.value.year, filter.value.month)
    const eventIds = [...new Set(filterByVenue((sessions || [])
      .filter((item) => item.tournamentStatus !== 'RUNNING'))
      .map((item) => item.handLogEventId)
      .filter(Boolean)
      .map(String))]
    const events = await Promise.all(eventIds.map((eventId) =>
      fetchHandLogEvent(eventId).catch(() => null)))
    hands.value = events.filter(Boolean).flatMap((event) =>
      (event.blindLevels || []).flatMap((level) => level.hands || []))
  } catch (error) {
    console.error('포지션 상세 로드 실패', error)
    hands.value = []
    loadError.value = '포지션 상세를 불러오지 못했습니다.'
  } finally {
    loading.value = false
  }
}

const applyFilters = (nextFilter) => {
  filter.value = { ...nextFilter }
  selectedAction.value = 'all'
  void router.replace({
    query: {
      year: nextFilter.year,
      month: nextFilter.month,
      allPeriod: nextFilter.allPeriod ? '1' : '0',
      venueId: nextFilter.venueId ?? '',
    },
  })
  void load()
}

onMounted(load)
</script>

<style scoped>
@import './statistics-detail.css';
@import './play-analysis-page.css';

.position-summary { padding: 2px 4px 12px; border-bottom: 1px solid var(--v2-border); display: grid; gap: 8px; }
.position-summary__heading { display: flex; align-items: baseline; justify-content: space-between; }
.position-summary__heading h1 { margin: 0; color: var(--v2-text-main); font-size: 20px; font-weight: 680; line-height: 1.2; }
.position-summary__heading span { color: var(--v2-text-sub); font-size: 12px; }
.position-summary__metrics { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 20px; }
.position-summary__metrics span { display: flex; align-items: baseline; justify-content: space-between; color: var(--v2-text-sub); font-size: 12px; }
.position-summary__metrics strong { color: var(--v2-primary); font-size: 18px; font-weight: 680; }
.position-summary p { margin: 0; color: var(--v2-text-sub); font-size: 12px; line-height: 1.4; }
.action-filter { overflow-x: auto; display: flex; gap: 6px; padding: 2px 0 5px; scrollbar-width: none; }
.action-filter::-webkit-scrollbar { display: none; }
.action-filter button { flex: 0 0 auto; min-height: 36px; padding: 0 14px; border: 1px solid var(--v2-border); border-radius: 999px; background: #fff; color: var(--v2-text-sub); font: inherit; font-size: 12px; font-weight: 560; }
.action-filter button.active { border-color: var(--v2-primary); background: var(--v2-primary); color: #fff; }
.hand-distribution { display: grid; gap: 7px; }
.hand-distribution > header { min-height: 36px; padding: 0 4px; display: flex; align-items: center; justify-content: space-between; }
.hand-distribution h2 { margin: 0; font-size: 15px; font-weight: 650; }
.hand-distribution header span { color: var(--v2-text-sub); font-size: 12px; }
.hand-distribution .analysis-state--compact { min-height: 92px; border: 0; border-radius: 0; background: transparent; padding: 16px 8px; }
.hand-distribution__list { overflow: hidden; border-block: 1px solid var(--v2-border); background: transparent; }
.hand-distribution__list > div { min-height: 52px; padding: 7px 13px; border-bottom: 1px solid var(--v2-border); display: grid; align-items: center; gap: 12px; }
.hand-distribution__list--all > div { grid-template-columns: minmax(0, 1fr) minmax(90px, 42%); }
.hand-distribution__list--fold > div { grid-template-columns: minmax(0, 1fr) auto; }
.hand-distribution__list--action-results > div { grid-template-columns: minmax(0, 1fr) auto minmax(76px, auto); }
.hand-distribution__list > div:last-child { border-bottom: 0; }
.hand-distribution__list strong { font-size: 13px; font-weight: 650; }
.hand-distribution__list span { color: var(--v2-text-sub); font-size: 11px; }
.hand-distribution__name { display: flex; align-items: baseline; gap: 5px; }
.hand-distribution__name strong { color: var(--v2-text-main); font-size: 14px; }
.hand-distribution__name small { color: var(--v2-text-sub); font-size: 11px; }
.hand-distribution__participation { display: grid; gap: 5px; text-align: right; white-space: nowrap; }
.hand-distribution__participation strong { color: var(--v2-primary); font-size: 12px; }
.participation-bar { overflow: hidden; width: 72%; height: 2px; margin-left: auto; border-radius: 99px; background: #e9e5f2; }
.participation-bar i { display: block; height: 100%; border-radius: inherit; background: var(--v2-primary); }
.hand-distribution__action-count { color: var(--v2-text-sub); font-size: 12px; text-align: right; }
.hand-distribution__result { min-width: 0; color: var(--v2-text-sub); font-size: 11px; line-height: 1.35; text-align: right; white-space: nowrap; }

@media (max-width: 360px) {
  .hand-distribution__list--all > div { grid-template-columns: minmax(0, 1fr) minmax(84px, 44%); }
  .hand-distribution__list--action-results > div { grid-template-columns: minmax(0, 1fr) auto minmax(68px, auto); }
  .hand-distribution__list > div { gap: 5px; padding-inline: 10px; }
  .hand-distribution__participation { font-size: 10px; }
}
</style>
