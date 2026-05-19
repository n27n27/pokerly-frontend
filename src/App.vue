<template>
  <div class="q-pa-md">
    <SystemNoticeBanner class="q-mb-md" />
  </div>
  <router-view />
  <GlobalAlert ref="alert" />
</template>

<script setup>
import { ref, onMounted } from 'vue'
import GlobalAlert from 'src/components/common/GlobalAlert.vue'
import { registerAlert } from 'src/composables/useAlert'
import SystemNoticeBanner from 'src/components/SystemNoticeBanner.vue'

const alert = ref(null)

onMounted(() => {
  registerAlert(alert.value)
})
</script>
