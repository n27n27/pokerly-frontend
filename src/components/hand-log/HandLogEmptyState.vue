<template>
  <q-card flat bordered class="empty-card">
    <q-card-section class="text-center q-py-xl">
      <q-icon :name="iconName" size="46px" color="grey-5" />

      <div class="text-subtitle1 text-weight-bold q-mt-md">
        {{ title }}
      </div>

      <div class="text-body2 text-grey-7 q-mt-xs">
        {{ description }}
      </div>

      <q-btn
        class="q-mt-md"
        :color="buttonColor"
        unelevated
        :icon="buttonIcon"
        :label="buttonLabel"
        @click="onClick"
      />
    </q-card-section>
  </q-card>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  mode: {
    type: String,
    default: 'events',
  },
})

const emit = defineEmits(['create-event', 'quick-log'])

const isHandsMode = computed(() => props.mode === 'hands')

const iconName = computed(() => (isHandsMode.value ? 'casino' : 'emoji_events'))

const title = computed(() => {
  return isHandsMode.value ? '아직 기록된 핸드가 없습니다' : '먼저 대회를 생성해주세요'
})

const description = computed(() => {
  return isHandsMode.value
    ? '이 대회에서 기억할 만한 핸드를 빠르게 남겨보세요.'
    : '핸드 로그는 대회 단위로 저장됩니다.'
})

const buttonLabel = computed(() => {
  return isHandsMode.value ? '이 대회에 기록' : '대회 생성'
})

const buttonIcon = computed(() => {
  return isHandsMode.value ? 'add' : 'add_circle'
})

const buttonColor = computed(() => {
  return isHandsMode.value ? 'primary' : 'dark'
})

const onClick = () => {
  if (isHandsMode.value) {
    emit('quick-log')
    return
  }

  emit('create-event')
}
</script>

<style scoped>
.empty-card {
  border-radius: 16px;
  background: #ffffff;
}
</style>
