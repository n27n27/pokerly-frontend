<template>
  <q-page class="preflop-page">
    <header class="preflop-topbar">
      <button type="button" aria-label="뒤로 가기" @click="router.back()">
        <q-icon name="arrow_back" size="24px" />
      </button>

      <h1>프리플랍 차트</h1>

      <button type="button" aria-label="정보">
        <q-icon name="info" size="22px" />
      </button>
    </header>

    <section class="preflop-intro">
      <strong>Pokerly Standard</strong>
      <p>
        MTT Chip EV 기준 참고 차트입니다.<br />
        실제 솔버 원본 데이터가 아닌 Pokerly 학습용 표준 레인지입니다.
      </p>
    </section>

    <section class="control-section">
      <h2>테이블</h2>
      <div class="chip-row">
        <button
          v-for="tableSize in tableSizes"
          :key="tableSize.value"
          type="button"
          :class="{ selected: selectedTableSize === tableSize.value }"
          @click="selectedTableSize = tableSize.value"
        >
          {{ tableSize.label }}
        </button>
      </div>
    </section>

    <section class="control-section">
      <h2>스택</h2>
      <div class="chip-row">
        <button
          v-for="stack in stacks"
          :key="stack"
          type="button"
          :class="{ selected: selectedStack === stack }"
          @click="selectedStack = stack"
        >
          {{ stack }}
        </button>
      </div>
    </section>

    <section class="control-section">
      <h2>상황</h2>
      <div class="chip-row chip-row--spot">
        <button
          v-for="spot in spots"
          :key="spot.value"
          type="button"
          :class="{ selected: selectedSpot === spot.value }"
          @click="selectedSpot = spot.value"
        >
          {{ spot.label }}
        </button>
      </div>
    </section>

    <section class="control-section">
      <h2>내 포지션</h2>
      <div class="chip-row">
        <button
          v-for="position in activePositions"
          :key="position"
          type="button"
          :class="{ selected: selectedHeroPosition === position }"
          @click="selectedHeroPosition = position"
        >
          {{ position }}
        </button>
      </div>
    </section>

    <section v-if="needsVillainPosition" class="control-section">
      <h2>상대 포지션</h2>
      <div class="chip-row">
        <button
          v-for="position in villainPositions"
          :key="position"
          type="button"
          :class="{ selected: selectedVillainPosition === position }"
          @click="selectedVillainPosition = position"
        >
          {{ position }}
        </button>
      </div>
    </section>

    <section class="range-summary">
      <div v-for="action in activeActions" :key="action.key" class="summary-item">
        <span class="dot" :class="`dot--${action.key}`"></span>
        <strong>{{ action.label }}</strong>
        <em>{{ summary[action.key] ?? '0.0' }}%</em>
      </div>
    </section>

    <section class="matrix-wrap">
      <div class="matrix">
        <button
          v-for="hand in chartHands"
          :key="hand.key"
          type="button"
          class="hand-cell"
          :title="getHandTitle(hand)"
        >
          <span class="mix-strip">
            <span
              v-for="part in getVisibleMix(hand)"
              :key="part.key"
              class="mix-part"
              :class="`mix-part--${part.key}`"
              :style="{ width: `${part.value}%` }"
            ></span>
          </span>

          <span class="hand-label">
            {{ hand.label }}
          </span>
        </button>
      </div>
    </section>
  </q-page>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const ranks = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2']

const tableSizes = [
  { label: '9-max', value: '9max' },
  { label: '8-max', value: '8max' },
  { label: '6-max', value: '6max' },
]

const positionByTableSize = {
  '9max': ['UTG', 'UTG+1', 'MP', 'LJ', 'HJ', 'CO', 'BTN', 'SB', 'BB'],
  '8max': ['UTG', 'MP', 'LJ', 'HJ', 'CO', 'BTN', 'SB', 'BB'],
  '6max': ['LJ', 'HJ', 'CO', 'BTN', 'SB', 'BB'],
}

const stacks = [
  '5bb',
  '8bb',
  '10bb',
  '12bb',
  '15bb',
  '20bb',
  '25bb',
  '30bb',
  '40bb',
  '50bb',
  '75bb',
  '100bb',
  '150bb',
  '200bb+',
]

const spots = [
  { label: 'RFI', value: 'rfi' },
  { label: 'vs Limp', value: 'vsLimp' },
  { label: 'vs Open', value: 'vsOpen' },
  { label: 'vs 3Bet', value: 'vs3Bet' },
  { label: 'vs 4Bet', value: 'vs4Bet' },
  { label: 'Push/Fold', value: 'pushFold' },
  { label: 'vs All-in', value: 'vsAllIn' },
  { label: 'BB Defense', value: 'bbDefense' },
  { label: 'SB Complete', value: 'sbComplete' },
  { label: 'BvB', value: 'bvb' },
]

const actionSets = {
  rfi: [
    { key: 'open', label: '오픈' },
    { key: 'fold', label: '폴드' },
  ],
  vsLimp: [
    { key: 'iso', label: '아이솔' },
    { key: 'overlimp', label: '림프' },
    { key: 'fold', label: '폴드' },
  ],
  vsOpen: [
    { key: 'threeBet', label: '3Bet' },
    { key: 'call', label: '콜' },
    { key: 'fold', label: '폴드' },
  ],
  vs3Bet: [
    { key: 'fourBet', label: '4Bet' },
    { key: 'call', label: '콜' },
    { key: 'fold', label: '폴드' },
  ],
  vs4Bet: [
    { key: 'fiveBetJam', label: '5Bet Jam' },
    { key: 'call', label: '콜' },
    { key: 'fold', label: '폴드' },
  ],
  pushFold: [
    { key: 'jam', label: 'Jam' },
    { key: 'fold', label: '폴드' },
  ],
  vsAllIn: [
    { key: 'call', label: '콜' },
    { key: 'fold', label: '폴드' },
  ],
  bbDefense: [
    { key: 'threeBet', label: '3Bet' },
    { key: 'call', label: '콜' },
    { key: 'fold', label: '폴드' },
  ],
  sbComplete: [
    { key: 'raise', label: '레이즈' },
    { key: 'complete', label: '컴플릿' },
    { key: 'fold', label: '폴드' },
  ],
  bvb: [
    { key: 'raise', label: '레이즈' },
    { key: 'limp', label: '림프' },
    { key: 'jam', label: 'Jam' },
    { key: 'fold', label: '폴드' },
  ],
}

const selectedTableSize = ref('9max')
const selectedStack = ref('100bb')
const selectedSpot = ref('rfi')
const selectedHeroPosition = ref('CO')
const selectedVillainPosition = ref('HJ')

const rankValue = {
  A: 14,
  K: 13,
  Q: 12,
  J: 11,
  T: 10,
  9: 9,
  8: 8,
  7: 7,
  6: 6,
  5: 5,
  4: 4,
  3: 3,
  2: 2,
}

const positionBase = {
  UTG: 27,
  'UTG+1': 31,
  MP: 35,
  LJ: 39,
  HJ: 44,
  CO: 50,
  BTN: 59,
  SB: 48,
  BB: 37,
}

const stackMod = {
  '5bb': -20,
  '8bb': -15,
  '10bb': -11,
  '12bb': -8,
  '15bb': -5,
  '20bb': -2,
  '25bb': 0,
  '30bb': 1,
  '40bb': 3,
  '50bb': 4,
  '75bb': 5,
  '100bb': 6,
  '150bb': 5,
  '200bb+': 4,
}

const spotMod = {
  rfi: 0,
  vsLimp: -3,
  vsOpen: -13,
  vs3Bet: -22,
  vs4Bet: -31,
  pushFold: -9,
  vsAllIn: -24,
  bbDefense: -4,
  sbComplete: 6,
  bvb: 8,
}

const activePositions = computed(() => positionByTableSize[selectedTableSize.value])

const needsVillainPosition = computed(() =>
  ['vsOpen', 'vs3Bet', 'vs4Bet', 'vsAllIn', 'bbDefense'].includes(selectedSpot.value),
)

const villainPositions = computed(() =>
  activePositions.value.filter((position) => position !== selectedHeroPosition.value),
)

const activeActions = computed(() => actionSets[selectedSpot.value])

watch(selectedTableSize, () => {
  if (!activePositions.value.includes(selectedHeroPosition.value)) {
    selectedHeroPosition.value = activePositions.value[0]
  }

  if (!villainPositions.value.includes(selectedVillainPosition.value)) {
    selectedVillainPosition.value = villainPositions.value[0]
  }
})

watch(selectedHeroPosition, () => {
  if (!villainPositions.value.includes(selectedVillainPosition.value)) {
    selectedVillainPosition.value = villainPositions.value[0]
  }
})

watch(selectedSpot, () => {
  if (selectedSpot.value === 'bbDefense') {
    selectedHeroPosition.value = 'BB'
  }

  if (selectedSpot.value === 'sbComplete') {
    selectedHeroPosition.value = 'SB'
  }

  if (selectedSpot.value === 'bvb') {
    selectedHeroPosition.value = 'SB'
    selectedVillainPosition.value = 'BB'
  }
})

const allHands = computed(() => {
  const hands = []

  ranks.forEach((rowRank, rowIndex) => {
    ranks.forEach((colRank, colIndex) => {
      const pair = rowRank === colRank
      const suited = rowIndex < colIndex
      const high = Math.max(rankValue[rowRank], rankValue[colRank])
      const low = Math.min(rankValue[rowRank], rankValue[colRank])
      const gap = Math.max(0, high - low - 1)
      const label = pair ? rowRank + colRank : `${rowRank}${colRank}${suited ? 's' : 'o'}`
      const combos = pair ? 6 : suited ? 4 : 12

      let score = high * 5 + low * 2

      if (pair) score += 38 + high * 1.8
      if (suited) score += 8
      if (!pair && gap === 0) score += 5
      if (!pair && high >= 11 && low >= 10) score += 4
      if (!pair && high === 14) score += 5
      if (!pair && suited && high === 14 && low <= 5) score += 4

      score -= gap * (pair ? 0 : 3.2)

      if (!pair && !suited && low <= 6 && gap >= 2) score -= 7
      if (!pair && suited && low <= 5 && gap >= 3) score -= 2

      hands.push({
        key: `${rowRank}${colRank}`,
        label,
        combos,
        score,
        pair,
        suited,
        high,
        low,
        gap,
      })
    })
  })

  return hands
})

const contextStrength = computed(() => {
  const position = positionBase[selectedHeroPosition.value] ?? 40
  const stack = stackMod[selectedStack.value] ?? 0
  const spot = spotMod[selectedSpot.value] ?? 0

  return position + stack + spot
})

const makeMix = (parts) => {
  const visibleParts = Object.entries(parts)
    .filter(([, value]) => value > 0)
    .map(([key, value]) => ({ key, value }))

  const used = visibleParts.reduce((sum, part) => sum + part.value, 0)

  if (used < 100) {
    visibleParts.push({ key: 'fold', value: 100 - used })
  }

  return visibleParts.reduce((map, part) => {
    map[part.key] = Number(part.value.toFixed(1))
    return map
  }, {})
}

const clamp = (value, min = 0, max = 100) => Math.min(max, Math.max(min, value))

const chartHands = computed(() => {
  return allHands.value.map((hand) => {
    const strength = hand.score + contextStrength.value
    const premium = strength >= 126
    const strong = strength >= 114
    const playable = strength >= 98
    const marginal = strength >= 90
    const suitedConnector = hand.suited && hand.gap <= 1 && hand.high <= 11 && hand.low >= 5
    const suitedAce = hand.suited && hand.high === 14
    const pair = hand.pair

    let mix = {}

    switch (selectedSpot.value) {
      case 'rfi': {
        const open = clamp((strength - 86) * 3.3)
        mix = makeMix({ open })
        break
      }

      case 'vsLimp': {
        const iso = clamp((strength - 96) * 3)
        const overlimp = clamp((strength - 86) * 2.2 - iso * 0.35)
        mix = makeMix({ iso, overlimp })
        break
      }

      case 'vsOpen':
      case 'bbDefense': {
        const threeBet = premium
          ? 100
          : strong
            ? clamp((strength - 108) * 4)
            : suitedAce || suitedConnector
              ? clamp((strength - 99) * 1.2)
              : 0

        const call = premium
          ? 0
          : pair || hand.suited || hand.high >= 12
            ? clamp((strength - 88) * 2.4 - threeBet * 0.35)
            : clamp((strength - 95) * 1.2 - threeBet * 0.2)

        mix = makeMix({ threeBet, call })
        break
      }

      case 'vs3Bet': {
        const fourBet = premium
          ? 100
          : strong && suitedAce
            ? clamp((strength - 112) * 3)
            : strong && pair
              ? clamp((strength - 116) * 2.5)
              : 0

        const call = premium
          ? 0
          : playable && (pair || hand.suited || hand.high >= 13)
            ? clamp((strength - 94) * 2 - fourBet * 0.3)
            : 0

        mix = makeMix({ fourBet, call })
        break
      }

      case 'vs4Bet': {
        const fiveBetJam = premium ? 100 : strong && pair ? clamp((strength - 118) * 3) : 0
        const call = premium ? 0 : strong && hand.suited ? clamp((strength - 110) * 1.4) : 0

        mix = makeMix({ fiveBetJam, call })
        break
      }

      case 'pushFold': {
        const jam = clamp((strength - 88) * 3.8)
        mix = makeMix({ jam })
        break
      }

      case 'vsAllIn': {
        const call = premium ? 100 : strong ? clamp((strength - 108) * 3) : 0
        mix = makeMix({ call })
        break
      }

      case 'sbComplete': {
        const raise = clamp((strength - 100) * 2.5)
        const complete = marginal && !premium ? clamp((strength - 82) * 2.2 - raise * 0.25) : 0

        mix = makeMix({ raise, complete })
        break
      }

      case 'bvb': {
        const jam = ['5bb', '8bb', '10bb', '12bb', '15bb'].includes(selectedStack.value)
          ? clamp((strength - 88) * 2.7)
          : 0
        const raise = jam > 60 ? 0 : clamp((strength - 92) * 2.6)
        const limp = premium ? 0 : clamp((strength - 78) * 2 - raise * 0.25 - jam * 0.35)

        mix = makeMix({ raise, limp, jam })
        break
      }

      default:
        mix = makeMix({})
    }

    return {
      ...hand,
      mix,
    }
  })
})

const getVisibleMix = (hand) => {
  return Object.entries(hand.mix)
    .filter(([, value]) => value > 0)
    .map(([key, value]) => ({ key, value }))
}

const getHandTitle = (hand) => {
  return getVisibleMix(hand)
    .map((part) => {
      const action = activeActions.value.find((item) => item.key === part.key)
      return `${action?.label ?? part.key} ${part.value}%`
    })
    .join(' / ')
}

const summary = computed(() => {
  const result = activeActions.value.reduce((map, action) => {
    map[action.key] = 0
    return map
  }, {})

  chartHands.value.forEach((hand) => {
    Object.entries(hand.mix).forEach(([key, value]) => {
      if (result[key] !== undefined) {
        result[key] += hand.combos * (value / 100)
      }
    })
  })

  Object.keys(result).forEach((key) => {
    result[key] = ((result[key] / 1326) * 100).toFixed(1)
  })

  return result
})
</script>

<style scoped>
.preflop-page {
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
  padding: 0 20px 104px;
}

.preflop-topbar {
  min-height: 70px;
  margin: 0 -20px;
  border-bottom: 1px solid var(--v2-border);
  display: grid;
  grid-template-columns: 54px minmax(0, 1fr) 54px;
  align-items: center;
  background: var(--v2-page-bg);
}

.preflop-topbar button {
  width: 44px;
  height: 44px;
  margin: 0 auto;
  border: 0;
  background: transparent;
  color: var(--v2-text-main);
}

.preflop-topbar h1 {
  margin: 0;
  color: var(--v2-text-main);
  font-size: 22px;
  font-weight: 560;
  text-align: center;
}

.preflop-intro {
  padding: 22px 0 18px;
}

.preflop-intro strong {
  display: block;
  margin-bottom: 5px;
  color: var(--v2-text-main);
  font-size: 15px;
  font-weight: 650;
}

.preflop-intro p {
  margin: 0;
  color: var(--v2-text-sub);
  font-size: 14px;
  font-weight: 430;
  line-height: 1.55;
}

.control-section {
  display: grid;
  gap: 9px;
  margin-bottom: 16px;
}

.control-section h2 {
  margin: 0;
  color: var(--v2-text-main);
  font-size: 14px;
  font-weight: 560;
  line-height: 1.2;
}

.chip-row {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 2px;
  overscroll-behavior-x: contain;
  scrollbar-width: none;
}

.chip-row::-webkit-scrollbar {
  display: none;
}

.chip-row button {
  flex: 0 0 auto;
  min-width: 58px;
  min-height: 34px;
  padding: 0 14px;
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-sm);
  background: #ffffff;
  color: var(--v2-text-main);
  font: inherit;
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
}

.chip-row button.selected {
  border-color: var(--v2-primary);
  background: var(--v2-primary);
  color: #ffffff;
}

.range-summary {
  margin: 4px 0 14px;
  padding: 14px;
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-lg);
  background: #ffffff;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(72px, 1fr));
  gap: 10px;
}

.summary-item {
  display: grid;
  justify-items: center;
  gap: 7px;
  min-width: 0;
  text-align: center;
}

.summary-item strong {
  color: var(--v2-text-main);
  font-size: 12px;
  font-weight: 520;
}

.summary-item em {
  color: var(--v2-text-main);
  font-size: 13px;
  font-style: normal;
  font-weight: 430;
  white-space: nowrap;
}

.dot {
  width: 14px;
  height: 14px;
  border-radius: 4px;
}

.dot--open,
.dot--raise,
.dot--iso {
  background: #5b3df5;
}

.dot--threeBet,
.dot--fourBet,
.dot--fiveBetJam,
.dot--jam {
  background: #ff8a3d;
}

.dot--call,
.dot--overlimp,
.dot--complete,
.dot--limp {
  background: #3b82f6;
}

.dot--fold {
  background: #ececf2;
}

.matrix-wrap {
  width: 100%;
  overflow-x: auto;
  padding-bottom: 4px;
  overscroll-behavior-x: contain;
}

.matrix {
  display: grid;
  grid-template-columns: repeat(13, 42px);
  grid-auto-rows: 42px;
  gap: 3px;
  width: max-content;
}

.hand-cell {
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(18, 16, 28, 0.08);
  border-radius: 6px;
  background: #ececf2;
  color: #111827;
  font: inherit;
  font-size: 11px;
  font-weight: 750;
}

.hand-label {
  position: relative;
  z-index: 2;
  display: grid;
  place-items: center;
  width: 100%;
  height: 100%;
  color: #111827;
  text-shadow:
    0 1px 1px rgba(255, 255, 255, 0.78),
    0 -1px 1px rgba(255, 255, 255, 0.48),
    1px 0 1px rgba(255, 255, 255, 0.48),
    -1px 0 1px rgba(255, 255, 255, 0.48);
}

.mix-strip {
  position: absolute;
  inset: 0;
  z-index: 1;
  display: flex;
}

.mix-part {
  height: 100%;
}

.mix-part--open,
.mix-part--raise,
.mix-part--iso {
  background: #5b3df5;
}

.mix-part--threeBet,
.mix-part--fourBet,
.mix-part--fiveBetJam,
.mix-part--jam {
  background: #ff8a3d;
}

.mix-part--call,
.mix-part--overlimp,
.mix-part--complete,
.mix-part--limp {
  background: #3b82f6;
}

.mix-part--fold {
  background: #ececf2;
}

@media (max-width: 420px) {
  .preflop-topbar h1 {
    font-size: 20px;
  }

  .range-summary {
    padding: 12px 10px;
    gap: 8px;
  }

  .matrix {
    grid-template-columns: repeat(13, 35px);
    grid-auto-rows: 35px;
  }

  .hand-cell {
    font-size: 10px;
  }
}
</style>
