<template>
  <transition name="fade">
    <div v-if="visible" class="ga-wrap">
      <div class="ga-card" :class="type">{{ message }}</div>
    </div>
  </transition>
</template>

<script setup>
import { ref } from 'vue'

const visible = ref(false)
const message = ref('')
const type = ref('info')
let timer

function show(msg, t = 'info', duration = 2000) {
  message.value = msg
  type.value = t
  visible.value = true
  clearTimeout(timer)
  timer = setTimeout(() => (visible.value = false), duration)
}

defineExpose({ show })
</script>

<style scoped>
/* 화면 중앙 고정 */
.ga-wrap {
  position: fixed;
  inset: 0;
  display: flex;
  justify-content: center; /* 가로 중앙 */
  align-items: center; /* 세로 중앙 */
  z-index: 2147483647;
  pointer-events: none; /* 클릭 통과 */
}

/* 카드: 살짝 투명 */
.ga-card {
  pointer-events: auto;
  min-width: 260px;
  max-width: 90vw;
  padding: 10px 16px;
  border-radius: 12px;
  color: #fff;
  background: #3b82f6; /* info 기본 */
  opacity: 0.8; /* 👈 투명도 */
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
  text-align: center;
  font-weight: 600;
}

/* 타입 색상만 유지 */
.ga-card.success {
  background: #22c55e;
}
.ga-card.error {
  background: #ef4444;
}
.ga-card.warning {
  background: #f59e0b;
  color: #1f2937;
}

/* 페이드 트랜지션 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
