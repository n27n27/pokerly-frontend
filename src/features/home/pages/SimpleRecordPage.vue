<template>
  <q-page class="simple-record-page">
    <header class="simple-record-topbar">
      <button type="button" @click="router.back()">취소</button>
      <h1>{{ isEdit ? '기록 수정' : '새 기록' }}</h1>
      <span aria-hidden="true"></span>
    </header>

    <section class="record-form-card">
      <h2>기본 정보</h2>
      <div class="form-fields">
        <label class="form-field">
          <span>매장</span>
          <button class="venue-select-button" type="button" @click="venuePickerOpen = true">
            <span :class="{ placeholder: !venueSelectionMade }">
              {{ venueSelectionMade ? (form.venue || '선택 안 함') : '매장을 선택해주세요' }}
            </span>
            <q-icon name="expand_more" size="20px" />
          </button>
        </label>

        <label class="form-field">
          <span>대회명 <b>*</b></span>
          <input v-model="form.tournamentName" placeholder="대회명을 입력해주세요" />
        </label>

        <label class="form-field">
          <span>날짜 <b>*</b></span>
          <AppDatePicker v-model="form.date" aria-label="대회 날짜 선택" />
        </label>

        <div class="amount-grid">
          <label class="form-field">
            <span>바인 금액 <b>*</b></span>
            <input v-model="form.buyIn" inputmode="numeric" placeholder="100,000" />
          </label>
          <label class="form-field">
            <span>할인 금액</span>
            <input v-model="form.discount" inputmode="numeric" placeholder="할인 금액 입력" />
          </label>
        </div>

        <div class="buy-in-control">
          <span>총 바인</span>
          <div>
            <button type="button" :disabled="form.entries <= 1" aria-label="총 바인 감소" @click="form.entries -= 1">
              <q-icon name="remove" size="18px" />
            </button>
            <strong>{{ form.entries }}</strong>
            <button type="button" aria-label="총 바인 증가" @click="form.entries += 1">
              <q-icon name="add" size="18px" />
            </button>
          </div>
          <em>회</em>
        </div>
      </div>
    </section>

    <section class="record-form-card record-form-card--result">
      <h2>결과</h2>
      <div class="form-fields">
        <div class="amount-grid">
          <label class="form-field form-field--suffix">
            <span>최종 순위</span>
            <span><input v-model="form.rank" inputmode="numeric" aria-label="최종 순위" /><em>위</em></span>
          </label>
          <label class="form-field">
            <span>상금</span>
            <input v-model="form.prize" inputmode="numeric" placeholder="상금 입력" />
          </label>
        </div>
      </div>
    </section>

    <StickyPrimaryAction :label="isEdit ? '수정하기' : '저장하기'" :disabled="!canSave" :loading="saving" loading-label="저장 중..." @click="saveRecord" />

    <q-dialog v-model="venuePickerOpen" position="bottom">
      <q-card class="venue-sheet">
        <span class="venue-sheet__handle" aria-hidden="true"></span>
        <h2>매장 선택</h2>
        <div class="venue-list">
          <button
            v-for="venue in venues"
            :key="venue"
            type="button"
            :class="{ selected: form.venue === venue }"
            @click="selectVenue(venue)"
          >
            <span>{{ venue }}</span>
            <q-icon v-if="form.venue === venue" name="check" size="19px" />
          </button>
          <button type="button" :class="{ selected: venueSelectionMade && !form.venue }" @click="selectVenue('')">
            <span>선택 안 함</span>
            <q-icon v-if="venueSelectionMade && !form.venue" name="check" size="19px" />
          </button>
        </div>
        <button class="add-venue-button" type="button" @click="openVenueAdd">
          <q-icon name="add" size="19px" />
          매장 추가
        </button>
      </q-card>
    </q-dialog>

    <q-dialog v-model="venueAddOpen" position="bottom">
      <q-card class="venue-sheet venue-add-sheet">
        <span class="venue-sheet__handle" aria-hidden="true"></span>
        <h2>매장 추가</h2>
        <label class="form-field">
          <span>매장명 <b>*</b></span>
          <input v-model.trim="newVenueName" maxlength="30" placeholder="매장명을 입력해주세요" @keyup.enter="addVenue" />
        </label>
        <label class="form-field">
          <span>위치</span>
          <input v-model.trim="newVenueLocation" maxlength="50" placeholder="지역이나 주소를 입력해주세요" />
        </label>
        <label class="form-field">
          <span>메모</span>
          <textarea v-model.trim="newVenueMemo" maxlength="120" placeholder="매장에 대한 메모를 입력해주세요" />
        </label>
        <button class="confirm-venue-button" type="button" :disabled="!newVenueName" @click="addVenue">
          추가하기
        </button>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useAlert } from 'src/composables/useAlert'
import AppDatePicker from 'src/shared/components/AppDatePicker.vue'
import StickyPrimaryAction from 'src/shared/components/StickyPrimaryAction.vue'
import { createGameSession, fetchGameSession, updateSimpleGameSession } from 'src/api/gameSession'
import { useVenueStore } from 'src/stores/venue'
import { formatLocalDate } from 'src/utils/localDate'

const router = useRouter()
const route = useRoute()
const alert = useAlert()
const venueStore = useVenueStore()
const isEdit = computed(() => Boolean(route.query.recordId))
const venueRecords = ref([])
const venues = computed(() => venueRecords.value.map((venue) => venue.name))
const venuePickerOpen = ref(false)
const venueAddOpen = ref(false)
const newVenueName = ref('')
const newVenueLocation = ref('')
const newVenueMemo = ref('')
const venueSelectionMade = ref(isEdit.value)
const saving = ref(false)

const form = reactive({
  venue: '',
  tournamentName: '',
  date: formatLocalDate(),
  buyIn: '',
  discount: '',
  entries: 1,
  rank: '',
  prize: '',
})
const canSave = computed(() => Boolean(form.tournamentName.trim() && form.date && form.buyIn))

const selectVenue = (venue) => {
  form.venue = venue
  venueSelectionMade.value = true
  venuePickerOpen.value = false
}

const openVenueAdd = () => {
  venuePickerOpen.value = false
  newVenueName.value = ''
  newVenueLocation.value = ''
  newVenueMemo.value = ''
  venueAddOpen.value = true
}

const addVenue = async () => {
  if (!newVenueName.value) return
  if (!venues.value.includes(newVenueName.value)) {
    const created = await venueStore.addVenue({
      name: newVenueName.value,
      location: newVenueLocation.value,
      notes: newVenueMemo.value,
      pointBalance: 0,
    })
    venueRecords.value.push(created)
  }
  form.venue = newVenueName.value
  venueSelectionMade.value = true
  venueAddOpen.value = false
}

const number = (value) => Number(String(value || '').replaceAll(',', '')) || 0

onMounted(async () => {
  await venueStore.loadVenues()
  venueRecords.value = [...venueStore.venues]
  if (!isEdit.value) return
  const session = await fetchGameSession(route.query.recordId)
  const venue = venueRecords.value.find((item) => item.id === session.venueId)
  Object.assign(form, {
    venue: venue?.name || '',
    tournamentName: session.tournamentName || '',
    date: session.playDate,
    buyIn: number(session.buyInPerEntry).toLocaleString('ko-KR'),
    discount: number(session.discount).toLocaleString('ko-KR'),
    entries: session.entries || 1,
    rank: session.finalRank || '',
    prize: number(session.prize).toLocaleString('ko-KR'),
  })
  venueSelectionMade.value = Boolean(venue)
})

const saveRecord = async () => {
  if (!canSave.value || saving.value) return
  saving.value = true
  const venueId = venueRecords.value.find((venue) => venue.name === form.venue)?.id || null
  const payload = {
    venueId,
    playDate: form.date,
    sessionType: venueId ? 'VENUE' : 'OTHER',
    gameType: 'TOURNAMENT',
    tournamentName: form.tournamentName.trim(),
    tournamentResult: number(form.prize) > 0 ? 'ITM' : 'BUST',
    startLevel: null,
    currentLevel: null,
    buyInPerEntry: number(form.buyIn),
    entries: Number(form.entries) || 1,
    discount: number(form.discount),
    prize: number(form.prize),
    satelliteAwarded: false,
    notes: '',
    tournamentStatus: 'COMPLETED',
    finalRank: Number(form.rank) || null,
  }
  try {
    if (isEdit.value) {
      await updateSimpleGameSession(route.query.recordId, {
      venueId: payload.venueId,
      playDate: payload.playDate,
      tournamentName: payload.tournamentName,
      buyInPerEntry: payload.buyInPerEntry,
      entries: payload.entries,
      discount: payload.discount,
      prize: payload.prize,
      finalRank: payload.finalRank,
      })
    } else {
      await createGameSession(payload)
    }
    alert.show(isEdit.value ? '기록이 수정되었습니다.' : '기록이 저장되었습니다.', 'success')
    const [year, month] = form.date.split('-').map(Number)
    await router.replace({
      name: 'bank-records',
      query: {
        ...(Number.isInteger(year) && Number.isInteger(month) ? { year, month } : {}),
        ...(route.query.returnView === 'calendar' ? { view: 'calendar' } : {}),
      },
    })
  } catch {
    alert.show('기록을 저장하지 못했습니다.', 'error')
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.simple-record-page {
  display: grid;
  min-height: 100%;
  align-content: start;
  gap: 14px;
  padding: var(--v2-page-padding-top) var(--v2-page-padding-x) 180px;
}

.simple-record-page * { box-sizing: border-box; }
.simple-record-topbar { display: grid; min-height: 36px; grid-template-columns: 56px minmax(0, 1fr) 56px; align-items: center; }
.simple-record-topbar button { min-width: 44px; height: 36px; padding: 0; border: 0; background: transparent; color: var(--v2-text-sub); font: inherit; font-size: 13px; font-weight: 520; text-align: left; }
.simple-record-topbar h1 { margin: 0; color: var(--v2-text-main); font-size: 21px; font-weight: 650; line-height: 1.2; text-align: center; }
.record-form-card { padding: 16px; border: 1px solid var(--v2-border); border-radius: var(--v2-radius-lg); background: #fff; box-shadow: var(--v2-shadow-card); }
.record-form-card > h2 { margin: 0 0 14px; font-size: 15px; font-weight: 620; }
.record-form-card--result { padding: 13px 16px 14px; }
.record-form-card--result > h2 { margin-bottom: 9px; }
.record-form-card--result .form-fields { gap: 8px; }
.record-form-card--result .form-field input { height: 42px; }
.form-fields { display: grid; gap: 12px; }
.form-field { display: grid; gap: 7px; min-width: 0; }
.form-field > span:first-child { display: inline-flex; width: max-content; align-items: baseline; gap: 2px; color: #4f4a5e; font-size: 11px; font-weight: 580; line-height: 1.2; }
.buy-in-control > span:first-child { color: #4f4a5e; font-size: 11px; font-weight: 580; }
.form-field > span:first-child b { display: inline-block; color: var(--v2-primary); font-size: 11px; font-weight: 650; line-height: 1; transform: translateY(1px); vertical-align: baseline; }
.form-field input { width: 100%; min-width: 0; height: 44px; padding: 0 12px; border: 1px solid var(--v2-border); border-radius: 10px; outline: 0; background: #fbfaff; color: var(--v2-text-main); font: inherit; font-size: 13px; }
.form-field input[inputmode="numeric"] { text-align: right; font-variant-numeric: tabular-nums; }
.form-field textarea { width: 100%; min-height: 76px; resize: none; padding: 11px 12px; border: 1px solid var(--v2-border); border-radius: 10px; outline: 0; background: #fbfaff; color: var(--v2-text-main); font: inherit; font-size: 13px; line-height: 1.45; }
.form-field input:focus, .form-field textarea:focus { border-color: rgba(109, 69, 232, .48); background: #fff; box-shadow: 0 0 0 3px rgba(109, 69, 232, .08); }
.form-field input::placeholder, .form-field textarea::placeholder { color: #aaa5b7; }
.venue-select-button { display: flex; width: 100%; height: 44px; align-items: center; justify-content: space-between; padding: 0 11px 0 12px; border: 1px solid var(--v2-border); border-radius: 10px; background: #fbfaff; color: var(--v2-text-main); font: inherit; font-size: 13px; text-align: left; }
.venue-select-button .placeholder { color: #aaa5b7; }
.venue-select-button .q-icon { color: var(--v2-text-sub); }
.amount-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.buy-in-control { display: grid; min-height: 58px; grid-template-columns: minmax(0, 1fr) auto 18px; align-items: center; gap: 8px; padding: 8px 10px 8px 12px; border: 1px solid var(--v2-border); border-radius: 10px; background: #fbfaff; }
.buy-in-control > div { display: flex; align-items: center; gap: 12px; }
.buy-in-control button { display: grid; width: 34px; height: 34px; place-items: center; padding: 0; border: 0; border-radius: 9px; background: #f0edf7; color: var(--v2-text-main); }
.buy-in-control button:disabled { color: #bbb6c8; }
.buy-in-control strong { min-width: 18px; font-size: 14px; text-align: center; }
.buy-in-control em, .form-field em { color: var(--v2-text-main); font-size: 12px; font-style: normal; }
.form-field--suffix > span:last-child { position: relative; display: block; }
.form-field--suffix input { padding-right: 32px; }
.form-field--suffix em { position: absolute; top: 50%; right: 12px; transform: translateY(-50%); }
.venue-sheet { width: min(100%, 420px); padding: 10px 18px 22px; border-radius: 20px 20px 0 0; background: #fff; }
.venue-sheet__handle { display: block; width: 46px; height: 5px; margin: 0 auto 15px; border-radius: 999px; background: #aaa5b7; }
.venue-sheet h2 { margin: 0 0 10px; font-size: 17px; font-weight: 620; }
.venue-list { display: grid; }
.venue-list button { display: flex; width: 100%; min-height: 50px; align-items: center; justify-content: space-between; padding: 0 4px; border: 0; border-bottom: 1px solid var(--v2-border); background: transparent; color: var(--v2-text-main); font: inherit; font-size: 14px; text-align: left; }
.venue-list button:last-child { border-bottom: 0; }
.venue-list button.selected { color: var(--v2-primary); font-weight: 600; }
.add-venue-button { display: flex; width: 100%; min-height: 46px; align-items: center; justify-content: center; gap: 5px; margin-top: 6px; border: 1px solid rgba(109, 69, 232, .22); border-radius: 10px; background: var(--v2-primary-soft); color: var(--v2-primary); font: inherit; font-size: 13px; font-weight: 600; }
.venue-add-sheet { display: grid; gap: 12px; }
.venue-add-sheet h2 { margin-bottom: 0; }
.confirm-venue-button { width: 100%; min-height: 44px; margin-top: 4px; border: 0; border-radius: 10px; background: var(--v2-primary); color: #fff; font: inherit; font-size: 13px; font-weight: 600; }
.confirm-venue-button:disabled { background: var(--v2-primary-soft); color: #aaa5b7; }
</style>
