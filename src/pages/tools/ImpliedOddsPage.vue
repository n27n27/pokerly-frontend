<template>
  <q-page class="q-pa-md">
    <div class="column q-gutter-y-md" style="max-width: 960px; margin: 0 auto">
      <!-- 헤더 -->
      <div>
        <div class="row items-center q-gutter-sm q-mb-xs">
          <div class="text-h5 text-weight-bold">Implied Odds 계산기</div>
        </div>
        <div class="text-body2 text-grey-7">
          현재 팟(P), 콜 스택(C), 콜 이후에 상대에게서 추가로 더 받을 것 같은 스택(E)으로 Implied
          Odds를 계산합니다. 아웃 수를 넣으면 “대략 콜 가능한지”도 같이 확인할 수 있어요.
        </div>
      </div>

      <!-- 입력 카드 -->
      <q-card flat bordered class="q-pa-md">
        <div class="row items-center justify-between q-mb-sm">
          <div class="text-subtitle1 text-weight-bold">입력</div>
          <q-btn flat dense icon="restart_alt" label="리셋" @click="resetAll" />
        </div>

        <div class="row q-col-gutter-md">
          <div class="col-12 col-sm-4">
            <q-input
              v-model.number="pot"
              type="number"
              min="0"
              outlined
              label="현재 팟 (P)"
              placeholder="예: 24000"
              :rules="[(v) => isNullOrValidMoney(v) || '0 이상 숫자']"
              input-class="text-right"
            />
          </div>

          <div class="col-12 col-sm-4">
            <q-input
              v-model.number="callStack"
              type="number"
              min="0"
              outlined
              label="콜 스택 (C)"
              placeholder="예: 12000"
              :rules="[(v) => isNullOrValidMoney(v) || '0 이상 숫자']"
              input-class="text-right"
            />
          </div>

          <div class="col-12 col-sm-4">
            <q-input
              v-model.number="extraStack"
              type="number"
              min="0"
              outlined
              label="추가로 더 받을 스택 (E)"
              placeholder="예: 20000"
              :rules="[(v) => isNullOrValidMoney(v) || '0 이상 숫자']"
              input-class="text-right"
            />
            <div class="text-caption text-grey-7 q-mt-xs">
              콜 이후에 상대에게서 추가로 더 받을 것 같은 칩이에요. (상대 잔여 스택, 성향, 보드
              상황을 감안해서 “현실적으로” 잡아주세요)
            </div>
          </div>
        </div>

        <q-separator spaced />

        <!-- 아웃/남은 카드 -->
        <div class="row q-col-gutter-md items-start">
          <div class="col-12 col-md-7">
            <div class="text-subtitle2 text-weight-bold q-mb-xs">아웃 수</div>

            <div class="row items-center q-gutter-sm q-mb-sm">
              <q-select
                v-model="outsPreset"
                :options="outsPresetOptions"
                outlined
                dense
                label="프리셋"
                emit-value
                map-options
                clearable
                style="min-width: 260px"
                behavior="menu"
              />
              <q-space />
              <q-toggle v-model="useManualOuts" label="직접 입력" />
            </div>

            <q-input
              v-model.number="outsManual"
              type="number"
              min="0"
              max="47"
              outlined
              dense
              label="아웃"
              placeholder="예: 9"
              hint="0 ~ 47"
              :readonly="!useManualOuts"
              :rules="[(v) => isNullOrValidOuts(v) || '0~47 숫자']"
              style="max-width: 260px"
            />
            <div class="text-caption text-grey-7 q-mt-xs">
              프리셋을 고르면 아웃이 자동으로 바뀝니다. 직접 수정하려면 “직접 입력”을 켜주세요.
            </div>
          </div>

          <div class="col-12 col-md-5">
            <div class="text-subtitle2 text-weight-bold q-mb-xs">남은 카드</div>
            <q-btn-toggle
              v-model="streets"
              spread
              no-caps
              toggle-color="primary"
              :options="streetOptions"
              class="full-width"
            />
            <div class="text-caption text-grey-7 q-mt-xs">
              플랍이면 보통 “턴+리버(2장)”, 턴이면 “리버(1장)” 기준으로 봐요.
            </div>
          </div>
        </div>

        <q-separator spaced />

        <div class="text-caption text-grey-7">
          콜 스택(C)을 입력하면 결과가 자동으로 계산됩니다.
        </div>
      </q-card>

      <!-- 결과 카드 -->
      <q-card flat bordered class="q-pa-md">
        <div class="row items-center justify-between q-mb-sm">
          <div class="text-subtitle1 text-weight-bold">결과</div>
          <q-badge v-if="summaryBadge" :color="summaryBadge.color" :label="summaryBadge.label" />
        </div>

        <div v-if="!canCalculate" class="text-body2 text-grey-7">
          콜 스택(C)을 입력하면 결과가 표시됩니다.
        </div>

        <div v-else class="column q-gutter-sm">
          <!-- 핵심 요약 -->
          <q-card flat bordered class="q-pa-sm">
            <div class="row q-col-gutter-md items-center">
              <div class="col-12 col-sm-4">
                <div class="text-caption text-grey-7">Pot Odds</div>
                <div class="text-body1 text-weight-bold">
                  {{ fmtPct(potOddsPct) }}
                  <span class="text-caption text-grey-7">(≈ {{ fmtRatio(potOddsRatio) }})</span>
                </div>
              </div>

              <div class="col-12 col-sm-4">
                <div class="text-caption text-grey-7">Implied Odds</div>
                <div class="text-body1 text-weight-bold">
                  {{ fmtPct(impliedOddsPct) }}
                  <span class="text-caption text-grey-7">(≈ {{ fmtRatio(impliedOddsRatio) }})</span>
                </div>
              </div>

              <div class="col-12 col-sm-4">
                <div class="text-caption text-grey-7">필요 최소 확률</div>
                <div class="text-body1 text-weight-bold">
                  {{ fmtPct(requiredEquityPct) }}
                </div>
              </div>
            </div>
          </q-card>

          <!-- 아웃 기반 확률 -->
          <q-card flat bordered class="q-pa-sm">
            <div class="row items-center justify-between q-mb-xs">
              <div class="text-body2 text-weight-bold">
                아웃 기준 “대략” 성공 확률
                <span class="text-caption text-grey-7">
                  (아웃: {{ outsUsed }} / {{ streetsLabel }})
                </span>
              </div>
              <q-badge outline color="grey-8" label="대략" />
            </div>

            <div class="row q-col-gutter-md">
              <div class="col-12 col-sm-6">
                <div class="text-caption text-grey-7">성공 확률</div>
                <div class="text-body1 text-weight-bold">{{ fmtPct(drawHitPct) }}</div>
              </div>
              <div class="col-12 col-sm-6">
                <div class="text-caption text-grey-7">판정</div>
                <div class="text-body1 text-weight-bold" :class="callVerdictClass">
                  {{ callVerdictText }}
                </div>
              </div>
            </div>

            <div class="text-caption text-grey-7 q-mt-sm">
              * 이 확률은 아웃 수로 계산한 “대략값”이에요. 실제론 상대가 추가로 더 안 줄 수도 있고,
              맞아도 더 크게 지는 상황도 있을 수 있어요. (E를 너무 크게 잡으면 위험!)
            </div>
          </q-card>

          <!-- 디테일 -->
          <q-expansion-item dense expand-separator icon="tune" label="계산식/디테일 보기">
            <div class="text-body2 q-mt-sm">
              <div class="q-mb-xs"><b>Pot Odds</b> = C / (P + C)</div>
              <div class="q-mb-xs"><b>Implied Odds</b> = C / (P + C + E)</div>
              <div class="q-mb-xs"><b>필요 최소 확률</b> = Implied Odds (퍼센트 표시)</div>
              <div class="q-mb-xs">
                <b>성공 확률(아웃 기반)</b> = 리버 1장 또는 턴+리버 2장 기준으로 근사 계산
              </div>
            </div>
          </q-expansion-item>
        </div>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { logToolUsage } from 'src/api/tools'

const TOOL_CODE = 'IMPLIED_ODDS'

// -------------------- state (기본: 빈 값) --------------------
const pot = ref(null) // 현재 팟
const callStack = ref(null) // 콜 스택
const extraStack = ref(null) // 추가로 더 받을 스택

const outsPreset = ref(null)
const useManualOuts = ref(false)
const outsManual = ref(null)

// 남은 카드: 'TWO' = 턴+리버(2장), 'ONE' = 리버만(1장)
const streets = ref('TWO')

const streetOptions = [
  { label: '턴+리버 (2장)', value: 'TWO' },
  { label: '리버 (1장)', value: 'ONE' },
]

const outsPresetOptions = [
  { label: '플러시 드로우 (9 outs)', value: 9 },
  { label: '오픈엔디드 (8 outs)', value: 8 },
  { label: '것샷 (4 outs)', value: 4 },
  { label: '투오버 (6 outs)', value: 6 },
  { label: '페어+플러시 콤보 (12 outs)', value: 12 },
  { label: '몬스터 콤보 (15 outs)', value: 15 },
]

// -------------------- helpers --------------------
const isValidMoney = (v) => typeof v === 'number' && isFinite(v) && v >= 0
const isNullOrValidMoney = (v) =>
  v === null || v === '' || v === undefined || isValidMoney(Number(v))

const isValidOuts = (v) => typeof v === 'number' && isFinite(v) && v >= 0 && v <= 47
const isNullOrValidOuts = (v) => v === null || v === '' || v === undefined || isValidOuts(Number(v))

const toNumOrZero = (v) => {
  const n = Number(v)
  return isFinite(n) && n >= 0 ? n : 0
}

const resetAll = () => {
  pot.value = null
  callStack.value = null
  extraStack.value = null
  outsPreset.value = null
  useManualOuts.value = false
  outsManual.value = null
  streets.value = 'TWO'
  hasLoggedCalculate.value = false
}

// -------------------- 프리셋 선택 시 즉시 반영 --------------------
watch(outsPreset, (v) => {
  if (v === null || v === undefined) return
  const n = Number(v)
  if (!isFinite(n)) return
  outsManual.value = Math.min(47, Math.max(0, Math.floor(n)))
})

// -------------------- 계산 가능 조건 --------------------
const canCalculate = computed(() => toNumOrZero(callStack.value) > 0)

// 아웃 값 (없으면 0)
const outsUsed = computed(() => {
  const n = Number(outsManual.value)
  if (!isFinite(n) || n < 0) return 0
  return Math.min(47, Math.max(0, Math.floor(n)))
})

const streetsLabel = computed(() => (streets.value === 'TWO' ? '턴+리버' : '리버'))

// Pot Odds = C / (P + C)
const potOdds = computed(() => {
  if (!canCalculate.value) return 0
  const P = toNumOrZero(pot.value)
  const C = toNumOrZero(callStack.value)
  return C / (P + C)
})

// Implied Odds = C / (P + C + E)
const impliedOdds = computed(() => {
  if (!canCalculate.value) return 0
  const P = toNumOrZero(pot.value)
  const C = toNumOrZero(callStack.value)
  const E = toNumOrZero(extraStack.value)
  return C / (P + C + E)
})

const potOddsPct = computed(() => potOdds.value * 100)
const impliedOddsPct = computed(() => impliedOdds.value * 100)
const requiredEquityPct = computed(() => impliedOddsPct.value)

// ratio 표현: (P+C)/C
const potOddsRatio = computed(() => {
  if (!canCalculate.value) return 0
  const P = toNumOrZero(pot.value)
  const C = toNumOrZero(callStack.value)
  return (P + C) / C
})

const impliedOddsRatio = computed(() => {
  if (!canCalculate.value) return 0
  const P = toNumOrZero(pot.value)
  const C = toNumOrZero(callStack.value)
  const E = toNumOrZero(extraStack.value)
  return (P + C + E) / C
})

// 드로우 성공 확률 근사 (아웃 기반)
const drawHit = computed(() => {
  if (!canCalculate.value) return 0
  const o = outsUsed.value
  const fail1 = (47 - o) / 47
  if (streets.value === 'ONE') {
    return 1 - fail1
  }
  const fail2 = (46 - o) / 46
  return 1 - fail1 * fail2
})

const drawHitPct = computed(() => drawHit.value * 100)

// 판정: drawHit(근사) vs requiredEquity
const callVerdict = computed(() => {
  if (!canCalculate.value) return { ok: null, text: '대기', cls: 'text-grey-7' }

  const eq = drawHit.value
  const req = impliedOdds.value

  if (eq >= req) return { ok: true, text: '콜 가능(대략 +EV)', cls: 'text-positive' }
  return { ok: false, text: '콜 비추천(대략 -EV)', cls: 'text-negative' }
})

const callVerdictText = computed(() => callVerdict.value.text)
const callVerdictClass = computed(() => callVerdict.value.cls)

const summaryBadge = computed(() => {
  if (!canCalculate.value) return null
  if (callVerdict.value.ok === true) return { color: 'positive', label: 'CALL OK' }
  if (callVerdict.value.ok === false) return { color: 'negative', label: 'FOLD 권장' }
  return { color: 'grey-8', label: '-' }
})

// -------------------- formatters --------------------
const fmtPct = (v) => {
  if (!isFinite(v)) return '-'
  return `${Math.round(v * 10) / 10}%`
}
const fmtRatio = (v) => {
  if (!isFinite(v) || v <= 0) return '-'
  const x = Math.round(v * 100) / 100
  return `${x}:1`
}

// -------------------- logging (버튼 없이) --------------------
const hasLoggedCalculate = ref(false)

// “처음으로 계산 가능해진 순간” 1회만 CALCULATE 로깅
watch(canCalculate, (ok) => {
  if (ok && !hasLoggedCalculate.value) {
    hasLoggedCalculate.value = true
    logToolUsage(TOOL_CODE, 'CALCULATE').catch(() => {})
  }
})

onMounted(() => {
  logToolUsage(TOOL_CODE, 'OPEN').catch(() => {})
})
</script>

<style scoped></style>
