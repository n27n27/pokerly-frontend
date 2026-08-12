<template>
  <q-page class="equity-page">
    <header class="equity-topbar">
      <h1>에퀴티 계산기</h1>
    </header>

    <section class="panel player-panel">
      <div class="panel-header">
        <h2>플레이어</h2>
        <button type="button" @click="addPlayer">
          <q-icon name="add" size="18px" />
          플레이어 추가
        </button>
      </div>

      <div class="player-list">
        <article v-for="(player, playerIndex) in players" :key="player.id" class="player-row">
          <span class="player-badge">{{ playerIndex + 1 }}</span>
          <strong>{{ player.name }}</strong>
          <div class="card-pair">
            <button
              v-for="(_, cardIndex) in player.cards"
              :key="cardIndex"
              class="card-slot"
              :class="{ red: player.cards[cardIndex]?.red, empty: !player.cards[cardIndex] }"
              type="button"
              @click="openPicker('player', playerIndex, cardIndex)"
            >
              <template v-if="player.cards[cardIndex]">
                <b>{{ player.cards[cardIndex].rank }}</b>
                <em>{{ player.cards[cardIndex].suit }}</em>
              </template>
              <q-icon v-else name="add" size="18px" />
            </button>
          </div>
          <button
            v-if="players.length > 2 && playerIndex > 0"
            class="icon-button"
            type="button"
            aria-label="삭제"
            @click="removePlayer(playerIndex)"
          >
            <q-icon name="close" size="17px" />
          </button>
          <span v-else class="icon-spacer" aria-hidden="true"></span>
        </article>
      </div>
    </section>

    <section class="panel">
      <div class="panel-header">
        <h2>보드 <span>(선택)</span></h2>
        <button type="button" @click="clearBoard">
          <q-icon name="refresh" size="18px" />
          보드 초기화
        </button>
      </div>
      <div class="board-row">
        <button
          v-for="(_, cardIndex) in board"
          :key="cardIndex"
          class="card-slot"
          :class="{ red: board[cardIndex]?.red, empty: !board[cardIndex] }"
          type="button"
          @click="openPicker('board', 0, cardIndex)"
        >
          <template v-if="board[cardIndex]">
            <b>{{ board[cardIndex].rank }}</b>
            <em>{{ board[cardIndex].suit }}</em>
          </template>
          <q-icon v-else name="add" size="20px" />
        </button>
      </div>
    </section>

    <StickyPrimaryAction
      label="계산하기"
      loading-label="계산 중..."
      icon="calculate"
      :loading="calculating"
      @click="calculateEquity"
    />

    <section v-if="results.length" class="panel">
      <div class="panel-header">
        <h2>결과 <span>(승률)</span></h2>
      </div>
      <div class="result-list">
        <article v-for="result in results" :key="result.id" class="result-row">
          <span class="player-badge">{{ result.index }}</span>
          <strong>{{ result.name }}</strong>
          <span class="result-hand">
            <span v-for="card in result.cards" :key="card.code" :class="{ red: card.red }">
              {{ card.rank }}{{ card.suit }}
            </span>
          </span>
          <em>{{ result.win.toFixed(2) }}%</em>
        </article>
      </div>
    </section>

    <section v-if="results.length" class="panel analysis-panel">
      <div class="panel-header">
        <h2>상세 분석</h2>
        <q-icon name="keyboard_arrow_up" size="20px" />
      </div>

      <div v-if="heroVsOthersSummary" class="heads-up">
        <div>
          <strong>{{ heroVsOthersSummary.hero.name }}</strong>
          <em>{{ heroVsOthersSummary.hero.win.toFixed(2) }}%</em>
        </div>
        <dl>
          <div>
            <dt>Hero Win</dt>
            <dd>{{ heroVsOthersSummary.hero.win.toFixed(2) }}%</dd>
          </div>
          <div>
            <dt>Tie</dt>
            <dd>{{ heroVsOthersSummary.tie.toFixed(2) }}%</dd>
          </div>
        </dl>
        <div>
          <strong>{{ heroVsOthersSummary.others.name }}</strong>
          <em>{{ heroVsOthersSummary.others.win.toFixed(2) }}%</em>
        </div>
      </div>

      <h3>핸드 랭크 분포</h3>
      <table>
        <thead>
          <tr>
            <th>핸드 랭크</th>
            <th v-for="result in analysisResults" :key="result.id">{{ result.name }} (%)</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="rank in rankRows" :key="rank.key">
            <td>{{ rank.label }}</td>
            <td v-for="result in analysisResults" :key="`${result.id}-${rank.key}`">
              {{ result.distribution[rank.key].toFixed(2) }}%
            </td>
          </tr>
        </tbody>
      </table>
      <p class="note">확률은 가능한 보드 조합을 기준으로 계산됩니다.</p>
    </section>

    <CardPickerSheet
      v-model="pickerOpen"
      :active-card="activePickerCard"
      :used-codes="pickerUsedCodes"
      @select="selectCard"
      @clear="clearActiveCard"
    />
  </q-page>
</template>

<script setup>
import { computed, onBeforeUnmount, reactive, ref } from 'vue'

import CardPickerSheet from 'src/shared/components/CardPickerSheet.vue'
import StickyPrimaryAction from 'src/shared/components/StickyPrimaryAction.vue'

const rankValue = { A: 14, K: 13, Q: 12, J: 11, T: 10, 9: 9, 8: 8, 7: 7, 6: 6, 5: 5, 4: 4, 3: 3, 2: 2 }
const handRanks = [
  { key: 'straightFlush', label: '스트레이트 플러시' },
  { key: 'quads', label: '포카드' },
  { key: 'fullHouse', label: '풀 하우스' },
  { key: 'flush', label: '플러시' },
  { key: 'straight', label: '스트레이트' },
  { key: 'trips', label: '트리플' },
  { key: 'twoPair', label: '투 페어' },
  { key: 'pair', label: '원 페어' },
  { key: 'highCard', label: '하이 카드' },
]
const rankRows = [...handRanks].reverse()

const makeCard = (rank, suit) => ({
  rank,
  suit,
  value: rankValue[rank],
  code: `${rank}${suit}`,
  red: suit === '♥' || suit === '♦',
})

const players = reactive([
  { id: 1, name: 'Hero', cards: [null, null] },
  { id: 2, name: 'Villain 1', cards: [null, null] },
  { id: 3, name: 'Villain 2', cards: [null, null] },
])
const board = reactive([null, null, null, null, null])
const results = ref([])
const resultCache = new Map()
const calculating = ref(false)
const pickerOpen = ref(false)
const pickerTarget = ref(null)
const activePickerCard = computed(() => {
  if (!pickerTarget.value) return null
  return pickerTarget.value.type === 'player'
    ? players[pickerTarget.value.playerIndex].cards[pickerTarget.value.cardIndex]
    : board[pickerTarget.value.cardIndex]
})

const usedCodes = computed(() => {
  return [...players.flatMap((player) => player.cards), ...board].filter(Boolean).map((card) => card.code)
})
const pickerUsedCodes = computed(() => usedCodes.value
  .filter((code) => code !== activePickerCard.value?.code)
  .map((code) => code.replace(/^T/, '10')))

const heroVsOthersSummary = computed(() => {
  if (results.value.length < 2) return null
  const hero = results.value[0]
  const others = results.value.slice(1)

  return {
    hero,
    others: {
      name: 'Others',
      win: others.reduce((sum, result) => sum + result.win, 0),
    },
    tie: hero.tie,
  }
})
const analysisResults = computed(() => {
  if (results.value.length <= 2) return results.value
  const hero = results.value[0]
  const others = results.value.slice(1)

  return [
    hero,
    {
      id: 'others',
      name: 'Others',
      distribution: Object.fromEntries(
        handRanks.map((rank) => [
          rank.key,
          others.reduce((sum, result) => sum + result.distribution[rank.key], 0) / Math.max(1, others.length),
        ]),
      ),
    },
  ]
})

const openPicker = (type, playerIndex, cardIndex) => {
  pickerTarget.value = { type, playerIndex, cardIndex }
  pickerOpen.value = true
}

const selectCard = (card) => {
  if (!pickerTarget.value) return
  const target = { ...pickerTarget.value }
  const normalizedCard = makeCard(card.rank === '10' ? 'T' : card.rank, card.suit)
  if (target.type === 'player') {
    const playerCards = players[target.playerIndex].cards
    playerCards[target.cardIndex] = normalizedCard
    const nextCardIndex = playerCards.findIndex((item, index) => !item && index !== target.cardIndex)
    if (nextCardIndex >= 0) {
      pickerTarget.value = { ...target, cardIndex: nextCardIndex }
      return
    }
  } else {
    board[target.cardIndex] = normalizedCard
    const nextCardIndex = board.findIndex((item, index) => !item && index > target.cardIndex)
    if (nextCardIndex >= 0) {
      pickerTarget.value = { ...target, cardIndex: nextCardIndex }
      return
    }
  }
  pickerOpen.value = false
}
const clearActiveCard = () => {
  if (!pickerTarget.value) return
  if (pickerTarget.value.type === 'player') {
    players[pickerTarget.value.playerIndex].cards[pickerTarget.value.cardIndex] = null
  } else {
    board[pickerTarget.value.cardIndex] = null
  }
  pickerOpen.value = false
}

const addPlayer = () => {
  if (players.length >= 6) return
  players.push({ id: Date.now(), name: `Villain ${players.length}`, cards: [null, null] })
}

const removePlayer = (index) => {
  if (players.length <= 2 || index === 0) return
  players.splice(index, 1)
}

const clearBoard = () => {
  board.splice(0, board.length, null, null, null, null, null)
}

const handLabel = (cards) => (cards.every(Boolean) ? cards.map((card) => `${card.rank}${card.suit}`).join(' ') : '—')
const suitCodes = { '♠': 's', '♥': 'h', '♦': 'd', '♣': 'c' }
const toEvaluatorCard = (card) => `${card.rank}${suitCodes[card.suit]}`
const equityWorker = new Worker(new URL('../workers/equity.worker.js', import.meta.url), { type: 'module' })
let nextRequestId = 0

const calculateInWorker = (payload) => new Promise((resolve, reject) => {
  const requestId = ++nextRequestId
  const handleMessage = ({ data }) => {
    if (data.requestId !== requestId) return
    equityWorker.removeEventListener('message', handleMessage)
    equityWorker.removeEventListener('error', handleError)
    if (data.error) reject(new Error(data.error))
    else resolve(data.results)
  }
  const handleError = (event) => {
    equityWorker.removeEventListener('message', handleMessage)
    equityWorker.removeEventListener('error', handleError)
    reject(event.error || new Error(event.message || '에큐티 계산에 실패했습니다.'))
  }
  equityWorker.addEventListener('message', handleMessage)
  equityWorker.addEventListener('error', handleError)
  equityWorker.postMessage({ requestId, payload })
})

onBeforeUnmount(() => equityWorker.terminate())

const calculateEquity = async () => {
  const activePlayers = players.filter((player) => player.cards.every(Boolean))
  if (activePlayers.length < 2) return
  const cacheKey = JSON.stringify({
    players: activePlayers.map((player) => player.cards.map((card) => card.code)),
    board: board.map((card) => card?.code || null),
  })
  if (resultCache.has(cacheKey)) {
    results.value = resultCache.get(cacheKey)
    return
  }
  calculating.value = true
  try {
    const calculated = await calculateInWorker({
      players: activePlayers.map((player) => ({
        cards: player.cards.map(toEvaluatorCard),
      })),
      board: board.filter(Boolean).map(toEvaluatorCard),
    })
    results.value = activePlayers.map((player, index) => ({
      ...calculated[index],
      id: player.id,
      index: index + 1,
      name: player.name,
      hand: handLabel(player.cards),
      cards: player.cards.map((card) => ({ ...card })),
    }))
    resultCache.set(cacheKey, results.value)
  } finally {
    calculating.value = false
  }
}

</script>

<style scoped>
.equity-page {
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
  padding: var(--v2-page-padding-top) var(--v2-page-padding-x) 180px;
}

.equity-topbar {
  margin: 0 0 20px;
  display: grid;
  justify-items: start;
}

.equity-topbar h1 {
  margin: 0;
  color: var(--v2-text-main);
  font-size: 22px;
  font-weight: 560;
  line-height: 1;
  text-align: left;
}

.note {
  margin: 0;
  color: var(--v2-text-sub);
  font-size: 12px;
  font-weight: 430;
  line-height: 1.45;
}

.panel {
  margin-bottom: 8px;
  padding: 12px;
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-lg);
  background: #ffffff;
  box-shadow: 0 5px 14px rgba(28, 18, 60, 0.025);
}

.player-panel {
  padding-top: 11px;
  padding-bottom: 11px;
}

.player-panel .panel-header {
  margin-bottom: 7px;
}

.player-panel .player-row {
  min-height: 68px;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 6px;
}

.panel-header h2 {
  margin: 0;
  color: var(--v2-text-main);
  font-size: 14px;
  font-weight: 560;
  line-height: 1;
}

.panel-header h2 span {
  color: var(--v2-text-sub);
  font-weight: 430;
}

.panel-header button {
  border: 0;
  background: transparent;
  color: var(--v2-primary);
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font: inherit;
  font-size: 12px;
  font-weight: 520;
  line-height: 1;
}

.player-list,
.result-list {
  display: grid;
}

.player-row,
.result-row {
  min-height: 36px;
  border-bottom: 1px solid var(--v2-border);
  display: grid;
  grid-template-columns: 22px minmax(0, 1fr) auto 24px;
  align-items: center;
  gap: 8px;
}

.player-row:last-child,
.result-row:last-child {
  border-bottom: 0;
}

.player-badge {
  display: grid;
  width: 21px;
  height: 21px;
  place-items: center;
  border-radius: 6px;
  background: var(--v2-primary);
  color: #ffffff;
  font-size: 11px;
  font-weight: 560;
}

.player-row strong,
.result-row strong {
  color: var(--v2-text-main);
  font-size: 13px;
  font-weight: 560;
}

.card-pair,
.board-row {
  display: flex;
  gap: 7px;
}

.card-slot {
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-sm);
  background: #ffffff;
  color: var(--v2-text-main);
  display: grid;
  place-items: center;
  align-content: center;
  gap: 1px;
  font: inherit;
}

.card-slot {
  width: 46px;
  height: 58px;
}

.card-slot.empty {
  border-style: dashed;
  color: #aaa1c4;
}

.card-slot.red {
  color: #e11d48;
}

.card-slot b {
  font-size: 17px;
  font-weight: 560;
  line-height: 1;
}

.card-slot em {
  font-family: Arial, sans-serif;
  font-size: 16px;
  font-style: normal;
  font-weight: 650;
  line-height: 1;
}

.icon-button {
  width: 24px;
  height: 24px;
  padding: 0;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: #8b849b;
}

.icon-spacer {
  width: 24px;
  height: 24px;
}

.board-row {
  overflow-x: auto;
  padding-bottom: 0;
}

.result-row {
  grid-template-columns: 24px minmax(0, 1fr) auto 70px;
}

.result-hand {
  color: var(--v2-text-main);
  font-size: 12px;
  display: inline-flex;
  gap: 3px;
}

.result-hand .red {
  color: #e11d48;
}

.result-row em,
.total-row em {
  color: var(--v2-success);
  font-size: 15px;
  font-style: normal;
  font-weight: 560;
  text-align: right;
}

.total-row {
  padding-top: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: var(--v2-text-main);
  font-size: 13px;
}

.heads-up {
  padding: 10px;
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-md);
  display: grid;
  grid-template-columns: 1fr 64px 1fr;
  gap: 10px;
  text-align: center;
}

.heads-up strong {
  display: block;
  color: var(--v2-text-main);
  font-size: 12px;
  font-weight: 560;
}

.heads-up em {
  display: block;
  margin-top: 10px;
  color: var(--v2-text-main);
  font-size: 22px;
  font-style: normal;
  font-weight: 560;
}

.heads-up dl,
.heads-up dt,
.heads-up dd {
  margin: 0;
}

.heads-up dl {
  display: grid;
  gap: 8px;
  align-content: center;
  color: var(--v2-text-sub);
  font-size: 11px;
}

.analysis-panel h3 {
  margin: 12px 0 6px;
  color: var(--v2-text-main);
  font-size: 13px;
  font-weight: 560;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}

th,
td {
  padding: 8px 0;
  border-bottom: 1px solid var(--v2-border);
  color: var(--v2-text-sub);
  text-align: right;
}

th:first-child,
td:first-child {
  color: var(--v2-text-main);
  text-align: left;
}

</style>
