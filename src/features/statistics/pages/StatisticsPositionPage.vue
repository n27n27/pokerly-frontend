<template>
  <q-page class="detail-page">
    <StatisticsDetailHeader title="포지션 통계" @change="applyFilters" />

    <section class="detail-section">
      <div class="kpi-grid">
        <article v-for="kpi in kpis" :key="kpi.label">
          <span>{{ kpi.label }}</span>
          <strong>{{ kpi.value }}</strong>
          <small>{{ kpi.sub }}</small>
        </article>
      </div>
    </section>

    <section class="position-section">
      <div class="position-section__heading">
        <h2>포지션별 플레이</h2>
        <span>VPIP · 승률</span>
      </div>
      <div class="position-list">
      <div v-if="loading" class="position-state">포지션 통계를 불러오는 중입니다.</div>
      <div v-else-if="loadError" class="position-state position-state--error">{{ loadError }}</div>
      <article v-for="row in loading || loadError ? [] : rows" :key="row.position">
        <div class="position-card__heading">
          <strong>{{ row.position }}</strong>
          <span>{{ row.count }}핸드</span>
        </div>
        <div class="position-card__metrics">
          <div>
            <span>VPIP</span>
            <strong>{{ formatRate(row.play) }}</strong>
            <i><b :style="{ width: `${row.play}%` }"></b></i>
          </div>
          <div>
            <span>승률</span>
            <strong :class="{ muted: row.participated === 0 }">
              {{ row.participated ? formatRate(row.win) : '-' }}
            </strong>
          </div>
        </div>
      </article>
      </div>
    </section>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { fetchAllGameSessions, fetchMonthlySessions } from 'src/api/gameSession'
import { fetchHandLogEvent } from 'src/api/handLogApi'
import { isVpipAction } from 'src/utils/handLogHandAnalysis'
import StatisticsDetailHeader from '../components/StatisticsDetailHeader.vue'

const positionOrder = ['UTG', 'MP', 'LJ', 'HJ', 'CO', 'BTN', 'SB', 'BB']
const winningResults = new Set(['SHOWDOWN_WIN', 'NON_SHOWDOWN_WIN', 'WIN'])
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
  return positionOrder.includes(value) ? value : ''
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
    position: normalizePosition(hand.position),
    participated: isVpipAction(hand.actionType || hand.preflopAction || ''),
    won: winningResults.has(String(hand.resultType || hand.result || '').toUpperCase()),
  }))
  .filter((hand) => hand.position))

const rows = computed(() => positionOrder.map((position) => {
  const positionHands = normalizedHands.value.filter((hand) => hand.position === position)
  const participatedHands = positionHands.filter((hand) => hand.participated)
  const wins = participatedHands.filter((hand) => hand.won).length
  return {
    position,
    count: positionHands.length,
    participated: participatedHands.length,
    play: positionHands.length ? participatedHands.length * 100 / positionHands.length : 0,
    win: participatedHands.length ? wins * 100 / participatedHands.length : 0,
  }
}))
const bestWinning = computed(() => [...rows.value]
  .filter((row) => row.participated > 0)
  .sort((a, b) => b.win - a.win || b.participated - a.participated)[0] || null)
const mostPlayed = computed(() => [...rows.value]
  .filter((row) => row.count > 0)
  .sort((a, b) => b.play - a.play || b.count - a.count)[0] || null)
const kpis = computed(() => [
  { label: '기록 핸드', value: normalizedHands.value.length.toLocaleString('ko-KR'), sub: '핸드' },
  { label: '최고 승률 포지션', value: bestWinning.value?.position || '-', sub: bestWinning.value ? formatRate(bestWinning.value.win) : '-' },
  { label: '최다 참여 포지션', value: mostPlayed.value?.position || '-', sub: mostPlayed.value ? formatRate(mostPlayed.value.play) : '-' },
])

const formatRate = (value) => `${Number(value || 0).toFixed(1)}%`
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

.position-section {
  display: grid;
  gap: 8px;
}

.position-section__heading {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding: 0 2px;
}

.position-section__heading h2 {
  margin: 0;
  color: var(--v2-text-main);
  font-size: 16px;
  font-weight: 560;
}

.position-section__heading span {
  color: var(--v2-text-sub);
  font-size: 11px;
}

.position-list {
  display: grid;
  gap: 8px;
}

.position-list article {
  min-width: 0;
  padding: 12px 14px;
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-md);
  background: #ffffff;
  box-shadow: 0 4px 12px rgba(28, 18, 60, 0.025);
  display: grid;
  grid-template-columns: 62px minmax(0, 1fr);
  align-items: center;
  gap: 12px;
}

.position-card__heading {
  min-width: 0;
  display: grid;
  justify-items: start;
  gap: 4px;
}

.position-card__heading strong {
  min-width: 42px;
  min-height: 28px;
  padding: 0 8px;
  border-radius: 9px;
  background: rgba(109, 69, 232, 0.1);
  color: var(--v2-primary);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 620;
}

.position-card__heading span {
  color: var(--v2-text-sub);
  font-size: 10px;
  white-space: nowrap;
}

.position-card__metrics {
  min-width: 0;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.position-card__metrics > div {
  min-width: 0;
  display: grid;
  gap: 4px;
}

.position-card__metrics span {
  color: var(--v2-text-sub);
  font-size: 10px;
}

.position-card__metrics strong {
  color: var(--v2-text-main);
  font-size: 13px;
  font-weight: 560;
}

.position-card__metrics strong.muted {
  color: var(--v2-text-sub);
}

.position-card__metrics i {
  width: 100%;
  height: 3px;
  overflow: hidden;
  border-radius: 999px;
  background: #eeebf4;
}

.position-card__metrics i b {
  display: block;
  max-width: 100%;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, var(--v2-primary), #9d7cff);
}

.position-state {
  min-height: 180px;
  display: grid;
  place-items: center;
  padding: 20px;
  color: var(--v2-text-sub);
  font-size: 12px;
  text-align: center;
}

.position-state--error {
  color: var(--v2-danger);
}

@media (max-width: 380px) {
  .position-list article {
    grid-template-columns: 54px minmax(0, 1fr);
    gap: 8px;
    padding: 11px 10px;
  }

  .position-card__metrics {
    gap: 6px;
  }
}
</style>
