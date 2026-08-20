<template>
  <q-page class="start-setup-page">
    <header class="setup-topbar">
      <button
        class="setup-topbar__back"
        type="button"
        aria-label="뒤로 가기"
        @click="router.back()"
      >
        <q-icon name="chevron_left" size="28px" />
      </button>
      <h1>대회 정보 확인</h1>
      <span aria-hidden="true"></span>
    </header>

    <form class="setup-form" @submit.prevent="startTournament">
      <div class="setup-card">
        <label class="setup-label" for="name">대회명<span>필수</span></label>
        <div class="text-field">
          <input
            id="name"
            v-model="form.name"
            maxlength="50"
            placeholder="예) Prime Daily"
            type="text"
          />
          <span>{{ form.name?.length }}/50</span>
        </div>
      </div>

      <div class="setup-card">
        <label class="setup-label" for="venue">매장</label>
        <button id="venue" class="select-field" type="button" @click="venueOpen = !venueOpen">
          <span>{{ form.venueName || '선택해 주세요' }}</span>
          <q-icon name="expand_more" size="24px" />
        </button>

        <div v-if="venueOpen" class="venue-list">
          <button
            v-for="venue in venues"
            :key="venue.id"
            class="venue-list__item"
            type="button"
            @click="selectVenue(venue)"
          >
            <span>{{ venue.name }}</span>
            <q-icon v-if="form.venueId === venue.id" name="check" size="20px" />
          </button>
          <button class="venue-list__add" type="button" @click="showVenueSheet = true">
            <q-icon name="add" size="20px" />
            <span>매장 추가</span>
          </button>
        </div>
      </div>

      <div class="setup-card">
        <label class="setup-label" for="startLevel">시작 레벨</label>
        <div class="text-field" :class="{ 'text-field--error': startLevelError }">
          <input
            id="startLevel"
            :value="form.level"
            inputmode="numeric"
            pattern="[0-9]*"
            placeholder="예: 1"
            aria-describedby="startLevelHelp"
            @input="updateStartLevel"
          />
        </div>
        <p
          v-if="startLevelError"
          id="startLevelHelp"
          class="field-help field-help--error"
        >
          {{ startLevelError }}
        </p>

        <div v-else-if="needsCustomStartLevel" class="custom-level">
          <p>
            L{{ Number(form.level) }} 블라인드 정보가 없습니다.<br />이번 대회에서 사용할
            블라인드를 입력해 주세요.
          </p>
          <div class="custom-level__fields">
            <label>
              <span>SB</span>
              <input
                :value="customLevel.smallBlind"
                inputmode="numeric"
                placeholder="예: 500"
                @input="setCustomLevelNumber('smallBlind', $event)"
              />
            </label>
            <label>
              <span>BB</span>
              <input
                :value="customLevel.bigBlind"
                inputmode="numeric"
                placeholder="예: 1,000"
                @input="updateCustomLevelBigBlind"
              />
            </label>
            <label>
              <span>앤티</span>
              <input
                :value="customLevel.ante"
                inputmode="numeric"
                placeholder="없으면 0"
                @input="updateCustomLevelAnte"
              />
            </label>
          </div>
          <p v-if="customLevelError" class="field-help field-help--error">
            {{ customLevelError }}
          </p>
        </div>
      </div>

      <div class="setup-card">
        <label class="setup-label" for="startingStack">시작 스택</label>
        <div class="text-field">
          <input id="startingStack" v-model="form.stack" inputmode="numeric" />
          <span>칩</span>
        </div>
      </div>

      <div class="setup-card">
        <label class="setup-label" for="buyIn">바인 금액</label>
        <div class="text-field">
          <input id="buyIn" v-model="form.buyIn" inputmode="numeric" />
        </div>
      </div>
    </form>
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
      label="토너먼트 시작"
      :loading="submitting"
      loading-label="시작 중..."
      @click="startTournament"
    />
  </q-page>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { createGameSession, fetchGameSession } from 'src/api/gameSession'
import { deleteHandLogEvent } from 'src/api/handLogApi'
import { fetchVenue } from 'src/api/venue'
import { useAlert } from 'src/composables/useAlert'
import AppButton from 'src/shared/components/AppButton.vue'
import StickyPrimaryAction from 'src/shared/components/StickyPrimaryAction.vue'
import { useHandLogStore } from 'src/stores/handLog'
import { useVenueStore } from 'src/stores/venue'
import { formatLocalDate } from 'src/utils/localDate'
import { tournamentDisplayName } from 'src/utils/tournamentName'

const route = useRoute()
const router = useRouter()
const alert = useAlert()
const handLogStore = useHandLogStore()
const venueStore = useVenueStore()
const { venues } = storeToRefs(venueStore)

const venueOpen = ref(false)
const submitting = ref(false)
const showVenueSheet = ref(false)
const venueSaving = ref(false)
const sourceSession = ref(null)
const sourceLevelsLoaded = ref(false)
const levels = ref([])
const customLevelError = ref('')
const customAnteManuallyEdited = ref(false)

const form = reactive({
  name: '',
  venueId: null,
  venueName: '',
  level: '1',
  stack: '',
  buyIn: '',
})

const venueForm = reactive({
  name: '',
  area: '',
})

const customLevel = reactive({
  smallBlind: '',
  bigBlind: '',
  ante: '',
})

const parseNumber = (value) => {
  const normalized = String(value ?? '')
    .replaceAll(',', '')
    .trim()
  if (!normalized) return null

  const number = Number(normalized)
  return Number.isFinite(number) ? number : null
}

const formatNumber = (value) => {
  const number = parseNumber(value)
  return number === null ? '' : number.toLocaleString('ko-KR')
}

const levelNumber = (level) => Number(String(level).replace(/\D/g, '')) || 1

const startLevelError = computed(() => {
  if (!form.level) return '시작 레벨을 입력해 주세요.'

  const value = Number(form.level)
  if (!Number.isInteger(value) || value < 1) return '1 이상의 숫자를 입력해 주세요.'
  return ''
})

const needsCustomStartLevel = computed(
  () =>
    sourceLevelsLoaded.value &&
    !startLevelError.value &&
    !levels.value.includes(`L${Number(form.level)}`),
)

const updateStartLevel = (event) => {
  const nextLevel = event.target.value.replace(/\D/g, '')
  if (nextLevel !== form.level) {
    Object.assign(customLevel, { smallBlind: '', bigBlind: '', ante: '' })
    customAnteManuallyEdited.value = false
  }
  form.level = nextLevel
  customLevelError.value = ''
}

const setCustomLevelNumber = (field, event) => {
  customLevel[field] = formatNumber(event.target.value)
  customLevelError.value = ''
}

const updateCustomLevelBigBlind = (event) => {
  customLevel.bigBlind = formatNumber(event.target.value)
  if (!customAnteManuallyEdited.value) customLevel.ante = customLevel.bigBlind
  customLevelError.value = ''
}

const updateCustomLevelAnte = (event) => {
  customLevel.ante = formatNumber(event.target.value)
  customAnteManuallyEdited.value = true
  customLevelError.value = ''
}

const resetVenueForm = () => {
  venueForm.name = ''
  venueForm.area = ''
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

    selectVenue(created)
    resetVenueForm()
    showVenueSheet.value = false
    alert.show('매장이 추가되었습니다.', 'success')
  } catch (error) {
    if (error?.response?.data?.error?.code === 'CONFLICT') {
      alert.show('이미 등록된 매장명입니다. 다른 이름을 입력해 주세요.', 'warning')
      return
    }
    alert.show('매장 등록 중 오류가 발생했습니다.', 'error')
  } finally {
    venueSaving.value = false
  }
}

const loadPreset = async () => {
  const presetId = route.query.presetId
  if (!presetId) throw new Error('프리셋 ID가 없습니다.')

  const session = await fetchGameSession(presetId)
  sourceSession.value = session

  const [venue, sourceEvent] = await Promise.all([
    session.venueId ? fetchVenue(session.venueId).catch(() => null) : null,
    session.handLogEventId
      ? handLogStore.fetchEventDetail(session.handLogEventId)
      : null,
  ])

  levels.value = [...(sourceEvent?.blindLevels || [])]
    .sort((a, b) => Number(a.levelNo || 0) - Number(b.levelNo || 0))
    .map((level) => `L${level.levelNo}`)
  sourceLevelsLoaded.value = true

  Object.assign(form, {
    name: tournamentDisplayName(session),
    venueId: session.venueId || null,
    venueName:
      venue?.name ||
      session.collabLabel ||
      (session.sessionType === 'VENUE' ? '등록 매장' : '기타'),
    level: levels.value.length ? '1' : '',
    stack: formatNumber(session.startingStack),
    buyIn: formatNumber(session.buyInPerEntry),
  })
}

onMounted(async () => {
  const [venueResult, presetResult] = await Promise.allSettled([
    venueStore.loadVenues(),
    loadPreset(),
  ])

  if (venueResult.status === 'rejected') {
    alert.show('매장 목록을 불러오지 못했습니다.', 'error')
  }
  if (presetResult.status === 'rejected') {
    alert.show('기존 대회 정보를 불러오지 못했습니다.', 'error')
  }
})

const selectVenue = (venue) => {
  form.venueId = venue.id
  form.venueName = venue.name
  venueOpen.value = false
}

const startTournament = async () => {
  if (submitting.value) return

  if (!form.name.trim()) {
    alert.show('대회명을 입력해 주세요.', 'warning')
    return
  }
  if (startLevelError.value) {
    return
  }
  customLevelError.value = ''
  if (needsCustomStartLevel.value) {
    const smallBlind = parseNumber(customLevel.smallBlind)
    const bigBlind = parseNumber(customLevel.bigBlind)
    if (smallBlind === null || smallBlind < 0 || bigBlind === null || bigBlind <= 0) {
      customLevelError.value = 'SB와 BB를 올바르게 입력해 주세요.'
      return
    }
  }
  const startLevel = `L${Number(form.level)}`
  const playDate = formatLocalDate()
  const runningTournament = {
    name: form.name.trim(),
    date: playDate,
    venueId: form.venueId,
    venueName: form.venueName,
    startLevel,
    currentLevel: startLevel,
    startingStack: form.stack || null,
    currentStack: form.stack || null,
    averageStack: null,
    buyIn: form.buyIn || null,
    totalBuyIns: 1,
    blinds: null,
    currentBb: null,
    averageBb: null,
  }

  let createdEventId = null
  submitting.value = true
  try {
    const eventId = await handLogStore.createEvent({
      name: runningTournament.name,
      venueId: runningTournament.venueId,
      startingStack: parseNumber(form.stack),
      date: playDate,
    })
    if (!eventId) throw new Error('이벤트 생성에 실패했습니다.')
    createdEventId = eventId

    let firstLevel
    if (sourceSession.value?.handLogEventId) {
      await handLogStore.copyBlindLevelsFromEvent(eventId, sourceSession.value.handLogEventId)
      const copiedEvent = await handLogStore.fetchEventDetail(eventId)
      firstLevel =
        copiedEvent?.blindLevels?.find((level) => level.levelNo === levelNumber(startLevel))
      if (!firstLevel) {
        firstLevel = await handLogStore.addBlindLevel(eventId, {
          levelNo: levelNumber(startLevel),
          smallBlind: parseNumber(customLevel.smallBlind),
          bigBlind: parseNumber(customLevel.bigBlind),
          ante: parseNumber(customLevel.ante) || 0,
          startStack: parseNumber(form.stack),
          endStack: parseNumber(form.stack),
        })
      }
    } else {
      firstLevel = await handLogStore.addBlindLevel(eventId, {
        levelNo: levelNumber(startLevel),
        smallBlind: 0,
        bigBlind: 0,
        ante: 0,
        startStack: parseNumber(form.stack),
        endStack: parseNumber(form.stack),
      })
    }
    if (!firstLevel) throw new Error('시작 레벨 생성에 실패했습니다.')

    runningTournament.eventId = eventId
    runningTournament.currentBlindLevelId = firstLevel.id
    const session = await createGameSession({
      venueId: runningTournament.venueId || null,
      playDate,
      sessionType: sourceSession.value?.sessionType || 'OTHER',
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
      notes: '',
      isCollab: Boolean(sourceSession.value?.isCollab),
      collabLabel: sourceSession.value?.collabLabel || null,
      handLogEventId: eventId,
      tournamentStatus: 'RUNNING',
      startingStack: parseNumber(form.stack),
      currentStack: parseNumber(form.stack),
      currentSmallBlind: firstLevel.smallBlind,
      currentBigBlind: firstLevel.bigBlind,
      currentAnte: firstLevel.ante,
    })
    runningTournament.sessionId = session.id
    localStorage.setItem('pokerly-running-tournament', JSON.stringify(runningTournament))
    router.push({
      path: '/app/home',
      query: { running: '1' },
    })
  } catch {
    if (createdEventId) await deleteHandLogEvent(createdEventId).catch(() => null)
    alert.show('토너먼트를 시작하지 못했습니다.', 'error')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.start-setup-page {
  display: grid;
  align-content: start;
  gap: 12px;
  min-height: 100%;
  padding: var(--v2-page-padding-top) var(--v2-page-padding-x) 180px;
}

.setup-topbar {
  display: grid;
  grid-template-columns: 44px minmax(0, 1fr) 44px;
  align-items: center;
  min-height: var(--v2-detail-topbar-height);
}

.setup-topbar__back {
  display: grid;
  width: 44px;
  height: 44px;
  place-items: center;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--v2-text-main);
}

.setup-topbar h1 {
  margin: 0;
  color: var(--v2-text-main);
  font-size: 21px;
  font-weight: 650;
  line-height: 1.2;
  text-align: center;
}

.setup-form {
  display: grid;
  gap: 14px;
}

.setup-card {
  display: grid;
  gap: 10px;
  padding: 14px;
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-lg);
  background: #ffffff;
  box-shadow: 0 6px 18px rgba(28, 18, 60, 0.03);
}

.setup-label {
  color: var(--v2-text-main);
  font-size: 14px;
  font-weight: 560;
  line-height: 1;
}

.setup-label span,
.setup-label em {
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
  background: #fff;
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

.text-field--error {
  border-color: var(--v2-danger);
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

.field-help {
  margin: -2px 2px 0;
  color: var(--v2-text-sub);
  font-size: 11px;
  font-weight: 430;
  line-height: 1.35;
}

.field-help--error {
  color: var(--v2-danger);
}

.custom-level {
  display: grid;
  gap: 10px;
  padding-top: 2px;
}

.custom-level > p:first-child {
  margin: 0;
  color: var(--v2-text-sub);
  font-size: 12px;
  font-weight: 430;
  line-height: 1.45;
}

.custom-level__fields {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.custom-level__fields label {
  display: grid;
  gap: 6px;
}

.custom-level__fields label > span {
  color: var(--v2-text-sub);
  font-size: 11px;
  font-weight: 520;
}

.custom-level__fields input {
  width: 100%;
  min-width: 0;
  min-height: 40px;
  padding: 0 10px;
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-sm);
  outline: 0;
  background: #fff;
  color: var(--v2-text-main);
  font: inherit;
  font-size: 13px;
}

.custom-level__fields input:focus {
  border-color: rgba(109, 69, 232, 0.45);
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

.venue-list {
  overflow: hidden;
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-md);
  background: #fff;
}

.venue-list__item,
.venue-list__add {
  width: 100%;
  min-height: 44px;
  padding: 0 14px;
  border: 0;
  border-bottom: 1px solid var(--v2-border);
  background: transparent;
  color: var(--v2-text-main);
  display: flex;
  align-items: center;
  justify-content: space-between;
  font: inherit;
  font-size: 14px;
  font-weight: 430;
  text-align: left;
}

.venue-list__item .q-icon,
.venue-list__add {
  color: var(--v2-primary);
}

.venue-list__add {
  justify-content: flex-start;
  gap: 8px;
  border-bottom: 0;
  font-weight: 520;
}

.venue-sheet {
  width: 100%;
  padding: 22px 20px calc(20px + env(safe-area-inset-bottom));
  border-radius: 18px 18px 0 0;
  background: #fff;
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
  .start-setup-page {
    padding-top: var(--v2-page-padding-top);
  }
}
</style>
