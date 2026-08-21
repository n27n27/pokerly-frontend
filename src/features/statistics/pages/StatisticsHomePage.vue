<template>
  <q-page class="stats-home-page">
    <header class="stats-header">
      <h1>통계</h1>
      <div class="filter-pair">
        <div class="month-filter" :class="{ 'month-filter--all': showAllPeriod }">
          <button
            v-if="!showAllPeriod"
            type="button"
            aria-label="이전 달"
            @click="moveMonth(-1)"
          >
            <q-icon name="chevron_left" size="19px" />
          </button>
          <button class="month-filter__label" type="button">
            <span>{{ periodLabel }}</span>
            <q-menu
              v-model="periodMenuOpen"
              class="stats-filter-menu stats-filter-menu--period"
              anchor="bottom middle"
              self="top middle"
              transition-show="jump-down"
              transition-hide="jump-up"
              :offset="[0, 6]"
            >
              <q-list aria-label="조회 기간 선택">
                <q-item
                  clickable
                  v-close-popup
                  :active="!showAllPeriod"
                  active-class="stats-filter-menu__active"
                  @click="showAllPeriod = false"
                >
                  <q-item-section>{{ monthLabel }}</q-item-section>
                  <q-item-section side>
                    <q-icon v-if="!showAllPeriod" name="check" size="17px" />
                  </q-item-section>
                </q-item>
                <q-item
                  clickable
                  v-close-popup
                  :active="showAllPeriod"
                  active-class="stats-filter-menu__active"
                  @click="showAllPeriod = true"
                >
                  <q-item-section>전체 기간</q-item-section>
                  <q-item-section side>
                    <q-icon v-if="showAllPeriod" name="check" size="17px" />
                  </q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </button>
          <button
            v-if="!showAllPeriod"
            type="button"
            aria-label="다음 달"
            :disabled="isCurrentMonth"
            @click="moveMonth(1)"
          >
            <q-icon name="chevron_right" size="19px" />
          </button>
        </div>
        <button type="button">
          <q-icon name="store" size="18px" />
          <span :title="selectedVenueLabel">{{ selectedVenueLabel }}</span>
          <q-icon name="expand_more" size="18px" />
          <q-menu
            v-model="venueMenuOpen"
            class="stats-filter-menu stats-filter-menu--venue"
            anchor="bottom right"
            self="top right"
            transition-show="jump-down"
            transition-hide="jump-up"
            :offset="[0, 6]"
          >
            <q-list aria-label="매장 선택">
              <q-item
                clickable
                v-close-popup
                :active="venueId === null"
                active-class="stats-filter-menu__active"
                @click="venueId = null"
              >
                <q-item-section>전체 매장</q-item-section>
                <q-item-section side>
                  <q-icon v-if="venueId === null" name="check" size="17px" />
                </q-item-section>
              </q-item>
              <q-item
                v-for="venue in venues"
                :key="venue.id"
                clickable
                v-close-popup
                :active="Number(venueId) === Number(venue.id)"
                active-class="stats-filter-menu__active"
                @click="venueId = venue.id"
              >
                <q-item-section>{{ venue.name }}</q-item-section>
                <q-item-section side>
                  <q-icon v-if="Number(venueId) === Number(venue.id)" name="check" size="17px" />
                </q-item-section>
              </q-item>
              <q-item
                clickable
                v-close-popup
                :active="venueId === 'other'"
                active-class="stats-filter-menu__active"
                @click="venueId = 'other'"
              >
                <q-item-section>기타</q-item-section>
                <q-item-section side>
                  <q-icon v-if="venueId === 'other'" name="check" size="17px" />
                </q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </button>
      </div>
    </header>

    <div v-if="loading" class="stats-state">통계를 불러오는 중입니다.</div>
    <div v-else-if="loadError" class="stats-state stats-state--error">{{ loadError }}</div>
    <section v-else-if="!filteredSessions.length" class="stats-empty">
      <span class="stats-empty__icon" aria-hidden="true">
        <q-icon name="monitoring" size="28px" />
      </span>
      <strong>{{ emptyStatsTitle }}</strong>
      <p>{{ emptyStatsDescription }}</p>
      <button type="button" @click="handleEmptyStatsAction">{{ emptyStatsActionLabel }}</button>
    </section>

    <template v-else>
      <section class="stats-section">
        <h2>뱅크 요약</h2>
        <div class="bank-grid">
          <article
            v-for="card in bankCards"
            :key="card.label"
            :class="[`bank-card--${card.tone}`, { 'bank-card--primary': card.primary }]"
          >
            <span>{{ card.label }}</span>
            <strong :class="card.valueTone">{{ card.value }}</strong>
          </article>
        </div>
      </section>

      <section v-if="statisticsInsights.length" class="stats-section insight-section">
        <div class="insight-section__heading">
          <h2>기록에서 확인한 점</h2>
          <span>{{ periodLabel }} · {{ filteredSessions.length }}개 대회</span>
        </div>
        <div class="insight-list">
          <article
            v-for="insight in statisticsInsights"
            :key="insight.key"
            class="insight-card"
            :class="`insight-card--${insight.tone}`"
          >
            <div class="insight-card__body">
              <strong>{{ insight.title }}</strong>
              <p>{{ insight.description }}</p>
            </div>
            <div class="insight-card__meta">
              <span>{{ insight.sample }}{{ insight.key.includes('venue') ? '회' : insight.key.includes('hand') ? '핸드' : '개 대회' }} 기준</span>
              <button v-if="insight.action" type="button" @click="openInsightEvidence(insight.action)">
                {{ insight.action.label }}
                <q-icon name="chevron_right" size="16px" />
              </button>
            </div>
          </article>
        </div>
        <small class="insight-section__notice">
          저장된 기록을 바탕으로 계산한 내용입니다.
        </small>
      </section>

      <section class="stats-section">
        <h2>손익 추세</h2>
        <div ref="trendPanelRef" class="summary-panel trend-panel">
          <div class="panel-header">
            <strong>{{ periodLabel }}</strong>
            <div class="trend-segment" role="radiogroup" aria-label="손익 그래프 표시 방식">
              <button
                type="button"
                :class="{ active: trendMode === 'cumulative' }"
                @click="trendMode = 'cumulative'"
              >
                누적
              </button>
              <button
                type="button"
                :class="{ active: trendMode === 'period' }"
                @click="trendMode = 'period'"
              >
                {{ periodProfitLabel }}
              </button>
            </div>
          </div>
          <div v-if="trendPoints.length" class="trend-visual" @mouseleave="trendTooltip = null">
            <svg
              v-if="trendMode === 'cumulative'"
              class="trend-chart"
              :viewBox="`0 0 ${trendChartWidth} 170`"
              preserveAspectRatio="none"
              role="img"
              aria-label="누적 순수익 추이"
            >
              <path class="trend-fill" :class="trendTone" :d="trendFillPath" />
              <path class="trend-line" :class="trendTone" :d="trendLinePath" />
              <g
                v-for="point in trendPoints"
                :key="point.key"
                class="trend-point"
                tabindex="0"
                @mouseenter="showTrendTooltip(point, 'cumulative')"
                @focus="showTrendTooltip(point, 'cumulative')"
                @click.stop="showTrendTooltip(point, 'cumulative')"
              >
                <circle class="trend-point__hit" :cx="point.x" :cy="point.y" r="10" />
                <circle :cx="point.x" :cy="point.y" r="2.6" />
              </g>
            </svg>
            <svg
              v-else-if="trendBars.length"
              class="trend-chart trend-chart--bars"
              :viewBox="`0 0 ${trendChartWidth} 170`"
              preserveAspectRatio="none"
              role="img"
              aria-label="기간별 손익 추이"
            >
              <line
                class="trend-zero"
                x1="4"
                :y1="trendZeroY"
                :x2="trendChartWidth - 4"
                :y2="trendZeroY"
              />
              <rect
                v-for="bar in trendBars"
                :key="bar.key"
                :class="bar.profit < 0 ? 'trend-bar--loss' : 'trend-bar--profit'"
                :x="bar.x"
                :y="bar.y"
                :width="bar.width"
                :height="bar.height"
                rx="2"
                tabindex="0"
                @mouseenter="showTrendTooltip(bar, 'period')"
                @focus="showTrendTooltip(bar, 'period')"
                @click.stop="showTrendTooltip(bar, 'period')"
              />
            </svg>
            <div
              v-if="trendTooltip"
              class="trend-tooltip"
              :style="{ left: `${trendTooltip.left}%`, top: `${trendTooltip.top}px` }"
            >
              <span>{{ trendTooltip.label }}</span>
              <strong :class="{ loss: trendTooltip.value < 0, profit: trendTooltip.value > 0 }">
                {{ formatSignedMan(trendTooltip.value) }}
              </strong>
            </div>
          </div>
          <div v-else class="chart-empty">표시할 손익 기록이 없습니다.</div>
          <div
            v-if="trendAxisLabels.length"
            class="trend-axis"
            :class="{
              'trend-axis--hidden': trendMode === 'period' && !showAllPeriod,
            }"
          >
            <span v-for="label in trendAxisLabels" :key="label">
              {{ label }}
            </span>
          </div>
        </div>
      </section>

      <section class="stats-section">
        <h2>최고 기록</h2>
        <div class="best-records">
          <article
            v-for="record in bestRecordCards"
            :key="record.key"
            :class="`best-records__${record.tone}`"
          >
            <span>{{ record.label }}</span>
            <strong :class="{ 'has-value': record.hasValue }">{{ record.value }}</strong>
            <small>{{ record.sub }}</small>
          </article>
        </div>
      </section>

      <section v-if="isDetailedMode" class="stats-section">
        <h2>플레이 분석</h2>
        <div class="analysis-grid">
          <button
            class="analysis-card--hand"
            type="button"
            @click="openAnalysisPage('statistics-hands')"
          >
            <div class="analysis-card-title">
              <span>핸드 통계</span>
              <q-icon name="chevron_right" size="18px" />
            </div>
            <div v-if="handSummary" class="analysis-summary">
              <strong>기록 핸드 {{ formatNumber(handSummary.total) }}개</strong>
              <strong>VPIP {{ handSummary.vpip }} · PFR {{ handSummary.pfr }}</strong>
            </div>
          </button>
          <button
            class="analysis-card--position"
            type="button"
            @click="openAnalysisPage('statistics-position')"
          >
            <div class="analysis-card-title">
              <span>포지션 통계</span>
              <q-icon name="chevron_right" size="18px" />
            </div>
            <div v-if="positionSummary" class="analysis-summary position-summary">
              <div>
                <span>참여율 최고</span>
                <strong
                  >{{ positionSummary.mostPlayed.position }}
                  <small>({{ positionSummary.mostPlayed.rate }})</small></strong
                >
              </div>
              <div>
                <span>승률 최고</span>
                <strong
                  >{{ positionSummary.bestWinning.position }}
                  <small>({{ positionSummary.bestWinning.rate }})</small></strong
                >
              </div>
            </div>
          </button>
        </div>
      </section>

      <section class="stats-section">
        <h2>{{ venueTableTitle }}</h2>
        <div v-if="sortedVenueRows.length" class="venue-table">
          <div class="venue-table__head">
            <span>매장</span>
            <button
              :class="{ active: venueSortKey === 'games' }"
              type="button"
              @click="toggleVenueSort('games')"
            >
              참가 수
              <q-icon
                :class="{ 'sort-icon--hidden': venueSortKey !== 'games' }"
                :name="venueSortDirection === 'desc' ? 'arrow_downward' : 'arrow_upward'"
                size="12px"
              />
            </button>
            <button
              :class="{ active: venueSortKey === 'itm' }"
              type="button"
              @click="toggleVenueSort('itm')"
            >
              ITM
              <q-icon
                :class="{ 'sort-icon--hidden': venueSortKey !== 'itm' }"
                :name="venueSortDirection === 'desc' ? 'arrow_downward' : 'arrow_upward'"
                size="12px"
              />
            </button>
            <button
              :class="{ active: venueSortKey === 'roi' }"
              type="button"
              @click="toggleVenueSort('roi')"
            >
              ROI
              <q-icon
                :class="{ 'sort-icon--hidden': venueSortKey !== 'roi' }"
                :name="venueSortDirection === 'desc' ? 'arrow_downward' : 'arrow_upward'"
                size="12px"
              />
            </button>
            <button
              :class="{ active: venueSortKey === 'profit' }"
              type="button"
              @click="toggleVenueSort('profit')"
            >
              순수익
              <q-icon
                :class="{ 'sort-icon--hidden': venueSortKey !== 'profit' }"
                :name="venueSortDirection === 'desc' ? 'arrow_downward' : 'arrow_upward'"
                size="12px"
              />
            </button>
          </div>
          <div v-for="row in sortedVenueRows" :key="row.name">
            <strong>{{ row.name }}</strong>
            <span>{{ row.games }}</span>
            <span>{{ row.itm }}</span>
            <span>{{ row.roi }}</span>
            <span :class="row.tone">{{ row.profit }}</span>
          </div>
        </div>
        <div v-else class="stats-state">해당 기간의 매장 기록이 없습니다.</div>
      </section>
    </template>
  </q-page>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { fetchAllGameSessions } from 'src/api/gameSession'
import { fetchHandLogEvent } from 'src/api/handLogApi'
import { fetchVenues } from 'src/api/venue'
import { useAuthStore } from 'src/stores/auth'
import { isPfrAction, isVpipAction } from 'src/utils/handLogHandAnalysis'
import { formatCompactNumber } from 'src/utils/numberFormat'
import { useBodyScrollLock } from 'src/composables/useBodyScrollLock'
import {
  buildBankInsights,
  buildPlayInsights,
} from '../utils/statisticsInsights'
import {
  buildAnalysisRows,
  normalizePosition,
  POSITION_ORDER,
} from '../utils/playAnalysis'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const now = new Date()
const initialVenueName = String(route.query.venueName || '')
const selectedYear = ref(Number(route.query.year) || now.getFullYear())
const selectedMonth = ref(Number(route.query.month) || now.getMonth() + 1)
const showAllPeriod = ref(route.query.allPeriod === '1')
const trendMode = ref('cumulative')
const venueId = ref(route.query.venueId === '' || route.query.venueId == null
  ? null
  : route.query.venueId)
const venueSortKey = ref('itm')
const venueSortDirection = ref('desc')
const sessions = ref([])
const allSessionCount = ref(0)
const venues = ref([])
const loading = ref(false)
const loadError = ref('')
const trendPanelRef = ref(null)
const trendChartWidth = ref(340)
const trendTooltip = ref(null)
const periodMenuOpen = ref(false)
const venueMenuOpen = ref(false)
const handEventCache = ref(new Map())
let loadSequence = 0
let trendResizeObserver = null

useBodyScrollLock(computed(() => periodMenuOpen.value || venueMenuOpen.value))

const monthLabel = computed(() => `${selectedYear.value}년 ${selectedMonth.value}월`)
const periodLabel = computed(() => (showAllPeriod.value ? '전체 기간' : monthLabel.value))
const periodProfitLabel = computed(() => (showAllPeriod.value ? '월별' : '일별'))
const isCurrentMonth = computed(
  () => selectedYear.value === now.getFullYear() && selectedMonth.value === now.getMonth() + 1,
)
const selectedVenueLabel = computed(() =>
  venueId.value === null
    ? '전체 매장'
    : venueId.value === 'other'
      ? '기타'
      : venues.value.find((item) => Number(item.id) === Number(venueId.value))?.name
        || initialVenueName
        || '전체 매장',
)
const recordMode = computed(
  () => auth.user?.recordMode || localStorage.getItem('pokerly-record-mode') || 'simple',
)
const isDetailedMode = computed(() => recordMode.value === 'detailed')
const analysisFilterQuery = computed(() => ({
  year: selectedYear.value,
  month: selectedMonth.value,
  allPeriod: showAllPeriod.value ? '1' : '0',
  venueId: venueId.value ?? '',
  venueName: selectedVenueLabel.value,
}))
const openAnalysisPage = (name) => router.push({ name, query: analysisFilterQuery.value })
const openInsightEvidence = (action) => {
  if (action.type === 'venue') {
    venueId.value = action.venueId === 'other' ? 'other' : action.venueId
    return
  }
  if (action.type === 'hands') {
    openAnalysisPage('statistics-hands')
    return
  }
  if (action.type === 'position') {
    router.push({
      name: 'statistics-position-detail',
      params: { position: action.position },
      query: { ...analysisFilterQuery.value, fromInsight: '1' },
    })
    return
  }
  router.push({
    name: 'tournament-list',
    query: { ...analysisFilterQuery.value, from: 'statistics' },
  })
}
const emptyStatsTitle = computed(() => {
  if (venueId.value !== null) return '선택한 매장에 기록이 없어요'
  if (!showAllPeriod.value && allSessionCount.value > 0) return '선택한 달에 기록이 없어요'
  return '아직 통계로 볼 기록이 없어요'
})
const emptyStatsDescription = computed(() => {
  if (venueId.value !== null) return '전체 매장을 선택하면 다른 기록을 확인할 수 있어요.'
  if (!showAllPeriod.value && allSessionCount.value > 0)
    return '전체 기간으로 전환하면 이전 기록을 확인할 수 있어요.'
  return '토너먼트 결과를 기록하면 손익과 플레이 통계가 만들어져요.'
})
const emptyStatsActionLabel = computed(() => {
  if (venueId.value !== null) return '전체 매장 보기'
  if (!showAllPeriod.value && allSessionCount.value > 0) return '전체 기간 보기'
  return '첫 기록 추가하기'
})
const handleEmptyStatsAction = () => {
  if (venueId.value !== null) {
    venueId.value = null
    return
  }
  if (!showAllPeriod.value && allSessionCount.value > 0) {
    showAllPeriod.value = true
    return
  }
  router.push(isDetailedMode.value ? '/app/tournament/start' : '/app/simple-record')
}
const filterByVenue = (list) =>
  venueId.value === null
    ? list
    : venueId.value === 'other'
      ? list.filter((item) => item.venueId == null)
      : list.filter((item) => Number(item.venueId) === Number(venueId.value))
const filteredSessions = computed(() => filterByVenue(sessions.value))
const filteredHands = computed(() => {
  const eventIds = new Set(
    filteredSessions.value
      .map((item) => item.handLogEventId)
      .filter(Boolean)
      .map(String),
  )
  return [...handEventCache.value.entries()]
    .filter(([eventId, event]) => event && eventIds.has(String(eventId)))
    .flatMap(([, event]) => (event.blindLevels || []).flatMap((level) => level.hands || []))
})

const numberValue = (value) => Number(value) || 0
const totalBuyInOf = (session) => {
  const buyInPerEntry = numberValue(session.buyInPerEntry)
  const entries = Math.max(1, numberValue(session.entries))
  const discount = numberValue(session.discount)

  if (buyInPerEntry > 0) return Math.max(0, buyInPerEntry * entries - discount)
  return Math.max(0, numberValue(session.totalBuyIn))
}
const formatNumber = (value) => Math.round(numberValue(value)).toLocaleString('ko-KR')
const formatSignedMan = (value) => {
  const amount = numberValue(value)
  const man = Math.round(Math.abs(amount) / 1000) / 10
  return `${amount > 0 ? '+' : amount < 0 ? '-' : ''}${man.toLocaleString('ko-KR')}만`
}
const formatSignedCompact = (value) =>
  formatCompactNumber(numberValue(value), { signDisplay: 'exceptZero' })
const formatCompact = (value) => formatCompactNumber(numberValue(value))
const formatPercent = (value) => `${numberValue(value).toFixed(1)}%`
const isItm = (session) => {
  const result = String(session.tournamentResult || '').trim().toUpperCase()
  if (result) return ['ITM', 'CHOP', 'WIN'].includes(result)
  return numberValue(session.prize) > 0
}
const formatHandRate = (count, total) => (total ? `${Math.round((count * 100) / total)}%` : '-')
const actionOf = (hand) => hand.actionType || hand.preflopAction || ''
const handSummary = computed(() => {
  const hands = filteredHands.value
  if (!hands.length) return null
  const vpip = hands.filter((hand) => isVpipAction(actionOf(hand))).length
  const pfr = hands.filter((hand) => isPfrAction(actionOf(hand))).length
  return {
    total: hands.length,
    vpip: formatHandRate(vpip, hands.length),
    pfr: formatHandRate(pfr, hands.length),
  }
})

const positionSummary = computed(() => {
  const hands = filteredHands.value.filter((hand) => normalizePosition(hand.position))
  if (!hands.length) return null
  const rows = buildAnalysisRows(POSITION_ORDER, hands, (hand) => normalizePosition(hand.position))
    .filter((row) => row.total > 0)
  const mostPlayed = [...rows].sort((a, b) => b.participationRate - a.participationRate)[0]
  const bestWinning = [...rows]
    .filter((row) => row.participated > 0)
    .sort((a, b) => b.winRate - a.winRate)[0]
  if (!mostPlayed || !bestWinning) return null
  return {
    mostPlayed: {
      position: mostPlayed.label,
      rate: formatHandRate(mostPlayed.participationRate, 100),
    },
    bestWinning: {
      position: bestWinning.label,
      rate: formatHandRate(bestWinning.winRate, 100),
    },
  }
})

const aggregateSessions = (list) => {
  const totalBuyIn = list.reduce((sum, item) => sum + totalBuyInOf(item), 0)
  const totalPrize = list.reduce((sum, item) => sum + numberValue(item.prize), 0)
  const totalDiscount = list.reduce((sum, item) => sum + numberValue(item.discount), 0)
  const totalEntries = list.reduce((sum, item) => sum + Math.max(1, numberValue(item.entries)), 0)
  const buyInSamples = list
    .map((item) => numberValue(item.buyInPerEntry))
    .filter((value) => value > 0)
  const itmCount = list.filter(isItm).length
  const totalProfit = totalPrize - totalBuyIn
  return {
    games: list.length,
    totalBuyIn,
    totalPrize,
    totalDiscount,
    totalEntries,
    reentries: Math.max(0, totalEntries - list.length),
    totalProfit,
    roi: totalBuyIn > 0 ? (totalProfit * 100) / totalBuyIn : 0,
    itmRate: list.length ? (itmCount * 100) / list.length : 0,
    avgEntries: list.length ? totalEntries / list.length : 0,
    avgBuyIn: buyInSamples.length
      ? buyInSamples.reduce((sum, value) => sum + value, 0) / buyInSamples.length
      : 0,
  }
}
const totals = computed(() => aggregateSessions(filteredSessions.value))
const bestPrizeSession = computed(() =>
  filteredSessions.value.reduce((best, item) => {
    if (numberValue(item.prize) <= 0) return best
    if (!best || numberValue(item.prize) > numberValue(best.prize)) return item
    return best
  }, null),
)
const bestRankSession = computed(() =>
  filteredSessions.value.reduce((best, item) => {
    const resolvedRank =
      numberValue(item.finalRank) > 0
        ? numberValue(item.finalRank)
        : String(item.tournamentResult || '').toUpperCase() === 'WIN'
          ? 1
          : null
    if (!resolvedRank) return best
    const candidate = { ...item, resolvedRank }
    if (!best || resolvedRank < best.resolvedRank) return candidate
    return best
  }, null),
)
const bestRoiSession = computed(() =>
  filteredSessions.value.reduce((best, item) => {
    const totalBuyIn = totalBuyInOf(item)
    if (totalBuyIn <= 0) return best
    const roi = ((numberValue(item.prize) - totalBuyIn) * 100) / totalBuyIn
    if (!best || roi > best.roi) return { ...item, roi }
    return best
  }, null),
)
const maxItmStreak = computed(() => {
  const ordered = [...filteredSessions.value].sort((a, b) => {
    const dateDelta = String(a.playDate || '').localeCompare(String(b.playDate || ''))
    return dateDelta || numberValue(a.id) - numberValue(b.id)
  })
  let current = 0
  let maximum = 0
  ordered.forEach((session) => {
    current = isItm(session) ? current + 1 : 0
    maximum = Math.max(maximum, current)
  })
  return maximum
})
const bestRecordCards = computed(() => [
  {
    key: 'prize',
    label: '최고 상금',
    value: bestPrizeSession.value ? formatCompact(bestPrizeSession.value.prize) : '-',
    sub: bestPrizeSession.value?.tournamentName || '',
    tone: 'point',
    hasValue: Boolean(bestPrizeSession.value),
  },
  {
    key: 'rank',
    label: '최고 순위',
    value: bestRankSession.value ? `${bestRankSession.value.resolvedRank}위` : '-',
    sub: bestRankSession.value?.tournamentName || '',
    tone: 'rank',
    hasValue: Boolean(bestRankSession.value),
  },
  {
    key: 'roi',
    label: '최고 ROI',
    value: bestRoiSession.value ? formatPercent(bestRoiSession.value.roi) : '-',
    sub: bestRoiSession.value?.tournamentName || '',
    tone: 'roi',
    hasValue: Boolean(bestRoiSession.value),
  },
  {
    key: 'itmStreak',
    label: '최대 연속 ITM',
    value: maxItmStreak.value ? `${maxItmStreak.value}회` : '-',
    sub: maxItmStreak.value ? '연속 진출' : '',
    tone: 'streak',
    hasValue: maxItmStreak.value > 0,
  },
])

const bankCards = computed(() => [
  {
    label: '순수익',
    value: filteredSessions.value.length ? formatSignedCompact(totals.value.totalProfit) : '-',
    tone: 'profit',
    primary: true,
    valueTone:
      totals.value.totalProfit > 0 ? 'positive' : totals.value.totalProfit < 0 ? 'negative' : '',
  },
  {
    label: 'ROI',
    value: filteredSessions.value.length ? formatPercent(totals.value.roi) : '-',
    tone: 'roi',
    primary: true,
    valueTone: totals.value.roi > 0 ? 'positive' : totals.value.roi < 0 ? 'negative' : '',
  },
  {
    label: 'ITM',
    value: filteredSessions.value.length ? formatPercent(totals.value.itmRate) : '-',
    tone: 'itm',
  },
  {
    label: '총 바인금액',
    value: filteredSessions.value.length ? formatCompact(totals.value.totalBuyIn) : '-',
    tone: 'totalBuyIn',
  },
  {
    label: '총 상금',
    value: filteredSessions.value.length ? formatCompact(totals.value.totalPrize) : '-',
    tone: 'totalPrize',
  },
  {
    label: '참가 대회',
    value: filteredSessions.value.length ? formatNumber(totals.value.games) : '-',
    tone: 'count',
  },
  {
    label: '평균 엔트리',
    value: filteredSessions.value.length ? `${totals.value.avgEntries.toFixed(2)}회` : '-',
    tone: 'average',
  },
  {
    label: '평균 바인',
    value: filteredSessions.value.length ? formatCompact(totals.value.avgBuyIn) : '-',
    tone: 'averageBuyIn',
  },
])

const venueNameOf = (id) => {
  if (id === 'other') return '기타'
  return venues.value.find((venue) => String(venue.id) === String(id))?.name || '기타'
}
const statisticsInsights = computed(() => [
  ...buildBankInsights(filteredSessions.value, venueNameOf),
  ...(isDetailedMode.value ? buildPlayInsights(filteredHands.value) : []),
].slice(0, 4))

const venueRows = computed(() => {
  const grouped = new Map()
  sessions.value.forEach((item) => {
    const key = item.venueId == null ? 'other' : Number(item.venueId)
    if (!grouped.has(key)) grouped.set(key, [])
    grouped.get(key).push(item)
  })
  return [...grouped.entries()].map(([id, list]) => {
    const buyIn = list.reduce((sum, item) => sum + totalBuyInOf(item), 0)
    const prize = list.reduce((sum, item) => sum + numberValue(item.prize), 0)
    const profit = prize - buyIn
    const itmCount = list.filter(isItm).length
    return {
      id,
      name:
        id === 'other'
          ? '기타'
          : venues.value.find((item) => Number(item.id) === id)?.name || '기타',
      isOther: id === 'other' || !venues.value.some((item) => Number(item.id) === id),
      rawGames: list.length,
      games: formatNumber(list.length),
      rawRoi: buyIn > 0 ? (profit * 100) / buyIn : 0,
      rawItm: list.length ? (itmCount * 100) / list.length : 0,
      roi: formatPercent(buyIn > 0 ? (profit * 100) / buyIn : 0),
      rawProfit: profit,
      profit: formatSignedMan(profit),
      itm: formatPercent(list.length ? (itmCount * 100) / list.length : 0),
      tone: profit < 0 ? 'negative' : 'positive',
    }
  })
})
const visibleVenueRows = computed(() => {
  if (venueId.value === null) return venueRows.value
  if (venueId.value === 'other') return venueRows.value.filter((row) => row.isOther)
  return venueRows.value.filter((row) => row.id === Number(venueId.value))
})
const venueTableTitle = computed(() =>
  venueId.value === null ? '매장별 통계' : `${selectedVenueLabel.value} 통계`,
)
const sortedVenueRows = computed(() => {
  const valueOf = (row) => {
    if (venueSortKey.value === 'games') return row.rawGames
    if (venueSortKey.value === 'itm') return row.rawItm
    if (venueSortKey.value === 'roi') return row.rawRoi
    return row.rawProfit
  }
  return [...visibleVenueRows.value].sort((a, b) => {
    if (a.isOther !== b.isOther) return a.isOther ? 1 : -1
    const difference = valueOf(a) - valueOf(b)
    return venueSortDirection.value === 'asc' ? difference : -difference
  })
})
const toggleVenueSort = (key) => {
  if (venueSortKey.value === key) {
    venueSortDirection.value = venueSortDirection.value === 'desc' ? 'asc' : 'desc'
    return
  }
  venueSortKey.value = key
  venueSortDirection.value = 'desc'
}

const trendSeries = computed(() => {
  const grouped = new Map()
  filteredSessions.value.forEach((item) => {
    const date = String(item.playDate || '')
    if (!date) return
    const key = showAllPeriod.value ? date.slice(0, 7) : date
    grouped.set(key, (grouped.get(key) || 0) + numberValue(item.prize) - totalBuyInOf(item))
  })
  let cumulative = 0
  return [...grouped.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, profit]) => {
      cumulative += profit
      return {
        key,
        label: showAllPeriod.value ? key.replace('-', '.') : `${Number(key.slice(8, 10))}일`,
        profit,
        value: cumulative,
      }
    })
})
const trendPoints = computed(() => {
  const values = trendSeries.value.map((item) => item.value)
  if (!values.length) return []
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = Math.max(1, max - min)
  return values.map((value, index) => ({
    ...trendSeries.value[index],
    x:
      values.length === 1
        ? trendChartWidth.value / 2
        : 4 + index * ((trendChartWidth.value - 8) / (values.length - 1)),
    y: 144 - ((value - min) / range) * 120,
  }))
})
const trendAxisLabels = computed(() => {
  const labels = trendSeries.value.map((item) => item.label)
  if (labels.length <= 6) return labels
  const indices = [
    0,
    Math.round((labels.length - 1) / 4),
    Math.round((labels.length - 1) / 2),
    Math.round(((labels.length - 1) * 3) / 4),
    labels.length - 1,
  ]
  return [...new Set(indices)].map((index) => labels[index])
})
const trendBarScale = computed(() => {
  const values = trendSeries.value.map((item) => item.profit)
  const positiveMax = Math.max(0, ...values)
  const negativeMax = Math.max(0, ...values.map((value) => Math.abs(Math.min(0, value))))
  const total = Math.max(1, positiveMax + negativeMax)
  return {
    positiveMax,
    negativeMax,
    zeroY: 18 + (positiveMax / total) * 128,
    pixelPerValue: 128 / total,
  }
})
const trendZeroY = computed(() => trendBarScale.value.zeroY)
const trendBars = computed(() => {
  const count = trendSeries.value.length
  if (!count) return []
  const slot = (trendChartWidth.value - 8) / count
  const width = Math.max(3, Math.min(18, slot * 0.62))
  return trendSeries.value.map((item, index) => {
    const rawHeight = Math.abs(item.profit) * trendBarScale.value.pixelPerValue
    const height = item.profit === 0 ? 2 : Math.max(3, rawHeight)
    return {
      ...item,
      x: 4 + index * slot + (slot - width) / 2,
      y: item.profit >= 0 ? trendZeroY.value - height : trendZeroY.value,
      width,
      height,
    }
  })
})

const trendLinePath = computed(() =>
  trendPoints.value
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' '),
)

const trendTone = computed(() => {
  const value = trendPoints.value.at(-1)?.value || 0
  return value > 0 ? 'profit' : value < 0 ? 'loss' : 'neutral'
})

const trendFillPath = computed(
  () => `${trendLinePath.value} L ${trendChartWidth.value - 4} 150 L 4 150 Z`,
)

const showTrendTooltip = (item, mode) => {
  const centerX = mode === 'period' ? item.x + item.width / 2 : item.x
  const anchorY = mode === 'period' ? (item.profit >= 0 ? item.y : item.y + item.height) : item.y
  trendTooltip.value = {
    label: item.label,
    value: mode === 'period' ? item.profit : item.value,
    left: Math.max(8, Math.min(92, (centerX * 100) / trendChartWidth.value)),
    top: Math.max(4, (anchorY * 148) / 170 - 48),
  }
}

const moveMonth = (delta) => {
  if (showAllPeriod.value) return
  const date = new Date(selectedYear.value, selectedMonth.value - 1 + delta, 1)
  const nextIsFuture =
    date.getFullYear() > now.getFullYear() ||
    (date.getFullYear() === now.getFullYear() && date.getMonth() + 1 > now.getMonth() + 1)
  if (nextIsFuture) return
  selectedYear.value = date.getFullYear()
  selectedMonth.value = date.getMonth() + 1
}

const loadHandEvents = async (sessionList) => {
  const eventIds = [
    ...new Set(
      sessionList
        .map((item) => item.handLogEventId)
        .filter(Boolean)
        .map(String),
    ),
  ].filter((eventId) => !handEventCache.value.has(eventId))
  if (!eventIds.length) return

  const results = await Promise.all(
    eventIds.map(async (eventId) => {
      try {
        return [eventId, await fetchHandLogEvent(eventId)]
      } catch {
        return [eventId, null]
      }
    }),
  )
  const nextCache = new Map(handEventCache.value)
  results.forEach(([eventId, event]) => nextCache.set(eventId, event))
  handEventCache.value = nextCache
}

const load = async () => {
  const sequence = ++loadSequence
  loading.value = true
  loadError.value = ''
  try {
    const allSessionsPromise = fetchAllGameSessions()
    const [allSessionList, venueList] = await Promise.all([allSessionsPromise, fetchVenues()])
    if (sequence !== loadSequence) return
    const completedSessions = (allSessionList || []).filter(
      (item) => item.tournamentStatus !== 'RUNNING',
    )
    allSessionCount.value = completedSessions.length
    if (showAllPeriod.value) {
      sessions.value = completedSessions
    } else {
      const monthPrefix = `${selectedYear.value}-${String(selectedMonth.value).padStart(2, '0')}-`
      sessions.value = completedSessions.filter((item) =>
        String(item.playDate || '').startsWith(monthPrefix),
      )
    }
    venues.value = venueList || []
    if (
      venueId.value !== null &&
      venueId.value !== 'other' &&
      !venues.value.some((item) => Number(item.id) === Number(venueId.value))
    )
      venueId.value = null
    void loadHandEvents(filterByVenue(sessions.value))
  } catch (error) {
    if (sequence !== loadSequence) return
    console.error('통계 로드 실패', error)
    sessions.value = []
    allSessionCount.value = 0
    loadError.value = '통계를 불러오지 못했습니다.'
  } finally {
    if (sequence === loadSequence) loading.value = false
  }
}

watch([selectedYear, selectedMonth, showAllPeriod], load)
watch(venueId, () => {
  void loadHandEvents(filteredSessions.value)
})
watch(trendMode, () => {
  trendTooltip.value = null
})
onMounted(() => {
  load()
  trendResizeObserver = new ResizeObserver(([entry]) => {
    const contentWidth = Math.max(280, Math.round(entry.contentRect.width))
    trendChartWidth.value = contentWidth
  })
  if (trendPanelRef.value) trendResizeObserver.observe(trendPanelRef.value)
})
onBeforeUnmount(() => trendResizeObserver?.disconnect())
</script>

<style scoped>
.stats-home-page {
  display: grid;
  align-content: start;
  gap: 16px;
  padding: var(--v2-page-padding-top) var(--v2-page-padding-x) 88px;
}

.stats-header {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 6px 10px;
  align-items: center;
  min-height: var(--v2-detail-topbar-height);
}

.stats-header h1 {
  margin: 0;
  color: var(--v2-text-main);
  font-size: 22px;
  font-weight: 560;
  line-height: 1.2;
}

.stats-header p {
  grid-column: 1 / -1;
  margin: 0;
  color: var(--v2-text-sub);
  font-size: 12px;
  line-height: 1.35;
}

.stats-state {
  min-height: 92px;
  display: grid;
  place-items: center;
  padding: 20px;
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-lg);
  background: #fff;
  color: var(--v2-text-sub);
  font-size: 13px;
  text-align: center;
}

.stats-state--error {
  color: var(--v2-danger);
}

.stats-empty {
  display: grid;
  min-height: 360px;
  place-items: center;
  align-content: center;
  gap: 10px;
  padding: 32px 20px;
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-lg);
  background: linear-gradient(145deg, #fff 55%, #f8f5ff 100%);
  box-shadow: var(--v2-shadow-card);
  text-align: center;
}

.stats-empty__icon {
  display: grid;
  width: 58px;
  height: 58px;
  margin-bottom: 4px;
  place-items: center;
  border-radius: 18px;
  background: var(--v2-primary-soft);
  color: var(--v2-primary);
}

.stats-empty strong {
  font-size: 17px;
  font-weight: 650;
}

.stats-empty p {
  margin: 0;
  color: var(--v2-text-sub);
  font-size: 12px;
  line-height: 1.5;
}

.stats-empty button {
  min-height: 40px;
  margin-top: 8px;
  padding: 0 18px;
  border: 0;
  border-radius: 11px;
  background: var(--v2-primary);
  color: #fff;
  font: inherit;
  font-size: 13px;
  font-weight: 650;
  box-shadow: 0 7px 18px rgba(109, 69, 232, 0.22);
}

.analysis-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.analysis-grid > button,
.analysis-grid > article {
  position: relative;
  min-width: 0;
  min-height: 108px;
  display: grid;
  align-content: start;
  grid-template-rows: auto 1fr;
  gap: 12px;
  padding: 16px;
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-lg);
  background: #fff;
  color: var(--v2-text-main);
  font: inherit;
  text-align: left;
  overflow: hidden;
}

.analysis-grid > button::before {
  position: absolute;
  inset: 0 0 auto;
  height: 3px;
  content: '';
}

.analysis-card--hand::before {
  background: rgba(109, 69, 232, 0.62);
}

.analysis-card--position::before {
  background: rgba(22, 139, 133, 0.62);
}

.analysis-card-title {
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.analysis-card-title span {
  font-size: 13px;
  font-weight: 600;
  line-height: 1.2;
}

.analysis-card-title .q-icon {
  flex: 0 0 auto;
  color: var(--v2-text-sub);
}

.analysis-card--hand .analysis-card-title .q-icon {
  color: rgba(109, 69, 232, 0.72);
}

.analysis-card--position .analysis-card-title .q-icon {
  color: rgba(22, 139, 133, 0.76);
}

.analysis-summary {
  min-width: 0;
  display: grid;
  align-content: start;
  gap: 7px;
}

.analysis-summary strong {
  color: var(--v2-primary);
  font-size: 13px;
  font-weight: 600;
  line-height: 1.25;
  white-space: nowrap;
}

.analysis-card--position .analysis-summary strong {
  color: #168b85;
}

.position-summary {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.position-summary > div {
  min-width: 0;
  display: grid;
  gap: 3px;
}

.position-summary > div > span {
  color: var(--v2-text-sub);
  font-size: 10px;
  font-weight: 520;
}

.position-summary strong small {
  color: inherit;
  font-size: 10px;
  font-weight: 520;
}

.analysis-grid small {
  color: var(--v2-text-sub);
  font-size: 11px;
  line-height: 1.45;
  word-break: keep-all;
}

.best-records {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.best-records article {
  min-height: 86px;
  display: grid;
  place-items: center;
  align-content: center;
  gap: 7px;
  padding: 12px 8px;
  border: 1px solid rgba(109, 69, 232, 0.08);
  border-radius: 13px;
  background: linear-gradient(145deg, #fff 55%, #faf8ff 100%);
  box-shadow: 0 5px 14px rgba(28, 18, 60, 0.035);
  text-align: center;
}

.best-records span {
  color: var(--v2-text-sub);
  font-size: 11px;
  font-weight: 650;
}

.best-records strong {
  color: var(--v2-primary);
  font-size: 17px;
  font-weight: 700;
}

.best-records__rank strong.has-value {
  color: var(--v2-gold);
}

.best-records__roi strong.has-value {
  color: var(--v2-profit);
}

.best-records__streak strong.has-value {
  color: var(--v2-teal);
}

.best-records small {
  overflow: hidden;
  max-width: calc(100% - 20px);
  color: var(--v2-text-sub);
  font-size: 10px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chart-empty {
  min-height: 170px;
  display: grid;
  place-items: center;
  color: var(--v2-text-sub);
  font-size: 12px;
}

.filter-pair {
  display: grid;
  grid-template-columns: 156px 144px;
  justify-content: flex-end;
  gap: 6px;
}

.filter-pair > button,
.panel-header button {
  min-width: 0;
  min-height: 38px;
  padding: 0 8px;
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-md);
  background: #ffffff;
  color: #4f4a5e;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  column-gap: 7px;
  font: inherit;
  font-size: 12px;
}

.filter-pair > button,
.month-filter {
  border-color: rgba(109, 69, 232, 0.14);
  box-shadow: 0 4px 12px rgba(28, 18, 60, 0.035);
}

.month-filter--all {
  grid-template-columns: 1fr;
}

.filter-pair > button:hover,
.month-filter:hover {
  border-color: rgba(109, 69, 232, 0.28);
}

.filter-pair > button:focus,
.month-filter > button:focus,
.panel-header button:focus {
  outline: none;
}

.filter-pair > button:focus-visible,
.month-filter > button:focus-visible,
.panel-header button:focus-visible {
  outline: none;
  box-shadow: none;
}

.month-filter {
  width: 156px;
  min-width: 0;
  min-height: 38px;
  display: grid;
  grid-template-columns: 32px minmax(88px, 1fr) 32px;
  align-items: center;
  overflow: hidden;
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-md);
  background: #fff;
}

.month-filter > button {
  min-width: 0;
  min-height: 36px;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--v2-text-main);
  display: grid;
  place-items: center;
  font: inherit;
}

.month-filter > button:disabled {
  color: #d6d1df;
}

.month-filter .month-filter__label {
  display: flex;
  gap: 3px;
  justify-content: center;
  color: var(--v2-text-main);
  font-size: 12px;
  font-weight: 560;
  white-space: nowrap;
}

.filter-pair span {
  min-width: 0;
  overflow: hidden;
  color: var(--v2-text-main);
  font-weight: 650;
  line-height: 1;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.panel-header button {
  display: inline-flex;
  min-width: 70px;
  min-height: 28px;
  padding: 0 10px;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

:global(.stats-filter-menu) {
  overflow: hidden;
  border: 1px solid rgba(109, 69, 232, 0.13);
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 14px 36px rgba(35, 25, 68, 0.15);
}

:global(.stats-filter-menu--period) {
  width: 176px;
}

:global(.stats-filter-menu--venue) {
  width: 224px;
  max-height: min(420px, 65vh);
}

:global(.stats-filter-menu .q-list) {
  padding: 6px;
}

:global(.stats-filter-menu--venue .q-list) {
  max-height: min(408px, 65vh);
  overflow-y: auto;
}

:global(.stats-filter-menu .q-item) {
  min-height: 42px;
  padding: 8px 11px;
  border-radius: 9px;
  color: var(--v2-text-main);
  font-size: 13px;
  font-weight: 550;
}

:global(.stats-filter-menu .q-item + .q-item) {
  margin-top: 2px;
}

:global(.stats-filter-menu .q-item:hover) {
  background: #f8f6fd;
}

:global(.stats-filter-menu .stats-filter-menu__active) {
  color: var(--v2-primary);
  background: rgba(109, 69, 232, .08);
  background: color-mix(in srgb, var(--v2-primary) 8%, white);
  font-weight: 700;
}

:global(.stats-filter-menu .q-item__section--side) {
  min-width: 22px;
  padding-left: 8px;
  color: var(--v2-primary);
}

.summary-panel,
.metric-grid article,
.bank-grid article {
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-lg);
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 8px 20px rgba(28, 18, 60, 0.024);
}

.summary-panel {
  padding: 12px;
}

h2 {
  margin: 0 0 10px;
  color: #373240;
  font-size: 14px;
  font-weight: 650;
  line-height: 1.15;
}

.summary-panel > h3,
.panel-header h3 {
  margin: 0;
  color: var(--v2-text-main);
  font-size: 14px;
  font-weight: 700;
  line-height: 1.15;
}

.summary-panel > h3 {
  margin-bottom: 10px;
}

.summary-strip,
.metric-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.metric-grid {
  gap: 5px;
}

.metric-grid article {
  min-height: 64px;
  padding: 10px 11px;
  display: grid;
  place-items: center;
  align-content: center;
  gap: 7px;
  text-align: center;
}

.summary-strip div {
  display: grid;
  justify-items: center;
  gap: 3px;
  min-height: 58px;
  padding: 4px 3px;
  border-right: 1px solid var(--v2-border);
  text-align: center;
}

.summary-strip div:last-child {
  border-right: 0;
}

.summary-strip span,
.summary-strip small {
  color: var(--v2-text-sub);
  font-size: 10px;
  font-weight: 600;
}

.summary-strip strong,
.metric-grid strong,
.bank-grid strong {
  color: var(--v2-text-main);
  font-size: 19px;
  font-weight: 700;
  line-height: 1;
}

.bank-grid strong.positive {
  color: var(--v2-profit);
}

.bank-grid strong.negative {
  color: var(--v2-loss);
}

.bank-grid strong {
  font-weight: 560;
}

.stats-section {
  display: grid;
  gap: 10px;
}

.stats-section > h2 {
  margin: 0;
}

.insight-section__heading {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
}

.insight-section__heading h2 {
  margin-bottom: 4px;
}

.insight-section__heading > span,
.insight-section__notice {
  color: var(--v2-text-sub);
  font-size: 10px;
}

.insight-list {
  display: grid;
  gap: 7px;
}

.insight-card {
  position: relative;
  display: grid;
  gap: 11px;
  padding: 15px;
  overflow: hidden;
  border: 1px solid rgba(109, 69, 232, 0.11);
  border-radius: var(--v2-radius-lg);
  background: #fff;
  box-shadow: 0 6px 16px rgba(28, 18, 60, 0.03);
}

.insight-card::before {
  position: absolute;
  inset: 0 auto 0 0;
  width: 3px;
  background: #9a92aa;
  content: '';
}

.insight-card--positive::before { background: var(--v2-profit); }
.insight-card--caution::before { background: var(--v2-gold); }

.insight-card__body {
  display: grid;
  gap: 5px;
}

.insight-card__body strong {
  color: var(--v2-text-main);
  font-size: 13px;
  font-weight: 680;
}

.insight-card__body p {
  margin: 0;
  color: var(--v2-text-sub);
  font-size: 11px;
  line-height: 1.55;
  word-break: keep-all;
}

.insight-card__meta {
  display: flex;
  min-height: 24px;
  align-items: center;
  gap: 6px;
}

.insight-card__meta > span {
  padding: 4px 7px;
  border-radius: 999px;
  background: #f4f2f7;
  color: var(--v2-text-sub);
  font-size: 9px;
  font-weight: 650;
}

.insight-card__meta button {
  display: inline-flex;
  min-height: 28px;
  margin-left: auto;
  padding: 0 2px 0 8px;
  align-items: center;
  border: 0;
  background: transparent;
  color: var(--v2-primary);
  font: inherit;
  font-size: 10px;
  font-weight: 650;
}

.insight-section__notice {
  padding: 1px 3px 0;
  line-height: 1.45;
}

.bank-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 6px;
}

.bank-grid article {
  min-height: 74px;
  padding: 10px 6px;
  display: grid;
  place-items: center;
  align-content: center;
  gap: 5px;
  text-align: center;
  position: relative;
  overflow: hidden;
  border-color: rgba(109, 69, 232, 0.08);
  border-radius: 13px;
  box-shadow: 0 5px 14px rgba(28, 18, 60, 0.035);
}

.bank-grid article::before {
  position: absolute;
  inset: 0;
  content: '';
  opacity: 0;
  pointer-events: none;
}

.bank-grid article.bank-card--primary {
  border-color: rgba(109, 69, 232, 0.08);
}

.bank-grid article.bank-card--primary strong {
  font-size: 19px;
  font-weight: 560;
}

.metric-grid article > span,
.bank-grid article > span {
  color: var(--v2-text-sub);
  font-size: 12px;
  font-weight: 520;
  line-height: 1.2;
}

.bank-card--roi::before {
  background: linear-gradient(135deg, rgba(109, 69, 232, 0.08), transparent 58%);
}

.bank-card--profit::before {
  background: linear-gradient(135deg, rgba(229, 72, 77, 0.08), transparent 58%);
}

.bank-card--itm::before {
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.07), transparent 58%);
}

.bank-card--count::before {
  background: linear-gradient(135deg, rgba(14, 165, 233, 0.07), transparent 58%);
}

.bank-card--totalBuyIn::before {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.07), transparent 58%);
}

.bank-card--totalPrize::before {
  background: linear-gradient(135deg, rgba(124, 58, 237, 0.08), transparent 58%);
}

.bank-card--average::before {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.09), transparent 58%);
}

.bank-card--itm strong { color: var(--v2-teal); }
.bank-card--totalBuyIn strong { color: #53627a; }
.bank-card--totalPrize strong { color: var(--v2-primary); }
.bank-card--count strong { color: #1676a3; }
.bank-card--average strong { color: var(--v2-gold); }
.bank-card--averageBuyIn strong { color: #53627a; }

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}

.trend-segment {
  display: grid;
  grid-template-columns: repeat(2, minmax(48px, 1fr));
  overflow: hidden;
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-sm);
  background: #f7f5fb;
}

.panel-header .trend-segment button {
  min-width: 48px;
  min-height: 28px;
  padding: 0 10px;
  border: 0;
  border-radius: 0;
  background: transparent;
  color: var(--v2-text-sub);
  font-size: 11px;
  font-weight: 600;
}

.panel-header .trend-segment button.active {
  background: var(--v2-primary);
  color: #fff;
}

.period-tabs {
  display: grid;
  overflow: hidden;
  grid-template-columns: repeat(3, 1fr);
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-sm);
  background: #f7f5fb;
}

.panel-header .period-tabs button {
  min-width: 42px;
  min-height: 28px;
  padding: 0 10px;
  border: 0;
  border-radius: 0;
  background: transparent;
  color: var(--v2-text-sub);
  font-weight: 600;
}

.panel-header .period-tabs button.active {
  background: var(--v2-primary);
  color: #fff;
}

.panel-header h2,
.panel-header h3 {
  margin: 0;
}

.trend-chart {
  width: 100%;
  height: 148px;
  margin-top: -2px;
  display: block;
}

.trend-visual {
  position: relative;
}

.trend-line {
  fill: none;
  stroke: var(--v2-primary);
  stroke-width: 2.4;
}

.trend-fill {
  fill: rgba(109, 69, 232, 0.08);
}

.trend-line.profit { stroke: var(--v2-profit); }
.trend-line.loss { stroke: var(--v2-loss); }
.trend-fill.profit { fill: rgba(229, 72, 77, 0.09); }
.trend-fill.loss { fill: rgba(37, 99, 235, 0.09); }

.trend-chart circle {
  fill: var(--v2-primary);
}

.trend-chart .trend-point__hit {
  fill: transparent;
  cursor: pointer;
}

.trend-point:focus {
  outline: none;
}

.trend-zero {
  stroke: var(--v2-border);
  stroke-width: 1;
}

.trend-bar--profit {
  fill: var(--v2-profit);
}

.trend-bar--loss {
  fill: var(--v2-loss);
}

.trend-chart--bars rect {
  cursor: pointer;
  transition: opacity 0.15s ease;
}

.trend-chart--bars rect:focus,
.trend-chart--bars rect:focus-visible {
  outline: none;
}

.trend-chart--bars rect:hover {
  opacity: 0.88;
}

.trend-tooltip {
  position: absolute;
  z-index: 2;
  display: flex;
  gap: 7px;
  align-items: center;
  min-width: max-content;
  padding: 7px 10px;
  border: 1px solid var(--v2-border);
  border-radius: 8px;
  background: var(--v2-surface);
  box-shadow: 0 2px 7px rgba(26, 20, 49, 0.08);
  color: var(--v2-text-sub);
  font-size: 11px;
  pointer-events: none;
  transform: translateX(-50%);
}

.trend-tooltip strong {
  color: var(--v2-text);
  font-size: 11px;
  font-weight: 600;
}

.trend-tooltip strong.profit {
  color: var(--v2-profit);
}

.trend-tooltip strong.loss {
  color: var(--v2-loss);
}

.trend-axis {
  display: flex;
  justify-content: space-between;
  box-sizing: border-box;
  width: 100%;
  padding: 0 8px;
  color: var(--v2-text-sub);
  font-size: 10px;
  font-weight: 550;
  margin-top: -5px;
}

.period-summary {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 6px;
}

.period-summary article,
.record-grid article {
  display: grid;
  min-width: 0;
  place-items: center;
  align-content: center;
  gap: 7px;
  padding: 11px 7px;
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-lg);
  background: #fff;
  text-align: center;
}

.period-summary article {
  min-height: 64px;
}

.period-summary span,
.record-grid span {
  color: var(--v2-text-sub);
  font-size: 10px;
  white-space: nowrap;
}

.period-summary strong {
  font-size: 13px;
  font-weight: 560;
  white-space: nowrap;
}

.primary {
  color: var(--v2-primary);
}

.positive {
  color: var(--v2-profit);
}

.negative {
  color: var(--v2-loss);
}

.venue-table {
  overflow: hidden;
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-lg);
  background: #fff;
}

.venue-table > div {
  display: grid;
  min-height: 42px;
  grid-template-columns: minmax(82px, 1.25fr) repeat(4, minmax(58px, 1fr));
  align-items: center;
  padding: 0 12px;
  border-bottom: 1px solid var(--v2-border);
  font-size: 11px;
}

.venue-table > div:last-child {
  border-bottom: 0;
}

.venue-table .venue-table__head {
  min-height: 36px;
  background: #faf9fc;
  color: var(--v2-text-sub);
}

.venue-table__head button {
  position: relative;
  min-width: 0;
  padding: 0 14px 0 0;
  border: 0;
  background: transparent;
  color: inherit;
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  font: inherit;
  cursor: pointer;
}

.venue-table__head button .q-icon {
  position: absolute;
  right: 0;
}

.venue-table__head .sort-icon--hidden {
  visibility: hidden;
}

.venue-table__head button:focus {
  outline: none;
}

.venue-table__head button.active {
  color: var(--v2-primary);
  font-weight: 600;
}

.venue-table span:not(:first-child) {
  text-align: right;
}

.venue-table strong {
  font-weight: 560;
}

.record-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 6px;
}

.record-grid article {
  min-height: 76px;
}

.record-grid strong {
  color: var(--v2-primary);
  font-size: 15px;
  font-weight: 600;
}

.record-grid small {
  overflow: hidden;
  max-width: 100%;
  color: var(--v2-text-sub);
  font-size: 9px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.table-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.mini-table {
  overflow: hidden;
  border-radius: var(--v2-radius-md);
}

.mini-table div {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  min-height: 36px;
  align-items: center;
  border-bottom: 1px solid var(--v2-border);
}

.mini-table div:first-child {
  background: #faf9fc;
  color: #5f596b;
  font-weight: 520;
}

.mini-table div:last-child {
  border-bottom: 0;
}

.mini-table span {
  text-align: center;
  color: #312d3d;
  font-size: 12px;
}

.detail-button {
  width: 100%;
  min-height: 34px;
  margin-top: 9px;
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-sm);
  background: #ffffff;
  color: var(--v2-primary);
  font: inherit;
  font-size: 13px;
  font-weight: 520;
}

@media (max-width: 720px) {
  .stats-home-page {
    padding: var(--v2-page-padding-top) var(--v2-page-padding-x) 88px;
  }

  .stats-header {
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 6px 8px;
  }

  .filter-pair {
    grid-template-columns: 148px 132px;
    gap: 5px;
  }

  .filter-pair > button {
    width: 132px;
  }

  .month-filter {
    width: 148px;
  }

  .summary-strip,
  .metric-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  .bank-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .summary-strip div {
    padding: 4px 3px;
    border-bottom: 0;
  }

  .summary-strip div:nth-child(2n) {
    border-right: 1px solid var(--v2-border);
  }

  .summary-strip div:last-child {
    border-right: 0;
  }

  .summary-strip span,
  .summary-strip small {
    font-size: 10px;
  }

  .metric-grid {
    gap: 6px;
  }

  .metric-grid article {
    min-height: 62px;
    padding: 9px 8px;
  }

  .metric-grid strong {
    font-size: 15px;
  }

  .bank-grid article {
    min-height: 74px;
    padding: 10px 6px;
  }

  .bank-grid strong,
  .bank-grid article.bank-card--primary strong {
    font-size: 19px;
    font-weight: 560;
  }

  .table-grid {
    grid-template-columns: 1fr;
  }
}
.trend-axis--hidden {
  visibility: hidden;
}

@media (max-width: 420px) {
  .stats-header {
    grid-template-columns: auto minmax(0, 1fr);
    gap: 6px 12px;
  }

  .filter-pair {
    grid-column: auto;
    grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr);
    width: min(236px, 100%);
    min-width: 0;
    margin-right: var(--v2-page-padding-x);
    justify-self: end;
  }

  .month-filter {
    width: 100%;
    grid-template-columns: 28px minmax(0, 1fr) 28px;
  }

  .month-filter--all {
    grid-template-columns: 1fr;
  }

  .filter-pair > button {
    width: 100%;
  }

  .bank-grid,
  .period-summary {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .venue-table > div {
    grid-template-columns: minmax(62px, 1.15fr) repeat(4, minmax(48px, 1fr));
    padding: 0 8px;
    font-size: 10px;
  }
}
</style>
