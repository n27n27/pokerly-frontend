<template>
  <q-page class="q-pa-md">
    <!-- ====================== 상단 날짜 ====================== -->
    <div class="row items-center justify-between q-mb-md">
      <div class="row items-center">
        <q-btn flat round icon="chevron_left" @click="shiftMonth(-1)" />
        <q-btn flat no-caps class="text-weight-bold q-mx-sm" @click="openMonthPicker = true">
          {{ currentMonthLabel }}
        </q-btn>
        <q-btn flat round icon="chevron_right" @click="shiftMonth(1)" />
      </div>
    </div>

    <!-- ====================== KPI 영역 ====================== -->
    <div class="column q-gutter-lg q-mb-lg">
      <!-- 상단: 모드 드롭다운 + 세션 추가 버튼 -->
      <div class="row items-center justify-between">
        <div class="row items-center">
          <q-btn-dropdown flat dense no-caps size="m" :label="kpiModeLabel">
            <q-list>
              <q-item clickable v-close-popup @click="kpiMode = 'cash'">
                <q-item-section>현금 흐름</q-item-section>
              </q-item>
              <q-item clickable v-close-popup @click="kpiMode = 'ev'">
                <q-item-section>EV 관점</q-item-section>
              </q-item>
              <q-item clickable v-close-popup @click="kpiMode = 'both'">
                <q-item-section>전체 보기</q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
        </div>

        <q-btn color="primary" icon="add" label="세션 추가" @click="openAddDialog" />
      </div>

      <!-- (A) 현금 흐름 KPI -->
      <div v-if="kpiMode === 'cash' || kpiMode === 'both'">
        <div class="text-subtitle2 text-grey-7 q-mb-xs">현금 흐름</div>
        <div class="row q-gutter-sm">
          <q-card flat bordered class="q-pa-sm kpi-card">
            <div class="text-caption">총 투입</div>
            <div class="text-subtitle1">{{ money(summary.totalCashIn) }}</div>
          </q-card>

          <q-card flat bordered class="q-pa-sm kpi-card">
            <div class="text-caption">총 회수</div>
            <div class="text-subtitle1">{{ money(summary.totalCashOut) }}</div>
          </q-card>

          <q-card
            flat
            bordered
            class="q-pa-sm kpi-card"
            :class="
              summary.profitCashRealized >= 0 ? 'bg-positive text-white' : 'bg-negative text-white'
            "
          >
            <div class="text-caption">손익(현금 기준)</div>
            <div class="text-subtitle1">{{ money(summary.profitCashRealized) }}</div>
          </q-card>
        </div>
      </div>

      <!-- (B) EV 기준 KPI -->
      <div v-if="kpiMode === 'ev' || kpiMode === 'both'">
        <div class="text-subtitle2 text-grey-7 q-mb-xs q-mt-sm">EV 기준</div>
        <div class="row q-gutter-sm">
          <q-card flat bordered class="q-pa-sm kpi-card">
            <div class="text-caption">포인트 수익</div>
            <div class="text-subtitle1 text-primary text-bold">
              {{ (summary.totalEarnedPoint || 0).toLocaleString() }} pt
            </div>
          </q-card>

          <q-card
            flat
            bordered
            class="q-pa-sm kpi-card"
            :class="summary.totalEV >= 0 ? 'bg-positive text-white' : 'bg-negative text-white'"
          >
            <div class="text-caption">총 EV</div>
            <div class="text-subtitle1 text-bold">{{ money(summary.totalEV) }}</div>
          </q-card>
        </div>
      </div>
    </div>

    <!-- ====================== 비어 있을 때 ====================== -->
    <div v-if="list.length === 0 && !loading" class="column items-center q-my-xl">
      <q-icon name="inbox" size="64px" class="q-mb-sm text-grey-5" />
      <div class="text-subtitle1 q-mb-xs">아직 이 달의 기록이 없습니다.</div>
      <q-btn color="primary" icon="add" label="첫 세션 추가" @click="openAddDialog" />
    </div>

    <!-- ====================== 세션 리스트 ====================== -->
    <q-list bordered separator v-else>
      <q-item v-for="s in list" :key="s.id" clickable @click="openEditDialog(s)">
        <q-item-section>
          <q-item-label class="row items-center justify-between">
            <span>{{ s.title }}</span>
            <span :class="s.profitCashRealized >= 0 ? 'text-positive' : 'text-negative'">
              {{ money(s.profitCashRealized) }}
            </span>
          </q-item-label>
          <q-item-label caption>
            {{ s.playDate }}
            · {{ s.venueName || '매장 미지정' }} · 바인 수 {{ s.entries ?? 1 }}· 현금 투입
            {{ money(s.totalCashIn ?? s.buyIn) }} · 포인트 투입 {{ money(s.totalPointIn ?? 0) }} ·
            회수 {{ money(s.cashOut) }} · 포인트 수익 {{ (s.earnedPoint || 0).toLocaleString() }} pt
          </q-item-label>
        </q-item-section>
      </q-item>
    </q-list>

    <!-- ====================== 로딩 ====================== -->
    <q-inner-loading :showing="loading">
      <q-spinner size="42px" />
    </q-inner-loading>

    <!-- ====================== 월 선택 다이얼로그 ====================== -->
    <q-dialog v-model="openMonthPicker">
      <q-card style="min-width: 320px">
        <q-card-section class="text-h6">월 선택</q-card-section>
        <q-card-section>
          <div class="row justify-between">
            <q-btn flat round icon="chevron_left" @click="shiftMonth(-1)" />
            <div>{{ currentMonthLabel }}</div>
            <q-btn flat round icon="chevron_right" @click="shiftMonth(1)" />
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="닫기" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- ====================== Add/Edit 다이얼로그 ====================== -->
    <q-dialog v-model="openAdd" persistent @hide="onDialogHide">
      <q-card style="min-width: 420px; max-width: 520px">
        <q-card-section class="text-h6">
          {{ isEdit ? '세션 수정' : '세션 추가' }}
        </q-card-section>

        <q-card-section class="q-gutter-md">
          <!-- 🔥 매장 선택 (선택만 / 등록은 별도 화면) -->
          <!-- 🔥 매장 선택 (매장이 있을 때/없을 때 UI 분리) -->
          <template v-if="venueOptions.length > 0">
            <q-select
              v-model="form.venueId"
              :options="venueOptions"
              label="매장"
              filled
              emit-value
              map-options
              :loading="venueLoading"
              :disable="venueLoading"
              placeholder="매장을 선택하세요"
            >
              <template #after>
                <q-btn
                  flat
                  dense
                  round
                  icon="add"
                  @click="goToAddVenue"
                  :disable="venueLoading"
                  :aria-label="'매장 추가'"
                />
              </template>
            </q-select>
          </template>

          <template v-else>
            <div class="column q-gutter-xs">
              <div class="text-subtitle2 text-grey-7">매장</div>
              <q-banner dense class="bg-grey-2 text-grey-8 q-pa-sm">
                아직 등록된 매장이 없습니다. 먼저 매장을 등록해주세요.
              </q-banner>
              <q-btn
                color="primary"
                outline
                icon="add"
                label="매장 등록하기"
                class="q-mt-sm self-start"
                @click="goToAddVenue"
                :disable="venueLoading"
              />
            </div>
          </template>

          <div v-if="selectedVenuePoint !== null" class="text-caption text-grey-7">
            현재 포인트 잔액: {{ selectedVenuePoint.toLocaleString() }} pt
          </div>

          <q-input v-model="form.date" label="날짜" type="date" filled />
          <q-input v-model="form.title" label="제목" filled />

          <q-input v-model.number="form.totalCashIn" label="현금 투입" type="number" filled />

          <q-input v-model.number="form.totalPointIn" label="포인트 투입" type="number" filled />

          <q-input
            v-model.number="form.entries"
            label="바인 수(리바인 포함)"
            type="number"
            filled
          />

          <q-input v-model.number="form.cashOut" label="회수" type="number" filled />

          <q-input v-model.number="form.earnedPoint" label="포인트 수익" type="number" filled />

          <q-input v-model="form.note" type="textarea" label="메모" filled />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn v-if="isEdit" color="negative" outline label="삭제" @click="askDelete" />
          <q-btn flat label="취소" v-close-popup />
          <q-btn color="primary" :label="isEdit ? '수정' : '저장'" @click="save" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- ====================== 삭제 확인 ====================== -->
    <q-dialog v-model="confirmDelete" persistent>
      <q-card>
        <q-card-section class="text-h6">삭제하시겠어요?</q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="취소" v-close-popup />
          <q-btn color="negative" label="삭제" @click="doDelete" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useLedgerStore } from 'stores/ledger'
import { useVenueStore } from 'stores/venue'

const router = useRouter()
const ledger = useLedgerStore()
const venueStore = useVenueStore()
const selectedVenuePoint = computed(() => null)

/* 월 이동 관련 */
const now = new Date()
const currentYM = ref(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`)
const openMonthPicker = ref(false)

/* KPI 모드: cash / ev / both */
const kpiMode = ref('cash')

const kpiModeLabel = computed(() => {
  if (kpiMode.value === 'cash') return '현금 흐름'
  if (kpiMode.value === 'ev') return 'EV 관점'
  return '전체 보기'
})

/* 다이얼로그 상태 */
const openAdd = ref(false)
const confirmDelete = ref(false)
const isEdit = ref(false)
const editTargetId = ref(null)

/* store 연동 */
const list = computed(() => {
  const sessions = ledger.sessionsByMonth(currentYM.value) || []
  const venues = venueStore.venues || []

  // id -> name 매핑
  const venueNameMap = venues.reduce((map, v) => {
    map[v.id] = v.name
    return map
  }, {})

  // 각 세션에 venueName 붙이기
  return sessions.map((s) => ({
    ...s,
    venueName: venueNameMap[s.venueId] ?? '매장 미지정',
  }))
})

const summary = computed(() => {
  const s = ledger.monthSummary(currentYM.value) || {}
  return {
    totalCashIn: 0,
    totalCashOut: 0,
    profitCashRealized: 0,
    totalEarnedPoint: 0,
    totalEV: 0,
    ...s,
  }
})

const loading = computed(() => ledger.loading)

/* 매장 옵션 */
const venueLoading = computed(() => venueStore.loading)
const venueOptions = computed(() =>
  (venueStore.venues || []).map((v) => ({
    label: v.name,
    value: v.id,
  })),
)

const currentMonthLabel = computed(() => {
  const [y, m] = currentYM.value.split('-')
  return `${y}년 ${Number(m)}월`
})

onMounted(async () => {
  await Promise.all([ledger.fetchMonth(currentYM.value), venueStore.fetchAll()])
})

async function shiftMonth(step) {
  const [y, m] = currentYM.value.split('-').map(Number)
  const next = new Date(y, m - 1 + step, 1)
  const ym = `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}`
  currentYM.value = ym
  await ledger.fetchMonth(ym)
}

function money(n) {
  return `₩${Number(n || 0).toLocaleString()}`
}

/* Add/Edit 폼 */
const today = new Date().toISOString().slice(0, 10)

const emptyForm = () => ({
  venueId: null,
  date: today,
  title: '',
  totalCashIn: 0,
  totalPointIn: 0,
  entries: 1,
  cashOut: 0,
  earnedPoint: 0,
  note: '',
})

const form = reactive(emptyForm())

function resetForm() {
  Object.assign(form, emptyForm())
}

function openAddDialog() {
  isEdit.value = false
  editTargetId.value = null
  resetForm()
  openAdd.value = true
}

function openEditDialog(s) {
  isEdit.value = true
  editTargetId.value = s.id
  Object.assign(form, {
    venueId: s.venueId ?? null,
    date: s.playDate,
    title: s.title ?? '',
    totalCashIn: s.totalCashIn ?? 0,
    totalPointIn: s.totalPointIn ?? 0,
    entries: s.entries ?? 1,
    cashOut: s.cashOut ?? 0,
    earnedPoint: s.earnedPoint ?? 0,
    note: s.notes ?? '',
  })
  openAdd.value = true
}

function onDialogHide() {
  if (!isEdit.value) resetForm()
}

function goToAddVenue() {
  openAdd.value = false
  router.push('/venues/add') // 실제 라우터에 맞게 수정
}

async function save() {
  const payload = {
    venueId: form.venueId,
    playDate: form.date,
    title: form.title,
    totalCashIn: form.totalCashIn,
    totalPointIn: form.totalPointIn,
    entries: form.entries,
    cashOut: form.cashOut,
    earnedPoint: form.earnedPoint,
    notes: form.note,
  }

  if (isEdit.value && editTargetId.value) {
    await ledger.updateSession(editTargetId.value, payload)
  } else {
    await ledger.addSession(payload)
  }

  await ledger.fetchMonth(currentYM.value)

  openAdd.value = false
}

function askDelete() {
  confirmDelete.value = true
}

async function doDelete() {
  if (editTargetId.value) {
    await ledger.removeSession(editTargetId.value)
  }
  confirmDelete.value = false
  openAdd.value = false
}
</script>

<style scoped>
.kpi-card {
  min-width: 130px;
}
</style>
