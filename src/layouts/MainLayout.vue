<template>
  <q-layout view="lHh Lpr lFf">
    <!-- 헤더 -->
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-toolbar-title>Pokerly</q-toolbar-title>

        <!-- 오른쪽에 사용자 아이콘/버튼 등 추가 가능 -->
        <q-btn flat round dense icon="logout" @click="onLogout" aria-label="로그아웃" />
      </q-toolbar>
    </q-header>

    <!-- 메인 컨텐츠 -->
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { useRouter } from 'vue-router'

import { useAuthStore } from 'stores/auth'

const router = useRouter()
const auth = useAuthStore()

function onLogout() {
  auth.logout()
  router.push('/login')
}
</script>

<style scoped>
.q-toolbar-title {
  font-weight: 600;
  font-size: 1.2rem;
}
</style>
