<template>
  <q-page class="stats-home-page">
    <header class="stats-header">
      <div>
        <h1>통계</h1>
        <p>선택한 조건의 누적 데이터를 기반으로 분석한 결과입니다.</p>
      </div>
      <div class="filter-pair">
        <button type="button">
          <q-icon name="calendar_month" size="18px" />
          전체 기간
          <q-icon name="expand_more" size="18px" />
        </button>
        <button type="button">
          <q-icon name="store" size="18px" />
          전체 매장
          <q-icon name="expand_more" size="18px" />
        </button>
      </div>
    </header>

    <section class="summary-panel">
      <h2>전체 요약</h2>
      <div class="summary-strip">
        <div v-for="item in totalSummary" :key="item.label">
          <span>{{ item.label }}</span>
          <strong>{{ item.value }}</strong>
          <small>{{ item.unit }}</small>
        </div>
      </div>
    </section>

    <section class="stats-section">
      <h2>뱅크 요약</h2>
      <div class="bank-grid">
        <article v-for="card in bankCards" :key="card.label">
          <div>
            <span>{{ card.label }}</span>
            <q-icon :name="card.icon" size="22px" />
          </div>
          <strong>{{ card.value }}</strong>
          <small>{{ card.unit }}</small>
        </article>
      </div>
    </section>

    <section class="summary-panel trend-panel">
      <div class="panel-header">
        <h2>지표 추이</h2>
        <button type="button">ROI <q-icon name="expand_more" size="18px" /></button>
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
    </section>

    <div class="table-grid">
      <section class="summary-panel">
        <h2>포지션 통계</h2>
        <div class="mini-table">
          <div><span>포지션</span><span>플레이 횟수</span><span>승률</span></div>
          <div v-for="row in positionRows" :key="row.position">
            <span>{{ row.position }}</span><span>{{ row.count }}</span><span>{{ row.win }}</span>
          </div>
        </div>
        <button class="detail-button" type="button" @click="router.push('/app/statistics/position')">자세히 보기</button>
      </section>

      <section class="summary-panel">
        <h2>핸드 통계</h2>
        <div class="mini-table">
          <div><span>핸드</span><span>플레이 횟수</span><span>승률</span></div>
          <div v-for="row in handRows" :key="row.hand">
            <span>{{ row.hand }}</span><span>{{ row.count }}</span><span>{{ row.win }}</span>
          </div>
        </div>
        <button class="detail-button" type="button" @click="router.push('/app/statistics/hands')">자세히 보기</button>
      </section>
    </div>
  </q-page>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const totalSummary = [
  { label: '대회 수', value: '58', unit: '개' },
  { label: '기록 핸드', value: '3,284', unit: '핸드' },
  { label: '복기 핸드', value: '83', unit: '개' },
  { label: 'ITM 횟수', value: '14', unit: '회' },
]

const bankCards = [
  { label: 'ROI', value: '18.7%', unit: '', icon: 'trending_up' },
  { label: '순수익', value: '+248,500', unit: 'pt', icon: 'paid' },
  { label: 'ITM', value: '24.1%', unit: '', icon: 'emoji_events' },
  { label: '대회 수', value: '58', unit: '개', icon: 'calendar_month' },
]

const trendValues = [0, 6, 5, 9, 8, 11, 15, 12, 13, 20, 18, 22, 26, 23, 28, 23, 24, 26, 31, 25, 21, 22, 18, 13, 17, 20, 23, 22, 26, 26]

const trendPoints = computed(() =>
  trendValues.map((value, index) => ({
    x: 16 + index * (308 / (trendValues.length - 1)),
    y: 144 - value * 3.8,
  })),
)

const trendLinePath = computed(() =>
  trendPoints.value.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' '),
)

const trendFillPath = computed(() => `${trendLinePath.value} L 324 150 L 16 150 Z`)

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
  gap: 18px;
  padding: 12px 20px 108px;
}

.stats-header {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 16px;
  align-items: end;
}

.stats-header h1 {
  margin: 0;
  font-size: 28px;
  font-weight: 560;
  color: var(--v2-text-main);
}

.stats-header p {
  margin: 7px 0 0;
  color: var(--v2-text-sub);
  font-size: 13px;
}

.filter-pair {
  display: flex;
  gap: 10px;
}

.filter-pair button,
.panel-header button {
  min-height: 42px;
  padding: 0 14px;
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-md);
  background: #ffffff;
  color: #4f4a5e;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font: inherit;
  font-size: 13px;
}

.summary-panel,
.bank-grid article {
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-lg);
  background: #ffffff;
  box-shadow: 0 5px 14px rgba(28, 18, 60, 0.022);
}

.summary-panel {
  padding: 16px;
}

h2 {
  margin: 0 0 14px;
  color: var(--v2-text-main);
  font-size: 16px;
  font-weight: 520;
}

.summary-strip {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.summary-strip div {
  display: grid;
  justify-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-right: 1px solid var(--v2-border);
  text-align: center;
}

.summary-strip div:last-child {
  border-right: 0;
}

.summary-strip span,
.summary-strip small {
  color: var(--v2-text-sub);
  font-size: 12px;
}

.summary-strip strong,
.bank-grid strong {
  color: var(--v2-primary);
  font-size: 26px;
  font-weight: 560;
  line-height: 1;
}

.stats-section {
  display: grid;
  gap: 12px;
}

.bank-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.bank-grid article {
  min-height: 118px;
  padding: 16px;
  display: grid;
  align-content: space-between;
}

.bank-grid article div {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  color: var(--v2-text-main);
  font-size: 13px;
  font-weight: 520;
}

.bank-grid .q-icon {
  color: var(--v2-primary);
  padding: 8px;
  border-radius: var(--v2-radius-sm);
  background: var(--v2-primary-soft);
}

.bank-grid small {
  color: var(--v2-text-sub);
  font-size: 12px;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.panel-header h2 {
  margin: 0;
}

.trend-chart {
  width: 100%;
  height: 210px;
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
  color: var(--v2-text-sub);
  font-size: 11px;
}

.table-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
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
  min-height: 38px;
  margin-top: 12px;
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
    padding-inline: 16px;
  }

  .stats-header {
    grid-template-columns: 1fr;
  }

  .filter-pair {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }

  .summary-strip,
  .bank-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .summary-strip div {
    padding: 12px 8px;
    border-bottom: 1px solid var(--v2-border);
  }

  .summary-strip div:nth-child(2n) {
    border-right: 0;
  }

  .summary-strip div:nth-last-child(-n + 2) {
    border-bottom: 0;
  }

  .table-grid {
    grid-template-columns: 1fr;
  }
}
</style>
