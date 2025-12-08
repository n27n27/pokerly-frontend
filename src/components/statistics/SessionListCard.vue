<!-- src/components/statistics/SessionListCard.vue -->
<template>
  <q-card flat bordered class="session-card bg-white q-mb-sm">
    <q-card-section class="column q-gutter-xs">
      <div class="text-body2 text-weight-medium">{{ dateLabel }} · {{ typeLabel }}</div>

      <div class="text-subtitle1 text-weight-bold">
        {{ session.venueName }}
      </div>

      <div class="text-caption text-grey-7">
        바인 {{ formatMoney(session.totalBuyIn) }}
        <span class="q-mx-xs">→</span>
        프라이즈 {{ formatMoney(session.prize) }}
      </div>

      <div class="text-body2 text-weight-bold" :class="profitClass">
        {{ formatSigned(session.netProfit) }}
        <span v-if="session.roi !== undefined" class="text-caption text-grey-6 q-ml-xs">
          (ROI {{ session.roi.toFixed(1) }}%)
        </span>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  session: { type: Object, required: true },
})

const dateLabel = computed(() => props.session.playDate ?? '날짜 미지정')

const typeLabel = computed(() => {
  switch (props.session.sessionType) {
    case 'VENUE':
      return '매장 토너'
    case 'MAJOR':
      return '메이저 대회'
    case 'ONLINE':
      return '온라인'
    default:
      return props.session.sessionType || '기타'
  }
})

const profitClass = computed(() =>
  props.session.netProfit >= 0 ? 'text-positive' : 'text-negative',
)

const formatMoney = (v) => (typeof v === 'number' ? v.toLocaleString() : (v ?? '-'))

const formatSigned = (v) => {
  if (typeof v !== 'number') return v ?? '-'
  if (v > 0) return `+${v.toLocaleString()}`
  if (v < 0) return v.toLocaleString()
  return '0'
}
</script>

<style scoped>
.session-card {
  border-radius: 16px;
}
</style>
