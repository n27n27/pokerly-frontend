<template>
  <q-page class="review-page">
    <header class="detail-topbar">
      <button type="button" aria-label="뒤로 가기" @click="router.back()">
        <q-icon name="chevron_left" size="30px" />
      </button>
      <h1>복기 핸드</h1>
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

    <div class="filter-tabs">
      <button v-for="tab in tabs" :key="tab.label" type="button" :class="{ active: tab.active }">
        {{ tab.label }} <span>{{ tab.count }}</span>
      </button>
    </div>

    <div class="filter-row">
      <button type="button">정렬 최신순 <q-icon name="expand_more" size="18px" /></button>
      <button type="button">핸드 필터 전체 <q-icon name="expand_more" size="18px" /></button>
    </div>

    <section class="review-list">
      <article
        v-for="hand in hands"
        :key="hand.id"
        class="review-item"
        :class="{ selected: hand.selected }"
      >
        <button class="check-dot" type="button" aria-label="선택">
          <q-icon v-if="hand.selected" name="check" size="14px" />
        </button>

        <button class="review-item__main" type="button" @click="openHand(hand)">
          <div class="hero-cards">
            <span v-for="card in hand.cards" :key="card.rank + card.suit" :class="{ red: card.red }">
              <b>{{ card.rank }}</b>
              <em>{{ card.suit }}</em>
            </span>
          </div>

          <div class="review-copy">
            <div>
              <strong>{{ hand.level }}</strong>
              <span>{{ hand.blinds }}</span>
            </div>
            <p>{{ hand.position }}  |  {{ hand.action }}</p>
            <small>{{ hand.board }} <b>vs {{ hand.vs }}</b> <i :class="hand.tone">{{ hand.result }}</i></small>
          </div>

          <div class="review-status">
            <span :class="hand.statusTone">{{ hand.status }}</span>
            <small>{{ hand.time }}</small>
            <q-icon name="chevron_right" size="20px" />
          </div>
        </button>
      </article>
    </section>

    <div class="bottom-actions">
      <span>선택 3개</span>
      <button type="button">
        <q-icon name="auto_awesome" size="18px" />
        AI 복기 시작
      </button>
      <button type="button">
        <q-icon name="star_border" size="18px" />
        즐겨찾기
      </button>
    </div>
  </q-page>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const metrics = [
  { label: '기록 핸드', value: '289' },
  { label: '복기 필요 핸드', value: '7', sub: '(2.4%)' },
  { label: 'AI 복기 완료', value: '3' },
  { label: '미복기', value: '4' },
]

const tabs = [
  { label: '전체', count: 7, active: true },
  { label: '미복기', count: 4 },
  { label: 'AI 완료', count: 3 },
  { label: '즐겨찾기', count: 1 },
]

const hands = [
  {
    id: 1,
    level: 'L14',
    blinds: '1,000 / 2,000 / 2,000',
    position: 'CO',
    action: '오픈 → 3벳올인',
    board: 'A K 9 2 5',
    vs: 'JJ',
    result: '승리',
    tone: 'success',
    status: 'AI 완료',
    statusTone: 'done',
    time: '07.02 22:41',
    selected: true,
    cards: [
      { rank: 'A', suit: '♠' },
      { rank: 'K', suit: '♥', red: true },
    ],
  },
  {
    id: 2,
    level: 'L11',
    blinds: '500 / 1,000 / 1,000',
    position: 'BTN',
    action: '오픈 → 3벳콜',
    board: 'Q J 4 2',
    vs: 'AQs',
    result: '패배',
    tone: 'danger',
    status: '미복기',
    statusTone: 'pending',
    time: '07.02 19:12',
    cards: [
      { rank: 'Q', suit: '♣' },
      { rank: '8', suit: '♦', red: true },
    ],
  },
  {
    id: 3,
    level: 'L8',
    blinds: '300 / 600 / 600',
    position: 'SB',
    action: '아이솔 → 콜',
    board: 'J 8 5 2 7',
    vs: '98s',
    result: '승리',
    tone: 'success',
    status: 'AI 완료',
    statusTone: 'done',
    time: '07.02 15:38',
    selected: true,
    cards: [
      { rank: 'K', suit: '♠' },
      { rank: 'J', suit: '♥', red: true },
    ],
  },
  {
    id: 4,
    level: 'L6',
    blinds: '200 / 400 / 400',
    position: 'BB',
    action: '3벳 → 올인콜',
    board: 'Q 7 3 9 K',
    vs: 'AQo',
    result: '승리',
    tone: 'success',
    status: '미복기',
    statusTone: 'pending',
    time: '07.02 14:02',
    cards: [
      { rank: '7', suit: '♥', red: true },
      { rank: '7', suit: '♣' },
    ],
  },
]

const openHand = (hand) => {
  router.push(`/app/tournament/running/level/${hand.level}/hand/${hand.id}`)
}
</script>

<style scoped>
.review-page,
.stats-page {
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
  box-sizing: border-box;
  display: grid;
  align-content: start;
  gap: 12px;
  min-height: 100%;
  padding: 18px 16px 112px;
}

.review-page *,
.review-page *::before,
.review-page *::after {
  box-sizing: border-box;
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
  font-size: 17px;
  font-weight: 520;
  text-align: center;
}

.summary-card,
.review-item,
.bottom-actions {
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

.filter-tabs,
.filter-row {
  display: grid;
  gap: 8px;
}

.filter-tabs {
  overflow: hidden;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-md);
  background: #ffffff;
}

.filter-tabs button,
.filter-row button {
  min-width: 0;
  min-height: 42px;
  border: 0;
  background: #ffffff;
  color: #4f4a5e;
  font: inherit;
  font-size: 12px;
  font-weight: 520;
}

.filter-tabs button {
  border-right: 1px solid var(--v2-border);
}

.filter-tabs button:last-child {
  border-right: 0;
}

.filter-tabs button.active {
  background: var(--v2-primary);
  color: #ffffff;
}

.filter-row {
  grid-template-columns: 1fr 1fr;
}

.filter-row button {
  padding: 0 12px;
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-md);
  display: flex;
  align-items: center;
  justify-content: space-between;
  text-align: left;
}

.review-list {
  display: grid;
  gap: 10px;
}

.review-item {
  display: grid;
  grid-template-columns: 24px minmax(0, 1fr);
  align-items: center;
  gap: 8px;
  padding: 10px 9px;
}

.review-item.selected {
  border-color: rgba(109, 69, 232, 0.55);
}

.check-dot {
  width: 19px;
  height: 19px;
  padding: 0;
  border: 1px solid #cac6d5;
  border-radius: 50%;
  background: #ffffff;
  color: #ffffff;
}

.review-item.selected .check-dot {
  border-color: var(--v2-primary);
  background: var(--v2-primary);
}

.review-item__main {
  min-width: 0;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--v2-text-main);
  display: grid;
  grid-template-columns: 50px minmax(0, 1fr) auto;
  align-items: center;
  gap: 10px;
  font: inherit;
  text-align: left;
}

.hero-cards {
  display: flex;
  gap: 4px;
}

.hero-cards span {
  width: 22px;
  height: 32px;
  display: grid;
  place-items: center;
  align-content: center;
  gap: 1px;
  color: var(--v2-text-main);
}

.hero-cards .red {
  color: #e11d48;
}

.hero-cards b {
  font-size: 15px;
  font-weight: 560;
  line-height: 1;
}

.hero-cards em {
  font-size: 12px;
  font-style: normal;
}

.review-copy {
  min-width: 0;
  display: grid;
  gap: 5px;
}

.review-copy div {
  display: flex;
  gap: 10px;
  align-items: center;
}

.review-copy strong,
.review-copy span {
  color: var(--v2-text-main);
  font-size: 12px;
  font-weight: 560;
}

.review-copy p,
.review-copy small {
  overflow: hidden;
  margin: 0;
  color: #5f596b;
  font-size: 11px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.review-copy i {
  margin-left: 6px;
  font-style: normal;
  font-weight: 520;
}

.success {
  color: var(--v2-success);
}

.danger {
  color: var(--v2-danger);
}

.review-status {
  display: grid;
  justify-items: end;
  gap: 5px;
  color: var(--v2-text-sub);
}

.review-status span {
  padding: 4px 7px;
  border-radius: var(--v2-radius-sm);
  font-size: 11px;
  font-weight: 520;
}

.review-status .done {
  background: var(--v2-primary-soft);
  color: var(--v2-primary);
}

.review-status .pending {
  background: #fff6ed;
  color: #c35a11;
}

.review-status small {
  font-size: 10px;
}

.bottom-actions {
  position: sticky;
  bottom: 84px;
  z-index: 2;
  min-height: 60px;
  padding: 9px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto auto;
  align-items: center;
  gap: 8px;
}

.bottom-actions span {
  color: var(--v2-primary);
  font-size: 12px;
  font-weight: 520;
}

.bottom-actions button {
  min-height: 38px;
  padding: 0 12px;
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-sm);
  background: #ffffff;
  color: var(--v2-primary);
  display: inline-flex;
  align-items: center;
  gap: 5px;
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

  .review-item__main {
    grid-template-columns: 46px minmax(0, 1fr);
  }

  .review-status {
    grid-column: 1 / -1;
    grid-template-columns: auto auto 20px;
    justify-items: start;
    align-items: center;
  }
}
</style>
