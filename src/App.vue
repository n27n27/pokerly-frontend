<template>
  <router-view />
  <GlobalAlert ref="alertRef" />
</template>

<script setup>
import GlobalAlert from 'components/common/GlobalAlert.vue'
import { provide, ref } from 'vue'

const alertRef = ref(null)

// 전역으로 provide
provide('alert', {
  show: (msg, type, duration) => alertRef.value?.show(msg, type, duration),
})
</script>
