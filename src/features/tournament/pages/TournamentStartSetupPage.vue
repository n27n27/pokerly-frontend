<template>
  <q-page class="start-setup-page">
    <header class="setup-topbar">
      <button class="setup-topbar__back" type="button" aria-label="뒤로 가기" @click="router.back()">
        <q-icon name="chevron_left" size="28px" />
      </button>
      <span aria-hidden="true"></span>
    </header>

    <section class="tournament-summary">
      <div class="tournament-summary__main">
        <div>
          <span>대회명</span>
          <strong>{{ selectedTournament.name }}</strong>
        </div>
        <div>
          <span>매장</span>
          <strong>{{ selectedTournament.venue }}</strong>
        </div>
      </div>

      <dl>
        <div>
          <dt>시작 스택</dt>
          <dd>{{ selectedTournament.stack }}</dd>
        </div>
        <div>
          <dt>바인 금액</dt>
          <dd>{{ selectedTournament.buyIn }}</dd>
        </div>
      </dl>
    </section>

    <form class="setup-form" @submit.prevent="startTournament">
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
    <StickyPrimaryAction label="토너먼트 시작" :loading="submitting" loading-label="시작 중..." @click="startTournament" />
  </q-page>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import StickyPrimaryAction from 'src/shared/components/StickyPrimaryAction.vue'
import { useAlert } from 'src/composables/useAlert'
import { useHandLogStore } from 'src/stores/handLog'
import { createGameSession, fetchGameSession } from 'src/api/gameSession'
import { deleteHandLogEvent } from 'src/api/handLogApi'
import { fetchVenue } from 'src/api/venue'
import { formatLocalDate } from 'src/utils/localDate'
import { tournamentDisplayName } from 'src/utils/tournamentName'

const route = useRoute()
const router = useRouter()
const alert = useAlert()
const handLogStore = useHandLogStore()
const levelOpen = ref(false)
const submitting = ref(false)

const sourceSession = ref(null)
const selectedTournament = reactive({ name: '-', venue: '-', stack: '', buyIn: '' })

const levels = ref([])

const form = reactive({
  level: 'L1',
  stack: '',
  buyIn: '',
})

onMounted(async () => {
  try {
    sourceSession.value = await fetchGameSession(route.query.presetId)
    const venue = sourceSession.value.venueId
      ? await fetchVenue(sourceSession.value.venueId).catch(() => null)
      : null
    Object.assign(selectedTournament, {
      name: tournamentDisplayName(sourceSession.value),
      venue:
        venue?.name ||
        sourceSession.value.collabLabel ||
        (sourceSession.value.sessionType === 'VENUE' ? '등록 장소' : '기타'),
      stack: Number(sourceSession.value.startingStack || 0).toLocaleString('ko-KR'),
      buyIn: Number(sourceSession.value.buyInPerEntry || 0).toLocaleString('ko-KR'),
    })
    const sourceEvent = sourceSession.value.handLogEventId
      ? await handLogStore.fetchEventDetail(sourceSession.value.handLogEventId)
      : null
    levels.value = [...(sourceEvent?.blindLevels || [])]
      .sort((a, b) => Number(a.levelNo || 0) - Number(b.levelNo || 0))
      .map((level) => `L${level.levelNo}`)
    const sourceStartLevel = sourceSession.value.startLevel || ''
    form.level = levels.value.includes(sourceStartLevel)
      ? sourceStartLevel
      : levels.value[0] || ''
    form.stack = selectedTournament.stack
    form.buyIn = selectedTournament.buyIn
  } catch {
    alert.show('기존 대회 정보를 불러오지 못했습니다.', 'error')
  }
})

const selectLevel = (level) => {
  form.level = level
  levelOpen.value = false
}

const parseNumber = (value) => {
  const normalized = String(value ?? '').replaceAll(',', '').trim()
  if (!normalized) return null
  const number = Number(normalized)
  return Number.isFinite(number) ? number : null
}

const startTournament = async () => {
  if (submitting.value) return
  if (!form.level) {
    alert.show('선택할 수 있는 블라인드 레벨이 없습니다.', 'warning')
    return
  }
  const startLevel = form.level
  const runningTournament = {
    name: selectedTournament.name,
    venueId: sourceSession.value?.venueId || null,
    venueName: selectedTournament.venue,
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
      startingStack: parseNumber(form.stack),
    })
    if (!eventId) throw new Error('이벤트 생성에 실패했습니다.')
    createdEventId = eventId

    let firstLevel
    if (sourceSession.value?.handLogEventId) {
      await handLogStore.copyBlindLevelsFromEvent(eventId, sourceSession.value.handLogEventId)
      const copiedEvent = await handLogStore.fetchEventDetail(eventId)
      firstLevel =
        copiedEvent?.blindLevels?.find(
          (level) => level.levelNo === (Number(String(startLevel).replace(/\D/g, '')) || 1),
        ) || copiedEvent?.blindLevels?.[0]
    } else {
      firstLevel = await handLogStore.addBlindLevel(eventId, {
        levelNo: Number(String(startLevel).replace(/\D/g, '')) || 1,
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
      venueId: sourceSession.value?.venueId || null,
      playDate: formatLocalDate(),
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

.tournament-summary {
  padding: 16px;
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-lg);
  background: rgba(241, 236, 255, 0.42);
  display: grid;
  gap: 14px;
}

.tournament-summary__main {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  align-content: center;
  min-width: 0;
}

.tournament-summary__main > div {
  display: grid;
  min-width: 0;
  gap: 7px;
}

.tournament-summary__main strong {
  overflow: hidden;
  color: var(--v2-text-main);
  font-size: 15px;
  font-weight: 560;
  line-height: 1.2;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tournament-summary__main span {
  color: var(--v2-text-sub);
  font-size: 12px;
  font-weight: 430;
  line-height: 1.2;
}

.tournament-summary dl {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin: 12px 0 0;
  padding-top: 14px;
  border-top: 1px solid rgba(109, 69, 232, 0.12);
}

.tournament-summary dt,
.tournament-summary dd {
  margin: 0;
}

.tournament-summary dt {
  color: var(--v2-text-sub);
  font-size: 12px;
  font-weight: 430;
  line-height: 1.3;
}

.tournament-summary dd {
  margin-top: 8px;
  color: var(--v2-text-main);
  font-size: 15px;
  font-weight: 520;
  line-height: 1.2;
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
  font-size: 17px;
  font-weight: 560;
  line-height: 1.2;
}

.setup-label em {
  color: var(--v2-text-sub);
  font-size: 13px;
  font-style: normal;
  font-weight: 430;
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
  gap: 6px;
  padding: 0 11px;
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
  font-size: 18px;
  font-weight: 520;
}

.text-field span {
  flex: 0 0 auto;
  color: var(--v2-text-main);
  font-size: 13px;
  font-weight: 430;
}

.select-field {
  width: 100%;
  justify-content: space-between;
  font: inherit;
  font-size: 16px;
  font-weight: 520;
  text-align: left;
}

.select-field .q-icon {
  color: var(--v2-text-main);
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
