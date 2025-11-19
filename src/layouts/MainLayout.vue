<template>
  <q-layout view="lHh Lpr lFf">
    <!-- 헤더 -->
    <q-header elevated class="bg-dark text-white">
      <q-toolbar>
        <!-- 좌측: 메뉴 버튼 (모바일용) -->
        <q-btn
          flat
          dense
          round
          icon="menu"
          class="q-mr-sm"
          @click="leftDrawerOpen = !leftDrawerOpen"
        />

        <!-- 로고 + 타이틀 -->
        <div class="row items-center no-wrap">
          <q-img
            src="src/assets/logo.png"
            alt="Pokerly Logo"
            class="pokerly-logo q-mr-sm"
            spinner-color="white"
          />
          <q-toolbar-title class="text-weight-bold"> Pokerly </q-toolbar-title>
        </div>

        <q-space />

        <!-- 우측: 프로필/로그아웃 자리 -->
        <q-btn flat round dense icon="logout" @click="onLogout" aria-label="로그아웃" />
      </q-toolbar>
    </q-header>

    <!-- 사이드바 -->
    <q-drawer v-model="leftDrawerOpen" show-if-above bordered content-class="bg-grey-1">
      <q-list padding>
        <!-- Dashboard -->
        <q-item clickable v-ripple :to="{ path: '/app/dashboard' }" exact>
          <q-item-section avatar>
            <q-icon name="grid_view" />
          </q-item-section>
          <q-item-section>
            <q-item-label>대시보드</q-item-label>
          </q-item-section>
        </q-item>

        <q-separator spaced />

        <!-- My Poker -->
        <q-expansion-item
          icon="sports_esports"
          label="My Poker"
          expand-icon="keyboard_arrow_down"
          default-opened
        >
          <q-item clickable v-ripple :to="{ path: '/app/mypoker/ledger' }" exact>
            <q-item-section avatar>
              <q-icon name="table_view" />
            </q-item-section>
            <q-item-section>
              <q-item-label>가계부</q-item-label>
            </q-item-section>
          </q-item>

          <q-item clickable v-ripple :to="{ path: '/app/mypoker/hand-review' }" exact>
            <q-item-section avatar>
              <q-icon name="casino" />
            </q-item-section>
            <q-item-section>
              <q-item-label>핸드 복기</q-item-label>
            </q-item-section>
          </q-item>

          <q-item clickable v-ripple :to="{ path: '/app/mypoker/journal' }" exact>
            <q-item-section avatar>
              <q-icon name="edit_note" />
            </q-item-section>
            <q-item-section>
              <q-item-label>일지</q-item-label>
            </q-item-section>
          </q-item>
        </q-expansion-item>

        <q-separator spaced />

        <!-- Statistics -->
        <q-expansion-item icon="query_stats" label="통계" expand-icon="keyboard_arrow_down">
          <q-item clickable v-ripple :to="{ path: '/app/statistics/month' }" exact>
            <q-item-section avatar>
              <q-icon name="calendar_month" />
            </q-item-section>
            <q-item-section>
              <q-item-label>월간 통계</q-item-label>
            </q-item-section>
          </q-item>

          <q-item clickable v-ripple :to="{ path: '/app/statistics/session' }" exact>
            <q-item-section avatar>
              <q-icon name="analytics" />
            </q-item-section>
            <q-item-section>
              <q-item-label>세션 분석</q-item-label>
            </q-item-section>
          </q-item>
        </q-expansion-item>

        <q-separator spaced />

        <!-- Venues -->
        <q-expansion-item icon="storefront" label="매장" expand-icon="keyboard_arrow_down">
          <q-item clickable v-ripple :to="{ path: '/app/venues/list' }" exact>
            <q-item-section avatar>
              <q-icon name="list_alt" />
            </q-item-section>
            <q-item-section>
              <q-item-label>매장 목록</q-item-label>
            </q-item-section>
          </q-item>

          <q-item clickable v-ripple :to="{ path: '/app/venues/points' }" exact>
            <q-item-section avatar>
              <q-icon name="stars" />
            </q-item-section>
            <q-item-section>
              <q-item-label>매장 포인트</q-item-label>
            </q-item-section>
          </q-item>
        </q-expansion-item>
      </q-list>
    </q-drawer>

    <!-- 메인 컨텐츠 -->
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from 'stores/auth'

const leftDrawerOpen = ref(true)
const router = useRouter()
const auth = useAuthStore()

const onLogout = () => {
  auth.logout()

  router.push('/login')
}
</script>

<style scoped>
.pokerly-logo {
  width: 28px;
  height: 28px;
  border-radius: 6px;
}
</style>
