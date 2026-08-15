<template>
  <q-page class="hand-record-page">
    <header class="record-topbar">
      <button class="cancel-button" type="button" @click="router.back()">
        취소
      </button>
      <h1>{{ isEditMode ? '핸드 수정' : '핸드 기록' }}</h1>
      <span aria-hidden="true"></span>
    </header>

    <section class="quick-card">
      <div class="record-section">
        <h2>1. 카드</h2>
        <div class="card-slots">
          <button
            v-for="(_, index) in heroCards"
            :key="index"
            class="card-slot"
            :class="{ filled: heroCards[index], red: heroCards[index]?.red }"
            type="button"
            @click="openCardPicker(index)"
          >
            <template v-if="heroCards[index]">
              <strong>{{ heroCards[index].rank }}</strong>
              <span>{{ heroCards[index].suit }}</span>
            </template>
            <q-icon v-else name="add" size="24px" />
          </button>
        </div>
      </div>

      <div class="divider"></div>

      <div class="record-section">
        <h2>2. 포지션</h2>
        <div class="handed-count">
          <span>현재 인원</span>
          <div>
            <button
              type="button"
              aria-label="인원 줄이기"
              :disabled="handedCount <= 4"
              @click="changeHandedCount(-1)"
            >
              −
            </button>
            <strong>{{ handedCount }}명</strong>
            <button
              type="button"
              aria-label="인원 늘리기"
              :disabled="handedCount >= 11"
              @click="changeHandedCount(1)"
            >
              +
            </button>
          </div>
        </div>
        <div class="position-grid">
          <button
            v-for="position in positions"
            :key="position"
            type="button"
            :class="{ selected: form.position === position }"
            @click="selectPosition(position)"
          >
            {{ position }}
          </button>
        </div>
        <small v-if="handedCount === 11 && form.position === 'UTG+2'" class="position-seat-hint">
          11핸디드에서는 2번 진행 · {{ selectedDuplicatePositionStep }}/2
        </small>
      </div>

      <div class="divider"></div>

      <div class="record-section">
        <h2>3. 프리플랍 액션</h2>
        <div class="action-grid">
          <button
            v-for="action in preflopActions"
            :key="action.value"
            type="button"
            :class="{ selected: form.preflopAction === action.value }"
            @click="selectPreflopAction(action.value)"
          >
            <strong>{{ action.label }}</strong>
          </button>
        </div>
        <div v-if="secondaryActionOptions.length" class="secondary-action-area">
          <button
            v-if="!showSecondaryAction && !form.secondaryAction"
            class="add-secondary-action"
            type="button"
            @click="showSecondaryAction = true"
          >
            <q-icon name="add" size="17px" />
            이후 액션 추가
          </button>
          <template v-else>
            <div class="secondary-action-heading">
              <span>{{ primaryActionLabel }} 이후</span>
              <button type="button" @click="clearSecondaryAction">삭제</button>
            </div>
            <div class="action-grid action-grid--secondary">
              <button
                v-for="action in secondaryActionOptions"
                :key="action.value"
                type="button"
                :class="{ selected: form.secondaryAction === action.value }"
                @click="selectSecondaryAction(action.value)"
              >
                <strong>{{ action.label }}</strong>
              </button>
            </div>
          </template>
        </div>
      </div>

      <div class="record-section">
        <h2>4. 핸드 결과</h2>
        <div class="result-grid">
          <button
            v-for="result in handResults"
              :key="result.value"
              type="button"
              :class="{ selected: form.result === result.value }"
              :disabled="hasAutomaticResult"
              @click="form.result = result.value"
          >
            {{ result.label }}
          </button>
        </div>
      </div>

      <div class="record-section record-section--review">
        <h2>5. 복기 필요</h2>
        <button
          class="review-toggle"
          type="button"
          role="switch"
          :aria-checked="form.reviewRequired"
          aria-label="복기 필요"
          :class="{ active: form.reviewRequired }"
          @click="form.reviewRequired = !form.reviewRequired"
        >
          <span></span>
        </button>
      </div>
    </section>
    <StickyPrimaryAction
      v-if="!pickerOpen"
      label="저장"
      :disabled="!canSave || handLogStore.saving"
      :loading="handLogStore.saving"
      loading-label="저장 중..."
      @click="saveHand"
    />

    <CardPickerSheet
      v-model="pickerOpen"
      :active-card="heroCards[activeCardIndex]"
      :used-codes="usedCardCodes"
      clear-label="전체 삭제"
      @select="selectCard"
      @clear="clearCards"
    />
  </q-page>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useAlert } from 'src/composables/useAlert'
import CardPickerSheet from 'src/shared/components/CardPickerSheet.vue'
import StickyPrimaryAction from 'src/shared/components/StickyPrimaryAction.vue'
import { useHandLogStore } from 'src/stores/handLog'

const route = useRoute()
const router = useRouter()
const alert = useAlert()
const handLogStore = useHandLogStore()

const levelId = computed(() => String(route.params.levelName || ''))
const levelName = computed(() => String(route.query.levelName || '') || '-')
const handId = computed(() => String(route.params.handId || ''))
const isEditMode = computed(() => Boolean(handId.value))
const eventId = computed(
  () => route.query.eventId || route.query.legacyEventId || storedTournament.eventId || null,
)
const positionMap = {
  4: ['CO', 'BTN', 'SB', 'BB'],
  5: ['HJ', 'CO', 'BTN', 'SB', 'BB'],
  6: ['UTG', 'HJ', 'CO', 'BTN', 'SB', 'BB'],
  7: ['UTG', 'LJ', 'HJ', 'CO', 'BTN', 'SB', 'BB'],
  8: ['UTG', 'MP', 'LJ', 'HJ', 'CO', 'BTN', 'SB', 'BB'],
  9: ['UTG', 'UTG+1', 'MP', 'LJ', 'HJ', 'CO', 'BTN', 'SB', 'BB'],
  10: ['UTG', 'UTG+1', 'UTG+2', 'MP', 'LJ', 'HJ', 'CO', 'BTN', 'SB', 'BB'],
  11: ['UTG', 'UTG+1', 'UTG+2', 'MP', 'LJ', 'HJ', 'CO', 'BTN', 'SB', 'BB'],
}
const positionSeatMap = {
  ...Object.fromEntries(
    Object.entries(positionMap)
      .filter(([count]) => Number(count) !== 11)
      .map(([count, options]) => [
        count,
        options.map((position) => ({ key: position, position })),
      ]),
  ),
  11: [
    { key: 'UTG', position: 'UTG' },
    { key: 'UTG+1', position: 'UTG+1' },
    { key: 'UTG+2:2', position: 'UTG+2', step: 2 },
    { key: 'UTG+2:1', position: 'UTG+2', step: 1 },
    { key: 'MP', position: 'MP' },
    { key: 'LJ', position: 'LJ' },
    { key: 'HJ', position: 'HJ' },
    { key: 'CO', position: 'CO' },
    { key: 'BTN', position: 'BTN' },
    { key: 'SB', position: 'SB' },
    { key: 'BB', position: 'BB' },
  ],
}
const storedTournament = (() => {
  try {
    return JSON.parse(localStorage.getItem('pokerly-running-tournament')) || {}
  } catch {
    return {}
  }
})()
const handedCount = ref(
  Math.min(11, Math.max(4, Number(storedTournament.currentHandedCount) || 10)),
)
const positions = computed(() => positionMap[handedCount.value])
const positionSeats = computed(() => positionSeatMap[handedCount.value])
const lastSavedPosition =
  storedTournament.lastHandPosition ||
  handLogStore.selectedBlindLevel?.hands?.at(-1)?.position ||
  ''
const lastSavedSeatKey = storedTournament.lastHandSeatKey || lastSavedPosition
const getSuggestedSeat = () => {
  const seats = positionSeats.value
  const normalizedLastSeatKey =
    seats.find((seat) => seat.key === lastSavedSeatKey)?.key ||
    seats.find((seat) => seat.position === lastSavedPosition)?.key
  const previousIndex = seats.findIndex((seat) => seat.key === normalizedLastSeatKey)
  return previousIndex < 0
    ? seats[0]
    : seats[(previousIndex - 1 + seats.length) % seats.length]
}
const suggestedSeat = getSuggestedSeat()
const selectedSeatKey = ref(suggestedSeat.key)
const basePreflopActions = [
  { value: 'FOLD', label: '폴드' },
  { value: 'CALL', label: '콜' },
  { value: 'OPEN', label: '오픈' },
  { value: 'THREE_BET_PLUS', label: '3벳+' },
]
const bbPreflopActions = [
  { value: 'FOLD', label: '폴드' },
  { value: 'CHECK', label: '체크' },
  { value: 'CALL', label: '콜' },
  { value: 'WALK', label: '앞에서 올폴드' },
  { value: 'OPEN', label: '오픈' },
  { value: 'THREE_BET_PLUS', label: '3벳+' },
]

const handResults = [
  { value: 'WIN', label: '승' },
  { value: 'DRAW', label: '무승부' },
  { value: 'LOSS', label: '패' },
]
const secondaryActionsByPrimary = {
  CALL: [
    { value: 'FOLD', label: '폴드' },
    { value: 'CALL', label: '콜' },
    { value: 'THREE_BET_PLUS', label: '3벳+' },
  ],
  OPEN: [
    { value: 'FOLD', label: '폴드' },
    { value: 'CALL', label: '콜' },
    { value: 'FOUR_BET_PLUS', label: '4벳+' },
  ],
  THREE_BET_PLUS: [
    { value: 'FOLD', label: '폴드' },
    { value: 'CALL', label: '콜' },
    { value: 'FIVE_BET_PLUS', label: '5벳+' },
  ],
}

const heroCards = ref([null, null])
const activeCardIndex = ref(0)
const pickerOpen = ref(false)
const showSecondaryAction = ref(false)
const form = reactive({
  position: suggestedSeat.position,
  preflopAction: 'FOLD',
  secondaryAction: null,
  result: 'LOSS',
  reviewRequired: false,
})
const selectedDuplicatePositionStep = computed(
  () => positionSeats.value.find((seat) => seat.key === selectedSeatKey.value)?.step || 1,
)
const preflopActions = computed(() =>
  form.position === 'BB' ? bbPreflopActions : basePreflopActions,
)
const secondaryActionOptions = computed(() =>
  secondaryActionsByPrimary[form.preflopAction] || [],
)
const primaryActionLabel = computed(() =>
  preflopActions.value.find((action) => action.value === form.preflopAction)?.label || '',
)
const hasAutomaticResult = computed(() =>
  ['FOLD', 'WALK'].includes(form.preflopAction) || form.secondaryAction === 'FOLD',
)

const loadHandForEdit = async () => {
  if (!isEditMode.value || !eventId.value || !levelId.value) return
  try {
    const hand = await handLogStore.fetchHandDetail(
      eventId.value,
      levelId.value,
      handId.value,
    )
    if (!hand) return

    const storedPrimaryAction = hand.primaryAction || hand.actionType
    const action =
      storedPrimaryAction === 'THREE_BET' || storedPrimaryAction === 'FOUR_BET_PLUS'
        ? 'THREE_BET_PLUS'
        : storedPrimaryAction || 'FOLD'
    const result = ['WIN', 'SHOWDOWN_WIN', 'NON_SHOWDOWN_WIN'].includes(hand.resultType)
      ? 'WIN'
      : hand.resultType === 'CHOP'
        ? 'DRAW'
        : 'LOSS'
    const minimumHandedCount = Number(
      Object.entries(positionMap).find(([, options]) => options.includes(hand.position))?.[0] ||
        handedCount.value,
    )
    handedCount.value = hand.handedCount
      ? Math.min(11, Math.max(4, Number(hand.handedCount)))
      : Math.max(minimumHandedCount, handedCount.value)
    form.position = hand.position || positions.value[0]
    selectedSeatKey.value =
      positionSeats.value.find((seat) => seat.position === form.position)?.key || form.position
    form.preflopAction = action
    form.secondaryAction = hand.secondaryAction || null
    showSecondaryAction.value = Boolean(form.secondaryAction)
    form.result = result
    form.reviewRequired = Boolean(hand.reviewRequired)
    heroCards.value = [hand.firstRank, hand.secondRank].map((rank, index) => ({
      rank,
      suit:
        (index === 0 ? hand.firstSuit : hand.secondSuit) ||
        (hand.suited || index === 0 ? '♠' : '♥'),
      red: ['♥', '♦'].includes(
        (index === 0 ? hand.firstSuit : hand.secondSuit) ||
          (hand.suited || index === 0 ? '♠' : '♥'),
      ),
    }))
  } catch {
    alert.show('핸드 정보를 불러오지 못했습니다.', 'error')
  }
}

onMounted(loadHandForEdit)

const changeHandedCount = (change) => {
  handedCount.value = Math.min(11, Math.max(4, handedCount.value + change))
  const nextSuggestedSeat = getSuggestedSeat()
  selectedSeatKey.value = nextSuggestedSeat.key
  form.position = nextSuggestedSeat.position
  if (form.position !== 'BB' && ['CHECK', 'WALK'].includes(form.preflopAction)) {
    form.preflopAction = 'FOLD'
    form.result = 'LOSS'
  }
}

const selectPosition = (position) => {
  if (handedCount.value === 11 && position === 'UTG+2' && form.position === position) {
    selectedSeatKey.value = selectedSeatKey.value === 'UTG+2:1' ? 'UTG+2:2' : 'UTG+2:1'
  } else {
    selectedSeatKey.value =
      positionSeats.value.find((seat) => seat.position === position)?.key || position
  }
  form.position = position
  if (position !== 'BB' && ['CHECK', 'WALK'].includes(form.preflopAction)) {
    form.preflopAction = 'FOLD'
    form.result = 'LOSS'
  }
}

const canSave = computed(() => {
  const hasRequiredInput = heroCards.value.every(Boolean) && form.position && form.preflopAction
  const hasRequiredResult = form.preflopAction === 'FOLD' || Boolean(form.result)
  return hasRequiredInput && hasRequiredResult
})
const usedCardCodes = computed(() => heroCards.value
  .filter((card, index) => card && index !== activeCardIndex.value)
  .map((card) => `${card.rank}${card.suit}`))

const openCardPicker = (index) => {
  activeCardIndex.value = index
  pickerOpen.value = true
}

const selectCard = (card) => {
  heroCards.value[activeCardIndex.value] = card
  activeCardIndex.value = activeCardIndex.value === 0 ? 1 : 0
}

const clearCards = () => {
  heroCards.value = [null, null]
  activeCardIndex.value = 0
}

const selectPreflopAction = (action) => {
  const hadAutomaticResult = ['FOLD', 'WALK'].includes(form.preflopAction)
  form.preflopAction = action
  form.secondaryAction = null
  showSecondaryAction.value = false

  if (action === 'FOLD') {
    form.result = 'LOSS'
  } else if (action === 'WALK') {
    form.result = 'WIN'
  } else if (hadAutomaticResult) {
    form.result = ''
  }
}

const selectSecondaryAction = (action) => {
  const wasFold = form.secondaryAction === 'FOLD'
  form.secondaryAction = action
  if (action === 'FOLD') form.result = 'LOSS'
  else if (wasFold) form.result = ''
}

const clearSecondaryAction = () => {
  const wasFold = form.secondaryAction === 'FOLD'
  form.secondaryAction = null
  showSecondaryAction.value = false
  if (wasFold) form.result = ''
}

const saveHand = async () => {
  if (!canSave.value) return

  if (!eventId.value || !levelId.value) {
    alert.show('토너먼트 정보를 찾을 수 없습니다.', 'error')
    return
  }

  const suited = heroCards.value[0].suit === heroCards.value[1].suit
  const ranks = heroCards.value.map((card) => card.rank)
  const resultType =
    form.preflopAction === 'FOLD'
      ? 'PREFLOP_FOLD'
      : form.preflopAction === 'WALK'
        ? 'NON_SHOWDOWN_WIN'
      : { WIN: 'WIN', DRAW: 'CHOP', LOSS: 'LOSS' }[form.result]
  const payload = {
    holeCards: `${ranks.join('')}${ranks[0] === ranks[1] ? '' : suited ? 's' : 'o'}`,
    firstRank: ranks[0],
    secondRank: ranks[1],
    firstSuit: heroCards.value[0].suit,
    secondSuit: heroCards.value[1].suit,
    suited,
    position: form.position,
    handedCount: handedCount.value,
    actionType: form.preflopAction === 'THREE_BET_PLUS' ? 'THREE_BET' : form.preflopAction,
    primaryAction: form.preflopAction,
    secondaryAction: form.secondaryAction,
    actionLabel: [
      primaryActionLabel.value,
      secondaryActionOptions.value.find((action) => action.value === form.secondaryAction)?.label,
    ].filter(Boolean).join(' → '),
    resultType,
    reviewRequired: form.reviewRequired,
    memo: isEditMode.value ? handLogStore.selectedHand?.memo || '' : '',
  }

  try {
    if (isEditMode.value) {
      await handLogStore.updateHandInBlindLevel(
        eventId.value,
        levelId.value,
        handId.value,
        payload,
      )
    } else {
      await handLogStore.addHandToBlindLevel(
        eventId.value,
        levelId.value,
        payload,
      )
    }
    if (!route.query.tournamentId) {
      storedTournament.currentHandedCount = handedCount.value
      storedTournament.lastHandPosition = form.position
      storedTournament.lastHandSeatKey = selectedSeatKey.value
      localStorage.setItem('pokerly-running-tournament', JSON.stringify(storedTournament))
    }
    router.replace(
      isEditMode.value
        ? {
            name: 'tournament-hand-detail',
            params: { levelName: levelId.value, handId: handId.value },
            query: { ...route.query, levelName: levelName.value },
          }
        : {
            name: 'tournament-level-detail',
            params: { levelName: levelId.value },
            query: { levelName: levelName.value },
          },
    )
  } catch {
    alert.show('핸드를 저장하지 못했습니다.', 'error')
  }
}
</script>

<style scoped>
.hand-record-page {
  display: grid;
  align-content: start;
  gap: 14px;
  min-height: 100%;
  padding: var(--v2-page-padding-top) var(--v2-page-padding-x) 180px;
}

.record-topbar {
  display: grid;
  grid-template-columns: 56px minmax(0, 1fr) 56px;
  align-items: center;
  min-height: 36px;
}

.record-topbar button {
  min-width: 44px;
  height: 36px;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--v2-text-sub);
  font: inherit;
  font-size: 13px;
  font-weight: 520;
  text-align: left;
}

.record-topbar h1 {
  margin: 0;
  color: var(--v2-text-main);
  font-size: 21px;
  font-weight: 650;
  line-height: 1.2;
  text-align: center;
}

.quick-card {
  padding: 0;
  border: 0;
  border-radius: 0;
  background: transparent;
  box-shadow: none;
  display: grid;
  gap: 16px;
}

.record-section {
  padding: 16px;
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-lg);
  background: #ffffff;
  box-shadow: 0 8px 24px rgba(28, 18, 60, 0.035);
  display: grid;
  gap: 12px;
}

.record-section h2 {
  margin: 0;
  color: var(--v2-text-main);
  font-size: 14px;
  font-weight: 560;
  line-height: 1.2;
}

.record-section h2 span {
  color: var(--v2-text-sub);
  font-weight: 430;
}

.divider {
  display: none;
}

.card-slots {
  display: flex;
  justify-content: center;
  gap: 24px;
  padding: 4px 0 8px;
}

.card-slot {
  width: 64px;
  height: 72px;
  border: 1px dashed #ded9ec;
  border-radius: var(--v2-radius-md);
  background: #ffffff;
  color: #9b95aa;
  display: grid;
  place-items: center;
  align-content: center;
  gap: 4px;
  font: inherit;
}

.card-slot.filled {
  border-style: solid;
  color: var(--v2-text-main);
}

.card-slot.red {
  color: #e11d48;
}

.card-slot strong {
  font-size: 22px;
  font-weight: 620;
  line-height: 1;
}

.card-slot span {
  font-size: 20px;
  line-height: 1;
}

.position-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 8px;
}

.handed-count {
  min-height: 48px;
  padding: 0 12px;
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-sm);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.handed-count > span {
  color: var(--v2-text-sub);
  font-size: 13px;
  font-weight: 520;
}

.handed-count > div {
  display: flex;
  align-items: center;
  gap: 13px;
}

.handed-count button {
  width: 32px;
  height: 32px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: var(--v2-primary-soft);
  color: var(--v2-primary);
  font: inherit;
  font-size: 19px;
  line-height: 1;
}

.handed-count button:disabled {
  background: #f4f3f7;
  color: #c4bfce;
}

.handed-count strong {
  min-width: 32px;
  color: var(--v2-text-main);
  font-size: 14px;
  font-weight: 600;
  text-align: center;
}

.position-grid button,
.action-grid button,
.result-grid button {
  min-height: 42px;
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-sm);
  background: #ffffff;
  color: var(--v2-text-main);
  font: inherit;
  font-size: 13px;
  font-weight: 520;
}

.position-grid button.selected,
.action-grid button.selected,
.result-grid button.selected {
  border-color: var(--v2-primary);
  background: var(--v2-primary);
  color: #ffffff;
}

.position-seat-hint {
  display: block;
  margin-top: -1px;
  color: var(--v2-text-sub);
  font-size: 11px;
  font-weight: 520;
  line-height: 1.3;
  text-align: center;
}

.action-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.action-grid button {
  min-height: 48px;
  display: grid;
  place-items: center;
  align-content: center;
  gap: 2px;
}

.action-grid strong {
  font-size: 13px;
  font-weight: 560;
  line-height: 1.2;
}

.secondary-action-area {
  display: grid;
  gap: 8px;
  padding-top: 2px;
}

.add-secondary-action {
  display: inline-flex;
  width: max-content;
  min-height: 34px;
  align-items: center;
  gap: 3px;
  padding: 0 5px;
  border: 0;
  background: transparent;
  color: var(--v2-primary);
  font: inherit;
  font-size: 12px;
  font-weight: 580;
}

.secondary-action-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  color: var(--v2-text-sub);
  font-size: 11px;
  font-weight: 540;
}

.secondary-action-heading button {
  min-height: 28px;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--v2-text-sub);
  font: inherit;
  font-size: 11px;
}

.action-grid--secondary {
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.action-grid--secondary button {
  min-height: 40px;
}

.result-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.result-grid button:disabled {
  opacity: 1;
}

.record-section--review {
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
}

.review-toggle {
  position: relative;
  width: 42px;
  height: 24px;
  padding: 0;
  border: 0;
  border-radius: 999px;
  background: #ded9e8;
  display: flex;
  align-items: center;
  transition: background 160ms ease;
}

.review-toggle span {
  width: 18px;
  height: 18px;
  margin-left: 3px;
  border-radius: 50%;
  background: #ffffff;
  box-shadow: 0 1px 3px rgba(28, 18, 60, 0.16);
  transition: transform 160ms ease;
}

.review-toggle.active {
  background: var(--v2-primary);
}

.review-toggle.active span {
  transform: translateX(18px);
}

.picker-backdrop {
  position: fixed;
  inset: 0;
  z-index: 3000;
  background: rgba(23, 21, 31, 0.42);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 0 18px 18px;
}

.card-picker {
  width: min(100%, 480px);
  padding: 10px 18px 14px;
  border-radius: 16px;
  background: #ffffff;
  box-shadow: 0 18px 50px rgba(28, 18, 60, 0.18);
  display: grid;
  gap: 10px;
}

.picker-handle {
  width: 44px;
  height: 5px;
  border-radius: 999px;
  background: #aaa4ba;
  justify-self: center;
}

.rank-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 11px 10px;
}

.rank-grid button,
.suit-grid button {
  min-height: 54px;
  border: 1px solid var(--v2-border);
  border-radius: 9px;
  background: #ffffff;
  color: var(--v2-text-main);
  font: inherit;
  font-size: 16px;
  font-weight: 560;
}

.rank-grid button.red,
.suit-grid button.red {
  color: #e11d48;
}

.suit-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
  margin-top: 3px;
  padding-top: 13px;
  border-top: 1px solid #f0edf6;
}

.suit-grid button {
  width: 48px;
  min-height: 48px;
  justify-self: center;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: transparent;
  font-size: 26px;
}

.suit-grid button.selected {
  background: #fff1f4;
  box-shadow: inset 0 0 0 1px rgba(225, 29, 72, 0.12);
}

.suit-grid button:not(.red).selected {
  background: #f4f1ff;
  box-shadow: inset 0 0 0 1px rgba(109, 69, 232, 0.12);
}

.picker-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 6px;
}

.picker-actions button {
  min-height: 38px;
  border: 0;
  background: transparent;
  color: var(--v2-primary);
  font: inherit;
  font-size: 14px;
  font-weight: 560;
}

.picker-actions .danger {
  color: var(--v2-danger);
}

@media (max-width: 420px) {
  .position-grid {
    gap: 7px;
  }

}
</style>
