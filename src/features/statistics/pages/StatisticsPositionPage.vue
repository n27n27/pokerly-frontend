<template>
  <q-page class="detail-page">
    <StatisticsDetailHeader title="포지션 통계" @change="applyFilters" />

    <section class="summary-panel" aria-label="포지션 플레이 요약">
      <div class="summary-strip">
        <div>
          <span>기록 핸드</span>
          <strong>{{ summary.total.toLocaleString('ko-KR') }}</strong>
          <small>핸드</small>
        </div>
        <div>
          <span>VPIP</span>
          <strong>{{ formatRate(summary.vpipRate) }}</strong>
          <small>{{ summary.vpip }}회 참여</small>
        </div>
        <div>
          <span>PFR</span>
          <strong>{{ formatRate(summary.pfrRate) }}</strong>
          <small>{{ summary.pfr }}회 레이즈</small>
        </div>
      </div>
    </section>

    <section class="analysis-section">
      <div class="analysis-section__heading">
        <div>
          <h2>포지션별 플레이</h2>
          <p>포지션을 선택해 프리플랍 액션과 결과를 확인하세요.</p>
        </div>
        <span>8개 포지션</span>
      </div>

      <div v-if="loading" class="analysis-state">포지션 통계를 불러오는 중입니다.</div>
      <div v-else-if="loadError" class="analysis-state analysis-state--error">{{ loadError }}</div>
      <PlayAnalysisAccordionList v-else :rows="rows" />
    </section>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { fetchAllGameSessions, fetchMonthlySessions } from 'src/api/gameSession'
import { fetchHandLogEvent } from 'src/api/handLogApi'
import StatisticsDetailHeader from '../components/StatisticsDetailHeader.vue'
import PlayAnalysisAccordionList from '../components/PlayAnalysisAccordionList.vue'
import {
  buildAnalysisRows,
  buildPlaySummary,
  formatAnalysisRate,
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

const summary = computed(() => buildPlaySummary(normalizedHands.value))
const rows = computed(() => buildAnalysisRows(
  POSITION_ORDER,
  normalizedHands.value,
  (hand) => hand.normalizedPosition,
))
const formatRate = formatAnalysisRate

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
        return await fetchHandLogEvent(eventId)
      } catch {
        return null
      }
    }))
    if (sequence !== loadSequence) return
    hands.value = events
      .filter(Boolean)
      .flatMap((event) => (event.blindLevels || [])
        .flatMap((level) => level.hands || []))
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
</style>
