<template>
  <q-page class="account-page">
    <header class="detail-topbar">
      <button type="button" aria-label="뒤로 가기" @click="router.back()"><q-icon name="chevron_left" size="28px" /></button>
      <h1>계정</h1>
      <span aria-hidden="true"></span>
    </header>

    <section class="profile-card">
      <span class="avatar"><q-icon name="person" size="28px" /></span>
      <strong>{{ nickname }}</strong>
      <small>{{ email }}</small>
    </section>

    <section class="account-list">
      <div><span>닉네임</span><strong>{{ nickname }}</strong></div>
      <div><span>이메일</span><strong>{{ email }}</strong></div>
    </section>

    <button class="logout-button" type="button" @click="logout">로그아웃</button>
  </q-page>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

import { useAuthStore } from 'src/stores/auth'

const router = useRouter()
const auth = useAuthStore()
const nickname = computed(() => auth.user?.nickname || 'Pokerly 사용자')
const email = computed(() => auth.user?.email || '이메일 정보 없음')
const logout = async () => {
  await auth.logout()
  router.replace('/login')
}
</script>

<style scoped>
.account-page { display: grid; align-content: start; gap: 12px; min-height: 100%; padding: 0 var(--v2-page-padding-x) 100px; }
.detail-topbar { display: grid; min-height: 36px; grid-template-columns: 40px minmax(0,1fr) 40px; align-items: center; }
.detail-topbar button { display: grid; width: 36px; height: 36px; place-items: center; padding: 0; border: 0; background: transparent; color: var(--v2-text-main); }
.detail-topbar h1 { margin: 0; font-size: 21px; font-weight: 650; text-align: center; }
.profile-card { display: grid; justify-items: center; gap: 7px; padding: 24px; border: 1px solid var(--v2-border); border-radius: var(--v2-radius-lg); background: #fff; }
.avatar { display: grid; width: 56px; height: 56px; place-items: center; border-radius: 50%; background: var(--v2-primary-soft); color: var(--v2-primary); }
.profile-card strong { font-size: 17px; }.profile-card small { color: var(--v2-text-sub); font-size: 12px; }
.account-list { overflow: hidden; border: 1px solid var(--v2-border); border-radius: var(--v2-radius-lg); background: #fff; }
.account-list div { display: grid; min-height: 50px; grid-template-columns: 80px 1fr; align-items: center; padding: 0 14px; border-bottom: 1px solid var(--v2-border); font-size: 13px; }
.account-list div:last-child { border-bottom: 0; }.account-list span { color: var(--v2-text-sub); }.account-list strong { overflow: hidden; font-weight: 520; text-align: right; text-overflow: ellipsis; white-space: nowrap; }
.logout-button { min-height: 46px; border: 1px solid rgba(239,68,68,.2); border-radius: var(--v2-radius-md); background: #fff; color: var(--v2-danger); font: inherit; font-size: 14px; font-weight: 600; }
</style>
