<template>
  <q-layout>
    <q-page-container>
      <router-view />
    </q-page-container>
    <GlobalAlert ref="alert" />
  </q-layout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import GlobalAlert from 'src/components/common/GlobalAlert.vue'
import { registerAlert } from 'src/composables/useAlert'

const alert = ref(null)

onMounted(() => {
  registerAlert(alert.value)
})
</script>
<!-- <template>
  <q-layout>
    <q-page-container>
      <router-view />
    </q-page-container>
    <GlobalAlert ref="alert" />
  </q-layout>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import GlobalAlert from 'src/components/common/GlobalAlert.vue'
import { registerAlert } from 'src/composables/useAlert'

const alert = ref(null)

onMounted(async () => {
  await nextTick() // ref 바인딩 보장
  registerAlert(alert.value) // 전역 등록
})

onUnmounted(() => {
  registerAlert(null) // 레이아웃 빠질 때 해제(선택)
})
</script> -->
