<template>
  <q-page class="detail-page">
    <StatisticsDetailHeader
      title="포지션 통계"
      :initial-filter="filter"
      :back-to="statisticsHomeRoute"
      @change="applyFilters"
    />

    <PlayAnalysisSummary title="포지션 요약" :items="summaryItems" />

    <section class="analysis-section">
      <div v-if="loading" class="analysis-state">포지션 통계를 불러오는 중입니다.</div>
      <div v-else-if="loadError" class="analysis-state analysis-state--error">{{ loadError }}</div>
      <PlayAnalysisAccordionList
        v-else
        :rows="rows"
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
import { fetchAllGameSessions, fetchMonthlySessions } from 'src/api/gameSession'
import { fetchHandLogEvent } from 'src/api/handLogApi'
import StatisticsDetailHeader from '../components/StatisticsDetailHeader.vue'
import PlayAnalysisAccordionList from '../components/PlayAnalysisAccordionList.vue'
import PlayAnalysisSummary from '../components/PlayAnalysisSummary.vue'
import {
  buildAnalysisRows,
  formatAnalysisRate,
  normalizePosition,
  POSITION_ORDER,
} from '../utils/playAnalysis'

const route = useRoute()
const router = useRouter()
const filter = ref({
  year: Number(route.query.year) || new Date().getFullYear(),
  month: Number(route.query.month) || new Date().getMonth() + 1,
  allPeriod: route.query.allPeriod === '1',
  venueId: route.query.venueId === '' || route.query.venueId == null
    ? null
    : route.query.venueId,
  venueName: String(route.query.venueName || ''),
})
const statisticsHomeRoute = computed(() => ({
  name: 'statistics',
  query: {
    year: filter.value.year,
    month: filter.value.month,
    allPeriod: filter.value.allPeriod ? '1' : '0',
    venueId: filter.value.venueId ?? '',
    venueName: filter.value.venueName || '',
  },
}))
const hands = ref([])
const loading = ref(false)
const loadError = ref('')
let loadSequence = 0

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
const openPositionDetail = (row) => {
  router.push({
    name: 'statistics-position-detail',
    params: { position: row.key },
    query: {
      year: filter.value.year,
      month: filter.value.month,
      allPeriod: filter.value.allPeriod ? '1' : '0',
      venueId: filter.value.venueId ?? '',
      venueName: filter.value.venueName || '',
    },
  })
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
  void router.replace({
    query: {
      year: nextFilter.year,
      month: nextFilter.month,
      allPeriod: nextFilter.allPeriod ? '1' : '0',
      venueId: nextFilter.venueId ?? '',
      venueName: nextFilter.venueName || '',
    },
  })
  void load()
}

onMounted(load)
</script>

<style scoped>
@import './statistics-detail.css';
@import './play-analysis-page.css';
</style>
