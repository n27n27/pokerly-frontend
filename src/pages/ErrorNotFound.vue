<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <q-page class="flex flex-center bg-grey-1">
        <div class="column items-center q-pa-lg">
          <!-- Pokerly 로고 -->
          <q-img
            src="~assets/logo.png"
            alt="Pokerly Logo"
            class="error-logo q-mb-md"
            spinner-color="primary"
          />

          <!-- 큰 404 텍스트 -->
          <div class="text-h3 text-bold q-mb-sm text-primary">404</div>

          <!-- 메시지 -->
          <div class="text-subtitle1 text-grey-7 q-mb-lg text-center">
            찾으려는 페이지가 존재하지 않습니다.<br />
            주소가 잘못되었거나 이동된 페이지일 수 있어요.
          </div>

          <!-- 홈 버튼 -->
          <q-btn
            color="primary"
            icon="home"
            label="홈으로 돌아가기"
            unelevated
            rounded
            @click="goHome"
          />
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()
const goHome = () => router.push('/')
</script>

<style scoped>
.error-logo {
  width: 72px;
  height: 72px;
  border-radius: 8px;
}
</style>
