<template>
  <q-page
    class="level-detail-page"
    :class="{ 'level-detail-page--summary': isSummaryView }"
    @click="showHandListMenu = false"
  >
    <header class="level-topbar">
      <button class="level-topbar__back" type="button" aria-label="뒤로 가기" @click="goBack">
        <q-icon name="chevron_left" size="28px" />
      </button>
      <div class="level-topbar__title">
        <h1>{{ levelName }}</h1>
        <span v-if="blindDisplay">{{ blindDisplay }}</span>
      </div>
      <button
        class="level-topbar__copy"
        type="button"
        aria-label="레벨 복기 텍스트 복사"
        :disabled="!blindLevel"
        @click="copyLevelText"
      >
        <q-icon name="content_copy" size="19px" />
      </button>
    </header>

    <section v-if="levelLoading && !blindLevel" class="level-state-card">
      레벨 정보를 불러오는 중입니다.
    </section>

    <section v-else-if="!blindLevel" class="level-state-card">레벨 정보가 없습니다.</section>

    <section v-else class="stack-card">
      <button class="stack-card__edit" type="button" aria-label="스택 수정" @click="openStackSheet">
        <q-icon name="edit" size="18px" />
      </button>
      <div class="stack-card__metrics">
        <div class="stack-card__item stack-card__item--current">
          <span>현재 스택</span>
          <div class="stack-card__value">
            <strong :title="currentStackDisplay">{{ currentStackCompactDisplay }}</strong>
            <small v-if="currentStackBb">{{ currentStackBb }}</small>
          </div>
        </div>
        <div class="stack-card__item">
          <span>평균 스택</span>
          <div class="stack-card__value">
            <strong :title="averageStackDisplay">{{ averageStackCompactDisplay }}</strong>
            <small v-if="averageStackBb">{{ averageStackBb }}</small>
          </div>
        </div>
      </div>
    </section>

    <section v-if="blindLevel" class="hand-section">
      <div class="hand-section__header">
        <h2>
          {{
            selectionMode ? `핸드 선택 (${selectedHandIds.length})` : `핸드 목록 (${hands.length})`
          }}
        </h2>
        <div v-if="selectionMode" class="hand-selection-actions">
          <button type="button" @click="cancelHandSelection">취소</button>
          <button type="button" :disabled="!selectedHandIds.length" @click="moveSheetOpen = true">
            이동
          </button>
        </div>
        <div v-else-if="hands.length" class="hand-list-action">
          <button
            type="button"
            aria-label="핸드 목록 작업"
            :aria-expanded="showHandListMenu"
            @click.stop="showHandListMenu = !showHandListMenu"
          >
            <q-icon name="more_vert" size="23px" />
          </button>
          <div v-if="showHandListMenu" class="hand-list-menu" @click.stop>
            <button type="button" @click="startHandSelection">
              <q-icon name="drive_file_move_outline" size="18px" />
              선택해서 이동
            </button>
          </div>
        </div>
      </div>
      <div class="hand-list">
        <p v-if="!hands.length" class="hand-list__empty">기록된 핸드가 없습니다.</p>
        <article
          v-for="hand in hands"
          :key="hand.id"
          class="hand-row"
          role="button"
          tabindex="0"
          :class="{
            selected: selectedHandIds.includes(hand.id),
            'hand-row--selecting': selectionMode,
          }"
          @click="handleHandClick(hand.id)"
          @keyup.enter="handleHandClick(hand.id)"
        >
          <div class="cards">
            <span
              v-for="card in hand.cards"
              :key="card.rank + card.suit"
              :class="{ red: card.red }"
            >
              <b>{{ card.rank }}</b>
              <em>{{ card.suit }}</em>
            </span>
          </div>

          <div class="hand-row__main">
            <span>{{ hand.position }}</span>
          </div>

          <span class="hand-row__status">
            <span class="hand-row__result" :class="`hand-row__result--${hand.tone}`">{{
              hand.result
            }}</span>
            <span class="hand-row__review-slot">
              <span
                v-if="hand.needsReview"
                class="hand-row__review-dot"
                aria-label="복기 필요"
              ></span>
            </span>
          </span>
          <span v-if="selectionMode" class="hand-row__check" aria-hidden="true">
            <q-icon :name="selectedHandIds.includes(hand.id) ? 'check' : ''" size="16px" />
          </span>
        </article>
      </div>
    </section>

    <section v-if="blindLevel" class="level-stats">
      <div class="level-stats__heading">
        <h2>레벨 요약</h2>
        <span>{{ hands.length }}핸드</span>
      </div>
      <div class="level-stats__grid">
        <div v-for="stat in stats" :key="stat.label">
          <strong>{{ stat.value }}</strong>
          <span>{{ stat.label }}</span>
        </div>
      </div>
    </section>

    <section v-if="blindLevel" class="rank-distribution">
      <div class="rank-distribution__heading">
        <h2>순위 구간 분포</h2>
        <span>169개 스타팅 핸드 기준</span>
      </div>
      <div class="rank-distribution__card">
        <div class="rank-meter" aria-hidden="true">
          <span
            v-for="bucket in rankDistribution.buckets"
            :key="bucket.key"
            :class="`rank-tone--${bucket.tone}`"
            :style="{ width: `${bucket.percent}%` }"
          ></span>
        </div>
        <div class="rank-distribution__list">
          <div v-for="bucket in rankDistribution.buckets" :key="bucket.key">
            <i :class="`rank-tone--${bucket.tone}`"></i>
            <span>
              <strong>{{ bucket.label }}</strong>
              <small>{{ bucket.description }}</small>
            </span>
            <b>{{ bucket.count }}개</b>
            <em>{{ bucket.percent }}%</em>
          </div>
        </div>
      </div>
    </section>

    <section v-if="blindLevel" class="hand-groups">
      <h2>주요 핸드</h2>
      <div class="hand-groups__card">
        <article v-for="group in handGroups" :key="group.key" class="hand-group">
          <div class="hand-group__heading">
            <div>
              <strong>{{ group.label }}</strong>
              <span>{{ group.description }}</span>
            </div>
            <b>{{ group.count }}개</b>
          </div>
          <div v-if="group.items.length" class="hand-group__items">
            <button
              v-for="item in group.items"
              :key="item.hand"
              type="button"
              :class="{ active: selectedGroupHand === `${group.key}:${item.hand}` }"
              @click="toggleGroupHand(group.key, item.hand)"
            >
              {{ item.hand }} <small>×{{ item.count }}</small>
            </button>
          </div>
          <p v-else>기록 없음</p>
          <div v-if="selectedGroupHand?.startsWith(`${group.key}:`)" class="hand-group__details">
            <button
              v-for="hand in selectedGroupHands(group)"
              :key="hand.id"
              type="button"
              @click="openHand(hand.id)"
            >
              <strong>{{ handLevelLabel(hand) }} · {{ normalizedHand(hand) }}</strong>
              <span>
                {{ hand.position || '-' }} · {{ handActionLabel(hand) }} · {{ hand.result }}
              </span>
            </button>
          </div>
        </article>
      </div>
    </section>

    <button
      v-if="!isSummaryView && isCurrentLevel"
      class="hand-fab"
      type="button"
      @click="recordHand"
    >
      <span class="hand-fab__icon" aria-hidden="true">
        <i></i>
      </span>
      <span>핸드 기록</span>
    </button>
    <StickyPrimaryAction
      v-if="!isSummaryView && isCurrentLevel"
      label="레벨 종료"
      :loading="endingLevel"
      loading-label="종료 중..."
      @click="endLevel"
    />

    <q-dialog v-model="moveSheetOpen" position="bottom" persistent>
      <q-card class="move-level-sheet">
        <div class="move-level-sheet__handle"></div>
        <h2>레벨 선택</h2>
        <p>선택한 핸드 {{ selectedHandIds.length }}개</p>
        <button
          v-for="level in movableLevels"
          :key="level.id"
          type="button"
          :disabled="movingHands"
          @click="moveSelectedHands(level.id, level.name)"
        >
          <strong>{{ level.name }}</strong>
          <span>{{ movingTargetLevelId === level.id ? '이동 중…' : level.blinds }}</span>
          <q-spinner v-if="movingTargetLevelId === level.id" size="18px" />
          <q-icon v-else name="chevron_right" size="20px" />
        </button>
      </q-card>
    </q-dialog>

    <q-dialog v-model="stackSheetOpen" position="bottom" no-refocus>
      <q-card class="stack-sheet" @click.stop>
        <div class="stack-sheet__handle"></div>
        <h2>스택 기록</h2>
        <label>
          <span>현재 스택</span>
          <input
            :value="stackInput"
            inputmode="numeric"
            @click.stop
            @input="updateStackInput"
          />
        </label>
        <label>
          <span>평균 스택</span>
          <input
            :value="averageStackInput"
            inputmode="numeric"
            placeholder="선택 입력"
            @click.stop
            @input="updateAverageStackInput"
          />
        </label>
        <button
          type="button"
          :disabled="handLogStore.saving || savingStack"
          @click.stop="saveStack"
        >
          {{ savingStack ? '저장 중...' : '저장' }}
        </button>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useAlert } from 'src/composables/useAlert'
import StickyPrimaryAction from 'src/shared/components/StickyPrimaryAction.vue'
import { useHandLogStore } from 'src/stores/handLog'
import { fetchRunningGameSession, updateGameSessionProgress } from 'src/api/gameSession'
import { buildLevelReviewText } from 'src/utils/handLogExportText'
import { copyToClipboard } from 'src/utils/copyToClipboard'
import {
  createStartingHandRunSummary,
  getHandActionLabel,
  isPfrAction,
  isThreeBetPlusAction,
  isVpipAction,
} from 'src/utils/handLogHandAnalysis'

const route = useRoute()
const router = useRouter()
const alert = useAlert()
const handLogStore = useHandLogStore()

const levelId = computed(() => String(route.params.levelName || ''))
const levelName = computed(
  () =>
    (blindLevel.value?.levelNo ? `L${blindLevel.value.levelNo}` : '') ||
    String(route.query.levelName || '') ||
    '-',
)
const isSummaryView = computed(() => route.query.view === 'summary')
const showHandListMenu = ref(false)
const selectionMode = ref(false)
const selectedHandIds = ref([])
const moveSheetOpen = ref(false)
const movingHands = ref(false)
const movingTargetLevelId = ref(null)
const loadedEventId = ref(null)
const stackSheetOpen = ref(false)
const stackInput = ref('')
const averageStackInput = ref('')
const savingStack = ref(false)
const endingLevel = ref(false)
const selectedGroupHand = ref('')
const restoring = ref(false)

const storedTournament = reactive(
  (() => {
    try {
      return JSON.parse(localStorage.getItem('pokerly-running-tournament')) || {}
    } catch {
      return {}
    }
  })(),
)
const eventId = computed(() => {
  if (loadedEventId.value) return loadedEventId.value
  if (route.query.eventId) return route.query.eventId

  // 과거 대회 요약에서 넘어온 URL의 이벤트가 현재 진행 중 대회보다 우선이다.
  if (route.query.legacyEventId) return route.query.legacyEventId

  // Running 화면에서는 항상 최신 running tournament 우선
  if (storedTournament.eventId) return storedTournament.eventId

  return handLogStore.selectedEvent?.id ?? null
})
const levelLoading = computed(() => handLogStore.levelLoading || restoring.value)
const blindLevel = computed(() => {
  const selected = handLogStore.selectedBlindLevel
  if (selected && String(selected.id) === levelId.value) return selected
  return (
    handLogStore.selectedEvent?.blindLevels?.find((level) => String(level.id) === levelId.value) ||
    null
  )
})
const sourceLevelId = computed(() => blindLevel.value?.id || levelId.value)
const isCurrentLevel = computed(
  () =>
    storedTournament.currentBlindLevelId &&
    String(storedTournament.currentBlindLevelId) === levelId.value,
)

const formatNumber = (value) =>
  value === null || value === undefined || value === ''
    ? '-'
    : Number(value).toLocaleString('ko-KR')
const blindDisplay = computed(() => {
  if (!blindLevel.value) return ''

  return [blindLevel.value.smallBlind, blindLevel.value.bigBlind, blindLevel.value.ante ?? 0]
    .map(formatNumber)
    .join(' / ')
})
const formatCompactNumber = (value) => {
  const number = Number(value)
  if (!Number.isFinite(number)) return '-'
  if (number >= 1000000) {
    const millions = number / 1000000
    return `${millions >= 10 ? millions.toFixed(1) : millions.toFixed(2)}M`.replace(/\.0+(?=M$)/, '')
  }
  if (number >= 1000) {
    const thousands = number / 1000
    return `${Number.isInteger(thousands) ? thousands : thousands.toFixed(1)}K`
  }
  return number.toLocaleString('ko-KR')
}
const parseStoredNumber = (value) => {
  const normalized = String(value ?? '')
    .replaceAll(',', '')
    .trim()
  if (!normalized) return null
  const number = Number(normalized)
  return Number.isFinite(number) ? number : null
}
const currentStack = computed(() => {
  if (isCurrentLevel.value) {
    const sessionStack = parseStoredNumber(storedTournament.currentStack)
    if (sessionStack != null) return sessionStack
  }

  const ownStack =
    blindLevel.value?.endStack ??
    blindLevel.value?.displayStartStack ??
    blindLevel.value?.startStack
  if (ownStack != null) return Number(ownStack)

  const levels = [...(handLogStore.selectedEvent?.blindLevels || [])].sort(
    (a, b) => Number(a.levelNo || 0) - Number(b.levelNo || 0),
  )
  const currentIndex = levels.findIndex((level) => String(level.id) === levelId.value)
  for (let index = currentIndex - 1; index >= 0; index -= 1) {
    const previousStack =
      levels[index].endStack ?? levels[index].displayStartStack ?? levels[index].startStack
    if (previousStack != null) return Number(previousStack)
  }

  return (
    parseStoredNumber(handLogStore.selectedEvent?.startingStack) ??
    parseStoredNumber(storedTournament.startingStack)
  )
})
const currentStackDisplay = computed(() => formatNumber(currentStack.value))
const currentStackCompactDisplay = computed(() => formatCompactNumber(currentStack.value))
const currentStackBb = computed(() => {
  if (currentStack.value == null) return ''
  const bigBlind = Number(blindLevel.value?.bigBlind || 0)
  if (!bigBlind) return ''
  const bb = Number(currentStack.value) / bigBlind
  return `${Number.isInteger(bb) ? bb : bb.toFixed(1)} BB`
})
const averageStack = computed(() => {
  if (isCurrentLevel.value) {
    const sessionAverage = parseStoredNumber(storedTournament.averageStack)
    if (sessionAverage != null) return sessionAverage
  }
  return parseStoredNumber(blindLevel.value?.averageStack)
})
const averageStackDisplay = computed(() => formatNumber(averageStack.value))
const averageStackCompactDisplay = computed(() => formatCompactNumber(averageStack.value))
const averageStackBb = computed(() => {
  if (averageStack.value == null) return ''
  const bigBlind = Number(blindLevel.value?.bigBlind || 0)
  if (!bigBlind) return ''
  const bb = averageStack.value / bigBlind
  return `${Number.isInteger(bb) ? bb : bb.toFixed(1)} BB`
})

const formatInputNumber = (value) => {
  const digits = String(value ?? '').replace(/\D/g, '')
  return digits ? Number(digits).toLocaleString('ko-KR') : ''
}

const openStackSheet = () => {
  stackInput.value = formatInputNumber(currentStack.value)
  averageStackInput.value = formatInputNumber(averageStack.value)
  stackSheetOpen.value = true
}

const updateStackInput = (event) => {
  stackInput.value = formatInputNumber(event.target.value)
}
const updateAverageStackInput = (event) => {
  averageStackInput.value = formatInputNumber(event.target.value)
}

const saveStack = async () => {
  if (savingStack.value) return
  if (!eventId.value || !blindLevel.value?.id || !stackInput.value) {
    alert.show('현재 스택을 입력해 주세요.', 'warning')
    return
  }

  const endStack = Number(stackInput.value.replaceAll(',', ''))
  const savedAverageStack = parseStoredNumber(averageStackInput.value)
  savingStack.value = true
  try {
    const saved = await handLogStore.updateBlindLevelInfo(eventId.value, blindLevel.value.id, {
      startStack: blindLevel.value.startStack ?? blindLevel.value.displayStartStack,
      endStack,
      averageStack: savedAverageStack,
      memo: blindLevel.value.memo,
    })
    if (!saved) throw new Error('Stack update returned no data')

    if (isCurrentLevel.value) {
      storedTournament.currentStack = formatInputNumber(endStack)
      storedTournament.averageStack = formatInputNumber(savedAverageStack)
      storedTournament.currentBb =
        Number(saved.bigBlind || blindLevel.value.bigBlind) > 0
          ? Number((endStack / Number(saved.bigBlind || blindLevel.value.bigBlind)).toFixed(1))
          : null
      localStorage.setItem('pokerly-running-tournament', JSON.stringify(storedTournament))
      if (storedTournament.sessionId) {
        await updateGameSessionProgress(storedTournament.sessionId, {
          currentStack: endStack,
          averageStack: savedAverageStack,
        })
      }
    }
    stackSheetOpen.value = false
  } catch {
    alert.show('현재 스택을 저장하지 못했습니다.', 'error')
  } finally {
    savingStack.value = false
  }
}

const resultMeta = (hand) => {
  const result = hand.resultType || hand.result || 'NOT_RECORDED'
  if (['SHOWDOWN_WIN', 'NON_SHOWDOWN_WIN', 'WIN'].includes(result)) {
    return { result: '승리', tone: 'win' }
  }
  if (['CHOP', 'DRAW'].includes(result)) return { result: '찹', tone: 'draw' }
  if (['SHOWDOWN_LOSS', 'PREFLOP_FOLD', 'POSTFLOP_FOLD', 'LOSS', 'FOLD'].includes(result)) {
    return { result: '패배', tone: 'lose' }
  }
  return { result: '미기록', tone: 'neutral' }
}

const handCards = (hand) => {
  const ranks =
    [hand.firstRank, hand.secondRank].filter(Boolean).length === 2
      ? [hand.firstRank, hand.secondRank]
      : String(hand.holeCards || hand.hand || '')
          .match(/10|[AKQJT2-9]/g)
          ?.slice(0, 2) || []
  const suits = [hand.firstSuit, hand.secondSuit]
  return ranks.map((rank, index) => {
    const suit = suits[index] || (hand.suited ? '♠' : index === 0 ? '♠' : '♥')
    return {
      rank: rank === '10' ? 'T' : rank,
      suit,
      red: ['♥', '♦'].includes(suit),
    }
  })
}

const hands = computed(() =>
  [...(blindLevel.value?.hands || [])]
    .sort((a, b) => {
      const createdAtDifference =
        new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()

      if (createdAtDifference) return createdAtDifference
      return Number(b.id || 0) - Number(a.id || 0)
    })
    .map((hand) => ({
      ...hand,
      cards: handCards(hand),
      position: hand.position || '-',
      ...resultMeta(hand),
      needsReview: Boolean(hand.reviewRequired),
    })),
)

const formatPercent = (count, total) => (total ? `${Math.round((count / total) * 100)}%` : '-')
const stats = computed(() => {
  const total = hands.value.length
  const actionOf = (hand) => hand.actionType || hand.preflopAction || ''
  const vpip = hands.value.filter((hand) => isVpipAction(actionOf(hand))).length
  const pfr = hands.value.filter((hand) => isPfrAction(actionOf(hand))).length
  const threeBet = hands.value.filter((hand) => isThreeBetPlusAction(actionOf(hand))).length
  const review = hands.value.filter((hand) => hand.needsReview).length
  return [
    { label: '복기 필요', value: String(review) },
    { label: 'VPIP', value: formatPercent(vpip, total) },
    { label: 'PFR', value: formatPercent(pfr, total) },
    { label: '3Bet+', value: formatPercent(threeBet, total) },
  ]
})

const normalizedHand = (hand) => {
  const ranks =
    [hand.firstRank, hand.secondRank].filter(Boolean).length === 2
      ? [hand.firstRank, hand.secondRank]
      : String(hand.holeCards || hand.hand || '')
          .match(/10|[AKQJT2-9]/gi)
          ?.slice(0, 2) || []
  if (ranks.length !== 2) return ''

  const normalizedRanks = ranks.map((rank) =>
    String(rank).toUpperCase() === '10' ? 'T' : String(rank).toUpperCase(),
  )
  if (normalizedRanks[0] === normalizedRanks[1]) return normalizedRanks.join('')

  const rankOrder = 'AKQJT98765432'
  normalizedRanks.sort((a, b) => rankOrder.indexOf(a) - rankOrder.indexOf(b))
  const rawHand = String(hand.holeCards || hand.hand || '')
  const suffix = /s$/i.test(rawHand) || hand.suited === true ? 's' : /o$/i.test(rawHand) ? 'o' : ''
  return `${normalizedRanks.join('')}${suffix}`
}

const groupItems = (matcher) => {
  const counts = new Map()
  hands.value.forEach((hand) => {
    const notation = normalizedHand(hand)
    if (!notation || !matcher(notation)) return
    const item = counts.get(notation) || { hand: notation, count: 0, hands: [] }
    item.count += 1
    item.hands.push(hand)
    counts.set(notation, item)
  })
  return [...counts.values()]
}

const handGroups = computed(() => {
  const pocketPairs = groupItems((hand) => hand.length === 2 && hand[0] === hand[1])
  const premium = groupItems((hand) =>
    ['AA', 'KK', 'QQ', 'JJ', 'TT', 'AKs', 'AKo', 'AK', 'AQs'].includes(hand),
  )
  const strongHands = groupItems((hand) =>
    ['99', '88', '77', 'AJs', 'ATs', 'AQo', 'AJo', 'AQ', 'KQs'].includes(hand),
  )
  return [
    {
      key: 'premium',
      label: '프리미엄',
      description: 'AA~TT, AK, AQs',
      count: premium.reduce((sum, item) => sum + item.count, 0),
      items: premium,
    },
    {
      key: 'strong',
      label: '강한 핸드',
      description: '99~77, AJs~ATs, AQo~AJo, KQs',
      count: strongHands.reduce((sum, item) => sum + item.count, 0),
      items: strongHands,
    },
    {
      key: 'pocket-pair',
      label: '포켓 페어',
      description: 'AA~22',
      count: pocketPairs.reduce((sum, item) => sum + item.count, 0),
      items: pocketPairs,
    },
  ]
})

const rankDistribution = computed(() => createStartingHandRunSummary(hands.value))

const toggleGroupHand = (groupKey, hand) => {
  const key = `${groupKey}:${hand}`
  selectedGroupHand.value = selectedGroupHand.value === key ? '' : key
}

const selectedGroupHands = (group) => {
  const selectedHand = selectedGroupHand.value.split(':')[1]
  return group.items.find((item) => item.hand === selectedHand)?.hands || []
}

const handLevelLabel = (hand) =>
  hand.__levelLabel ||
  (hand.__levelNo ? `L${hand.__levelNo}` : '') ||
  (hand.levelNo ? `L${hand.levelNo}` : '') ||
  levelName.value

const handActionLabel = (hand) => {
  return getHandActionLabel(hand)
}

const movableLevels = computed(() =>
  (handLogStore.selectedEvent?.blindLevels || [])
    .filter((level) => String(level.id) !== levelId.value)
    .map((level) => ({
      id: level.id,
      name: `L${level.levelNo}`,
      blinds: [level.smallBlind, level.bigBlind, level.ante].map(formatNumber).join(' / '),
    })),
)

const wait = (milliseconds) => new Promise((resolve) => window.setTimeout(resolve, milliseconds))

const syncRunningTournament = (runningSession) => {
  if (!runningSession) return null

  Object.assign(storedTournament, {
    sessionId: runningSession.id,
    eventId: runningSession.handLogEventId,
    currentLevel: runningSession.currentLevel,
    currentStack: runningSession.currentStack,
    averageStack: runningSession.averageStack,
  })
  localStorage.setItem('pokerly-running-tournament', JSON.stringify(storedTournament))
  return runningSession.handLogEventId || null
}

const loadLevelData = async ({ notify = true, retries = 5 } = {}) => {
  if (restoring.value || !levelId.value) return
  restoring.value = true
  let lastError = null

  try {
    for (let attempt = 0; attempt <= retries; attempt += 1) {
      const eventIds = [eventId.value]

      // iOS 홈 화면 앱은 종료 후 재실행될 때 로컬 상태와 마지막 URL만 먼저
      // 복구될 수 있다. 매 시도마다 서버의 진행 중 대회를 canonical 기준으로 잡는다.
      if (!route.query.legacyEventId) {
        try {
          const runningSession = await fetchRunningGameSession()
          const syncedEventId = syncRunningTournament(runningSession)
          eventIds.unshift(syncedEventId)
        } catch (error) {
          lastError = error
        }
      }

      const candidates = [...new Set(eventIds.filter(Boolean).map(String))]
      for (const requestedEventId of candidates) {
        const [eventResult, levelResult] = await Promise.allSettled([
          handLogStore.fetchEventDetail(requestedEventId),
          handLogStore.fetchBlindLevelDetail(requestedEventId, levelId.value),
        ])

        // 이 화면의 필수 데이터는 레벨 상세이다. iOS 재실행 직후 대회 전체
        // 조회만 일시적으로 실패해도 레벨 화면까지 막지 않는다.
        if (levelResult.status === 'fulfilled' && levelResult.value) {
          loadedEventId.value = requestedEventId
          const currentLevelNo = Number(
            String(storedTournament.currentLevel || storedTournament.startLevel || '').replace(
              /\D/g,
              '',
            ),
          )
          const restoredCurrentLevel = (handLogStore.selectedEvent?.blindLevels || []).find(
            (level) => Number(level.levelNo) === currentLevelNo,
          )
          if (restoredCurrentLevel) {
            storedTournament.currentBlindLevelId = restoredCurrentLevel.id
            localStorage.setItem('pokerly-running-tournament', JSON.stringify(storedTournament))
          }
          return true
        }

        lastError =
          levelResult.reason || (eventResult.status === 'rejected' ? eventResult.reason : lastError)
      }

      if (attempt < retries) await wait(Math.min(500 * 2 ** attempt, 3000))
    }

    if (notify) alert.show('레벨 정보를 불러오지 못했습니다.', 'error')
    if (lastError) console.error('레벨 정보 복구 실패', lastError)
    return false
  } finally {
    restoring.value = false
  }
}

const restoreOnVisible = () => {
  if (document.visibilityState !== 'visible') return
  if (!blindLevel.value || !handLogStore.selectedEvent) loadLevelData({ notify: false })
}
const restoreOnPageShow = () => {
  if (!blindLevel.value || !handLogStore.selectedEvent) loadLevelData({ notify: false })
}
const restoreOnOnline = () => {
  if (!blindLevel.value || !handLogStore.selectedEvent) loadLevelData({ notify: false })
}

onMounted(async () => {
  // iOS standalone PWA의 pageshow는 초기 API 요청보다 먼저 발생할 수 있으므로
  // 복구 리스너를 먼저 등록한다.
  document.addEventListener('visibilitychange', restoreOnVisible)
  window.addEventListener('pageshow', restoreOnPageShow)
  window.addEventListener('online', restoreOnOnline)
  await loadLevelData()
})

onBeforeUnmount(() => {
  document.removeEventListener('visibilitychange', restoreOnVisible)
  window.removeEventListener('pageshow', restoreOnPageShow)
  window.removeEventListener('online', restoreOnOnline)
})

const recordHand = () => {
  router.push({
    name: 'tournament-hand-record',
    params: { levelName: levelId.value },
    query: { levelName: levelName.value },
  })
}

const copyLevelText = async () => {
  if (!handLogStore.selectedEvent || !blindLevel.value) return

  try {
    await copyToClipboard(
      buildLevelReviewText({
        event: handLogStore.selectedEvent,
        blindLevel: blindLevel.value,
        hands: blindLevel.value.hands || [],
      }),
    )
    alert.show('레벨 복기 텍스트를 복사했습니다.', 'success')
  } catch {
    alert.show('텍스트를 복사하지 못했습니다.', 'error')
  }
}

const endLevel = async () => {
  if (endingLevel.value) return
  const currentLevelNo = Number(blindLevel.value?.levelNo || 0)
  const expectedNextLevelNo = currentLevelNo + 1
  const nextLevel = [...(handLogStore.selectedEvent?.blindLevels || [])].find(
    (level) => Number(level.levelNo) === expectedNextLevelNo,
  )

  if (!nextLevel) {
    router.push({
      name: 'tournament-running',
      query: {
        addLevel: '1',
        nextLevelNo: String(expectedNextLevelNo),
        activateLevel: '1',
      },
    })
    return
  }

  endingLevel.value = true
  const nextStack =
    nextLevel.endStack ?? nextLevel.displayStartStack ?? nextLevel.startStack ?? currentStack.value
  const nextAverageStack =
    parseStoredNumber(nextLevel.averageStack) ?? parseStoredNumber(averageStack.value)
  storedTournament.currentBlindLevelId = nextLevel.id
  storedTournament.currentLevel = `L${nextLevel.levelNo}`
  storedTournament.currentBlinds = {
    smallBlind: formatNumber(nextLevel.smallBlind),
    bigBlind: formatNumber(nextLevel.bigBlind),
    ante: formatNumber(nextLevel.ante),
  }
  storedTournament.blinds = [nextLevel.smallBlind, nextLevel.bigBlind, nextLevel.ante]
    .map(formatNumber)
    .join(' / ')
  storedTournament.currentStack =
    nextStack === null || nextStack === undefined ? null : formatNumber(nextStack)
  storedTournament.currentBb =
    nextStack != null && Number(nextLevel.bigBlind) > 0
      ? Number((Number(nextStack) / Number(nextLevel.bigBlind)).toFixed(1))
      : null
  storedTournament.averageStack =
    nextAverageStack == null ? null : formatNumber(nextAverageStack)
  storedTournament.averageBb =
    nextAverageStack != null && Number(nextLevel.bigBlind) > 0
      ? Number((Number(nextAverageStack) / Number(nextLevel.bigBlind)).toFixed(1))
      : null
  localStorage.setItem('pokerly-running-tournament', JSON.stringify(storedTournament))
  try {
    if (storedTournament.sessionId) {
      await updateGameSessionProgress(storedTournament.sessionId, {
        currentLevel: storedTournament.currentLevel,
        currentStack: nextStack,
        averageStack: nextAverageStack,
        currentSmallBlind: nextLevel.smallBlind,
        currentBigBlind: nextLevel.bigBlind,
        currentAnte: nextLevel.ante,
      })
    }
    await router.push({ name: 'tournament-running' })
  } catch {
    alert.show('레벨을 종료하지 못했습니다.', 'error')
  } finally {
    endingLevel.value = false
  }
}

const openHand = (handId) => {
  router.push({
    name: 'tournament-hand-detail',
    params: { levelName: levelId.value, handId },
    query: {
      levelName: levelName.value,
      ...(eventId.value ? { eventId: eventId.value } : {}),
      ...(route.query.tournamentId ? { tournamentId: route.query.tournamentId } : {}),
      ...(route.query.from ? { from: route.query.from } : {}),
      ...(route.query.legacyEventId ? { legacyEventId: route.query.legacyEventId } : {}),
    },
  })
}

const startHandSelection = () => {
  showHandListMenu.value = false
  selectionMode.value = true
  selectedHandIds.value = []
}

const cancelHandSelection = () => {
  selectionMode.value = false
  selectedHandIds.value = []
}

const handleHandClick = (handId) => {
  if (!selectionMode.value) {
    openHand(handId)
    return
  }

  selectedHandIds.value = selectedHandIds.value.includes(handId)
    ? selectedHandIds.value.filter((id) => id !== handId)
    : [...selectedHandIds.value, handId]
}

const moveSelectedHands = async (targetLevelId, targetLevelName) => {
  if (movingHands.value) return
  if (!eventId.value || !sourceLevelId.value || !targetLevelId || !selectedHandIds.value.length) {
    alert.show('이동할 핸드 또는 레벨 정보를 확인하지 못했습니다.', 'error')
    return
  }

  const movedCount = selectedHandIds.value.length
  const currentEventId = eventId.value
  const currentLevelId = sourceLevelId.value
  movingHands.value = true
  movingTargetLevelId.value = targetLevelId
  try {
    await handLogStore.moveHandsToBlindLevel(
      currentEventId,
      currentLevelId,
      selectedHandIds.value,
      targetLevelId,
    )
    await handLogStore.fetchEventDetail(currentEventId)
    await handLogStore.fetchBlindLevelDetail(currentEventId, currentLevelId)
    moveSheetOpen.value = false
    cancelHandSelection()
    alert.show(`${movedCount}개 핸드를 ${targetLevelName}으로 이동했습니다.`, 'success')
  } catch (error) {
    alert.show(
      error?.response?.data?.error?.message || '선택한 핸드를 이동하지 못했습니다.',
      'error',
    )
  } finally {
    movingHands.value = false
    movingTargetLevelId.value = null
  }
}

const goBack = () => {
  if (route.query.tournamentId) {
    router.push({
      name: 'tournament-summary',
      params: { tournamentId: route.query.tournamentId },
      query: {
        ...(route.query.from ? { from: route.query.from } : {}),
        ...(route.query.legacyEventId ? { legacyEventId: route.query.legacyEventId } : {}),
      },
    })
    return
  }

  router.push({ name: 'tournament-running' })
}
</script>

<style scoped>
.level-detail-page {
  display: grid;
  align-content: start;
  gap: 20px;
  min-height: 100%;
  padding: var(--v2-page-padding-top) var(--v2-page-padding-x)
    calc(104px + env(safe-area-inset-bottom));
}

.level-detail-page--summary {
  padding-bottom: calc(24px + env(safe-area-inset-bottom));
}

.level-topbar {
  display: grid;
  grid-template-columns: 44px minmax(0, 1fr) 44px;
  align-items: center;
  gap: 10px;
  min-height: var(--v2-detail-topbar-height);
}

.level-topbar__title {
  min-width: 0;
  text-align: center;
}

.level-topbar h1 {
  margin: 0;
  color: var(--v2-text-main);
  font-size: 19px;
  font-weight: 650;
  line-height: 1.2;
  text-align: center;
}

.level-topbar__title span {
  display: block;
  margin-top: 3px;
  color: var(--v2-primary);
  font-size: 12px;
  font-weight: 650;
  line-height: 1.2;
  letter-spacing: -0.01em;
  font-variant-numeric: tabular-nums;
}

.level-topbar__back {
  width: 44px;
  height: 44px;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--v2-text-main);
  display: grid;
  place-items: center;
}

.stack-card {
  position: relative;
  padding: 44px 18px 18px;
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-lg);
  background: #ffffff;
  box-shadow: 0 6px 18px rgba(28, 18, 60, 0.035);
  display: block;
}

.level-topbar__copy {
  display: grid;
  width: 44px;
  height: 44px;
  place-items: center;
  justify-self: end;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--v2-text-sub);
}

.level-topbar__copy:disabled {
  opacity: 0.35;
}

.level-state-card,
.hand-list__empty {
  margin: 0;
  padding: 28px 18px;
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-lg);
  background: #ffffff;
  color: var(--v2-text-sub);
  font-size: 13px;
  text-align: center;
}

.hand-list__empty {
  border: 0;
  border-radius: 0;
}

.stack-card__edit {
  position: absolute;
  top: 9px;
  right: 12px;
  width: 32px;
  height: 32px;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--v2-primary);
  display: grid;
  place-items: center;
}

.stack-card__metrics {
  display: grid;
  grid-template-columns: minmax(0, 1.08fr) minmax(0, 0.92fr);
  padding-top: 2px;
}

.stack-card__item {
  min-width: 0;
  padding: 0 0 0 18px;
}

.stack-card__item:first-child {
  padding-right: 18px;
  padding-left: 0;
}

.stack-card__item:last-child {
  border-left: 1px solid var(--v2-border);
}

.stack-card__item span {
  color: var(--v2-text-sub);
  font-size: 12px;
  font-weight: 450;
}

.stack-card__value {
  min-width: 0;
  margin-top: 8px;
  display: flex;
  align-items: baseline;
  gap: 7px;
}

.stack-card__value strong {
  color: var(--v2-text-main);
  font-size: 20px;
  font-weight: 620;
  line-height: 1;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}

.stack-card__value small {
  padding: 4px 6px;
  border-radius: 6px;
  background: #f2effb;
  color: var(--v2-primary);
  font-size: 11px;
  font-weight: 560;
  line-height: 1;
  white-space: nowrap;
}


.level-stats,
.rank-distribution,
.hand-groups,
.hand-section {
  display: grid;
  gap: 12px;
}

.level-stats h2,
.rank-distribution h2,
.hand-groups h2,
.hand-section h2 {
  margin: 0;
  color: var(--v2-text-main);
  font-size: 17px;
  font-weight: 560;
  line-height: 1.2;
}

.level-stats__heading {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.rank-distribution__heading {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
}

.rank-distribution__heading > span {
  color: var(--v2-text-sub);
  font-size: 11px;
  font-weight: 430;
  white-space: nowrap;
}

.rank-distribution__card {
  padding: 16px;
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-lg);
  background: #ffffff;
  box-shadow: 0 5px 14px rgba(28, 18, 60, 0.025);
}

.rank-meter {
  height: 12px;
  overflow: hidden;
  border-radius: 999px;
  background: #f0edf5;
  display: flex;
}

.rank-meter > span {
  height: 100%;
}

.rank-distribution__list {
  margin-top: 12px;
  display: grid;
}

.rank-distribution__list > div {
  min-height: 48px;
  border-bottom: 1px solid var(--v2-border);
  display: grid;
  grid-template-columns: 9px minmax(0, 1fr) auto 36px;
  align-items: center;
  gap: 9px;
}

.rank-distribution__list > div:last-child {
  border-bottom: 0;
}

.rank-distribution__list i {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.rank-distribution__list span {
  min-width: 0;
  display: grid;
  gap: 1px;
}

.rank-distribution__list strong {
  color: var(--v2-text-main);
  font-size: 13px;
  font-weight: 560;
}

.rank-distribution__list small,
.rank-distribution__list em {
  color: var(--v2-text-sub);
  font-size: 11px;
  font-style: normal;
}

.rank-distribution__list b {
  color: var(--v2-text-main);
  font-size: 13px;
  font-weight: 560;
}

.rank-distribution__list em {
  text-align: right;
}

.rank-tone--premium {
  background: #7143df;
}

.rank-tone--strong {
  background: #2983d8;
}

.rank-tone--middle {
  background: #159487;
}

.rank-tone--low {
  background: #f58a0a;
}

.level-stats__heading > span {
  color: var(--v2-text-sub);
  font-size: 12px;
  font-weight: 430;
}

.hand-section__header {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.hand-list-action {
  position: relative;
}

.hand-list-action > button {
  width: 36px;
  height: 36px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: #f1eff6;
  color: #625c70;
  display: grid;
  place-items: center;
  outline: 0;
}

.hand-list-menu {
  position: absolute;
  top: 42px;
  right: 0;
  z-index: 4;
  width: 156px;
  overflow: hidden;
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-lg);
  background: #ffffff;
  box-shadow: 0 12px 28px rgba(28, 18, 60, 0.16);
}

.hand-list-menu button {
  width: 100%;
  min-height: 42px;
  padding: 0 12px;
  border: 0;
  background: #ffffff;
  color: var(--v2-text-main);
  display: flex;
  align-items: center;
  gap: 9px;
  font: inherit;
  font-size: 13px;
  font-weight: 520;
  white-space: nowrap;
}

.hand-list-menu button:active {
  background: #faf9ff;
}

.hand-selection-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.hand-selection-actions button {
  min-height: 32px;
  padding: 0 10px;
  border: 0;
  border-radius: var(--v2-radius-sm);
  background: var(--v2-primary-soft);
  color: var(--v2-primary);
  font: inherit;
  font-size: 13px;
  font-weight: 520;
}

.hand-selection-actions button:first-child {
  background: transparent;
  color: var(--v2-text-sub);
}

.hand-selection-actions button:disabled {
  opacity: 0.4;
}

.level-stats__grid {
  overflow: hidden;
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-lg);
  background: #ffffff;
  box-shadow: 0 5px 14px rgba(28, 18, 60, 0.025);
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.level-stats__grid div {
  min-height: 82px;
  padding: 12px 6px;
  border-right: 1px solid var(--v2-border);
  display: grid;
  place-items: center;
  align-content: center;
  gap: 8px;
  text-align: center;
}

.level-stats__grid div:last-child {
  border-right: 0;
}

.level-stats__grid span {
  color: var(--v2-text-sub);
  font-size: 12px;
  font-weight: 430;
  line-height: 1.2;
  white-space: nowrap;
}

.level-stats__grid strong {
  background: linear-gradient(135deg, #7957f2 0%, #5d35d9 100%);
  color: transparent;
  font-size: 20px;
  font-weight: 560;
  line-height: 1;
  -webkit-background-clip: text;
  background-clip: text;
}

.hand-groups__card {
  overflow: hidden;
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-lg);
  background: #ffffff;
  box-shadow: 0 5px 14px rgba(28, 18, 60, 0.025);
}

.hand-group {
  padding: 16px;
  border-bottom: 1px solid var(--v2-border);
}

.hand-group:last-child {
  border-bottom: 0;
}

.hand-group__heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
}

.hand-group__heading > div {
  min-width: 0;
  display: grid;
  gap: 4px;
}

.hand-group__heading strong {
  color: var(--v2-text-main);
  font-size: 15px;
  font-weight: 600;
}

.hand-group__heading span,
.hand-group > p {
  color: var(--v2-text-sub);
  font-size: 12px;
  line-height: 1.35;
}

.hand-group__heading b {
  color: var(--v2-text-main);
  font-size: 15px;
  font-weight: 600;
  white-space: nowrap;
}

.hand-group__items {
  margin-top: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
}

.hand-group__items > button {
  min-height: 32px;
  padding: 0 11px;
  border: 1px solid var(--v2-border);
  border-radius: 999px;
  background: #ffffff;
  color: var(--v2-text-main);
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  font-weight: 600;
  font-family: inherit;
}

.hand-group__items > button.active {
  border-color: var(--v2-primary);
  background: var(--v2-primary-soft);
  color: var(--v2-primary);
}

.hand-group__items small {
  color: var(--v2-text-sub);
  font-size: 12px;
  font-weight: 520;
}

.hand-group > p {
  margin: 10px 0 0;
}

.hand-group__details {
  margin-top: 12px;
  overflow: hidden;
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-md);
  background: #faf9fd;
}

.hand-group__details > button {
  width: 100%;
  min-height: 58px;
  padding: 10px 12px;
  border: 0;
  border-bottom: 1px solid var(--v2-border);
  background: transparent;
  color: var(--v2-text-main);
  display: grid;
  justify-items: start;
  gap: 5px;
  font-family: inherit;
  text-align: left;
}

.hand-group__details > button:last-child {
  border-bottom: 0;
}

.hand-group__details > button:active {
  background: var(--v2-primary-soft);
}

.hand-group__details strong {
  font-size: 13px;
  font-weight: 600;
}

.hand-group__details span {
  color: var(--v2-text-sub);
  font-size: 12px;
}

.hand-list {
  overflow: hidden;
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-lg);
  background: #ffffff;
}

.hand-row {
  min-height: 74px;
  padding: 10px 12px;
  border-bottom: 1px solid var(--v2-border);
  display: grid;
  grid-template-columns: 104px minmax(0, 1fr) auto;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: background 150ms ease;
}

.hand-row--selecting {
  grid-template-columns: 104px minmax(0, 1fr) auto 28px;
}

.hand-row.selected {
  background: var(--v2-primary-soft);
}

.hand-row:active {
  background: #faf9ff;
}

.hand-row:last-child {
  border-bottom: 0;
}

.cards {
  display: grid;
  grid-template-columns: repeat(2, 46px);
  gap: 6px;
}

.cards span {
  height: 52px;
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-sm);
  background: #ffffff;
  color: var(--v2-text-main);
  display: grid;
  place-items: center;
  align-content: center;
  gap: 2px;
}

.cards span.red {
  color: #e11d48;
}

.cards b {
  font-size: 17px;
  font-weight: 560;
  line-height: 1;
}

.cards em {
  font-size: 15px;
  font-style: normal;
  line-height: 1;
}

.hand-row__main {
  min-width: 0;
}

.hand-row__main > span {
  padding: 3px 7px;
  border-radius: var(--v2-radius-sm);
  background: #f1eff6;
  color: #777188;
  font-size: 12px;
}

.hand-row__result {
  padding: 7px 10px;
  border-radius: var(--v2-radius-sm);
  font-size: 13px;
  font-weight: 520;
  line-height: 1;
  white-space: nowrap;
}

.hand-row__status {
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
}

.hand-row__review-slot {
  width: 14px;
  height: 14px;
  flex: 0 0 14px;
  display: grid;
  place-items: center;
}

.hand-row__review-dot {
  width: 7px;
  height: 7px;
  flex: 0 0 auto;
  border-radius: 50%;
  background: var(--v2-primary);
}

.hand-row__result--win {
  background: rgba(22, 163, 74, 0.14);
  color: #15803d;
}

.hand-row__result--lose {
  background: rgba(239, 68, 68, 0.1);
  color: var(--v2-danger);
}

.hand-row__result--draw {
  background: #f2f1f5;
  color: #625c70;
}

.hand-row button {
  width: 28px;
  height: 36px;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--v2-text-main);
}

.hand-row__check {
  width: 22px;
  height: 22px;
  border: 1px solid #d3cde1;
  border-radius: 50%;
  color: #ffffff;
  display: grid;
  place-items: center;
}

.hand-row.selected .hand-row__check {
  border-color: var(--v2-primary);
  background: var(--v2-primary);
}

.move-level-sheet {
  width: 100%;
  padding: 10px 20px calc(20px + env(safe-area-inset-bottom));
  border-radius: 18px 18px 0 0;
  background: #ffffff;
}

.stack-sheet {
  width: min(100%, 520px);
  margin: 0 auto;
  padding: 10px 24px calc(24px + env(safe-area-inset-bottom));
  border-radius: 24px 24px 0 0;
  background: #ffffff;
  display: grid;
  gap: 20px;
}

.stack-sheet__handle {
  width: 38px;
  height: 5px;
  margin: 0 auto;
  border-radius: 999px;
  background: #d4d0dc;
}

.stack-sheet h2 {
  margin: 0;
  color: var(--v2-text-main);
  font-size: 20px;
  font-weight: 620;
  text-align: center;
}

.stack-sheet label {
  display: grid;
  gap: 8px;
}

.stack-sheet label span {
  color: var(--v2-text-main);
  font-size: 14px;
  font-weight: 560;
}

.stack-sheet input {
  width: 100%;
  height: 54px;
  padding: 0 14px;
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-sm);
  outline: 0;
  color: var(--v2-text-main);
  font: inherit;
  font-size: 18px;
}

.stack-sheet input:focus {
  border-color: var(--v2-primary);
}

.stack-sheet > button {
  width: 100%;
  height: 52px;
  border: 0;
  border-radius: var(--v2-radius-sm);
  background: var(--v2-primary);
  color: #ffffff;
  font: inherit;
  font-size: 16px;
  font-weight: 620;
}

.stack-sheet > button:disabled {
  opacity: 0.55;
}

.move-level-sheet__handle {
  width: 36px;
  height: 4px;
  margin: 0 auto 18px;
  border-radius: 999px;
  background: #b8b2c7;
}

.move-level-sheet h2 {
  margin: 0;
  color: var(--v2-text-main);
  font-size: 17px;
  font-weight: 560;
}

.move-level-sheet p {
  margin: 4px 0 8px;
  color: var(--v2-text-sub);
  font-size: 13px;
  font-weight: 430;
  line-height: 1.4;
}

.move-level-sheet button {
  width: 100%;
  min-height: 48px;
  padding: 0 4px;
  border: 0;
  border-bottom: 1px solid var(--v2-border);
  background: transparent;
  color: var(--v2-text-main);
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr) 20px;
  align-items: center;
  gap: 10px;
  font: inherit;
  font-size: 14px;
  font-weight: 520;
}

.move-level-sheet button strong {
  font-weight: 560;
  text-align: left;
}

.move-level-sheet button span {
  overflow: hidden;
  color: var(--v2-text-sub);
  font-weight: 430;
  text-align: left;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.hand-fab {
  position: fixed;
  right: 26px;
  bottom: 174px;
  width: 72px;
  height: 72px;
  border: 0;
  border-radius: 50%;
  background: linear-gradient(135deg, #6d45e8 0%, #5317f4 100%);
  color: #ffffff;
  box-shadow: 0 10px 22px rgba(83, 23, 244, 0.24);
  display: grid;
  place-items: center;
  align-content: center;
  gap: 3px;
  font: inherit;
  font-size: 11px;
  font-weight: 560;
  backface-visibility: hidden;
  transform: translateZ(0);
}

.hand-fab__icon {
  position: relative;
  width: 27px;
  height: 25px;
  filter: drop-shadow(0 2px 4px rgba(28, 18, 60, 0.12));
}

.hand-fab__icon::before,
.hand-fab__icon::after {
  position: absolute;
  content: '';
  border-radius: 4px;
}

.hand-fab__icon::before {
  left: 1px;
  top: 3px;
  width: 17px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.78);
  transform: rotate(-5deg);
}

.hand-fab__icon::after {
  left: 8px;
  top: 1px;
  width: 17px;
  height: 21px;
  background: #ffffff;
  box-shadow: inset 0 0 0 1px rgba(83, 23, 244, 0.14);
  transform: rotate(8deg);
}

.hand-fab__icon i {
  position: absolute;
  right: -1px;
  bottom: 0;
  z-index: 1;
  width: 12px;
  height: 12px;
  border: 2px solid #5b2ff0;
  border-radius: 50%;
  background: #ffffff;
}

.hand-fab__icon i::before,
.hand-fab__icon i::after {
  position: absolute;
  left: 50%;
  top: 50%;
  content: '';
  border-radius: 999px;
  background: #5b2ff0;
  transform: translate(-50%, -50%);
}

.hand-fab__icon i::before {
  width: 7px;
  height: 2px;
}

.hand-fab__icon i::after {
  width: 2px;
  height: 7px;
}

.hand-fab__icon + span {
  line-height: 1;
}

@media (max-width: 480px) {
  .stack-card {
    padding-right: 14px;
    padding-left: 14px;
  }

  .stack-card__metrics {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .stack-card__item {
    padding-left: 14px;
  }

  .stack-card__item:first-child {
    padding-right: 14px;
  }

  .stack-card__value {
    align-items: flex-start;
    flex-direction: column;
    gap: 6px;
  }

  .stack-card__value strong {
    max-width: 100%;
    font-size: clamp(17px, 5vw, 20px);
    font-variant-numeric: tabular-nums;
    letter-spacing: -0.025em;
  }

  .hand-fab {
    right: var(--v2-page-padding-x);
    bottom: 170px;
    width: 64px;
    height: 64px;
  }

  .level-topbar {
    grid-template-columns: 44px minmax(0, 1fr) 44px;
  }

  .hand-row {
    grid-template-columns: 84px minmax(0, 1fr) auto;
    gap: 8px;
    padding: 9px 10px;
  }

  .hand-row--selecting {
    grid-template-columns: 84px minmax(0, 1fr) auto 24px;
  }

  .cards {
    grid-template-columns: repeat(2, 38px);
    gap: 5px;
  }

  .cards span {
    height: 48px;
  }

  .hand-row__result {
    padding: 7px 8px;
    font-size: 12px;
  }

  .hand-fab {
    right: 22px;
    width: 68px;
    height: 68px;
    font-size: 10px;
  }
}
</style>
