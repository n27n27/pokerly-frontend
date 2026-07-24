<template>
  <q-page class="preflop-page">
    <header class="detail-topbar">
      <button type="button" aria-label="뒤로 가기" @click="router.back()">
        <q-icon name="chevron_left" size="28px" />
      </button>
      <h1>프리플랍 분석</h1>
      <span aria-hidden="true"></span>
    </header>

    <section class="kpi-grid" aria-label="핵심 지표">
      <div v-for="metric in metrics" :key="metric.label">
        <span>{{ metric.label }}</span>
        <strong>{{ metric.value }}</strong>
      </div>
    </section>

    <section class="stats-section">
      <h2>프리플랍 액션 분포</h2>
      <div class="action-card">
        <div v-for="item in actions" :key="item.label" class="action-row">
          <span>{{ item.label }}</span>
          <i><b :style="{ width: item.rate }"></b></i>
          <strong>{{ item.rate }}</strong>
          <small>{{ item.count }}회</small>
        </div>
      </div>
    </section>

    <section class="stats-section">
      <h2>포지션별 참여율</h2>
      <div class="data-table position-table">
        <div class="table-head">
          <span>포지션</span><span>VPIP</span><span>PFR</span><span>3Bet</span>
        </div>
        <div v-for="row in positions" :key="row.position">
          <strong>{{ row.position }}</strong><span>{{ row.vpip }}</span><span>{{ row.pfr }}</span><span>{{ row.threeBet }}</span>
        </div>
      </div>
    </section>

    <section class="stats-section">
      <h2>핸드 순위 분포</h2>
      <div class="data-table rank-table">
        <div class="table-head"><span>구간</span><span>비율</span><span>핸드 수</span></div>
        <div v-for="row in ranks" :key="row.label">
          <strong>{{ row.label }}</strong><span>{{ row.rate }}</span><span>{{ row.count }}개</span>
        </div>
      </div>
    </section>
  </q-page>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const metrics = [
  { label: 'VPIP', value: '23%' },
  { label: 'PFR', value: '17%' },
  { label: '3Bet', value: '8%' },
  { label: '참여 핸드 수', value: '29' },
]

const actions = [
  { label: '폴드', rate: '45%', count: 56 },
  { label: '콜', rate: '19%', count: 24 },
  { label: '오픈', rate: '28%', count: 35 },
  { label: '3Bet+', rate: '8%', count: 10 },
]

const positions = [
  { position: 'UTG', vpip: '14%', pfr: '10%', threeBet: '3%' },
  { position: 'MP', vpip: '16%', pfr: '12%', threeBet: '4%' },
  { position: 'HJ', vpip: '18%', pfr: '14%', threeBet: '5%' },
  { position: 'CO', vpip: '26%', pfr: '21%', threeBet: '9%' },
  { position: 'BTN', vpip: '31%', pfr: '25%', threeBet: '11%' },
  { position: 'SB', vpip: '24%', pfr: '18%', threeBet: '7%' },
  { position: 'BB', vpip: '17%', pfr: '8%', threeBet: '5%' },
]

const ranks = [
  { label: 'Top 10%', rate: '12%', count: 15 },
  { label: 'Top 20%', rate: '18%', count: 23 },
  { label: 'Top 30%', rate: '23%', count: 29 },
  { label: '기타', rate: '47%', count: 58 },
]
</script>

<style scoped>
.preflop-page,
.preflop-page *,
.preflop-page *::before,
.preflop-page *::after {
  box-sizing: border-box;
}

.preflop-page {
  display: flex;
  min-height: 100%;
  flex-direction: column;
  padding: 0 var(--v2-page-padding-x) 112px;
}

.detail-topbar {
  display: grid;
  width: 100%;
  height: 36px;
  min-height: 36px;
  max-height: 36px;
  flex: 0 0 36px;
  grid-template-columns: 40px minmax(0, 1fr) 40px;
  align-items: center;
  gap: 10px;
}

.detail-topbar button {
  display: grid;
  width: 36px;
  height: 36px;
  place-items: center;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--v2-text-main);
}

.detail-topbar h1 {
  margin: 0;
  font-size: 17px;
  font-weight: 560;
  text-align: center;
}

.kpi-grid {
  display: grid;
  overflow: hidden;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  margin-top: 36px;
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-lg);
  background: #fff;
}

.kpi-grid div {
  display: grid;
  min-height: 76px;
  place-items: center;
  align-content: center;
  gap: 8px;
  padding: 10px 4px;
  border-right: 1px solid var(--v2-border);
  text-align: center;
}

.kpi-grid div:last-child {
  border-right: 0;
}

.kpi-grid span {
  color: var(--v2-text-sub);
  font-size: 11px;
  line-height: 1.2;
}

.kpi-grid strong {
  color: var(--v2-primary);
  font-size: 20px;
  font-weight: 600;
}

.stats-section {
  display: grid;
  gap: 9px;
  margin-top: 20px;
}

.stats-section h2 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.action-card,
.data-table {
  overflow: hidden;
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-lg);
  background: #fff;
  box-shadow: 0 5px 14px rgba(28, 18, 60, 0.025);
}

.action-card {
  display: grid;
  gap: 14px;
  padding: 16px 14px;
}

.action-row {
  display: grid;
  grid-template-columns: 42px minmax(80px, 1fr) 38px 38px;
  align-items: center;
  gap: 9px;
}

.action-row > span,
.action-row strong,
.action-row small {
  font-size: 12px;
}

.action-row > span {
  font-weight: 540;
}

.action-row > i {
  height: 8px;
  overflow: hidden;
  border-radius: 999px;
  background: #efedf5;
}

.action-row > i b {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #8c6ff0, var(--v2-primary));
}

.action-row strong,
.action-row small {
  text-align: right;
}

.action-row small {
  color: var(--v2-text-sub);
}

.data-table > div {
  display: grid;
  min-height: 43px;
  align-items: center;
  padding: 0 14px;
  border-bottom: 1px solid var(--v2-border);
  font-size: 12px;
}

.data-table > div:last-child {
  border-bottom: 0;
}

.data-table .table-head {
  min-height: 39px;
  background: #faf9fd;
  color: var(--v2-text-sub);
  font-size: 11px;
}

.position-table > div {
  grid-template-columns: minmax(58px, 1fr) repeat(3, minmax(48px, .75fr));
}

.rank-table > div {
  grid-template-columns: minmax(90px, 1.3fr) repeat(2, minmax(60px, 1fr));
}

.data-table span:not(:first-child) {
  text-align: right;
}

.data-table strong {
  font-weight: 560;
}

@media (max-width: 390px) {
  .kpi-grid span {
    font-size: 10px;
  }

  .kpi-grid strong {
    font-size: 18px;
  }
}
</style>
