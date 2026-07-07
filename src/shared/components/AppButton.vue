<template>
  <q-btn
    class="app-button"
    :class="buttonClasses"
    :label="label"
    :unelevated="variant !== 'ghost'"
    no-caps
    :ripple="false"
    @click="emit('click', $event)"
  />
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  label: {
    type: String,
    required: true,
  },
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'ghost', 'danger'].includes(value),
  },
  block: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['click'])

const buttonClasses = computed(() => [
  `app-button--${props.variant}`,
  {
    'app-button--block': props.block,
  },
])
</script>
