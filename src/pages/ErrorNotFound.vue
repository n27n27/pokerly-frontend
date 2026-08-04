<template>
  <div class="not-found-page">
    <header class="page-header">
      <span aria-hidden="true" />
      <h1>안내</h1>
      <span aria-hidden="true" />
    </header>

    <main class="not-found-content">
      <div class="empty-icon" aria-hidden="true">
        <q-icon name="search_off" size="30px" />
      </div>
      <h2>페이지를 찾을 수 없어요</h2>
      <p>주소가 변경되었거나 더 이상 제공하지 않는 화면이에요.</p>
      <div class="actions">
        <button class="primary" type="button" @click="goHome">
          <q-icon name="home" size="19px" /> 홈으로 이동
        </button>
      </div>
    </main>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()
const goHome = () => router.replace(localStorage.getItem('accessToken') ? '/app/home' : '/login')
</script>

<style scoped>
.not-found-page {
  min-height: 100vh;
  padding: 0 var(--v2-page-padding-x) 40px;
  background: var(--v2-page-bg, #f7f7fb);
}

.page-header {
  display: grid;
  min-height: 108px;
  grid-template-columns: 44px 1fr 44px;
  align-items: center;
}

.page-header h1 {
  margin: 0;
  color: var(--v2-text-main, #1e1a29);
  font-size: 20px;
  font-weight: 650;
  text-align: center;
}

.not-found-content {
  display: grid;
  justify-items: center;
  padding-top: 92px;
  text-align: center;
}

.empty-icon {
  display: grid;
  width: 64px;
  height: 64px;
  place-items: center;
  margin-bottom: 20px;
  border-radius: 50%;
  background: var(--v2-primary-soft, #f0eaff);
  color: var(--v2-primary, #6c3df4);
}

h2 { margin: 0; color: var(--v2-text-main, #1e1a29); font-size: 22px; font-weight: 650; }
p { max-width: 320px; margin: 10px 0 0; color: var(--v2-text-sub, #8b849c); font-size: 14px; line-height: 1.55; }
.actions { display: grid; width: min(100%, 260px); margin-top: 30px; }
.actions button { display: flex; min-height: 46px; align-items: center; justify-content: center; gap: 4px; border: 1px solid var(--v2-border, #e9e5f2); border-radius: 13px; background: #fff; color: var(--v2-text-main, #1e1a29); font: inherit; font-size: 13px; font-weight: 580; }
.actions .primary { border-color: transparent; background: var(--v2-primary, #6c3df4); color: #fff; }

</style>
