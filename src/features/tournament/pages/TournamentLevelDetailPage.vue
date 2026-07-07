<template>
  <q-page class="level-detail-page">
    <header class="level-topbar">
      <button class="level-topbar__back" type="button" aria-label="뒤로 가기" @click="router.back()">
        <q-icon name="chevron_left" size="30px" />
      </button>

      <div class="level-topbar__title">
        <h1>{{ levelName }}</h1>
        <p>{{ levelInfo.blinds }}</p>
      </div>

      <button class="level-topbar__end" type="button">레벨 종료</button>
    </header>

    <section class="stack-card">
      <div>
        <span>현재 스택</span>
        <strong>132,000</strong>
      </div>
      <q-icon name="paid" size="58px" />
    </section>

    <section class="level-stats">
      <h2>레벨 통계</h2>
      <div class="level-stats__grid">
        <div v-for="stat in stats" :key="stat.label">
          <span>{{ stat.label }}</span>
          <strong>{{ stat.value }}</strong>
        </div>
      </div>
    </section>

    <section class="hand-section">
      <h2>핸드 목록 (11)</h2>
      <div class="hand-list">
        <article
          v-for="hand in hands"
          :key="hand.id"
          class="hand-row"
          role="button"
          tabindex="0"
          @click="openHand(hand.id)"
          @keyup.enter="openHand(hand.id)"
        >
          <div class="cards">
            <span v-for="card in hand.cards" :key="card.rank + card.suit" :class="{ red: card.red }">
              <b>{{ card.rank }}</b>
              <em>{{ card.suit }}</em>
            </span>
          </div>

          <div class="hand-row__main">
            <strong>{{ hand.name }}</strong>
            <p><span>{{ hand.position }}</span>{{ hand.action }}</p>
          </div>

          <span class="hand-row__result" :class="`hand-row__result--${hand.tone}`">{{ hand.result }}</span>
          <button type="button" aria-label="핸드 메뉴" @click.stop>
            <q-icon name="more_vert" size="22px" />
          </button>
        </article>
      </div>
    </section>

    <button class="hand-fab" type="button" @click="recordHand">
      <q-icon name="style" size="30px" />
      <span>핸드 기록</span>
    </button>
  </q-page>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const levelName = computed(() => route.params.levelName || 'L3')

const levelMap = {
  L1: '100 / 200 / 200',
  L2: '200 / 300 / 300',
  L3: '300 / 500 / 500',
  L4: '400 / 800 / 800',
  L5: '600 / 1,200 / 1,200',
  L6: '800 / 1,600 / 1,600',
}

const levelInfo = computed(() => ({
  blinds: levelMap[levelName.value] || '400 / 800 / 800',
}))

const stats = [
  { label: '기록 핸드', value: '11' },
  { label: 'VPIP', value: '27%' },
  { label: 'PFR', value: '18%' },
  { label: '3Bet+', value: '0%' },
  { label: '쇼다운', value: '0' },
]

const hands = [
  {
    id: 1,
    cards: [
      { rank: 'A', suit: '♠' },
      { rank: 'K', suit: '♥', red: true },
    ],
    name: 'AKo',
    position: 'CO',
    action: '3벳 → 콜',
    result: '쇼다운 승',
    tone: 'win',
  },
  {
    id: 2,
    cards: [
      { rank: 'Q', suit: '♠' },
      { rank: 'T', suit: '♥', red: true },
    ],
    name: 'QTs',
    position: 'UTG',
    action: '폴드',
    result: '폴드',
    tone: 'fold',
  },
  {
    id: 3,
    cards: [
      { rank: '8', suit: '♣' },
      { rank: '7', suit: '♣' },
    ],
    name: '87s',
    position: 'BTN',
    action: '오픈 → 폴드',
    result: '폴드',
    tone: 'fold',
  },
  {
    id: 4,
    cards: [
      { rank: 'A', suit: '♦', red: true },
      { rank: 'J', suit: '♦', red: true },
    ],
    name: 'AJo',
    position: 'UTG+1',
    action: '오픈 → 3벳 → 폴드',
    result: '폴드',
    tone: 'fold',
  },
  {
    id: 5,
    cards: [
      { rank: '9', suit: '♣' },
      { rank: '9', suit: '♥', red: true },
    ],
    name: '99',
    position: 'SB',
    action: '오픈 → 콜',
    result: '쇼다운 승',
    tone: 'win',
  },
  {
    id: 6,
    cards: [
      { rank: 'A', suit: '♠' },
      { rank: 'Q', suit: '♥', red: true },
    ],
    name: 'AQo',
    position: 'BB',
    action: '3벳 → 올인 → 콜',
    result: '쇼다운 패',
    tone: 'lose',
  },
]

const recordHand = () => {
  router.push(`/app/tournament/running/level/${levelName.value}/hand/new`)
}

const openHand = (handId) => {
  router.push(`/app/tournament/running/level/${levelName.value}/hand/${handId}`)
}
</script>

<style scoped>
.level-detail-page {
  display: grid;
  align-content: start;
  gap: 20px;
  min-height: 100%;
  padding: 24px 20px 112px;
}

.level-topbar {
  display: grid;
  grid-template-columns: 48px minmax(0, 1fr) auto;
  align-items: center;
  gap: 12px;
}

.level-topbar__back {
  width: 40px;
  height: 40px;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--v2-text-main);
}

.level-topbar__title {
  text-align: center;
}

.level-topbar__title h1 {
  margin: 0;
  color: var(--v2-text-main);
  font-size: 25px;
  font-weight: 560;
  line-height: 1;
}

.level-topbar__title p {
  margin: 7px 0 0;
  color: #4a4559;
  font-size: 16px;
  font-weight: 430;
  line-height: 1.2;
}

.level-topbar__end {
  min-height: 42px;
  padding: 0 16px;
  border: 1px solid rgba(239, 68, 68, 0.55);
  border-radius: var(--v2-radius-md);
  background: #ffffff;
  color: var(--v2-danger);
  font: inherit;
  font-size: 14px;
  font-weight: 560;
}

.stack-card {
  padding: 18px;
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-lg);
  background: #ffffff;
  box-shadow: 0 6px 18px rgba(28, 18, 60, 0.035);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.stack-card span {
  color: var(--v2-text-main);
  font-size: 14px;
  font-weight: 430;
}

.stack-card strong {
  display: block;
  margin-top: 12px;
  color: var(--v2-primary);
  font-size: 31px;
  font-weight: 560;
  line-height: 1;
}

.stack-card .q-icon {
  color: var(--v2-primary);
}

.level-stats,
.hand-section {
  display: grid;
  gap: 12px;
}

.level-stats h2,
.hand-section h2 {
  margin: 0;
  color: var(--v2-text-main);
  font-size: 17px;
  font-weight: 560;
  line-height: 1.2;
}

.level-stats__grid {
  overflow: hidden;
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-lg);
  background: #ffffff;
  box-shadow: 0 5px 14px rgba(28, 18, 60, 0.025);
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
}

.level-stats__grid div {
  min-height: 72px;
  padding: 12px 6px;
  border-right: 1px solid var(--v2-border);
  display: grid;
  place-items: center;
  align-content: center;
  gap: 8px;
  text-align: center;
}

.level-stats__grid div:last-child {
  border-right: 0;
}

.level-stats__grid span {
  color: var(--v2-text-sub);
  font-size: 12px;
  font-weight: 430;
  line-height: 1.2;
}

.level-stats__grid strong {
  color: var(--v2-primary);
  font-size: 20px;
  font-weight: 560;
  line-height: 1;
}

.hand-list {
  overflow: hidden;
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-lg);
  background: #ffffff;
}

.hand-row {
  min-height: 74px;
  padding: 10px 12px;
  border-bottom: 1px solid var(--v2-border);
  display: grid;
  grid-template-columns: 104px minmax(0, 1fr) auto 28px;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: background 150ms ease;
}

.hand-row:active {
  background: #faf9ff;
}

.hand-row:last-child {
  border-bottom: 0;
}

.cards {
  display: grid;
  grid-template-columns: repeat(2, 46px);
  gap: 6px;
}

.cards span {
  height: 52px;
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-sm);
  background: #ffffff;
  color: var(--v2-text-main);
  display: grid;
  place-items: center;
  align-content: center;
  gap: 2px;
}

.cards span.red {
  color: #e11d48;
}

.cards b {
  font-size: 17px;
  font-weight: 560;
  line-height: 1;
}

.cards em {
  font-size: 15px;
  font-style: normal;
  line-height: 1;
}

.hand-row__main {
  min-width: 0;
}

.hand-row__main strong {
  color: var(--v2-text-main);
  font-size: 16px;
  font-weight: 560;
  line-height: 1.2;
}

.hand-row__main p {
  overflow: hidden;
  margin: 8px 0 0;
  color: #4f4a5e;
  font-size: 13px;
  font-weight: 430;
  line-height: 1.2;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.hand-row__main p span {
  margin-right: 10px;
  padding: 3px 7px;
  border-radius: var(--v2-radius-sm);
  background: #f1eff6;
  color: #777188;
  font-size: 12px;
}

.hand-row__result {
  padding: 7px 10px;
  border-radius: var(--v2-radius-sm);
  font-size: 13px;
  font-weight: 520;
  line-height: 1;
  white-space: nowrap;
}

.hand-row__result--win {
  background: rgba(22, 163, 74, 0.14);
  color: #15803d;
}

.hand-row__result--fold {
  background: #f2f1f5;
  color: #625c70;
}

.hand-row__result--lose {
  background: rgba(239, 68, 68, 0.1);
  color: var(--v2-danger);
}

.hand-row button {
  width: 28px;
  height: 36px;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--v2-text-main);
}

.hand-fab {
  position: fixed;
  right: 26px;
  bottom: 88px;
  width: 104px;
  height: 104px;
  border: 0;
  border-radius: 50%;
  background: linear-gradient(135deg, #6d45e8 0%, #5317f4 100%);
  color: #ffffff;
  box-shadow: 0 16px 30px rgba(83, 23, 244, 0.28);
  display: grid;
  place-items: center;
  align-content: center;
  gap: 5px;
  font: inherit;
  font-size: 14px;
  font-weight: 560;
}

@media (max-width: 420px) {
  .level-detail-page {
    padding-top: 20px;
  }

  .level-topbar {
    grid-template-columns: 40px minmax(0, 1fr) auto;
  }

  .level-topbar__end {
    min-height: 38px;
    padding: 0 12px;
    font-size: 13px;
  }

  .hand-row {
    grid-template-columns: 84px minmax(0, 1fr) auto 24px;
    gap: 8px;
    padding: 9px 10px;
  }

  .cards {
    grid-template-columns: repeat(2, 38px);
    gap: 5px;
  }

  .cards span {
    height: 48px;
  }

  .hand-row__result {
    padding: 7px 8px;
    font-size: 12px;
  }

  .hand-fab {
    right: 22px;
    width: 92px;
    height: 92px;
  }
}
</style>
