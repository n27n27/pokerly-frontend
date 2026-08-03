<template>
  <q-page class="review-edit-page">
    <header class="edit-topbar">
      <button class="topbar-text" type="button" @click="router.back()">취소</button>
      <h1>{{ isEditMode ? '복기 수정' : '복기 작성' }} ({{ step }}/{{ totalSteps }})</h1>
      <button
        class="topbar-text next"
        type="button"
        :disabled="stepBlocked"
        @click="nextStep"
      >
        {{ step === totalSteps ? '완료' : '다음' }}
      </button>
    </header>

    <div
      class="step-progress"
      :style="{ gridTemplateColumns: `repeat(${totalSteps}, 1fr)` }"
      aria-label="복기 작성 진행 단계"
    >
        <i v-for="index in totalSteps" :key="index" :class="{ active: index <= step }"></i>
      </div>

      <section v-if="step === 1" class="edit-card">
        <div class="step-heading"><h2>보드</h2></div>
        <div class="board-editor">
          <div v-for="street in boardStreets" :key="street.name" class="street-group">
            <span>{{ street.name }}</span>
            <div>
              <button
                v-for="(card, index) in street.cards"
                :key="`${street.key}-${index}`"
                class="mini-card"
                :class="{ red: card?.red, empty: !card }"
                type="button"
                @click="openCardPicker(street.key, index)"
              >
                <template v-if="card"><b>{{ card.rank }}</b><em>{{ card.suit }}</em></template>
                <q-icon v-else name="add" size="28px" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <section v-else-if="step === 2" class="edit-card action-timeline-editor">
        <div class="step-heading">
          <h2>액션 타임라인</h2>
          <button
            v-if="timeline.started.value"
            type="button"
            @click="editParticipants"
          >
            참여 인원 수정
          </button>
        </div>

        <div v-if="!timeline.started.value" class="participant-setup">
          <div>
            <strong>액션을 기록할 플레이어</strong>
            <span>선택하지 않은 플레이어는 프리플랍 폴드로 처리됩니다.</span>
          </div>
          <div class="participant-grid">
            <button
              v-for="position in positionOptions"
              :key="position"
              type="button"
              :class="{ selected: selectedPlayers.includes(position) }"
              @click="togglePlayer(position)"
            >
              {{ position }}
              <small v-if="position === heroPosition">나</small>
            </button>
          </div>
          <button
            class="start-actions"
            type="button"
            :disabled="selectedPlayers.length < 2"
            @click="timeline.start(selectedPlayers, positionOptions)"
          >
            액션 입력 시작
          </button>
        </div>

        <template v-else>
          <div class="action-status">
            <span class="action-status__street">
              {{ streetLabel(timeline.street.value) }}
              <small>팟 {{ formatChips(timeline.potSize.value) }}</small>
            </span>
            <span v-if="!timeline.streetComplete.value" class="action-status__turn">
              <strong :class="{ 'is-hero-turn': isHeroTurn }">
                {{ isHeroTurn ? '내 차례' : `${timeline.currentPlayer.value} 차례` }}
              </strong>
              <small v-if="isHeroTurn">{{ timeline.currentPlayer.value }}</small>
              <small v-if="timeline.callAmount.value">
                콜 {{ Number(timeline.callAmount.value).toLocaleString('ko-KR') }}
              </small>
            </span>
            <strong v-else>{{ timeline.handComplete.value ? '핸드 종료' : '스트리트 완료' }}</strong>
          </div>

          <div v-if="!timeline.streetComplete.value" class="available-actions">
            <button
              v-for="action in timeline.availableActions.value"
              :key="action"
              type="button"
              @click="selectTimelineAction(action)"
            >
              {{ timelineButtonLabel(action) }}
            </button>
          </div>

          <div v-if="pendingAction" class="amount-entry">
            <label>
              <span>금액</span>
              <input v-model="actionAmount" inputmode="numeric" autofocus />
            </label>
            <span class="amount-entry__bb">
              {{ amountInBb ? `${amountInBb} BB` : '' }}
            </span>
            <button type="button" :disabled="!validActionAmount" @click="confirmTimelineAction">
              입력
            </button>
          </div>

          <div v-if="timeline.actions.value.length" class="timeline-list">
            <div class="timeline-list__heading">
              <strong>입력한 액션</strong>
              <button type="button" @click="undoTimelineAction">마지막 취소</button>
            </div>
            <p v-if="isEditMode" class="timeline-list__hint">
              수정할 액션을 누르면 그 지점부터 다시 입력합니다.
            </p>
            <button
              v-for="(item, index) in timeline.actions.value"
              :key="item.id"
              class="timeline-list__item"
              type="button"
              @click="rewindTimelineFrom(index)"
            >
              <span>{{ streetLabel(item.street) }}</span>
              <strong>{{ item.player }}</strong>
              <b>{{ timelineItemLabel(item) }}</b>
            </button>
          </div>

          <button
            v-if="timeline.streetComplete.value && !timeline.handComplete.value"
            class="next-street"
            type="button"
            @click="timeline.advanceStreet"
          >
            {{ nextStreetLabel }}로 이동
          </button>
        </template>
      </section>

      <section v-else-if="showdownRequired && step === 3" class="edit-card">
        <div class="step-heading"><h2>쇼다운 카드</h2></div>
        <div class="showdown-editor">
          <p>리버 콜 이후 공개된 카드를 입력해주세요.</p>
          <div
            v-for="position in opponentShowdownPlayers"
            :key="position"
            class="showdown-player"
          >
            <strong>{{ position }}</strong>
            <div>
              <button
                v-for="(card, index) in (showdownCards[position] || [null, null])"
                :key="`${position}-${index}`"
                class="mini-card"
                :class="{ red: card?.red, empty: !card }"
                type="button"
                @click="openShowdownCardPicker(position, index)"
              >
                <template v-if="card"><b>{{ card.rank }}</b><em>{{ card.suit }}</em></template>
                <q-icon v-else name="add" size="28px" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <section v-else class="edit-card">
        <div class="step-heading"><h2>메모</h2></div>
        <div class="memo-field">
          <textarea v-model="memo" maxlength="500" placeholder="이 핸드에서 기억하고 싶은 상황이나 생각을 남겨보세요." />
          <span>{{ memo.length }}/500</span>
        </div>
      </section>

      <div class="bottom-actions">
        <button v-if="step > 1" class="secondary-action" type="button" @click="step -= 1">이전</button>
        <button
          class="primary-action"
          type="button"
          :disabled="stepBlocked"
          @click="nextStep"
        >
          {{ step === totalSteps ? '저장하기' : '다음' }}
        </button>
    </div>

    <CardPickerSheet
      v-model="pickerOpen"
      :active-card="activeCard"
      :used-codes="usedCardCodes"
      :done-disabled="flopSelectionIncomplete"
      @select="selectCard"
      @clear="clearActiveCard"
    />
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import CardPickerSheet from 'src/shared/components/CardPickerSheet.vue'
import { useAlert } from 'src/composables/useAlert'
import { useHandActionTimeline } from 'src/features/tournament/composables/useHandActionTimeline'
import { useHandLogStore } from 'src/stores/handLog'

const route = useRoute()
const router = useRouter()
const alert = useAlert()
const handLogStore = useHandLogStore()
const step = ref(1)
const pickerOpen = ref(false)
const activeStreetKey = ref('flop')
const activeCardIndex = ref(0)
const activeShowdownPlayer = ref('')
const showdownCards = ref({})
const memo = ref('')
const isEditMode = ref(false)
const levelId = computed(() => String(route.params.levelName || ''))
const levelName = computed(() => String(route.query.levelName || '') || '-')
const handId = computed(() => String(route.params.handId || ''))

const boardStreets = ref([
  { key: 'flop', name: '플랍', cards: [null, null, null] },
  { key: 'turn', name: '턴', cards: [null] },
  { key: 'river', name: '리버', cards: [null] },
])
const storedTournament = (() => {
  try {
    return JSON.parse(localStorage.getItem('pokerly-running-tournament')) || {}
  } catch {
    return {}
  }
})()
const bigBlind = Number(
  String(
    storedTournament.currentBlinds?.bigBlind ||
      storedTournament.startBlinds?.bigBlind ||
      0,
  ).replaceAll(',', ''),
)
const ante = Number(
  String(
    storedTournament.currentBlinds?.ante ||
      storedTournament.startBlinds?.ante ||
      0,
  ).replaceAll(',', ''),
)
const handedCount = ref(
  Math.min(10, Math.max(4, Number(storedTournament.currentHandedCount) || 10)),
)
const positionMap = {
  4: ['CO', 'BTN', 'SB', 'BB'],
  5: ['HJ', 'CO', 'BTN', 'SB', 'BB'],
  6: ['UTG', 'HJ', 'CO', 'BTN', 'SB', 'BB'],
  7: ['UTG', 'LJ', 'HJ', 'CO', 'BTN', 'SB', 'BB'],
  8: ['UTG', 'MP', 'LJ', 'HJ', 'CO', 'BTN', 'SB', 'BB'],
  9: ['UTG', 'UTG+1', 'MP', 'LJ', 'HJ', 'CO', 'BTN', 'SB', 'BB'],
  10: ['UTG', 'UTG+1', 'UTG+2', 'MP', 'LJ', 'HJ', 'CO', 'BTN', 'SB', 'BB'],
}
const positionOptions = computed(() => positionMap[handedCount.value])
const heroPosition = computed(() => handLogStore.selectedHand?.position || '')
const isHeroTurn = computed(
  () =>
    Boolean(heroPosition.value) &&
    timeline.currentPlayer.value === heroPosition.value,
)
const selectedPlayers = ref([])
const timeline = useHandActionTimeline({ bigBlind, ante })
const showdownRequired = computed(() => timeline.showdownRequired.value)
const opponentShowdownPlayers = computed(() =>
  timeline.showdownPlayers.value.filter((position) => position !== heroPosition.value),
)
const totalSteps = computed(() => (showdownRequired.value ? 4 : 3))
const showdownComplete = computed(() =>
  !showdownRequired.value ||
  opponentShowdownPlayers.value.every(
    (position) => showdownCards.value[position]?.filter(Boolean).length === 2,
  ),
)
const stepBlocked = computed(
  () =>
    (step.value === 2 && !timeline.handComplete.value) ||
    (showdownRequired.value && step.value === 3 && !showdownComplete.value),
)
const pendingAction = ref('')
const actionAmount = ref('')
const aggressiveActions = ['OPEN', 'BET', 'RAISE']

const togglePlayer = (position) => {
  selectedPlayers.value = selectedPlayers.value.includes(position)
    ? selectedPlayers.value.filter((item) => item !== position)
    : [...selectedPlayers.value, position]
}
const streetLabel = (street) =>
  ({ PREFLOP: '프리플랍', FLOP: '플랍', TURN: '턴', RIVER: '리버' })[street] || street
const timelineActionLabel = (action) =>
  ({ FOLD: '폴드', LIMP: '림프', OPEN: '오픈', CHECK: '체크', CALL: '콜', BET: '벳', RAISE: '레이즈' })[action] || action
const formatChips = (value) => Number(value || 0).toLocaleString('ko-KR')
const preflopAggressionCount = computed(
  () =>
    timeline.actions.value.filter(
      (item) =>
        item.street === 'PREFLOP' &&
        ['OPEN', 'RAISE'].includes(item.type),
    ).length,
)
const timelineButtonLabel = (action) => {
  if (action !== 'RAISE' || timeline.street.value !== 'PREFLOP') {
    return timelineActionLabel(action)
  }
  return `${preflopAggressionCount.value + 2}벳`
}
const selectTimelineAction = (action) => {
  if (aggressiveActions.includes(action)) {
    pendingAction.value = action
    actionAmount.value = ''
    return
  }
  timeline.recordAction(action)
}
const numericActionAmount = computed(() => Number(String(actionAmount.value).replaceAll(',', '')))
const validActionAmount = computed(
  () => numericActionAmount.value >= Number(timeline.minRaiseAmount.value || 0),
)
const amountInBb = computed(() =>
  bigBlind > 0 && numericActionAmount.value
    ? Number((numericActionAmount.value / bigBlind).toFixed(1))
    : '',
)
const confirmTimelineAction = () => {
  if (!validActionAmount.value) return
  if (timeline.recordAction(pendingAction.value, numericActionAmount.value)) {
    pendingAction.value = ''
    actionAmount.value = ''
  }
}
const clearPendingTimelineAction = () => {
  pendingAction.value = ''
  actionAmount.value = ''
  showdownCards.value = {}
}
const editParticipants = () => {
  selectedPlayers.value = [...timeline.trackedPlayers.value]
  clearPendingTimelineAction()
  timeline.reset()
}
const rewindTimelineFrom = (index) => {
  clearPendingTimelineAction()
  if (!timeline.rewindTo(index, positionOptions.value)) {
    alert.show('선택한 액션부터 다시 입력할 수 없습니다.', 'error')
  }
}
const undoTimelineAction = () => {
  clearPendingTimelineAction()
  if (timeline.undo()) return
  if (timeline.actions.value.length > 0) {
    timeline.rewindTo(timeline.actions.value.length - 1, positionOptions.value)
  }
}
const timelineItemLabel = (item) => {
  let label = timelineActionLabel(item.type)
  if (item.type === 'RAISE' && item.street === 'PREFLOP') {
    const itemIndex = timeline.actions.value.findIndex((target) => target.id === item.id)
    const previousAggressions = timeline.actions.value
      .slice(0, itemIndex)
      .filter(
        (target) =>
          target.street === 'PREFLOP' &&
          ['OPEN', 'RAISE'].includes(target.type),
      ).length
    label = `${previousAggressions + 2}벳`
  }
  if (!item.amount) return label
  const bb = bigBlind > 0 ? ` (${Number((item.amount / bigBlind).toFixed(1))}BB)` : ''
  return `${label} ${Number(item.amount).toLocaleString('ko-KR')}${bb}`
}
const nextStreetLabel = computed(() => {
  const streets = ['PREFLOP', 'FLOP', 'TURN', 'RIVER']
  return streetLabel(streets[streets.indexOf(timeline.street.value) + 1])
})

const loadReview = async () => {
  if (!storedTournament.eventId || !levelId.value || !handId.value) return
  try {
    const hand = await handLogStore.fetchHandDetail(
      storedTournament.eventId,
      levelId.value,
      handId.value,
    )
    if (!hand) return
    isEditMode.value = Boolean(
      hand.memo?.trim() ||
      hand.boardCards ||
      hand.actionTimeline,
    )
    handedCount.value = hand.handedCount
      ? Math.min(10, Math.max(4, Number(hand.handedCount)))
      : handedCount.value
    selectedPlayers.value = hand.position ? [hand.position] : []
    memo.value = hand.memo || ''
    if (hand.boardCards) {
      const savedBoard = JSON.parse(hand.boardCards)
      if (Array.isArray(savedBoard)) boardStreets.value = savedBoard
    }
    if (hand.actionTimeline) {
      const savedTimeline = JSON.parse(hand.actionTimeline)
      timeline.hydrate(savedTimeline)
      selectedPlayers.value = [...timeline.trackedPlayers.value]
      showdownCards.value = { ...(savedTimeline.showdownCards || {}) }
    }
  } catch {
    alert.show('복기 정보를 불러오지 못했습니다.', 'error')
  }
}

onMounted(loadReview)

const detailPath = computed(
  () => `/app/tournament/running/level/${levelId.value}/hand/${handId.value}`,
)
const activeStreet = computed(() => boardStreets.value.find((street) => street.key === activeStreetKey.value))
const activeCard = computed(() =>
  activeStreetKey.value === 'showdown'
    ? showdownCards.value[activeShowdownPlayer.value]?.[activeCardIndex.value] || null
    : activeStreet.value?.cards[activeCardIndex.value] || null,
)
const flopSelectionIncomplete = computed(
  () =>
    activeStreetKey.value === 'flop' &&
    activeStreet.value?.cards.some((card) => !card),
)
const heroCardCodes = computed(() => {
  const hand = handLogStore.selectedHand
  if (!hand?.firstRank || !hand?.secondRank) return []
  const suits = [
    hand.firstSuit || '♠',
    hand.secondSuit || (hand.suited ? hand.firstSuit || '♠' : '♥'),
  ]
  return [hand.firstRank, hand.secondRank].map((rank, index) => `${rank}${suits[index]}`)
})
const usedCardCodes = computed(() => [
  ...heroCardCodes.value,
  ...boardStreets.value
    .flatMap((street) => street.cards)
    .filter((card) => card && card !== activeCard.value)
    .map((card) => `${card.rank}${card.suit}`),
  ...Object.values(showdownCards.value)
    .flat()
    .filter((card) => card && card !== activeCard.value)
    .map((card) => `${card.rank}${card.suit}`),
])
const openCardPicker = (streetKey, index) => {
  activeShowdownPlayer.value = ''
  activeStreetKey.value = streetKey
  activeCardIndex.value = index
  pickerOpen.value = true
}
const openShowdownCardPicker = (position, index) => {
  if (!showdownCards.value[position]) {
    showdownCards.value[position] = [null, null]
  }
  activeStreetKey.value = 'showdown'
  activeShowdownPlayer.value = position
  activeCardIndex.value = index
  pickerOpen.value = true
}
const closeCardPicker = () => {
  pickerOpen.value = false
}
const selectCard = (card) => {
  if (activeStreetKey.value === 'showdown') {
    const cards = showdownCards.value[activeShowdownPlayer.value] || [null, null]
    cards[activeCardIndex.value] = card
    showdownCards.value[activeShowdownPlayer.value] = cards
    if (activeCardIndex.value === 0 && !cards[1]) activeCardIndex.value = 1
    else closeCardPicker()
    return
  }
  if (!activeStreet.value) return
  activeStreet.value.cards[activeCardIndex.value] = card

  if (activeStreetKey.value === 'flop') {
    const nextEmptyIndex = activeStreet.value.cards.findIndex(
      (item, index) => !item && index !== activeCardIndex.value,
    )
    if (nextEmptyIndex >= 0) {
      activeCardIndex.value = nextEmptyIndex
    }
    return
  }

  closeCardPicker()
}
const clearActiveCard = () => {
  if (activeStreetKey.value === 'showdown') {
    showdownCards.value[activeShowdownPlayer.value] = [null, null]
    activeCardIndex.value = 0
    return
  }
  if (activeStreet.value) {
    if (activeStreetKey.value === 'flop') {
      activeStreet.value.cards = activeStreet.value.cards.map(() => null)
      activeCardIndex.value = 0
    } else {
      activeStreet.value.cards[activeCardIndex.value] = null
    }
  }
}
const saveReview = async () => {
  const hand = handLogStore.selectedHand
  if (!hand || !storedTournament.eventId) return
  try {
    await handLogStore.updateHandInBlindLevel(
      storedTournament.eventId,
      levelId.value,
      handId.value,
      {
        ...hand,
        reviewRequired: true,
        memo: memo.value,
        boardCards: JSON.stringify(boardStreets.value),
        actionTimeline: JSON.stringify({
          ...timeline.serialize(),
          showdownCards: showdownCards.value,
        }),
      },
    )
    router.replace({
      path: detailPath.value,
      query: { levelName: levelName.value },
    })
  } catch {
    alert.show('복기를 저장하지 못했습니다.', 'error')
  }
}

const nextStep = () => {
  if (showdownRequired.value && step.value === 3 && !showdownComplete.value) {
    alert.show('쇼다운 카드를 모두 입력해 주세요.', 'warning')
    return
  }
  if (step.value < totalSteps.value) step.value += 1
  else saveReview()
}
</script>

<style scoped>
.review-edit-page { display: flex; min-height: 100%; flex-direction: column; gap: 14px; padding: 0 var(--v2-page-padding-x) 130px; }
.edit-topbar { display: grid; grid-template-columns: 56px 1fr 56px; align-items: center; min-height: 36px; }
.edit-topbar h1 { margin: 0; font-size: 16px; font-weight: 600; text-align: center; }
.topbar-text { min-height: 38px; padding: 0; border: 0; background: transparent; color: var(--v2-primary); font: inherit; font-size: 13px; text-align: left; }
.topbar-text.next { color: #806bd2; font-weight: 480; text-align: right; }
.step-progress { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; margin-top: -28px; padding: 0 2px; }
.step-progress i { height: 3px; border-radius: 3px; background: #e6e2f0; }
.step-progress i.active { background: var(--v2-primary); }
.edit-card { padding: 16px; border: 1px solid var(--v2-border); border-radius: var(--v2-radius-lg); background: #fff; box-shadow: 0 5px 14px rgba(28, 18, 60, .025); }
.step-heading { display: flex; align-items: center; gap: 7px; margin-bottom: 14px; padding-bottom: 10px; border-bottom: 1px solid #f0edf6; color: var(--v2-primary); }
.step-heading h2 { margin: 0; font-size: 16px; font-weight: 600; }
.step-heading > button { min-height: 30px; margin-left: auto; padding: 0; border: 0; background: transparent; color: var(--v2-primary); font: inherit; font-size: 11px; font-weight: 600; }
.street-group { display: grid; gap: 10px; }
.street-group + .street-group { margin-top: 22px; }
.street-group > span, .action-editor label > span { color: #4f495a; font-size: 13px; font-weight: 600; }
.street-group > div { display: flex; gap: 9px; }
.mini-card { display: inline-flex; width: 58px; height: 72px; align-items: center; justify-content: center; gap: 3px; padding: 0; border: 1px solid var(--v2-border); border-radius: 10px; background: #fff; color: var(--v2-text-main); font: inherit; }
.mini-card.red { color: #e11d48; }
.mini-card b { font-size: 20px; font-weight: 600; line-height: 1; }
.mini-card em { font-size: 18px; font-style: normal; line-height: 1; }
.mini-card.empty { border-style: dashed; color: #aaa1c4; font-size: 25px; }
.action-editor { display: grid; gap: 13px; }
.action-editor label { display: grid; gap: 7px; }
.action-editor button { display: grid; grid-template-columns: 1fr auto; min-height: 46px; align-items: center; gap: 8px; padding: 0 12px; border: 1px solid var(--v2-border); border-radius: 9px; background: #fff; color: var(--v2-primary); font: inherit; text-align: left; }
.action-editor button i { overflow: hidden; color: #504a5b; font-size: 11px; font-style: normal; text-overflow: ellipsis; white-space: nowrap; }
.participant-setup { display: grid; gap: 16px; }
.participant-setup > div:first-child { display: grid; gap: 4px; }
.participant-setup > div:first-child strong { color: var(--v2-text-main); font-size: 14px; font-weight: 600; }
.participant-setup > div:first-child span { color: var(--v2-text-sub); font-size: 12px; line-height: 1.45; }
.participant-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }
.participant-grid button { min-height: 44px; padding: 0 6px; border: 1px solid var(--v2-border); border-radius: var(--v2-radius-sm); background: #fff; color: var(--v2-text-main); font: inherit; font-size: 13px; font-weight: 560; }
.participant-grid button.selected { border-color: var(--v2-primary); background: var(--v2-primary-soft); color: var(--v2-primary); }
.participant-grid small { margin-left: 3px; font-size: 10px; font-weight: 560; }
.start-actions, .next-street { width: 100%; min-height: 48px; border: 0; border-radius: var(--v2-radius-md); background: var(--v2-primary); color: #fff; font: inherit; font-size: 14px; font-weight: 600; }
.start-actions:disabled { background: #e9e4f7; color: #aaa3bc; }
.action-status { padding: 13px 14px; border-radius: var(--v2-radius-md); background: var(--v2-primary-soft); display: flex; align-items: center; justify-content: space-between; }
.action-status span { color: var(--v2-primary); font-size: 12px; font-weight: 560; }
.action-status strong { color: var(--v2-text-main); font-size: 15px; font-weight: 620; }
.action-status__street { display: grid; gap: 2px; }
.action-status__street small { color: var(--v2-text-sub); font-size: 11px; font-weight: 520; }
.action-status__turn { display: grid; justify-items: end; gap: 2px; }
.action-status__turn small { color: var(--v2-text-sub); font-size: 10px; font-weight: 430; }
.action-status__turn .is-hero-turn { color: var(--v2-primary); font-weight: 700; }
.available-actions { margin-top: 14px; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }
.available-actions button { min-height: 48px; border: 1px solid var(--v2-border); border-radius: var(--v2-radius-sm); background: #fff; color: var(--v2-text-main); font: inherit; font-size: 14px; font-weight: 560; }
.available-actions button:active { border-color: var(--v2-primary); background: var(--v2-primary-soft); color: var(--v2-primary); }
.amount-entry { margin-top: 12px; padding: 12px; border: 1px solid var(--v2-border); border-radius: var(--v2-radius-md); display: grid; grid-template-columns: minmax(0, 1fr) 64px 64px; align-items: end; gap: 9px; }
.amount-entry label { display: grid; gap: 5px; }
.amount-entry label span { color: var(--v2-text-sub); font-size: 11px; }
.amount-entry input { width: 100%; height: 42px; padding: 0 10px; border: 1px solid var(--v2-border); border-radius: var(--v2-radius-sm); outline: 0; color: var(--v2-text-main); font: inherit; font-size: 15px; }
.amount-entry > span { padding-bottom: 12px; color: var(--v2-primary); font-size: 12px; font-weight: 560; text-align: center; white-space: nowrap; }
.amount-entry > button { height: 42px; border: 0; border-radius: var(--v2-radius-sm); background: var(--v2-primary); color: #fff; font: inherit; font-size: 13px; font-weight: 600; }
.amount-entry > button:disabled { background: #e9e4f7; color: #aaa3bc; }
.timeline-list { margin-top: 16px; overflow: hidden; border: 1px solid var(--v2-border); border-radius: var(--v2-radius-md); }
.timeline-list__heading { min-height: 42px; padding: 0 12px; background: #faf9fd; display: flex; align-items: center; justify-content: space-between; }
.timeline-list__heading strong { font-size: 13px; font-weight: 600; }
.timeline-list__heading button { border: 0; background: transparent; color: var(--v2-primary); font: inherit; font-size: 12px; font-weight: 560; }
.timeline-list__hint { margin: 0; padding: 8px 12px; border-top: 1px solid var(--v2-border); background: #faf9fd; color: var(--v2-text-sub); font-size: 10px; line-height: 1.45; }
.timeline-list__item { width: 100%; min-height: 42px; padding: 7px 12px; border: 0; border-top: 1px solid var(--v2-border); background: #fff; color: inherit; display: grid; grid-template-columns: 54px 52px minmax(0, 1fr); align-items: center; gap: 8px; font: inherit; text-align: left; }
.timeline-list__item:active { background: #f5f1ff; }
.timeline-list__item > span { color: var(--v2-text-sub); font-size: 10px; }
.timeline-list__item > strong { font-size: 12px; font-weight: 600; }
.timeline-list__item > b { overflow: hidden; font-size: 12px; font-weight: 520; text-align: right; text-overflow: ellipsis; white-space: nowrap; }
.next-street { margin-top: 14px; }
.showdown-editor { display: grid; gap: 14px; }
.showdown-editor > p { margin: 0; color: var(--v2-text-sub); font-size: 12px; line-height: 1.5; }
.showdown-player { display: flex; min-height: 92px; align-items: center; justify-content: space-between; gap: 16px; padding: 10px 12px; border: 1px solid var(--v2-border); border-radius: var(--v2-radius-md); }
.showdown-player > strong { color: var(--v2-text-main); font-size: 15px; font-weight: 620; }
.showdown-player > div { display: flex; gap: 8px; }
.memo-field { position: relative; }
.memo-field textarea { width: 100%; min-height: 245px; padding: 13px 13px 31px; border: 1.5px solid var(--v2-primary); border-radius: 10px; outline: 0; resize: none; color: var(--v2-text-main); font: inherit; font-size: 13px; line-height: 1.6; }
.memo-field span { position: absolute; right: 12px; bottom: 10px; color: var(--v2-text-sub); font-size: 11px; }
.bottom-actions { display: flex; gap: 10px; }
.bottom-actions button { min-height: 50px; border: 0; border-radius: var(--v2-radius-md); font: inherit; font-size: 14px; font-weight: 600; }
.secondary-action { flex: .45; background: #ece9f4; color: var(--v2-text-main); }
.primary-action { flex: 1; background: var(--v2-primary); color: #fff; }
.primary-action:disabled, .topbar-text:disabled { color: #aaa3bc; opacity: .7; }
.picker-backdrop { position: fixed; inset: 0; z-index: 3000; display: flex; align-items: flex-end; justify-content: center; padding: 0 18px 18px; background: rgba(23, 21, 31, .42); }
.card-picker { display: grid; width: min(100%, 480px); gap: 10px; padding: 10px 18px 14px; border-radius: 16px; background: #fff; box-shadow: 0 18px 50px rgba(28, 18, 60, .18); }
.picker-handle { width: 44px; height: 5px; justify-self: center; border-radius: 999px; background: #aaa4ba; }
.rank-grid { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 11px 10px; }
.rank-grid button, .suit-grid button { min-height: 54px; border: 1px solid var(--v2-border); border-radius: 9px; background: #fff; color: var(--v2-text-main); font: inherit; font-size: 16px; font-weight: 560; }
.rank-grid button.red, .suit-grid button.red { color: #e11d48; }
.suit-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; margin-top: 3px; padding-top: 13px; border-top: 1px solid #f0edf6; }
.suit-grid button { width: 48px; min-height: 48px; justify-self: center; padding: 0; border: 0; border-radius: 50%; background: transparent; font-size: 26px; }
.suit-grid button.selected { background: #fff1f4; box-shadow: inset 0 0 0 1px rgba(225, 29, 72, .12); }
.suit-grid button:not(.red).selected { background: #f4f1ff; box-shadow: inset 0 0 0 1px rgba(109, 69, 232, .12); }
.picker-actions { display: flex; align-items: center; justify-content: space-between; padding: 0 6px; }
.picker-actions button { min-height: 38px; border: 0; background: transparent; color: var(--v2-primary); font: inherit; font-size: 14px; font-weight: 560; }
.picker-actions .danger { color: var(--v2-danger); }
</style>
