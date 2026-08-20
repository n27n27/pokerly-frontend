<template>
  <q-page class="icm-page">
    <header class="calc-topbar">
      <button type="button" aria-label="도구로 돌아가기" @click="router.push('/app/tools')">
        <q-icon name="chevron_left" size="28px" />
      </button>
      <h1>찹 계산기</h1>
      <span aria-hidden="true"></span>
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
        <div class="player-input-head" aria-hidden="true">
          <span></span>
          <span>닉네임</span>
          <span>현재 스택</span>
        </div>
        <label v-for="(player, index) in players" :key="player.id" class="data-row">
          <b>{{ index + 1 }}</b>
          <input
            v-model.trim="player.name"
            class="name-input"
            type="text"
            :placeholder="index === 0 ? '내 닉네임' : `Player ${index + 1}`"
            :aria-label="`${index + 1}번 플레이어 닉네임`"
          />
          <input v-model.number="player.stack" type="number" inputmode="numeric" :aria-label="`${player.name || `${index + 1}번 플레이어`} 현재 스택`" @focus="selectInputText" />
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
          <input v-model.number="prizes[index]" type="number" inputmode="numeric" :aria-label="`${index + 1}등 지급액`" @focus="selectInputText" />
        </label>
        <div class="total-line">
          <span>총 포인트 합계</span>
          <strong>{{ formatNumber(totalPrizes) }}</strong>
        </div>
      </div>
    </section>

    <section class="panel method-panel">
      <div class="panel-header">
        <h2>계산 방식</h2>
      </div>
      <div class="method-segment" role="radiogroup" aria-label="찹 계산 방식">
        <button
          v-for="method in chopMethods"
          :key="method.value"
          type="button"
          role="radio"
          :aria-checked="chopMethod === method.value"
          :class="{ active: chopMethod === method.value }"
          @click="chopMethod = method.value"
        >
          {{ method.label }}
        </button>
      </div>
      <p>{{ activeMethod.description }}</p>
    </section>

    <StickyPrimaryAction label="찹 계산하기" icon="calculate" :disabled="!canCalculate" @click="calculate" />

    <section v-if="results.length" class="panel result-panel">
      <div class="panel-header">
        <h2>{{ activeMethod.label }} 결과</h2>
      </div>

      <div v-if="chopMethod === 'equal'" class="equal-result">
        <span>플레이어별 균등 찹 금액</span>
        <strong>{{ equalChopSummary }}</strong>
        <div class="equal-breakdown">
          <span v-for="row in results" :key="row.id">
            {{ row.name || `${row.seat}번 플레이어` }}
            <b>{{ formatNumber(row.equalChopValue) }}</b>
          </span>
        </div>
        <dl>
          <div><dt>플레이어</dt><dd>{{ players.length }}명</dd></div>
          <div><dt>총 포인트</dt><dd>{{ formatNumber(totalPrizes) }}</dd></div>
        </dl>
      </div>

      <div v-else class="icm-results">
        <article v-for="row in results" :key="row.id" class="icm-result-row">
          <span class="result-rank">{{ row.rank }}</span>
          <div class="result-player">
            <strong>{{ row.name || `${row.seat}번 플레이어` }}</strong>
            <span>스택 {{ formatNumber(row.stack) }} · {{ row.stackShare }}%</span>
          </div>
          <div class="result-value">
            <small>{{ activeMethod.label }} 금액</small>
            <b>{{ formatNumber(selectedChopValue(row)) }}</b>
            <em
              v-for="comparison in comparisonValues(row)"
              :key="comparison.label"
              :class="differenceClass(comparison.diff)"
            >
              {{ comparison.label }} {{ formatNumber(comparison.value) }} · {{ formatDifference(comparison.diff) }}
            </em>
          </div>
        </article>
      </div>

      <p class="success-note">
        <q-icon name="check_circle" size="17px" />
        {{ activeMethod.label }} 금액의 합계는 총 포인트와 일치합니다.
      </p>
      <p class="muted-note">{{ activeMethod.description }}</p>
    </section>
  </q-page>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import StickyPrimaryAction from 'src/shared/components/StickyPrimaryAction.vue'
import { allocateRoundedTotal } from 'src/utils/icmCalculator'

const router = useRouter()

let nextId = 5

const players = reactive([
  { id: 1, name: '', stack: null },
  { id: 2, name: '', stack: null },
  { id: 3, name: '', stack: null },
  { id: 4, name: '', stack: null },
])

const prizes = reactive([null, null, null, null])
const results = ref([])
const chopMethod = ref('icm')
const chopMethods = [
  { value: 'icm', label: 'ICM 찹', description: '각 플레이어의 모든 최종 순위 확률과 지급 구조를 반영합니다.' },
  { value: 'chip', label: '칩 비율 찹', description: '남은 총 포인트를 현재 보유 칩 비율대로 나눕니다.' },
  { value: 'equal', label: '균등 찹', description: '남은 총 포인트를 플레이어 수대로 동일하게 나눕니다.' },
]
const activeMethod = computed(() => chopMethods.find((method) => method.value === chopMethod.value))

const totalStacks = computed(() => players.reduce((sum, player) => sum + Number(player.stack || 0), 0))
const totalPrizes = computed(() => prizes.reduce((sum, prize) => sum + Number(prize || 0), 0))
const canCalculate = computed(() =>
  players.every((player) => Number(player.stack) > 0) &&
  prizes.some((prize) => Number(prize) > 0) &&
  prizes.every((prize) => prize !== null && prize !== '' && Number(prize) >= 0),
)

watch([players, prizes], () => {
  results.value = []
}, { deep: true })

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
  if (!canCalculate.value) return
  const probabilities = Object.fromEntries(players.map((player) => [player.id, Array(players.length).fill(0)]))
  calculateFinishProbabilities([...players], players.map((_, index) => index), 1, probabilities)

  const chipEvPerChip = totalPrizes.value / Math.max(totalStacks.value, 1)
  const stackRanks = new Map(
    [...players]
      .sort((a, b) => Number(b.stack || 0) - Number(a.stack || 0))
      .map((player, index) => [player.id, index + 1]),
  )

  const rawResults = players.map((player, playerIndex) => {
      const icmValue = probabilities[player.id].reduce((sum, probability, placeIndex) => {
        return sum + probability * Number(prizes[placeIndex] || 0)
      }, 0)
      const chipChopValue = Number(player.stack || 0) * chipEvPerChip
      const stackRank = stackRanks.get(player.id)
      const currentRankPrize = Number(prizes[stackRank - 1] || 0)
      return {
        ...player,
        seat: playerIndex + 1,
        rank: stackRank,
        stackShare: ((Number(player.stack || 0) / Math.max(totalStacks.value, 1)) * 100).toFixed(2),
        icmValue,
        chipChopValue,
        equalChopValue: totalPrizes.value / Math.max(players.length, 1),
        currentRankPrize,
      }
    })
  const icmValues = allocateRoundedTotal(rawResults.map((row) => row.icmValue), totalPrizes.value)
  const chipChopValues = allocateRoundedTotal(rawResults.map((row) => row.chipChopValue), totalPrizes.value)
  const equalChopValues = allocateRoundedTotal(rawResults.map((row) => row.equalChopValue), totalPrizes.value)

  results.value = rawResults
    .map((row, index) => ({
      ...row,
      icmValue: icmValues[index],
      chipChopValue: chipChopValues[index],
      equalChopValue: equalChopValues[index],
    }))
    .sort((a, b) => a.rank - b.rank)
}

const adjustCount = (amount) => {
  if (amount > 0 && players.length < 15) {
    players.push({ id: nextId, name: '', stack: null })
    prizes.push(null)
    nextId += 1
  }

  if (amount < 0 && players.length > 2) {
    players.pop()
    prizes.pop()
  }

}

const formatNumber = (value) => Math.round(Number(value || 0)).toLocaleString('ko-KR')
const formatDifference = (value) => `${value >= 0 ? '+' : ''}${formatNumber(value)}`
const differenceClass = (value) => ({ positive: value > 0, negative: value < 0 })
const selectedChopValue = (row) => ({
  icm: row.icmValue,
  chip: row.chipChopValue,
  equal: row.equalChopValue,
})[chopMethod.value]
const equalChopSummary = computed(() => {
  const values = [...new Set(results.value.map((row) => Number(row.equalChopValue) || 0))]
    .sort((a, b) => a - b)
    .map(formatNumber)
  return values.join('~') || '0'
})
const comparisonValues = (row) => {
  if (chopMethod.value === 'equal') return []
  const selectedValue = selectedChopValue(row)
  return [
    { key: 'icm', label: 'ICM 찹', value: row.icmValue },
    { key: 'chip', label: '칩 비율 찹', value: row.chipChopValue },
  ]
    .filter((comparison) => comparison.key !== chopMethod.value)
    .map((comparison) => ({ ...comparison, diff: selectedValue - comparison.value }))
    .concat({
      key: 'payout',
      label: '현재 순위 상금',
      value: row.currentRankPrize,
      diff: selectedValue - row.currentRankPrize,
    })
}
const selectInputText = (event) => event.currentTarget.select()

</script>

<style scoped>
@import './calculator-common.css';

.icm-page {
  display: grid;
  align-content: start;
  gap: 8px;
  min-height: 100%;
  padding: var(--v2-page-padding-top) var(--v2-page-padding-x) calc(104px + var(--app-safe-bottom));
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
  grid-template-columns: 1fr;
  gap: 8px;
}

.data-row {
  display: grid;
  grid-template-columns: 22px minmax(92px, 1fr) minmax(120px, 180px);
  align-items: center;
  gap: 8px;
}

.player-input-head {
  display: grid;
  grid-template-columns: 22px minmax(92px, 1fr) minmax(120px, 180px);
  gap: 8px;
  padding: 0 9px;
  color: var(--v2-text-sub);
  font-size: 10px;
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

.data-row .name-input {
  text-align: left;
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

.method-panel p {
  margin: 0;
  color: var(--v2-text-sub);
  font-size: 11px;
  line-height: 1.45;
}

.method-segment {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  padding: 3px;
  border-radius: var(--v2-radius-md);
  background: #f1eff6;
}

.method-segment button {
  min-height: 36px;
  padding: 0 6px;
  border: 0;
  border-radius: var(--v2-radius-sm);
  background: transparent;
  color: var(--v2-text-sub);
  font: inherit;
  font-size: 11px;
  font-weight: 520;
}

.method-segment button.active {
  background: #ffffff;
  color: var(--v2-primary);
  box-shadow: 0 2px 7px rgba(35, 28, 54, 0.08);
  font-weight: 620;
}

.icm-results {
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-md);
  overflow: hidden;
}

.equal-result {
  display: grid;
  justify-items: center;
  gap: 7px;
  padding: 20px 14px 14px;
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-md);
  text-align: center;
}

.equal-result > span {
  color: var(--v2-text-sub);
  font-size: 11px;
}

.equal-result > strong {
  color: var(--v2-primary);
  font-size: 24px;
  font-weight: 650;
}

.equal-breakdown {
  display: grid;
  width: 100%;
  gap: 5px;
  margin-top: 3px;
}

.equal-breakdown span {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  color: var(--v2-text-sub);
  font-size: 11px;
}

.equal-breakdown b {
  color: var(--v2-text-main);
  font-size: 12px;
}

.equal-result dl {
  display: grid;
  width: 100%;
  grid-template-columns: 1fr 1fr;
  margin: 8px 0 0;
  padding-top: 12px;
  border-top: 1px solid var(--v2-border);
}

.equal-result dl > div {
  display: grid;
  gap: 4px;
}

.equal-result dl > div + div {
  border-left: 1px solid var(--v2-border);
}

.equal-result dt,
.equal-result dd {
  margin: 0;
}

.equal-result dt {
  color: var(--v2-text-sub);
  font-size: 10px;
}

.equal-result dd {
  color: var(--v2-text-main);
  font-size: 13px;
  font-weight: 580;
}

.icm-result-row {
  display: grid;
  grid-template-columns: 28px minmax(0, 1fr) minmax(150px, 55%);
  align-items: center;
  gap: 10px;
  min-height: 66px;
  padding: 10px 12px;
  border-bottom: 1px solid var(--v2-border);
}

.icm-result-row:last-child {
  border-bottom: 0;
}

.result-rank {
  display: grid;
  width: 24px;
  height: 24px;
  place-items: center;
  border-radius: 7px;
  background: var(--v2-primary-soft);
  color: var(--v2-primary);
  font-size: 11px;
  font-weight: 650;
}

.result-player,
.result-value {
  display: grid;
  gap: 4px;
}

.result-player strong {
  overflow: hidden;
  color: var(--v2-text-main);
  font-size: 13px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.result-player span,
.result-value small,
.result-value em {
  color: var(--v2-text-sub);
  font-size: 10px;
  font-style: normal;
}

.result-value {
  justify-items: end;
  min-width: 0;
  text-align: right;
}

.result-value b {
  color: var(--v2-primary);
  font-size: 14px;
  font-weight: 620;
}

.result-value em.positive {
  color: var(--v2-success);
}

.result-value em.negative {
  color: var(--v2-danger);
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

@media (max-width: 360px) {
  .data-row {
    grid-template-columns: 20px minmax(82px, 1fr) 116px;
  }

  .player-input-head {
    grid-template-columns: 20px minmax(82px, 1fr) 116px;
  }
}
</style>
