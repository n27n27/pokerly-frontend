<template>
  <q-page v-if="isSimpleMode" class="home-page simple-home">
    <AppSection title="이번 달 요약">
      <div class="simple-summary">
        <article class="simple-summary__profit">
          <span>순수익</span>
          <strong>+248,500</strong>
        </article>
        <article v-for="metric in simpleMetrics" :key="metric.label">
          <span>{{ metric.label }}</span>
          <strong>{{ metric.value }}</strong>
        </article>
      </div>
    </AppSection>

    <AppSection title="손익 추세">
      <AppCard class="profit-chart" padding="md">
        <div class="profit-chart__header">
          <strong>이번 달</strong>
          <div class="period-tabs" aria-label="손익 그래프 기간">
            <button
              v-for="period in periods"
              :key="period"
              type="button"
              :class="{ active: selectedPeriod === period }"
              @click="selectedPeriod = period"
            >
              {{ period }}
            </button>
          </div>
        </div>
        <div class="profit-chart__value"><strong>+248,500</strong><span>ROI 18.7%</span></div>
        <svg viewBox="0 0 320 104" role="img" aria-label="선택 기간 누적 손익 그래프">
          <defs>
            <linearGradient id="simpleProfitFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#6d45e8" stop-opacity=".2" />
              <stop offset="100%" stop-color="#6d45e8" stop-opacity="0" />
            </linearGradient>
          </defs>
          <path class="chart-area" d="M4 92 L34 78 L62 83 L91 57 L119 64 L148 39 L176 47 L205 25 L233 42 L262 29 L290 35 L316 14 L316 102 L4 102 Z" />
          <path class="chart-line" d="M4 92 L34 78 L62 83 L91 57 L119 64 L148 39 L176 47 L205 25 L233 42 L262 29 L290 35 L316 14" />
        </svg>
      </AppCard>
    </AppSection>

    <button class="add-record-card" type="button" @click="goSimpleRecord()">
      <span class="add-record-card__icon"><q-icon name="add" size="25px" /></span>
      <strong>새 기록 추가</strong>
      <q-icon name="chevron_right" size="24px" />
    </button>

    <AppSection title="최근 기록" action-label="더보기 ›" @action="goBankRecordList">
      <AppCard padding="none">
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
  </q-page>

  <q-page v-else class="home-page">
    <section v-if="hasRunningTournament" class="running-section">
      <h2>진행 중 토너먼트</h2>

      <article class="running-card">
        <div class="running-card__header">
          <span>{{ runningTournament.name }}</span>
          <strong>Running</strong>
        </div>

        <div class="running-card__level">{{ runningTournament.level }}</div>
        <p>{{ runningTournament.blinds }}</p>

        <dl>
          <div>
            <dt>현재 스택</dt>
            <dd>{{ runningTournament.currentStack }}</dd>
            <span>{{ runningTournament.currentBb }} BB</span>
          </div>
          <div>
            <dt>평균 스택</dt>
            <dd>{{ runningTournament.averageStack }}</dd>
            <span>{{ runningTournament.averageBb }} BB</span>
          </div>
        </dl>

        <button class="running-card__action" type="button" @click="goTournamentRunning">
          <q-icon name="edit_square" size="18px" />
          이어서 기록하기
        </button>
      </article>
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

    <AppSection :title="recentSection.title" action-label="더보기 ›" @action="goTournamentList">
      <AppCard padding="none">
        <button
          v-for="item in recentSection.items"
          :key="item.id"
          class="recent-row"
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

          <q-icon class="recent-row__arrow" name="chevron_right" size="24px" />
        </button>
      </AppCard>
    </AppSection>

    <AppSection title="이번 달 요약">
      <div class="home-page__stats-grid">
        <StatCard label="Profit" value="+1132만" tone="success" icon="account_balance_wallet" />
        <StatCard label="ROI" value="+42.1%" tone="success" icon="show_chart" />
        <StatCard label="토너먼트" value="12" icon="emoji_events" />
        <StatCard label="ITM" value="3" icon="workspace_premium" />
      </div>
    </AppSection>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import AppCard from 'src/shared/components/AppCard.vue'
import AppSection from 'src/shared/components/AppSection.vue'
import StatCard from 'src/shared/components/StatCard.vue'

const router = useRouter()
const route = useRoute()
const recordMode = ref('simple')
const selectedPeriod = ref('월')
const periods = ['주', '월', '전체']

onMounted(() => {
  recordMode.value = localStorage.getItem('pokerly-record-mode') || 'simple'
})

const isSimpleMode = computed(() => recordMode.value === 'simple')
const simpleMetrics = [
  { label: 'ROI', value: '18.7%' },
  { label: '참가', value: '12회' },
  { label: 'ITM', value: '3회' },
  { label: '게임당 평균 바인', value: '1.42x' },
]
const simpleRecords = [
  { id: 'prime-0702', title: 'Prime', date: '2026.07.23', buyIn: '100,000', entries: 2, result: '+320,000', tone: 'win' },
  { id: 'royce-0718', title: 'Royce Daily', date: '2026.07.18', buyIn: '110,000', entries: 1, result: '-50,000', tone: 'lose' },
  { id: 'mango-0712', title: 'Mango', date: '2026.07.12', buyIn: '80,000', entries: 1, result: '', tone: '' },
]

const hasRunningTournament = computed(() => route.query.running === '1')

const runningTournament = {
  name: 'Prime 3000 GTD',
  level: 'L12',
  blinds: '1,500 / 3,000 (3,000)',
  currentStack: '84,000',
  currentBb: '28',
  averageStack: '112,000',
  averageBb: '37',
}

const recentSection = {
  title: '최근 토너먼트',
  items: [
    { id: 'prime-0702', title: '프라임 0702', meta: '2025.07.02', badge: '완료', tone: 'success' },
    { id: 'mango-0630', title: 'Mango 2nd', meta: '2024.06.30', badge: '탈락', tone: 'default' },
    { id: 'kiki-0629', title: 'KIKI 3000 GTD', meta: '2024.06.29', badge: 'Bubble', tone: 'default' },
  ],
}

const goTournamentStart = () => {
  router.push('/app/tournament/start')
}

const goTournamentRunning = () => {
  router.push('/app/tournament/running')
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

.simple-summary {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  overflow: hidden;
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-lg);
  background: #fff;
  box-shadow: var(--v2-shadow-card);
}

.simple-summary article {
  display: grid;
  min-height: 68px;
  place-items: center;
  align-content: center;
  gap: 5px;
  padding: 10px 6px;
  border-left: 1px solid var(--v2-border);
  text-align: center;
}

.simple-summary__profit {
  grid-column: 1 / -1;
  min-height: 80px !important;
  border-bottom: 1px solid var(--v2-border);
  border-left: 0 !important;
}

.simple-summary article:nth-child(2) {
  border-left: 0;
}

.simple-summary span {
  color: var(--v2-text-sub);
  font-size: 10px;
  line-height: 1.2;
}

.simple-summary strong {
  font-size: 15px;
  font-weight: 620;
  line-height: 1.15;
  white-space: nowrap;
}

.simple-summary__profit strong {
  color: var(--v2-success);
  font-size: 24px;
}

.profit-chart {
  display: grid;
  gap: 10px;
}

.profit-chart__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.profit-chart__header > strong {
  font-size: 13px;
  font-weight: 580;
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

.profit-chart__value span {
  color: var(--v2-text-sub);
  font-size: 11px;
}

.profit-chart svg {
  display: block;
  width: 100%;
  height: 104px;
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
  font-size: 13px;
  font-weight: 520;
  line-height: 1.2;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.running-card__header strong {
  flex: 0 0 auto;
  padding: 4px 9px;
  border-radius: 999px;
  background: #141329;
  color: #20e0a1;
  font-size: 10px;
  font-weight: 560;
  line-height: 1;
}

.running-card__level {
  margin-top: 12px;
  font-size: 34px;
  font-weight: 600;
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

.start-card {
  display: grid;
  grid-template-columns: 82px minmax(0, 1fr) auto;
  align-items: center;
  gap: 14px;
  min-height: 122px;
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

.recent-row__arrow {
  color: #777188;
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
    min-height: 116px;
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
