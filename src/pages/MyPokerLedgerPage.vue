<template>
  <q-page padding class="ledger-page">
    <!-- ====================== 상단 영역 ====================== -->
    <div class="row items-center justify-between q-mb-md">
      <!-- 좌측: 제목 + (나중에 월 선택 자리) -->
      <div class="column">
        <div class="text-h6 text-weight-bold">가계부</div>
        <div class="text-caption text-grey-7">
          게임 세션의 바인 / 상금 / 수익을 기록하고 관리합니다.
        </div>
      </div>

      <!-- 우측: 세션 추가 버튼 -->
      <q-btn color="primary" unelevated icon="add" label="세션 추가" @click="openCreateDialog" />
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
                  {{ s.date }} · 바인 {{ money(s.totalBuyIn) }} · 상금 {{ money(s.prize) }}
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
              <q-input v-model="form.date" label="날짜" filled dense color="primary" readonly>
                <template #append>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                      <q-date v-model="form.date" mask="YYYY-MM-DD">
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
                v-model="form.memo"
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

const alert = useAlert()

const venueStore = useVenueStore()

// ----------------------- 상태 -----------------------
const sessions = ref([
  // TODO: 임시 목업 데이터. 실제 연동 후 제거 예정
  {
    id: 1,
    venueId: 1,
    venueName: '샘플 매장 A',
    date: '2025-11-18',
    gameType: '데일리',
    buyInPerEntry: 50000,
    entries: 2,
    discount: 0,
    totalBuyIn: 100000,
    prize: 180000,
    netProfit: 80000,
  },
])

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

const today = new Date().toISOString().slice(0, 10) // "YYYY-MM-DD"

const form = reactive({
  venueId: null,
  date: today,
  gameType: '데일리',
  buyInPerEntry: null,
  entries: 1,
  discount: 0,
  prize: 0,
  memo: '',
})

const saving = ref(false)

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
  form.date = today
  form.gameType = '데일리'
  form.buyInPerEntry = null
  form.entries = 1
  form.discount = 0
  form.prize = 0
  form.memo = ''
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
  form.date = session.date
  form.gameType = session.gameType
  form.buyInPerEntry = session.buyInPerEntry
  form.entries = session.entries
  form.discount = session.discount
  form.prize = session.prize
  form.memo = session.memo || ''
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
      date: form.date,
      gameType: form.gameType,
      buyInPerEntry: Number(form.buyInPerEntry),
      entries: Number(form.entries),
      discount: Number(form.discount),
      totalBuyIn: totalBuyIn.value,
      prize: Number(form.prize),
      netProfit: netProfit.value,
      memo: form.memo,
    }

    if (dialog.mode === 'create') {
      // TODO: 실제 API 연동으로 교체
      const newId = (sessions.value[sessions.value.length - 1]?.id || 0) + 1
      sessions.value.push({
        id: newId,
        venueName: venueOptions.value.find((v) => v.id === form.venueId)?.name || '',
        ...payload,
      })
    } else {
      const idx = sessions.value.findIndex((s) => s.id === dialog.editingId)
      if (idx !== -1) {
        sessions.value[idx] = {
          ...sessions.value[idx],
          venueId: payload.venueId,
          venueName: venueOptions.value.find((v) => v.id === form.venueId)?.name || '',
          date: payload.date,
          gameType: payload.gameType,
          buyInPerEntry: payload.buyInPerEntry,
          entries: payload.entries,
          discount: payload.discount,
          totalBuyIn: payload.totalBuyIn,
          prize: payload.prize,
          netProfit: payload.netProfit,
          memo: payload.memo,
        }
      }
    }

    closeDialog()
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  venueStore.loadVenues()
})
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
</style>
