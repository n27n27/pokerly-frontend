<template>
  <q-page class="tournament-position-page tournament-analysis-page">
    <header class="tournament-analysis-topbar">
      <button type="button" aria-label="뒤로 가기" @click="router.back()">
        <q-icon name="chevron_left" size="28px" />
      </button>
      <h1>{{ position }} 분석</h1>
      <span aria-hidden="true"></span>
    </header>

    <section class="tournament-position-summary">
      <div><span>총 기록</span><strong>{{ positionRow.total }}회</strong></div>
      <div><span>참여</span><strong>{{ positionRow.participated }}회</strong><small>{{ rate(positionRow.participationRate) }}</small></div>
      <div><span>참여 승률</span><strong>{{ rate(positionRow.winRate) }}</strong></div>
    </section>

    <div class="action-filter" role="radiogroup" aria-label="프리플랍 액션">
      <button
        v-for="option in actionOptions"
        :key="option.key"
        type="button"
        :class="{ active: selectedAction === option.key }"
        @click="selectedAction = option.key"
      >{{ option.label }}</button>
    </div>

    <section class="hand-section">
      <header><h2>핸드별 기록</h2><span>{{ selectedHands.length }}회</span></header>
      <div v-if="!handRows.length" class="empty-state">해당하는 핸드 기록이 없습니다.</div>
      <div v-else class="hand-list">
        <div v-for="row in handRows" :key="row.key || 'unknown'">
          <strong>{{ row.label || '미기록' }}</strong>
          <span>×{{ row.total }}</span>
          <small>{{ resultText(row) }}</small>
        </div>
      </div>
    </section>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { fetchGameSession } from 'src/api/gameSession'
import { useHandLogStore } from 'src/stores/handLog'
import { buildAnalysisRows, formatAnalysisRate } from 'src/features/statistics/utils/playAnalysis'
import { getHandInputValue, normalizeHand, PREFLOP_169_RANKING } from 'src/utils/handLogHandAnalysis'

const route = useRoute()
const router = useRouter()
const store = useHandLogStore()
const position = computed(() => String(route.params.position || '').toUpperCase())
const selectedAction = ref('all')
const session = ref(null)

const normalizePosition = (value) => {
  const normalized = String(value || '').trim().toUpperCase()
  if (normalized === 'UTG+1') return 'UTG'
  if (['UTG+2', 'UTG+3'].includes(normalized)) return 'MP'
  return normalized
}
const allHands = computed(() => (store.selectedEvent?.blindLevels || []).flatMap((level) => level.hands || []))
const positionHands = computed(() => allHands.value.filter((hand) => normalizePosition(hand.position) === position.value))
const positionRow = computed(() => buildAnalysisRows([position.value], positionHands.value, (hand) => normalizePosition(hand.position))[0])
const actionHands = (key) => positionRow.value.actions.find((action) => action.key === key)?.hands || []
const actionOptions = computed(() => [
  { key: 'all', label: '전체', hands: positionHands.value },
  { key: 'open', label: '오픈', hands: actionHands('open') },
  { key: 'call', label: '림프·콜', hands: actionHands('call') },
  { key: 'threeBetPlus', label: '3벳+', hands: [...actionHands('threeBet'), ...actionHands('fourBet')] },
  { key: 'fold', label: '폴드', hands: actionHands('fold') },
])
const selectedHands = computed(() => actionOptions.value.find((option) => option.key === selectedAction.value)?.hands || [])
const handRows = computed(() => buildAnalysisRows(PREFLOP_169_RANKING, selectedHands.value, (hand) => normalizeHand(getHandInputValue(hand))).filter((row) => row.total))
const rate = formatAnalysisRate
const resultText = (row) => {
  const recorded = row.wins + row.losses + row.draws
  if (!recorded) return '결과 미기록'
  return [`${row.wins}승`, `${row.losses}패`, row.draws ? `${row.draws}무` : ''].filter(Boolean).join(' · ')
}

onMounted(async () => {
  let eventId = route.query.eventId || route.query.legacyEventId
  if (!eventId) {
    session.value = await fetchGameSession(route.params.tournamentId)
    eventId = session.value?.handLogEventId
  }
  if (eventId) await store.fetchEventDetail(eventId)
})
</script>

<style scoped>
.tournament-position-summary { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); overflow: hidden; margin-top: 20px; border: 1px solid var(--v2-border); border-radius: var(--v2-radius-lg); background: #fff; }
.tournament-position-summary > div { min-width: 0; min-height: 82px; display: grid; place-content: center; justify-items: center; gap: 5px; padding: 10px 5px; border-right: 1px solid var(--v2-border); text-align: center; }
.tournament-position-summary > div:last-child { border-right: 0; }
.tournament-position-summary span,.tournament-position-summary small { color: var(--v2-text-sub); font-size: 10px; }
.tournament-position-summary strong { font-size: 16px; font-weight: 650; }
.action-filter { display: flex; gap: 6px; overflow-x: auto; margin-top: 18px; scrollbar-width: none; }
.action-filter button { flex: 0 0 auto; min-height: 34px; padding: 0 12px; border: 1px solid var(--v2-border); border-radius: 999px; background: #fff; color: var(--v2-text-sub); font: inherit; font-size: 11px; }
.action-filter button.active { border-color: rgba(109,69,232,.24); background: var(--v2-primary-soft); color: var(--v2-primary); font-weight: 620; }
.hand-section { display: grid; gap: 10px; margin-top: 20px; }
.hand-section > header { display: flex; align-items: center; justify-content: space-between; }
.hand-section h2 { margin: 0; font-size: 16px; font-weight: 600; }
.hand-section header span { color: var(--v2-text-sub); font-size: 11px; }
.hand-list { overflow: hidden; border: 1px solid var(--v2-border); border-radius: var(--v2-radius-lg); background: #fff; }
.hand-list > div { min-height: 48px; display: grid; grid-template-columns: minmax(64px,1fr) 42px minmax(96px,auto); align-items: center; gap: 8px; padding: 0 14px; border-bottom: 1px solid var(--v2-border); font-size: 12px; }
.hand-list > div:last-child { border-bottom: 0; }
.hand-list span,.hand-list small { text-align: right; }
.hand-list small { color: var(--v2-text-sub); }
.empty-state { padding: 30px 16px; border: 1px solid var(--v2-border); border-radius: var(--v2-radius-lg); background: #fff; color: var(--v2-text-sub); font-size: 12px; text-align: center; }
</style>
