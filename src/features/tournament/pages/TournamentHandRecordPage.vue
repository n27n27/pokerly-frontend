<template>
  <q-page class="hand-record-page">
    <header class="record-topbar">
      <button class="cancel-button" type="button" @click="router.back()">
        취소
      </button>
      <h1>핸드 기록</h1>
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
        <div class="position-grid">
          <button
            v-for="position in positions"
            :key="position"
            type="button"
            :class="{ selected: form.position === position }"
            @click="form.position = position"
          >
            {{ position }}
          </button>
        </div>
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
      </div>

      <div class="record-section">
        <h2>4. 핸드 결과</h2>
        <div class="result-grid">
          <button
            v-for="result in handResults"
            :key="result.value"
            type="button"
            :class="{ selected: form.result === result.value }"
            :disabled="form.preflopAction === 'FOLD'"
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
    <StickyPrimaryAction v-if="!pickerOpen" label="저장" :disabled="!canSave" @click="saveHand" />

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
import { computed, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import CardPickerSheet from 'src/shared/components/CardPickerSheet.vue'
import StickyPrimaryAction from 'src/shared/components/StickyPrimaryAction.vue'

const route = useRoute()
const router = useRouter()

const levelName = computed(() => route.params.levelName || 'L3')
const positions = ['UTG', 'UTG+1', 'UTG+2', 'MP', 'LJ', 'HJ', 'CO', 'BTN', 'SB', 'BB']
const preflopActions = [
  { value: 'FOLD', label: '폴드' },
  { value: 'CALL', label: '콜' },
  { value: 'OPEN', label: '오픈' },
  { value: 'THREE_BET_PLUS', label: '3벳+' },
]

const handResults = [
  { value: 'WIN', label: '승' },
  { value: 'DRAW', label: '무승부' },
  { value: 'LOSS', label: '패' },
]

const heroCards = ref([null, null])
const activeCardIndex = ref(0)
const pickerOpen = ref(false)
const form = reactive({
  position: '',
  preflopAction: '',
  result: '',
  reviewRequired: false,
})

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
  const wasFold = form.preflopAction === 'FOLD'
  form.preflopAction = action

  if (action === 'FOLD') {
    form.result = 'LOSS'
  } else if (wasFold) {
    form.result = ''
  }
}

const saveHand = () => {
  if (!canSave.value) return

  const payload = {
    holeCards: heroCards.value.map((card) => ({ rank: card.rank, suit: card.suit })),
    position: form.position,
    preflopAction: form.preflopAction,
    result: form.result,
    reviewRequired: form.reviewRequired,
  }

  router.replace({
    path: `/app/tournament/running/level/${levelName.value}`,
    state: { savedHand: payload },
  })
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
  font-size: 17px;
  font-weight: 560;
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
