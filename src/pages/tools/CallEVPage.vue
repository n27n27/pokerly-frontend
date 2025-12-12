<template>
  <q-page class="q-pa-md">
    <div class="column q-gutter-y-lg ev-page-root">
      <!-- HEADER -->
      <div>
        <div class="row items-center q-gutter-sm q-mb-xs">
          <div class="text-h5 text-weight-bold">콜 EV 계산기</div>
          <q-badge color="orange-6" text-color="white" label="BETA" />
        </div>
        <div class="text-body2 text-grey-7">
          팟 크기, 콜 금액, 아웃 수를 기반으로 이 콜이 장기적으로 +EV인지 계산합니다.
        </div>
      </div>

      <!-- 입력 카드 -->
      <q-card flat bordered class="q-pa-md full-width calculator-card">
        <div class="text-subtitle1 text-weight-bold q-mb-sm">입력 값</div>

        <!-- 팟 / 콜 / 아웃 -->
        <div class="row q-col-gutter-md q-mb-md">
          <div class="col-12 col-sm-4">
            <q-input
              v-model.number="potSize"
              filled
              dense
              type="number"
              label="현재 팟"
              suffix="칩"
              :min="0"
              placeholder="예: 120000"
            />
          </div>

          <div class="col-12 col-sm-4">
            <q-input
              v-model.number="callAmount"
              filled
              dense
              type="number"
              label="콜 금액"
              suffix="칩"
              :min="0"
              placeholder="예: 40000"
            />
          </div>

          <div class="col-12 col-sm-4">
            <q-input
              v-model.number="outs"
              filled
              dense
              type="number"
              label="아웃 수"
              :min="0"
              placeholder="예: 플러쉬 9, OESD 8"
            />
          </div>
        </div>

        <!-- 남은 카드 수 -->
        <div class="row q-col-gutter-md items-center">
          <div class="col-12 col-sm-6">
            <q-select
              v-model="cardsToCome"
              :options="cardsOptions"
              filled
              dense
              emit-value
              map-options
              label="남은 카드 수"
            />
          </div>
          <div class="col-12 col-sm-6 text-caption text-grey-6">
            대부분 플랍에서 계산하므로 기본값은 <b>2장(턴+리버)</b>입니다.<br />
            턴에서 콜을 고민 중이면 1장을 선택하세요.
          </div>
        </div>
      </q-card>

      <!-- 결과 카드 -->
      <q-card flat bordered class="q-pa-md full-width calculator-result-card">
        <div class="row justify-between items-center q-mb-sm">
          <div class="text-subtitle1 text-weight-bold">결과</div>

          <q-chip
            v-if="isValid"
            :color="isPlusEv ? 'positive' : 'negative'"
            text-color="white"
            :icon="isPlusEv ? 'trending_up' : 'trending_down'"
            class="status-chip"
          >
            {{ isPlusEv ? '+EV 콜' : '-EV 콜' }}
          </q-chip>
        </div>

        <div v-if="!isValid" class="text-grey-7 text-body2">
          팟, 콜 금액, 아웃 수를 모두 0보다 크게 입력하면 결과가 표시됩니다.
        </div>

        <div v-else class="column q-gutter-sm">
          <div class="result-row">
            <span class="label">필요 승률 (팟 오즈)</span>
            <span class="value">{{ potOddsPercent }} %</span>
          </div>

          <div class="result-row">
            <span class="label">실제 승률 (아웃 기반)</span>
            <span
              class="value"
              :class="actualEquity >= requiredEquity ? 'text-positive' : 'text-negative'"
            >
              {{ actualEquityPercent }} %
            </span>
          </div>

          <q-separator spaced />

          <div class="result-row">
            <span class="label">콜 EV</span>
            <span class="value" :class="evPerCall > 0 ? 'text-positive' : 'text-negative'">
              {{ formattedEvPerCall }} 칩
            </span>
          </div>

          <div class="text-caption text-grey-6 q-mt-sm">
            EV = 승률 × (팟 + 콜 금액) − (1 − 승률) × 콜 금액
          </div>
        </div>
      </q-card>

      <!-- 설명 카드 -->
      <q-card flat bordered class="q-pa-md full-width info-card">
        <div class="text-subtitle2 text-weight-bold q-mb-xs">간단 설명</div>
        <div class="text-body2 text-grey-7">
          • <b>필요 승률</b> = 콜 금액 ÷ (현재 팟 + 콜 금액)<br />
          • <b>실제 승률</b>은 아웃 수와 남은 카드 수에 따라 조합식으로 계산합니다.<br />
          • 이 계산기는 순수 콜 EV만 다루며, 임플라이드 오즈 / 레이크는 포함하지 않습니다.
        </div>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { logToolUsage } from 'src/api/tools'

/* ================= 기본 상태 ================= */

const potSize = ref(null) // 현재 팟
const callAmount = ref(null) // 콜 금액
const outs = ref(null) // 아웃 수

// 기본값: 플랍 기준 2장 (턴+리버)
const cardsToCome = ref(2)
const cardsOptions = [
  { label: '2장 (턴 + 리버)', value: 2 },
  { label: '1장 (리버만 남음)', value: 1 },
]

/* ================= Validation ================= */

const isValid = computed(() => {
  const pot = Number(potSize.value)
  const call = Number(callAmount.value)
  const o = Number(outs.value)

  return pot > 0 && call > 0 && o > 0
})

/* ================= 계산 로직 ================= */

// 필요 승률 (팟 오즈)
const requiredEquity = computed(() => {
  if (!isValid.value) return 0
  const pot = Number(potSize.value)
  const call = Number(callAmount.value)
  return call / (pot + call)
})

// 실제 승률 (아웃 기반)
// 1장: outs / 47
// 2장: 1 - ((47 - outs)/47 * (46 - outs)/46)
const actualEquity = computed(() => {
  if (!isValid.value) return 0
  const o = Math.max(0, Math.min(Number(outs.value), 46))

  if (cardsToCome.value === 1) {
    return o / 47
  } else {
    const missTurn = (47 - o) / 47
    const missRiver = (46 - o) / 46
    return 1 - missTurn * missRiver
  }
})

const potOddsPercent = computed(() => (requiredEquity.value * 100).toFixed(1))

const actualEquityPercent = computed(() => (actualEquity.value * 100).toFixed(1))

// EV = equity * (pot + call) - (1 - equity) * call
const evPerCall = computed(() => {
  if (!isValid.value) return 0
  const pot = Number(potSize.value)
  const call = Number(callAmount.value)
  const eq = actualEquity.value

  return eq * (pot + call) - (1 - eq) * call
})

const formattedEvPerCall = computed(() => Math.round(evPerCall.value).toLocaleString())

const isPlusEv = computed(() => evPerCall.value > 0)

/* ================= 사용 로그 (통계용) ================= */

// 페이지 진입 시 1회
onMounted(() => {
  logToolUsage('CALL_EV', 'OPEN')
})

// 처음으로 유효한 계산이 발생했을 때 1회
const loggedCalc = ref(false)

watch(
  [isValid, potSize, callAmount, outs, cardsToCome],
  () => {
    if (isValid.value && !loggedCalc.value) {
      loggedCalc.value = true
      logToolUsage('CALL_EV', 'CALCULATE')
    }
  },
  { deep: false },
)
</script>

<style scoped>
.ev-page-root {
  max-width: 800px;
  margin: 0 auto;
}

/* 카드 radius 통일 */
.calculator-card,
.calculator-result-card,
.info-card {
  border-radius: 16px;
}

/* 결과 행 */
.result-row {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
}

.label {
  color: #6b7280;
  font-size: 0.9rem;
}

.value {
  font-weight: 600;
}

/* EV 상태 칩 */
.status-chip {
  border-radius: 999px;
  padding: 4px 14px;
  font-weight: 600;
}
</style>
