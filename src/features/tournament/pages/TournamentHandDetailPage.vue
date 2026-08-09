<template>
  <q-page class="hand-detail-page">
    <header class="hand-detail-topbar">
      <button class="icon-button" type="button" aria-label="뒤로 가기" @click="goBack">
        <q-icon name="chevron_left" size="30px" />
      </button>
      <h1>핸드 상세</h1>
      <button
        v-if="hand"
        class="icon-button"
        type="button"
        aria-label="핸드 메뉴"
        @click="menuOpen = !menuOpen"
      >
        <q-icon name="more_vert" size="22px" />
      </button>
      <span v-else></span>

      <div v-if="menuOpen" class="overflow-menu">
        <button type="button" @click="goHandEdit">핸드 수정</button>
        <button class="danger" type="button" @click="openDeleteDialog">삭제</button>
      </div>
    </header>

    <section v-if="handLogStore.handLoading && !hand" class="hand-state">
      핸드를 불러오는 중입니다.
    </section>
    <section v-else-if="!hand" class="hand-state">핸드 정보가 없습니다.</section>
    <section v-else class="hand-overview">
      <div class="overview-meta">
        <span class="level-pill">{{ levelName }}</span>
        <strong>{{ hand.position || '-' }}</strong>
        <b>{{ handRank }}</b>
      </div>

      <div class="hero-cards">
        <span v-for="card in heroCards" :key="card.rank + card.suit" :class="{ red: card.red }">
          <b>{{ card.rank }}</b>
          <em>{{ card.suit }}</em>
        </span>
      </div>

      <div class="hand-facts">
        <div>
          <span>프리플랍 액션</span>
          <p>
            <i>{{ actionText }}</i>
          </p>
        </div>
        <div>
          <span>결과</span>
          <strong :class="`result--${resultMeta.tone}`">{{ resultMeta.label }}</strong>
        </div>
      </div>
    </section>

    <section v-if="hand && !hasReview" class="review-empty">
      <div class="review-empty__icon"><q-icon name="edit_note" size="34px" /></div>
      <strong>복기 기록이 없습니다.</strong>
      <button class="review-action" type="button" @click="goReviewEdit">복기 작성</button>
    </section>

    <section v-else-if="hand" class="review-summary">
      <div class="review-summary__heading">
        <h2>복기 기록</h2>
        <span v-if="reviewTimeline.potSize">
          최종 팟 {{ formatChips(reviewTimeline.potSize) }}
        </span>
      </div>

      <div v-if="reviewBoard.length" class="summary-section">
        <strong>보드</strong>
        <div class="review-board">
          <div v-for="street in reviewBoard" :key="street.key">
            <span>{{ street.name }}</span>
            <div class="board-cards">
              <i
                v-for="card in street.cards"
                :key="`${street.key}-${card.rank}-${card.suit}`"
                :class="{ red: card.red }"
              >
                <b>{{ card.rank }}</b
                ><em>{{ card.suit }}</em>
              </i>
            </div>
          </div>
        </div>
      </div>

      <div v-if="reviewShowdownHands.length" class="summary-section">
        <strong>쇼다운</strong>
        <div class="review-showdown">
          <div v-for="item in reviewShowdownHands" :key="item.position">
            <b>{{ item.position }}</b>
            <div class="board-cards">
              <i
                v-for="card in item.cards"
                :key="`${item.position}-${card.rank}-${card.suit}`"
                :class="{ red: card.red }"
              >
                <b>{{ card.rank }}</b
                ><em>{{ card.suit }}</em>
              </i>
            </div>
          </div>
        </div>
      </div>

      <div v-if="reviewActions.length" class="summary-section">
        <strong>액션 타임라인</strong>
        <div class="review-timeline">
          <section
            v-for="group in reviewActionGroups"
            :key="group.street"
            class="review-timeline__street"
          >
            <div class="review-timeline__street-heading">
              <span>{{ streetText(group.street) }}</span>
            </div>
            <ol>
              <li
                v-for="(action, index) in group.actions"
                :key="action.id || `${group.street}-${action.player}-${index}`"
                :class="reviewActionClass(action)"
              >
                <i aria-hidden="true"></i>
                <b>
                  {{ action.player }}
                  <small v-if="isHeroAction(action)">나</small>
                </b>
                <div class="review-action-badges">
                  <span class="review-action-badge review-action-badge--type">
                    {{ reviewActionLabel(action) }}
                  </span>
                  <span
                    v-if="reviewActionAmount(action)"
                    class="review-action-badge review-action-badge--amount"
                  >
                    {{ reviewActionAmount(action) }}
                  </span>
                  <span
                    v-if="action.isAllIn"
                    class="review-action-badge review-action-badge--all-in"
                  >
                    올인
                  </span>
                </div>
              </li>
            </ol>
          </section>
        </div>
      </div>

      <div v-if="hand.memo?.trim()" class="summary-row summary-row--memo">
        <span>메모</span>
        <p>{{ hand.memo }}</p>
      </div>

      <button class="review-action" type="button" @click="goReviewEdit">복기 수정</button>
    </section>

    <q-dialog v-model="deleteDialogOpen">
      <div class="delete-dialog">
        <h2>핸드를 삭제할까요?</h2>
        <div>
          <button type="button" @click="deleteDialogOpen = false">취소</button>
          <button class="danger" type="button" @click="confirmDelete">삭제</button>
        </div>
      </div>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useAlert } from 'src/composables/useAlert'
import { useHandLogStore } from 'src/stores/handLog'
import { getActionLabel, getPreflopRankStat, getResultLabel } from 'src/utils/handLogHandAnalysis'

const route = useRoute()
const router = useRouter()
const alert = useAlert()
const handLogStore = useHandLogStore()

const menuOpen = ref(false)
const deleteDialogOpen = ref(false)
const levelId = computed(() => String(route.params.levelName || ''))
const levelName = computed(() => String(route.query.levelName || '') || '-')
const handId = computed(() => String(route.params.handId || ''))
const eventId = computed(
  () => route.query.eventId || route.query.legacyEventId || storedTournament.eventId || null,
)
const hand = computed(() => {
  const selected = handLogStore.selectedHand
  return selected && String(selected.id) === handId.value ? selected : null
})
const parseJson = (value, fallback) => {
  try {
    return value ? JSON.parse(value) : fallback
  } catch {
    return fallback
  }
}
const reviewBoard = computed(() =>
  parseJson(hand.value?.boardCards, [])
    .map((street) => ({
      ...street,
      cards: (street.cards || []).filter(Boolean).map((card) => ({
        ...card,
        red: ['♥', '♦'].includes(card.suit),
      })),
    }))
    .filter((street) => street.cards.length),
)
const reviewTimeline = computed(() => parseJson(hand.value?.actionTimeline, {}))
const reviewActions = computed(() =>
  Array.isArray(reviewTimeline.value.actions) ? reviewTimeline.value.actions : [],
)
const reviewActionGroups = computed(() => {
  const groups = new Map()
  reviewActions.value.forEach((action) => {
    const street = action.street || 'OTHER'
    if (!groups.has(street)) groups.set(street, [])
    groups.get(street).push(action)
  })

  const streetOrder = ['PREFLOP', 'FLOP', 'TURN', 'RIVER']
  return [...groups.entries()]
    .sort(([first], [second]) => {
      const firstIndex = streetOrder.indexOf(first)
      const secondIndex = streetOrder.indexOf(second)
      return (
        (firstIndex < 0 ? streetOrder.length : firstIndex) -
        (secondIndex < 0 ? streetOrder.length : secondIndex)
      )
    })
    .map(([street, actions]) => ({ street, actions }))
})
const reviewShowdownHands = computed(() =>
  Object.entries(reviewTimeline.value.showdownCards || {})
    .map(([position, cards]) => ({
      position,
      cards: (Array.isArray(cards) ? cards : []).filter(Boolean).map((card) => ({
        ...card,
        red: ['♥', '♦'].includes(card.suit),
      })),
    }))
    .filter((item) => item.cards.length),
)
const hasReview = computed(
  () =>
    Boolean(hand.value?.memo?.trim()) ||
    reviewBoard.value.length > 0 ||
    reviewActions.value.length > 0 ||
    reviewShowdownHands.value.length > 0,
)
const handRank = computed(() => {
  const rank = getPreflopRankStat(hand.value?.holeCards || hand.value?.hand).rank
  return rank ? `${rank}위` : '-'
})
const heroCards = computed(() => {
  if (!hand.value) return []
  const ranks = [hand.value.firstRank, hand.value.secondRank].filter(Boolean)
  const suits = [hand.value.firstSuit, hand.value.secondSuit]
  return ranks.map((rank, index) => {
    const suit = suits[index] || (hand.value.suited ? '♠' : index === 0 ? '♠' : '♥')
    return {
      rank,
      suit,
      red: ['♥', '♦'].includes(suit),
    }
  })
})
const actionText = computed(
  () => hand.value?.actionLabel || getActionLabel(hand.value?.actionType) || '-',
)
const resultMeta = computed(() => {
  const value = hand.value?.resultType
  if (['SHOWDOWN_WIN', 'NON_SHOWDOWN_WIN', 'WIN'].includes(value))
    return { label: '승리', tone: 'win' }
  if (['CHOP', 'DRAW'].includes(value)) return { label: '찹', tone: 'draw' }
  if (['SHOWDOWN_LOSS', 'PREFLOP_FOLD', 'POSTFLOP_FOLD', 'LOSS'].includes(value))
    return { label: '패배', tone: 'lose' }
  return { label: getResultLabel(value) || '미기록', tone: 'neutral' }
})
const streetText = (street) =>
  ({ PREFLOP: '프리플랍', FLOP: '플랍', TURN: '턴', RIVER: '리버' })[street] || street
const actionLabels = {
  FOLD: '폴드',
  LIMP: '림프',
  OPEN: '오픈',
  CHECK: '체크',
  CALL: '콜',
  BET: '벳',
  RAISE: '레이즈',
}
const formatChips = (value) => Number(value || 0).toLocaleString('ko-KR')
const reviewActionLabel = (action) => actionLabels[action.type] || action.type || '-'
const reviewActionAmount = (action) => {
  const amount = Number(action.isAllIn ? action.allInStack || action.amount : action.amount)
  if (!amount) return ''
  const bigBlind = Number(
    reviewTimeline.value.bigBlind ||
      handLogStore.selectedBlindLevel?.bigBlind ||
      storedTournament.currentBlinds?.bigBlind ||
      storedTournament.startBlinds?.bigBlind ||
      0,
  )
  const bb = bigBlind > 0 ? ` (${Number((amount / bigBlind).toFixed(1))}BB)` : ''
  return `${formatChips(amount)}${bb}`
}
const reviewActionClass = (action) => ({
  'is-aggressive': ['OPEN', 'BET', 'RAISE'].includes(action.type),
  'is-fold': action.type === 'FOLD',
  'is-hero': isHeroAction(action),
})
const isHeroAction = (action) =>
  String(action.player || '')
    .trim()
    .toUpperCase() ===
  String(hand.value?.position || '')
    .trim()
    .toUpperCase()

const storedTournament = (() => {
  try {
    return JSON.parse(localStorage.getItem('pokerly-running-tournament')) || {}
  } catch {
    return {}
  }
})()

onMounted(async () => {
  if (!eventId.value || !levelId.value || !handId.value) return
  try {
    await handLogStore.fetchBlindLevelDetail(eventId.value, levelId.value)
    await handLogStore.fetchHandDetail(eventId.value, levelId.value, handId.value)
  } catch {
    alert.show('핸드 정보를 불러오지 못했습니다.', 'error')
  }
})

const goReviewEdit = () => {
  router.push({
    name: 'tournament-hand-review-edit',
    params: { levelName: levelId.value, handId: handId.value },
    query: {
      levelName: levelName.value,
      ...(route.query.eventId ? { eventId: route.query.eventId } : {}),
      ...(route.query.legacyEventId ? { legacyEventId: route.query.legacyEventId } : {}),
    },
  })
}
const goHandEdit = () => {
  menuOpen.value = false
  router.push({
    name: 'tournament-hand-edit',
    params: { levelName: levelId.value, handId: handId.value },
    query: {
      levelName: levelName.value,
      ...(route.query.eventId ? { eventId: route.query.eventId } : {}),
      ...(route.query.legacyEventId ? { legacyEventId: route.query.legacyEventId } : {}),
    },
  })
}
const openDeleteDialog = () => {
  menuOpen.value = false
  deleteDialogOpen.value = true
}
const confirmDelete = async () => {
  if (!eventId.value || !levelId.value || !handId.value) return
  try {
    await handLogStore.deleteHandFromBlindLevel(eventId.value, levelId.value, handId.value)
    deleteDialogOpen.value = false
    router.replace({
      name: 'tournament-level-detail',
      params: { levelName: levelId.value },
      query: { levelName: levelName.value },
    })
  } catch {
    alert.show('핸드를 삭제하지 못했습니다.', 'error')
  }
}

const goBack = () => {
  router.push({ name: 'tournament-level-detail', params: { levelName: levelId.value } })
}
</script>

<style scoped>
.hand-detail-page {
  display: grid;
  align-content: start;
  gap: 20px;
  min-height: 100%;
  padding: var(--v2-page-padding-top) var(--v2-page-padding-x) 180px;
}
.hand-detail-topbar {
  position: relative;
  display: grid;
  grid-template-columns: 40px minmax(0, 1fr) 40px;
  align-items: center;
  gap: 10px;
  min-height: 36px;
}
.hand-detail-topbar h1 {
  margin: 0;
  color: var(--v2-text-main);
  font-size: 21px;
  font-weight: 650;
  line-height: 1.2;
  text-align: center;
}
.icon-button {
  display: grid;
  width: 36px;
  height: 36px;
  place-items: center;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: var(--v2-text-main);
}
.hand-detail-topbar .icon-button:last-of-type {
  justify-self: end;
}
.icon-button:active {
  background: #efedf6;
}
.overflow-menu {
  position: absolute;
  z-index: 5;
  top: 42px;
  right: 0;
  width: 156px;
  overflow: hidden;
  border: 1px solid var(--v2-border);
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 12px 28px rgba(28, 18, 60, 0.16);
}
.overflow-menu button {
  display: flex;
  width: 100%;
  min-height: 42px;
  align-items: center;
  padding: 0 14px;
  border: 0;
  border-bottom: 1px solid var(--v2-border);
  background: #fff;
  color: var(--v2-text-main);
  font: inherit;
  font-size: 13px;
  font-weight: 520;
  text-align: left;
}
.overflow-menu button:last-child {
  border-bottom: 0;
}
.overflow-menu button:active {
  background: #faf9ff;
}
.overflow-menu .danger {
  color: #e23d48;
}
.hand-overview,
.review-empty,
.review-summary {
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-lg);
  background: #fff;
  box-shadow: 0 5px 14px rgba(28, 18, 60, 0.025);
}
.hand-state {
  padding: 28px 16px;
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-lg);
  background: #fff;
  color: var(--v2-text-sub);
  font-size: 13px;
  text-align: center;
}
.hand-overview {
  padding: 12px 14px 13px;
}
.overview-meta {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
}
.overview-meta > strong {
  font-size: 17px;
  font-weight: 600;
}
.overview-meta > b {
  justify-self: end;
  font-size: 14px;
  font-weight: 600;
}
.level-pill {
  justify-self: start;
  padding: 5px 8px;
  border-radius: 7px;
  background: var(--v2-primary-soft);
  color: var(--v2-primary);
  font-size: 12px;
  font-weight: 600;
}
.hero-cards {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin: 12px 0 14px;
}
.hero-cards span {
  display: grid;
  width: 56px;
  height: 76px;
  place-items: center;
  align-content: center;
  gap: 5px;
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-sm);
  color: var(--v2-text-main);
}
.hero-cards .red,
.board-cards .red {
  color: #e11d48;
}
.hero-cards b {
  font-size: 26px;
  line-height: 1;
}
.hero-cards em,
.board-cards em {
  font-style: normal;
  line-height: 1;
}
.hand-facts {
  overflow: hidden;
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-md);
}
.hand-facts > div {
  display: grid;
  grid-template-columns: 92px 1fr;
  align-items: center;
  min-height: 44px;
  padding: 7px 13px;
}
.hand-facts > div + div {
  border-top: 1px solid var(--v2-border);
}
.hand-facts span,
.summary-row > span {
  color: #504a5b;
  font-size: 12px;
  font-weight: 600;
}
.hand-facts p {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 6px;
  margin: 0;
}
.hand-facts p i {
  padding: 6px 10px;
  border-radius: 7px;
  background: #f3f1fa;
  color: #554c75;
  font-size: 11px;
  font-style: normal;
}
.hand-facts strong {
  justify-self: end;
  font-size: 13px;
}
.hand-facts .result--win {
  color: var(--v2-success);
}
.hand-facts .result--lose {
  color: var(--v2-danger);
}
.hand-facts .result--draw,
.hand-facts .result--neutral {
  color: var(--v2-text-sub);
}
.review-empty {
  display: grid;
  place-items: center;
  gap: 8px;
  padding: 22px 14px 14px;
  text-align: center;
}
.review-empty__icon {
  color: #a59bcf;
}
.review-empty > strong {
  margin-bottom: 9px;
  font-size: 15px;
}
.review-action {
  width: 100%;
  min-height: 48px;
  border: 0;
  border-radius: var(--v2-radius-md);
  background: var(--v2-primary);
  color: #fff;
  font: inherit;
  font-size: 14px;
  font-weight: 600;
}
.review-summary {
  padding: 14px;
}
.review-summary__heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}
.review-summary h2 {
  margin: 0;
  color: var(--v2-text-main);
  font-size: 15px;
  font-weight: 620;
}
.review-summary__heading > span {
  color: var(--v2-primary);
  font-size: 11px;
  font-weight: 600;
}
.summary-section {
  display: grid;
  gap: 9px;
  padding: 12px 0;
  border-top: 1px solid var(--v2-border);
}
.summary-section > strong {
  color: #504a5b;
  font-size: 12px;
  font-weight: 600;
}
.summary-row {
  display: grid;
  grid-template-columns: 45px 1fr;
  gap: 8px;
  align-items: start;
  margin-bottom: 12px;
}
.summary-section + .summary-row {
  padding-top: 12px;
  border-top: 1px solid var(--v2-border);
}
.summary-row p {
  margin: 0;
  color: #3f3a4e;
  font-size: 12px;
  line-height: 1.55;
  white-space: pre-line;
}
.review-board {
  display: grid;
  gap: 9px;
}
.review-board > div {
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr);
  align-items: center;
  gap: 8px;
}
.review-board > div > span {
  color: var(--v2-text-sub);
  font-size: 11px;
}
.board-cards {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.board-cards i {
  display: inline-flex;
  min-width: 34px;
  height: 34px;
  align-items: center;
  justify-content: center;
  gap: 2px;
  border: 1px solid var(--v2-border);
  border-radius: 7px;
  font-style: normal;
}
.board-cards b {
  font-size: 13px;
}
.review-showdown {
  display: grid;
  gap: 8px;
}
.review-showdown > div {
  display: flex;
  min-height: 42px;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 4px 0;
}
.review-showdown > div + div {
  border-top: 1px solid var(--v2-border);
}
.review-showdown > div > b {
  color: var(--v2-text-main);
  font-size: 12px;
  font-weight: 600;
}
.review-timeline {
  display: grid;
  gap: 14px;
}
.review-timeline__street {
  display: grid;
  grid-template-columns: 46px minmax(0, 1fr);
  gap: 8px;
}
.review-timeline__street-heading {
  padding-top: 2px;
}
.review-timeline__street-heading span {
  display: inline-flex;
  min-height: 24px;
  align-items: center;
  padding: 0 8px;
  border-radius: 999px;
  background: #f0ebff;
  color: var(--v2-primary);
  font-size: 10px;
  font-weight: 650;
  white-space: nowrap;
}
.review-timeline ol {
  display: grid;
  gap: 2px;
  margin: 0;
  padding: 0;
  list-style: none;
}
.review-timeline li {
  position: relative;
  display: grid;
  grid-template-columns: 14px 56px minmax(0, 1fr);
  align-items: center;
  gap: 5px;
  min-height: 36px;
}
.review-timeline li::before {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 6px;
  width: 1px;
  background: #e4dff0;
  content: '';
}
.review-timeline li:first-child::before {
  top: 50%;
}
.review-timeline li:last-child::before {
  bottom: 50%;
}
.review-timeline li:only-child::before {
  display: none;
}
.review-timeline li > i {
  position: relative;
  z-index: 1;
  width: 7px;
  height: 7px;
  margin-left: 3px;
  border: 2px solid #fff;
  border-radius: 50%;
  background: #aaa3b8;
  box-shadow: 0 0 0 1px #d8d2e3;
}
.review-timeline li > b {
  display: inline-grid;
  grid-template-columns: minmax(28px, max-content) 18px;
  align-items: center;
  gap: 4px;
  color: var(--v2-text-main);
  font-size: 11px;
  font-weight: 650;
  white-space: nowrap;
}
.review-timeline li > b small {
  display: inline-flex;
  min-width: 18px;
  height: 18px;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: #f0ebff;
  color: var(--v2-primary);
  font-size: 9px;
  font-weight: 700;
}
.review-action-badges {
  display: flex;
  min-width: 0;
  flex-wrap: nowrap;
  align-items: center;
  gap: 4px;
}
.review-action-badge {
  display: inline-flex;
  min-height: 26px;
  align-items: center;
  padding: 5px 7px;
  border-radius: 8px;
  background: #f7f5fa;
  color: #3f3a4e;
  font-size: 11px;
  font-weight: 560;
  line-height: 1.25;
  white-space: nowrap;
}
.review-action-badge--amount {
  color: var(--v2-text-sub);
  font-variant-numeric: tabular-nums;
}
.review-action-badge--all-in {
  background: #fff0f1;
  color: #e5484d;
  font-weight: 700;
}
.review-timeline li.is-hero > i {
  width: 9px;
  height: 9px;
  margin-left: 2px;
  background: var(--v2-primary);
  box-shadow: 0 0 0 2px #e5dcff;
}
.review-timeline li.is-aggressive > i {
  background: var(--v2-primary);
  box-shadow: 0 0 0 1px #a98cff;
}
.review-timeline li.is-aggressive .review-action-badge--type,
.review-timeline li.is-aggressive .review-action-badge--amount {
  background: #f0ebff;
  color: var(--v2-primary);
  font-weight: 620;
}
.review-timeline li.is-fold {
  opacity: 0.58;
}
.street-list {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 7px;
}
.street-list i {
  font-style: normal;
}
.street-list i + i::before {
  margin-right: 7px;
  color: #aaa3b8;
  content: '·';
}
.review-summary .review-action {
  margin-top: 5px;
}
.delete-dialog {
  width: min(calc(100vw - 40px), 360px);
  padding: 24px;
  border-radius: var(--v2-radius-lg);
  background: #fff;
}
.delete-dialog h2 {
  margin: 0 0 22px;
  color: var(--v2-text-main);
  font-size: 19px;
  font-weight: 620;
}
.delete-dialog > div {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}
.delete-dialog button {
  height: 44px;
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-sm);
  background: #fff;
  color: var(--v2-text-main);
  font: inherit;
  font-size: 14px;
  font-weight: 560;
}
.delete-dialog button.danger {
  border-color: var(--v2-danger);
  color: var(--v2-danger);
}
</style>
