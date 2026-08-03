<template>
  <q-page v-if="isSimpleMode" class="home-page simple-home">
    <AppSection :title="simpleSummaryTitle" class="simple-summary-section">
      <template #action>
        <div class="simple-month-navigation" aria-label="요약 기간 선택">
          <button type="button" aria-label="이전 달" @click="moveSimpleSummaryMonth(-1)">
            <q-icon name="chevron_left" size="20px" />
          </button>
          <span>{{ simpleSummaryMonthLabel }}</span>
          <button
            type="button"
            aria-label="다음 달"
            :disabled="isSimpleSummaryCurrentMonth"
            @click="moveSimpleSummaryMonth(1)"
          >
            <q-icon name="chevron_right" size="20px" />
          </button>
        </div>
      </template>
      <div v-if="simpleSummaryLoading" class="simple-summary simple-summary--loading" aria-label="월간 요약 불러오는 중">
        <article v-for="index in 6" :key="index">
          <q-skeleton type="text" width="36px" />
          <q-skeleton type="text" width="52px" />
        </article>
      </div>
      <div v-else-if="!hasSimpleSummaryData" class="simple-summary-empty">
        <span class="simple-summary-empty__icon" aria-hidden="true">
          <q-icon name="event_note" size="22px" />
        </span>
        <span class="simple-summary-empty__copy">
          <strong>{{ simpleSummaryMonthLabel }}에는 기록이 없어요</strong>
          <small>토너먼트 결과를 기록하면 월간 성과를 한눈에 볼 수 있어요.</small>
        </span>
        <button type="button" @click="goSimpleRecord()">기록 추가</button>
      </div>
      <div v-else class="simple-summary">
        <article v-for="metric in simpleMetrics" :key="metric.label">
          <span>{{ metric.label }}</span>
          <strong :class="metric.tone">{{ metric.value }}</strong>
        </article>
      </div>
    </AppSection>

    <AppSection title="최근 기록" action-label="전체 보기 ›" @action="goBankRecordList">
      <AppCard padding="none">
        <div v-if="recentLoading" class="recent-row recent-row--status">불러오는 중...</div>
        <div v-else-if="recentLoadFailed" class="recent-row recent-row--status">
          최근 토너먼트를 불러오지 못했습니다.
        </div>
        <div v-else-if="recentSection.items.length === 0" class="recent-row recent-row--status">
          기록된 토너먼트가 없습니다.
        </div>
        <button
          v-for="item in simpleRecords"
          :key="item.id"
          class="simple-record"
          type="button"
          @click="goSimpleRecord(item.id)"
        >
          <span class="simple-record__main">
            <strong>{{ item.title }}</strong>
            <small>{{ item.date }} · 바인 {{ item.buyIn }} · {{ item.entries }} Entries</small>
          </span>
          <strong v-if="item.result" class="simple-record__result" :class="item.tone">{{ item.result }}</strong>
          <span v-else class="simple-record__pending">결과 미입력</span>
          <q-icon name="chevron_right" size="22px" />
        </button>
      </AppCard>
    </AppSection>

    <AppSection title="손익 추세">
      <AppCard class="profit-chart" padding="md">
        <div class="profit-chart__header">
          <div class="profit-chart__period">
            <strong>{{ simpleTrendLabel }}</strong>
          </div>
          <div class="period-tabs" aria-label="손익 그래프 기간">
            <button
              v-for="period in periods"
              :key="period.value"
              type="button"
              :class="{ active: selectedPeriod === period.value }"
              :title="period.description"
              @click="selectedPeriod = period.value"
            >
              {{ period.label }}
            </button>
          </div>
        </div>
        <div v-if="simpleTrendGroups.length" class="profit-chart__body">
          <div class="profit-chart__value">
            <strong :class="simpleTrendTone">{{ simpleTrendProfit }}</strong>
            <span>ROI {{ simpleTrendRoi }}</span>
          </div>
          <svg viewBox="0 0 320 122" role="img" :aria-label="`${simpleTrendLabel} 누적 손익 그래프`">
            <defs>
              <linearGradient id="simpleProfitFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#6d45e8" stop-opacity=".2" />
                <stop offset="100%" stop-color="#6d45e8" stop-opacity="0" />
              </linearGradient>
            </defs>
            <path class="chart-area" :d="simpleTrendAreaPath" />
            <path class="chart-line" :d="simpleTrendPath" />
            <text class="chart-date" x="4" y="118">{{ simpleTrendAxisLabels.start }}</text>
            <text class="chart-date" x="316" y="118" text-anchor="end">{{ simpleTrendAxisLabels.end }}</text>
          </svg>
        </div>
        <div v-else class="profit-chart__empty">
          <span class="profit-chart__empty-icon" aria-hidden="true">
            <q-icon name="show_chart" size="25px" />
          </span>
          <strong>선택한 기간에 기록이 없어요</strong>
          <small v-if="hasAnyTrendSessions">다른 기간의 성과는 전체 기록에서 확인할 수 있어요.</small>
          <small v-else>첫 기록을 추가하면 손익 그래프가 만들어져요.</small>
          <button v-if="selectedPeriod !== 'all' && hasAnyTrendSessions" type="button" @click="selectedPeriod = 'all'">
            전체 기간 보기
          </button>
          <button v-else type="button" @click="goSimpleRecord()">기록 추가하기</button>
        </div>
      </AppCard>
    </AppSection>

    <AppSection title="매장별 손익">
      <template #action>
        <span class="venue-profit__period">{{ simpleSummaryMonthLabel }}</span>
      </template>
      <AppCard padding="none">
        <div v-if="simpleVenueProfits.length === 0" class="venue-profit__empty">
          선택한 달의 매장 기록이 없습니다.
        </div>
        <div v-for="venue in simpleVenueProfits" :key="venue.key" class="venue-profit__row">
          <span class="venue-profit__main">
            <strong>{{ venue.name }}</strong>
            <small>{{ venue.sessions }}회 참가</small>
          </span>
          <strong class="venue-profit__amount" :class="venue.tone">{{ venue.profitLabel }}</strong>
        </div>
      </AppCard>
    </AppSection>

    <button class="simple-record-fab" type="button" aria-label="토너먼트 기록 추가" @click="goSimpleRecord()">
      <q-icon name="add" size="28px" />
    </button>
  </q-page>

  <q-page v-else class="home-page" @click="runningMenuOpen = false">
    <section v-if="hasRunningTournament" class="running-section">
      <h2>진행 중 토너먼트</h2>

      <article class="running-card">
        <div class="running-card__header">
          <span>{{ runningTournament.name }}</span>
          <button
            class="running-card__menu-button"
            type="button"
            aria-label="토너먼트 관리 메뉴"
            @click.stop="runningMenuOpen = !runningMenuOpen"
          >
            <q-icon name="more_vert" size="22px" />
          </button>
          <div v-if="runningMenuOpen" class="running-card__popup-menu" @click.stop>
            <div class="running-card__popup-heading">빠른 수정</div>
            <button type="button" @click="openQuickManage('level')">
              레벨
            </button>
            <button type="button" @click="openQuickManage('stack')">
              스택
            </button>
            <button type="button" @click="openQuickManage('info')">
              기본 정보
            </button>
            <button class="danger" type="button" @click="finishRunningTournament">
              토너먼트 종료
            </button>
          </div>
        </div>

        <div class="running-card__level">{{ runningTournament.currentLevel || '-' }}</div>
        <p>{{ runningTournament.blinds || '-' }}</p>

        <dl>
          <div>
            <dt>현재 스택</dt>
            <dd>{{ runningTournament.currentStack || '-' }}</dd>
            <span v-if="runningTournament.currentBb">{{ runningTournament.currentBb }} BB</span>
          </div>
          <div>
            <dt>평균 스택</dt>
            <dd>{{ runningTournament.averageStack || '-' }}</dd>
            <span v-if="runningTournament.averageBb">{{ runningTournament.averageBb }} BB</span>
          </div>
        </dl>

        <button class="running-card__action" type="button" @click="goTournamentRunning">
          <q-icon name="edit_square" size="18px" />
          이어서 기록하기
        </button>
      </article>

      <q-dialog v-model="manageSheetOpen" position="bottom">
        <div class="running-manage-sheet">
          <div class="running-manage-sheet__handle" aria-hidden="true"></div>
          <div class="running-manage-sheet__title">
            <h3>{{ quickEditTitle }}</h3>
          </div>

          <div class="quick-edit-form quick-edit-form--scroll">
            <section v-if="manageSheetMode === 'level'" class="quick-edit-section">
              <label>
                <span>레벨</span>
                <div class="quick-edit-input">
                  <input v-model="quickEditForm.level" inputmode="numeric" />
                  <b>Level</b>
                </div>
              </label>
              <div>
                <span class="quick-edit-label">블라인드 · 앤티</span>
                <div class="quick-edit-blinds">
                  <label><small>SB</small><input :value="quickEditForm.smallBlind" inputmode="numeric" @input="setQuickNumber('smallBlind', $event)" /></label>
                <label><small>BB</small><input :value="quickEditForm.bigBlind" inputmode="numeric" @input="updateQuickBigBlind" /></label>
                <label><small>Ante</small><input :value="quickEditForm.ante" inputmode="numeric" @input="updateQuickAnte" /></label>
                </div>
              </div>
            </section>

            <section v-else-if="manageSheetMode === 'stack'" class="quick-edit-section">
              <label>
                <span>현재 스택</span>
                <div class="quick-edit-input">
                  <input :value="quickEditForm.currentStack" inputmode="numeric" @input="setQuickNumber('currentStack', $event)" />
                  <b>칩</b>
                </div>
              </label>
              <label>
                <span>평균 스택</span>
                <div class="quick-edit-input">
                  <input :value="quickEditForm.averageStack" inputmode="numeric" placeholder="-" @input="setQuickNumber('averageStack', $event)" />
                  <b>칩</b>
                </div>
              </label>
            </section>

            <section v-else class="quick-edit-section">
              <label><span>대회 이름</span><div class="quick-edit-input"><input v-model="quickEditForm.name" maxlength="50" /></div></label>
              <label><span>바이인</span><div class="quick-edit-input"><input :value="quickEditForm.buyIn" inputmode="numeric" @input="setQuickNumber('buyIn', $event)" /></div></label>
              <label><span>시작 스택</span><div class="quick-edit-input"><input :value="quickEditForm.startingStack" inputmode="numeric" @input="setQuickNumber('startingStack', $event)" /><b>칩</b></div></label>
              <label><span>메모</span><textarea v-model="quickEditForm.memo" maxlength="200" /></label>
            </section>
          </div>

          <button class="quick-edit-save" type="button" @click="saveQuickEdit">저장</button>
        </div>
      </q-dialog>
    </section>

    <AppCard v-else class="start-card" variant="interactive" padding="lg" @click="goTournamentStart">
      <div class="start-card__mark" aria-hidden="true">
        <div class="start-card__card start-card__card--back"></div>
        <div class="start-card__card start-card__card--front">
          <span></span>
          <span></span>
        </div>
        <q-icon class="start-card__plus" name="add" size="22px" />
      </div>

      <div class="start-card__copy">
        <h1>새 토너먼트 시작</h1>
        <p>새로운 토너먼트<br />기록을 시작해보세요.</p>
      </div>

      <q-icon class="start-card__arrow" name="chevron_right" size="30px" />
    </AppCard>

    <AppSection
      :title="recentSection.title"
      :action-label="recentSection.items.length ? '더보기 ›' : ''"
      @action="goTournamentList"
    >
      <AppCard padding="none">
        <div v-if="recentLoading" class="recent-row recent-row--status">불러오는 중...</div>
        <button
          v-else-if="recentLoadFailed || recentSection.items.length === 0"
          class="recent-empty"
          type="button"
          @click="goTournamentStart"
        >
          <span class="recent-empty__icon"><q-icon name="emoji_events" size="25px" /></span>
          <span class="recent-empty__copy">
            <strong>아직 기록된 토너먼트가 없어요</strong>
            <small>첫 토너먼트를 시작하면 최근 기록이 여기에 쌓여요.</small>
          </span>
          <q-icon class="recent-empty__arrow" name="chevron_right" size="24px" />
        </button>
        <button
          v-for="item in recentSection.items"
          :key="item.id"
          class="recent-row"
          :class="{ 'recent-row--no-badge': !item.badge }"
          type="button"
          @click="openRecentTournament(item)"
        >
          <span class="recent-row__main">
            <strong>{{ item.title }}</strong>
            <span>{{ item.meta }}</span>
          </span>

          <span v-if="item.badge" class="recent-row__badge" :class="`recent-row__badge--${item.tone}`">
            {{ item.badge }}
          </span>
          <strong v-if="item.result" class="recent-row__result" :class="`recent-row__result--${item.tone}`">
            {{ item.result }}
          </strong>
        </button>
      </AppCard>
    </AppSection>

    <AppSection title="이번 달 요약">
      <div class="home-page__stats-grid">
        <StatCard
          label="Profit"
          :value="monthlyProfit"
          :tone="monthlyProfitTone"
          icon="account_balance_wallet"
        />
        <StatCard label="ROI" :value="monthlyRoi" :tone="monthlyRoiTone" icon="show_chart" />
        <StatCard label="토너먼트" :value="monthlyTournamentCount" icon="emoji_events" />
        <StatCard label="ITM" :value="monthlyItmCount" icon="workspace_premium" />
      </div>
    </AppSection>
  </q-page>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

import AppCard from 'src/shared/components/AppCard.vue'
import AppSection from 'src/shared/components/AppSection.vue'
import StatCard from 'src/shared/components/StatCard.vue'
import { fetchAllGameSessions, fetchRecentGameSessions, fetchRunningGameSession, updateGameSession } from 'src/api/gameSession'
import { updateHandLogEvent } from 'src/api/handLogApi'
import { fetchMonthlyStatistics } from 'src/api/statistics'
import { fetchVenues } from 'src/api/venue'
import { useAlert } from 'src/composables/useAlert'
import { useHandLogStore } from 'src/stores/handLog'
import { formatLocalDate } from 'src/utils/localDate'
import { tournamentDisplayName } from 'src/utils/tournamentName'

const router = useRouter()
const alert = useAlert()
const handLogStore = useHandLogStore()
const recordMode = ref('simple')
const selectedPeriod = ref('month')
const manageSheetOpen = ref(false)
const manageSheetMode = ref('level')
const runningMenuOpen = ref(false)
const quickAnteManuallyEdited = ref(false)
const periods = [
  { label: '7일', value: 'week', description: '오늘 포함 최근 7일' },
  { label: '월간', value: 'month', description: '위에서 선택한 월' },
  { label: '전체', value: 'all', description: '전체 기록' },
]
const quickEditForm = reactive({
  level: '',
  smallBlind: '',
  bigBlind: '',
  ante: '',
  currentStack: '',
  averageStack: '',
  name: '',
  buyIn: '',
  startingStack: '',
  memo: '',
})
const quickEditTitle = computed(() => ({
  level: '레벨',
  stack: '스택',
  info: '기본 정보',
})[manageSheetMode.value])

onMounted(async () => {
  recordMode.value = localStorage.getItem('pokerly-record-mode') || 'simple'
  await Promise.all([
    loadRecentTournaments(),
    loadSimpleMonthlySummary(),
    loadSimpleTrendSessions(),
    loadSimpleVenues(),
  ])
  if (recordMode.value !== 'simple') {
    try {
      const session = await fetchRunningGameSession()
      if (session) {
        const cached = JSON.parse(localStorage.getItem('pokerly-running-tournament') || '{}')
        const parsed = {
          ...cached,
          sessionId: session.id,
          eventId: session.handLogEventId,
          name: session.tournamentName,
          venueId: session.venueId,
          startLevel: session.startLevel,
          currentLevel: session.currentLevel,
          startingStack: formatQuickNumber(session.startingStack),
          currentStack: formatQuickNumber(session.currentStack),
          averageStack: formatQuickNumber(session.averageStack),
          buyIn: formatQuickNumber(session.buyInPerEntry),
          totalBuyIns: session.entries,
          memo: session.notes || '',
          currentBlinds: {
            smallBlind: formatQuickNumber(session.currentSmallBlind),
            bigBlind: formatQuickNumber(session.currentBigBlind),
            ante: formatQuickNumber(session.currentAnte),
          },
        }
        const startLevel = parsed.startLevel || parsed.level || 'L1'
        const currentLevel = Object.prototype.hasOwnProperty.call(parsed, 'currentLevel')
          ? parsed.currentLevel
          : parsed.level || startLevel
        runningTournament.value = {
          ...parsed,
          startLevel,
          currentLevel,
          averageStack: parsed.averageStack || null,
        }
        localStorage.setItem('pokerly-running-tournament', JSON.stringify(runningTournament.value))
      }
    } catch {
      localStorage.removeItem('pokerly-running-tournament')
    }
    await loadRunningTournamentDetail()
    await loadMonthlySummary()
  }
})

const isSimpleMode = computed(() => recordMode.value === 'simple')
const simpleNow = new Date()
const simpleSummaryYear = ref(simpleNow.getFullYear())
const simpleSummaryMonth = ref(simpleNow.getMonth() + 1)
const simpleSummary = ref(null)
const simpleSummaryLoading = ref(false)
const simpleSummaryMonthLabel = computed(() =>
  `${simpleSummaryYear.value}년 ${simpleSummaryMonth.value}월`,
)
const simpleSummaryMonthOffset = computed(() =>
  (simpleSummaryYear.value - simpleNow.getFullYear()) * 12
    + simpleSummaryMonth.value - (simpleNow.getMonth() + 1),
)
const simpleSummaryTitle = computed(() => {
  if (simpleSummaryMonthOffset.value === 0) return '이번 달 요약'
  if (simpleSummaryMonthOffset.value === -1) return '지난달 요약'
  return `${simpleSummaryYear.value}년 ${simpleSummaryMonth.value}월 요약`
})
const isSimpleSummaryCurrentMonth = computed(() => simpleSummaryMonthOffset.value >= 0)
const hasSimpleSummaryData = computed(() =>
  !simpleSummaryLoading.value && Number(simpleSummary.value?.totalSessions || 0) > 0,
)
const fullMoney = (value, signed = false) => {
  const amount = Number(value) || 0
  const sign = signed && amount > 0 ? '+' : ''
  return `${sign}${amount.toLocaleString('ko-KR')}`
}
const simpleMetrics = computed(() => {
  const summary = simpleSummary.value
  if (!hasSimpleSummaryData.value) return [
    { label: '순수익', value: '-' }, { label: '총 바인', value: '-' },
    { label: '총 상금', value: '-' }, { label: 'ROI', value: '-' },
    { label: '참가', value: '-' }, { label: 'ITM', value: '-' },
  ]
  const profit = Number(summary.totalProfit || 0)
  return [
    {
      label: '순수익',
      value: fullMoney(profit, true),
      tone: profit > 0 ? 'positive' : profit < 0 ? 'negative' : '',
    },
    { label: '총 바인', value: fullMoney(summary.totalBuyIn) },
    { label: '총 상금', value: fullMoney(summary.totalPrize) },
    { label: 'ROI', value: `${Number(summary.roi || 0).toFixed(1)}%` },
    { label: '참가', value: `${summary.totalSessions || 0}회` },
    { label: 'ITM', value: `${summary.itmCount || 0}회` },
  ]
})
const simpleRecords = computed(() => recentSection.items.map((item) => ({
  id: item.id,
  title: item.title,
  date: item.meta,
  buyIn: item.buyIn || '-',
  entries: item.entries || 1,
  result: item.result || '',
  tone: item.tone === 'success' ? 'win' : item.tone === 'danger' ? 'lose' : '',
})))

const loadSimpleMonthlySummary = async () => {
  simpleSummaryLoading.value = true
  try {
    const statistics = await fetchMonthlyStatistics(
      simpleSummaryYear.value,
      simpleSummaryMonth.value,
    )
    simpleSummary.value = statistics?.summary || null
  } catch {
    simpleSummary.value = null
  } finally {
    simpleSummaryLoading.value = false
  }
}
const moveSimpleSummaryMonth = (delta) => {
  const date = new Date(simpleSummaryYear.value, simpleSummaryMonth.value - 1 + delta, 1)
  const nextOffset = (date.getFullYear() - simpleNow.getFullYear()) * 12
    + date.getMonth() - simpleNow.getMonth()
  if (nextOffset > 0) return
  simpleSummaryYear.value = date.getFullYear()
  simpleSummaryMonth.value = date.getMonth() + 1
  void loadSimpleMonthlySummary()
}
const simpleTrendSessions = ref([])
const hasAnyTrendSessions = computed(() => simpleTrendSessions.value.some((session) =>
  session.tournamentStatus !== 'RUNNING' && session.playDate,
))
const simpleVenues = ref([])
const totalBuyInOf = (session) => {
  const stored = Number(session.totalBuyIn)
  const buyInPerEntry = Number(session.buyInPerEntry)
  const entries = Math.max(1, Number(session.entries) || 1)
  const discount = Number(session.discount) || 0
  if (Number.isFinite(buyInPerEntry) && buyInPerEntry > 0) {
    return Math.max(0, buyInPerEntry * entries - discount)
  }
  return Number.isFinite(stored) ? Math.max(0, stored) : 0
}
const profitOf = (session) => (Number(session.prize) || 0) - totalBuyInOf(session)
const localDateKey = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
const simpleTrendScopedSessions = computed(() => {
  const completed = simpleTrendSessions.value.filter((session) =>
    session.tournamentStatus !== 'RUNNING' && session.playDate,
  )
  if (selectedPeriod.value === 'all') return completed
  if (selectedPeriod.value === 'week') {
    const start = new Date(simpleNow.getFullYear(), simpleNow.getMonth(), simpleNow.getDate() - 6)
    const startKey = localDateKey(start)
    const endKey = localDateKey(simpleNow)
    return completed.filter((session) => session.playDate >= startKey && session.playDate <= endKey)
  }
  const prefix = `${simpleSummaryYear.value}-${String(simpleSummaryMonth.value).padStart(2, '0')}-`
  return completed.filter((session) => String(session.playDate).startsWith(prefix))
})
const simpleTrendGroups = computed(() => {
  const grouped = new Map()
  simpleTrendScopedSessions.value.forEach((session) => {
    const date = String(session.playDate)
    const key = selectedPeriod.value === 'all' ? date.slice(0, 7) : date
    const item = grouped.get(key) || { key, profit: 0, buyIn: 0 }
    item.profit += profitOf(session)
    item.buyIn += totalBuyInOf(session)
    grouped.set(key, item)
  })
  return [...grouped.values()].sort((a, b) => a.key.localeCompare(b.key))
})
const simpleTrendTotals = computed(() => simpleTrendGroups.value.reduce(
  (totals, item) => ({
    profit: totals.profit + item.profit,
    buyIn: totals.buyIn + item.buyIn,
  }),
  { profit: 0, buyIn: 0 },
))
const simpleTrendLabel = computed(() => {
  if (selectedPeriod.value === 'week') return '최근 7일'
  if (selectedPeriod.value === 'all') return '전체 기간'
  return simpleSummaryMonthLabel.value
})
const shortDateLabel = (value, includeYear = false) => {
  const [year, month, day] = String(value || '').split('-').map(Number)
  if (!year || !month || !day) return '-'
  return includeYear ? `${year}. ${month}. ${day}.` : `${month}.${day}`
}
const simpleTrendRangeLabel = computed(() => {
  if (selectedPeriod.value === 'week') {
    const start = new Date(simpleNow.getFullYear(), simpleNow.getMonth(), simpleNow.getDate() - 6)
    return `${shortDateLabel(localDateKey(start))} ~ ${shortDateLabel(localDateKey(simpleNow))}`
  }
  if (selectedPeriod.value === 'month') {
    const start = `${simpleSummaryYear.value}-${String(simpleSummaryMonth.value).padStart(2, '0')}-01`
    const lastDay = new Date(simpleSummaryYear.value, simpleSummaryMonth.value, 0).getDate()
    const end = `${simpleSummaryYear.value}-${String(simpleSummaryMonth.value).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`
    return `${shortDateLabel(start)} ~ ${shortDateLabel(end)}`
  }
  const dates = simpleTrendSessions.value
    .filter((session) => session.tournamentStatus !== 'RUNNING' && session.playDate)
    .map((session) => String(session.playDate))
    .sort()
  if (!dates.length) return '기록 없음'
  return `${shortDateLabel(dates[0], true)} ~ ${shortDateLabel(dates.at(-1), true)}`
})
const simpleTrendAxisLabels = computed(() => {
  const [start = '-', end = '-'] = simpleTrendRangeLabel.value.split(' ~ ')
  return { start, end }
})
const simpleTrendProfit = computed(() => {
  if (!simpleTrendGroups.value.length) return '-'
  const amount = simpleTrendTotals.value.profit
  const sign = amount > 0 ? '+' : amount < 0 ? '-' : ''
  return `${sign}${Math.abs(amount).toLocaleString('ko-KR')}`
})
const simpleTrendRoi = computed(() => {
  if (!simpleTrendGroups.value.length || simpleTrendTotals.value.buyIn <= 0) return '-'
  return `${(simpleTrendTotals.value.profit * 100 / simpleTrendTotals.value.buyIn).toFixed(1)}%`
})
const simpleTrendTone = computed(() => ({
  negative: simpleTrendTotals.value.profit < 0,
  positive: simpleTrendTotals.value.profit > 0,
}))
const simpleTrendCoordinates = computed(() => {
  if (!simpleTrendGroups.value.length) return []
  let cumulative = 0
  const values = [0, ...simpleTrendGroups.value.map((item) => {
    cumulative += item.profit
    return cumulative
  })]
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  return values.map((value, index) => ({
    x: 4 + index * 312 / Math.max(1, values.length - 1),
    y: 94 - (value - min) * 82 / range,
  }))
})
const simpleTrendPath = computed(() => simpleTrendCoordinates.value
  .map((point, index) => `${index ? 'L' : 'M'}${point.x.toFixed(1)} ${point.y.toFixed(1)}`)
  .join(' '))
const simpleTrendAreaPath = computed(() => {
  if (!simpleTrendPath.value) return ''
  const points = simpleTrendCoordinates.value
  return `${simpleTrendPath.value} L${points.at(-1).x.toFixed(1)} 102 L${points[0].x.toFixed(1)} 102 Z`
})
const loadSimpleTrendSessions = async () => {
  try {
    const sessions = await fetchAllGameSessions()
    simpleTrendSessions.value = Array.isArray(sessions) ? sessions : []
  } catch {
    simpleTrendSessions.value = []
  }
}
const loadSimpleVenues = async () => {
  try {
    const venues = await fetchVenues()
    simpleVenues.value = Array.isArray(venues) ? venues : []
  } catch {
    simpleVenues.value = []
  }
}
const simpleVenueProfits = computed(() => {
  const venueNames = new Map(simpleVenues.value.map((venue) => [Number(venue.id), venue.name]))
  const prefix = `${simpleSummaryYear.value}-${String(simpleSummaryMonth.value).padStart(2, '0')}-`
  const grouped = new Map()

  simpleTrendSessions.value
    .filter((session) => session.tournamentStatus !== 'RUNNING'
      && String(session.playDate || '').startsWith(prefix))
    .forEach((session) => {
      const venueId = Number(session.venueId)
      const hasVenue = Number.isFinite(venueId) && venueId > 0
      const key = hasVenue ? `venue-${venueId}` : `type-${session.sessionType || 'OTHER'}`
      const typeLabels = { ONLINE: '온라인', TOURNAMENT: '외부 대회', OTHER: '기타' }
      const name = hasVenue
        ? venueNames.get(venueId) || '알 수 없는 매장'
        : typeLabels[session.sessionType] || '기타'
      const current = grouped.get(key) || { key, name, sessions: 0, profit: 0 }
      current.sessions += 1
      current.profit += profitOf(session)
      grouped.set(key, current)
    })

  return [...grouped.values()]
    .sort((a, b) => b.profit - a.profit || b.sessions - a.sessions)
    .map((venue) => ({
      ...venue,
      profitLabel: `${venue.profit > 0 ? '+' : venue.profit < 0 ? '-' : ''}${Math.abs(venue.profit).toLocaleString('ko-KR')}`,
      tone: venue.profit > 0 ? 'positive' : venue.profit < 0 ? 'negative' : '',
    }))
})

const runningTournament = ref(null)
const hasRunningTournament = computed(() => Boolean(runningTournament.value))

const recentLoading = ref(false)
const recentLoadFailed = ref(false)
const monthlySummary = ref(null)
const recentSection = reactive({
  title: '최근 토너먼트',
  items: [],
})

const formatSignedNumber = (value) => {
  const amount = Number(value) || 0
  const sign = amount > 0 ? '+' : amount < 0 ? '-' : ''
  const absolute = Math.abs(amount)

  if (absolute >= 10000) {
    const man = absolute / 10000
    const digits = Number.isInteger(man) ? 0 : 1
    return `${sign}${man.toFixed(digits)}만`
  }
  return `${sign}${absolute.toLocaleString('ko-KR')}`
}

const formatPercent = (value) => {
  const percent = Number(value) || 0
  const sign = percent > 0 ? '+' : ''
  return `${sign}${percent.toFixed(1)}%`
}

const hasMonthlyData = computed(() => (monthlySummary.value?.totalSessions ?? 0) > 0)
const monthlyProfit = computed(() =>
  hasMonthlyData.value ? formatSignedNumber(monthlySummary.value.totalProfit) : '-',
)
const monthlyRoi = computed(() =>
  hasMonthlyData.value ? formatPercent(monthlySummary.value.roi) : '-',
)
const monthlyTournamentCount = computed(() =>
  hasMonthlyData.value ? monthlySummary.value.totalSessions : '-',
)
const monthlyItmCount = computed(() =>
  hasMonthlyData.value ? monthlySummary.value.itmCount : '-',
)
const monthlyProfitTone = computed(() => {
  const profit = monthlySummary.value?.totalProfit ?? 0
  return profit > 0 ? 'success' : profit < 0 ? 'danger' : 'default'
})
const monthlyRoiTone = computed(() => {
  const roi = monthlySummary.value?.roi ?? 0
  return roi > 0 ? 'success' : roi < 0 ? 'danger' : 'default'
})

const loadMonthlySummary = async () => {
  const now = new Date()
  try {
    const monthly = await fetchMonthlyStatistics(now.getFullYear(), now.getMonth() + 1)
    monthlySummary.value = monthly?.summary || null
  } catch {
    monthlySummary.value = null
  }
}

const resultBadges = {
  BUST: '탈락',
  BUBBLE: 'Bubble',
  ITM: 'ITM',
  CHOP: '찹',
  WIN: '우승',
}

const formatDate = (date) => date?.replaceAll('-', '.') || '-'

const loadRecentTournaments = async () => {
  recentLoading.value = true
  recentLoadFailed.value = false
  try {
    const sessions = await fetchRecentGameSessions()
    recentSection.items = (sessions || []).map((session) => ({
      id: session.id,
      title: tournamentDisplayName(session),
      meta: formatDate(session.playDate),
      badge: resultBadges[session.tournamentResult] || '',
      tone: session.tournamentResult === 'WIN' ? 'success' : 'default',
      buyIn: Number(session.buyInPerEntry || 0).toLocaleString('ko-KR'),
      entries: session.entries || 1,
      result: session.netProfit
        ? `${session.netProfit > 0 ? '+' : ''}${Number(session.netProfit).toLocaleString('ko-KR')}`
        : '',
    }))
  } catch {
    recentLoadFailed.value = true
    recentSection.items = []
  } finally {
    recentLoading.value = false
  }
}

const goTournamentStart = () => {
  router.push('/app/tournament/start')
}

const goTournamentRunning = () => {
  router.push('/app/tournament/running')
}

const numericLevel = (value) => String(value || 'L1').replace(/\D/g, '') || '1'
const formatQuickNumber = (value) => {
  const digits = String(value ?? '').replace(/\D/g, '')
  return digits ? Number(digits).toLocaleString('ko-KR') : ''
}

const parseQuickNumber = (value) => {
  const normalized = String(value ?? '').replaceAll(',', '').trim()
  if (!normalized) return null
  const number = Number(normalized)
  return Number.isFinite(number) ? number : null
}

const getCurrentBackendLevel = () => {
  const tournament = runningTournament.value
  const levels = handLogStore.selectedEvent?.blindLevels || []
  if (!tournament) return null

  return (
    levels.find(
      (level) =>
        tournament.currentBlindLevelId &&
        String(level.id) === String(tournament.currentBlindLevelId),
    ) ||
    levels.find((level) => level.levelNo === Number(numericLevel(tournament.currentLevel))) ||
    levels[0] ||
    null
  )
}

const loadRunningTournamentDetail = async () => {
  const tournament = runningTournament.value
  if (!tournament?.eventId) return

  try {
    const event = await handLogStore.fetchEventDetail(tournament.eventId)
    const level = getCurrentBackendLevel()
    if (!event) return
    if (!level) {
      const cleared = {
        ...tournament,
        name: event.name || tournament.name,
        currentBlindLevelId: null,
        currentLevel: null,
        currentBlinds: null,
        blinds: null,
        currentStack: null,
        averageStack: null,
        currentBb: null,
        averageBb: null,
      }
      runningTournament.value = cleared
      localStorage.setItem('pokerly-running-tournament', JSON.stringify(cleared))
      return
    }

    const currentStack = level.endStack ?? level.displayStartStack ?? level.startStack
    const averageStack = level.averageStack
    const currentBb =
      currentStack != null && level.bigBlind > 0
        ? Number((currentStack / level.bigBlind).toFixed(1))
        : null
    const averageBb =
      averageStack != null && level.bigBlind > 0
        ? Number((averageStack / level.bigBlind).toFixed(1))
        : null

    const updated = {
      ...tournament,
      name: event.name || tournament.name,
      startingStack: formatQuickNumber(event.startingStack ?? tournament.startingStack),
      currentBlindLevelId: level.id,
      currentLevel: `L${level.levelNo}`,
      currentBlinds: {
        smallBlind: formatQuickNumber(level.smallBlind),
        bigBlind: formatQuickNumber(level.bigBlind),
        ante: formatQuickNumber(level.ante),
      },
      blinds: [level.smallBlind, level.bigBlind, level.ante]
        .map((value) => (Number(value) > 0 ? formatQuickNumber(value) : '-'))
        .join(' / '),
      currentStack: formatQuickNumber(currentStack),
      averageStack: formatQuickNumber(averageStack),
      currentBb,
      averageBb,
    }

    runningTournament.value = updated
    localStorage.setItem('pokerly-running-tournament', JSON.stringify(updated))
  } catch (error) {
    if (error?.response?.status === 404) {
      runningTournament.value = null
      localStorage.removeItem('pokerly-running-tournament')
      return
    }
    alert.show('진행 중 토너먼트를 불러오지 못했습니다.', 'error')
  }
}

const hydrateQuickEditForm = () => {
  const tournament = runningTournament.value || {}
  const blinds = tournament.currentBlinds || tournament.startBlinds || {}
  Object.assign(quickEditForm, {
    level: numericLevel(tournament.currentLevel),
    smallBlind: blinds.smallBlind || '',
    bigBlind: blinds.bigBlind || '',
    ante: blinds.ante || '',
    currentStack: tournament.currentStack || '',
    averageStack: tournament.averageStack || '',
    name: tournament.name || '',
    buyIn: tournament.buyIn || '',
    startingStack: tournament.startingStack || '',
    memo: tournament.memo || '',
  })
  quickAnteManuallyEdited.value = false
}

const openQuickManage = (mode) => {
  hydrateQuickEditForm()
  manageSheetMode.value = mode
  runningMenuOpen.value = false
  manageSheetOpen.value = true
}

const setQuickNumber = (field, event) => {
  quickEditForm[field] = formatQuickNumber(event.target.value)
}

const updateQuickBigBlind = (event) => {
  quickEditForm.bigBlind = formatQuickNumber(event.target.value)
  if (!quickAnteManuallyEdited.value) {
    quickEditForm.ante = quickEditForm.bigBlind
  }
}

const updateQuickAnte = (event) => {
  quickEditForm.ante = formatQuickNumber(event.target.value)
  quickAnteManuallyEdited.value = true
}

const saveQuickEdit = async () => {
  const updated = { ...runningTournament.value }
  const eventId = updated.eventId
  const level = getCurrentBackendLevel()

  try {
    if (manageSheetMode.value === 'level') {
      if (eventId && level?.id) {
        await handLogStore.updateBlindLevelStructure(eventId, level.id, {
          levelNo: Number(numericLevel(quickEditForm.level)),
          smallBlind: parseQuickNumber(quickEditForm.smallBlind),
          bigBlind: parseQuickNumber(quickEditForm.bigBlind),
          ante: parseQuickNumber(quickEditForm.ante),
        })
      }
      updated.currentLevel = `L${numericLevel(quickEditForm.level)}`
    } else if (manageSheetMode.value === 'stack') {
      if (eventId && level?.id) {
        await handLogStore.updateBlindLevelInfo(eventId, level.id, {
          startStack: level.startStack,
          endStack: parseQuickNumber(quickEditForm.currentStack),
          averageStack: parseQuickNumber(quickEditForm.averageStack),
          memo: level.memo,
        })
      }
    } else {
      if (eventId) {
        await updateHandLogEvent(eventId, {
          name: quickEditForm.name.trim(),
          startingStack: parseQuickNumber(quickEditForm.startingStack),
        })
      }
      updated.name = quickEditForm.name.trim()
      updated.buyIn = quickEditForm.buyIn || null
      updated.startingStack = quickEditForm.startingStack || null
      updated.memo = quickEditForm.memo.trim()
    }

    runningTournament.value = updated
    localStorage.setItem('pokerly-running-tournament', JSON.stringify(updated))
    if (updated.sessionId) {
      await updateGameSession(updated.sessionId, {
        venueId: updated.venueId || null,
        playDate: updated.date?.replaceAll('.', '-') || formatLocalDate(),
        sessionType: updated.venueId ? 'VENUE' : 'OTHER',
        gameType: 'TOURNAMENT',
        tournamentName: updated.name,
        tournamentResult: null,
        startLevel: updated.startLevel,
        currentLevel: updated.currentLevel,
        buyInPerEntry: parseQuickNumber(updated.buyIn),
        entries: updated.totalBuyIns || 1,
        discount: parseQuickNumber(updated.discountAmount) || 0,
        prize: 0,
        satelliteAwarded: false,
        satelliteName: null,
        notes: updated.memo || '',
        gtdAmount: null,
        fieldEntries: null,
        isCollab: false,
        collabLabel: null,
        handLogEventId: updated.eventId,
        tournamentStatus: 'RUNNING',
        startingStack: parseQuickNumber(updated.startingStack),
        currentStack: parseQuickNumber(
          manageSheetMode.value === 'stack' ? quickEditForm.currentStack : updated.currentStack,
        ),
        averageStack: parseQuickNumber(
          manageSheetMode.value === 'stack' ? quickEditForm.averageStack : updated.averageStack,
        ),
        currentSmallBlind: parseQuickNumber(
          manageSheetMode.value === 'level' ? quickEditForm.smallBlind : updated.currentBlinds?.smallBlind,
        ),
        currentBigBlind: parseQuickNumber(
          manageSheetMode.value === 'level' ? quickEditForm.bigBlind : updated.currentBlinds?.bigBlind,
        ),
        currentAnte: parseQuickNumber(
          manageSheetMode.value === 'level' ? quickEditForm.ante : updated.currentBlinds?.ante,
        ),
        finalRank: null,
      })
    }
    await loadRunningTournamentDetail()
    manageSheetOpen.value = false
  } catch {
    alert.show('변경 내용을 저장하지 못했습니다.', 'error')
  }
}

const finishRunningTournament = () => {
  runningMenuOpen.value = false
  manageSheetOpen.value = false
  router.push('/app/tournament/running/finish')
}

const goTournamentList = () => {
  router.push('/app/tournaments')
}

const goBankRecordList = () => {
  router.push('/app/bank-records')
}

const openRecentTournament = (item) => {
  router.push(`/app/tournament/${item.id}/summary`)
}

const goSimpleRecord = (recordId) => {
  router.push({
    path: '/app/simple-record',
    query: recordId ? { recordId } : {},
  })
}
</script>

<style scoped>
.home-page {
  display: grid;
  gap: 26px;
  padding: 10px var(--v2-page-padding-x) 24px;
}

.simple-home {
  align-content: start;
  gap: 20px;
  padding-bottom: 104px;
}

.simple-summary-section :deep(.app-section__header) {
  min-height: 40px;
  align-items: center;
}

.simple-summary-section :deep(.app-section__title) {
  font-size: 19px;
  font-weight: 680;
}

.simple-month-navigation {
  display: grid;
  min-width: 156px;
  min-height: 38px;
  grid-template-columns: 32px minmax(88px, 1fr) 32px;
  align-items: center;
  overflow: hidden;
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-md);
  background: #fff;
  color: var(--v2-text-sub);
}

.simple-month-navigation button {
  width: 32px;
  height: 36px;
  padding: 0;
  border: 0;
  border-radius: 0;
  background: transparent;
  color: var(--v2-text-main);
}

.simple-month-navigation button:disabled {
  color: #d6d1df;
}

.simple-month-navigation span {
  color: var(--v2-text-main);
  font-size: 12px;
  font-weight: 650;
  text-align: center;
  white-space: nowrap;
}

.simple-summary {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.simple-summary article {
  display: grid;
  min-height: 74px;
  place-items: center;
  align-content: center;
  gap: 5px;
  padding: 10px 6px;
  border: 1px solid rgba(109, 69, 232, .08);
  border-radius: 13px;
  background: #fff;
  box-shadow: 0 5px 14px rgba(28, 18, 60, .035);
  text-align: center;
}

.simple-summary article:nth-child(-n + 3) {
  background: linear-gradient(145deg, #fff 55%, #faf8ff 100%);
}

.simple-summary span {
  color: var(--v2-text-sub);
  font-size: 10px;
  line-height: 1.2;
}

.simple-summary strong {
  font-size: 14px;
  font-weight: 680;
  line-height: 1.15;
  white-space: nowrap;
}

.simple-summary strong.positive {
  color: var(--v2-success);
}

.simple-summary strong.negative {
  color: var(--v2-danger);
}

.simple-summary--loading article {
  gap: 1px;
}

.simple-summary-empty {
  display: grid;
  min-height: 96px;
  grid-template-columns: 42px minmax(0, 1fr) auto;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border: 1px solid rgba(109, 69, 232, .1);
  border-radius: 16px;
  background: linear-gradient(135deg, #fff 45%, #f8f5ff 100%);
  box-shadow: 0 5px 16px rgba(28, 18, 60, .035);
}

.simple-summary-empty__icon {
  display: grid;
  width: 42px;
  height: 42px;
  place-items: center;
  border-radius: 12px;
  background: var(--v2-primary-soft);
  color: var(--v2-primary);
}

.simple-summary-empty__copy {
  display: grid;
  gap: 5px;
}

.simple-summary-empty__copy strong {
  color: var(--v2-text-main);
  font-size: 13px;
  font-weight: 650;
}

.simple-summary-empty__copy small {
  color: var(--v2-text-sub);
  font-size: 10px;
  line-height: 1.45;
}

.simple-summary-empty > button,
.profit-chart__empty > button {
  min-height: 32px;
  padding: 0 12px;
  border: 0;
  border-radius: 9px;
  background: var(--v2-primary-soft);
  color: var(--v2-primary);
  font: inherit;
  font-size: 11px;
  font-weight: 650;
  white-space: nowrap;
}

.profit-chart {
  box-sizing: border-box;
  display: grid;
  height: 232px;
  min-height: 232px;
  max-height: 232px;
  grid-template-rows: auto minmax(0, 1fr);
  gap: 10px;
}

.profit-chart__body {
  display: grid;
  height: 154px;
  min-height: 0;
  grid-template-rows: auto 122px;
  align-content: end;
  gap: 10px;
}

.profit-chart__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.profit-chart__period {
  display: grid;
  gap: 3px;
}

.profit-chart__period > strong {
  font-size: 13px;
  font-weight: 580;
}

.profit-chart__period > small {
  color: var(--v2-text-sub);
  font-size: 10px;
  line-height: 1;
}

.period-tabs {
  display: flex;
  padding: 3px;
  border-radius: 9px;
  background: #f2f0f7;
}

.period-tabs button {
  min-width: 38px;
  min-height: 28px;
  padding: 0 9px;
  border: 0;
  border-radius: 7px;
  background: transparent;
  color: var(--v2-text-sub);
  font: inherit;
  font-size: 11px;
}

.period-tabs button.active {
  background: #fff;
  color: var(--v2-primary);
  font-weight: 600;
  box-shadow: 0 2px 7px rgba(28, 18, 60, .08);
}

.profit-chart__value {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.profit-chart__value strong {
  color: var(--v2-success);
  font-size: 19px;
  font-weight: 620;
}

.profit-chart__value strong.negative {
  color: var(--v2-danger);
}

.profit-chart__value span {
  color: var(--v2-text-sub);
  font-size: 11px;
}

.profit-chart svg {
  display: block;
  width: 100%;
  height: 122px;
}

.profit-chart__empty {
  height: 154px;
  min-height: 0;
  display: grid;
  place-items: center;
  align-content: center;
  gap: 6px;
  color: var(--v2-text-sub);
  font-size: 11px;
  text-align: center;
}

.profit-chart__empty-icon {
  display: grid;
  width: 42px;
  height: 42px;
  margin-bottom: 2px;
  place-items: center;
  border-radius: 50%;
  background: var(--v2-primary-soft);
  color: var(--v2-primary);
}

.profit-chart__empty strong {
  color: var(--v2-text-main);
  font-size: 13px;
  font-weight: 650;
}

.profit-chart__empty small {
  color: var(--v2-text-sub);
  font-size: 10px;
}

.profit-chart__empty > button {
  margin-top: 5px;
}

@media (max-width: 380px) {
  .simple-summary-empty {
    grid-template-columns: 38px minmax(0, 1fr);
  }

  .simple-summary-empty__icon {
    width: 38px;
    height: 38px;
  }

  .simple-summary-empty > button {
    grid-column: 2;
    justify-self: start;
  }
}

.chart-area {
  fill: url(#simpleProfitFill);
}

.chart-line {
  fill: none;
  stroke: var(--v2-primary);
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 3;
}

.chart-date {
  fill: var(--v2-text-sub);
  font-size: 9px;
  font-weight: 520;
}

.simple-record-fab {
  position: fixed;
  z-index: 5;
  right: max(20px, calc((100vw - 480px) / 2 + 20px));
  bottom: 92px;
  display: grid;
  width: 56px;
  height: 56px;
  place-items: center;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: var(--v2-primary);
  color: #fff;
  box-shadow: 0 10px 24px rgba(109, 69, 232, .3);
}

.simple-record-fab:active {
  transform: translateY(1px);
}

.add-record-card {
  display: grid;
  width: 100%;
  min-height: 64px;
  grid-template-columns: 38px minmax(0, 1fr) auto;
  align-items: center;
  gap: 11px;
  padding: 12px 14px;
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-lg);
  background: #fff;
  color: var(--v2-text-main);
  font: inherit;
  text-align: left;
  box-shadow: var(--v2-shadow-card);
}

.add-record-card__icon {
  display: grid;
  width: 38px;
  height: 38px;
  place-items: center;
  border-radius: 10px;
  background: var(--v2-primary-soft);
  color: var(--v2-primary);
}

.add-record-card strong {
  font-size: 14px;
  font-weight: 620;
}

.add-record-card > .q-icon {
  color: var(--v2-text-sub);
}

.add-record-card:active {
  border-color: rgba(109, 69, 232, .24);
  background: #fbfaff;
}

.simple-record {
  display: grid;
  width: 100%;
  min-height: 72px;
  grid-template-columns: minmax(0, 1fr) auto 20px;
  align-items: center;
  gap: 9px;
  padding: 12px 12px 12px 16px;
  border: 0;
  border-bottom: 1px solid var(--v2-border);
  background: transparent;
  color: var(--v2-text-main);
  font: inherit;
  text-align: left;
}

.simple-record:last-child {
  border-bottom: 0;
}

.simple-record__main {
  display: grid;
  min-width: 0;
  gap: 6px;
}

.simple-record__main strong {
  overflow: hidden;
  font-size: 14px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.simple-record__main small {
  overflow: hidden;
  color: var(--v2-text-sub);
  font-size: 10px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.simple-record__result {
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
}

.simple-record__result.win { color: var(--v2-success); }
.simple-record__result.lose { color: var(--v2-danger); }
.simple-record__pending {
  padding: 5px 7px;
  border-radius: 7px;
  background: #f2f0f7;
  color: var(--v2-text-sub);
  font-size: 10px;
  white-space: nowrap;
}

.simple-record > .q-icon {
  color: var(--v2-text-sub);
}

.venue-profit__period {
  color: var(--v2-text-sub);
  font-size: 11px;
  font-weight: 520;
}

.venue-profit__row {
  display: flex;
  min-height: 62px;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--v2-border);
}

.venue-profit__row:last-child {
  border-bottom: 0;
}

.venue-profit__main {
  display: grid;
  min-width: 0;
  gap: 4px;
}

.venue-profit__main strong {
  overflow: hidden;
  color: var(--v2-text-main);
  font-size: 14px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.venue-profit__main small {
  color: var(--v2-text-sub);
  font-size: 10px;
}

.venue-profit__amount {
  color: var(--v2-text-main);
  font-size: 14px;
  font-weight: 650;
  white-space: nowrap;
}

.venue-profit__amount.positive {
  color: var(--v2-success);
}

.venue-profit__amount.negative {
  color: var(--v2-danger);
}

.venue-profit__empty {
  min-height: 80px;
  display: grid;
  place-items: center;
  padding: 16px;
  color: var(--v2-text-sub);
  font-size: 12px;
  text-align: center;
}

.running-section {
  display: grid;
  gap: 12px;
}

.running-section h2 {
  margin: 0;
  color: var(--v2-text-main);
  font-size: 15px;
  font-weight: 560;
  line-height: 1.2;
}

.running-card {
  position: relative;
  padding: 16px;
  border-radius: var(--v2-radius-lg);
  background: linear-gradient(135deg, #6d45e8 0%, #5317f4 100%);
  color: #ffffff;
  box-shadow: 0 12px 24px rgba(83, 23, 244, 0.18);
}

.running-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.running-card__header span {
  overflow: hidden;
  min-width: 0;
  font-size: 24px;
  font-weight: 620;
  line-height: 1.25;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.running-card__menu-button {
  display: grid;
  width: 32px;
  height: 32px;
  flex: 0 0 auto;
  place-items: center;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.12);
  color: #ffffff;
}

.running-card__popup-menu {
  position: absolute;
  z-index: 4;
  top: 58px;
  right: 16px;
  width: 168px;
  overflow: hidden;
  border: 1px solid var(--v2-border);
  border-radius: 12px;
  background: #f8f7fb;
  box-shadow: 0 7px 18px rgba(28, 18, 60, 0.12);
}

.running-card__popup-heading {
  padding: 10px 12px 8px;
  border-bottom: 1px solid var(--v2-border);
  color: var(--v2-text-sub);
  font-size: 11px;
  font-weight: 560;
}

.running-card__popup-menu button {
  width: 100%;
  min-height: 42px;
  padding: 0 14px;
  border: 0;
  background: #f8f7fb;
  color: var(--v2-text-main);
  display: block;
  font: inherit;
  font-size: 13px;
  font-weight: 520;
  text-align: left;
}

.running-card__popup-menu .danger {
  margin-top: 6px;
  border-top: 1px solid var(--v2-border);
  color: var(--v2-danger);
}

.running-card__level {
  margin-top: 18px;
  font-size: 20px;
  font-weight: 560;
  line-height: 1;
  letter-spacing: 0;
}

.running-card p {
  margin: 6px 0 16px;
  color: rgba(255, 255, 255, 0.88);
  font-size: 13px;
  font-weight: 430;
  line-height: 1.2;
}

.running-card dl {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  margin: 0;
  padding: 16px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.18);
  border-bottom: 1px solid rgba(255, 255, 255, 0.18);
}

.running-card dl div {
  min-width: 0;
  padding: 0 16px;
}

.running-card dl div:first-child {
  padding-left: 0;
  border-right: 1px solid rgba(255, 255, 255, 0.18);
}

.running-card dl div:last-child {
  padding-right: 0;
}

.running-card dt,
.running-card dd {
  margin: 0;
}

.running-card dt {
  color: rgba(255, 255, 255, 0.78);
  font-size: 12px;
  font-weight: 430;
  line-height: 1.2;
}

.running-card dd {
  margin-top: 6px;
  color: #ffffff;
  font-size: 22px;
  font-weight: 560;
  line-height: 1.1;
}

.running-card dl span {
  display: block;
  margin-top: 4px;
  color: rgba(255, 255, 255, 0.82);
  font-size: 12px;
  font-weight: 430;
  line-height: 1.2;
}

.running-card__action {
  width: 100%;
  min-height: 44px;
  margin-top: 14px;
  border: 0;
  border-radius: var(--v2-radius-md);
  background: #ffffff;
  color: var(--v2-primary);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font: inherit;
  font-size: 14px;
  font-weight: 560;
}

.running-manage-sheet {
  width: 100%;
  max-height: 86vh;
  overflow-y: auto;
  padding: 10px 18px calc(18px + env(safe-area-inset-bottom));
  border-radius: 20px 20px 0 0;
  background: #ffffff;
}

.running-manage-sheet__handle {
  width: 38px;
  height: 4px;
  margin: 0 auto 14px;
  border-radius: 999px;
  background: #d8d4df;
}

.running-manage-sheet h3 {
  margin: 0 0 10px;
  color: var(--v2-text-main);
  font-size: 17px;
  font-weight: 620;
}

.running-manage-sheet__title {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 18px;
}

.running-manage-sheet__title h3 {
  margin: 0;
  text-align: center;
}

.quick-edit-form {
  display: grid;
  gap: 24px;
}

.quick-edit-section {
  display: grid;
  gap: 14px;
}

.quick-edit-section h4 {
  margin: 0;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--v2-border);
  color: var(--v2-text-main);
  font-size: 15px;
  font-weight: 620;
}

.quick-edit-section > label,
.quick-edit-section > div {
  display: grid;
  gap: 8px;
}

.quick-edit-form label > span,
.quick-edit-label {
  color: var(--v2-text-main);
  font-size: 13px;
  font-weight: 560;
}

.quick-edit-input {
  min-height: 48px;
  padding: 0 13px;
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-md);
  background: #ffffff;
  display: flex;
  align-items: center;
}

.quick-edit-input:focus-within,
.quick-edit-form textarea:focus {
  border-color: rgba(109, 69, 232, 0.5);
  outline: 0;
}

.quick-edit-input input {
  min-width: 0;
  flex: 1;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--v2-text-main);
  font: inherit;
  font-size: 15px;
}

.quick-edit-input b {
  color: var(--v2-text-sub);
  font-size: 12px;
  font-weight: 430;
}

.quick-edit-blinds {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.quick-edit-blinds label {
  min-height: 62px;
  padding: 9px 10px;
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-md);
  display: grid;
  gap: 6px;
}

.quick-edit-blinds small {
  color: var(--v2-text-sub);
  font-size: 10px;
  font-weight: 520;
}

.quick-edit-blinds input {
  width: 100%;
  min-width: 0;
  padding: 0;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--v2-text-main);
  font: inherit;
  font-size: 14px;
  font-weight: 520;
}

.quick-edit-form textarea {
  min-height: 96px;
  padding: 12px;
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-md);
  resize: none;
  color: var(--v2-text-main);
  font: inherit;
  font-size: 14px;
  line-height: 1.5;
}

.running-manage-sheet .quick-edit-save {
  display: block;
  width: 100%;
  min-height: 48px;
  margin-top: 22px;
  position: sticky;
  bottom: 0;
  z-index: 2;
  padding: 0 16px;
  border: 0;
  border-radius: var(--v2-radius-md);
  background: var(--v2-primary);
  color: #ffffff;
  font-size: 15px;
  font-weight: 600;
  text-align: center;
}

.start-card {
  display: grid;
  grid-template-columns: 82px minmax(0, 1fr) auto;
  align-items: center;
  gap: 14px;
  height: 140px;
  min-height: 140px;
  max-height: 140px;
  border-color: rgba(109, 69, 232, 0.12);
  background: linear-gradient(180deg, #fbf9ff 0%, #ffffff 100%);
}

.start-card__mark {
  position: relative;
  width: 64px;
  height: 64px;
}

.start-card__card {
  position: absolute;
  border-radius: 8px;
}

.start-card__card--back {
  right: 5px;
  bottom: 3px;
  width: 43px;
  height: 54px;
  background: #eee8ff;
  box-shadow: inset 0 0 0 1px rgba(109, 69, 232, 0.07);
  transform: rotate(-4deg);
}

.start-card__card--front {
  left: 2px;
  top: 2px;
  width: 43px;
  height: 54px;
  background: linear-gradient(180deg, #8a6bf0 0%, #6d45e8 100%);
  box-shadow: 0 10px 18px rgba(109, 69, 232, 0.18);
  transform: rotate(-7deg);
}

.start-card__card--front span {
  position: absolute;
  display: block;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.92);
}

.start-card__card--front span:first-child {
  left: 10px;
  top: 12px;
  width: 23px;
  height: 5px;
}

.start-card__card--front span:last-child {
  left: 10px;
  top: 22px;
  width: 16px;
  height: 5px;
}

.start-card__plus {
  position: absolute;
  right: 0;
  bottom: 8px;
  display: grid;
  width: 28px;
  height: 28px;
  place-items: center;
  border-radius: 50%;
  background: var(--v2-primary);
  color: #ffffff;
  box-shadow: 0 8px 18px rgba(109, 69, 232, 0.24);
}

.start-card__copy {
  min-width: 0;
}

.start-card__copy h1 {
  margin: 0 0 8px;
  color: var(--v2-text-main);
  font-size: 20px;
  font-weight: 560;
  line-height: 1.2;
  letter-spacing: 0;
}

.start-card__copy p {
  margin: 0;
  color: var(--v2-text-sub);
  font-size: 13px;
  font-weight: 450;
  line-height: 1.55;
}

.start-card__arrow {
  color: #4b465b;
}

.recent-row {
  width: 100%;
  min-height: 80px;
  padding: 14px 14px 14px 24px;
  border: 0;
  border-bottom: 1px solid var(--v2-border);
  background: transparent;
  color: var(--v2-text-main);
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto auto;
  align-items: center;
  gap: 10px;
  text-align: left;
}

.recent-row:last-child {
  border-bottom: 0;
}

.recent-row--status {
  display: grid;
  place-items: center;
  color: var(--v2-text-sub);
  font-size: 13px;
}

.recent-empty {
  width: 100%;
  min-height: 112px;
  padding: 18px;
  border: 0;
  background: linear-gradient(135deg, rgba(109, 69, 232, 0.055), rgba(255, 255, 255, 0));
  color: var(--v2-text-main);
  display: grid;
  grid-template-columns: 48px minmax(0, 1fr) 24px;
  align-items: center;
  gap: 14px;
  font: inherit;
  text-align: left;
}

.recent-empty__icon {
  display: grid;
  width: 48px;
  height: 48px;
  place-items: center;
  border-radius: 50%;
  background: var(--v2-primary-soft);
  color: var(--v2-primary);
}

.recent-empty__copy {
  display: grid;
  gap: 6px;
}

.recent-empty__copy strong {
  font-size: 14px;
  font-weight: 560;
  line-height: 1.25;
}

.recent-empty__copy small {
  color: var(--v2-text-sub);
  font-size: 12px;
  font-weight: 430;
  line-height: 1.45;
}

.recent-empty__arrow {
  color: #777188;
}

.recent-row--no-badge {
  grid-template-columns: minmax(0, 1fr) auto;
}

.recent-row__main {
  display: grid;
  gap: 6px;
  min-width: 0;
}

.recent-row__main strong {
  overflow: hidden;
  font-size: 16px;
  font-weight: 560;
  line-height: 1.2;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.recent-row__main span {
  overflow: hidden;
  color: var(--v2-text-sub);
  font-size: 14px;
  font-weight: 450;
  line-height: 1.2;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.recent-row__badge {
  min-width: 42px;
  padding: 6px 8px;
  border-radius: var(--v2-radius-sm);
  background: #f0eff5;
  color: #302c3d;
  font-size: 13px;
  font-weight: 520;
  line-height: 1;
  text-align: center;
}

.recent-row__badge--success {
  background: rgba(22, 163, 74, 0.16);
  color: #15803d;
}

.recent-row__result {
  font-size: 16px;
  font-weight: 560;
  line-height: 1;
  white-space: nowrap;
}

.recent-row__result--success {
  color: var(--v2-success);
}

.recent-row__result--danger {
  color: var(--v2-danger);
}

.home-page__stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}

@media (max-width: 420px) {
  .start-card {
    grid-template-columns: 72px minmax(0, 1fr) auto;
    gap: 12px;
    height: 136px;
    min-height: 136px;
    max-height: 136px;
  }

  .start-card__mark {
    width: 58px;
    height: 58px;
  }

  .start-card__copy h1 {
    font-size: 19px;
  }

  .home-page__stats-grid {
    gap: 8px;
  }
}
</style>
