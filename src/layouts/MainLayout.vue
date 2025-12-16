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
            src="~assets/logo.png"
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
    <q-drawer v-model="leftDrawerOpen" show-if-above bordered behavior="mobile" :width="220">
      <q-list padding>
        <!-- Dashboard -->
        <q-item clickable v-ripple :to="{ path: '/app/dashboard' }" exact @click="onClickMenu">
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
          <q-item
            clickable
            v-ripple
            :to="{ path: '/app/mypoker/ledger' }"
            exact
            @click="onClickMenu"
          >
            <q-item-section avatar>
              <q-icon name="table_view" />
            </q-item-section>
            <q-item-section>
              <q-item-label>가계부</q-item-label>
            </q-item-section>
          </q-item>

          <q-item
            clickable
            v-ripple
            :to="{ path: '/app/mypoker/hand-review' }"
            exact
            @click="onClickMenu"
          >
            <q-item-section avatar>
              <q-icon name="casino" />
            </q-item-section>
            <q-item-section>
              <q-item-label>
                핸드 복기
                <q-badge color="grey-6" rounded text-color="white" label="Demo" outline />
              </q-item-label>
            </q-item-section>
          </q-item>

          <q-item
            clickable
            v-ripple
            :to="{ path: '/app/mypoker/journal' }"
            exact
            @click="onClickMenu"
          >
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
          <!-- 월간 -->
          <q-item
            clickable
            v-ripple
            :to="{ path: '/app/statistics/month' }"
            exact
            @click="onClickMenu"
          >
            <q-item-section avatar>
              <q-icon name="calendar_month" />
            </q-item-section>
            <q-item-section>
              <q-item-label>월간</q-item-label>
            </q-item-section>
          </q-item>

          <!-- 세션 -->
          <q-item
            clickable
            v-ripple
            :to="{ path: '/app/statistics/session' }"
            exact
            @click="onClickMenu"
          >
            <q-item-section avatar>
              <q-icon name="analytics" />
            </q-item-section>
            <q-item-section>
              <q-item-label>세션</q-item-label>
            </q-item-section>
          </q-item>

          <!-- 매장 -->
          <q-item
            clickable
            v-ripple
            :to="{ path: '/app/statistics/venue' }"
            exact
            @click="onClickMenu"
          >
            <q-item-section avatar>
              <q-icon name="leaderboard" />
            </q-item-section>
            <q-item-section>
              <q-item-label>매장</q-item-label>
            </q-item-section>
          </q-item>
        </q-expansion-item>

        <q-separator spaced />

        <!-- Tools -->
        <q-expansion-item icon="calculate" label="도구" expand-icon="keyboard_arrow_down">
          <template #header>
            <q-item-section avatar>
              <q-icon name="calculate" />
            </q-item-section>

            <q-item-section>
              <q-item-label>도구</q-item-label>
            </q-item-section>

            <q-item-section side>
              <q-badge color="orange-8" text-color="white" label="BETA" rounded class="q-ml-xs" />
            </q-item-section>
          </template>

          <!-- 콜 EV 계산기 -->
          <q-item
            clickable
            v-ripple
            :to="{ path: '/app/tools/call-ev' }"
            exact
            @click="onClickMenu"
          >
            <q-item-section avatar>
              <q-icon name="functions" />
            </q-item-section>
            <q-item-section>
              <q-item-label>콜 EV 계산기</q-item-label>
            </q-item-section>
          </q-item>

          <!-- Tournament EV -->
          <q-item
            clickable
            v-ripple
            :to="{ path: '/app/tools/tournament-ev' }"
            exact
            @click="onClickMenu"
          >
            <q-item-section avatar>
              <q-icon name="emoji_events" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Tournament EV</q-item-label>
            </q-item-section>
          </q-item>

          <!-- Re-Entry EV -->
          <q-item
            clickable
            v-ripple
            :to="{ path: '/app/tools/reentry-ev' }"
            exact
            @click="onClickMenu"
          >
            <q-item-section avatar>
              <q-icon name="replay" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Re-Entry EV</q-item-label>
            </q-item-section>
          </q-item>

          <!-- Iso / 3Bet 사이즈 -->
          <q-item
            clickable
            v-ripple
            :to="{ path: '/app/tools/iso-3bet' }"
            exact
            @click="onClickMenu"
          >
            <q-item-section avatar>
              <q-icon name="compare_arrows" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Iso / 3Bet 사이즈</q-item-label>
            </q-item-section>
          </q-item>

          <!-- ICM 계산기 -->
          <q-item clickable v-ripple :to="{ path: '/app/tools/icm' }" exact @click="onClickMenu">
            <q-item-section avatar>
              <q-icon name="account_balance_wallet" />
            </q-item-section>
            <q-item-section>
              <q-item-label>ICM 계산기</q-item-label>
            </q-item-section>
          </q-item>

          <!-- SPR 계산기 -->
          <q-item clickable v-ripple :to="{ path: '/app/tools/spr' }" exact @click="onClickMenu">
            <q-item-section avatar>
              <q-icon name="waterfall_chart" />
            </q-item-section>
            <q-item-section>
              <q-item-label>SPR 계산기</q-item-label>
            </q-item-section>
          </q-item>

          <!-- Implied Odds -->
          <q-item
            clickable
            v-ripple
            :to="{ path: '/app/tools/implied-odds' }"
            exact
            @click="onClickMenu"
          >
            <q-item-section avatar>
              <q-icon name="trending_up" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Implied Odds</q-item-label>
            </q-item-section>
          </q-item>
        </q-expansion-item>

        <q-separator spaced />

        <!-- Venues -->
        <q-expansion-item icon="storefront" label="매장" expand-icon="keyboard_arrow_down">
          <q-item clickable v-ripple :to="{ path: '/app/venues/list' }" exact @click="onClickMenu">
            <q-item-section avatar>
              <q-icon name="list_alt" />
            </q-item-section>
            <q-item-section>
              <q-item-label>매장 목록</q-item-label>
            </q-item-section>
          </q-item>
        </q-expansion-item>

        <q-separator spaced />

        <!-- 문의 / 피드백 (매장 밑에 단일 탭) -->
        <q-item
          clickable
          v-ripple
          :to="{ path: '/app/support/feedback' }"
          exact
          @click="onClickMenu"
        >
          <q-item-section avatar>
            <q-icon name="chat_bubble_outline" />
          </q-item-section>
          <q-item-section>
            <q-item-label>문의 / 피드백</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <!-- 메인 컨텐츠 -->
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from 'stores/auth'

const leftDrawerOpen = ref(null)
const router = useRouter()
const auth = useAuthStore()

const onLogout = async () => {
  await auth.logout()
  router.replace('/login')
}

const onClickMenu = () => {
  leftDrawerOpen.value = false
}

onMounted(() => {
  leftDrawerOpen.value = false
})
</script>

<style scoped>
.pokerly-logo {
  width: 28px;
  height: 28px;
  border-radius: 6px;
}
</style>
