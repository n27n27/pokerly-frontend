<template>
  <q-page class="stats-page">
    <header class="detail-topbar">
      <button type="button" aria-label="뒤로 가기" @click="router.back()">
        <q-icon name="chevron_left" size="30px" />
      </button>
      <h1>{{ config.title }}</h1>
      <button type="button" aria-label="필터">
        <q-icon name="filter_alt" size="22px" />
      </button>
    </header>

    <section class="summary-card">
      <div class="summary-card__title">
        <div>
          <strong>프라임 0702</strong>
          <span>2025.07.02 (수) 13:00  |  엔트리 289명</span>
        </div>
        <em>완료</em>
      </div>
      <div class="summary-metrics">
        <div v-for="metric in metrics" :key="metric.label">
          <span>{{ metric.label }}</span>
          <strong>{{ metric.value }}</strong>
          <small v-if="metric.sub">{{ metric.sub }}</small>
        </div>
      </div>
    </section>

    <div class="stage-tabs">
      <button v-for="tab in stageTabs" :key="tab" type="button" :class="{ active: tab === '전체' }">{{ tab }}</button>
    </div>

    <section class="stats-panel">
      <div class="panel-header">
        <h2>{{ config.chartTitle }}</h2>
        <button type="button">{{ config.unit }} <q-icon name="expand_more" size="18px" /></button>
      </div>

      <div v-if="statType === 'position'" class="bar-chart">
        <div v-for="item in config.chart" :key="item.label">
          <span>{{ item.label }}</span>
          <i :class="{ negative: item.value < 0 }" :style="{ height: `${Math.abs(item.value) * 5 + 12}px` }"></i>
        </div>
      </div>

      <div v-else class="donut-summary">
        <div class="donut" :class="`donut--${statType}`">
          <strong>{{ config.total }}</strong>
          <span>{{ config.centerLabel }}</span>
        </div>
        <ul>
          <li v-for="item in config.chart" :key="item.label">
            <i :style="{ backgroundColor: item.color }"></i>
            <span>{{ item.label }}</span>
            <strong>{{ item.rate }}</strong>
            <small>{{ item.count }}</small>
          </li>
        </ul>
      </div>
    </section>

    <section class="stats-panel">
      <h2>핵심 지표</h2>
      <div class="kpi-row">
        <div v-for="kpi in config.kpis" :key="kpi.label">
          <span>{{ kpi.label }}</span>
          <strong>{{ kpi.value }}</strong>
          <small>{{ kpi.sub }}</small>
        </div>
      </div>
    </section>

    <section class="stats-panel">
      <h2>{{ config.tableTitle }}</h2>
      <div class="stats-table">
        <div class="stats-table__head">
          <span v-for="head in config.headers" :key="head">{{ head }}</span>
        </div>
        <div v-for="row in config.rows" :key="row[0]">
          <span v-for="(cell, index) in row" :key="`${row[0]}-${index}`" :class="{ positive: `${cell}`.startsWith('+'), negative: `${cell}`.startsWith('-') }">
            {{ cell }}
          </span>
        </div>
      </div>
    </section>

    <section class="stats-panel">
      <h2>{{ config.highlightTitle }}</h2>
      <div class="highlight-grid">
        <article v-for="item in config.highlights" :key="item.title" :class="item.tone">
          <span>{{ item.label }}</span>
          <strong>{{ item.title }}</strong>
          <b>{{ item.value }}</b>
          <p>{{ item.caption }}</p>
        </article>
      </div>
    </section>

    <section class="insight-card">
      <q-icon name="auto_awesome" size="22px" />
      <div>
        <strong>{{ config.aiTitle }}</strong>
        <span>{{ config.aiCaption }}</span>
      </div>
      <button type="button">AI 분석 보기</button>
    </section>
  </q-page>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const statType = computed(() => route.params.statType || 'action')

const metrics = [
  { label: '기록 핸드', value: '289' },
  { label: '복기 필요 핸드', value: '7', sub: '(2.4%)' },
  { label: 'AI 복기 완료', value: '3' },
  { label: '미복기', value: '4' },
]

const stageTabs = ['전체', '프리플랍', '플랍', '턴', '리버']

const configs = {
  action: {
    title: 'Action Statistics',
    chartTitle: '액션 요약',
    unit: '전체 비율',
    total: '1,342',
    centerLabel: '총 액션',
    tableTitle: '상세 통계',
    highlightTitle: '액션 분포',
    aiTitle: 'AI 인사이트',
    aiCaption: '베팅 성공률이 전체 평균 대비 높습니다.',
    headers: ['액션', '시도', '성공', '성공률', 'EV BB/100'],
    chart: [
      { label: '폴드', rate: '42.1%', count: '565', color: '#5b3df5' },
      { label: '체크 / 콜', rate: '28.7%', count: '385', color: '#8b74f6' },
      { label: '베팅', rate: '16.5%', count: '221', color: '#24c8b8' },
      { label: '레이즈', rate: '8.8%', count: '118', color: '#f8c541' },
      { label: '올인', rate: '3.9%', count: '53', color: '#ef4444' },
    ],
    kpis: [
      { label: 'VPIP', value: '23%', sub: '(67 / 289)' },
      { label: 'PFR', value: '17%', sub: '(49 / 289)' },
      { label: '3Bet', value: '8%', sub: '(23 / 289)' },
      { label: 'C-Bet', value: '65%', sub: '(85 / 131)' },
    ],
    rows: [
      ['폴드', '565', '-', '-', '+1.2'],
      ['체크 / 콜', '385', '194', '50.4%', '+3.8'],
      ['베팅', '221', '118', '53.4%', '+7.6'],
      ['레이즈', '118', '72', '61.0%', '+11.3'],
      ['3Bet', '23', '12', '52.2%', '+9.2'],
      ['올인', '53', '27', '50.9%', '+18.7'],
    ],
    highlights: [
      { label: '최고 빈도 액션', title: '폴드', value: '42.1%', caption: '불필요한 참여를 줄인 구간이 많습니다.', tone: 'positive' },
      { label: '고수익 액션', title: '올인', value: '+18.7 BB/100', caption: '강한 핸드에서 효율이 높았습니다.', tone: 'positive' },
    ],
  },
  position: {
    title: 'Position Statistics',
    chartTitle: '포지션별 수익 (BB/100)',
    unit: 'BB/100',
    total: '289',
    centerLabel: '핸드',
    tableTitle: '포지션 요약',
    highlightTitle: '포지션별 핵심 인사이트',
    aiTitle: 'AI 포지션 분석',
    aiCaption: 'BTN과 CO에서 높은 수익성을 보였습니다.',
    headers: ['포지션', '핸드', 'VPIP', 'PFR', 'BB/100'],
    chart: [
      { label: 'UTG', value: -6 },
      { label: 'UTG+1', value: -8 },
      { label: 'MP', value: -5 },
      { label: 'HJ', value: 2 },
      { label: 'CO', value: 7 },
      { label: 'BTN', value: 12 },
      { label: 'SB', value: -7 },
      { label: 'BB', value: -15 },
    ],
    kpis: [
      { label: '최고', value: 'BTN', sub: '+12.4 BB/100' },
      { label: '기회', value: 'CO', sub: '+6.7 BB/100' },
      { label: '주의', value: 'UTG', sub: '-12.1 BB/100' },
      { label: '개선', value: 'BB', sub: '-14.6 BB/100' },
    ],
    rows: [
      ['UTG', '32', '9%', '6%', '-12.1'],
      ['UTG+1', '38', '11%', '8%', '-6.8'],
      ['MP', '41', '13%', '10%', '-2.3'],
      ['HJ', '40', '16%', '12%', '+1.8'],
      ['CO', '48', '21%', '16%', '+6.7'],
      ['BTN', '52', '28%', '20%', '+12.4'],
      ['BB', '10', '18%', '7%', '-14.6'],
    ],
    highlights: [
      { label: '최고 성과 포지션', title: 'BTN', value: '+12.4 BB/100', caption: '오픈과 C-Bet 성공률이 좋습니다.', tone: 'positive' },
      { label: '개선 필요 포지션', title: 'BB', value: '-14.6 BB/100', caption: '방어 핸드와 콜 범위를 점검하세요.', tone: 'negative' },
      { label: '기회 포지션', title: 'CO', value: '+6.7 BB/100', caption: '오픈 빈도 유지가 좋습니다.', tone: 'positive' },
      { label: '주의 포지션', title: 'UTG', value: '-12.1 BB/100', caption: '초반 포지션 손실이 큽니다.', tone: 'negative' },
    ],
  },
  'hand-groups': {
    title: 'Hand Group Statistics',
    chartTitle: '핸드 그룹 요약',
    unit: '전체 핸드 기준',
    total: '289',
    centerLabel: '총 핸드',
    tableTitle: '상세 통계 테이블',
    highlightTitle: '성과 하이라이트',
    aiTitle: 'AI 핸드 그룹 분석',
    aiCaption: '핸드 그룹별 누수를 분석하고 맞춤 개선 포인트를 제공합니다.',
    headers: ['핸드 그룹', '핸드 수', 'VPIP', 'PFR', 'BB/100'],
    chart: [
      { label: '프리미엄 페어', rate: '12.8%', count: '37', color: '#5b3df5' },
      { label: '미디엄 페어', rate: '18.3%', count: '53', color: '#8b74f6' },
      { label: '스몰 페어', rate: '10.4%', count: '30', color: '#24c8b8' },
      { label: '탑 카드', rate: '24.6%', count: '71', color: '#4ed8c7' },
      { label: '오버카드', rate: '15.2%', count: '44', color: '#f8c541' },
      { label: '드로우', rate: '9.3%', count: '27', color: '#ef4444' },
    ],
    kpis: [
      { label: 'VPIP', value: '23%', sub: '(67 / 289)' },
      { label: 'PFR', value: '17%', sub: '(49 / 289)' },
      { label: '3Bet', value: '8%', sub: '(23 / 289)' },
      { label: 'C-Bet', value: '65%', sub: '(85 / 131)' },
      { label: 'WTSD', value: '28%', sub: '(25 / 89)' },
    ],
    rows: [
      ['프리미엄 페어', '37', '34%', '28%', '+48.7'],
      ['미디엄 페어', '53', '29%', '20%', '+22.1'],
      ['스몰 페어', '30', '21%', '12%', '-3.2'],
      ['탑 카드', '71', '26%', '18%', '+15.4'],
      ['오버카드', '44', '22%', '14%', '-8.6'],
      ['드로우', '27', '25%', '16%', '+7.8'],
    ],
    highlights: [
      { label: '최고 성과 핸드 그룹', title: '프리미엄 페어', value: '+48.7 BB/100', caption: '강한 핸드에서 높은 승률을 기록했습니다.', tone: 'positive' },
      { label: '개선 필요 핸드 그룹', title: '기타', value: '-18.9 BB/100', caption: '약한 핸드 참여가 손실을 만들었습니다.', tone: 'negative' },
      { label: '참여 빈도 상위', title: '탑 카드', value: '71핸드', caption: '가장 많이 참여한 핸드 그룹입니다.', tone: 'positive' },
      { label: '수익 하위', title: '스몰 페어', value: '-3.2 BB/100', caption: '셋마이닝 조건을 점검하세요.', tone: 'negative' },
    ],
  },
}

const config = computed(() => configs[statType.value] || configs.action)
</script>

<style scoped>
.stats-page,
.stats-page *,
.stats-page *::before,
.stats-page *::after {
  box-sizing: border-box;
}

.stats-page {
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
  display: grid;
  align-content: start;
  gap: 12px;
  min-height: 100%;
  padding: 18px 16px 112px;
}

.detail-topbar {
  display: grid;
  grid-template-columns: 40px minmax(0, 1fr) 40px;
  align-items: center;
  min-height: 40px;
}

.detail-topbar button {
  width: 38px;
  height: 38px;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--v2-text-main);
}

.detail-topbar h1 {
  margin: 0;
  color: var(--v2-text-main);
  font-size: 16px;
  font-weight: 520;
  text-align: center;
}

.summary-card,
.stats-panel,
.insight-card {
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-lg);
  background: #ffffff;
  box-shadow: 0 5px 14px rgba(28, 18, 60, 0.022);
}

.summary-card {
  overflow: hidden;
}

.summary-card__title {
  padding: 13px 14px;
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.summary-card__title div {
  display: grid;
  gap: 5px;
  min-width: 0;
}

.summary-card__title strong {
  color: var(--v2-text-main);
  font-size: 18px;
  font-weight: 560;
}

.summary-card__title span {
  color: var(--v2-text-sub);
  font-size: 12px;
}

.summary-card__title em {
  align-self: start;
  padding: 4px 8px;
  border-radius: var(--v2-radius-sm);
  background: var(--v2-primary-soft);
  color: var(--v2-primary);
  font-size: 11px;
  font-style: normal;
  font-weight: 520;
}

.summary-metrics {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  border-top: 1px solid var(--v2-border);
}

.summary-metrics div {
  min-height: 72px;
  padding: 10px 4px;
  border-right: 1px solid var(--v2-border);
  display: grid;
  place-items: center;
  align-content: center;
  gap: 4px;
  text-align: center;
}

.summary-metrics div:last-child {
  border-right: 0;
}

.summary-metrics span,
.summary-metrics small {
  color: var(--v2-text-sub);
  font-size: 10px;
}

.summary-metrics strong {
  color: var(--v2-text-main);
  font-size: 21px;
  font-weight: 560;
  line-height: 1;
}

.stats-panel {
  display: grid;
  gap: 12px;
  padding: 13px;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.stats-panel h2,
.panel-header h2 {
  margin: 0;
  color: var(--v2-text-main);
  font-size: 15px;
  font-weight: 520;
}

.panel-header button {
  min-height: 30px;
  border: 0;
  background: transparent;
  color: #5f596b;
  display: flex;
  align-items: center;
  gap: 3px;
  font: inherit;
  font-size: 12px;
}

.stage-tabs {
  overflow: hidden;
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-md);
  background: #ffffff;
}

.stage-tabs button {
  min-height: 40px;
  border: 0;
  border-right: 1px solid var(--v2-border);
  background: #ffffff;
  color: #4f4a5e;
  font: inherit;
  font-size: 12px;
  font-weight: 520;
}

.stage-tabs button:last-child {
  border-right: 0;
}

.stage-tabs button.active {
  background: var(--v2-primary);
  color: #ffffff;
}

.donut-summary {
  display: grid;
  grid-template-columns: 132px minmax(0, 1fr);
  align-items: center;
  gap: 12px;
}

.donut {
  width: 112px;
  height: 112px;
  border-radius: 50%;
  background: conic-gradient(#5b3df5 0 42%, #8b74f6 42% 70%, #24c8b8 70% 86%, #f8c541 86% 95%, #ef4444 95% 100%);
  display: grid;
  place-items: center;
  position: relative;
}

.donut::after {
  content: '';
  position: absolute;
  inset: 28px;
  border-radius: 50%;
  background: #ffffff;
}

.donut strong,
.donut span {
  position: relative;
  z-index: 1;
}

.donut strong {
  margin-top: 12px;
  color: var(--v2-text-main);
  font-size: 20px;
  font-weight: 560;
}

.donut span {
  margin-top: -30px;
  color: var(--v2-text-sub);
  font-size: 11px;
}

.donut-summary ul {
  display: grid;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.donut-summary li {
  display: grid;
  grid-template-columns: 9px minmax(0, 1fr) auto auto;
  align-items: center;
  gap: 8px;
  color: #4f4a5e;
  font-size: 12px;
}

.donut-summary i {
  width: 9px;
  height: 9px;
  border-radius: 50%;
}

.donut-summary strong {
  font-weight: 520;
}

.donut-summary small {
  color: var(--v2-text-sub);
}

.bar-chart {
  height: 190px;
  padding: 18px 4px 0;
  border-top: 1px solid var(--v2-border);
  display: grid;
  grid-template-columns: repeat(8, minmax(0, 1fr));
  align-items: end;
  gap: 8px;
}

.bar-chart div {
  display: grid;
  justify-items: center;
  gap: 7px;
}

.bar-chart i {
  width: 18px;
  min-height: 12px;
  border-radius: 5px 5px 0 0;
  background: #22c55e;
}

.bar-chart i.negative {
  background: #ef4444;
}

.bar-chart span {
  color: #5f596b;
  font-size: 10px;
}

.kpi-row {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 8px;
}

.kpi-row div {
  min-height: 66px;
  padding: 9px 4px;
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-sm);
  display: grid;
  place-items: center;
  align-content: center;
  gap: 4px;
  text-align: center;
}

.kpi-row span,
.kpi-row small {
  color: var(--v2-text-sub);
  font-size: 10px;
}

.kpi-row strong {
  color: var(--v2-text-main);
  font-size: 16px;
  font-weight: 560;
}

.stats-table {
  overflow-x: auto;
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-md);
}

.stats-table__head,
.stats-table > div:not(.stats-table__head) {
  min-width: 430px;
  display: grid;
  grid-template-columns: 1.35fr repeat(4, 1fr);
}

.stats-table span {
  min-height: 34px;
  padding: 9px 8px;
  border-right: 1px solid var(--v2-border);
  border-bottom: 1px solid var(--v2-border);
  color: #4f4a5e;
  font-size: 11px;
}

.stats-table span:last-child {
  border-right: 0;
}

.stats-table > div:last-child span {
  border-bottom: 0;
}

.stats-table__head span {
  background: #faf9fc;
  color: #5f596b;
  font-weight: 520;
}

.positive {
  color: var(--v2-success) !important;
}

.negative {
  color: var(--v2-danger) !important;
}

.highlight-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 9px;
}

.highlight-grid article {
  min-width: 0;
  min-height: 116px;
  padding: 12px;
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-md);
  display: grid;
  align-content: start;
  gap: 6px;
}

.highlight-grid article.positive {
  border-color: rgba(22, 163, 74, 0.25);
}

.highlight-grid article.negative {
  border-color: rgba(239, 68, 68, 0.25);
}

.highlight-grid span {
  color: #5f596b;
  font-size: 11px;
}

.highlight-grid strong {
  color: var(--v2-success);
  font-size: 15px;
  font-weight: 560;
}

.highlight-grid .negative strong {
  color: var(--v2-danger);
}

.highlight-grid b {
  color: inherit;
  font-size: 16px;
  font-weight: 560;
}

.highlight-grid p {
  margin: 0;
  color: #5f596b;
  font-size: 11px;
  line-height: 1.45;
}

.insight-card {
  padding: 12px;
  display: grid;
  grid-template-columns: 26px minmax(0, 1fr) auto;
  align-items: center;
  gap: 9px;
  background: #faf8ff;
}

.insight-card .q-icon,
.insight-card strong {
  color: var(--v2-primary);
}

.insight-card div {
  display: grid;
  gap: 4px;
}

.insight-card strong {
  font-size: 13px;
  font-weight: 560;
}

.insight-card span {
  color: #655f73;
  font-size: 11px;
}

.insight-card button {
  min-height: 34px;
  padding: 0 12px;
  border: 1px solid rgba(109, 69, 232, 0.35);
  border-radius: var(--v2-radius-sm);
  background: #ffffff;
  color: var(--v2-primary);
  font: inherit;
  font-size: 12px;
  font-weight: 520;
}

@media (max-width: 380px) {
  .summary-metrics {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .summary-metrics div:nth-child(2n) {
    border-right: 0;
  }

  .summary-metrics div:nth-child(-n + 2) {
    border-bottom: 1px solid var(--v2-border);
  }

  .donut-summary {
    grid-template-columns: 94px minmax(0, 1fr);
  }

  .donut {
    width: 88px;
    height: 88px;
  }

  .donut::after {
    inset: 22px;
  }

  .kpi-row {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .highlight-grid {
    grid-template-columns: 1fr;
  }

  .insight-card {
    grid-template-columns: 24px minmax(0, 1fr);
  }

  .insight-card button {
    grid-column: 2 / 3;
    justify-self: start;
  }
}
</style>
