<template>
  <router-view />
  <GlobalAlert ref="alert" />
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
