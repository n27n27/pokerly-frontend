<template>
  <q-page class="q-pa-md">
    <div class="column items-center q-gutter-md" style="max-width: 800px; margin: 0 auto">
      <!-- 헤더 -->
      <div class="full-width q-mb-md">
        <div class="row items-center q-gutter-sm q-mb-xs">
          <div class="text-h5 text-weight-bold">콜 EV 계산기</div>
          <q-badge color="amber-8" text-color="white" label="BETA" />
        </div>
        <div class="text-body2 text-grey-7">
          팟 오즈와 아웃 기반 승률을 통해 이 콜이 +EV인지 즉시 판단합니다.
        </div>
      </div>

      <!-- 입력 카드 -->
      <q-card flat bordered class="q-pa-md full-width calculator-card">
        <div class="text-subtitle1 text-weight-bold q-mb-sm">입력 값</div>

        <div class="row q-col-gutter-md q-mb-md">
          <div class="col-12 col-sm-4">
            <q-input
              v-model.number="potSize"
              filled
              type="number"
              label="현재 팟"
              suffix="칩"
              dense
            />
          </div>

          <div class="col-12 col-sm-4">
            <q-input
              v-model.number="callAmount"
              filled
              type="number"
              label="콜 금액"
              suffix="칩"
              dense
            />
          </div>

          <div class="col-12 col-sm-4">
            <q-input v-model.number="outs" filled type="number" label="아웃 수" dense />
          </div>
        </div>

        <!-- 남은 카드 수: 셀렉트 -->
        <div class="row q-col-gutter-md items-center">
          <div class="col-12 col-sm-6">
            <q-select
              v-model="cardsToCome"
              :options="cardsOptions"
              filled
              dense
              label="남은 카드 수"
              emit-value
              map-options
            />
          </div>
          <div class="col-12 col-sm-6 text-caption text-grey-6">
            플랍 기준이면 2장(턴+리버), 턴에서 콜을 고민 중이면 1장을 선택하세요.
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
            clickable="false"
            :icon="isPlusEv ? 'trending_up' : 'trending_down'"
            class="status-chip"
          >
            {{ isPlusEv ? '+EV 콜' : '-EV 콜' }}
          </q-chip>
        </div>

        <div v-if="!isValid" class="text-grey-7 text-body2">모든 값을 0보다 크게 입력해주세요.</div>

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
        </div>
      </q-card>

      <!-- 설명 카드 -->
      <q-card flat bordered class="q-pa-md full-width info-card">
        <div class="text-subtitle2 text-weight-bold q-mb-xs">간단 설명</div>
        <div class="text-body2 text-grey-7">
          • 팟 오즈 = 콜 / (팟 + 콜) <br />
          • 실제 승률은 아웃 수와 남은 카드 수에 따라 정확한 조합 계산 사용 <br />
          • 이 계산기는 순수 콜 EV만 다루며 임플라이드 오즈는 별도 계산기를 사용합니다.
        </div>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue'

const potSize = ref(100000)
const callAmount = ref(50000)
const outs = ref(9)
const cardsToCome = ref(1)

const cardsOptions = [
  { label: '1장 (턴/리버)', value: 1 },
  { label: '2장 (턴+리버)', value: 2 },
]

const isValid = computed(() => potSize.value > 0 && callAmount.value > 0 && outs.value > 0)

const requiredEquity = computed(() => {
  if (!isValid.value) return 0
  return callAmount.value / (potSize.value + callAmount.value)
})

const actualEquity = computed(() => {
  if (!isValid.value) return 0
  const o = outs.value
  if (cardsToCome.value === 1) {
    return o / 47
  } else {
    return 1 - ((47 - o) / 47) * ((46 - o) / 46)
  }
})

const potOddsPercent = computed(() => (requiredEquity.value * 100).toFixed(1))
const actualEquityPercent = computed(() => (actualEquity.value * 100).toFixed(1))

const evPerCall = computed(() => {
  if (!isValid.value) return 0
  const eq = actualEquity.value
  return eq * (potSize.value + callAmount.value) - (1 - eq) * callAmount.value
})

const formattedEvPerCall = computed(() => Math.round(evPerCall.value).toLocaleString())
const isPlusEv = computed(() => evPerCall.value > 0)
</script>

<style scoped>
.calculator-card,
.calculator-result-card,
.info-card {
  border-radius: 16px;
}

/* 결과 행 정렬 */
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

/* 상태 칩 여유 있게 */
.status-chip {
  border-radius: 999px;
  padding: 4px 12px;
  font-weight: 600;
}
</style>
