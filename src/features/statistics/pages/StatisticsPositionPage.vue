<template>
  <q-page class="detail-page">
    <header class="detail-topbar">
      <h1><span class="wide-title">포지션 통계</span><span class="narrow-title">포지션</span></h1>
      <div class="filter-pair">
        <button type="button"><q-icon name="calendar_month" size="18px" />전체 기간<q-icon name="expand_more" size="18px" /></button>
        <button type="button"><q-icon name="store" size="18px" />전체 매장<q-icon name="expand_more" size="18px" /></button>
      </div>
    </header>

    <section class="detail-section">
      <div class="kpi-grid">
        <article v-for="kpi in kpis" :key="kpi.label">
          <span>{{ kpi.label }}</span>
          <strong>{{ kpi.value }}</strong>
          <small>{{ kpi.sub }}</small>
        </article>
      </div>
    </section>

    <section class="position-list">
      <div class="position-list__header">
        <span>포지션</span>
        <span>참여율</span>
        <span>승률</span>
      </div>
      <article v-for="row in rows" :key="row.position">
        <strong>{{ row.position }}</strong>
        <div>
          <span>{{ row.play }}%</span>
        </div>
        <div>
          <span>{{ row.win }}%</span>
        </div>
      </article>
    </section>
  </q-page>
</template>

<script setup>
const kpis = [
  { label: '기록 핸드', value: '3,284', sub: '핸드' },
  { label: '최고 승률 포지션', value: 'BTN', sub: '61.0%' },
  { label: '최다 참여 포지션', value: 'BTN', sub: '32.1%' },
]

const rows = [
  { position: 'UTG', play: 10.2, win: 42.0, tone: 'yellow' },
  { position: 'UTG+1', play: 11.8, win: 44.1, tone: 'yellow' },
  { position: 'MP', play: 16.4, win: 48.3, tone: 'yellow' },
  { position: 'HJ', play: 18.6, win: 52.7, tone: 'green' },
  { position: 'CO', play: 22.3, win: 56.6, tone: 'green' },
  { position: 'BTN', play: 32.1, win: 61.0, tone: 'green' },
  { position: 'SB', play: 27.5, win: 40.3, tone: 'orange' },
  { position: 'BB', play: 28.7, win: 35.6, tone: 'red' },
]
</script>

<style scoped>
@import './statistics-detail.css';

.position-list {
  overflow: hidden;
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-lg);
  background: #ffffff;
}

.narrow-title {
  display: none;
}

.position-list__header {
  min-height: 34px;
  padding: 0 16px;
  background: #faf9fc;
  color: #5f596b;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  align-items: center;
  gap: 0;
  font-size: 12px;
  font-weight: 520;
  text-align: center;
}

.position-list article {
  min-height: 58px;
  padding: 9px 16px;
  border-bottom: 1px solid var(--v2-border);
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  align-items: center;
  gap: 0;
  text-align: center;
}

.position-list article:last-child {
  border-bottom: 0;
}

.position-list strong {
  font-size: 15px;
  font-weight: 560;
}

.position-list span {
  font-size: 12px;
  color: #312d3d;
}

@media (max-width: 390px) {
  .wide-title {
    display: none;
  }

  .narrow-title {
    display: inline;
  }
}

@media (min-height: 760px) {
  .position-list article {
    min-height: 70px;
  }
}
</style>
