<template>
  <q-page class="tournament-create-page">
    <header class="create-topbar">
      <button
        class="create-topbar__back"
        type="button"
        aria-label="뒤로 가기"
        @click="router.back()"
      >
        <q-icon name="chevron_left" size="28px" />
      </button>
      <h1>대회 생성</h1>
      <span aria-hidden="true"></span>
    </header>

    <section class="create-intro">
      <h2>새 대회를 생성하세요.</h2>
      <p>필요한 정보만 입력하면 바로<br />토너먼트를 시작할 수 있습니다.</p>
    </section>

    <form class="create-form" @submit.prevent="submitTournament">
      <div class="form-field">
        <label class="form-label" for="tournamentName">대회명 <span>필수</span></label>
        <div class="text-field">
          <input
            id="tournamentName"
            v-model="form.name"
            maxlength="50"
            placeholder="예) Prime Daily"
            type="text"
          />
          <span>{{ form.name.length }}/50</span>
        </div>
      </div>

      <div class="form-field">
        <div class="form-label">장소 <span>선택</span></div>
        <button
          v-if="venues.length"
          class="select-field"
          type="button"
          @click="venueOpen = true"
        >
          <span>{{ selectedVenue?.name || '장소를 선택하세요' }}</span>
          <q-icon name="expand_more" size="24px" />
        </button>
        <div v-if="!venueLoading && venues.length === 0" class="venue-empty">
          <q-icon name="location_on" size="36px" />
          <p>등록된 장소가 없습니다.</p>
          <button type="button" @click="showVenueSheet = true">
            <q-icon name="add" size="18px" />
            장소 추가
          </button>
        </div>
        <div v-else-if="venueLoading" class="venue-loading">장소를 불러오는 중...</div>
      </div>

      <div class="form-field">
        <label class="form-label" for="startingStack">시작 스택 <span>선택</span></label>
        <div class="text-field text-field--currency">
          <input
            id="startingStack"
            :value="form.startingStack"
            inputmode="numeric"
            placeholder="예) 60,000"
            @input="updateNumberField('startingStack', $event)"
          />
          <span>칩</span>
        </div>
      </div>

      <div class="form-field">
        <label class="form-label" for="startLevel">시작 레벨 <span>필수</span></label>
        <div class="text-field text-field--currency">
          <input
            id="startLevel"
            v-model="form.startLevel"
            inputmode="numeric"
            placeholder="예) 1"
          />
          <span>Level</span>
        </div>
      </div>

      <div class="form-field">
        <div class="form-label">시작 블라인드 · 앤티 <span>필수</span></div>
        <div class="blind-fields">
          <label class="blind-field">
            <span>SB</span>
            <input
              :value="form.smallBlind"
              inputmode="numeric"
              placeholder="100"
              @input="updateNumberField('smallBlind', $event)"
            />
          </label>
          <label class="blind-field">
            <span>BB</span>
            <input
              :value="form.bigBlind"
              inputmode="numeric"
              placeholder="200"
              @input="updateBigBlind"
            />
          </label>
          <label class="blind-field">
            <span>Ante</span>
            <input :value="form.ante" inputmode="numeric" placeholder="200" @input="updateAnte" />
          </label>
        </div>
        <div v-if="anteManuallyEdited" class="ante-help">
          <button type="button" @click="syncAnteWithBigBlind">BB와 동일</button>
        </div>
      </div>

      <div class="form-field">
        <label class="form-label" for="buyIn">바인 금액 <span>선택</span></label>
        <div class="text-field text-field--currency">
          <input
            id="buyIn"
            :value="form.buyIn"
            inputmode="numeric"
            placeholder="예) 100,000"
            @input="updateNumberField('buyIn', $event)"
          />
        </div>
      </div>
    </form>

    <div class="create-info">
      <q-icon name="info" size="24px" />
      <p>
        <strong>입력은 언제든 수정할 수 있어요</strong><br />생성 후에도 대회 설정은 수정할 수
        있습니다.
      </p>
    </div>

    <q-dialog v-model="venueOpen" position="bottom" @hide="handleVenuePickerHide">
      <div class="venue-picker-sheet">
        <div class="venue-picker-sheet__handle" aria-hidden="true"></div>
        <h2>장소 선택</h2>

        <div class="venue-picker-sheet__list">
          <button
            v-for="venue in venues"
            :key="venue.id"
            type="button"
            :aria-selected="selectedVenue?.id === venue.id"
            @click="selectVenue(venue)"
          >
            <span>{{ venue.name }}</span>
            <q-icon v-if="selectedVenue?.id === venue.id" name="check" size="22px" />
          </button>
        </div>

        <div class="venue-picker-sheet__footer">
          <button type="button" @click="openVenueCreateSheet">
            <q-icon name="add" size="20px" />
            <span>새 매장 추가</span>
          </button>
        </div>
      </div>
    </q-dialog>

    <q-dialog v-model="showVenueSheet" position="bottom">
      <div class="venue-sheet">
        <h2>매장 추가</h2>

        <label class="form-label" for="venueName">매장명 <span>필수</span></label>
        <div class="text-field">
          <input
            id="venueName"
            v-model="venueForm.name"
            maxlength="50"
            placeholder="예) Prime 강남"
          />
          <span>{{ venueForm.name.length }}/50</span>
        </div>

        <label class="form-label" for="venueArea">지역 <em>(선택)</em></label>
        <div class="text-field">
          <input
            id="venueArea"
            v-model="venueForm.area"
            maxlength="50"
            placeholder="예) 서울 강남구"
          />
          <span>{{ venueForm.area.length }}/50</span>
        </div>

        <div class="venue-sheet__actions">
          <AppButton label="취소" variant="secondary" block @click="showVenueSheet = false" />
          <AppButton label="추가" block :loading="venueSaving" @click="addVenue" />
        </div>
      </div>
    </q-dialog>
    <StickyPrimaryAction
      label="대회 생성"
      :loading="submitting"
      loading-label="생성 중..."
      @click="submitTournament"
    />
  </q-page>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'

import AppButton from 'src/shared/components/AppButton.vue'
import StickyPrimaryAction from 'src/shared/components/StickyPrimaryAction.vue'
import { useAlert } from 'src/composables/useAlert'
import { useHandLogStore } from 'src/stores/handLog'
import { useVenueStore } from 'src/stores/venue'
import { createGameSession } from 'src/api/gameSession'
import { deleteHandLogEvent } from 'src/api/handLogApi'
import { formatLocalDate } from 'src/utils/localDate'

const router = useRouter()
const alert = useAlert()
const handLogStore = useHandLogStore()
const venueStore = useVenueStore()
const { venues, loading: venueLoading } = storeToRefs(venueStore)
const venueOpen = ref(false)
const openVenueCreateAfterPicker = ref(false)
const showVenueSheet = ref(false)
const venueSaving = ref(false)
const selectedVenue = ref(null)
const anteManuallyEdited = ref(false)
const submitting = ref(false)

const form = reactive({
  name: '',
  startingStack: '',
  startLevel: '1',
  smallBlind: '100',
  bigBlind: '200',
  ante: '200',
  buyIn: '',
})

const venueForm = reactive({
  name: '',
  area: '',
})

const selectVenue = (venue) => {
  selectedVenue.value = venue
  venueOpen.value = false
}

const openVenueCreateSheet = () => {
  openVenueCreateAfterPicker.value = true
  venueOpen.value = false
}

const handleVenuePickerHide = () => {
  if (!openVenueCreateAfterPicker.value) return
  openVenueCreateAfterPicker.value = false
  showVenueSheet.value = true
}

const formatNumber = (value) => {
  const digits = String(value ?? '').replace(/\D/g, '')
  return digits ? Number(digits).toLocaleString('ko-KR') : ''
}

const updateNumberField = (field, event) => {
  form[field] = formatNumber(event.target.value)
}

const updateBigBlind = (event) => {
  form.bigBlind = formatNumber(event.target.value)
  if (!anteManuallyEdited.value) {
    form.ante = form.bigBlind
  }
}

const updateAnte = (event) => {
  form.ante = formatNumber(event.target.value)
  anteManuallyEdited.value = true
}

const syncAnteWithBigBlind = () => {
  form.ante = form.bigBlind
  anteManuallyEdited.value = false
}

const addVenue = async () => {
  if (!venueForm.name.trim()) return
  if (venueSaving.value) return

  venueSaving.value = true
  try {
    const created = await venueStore.addVenue({
      name: venueForm.name.trim(),
      location: venueForm.area.trim(),
      notes: '',
      pointBalance: 0,
    })
    selectedVenue.value = created
    venueForm.name = ''
    venueForm.area = ''
    showVenueSheet.value = false
    venueOpen.value = false
  } catch (error) {
    if (error?.response?.data?.error?.code === 'CONFLICT') {
      alert.show('이미 등록된 장소명입니다. 다른 이름을 입력해주세요.', 'warning')
      return
    }
    alert.show('장소 등록 중 오류가 발생했습니다.', 'error')
  } finally {
    venueSaving.value = false
  }
}

onMounted(async () => {
  try {
    await venueStore.loadVenues()
    selectedVenue.value = venues.value[0] || null
  } catch {
    alert.show('장소 목록을 불러오지 못했습니다.', 'error')
  }
})

const parseNumber = (value) => {
  const normalized = String(value ?? '')
    .replaceAll(',', '')
    .trim()
  if (!normalized) return null
  const number = Number(normalized)
  return Number.isFinite(number) ? number : null
}

const submitTournament = async () => {
  if (submitting.value) return
  if (!form.name.trim()) {
    alert.show('대회명을 입력해 주세요.', 'warning')
    return
  }
  if (!form.smallBlind || !form.bigBlind || !form.ante) {
    alert.show('시작 블라인드와 앤티를 입력해 주세요.', 'warning')
    return
  }

  const levelNumber = String(form.startLevel).replace(/\D/g, '') || '1'
  const startLevel = `L${levelNumber}`
  const startBlinds = {
    smallBlind: form.smallBlind || null,
    bigBlind: form.bigBlind || null,
    ante: form.ante || null,
  }
  const playDate = formatLocalDate()
  const runningTournament = {
    name: form.name.trim() || '이름 없는 토너먼트',
    date: playDate,
    venueId: selectedVenue.value?.id || null,
    venueName: selectedVenue.value?.name || '',
    startLevel,
    currentLevel: startLevel,
    startBlinds,
    currentBlinds: { ...startBlinds },
    startingStack: form.startingStack || null,
    currentStack: form.startingStack || null,
    averageStack: null,
    buyIn: form.buyIn || null,
    totalBuyIns: 1,
    blinds:
      startBlinds.smallBlind && startBlinds.bigBlind
        ? `${startBlinds.smallBlind} / ${startBlinds.bigBlind}${startBlinds.ante ? ` (${startBlinds.ante})` : ''}`
        : null,
    currentBb: null,
    averageBb: null,
  }

  let createdEventId = null
  submitting.value = true
  try {
    const eventId = await handLogStore.createEvent({
      name: runningTournament.name,
      venueId: runningTournament.venueId,
      startingStack: parseNumber(form.startingStack),
      date: playDate,
    })
    if (!eventId) throw new Error('이벤트 생성에 실패했습니다.')
    createdEventId = eventId

    const firstLevel = await handLogStore.addBlindLevel(eventId, {
      levelNo: Number(levelNumber),
      smallBlind: parseNumber(form.smallBlind),
      bigBlind: parseNumber(form.bigBlind),
      ante: parseNumber(form.ante),
      startStack: parseNumber(form.startingStack),
      endStack: parseNumber(form.startingStack),
    })
    if (!firstLevel) throw new Error('시작 레벨 생성에 실패했습니다.')

    runningTournament.eventId = eventId
    runningTournament.currentBlindLevelId = firstLevel.id
    const session = await createGameSession({
      venueId: runningTournament.venueId,
      playDate,
      sessionType: runningTournament.venueId ? 'VENUE' : 'OTHER',
      gameType: 'TOURNAMENT',
      tournamentName: runningTournament.name,
      tournamentResult: null,
      startLevel,
      currentLevel: startLevel,
      buyInPerEntry: parseNumber(form.buyIn),
      entries: 1,
      discount: 0,
      prize: 0,
      satelliteAwarded: false,
      satelliteName: null,
      notes: '',
      gtdAmount: null,
      fieldEntries: null,
      isCollab: false,
      collabLabel: null,
      handLogEventId: eventId,
      tournamentStatus: 'RUNNING',
      startingStack: parseNumber(form.startingStack),
      currentStack: parseNumber(form.startingStack),
      averageStack: null,
      currentSmallBlind: parseNumber(form.smallBlind),
      currentBigBlind: parseNumber(form.bigBlind),
      currentAnte: parseNumber(form.ante),
      finalRank: null,
    })
    runningTournament.sessionId = session.id
    localStorage.setItem('pokerly-running-tournament', JSON.stringify(runningTournament))
    router.push({
      path: '/app/home',
      query: { running: '1' },
    })
  } catch {
    if (createdEventId) await deleteHandLogEvent(createdEventId).catch(() => null)
    alert.show('토너먼트를 생성하지 못했습니다.', 'error')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.tournament-create-page {
  display: grid;
  align-content: start;
  gap: 22px;
  min-height: 100%;
  padding: var(--v2-page-padding-top) var(--v2-page-padding-x)
    calc(104px + env(safe-area-inset-bottom));
}

.create-topbar {
  display: grid;
  grid-template-columns: 44px minmax(0, 1fr) 44px;
  align-items: center;
  min-height: var(--v2-detail-topbar-height);
}

.create-topbar__back {
  display: grid;
  width: 44px;
  height: 44px;
  place-items: center;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--v2-text-main);
}

.create-topbar h1 {
  margin: 0;
  color: var(--v2-text-main);
  font-size: 21px;
  font-weight: 650;
  line-height: 1.2;
  text-align: center;
}

.create-topbar + .create-intro {
  margin-top: -10px;
}

.create-intro h2 {
  margin: 0 0 18px;
  color: var(--v2-text-main);
  font-size: 26px;
  font-weight: 560;
  line-height: 1.25;
  letter-spacing: 0;
}

.create-intro p {
  margin: 0;
  color: var(--v2-text-main);
  font-size: 15px;
  font-weight: 430;
  line-height: 1.55;
}

.create-form {
  display: grid;
  gap: 20px;
}

.form-field {
  display: grid;
  gap: 8px;
}

.form-label {
  color: var(--v2-text-main);
  font-size: 14px;
  font-weight: 560;
  line-height: 1;
}

.form-label span,
.form-label em {
  display: inline-flex;
  margin-left: 6px;
  padding: 3px 7px;
  border-radius: 999px;
  background: var(--v2-primary-soft);
  color: var(--v2-primary);
  font-size: 10px;
  font-style: normal;
  font-weight: 520;
  vertical-align: 1px;
}

.text-field,
.select-field {
  min-height: 44px;
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-md);
  background: #ffffff;
  color: var(--v2-text-main);
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 12px;
}

.text-field:focus-within,
.select-field:focus {
  border-color: rgba(109, 69, 232, 0.45);
  outline: none;
}

.text-field input {
  min-width: 0;
  flex: 1;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--v2-text-main);
  font: inherit;
  font-size: 14px;
}

.text-field input::placeholder {
  color: #aaa5b8;
}

.text-field span,
.text-field strong,
.select-field .q-icon {
  flex: 0 0 auto;
  color: var(--v2-text-sub);
  font-size: 12px;
  font-weight: 430;
}

.select-field {
  width: 100%;
  justify-content: space-between;
  font: inherit;
  font-size: 14px;
  font-weight: 450;
  text-align: left;
}

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

.blind-fields {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.blind-field {
  min-width: 0;
  min-height: 58px;
  padding: 8px 10px;
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-md);
  background: #ffffff;
  display: grid;
  gap: 5px;
}

.blind-field:focus-within {
  border-color: rgba(109, 69, 232, 0.45);
}

.blind-field span {
  color: var(--v2-text-sub);
  font-size: 10px;
  font-weight: 520;
}

.blind-field input {
  width: 100%;
  min-width: 0;
  padding: 0;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--v2-text-main);
  font: inherit;
  font-size: 14px;
  font-weight: 520;
}

.ante-help {
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.ante-help button {
  flex: 0 0 auto;
  padding: 3px 0;
  border: 0;
  background: transparent;
  color: var(--v2-primary);
  font: inherit;
  font-size: 11px;
  font-weight: 560;
}

.create-info {
  padding: 18px;
  border-radius: var(--v2-radius-lg);
  background: var(--v2-primary-soft);
  color: var(--v2-text-main);
  display: grid;
  grid-template-columns: 24px minmax(0, 1fr);
  align-items: center;
  gap: 12px;
}

.create-info .q-icon {
  color: var(--v2-primary);
}

.create-info p {
  margin: 0;
  font-size: 13px;
  font-weight: 430;
  line-height: 1.5;
}

.create-info strong {
  font-weight: 560;
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

.venue-sheet {
  width: 100%;
  padding: 22px 20px calc(20px + env(safe-area-inset-bottom));
  border-radius: 18px 18px 0 0;
  background: #ffffff;
  display: grid;
  gap: 14px;
}

.venue-sheet h2 {
  margin: 0 0 4px;
  color: var(--v2-text-main);
  font-size: 17px;
  font-weight: 560;
  line-height: 1.2;
  text-align: center;
}

.venue-sheet__actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 4px;
}

@media (max-width: 420px) {
  .tournament-create-page {
    padding-top: var(--v2-page-padding-top);
  }

  .create-intro h2 {
    font-size: 24px;
  }
}
</style>
