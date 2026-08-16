<template>
  <q-page class="running-page" @click="showLevelMenu = false">
    <header class="running-topbar">
      <button class="running-topbar__back" type="button" aria-label="뒤로 가기" @click="goBack">
        <q-icon name="chevron_left" size="28px" />
      </button>
      <h1>진행 중 토너먼트</h1>
      <button
        class="running-topbar__copy"
        type="button"
        aria-label="대회 전체 복기 텍스트 복사"
        :disabled="!event"
        @click="copyTournamentText"
      >
        <q-icon name="content_copy" size="19px" />
      </button>
    </header>

    <section class="running-summary">
      <div class="running-summary__main">
        <div>
          <strong>{{ tournamentName }}</strong>
          <p>
            바인 {{ runningTournament.buyIn || '-' }} <span>·</span> 총 바인 {{ totalBuyIns }}회
          </p>
        </div>

        <button class="manage-link" type="button" @click="openManage">
          <q-icon name="settings" size="18px" />
          대회 관리
        </button>
      </div>
    </section>

    <section class="level-section">
      <div class="level-section__header">
        <h2>레벨 목록</h2>
        <button type="button" @click="openLevelSheet()">
          <q-icon name="add" size="19px" />
          레벨 추가
        </button>
      </div>

      <div class="level-list">
        <article
          v-if="currentLevel"
          class="current-level-card"
          role="button"
          tabindex="0"
          @click="openLevel(currentLevel)"
        >
          <div class="current-level-card__accent"></div>
          <button
            class="level-menu-button"
            type="button"
            aria-label="레벨 메뉴"
            @click.stop="showLevelMenu = !showLevelMenu"
          >
            <q-icon name="more_vert" size="22px" />
          </button>
          <div v-if="showLevelMenu" class="level-menu" @click.stop>
            <button type="button" @click.stop="openLevelSheet(currentLevel)">수정</button>
            <button class="danger" type="button" @click.stop="requestRemoveLevel(currentLevel)">
              삭제
            </button>
          </div>

          <div class="current-level-card__head">
            <strong>{{ currentLevel.name }}</strong>
            <span>{{ currentLevel.blinds }}</span>
          </div>

          <div class="current-level-card__body">
            <div>
              <span>현재 스택</span>
              <strong :title="currentLevel.endStack">{{ formatCompactStack(currentLevel.endStack) }}</strong>
              <em>{{ currentLevel.bb }}</em>
            </div>
            <div>
              <span>평균 스택</span>
              <strong :title="currentLevel.averageStack">{{ formatCompactStack(currentLevel.averageStack) }}</strong>
              <em>{{ currentLevel.averageBb }}</em>
            </div>
            <div>
              <span>핸드 수</span>
              <strong>{{ currentLevel.hands }}</strong>
            </div>
          </div>
        </article>

        <button
          v-for="level in otherLevels"
          :key="level.id"
          class="level-row"
          type="button"
          @click="openLevel(level)"
        >
          <strong class="level-row__level">{{ level.name }}</strong>
          <span class="level-row__content">
            <span class="level-row__blinds">{{ level.blinds }}</span>
            <span class="level-row__bottom">
              <span class="level-row__metric">
                <small>핸드 수</small>
                <b>{{ level.hands }}</b>
              </span>
              <span class="level-row__stack">
                <small>스택</small>
                <b>{{ formatCompactStack(level.endStack) }}</b>
              </span>
            </span>
          </span>
          <span
            class="level-row__menu"
            role="button"
            aria-label="레벨 수정"
            @click.stop="openLevelSheet(level)"
          >
            <q-icon name="more_vert" size="22px" />
          </span>
        </button>

        <div v-if="!loading && levels.length === 0" class="level-list__empty">
          등록된 레벨이 없습니다.
        </div>
      </div>
    </section>

    <TournamentHandOverview
      v-if="!loading && levels.length"
      :hands="tournamentHands"
      title="대회 요약"
      @open-hand="openSummaryHand"
    />

    <StickyPrimaryAction label="토너먼트 종료" @click="openFinish" />

    <q-dialog v-model="levelSheetOpen" position="bottom">
      <q-card class="level-sheet">
        <div class="level-sheet__handle" aria-hidden="true"></div>
        <h2>{{ editingLevelId ? '레벨 수정' : '레벨 추가' }}</h2>

        <label>
          <span>레벨</span>
          <input v-model="levelForm.levelNo" inputmode="numeric" />
        </label>

        <div class="level-sheet__blinds">
          <label>
            <span>SB</span>
            <input
              :value="levelForm.smallBlind"
              inputmode="numeric"
              @input="setLevelNumber('smallBlind', $event)"
            />
          </label>
          <label>
            <span>BB</span>
            <input :value="levelForm.bigBlind" inputmode="numeric" @input="updateLevelBigBlind" />
          </label>
          <label>
            <span>Ante</span>
            <input :value="levelForm.ante" inputmode="numeric" @input="updateLevelAnte" />
          </label>
        </div>

        <div v-if="editingLevelId && editingIsCurrent" class="level-sheet__current-status">
          현재 진행 중인 레벨
        </div>
        <label v-else-if="editingLevelId" class="level-sheet__current">
          <input v-model="levelForm.makeCurrent" type="checkbox" />
          <span>진행 레벨로 전환</span>
        </label>

        <div class="level-sheet__actions">
          <button
            class="level-sheet__save"
            type="button"
            :disabled="handLogStore.saving"
            @click="saveLevel"
          >
            {{ handLogStore.saving ? '저장 중...' : '저장' }}
          </button>
        </div>
      </q-card>
    </q-dialog>

    <q-dialog v-model="deleteConfirmOpen">
      <div class="delete-confirm" @click.stop>
        <h2>레벨을 삭제할까요?</h2>
        <p>삭제한 레벨은 다시 복구할 수 없습니다.</p>
        <div>
          <button type="button" @click="deleteConfirmOpen = false">취소</button>
          <button class="danger" type="button" @click="removeLevel">삭제</button>
        </div>
      </div>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { computed, nextTick, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useAlert } from 'src/composables/useAlert'
import TournamentHandOverview from 'src/features/tournament/components/TournamentHandOverview.vue'
import StickyPrimaryAction from 'src/shared/components/StickyPrimaryAction.vue'
import { useHandLogStore } from 'src/stores/handLog'
import { fetchRunningGameSession, updateGameSession } from 'src/api/gameSession'
import { formatLocalDate } from 'src/utils/localDate'
import { buildEventReviewText } from 'src/utils/handLogExportText'
import { fetchTournamentSeats } from 'src/api/tournamentParticipant'
import { copyToClipboard } from 'src/utils/copyToClipboard'

const router = useRouter()
const route = useRoute()
const alert = useAlert()
const handLogStore = useHandLogStore()
const runningTournament = reactive(
  (() => {
    try {
      return JSON.parse(localStorage.getItem('pokerly-running-tournament')) || {}
    } catch {
      return {}
    }
  })(),
)
const totalBuyIns = computed(() => runningTournament.totalBuyIns ?? runningTournament.entries ?? 1)
const event = computed(() => handLogStore.selectedEvent)
const loading = computed(() => handLogStore.detailLoading)
// GameSession is the canonical tournament record. HandLogEvent keeps a copy of the
// name for hand-log screens, so it can temporarily lag behind an edited session.
const tournamentName = computed(() => runningTournament.name || event.value?.name || '-')
const tournamentSeats = ref([])

const copyTournamentText = async () => {
  if (!event.value) return
  try {
    await copyToClipboard(buildEventReviewText(event.value, { seats: tournamentSeats.value }))
    alert.show('대회 전체 복기 텍스트를 복사했습니다.', 'success')
  } catch {
    alert.show('텍스트를 복사하지 못했습니다.', 'error')
  }
}

const formatValue = (value) =>
  value === null || value === undefined ? '-' : Number(value).toLocaleString('ko-KR')
const formatBlind = (value) => (Number(value) > 0 ? formatValue(value) : '-')

const currentLevelNumber = computed(() => {
  const value = String(runningTournament.currentLevel || runningTournament.startLevel || '')
  const number = Number(value.replace(/\D/g, ''))
  return Number.isFinite(number) && number > 0 ? number : null
})

const levels = computed(() => {
  let previousStack =
    parseStoredNumber(event.value?.startingStack) ??
    parseStoredNumber(runningTournament.startingStack)

  return [...(event.value?.blindLevels || [])]
    .sort((a, b) => Number(a.levelNo || 0) - Number(b.levelNo || 0))
    .map((level) => {
      const isCurrent = runningTournament.currentBlindLevelId
        ? String(level.id) === String(runningTournament.currentBlindLevelId)
        : level.levelNo === currentLevelNumber.value
      const storedStack = level.endStack ?? level.displayStartStack ?? level.startStack
      const sessionStack = isCurrent ? parseStoredNumber(runningTournament.currentStack) : null
      const stack = sessionStack ?? storedStack ?? previousStack
      const bbCount = stack != null && level.bigBlind > 0 ? stack / level.bigBlind : null
      const levelAverageStack = parseStoredNumber(level.averageStack)
      const sessionAverageStack = isCurrent
        ? parseStoredNumber(runningTournament.averageStack)
        : null
      const averageStack = levelAverageStack ?? sessionAverageStack
      const averageBbCount =
        averageStack != null && level.bigBlind > 0 ? averageStack / level.bigBlind : null
      const row = {
        id: level.id,
        name: `L${level.levelNo}`,
        blinds: [level.smallBlind, level.bigBlind, level.ante].map(formatBlind).join(' / '),
        hands: String(level.handCount ?? level.hands?.length ?? 0),
        rawStack: stack,
        endStack: formatValue(stack),
        bb:
          bbCount == null ? '-' : `${Number.isInteger(bbCount) ? bbCount : bbCount.toFixed(1)} BB`,
        averageStack: formatValue(averageStack),
        averageBb:
          averageBbCount == null
            ? '-'
            : `${Number.isInteger(averageBbCount) ? averageBbCount : averageBbCount.toFixed(1)} BB`,
        current: isCurrent,
      }

      if (stack != null) previousStack = Number(stack)
      return row
    })
})

const currentLevel = computed(() => levels.value.find((level) => level.current) || null)
const otherLevels = computed(() =>
  levels.value.filter((level) => !currentLevel.value || level.id !== currentLevel.value.id),
)
const tournamentHands = computed(() =>
  (event.value?.blindLevels || []).flatMap((level) =>
    (level.hands || []).map((hand) => ({
      ...hand,
      __levelId: level.id,
      __levelNo: level.levelNo,
      __levelLabel: `L${level.levelNo}`,
    })),
  ),
)
const showLevelMenu = ref(false)
const levelSheetOpen = ref(false)
const editingLevelId = ref(null)
const editingIsCurrent = computed(
  () =>
    editingLevelId.value &&
    runningTournament.currentBlindLevelId &&
    String(editingLevelId.value) === String(runningTournament.currentBlindLevelId),
)
const deleteConfirmOpen = ref(false)
const deletingLevel = ref(null)
const levelAnteManuallyEdited = ref(false)
const activateNewLevelAfterSave = ref(false)
const levelForm = reactive({
  levelNo: '',
  smallBlind: '',
  bigBlind: '',
  ante: '',
  makeCurrent: false,
})

const formatCompactStack = (value) => {
  if (!value || value === '-') return '-'

  const number = Number(String(value).replaceAll(',', ''))
  if (!Number.isFinite(number) || number < 1000) return value

  if (number >= 1000000) {
    const millions = number / 1000000
    return `${millions >= 10 ? millions.toFixed(1) : millions.toFixed(2)}M`.replace(/\.0+(?=M$)/, '')
  }

  const thousands = number / 1000
  return `${Number.isInteger(thousands) ? thousands : thousands.toFixed(1)}K`
}

const parseStoredNumber = (value) => {
  const normalized = String(value ?? '')
    .replaceAll(',', '')
    .trim()
  if (!normalized) return null
  const number = Number(normalized)
  return Number.isFinite(number) ? number : null
}

const formatInputNumber = (value) => {
  const digits = String(value ?? '').replace(/\D/g, '')
  return digits ? Number(digits).toLocaleString('ko-KR') : ''
}

const persistRunningSession = async () => {
  if (!runningTournament.sessionId) return
  const blinds = runningTournament.currentBlinds || {}
  await updateGameSession(runningTournament.sessionId, {
    venueId: runningTournament.venueId || null,
    playDate: runningTournament.date?.replaceAll('.', '-') || formatLocalDate(),
    sessionType: runningTournament.venueId ? 'VENUE' : 'OTHER',
    gameType: 'TOURNAMENT',
    tournamentName: runningTournament.name,
    tournamentResult: null,
    startLevel: runningTournament.startLevel,
    currentLevel: runningTournament.currentLevel,
    buyInPerEntry: parseStoredNumber(runningTournament.buyIn),
    entries: runningTournament.totalBuyIns || 1,
    discount: parseStoredNumber(runningTournament.discountAmount) || 0,
    prize: 0,
    satelliteAwarded: false,
    notes: runningTournament.memo || '',
    handLogEventId: runningTournament.eventId,
    tournamentStatus: 'RUNNING',
    startingStack: parseStoredNumber(runningTournament.startingStack),
    currentStack: parseStoredNumber(runningTournament.currentStack),
    averageStack: parseStoredNumber(runningTournament.averageStack),
    currentSmallBlind: parseStoredNumber(blinds.smallBlind),
    currentBigBlind: parseStoredNumber(blinds.bigBlind),
    currentAnte: parseStoredNumber(blinds.ante),
  })
}

const getBackendLevel = (levelId) =>
  event.value?.blindLevels?.find((level) => String(level.id) === String(levelId)) || null

const setLevelNumber = (field, inputEvent) => {
  levelForm[field] = formatInputNumber(inputEvent.target.value)
}

const updateLevelBigBlind = (inputEvent) => {
  levelForm.bigBlind = formatInputNumber(inputEvent.target.value)
  if (!levelAnteManuallyEdited.value) levelForm.ante = levelForm.bigBlind
}

const updateLevelAnte = (inputEvent) => {
  levelForm.ante = formatInputNumber(inputEvent.target.value)
  levelAnteManuallyEdited.value = true
}

const openLevelSheet = (level = null, requestedLevelNo = null, activateAfterSave = false) => {
  const source = level ? getBackendLevel(level.id) : null
  const nextLevelNo = requestedLevelNo
    ? Number(requestedLevelNo)
    : Math.max(0, ...(event.value?.blindLevels || []).map((item) => Number(item.levelNo) || 0)) + 1

  editingLevelId.value = source?.id || null
  activateNewLevelAfterSave.value = !source && activateAfterSave
  Object.assign(levelForm, {
    levelNo: String(source?.levelNo ?? nextLevelNo),
    smallBlind: formatInputNumber(source?.smallBlind),
    bigBlind: formatInputNumber(source?.bigBlind),
    ante: formatInputNumber(source?.ante),
    makeCurrent: Boolean(
      source &&
        runningTournament.currentBlindLevelId &&
        String(source.id) === String(runningTournament.currentBlindLevelId),
    ),
  })
  levelAnteManuallyEdited.value = Boolean(source && source.ante !== source.bigBlind)
  showLevelMenu.value = false
  levelSheetOpen.value = true
}

const saveLevel = async () => {
  const eventId = runningTournament.eventId
  if (!eventId || !levelForm.levelNo || !levelForm.smallBlind || !levelForm.bigBlind) {
    alert.show('레벨과 블라인드를 입력해 주세요.', 'warning')
    return
  }

  try {
    let saved
    if (editingLevelId.value) {
      await handLogStore.updateBlindLevelStructure(eventId, editingLevelId.value, {
        levelNo: Number(levelForm.levelNo),
        smallBlind: parseStoredNumber(levelForm.smallBlind),
        bigBlind: parseStoredNumber(levelForm.bigBlind),
        ante: parseStoredNumber(levelForm.ante),
      })
      saved = await handLogStore.updateBlindLevelInfo(eventId, editingLevelId.value, {
        startStack: getBackendLevel(editingLevelId.value)?.startStack,
        endStack: getBackendLevel(editingLevelId.value)?.endStack,
        averageStack: getBackendLevel(editingLevelId.value)?.averageStack,
        memo: getBackendLevel(editingLevelId.value)?.memo,
      })
    } else {
      saved = await handLogStore.addBlindLevel(eventId, {
        levelNo: Number(levelForm.levelNo),
        smallBlind: parseStoredNumber(levelForm.smallBlind),
        bigBlind: parseStoredNumber(levelForm.bigBlind),
        ante: parseStoredNumber(levelForm.ante),
        endStack: null,
        averageStack: null,
      })
    }

    await handLogStore.fetchEventDetail(eventId)
    const shouldActivate =
      saved &&
      ((!editingLevelId.value &&
        (activateNewLevelAfterSave.value ||
          (!runningTournament.currentBlindLevelId &&
            (event.value?.blindLevels?.length || 0) === 1))) ||
        (editingLevelId.value && levelForm.makeCurrent))

    if (shouldActivate) {
      runningTournament.currentBlindLevelId = saved.id
      runningTournament.currentLevel = `L${saved.levelNo}`
      runningTournament.currentBlinds = {
        smallBlind: formatInputNumber(saved.smallBlind),
        bigBlind: formatInputNumber(saved.bigBlind),
        ante: formatInputNumber(saved.ante),
      }
      runningTournament.blinds = [saved.smallBlind, saved.bigBlind, saved.ante]
        .map((value) => (Number(value) > 0 ? formatInputNumber(value) : '-'))
        .join(' / ')
      const inheritedStack =
        saved.endStack ??
        saved.displayStartStack ??
        saved.startStack ??
        parseStoredNumber(runningTournament.currentStack)
      const inheritedAverageStack =
        parseStoredNumber(saved.averageStack) ??
        parseStoredNumber(runningTournament.averageStack)
      runningTournament.currentStack = formatInputNumber(inheritedStack)
      runningTournament.currentBb =
        inheritedStack != null && saved.bigBlind > 0
          ? Number((inheritedStack / saved.bigBlind).toFixed(1))
          : null
      runningTournament.averageStack = formatInputNumber(inheritedAverageStack)
      runningTournament.averageBb =
        inheritedAverageStack != null && saved.bigBlind > 0
          ? Number((inheritedAverageStack / saved.bigBlind).toFixed(1))
          : null
      localStorage.setItem('pokerly-running-tournament', JSON.stringify(runningTournament))
      await persistRunningSession()
    }
    activateNewLevelAfterSave.value = false
    levelSheetOpen.value = false
  } catch {
    alert.show('레벨을 저장하지 못했습니다.', 'error')
  }
}

const requestRemoveLevel = (level) => {
  showLevelMenu.value = false
  deletingLevel.value = level
  deleteConfirmOpen.value = true
}

const removeLevel = async () => {
  const level = deletingLevel.value
  if (!runningTournament.eventId || !level?.id) return

  try {
    const wasCurrent =
      runningTournament.currentBlindLevelId &&
      String(runningTournament.currentBlindLevelId) === String(level.id)
    const deletedLevelNo =
      getBackendLevel(level.id)?.levelNo ?? Number(level.name?.replace(/\D/g, ''))
    await handLogStore.deleteBlindLevel(runningTournament.eventId, level.id)
    const remaining = event.value?.blindLevels || []
    const nextCurrent = wasCurrent
      ? remaining.find((item) => item.levelNo > deletedLevelNo) ||
        [...remaining].reverse().find((item) => item.levelNo < deletedLevelNo) ||
        null
      : getBackendLevel(runningTournament.currentBlindLevelId)

    if (wasCurrent) {
      runningTournament.currentBlindLevelId = nextCurrent?.id || null
      runningTournament.currentLevel = nextCurrent ? `L${nextCurrent.levelNo}` : null
    }
    if (wasCurrent && !nextCurrent) {
      runningTournament.currentBlinds = null
      runningTournament.blinds = null
      runningTournament.currentStack = null
      runningTournament.averageStack = null
      runningTournament.currentBb = null
      runningTournament.averageBb = null
    }
    localStorage.setItem('pokerly-running-tournament', JSON.stringify(runningTournament))
    await persistRunningSession()
    deleteConfirmOpen.value = false
    deletingLevel.value = null
  } catch {
    alert.show('핸드가 기록된 레벨은 삭제할 수 없습니다.', 'error')
  }
}

const ensureEventId = async () => {
  if (runningTournament.eventId) return runningTournament.eventId

  const eventId = await handLogStore.createEvent({
    name: runningTournament.name || '이름 없는 토너먼트',
    startingStack: parseStoredNumber(runningTournament.startingStack),
    date: runningTournament.date?.replaceAll('.', '-') || formatLocalDate(),
  })
  if (!eventId) return null

  const levelNo = currentLevelNumber.value || 1
  const blinds = runningTournament.currentBlinds || runningTournament.startBlinds || {}
  const firstLevel = await handLogStore.addBlindLevel(eventId, {
    levelNo,
    smallBlind: parseStoredNumber(blinds.smallBlind) ?? 0,
    bigBlind: parseStoredNumber(blinds.bigBlind) ?? 0,
    ante: parseStoredNumber(blinds.ante) ?? 0,
    startStack: parseStoredNumber(runningTournament.startingStack),
    endStack: parseStoredNumber(runningTournament.currentStack),
    averageStack: parseStoredNumber(runningTournament.averageStack),
  })

  runningTournament.eventId = eventId
  runningTournament.currentBlindLevelId = firstLevel?.id || null
  localStorage.setItem('pokerly-running-tournament', JSON.stringify(runningTournament))
  return eventId
}

const openRequestedLevelSheet = async () => {
  if (route.query.addLevel !== '1') return

  const requestedLevelNo = route.query.nextLevelNo
  const activateAfterSave = route.query.activateLevel === '1'
  const query = { ...route.query }
  delete query.addLevel
  delete query.nextLevelNo
  delete query.activateLevel
  await router.replace({ query })
  await nextTick()
  openLevelSheet(null, requestedLevelNo, activateAfterSave)
}

onMounted(async () => {
  try {
    const serverRunning = await fetchRunningGameSession()
    if (serverRunning) {
      Object.assign(runningTournament, {
        sessionId: serverRunning.id,
        eventId: serverRunning.handLogEventId,
        name: serverRunning.tournamentName,
        venueId: serverRunning.venueId,
        startLevel: serverRunning.startLevel,
        currentLevel: serverRunning.currentLevel,
        // 이 값은 서버 필드가 아니므로 이전 기기의 캐시를 신뢰하지 않는다.
        // 이벤트를 받은 뒤 서버의 currentLevel로 실제 id를 다시 결정한다.
        currentBlindLevelId: null,
        startingStack: formatInputNumber(serverRunning.startingStack),
        currentStack: formatInputNumber(serverRunning.currentStack),
        averageStack: formatInputNumber(serverRunning.averageStack),
        buyIn: formatInputNumber(serverRunning.buyInPerEntry),
        totalBuyIns: serverRunning.entries,
        currentBlinds: {
          smallBlind: formatInputNumber(serverRunning.currentSmallBlind),
          bigBlind: formatInputNumber(serverRunning.currentBigBlind),
          ante: formatInputNumber(serverRunning.currentAnte),
        },
      })
      localStorage.setItem('pokerly-running-tournament', JSON.stringify(runningTournament))
    }
    if (runningTournament.sessionId) {
      tournamentSeats.value = await fetchTournamentSeats(runningTournament.sessionId).catch(
        () => [],
      )
    }
    const eventId = await ensureEventId()
    if (eventId) {
      await handLogStore.fetchEventDetail(eventId)
      await Promise.allSettled(
        (event.value?.blindLevels || []).map((level) =>
          handLogStore.fetchBlindLevelDetail(eventId, level.id),
        ),
      )
      const restoredCurrentLevel = (event.value?.blindLevels || []).find(
        (level) => Number(level.levelNo) === currentLevelNumber.value,
      )
      if (restoredCurrentLevel) {
        runningTournament.currentBlindLevelId = restoredCurrentLevel.id
        localStorage.setItem('pokerly-running-tournament', JSON.stringify(runningTournament))
      }
    }
  } catch {
    alert.show('토너먼트 데이터를 불러오지 못했습니다.', 'error')
  } finally {
    await openRequestedLevelSheet()
  }
})

const openLevel = (level) => {
  router.push({
    name: 'tournament-level-detail',
    params: { levelName: level.id },
    query: { levelName: level.name, eventId: event.value?.id || runningTournament.eventId },
  })
}

const openManage = () => {
  router.push('/app/tournament/running/manage')
}

const openSummaryHand = (hand) => {
  if (!hand?.__levelId || !hand?.id) return
  router.push({
    name: 'tournament-hand-detail',
    params: { levelName: hand.__levelId, handId: hand.id },
    query: { levelName: hand.__levelLabel },
  })
}

const openFinish = () => {
  router.push('/app/tournament/running/finish')
}

const goBack = () => {
  router.push({ name: 'home' })
}
</script>

<style scoped>
.running-page {
  display: grid;
  align-content: start;
  gap: 20px;
  min-height: 100%;
  padding: var(--v2-page-padding-top) var(--v2-page-padding-x) 180px;
}

.running-topbar {
  display: grid;
  grid-template-columns: 40px minmax(0, 1fr) 40px;
  align-items: center;
  min-height: 36px;
}

.running-topbar__back {
  width: 36px;
  height: 36px;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--v2-text-main);
}

.running-topbar__copy {
  display: grid;
  width: 36px;
  height: 36px;
  place-items: center;
  justify-self: end;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--v2-text-sub);
}

.running-topbar__copy:disabled {
  opacity: 0.35;
}

.running-topbar h1 {
  margin: 0;
  color: var(--v2-text-main);
  font-size: 19px;
  font-weight: 650;
  line-height: 1.2;
  text-align: center;
}

.running-summary {
  overflow: hidden;
  padding: 18px 20px;
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-lg);
  background: #ffffff;
  box-shadow: 0 8px 24px rgba(28, 18, 60, 0.045);
}

.running-summary__main {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 16px;
}

.running-summary strong {
  color: var(--v2-text-main);
  font-size: 17px;
  font-weight: 560;
  line-height: 1.2;
}

.running-summary p {
  margin: 10px 0 0;
  color: #5f596b;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 430;
  line-height: 1.2;
}

.running-summary p span {
  color: var(--v2-text-sub);
}

.manage-link {
  min-height: 36px;
  padding: 0 13px;
  border: 1px solid rgba(109, 69, 232, 0.38);
  border-radius: var(--v2-radius-sm);
  background: #ffffff;
  color: var(--v2-primary);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  font: inherit;
  font-size: 12px;
  font-weight: 520;
  white-space: nowrap;
}

.level-section {
  display: grid;
  gap: 14px;
}

.level-section__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.level-section__header h2 {
  margin: 0;
  color: var(--v2-text-main);
  font-size: 16px;
  font-weight: 560;
  line-height: 1.2;
}

.level-section__header button {
  min-height: 34px;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--v2-primary);
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font: inherit;
  font-size: 13px;
  font-weight: 520;
}

.level-list {
  display: grid;
  gap: 8px;
}

.level-list__empty {
  padding: 28px 16px;
  border: 1px solid rgba(230, 226, 240, 0.9);
  border-radius: var(--v2-radius-lg);
  background: #ffffff;
  color: var(--v2-text-sub);
  font-size: 14px;
  text-align: center;
}

.current-level-card {
  position: relative;
  overflow: visible;
  padding: 22px 20px 20px 24px;
  border: 1px solid rgba(109, 69, 232, 0.45);
  border-radius: var(--v2-radius-lg);
  background: linear-gradient(135deg, #ffffff 0%, #fbf8ff 100%);
  box-shadow: 0 10px 26px rgba(109, 69, 232, 0.09);
  color: var(--v2-text-main);
  cursor: pointer;
}

.current-level-card__accent {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 8px;
  border-radius: var(--v2-radius-lg) 0 0 var(--v2-radius-lg);
  background: var(--v2-primary);
}

.level-menu-button {
  position: absolute;
  right: 14px;
  top: 16px;
  width: 32px;
  height: 32px;
  padding: 0;
  border: 0;
  background: transparent;
  color: #5f596b;
  outline: 0;
}

.level-menu {
  position: absolute;
  top: 52px;
  right: 14px;
  z-index: 2;
  width: 156px;
  overflow: hidden;
  border: 1px solid rgba(230, 226, 240, 0.95);
  border-radius: 12px;
  background: #ffffff;
  box-shadow: 0 14px 30px rgba(28, 18, 60, 0.18);
  display: grid;
}

.level-menu button {
  width: 100%;
  min-height: 42px;
  padding: 0 12px;
  border: 0;
  border-bottom: 1px solid var(--v2-border);
  background: #ffffff;
  color: var(--v2-text-main);
  display: flex;
  align-items: center;
  gap: 9px;
  font: inherit;
  font-size: 13px;
  font-weight: 520;
  text-align: left;
  cursor: pointer;
}

.level-menu button:last-child {
  border-bottom: 0;
}

.level-menu button:active {
  background: #faf9ff;
}

.level-menu button.danger {
  color: var(--v2-danger);
}

.current-level-card__head {
  display: flex;
  align-items: baseline;
  gap: 28px;
  padding-right: 40px;
  padding-bottom: 18px;
  border-bottom: 1px solid var(--v2-border);
}

.current-level-card__head strong {
  color: var(--v2-primary);
  font-size: 34px;
  font-weight: 620;
  line-height: 1;
}

.current-level-card__head span {
  min-width: 0;
  overflow: hidden;
  color: var(--v2-primary);
  font-size: 16px;
  font-weight: 560;
  line-height: 1.2;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.current-level-card__body {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) 52px;
  gap: 8px;
  padding-top: 18px;
}

.current-level-card__body div + div {
  padding-left: 10px;
  border-left: 1px solid var(--v2-border);
}

.current-level-card__body span,
.level-row small {
  color: var(--v2-text-sub);
  font-size: 12px;
  font-weight: 430;
  line-height: 1.2;
}

.current-level-card__body > div > span {
  display: block;
}

.current-level-card__body > div {
  min-width: 0;
}

.current-level-card__body strong {
  display: block;
  max-width: 100%;
  overflow: hidden;
  margin-top: 9px;
  color: var(--v2-text-main);
  font-size: 20px;
  font-weight: 620;
  line-height: 1;
  font-variant-numeric: tabular-nums;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.current-level-card__body em {
  display: block;
  margin-top: 8px;
  color: var(--v2-primary);
  font-size: 13px;
  font-style: normal;
  font-weight: 520;
}

.current-level-card__body div:last-child strong {
  color: var(--v2-primary);
  font-size: 22px;
}

.level-row {
  width: 100%;
  min-height: 82px;
  padding: 13px 12px 12px 16px;
  border: 1px solid rgba(230, 226, 240, 0.9);
  border-radius: var(--v2-radius-lg);
  background: #ffffff;
  box-shadow: 0 4px 12px rgba(28, 18, 60, 0.018);
  color: var(--v2-text-main);
  display: grid;
  grid-template-columns: 44px minmax(0, 1fr) 24px;
  align-items: center;
  column-gap: 12px;
  font: inherit;
  text-align: left;
}

.level-row__content {
  display: grid;
  gap: 8px;
}

.level-row__level {
  align-self: center;
  color: var(--v2-text-main);
  font-size: 20px;
  font-weight: 620;
}

.level-row__blinds {
  color: var(--v2-text-main);
  font-size: 14px;
  font-weight: 450;
  white-space: nowrap;
}

.level-row__bottom {
  display: grid;
  grid-template-columns: 88px minmax(0, 1fr);
  align-items: center;
  column-gap: 12px;
  color: var(--v2-text-sub);
}

.level-row__metric,
.level-row__stack {
  min-width: 0;
  display: inline-flex;
  align-items: baseline;
  gap: 4px;
  color: var(--v2-text-sub);
  font-size: 12px;
  font-weight: 450;
  line-height: 1.1;
  white-space: nowrap;
}

.level-row__metric b,
.level-row__stack b {
  font: inherit;
  color: #5f596b;
  font-weight: 520;
}

.level-row__menu {
  color: #8a8498;
  display: flex;
  justify-content: flex-end;
}

.level-sheet {
  width: min(100%, 520px);
  max-height: 88vh;
  overflow-y: auto;
  margin: 0 auto;
  padding: 12px 24px calc(24px + env(safe-area-inset-bottom));
  border-radius: 24px 24px 0 0;
  background: #ffffff;
  display: grid;
  gap: 18px;
}

.level-sheet__handle {
  width: 38px;
  height: 5px;
  margin: 0 auto 2px;
  border-radius: 999px;
  background: #d4d0dc;
}

.level-sheet h2 {
  margin: 0 0 4px;
  color: var(--v2-text-main);
  font-size: 20px;
  font-weight: 620;
  text-align: center;
}

.level-sheet label {
  display: grid;
  gap: 8px;
}

.level-sheet label > span {
  color: var(--v2-text-main);
  font-size: 14px;
  font-weight: 560;
}

.level-sheet label > span em {
  margin-left: 4px;
  color: var(--v2-text-sub);
  font-size: 12px;
  font-style: normal;
  font-weight: 430;
}

.level-sheet input {
  width: 100%;
  height: 52px;
  padding: 0 14px;
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-sm);
  outline: 0;
  background: #ffffff;
  color: var(--v2-text-main);
  font: inherit;
  font-size: 16px;
}

.level-sheet input:focus {
  border-color: rgba(109, 69, 232, 0.6);
}

.level-sheet__blinds {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.level-sheet__actions {
  margin-top: 4px;
}

.level-sheet__save {
  width: 100%;
  height: 52px;
  border-radius: var(--v2-radius-sm);
  font: inherit;
  font-size: 16px;
  font-weight: 620;
}

.level-sheet__save {
  border: 0;
  background: var(--v2-primary);
  color: #ffffff;
}

.level-sheet__save:disabled {
  opacity: 0.55;
}

.level-sheet .level-sheet__current {
  display: flex;
  align-items: center;
  gap: 10px;
}

.level-sheet .level-sheet__current input {
  width: 20px;
  height: 20px;
  padding: 0;
  accent-color: var(--v2-primary);
}

.level-sheet .level-sheet__current span {
  font-size: 14px;
}

.level-sheet__current-status {
  padding: 12px 14px;
  border-radius: var(--v2-radius-sm);
  background: #f3efff;
  color: var(--v2-primary);
  font-size: 14px;
  font-weight: 560;
  text-align: center;
}

.delete-confirm {
  width: min(calc(100vw - 40px), 360px);
  padding: 24px;
  border-radius: var(--v2-radius-lg);
  background: #ffffff;
}

.delete-confirm h2 {
  margin: 0;
  color: var(--v2-text-main);
  font-size: 19px;
  font-weight: 620;
}

.delete-confirm p {
  margin: 10px 0 22px;
  color: var(--v2-text-sub);
  font-size: 14px;
}

.delete-confirm > div {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.delete-confirm button {
  height: 44px;
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-sm);
  background: #ffffff;
  color: var(--v2-text-main);
  font: inherit;
  font-size: 14px;
  font-weight: 560;
}

.delete-confirm button.danger {
  border-color: var(--v2-danger);
  color: var(--v2-danger);
}

@media (max-width: 420px) {
  .running-page {
    padding: var(--v2-page-padding-top) var(--v2-page-padding-x) 180px;
  }

  .running-summary {
    padding: 16px 18px;
  }

  .running-summary__main {
    grid-template-columns: minmax(0, 1fr) auto;
  }

  .manage-link {
    margin-top: 0;
  }

  .current-level-card {
    padding: 20px 18px 18px 22px;
  }

  .current-level-card__head {
    gap: 14px;
  }

  .current-level-card__head strong {
    font-size: 31px;
  }

  .current-level-card__head span {
    min-width: 0;
    font-size: 14px;
  }

  .current-level-card__body strong {
    font-size: clamp(17px, 5vw, 20px);
    white-space: nowrap;
  }

  .current-level-card__body div + div {
    padding-left: 10px;
  }

  .level-row {
    padding: 11px 10px 11px 14px;
  }

  .level-row {
    grid-template-columns: 38px minmax(0, 1fr) 20px;
    column-gap: 8px;
  }

  .level-row__level {
    font-size: 19px;
  }

  .level-row__bottom {
    grid-template-columns: 78px minmax(0, 1fr);
    column-gap: 10px;
  }

  .level-row__blinds {
    font-size: 13px;
  }
}
</style>
