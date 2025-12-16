<template>
  <q-page class="q-pa-md">
    <div class="column q-gutter-md" style="max-width: 960px; margin: 0 auto">
      <!-- ================== 헤더 ================== -->
      <div class="q-mb-sm">
        <div class="row items-center q-gutter-sm q-mb-xs">
          <div class="text-h5 text-weight-bold">Re-Entry EV 계산기</div>
        </div>
        <div class="text-body2 text-grey-7">
          지금 이 시점에 <span class="text-weight-medium">리엔트리를 넣는 게 괜찮은 선택인지</span>
          대략 감을 잡기 위한 계산기입니다.
          <br />
          구조나 상대 수준, 멘탈까지 완벽히 반영하진 않고,
          <span class="text-weight-medium">“이 정도면 돈을 다시 넣을 만한가?”</span>를 숫자로
          도와주는 용도입니다.
        </div>
      </div>

      <!-- ================== 메인 레이아웃 ================== -->
      <div class="row q-col-gutter-md items-start q-mt-sm">
        <!-- ===== 왼쪽: 입력 영역 ===== -->
        <div class="col-12 col-md-7">
          <q-card flat bordered class="q-pa-md pokerly-card">
            <div class="text-subtitle1 text-weight-bold q-mb-sm">입력</div>

            <q-form class="column q-gutter-md">
              <!-- 1. 비용 / 상금 -->
              <div>
                <div class="text-caption text-grey-7 q-mb-xs">1. 비용 / 상금</div>

                <div class="row q-col-gutter-sm">
                  <div class="col-12 col-sm-6">
                    <q-input
                      v-model.number="form.buyIn"
                      type="number"
                      filled
                      dense
                      label="리엔트리 비용 (₩)"
                      :min="0"
                      hint="예: 60000 (6만 바인)"
                    >
                      <template #append>
                        <q-icon name="help_outline" size="16px">
                          <q-tooltip>
                            지금 다시 들어갈 때 실제로 내는 금액입니다.
                            <br />예: 60,000원이면 60000 입력
                          </q-tooltip>
                        </q-icon>
                      </template>
                    </q-input>
                  </div>

                  <div class="col-12 col-sm-6">
                    <q-input
                      v-model.number="form.totalPrizePool"
                      type="number"
                      filled
                      dense
                      label="총 상금 (예상, ₩)"
                      :min="0"
                      hint="예: 8000000 (800만 보장)"
                    >
                      <template #append>
                        <q-icon name="help_outline" size="16px">
                          <q-tooltip>
                            GTD 보장금이나, 상향이 거의 확실하면 상향된 금액을 대략 적어주세요.
                            <br />상금 구조 EV 자체는 토너먼트 EV 계산기에서 미리 계산해 base ROI에
                            반영하는 것이 좋습니다.
                          </q-tooltip>
                        </q-icon>
                      </template>
                    </q-input>
                  </div>
                </div>
              </div>

              <q-separator spaced />

              <!-- 2. 스택 / 평균 스택 -->
              <div>
                <div class="text-caption text-grey-7 q-mb-xs">2. 스택 / 평균 스택</div>

                <div class="row q-col-gutter-sm">
                  <div class="col-12 col-sm-6">
                    <q-input
                      v-model.number="form.reEntryStackBB"
                      type="number"
                      filled
                      dense
                      label="리엔트리 스택 (BB)"
                      :min="1"
                      suffix="BB"
                      hint="예: 80,000칩 / 2,000·4,000 → 20BB"
                    >
                      <template #append>
                        <q-icon name="help_outline" size="16px">
                          <q-tooltip>
                            지금 리엔트리하면 받는 스택을 BB 기준으로 입력합니다.
                            <br />예: 80,000칩 / 2,000·4,000 블라인드 → 20BB
                          </q-tooltip>
                        </q-icon>
                      </template>
                    </q-input>
                  </div>

                  <div class="col-12 col-sm-6">
                    <q-input
                      v-model.number="form.avgStackBB"
                      type="number"
                      filled
                      dense
                      label="현재 평균 스택 (BB)"
                      :min="1"
                      suffix="BB"
                      hint="예: 필드 전반이 30~40BB면 35 입력"
                    >
                      <template #append>
                        <q-icon name="help_outline" size="16px">
                          <q-tooltip>
                            남아 있는 플레이어들의 평균 스택을 BB로 대략 입력합니다.
                            <br />예: 대부분 30~40BB 사이면 35 정도 입력
                          </q-tooltip>
                        </q-icon>
                      </template>
                    </q-input>
                  </div>
                </div>
              </div>

              <q-separator spaced />

              <!-- 3. 인원 / ITM 정보 -->
              <div>
                <div class="text-caption text-grey-7 q-mb-xs">3. 인원 / ITM 정보</div>

                <div class="row q-col-gutter-sm">
                  <div class="col-12 col-sm-6">
                    <q-input
                      v-model.number="form.currentPlayers"
                      type="number"
                      filled
                      dense
                      label="현재 생존 인원 수"
                      :min="1"
                      suffix="명"
                      hint="예: 테이블 합쳐서 45명이면 45 입력"
                    >
                      <template #append>
                        <q-icon name="help_outline" size="16px">
                          <q-tooltip>
                            지금 플레이 중인 실제 남은 인원 수입니다.
                            <br />생존 대비 ITM 비율이 높을수록 EV가 조금 유리해집니다.
                          </q-tooltip>
                        </q-icon>
                      </template>
                    </q-input>
                  </div>

                  <div class="col-12 col-sm-6">
                    <q-input
                      v-model.number="form.itmSpots"
                      type="number"
                      filled
                      dense
                      label="ITM 인원 수 (머니인)"
                      :min="1"
                      suffix="명"
                      hint="예: 10등까지 상금이면 10 입력"
                    >
                      <template #append>
                        <q-icon name="help_outline" size="16px">
                          <q-tooltip>
                            이 토너먼트에서 상금을 받는 인원 수입니다.
                            <br />예: 10등까지 상금 → 10
                          </q-tooltip>
                        </q-icon>
                      </template>
                    </q-input>
                  </div>
                </div>
              </div>

              <q-separator spaced />

              <!-- 4. 내 수익률 (base ROI) -->
              <div>
                <div class="text-caption text-grey-7 q-mb-xs">4. 내 장기 수익률</div>

                <div class="row q-col-gutter-sm">
                  <div class="col-12 col-sm-6">
                    <q-input
                      v-model.number="form.baseRoiPercent"
                      type="number"
                      filled
                      dense
                      label="이 필드에서 내 ROI (장기, %)"
                      hint="예: 15 (15% 정도 이기는 느낌)"
                    >
                      <template #append>
                        <q-icon name="help_outline" size="16px">
                          <q-tooltip>
                            이 대회를 여러 번 뛴다고 했을 때, 전체적으로 기대되는 장기 ROI입니다.
                            <br />대략적인 감으로 적어도 괜찮습니다.
                          </q-tooltip>
                        </q-icon>
                      </template>
                    </q-input>
                  </div>
                </div>
              </div>
            </q-form>
          </q-card>
        </div>

        <!-- ===== 오른쪽: 결과 / 설명 ===== -->
        <div class="col-12 col-md-5">
          <!-- 결과 카드 -->
          <q-card flat bordered class="q-pa-md pokerly-card q-mb-md">
            <div class="row items-center justify-between q-mb-sm">
              <div class="text-subtitle1 text-weight-bold">결과 요약</div>
              <q-badge v-if="gradeLabel" :color="gradeColor" class="q-px-sm q-py-xs">
                {{ gradeLabel }}
              </q-badge>
            </div>

            <div class="column q-gutter-sm">
              <!-- 예상 ROI -->
              <div class="row items-center justify-between">
                <div class="text-body2 text-grey-7">이번 리엔트리에 대한 예상 ROI</div>
                <div class="text-h6 text-weight-bold">
                  <span
                    :class="{
                      'text-positive': effectiveRoiNow > 0,
                      'text-negative': effectiveRoiNow < 0,
                    }"
                  >
                    {{ formatPercent(effectiveRoiNow) }}
                  </span>
                </div>
              </div>

              <!-- 예상 순이익 -->
              <div class="row items-center justify-between q-mt-sm">
                <div class="text-body2 text-grey-7">리엔트리 1회 기준 기대 순이익</div>
                <div class="text-h6 text-weight-bold">
                  <span
                    :class="{
                      'text-positive': evNow > 0,
                      'text-negative': evNow < 0,
                    }"
                  >
                    {{ formatMoney(evNow) }} 원
                  </span>
                </div>
              </div>

              <q-separator spaced />

              <!-- 부가 정보 -->
              <div class="text-caption text-grey-7 column q-gutter-xs">
                <div>
                  • 총 상금 (입력 기준):
                  <b>{{ formatMoney(prizePool) }} 원</b>
                </div>
                <div v-if="survivalRatioText">
                  • 현재 경쟁률 (생존 : ITM):
                  <b>{{ survivalRatioText }}</b>
                </div>
                <div v-if="stackRatioText">
                  • 내 스택 / 평균 스택:
                  <b>{{ stackRatioText }}</b>
                </div>
              </div>
            </div>
          </q-card>

          <!-- 설명 카드 -->
          <q-card flat bordered class="q-pa-md bg-grey-1 pokerly-card">
            <div class="text-subtitle2 text-weight-bold q-mb-xs">결과 해석 도움말</div>
            <div class="text-caption text-grey-8">
              이 계산기는,
              <b>“이 필드를 처음부터 뛰면 내 ROI가 몇 %쯤 나온다”</b>고 정해 둔 뒤,
              <br />
              <b>내 스택 깊이(내 BB / 평균 BB)</b>와 <b>현재 경쟁률(ITM / 생존)</b>을 함께 이용해
              현재 리엔트리의 ROI를 근사합니다. <br /><br />
              대략적인 해석 기준은 다음과 같습니다.
              <br />
              · 0% 이하: 비추천 (장기적으로 손해 구간)<br />
              · 0~3%: 거의 0EV, 재미/상황 따라 결정<br />
              · 3~8%: 애매하지만 +EV<br />
              · 8~15%: +EV, 충분히 고려할 만함<br />
              · 15% 이상: 꽤 좋은 리엔트리 스팟
            </div>
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { computed, reactive, onMounted, watch, onUnmounted } from 'vue'
import { logToolUsage } from 'src/api/tools'

const TOOL_CODE = 'REENTRY_EV'

onMounted(() => {
  logToolUsage(TOOL_CODE, 'OPEN')
})

const form = reactive({
  // 1. 비용 / 상금
  buyIn: null,
  totalPrizePool: null,

  // 2. 스택
  reEntryStackBB: null,
  avgStackBB: null,

  // 3. 인원 / ITM
  currentPlayers: null,
  itmSpots: null,

  // 4. base ROI
  baseRoiPercent: null,
})

// 총 상금 (표시용)
const prizePool = computed(() => {
  return form.totalPrizePool && !isNaN(form.totalPrizePool) ? form.totalPrizePool : 0
})

// 스택 비율 / 경쟁률 표시용 텍스트
const stackRatioText = computed(() => {
  if (
    form.reEntryStackBB === null ||
    form.avgStackBB === null ||
    isNaN(form.reEntryStackBB) ||
    isNaN(form.avgStackBB) ||
    form.avgStackBB <= 0
  ) {
    return ''
  }
  const ratio = form.reEntryStackBB / form.avgStackBB
  const rounded = Math.round(ratio * 100) / 100
  return `${rounded}배`
})

const survivalRatioText = computed(() => {
  if (
    form.currentPlayers === null ||
    form.itmSpots === null ||
    isNaN(form.currentPlayers) ||
    isNaN(form.itmSpots) ||
    form.currentPlayers <= 0 ||
    form.itmSpots <= 0
  ) {
    return ''
  }
  return `${form.currentPlayers} : ${form.itmSpots}`
})

// 현재 스팟에서의 근사 ROI
const effectiveRoiNow = computed(() => {
  const base = form.baseRoiPercent

  if (
    base === null ||
    form.reEntryStackBB === null ||
    form.avgStackBB === null ||
    form.currentPlayers === null ||
    form.itmSpots === null
  ) {
    return 0
  }

  if (
    isNaN(base) ||
    isNaN(form.reEntryStackBB) ||
    isNaN(form.avgStackBB) ||
    isNaN(form.currentPlayers) ||
    isNaN(form.itmSpots) ||
    form.avgStackBB <= 0 ||
    form.currentPlayers <= 0 ||
    form.itmSpots <= 0
  ) {
    return 0
  }

  const reBB = form.reEntryStackBB
  const avgBB = form.avgStackBB
  const current = form.currentPlayers
  const itm = form.itmSpots

  // 1) 스택 비율: 내 BB / 평균 BB
  const stackRatio = reBB / avgBB
  let depthFactor = stackRatio
  if (depthFactor < 0.2) depthFactor = 0.2
  if (depthFactor > 1.5) depthFactor = 1.5

  // 2) 경쟁률 보정: ITM / 현재 생존 인원
  const survival = itm / current // 예: 7 / 50 ≈ 0.14
  const baseline = 0.2 // 대략 20% ITM을 기준으로 가정
  const rel = survival / baseline
  let survivalAdj = 0.5 + 0.5 * rel // 기준과 비슷하면 ≈ 1 근처
  if (survivalAdj < 0.4) survivalAdj = 0.4
  if (survivalAdj > 1.3) survivalAdj = 1.3

  return base * depthFactor * survivalAdj
})

let calcLogTimer = null
const CALC_LOG_DELAY = 700 // ms: 입력 멈춘 뒤 0.7초 후 1번만 로그

watch(
  () => effectiveRoiNow.value,
  (newVal, oldVal) => {
    // 값이 안 바뀌었거나 아직 유효하지 않으면 스킵
    if (newVal === oldVal || !isFinite(newVal)) return

    // 직전 예약된 로그가 있으면 취소
    if (calcLogTimer) {
      clearTimeout(calcLogTimer)
    }

    // 마지막 변경 후 일정 시간 지나면 CALCULATE 1회 기록
    calcLogTimer = setTimeout(() => {
      logToolUsage(TOOL_CODE, 'CALCULATE')
      calcLogTimer = null
    }, CALC_LOG_DELAY)
  },
)

onUnmounted(() => {
  if (calcLogTimer) {
    clearTimeout(calcLogTimer)
  }
})

// EV (1,000원 단위 올림)
const evNow = computed(() => {
  if (form.buyIn === null || isNaN(form.buyIn)) return 0
  const raw = (form.buyIn * effectiveRoiNow.value) / 100
  return Math.ceil(raw / 1000) * 1000
})

// 등급: 고정 구간 기준
const gradeType = computed(() => {
  const roi = effectiveRoiNow.value

  if (roi <= 0) return 'NEGATIVE'
  if (roi < 3) return 'TINY' // 0 ~ 3%
  if (roi < 8) return 'SMALL' // 3 ~ 8%
  if (roi < 15) return 'GOOD' // 8 ~ 15%
  return 'GREAT' // 15% 이상
})

const gradeLabel = computed(() => {
  switch (gradeType.value) {
    case 'GREAT':
      return '강력 추천 (+EV 크게)'
    case 'GOOD':
      return '추천 (+EV)'
    case 'SMALL':
      return '애매하지만 +EV'
    case 'TINY':
      return '거의 0EV (가볍게)'
    case 'NEGATIVE':
      return '비추천 (0EV 이하)'
    default:
      return ''
  }
})

const gradeColor = computed(() => {
  switch (gradeType.value) {
    case 'GREAT':
      return 'positive'
    case 'GOOD':
      return 'primary'
    case 'SMALL':
    case 'TINY':
      return 'warning'
    case 'NEGATIVE':
      return 'negative'
    default:
      return 'grey'
  }
})

// 포맷터
const formatMoney = (value) => {
  if (!value || isNaN(value)) return '0'
  return Math.round(value).toLocaleString('ko-KR')
}

const formatPercent = (value) => {
  if (value === null || value === undefined || isNaN(value)) return '0%'
  const rounded = Math.round(value * 10) / 10
  return `${rounded}%`
}
</script>

<style scoped>
.pokerly-card {
  border-radius: 14px;
}
</style>
