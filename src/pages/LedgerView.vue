<template>
  <q-page class="q-pa-md">
    <!-- 상단: 월 선택 + 요약 -->
    <div class="row items-center justify-between q-mb-md">
      <div class="row items-center">
        <q-btn flat round icon="chevron_left" @click="shiftMonth(-1)" aria-label="이전 달" />
        <q-btn flat no-caps class="text-weight-bold q-mx-sm" @click="openMonthPicker = true">
          {{ currentMonthLabel }}
        </q-btn>
        <q-btn flat round icon="chevron_right" @click="shiftMonth(1)" aria-label="다음 달" />
      </div>

      <div class="row items-center q-gutter-sm">
        <q-card flat bordered class="q-pa-sm">
          <div class="text-caption text-grey">총 투입</div>
          <div class="text-subtitle1">{{ money(summary.totalIn) }}</div>
        </q-card>
        <q-card flat bordered class="q-pa-sm">
          <div class="text-caption text-grey">캐시아웃</div>
          <div class="text-subtitle1">{{ money(summary.totalOut) }}</div>
        </q-card>
        <q-card
          flat
          bordered
          class="q-pa-sm"
          :class="summary.profit >= 0 ? 'bg-positive text-white' : 'bg-negative text-white'"
        >
          <div class="text-caption">이번 달 이익</div>
          <div class="text-subtitle1 text-weight-bold">{{ money(summary.profit) }}</div>
        </q-card>
        <q-btn color="primary" icon="add" label="세션 추가" @click="openAdd = true" />
      </div>
    </div>

    <!-- 세션 리스트 / 빈 상태 -->
    <div v-if="list.length === 0" class="column items-center justify-center q-my-xl">
      <q-icon name="inbox" size="64px" class="q-mb-sm text-grey-5" />
      <div class="text-subtitle1 q-mb-xs">아직 이 달의 기록이 없습니다.</div>
      <div class="text-caption text-grey q-mb-md">첫 세션을 추가해 수익을 추적해보세요.</div>
      <q-btn color="primary" icon="add" label="첫 세션 추가" @click="openAdd = true" />
    </div>

    <q-list bordered separator v-else>
      <q-item v-for="s in list" :key="s.id" clickable>
        <q-item-section>
          <q-item-label class="row items-center justify-between">
            <span class="text-weight-medium">{{ s.venue || '무명 매장' }}</span>
            <span :class="s.cashOut - s.buyInTotal >= 0 ? 'text-positive' : 'text-negative'">
              {{ money(s.cashOut - s.buyInTotal) }}
            </span>
          </q-item-label>
          <q-item-label caption>
            {{ s.date }} · 투입 {{ money(s.buyInTotal) }} · 캐시아웃 {{ money(s.cashOut) }}
          </q-item-label>
        </q-item-section>
      </q-item>
    </q-list>

    <!-- 월 선택 다이얼로그 -->
    <q-dialog v-model="openMonthPicker">
      <q-card style="min-width: 320px">
        <q-card-section class="text-h6">월 선택</q-card-section>
        <q-card-section>
          <div class="row no-wrap items-center justify-between">
            <q-btn flat round icon="chevron_left" @click="shiftMonth(-1)" />
            <div class="text-subtitle1">{{ currentMonthLabel }}</div>
            <q-btn flat round icon="chevron_right" @click="shiftMonth(1)" />
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="닫기" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- 세션 추가 다이얼로그 -->
    <q-dialog v-model="openAdd" persistent>
      <q-card style="min-width: 420px; max-width: 92vw">
        <q-card-section class="text-h6">세션 추가</q-card-section>

        <q-card-section class="q-gutter-md">
          <q-input v-model="form.date" label="날짜" type="date" :max="today" dense filled />
          <q-input v-model="form.venue" label="매장" dense filled />

          <q-input
            v-model.number="form.buyInTotal"
            label="총 투입(바인+리바이)"
            type="number"
            min="0"
            dense
            filled
          />
          <q-input
            v-model.number="form.cashOut"
            label="캐시아웃"
            type="number"
            min="0"
            dense
            filled
          />

          <q-input v-model="form.note" label="메모" type="textarea" autogrow filled />

          <q-banner
            class="q-mt-sm"
            :class="profit >= 0 ? 'bg-positive text-white' : 'bg-negative text-white'"
            rounded
          >
            <template #avatar><q-icon name="calculate" /></template>
            순이익 미리보기: <strong>{{ money(profit) }}</strong>
          </q-banner>
        </q-card-section>

        <q-card-actions align="between">
          <q-btn flat label="취소" color="grey" v-close-popup />
          <div class="row items-center q-gutter-sm">
            <q-btn outline color="grey" label="초기화" @click="resetForm" />
            <q-btn color="primary" label="저장" :disable="!isValid" @click="save" />
          </div>
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { useLedgerStore } from 'stores/ledger'

const ledger = useLedgerStore()

// 현재 월 (YYYY-MM)
const now = new Date()
const currentYM = ref(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`)

const openMonthPicker = ref(false)
const openAdd = ref(false)

const list = computed(() => ledger.sessionsByMonth(currentYM.value))
const summary = computed(() => ledger.monthSummary(currentYM.value))

const currentMonthLabel = computed(() => {
  const [y, m] = currentYM.value.split('-')
  return `${y}년 ${Number(m)}월`
})

function shiftMonth(step) {
  const [y, m] = currentYM.value.split('-').map(Number)
  const date = new Date(y, m - 1 + step, 1)
  const ym = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
  currentYM.value = ym
}

// 통화 표기(₩)
function money(n) {
  const v = Number(n || 0)
  return `₩${v.toLocaleString()}`
}

// 오늘(입력 제한)
const today = new Date().toISOString().slice(0, 10)

// 추가 폼
const form = reactive({
  date: today,
  venue: '',
  buyInTotal: null,
  cashOut: null,
  note: '',
})

const profit = computed(() => Number(form.cashOut || 0) - Number(form.buyInTotal || 0))
const isValid = computed(
  () => !!form.date && Number(form.buyInTotal) >= 0 && Number(form.cashOut) >= 0,
)

function resetForm() {
  form.date = today
  form.venue = ''
  form.buyInTotal = null
  form.cashOut = null
  form.note = ''
}

function save() {
  if (!isValid.value) return
  ledger.addSession({
    date: form.date,
    venue: form.venue,
    buyInTotal: form.buyInTotal,
    cashOut: form.cashOut,
    note: form.note,
  })
  openAdd.value = false
  resetForm()
}
</script>

<style scoped>
/* 필요시 추가 스타일 */
</style>
