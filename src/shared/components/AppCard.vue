<template>
  <q-card :class="cardClasses" flat>
    <slot />
  </q-card>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'soft', 'interactive'].includes(value),
  },
  padding: {
    type: String,
    default: 'md',
    validator: (value) => ['none', 'md', 'lg'].includes(value),
  },
})

const cardClasses = computed(() => [
  'app-card',
  `app-card--${props.variant}`,
  `app-card--padding-${props.padding}`,
])
</script>
