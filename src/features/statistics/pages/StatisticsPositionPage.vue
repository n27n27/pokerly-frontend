<template>
  <q-page class="detail-page">
    <StatisticsDetailHeader title="포지션 통계" @change="applyFilters" />

    <PlayAnalysisSummary title="포지션 요약" :items="summaryItems" />

    <section class="analysis-section">
      <div v-if="loading" class="analysis-state">포지션 통계를 불러오는 중입니다.</div>
      <div v-else-if="loadError" class="analysis-state analysis-state--error">{{ loadError }}</div>
      <PlayAnalysisAccordionList
        v-else
        :rows="rows"
        summary-mode="rates"
        action-drilldown
        @action-select="openActionHands"
      />
    </section>

    <q-dialog v-model="actionSheetOpen" position="bottom">
      <section
        class="action-hand-sheet"
        aria-labelledby="action-hand-sheet-title"
        @click.stop
      >
        <header>
          <h2 id="action-hand-sheet-title">{{ selectedActionTitle }}</h2>
          <span>{{ selectedActionHands.length }}회</span>
        </header>
        <div class="action-hand-sheet__list" aria-label="핸드별 발생 횟수">
          <div
            v-for="group in selectedActionHandGroups"
            :key="group.key || 'unrecorded'"
          >
            <span class="action-hand-sheet__hand-count">
              <strong>{{ group.label }}</strong>
              <span>× {{ group.count }}</span>
            </span>
            <small v-if="selectedActionShowsResult">{{ formatGroupResult(group) }}</small>
          </div>
        </div>
      </section>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { fetchAllGameSessions, fetchMonthlySessions } from 'src/api/gameSession'
import { fetchHandLogEvent } from 'src/api/handLogApi'
import {
  getHandInputValue,
  normalizeHand,
  PREFLOP_169_RANKING,
} from 'src/utils/handLogHandAnalysis'
import StatisticsDetailHeader from '../components/StatisticsDetailHeader.vue'
import PlayAnalysisAccordionList from '../components/PlayAnalysisAccordionList.vue'
import PlayAnalysisSummary from '../components/PlayAnalysisSummary.vue'
import {
  buildAnalysisRows,
  formatAnalysisRate,
  groupHandsByRanking,
} from '../utils/playAnalysis'

const POSITION_ORDER = ['UTG', 'MP', 'LJ', 'HJ', 'CO', 'BTN', 'SB', 'BB']
const filter = ref({
  year: new Date().getFullYear(),
  month: new Date().getMonth() + 1,
  allPeriod: false,
  venueId: null,
})
const hands = ref([])
const loading = ref(false)
const loadError = ref('')
const actionSheetOpen = ref(false)
const selectedAction = ref(null)
let loadSequence = 0

const normalizePosition = (position) => {
  const value = String(position || '').trim().toUpperCase()
  if (value === 'UTG+1') return 'UTG'
  if (['UTG+2', 'UTG+3'].includes(value)) return 'MP'
  return POSITION_ORDER.includes(value) ? value : ''
}

const filterByVenue = (list) => {
  const venueId = filter.value.venueId
  if (venueId === null) return list
  if (venueId === 'other') return list.filter((item) => item.venueId == null)
  return list.filter((item) => Number(item.venueId) === Number(venueId))
}

const normalizedHands = computed(() => hands.value
  .map((hand) => ({
    ...hand,
    normalizedPosition: normalizePosition(hand.position),
  }))
  .filter((hand) => hand.normalizedPosition))

const rows = computed(() => buildAnalysisRows(
  POSITION_ORDER,
  normalizedHands.value,
  (hand) => hand.normalizedPosition,
))
const highestParticipation = computed(() => rows.value
  .filter((row) => row.total > 0)
  .reduce((best, row) => (!best || row.participationRate > best.participationRate ? row : best), null))
const highestWinRate = computed(() => rows.value
  .filter((row) => row.participated > 0)
  .reduce((best, row) => (!best || row.winRate > best.winRate ? row : best), null))
const summaryItems = computed(() => [
  { label: '기록 핸드', value: `${normalizedHands.value.length}개` },
  {
    label: '참여율 최고',
    value: highestParticipation.value
      ? `${highestParticipation.value.label} ${formatAnalysisRate(highestParticipation.value.participationRate)}`
      : '-',
    tone: 'primary',
  },
  {
    label: '승률 최고',
    value: highestWinRate.value
      ? `${highestWinRate.value.label} ${formatAnalysisRate(highestWinRate.value.winRate)}`
      : '-',
    tone: 'success',
  },
])
const selectedActionHands = computed(() => selectedAction.value?.action?.hands || [])
const selectedActionShowsResult = computed(() => Boolean(selectedAction.value?.action?.showResult))
const selectedActionHandGroups = computed(() => groupHandsByRanking(
  selectedActionHands.value,
  PREFLOP_169_RANKING,
  (hand) => normalizeHand(getHandInputValue(hand)),
))
const selectedActionTitle = computed(() => selectedAction.value
  ? `${selectedAction.value.row.label} · ${selectedAction.value.action.label}`
  : '')
const resultKind = (hand) => {
  const result = String(hand.resultType || hand.result || '').toUpperCase()
  if (['SHOWDOWN_WIN', 'NON_SHOWDOWN_WIN', 'WIN'].includes(result)) return 'win'
  if (['CHOP', 'DRAW', 'TIE'].includes(result)) return 'draw'
  if (['SHOWDOWN_LOSS', 'PREFLOP_FOLD', 'POSTFLOP_FOLD', 'LOSS', 'FOLD'].includes(result)) return 'loss'
  return 'unrecorded'
}
const formatGroupResult = (group) => {
  const counts = group.hands.reduce((result, hand) => {
    result[resultKind(hand)] += 1
    return result
  }, { win: 0, loss: 0, draw: 0, unrecorded: 0 })
  return [
    `${counts.win}승`,
    `${counts.loss}패`,
    counts.draw ? `${counts.draw}무` : '',
    counts.unrecorded ? `${counts.unrecorded}미기록` : '',
  ].filter(Boolean).join(' · ')
}
const openActionHands = (payload) => {
  selectedAction.value = payload
  actionSheetOpen.value = true
}
const load = async () => {
  const sequence = ++loadSequence
  loading.value = true
  loadError.value = ''
  try {
    const sessionList = filter.value.allPeriod
      ? await fetchAllGameSessions()
      : await fetchMonthlySessions(filter.value.year, filter.value.month)
    const completed = filterByVenue((sessionList || [])
      .filter((item) => item.tournamentStatus !== 'RUNNING'))
    const eventIds = [...new Set(completed
      .map((item) => item.handLogEventId)
      .filter(Boolean)
      .map(String))]
    const events = await Promise.all(eventIds.map(async (eventId) => {
      try {
        const event = await fetchHandLogEvent(eventId)
        return { ...event, _statisticsEventId: eventId }
      } catch {
        return null
      }
    }))
    if (sequence !== loadSequence) return
    hands.value = events
      .filter(Boolean)
      .flatMap((event) => (event.blindLevels || [])
        .flatMap((level) => (level.hands || []).map((hand) => ({
          ...hand,
          eventId: event._statisticsEventId || event.id || event.eventId,
          levelId: level.id,
          levelName: level.name,
        }))))
  } catch (error) {
    if (sequence !== loadSequence) return
    console.error('포지션 통계 로드 실패', error)
    hands.value = []
    loadError.value = '포지션 통계를 불러오지 못했습니다.'
  } finally {
    if (sequence === loadSequence) loading.value = false
  }
}

const applyFilters = (nextFilter) => {
  filter.value = { ...nextFilter }
  void load()
}

onMounted(load)
</script>

<style scoped>
@import './statistics-detail.css';
@import './play-analysis-page.css';

.action-hand-sheet {
  width: min(100%, 390px);
  max-height: min(70dvh, 620px);
  margin: 0 auto;
  overflow: hidden;
  border-radius: 22px 22px 0 0;
  background: var(--v2-page-bg);
  display: flex;
  flex-direction: column;
}

.action-hand-sheet header {
  flex: 0 0 auto;
  min-height: 64px;
  padding: 18px 20px 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.action-hand-sheet h2 {
  margin: 0;
  color: #373240;
  font-size: 17px;
  font-weight: 650;
}

.action-hand-sheet header span {
  color: var(--v2-text-sub);
  font-size: 12px;
}

.action-hand-sheet__list {
  flex: 1 1 auto;
  min-height: 0;
  padding: 0 14px max(20px, env(safe-area-inset-bottom));
  overflow-y: auto;
  overscroll-behavior: contain;
  touch-action: pan-y;
  -webkit-overflow-scrolling: touch;
}

.action-hand-sheet__list > div {
  width: 100%;
  min-height: 52px;
  padding: 0 12px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(76px, auto);
  align-items: center;
  gap: 10px;
  border: 0;
  border-bottom: 1px solid var(--v2-border);
  background: transparent;
  color: var(--v2-text-main);
  text-align: left;
}

.action-hand-sheet__list strong { font-size: 15px; font-weight: 650; }
.action-hand-sheet__list span { color: var(--v2-text-sub); font-size: 12px; }
.action-hand-sheet__list small { color: var(--v2-text-sub); font-size: 12px; }
.action-hand-sheet__list > div > small { text-align: right; }

.action-hand-sheet__hand-count {
  display: flex;
  align-items: baseline;
  gap: 7px;
}

.action-hand-sheet__hand-count strong {
  color: var(--v2-text-main);
}
</style>
