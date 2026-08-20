<template>
  <q-page class="detail-page">
    <StatisticsDetailHeader
      title="핸드 통계"
      :initial-filter="filter"
      :back-to="statisticsHomeRoute"
      @change="applyFilters"
    />

    <PlayAnalysisSummary title="핸드 요약" :items="summaryItems" />

    <div class="hand-list-controls">
      <div class="hand-search-field" role="search">
      <q-icon name="search" size="18px" />
      <input
        v-model="handQuery"
        type="search"
        placeholder="AA, AJs"
        aria-label="핸드 찾기"
        autocomplete="off"
      />
      <button v-if="handQuery" type="button" aria-label="검색어 지우기" @click="handQuery = ''">
        <q-icon name="cancel" size="17px" />
      </button>
      <span v-else aria-hidden="true"></span>
      <button
        class="hand-sort-button"
        :class="{ active: hasCustomListOptions }"
        type="button"
        aria-label="핸드 정렬 및 표시 옵션"
        @click="sortSheetOpen = true"
      >
        <q-icon name="swap_vert" size="18px" />
        <em>{{ sortButtonLabel }}</em>
      </button>
      </div>

      <div class="hand-type-filter" role="radiogroup" aria-label="핸드 유형">
      <button
        v-for="option in handTypeOptions"
        :key="option.value"
        type="button"
        role="radio"
        :aria-checked="handType === option.value"
        :class="{ active: handType === option.value }"
        @click="handType = option.value"
      >
        {{ option.label }}
      </button>
      </div>

      <div class="recorded-only-filter">
      <span>기록 있는 핸드만</span>
      <button
        type="button"
        role="switch"
        :aria-checked="recordedOnly"
        aria-label="기록 있는 핸드만 보기"
        :class="{ active: recordedOnly }"
        @click="recordedOnly = !recordedOnly"
      >
        <span></span>
      </button>
      </div>
    </div>

    <section class="analysis-section">
      <div v-if="loading" class="analysis-state">핸드 통계를 불러오는 중입니다.</div>
      <div v-else-if="loadError" class="analysis-state analysis-state--error">{{ loadError }}</div>
      <div v-else-if="!displayRows.length" class="analysis-state">일치하는 핸드가 없습니다.</div>
      <PlayAnalysisAccordionList v-else :rows="displayRows" show-positions />
    </section>

    <Teleport to="body">
      <div
        v-if="sortSheetOpen"
        class="hand-sort-backdrop"
        role="presentation"
        @click.self="sortSheetOpen = false"
      >
        <section class="hand-sort-sheet" role="dialog" aria-modal="true" aria-labelledby="hand-sort-title">
        <span class="hand-sort-sheet__handle" aria-hidden="true"></span>
        <h2 id="hand-sort-title">정렬</h2>
        <div class="hand-sort-sheet__options" role="radiogroup" aria-label="핸드 정렬 기준">
          <button
            v-for="option in sortOptions"
            :key="option.value"
            type="button"
            role="radio"
            :aria-checked="sortMode === option.value"
            @click="selectSort(option.value)"
          >
            <q-icon
              :name="sortMode === option.value ? 'radio_button_checked' : 'radio_button_unchecked'"
              size="19px"
            />
            <span>{{ option.label }}</span>
          </button>
        </div>
        </section>
      </div>
    </Teleport>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
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
  buildPlaySummary,
  formatAnalysisRate,
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
const handQuery = ref('')
const handType = ref('all')
const sortSheetOpen = ref(false)
const sortMode = ref('default')
const recordedOnly = ref(false)
const sortOptions = [
  { label: '기본 순서', value: 'default' },
  { label: '기록 많은 순', value: 'records' },
  { label: '참여 많은 순', value: 'participation' },
]
const sortButtonLabel = computed(() => ({
  default: '기본순',
  records: '기록순',
  participation: '참여순',
})[sortMode.value])
const selectSort = (value) => {
  sortMode.value = value
  sortSheetOpen.value = false
}
const handTypeOptions = [
  { label: '전체', value: 'all' },
  { label: '페어', value: 'pair' },
  { label: '수딧', value: 'suited' },
  { label: '오프수딧', value: 'offsuit' },
]
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
    notation: normalizeHand(getHandInputValue(hand)),
  }))
  .filter((hand) => hand.notation))

const rows = computed(() => buildAnalysisRows(
  PREFLOP_169_RANKING,
  normalizedHands.value,
  (hand) => hand.notation,
))
const summary = computed(() => buildPlaySummary(normalizedHands.value))
const summaryItems = computed(() => [
  { label: '기록 핸드', value: `${summary.value.total}개` },
  {
    label: 'VPIP',
    value: formatAnalysisRate(summary.value.vpipRate),
    tone: 'primary',
  },
  {
    label: 'PFR',
    value: formatAnalysisRate(summary.value.pfrRate),
    tone: 'primary',
  },
])
const normalizedHandQuery = computed(() => handQuery.value.trim().toUpperCase().replaceAll('10', 'T'))
const filteredRows = computed(() => {
  return rows.value.filter((row) => {
    const hand = row.key.toUpperCase()
    const matchesQuery = !normalizedHandQuery.value || hand.includes(normalizedHandQuery.value)
    const matchesType = handType.value === 'all'
      || (handType.value === 'pair' && hand.length === 2)
      || (handType.value === 'suited' && hand.endsWith('S'))
      || (handType.value === 'offsuit' && hand.endsWith('O'))
    return matchesQuery && matchesType
  })
})
const hasCustomListOptions = computed(() => sortMode.value !== 'default')
const displayRows = computed(() => {
  const visible = recordedOnly.value
    ? filteredRows.value.filter((row) => row.total > 0)
    : [...filteredRows.value]
  if (sortMode.value === 'records') {
    return visible.sort((a, b) => b.total - a.total)
  }
  if (sortMode.value === 'participation') {
    return visible.sort((a, b) => b.participated - a.participated)
  }
  return visible
})
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
    console.error('핸드 통계 로드 실패', error)
    hands.value = []
    loadError.value = '핸드 통계를 불러오지 못했습니다.'
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

.hand-list-controls {
  display: grid;
  gap: 8px;
}

.hand-search-field {
  width: 100%;
  min-height: 40px;
  display: grid;
  grid-template-columns: 22px minmax(0, 1fr) 20px 52px;
  align-items: center;
  gap: 6px;
  padding: 0 12px;
  border: 1px solid rgba(109, 69, 232, 0.16);
  border-radius: var(--v2-radius-md);
  background: #fff;
  box-shadow: 0 4px 12px rgba(28, 18, 60, 0.025);
  color: var(--v2-text-sub);
}

.hand-search-field:focus-within {
  border-color: rgba(109, 69, 232, 0.38);
}

.hand-search-field input {
  min-width: 0;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--v2-text-main);
  font: inherit;
  font-size: 13px;
  font-weight: 550;
}

.hand-search-field button {
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--v2-text-sub);
}

.hand-sort-button {
  width: 52px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1px;
  border-radius: 8px !important;
}

.hand-sort-button em {
  font-size: 9px;
  font-style: normal;
  font-weight: 650;
}

.hand-sort-button.active {
  background: rgba(109, 69, 232, .1);
  background: color-mix(in srgb, var(--v2-primary) 10%, white);
  color: var(--v2-primary);
}

.hand-type-filter {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 5px;
}

.hand-type-filter button {
  min-width: 0;
  min-height: 34px;
  padding: 0 7px;
  border: 1px solid var(--v2-border);
  border-radius: 999px;
  background: #fff;
  color: var(--v2-text-sub);
  font: inherit;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
}

.hand-type-filter button.active {
  border-color: rgba(109, 69, 232, 0.24);
  background: rgba(109, 69, 232, .1);
  background: color-mix(in srgb, var(--v2-primary) 10%, white);
  color: var(--v2-primary);
  font-weight: 700;
}

.recorded-only-filter {
  min-height: 28px;
  padding: 0 3px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 9px;
  color: var(--v2-text-sub);
  font-size: 11px;
  font-weight: 550;
}

.recorded-only-filter button {
  position: relative;
  width: 34px;
  height: 20px;
  padding: 0;
  border: 0;
  border-radius: 999px;
  background: #ddd9e6;
  transition: background 0.18s ease;
}

.recorded-only-filter button span {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 1px 3px rgba(28, 18, 60, 0.16);
  transition: transform 0.18s ease;
}

.recorded-only-filter button.active {
  background: var(--v2-primary);
}

.recorded-only-filter button.active span {
  transform: translateX(14px);
}

.hand-sort-sheet {
  position: relative;
  width: min(100%, 390px);
  margin: 0 auto;
  padding: 30px 18px calc(14px + env(safe-area-inset-bottom));
  border-radius: 22px 22px 0 0;
  background: var(--v2-page-bg);
}

.hand-sort-sheet__handle {
  position: absolute;
  top: 9px;
  left: 50%;
  width: 38px;
  height: 4px;
  border-radius: 999px;
  background: #d7d3de;
  transform: translateX(-50%);
}

.hand-sort-backdrop {
  position: fixed;
  inset: 0;
  z-index: 4000;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  background: rgba(27, 23, 34, 0.42);
}

.hand-sort-sheet h2 {
  margin: 0 0 8px;
  color: #373240;
  font-size: 17px;
  font-weight: 650;
  text-align: center;
}

.hand-sort-sheet__options {
  display: grid;
}

.hand-sort-sheet__options button {
  width: 100%;
  min-height: 40px;
  padding: 0 8px;
  display: flex;
  align-items: center;
  gap: 11px;
  border: 0;
  background: transparent;
  color: var(--v2-text-main);
  font: inherit;
  font-size: 13px;
  font-weight: 550;
  text-align: left;
}

.hand-sort-sheet__options .q-icon {
  color: var(--v2-primary);
}


</style>
