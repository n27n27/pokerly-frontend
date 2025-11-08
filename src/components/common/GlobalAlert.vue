<template>
  <transition name="fade">
    <div v-if="visible" class="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-max">
      <q-card
        class="q-px-md q-py-sm text-white text-center"
        :class="typeClass"
        style="min-width: 280px; border-radius: 10px"
      >
        {{ message }}
      </q-card>
    </div>
  </transition>
</template>

<script setup>
import { ref, computed } from 'vue'

const visible = ref(false)
const message = ref('')
const type = ref('info')

function show(msg, msgType = 'info', duration = 2000) {
  message.value = msg
  type.value = msgType
  visible.value = true
  setTimeout(() => (visible.value = false), duration)
}

const typeClass = computed(() => {
  switch (type.value) {
    case 'success':
      return 'bg-positive'
    case 'error':
      return 'bg-negative'
    case 'warning':
      return 'bg-warning text-dark'
    default:
      return 'bg-primary'
  }
})

defineExpose({ show })
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
