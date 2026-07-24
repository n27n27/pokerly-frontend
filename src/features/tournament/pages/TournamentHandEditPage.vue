<template>
  <q-page class="review-edit-page">
    <header class="edit-topbar">
      <button class="topbar-text" type="button" @click="router.back()">취소</button>
      <h1>복기 작성 ({{ step }}/3)</h1>
      <button class="topbar-text next" type="button" @click="nextStep">
        {{ step === 3 ? '완료' : '다음' }}
      </button>
    </header>

    <div class="step-progress" aria-label="복기 작성 진행 단계">
        <i v-for="index in 3" :key="index" :class="{ active: index <= step }"></i>
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

      <section v-else-if="step === 2" class="edit-card">
        <div class="step-heading"><h2>액션</h2></div>
        <div class="action-editor">
          <label v-for="row in actionRows" :key="row.street">
            <span>{{ row.street }}</span>
            <button type="button"><i>{{ row.value }}</i><q-icon name="edit" size="16px" /></button>
          </label>
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
        <button class="primary-action" type="button" @click="nextStep">{{ step === 3 ? '저장하기' : '다음' }}</button>
    </div>

    <CardPickerSheet
      v-model="pickerOpen"
      :active-card="activeCard"
      :used-codes="usedCardCodes"
      @select="selectCard"
      @clear="clearActiveCard"
    />
  </q-page>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import CardPickerSheet from 'src/shared/components/CardPickerSheet.vue'

const route = useRoute()
const router = useRouter()
const step = ref(1)
const pickerOpen = ref(false)
const activeStreetKey = ref('flop')
const activeCardIndex = ref(0)
const memo = ref(route.query.review === '1' ? 'CO에서 오픈 후 SB가 3bet.\n플랍에서 C-bet 후 콜 받고\n리버에서 벳, 폴드로 승리.' : '')
const levelName = computed(() => route.params.levelName || 'L3')
const handId = computed(() => route.params.handId || '128')

const boardStreets = ref([
  { key: 'flop', name: '플랍', cards: [null, null, null] },
  { key: 'turn', name: '턴', cards: [null] },
  { key: 'river', name: '리버', cards: [null] },
])
const actionRows = [
  { street: '프리플랍', value: 'CO 오픈 2.5 BB  ›  SB 3bet 9 BB  ›  CO 콜' },
  { street: '플랍', value: 'SB 체크  ›  CO 벳 1/2팟  ›  SB 콜' },
  { street: '턴', value: 'SB 체크  ›  CO 체크' },
  { street: '리버', value: 'SB 체크  ›  CO 벳 3/4팟  ›  SB 폴드' },
]

const detailPath = computed(() => `/app/tournament/running/level/${levelName.value}/hand/${handId.value}`)
const activeStreet = computed(() => boardStreets.value.find((street) => street.key === activeStreetKey.value))
const activeCard = computed(() => activeStreet.value?.cards[activeCardIndex.value] || null)
const usedCardCodes = computed(() => boardStreets.value
  .flatMap((street) => street.cards)
  .filter((card) => card && card !== activeCard.value)
  .map((card) => `${card.rank}${card.suit}`))
const openCardPicker = (streetKey, index) => {
  activeStreetKey.value = streetKey
  activeCardIndex.value = index
  pickerOpen.value = true
}
const closeCardPicker = () => {
  pickerOpen.value = false
}
const selectCard = (card) => {
  if (!activeStreet.value) return
  activeStreet.value.cards[activeCardIndex.value] = card
  closeCardPicker()
}
const clearActiveCard = () => {
  if (activeStreet.value) activeStreet.value.cards[activeCardIndex.value] = null
  closeCardPicker()
}
const nextStep = () => {
  if (step.value < 3) step.value += 1
  else router.replace({ path: detailPath.value, query: { review: '1' } })
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
.memo-field { position: relative; }
.memo-field textarea { width: 100%; min-height: 245px; padding: 13px 13px 31px; border: 1.5px solid var(--v2-primary); border-radius: 10px; outline: 0; resize: none; color: var(--v2-text-main); font: inherit; font-size: 13px; line-height: 1.6; }
.memo-field span { position: absolute; right: 12px; bottom: 10px; color: var(--v2-text-sub); font-size: 11px; }
.bottom-actions { display: flex; gap: 10px; }
.bottom-actions button { min-height: 50px; border: 0; border-radius: var(--v2-radius-md); font: inherit; font-size: 14px; font-weight: 600; }
.secondary-action { flex: .45; background: #ece9f4; color: var(--v2-text-main); }
.primary-action { flex: 1; background: var(--v2-primary); color: #fff; }
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
