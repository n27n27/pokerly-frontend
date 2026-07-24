<template>
  <q-page class="icm-page">
    <header class="calc-topbar">
      <h1>ICM 찹 계산기</h1>
    </header>

    <section class="player-count-card">
      <div>
        <button type="button" @click="adjustCount(-1)">-</button>
        <strong>{{ players.length }}명</strong>
        <button type="button" @click="adjustCount(1)">+</button>
      </div>
    </section>

    <section class="dual-panel">
      <div class="panel">
        <div class="panel-header">
          <h2>플레이어 스택 입력</h2>
          <span>단위: 칩</span>
        </div>
        <label v-for="(player, index) in players" :key="player.id" class="data-row">
          <span><b>{{ index + 1 }}</b>{{ player.name }}</span>
          <input v-model.number="player.stack" type="number" inputmode="numeric" />
        </label>
        <div class="total-line">
          <span>총 스택 합계</span>
          <strong>{{ formatNumber(totalStacks) }}</strong>
        </div>
      </div>

      <div class="panel">
        <div class="panel-header">
          <h2>지급 구조 입력</h2>
        </div>
        <label v-for="(prize, index) in prizes" :key="index" class="data-row">
          <span>{{ index + 1 }}등</span>
          <input v-model.number="prizes[index]" type="number" inputmode="numeric" />
        </label>
        <div class="total-line">
          <span>총 상금 합계</span>
          <strong>{{ formatNumber(totalPrizes) }}</strong>
        </div>
      </div>
    </section>

    <StickyPrimaryAction label="ICM 찹 계산하기" icon="calculate" @click="calculate" />

    <section v-if="results.length" class="panel result-panel">
      <div class="panel-header">
        <h2>ICM 계산 결과</h2>
      </div>

      <div class="icm-table">
        <div class="icm-table__head">
          <span>순위</span>
          <span>플레이어</span>
          <span>현재 스택</span>
          <span>스택 비율</span>
          <span>ICM 총금액</span>
          <span>차이</span>
        </div>
        <div v-for="row in results" :key="row.id">
          <span>{{ row.rank }}</span>
          <strong>{{ row.name }}</strong>
          <span>{{ formatNumber(row.stack) }}</span>
          <span>{{ row.stackShare }}%</span>
          <b>{{ formatNumber(row.icmValue) }}</b>
          <em :class="{ positive: row.diff >= 0 }">{{ row.diff >= 0 ? '+' : '' }}{{ formatNumber(row.diff) }}</em>
        </div>
      </div>

      <p class="success-note">
        <q-icon name="check_circle" size="17px" />
        ICM 찹 금액의 합계는 총 상금과 일치합니다.
      </p>
      <p class="muted-note">ICM(Independent Chip Model) 기준으로 계산된 값입니다.</p>
    </section>
  </q-page>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'

import StickyPrimaryAction from 'src/shared/components/StickyPrimaryAction.vue'

let nextId = 5

const players = reactive([
  { id: 1, name: 'Hero (나)', stack: 350000 },
  { id: 2, name: 'Player 2', stack: 420000 },
  { id: 3, name: 'Player 3', stack: 280000 },
  { id: 4, name: 'Player 4', stack: 560000 },
])

const prizes = reactive([1000000, 600000, 400000, 250000])
const results = ref([])

const totalStacks = computed(() => players.reduce((sum, player) => sum + Number(player.stack || 0), 0))
const totalPrizes = computed(() => prizes.reduce((sum, prize) => sum + Number(prize || 0), 0))

const calculateFinishProbabilities = (remainingPlayers, remainingPlaces, probability, probabilities) => {
  if (!remainingPlaces.length || !remainingPlayers.length) return

  const total = remainingPlayers.reduce((sum, player) => sum + Number(player.stack || 0), 0)
  if (total <= 0) return

  remainingPlayers.forEach((player, index) => {
    const place = remainingPlaces[0]
    const nextProbability = probability * (Number(player.stack || 0) / total)
    probabilities[player.id][place] += nextProbability

    const nextPlayers = remainingPlayers.filter((_, playerIndex) => playerIndex !== index)
    calculateFinishProbabilities(nextPlayers, remainingPlaces.slice(1), nextProbability, probabilities)
  })
}

const calculate = () => {
  const probabilities = Object.fromEntries(players.map((player) => [player.id, Array(players.length).fill(0)]))
  calculateFinishProbabilities([...players], players.map((_, index) => index), 1, probabilities)

  const chipEvPerChip = totalPrizes.value / Math.max(totalStacks.value, 1)

  results.value = players
    .map((player) => {
      const icmValue = probabilities[player.id].reduce((sum, probability, placeIndex) => {
        return sum + probability * Number(prizes[placeIndex] || 0)
      }, 0)
      const chipEv = Number(player.stack || 0) * chipEvPerChip
      return {
        ...player,
        rank: 0,
        stackShare: ((Number(player.stack || 0) / Math.max(totalStacks.value, 1)) * 100).toFixed(2),
        icmValue: Math.round(icmValue),
        diff: Math.round(icmValue - chipEv),
      }
    })
    .sort((a, b) => b.icmValue - a.icmValue)
    .map((row, index) => ({ ...row, rank: index + 1 }))
}

const adjustCount = (amount) => {
  if (amount > 0 && players.length < 15) {
    players.push({ id: nextId, name: `Player ${nextId}`, stack: 250000 })
    prizes.push(Math.max(0, Number(prizes[prizes.length - 1] || 0) - 50000))
    nextId += 1
  }

  if (amount < 0 && players.length > 2) {
    players.pop()
    prizes.pop()
  }

}

const formatNumber = (value) => Math.round(Number(value || 0)).toLocaleString('ko-KR')

</script>

<style scoped>
@import './calculator-common.css';

.icm-page {
  display: grid;
  align-content: start;
  gap: 8px;
  min-height: 100%;
  padding: var(--v2-page-padding-top) var(--v2-page-padding-x) 180px;
}

.calc-topbar {
  display: grid;
  justify-items: start;
  margin: 0 0 12px;
}

.calc-topbar h1 {
  margin: 0;
  color: var(--v2-text-main);
  font-size: 22px;
  font-weight: 560;
  line-height: 1;
  text-align: left;
  white-space: nowrap;
}

.player-count-card {
  padding: 12px;
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-lg);
  background: #ffffff;
  display: grid;
  place-items: center;
  gap: 7px;
  text-align: center;
}

.player-count-card div {
  display: flex;
  align-items: center;
  gap: 18px;
}

.player-count-card button {
  width: 28px;
  height: 28px;
  padding: 0;
  border: 1px solid var(--v2-primary);
  border-radius: var(--v2-radius-sm);
  background: #ffffff;
  color: var(--v2-primary);
  display: grid;
  place-items: center;
  font: inherit;
  font-size: 18px;
  font-weight: 560;
  line-height: 1;
}

.player-count-card strong {
  color: var(--v2-text-main);
  font-size: 19px;
  font-weight: 560;
}

.panel {
  padding: 12px;
  gap: 8px;
  box-shadow: 0 5px 14px rgba(28, 18, 60, 0.022);
}

.panel h2 {
  line-height: 1;
}

.panel-header {
  margin-bottom: 0;
}

.panel-header span {
  font-size: 12px;
}

.dual-panel {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.data-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 112px;
  align-items: center;
  gap: 10px;
}

.data-row span {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #4f4a5e;
  font-size: 12px;
}

.data-row b {
  width: 18px;
  height: 18px;
  border-radius: 5px;
  background: var(--v2-primary);
  color: #ffffff;
  display: grid;
  place-items: center;
  font-size: 10px;
}

.data-row input {
  min-width: 0;
  height: 34px;
  padding: 0 9px;
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-sm);
  outline: 0;
  color: var(--v2-text-main);
  font: inherit;
  font-size: 12px;
  text-align: right;
}

.total-line {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  padding-top: 8px;
  border-top: 1px solid var(--v2-border);
  color: var(--v2-primary);
  font-size: 12px;
  font-weight: 560;
}

.icm-table {
  overflow-x: auto;
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-md);
}

.icm-table__head,
.icm-table > div:not(.icm-table__head) {
  min-width: 560px;
  display: grid;
  grid-template-columns: 46px 1fr 1fr 1fr 1fr 1fr;
}

.icm-table span,
.icm-table strong,
.icm-table b,
.icm-table em {
  min-height: 36px;
  padding: 8px;
  border-right: 1px solid var(--v2-border);
  border-bottom: 1px solid var(--v2-border);
  color: #4f4a5e;
  font-size: 11px;
  font-style: normal;
}

.icm-table__head span {
  background: #faf9fc;
  color: var(--v2-text-sub);
  font-weight: 520;
}

.icm-table > div:last-child span,
.icm-table > div:last-child strong,
.icm-table > div:last-child b,
.icm-table > div:last-child em {
  border-bottom: 0;
}

.icm-table b {
  color: var(--v2-primary);
  font-weight: 560;
}

.icm-table em.positive {
  color: var(--v2-success);
}

.success-note,
.muted-note {
  margin: 0;
  padding: 9px;
  border-radius: var(--v2-radius-sm);
  color: #4f4a5e;
  font-size: 11px;
}

.success-note {
  background: rgba(22, 163, 74, 0.1);
  color: var(--v2-success);
  display: flex;
  align-items: center;
  gap: 6px;
}

.muted-note {
  background: #f6f4fb;
  color: var(--v2-text-sub);
}

@media (max-width: 420px) {
  .dual-panel {
    grid-template-columns: 1fr;
  }
}
</style>
