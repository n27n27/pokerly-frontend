<template>
  <q-page class="q-pa-md">
    <div class="column q-gutter-lg" style="max-width: 1120px; margin: 0 auto">
      <!-- HEADER -->
      <div>
        <div class="text-h5 text-weight-bold q-mb-xs">Tournament EV 계산기</div>
        <div class="text-body2 text-grey-7">
          바인, GTD, 엔트리 수, 필드 난이도, 할인율을 기반으로 여러 토너먼트의 기대수익(EV)을
          비교하는 도구입니다.
        </div>
      </div>

      <!-- MOBILE 안내 -->
      <q-banner v-if="$q.screen.xs" class="bg-grey-2 rounded-borders q-pa-sm">
        <q-icon name="smartphone" class="q-mr-sm" />
        <span class="text-caption">
          모바일에서는 가로 화면(랜드스케이프)에서 보시면 더 편리합니다.
        </span>
      </q-banner>

      <!-- 내 실력 설정 -->
      <q-card bordered flat class="q-pa-md">
        <div class="row items-start q-col-gutter-md">
          <div class="col-12 col-md-4">
            <q-input
              v-model.number="baseRoi"
              type="number"
              filled
              dense
              label="내 예상 ROI (기본 구조 기준, %)"
              suffix="%"
              :min="-50"
              :max="200"
            >
              <template #append>
                <q-icon name="help_outline" size="18px" class="cursor-pointer">
                  <q-tooltip>
                    평균 난이도 & 레이크 약 20% 환경에서<br />
                    장기적으로 기대하는 수익률을 입력합니다.<br /><br />
                    예: ROI 20% → 1바인당 +20% 기대값<br />
                    실력이 강하면 20~30%, 보통이면 5~15% 등
                  </q-tooltip>
                </q-icon>
              </template>
            </q-input>
          </div>

          <div class="col-12 col-md-8">
            <div class="text-caption text-grey-7">
              · 이 값은 <b>중립적인 평균 필드</b>에서의 장기 기대 ROI입니다.<br />
              · 각 대회별 실제 예상 ROI는 필드 난이도, 레이크, 오버레이를 반영해 조정됩니다.
            </div>
          </div>
        </div>
      </q-card>

      <!-- LIST HEADER -->
      <div class="row justify-between items-center">
        <div class="text-subtitle1 text-weight-medium">토너먼트</div>

        <q-btn color="primary" unelevated icon="add" label="대회 추가" @click="addTournament" />
      </div>

      <!-- 대회 카드들 -->
      <div class="column">
        <q-card v-for="t in tournaments" :key="t.id" bordered flat class="q-pa-md">
          <div class="row q-col-gutter-lg items-start">
            <!-- LEFT AREA: 입력 -->
            <div class="col-12 col-md-8">
              <!-- NAME -->
              <q-input
                v-model="t.label"
                filled
                dense
                class="q-mb-md"
                label="대회 / 매장 이름"
                :name="`label-${t.id}`"
                placeholder="예: 500 GTD, 700 GTD 메인 등"
              />

              <!-- MODE SELECT -->
              <div class="row q-col-gutter-md q-mb-sm">
                <div class="col-12 col-sm-5">
                  <q-option-group v-model="t.mode" :options="modeOptions" type="radio" dense />
                </div>

                <div class="col-12 col-sm-7 text-grey-7 text-caption">
                  · <b>GTD + 기준 엔트리</b>: 최소 상금(GTD) & 기준 엔트리 제공<br />
                  · <b>고정 프라이즈</b>: 엔트리 관계없이 상금 고정<br />
                  · <b>프라이즈 비율</b>: 프라이즈·레이크 퍼센트 제공
                </div>
              </div>

              <!-- 공통 입력 -->
              <div class="row q-col-gutter-md q-mb-sm">
                <div class="col-12 col-sm-4">
                  <q-input
                    v-model.number="t.buyIn"
                    type="number"
                    filled
                    dense
                    label="정가 바인"
                    :name="`buyIn-${t.id}`"
                    placeholder="예: 100000"
                    :min="0"
                  />
                </div>

                <div class="col-12 col-sm-4">
                  <q-input
                    v-model.number="t.entries"
                    type="number"
                    filled
                    dense
                    label="예상 총 엔트리"
                    :name="`entries-${t.id}`"
                    placeholder="예: 300"
                    :min="1"
                  />
                </div>

                <div class="col-12 col-sm-4">
                  <q-input
                    v-model.number="t.gtd"
                    type="number"
                    filled
                    dense
                    label="GTD 금액"
                    :disable="t.mode !== 'GTD_BASE'"
                    :name="`gtd-${t.id}`"
                    placeholder="예: 20000000"
                  />
                </div>
              </div>

              <!-- MODE-SPECIFIC -->
              <div class="row q-col-gutter-md">
                <!-- GTD + 기준 엔트리 -->
                <template v-if="t.mode === 'GTD_BASE'">
                  <div class="col-12 col-sm-4">
                    <q-input
                      v-model.number="t.baseEntries"
                      type="number"
                      filled
                      dense
                      :min="1"
                      :name="`baseEntries-${t.id}`"
                      label="기준 엔트리"
                      placeholder="예: 333"
                    />
                  </div>

                  <div class="col-12 col-sm-4">
                    <q-input
                      :model-value="computedPrizeRatio(t)"
                      filled
                      dense
                      readonly
                      label="추정 프라이즈 비율"
                      suffix="%"
                    />
                  </div>
                </template>

                <!-- FIXED PRIZE -->
                <template v-else-if="t.mode === 'FIXED_PRIZE'">
                  <div class="col-12 col-sm-4">
                    <q-input
                      v-model.number="t.fixedPrize"
                      type="number"
                      filled
                      dense
                      :name="`fixedPrize-${t.id}`"
                      label="고정 프라이즈 풀"
                      placeholder="예: 5000000"
                      :id="`fixedPrize-${t.id}`"
                    />
                  </div>
                </template>

                <!-- PERCENT -->
                <template v-else-if="t.mode === 'PERCENTAGE'">
                  <div class="col-12 col-sm-4">
                    <q-input
                      v-model.number="t.prizeRatio"
                      type="number"
                      filled
                      dense
                      suffix="%"
                      :min="0"
                      :max="100"
                      :name="`ratio-${t.id}`"
                      label="프라이즈 비율 (%)"
                      placeholder="예: 70"
                      :id="`ratio-${t.id}`"
                    />
                  </div>
                </template>
                <div class="col-12 col-sm-4">
                  <q-input
                    v-model.number="t.discountPercent"
                    type="number"
                    filled
                    dense
                    suffix="%"
                    :min="0"
                    :max="100"
                    :name="`discount-${t.id}`"
                    :id="`discount-${t.id}`"
                    label="할인율 (선택)"
                    placeholder="예: 50 → 반값"
                  >
                    <template #hint>
                      할인율은 <b>내 바인만</b> 바뀌며 필드 구조는 동일합니다.<br />
                      0~100% 입력 (100% = 프리롤)
                    </template>
                  </q-input>
                </div>
              </div>
            </div>

            <!-- RIGHT AREA: 결과 -->
            <div class="col-12 col-md-4">
              <q-card bordered flat class="q-pa-sm q-mb-sm bg-grey-1">
                <div class="text-caption text-weight-medium q-mb-xs">필드 난이도</div>

                <q-select
                  v-model="t.field"
                  :options="difficultyOptions"
                  dense
                  filled
                  emit-value
                  map-options
                  :name="`difficulty-${t.id}`"
                  label="난이도 선택"
                />
              </q-card>

              <q-card bordered flat class="q-pa-sm">
                <div class="row items-center justify-between q-mb-sm">
                  <div class="row items-center q-gutter-xs">
                    <div class="text-caption text-weight-medium">결과 요약</div>
                    <q-icon name="help_outline" size="16px" class="cursor-pointer text-grey-7">
                      <q-tooltip anchor="top right" self="bottom right">
                        <div class="text-caption">
                          <b>정가 1바인 EV</b><br />
                          모든 플레이어가 정가 바인을 냈다고 가정했을 때의 구조적 기대
                          이익입니다.<br /><br />

                          <b>할인 기준 1바인 EV</b><br />
                          필드 구조는 동일하며, <b>내 바인만 할인되었을 때</b> 실제 기대
                          이익입니다.<br /><br />

                          <b>예상 ROI</b><br />
                          구조 기반의 ROI이며, 할인 여부와 무관합니다.<br /><br />

                          <b>레이크 추정</b><br />
                          총 바인 대비 매장 수익 비율을 의미합니다.<br /><br />

                          <b>오버레이</b><br />
                          GTD 미달 시 매장이 채워 넣는 추가 상금으로, 플레이어에게 매우 유리합니다.
                        </div>
                      </q-tooltip>
                    </q-icon>
                  </div>

                  <q-chip
                    v-if="results[t.id]?.grade"
                    dense
                    :color="gradeColor(results[t.id].grade)"
                    text-color="white"
                  >
                    {{ results[t.id].grade }} 등급
                  </q-chip>
                </div>

                <template v-if="results[t.id]?.valid">
                  <div class="text-caption">
                    정가 1바인 EV:
                    <span class="text-weight-medium">
                      {{ formatMoney(results[t.id].ev) }}
                    </span>
                  </div>

                  <div class="text-caption" v-if="results[t.id].evDiscount !== null">
                    할인 기준 1바인 EV:
                    <span class="text-weight-medium text-primary">
                      {{ formatMoney(results[t.id].evDiscount) }}
                    </span>
                  </div>

                  <div class="text-caption">
                    예상 ROI:
                    <span class="text-weight-medium">
                      {{ (results[t.id].roi * 100).toFixed(1) }}%
                    </span>
                  </div>

                  <div class="text-caption">
                    레이크 추정:
                    <span class="text-weight-medium">
                      {{ (results[t.id].rake * 100).toFixed(1) }}%
                    </span>
                  </div>

                  <div class="text-caption">
                    오버레이:
                    <span class="text-weight-medium">
                      {{ results[t.id].overlay > 0 ? formatMoney(results[t.id].overlay) : '없음' }}
                    </span>
                  </div>
                </template>

                <template v-else>
                  <div class="text-negative text-caption">
                    계산에 필요한 값이 부족하거나<br />
                    구조가 올바르지 않습니다.
                  </div>
                </template>
              </q-card>
            </div>
          </div>

          <div class="row justify-end q-mt-sm">
            <q-btn
              flat
              dense
              color="negative"
              icon="delete"
              label="삭제"
              @click="removeTournament(t.id)"
            />
          </div>
        </q-card>
      </div>

      <!-- 비교 테이블 -->
      <q-card v-if="tournaments.length" bordered flat class="q-pa-md">
        <div class="text-subtitle1 text-weight-bold q-mb-sm">대회별 EV 비교</div>

        <q-table
          :rows="tableRows"
          :columns="tableCols"
          row-key="id"
          hide-bottom
          dense
          flat
          bordered
        >
          <template #body-cell-ev="p">
            <q-td :props="p">
              {{ formatMoney(p.row.ev) }}
            </q-td>
          </template>

          <template #body-cell-evDiscount="p">
            <q-td :props="p">
              {{ p.row.evDiscount !== null ? formatMoney(p.row.evDiscount) : '-' }}
            </q-td>
          </template>

          <template #body-cell-roi="p">
            <q-td :props="p"> {{ (p.row.roi * 100).toFixed(1) }}% </q-td>
          </template>

          <template #body-cell-rake="p">
            <q-td :props="p"> {{ (p.row.rake * 100).toFixed(1) }}% </q-td>
          </template>

          <template #body-cell-overlay="p">
            <q-td :props="p">
              {{ p.row.overlay > 0 ? formatMoney(p.row.overlay) : '-' }}
            </q-td>
          </template>

          <template #body-cell-grade="p">
            <q-td :props="p">
              <template v-if="p.row.grade">
                <q-chip dense :color="gradeColor(p.row.grade)" text-color="white">
                  {{ p.row.grade }}
                </q-chip>
              </template>
              <template v-else> - </template>
            </q-td>
          </template>
        </q-table>
      </q-card>
    </div>
  </q-page>
</template>

<style scoped>
.text-small {
  font-size: 12px;
}
</style>
<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { logToolUsage } from 'src/api/tools'

/* ============================================================
   기본 설정
============================================================ */

const baseRoi = ref(10) // % 단위, 사용자가 입력하는 내 기본 ROI(중립 환경)

let nextId = 1
const tournaments = reactive([])

/* 모드 선택 옵션 */
const modeOptions = [
  { label: 'GTD + 기준 엔트리', value: 'GTD_BASE' },
  { label: '고정 프라이즈', value: 'FIXED_PRIZE' },
  { label: '프라이즈 비율', value: 'PERCENTAGE' },
]

/* 필드 난이도 -> ROI 배율 */
const difficultyOptions = [
  { label: '매우 쉬움', value: 'VERY_SOFT' },
  { label: '쉬움', value: 'SOFT' },
  { label: '보통', value: 'NORMAL' },
  { label: '어려움', value: 'TOUGH' },
]

const FIELD_FACTOR = {
  VERY_SOFT: 1.5,
  SOFT: 1.3,
  NORMAL: 1.0,
  TOUGH: 0.7,
}

/* 레이크 기준값 */
const RAKE_REF = 0.2 // 레이크 20%를 중립 환경으로 가정
const RAKE_PENALTY = 1.0 // 레이크 초과분에 대한 ROI 감쇠 비율

/* ============================================================
   기본 토너먼트 객체 생성
============================================================ */
function newTournament(label = '') {
  return reactive({
    id: nextId++,

    label: label,
    mode: 'GTD_BASE',

    buyIn: null, // 정가 바인
    entries: null, // 예상 엔트리
    gtd: null, // GTD 금액 (GTD_BASE)
    baseEntries: null, // 기준 엔트리 (GTD_BASE)

    fixedPrize: null, // 고정 프라이즈
    prizeRatio: null, // 비율모드의 프라이즈 %

    field: 'NORMAL', // 난이도

    discountPercent: null, // 할인율(0~100)
  })
}

tournaments.push(newTournament(''))

// 페이지 진입 시 한 번만 OPEN 로깅
onMounted(() => {
  logToolUsage('TOURNAMENT_EV', 'OPEN')
})

/* ============================================================
   모든 토너먼트 → 계산 결과 매핑
============================================================ */
const results = computed(() => {
  const map = {}
  tournaments.forEach((t) => {
    map[t.id] = calcEv(t)
  })
  return map
})

// id -> true/false
const loggedCalcMap = reactive({})

watch(
  results,
  (newResults) => {
    // newResults: { [id]: { valid, ev, ... }, ... }
    Object.entries(newResults).forEach(([id, r]) => {
      if (r.valid && !loggedCalcMap[id]) {
        // 이 카드에서 처음으로 유효한 계산이 나왔을 때만 로깅
        loggedCalcMap[id] = true
        logToolUsage('TOURNAMENT_EV', 'CALCULATE')
      }
    })
  },
  { deep: true },
)

/* ============================================================
   토너먼트 추가/삭제
============================================================ */
function addTournament() {
  tournaments.push(newTournament())
}
function removeTournament(id) {
  const idx = tournaments.findIndex((t) => t.id === id)
  if (idx !== -1) tournaments.splice(idx, 1)
}

/* ============================================================
   Helper: 화폐 포맷
============================================================ */
function formatMoney(v) {
  if (!isFinite(v)) return '-'
  const rounded = Math.floor(v / 1000) * 1000 // 1000원 단위 버림
  return rounded.toLocaleString('ko-KR') + '원'
}

/* ============================================================
   Helper: GTD 기준 추정 프라이즈 비율(%)
============================================================ */
function computedPrizeRatio(t) {
  const buyIn = Number(t.buyIn)
  const gtd = Number(t.gtd)
  const baseEntries = Number(t.baseEntries)

  if (!buyIn || !gtd || !baseEntries) return '-'

  const ratio = gtd / (buyIn * baseEntries)
  if (!isFinite(ratio) || ratio <= 0 || ratio >= 1) return '-'

  return (ratio * 100).toFixed(1)
}

/* ============================================================
   EV 계산
============================================================ */

function invalidResult() {
  return {
    valid: false,
    ev: 0,
    evDiscount: null,
    roi: 0,
    rake: 0,
    overlay: 0,
    grade: null,
  }
}

function calcEv(t) {
  const buyIn = Number(t.buyIn)
  const entries = Number(t.entries)

  if (!buyIn || !entries) return invalidResult()

  const totalPaid = buyIn * entries

  let prizePool = 0
  let overlay = 0
  let rake = 0

  /* ---------------- GTD + 기준 엔트리 ---------------- */
  if (t.mode === 'GTD_BASE') {
    const gtd = Number(t.gtd)
    const baseEntries = Number(t.baseEntries)

    if (!gtd || !baseEntries) return invalidResult()

    const denom = buyIn * baseEntries
    if (!denom) return invalidResult()

    // 기준 엔트리에서의 프라이즈 비율 (≈ 1 - 레이크)
    let prizeRatioBase = gtd / denom

    // 이상한 값일 경우 디폴트 70% / 30% 구조로 보정
    if (!isFinite(prizeRatioBase) || prizeRatioBase <= 0 || prizeRatioBase >= 1) {
      prizeRatioBase = 0.7
    }

    if (totalPaid < gtd) {
      // ✅ 진짜 오버레이: 원 바인들을 다 합쳐도 GTD를 못 채움
      // → 매장이 GTD까지 채워 넣는다.
      overlay = gtd - totalPaid
      prizePool = gtd

      // 이 상황에서는 레이크가 사실상 0이라고 보고,
      // overlay를 따로 ROI에 반영한다.
      rake = 0
    } else {
      // ✅ 총 바인만으로 GTD 이상이 모였다 → 오버레이 없음
      // 기준 엔트리에서 추정한 레이크 비율을 그대로 적용
      overlay = 0
      prizePool = totalPaid * prizeRatioBase
      rake = 1 - prizeRatioBase
    }
  } else if (t.mode === 'FIXED_PRIZE') {

  /* ---------------- 고정 프라이즈 ---------------- */
    const fp = Number(t.fixedPrize)
    if (!fp) return invalidResult()

    prizePool = fp
    overlay = 0
    rake = 1 - prizePool / totalPaid
  } else if (t.mode === 'PERCENTAGE') {

  /* ---------------- 프라이즈 비율 ---------------- */
    const pr = Number(t.prizeRatio)
    if (pr < 0 || pr > 100) return invalidResult()

    const ratio = pr / 100
    prizePool = totalPaid * ratio
    overlay = 0
    rake = 1 - ratio
  }

  /* ---------------- ROI 보정 ---------------- */

  const base = Number(baseRoi.value) / 100 // 내 기본 ROI (중립 필드 기준)
  const fieldFactor = FIELD_FACTOR[t.field] || 1
  const roiField = base * fieldFactor

  // 레이크 기준치(20%)보다 높은 만큼 ROI를 깎기
  const extraRake = Math.max(rake - RAKE_REF, 0)
  const roiAfterRake = roiField - extraRake * RAKE_PENALTY

  // 오버레이를 ROI로 환산해서 더해줌
  const overlayRoi = overlay > 0 ? overlay / totalPaid : 0

  const finalRoi = roiAfterRake + overlayRoi

  /* ---------------- EV 계산 ---------------- */

  const ev = buyIn * finalRoi

  // 할인 EV
  let evDiscount = null
  if (t.discountPercent !== null && isFinite(t.discountPercent)) {
    const disc = t.discountPercent / 100
    const discountedBuyIn = buyIn * (1 - disc) // 100% → 프리롤

    const returnExpected = buyIn * (1 + finalRoi)
    evDiscount = returnExpected - discountedBuyIn
  }

  const grade = computeGrade(ev, buyIn)

  return {
    valid: true,
    ev,
    evDiscount,
    roi: finalRoi,
    rake,
    overlay,
    grade,
  }
}

/* ============================================================
   등급 산출 (S/A/B/C/D)
============================================================ */
function computeGrade(ev, buyIn) {
  if (!buyIn) return null
  const ratio = ev / buyIn

  if (ratio >= 0.4) return 'S'
  if (ratio > 0) return 'A'
  if (ratio >= -0.1) return 'B'
  if (ratio >= -0.3) return 'C'
  return 'D'
}

function gradeColor(g) {
  switch (g) {
    case 'S':
      return 'deep-purple-6'
    case 'A':
      return 'positive'
    case 'B':
      return 'grey-7'
    case 'C':
      return 'orange-7'
    case 'D':
      return 'negative'
    default:
      return 'grey-6'
  }
}

/* ============================================================
   비교 테이블 rows
============================================================ */

const tableCols = [
  { name: 'label', label: '대회', field: 'label', align: 'left' },
  { name: 'ev', label: '정가 EV', field: 'ev', align: 'right', sortable: true },
  { name: 'evDiscount', label: '할인 EV', field: 'evDiscount', align: 'right', sortable: true },
  { name: 'roi', label: 'ROI', field: 'roi', align: 'right', sortable: true },
  { name: 'rake', label: '레이크', field: 'rake', align: 'right', sortable: true },
  { name: 'overlay', label: '오버레이', field: 'overlay', align: 'right', sortable: true },
  { name: 'grade', label: '등급', field: 'grade', align: 'center' },
]

const tableRows = computed(() => {
  return tournaments.map((t) => {
    const r = results.value[t.id]
    return {
      id: t.id,
      label: t.label || '',
      ...r,
    }
  })
})
</script>
