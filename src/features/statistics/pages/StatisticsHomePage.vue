<template>
  <q-page class="stats-home-page">
    <header class="stats-header">
      <h1>통계</h1>
      <div class="filter-pair">
        <button type="button">
          <q-icon name="calendar_month" size="18px" />
          <span>전체 기간</span>
          <q-icon name="expand_more" size="18px" />
        </button>
        <button type="button">
          <q-icon name="store" size="18px" />
          <span>전체 매장</span>
          <q-icon name="expand_more" size="18px" />
        </button>
      </div>
    </header>

    <section class="stats-section">
      <h2>뱅크 요약</h2>
      <div class="bank-grid">
        <article v-for="card in bankCards" :key="card.label" :class="`bank-card--${card.tone}`">
          <span>{{ card.label }}</span>
          <strong>{{ card.value }}</strong>
        </article>
      </div>
    </section>

    <section class="stats-section">
      <h2>손익 추세</h2>
      <div class="summary-panel trend-panel">
      <div class="panel-header">
        <div class="period-tabs">
          <button type="button">주</button>
          <button class="active" type="button">월</button>
          <button type="button">전체</button>
        </div>
        <button type="button">순수익 <q-icon name="expand_more" size="18px" /></button>
      </div>
      <svg class="trend-chart" viewBox="0 0 340 170" role="img" aria-label="ROI 추이">
        <path class="trend-fill" :d="trendFillPath" />
        <path class="trend-line" :d="trendLinePath" />
        <circle v-for="point in trendPoints" :key="point.x" :cx="point.x" :cy="point.y" r="2.6" />
      </svg>
      <div class="trend-axis">
        <span>01/01</span>
        <span>02/01</span>
        <span>03/01</span>
        <span>04/01</span>
        <span>05/01</span>
        <span>06/01</span>
        <span>07/02</span>
      </div>
      </div>
    </section>

    <section class="stats-section">
      <h2>기간 요약</h2>
      <div class="period-summary">
        <article v-for="item in periodSummary" :key="item.label">
          <span>{{ item.label }}</span>
          <strong :class="item.tone">{{ item.value }}</strong>
        </article>
      </div>
    </section>

    <section class="stats-section">
      <h2>매장별 통계</h2>
      <div class="venue-table">
        <div class="venue-table__head">
          <span>매장</span><span>참가 수</span><span>ROI</span><span>순수익</span><span>ITM</span>
        </div>
        <div v-for="row in venueRows" :key="row.name">
          <strong>{{ row.name }}</strong><span>{{ row.games }}</span><span>{{ row.roi }}</span><span :class="row.tone">{{ row.profit }}</span><span>{{ row.itm }}</span>
        </div>
      </div>
    </section>

    <section class="stats-section">
      <h2>기록</h2>
      <div class="record-grid">
        <article v-for="item in records" :key="item.label">
          <span>{{ item.label }}</span>
          <strong>{{ item.value }}</strong>
          <small>{{ item.sub }}</small>
        </article>
      </div>
    </section>

    <section class="stats-section play-stats">
      <h2>플레이 통계</h2>
      <div class="table-grid">
        <section class="summary-panel">
          <h3>포지션 통계</h3>
          <div class="mini-table">
            <div><span>포지션</span><span>플레이 횟수</span><span>승률</span></div>
            <div v-for="row in positionRows" :key="row.position">
              <span>{{ row.position }}</span><span>{{ row.count }}</span><span>{{ row.win }}</span>
            </div>
          </div>
          <button class="detail-button" type="button" @click="router.push('/app/statistics/position')">자세히 보기</button>
        </section>

        <section class="summary-panel">
          <h3>핸드 통계</h3>
          <div class="mini-table">
            <div><span>핸드</span><span>플레이 횟수</span><span>승률</span></div>
            <div v-for="row in handRows" :key="row.hand">
              <span>{{ row.hand }}</span><span>{{ row.count }}</span><span>{{ row.win }}</span>
            </div>
          </div>
          <button class="detail-button" type="button" @click="router.push('/app/statistics/hands')">자세히 보기</button>
        </section>
      </div>
    </section>
  </q-page>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const bankCards = [
  { label: '순수익', value: '+248,500', tone: 'profit' },
  { label: 'ROI', value: '18.7%', tone: 'roi' },
  { label: 'ITM률', value: '24.1%', tone: 'itm' },
  { label: '참가 대회', value: '58', tone: 'count' },
  { label: '게임당 평균 바인', value: '1.45x', tone: 'average' },
]

const periodSummary = [
  { label: '총 바인 금액', value: '1,330,000' },
  { label: '총 상금', value: '1,578,500' },
  { label: '순수익', value: '+248,500', tone: 'positive' },
  { label: 'ROI', value: '18.7%', tone: 'primary' },
  { label: 'ITM', value: '24.1%', tone: 'primary' },
]

const venueRows = [
  { name: '프라임', games: '24', roi: '24.8%', profit: '+186,000', itm: '29.2%', tone: 'positive' },
  { name: 'KMGM', games: '18', roi: '16.2%', profit: '+72,500', itm: '22.2%', tone: 'positive' },
  { name: '더홀릭', games: '10', roi: '5.4%', profit: '+12,000', itm: '20.0%', tone: 'positive' },
  { name: '기타', games: '6', roi: '-8.1%', profit: '-22,000', itm: '16.7%', tone: 'negative' },
]

const records = [
  { label: '최고 상금', value: '450,000', sub: '프라임 0702' },
  { label: '최고 ROI', value: '186.4%', sub: '더홀릭 0618' },
  { label: '최고 순수익', value: '+320,000', sub: '프라임 0702' },
]

const trendValues = [0, 6, 5, 9, 8, 11, 15, 12, 13, 20, 18, 22, 26, 23, 28, 23, 24, 26, 31, 25, 21, 22, 18, 13, 17, 20, 23, 22, 26, 26]

const trendPoints = computed(() =>
  trendValues.map((value, index) => ({
    x: 4 + index * (332 / (trendValues.length - 1)),
    y: 144 - value * 3.8,
  })),
)

const trendLinePath = computed(() =>
  trendPoints.value.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' '),
)

const trendFillPath = computed(() => `${trendLinePath.value} L 336 150 L 4 150 Z`)

const positionRows = [
  { position: 'UTG', count: '412', win: '18.9%' },
  { position: 'MP', count: '567', win: '21.3%' },
  { position: 'HJ', count: '578', win: '22.4%' },
  { position: 'CO', count: '611', win: '24.8%' },
  { position: 'BTN', count: '653', win: '27.1%' },
  { position: 'SB', count: '342', win: '19.7%' },
  { position: 'BB', count: '121', win: '17.6%' },
]

const handRows = [
  { hand: 'AK', count: '18', win: '72.2%' },
  { hand: 'AQ', count: '24', win: '66.7%' },
  { hand: 'AJ', count: '22', win: '63.6%' },
  { hand: 'KQ', count: '28', win: '57.1%' },
  { hand: 'JJ', count: '16', win: '68.8%' },
  { hand: 'TT', count: '19', win: '57.9%' },
  { hand: '99', count: '17', win: '52.9%' },
]
</script>

<style scoped>
.stats-home-page {
  display: grid;
  gap: 12px;
  padding: var(--v2-page-padding-top) var(--v2-page-padding-x) 88px;
}

.stats-header {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 6px 10px;
  align-items: center;
  min-height: 38px;
}

.stats-header h1 {
  margin: 0;
  font-size: 22px;
  font-weight: 560;
  line-height: 1.2;
  color: var(--v2-text-main);
}

.stats-header p {
  grid-column: 1 / -1;
  margin: 0;
  color: var(--v2-text-sub);
  font-size: 12px;
  line-height: 1.35;
}

.filter-pair {
  display: flex;
  justify-content: flex-end;
  gap: 6px;
}

.filter-pair button,
.panel-header button {
  min-width: 112px;
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

.filter-pair span {
  color: var(--v2-text-main);
  font-weight: 520;
  line-height: 1;
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
  color: var(--v2-text-main);
  font-size: 14px;
  font-weight: 520;
  line-height: 1.15;
}

.summary-panel > h3,
.panel-header h3 {
  margin: 0;
  color: var(--v2-text-main);
  font-size: 14px;
  font-weight: 520;
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
  font-weight: 520;
}

.summary-strip strong,
.metric-grid strong,
.bank-grid strong {
  color: #4f2be8;
  font-size: 19px;
  font-weight: 560;
  line-height: 1;
}

.stats-section {
  display: grid;
  gap: 6px;
}

.bank-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 6px;
}

.bank-grid article {
  min-height: 64px;
  padding: 10px 11px;
  display: grid;
  place-items: center;
  align-content: center;
  gap: 7px;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.bank-grid article::before {
  position: absolute;
  inset: 0;
  content: '';
  opacity: 0.42;
  pointer-events: none;
}

.metric-grid article > span,
.bank-grid article > span {
  color: var(--v2-text-main);
  font-size: 12px;
  font-weight: 520;
  line-height: 1.15;
}

.bank-card--roi::before {
  background: linear-gradient(135deg, rgba(109, 69, 232, 0.08), transparent 58%);
}

.bank-card--profit::before {
  background: linear-gradient(135deg, rgba(22, 163, 74, 0.08), transparent 58%);
}

.bank-card--itm::before {
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.07), transparent 58%);
}

.bank-card--count::before {
  background: linear-gradient(135deg, rgba(14, 165, 233, 0.07), transparent 58%);
}

.bank-card--average::before {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.09), transparent 58%);
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
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

.trend-line {
  fill: none;
  stroke: var(--v2-primary);
  stroke-width: 2.4;
}

.trend-fill {
  fill: rgba(109, 69, 232, 0.08);
}

.trend-chart circle {
  fill: var(--v2-primary);
}

.trend-axis {
  display: flex;
  justify-content: space-between;
  box-sizing: border-box;
  width: 100%;
  padding: 0 8px;
  color: var(--v2-text-sub);
  font-size: 10px;
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
  color: var(--v2-success);
}

.negative {
  color: var(--v2-danger);
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
    display: flex;
    gap: 5px;
  }

  .filter-pair button {
    min-width: 104px;
  }

  .summary-strip,
  .metric-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  .bank-grid {
    grid-template-columns: repeat(5, minmax(0, 1fr));
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

  .metric-grid strong,
  .bank-grid strong {
    font-size: 15px;
  }

  .bank-grid article {
    min-height: 62px;
    padding: 9px 8px;
  }

  .table-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 420px) {
  .bank-grid,
  .period-summary {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .bank-grid article:last-child {
    grid-column: span 2;
  }

  .venue-table > div {
    grid-template-columns: minmax(62px, 1.15fr) repeat(4, minmax(48px, 1fr));
    padding: 0 8px;
    font-size: 10px;
  }
}
</style>
