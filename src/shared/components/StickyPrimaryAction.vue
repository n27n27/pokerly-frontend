<template>
  <div class="sticky-primary-action">
    <button
      class="sticky-primary-action__button"
      type="button"
      :disabled="disabled || loading"
      @click="emit('click', $event)"
    >
      <q-spinner v-if="loading" size="20px" />
      <q-icon v-else-if="icon" :name="icon" size="20px" />
      <span>{{ loading && loadingLabel ? loadingLabel : label }}</span>
    </button>
  </div>
</template>

<script setup>
defineProps({
  label: { type: String, required: true },
  loadingLabel: { type: String, default: '' },
  icon: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
})

const emit = defineEmits(['click'])
</script>

<style scoped>
.sticky-primary-action {
  position: fixed;
  right: 0;
  bottom: calc(78px + var(--v2-sticky-cta-bottom-gap));
  left: 0;
  z-index: 1900;
  padding: var(--v2-sticky-cta-area-padding-y) var(--v2-sticky-cta-margin-x);
  background: rgba(247, 247, 251, 0.9);
  backdrop-filter: blur(6px);
  pointer-events: none;
}

.sticky-primary-action__button {
  width: 100%;
  min-height: var(--v2-sticky-cta-height);
  padding: 0 18px;
  border: 0;
  border-radius: var(--v2-sticky-cta-radius);
  background: var(--v2-sticky-cta-primary);
  box-shadow: none;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font: inherit;
  font-size: var(--v2-sticky-cta-font-size);
  font-weight: 600;
  line-height: 1;
  pointer-events: auto;
}

.sticky-primary-action__button:disabled {
  background: #e9e4f7;
  box-shadow: none;
  color: #aaa3bc;
}

</style>
