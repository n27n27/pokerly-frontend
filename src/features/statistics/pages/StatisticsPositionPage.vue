<template>
  <q-page class="detail-page">
    <header class="detail-topbar">
      <button type="button" @click="router.back()"><q-icon name="chevron_left" size="30px" /></button>
      <h1>포지션 통계</h1>
      <span></span>
    </header>

    <div class="filter-pair">
      <button type="button"><q-icon name="calendar_month" size="18px" />전체 기간<q-icon name="expand_more" size="18px" /></button>
      <button type="button"><q-icon name="store" size="18px" />전체 매장<q-icon name="expand_more" size="18px" /></button>
    </div>

    <section class="detail-section">
      <h2>요약</h2>
      <div class="kpi-grid">
        <article v-for="kpi in kpis" :key="kpi.label">
          <q-icon :name="kpi.icon" size="22px" />
          <span>{{ kpi.label }}</span>
          <strong>{{ kpi.value }}</strong>
          <small>{{ kpi.sub }}</small>
        </article>
      </div>
    </section>

    <section class="position-list">
      <article v-for="row in rows" :key="row.position">
        <strong>{{ row.position }}</strong>
        <div>
          <span>{{ row.play }}%</span>
          <i><b :style="{ width: `${row.play * 2.3}px` }"></b></i>
        </div>
        <div>
          <span>{{ row.win }}%</span>
          <i><b :class="row.tone" :style="{ width: `${row.win * 1.7}px` }"></b></i>
        </div>
      </article>
    </section>
  </q-page>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const kpis = [
  { label: '기록 핸드', value: '3,284', sub: '핸드', icon: 'style' },
  { label: '최고 승률 포지션', value: 'BTN', sub: '61.0%', icon: 'emoji_events' },
  { label: '가장 많이 참여한 포지션', value: 'BTN', sub: '32.1%', icon: 'track_changes' },
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

.position-list article {
  min-height: 70px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--v2-border);
  display: grid;
  grid-template-columns: 72px 1fr 1fr;
  align-items: center;
  gap: 14px;
}

.position-list article:last-child {
  border-bottom: 0;
}

.position-list strong {
  font-size: 15px;
  font-weight: 560;
}

.position-list div {
  display: grid;
  gap: 7px;
}

.position-list span {
  font-size: 12px;
  color: #312d3d;
}

.position-list i {
  width: 100%;
  height: 6px;
  border-radius: 999px;
  background: #f0eef5;
}

.position-list b {
  display: block;
  max-width: 100%;
  height: 100%;
  border-radius: inherit;
  background: var(--v2-primary);
}

.position-list b.green { background: #22c55e; }
.position-list b.yellow { background: #f8c541; }
.position-list b.orange { background: #fb923c; }
.position-list b.red { background: #ef4444; }
</style>
