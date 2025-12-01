<template>
  <q-page padding class="ledger-page">
    <!-- ====================== 상단 영역 ====================== -->
    <div class="row items-center justify-between q-mb-md kpi-header">
      <!-- 좌측: 월 선택 -->
      <div class="row items-center">
        <q-btn flat round dense icon="chevron_left" @click="shiftMonth(-1)" />
        <div class="text-h6 text-weight-bold q-mx-sm">{{ year }}년 {{ month }}월</div>
        <q-btn
          flat
          round
          dense
          icon="chevron_right"
          @click="shiftMonth(1)"
          :disable="isAtMaxMonth"
        />
      </div>

      <!-- 중앙: KPI 요약 -->
      <div class="row items-center q-gutter-sm kpi-container">
        <q-card class="kpi-card">
          <div class="kpi-label">총 바인</div>
          <div class="kpi-value">{{ money(summary.totalBuyIn) }}</div>
        </q-card>

        <q-card class="kpi-card">
          <div class="kpi-label">총 상금</div>
          <div class="kpi-value">{{ money(summary.totalPrize) }}</div>
        </q-card>

        <q-card class="kpi-card">
          <div class="kpi-label">월 순수익</div>
          <div class="kpi-value" :class="profitColor(summary.totalProfit)">
            {{ signedMoney(summary.totalProfit) }}
          </div>
        </q-card>
      </div>

      <!-- 우측: 세션 추가 버튼 -->
      <q-btn
        color="primary"
        unelevated
        icon="add"
        label="세션 추가"
        @click="openCreateDialog"
        class="kpi-add-btn"
      />
    </div>

    <q-separator spaced />

    <!-- ====================== 리스트 (임시/샘플) ====================== -->
    <div v-if="sessions.length === 0" class="q-mt-lg text-grey-6">
      아직 등록된 세션이 없습니다. 오른쪽 상단의 <b>세션 추가</b> 버튼으로 첫 세션을 기록해 보세요.
    </div>

    <div v-else class="q-mt-md">
      <q-list bordered separator class="rounded-borders bg-white">
        <q-item v-for="s in sessions" :key="s.id" clickable v-ripple @click="openEditDialog(s)">
          <q-item-section>
            <div class="row items-center justify-between">
              <div class="column">
                <div class="row items-center q-gutter-sm">
                  <div class="text-subtitle2 text-weight-medium">
                    {{ s.venueName || '매장 미지정' }}
                  </div>
                  <q-badge outline color="primary" v-if="s.gameType" class="text-caption">
                    {{ s.gameType }}
                  </q-badge>
                </div>
                <div class="text-caption text-grey-7 q-mt-xs">
                  {{ s.playDate }} · 바인 {{ money(s.totalBuyIn) }} · 상금 {{ money(s.prize) }}
                </div>
              </div>

              <div class="column items-end">
                <div class="text-subtitle2 text-weight-bold" :class="profitColor(s.netProfit)">
                  {{ signedMoney(s.netProfit) }}
                </div>
                <div class="text-caption text-grey-6">엔트리 {{ s.entries }}회</div>
              </div>
            </div>
          </q-item-section>
        </q-item>
      </q-list>
    </div>

    <!-- ====================== 세션 추가/수정 다이얼로그 ====================== -->
    <q-dialog v-model="dialog.open" persistent>
      <q-card style="width: 480px; max-width: 95vw">
        <!-- 헤더 -->
        <q-card-section class="row items-center justify-between">
          <div class="text-subtitle1 text-weight-bold">
            {{ dialog.mode === 'create' ? '세션 추가' : '세션 수정' }}
          </div>
          <q-btn flat round dense icon="close" @click="closeDialog" />
        </q-card-section>

        <q-separator />

        <!-- 폼 본문 -->
        <q-card-section>
          <q-form @submit.prevent="onSubmit">
            <div class="q-gutter-md form-body">
              <!-- A. 기본 정보 -->
              <div class="text-caption text-grey-7 q-mb-xs">기본 정보</div>

              <!-- 매장 -->
              <div class="q-mb-sm">
                <!-- 매장 리스트가 있을 때: 셀렉트 + 아래에 "매장 추가" -->
                <template v-if="venueOptions.length > 0">
                  <q-select
                    v-model="form.venueId"
                    :options="venueOptions"
                    option-value="id"
                    option-label="name"
                    emit-value
                    map-options
                    label="매장"
                    filled
                    dense
                    color="primary"
                    :rules="[(v) => !!v || '매장을 선택하세요.']"
                  />

                  <div class="row items-center q-mt-xs">
                    <q-space />
                    <q-btn
                      flat
                      dense
                      no-caps
                      size="sm"
                      icon="add_business"
                      color="primary"
                      class="text-caption"
                      @click="openVenueDialog"
                    >
                      <span class="q-ml-xs">새 매장 등록</span>
                    </q-btn>
                  </div>
                </template>

                <!-- 매장 리스트가 없을 때: 안내 문구 + 등록 버튼 -->
                <template v-else>
                  <div class="q-pa-sm bg-grey-2 rounded-borders">
                    <div class="text-caption text-grey-7 q-mb-xs">아직 등록된 매장이 없습니다.</div>
                    <div class="row items-center justify-between">
                      <div class="text-caption text-grey-6">
                        먼저 매장을 등록한 뒤 세션을 추가할 수 있습니다.
                      </div>
                      <q-btn
                        dense
                        no-caps
                        color="primary"
                        icon="add_business"
                        label="매장 등록"
                        @click="openVenueDialog"
                      />
                    </div>
                  </div>
                </template>
              </div>

              <!-- 날짜 -->
              <q-input v-model="form.playDate" label="날짜" filled dense color="primary" readonly>
                <template #append>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                      <q-date v-model="form.playDate" mask="YYYY-MM-DD">
                        <div class="row items-center justify-end q-pa-sm">
                          <q-btn flat label="닫기" color="primary" v-close-popup />
                        </div>
                      </q-date>
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>

              <!-- 게임 타입 -->
              <q-option-group
                v-model="form.gameType"
                :options="gameTypeOptions"
                type="radio"
                inline
                color="primary"
              />

              <q-separator spaced />

              <!-- B. 바인 정보 -->
              <div class="text-caption text-grey-7">바인 정보</div>

              <div class="row">
                <div class="col-7 q-pr-sm">
                  <q-input
                    v-model.number="form.buyInPerEntry"
                    label="1회 바인 금액"
                    type="number"
                    filled
                    dense
                    color="primary"
                    :rules="[(v) => v > 0 || '1회 바인 금액을 입력하세요.']"
                  />
                </div>
                <div class="col-5 q-pl-sm">
                  <q-input
                    v-model.number="form.entries"
                    label="엔트리 수"
                    type="number"
                    filled
                    dense
                    color="primary"
                    :rules="[(v) => v >= 1 || '엔트리는 1 이상이어야 합니다.']"
                  />
                </div>
              </div>

              <q-input
                v-model.number="form.discount"
                label="할인 금액"
                type="number"
                filled
                dense
                color="primary"
                :rules="[
                  (v) => v >= 0 || '할인은 0 이상이어야 합니다.',
                  (v) =>
                    v <= form.buyInPerEntry * form.entries || '할인이 총 바인보다 클 수 없습니다.',
                ]"
              />

              <!-- 총 바인 -->
              <q-item class="q-mt-sm q-pa-none">
                <q-item-section>
                  <q-item-label caption>총 바인 금액</q-item-label>
                  <q-item-label class="text-weight-medium">
                    {{ money(totalBuyIn) }}
                  </q-item-label>
                </q-item-section>
              </q-item>

              <q-separator spaced />

              <!-- C. 결과 정보 -->
              <div class="text-caption text-grey-7">결과</div>

              <q-input
                v-model.number="form.prize"
                label="Prize (상금/수익)"
                type="number"
                filled
                dense
                color="primary"
                :rules="[(v) => v >= 0 || 'Prize는 0 이상이어야 합니다.']"
              />

              <q-item class="q-mt-sm q-pa-none">
                <q-item-section>
                  <q-item-label caption>순수익</q-item-label>
                  <q-item-label class="text-weight-bold" :class="profitColor(netProfit)">
                    {{ signedMoney(netProfit) }}
                  </q-item-label>
                </q-item-section>
              </q-item>

              <q-separator spaced />

              <!-- D. 메모 -->
              <div class="text-caption text-grey-7">메모</div>
              <q-input
                v-model="form.notes"
                type="textarea"
                filled
                color="primary"
                autogrow
                placeholder="대회 특징, 컨디션, 특이사항 등을 적어두면 좋습니다."
              />
            </div>
          </q-form>
        </q-card-section>

        <!-- 하단 버튼 -->
        <q-card-actions align="right">
          <q-btn flat label="취소" color="grey-7" @click="closeDialog" />
          <q-btn
            v-if="dialog.mode === 'edit'"
            flat
            label="삭제"
            color="negative"
            :loading="deleting"
            :disable="saving || deleting"
            @click="onDelete"
          />
          <q-btn
            unelevated
            color="primary"
            :label="dialog.mode === 'create' ? '추가' : '수정'"
            :loading="saving"
            :disable="saving"
            @click="onSubmit"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- ====================== 매장 등록 다이얼로그 ====================== -->
    <q-dialog v-model="venueDialog.open">
      <q-card style="width: 360px; max-width: 90vw">
        <q-card-section class="row items-center justify-between">
          <div class="text-subtitle2 text-weight-bold">새 매장 등록</div>
          <q-btn flat round dense icon="close" @click="closeVenueDialog" />
        </q-card-section>

        <q-separator />

        <q-card-section class="q-gutter-md">
          <q-input
            v-model="venueForm.name"
            label="매장 이름"
            filled
            dense
            color="primary"
            :rules="[(v) => !!v || '매장 이름을 입력하세요.']"
          />
          <q-input v-model="venueForm.location" label="위치 (선택)" filled dense color="primary" />
          <q-input
            v-model="venueForm.notes"
            label="메모 (선택)"
            type="textarea"
            autogrow
            filled
            dense
            color="primary"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="취소" color="grey-7" @click="closeVenueDialog" />
          <q-btn
            unelevated
            color="primary"
            label="등록"
            :loading="savingVenue"
            :disable="savingVenue"
            @click="onSaveVenue"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useAlert } from 'src/composables/useAlert'
import { useVenueStore } from 'stores/venue'
import { useGameSessionStore } from 'src/stores/gameSession'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const alert = useAlert()
const venueStore = useVenueStore()
const gameSessionStore = useGameSessionStore()
const now = new Date()
const yyyy = now.getFullYear()
const mm = String(now.getMonth() + 1).padStart(2, '0')
const dd = String(now.getDate()).padStart(2, '0')
const today = `${yyyy}-${mm}-${dd}`

const currentYear = Number(today.slice(0, 4))
const currentMonth = Number(today.slice(5, 7))

const year = ref(currentYear)
const month = ref(currentMonth)

const isAtMaxMonth = computed(() => year.value === currentYear && month.value === currentMonth)

onMounted(async () => {
  await venueStore.loadVenues()
  await gameSessionStore.loadMonthly(year.value, month.value)
})

// ----------------------- 상태 -----------------------
const sessions = computed(() =>
  gameSessionStore.sessions.map((s) => ({
    ...s,
    venueName: venueOptions.value.find((v) => v.id === s.venueId)?.name || '',
  })),
)

const summary = computed(() => {
  let totalBuyIn = 0
  let totalPrize = 0
  let totalProfit = 0

  sessions.value.forEach((s) => {
    totalBuyIn += s.totalBuyIn || 0
    totalPrize += s.prize || 0
    totalProfit += s.netProfit || 0
  })

  return {
    totalBuyIn,
    totalPrize,
    totalProfit,
  }
})
const venueOptions = computed(() => venueStore.venues)

const gameTypeOptions = [
  { label: 'GTD', value: 'GTD' },
  { label: '데일리', value: '데일리' },
  { label: '기타', value: '기타' },
]

const dialog = reactive({
  open: false,
  mode: 'create', // 'create' | 'edit'
  editingId: null,
})

const form = reactive({
  venueId: null,
  playDate: today,
  gameType: 'GTD',
  buyInPerEntry: null,
  entries: 1,
  discount: 0,
  prize: 0,
  notes: '',
})

const saving = ref(false)
const deleting = ref(false)

// ----------------------- 매장 다이얼로그 상태 -----------------------
const venueDialog = reactive({
  open: false,
})

const venueForm = reactive({
  name: '',
  location: '',
  notes: '',
})

const savingVenue = ref(false)

// ----------------------- 계산 값 -----------------------
const totalBuyIn = computed(() => {
  const buy = Number(form.buyInPerEntry) || 0
  const ent = Number(form.entries) || 0
  const disc = Number(form.discount) || 0
  return buy * ent - disc
})

const netProfit = computed(() => {
  const prize = Number(form.prize) || 0
  return prize - totalBuyIn.value
})

// ----------------------- 유틸 -----------------------
const money = (v) => {
  const n = Number(v) || 0
  return n.toLocaleString('ko-KR')
}

const signedMoney = (v) => {
  const n = Number(v) || 0
  const sign = n > 0 ? '+' : ''
  return sign + n.toLocaleString('ko-KR')
}

const profitColor = (v) => {
  const n = Number(v) || 0
  if (n > 0) return 'text-positive'
  if (n < 0) return 'text-negative'
  return 'text-grey-7'
}

// ----------------------- 다이얼로그 제어 -----------------------
const resetForm = () => {
  form.venueId = null
  form.playDate = today
  form.gameType = 'GTD'
  form.buyInPerEntry = null
  form.entries = 1
  form.discount = 0
  form.prize = 0
  form.notes = ''
}

const openCreateDialog = () => {
  resetForm()
  dialog.mode = 'create'
  dialog.editingId = null
  dialog.open = true
}

const openEditDialog = (session) => {
  dialog.mode = 'edit'
  dialog.editingId = session.id
  form.venueId = session.venueId
  form.playDate = session.playDate
  form.gameType = session.gameType
  form.buyInPerEntry = session.buyInPerEntry
  form.entries = session.entries
  form.discount = session.discount
  form.prize = session.prize
  form.notes = session.notes || ''
  dialog.open = true
}

const closeDialog = () => {
  dialog.open = false
}

// ----------------------- 매장 다이얼로그 로직 -----------------------
const openVenueDialog = () => {
  venueForm.name = ''
  venueForm.location = ''
  venueForm.notes = ''
  venueDialog.open = true
}

const closeVenueDialog = () => {
  venueDialog.open = false
}

const onSaveVenue = async () => {
  if (!venueForm.name) {
    alert.show('매장 이름을 입력하세요.', 'warning')
    return
  }

  savingVenue.value = true
  try {
    const newVenue = {
      name: venueForm.name,
      location: venueForm.location || '',
      notes: venueForm.notes || '',
    }

    await venueStore.addVenue(newVenue)

    closeVenueDialog()
  } catch (e) {
    if (e.status === 409) {
      alert.show('이미 등록된 매장 이름입니다.', 'warning')
      return
    }
    alert.show('매장 등록 중 오류가 발생했습니다.', 'error')
  } finally {
    savingVenue.value = false
  }
}

// ----------------------- 저장 로직 (임시) -----------------------
const onSubmit = async () => {
  // TODO: 나중에 QForm validate로 교체 가능
  if (!form.venueId) {
    alert.show('매장 이름을 입력하세요.', 'warning')
    return
  }
  if (!form.buyInPerEntry || form.buyInPerEntry <= 0) {
    alert.show('1회 바인 금액을 입력하세요.', 'warning')
    return
  }
  if (!form.entries || form.entries < 1) {
    alert.show('엔트리는 1 이상이어야 합니다.', 'warning')
    return
  }
  if (form.discount < 0) {
    alert.show('할인은 0 이상이어야 합니다.', 'warning')
    return
  }
  if (form.discount > form.buyInPerEntry * form.entries) {
    alert.show('할인이 총 바인보다 클 수 없습니다.', 'warning')
    return
  }
  if (form.prize < 0) {
    alert.show('Prize는 0 이상이어야 합니다.', 'warning')
    return
  }

  saving.value = true
  try {
    const payload = {
      venueId: form.venueId,
      playDate: form.playDate,
      gameType: form.gameType,
      buyInPerEntry: Number(form.buyInPerEntry),
      entries: Number(form.entries),
      discount: Number(form.discount),
      prize: Number(form.prize),
      notes: form.notes,
    }

    if (dialog.mode === 'create') {
      await gameSessionStore.addSession(payload)
      alert.show('세션이 추가되었습니다.', 'success')
    } else {
      await gameSessionStore.editSession(dialog.editingId, payload)
      alert.show('세션이 수정되었습니다.', 'success')
    }

    closeDialog()
  } catch (e) {
    console.error(e)
    alert.show('세션 저장 중 오류가 발생했습니다.', 'error')
  } finally {
    saving.value = false
  }
}
const onDelete = () => {
  if (!dialog.editingId) return

  $q.dialog({
    title: '세션 삭제',
    message: '정말 삭제하시겠습니까?',
    cancel: true,
    persistent: true,
    ok: {
      label: '삭제',
      color: 'negative',
    },
    cancelLabel: '취소',
  }).onOk(async () => {
    deleting.value = true
    try {
      await gameSessionStore.removeSession(dialog.editingId)
      alert.show('세션이 삭제되었습니다.', 'info')
      closeDialog()
    } catch (e) {
      console.error(e)
      alert.show('세션 삭제 중 오류가 발생했습니다.', 'error')
    } finally {
      deleting.value = false
    }
  })
}

const shiftMonth = (delta) => {
  // 미래로 가려는데 이미 오늘 기준 현재 월이면 막기
  if (delta > 0 && isAtMaxMonth.value) return

  const base = new Date(year.value, month.value - 1 + delta, 1)
  const nextYear = base.getFullYear()
  const nextMonth = base.getMonth() + 1

  // 혹시 계산으로 미래로 넘어갈 경우 방지
  if (nextYear > currentYear || (nextYear === currentYear && nextMonth > currentMonth)) {
    return
  }

  year.value = nextYear
  month.value = nextMonth

  gameSessionStore.loadMonthly(year.value, month.value)
}
</script>

<style scoped>
.ledger-page {
  background: #f5f7f8;
}

.rounded-borders {
  border-radius: 12px;
}
.form-body {
  padding-left: 8px;
  padding-right: 8px;
}

@media (min-width: 768px) {
  .form-body {
    padding-left: 12px;
    padding-right: 12px;
  }
}
.kpi-header {
  flex-wrap: wrap;
}

.kpi-container {
  flex-wrap: wrap;
  margin-left: 12px;
  margin-right: 12px;
}

/* 모바일에서 세션 추가 버튼 라인브레이크 대응 */
.kpi-add-btn {
  white-space: nowrap;
}

.kpi-card {
  width: 115px;
  height: 70px;
  padding: 8px 12px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.07);
}

.kpi-label {
  font-size: 12px;
  color: #666;
  margin-bottom: 2px;
}

.kpi-value {
  font-size: 18px;
  font-weight: bold;
  line-height: 1.2;
}
</style>
