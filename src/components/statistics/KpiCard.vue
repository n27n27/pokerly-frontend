<!-- src/components/statistics/KpiCard.vue -->
<template>
  <q-card flat bordered class="kpi-card bg-white">
    <q-card-section class="row no-wrap items-center">
      <div class="column">
        <div class="text-caption text-grey-6">
          {{ title }}
        </div>
        <div class="text-h6 text-weight-bold q-mt-xs" :class="valueColorClass">
          {{ value }}
        </div>
        <div v-if="subLabel" class="text-caption text-grey-6 q-mt-xs">
          {{ subLabel }}
        </div>
      </div>

      <div class="q-ml-auto">
        <div class="kpi-icon-wrapper" :class="iconWrapperClass">
          <q-icon :name="icon" size="24px" />
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: { type: String, required: true },
  value: { type: String, required: true },
  subLabel: { type: String, default: '' },
  icon: { type: String, default: 'insights' },
  positive: { type: Boolean, default: false },
  negative: { type: Boolean, default: false },
})

const valueColorClass = computed(() => {
  if (props.positive) return 'text-positive'
  if (props.negative) return 'text-negative'
  return 'text-dark'
})

const iconWrapperClass = computed(() => {
  if (props.positive) return 'kpi-icon-positive'
  if (props.negative) return 'kpi-icon-negative'
  return 'kpi-icon-neutral'
})
</script>

<style scoped>
.kpi-card {
  border-radius: 16px;
}

.kpi-icon-wrapper {
  width: 36px;
  height: 36px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.kpi-icon-neutral {
  background: #e3f2fd;
  color: #1e88e5;
}

.kpi-icon-positive {
  background: #e8f5e9;
  color: #43a047;
}

.kpi-icon-negative {
  background: #ffebee;
  color: #e53935;
}
</style>
