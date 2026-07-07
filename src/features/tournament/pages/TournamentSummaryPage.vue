<template>
  <q-page class="tournament-summary-page">
    <header class="summary-topbar">
      <button class="icon-button" type="button" aria-label="뒤로 가기" @click="router.back()">
        <q-icon name="chevron_left" size="30px" />
      </button>
      <h1>대회 요약</h1>
      <button class="icon-button" type="button" aria-label="더보기">
        <q-icon name="more_vert" size="22px" />
      </button>
    </header>

    <section class="tournament-card">
      <div class="tournament-card__header">
        <div>
          <strong>{{ tournament.name }}</strong>
          <span>2025.07.02 (수) 13:00</span>
          <span>앤틀리 289명</span>
        </div>
        <div class="tournament-card__side">
          <span>완료</span>
          <button type="button">요약 공유</button>
        </div>
      </div>

      <div class="metric-grid">
        <div v-for="metric in metrics" :key="metric.label">
          <q-icon :name="metric.icon" size="21px" />
          <span>{{ metric.label }}</span>
          <strong>{{ metric.value }}</strong>
          <small v-if="metric.sub" :class="metric.tone">{{ metric.sub }}</small>
        </div>
      </div>
    </section>

    <section class="review-card">
      <div>
        <q-icon name="auto_awesome" size="24px" />
        <span>
          <strong>대회 복기</strong>
          <small>핵심 핸드를 빠르게 확인해보세요.</small>
        </span>
      </div>
      <button type="button" @click="goReviewHands">복기 시작</button>
    </section>

    <section class="summary-section">
      <div class="section-header">
        <h2>복기 필요 핸드 <span>(최근 4개)</span></h2>
        <button type="button" @click="goReviewHands">모두 보기 ›</button>
      </div>

      <div class="review-hand-strip">
        <button
          v-for="hand in reviewHands"
          :key="hand.id"
          class="review-hand-card"
          type="button"
          @click="openHand(hand)"
        >
          <div class="review-hand-card__cards">
            <span v-for="card in hand.cards" :key="card.rank + card.suit" :class="{ red: card.red }">
              <b>{{ card.rank }}</b>
              <em>{{ card.suit }}</em>
            </span>
          </div>
          <strong>{{ hand.name }} · {{ hand.position }}</strong>
          <small :class="hand.tone">{{ hand.result }}</small>
          <span>{{ hand.level }}</span>
        </button>
      </div>
    </section>

    <section class="summary-panel">
      <button class="panel-title" type="button">
        <span>레벨 요약</span>
        <q-icon name="expand_less" size="20px" />
      </button>
      <div class="level-table">
        <article
          v-for="level in levels"
          :key="level.name"
          class="level-row"
          :class="{ 'level-row--expanded': expandedLevel === level.name }"
        >
          <button class="level-row__summary" type="button" @click="toggleLevel(level.name)">
            <span class="level-table__level">{{ level.name }}</span>
            <span class="level-table__blinds">{{ level.blinds }}</span>
            <span class="level-table__meta">{{ level.hands }}핸드</span>
            <span class="level-table__meta">복기 {{ level.review }}</span>
            <q-icon :name="expandedLevel === level.name ? 'expand_less' : 'expand_more'" size="20px" />
          </button>

          <div v-if="expandedLevel === level.name" class="level-expanded">
            <div class="level-kpi-grid">
              <div v-for="kpi in expandedStats" :key="kpi.label">
                <span>{{ kpi.label }}</span>
                <strong>{{ kpi.value }}</strong>
                <small v-if="kpi.sub">{{ kpi.sub }}</small>
              </div>
            </div>

            <section class="level-detail-block">
              <div class="section-header">
                <h3>액션 요약</h3>
                <button type="button" @click="goStats('action')">더보기 ›</button>
              </div>
              <div class="level-action-grid">
                <div v-for="action in levelActions" :key="action.label">
                  <span>{{ action.label }}</span>
                  <strong>{{ action.count }}</strong>
                  <small>{{ action.rate }}</small>
                </div>
              </div>
            </section>

            <section class="level-detail-block">
              <div class="section-header">
                <h3>주요 핸드 (3)</h3>
                <button type="button" @click="goReviewHands">모두 보기 ›</button>
              </div>
              <div class="level-hand-list">
                <button v-for="hand in levelHands" :key="hand.id" type="button" @click="openHand(hand)">
                  <span class="level-hand-cards">
                    <i v-for="card in hand.cards" :key="card.rank + card.suit" :class="{ red: card.red }">
                      <b>{{ card.rank }}</b>
                      <em>{{ card.suit }}</em>
                    </i>
                  </span>
                  <strong>{{ hand.position }}</strong>
                  <span>{{ hand.action }}</span>
                  <small :class="hand.tone">{{ hand.result }}</small>
                  <q-icon name="chevron_right" size="20px" />
                </button>
              </div>
            </section>

            <section class="level-review-banner">
              <q-icon name="auto_awesome" size="22px" />
              <div>
                <strong>L3 구간을 복기해보세요</strong>
                <span>이 레벨의 주요 흐름과 개선 포인트를 확인할 수 있어요.</span>
              </div>
              <button type="button" @click="goReviewHands">복기 시작</button>
            </section>
          </div>
        </article>
      </div>
      <button class="level-more" type="button">전체 레벨 보기 (10)</button>
    </section>

    <section class="summary-section">
      <h2>이번 대회 통계 허브</h2>
      <div class="hub-grid">
        <button v-for="hub in hubs" :key="hub.label" type="button" @click="goStats(hub.to)">
          <q-icon :name="hub.icon" size="24px" />
          <strong>{{ hub.label }}</strong>
          <span>{{ hub.caption }}</span>
        </button>
      </div>
    </section>

    <section class="summary-panel">
      <div class="section-header">
        <h2>액션 요약 <span>(이번 대회)</span></h2>
      </div>
      <div class="action-summary">
        <div class="donut" aria-hidden="true">
          <span>812</span>
          <small>액션</small>
        </div>
        <ul>
          <li v-for="action in actions" :key="action.name">
            <i :style="{ backgroundColor: action.color }"></i>
            <span>{{ action.name }}</span>
            <strong>{{ action.count }} ({{ action.rate }})</strong>
          </li>
        </ul>
      </div>
    </section>

    <section class="summary-panel compact-panel">
      <div class="section-header">
        <h2>포지션 요약 <span>(핸드 수 기준)</span></h2>
        <button type="button" @click="goStats('position')">상세 보기 ›</button>
      </div>
      <div class="mini-stat-grid">
        <span v-for="position in positions" :key="position.label">
          <strong>{{ position.label }}</strong>
          <small>{{ position.value }}</small>
        </span>
      </div>
    </section>

    <section class="summary-panel compact-panel">
      <div class="section-header">
        <h2>핸드 그룹 요약 <span>(핸드 수 기준)</span></h2>
        <button type="button" @click="goStats('hand-groups')">상세 보기 ›</button>
      </div>
      <div class="mini-stat-grid">
        <span v-for="group in handGroups" :key="group.label">
          <strong>{{ group.label }}</strong>
          <small>{{ group.value }}</small>
        </span>
      </div>
    </section>

    <section class="summary-panel memo-panel">
      <div class="section-header">
        <h2>대회 메모</h2>
        <button type="button" aria-label="메모 수정">
          <q-icon name="edit" size="18px" />
        </button>
      </div>
      <p>초반 테이블 이미지 좋았음. L8 이후부터 쇼스택 많아지며 폴드를 많이함.</p>
      <p>L12~L14 구간 마지막 핸드 플레이 아쉬움.</p>
    </section>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const expandedLevel = ref('L3')

const tournament = {
  name: '프라임 0702',
}

const metrics = [
  { label: '기록 핸드', value: '289', icon: 'style' },
  { label: '복기 필요', value: '7', sub: '(2.4%)', tone: 'danger', icon: 'change_circle' },
  { label: '총 레벨', value: '10', icon: 'tag' },
  { label: '리바인', value: '2회', sub: '(최종)', icon: 'refresh' },
]

const reviewHands = [
  {
    id: 1,
    level: 'L6',
    name: 'AKs',
    position: 'CO',
    result: '쇼다운 승리',
    tone: 'success',
    cards: [
      { rank: 'A', suit: '♠' },
      { rank: 'K', suit: '♥', red: true },
    ],
  },
  {
    id: 2,
    level: 'L9',
    name: 'AJo',
    position: 'BTN',
    result: '미기록',
    tone: 'danger',
    cards: [
      { rank: 'A', suit: '♠' },
      { rank: 'J', suit: '♦', red: true },
    ],
  },
  {
    id: 3,
    level: 'L12',
    name: 'QTo',
    position: 'SB',
    result: '버블 위험',
    tone: 'danger',
    cards: [
      { rank: 'Q', suit: '♠' },
      { rank: 'T', suit: '♥', red: true },
    ],
  },
  {
    id: 4,
    level: 'L14',
    name: 'KQo',
    position: 'HJ',
    result: '미기록',
    tone: 'danger',
    cards: [
      { rank: 'K', suit: '♠' },
      { rank: 'Q', suit: '♦', red: true },
    ],
  },
]

const levels = [
  { name: 'L1', blinds: '100 / 200 / 200', hands: '28', vpip: '21%', pfr: '16%', review: '0' },
  { name: 'L2', blinds: '200 / 300 / 300', hands: '27', vpip: '22%', pfr: '17%', review: '0' },
  { name: 'L3', blinds: '300 / 500 / 500', hands: '29', vpip: '23%', pfr: '17%', review: '1' },
  { name: 'L4', blinds: '400 / 800 / 800', hands: '31', vpip: '21%', pfr: '16%', review: '1' },
]

const expandedStats = [
  { label: '시작 스택', value: '65,400', sub: '(109bb)' },
  { label: '마감 스택', value: '71,300', sub: '(119bb)' },
  { label: 'VPIP', value: '23%' },
  { label: 'PFR', value: '17%' },
  { label: '3Bet', value: '8%' },
  { label: 'C-Bet', value: '65%' },
]

const levelActions = [
  { label: '오픈레이즈', count: '9회', rate: '31%' },
  { label: '3벳', count: '3회', rate: '10%' },
  { label: '4벳+', count: '1회', rate: '3%' },
  { label: '콜', count: '14회', rate: '48%' },
  { label: '폴드', count: '14회', rate: '48%' },
]

const levelHands = [
  {
    id: 1,
    level: 'L3',
    position: 'CO',
    action: '오픈',
    result: '쇼다운 승리',
    tone: 'success',
    cards: [
      { rank: 'A', suit: '♠' },
      { rank: 'K', suit: '♥', red: true },
    ],
  },
  {
    id: 2,
    level: 'L3',
    position: 'SB',
    action: '3벳 콜 후 올인',
    result: '쇼다운 패배',
    tone: 'danger',
    cards: [
      { rank: 'Q', suit: '♠' },
      { rank: 'T', suit: '♥', red: true },
    ],
  },
  {
    id: 3,
    level: 'L3',
    position: 'BTN',
    action: '폴드',
    result: '복기 필요',
    tone: 'review',
    cards: [
      { rank: '7', suit: '♣' },
      { rank: '6', suit: '♠' },
    ],
  },
]

const tournamentId = 'prime-0702'

const hubs = [
  { label: '액션 통계', caption: '액션별 분포', icon: 'track_changes', to: 'action' },
  { label: '포지션 통계', caption: '포지션별 성과', icon: 'person_pin_circle', to: 'position' },
  { label: '핸드 그룹 통계', caption: '핸드 유형 분석', icon: 'style', to: 'hand-groups' },
  { label: '레벨 통계', caption: '레벨별 흐름', icon: 'query_stats', to: 'action' },
]

const actions = [
  { name: '폴드', count: '427', rate: '52.6%', color: '#5b3df5' },
  { name: '콜', count: '212', rate: '26.1%', color: '#3b82f6' },
  { name: '레이즈', count: '125', rate: '15.4%', color: '#20c4b6' },
  { name: '3Bet', count: '38', rate: '4.7%', color: '#ff8a3d' },
  { name: '4Bet+', count: '10', rate: '1.2%', color: '#ef4444' },
]

const positions = [
  { label: 'CO', value: '18.7%' },
  { label: 'BTN', value: '19.4%' },
  { label: 'SB', value: '14.6%' },
  { label: 'BB', value: '16.6%' },
  { label: 'UTG/MP/HJ', value: '30.7%' },
]

const handGroups = [
  { label: '프리미엄', value: '12.1%' },
  { label: '브로드웨이', value: '18.7%' },
  { label: '마들 페어', value: '24.2%' },
  { label: '마지널 핸드', value: '28.7%' },
  { label: '쓰레기 핸드', value: '16.3%' },
]

const openHand = (hand) => {
  router.push(`/app/tournament/running/level/${hand.level}/hand/${hand.id}`)
}

const toggleLevel = (levelName) => {
  expandedLevel.value = expandedLevel.value === levelName ? '' : levelName
}

const goReviewHands = () => {
  router.push(`/app/tournament/${tournamentId}/review-hands`)
}

const goStats = (type) => {
  router.push(`/app/tournament/${tournamentId}/stats/${type}`)
}
</script>

<style scoped>
.tournament-summary-page {
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
  box-sizing: border-box;
  display: grid;
  align-content: start;
  gap: 12px;
  min-height: 100%;
  padding: 18px 18px 112px;
}

.tournament-summary-page *,
.tournament-summary-page *::before,
.tournament-summary-page *::after {
  box-sizing: border-box;
}

.summary-topbar {
  display: grid;
  grid-template-columns: 40px minmax(0, 1fr) 40px;
  align-items: center;
  min-height: 40px;
}

.icon-button {
  width: 38px;
  height: 38px;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--v2-text-main);
}

.summary-topbar h1 {
  margin: 0;
  color: var(--v2-text-main);
  font-size: 17px;
  font-weight: 520;
  text-align: center;
}

.tournament-card,
.review-card,
.summary-panel {
  width: 100%;
  min-width: 0;
  max-width: 100%;
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-lg);
  background: #ffffff;
  box-shadow: 0 5px 14px rgba(28, 18, 60, 0.022);
}

.tournament-card {
  overflow: hidden;
}

.tournament-card__header {
  padding: 13px 14px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.tournament-card__header div:first-child {
  display: grid;
  gap: 4px;
  min-width: 0;
}

.tournament-card__header strong {
  color: var(--v2-text-main);
  font-size: 18px;
  font-weight: 560;
  line-height: 1.2;
}

.tournament-card__header span,
.section-header h2 span {
  color: var(--v2-text-sub);
  font-size: 12px;
  font-weight: 430;
}

.tournament-card__side {
  flex: 0 0 auto;
  display: grid;
  justify-items: end;
  gap: 8px;
}

.tournament-card__side > span {
  padding: 4px 8px;
  border-radius: var(--v2-radius-sm);
  background: rgba(22, 163, 74, 0.12);
  color: #15803d;
  font-weight: 520;
}

.tournament-card__side button,
.review-card button,
.section-header button,
.level-more {
  border: 0;
  background: transparent;
  color: var(--v2-primary);
  font: inherit;
  font-size: 12px;
  font-weight: 520;
}

.tournament-card__side button {
  min-height: 32px;
  padding: 0 11px;
  border-radius: var(--v2-radius-sm);
  background: var(--v2-primary-soft);
}

.metric-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  border-top: 1px solid var(--v2-border);
}

.metric-grid div {
  min-width: 0;
  min-height: 82px;
  padding: 11px 6px;
  border-right: 1px solid var(--v2-border);
  display: grid;
  justify-items: center;
  align-content: center;
  gap: 5px;
  text-align: center;
}

.metric-grid div:last-child {
  border-right: 0;
}

.metric-grid .q-icon {
  color: var(--v2-primary);
}

.metric-grid span {
  color: #5f596b;
  font-size: 11px;
  font-weight: 430;
}

.metric-grid strong {
  color: var(--v2-text-main);
  font-size: 22px;
  font-weight: 560;
  line-height: 1;
}

.metric-grid small {
  color: var(--v2-text-sub);
  font-size: 10px;
}

.metric-grid small.danger,
.level-table .danger,
.review-hand-card small.danger {
  color: var(--v2-danger);
}

.review-card {
  padding: 11px 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  background: linear-gradient(135deg, #ffffff 0%, #f7f3ff 100%);
}

.review-card > div {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.review-card .q-icon {
  flex: 0 0 auto;
  color: var(--v2-primary);
}

.review-card span {
  display: grid;
  gap: 3px;
  min-width: 0;
}

.review-card strong {
  color: var(--v2-primary);
  font-size: 14px;
  font-weight: 560;
}

.review-card small {
  overflow: hidden;
  color: #655f73;
  font-size: 12px;
  font-weight: 430;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.review-card button {
  flex: 0 0 auto;
  min-height: 34px;
  padding: 0 13px;
  border: 1px solid rgba(109, 69, 232, 0.4);
  border-radius: var(--v2-radius-sm);
  background: #ffffff;
}

.summary-section {
  min-width: 0;
  display: grid;
  gap: 9px;
}

.section-header {
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.section-header h2 {
  min-width: 0;
}

.section-header button {
  flex: 0 0 auto;
}

.summary-section h2,
.section-header h2,
.panel-title,
.summary-panel > h2 {
  margin: 0;
  color: var(--v2-text-main);
  font-size: 15px;
  font-weight: 520;
}

.review-hand-strip {
  width: 100%;
  min-width: 0;
  max-width: 100%;
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 2px;
  overscroll-behavior-x: contain;
  scrollbar-width: none;
}

.review-hand-strip::-webkit-scrollbar {
  display: none;
}

.review-hand-card {
  flex: 0 0 112px;
  min-height: 132px;
  padding: 10px 8px;
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-md);
  background: #ffffff;
  color: var(--v2-text-main);
  display: grid;
  justify-items: center;
  align-content: start;
  gap: 6px;
  font: inherit;
}

.review-hand-card__cards {
  display: flex;
  gap: 5px;
}

.review-hand-card__cards span {
  width: 32px;
  height: 42px;
  border: 1px solid var(--v2-border);
  border-radius: 6px;
  display: grid;
  place-items: center;
  align-content: center;
  gap: 1px;
}

.review-hand-card__cards .red {
  color: #e11d48;
}

.review-hand-card__cards b {
  font-size: 14px;
  font-weight: 560;
  line-height: 1;
}

.review-hand-card__cards em {
  font-size: 11px;
  font-style: normal;
}

.review-hand-card strong {
  font-size: 13px;
  font-weight: 560;
}

.review-hand-card small {
  padding: 3px 7px;
  border-radius: var(--v2-radius-sm);
  background: #f4f3f8;
  color: #5e596a;
  font-size: 11px;
  font-weight: 520;
}

.review-hand-card small.success {
  background: rgba(22, 163, 74, 0.12);
  color: #15803d;
}

.review-hand-card > span {
  color: var(--v2-text-sub);
  font-size: 11px;
}

.summary-panel {
  overflow: hidden;
  padding: 12px;
}

.panel-title {
  width: 100%;
  padding: 0 0 10px;
  border: 0;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font: inherit;
}

.level-table {
  width: 100%;
  min-width: 0;
  max-width: 100%;
  overflow: hidden;
}

.level-row {
  border-top: 1px solid var(--v2-border);
}

.level-row:first-child {
  border-top: 0;
}

.level-row--expanded {
  margin: 0 -6px;
  border: 1px solid rgba(109, 69, 232, 0.45);
  border-radius: var(--v2-radius-md);
  background: #ffffff;
  box-shadow: 0 8px 18px rgba(109, 69, 232, 0.055);
}

.level-row__summary {
  width: 100%;
  min-width: 0;
  min-height: 52px;
  display: grid;
  grid-template-columns: 36px minmax(0, 1fr) auto auto 22px;
  align-items: center;
  gap: 8px;
  padding: 0 6px;
  border: 0;
  background: transparent;
  color: #4f4a5e;
  font: inherit;
  font-size: 12px;
  font-weight: 430;
  text-align: left;
}

.level-row--expanded .level-row__summary {
  min-height: 54px;
  color: var(--v2-primary);
}

.level-table__level {
  color: var(--v2-text-main);
  font-weight: 560;
}

.level-table__blinds {
  overflow: hidden;
  color: #4f4a5e;
  font-weight: 560;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.level-row--expanded .level-table__level,
.level-row--expanded .level-table__blinds {
  color: var(--v2-primary);
}

.level-table__meta {
  color: #655f73;
  font-size: 11px;
  white-space: nowrap;
}

.level-expanded {
  display: grid;
  gap: 14px;
  padding: 0 10px 12px;
}

.level-kpi-grid {
  overflow: hidden;
  border-top: 1px solid var(--v2-border);
  border-bottom: 1px solid var(--v2-border);
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
}

.level-kpi-grid div {
  min-width: 0;
  min-height: 66px;
  padding: 9px 4px;
  border-right: 1px solid var(--v2-border);
  display: grid;
  place-items: center;
  align-content: center;
  gap: 5px;
  text-align: center;
}

.level-kpi-grid div:last-child {
  border-right: 0;
}

.level-kpi-grid span,
.level-kpi-grid small {
  color: var(--v2-text-sub);
  font-size: 10px;
  font-weight: 430;
}

.level-kpi-grid strong {
  color: var(--v2-text-main);
  font-size: 13px;
  font-weight: 560;
  line-height: 1;
}

.level-detail-block {
  display: grid;
  gap: 9px;
}

.level-detail-block h3 {
  margin: 0;
  color: var(--v2-text-main);
  font-size: 13px;
  font-weight: 560;
}

.level-action-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 7px;
}

.level-action-grid div {
  min-width: 0;
  min-height: 66px;
  padding: 8px 4px;
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-sm);
  display: grid;
  place-items: center;
  align-content: center;
  gap: 4px;
  text-align: center;
}

.level-action-grid span {
  color: #5f596b;
  font-size: 10px;
  font-weight: 430;
}

.level-action-grid strong {
  color: var(--v2-text-main);
  font-size: 15px;
  font-weight: 560;
}

.level-action-grid small {
  color: var(--v2-text-sub);
  font-size: 10px;
}

.level-hand-list {
  overflow: hidden;
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-md);
}

.level-hand-list button {
  width: 100%;
  min-width: 0;
  min-height: 58px;
  padding: 8px 8px;
  border: 0;
  border-bottom: 1px solid var(--v2-border);
  background: #ffffff;
  color: var(--v2-text-main);
  display: grid;
  grid-template-columns: 64px 36px minmax(0, 1fr) auto 20px;
  align-items: center;
  gap: 8px;
  font: inherit;
  text-align: left;
}

.level-hand-list button:last-child {
  border-bottom: 0;
}

.level-hand-cards {
  display: flex;
  gap: 4px;
}

.level-hand-cards i {
  width: 27px;
  height: 35px;
  border: 1px solid var(--v2-border);
  border-radius: 6px;
  display: grid;
  place-items: center;
  align-content: center;
  gap: 1px;
  font-style: normal;
}

.level-hand-cards i.red {
  color: #e11d48;
}

.level-hand-cards b {
  font-size: 13px;
  font-weight: 560;
  line-height: 1;
}

.level-hand-cards em {
  font-size: 10px;
  font-style: normal;
}

.level-hand-list strong,
.level-hand-list span {
  font-size: 12px;
  font-weight: 430;
}

.level-hand-list strong {
  font-weight: 560;
}

.level-hand-list span:not(.level-hand-cards) {
  overflow: hidden;
  color: #5f596b;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.level-hand-list small {
  padding: 4px 7px;
  border-radius: var(--v2-radius-sm);
  background: #f4f3f8;
  color: #5f596b;
  font-size: 11px;
  font-weight: 520;
  white-space: nowrap;
}

.level-hand-list small.success {
  background: rgba(22, 163, 74, 0.12);
  color: #15803d;
}

.level-hand-list small.danger {
  background: rgba(239, 68, 68, 0.1);
  color: var(--v2-danger);
}

.level-hand-list small.review {
  background: rgba(239, 68, 68, 0.1);
  color: var(--v2-danger);
}

.level-review-banner {
  padding: 10px;
  border: 1px solid rgba(109, 69, 232, 0.18);
  border-radius: var(--v2-radius-md);
  background: #faf8ff;
  display: grid;
  grid-template-columns: 26px minmax(0, 1fr) auto;
  align-items: center;
  gap: 9px;
}

.level-review-banner .q-icon {
  color: var(--v2-primary);
}

.level-review-banner div {
  display: grid;
  gap: 3px;
  min-width: 0;
}

.level-review-banner strong {
  color: var(--v2-primary);
  font-size: 13px;
  font-weight: 560;
}

.level-review-banner span {
  overflow: hidden;
  color: #655f73;
  font-size: 11px;
  font-weight: 430;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.level-review-banner button {
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

.level-more {
  width: 100%;
  min-height: 34px;
  margin-top: 6px;
}

.hub-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
}

.hub-grid button {
  min-width: 0;
  min-height: 82px;
  padding: 10px 6px;
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-md);
  background: #ffffff;
  color: var(--v2-text-main);
  display: grid;
  place-items: center;
  align-content: center;
  gap: 5px;
  font: inherit;
  text-align: center;
}

.hub-grid .q-icon {
  color: var(--v2-primary);
}

.hub-grid strong {
  font-size: 12px;
  font-weight: 560;
}

.hub-grid span {
  color: var(--v2-text-sub);
  font-size: 10px;
}

.action-summary {
  min-width: 0;
  display: grid;
  grid-template-columns: 132px minmax(0, 1fr);
  align-items: center;
  gap: 14px;
  margin-top: 10px;
}

.donut {
  width: 112px;
  height: 112px;
  border-radius: 50%;
  background: conic-gradient(#5b3df5 0 52.6%, #3b82f6 52.6% 78.7%, #20c4b6 78.7% 94.1%, #ff8a3d 94.1% 98.8%, #ef4444 98.8% 100%);
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

.donut span,
.donut small {
  position: relative;
  z-index: 1;
}

.donut span {
  margin-top: 10px;
  color: var(--v2-text-main);
  font-size: 21px;
  font-weight: 560;
}

.donut small {
  margin-top: -28px;
  color: var(--v2-text-sub);
  font-size: 11px;
}

.action-summary ul {
  min-width: 0;
  display: grid;
  gap: 7px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.action-summary li {
  min-width: 0;
  display: grid;
  grid-template-columns: 10px minmax(0, 1fr) auto;
  align-items: center;
  gap: 8px;
  color: #4f4a5e;
  font-size: 12px;
}

.action-summary i {
  width: 9px;
  height: 9px;
  border-radius: 50%;
}

.action-summary strong {
  min-width: 0;
  overflow: hidden;
  color: var(--v2-text-main);
  font-weight: 520;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.compact-panel {
  display: grid;
  gap: 10px;
}

.mini-stat-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 7px;
}

.mini-stat-grid span {
  min-width: 0;
  min-height: 48px;
  padding: 8px 5px;
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-sm);
  display: grid;
  place-items: center;
  gap: 4px;
  text-align: center;
}

.mini-stat-grid strong {
  color: var(--v2-text-main);
  font-size: 12px;
  font-weight: 560;
}

.mini-stat-grid small {
  color: var(--v2-text-sub);
  font-size: 11px;
}

.memo-panel {
  display: grid;
  gap: 8px;
}

.memo-panel p {
  margin: 0;
  color: #4f4a5e;
  font-size: 13px;
  font-weight: 430;
  line-height: 1.55;
}

@media (max-width: 420px) {
  .tournament-summary-page {
    padding-inline: 16px;
  }

  .tournament-card__header {
    padding: 12px;
  }

  .tournament-card__header strong {
    font-size: 17px;
  }

  .tournament-card__side button {
    min-height: 30px;
    padding-inline: 9px;
  }

  .metric-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .metric-grid div {
    min-height: 72px;
    border-bottom: 1px solid var(--v2-border);
  }

  .metric-grid div:nth-child(2n) {
    border-right: 0;
  }

  .metric-grid div:nth-last-child(-n + 2) {
    border-bottom: 0;
  }

  .metric-grid strong {
    font-size: 19px;
  }

  .review-card {
    padding: 10px;
  }

  .review-card button {
    padding-inline: 10px;
  }

  .review-hand-card {
    flex-basis: 104px;
    min-height: 126px;
  }

  .level-row--expanded {
    margin-inline: -4px;
  }

  .level-row__summary {
    grid-template-columns: 32px minmax(0, 1fr) auto auto 20px;
    gap: 6px;
    padding-inline: 6px;
    font-size: 11px;
  }

  .level-table__meta {
    font-size: 10px;
  }

  .level-expanded {
    gap: 12px;
    padding: 0 8px 10px;
  }

  .level-kpi-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .level-kpi-grid div {
    min-height: 60px;
    border-bottom: 1px solid var(--v2-border);
  }

  .level-kpi-grid div:nth-child(3n) {
    border-right: 0;
  }

  .level-kpi-grid div:nth-last-child(-n + 3) {
    border-bottom: 0;
  }

  .level-action-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .level-action-grid div {
    min-height: 62px;
  }

  .level-hand-list button {
    grid-template-columns: 58px 30px minmax(0, 1fr) auto 18px;
    gap: 6px;
    padding-inline: 7px;
  }

  .level-hand-cards i {
    width: 25px;
    height: 34px;
  }

  .level-hand-list small {
    padding-inline: 6px;
    font-size: 10px;
  }

  .level-review-banner {
    grid-template-columns: 24px minmax(0, 1fr);
  }

  .level-review-banner button {
    grid-column: 2 / 3;
    justify-self: start;
  }

  .hub-grid,
  .mini-stat-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .action-summary {
    grid-template-columns: 94px minmax(0, 1fr);
    gap: 10px;
  }

  .donut {
    width: 88px;
    height: 88px;
  }

  .donut::after {
    inset: 22px;
  }

  .donut span {
    font-size: 18px;
  }

  .action-summary li {
    gap: 6px;
    font-size: 11px;
  }
}

@media (max-width: 360px) {
  .tournament-summary-page {
    padding-inline: 14px;
  }

  .summary-panel {
    padding: 10px;
  }

  .action-summary {
    grid-template-columns: 1fr;
    justify-items: center;
  }

  .action-summary ul {
    width: 100%;
  }
}
</style>
