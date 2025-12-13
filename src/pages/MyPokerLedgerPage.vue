<template>
  <q-page class="ledger-page">
    <div class="ledger-container">
      <!-- ====================== 상단 영역 ====================== -->
      <div class="kpi-header-grid kpi-header-gap">
        <!-- 좌측: 월 선택 -->
        <div class="month-nav row items-center">
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
        <div class="kpi-container">
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

        <!-- 우측: 정렬 + 세션 추가 -->
        <div class="header-actions row items-center">
          <q-btn
            flat
            dense
            icon="sort"
            :label="sortOrder === 'DESC' ? '최신순' : '과거순'"
            @click="toggleSort"
            class="sort-btn"
          />

          <q-btn
            color="primary"
            unelevated
            icon="add"
            label="세션 추가"
            @click="openCreateDialog"
            class="kpi-add-btn"
          />
        </div>
      </div>

      <!-- ✅ 모바일에서는 spacer 줄이고 싶어서 조건부 spaced -->
      <q-separator :spaced="$q.screen.gt.sm" />

      <!-- ====================== 리스트 ====================== -->
      <div v-if="sortedSessions.length === 0" class="q-mt-lg text-grey-6">
        아직 등록된 세션이 없습니다. 오른쪽 상단의 <b>세션 추가</b> 버튼으로 첫 세션을 기록해
        보세요.
      </div>

      <div v-else class="q-mt-md">
        <q-list bordered separator class="rounded-borders bg-white">
          <q-item
            v-for="s in sortedSessions"
            :key="s.id"
            clickable
            v-ripple
            @click="openEditDialog(s)"
          >
            <q-item-section>
              <div class="row items-center justify-between">
                <div class="column">
                  <div class="row items-center title-row">
                    <div class="text-subtitle2 text-weight-medium">
                      {{ s.displayTitle }}
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

              <!-- 세션 타입 -->
              <q-option-group
                v-model="form.sessionType"
                :options="sessionTypeOptions"
                type="radio"
                inline
                color="primary"
                class="q-mb-sm"
              />

              <!-- 매장 (VENUE 타입일 때만) -->
              <div class="q-mb-sm" v-if="form.sessionType === 'VENUE'">
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

              <!-- 토너먼트 정보 (선택 입력) -->
              <q-expansion-item
                dense
                expand-separator
                icon="trophy"
                label="토너먼트 정보 (선택)"
                caption="GTD / 전체 엔트리 수 등"
                class="q-mt-md"
              >
                <div class="optional-section q-mt-xs">
                  <div class="text-caption text-grey-7 q-mb-xs">
                    광고된 GTD 금액과 전체 엔트리 수를 기록해 두면 나중에 EV 분석에 활용할 수
                    있어요. (선택 입력)
                  </div>

                  <div class="row q-col-gutter-sm">
                    <div class="col-12 col-md-6">
                      <q-input
                        v-model.number="form.gtdAmount"
                        label="GTD 금액"
                        type="number"
                        filled
                        dense
                        color="primary"
                        prefix="₩"
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input
                        v-model.number="form.fieldEntries"
                        label="전체 엔트리 수"
                        type="number"
                        filled
                        dense
                        color="primary"
                        suffix="엔트리"
                      />
                    </div>
                  </div>
                </div>
              </q-expansion-item>

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

// ----------------------- 정렬(기본 최신순) -----------------------
const sortOrder = ref('DESC') // 'DESC' 최신순 | 'ASC' 과거순
const toggleSort = () => {
  sortOrder.value = sortOrder.value === 'DESC' ? 'ASC' : 'DESC'
}

// ----------------------- 상태 -----------------------
const venueOptions = computed(() => venueStore.venues)

const sessions = computed(() =>
  gameSessionStore.sessions.map((s) => {
    const isVenue = s.sessionType === 'VENUE'
    const venueName = isVenue ? venueOptions.value.find((v) => v.id === s.venueId)?.name || '' : ''
    const displayTitle = isVenue ? venueName || '매장 미지정' : sessionTypeLabel(s.sessionType)

    return {
      ...s,
      venueName,
      displayTitle,
    }
  }),
)

const sortedSessions = computed(() => {
  const arr = [...sessions.value]
  arr.sort((a, b) => {
    const cmp = a.playDate.localeCompare(b.playDate) // YYYY-MM-DD
    return sortOrder.value === 'ASC' ? cmp : -cmp
  })
  return arr
})

const summary = computed(() => {
  let totalBuyIn = 0
  let totalPrize = 0
  let totalProfit = 0

  sessions.value.forEach((s) => {
    totalBuyIn += s.totalBuyIn || 0
    totalPrize += s.prize || 0
    totalProfit += s.netProfit || 0
  })

  return { totalBuyIn, totalPrize, totalProfit }
})

const gameTypeOptions = [
  { label: 'GTD', value: 'GTD' },
  { label: '데일리', value: '데일리' },
  { label: '기타', value: '기타' },
]

const sessionTypeOptions = [
  { label: '매장', value: 'VENUE' },
  { label: '대회', value: 'MAJOR' },
  { label: '온라인', value: 'ONLINE' },
  { label: '기타', value: 'OTHER' },
]

const dialog = reactive({
  open: false,
  mode: 'create', // 'create' | 'edit'
  editingId: null,
})

const form = reactive({
  sessionType: 'VENUE',
  venueId: null,
  playDate: today,
  gameType: 'GTD',
  buyInPerEntry: null,
  entries: 1,
  discount: 0,
  prize: 0,
  gtdAmount: null,
  fieldEntries: null,
  notes: '',
})

const saving = ref(false)
const deleting = ref(false)

// ----------------------- 매장 다이얼로그 상태 -----------------------
const venueDialog = reactive({ open: false })

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

const sessionTypeLabel = (t) => {
  switch (t) {
    case 'VENUE':
      return '매장'
    case 'MAJOR':
      return '대회'
    case 'ONLINE':
      return '온라인'
    case 'OTHER':
      return '기타'
    default:
      return t || ''
  }
}

// ----------------------- 다이얼로그 제어 -----------------------
const resetForm = () => {
  form.sessionType = 'VENUE'
  form.venueId = null
  form.playDate = today
  form.gameType = 'GTD'
  form.buyInPerEntry = null
  form.entries = 1
  form.discount = 0
  form.prize = 0
  form.gtdAmount = null
  form.fieldEntries = null
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
  form.sessionType = session.sessionType || 'VENUE'
  form.venueId = session.venueId
  form.playDate = session.playDate
  form.gameType = session.gameType
  form.buyInPerEntry = session.buyInPerEntry
  form.entries = session.entries
  form.discount = session.discount
  form.prize = session.prize
  form.gtdAmount = session.gtdAmount
  form.fieldEntries = session.fieldEntries
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

// ----------------------- 저장 로직 -----------------------
const onSubmit = async () => {
  if (form.sessionType === 'VENUE' && !form.venueId) {
    alert.show('매장을 선택하세요.', 'warning')
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

  const venueIdPayload = form.sessionType === 'VENUE' ? form.venueId : null

  saving.value = true
  try {
    const payload = {
      sessionType: form.sessionType,
      venueId: venueIdPayload,
      playDate: form.playDate,
      gameType: form.gameType,
      buyInPerEntry: Number(form.buyInPerEntry),
      entries: Number(form.entries),
      discount: Number(form.discount),
      prize: Number(form.prize),
      notes: form.notes,
      gtdAmount: form.gtdAmount != null ? Number(form.gtdAmount) : null,
      fieldEntries: form.fieldEntries != null ? Number(form.fieldEntries) : null,
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
    ok: { label: '삭제', color: 'negative' },
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
  if (delta > 0 && isAtMaxMonth.value) return

  const base = new Date(year.value, month.value - 1 + delta, 1)
  const nextYear = base.getFullYear()
  const nextMonth = base.getMonth() + 1

  if (nextYear > currentYear || (nextYear === currentYear && nextMonth > currentMonth)) return

  year.value = nextYear
  month.value = nextMonth
  gameSessionStore.loadMonthly(year.value, month.value)
}
</script>

<style scoped>
.ledger-page {
  background: #f5f7f8;
}

/* 패딩을 컨테이너에서 통일 */
.ledger-container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 16px;
  box-sizing: border-box;
}

.rounded-borders {
  border-radius: 12px;
}

.form-body {
  padding-left: 8px;
  padding-right: 8px;
}

/* ------------------------------
   헤더: 3칸 그리드
------------------------------ */
.kpi-header-grid {
  display: grid;
  grid-template-columns: 1fr auto 1fr; /* 좌 월 / 중 KPI / 우 액션 */
  align-items: center;
  column-gap: 12px;
}

/* 헤더 아래 기본 간격 */
.kpi-header-gap {
  margin-bottom: 12px;
}

.month-nav {
  justify-self: start;
}

/* ✅ KPI 3개 동일 사이즈 + 가운데 칸에서 우측 정렬(PC에서 정리된 느낌) */
.kpi-container {
  display: grid;
  grid-template-columns: repeat(3, 160px);
  gap: 10px;
  justify-content: end;
}

.kpi-card {
  width: 160px;
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

/* 우측 액션 */
.header-actions {
  justify-self: end;
  display: flex;
  gap: 8px;
  white-space: nowrap;
}

.sort-btn,
.kpi-add-btn {
  white-space: nowrap;
}

/* 세션 타이틀 줄 간격 */
.title-row {
  gap: 8px;
}

/* ------------------------------
   모바일: 타이트하게
------------------------------ */
@media (max-width: 767px) {
  .ledger-container {
    padding: 12px;
  }

  .kpi-header-grid {
    grid-template-columns: 1fr;
    row-gap: 8px;
    column-gap: 0;
  }

  .month-nav {
    justify-self: center;
    justify-content: center;
  }

  .kpi-container {
    grid-template-columns: repeat(3, 1fr);
    justify-content: stretch;
    gap: 8px;
  }

  /* ✅ 모바일에서 KPI 카드 얇게 */
  .kpi-card {
    width: auto;
    height: 58px;
    padding: 6px 10px;
  }

  .kpi-value {
    font-size: 16px;
  }

  /* ✅ 모바일에서 헤더 아래 여백 더 줄이기 */
  .kpi-header-gap {
    margin-bottom: 6px;
  }

  .header-actions {
    justify-self: stretch;
    justify-content: space-between;
  }

  .kpi-add-btn {
    flex: 0 0 auto;
  }
}

/* 선택 정보 블록 */
.optional-section {
  border-radius: 10px;
  background: #f7f8fa;
  padding: 8px 10px 10px;
}
</style>
