<template>
  <q-page class="equity-page">
    <header class="equity-topbar">
      <button type="button" aria-label="뒤로 가기" @click="router.back()">
        <q-icon name="arrow_back" size="24px" />
      </button>
      <h1>에퀴티 계산기</h1>
      <button type="button" aria-label="정보">
        <q-icon name="info" size="22px" />
      </button>
    </header>

    <section class="equity-intro">
      <p>여러 핸드와 보드를 입력하여 각 핸드의 에퀴티를 계산해 보세요.</p>
    </section>

    <section class="panel">
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
              class="small-card"
              :class="{ red: player.cards[cardIndex]?.red }"
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
          <button class="icon-button" type="button" aria-label="삭제" @click="removePlayer(playerIndex)">
            <q-icon name="delete_outline" size="20px" />
          </button>
        </article>
      </div>

      <p class="hint">
        <q-icon name="lightbulb" size="17px" />
        카드를 클릭하여 선택하거나, 다시 클릭하면 변경할 수 있습니다.
      </p>
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
          class="board-card"
          :class="{ red: board[cardIndex]?.red }"
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

    <button class="calculate-button" type="button" :disabled="calculating" @click="calculateEquity">
      <q-icon name="calculate" size="19px" />
      {{ calculating ? '계산 중...' : '계산하기' }}
    </button>

    <section class="panel">
      <div class="panel-header">
        <h2>결과 <span>(에퀴티)</span></h2>
        <q-icon name="info" size="18px" />
      </div>
      <div class="result-list">
        <article v-for="result in results" :key="result.id" class="result-row">
          <span class="player-badge">{{ result.index }}</span>
          <strong>{{ result.name }}</strong>
          <span class="result-hand">{{ result.hand }}</span>
          <em>{{ result.equity.toFixed(2) }}%</em>
        </article>
      </div>
      <div class="total-row">
        <strong>합계</strong>
        <em>{{ totalEquity.toFixed(2) }}%</em>
      </div>
    </section>

    <section class="panel analysis-panel">
      <div class="panel-header">
        <h2>상세 분석</h2>
        <q-icon name="keyboard_arrow_up" size="20px" />
      </div>

      <div v-if="headsUpSummary" class="heads-up">
        <div>
          <strong>{{ headsUpSummary.left.name }}</strong>
          <em>{{ headsUpSummary.left.equity.toFixed(2) }}%</em>
        </div>
        <dl>
          <div>
            <dt>Win</dt>
            <dd>{{ headsUpSummary.left.win.toFixed(2) }}%</dd>
          </div>
          <div>
            <dt>Tie</dt>
            <dd>{{ headsUpSummary.tie.toFixed(2) }}%</dd>
          </div>
        </dl>
        <div>
          <strong>{{ headsUpSummary.right.name }}</strong>
          <em>{{ headsUpSummary.right.equity.toFixed(2) }}%</em>
        </div>
      </div>

      <h3>핸드 랭크 분포</h3>
      <table>
        <thead>
          <tr>
            <th>핸드 랭크</th>
            <th v-for="result in results.slice(0, 2)" :key="result.id">{{ result.name }} (%)</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="rank in rankRows" :key="rank.key">
            <td>{{ rank.label }}</td>
            <td v-for="result in results.slice(0, 2)" :key="`${result.id}-${rank.key}`">
              {{ result.distribution[rank.key].toFixed(2) }}%
            </td>
          </tr>
        </tbody>
      </table>
      <p class="note">확률은 가능한 보드 조합을 기준으로 계산됩니다.</p>
    </section>

    <q-dialog v-model="pickerOpen">
      <div class="picker">
        <div class="picker-header">
          <h2>카드 선택</h2>
          <button type="button" @click="pickerOpen = false">
            <q-icon name="close" size="20px" />
          </button>
        </div>
        <div class="picker-grid">
          <button
            v-for="card in deck"
            :key="card.code"
            class="picker-card"
            :class="{ red: card.red, disabled: isCardUsed(card) }"
            type="button"
            :disabled="isCardUsed(card)"
            @click="selectCard(card)"
          >
            <b>{{ card.rank }}</b>
            <em>{{ card.suit }}</em>
          </button>
        </div>
      </div>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { computed, nextTick, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const ranks = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2']
const suits = ['♠', '♥', '♦', '♣']
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

const deck = ranks.flatMap((rank) => suits.map((suit) => makeCard(rank, suit)))
const players = reactive([
  { id: 1, name: 'Hero', cards: [makeCard('A', '♠'), makeCard('K', '♥')] },
  { id: 2, name: 'Villain 1', cards: [makeCard('Q', '♣'), makeCard('Q', '♦')] },
  { id: 3, name: 'Villain 2', cards: [null, null] },
])
const board = reactive([null, null, null, null, null])
const results = ref([])
const calculating = ref(false)
const pickerOpen = ref(false)
const pickerTarget = ref(null)

const usedCodes = computed(() => {
  return [...players.flatMap((player) => player.cards), ...board].filter(Boolean).map((card) => card.code)
})

const totalEquity = computed(() => results.value.reduce((sum, result) => sum + result.equity, 0))
const headsUpSummary = computed(() => {
  if (results.value.length < 2) return null
  return {
    left: results.value[0],
    right: results.value[1],
    tie: Math.min(results.value[0].tie, results.value[1].tie),
  }
})

const isCardUsed = (card) => usedCodes.value.includes(card.code)
const openPicker = (type, playerIndex, cardIndex) => {
  pickerTarget.value = { type, playerIndex, cardIndex }
  pickerOpen.value = true
}

const selectCard = (card) => {
  if (!pickerTarget.value) return
  if (pickerTarget.value.type === 'player') {
    players[pickerTarget.value.playerIndex].cards[pickerTarget.value.cardIndex] = card
  } else {
    board[pickerTarget.value.cardIndex] = card
  }
  pickerOpen.value = false
}

const addPlayer = () => {
  if (players.length >= 6) return
  players.push({ id: Date.now(), name: `Villain ${players.length}`, cards: [null, null] })
}

const removePlayer = (index) => {
  if (players.length <= 2) return
  players.splice(index, 1)
}

const clearBoard = () => {
  board.splice(0, board.length, null, null, null, null, null)
}

const emptyDistribution = () => handRanks.reduce((map, rank) => ({ ...map, [rank.key]: 0 }), {})
const handLabel = (cards) => (cards.every(Boolean) ? cards.map((card) => `${card.rank}${card.suit}`).join(' ') : '—')
const combinations = (items, size) => {
  if (size === 0) return [[]]
  const result = []
  const walk = (start, combo) => {
    if (combo.length === size) {
      result.push(combo)
      return
    }
    for (let i = start; i <= items.length - (size - combo.length); i += 1) walk(i + 1, [...combo, items[i]])
  }
  walk(0, [])
  return result
}

const countCombinations = (n, r) => {
  if (r < 0 || r > n) return 0
  if (r === 0 || r === n) return 1
  let result = 1
  for (let i = 1; i <= r; i += 1) {
    result = (result * (n - r + i)) / i
  }
  return Math.round(result)
}

const sampledCombinations = (items, size, count) => {
  if (size === 0) return [[]]
  const samples = []

  for (let sampleIndex = 0; sampleIndex < count; sampleIndex += 1) {
    const pool = [...items]
    const combo = []
    let seed = (sampleIndex + 1) * 9301 + size * 49297

    for (let pick = 0; pick < size; pick += 1) {
      seed = (seed * 233280 + 49297) % 233281
      const index = seed % pool.length
      combo.push(pool.splice(index, 1)[0])
    }

    samples.push(combo)
  }

  return samples
}

const compareScore = (a, b) => {
  for (let i = 0; i < Math.max(a.length, b.length); i += 1) {
    if ((a[i] ?? 0) !== (b[i] ?? 0)) return (a[i] ?? 0) - (b[i] ?? 0)
  }
  return 0
}

const evaluateFive = (cards) => {
  const values = cards.map((card) => card.value).sort((a, b) => b - a)
  const counts = values.reduce((map, value) => ({ ...map, [value]: (map[value] || 0) + 1 }), {})
  const groups = Object.entries(counts)
    .map(([value, count]) => ({ value: Number(value), count }))
    .sort((a, b) => b.count - a.count || b.value - a.value)
  const flush = cards.every((card) => card.suit === cards[0].suit)
  const unique = [...new Set(values)]
  if (unique.includes(14)) unique.push(1)
  let straightHigh = 0
  for (let i = 0; i <= unique.length - 5; i += 1) {
    const run = unique.slice(i, i + 5)
    if (run[0] - run[4] === 4) {
      straightHigh = run[0]
      break
    }
  }

  if (flush && straightHigh) return { key: 'straightFlush', score: [8, straightHigh] }
  if (groups[0].count === 4) return { key: 'quads', score: [7, groups[0].value, groups[1].value] }
  if (groups[0].count === 3 && groups[1].count === 2) return { key: 'fullHouse', score: [6, groups[0].value, groups[1].value] }
  if (flush) return { key: 'flush', score: [5, ...values] }
  if (straightHigh) return { key: 'straight', score: [4, straightHigh] }
  if (groups[0].count === 3) return { key: 'trips', score: [3, groups[0].value, ...groups.slice(1).map((group) => group.value)] }
  if (groups[0].count === 2 && groups[1].count === 2) return { key: 'twoPair', score: [2, groups[0].value, groups[1].value, groups[2].value] }
  if (groups[0].count === 2) return { key: 'pair', score: [1, groups[0].value, ...groups.slice(1).map((group) => group.value)] }
  return { key: 'highCard', score: [0, ...values] }
}

const evaluateBest = (cards) => {
  return combinations(cards, 5).reduce((best, combo) => {
    const current = evaluateFive(combo)
    return !best || compareScore(current.score, best.score) > 0 ? current : best
  }, null)
}

const calculateEquity = () => {
  const activePlayers = players.filter((player) => player.cards.every(Boolean))
  if (activePlayers.length < 2) return
  calculating.value = true
  const knownBoard = board.filter(Boolean)
  const remaining = deck.filter((card) => !usedCodes.value.includes(card.code))
  const cardsToCome = 5 - knownBoard.length
  const totalRunoutCount = countCombinations(remaining.length, cardsToCome)
  const runouts =
    totalRunoutCount > 12000
      ? sampledCombinations(remaining, cardsToCome, 6000)
      : combinations(remaining, cardsToCome)
  const accum = activePlayers.map((player) => ({
    id: player.id,
    name: player.name,
    hand: handLabel(player.cards),
    equity: 0,
    win: 0,
    tie: 0,
    distribution: emptyDistribution(),
  }))

  runouts.forEach((runout) => {
    const fullBoard = [...knownBoard, ...runout]
    const evaluated = activePlayers.map((player, index) => ({
      index,
      result: evaluateBest([...player.cards, ...fullBoard]),
    }))
    const bestScore = evaluated.reduce((best, item) => (compareScore(item.result.score, best) > 0 ? item.result.score : best), evaluated[0].result.score)
    const winners = evaluated.filter((item) => compareScore(item.result.score, bestScore) === 0)

    evaluated.forEach((item) => {
      accum[item.index].distribution[item.result.key] += 1
    })
    winners.forEach((winner) => {
      accum[winner.index].equity += 1 / winners.length
      if (winners.length === 1) accum[winner.index].win += 1
      else accum[winner.index].tie += 1
    })
  })

  const total = Math.max(1, runouts.length)
  results.value = accum.map((item, index) => ({
    ...item,
    index: index + 1,
    equity: (item.equity / total) * 100,
    win: (item.win / total) * 100,
    tie: (item.tie / total) * 100,
    distribution: Object.fromEntries(Object.entries(item.distribution).map(([key, value]) => [key, (value / total) * 100])),
  }))
  calculating.value = false
}

nextTick(calculateEquity)
</script>

<style scoped>
.equity-page {
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
  padding: 0 20px 104px;
}

.equity-topbar {
  min-height: 70px;
  margin: 0 -20px;
  border-bottom: 1px solid var(--v2-border);
  display: grid;
  grid-template-columns: 54px minmax(0, 1fr) 54px;
  align-items: center;
}

.equity-topbar button {
  width: 44px;
  height: 44px;
  margin: 0 auto;
  border: 0;
  background: transparent;
  color: var(--v2-text-main);
}

.equity-topbar h1 {
  margin: 0;
  color: var(--v2-text-main);
  font-size: 20px;
  font-weight: 560;
  text-align: center;
}

.equity-intro {
  padding: 18px 0 12px;
}

.equity-intro p,
.hint,
.note {
  margin: 0;
  color: var(--v2-text-sub);
  font-size: 12px;
  font-weight: 430;
  line-height: 1.45;
}

.panel {
  margin-bottom: 12px;
  padding: 12px;
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-lg);
  background: #ffffff;
  box-shadow: 0 5px 14px rgba(28, 18, 60, 0.025);
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
}

.panel-header h2 {
  margin: 0;
  color: var(--v2-text-main);
  font-size: 14px;
  font-weight: 560;
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
}

.player-list,
.result-list {
  display: grid;
}

.player-row,
.result-row {
  min-height: 54px;
  border-bottom: 1px solid var(--v2-border);
  display: grid;
  grid-template-columns: 24px minmax(0, 1fr) auto 28px;
  align-items: center;
  gap: 10px;
}

.player-row:last-child,
.result-row:last-child {
  border-bottom: 0;
}

.player-badge {
  display: grid;
  width: 20px;
  height: 20px;
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
  gap: 8px;
}

.small-card,
.board-card,
.picker-card {
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

.small-card {
  width: 34px;
  height: 42px;
}

.board-card {
  width: 54px;
  height: 62px;
  border-style: dashed;
}

.small-card.red,
.board-card.red,
.picker-card.red {
  color: #e11d48;
}

.small-card b,
.board-card b,
.picker-card b {
  font-size: 14px;
  font-weight: 560;
  line-height: 1;
}

.icon-button {
  width: 28px;
  height: 32px;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--v2-text-sub);
}

.hint {
  margin-top: 10px;
  padding: 8px;
  background: #f7f5fc;
  display: flex;
  align-items: center;
  gap: 6px;
}

.board-row {
  overflow-x: auto;
  padding-bottom: 2px;
}

.calculate-button {
  width: 100%;
  min-height: 44px;
  margin-bottom: 12px;
  border: 0;
  border-radius: var(--v2-radius-md);
  background: var(--v2-primary);
  color: #ffffff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font: inherit;
  font-size: 14px;
  font-weight: 560;
}

.result-row {
  grid-template-columns: 24px minmax(0, 1fr) auto 70px;
}

.result-hand {
  color: var(--v2-text-main);
  font-size: 12px;
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
  padding-top: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: var(--v2-text-main);
  font-size: 13px;
}

.heads-up {
  padding: 14px;
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
  margin: 16px 0 8px;
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

.picker {
  width: min(360px, calc(100vw - 32px));
  padding: 16px;
  border-radius: var(--v2-radius-lg);
  background: #ffffff;
}

.picker-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.picker-header h2 {
  margin: 0;
  font-size: 16px;
  font-weight: 560;
}

.picker-header button {
  border: 0;
  background: transparent;
}

.picker-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.picker-card {
  min-height: 48px;
}

.picker-card.disabled {
  opacity: 0.28;
}
</style>
