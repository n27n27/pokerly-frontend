<template>
  <transition name="toast">
    <div v-if="visible" class="ga-wrap" role="status" aria-live="polite" aria-atomic="true">
      <div class="ga-card" :class="normalizedType">
        <span class="ga-icon" aria-hidden="true">
          <q-icon :name="iconName" size="18px" />
        </span>
        <span class="ga-message">{{ message }}</span>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { computed, ref } from 'vue'

const visible = ref(false)
const message = ref('')
const type = ref('info')
let timer

const normalizedType = computed(() => {
  if (['success', 'positive'].includes(type.value)) return 'success'
  if (['error', 'negative'].includes(type.value)) return 'error'
  if (type.value === 'warning') return 'warning'
  return 'info'
})
const iconName = computed(() => ({
  success: 'check_circle',
  error: 'error',
  warning: 'warning',
  info: 'info',
})[normalizedType.value])

function show(msg, t = 'info', duration = 2400) {
  message.value = msg
  type.value = t
  visible.value = true
  clearTimeout(timer)
  timer = setTimeout(() => (visible.value = false), duration)
}

defineExpose({ show })
</script>

<style scoped>
.ga-wrap {
  position: fixed;
  z-index: 2147483647;
  right: 20px;
  bottom: calc(88px + env(safe-area-inset-bottom));
  left: 20px;
  display: flex;
  justify-content: center;
  pointer-events: none;
}

.ga-card {
  display: grid;
  width: min(100%, 380px);
  min-height: 52px;
  grid-template-columns: 30px minmax(0, 1fr);
  align-items: center;
  gap: 10px;
  padding: 9px 14px 9px 11px;
  border: 1px solid var(--v2-border);
  border-radius: 12px;
  background: rgba(255, 255, 255, .98);
  color: var(--v2-text-main);
  box-shadow: 0 12px 32px rgba(28, 18, 60, .16);
}

.ga-icon {
  display: grid;
  width: 30px;
  height: 30px;
  place-items: center;
  border-radius: 9px;
  background: var(--v2-primary-soft);
  color: var(--v2-primary);
}

.ga-message {
  font-size: 13px;
  font-weight: 560;
  line-height: 1.45;
}

.ga-card.success .ga-icon { background: #edf9f1; color: var(--v2-success); }
.ga-card.error .ga-icon { background: #fff0f1; color: var(--v2-danger); }
.ga-card.warning .ga-icon { background: #fff7e6; color: #d97706; }

.toast-enter-active,
.toast-leave-active {
  transition: opacity .18s ease, transform .18s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

@media (min-width: 700px) {
  .ga-wrap { bottom: 28px; }
}
</style>
