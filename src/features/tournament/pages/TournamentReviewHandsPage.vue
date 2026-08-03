<template>
  <q-page class="review-hands-page">
    <header class="review-topbar">
      <button type="button" aria-label="뒤로 가기" @click="router.back()">
        <q-icon name="chevron_left" size="28px" />
      </button>
      <h1>기록 핸드</h1>
      <span aria-hidden="true"></span>
    </header>

    <section class="hand-list" aria-label="기록 핸드 목록">
      <article
        v-for="hand in hands"
        :key="hand.id"
        class="hand-row"
        role="button"
        tabindex="0"
        @click="openHand(hand)"
        @keyup.enter="openHand(hand)"
      >
        <div class="cards">
          <span v-for="card in hand.cards" :key="card.rank + card.suit" :class="{ red: card.red }">
            <b>{{ card.rank }}</b>
            <em>{{ card.suit }}</em>
          </span>
        </div>

        <div class="hand-row__main">
          <strong>{{ hand.level }}</strong>
          <span>{{ hand.position }}</span>
        </div>

        <span class="hand-row__result" :class="`hand-row__result--${hand.tone}`">
          {{ hand.result }}
        </span>
      </article>
      <div v-if="!hands.length" class="hand-list__empty">기록된 핸드가 없습니다.</div>
    </section>
  </q-page>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { fetchGameSession } from 'src/api/gameSession'
import { useAlert } from 'src/composables/useAlert'
import { useHandLogStore } from 'src/stores/handLog'

const route = useRoute()
const router = useRouter()
const alert = useAlert()
const handLogStore = useHandLogStore()
const runningTournament = (() => {
  try {
    return JSON.parse(localStorage.getItem('pokerly-running-tournament')) || {}
  } catch {
    return {}
  }
})()
const tournamentId = computed(() => route.params.tournamentId)

const cardsOf = (hand) => {
  const ranks =
    [hand.firstRank, hand.secondRank].filter(Boolean).length === 2
      ? [hand.firstRank, hand.secondRank]
      : String(hand.holeCards || hand.hand || '').match(/10|[AKQJT2-9]/gi)?.slice(0, 2) || []
  const suits = [hand.firstSuit, hand.secondSuit]
  return ranks.map((rank, index) => {
    const suit = suits[index] || (hand.suited ? '♠' : index === 0 ? '♠' : '♥')
    return {
      rank: String(rank).toUpperCase() === '10' ? 'T' : String(rank).toUpperCase(),
      suit,
      red: ['♥', '♦'].includes(suit),
    }
  })
}

const resultOf = (hand) => {
  const value = hand.resultType || hand.result
  if (['SHOWDOWN_WIN', 'NON_SHOWDOWN_WIN', 'WIN'].includes(value)) {
    return { result: '승리', tone: 'win' }
  }
  if (['CHOP', 'DRAW'].includes(value)) return { result: '찹', tone: 'draw' }
  if (['SHOWDOWN_LOSS', 'PREFLOP_FOLD', 'POSTFLOP_FOLD', 'LOSS', 'FOLD'].includes(value)) {
    return { result: '패배', tone: 'lose' }
  }
  return { result: '미기록', tone: 'neutral' }
}

const hands = computed(() =>
  (handLogStore.selectedEvent?.blindLevels || []).flatMap((level) =>
    (level.hands || [])
      .map((hand) => ({
        id: hand.id,
        levelId: level.id,
        level: `L${level.levelNo}`,
        position: hand.position || '-',
        cards: cardsOf(hand),
        ...resultOf(hand),
      })),
  ),
)

const openHand = (hand) => {
  router.push({
    name: 'tournament-hand-detail',
    params: { levelName: hand.levelId, handId: hand.id },
    query: { levelName: hand.level, ...(route.query.legacyEventId ? { legacyEventId: route.query.legacyEventId } : {}) },
  })
}

onMounted(async () => {
  if (!tournamentId.value) return
  try {
    const legacyEventId = route.query.legacyEventId
    const session = legacyEventId ? null : await fetchGameSession(tournamentId.value)
    const eventId = legacyEventId || session?.handLogEventId ||
      (String(runningTournament.sessionId) === String(tournamentId.value)
        ? runningTournament.eventId
        : null)

    if (!eventId) {
      handLogStore.selectedEvent = null
      return
    }

    await handLogStore.fetchEventDetail(eventId)
  } catch (error) {
    if (error?.response?.status === 404) {
      handLogStore.selectedEvent = null
      return
    }
    alert.show('복기 핸드를 불러오지 못했습니다.', 'error')
  }
})
</script>

<style scoped>
.review-hands-page {
  display: grid;
  align-content: start;
  gap: 20px;
  min-height: 100%;
  padding: var(--v2-page-padding-top) var(--v2-page-padding-x) 112px;
}

.review-hands-page *,
.review-hands-page *::before,
.review-hands-page *::after {
  box-sizing: border-box;
}

.review-topbar {
  display: grid;
  min-height: 36px;
  grid-template-columns: 40px minmax(0, 1fr) 40px;
  align-items: center;
  gap: 10px;
}

.review-topbar button {
  display: grid;
  width: 36px;
  height: 36px;
  place-items: center;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--v2-text-main);
}

.review-topbar h1 {
  margin: 0;
  color: var(--v2-text-main);
  font-size: 17px;
  font-weight: 560;
  line-height: 1.2;
  text-align: center;
}

.hand-list {
  overflow: hidden;
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-lg);
  background: #ffffff;
}

.hand-list__empty {
  display: grid;
  min-height: 110px;
  place-items: center;
  color: var(--v2-text-sub);
  font-size: 13px;
}

.hand-row {
  display: grid;
  min-height: 74px;
  grid-template-columns: 104px minmax(0, 1fr) auto;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-bottom: 1px solid var(--v2-border);
  cursor: pointer;
  transition: background 150ms ease;
}

.hand-row:last-child {
  border-bottom: 0;
}

.hand-row:active {
  background: #faf9ff;
}

.cards {
  display: grid;
  grid-template-columns: repeat(2, 46px);
  gap: 6px;
}

.cards span {
  display: grid;
  height: 52px;
  place-items: center;
  align-content: center;
  gap: 2px;
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-sm);
  background: #ffffff;
  color: var(--v2-text-main);
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
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 6px;
}

.hand-row__main strong,
.hand-row__main span {
  padding: 3px 7px;
  border-radius: var(--v2-radius-sm);
  font-size: 12px;
  line-height: 1.2;
}

.hand-row__main strong {
  background: var(--v2-primary-soft);
  color: var(--v2-primary);
  font-weight: 560;
}

.hand-row__main span {
  background: #f1eff6;
  color: #777188;
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

.hand-row__result--lose {
  background: rgba(239, 68, 68, 0.1);
  color: var(--v2-danger);
}

@media (max-width: 420px) {
  .hand-row {
    grid-template-columns: 84px minmax(0, 1fr) auto;
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

  .hand-row__main {
    gap: 4px;
  }

  .hand-row__main strong,
  .hand-row__main span {
    padding: 3px 5px;
    font-size: 11px;
  }

  .hand-row__result {
    padding: 7px 8px;
    font-size: 12px;
  }
}
</style>
