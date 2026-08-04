<template>
  <q-page class="detail-page">
    <StatisticsDetailHeader title="핸드 통계" @change="applyFilters" />

    <section class="summary-panel">
      <div v-if="summaryCards.length" class="summary-strip">
        <div v-for="card in summaryCards" :key="card.label">
          <span>{{ card.label }}</span>
          <strong>{{ card.value }}</strong>
          <small>{{ card.sub }}</small>
        </div>
      </div>
      <div v-else class="summary-empty">표시할 핸드 기록이 없습니다.</div>
    </section>

    <section class="ranking-panel">
      <div class="ranking-panel__header">
        <h2>핸드별 기록</h2>
      </div>
      <div v-if="loading" class="ranking-empty">핸드 통계를 불러오는 중입니다.</div>
      <div v-else-if="loadError" class="ranking-empty ranking-empty--error">{{ loadError }}</div>
      <div v-else-if="rows.length" class="hand-table">
        <div class="hand-table__head">
          <span>순위</span>
          <span>핸드</span>
          <button type="button" :class="{ active: sortKey === 'play' }" @click="changeSort('play')">
            출현율
            <q-icon
              :class="{ 'sort-icon--hidden': sortKey !== 'play' }"
              :name="sortKey === 'play' && sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward'"
              size="13px"
            />
          </button>
          <button type="button" :class="{ active: sortKey === 'win' }" @click="changeSort('win')">
            승률
            <q-icon
              :class="{ 'sort-icon--hidden': sortKey !== 'win' }"
              :name="sortKey === 'win' && sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward'"
              size="13px"
            />
          </button>
        </div>
        <div v-for="row in displayedRows" :key="row.hand">
          <span>{{ row.rank }}</span>
          <strong>{{ row.hand }}</strong>
          <span>{{ formatRate(row.play) }}</span>
          <span :class="row.tone">{{ formatWinRate(row.win) }}</span>
        </div>
        <button v-if="rows.length > initialRowCount" class="hand-table__more" type="button" @click="showAllRows = !showAllRows">
          {{ showAllRows ? '접기' : `전체 ${rows.length}개 보기` }}
          <q-icon :name="showAllRows ? 'expand_less' : 'expand_more'" size="17px" />
        </button>
      </div>
      <div v-else class="ranking-empty">표시할 핸드 기록이 없습니다.</div>
    </section>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { fetchAllGameSessions, fetchMonthlySessions } from 'src/api/gameSession'
import { fetchHandLogEvent } from 'src/api/handLogApi'
import { getHandInputValue, normalizeHand } from 'src/utils/handLogHandAnalysis'
import StatisticsDetailHeader from '../components/StatisticsDetailHeader.vue'

const cardRanks = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2']
const startingHands = cardRanks.flatMap((highRank, highIndex) => cardRanks.flatMap((lowRank, lowIndex) => {
  if (highIndex === lowIndex) return [highRank + lowRank]
  if (highIndex < lowIndex) return [`${highRank}${lowRank}s`, `${highRank}${lowRank}o`]
  return []
}))
const sortKey = ref('play')
const sortDirection = ref('desc')
const initialRowCount = 20
const showAllRows = ref(false)
const filter = ref({
  year: new Date().getFullYear(),
  month: new Date().getMonth() + 1,
  allPeriod: false,
  venueId: null,
})
const sessions = ref([])
const hands = ref([])
const loading = ref(false)
const loadError = ref('')
let loadSequence = 0

const winningResults = new Set(['SHOWDOWN_WIN', 'NON_SHOWDOWN_WIN', 'WIN'])
const actionOf = (hand) => hand.actionType || hand.preflopAction || ''
const resultOf = (hand) => String(hand.resultType || hand.result || '').toUpperCase()
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
    action: actionOf(hand),
    won: winningResults.has(resultOf(hand)),
  }))
  .filter((hand) => hand.notation))

const scopedHands = computed(() => normalizedHands.value)

const handGroups = computed(() => {
  const counts = new Map()
  scopedHands.value.forEach((hand) => {
    const item = counts.get(hand.notation) || { hand: hand.notation, count: 0, wins: 0 }
    item.count += 1
    if (hand.won) item.wins += 1
    counts.set(hand.notation, item)
  })
  const total = scopedHands.value.length
  return startingHands.map((hand) => counts.get(hand) || { hand, count: 0, wins: 0 }).map((item) => ({
    ...item,
    play: total ? item.count * 100 / total : 0,
    win: item.count ? item.wins * 100 / item.count : null,
  }))
})

const summaryCards = computed(() => {
  const recordedGroups = handGroups.value.filter((item) => item.count > 0)
  if (!scopedHands.value.length || !recordedGroups.length) return []
  const byWin = [...recordedGroups].sort((a, b) => b.win - a.win || b.count - a.count || a.hand.localeCompare(b.hand))
  const highest = byWin[0]
  const lowest = byWin.at(-1)
  return [
    { label: '기록 핸드', value: scopedHands.value.length.toLocaleString('ko-KR'), sub: '핸드' },
    { label: '최고 승률', value: highest.hand, sub: formatRate(highest.win) },
    { label: '최저 승률', value: lowest.hand, sub: formatRate(lowest.win) },
  ]
})

const rows = computed(() => [...handGroups.value]
  .sort((a, b) => {
    if (sortKey.value === 'win' && (a.win === null || b.win === null)) {
      if (a.win === null && b.win !== null) return 1
      if (a.win !== null && b.win === null) return -1
    }
    const delta = a[sortKey.value] - b[sortKey.value]
    if (delta) return sortDirection.value === 'asc' ? delta : -delta
    return b.count - a.count || a.hand.localeCompare(b.hand)
  })
  .map((row, index) => ({
    ...row,
    rank: index + 1,
    tone: row.win === null ? 'neutral' : row.win >= 60 ? 'good' : row.win >= 50 ? 'warn' : 'bad',
  })))
const displayedRows = computed(() => showAllRows.value ? rows.value : rows.value.slice(0, initialRowCount))

const formatRate = (value) => `${Number(value || 0).toFixed(1)}%`
const formatWinRate = (value) => value === null ? '-' : formatRate(value)

const changeSort = (key) => {
  showAllRows.value = false
  if (sortKey.value === key) sortDirection.value = sortDirection.value === 'desc' ? 'asc' : 'desc'
  else {
    sortKey.value = key
    sortDirection.value = 'desc'
  }
}

const load = async () => {
  const sequence = ++loadSequence
  loading.value = true
  loadError.value = ''
  try {
    const sessionList = filter.value.allPeriod
      ? await fetchAllGameSessions()
      : await fetchMonthlySessions(filter.value.year, filter.value.month)
    const completed = filterByVenue((sessionList || []).filter((item) => item.tournamentStatus !== 'RUNNING'))
    sessions.value = completed
    const eventIds = [...new Set(completed.map((item) => item.handLogEventId).filter(Boolean).map(String))]
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
      .flatMap((event) => (event.blindLevels || []).flatMap((level) => level.hands || []))
  } catch (error) {
    if (sequence !== loadSequence) return
    console.error('핸드 통계 로드 실패', error)
    sessions.value = []
    hands.value = []
    loadError.value = '핸드 통계를 불러오지 못했습니다.'
  } finally {
    if (sequence === loadSequence) loading.value = false
  }
}

const applyFilters = (nextFilter) => {
  showAllRows.value = false
  filter.value = { ...nextFilter }
  void load()
}

onMounted(load)
</script>

<style scoped>
@import './statistics-detail.css';

.ranking-panel {
  min-width: 0;
  max-width: 100%;
  overflow: hidden;
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-lg);
  background: #ffffff;
  padding: 6px 20px 8px;
}

.ranking-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 2px;
}

.ranking-panel h2 {
  margin: 0;
  flex: 0 0 auto;
  font-size: 16px;
  font-weight: 520;
}

.hand-table {
  display: grid;
  min-width: 0;
  max-width: 100%;
}

.hand-table > div {
  min-height: 34px;
  display: grid;
  grid-template-columns: 40px repeat(3, minmax(0, 1fr));
  align-items: center;
  border-bottom: 1px solid var(--v2-border);
  column-gap: 0;
}

.hand-table > div:first-child {
  color: var(--v2-text-sub);
  font-size: 11px;
}

.hand-table__head button {
  min-width: 0;
  padding: 0;
  border: 0;
  background: transparent;
  color: inherit;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 3px;
  font: inherit;
  cursor: pointer;
}

.hand-table__head button.active {
  color: var(--v2-primary);
  font-weight: 600;
}

.hand-table__head .sort-icon--hidden {
  visibility: hidden;
}

.hand-table > div:last-child {
  border-bottom: 0;
}

.hand-table span,
.hand-table strong {
  font-size: 12px;
}

.hand-table > div > * {
  text-align: center;
}

.hand-table > div > *:first-child {
  text-align: left;
}

.hand-table strong {
  color: var(--v2-text-main);
  font-weight: 560;
}

.good { color: var(--v2-success); }
.warn { color: #f59e0b; }
.bad { color: var(--v2-danger); }
.neutral { color: var(--v2-text-sub); }

.hand-table > .hand-table__more {
  min-height: 42px;
  border: 0;
  background: transparent;
  color: var(--v2-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font: inherit;
  font-size: 12px;
  font-weight: 560;
  cursor: pointer;
}

.summary-empty,
.ranking-empty {
  display: grid;
  place-items: center;
  color: var(--v2-text-sub);
  font-size: 12px;
  text-align: center;
}

.summary-empty {
  min-height: 78px;
}

.summary-panel,
.summary-strip,
.summary-strip > div {
  min-height: 78px;
}

.ranking-empty {
  min-height: 180px;
}

.ranking-empty--error {
  color: var(--v2-danger);
}

@media (max-width: 420px) {
  .ranking-panel {
    padding: 6px 18px 8px;
  }

  .ranking-panel__header {
    gap: 8px;
    margin-bottom: 2px;
  }

  .ranking-panel h2 {
    font-size: 15px;
  }

}
</style>
