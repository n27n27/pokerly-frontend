<template>
  <q-page class="detail-page">
    <header class="detail-topbar">
      <h1>핸드 통계</h1>
      <div class="filter-pair">
        <button type="button"><q-icon name="calendar_month" size="18px" />전체 기간<q-icon name="expand_more" size="18px" /></button>
        <button type="button"><q-icon name="store" size="18px" />전체 매장<q-icon name="expand_more" size="18px" /></button>
      </div>
    </header>

    <div class="segmented">
      <button type="button" :class="{ active: mode === 'hand' }" @click="mode = 'hand'">핸드 기준</button>
      <button type="button" :class="{ active: mode === 'position' }" @click="mode = 'position'">포지션 기준</button>
    </div>

    <section class="summary-panel">
      <div class="summary-strip">
        <div v-for="card in summaryCards" :key="card.label">
          <span>{{ card.label }}</span>
          <strong>{{ card.value }}</strong>
          <small>{{ card.sub }}</small>
        </div>
      </div>
    </section>

    <section class="ranking-panel">
      <div class="ranking-panel__header">
        <h2>{{ mode === 'hand' ? '핸드 랭킹' : '포지션별 핸드 랭킹' }}</h2>
        <div class="sort-row">
          <button type="button">참여율 <q-icon name="expand_more" size="17px" /></button>
          <button type="button">내림차순 <q-icon name="expand_more" size="17px" /></button>
        </div>
      </div>
      <div v-if="mode === 'position'" class="position-tabs">
        <button v-for="position in positions" :key="position" type="button" :class="{ active: position === 'BTN' }">{{ position }}</button>
      </div>
      <div class="hand-table">
        <div><span>순위</span><span>핸드</span><span>참여율</span><span>승률</span></div>
        <div v-for="row in rows" :key="row.rank">
          <span>{{ row.rank }}</span>
          <strong>{{ row.hand }}</strong>
          <span>{{ row.play }}%</span>
          <span :class="row.tone">{{ row.win }}%</span>
        </div>
      </div>
    </section>
  </q-page>
</template>

<script setup>
import { computed, ref } from 'vue'

const mode = ref('hand')
const positions = ['UTG', 'UTG+1', 'MP', 'HJ', 'CO', 'BTN', 'SB', 'BB']

const summaryCards = computed(() => {
  if (mode.value === 'position') {
    return [
      { label: '기록 핸드', value: '3,284', sub: '핸드' },
      { label: '최고 승률', value: 'BTN', sub: '61.0%' },
      { label: '최저 승률', value: 'BB', sub: '35.6%' },
    ]
  }

  return [
    { label: '기록 핸드', value: '3,284', sub: '핸드' },
    { label: '최고 승률', value: 'AK', sub: '79.2%' },
    { label: '최저 승률', value: 'ATs', sub: '40.0%' },
  ]
})

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
  min-width: 0;
  max-width: 100%;
  overflow: hidden;
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-lg);
  background: #ffffff;
  padding: 6px 20px 8px;
}

.ranking-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 2px;
}

.ranking-panel h2 {
  margin: 0;
  flex: 0 0 auto;
  font-size: 16px;
  font-weight: 520;
}

.position-tabs {
  max-width: 100%;
  display: flex;
  gap: 6px;
  overflow-x: auto;
  margin-bottom: 10px;
  overscroll-behavior-x: contain;
  scrollbar-width: none;
}

.position-tabs::-webkit-scrollbar,
.sort-row::-webkit-scrollbar {
  display: none;
}

.sort-row {
  display: flex;
  justify-content: flex-end;
  gap: 6px;
  min-width: 0;
}

.position-tabs button,
.sort-row button {
  flex: 0 0 auto;
  min-height: 30px;
  padding: 0 10px;
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
  min-width: 0;
  max-width: 100%;
}

.hand-table > div {
  min-height: 34px;
  display: grid;
  grid-template-columns: 40px repeat(3, minmax(0, 1fr));
  align-items: center;
  border-bottom: 1px solid var(--v2-border);
  column-gap: 0;
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

.hand-table > div > * {
  text-align: center;
}

.hand-table > div > *:first-child {
  text-align: left;
}

.hand-table strong {
  color: var(--v2-text-main);
  font-weight: 560;
}

.good { color: var(--v2-success); }
.warn { color: #f59e0b; }
.bad { color: var(--v2-danger); }

@media (max-width: 420px) {
  .ranking-panel {
    padding: 6px 18px 8px;
  }

  .ranking-panel__header {
    gap: 8px;
    margin-bottom: 2px;
  }

  .ranking-panel h2 {
    font-size: 15px;
  }

  .sort-row button {
    min-height: 28px;
    padding: 0 8px;
  }
}
</style>
