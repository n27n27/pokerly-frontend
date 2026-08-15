<template>
  <AppCard class="stat-card" padding="md">
    <div v-if="icon" class="stat-card__icon-box">
      <q-icon class="stat-card__icon" :name="icon" size="28px" />
    </div>

    <p class="stat-card__label">{{ label }}</p>
    <strong :class="valueClasses">{{ value }}</strong>

    <p v-if="subValue" class="stat-card__sub-value">{{ subValue }}</p>
  </AppCard>
</template>

<script setup>
import { computed } from 'vue'

import AppCard from './AppCard.vue'

const props = defineProps({
  label: {
    type: String,
    required: true,
  },
  value: {
    type: [String, Number],
    required: true,
  },
  subValue: {
    type: String,
    default: '',
  },
  tone: {
    type: String,
    default: 'default',
    validator: (value) =>
      ['default', 'success', 'danger', 'primary', 'profit', 'loss'].includes(value),
  },
  icon: {
    type: String,
    default: '',
  },
})

const valueClasses = computed(() => ['stat-card__value', `stat-card__value--${props.tone}`])
</script>
