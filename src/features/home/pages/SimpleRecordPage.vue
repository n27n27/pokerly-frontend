<template>
  <q-page class="simple-record-page">
    <header class="simple-record-topbar">
      <button type="button" aria-label="기록 입력 닫기" @click="router.back()">
        <q-icon name="close" size="30px" />
      </button>
      <h1>{{ isEdit ? '기록 수정' : '새 기록' }}</h1>
      <span aria-hidden="true"></span>
    </header>

    <div class="record-form-scroll">
      <section class="record-form-card">
      <h2>기본 정보</h2>
      <div class="form-fields">
        <label class="form-field">
          <span>매장</span>
          <button class="select-field" type="button" @click="venuePickerOpen = true">
            <span :class="{ placeholder: !venueSelectionMade }">
              {{ venueSelectionMade ? (form.venue || '선택 안 함') : '매장을 선택해주세요' }}
            </span>
            <q-icon name="expand_more" size="24px" />
          </button>
          <div v-if="!venueLoading && venues.length === 0" class="venue-empty">
            <q-icon name="location_on" size="36px" />
            <p>등록된 장소가 없습니다.</p>
            <button type="button" @click="openVenueAdd">
              <q-icon name="add" size="18px" />
              장소 추가
            </button>
          </div>
          <div v-else-if="venueLoading" class="venue-loading">장소를 불러오는 중...</div>
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

        <div class="satellite-control">
          <span>새틀 획득</span>
          <button
            type="button"
            role="switch"
            :aria-checked="form.satelliteAwarded"
            :class="{ active: form.satelliteAwarded }"
            @click="toggleSatellite"
          >
            <i aria-hidden="true"></i>
            <b>{{ form.satelliteAwarded ? 'ON' : 'OFF' }}</b>
          </button>
        </div>

        <label v-if="form.satelliteAwarded" class="form-field">
          <span>새틀명 <small>선택</small></span>
          <input v-model.trim="form.satelliteName" maxlength="100" placeholder="획득한 대회명을 입력해주세요" />
        </label>
      </div>
      </section>
    </div>

    <StickyPrimaryAction
      :label="isEdit ? '수정하기' : '저장하기'"
      :disabled="!canSave"
      :loading="saving"
      loading-label="저장 중..."
      @click="saveRecord"
    />

    <q-dialog v-model="venuePickerOpen" position="bottom">
      <div class="venue-picker-sheet">
        <div class="venue-picker-sheet__handle" aria-hidden="true"></div>
        <h2>장소 선택</h2>

        <div class="venue-picker-sheet__list">
          <button
            v-for="venue in venues"
            :key="venue.id"
            type="button"
            :aria-selected="form.venue === venue.name"
            @click="selectVenue(venue.name)"
          >
            <span>{{ venue.name }}</span>
            <q-icon v-if="form.venue === venue.name" name="check" size="22px" />
          </button>
        </div>

        <div class="venue-picker-sheet__footer">
          <button type="button" @click="openVenueAdd">
            <q-icon name="add" size="20px" />
            <span>새 매장 추가</span>
          </button>
        </div>
      </div>
    </q-dialog>

    <q-dialog v-model="venueAddOpen" position="bottom">
      <div class="venue-sheet venue-add-sheet">
        <div class="venue-sheet__handle" aria-hidden="true"></div>
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
      </div>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { storeToRefs } from 'pinia'
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
const { venues, loading: venueLoading } = storeToRefs(venueStore)
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
  satelliteAwarded: false,
  satelliteName: '',
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
  const exists = venues.value.find((venue) => venue.name === newVenueName.value)
  if (!exists) {
    const created = await venueStore.addVenue({
      name: newVenueName.value,
      location: newVenueLocation.value,
      notes: newVenueMemo.value,
      pointBalance: 0,
    })
    form.venue = created?.name || newVenueName.value
  } else {
    form.venue = exists.name
  }
  venueSelectionMade.value = true
  venueAddOpen.value = false
}

const number = (value) => Number(String(value || '').replaceAll(',', '')) || 0

const toggleSatellite = () => {
  form.satelliteAwarded = !form.satelliteAwarded
  if (!form.satelliteAwarded) form.satelliteName = ''
}

onMounted(async () => {
  await venueStore.loadVenues()
  if (!isEdit.value) return
  const session = await fetchGameSession(route.query.recordId)
  const venue = venueStore.venues.find((item) => item.id === session.venueId)
  Object.assign(form, {
    venue: venue?.name || '',
    tournamentName: session.tournamentName || '',
    date: session.playDate,
    buyIn: number(session.buyInPerEntry).toLocaleString('ko-KR'),
    discount: number(session.discount).toLocaleString('ko-KR'),
    entries: session.entries || 1,
    rank: session.finalRank || '',
    prize: number(session.prize).toLocaleString('ko-KR'),
    satelliteAwarded: Boolean(session.satelliteAwarded),
    satelliteName: session.satelliteName || '',
  })
  venueSelectionMade.value = Boolean(venue)
})

const saveRecord = async () => {
  if (!canSave.value || saving.value) return
  saving.value = true
  const venueId = venues.value.find((venue) => venue.name === form.venue)?.id || null
  const payload = {
    venueId,
    playDate: form.date,
    sessionType: venueId ? 'VENUE' : 'OTHER',
    gameType: 'TOURNAMENT',
    tournamentName: form.tournamentName.trim(),
    tournamentResult: number(form.prize) > 0 || form.satelliteAwarded ? 'ITM' : 'BUST',
    startLevel: null,
    currentLevel: null,
    buyInPerEntry: number(form.buyIn),
    entries: Number(form.entries) || 1,
    discount: number(form.discount),
    prize: number(form.prize),
    satelliteAwarded: form.satelliteAwarded,
    satelliteName: form.satelliteAwarded ? form.satelliteName.trim() : null,
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
      satelliteAwarded: payload.satelliteAwarded,
      satelliteName: payload.satelliteName,
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
  height: 100%;
  min-height: 0 !important;
  grid-template-rows: auto minmax(0, 1fr) auto;
  gap: 14px;
  padding: var(--v2-page-padding-top) var(--v2-page-padding-x)
    calc(88px + var(--app-safe-bottom));
}

.simple-record-page * { box-sizing: border-box; }
.record-form-scroll { display: grid; min-height: 0; align-content: start; gap: 14px; overflow-y: auto; overscroll-behavior-y: contain; padding-bottom: 2px; -webkit-overflow-scrolling: touch; }
.simple-record-topbar { display: grid; min-height: var(--v2-detail-topbar-height); grid-template-columns: 44px minmax(0, 1fr) 44px; align-items: center; }
.simple-record-topbar button { display: grid; width: 44px; height: 44px; place-items: center; padding: 0; border: 0; background: transparent; color: var(--v2-text-main); }
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
.form-field > span:first-child small { color: var(--v2-text-sub); font-size: 10px; font-weight: 500; }
.form-field input { width: 100%; min-width: 0; height: 44px; padding: 0 12px; border: 1px solid var(--v2-border); border-radius: 10px; outline: 0; background: #fbfaff; color: var(--v2-text-main); font: inherit; font-size: 13px; }
.form-field input[inputmode="numeric"] { text-align: right; font-variant-numeric: tabular-nums; }
.form-field textarea { width: 100%; min-height: 76px; resize: none; padding: 11px 12px; border: 1px solid var(--v2-border); border-radius: 10px; outline: 0; background: #fbfaff; color: var(--v2-text-main); font: inherit; font-size: 13px; line-height: 1.45; }
.form-field input:focus, .form-field textarea:focus { border-color: rgba(109, 69, 232, .48); background: #fff; box-shadow: 0 0 0 3px rgba(109, 69, 232, .08); }
.form-field input::placeholder, .form-field textarea::placeholder { color: #aaa5b7; }
.select-field {
  width: 100%;
  min-height: 44px;
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-md);
  background: #fff;
  color: var(--v2-text-main);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 0 12px;
  font: inherit;
  font-size: 14px;
  font-weight: 450;
  text-align: left;
}

.select-field .placeholder { color: #aaa5b7; }
.select-field .q-icon { color: var(--v2-text-sub); }

.venue-empty {
  min-height: 152px;
  border: 1px dashed rgba(109, 69, 232, 0.24);
  border-radius: var(--v2-radius-lg);
  background: rgba(241, 236, 255, 0.44);
  display: grid;
  place-items: center;
  align-content: center;
  gap: 10px;
}

.venue-loading {
  min-height: 72px;
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-md);
  color: var(--v2-text-sub);
  display: grid;
  place-items: center;
  font-size: 13px;
}

.venue-empty .q-icon {
  color: var(--v2-primary);
}

.venue-empty p {
  margin: 0;
  color: var(--v2-text-main);
  font-size: 14px;
  font-weight: 450;
}

.venue-empty button {
  min-height: 34px;
  padding: 0 14px;
  border: 1px solid var(--v2-primary);
  border-radius: var(--v2-radius-sm);
  background: #ffffff;
  color: var(--v2-primary);
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font: inherit;
  font-size: 13px;
  font-weight: 520;
}

.venue-picker-sheet {
  width: min(100%, 520px);
  height: min(76vh, 620px);
  max-height: calc(100dvh - var(--app-safe-top) - 24px);
  margin: 0 auto;
  overflow: hidden;
  border-radius: 24px 24px 0 0;
  background: #ffffff;
  display: grid;
  grid-template-rows: auto auto minmax(0, 1fr) auto;
}

.venue-picker-sheet__handle {
  width: 38px;
  height: 5px;
  margin: 12px auto 0;
  border-radius: 999px;
  background: #d4d0dc;
}

.venue-picker-sheet h2 {
  margin: 18px 20px 14px;
  color: var(--v2-text-main);
  font-size: 20px;
  font-weight: 620;
  line-height: 1.2;
  text-align: center;
}

.venue-picker-sheet__list {
  overflow-y: auto;
  overscroll-behavior: contain;
  border-top: 1px solid var(--v2-border);
  -webkit-overflow-scrolling: touch;
}

.venue-picker-sheet__list button {
  width: 100%;
  min-height: 52px;
  padding: 0 20px;
  border: 0;
  border-bottom: 1px solid var(--v2-border);
  background: #ffffff;
  color: var(--v2-text-main);
  display: flex;
  align-items: center;
  justify-content: space-between;
  font: inherit;
  font-size: 15px;
  font-weight: 450;
  text-align: left;
}

.venue-picker-sheet__list button[aria-selected='true'] {
  color: var(--v2-primary);
  font-weight: 560;
}

.venue-picker-sheet__footer {
  padding: 12px 20px calc(12px + env(safe-area-inset-bottom));
  border-top: 1px solid var(--v2-border);
  background: #ffffff;
}

.venue-picker-sheet__footer button {
  width: 100%;
  min-height: 48px;
  padding: 0 16px;
  border: 1px solid rgba(109, 69, 232, 0.24);
  border-radius: var(--v2-radius-md);
  background: var(--v2-primary-soft);
  color: var(--v2-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font: inherit;
  font-size: 15px;
  font-weight: 600;
}

.venue-sheet { width: min(100%, 420px); padding: 10px 18px 22px; border-radius: 20px 20px 0 0; background: #fff; }
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
.satellite-control { display: flex; min-height: 44px; align-items: center; justify-content: space-between; padding: 0 12px; border: 1px solid var(--v2-border); border-radius: 10px; background: #fbfaff; }
.satellite-control > span { color: #4f4a5e; font-size: 11px; font-weight: 580; }
.satellite-control button { display: flex; min-width: 58px; height: 30px; align-items: center; justify-content: space-between; gap: 5px; padding: 3px 7px 3px 4px; border: 0; border-radius: 999px; background: #e9e6ef; color: #8d8799; font: inherit; }
.satellite-control button i { width: 24px; height: 24px; border-radius: 50%; background: #fff; box-shadow: 0 1px 4px rgba(28, 18, 60, .15); }
.satellite-control button b { font-size: 9px; font-weight: 700; }
.satellite-control button.active { flex-direction: row-reverse; padding-right: 4px; padding-left: 7px; background: var(--v2-primary); color: #fff; }
.venue-sheet { width: min(100%, 420px); padding: 10px 18px 22px; border-radius: 20px 20px 0 0; background: #fff; }
.venue-sheet__handle { display: block; width: 46px; height: 5px; margin: 0 auto 15px; border-radius: 999px; background: #aaa5b7; }
.venue-sheet h2 { margin: 0 0 10px; font-size: 17px; font-weight: 620; }
.venue-add-sheet { display: grid; gap: 12px; }
.venue-add-sheet h2 { margin-bottom: 0; }
.confirm-venue-button { width: 100%; min-height: 44px; margin-top: 4px; border: 0; border-radius: 10px; background: var(--v2-primary); color: #fff; font: inherit; font-size: 13px; font-weight: 600; }
.confirm-venue-button:disabled { background: var(--v2-primary-soft); color: #aaa5b7; }
</style>
