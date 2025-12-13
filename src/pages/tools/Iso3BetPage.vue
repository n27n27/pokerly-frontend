<template>
  <q-page class="q-pa-md">
    <div class="page-wrap column q-gutter-y-lg">
      <!-- 헤더 -->
      <div>
        <div class="text-h5 text-weight-bold q-mb-xs">Iso / 3Bet 사이즈 계산기</div>
        <div class="text-body2 text-grey-7">
          상황(림프 / 오픈 / 스퀴즈)에 따라 표준적인 프리플랍 레이즈·3Bet·4Bet 권장 사이즈를
          계산합니다.
        </div>
      </div>

      <!-- 1) 상황 선택 -->
      <q-card flat bordered class="q-pa-md">
        <div class="text-subtitle1 text-weight-bold q-mb-sm">상황 선택</div>
        <q-select
          v-model="scenario"
          :options="scenarioOptions"
          label="현재 상황"
          emit-value
          map-options
          outlined
          dense
        />
        <div class="text-caption text-grey-7 q-mt-sm">
          상황에 따라 입력 항목과 계산 방식이 달라집니다.
        </div>
      </q-card>

      <!-- 2) 입력 -->
      <q-card flat bordered class="q-pa-md">
        <div class="row q-col-gutter-md">
          <!-- ISO: 림프만 있음 -->
          <template v-if="scenario === 'ISO'">
            <div class="col-12 col-sm-6">
              <q-select
                v-model="limpers"
                :options="limperOptions"
                label="림프한 사람 수"
                outlined
                dense
                emit-value
                map-options
              />
              <div class="text-caption text-grey-7 q-mt-xs">
                림퍼가 많을수록 멀티웨이를 피하기 위해 더 크게 레이즈하는 편입니다.
              </div>
            </div>

            <div class="col-12 col-sm-6">
              <q-select
                v-model="baseOpenMode"
                :options="openModeOptions"
                label="기준 오픈값 선택"
                outlined
                dense
                emit-value
                map-options
              />
              <q-input
                v-if="baseOpenMode === 'CUSTOM'"
                v-model.number="baseOpenCustom"
                type="number"
                min="1"
                step="0.1"
                outlined
                dense
                class="q-mt-sm"
                label="기준 오픈값 (직접 입력, bb)"
                hint="예: 2.2 / 2.5 / 3"
              />
              <div class="text-caption text-grey-7 q-mt-xs">
                Iso는 ‘오픈 사이즈’가 없기 때문에 계산 편의를 위해 기준 오픈값을 사용합니다.
              </div>
            </div>
          </template>

          <!-- 3Bet / Squeeze -->
          <template v-else>
            <div class="col-12 col-sm-4">
              <q-select
                v-model="openMode"
                :options="openModeOptions"
                label="오픈 사이즈 선택"
                outlined
                dense
                emit-value
                map-options
              />
              <q-input
                v-if="openMode === 'CUSTOM'"
                v-model.number="openCustom"
                type="number"
                min="1"
                step="0.1"
                outlined
                dense
                class="q-mt-sm"
                label="오픈 사이즈 (직접 입력, bb)"
                hint="예: 2.2 / 2.5 / 7"
              />
            </div>

            <div class="col-12 col-sm-4">
              <q-select
                v-model="callers"
                :options="callerOptions"
                label="콜러 수"
                outlined
                dense
                emit-value
                map-options
                :disable="scenario === '3BET'"
                hint="3Bet(오픈만)에서는 콜러가 0으로 고정됩니다"
              />
            </div>

            <div class="col-12 col-sm-4">
              <q-select
                v-model="position"
                :options="positionOptions"
                label="내 포지션"
                emit-value
                map-options
                outlined
                dense
              />
              <div class="text-caption text-grey-7 q-mt-xs">
                OOP(선 액션)에서는 상황을 단순하게 만들기 위해 더 큰 사이즈를 사용하는 것이
                일반적입니다.
              </div>
            </div>
          </template>
        </div>
      </q-card>

      <!-- 3) 라운딩(표시 안정화 + 선택 라운딩) -->
      <q-card flat bordered class="q-pa-md">
        <div class="row items-center justify-between q-col-gutter-md">
          <div class="col-12 col-sm-6">
            <q-toggle v-model="roundingEnabled" label="라운딩 적용" />
            <div class="text-caption text-grey-7 q-mt-xs">
              표시값은 항상 소수점 1자리로 정리되며, 라운딩을 켜면 0.5bb 또는 1bb 단위로 맞춥니다.
            </div>
          </div>

          <div class="col-12 col-sm-6">
            <q-select
              v-model="roundUnit"
              :options="roundUnitOptions"
              label="라운딩 단위"
              outlined
              dense
              emit-value
              map-options
              :disable="!roundingEnabled"
            />
          </div>
        </div>
      </q-card>

      <!-- 4) 고급 설정 -->
      <q-expansion-item
        icon="tune"
        label="공식 설정 (고급)"
        caption="비워두면 기본값이 적용됩니다"
        bordered
      >
        <div class="row q-col-gutter-md q-pa-md">
          <div class="col-12 col-sm-4">
            <q-input
              v-model.number="isoMult"
              type="number"
              step="0.1"
              outlined
              dense
              placeholder="기본값: 3"
              label="Iso: 기준오픈 × 배수"
            />
          </div>

          <div class="col-12 col-sm-4">
            <q-input
              v-model.number="callerAdd"
              type="number"
              step="0.5"
              outlined
              dense
              placeholder="기본값: 1.5"
              label="림퍼/콜러당 추가 (bb)"
            />
          </div>

          <div class="col-12 col-sm-4">
            <q-input
              v-model.number="threebetMultIP"
              type="number"
              step="0.1"
              outlined
              dense
              placeholder="기본값: 3"
              label="3Bet(IP): 오픈 × 배수"
            />
          </div>

          <div class="col-12 col-sm-4">
            <q-input
              v-model.number="threebetMultOOP"
              type="number"
              step="0.1"
              outlined
              dense
              placeholder="기본값: 4"
              label="3Bet(OOP): 오픈 × 배수"
            />
          </div>

          <div class="col-12 col-sm-4">
            <q-input
              v-model.number="squeezeExtra"
              type="number"
              step="0.5"
              outlined
              dense
              placeholder="기본값: 1"
              label="스퀴즈 추가 보정 (bb)"
            />
          </div>

          <div class="col-12 col-sm-4">
            <q-input
              v-model.number="threebetCallerAdd"
              type="number"
              step="0.5"
              outlined
              dense
              placeholder="기본값: 1"
              label="스퀴즈: 콜러당 추가 (bb)"
            />
          </div>

          <div class="col-12 col-sm-4">
            <q-input
              v-model.number="fourBetMultIP"
              type="number"
              step="0.1"
              outlined
              dense
              placeholder="기본값: 2.2"
              label="4Bet(IP): 3Bet × 배수"
            />
          </div>

          <div class="col-12 col-sm-4">
            <q-input
              v-model.number="fourBetMultOOP"
              type="number"
              step="0.1"
              outlined
              dense
              placeholder="기본값: 2.3"
              label="4Bet(OOP): 3Bet × 배수"
            />
          </div>
        </div>
      </q-expansion-item>

      <!-- 5) 결과 -->
      <q-card flat bordered class="q-pa-md">
        <div class="row items-start q-col-gutter-md">
          <div class="col-12 col-md-6">
            <div class="text-subtitle1 text-weight-bold q-mb-md">결과</div>

            <q-list bordered separator>
              <q-item>
                <q-item-section>
                  <q-item-label class="text-weight-medium">{{ primaryLabel }}</q-item-label>
                  <q-item-label caption>{{ primaryFormula }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <div class="text-h6 text-weight-bold">{{ fmtBb(primarySize) }}</div>
                </q-item-section>
              </q-item>

              <q-item v-if="scenario !== 'ISO'">
                <q-item-section>
                  <q-item-label class="text-weight-medium">4Bet 권장 사이즈(참고)</q-item-label>
                  <q-item-label caption>{{ fourBetFormula }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <div class="text-h6 text-weight-bold">{{ fmtBb(fourBetSize) }}</div>
                </q-item-section>
              </q-item>
            </q-list>

            <div class="text-caption text-grey-7 q-mt-sm">
              * 4Bet은 상황(스택, 상대 성향, 레인지)에 따라 크게 달라질 수 있어 참고값으로
              제공합니다.
            </div>
          </div>

          <div class="col-12 col-md-6">
            <div class="text-subtitle1 text-weight-bold q-mb-sm">빠른 해석</div>
            <q-card flat bordered class="q-pa-md">
              <div class="text-body2">
                <div v-if="scenario === 'ISO'">
                  Iso 레이즈는 림퍼들을 상대로 멀티웨이를 피하기 위한 레이즈입니다. 림퍼가 많을수록
                  사이즈를 키우는 것이 일반적입니다.
                </div>
                <div v-else-if="scenario === '3BET'">
                  3Bet은 상대 오픈 한 명을 대상으로 한 레이즈입니다. OOP에서는 콜을 줄이고 이후
                  플레이를 단순하게 만들기 위해 더 크게 치는 편입니다.
                </div>
                <div v-else>
                  스퀴즈는 오픈 + 콜러가 있는 상황에서 콜러들을 내보내기 위한 레이즈입니다. 일반
                  3Bet보다 더 큰 사이즈가 필요합니다.
                </div>
              </div>
            </q-card>
          </div>
        </div>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

/* =====================
 * 1) 선택지
 * ===================== */
const scenario = ref('ISO')
const scenarioOptions = [
  { label: 'Iso Raise (림프만 있을 때)', value: 'ISO' },
  { label: '3Bet (오픈에 레이즈)', value: '3BET' },
  { label: 'Squeeze (오픈 + 콜러에 레이즈)', value: 'SQUEEZE' },
]

const position = ref('IP')
const positionOptions = [
  { label: 'IP (내가 나중에 액션)', value: 'IP' },
  { label: 'OOP (내가 먼저 액션)', value: 'OOP' },
]

// 오픈 사이즈: 선택 + 커스텀
const openPresets = [2, 2.2, 2.5, 2.7, 3, 3.5, 4, 5, 6, 7]
const openMode = ref(2.2)
const openCustom = ref(2.2)

const baseOpenMode = ref(2.5)
const baseOpenCustom = ref(2.5)

const openModeOptions = computed(() => {
  const presetOpts = openPresets.map((v) => ({ label: `${v}bb`, value: v }))
  presetOpts.unshift({ label: '직접 입력', value: 'CUSTOM' })
  return presetOpts
})

// 콜러 수: 0~9
const callerOptions = Array.from({ length: 10 }, (_, i) => ({ label: String(i), value: i }))
const limperOptions = Array.from({ length: 10 }, (_, i) => ({ label: String(i), value: i })).slice(
  1,
) // 1~9

/* =====================
 * 2) 입력값
 * ===================== */
const callers = ref(0)
const limpers = ref(1)

/* =====================
 * 3) 라운딩
 * ===================== */
const roundingEnabled = ref(true)
const roundUnit = ref(0.5)
const roundUnitOptions = [
  { label: '0.5bb', value: 0.5 },
  { label: '1bb', value: 1 },
]

/* =====================
 * 4) 고급 설정(placeholder만) - 내부 기본값은 코드에서 적용
 * ===================== */
const isoMult = ref(null) // 기본 3
const callerAdd = ref(null) // 기본 1.5
const threebetMultIP = ref(null) // 기본 3
const threebetMultOOP = ref(null) // 기본 4
const squeezeExtra = ref(null) // 기본 1
const threebetCallerAdd = ref(null) // 기본 1
const fourBetMultIP = ref(null) // 기본 2.2
const fourBetMultOOP = ref(null) // 기본 2.3

/* =====================
 * 5) 유틸
 * ===================== */
const num = (v, fallback = 0) => {
  const n = Number(v)
  return Number.isFinite(n) ? n : fallback
}

// 1) 표시 안정화(항상 적용): 소수점 쓰레기 제거 -> 1자리
const normalize = (v) => Math.round(num(v, 0) * 10) / 10

// 2) 옵션 라운딩(선택 적용): 0.5 / 1 단위
const applyRounding = (v) => {
  const n = normalize(v)
  if (!roundingEnabled.value) return n
  const unit = num(roundUnit.value, 0.5)
  if (unit <= 0) return n
  return Math.round(n / unit) * unit
}

const fmtBb = (v) => {
  const n = num(v, 0)
  const fixed = Math.abs(n - Math.round(n)) < 1e-9 ? 0 : 1
  return `${n.toFixed(fixed)}bb`
}

/* =====================
 * 6) 실제 오픈값/기준오픈값 계산
 * ===================== */
const openSize = computed(() => {
  const v = openMode.value === 'CUSTOM' ? openCustom.value : openMode.value
  return num(v, 2.2)
})

const baseOpen = computed(() => {
  const v = baseOpenMode.value === 'CUSTOM' ? baseOpenCustom.value : baseOpenMode.value
  return num(v, 2.5)
})

// 3BET(오픈만)에서는 콜러는 0으로 고정되게 UX 보장
watch(scenario, (s) => {
  if (s === '3BET') callers.value = 0
})

/* =====================
 * 7) 계산 로직
 * ===================== */
const defaults = computed(() => ({
  isoMult: isoMult.value ?? 3,
  callerAdd: callerAdd.value ?? 1.5,
  threeIP: threebetMultIP.value ?? 3,
  threeOOP: threebetMultOOP.value ?? 4,
  squeezeExtra: squeezeExtra.value ?? 1,
  threeCallerAdd: threebetCallerAdd.value ?? 1,
  fourIP: fourBetMultIP.value ?? 2.2,
  fourOOP: fourBetMultOOP.value ?? 2.3,
}))

const primarySizeRaw = computed(() => {
  const d = defaults.value

  if (scenario.value === 'ISO') {
    // Iso: 기준오픈 × 배수 + 림퍼수 × 추가
    return baseOpen.value * d.isoMult + num(limpers.value, 1) * d.callerAdd
  }

  const mult = position.value === 'OOP' ? d.threeOOP : d.threeIP

  if (scenario.value === '3BET') {
    // 3Bet: 오픈 × 배수 (콜러 없음)
    return openSize.value * mult
  }

  // SQUEEZE: 오픈 × 배수 + 콜러수 × 추가 + 스퀴즈 보정
  return openSize.value * mult + num(callers.value, 0) * d.threeCallerAdd + d.squeezeExtra
})

const primarySize = computed(() => applyRounding(primarySizeRaw.value))

const fourBetSize = computed(() => {
  const d = defaults.value
  const mult = position.value === 'OOP' ? d.fourOOP : d.fourIP
  return applyRounding(primarySize.value * mult)
})

/* =====================
 * 8) 라벨/공식 표시
 * ===================== */
const primaryLabel = computed(() => {
  if (scenario.value === 'ISO') return '권장 Iso 레이즈'
  if (scenario.value === '3BET') return '권장 3Bet 사이즈'
  return '권장 스퀴즈(3Bet) 사이즈'
})

const primaryFormula = computed(() => {
  const d = defaults.value
  if (scenario.value === 'ISO') {
    return `기준오픈(${normalize(baseOpen.value)}bb) × ${d.isoMult} + 림퍼(${limpers.value}) × ${d.callerAdd}bb`
  }
  const mult = position.value === 'OOP' ? d.threeOOP : d.threeIP

  if (scenario.value === '3BET') {
    return `오픈(${normalize(openSize.value)}bb) × ${mult}`
  }

  return `오픈(${normalize(openSize.value)}bb) × ${mult} + 콜러(${callers.value}) × ${d.threeCallerAdd}bb + 보정 ${d.squeezeExtra}bb`
})

const fourBetFormula = computed(() => {
  const d = defaults.value
  const mult = position.value === 'OOP' ? d.fourOOP : d.fourIP
  return `3Bet(${normalize(primarySize.value)}bb) × ${mult}`
})
</script>

<style scoped>
.page-wrap {
  max-width: 1120px;
  margin: 0 auto;
}
</style>
