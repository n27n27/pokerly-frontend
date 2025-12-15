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
          팟 크기, 콜 금액, 아웃 수를 기반으로 “지금 이 콜”이 장기적으로 +EV인지 계산합니다.
        </div>
      </div>

      <!-- 입력 카드 -->
      <q-card flat bordered class="q-pa-md full-width calculator-card">
        <div class="row items-center justify-between q-mb-sm">
          <div class="text-subtitle1 text-weight-bold">입력 값</div>
          <q-btn
            unelevated
            color="primary"
            icon="calculate"
            label="계산하기"
            @click="onCalculate"
          />
        </div>

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

        <!-- 올인/무료 확정 -->
        <div class="row items-center q-col-gutter-md q-mb-sm">
          <div class="col-12 col-sm-6">
            <q-toggle
              v-model="twoCardsGuaranteed"
              label="올인/무료로 2장 확정 (추가 결정 없음)"
              color="primary"
              dense
            />
          </div>
          <div class="col-12 col-sm-6 text-caption text-grey-6">
            <b>기본은 1장(턴)</b> 기준입니다. 턴이 공짜가 아니라면 플랍 콜을 2장 확률로 판단하면 안
            됩니다.
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
              :disable="twoCardsGuaranteed"
            />
          </div>

          <div class="col-12 col-sm-6 text-caption text-grey-6">
            <div v-if="twoCardsGuaranteed">
              올인/무료 카드로 <b>턴+리버(2장)</b>이 확정되어 2장 확률로 계산합니다.
            </div>
            <div v-else>플랍에서 콜이나 리버에서 콜은 1장 확률로 계산합니다.</div>
          </div>
        </div>

        <q-banner v-if="errorMsg" dense rounded class="q-mt-md" inline-actions>
          <template #avatar>
            <q-icon name="error_outline" />
          </template>
          <div class="text-body2">{{ errorMsg }}</div>
          <template #action>
            <q-btn flat label="닫기" @click="errorMsg = ''" />
          </template>
        </q-banner>
      </q-card>

      <!-- 결과 카드 -->
      <q-card flat bordered class="q-pa-md full-width calculator-result-card">
        <div class="row justify-between items-center q-mb-sm">
          <div class="text-subtitle1 text-weight-bold">결과</div>

          <q-chip
            v-if="result.ready"
            :color="result.isPlusEv ? 'positive' : 'negative'"
            text-color="white"
            :icon="result.isPlusEv ? 'trending_up' : 'trending_down'"
            class="status-chip"
          >
            {{ result.isPlusEv ? '+EV 콜' : '-EV 콜' }}
          </q-chip>
        </div>

        <div v-if="!result.ready" class="text-grey-7 text-body2">
          값을 입력하고 <b>계산하기</b>를 눌러주세요.
        </div>

        <div v-else class="column q-gutter-sm">
          <div class="result-row">
            <span class="label">필요 승률 (팟 오즈)</span>
            <span class="value">{{ result.potOddsPercent }} %</span>
          </div>

          <div class="result-row">
            <span class="label">실제 승률 (아웃 기반)</span>
            <span
              class="value"
              :class="
                result.actualEquity >= result.requiredEquity ? 'text-positive' : 'text-negative'
              "
            >
              {{ result.actualEquityPercent }} %
            </span>
          </div>

          <q-separator spaced />

          <div class="result-row">
            <span class="label">콜 EV</span>
            <span class="value" :class="result.evPerCall > 0 ? 'text-positive' : 'text-negative'">
              {{ result.formattedEvPerCall }} 칩
            </span>
          </div>

          <div class="text-caption text-grey-6 q-mt-sm">EV = 승률 × (팟 + 콜 금액) − 콜 금액</div>
        </div>
      </q-card>

      <!-- 설명 카드 -->
      <q-card flat bordered class="q-pa-md full-width info-card">
        <div class="text-subtitle2 text-weight-bold q-mb-xs">간단 설명</div>
        <div class="text-body2 text-grey-7">
          • <b>필요 승률</b> = 콜 금액 ÷ (현재 팟 + 콜 금액)<br />
          • <b>실제 승률</b>은 아웃 수와 남은 카드 수에 따라 조합식으로 계산합니다.<br />
          • 이 계산기는 <b>순수 콜 EV</b>만 다루며, 임플라이드 오즈/턴에서 추가 콜 비용은 포함하지
          않습니다.
        </div>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { logToolUsage } from 'src/api/tools'

/* ================= 입력 상태 ================= */

const potSize = ref(null)
const callAmount = ref(null)
const outs = ref(null)

// 기본: 1장(턴 한 장) 기준
const cardsToCome = ref(1)
const cardsOptions = [
  { label: '1장 (턴 한 장)', value: 1 },
  { label: '2장 (턴 + 리버, 확정일 때만)', value: 2 },
]

const twoCardsGuaranteed = ref(false)

const errorMsg = ref('')

/* ================= 결과 스냅샷 ================= */

const result = ref({
  ready: false,
  requiredEquity: 0,
  actualEquity: 0,
  potOddsPercent: '0.0',
  actualEquityPercent: '0.0',
  evPerCall: 0,
  formattedEvPerCall: '0',
  isPlusEv: false,
})

/* ================= 통계 ================= */

onMounted(() => {
  logToolUsage('CALL_EV', 'OPEN').catch(() => {})
})

/* ================= helpers ================= */

const clamp = (n, min, max) => Math.max(min, Math.min(max, n))

const isValidInput = () => {
  const pot = Number(potSize.value)
  const call = Number(callAmount.value)
  const o = Number(outs.value)
  return pot > 0 && call > 0 && o > 0
}

const calcRequiredEquity = (pot, call) => {
  // call / (pot + call)
  const denom = pot + call
  if (denom <= 0) return 1
  return call / denom
}

const calcActualEquity = (outsValue, cards) => {
  // 조합 기반 (정확):
  // 1장: outs/47
  // 2장: 1 - ((47-outs)/47 * (46-outs)/46)
  const o = clamp(Number(outsValue), 0, 46)

  if (cards === 1) return o / 47

  const missTurn = (47 - o) / 47
  const missRiver = (46 - o) / 46
  return 1 - missTurn * missRiver
}

const calcEvPerCall = (pot, call, eq) => {
  // EV = eq*(pot+call) - call
  return eq * (pot + call) - call
}

/* ================= UX: 2장 확정 토글이면 2장 고정 ================= */

watch(twoCardsGuaranteed, (v) => {
  if (v) cardsToCome.value = 2
  else cardsToCome.value = 1
})

/* ================= actions ================= */

const onCalculate = () => {
  errorMsg.value = ''

  if (!isValidInput()) {
    result.value.ready = false
    errorMsg.value = '팟, 콜 금액, 아웃 수를 모두 0보다 크게 입력해 주세요.'
    return
  }

  const pot = Number(potSize.value)
  const call = Number(callAmount.value)
  const o = Number(outs.value)
  const cards = Number(cardsToCome.value)

  const required = calcRequiredEquity(pot, call)
  const actual = calcActualEquity(o, cards)
  const ev = calcEvPerCall(pot, call, actual)
  const isPlus = ev > 0

  result.value = {
    ready: true,
    requiredEquity: required,
    actualEquity: actual,
    potOddsPercent: (required * 100).toFixed(1),
    actualEquityPercent: (actual * 100).toFixed(1),
    evPerCall: ev,
    formattedEvPerCall: Math.round(ev).toLocaleString(),
    isPlusEv: isPlus,
  }

  // 통계: 버튼 클릭 시에만
  logToolUsage('CALL_EV', 'CALCULATE').catch(() => {})
}
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
