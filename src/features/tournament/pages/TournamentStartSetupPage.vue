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
        <button id="startLevel" class="select-field" type="button" @click="levelOpen = !levelOpen">
          <span>{{ form.level }}</span>
          <q-icon name="expand_more" size="24px" />
        </button>

        <div v-if="levelOpen" class="level-list">
          <button v-for="level in levels" :key="level" type="button" @click="selectLevel(level)">
            <span>{{ level }}</span>
            <q-icon v-if="form.level === level" name="check" size="20px" />
          </button>
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
import { onMounted, reactive, ref } from 'vue'
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
const levelOpen = ref(false)
const submitting = ref(false)
const showVenueSheet = ref(false)
const venueSaving = ref(false)
const sourceSession = ref(null)
const levels = ref([])

const form = reactive({
  name: '',
  venueId: null,
  venueName: '',
  level: 'L1',
  stack: '',
  buyIn: '',
})

const venueForm = reactive({
  name: '',
  area: '',
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

  const sourceStartLevel = session.startLevel || ''
  Object.assign(form, {
    name: tournamentDisplayName(session),
    venueId: session.venueId || null,
    venueName:
      venue?.name ||
      session.collabLabel ||
      (session.sessionType === 'VENUE' ? '등록 매장' : '기타'),
    level: levels.value.includes(sourceStartLevel) ? sourceStartLevel : levels.value[0] || '',
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

const selectLevel = (level) => {
  form.level = level
  levelOpen.value = false
}

const startTournament = async () => {
  if (submitting.value) return

  if (!form.name.trim()) {
    alert.show('대회명을 입력해 주세요.', 'warning')
    return
  }
  if (!form.level) {
    alert.show('선택할 수 있는 블라인드 레벨이 없습니다.', 'warning')
    return
  }
  const startLevel = form.level
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
        copiedEvent?.blindLevels?.find(
          (level) => level.levelNo === levelNumber(startLevel),
        ) || copiedEvent?.blindLevels?.[0]
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
  grid-template-columns: 40px minmax(0, 1fr) 40px;
  align-items: start;
  min-height: 30px;
}

.setup-topbar__back {
  width: 32px;
  height: 32px;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--v2-text-main);
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

.level-list {
  overflow: hidden;
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-md);
  background: #ffffff;
}

.level-list button {
  width: 100%;
  min-height: 42px;
  padding: 0 12px;
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
}

.level-list button:last-child {
  border-bottom: 0;
}

.level-list .q-icon {
  color: var(--v2-primary);
}
@media (max-width: 420px) {
  .start-setup-page {
    padding-top: var(--v2-page-padding-top);
  }
}
</style>
