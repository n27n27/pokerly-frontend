<template>
  <q-page class="detail-page">
    <header class="detail-topbar">
      <button type="button" @click="router.back()"><q-icon name="chevron_left" size="30px" /></button>
      <h1>핸드 통계</h1>
      <span></span>
    </header>

    <div class="segmented">
      <button type="button" :class="{ active: mode === 'hand' }" @click="mode = 'hand'">핸드 기준</button>
      <button type="button" :class="{ active: mode === 'position' }" @click="mode = 'position'">포지션 기준</button>
    </div>

    <div class="filter-pair">
      <button type="button"><q-icon name="calendar_month" size="18px" />전체 기간<q-icon name="expand_more" size="18px" /></button>
      <button type="button"><q-icon name="store" size="18px" />전체 매장<q-icon name="expand_more" size="18px" /></button>
    </div>

    <section class="summary-panel">
      <div class="summary-strip">
        <div><span>기록 핸드</span><strong>3,284</strong><small>핸드</small></div>
        <div><span>{{ mode === 'hand' ? '가장 높은 승률 핸드' : '가장 높은 참여 포지션' }}</span><strong>{{ mode === 'hand' ? 'AK' : 'BTN' }}</strong><small>{{ mode === 'hand' ? '79.2%' : '참여율 32.1%' }}</small></div>
        <div><span>평균 승률</span><strong>48.3%</strong></div>
      </div>
    </section>

    <section class="ranking-panel">
      <h2>{{ mode === 'hand' ? '핸드 랭킹' : '포지션별 핸드 랭킹' }}</h2>
      <div v-if="mode === 'position'" class="position-tabs">
        <button v-for="position in positions" :key="position" type="button" :class="{ active: position === 'BTN' }">{{ position }}</button>
      </div>
      <div class="sort-row">
        <button type="button">참여율 <q-icon name="expand_more" size="17px" /></button>
        <button type="button">내림차순 <q-icon name="expand_more" size="17px" /></button>
      </div>
      <div class="hand-table">
        <div><span>순위</span><span>핸드</span><span>참여율</span><span>승률</span></div>
        <div v-for="row in rows" :key="row.rank">
          <span>{{ row.rank }}</span>
          <strong>{{ row.hand }}</strong>
          <span>{{ row.play }}% <i><b :style="{ width: `${row.play * 8}px` }"></b></i></span>
          <span :class="row.tone">{{ row.win }}%</span>
        </div>
      </div>
    </section>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const mode = ref('hand')
const positions = ['UTG', 'UTG+1', 'MP', 'HJ', 'CO', 'BTN', 'SB', 'BB']

const rows = [
  { rank: 1, hand: 'AK', play: 5.2, win: 79.2, tone: 'good' },
  { rank: 2, hand: 'AQ', play: 4.6, win: 66.7, tone: 'good' },
  { rank: 3, hand: 'KQ', play: 4.1, win: 62.3, tone: 'good' },
  { rank: 4, hand: 'JJ', play: 3.3, win: 68.0, tone: 'good' },
  { rank: 5, hand: 'TT', play: 3.1, win: 57.9, tone: 'warn' },
  { rank: 6, hand: '99', play: 2.8, win: 52.9, tone: 'warn' },
  { rank: 7, hand: 'AJo', play: 2.7, win: 45.1, tone: 'bad' },
  { rank: 8, hand: 'QJs', play: 2.6, win: 43.6, tone: 'bad' },
  { rank: 9, hand: 'KJs', play: 2.4, win: 41.2, tone: 'bad' },
  { rank: 10, hand: 'ATs', play: 2.3, win: 40.0, tone: 'bad' },
]
</script>

<style scoped>
@import './statistics-detail.css';

.ranking-panel {
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-lg);
  background: #ffffff;
  padding: 14px;
}

.ranking-panel h2 {
  margin: 0 0 12px;
  font-size: 16px;
  font-weight: 520;
}

.position-tabs,
.sort-row {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  margin-bottom: 10px;
}

.position-tabs button,
.sort-row button {
  flex: 0 0 auto;
  min-height: 32px;
  padding: 0 12px;
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-sm);
  background: #ffffff;
  color: #4f4a5e;
  font: inherit;
  font-size: 12px;
}

.position-tabs button.active {
  background: var(--v2-primary);
  color: #ffffff;
}

.hand-table {
  display: grid;
}

.hand-table > div {
  min-height: 42px;
  display: grid;
  grid-template-columns: 44px 1fr 1.4fr 64px;
  align-items: center;
  border-bottom: 1px solid var(--v2-border);
}

.hand-table > div:first-child {
  color: var(--v2-text-sub);
  font-size: 11px;
}

.hand-table > div:last-child {
  border-bottom: 0;
}

.hand-table span,
.hand-table strong {
  font-size: 12px;
}

.hand-table strong {
  color: var(--v2-primary);
  font-weight: 560;
}

.hand-table i {
  display: inline-block;
  width: 72px;
  height: 5px;
  margin-left: 8px;
  border-radius: 999px;
  background: #f0eef5;
  vertical-align: middle;
}

.hand-table b {
  display: block;
  max-width: 100%;
  height: 100%;
  border-radius: inherit;
  background: var(--v2-primary);
}

.good { color: var(--v2-success); }
.warn { color: #f59e0b; }
.bad { color: var(--v2-danger); }
</style>
