<template>
  <q-page class="q-pa-md bg-grey-1">
    <div class="column q-gutter-y-lg" style="max-width: 980px; margin: 0 auto">
      <!-- ================== 헤더 ================== -->
      <div>
        <div class="row items-center q-gutter-sm q-mb-xs">
          <div class="text-h5 text-weight-bold">ICM 계산기</div>
        </div>
        <div class="text-body2 text-grey-7">
          남은 상금(1등부터)과 스택을 입력하면 각 순위의 결과(ICM 기대값)를 계산합니다.
        </div>
      </div>

      <!-- ================== 컨트롤 + 요약 ================== -->
      <q-card flat bordered class="icm-card">
        <q-card-section class="control-wrap">
          <!-- 한 줄: 플레이어 + (계산/초기화) 우측 정렬 -->
          <div class="row items-center q-gutter-sm">
            <div class="text-subtitle1 text-weight-bold">플레이어</div>

            <div class="player-pill">
              <q-btn
                flat
                round
                dense
                icon="remove"
                :disable="playerCount <= 2"
                @click="setPlayerCount(playerCount - 1)"
              />
              <div class="player-pill__count">{{ playerCount }}명</div>
              <q-btn
                flat
                round
                dense
                icon="add"
                :disable="playerCount >= 10"
                @click="setPlayerCount(playerCount + 1)"
              />
            </div>

            <div class="text-caption text-grey-6 q-ml-xs">2–10명</div>

            <q-space />

            <div class="row items-center q-gutter-xs">
              <q-btn
                unelevated
                color="primary"
                icon="calculate"
                label="계산"
                class="btn-calc"
                @click="onCalculate()"
              />
              <q-btn
                dense
                outline
                icon="delete_sweep"
                color="grey-8"
                label="초기화"
                class="btn-soft"
                @click="resetAll()"
              />
            </div>
          </div>

          <!-- 요약 바 -->
          <div class="summary-bar q-mt-md">
            <div class="summary-item">
              <div class="label">총 스택</div>
              <div class="value">{{ formatNumber(totalChips) }}</div>
            </div>

            <q-space />

            <div class="summary-item text-right">
              <div class="label">총 상금</div>
              <div class="value">{{ formatNumber(totalPrize) }}</div>
            </div>
          </div>

          <div class="row items-center q-mt-sm">
            <q-space />
            <div class="text-caption text-grey-6">상금은 1등부터 입력</div>
          </div>
        </q-card-section>
      </q-card>

      <!-- ================== 에러 ================== -->
      <q-banner v-if="errorMessage" rounded class="bg-red-1 text-red-10" dense>
        ⚠️ {{ errorMessage }}
      </q-banner>

      <!-- ================== 입력 UI ================== -->
      <!-- 모바일: 카드형 Row -->
      <q-card v-if="isMobile" flat bordered class="icm-card">
        <q-card-section class="q-pb-sm">
          <div class="row items-center justify-between">
            <div class="text-subtitle1 text-weight-bold">입력</div>
            <div class="text-body2 text-grey-7">상금 / 스택 / 결과</div>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section class="q-pt-md">
          <div class="column q-gutter-sm">
            <div v-for="(r, idx) in rows" :key="r.id" class="icm-mobile-row">
              <div class="icm-rank">{{ idx + 1 }}등</div>

              <div class="row items-stretch q-col-gutter-sm">
                <div class="col-4">
                  <q-input
                    v-model.number="r.payout"
                    dense
                    outlined
                    type="number"
                    min="0"
                    step="1000"
                    placeholder="상금"
                    class="num-input"
                    :input-class="'text-right'"
                  />
                </div>

                <div class="col-4">
                  <q-input
                    v-model.number="r.stack"
                    dense
                    outlined
                    type="number"
                    min="0"
                    step="1"
                    placeholder="스택"
                    class="num-input"
                    :input-class="'text-right'"
                  />
                </div>

                <div class="col-4">
                  <div class="icm-result-box" :class="{ 'icm-result-pulse': pulseKey === r.id }">
                    <div class="icm-result-value">
                      {{ r.result === null ? '-' : formatNumber(r.result) }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- PC: 표형 -->
      <q-card v-else flat bordered class="icm-card">
        <q-card-section class="q-pb-sm">
          <div class="row items-center justify-between">
            <div class="text-subtitle1 text-weight-bold">입력</div>
            <div class="text-body2 text-grey-7">상금은 1등부터</div>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section class="q-pt-md">
          <q-table
            flat
            :rows="rows"
            :columns="pcColumns"
            row-key="id"
            :rows-per-page-options="[0]"
            hide-pagination
            dense
            class="pc-table"
          >
            <template #body-cell-rank="props">
              <q-td :props="props">
                <q-chip dense square color="grey-3" text-color="grey-9">
                  {{ props.rowIndex + 1 }}등
                </q-chip>
              </q-td>
            </template>

            <template #body-cell-payout="props">
              <q-td :props="props">
                <q-input
                  v-model.number="props.row.payout"
                  dense
                  outlined
                  type="number"
                  min="0"
                  step="1000"
                  class="num-input"
                  :input-class="'text-right'"
                  placeholder="예: 3000000"
                />
              </q-td>
            </template>

            <template #body-cell-stack="props">
              <q-td :props="props">
                <q-input
                  v-model.number="props.row.stack"
                  dense
                  outlined
                  type="number"
                  min="0"
                  step="1"
                  class="num-input"
                  :input-class="'text-right'"
                  placeholder="예: 250000"
                />
              </q-td>
            </template>

            <template #body-cell-result="props">
              <q-td :props="props" class="text-right">
                <span
                  class="text-weight-bold text-green-9 pc-result"
                  :class="{ 'pc-result-flash': pcPulseIds.has(props.row.id) }"
                >
                  {{ props.row.result === null ? '-' : formatNumber(props.row.result) }}
                </span>
              </q-td>
            </template>
          </q-table>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import { logToolUsage } from 'src/api/tools'

const TOOL_CODE = 'ICM'
const $q = useQuasar()
const isMobile = computed(() => $q.screen.lt.md)

const rows = ref([makeEmptyRow(), makeEmptyRow()])
const errorMessage = ref('')

// 미세 피드백 (모바일: 순차 펄스)
const pulseKey = ref('')
let pulseTimer = null

// 미세 피드백 (PC: 전체 1회 플래시)
const pcPulseIds = ref(new Set())
let pcPulseTimer = null

const pcColumns = [
  { name: 'rank', label: '순위', field: 'rank', align: 'left' },
  { name: 'payout', label: '상금', field: 'payout', align: 'right' },
  { name: 'stack', label: '스택', field: 'stack', align: 'right' },
  { name: 'result', label: '결과', field: 'result', align: 'right' },
]

const playerCount = computed(() => rows.value.length)
const totalChips = computed(() => rows.value.reduce((a, r) => a + safeNum(r.stack), 0))
const totalPrize = computed(() => rows.value.reduce((a, r) => a + safeNum(r.payout), 0))

onMounted(() => {
  logToolUsage(TOOL_CODE, 'OPEN').catch(() => {})
})

function setPlayerCount(next) {
  const target = Math.max(2, Math.min(10, next))
  if (target === rows.value.length) return

  if (target > rows.value.length) {
    const add = target - rows.value.length
    for (let i = 0; i < add; i++) rows.value.push(makeEmptyRow())
  } else {
    rows.value.splice(target)
  }
  clearResultsOnly()
}

function resetAll() {
  rows.value = [makeEmptyRow(), makeEmptyRow()]
  errorMessage.value = ''
  clearPulse()
}

function clearResultsOnly() {
  rows.value = rows.value.map((r) => ({ ...r, result: null }))
  clearPulse()
}

function clearPulse() {
  pulseKey.value = ''
  if (pulseTimer) {
    clearTimeout(pulseTimer)
    pulseTimer = null
  }
  pcPulseIds.value = new Set()
  if (pcPulseTimer) {
    clearTimeout(pcPulseTimer)
    pcPulseTimer = null
  }
}

function onCalculate() {
  errorMessage.value = ''

  const v = validate()
  if (!v.ok) {
    errorMessage.value = v.message
    return
  }

  logToolUsage(TOOL_CODE, 'CALCULATE').catch(() => {})

  const stacks = rows.value.map((r) => safeNum(r.stack))
  const prizes = rows.value.map((r) => safeNum(r.payout))
  const evs = icmEV(stacks, prizes)

  rows.value = rows.value.map((r, i) => ({
    ...r,
    result: Math.floor(evs[i]),
  }))

  if (isMobile.value) pulseSequential()
  else flashAllPc()
}

function pulseSequential() {
  clearPulse()
  let i = 0

  const tick = () => {
    if (i >= rows.value.length) {
      pulseKey.value = ''
      return
    }
    pulseKey.value = rows.value[i].id
    i++

    pulseTimer = setTimeout(() => {
      pulseKey.value = ''
      pulseTimer = setTimeout(tick, 90)
    }, 260)
  }

  tick()
}

function flashAllPc() {
  clearPulse()
  pcPulseIds.value = new Set(rows.value.map((r) => r.id))
  pcPulseTimer = setTimeout(() => {
    pcPulseIds.value = new Set()
  }, 450)
}

function validate() {
  for (let i = 0; i < rows.value.length; i++) {
    const r = rows.value[i]
    const rank = i + 1

    if (r.payout === null || r.payout === '' || !Number.isFinite(Number(r.payout))) {
      return { ok: false, message: `${rank}등 상금이 비어있습니다.` }
    }
    if (Number(r.payout) < 0) return { ok: false, message: `${rank}등 상금은 0 이상이어야 합니다.` }

    if (r.stack === null || r.stack === '' || !Number.isFinite(Number(r.stack))) {
      return { ok: false, message: `${rank}등 스택이 비어있습니다.` }
    }
    if (Number(r.stack) < 0) return { ok: false, message: `${rank}등 스택은 0 이상이어야 합니다.` }
  }

  if (totalPrize.value <= 0) return { ok: false, message: '총 상금이 0입니다.' }
  if (totalChips.value <= 0) return { ok: false, message: '총 스택이 0입니다.' }

  return { ok: true }
}

/** 표준 ICM */
function icmEV(stacks, prizes) {
  const n = stacks.length
  const ev = new Array(n).fill(0)
  const idxs = Array.from({ length: n }, (_, i) => i)

  function recurse(aliveIdxs, aliveStacks, payoutIndex, probMass) {
    if (aliveIdxs.length === 0) return
    if (payoutIndex >= prizes.length) return

    const total = aliveStacks.reduce((a, b) => a + b, 0)
    if (total <= 0) return

    for (let k = 0; k < aliveIdxs.length; k++) {
      const playerIndex = aliveIdxs[k]
      const s = aliveStacks[k]
      if (s <= 0) continue

      const pWin = (s / total) * probMass
      ev[playerIndex] += pWin * prizes[payoutIndex]

      const nextIdxs = aliveIdxs.slice(0, k).concat(aliveIdxs.slice(k + 1))
      const nextStacks = aliveStacks.slice(0, k).concat(aliveStacks.slice(k + 1))
      recurse(nextIdxs, nextStacks, payoutIndex + 1, pWin)
    }
  }

  recurse(idxs, stacks, 0, 1)
  return ev
}

function safeNum(v) {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

function formatNumber(v) {
  return new Intl.NumberFormat('ko-KR').format(Math.floor(safeNum(v)))
}

function makeId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`
}

function makeEmptyRow() {
  return { id: makeId(), payout: null, stack: null, result: null }
}
</script>

<style scoped>
.icm-card {
  border-radius: 16px;
  border-color: rgba(0, 0, 0, 0.08);
}

.control-wrap {
  padding: 18px 18px 14px;
}

.player-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid rgba(0, 0, 0, 0.12);
  background: rgba(0, 0, 0, 0.02);
}

.player-pill__count {
  min-width: 56px;
  text-align: center;
  font-weight: 900;
  color: rgba(0, 0, 0, 0.78);
}

/* 계산 버튼: 컴팩트 */
.btn-calc {
  min-width: 92px;
  height: 36px;
  border-radius: 10px;
  font-weight: 700;
}
.btn-calc :deep(.q-btn__content) {
  gap: 6px;
  font-size: 14px;
}

.btn-soft :deep(.q-btn__content) {
  gap: 6px;
}

/* 요약 바 */
.summary-bar {
  display: flex;
  align-items: center;
  padding: 12px 14px;
  border-radius: 14px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  background: rgba(0, 0, 0, 0.02);
}

.summary-item .label {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.55);
  font-weight: 700;
}

.summary-item .value {
  margin-top: 2px;
  font-size: 20px;
  font-weight: 900;
  color: rgba(0, 0, 0, 0.82);
}

/* 모바일 row */
.icm-mobile-row {
  padding: 12px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 14px;
  background: white;
}

.icm-rank {
  font-weight: 900;
  color: rgba(0, 0, 0, 0.7);
  margin-bottom: 8px;
}

/* 입력 높이 컴팩트 */
:deep(.q-field--dense .q-field__control) {
  min-height: 36px;
}
:deep(.q-field--dense .q-field__marginal) {
  height: 36px;
}

/* 숫자 입력: 오버플로우 방지 (payout/stack 전용) */
.num-input :deep(input) {
  font-size: 13px;
  letter-spacing: -0.2px;
}

/* 결과 박스 */
.icm-result-box {
  height: 100%;
  border: 1px solid rgba(46, 125, 50, 0.26);
  background: rgba(46, 125, 50, 0.08);
  border-radius: 12px;
  padding: 6px 8px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  transition:
    transform 180ms ease,
    box-shadow 180ms ease,
    background 180ms ease,
    border-color 180ms ease;
}

.icm-result-value {
  font-weight: 900;
  color: #1b5e20;
  text-align: right;
  font-size: 14px;
}

/* 모바일: 순차 펄스 */
.icm-result-pulse {
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(46, 125, 50, 0.18);
  border-color: rgba(46, 125, 50, 0.45);
  background: rgba(46, 125, 50, 0.12);
}

/* PC: 결과 플래시 */
.pc-result-flash {
  animation: pcFlash 450ms ease;
}

@keyframes pcFlash {
  0% {
    background: rgba(46, 125, 50, 0.1);
    border-radius: 6px;
    padding: 2px 6px;
  }
  100% {
    background: transparent;
    border-radius: 0px;
    padding: 0px;
  }
}

.pc-table :deep(.q-table__middle) {
  border-radius: 12px;
}
</style>
