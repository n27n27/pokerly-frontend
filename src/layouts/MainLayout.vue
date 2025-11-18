<template>
  <q-layout view="lHh Lpr lFf">
    <!-- 헤더 -->
    <q-header elevated class="pokerly-header">
      <q-toolbar>
        <!-- 로고 + 타이틀 -->
        <div class="row items-center no-wrap">
          <q-img
            src="~assets/logo.png"
            alt="Pokerly Logo"
            class="pokerly-logo"
            spinner-color="white"
          />
          <q-toolbar-title class="pokerly-title">Pokerly</q-toolbar-title>
        </div>

        <!-- 오른쪽 여백 자동 확보 -->
        <q-space />

        <!-- 로그아웃 버튼 -->
        <q-btn
          flat
          round
          dense
          icon="logout"
          color="white"
          @click="onLogout"
          aria-label="로그아웃"
        />
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
/* Pokerly 헤더: 다크톤 그린 그라데이션 */
.pokerly-header {
  background: linear-gradient(90deg, #0f9d58 0%, #0b6439 100%);
  color: white;
}

/* 로고 크기 및 모양 */
.pokerly-logo {
  width: 32px;
  height: 32px;
  margin-right: 8px;
  border-radius: 4px;
}

/* Pokerly 타이틀 스타일 */
.pokerly-title {
  font-weight: 700;
  font-size: 1.25rem;
  letter-spacing: 0.5px;
}

/* 로그아웃 아이콘 hover 효과 */
.q-btn[icon='logout']:hover {
  background: rgba(255, 255, 255, 0.15);
}
</style>
