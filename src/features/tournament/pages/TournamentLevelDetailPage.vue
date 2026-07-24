<template>
  <q-page class="level-detail-page" :class="{ 'level-detail-page--summary': isSummaryView }">
    <header class="level-topbar">
      <button class="level-topbar__back" type="button" aria-label="뒤로 가기" @click="router.back()">
        <q-icon name="chevron_left" size="28px" />
      </button>
      <h1>{{ levelName }}</h1>
      <span aria-hidden="true"></span>
    </header>

    <section class="stack-card">
      <div class="stack-card__item">
        <span>현재 스택</span>
        <strong>132,000 (264BB)</strong>
      </div>
      <div class="stack-card__item stack-card__item--blinds">
        <span>블라인드</span>
        <strong>{{ levelInfo.blinds }}</strong>
      </div>
    </section>

    <section class="level-stats">
      <h2>레벨 요약</h2>
      <div class="level-stats__grid">
        <div v-for="stat in stats" :key="stat.label">
          <span>{{ stat.label }}</span>
          <strong>{{ stat.value }}</strong>
        </div>
      </div>
    </section>

    <section class="hand-section">
      <div class="hand-section__header">
        <h2>{{ selectionMode ? `핸드 선택 (${selectedHandIds.length})` : `핸드 목록 (${hands.length})` }}</h2>
        <div v-if="selectionMode" class="hand-selection-actions">
          <button type="button" @click="cancelHandSelection">취소</button>
          <button type="button" :disabled="!selectedHandIds.length" @click="moveSheetOpen = true">이동</button>
        </div>
        <div v-else class="hand-list-action">
          <button
            type="button"
            aria-label="핸드 목록 작업"
            :aria-expanded="showHandListMenu"
            @click="showHandListMenu = !showHandListMenu"
          >
            <q-icon name="more_vert" size="23px" />
          </button>
          <div v-if="showHandListMenu" class="hand-list-menu">
            <button type="button" @click="startHandSelection">
              <q-icon name="drive_file_move_outline" size="18px" />
              선택해서 이동
            </button>
          </div>
        </div>
      </div>
      <div class="hand-list">
        <article
          v-for="hand in hands"
          :key="hand.id"
          class="hand-row"
          role="button"
          tabindex="0"
          :class="{
            selected: selectedHandIds.includes(hand.id),
            'hand-row--selecting': selectionMode,
          }"
          @click="handleHandClick(hand.id)"
          @keyup.enter="handleHandClick(hand.id)"
        >
          <div class="cards">
            <span v-for="card in hand.cards" :key="card.rank + card.suit" :class="{ red: card.red }">
              <b>{{ card.rank }}</b>
              <em>{{ card.suit }}</em>
            </span>
          </div>

          <div class="hand-row__main">
            <span>{{ hand.position }}</span>
          </div>

          <span class="hand-row__status">
            <span class="hand-row__result" :class="`hand-row__result--${hand.tone}`">{{ hand.result }}</span>
            <span class="hand-row__review-slot">
              <span v-if="hand.needsReview" class="hand-row__review-dot" aria-label="복기 필요"></span>
            </span>
          </span>
          <span v-if="selectionMode" class="hand-row__check" aria-hidden="true">
            <q-icon :name="selectedHandIds.includes(hand.id) ? 'check' : ''" size="16px" />
          </span>
        </article>
      </div>
    </section>

    <button v-if="!isSummaryView" class="hand-fab" type="button" @click="recordHand">
      <span class="hand-fab__icon" aria-hidden="true">
        <i></i>
      </span>
      <span>핸드 기록</span>
    </button>
    <StickyPrimaryAction v-if="!isSummaryView" label="레벨 종료" @click="endLevel" />

    <q-dialog v-model="moveSheetOpen" position="bottom">
      <section class="move-level-sheet">
        <div class="move-level-sheet__handle"></div>
        <h2>레벨 선택</h2>
        <p>선택한 핸드 {{ selectedHandIds.length }}개</p>
        <button v-for="level in movableLevels" :key="level.name" type="button" @click="moveSelectedHands(level.name)">
          <strong>{{ level.name }}</strong>
          <span>{{ level.blinds }}</span>
          <q-icon name="chevron_right" size="20px" />
        </button>
      </section>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import StickyPrimaryAction from 'src/shared/components/StickyPrimaryAction.vue'

const route = useRoute()
const router = useRouter()

const levelName = computed(() => route.params.levelName || 'L3')
const isSummaryView = computed(() => route.query.view === 'summary')
const showHandListMenu = ref(false)
const selectionMode = ref(false)
const selectedHandIds = ref([])
const moveSheetOpen = ref(false)

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
]

const hands = ref([
  {
    id: 1,
    cards: [
      { rank: 'A', suit: '♠' },
      { rank: 'K', suit: '♥', red: true },
    ],
    name: 'AKo',
    position: 'CO',
    result: '승리',
    tone: 'win',
    needsReview: true,
  },
  {
    id: 2,
    cards: [
      { rank: 'Q', suit: '♠' },
      { rank: 'T', suit: '♥', red: true },
    ],
    name: 'QTs',
    position: 'UTG',
    result: '패배',
    tone: 'lose',
  },
  {
    id: 3,
    cards: [
      { rank: '8', suit: '♣' },
      { rank: '7', suit: '♣' },
    ],
    name: '87s',
    position: 'BTN',
    result: '찹',
    tone: 'draw',
    needsReview: true,
  },
  {
    id: 4,
    cards: [
      { rank: 'A', suit: '♦', red: true },
      { rank: 'J', suit: '♦', red: true },
    ],
    name: 'AJo',
    position: 'UTG+1',
    result: '패배',
    tone: 'lose',
  },
  {
    id: 5,
    cards: [
      { rank: '9', suit: '♣' },
      { rank: '9', suit: '♥', red: true },
    ],
    name: '99',
    position: 'SB',
    result: '승리',
    tone: 'win',
    needsReview: true,
  },
  {
    id: 6,
    cards: [
      { rank: 'A', suit: '♠' },
      { rank: 'Q', suit: '♥', red: true },
    ],
    name: 'AQo',
    position: 'BB',
    result: '패배',
    tone: 'lose',
  },
])

const movableLevels = computed(() =>
  Object.entries(levelMap)
    .filter(([name, blinds]) => name !== levelName.value && Boolean(blinds))
    .map(([name, blinds]) => ({ name, blinds })),
)

const recordHand = () => {
  router.push(`/app/tournament/running/level/${levelName.value}/hand/new`)
}

const endLevel = () => {
  router.push('/app/tournament/running')
}

const openHand = (handId) => {
  router.push(`/app/tournament/running/level/${levelName.value}/hand/${handId}`)
}

const startHandSelection = () => {
  showHandListMenu.value = false
  selectionMode.value = true
  selectedHandIds.value = []
}

const cancelHandSelection = () => {
  selectionMode.value = false
  selectedHandIds.value = []
}

const handleHandClick = (handId) => {
  if (!selectionMode.value) {
    openHand(handId)
    return
  }

  selectedHandIds.value = selectedHandIds.value.includes(handId)
    ? selectedHandIds.value.filter((id) => id !== handId)
    : [...selectedHandIds.value, handId]
}

const moveSelectedHands = () => {
  hands.value = hands.value.filter((hand) => !selectedHandIds.value.includes(hand.id))
  moveSheetOpen.value = false
  cancelHandSelection()
}
</script>

<style scoped>
.level-detail-page {
  display: grid;
  align-content: start;
  gap: 20px;
  min-height: 100%;
  padding: var(--v2-page-padding-top) var(--v2-page-padding-x) 180px;
}

.level-detail-page--summary {
  padding-bottom: 112px;
}

.level-topbar {
  display: grid;
  grid-template-columns: 40px minmax(0, 1fr) 40px;
  align-items: center;
  gap: 10px;
  min-height: 36px;
}

.level-topbar h1 {
  margin: 0;
  color: var(--v2-text-main);
  font-size: 17px;
  font-weight: 560;
  line-height: 1.2;
  text-align: center;
}

.level-topbar__back {
  width: 36px;
  height: 36px;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--v2-text-main);
  display: grid;
  place-items: center;
}

.stack-card {
  padding: 18px;
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-lg);
  background: #ffffff;
  box-shadow: 0 6px 18px rgba(28, 18, 60, 0.035);
  display: grid;
  gap: 16px;
}

.stack-card__item {
  min-width: 0;
}

.stack-card__item--blinds {
  padding-top: 16px;
  border-top: 1px solid var(--v2-border);
}

.stack-card__item span {
  color: var(--v2-text-main);
  font-size: 14px;
  font-weight: 430;
}

.stack-card__item strong {
  margin-top: 11px;
  color: var(--v2-text-main);
  display: block;
  font-size: 24px;
  font-weight: 560;
  line-height: 1;
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

.hand-section__header {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.hand-list-action {
  position: relative;
}

.hand-list-action > button {
  width: 36px;
  height: 36px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: #f1eff6;
  color: #625c70;
  display: grid;
  place-items: center;
  outline: 0;
}

.hand-list-menu {
  position: absolute;
  top: 42px;
  right: 0;
  z-index: 4;
  width: 156px;
  overflow: hidden;
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-lg);
  background: #ffffff;
  box-shadow: 0 12px 28px rgba(28, 18, 60, 0.16);
}

.hand-list-menu button {
  width: 100%;
  min-height: 42px;
  padding: 0 12px;
  border: 0;
  background: #ffffff;
  color: var(--v2-text-main);
  display: flex;
  align-items: center;
  gap: 9px;
  font: inherit;
  font-size: 13px;
  font-weight: 520;
  white-space: nowrap;
}

.hand-list-menu button:active {
  background: #faf9ff;
}

.hand-selection-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.hand-selection-actions button {
  min-height: 32px;
  padding: 0 10px;
  border: 0;
  border-radius: var(--v2-radius-sm);
  background: var(--v2-primary-soft);
  color: var(--v2-primary);
  font: inherit;
  font-size: 13px;
  font-weight: 520;
}

.hand-selection-actions button:first-child {
  background: transparent;
  color: var(--v2-text-sub);
}

.hand-selection-actions button:disabled {
  opacity: 0.4;
}

.stack-card__item--blinds strong {
  overflow: hidden;
  font-size: clamp(16px, 4.8vw, 20px);
  letter-spacing: -0.35px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.level-stats__grid {
  overflow: hidden;
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-lg);
  background: #ffffff;
  box-shadow: 0 5px 14px rgba(28, 18, 60, 0.025);
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
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
  background: linear-gradient(135deg, #7957f2 0%, #5d35d9 100%);
  color: transparent;
  font-size: 20px;
  font-weight: 560;
  line-height: 1;
  -webkit-background-clip: text;
  background-clip: text;
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
  grid-template-columns: 104px minmax(0, 1fr) auto;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: background 150ms ease;
}

.hand-row--selecting {
  grid-template-columns: 104px minmax(0, 1fr) auto 28px;
}

.hand-row.selected {
  background: var(--v2-primary-soft);
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

.hand-row__main > span {
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

.hand-row__status {
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
}

.hand-row__review-slot {
  width: 14px;
  height: 14px;
  flex: 0 0 14px;
  display: grid;
  place-items: center;
}

.hand-row__review-dot {
  width: 7px;
  height: 7px;
  flex: 0 0 auto;
  border-radius: 50%;
  background: var(--v2-primary);
}

.hand-row__result--win {
  background: rgba(22, 163, 74, 0.14);
  color: #15803d;
}

.hand-row__result--lose {
  background: rgba(239, 68, 68, 0.1);
  color: var(--v2-danger);
}

.hand-row__result--draw {
  background: #f2f1f5;
  color: #625c70;
}

.hand-row button {
  width: 28px;
  height: 36px;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--v2-text-main);
}

.hand-row__check {
  width: 22px;
  height: 22px;
  border: 1px solid #d3cde1;
  border-radius: 50%;
  color: #ffffff;
  display: grid;
  place-items: center;
}

.hand-row.selected .hand-row__check {
  border-color: var(--v2-primary);
  background: var(--v2-primary);
}

.move-level-sheet {
  width: 100%;
  padding: 10px 20px calc(20px + env(safe-area-inset-bottom));
  border-radius: 18px 18px 0 0;
  background: #ffffff;
}

.move-level-sheet__handle {
  width: 36px;
  height: 4px;
  margin: 0 auto 18px;
  border-radius: 999px;
  background: #b8b2c7;
}

.move-level-sheet h2 {
  margin: 0;
  color: var(--v2-text-main);
  font-size: 17px;
  font-weight: 560;
}

.move-level-sheet p {
  margin: 4px 0 8px;
  color: var(--v2-text-sub);
  font-size: 13px;
  font-weight: 430;
  line-height: 1.4;
}

.move-level-sheet button {
  width: 100%;
  min-height: 48px;
  padding: 0 4px;
  border: 0;
  border-bottom: 1px solid var(--v2-border);
  background: transparent;
  color: var(--v2-text-main);
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr) 20px;
  align-items: center;
  gap: 10px;
  font: inherit;
  font-size: 14px;
  font-weight: 520;
}

.move-level-sheet button strong {
  font-weight: 560;
  text-align: left;
}

.move-level-sheet button span {
  overflow: hidden;
  color: var(--v2-text-sub);
  font-weight: 430;
  text-align: left;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.hand-fab {
  position: fixed;
  right: 26px;
  bottom: 160px;
  width: 72px;
  height: 72px;
  border: 0;
  border-radius: 50%;
  background: linear-gradient(135deg, #6d45e8 0%, #5317f4 100%);
  color: #ffffff;
  box-shadow: 0 10px 22px rgba(83, 23, 244, 0.24);
  display: grid;
  place-items: center;
  align-content: center;
  gap: 3px;
  font: inherit;
  font-size: 11px;
  font-weight: 560;
}

.hand-fab__icon {
  position: relative;
  width: 27px;
  height: 25px;
  filter: drop-shadow(0 2px 4px rgba(28, 18, 60, 0.12));
}

.hand-fab__icon::before,
.hand-fab__icon::after {
  position: absolute;
  content: '';
  border-radius: 4px;
}

.hand-fab__icon::before {
  left: 1px;
  top: 3px;
  width: 17px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.78);
  transform: rotate(-5deg);
}

.hand-fab__icon::after {
  left: 8px;
  top: 1px;
  width: 17px;
  height: 21px;
  background: #ffffff;
  box-shadow: inset 0 0 0 1px rgba(83, 23, 244, 0.14);
  transform: rotate(8deg);
}

.hand-fab__icon i {
  position: absolute;
  right: -1px;
  bottom: 0;
  z-index: 1;
  width: 12px;
  height: 12px;
  border: 2px solid #5b2ff0;
  border-radius: 50%;
  background: #ffffff;
}

.hand-fab__icon i::before,
.hand-fab__icon i::after {
  position: absolute;
  left: 50%;
  top: 50%;
  content: '';
  border-radius: 999px;
  background: #5b2ff0;
  transform: translate(-50%, -50%);
}

.hand-fab__icon i::before {
  width: 7px;
  height: 2px;
}

.hand-fab__icon i::after {
  width: 2px;
  height: 7px;
}

.hand-fab__icon + span {
  line-height: 1;
}

@media (max-width: 420px) {
  .level-topbar {
    grid-template-columns: 40px minmax(0, 1fr) 40px;
  }

  .hand-row {
    grid-template-columns: 84px minmax(0, 1fr) auto;
    gap: 8px;
    padding: 9px 10px;
  }

  .hand-row--selecting {
    grid-template-columns: 84px minmax(0, 1fr) auto 24px;
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
    width: 68px;
    height: 68px;
    font-size: 10px;
  }
}
</style>
