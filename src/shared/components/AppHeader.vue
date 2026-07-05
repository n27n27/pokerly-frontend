<template>
  <q-header class="app-header">
    <q-toolbar class="app-toolbar">
      <div>
        <div class="app-title">Pokerly</div>
        <div class="app-subtitle">Tournament record & review</div>
      </div>

      <q-space />

      <q-btn flat round dense icon="logout" class="logout-btn" @click="onLogout" />
    </q-toolbar>
  </q-header>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from 'stores/auth'

const router = useRouter()
const auth = useAuthStore()

const onLogout = async () => {
  await auth.logout()
  router.replace('/login')
}
</script>

<style scoped>
.app-header {
  background: #f7f7fb;
  color: #17151f;
  box-shadow: none;
  border-bottom: 1px solid #ece9f5;
}

.app-toolbar {
  min-height: 64px;
  padding: 10px 20px;
}

.app-title {
  font-size: 20px;
  font-weight: 800;
  letter-spacing: -0.03em;
}

.app-subtitle {
  margin-top: 2px;
  font-size: 11px;
  color: #8b8798;
}

.logout-btn {
  color: #8b8798;
}
</style>
