<template>
  <Teleport to="body">
    <div v-if="modelValue" class="picker-backdrop" @click.self="closeFromBackdrop">
      <section class="card-picker" @click.stop>
        <div class="picker-handle"></div>

        <div class="rank-grid">
          <button
            v-for="rank in ranks"
            :key="rank"
            type="button"
            :class="{ red: selectedSuit.red }"
            :disabled="usedCodes.includes(`${rank}${selectedSuit.symbol}`)"
            @click="selectRank(rank)"
          >
            {{ rank }} {{ selectedSuit.symbol }}
          </button>
        </div>

        <div class="suit-grid">
          <button
            v-for="suit in suits"
            :key="suit.symbol"
            type="button"
            :class="{ selected: selectedSuit.symbol === suit.symbol, red: suit.red }"
            @click="selectedSuit = suit"
          >
            {{ suit.symbol }}
          </button>
        </div>

        <div class="picker-actions">
          <button class="danger" type="button" @click="$emit('clear')">{{ clearLabel }}</button>
          <button type="button" :disabled="doneDisabled" @click="close">완료</button>
        </div>
      </section>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: Boolean,
  activeCard: {
    type: Object,
    default: null,
  },
  usedCodes: {
    type: Array,
    default: () => [],
  },
  clearLabel: {
    type: String,
    default: '카드 삭제',
  },
  doneDisabled: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'select', 'clear'])

const ranks = ['A', 'K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4', '3', '2']
const suits = [
  { symbol: '♥', red: true },
  { symbol: '♦', red: true },
  { symbol: '♠', red: false },
  { symbol: '♣', red: false },
]
const selectedSuit = ref(suits[0])

watch(
  () => props.modelValue,
  (open) => {
    if (!open || !props.activeCard) return
    selectedSuit.value = suits.find((suit) => suit.symbol === props.activeCard.suit) || suits[0]
  },
)

const close = () => {
  if (props.doneDisabled) return
  emit('update:modelValue', false)
}
const closeFromBackdrop = () => {
  emit('update:modelValue', false)
}
const selectRank = (rank) => emit('select', {
  rank,
  suit: selectedSuit.value.symbol,
  red: selectedSuit.value.red,
})
</script>

<style scoped>
.picker-backdrop { position: fixed; inset: 0; z-index: 3000; display: flex; align-items: flex-end; justify-content: center; padding: 0 18px 18px; background: rgba(23, 21, 31, .42); }
.card-picker { display: grid; width: min(100%, 480px); gap: 10px; padding: 10px 18px 14px; border-radius: 16px; background: #fff; box-shadow: 0 18px 50px rgba(28, 18, 60, .18); }
.picker-handle { width: 44px; height: 5px; justify-self: center; border-radius: 999px; background: #aaa4ba; }
.rank-grid { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 11px 10px; }
.rank-grid button { min-height: 54px; border: 1px solid var(--v2-border); border-radius: 9px; background: #fff; color: var(--v2-text-main); font: inherit; font-size: 16px; font-weight: 560; }
.rank-grid button.red, .suit-grid button.red { color: #e11d48; }
.rank-grid button:disabled { opacity: .25; }
.suit-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; margin-top: 3px; padding-top: 13px; border-top: 1px solid #f0edf6; }
.suit-grid button { width: 48px; min-height: 48px; justify-self: center; padding: 0; border: 0; border-radius: 50%; background: transparent; color: var(--v2-text-main); font: inherit; font-size: 26px; }
.suit-grid button.selected { background: #fff1f4; box-shadow: inset 0 0 0 1px rgba(225, 29, 72, .12); }
.suit-grid button:not(.red).selected { background: #f4f1ff; box-shadow: inset 0 0 0 1px rgba(109, 69, 232, .12); }
.picker-actions { display: flex; align-items: center; justify-content: space-between; padding: 0 6px; }
.picker-actions button { min-height: 38px; border: 0; background: transparent; color: var(--v2-primary); font: inherit; font-size: 14px; font-weight: 560; }
.picker-actions button:disabled { color: #c8c3d2; }
.picker-actions .danger { color: var(--v2-danger); }
</style>
