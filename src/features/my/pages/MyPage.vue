<template>
  <q-page class="my-page">
    <header class="my-header">
      <h1>My</h1>
    </header>

    <section class="settings-section">
      <h2>계정</h2>
      <button class="settings-card account-card" type="button" @click="router.push('/app/my/account')">
        <div class="profile-row">
          <div class="account-info">
            <span><small>닉네임</small><strong>{{ nickname }}</strong></span>
            <span><small>이메일</small><strong>{{ accountEmail }}</strong></span>
          </div>
          <q-icon name="chevron_right" size="21px" />
        </div>
      </button>
    </section>

    <section class="settings-section record-settings">
      <h2>기록 설정</h2>
      <div class="mode-segment" role="radiogroup" aria-label="기본 기록 모드">
        <button
          v-for="mode in recordModes"
          :key="mode.value"
          type="button"
          role="radio"
          :aria-checked="recordMode === mode.value"
          :class="{ active: recordMode === mode.value }"
          @click="setRecordMode(mode.value)"
        >
          <q-icon :name="mode.icon" size="19px" />
          <span>
            <strong>{{ mode.label }}</strong>
            <small>{{ mode.description }}</small>
            <em :class="{ 'is-placeholder': recordMode !== mode.value }" :aria-hidden="recordMode !== mode.value">
              <q-icon name="check" size="14px" /> 현재 사용 중
            </em>
          </span>
        </button>
      </div>
    </section>

    <section class="settings-section">
      <h2>문의</h2>
      <div class="settings-card menu-card">
        <button v-for="item in contactItems" :key="item.label" type="button" @click="openFeedback(item.type)">
          <q-icon :name="item.icon" size="20px" />
          <span>{{ item.label }}</span>
          <q-icon name="chevron_right" size="20px" />
        </button>
      </div>
    </section>

    <section class="settings-section">
      <h2>앱 정보</h2>
      <div class="settings-card menu-card">
        <button type="button" @click="openDocument('terms')">
          <q-icon name="description" size="20px" />
          <span>이용약관</span>
          <q-icon name="chevron_right" size="20px" />
        </button>
        <button type="button" @click="openDocument('privacy')">
          <q-icon name="shield" size="20px" />
          <span>개인정보처리방침</span>
          <q-icon name="chevron_right" size="20px" />
        </button>
      </div>
    </section>
  </q-page>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

import { useAlert } from 'src/composables/useAlert'
import { useAuthStore } from 'src/stores/auth'

const router = useRouter()
const alert = useAlert()
const auth = useAuthStore()
const savedRecordMode = auth.user?.recordMode || localStorage.getItem('pokerly-record-mode')
const normalizedRecordMode = savedRecordMode === 'detail' ? 'detailed' : savedRecordMode
const recordMode = ref(['simple', 'detailed'].includes(normalizedRecordMode) ? normalizedRecordMode : 'simple')

const nickname = computed(() => auth.user?.nickname || 'Pokerly 사용자')
const accountEmail = computed(() => auth.user?.email || (auth.isAuthenticated ? '이메일 정보 없음' : '로그인이 필요합니다'))
const recordModes = [
  { value: 'simple', label: '간편 모드', description: '뱅크만 관리합니다.', icon: 'bolt' },
  { value: 'detailed', label: '상세 모드', description: '토너먼트와 핸드를 함께 기록합니다.', icon: 'format_list_bulleted' },
]
const contactItems = [
  { type: 'inquiry', label: '문의하기', icon: 'chat_bubble_outline' },
  { type: 'bug', label: '버그 제보', icon: 'bug_report' },
  { type: 'feature', label: '기능 제안', icon: 'lightbulb_outline' },
]

const setRecordMode = async (mode) => {
  if (recordMode.value === mode) return
  try {
    await auth.updateRecordMode(mode)
    recordMode.value = mode
    alert.show('기록 모드가 변경되었습니다.', 'success')
  } catch {
    alert.show('기록 모드를 변경하지 못했습니다.', 'error')
  }
}
const openFeedback = (type) => router.push({ path: '/app/my/feedback', query: { type } })
const openDocument = (type) => router.push(`/app/my/document/${type}`)
</script>

<style scoped>
.my-page { display: flex; min-height: 100%; flex-direction: column; align-items: stretch; justify-content: flex-start; padding: var(--v2-page-padding-top) var(--v2-page-padding-x) 88px; }
.my-page * { box-sizing: border-box; }
.my-header, .settings-section { flex: 0 0 auto; }
.my-header h1 { margin: 0; font-size: 22px; font-weight: 560; line-height: 1; }
.settings-section { display: grid; gap: 8px; margin-top: 18px; }
.my-header + .settings-section { margin-top: 20px; }
.settings-section h2 { margin: 0; font-size: 15px; font-weight: 600; }
.settings-card { overflow: hidden; border: 1px solid var(--v2-border); border-radius: var(--v2-radius-lg); background: #fff; box-shadow: 0 5px 14px rgba(28,18,60,.025); }
.profile-row { display: grid; min-height: 74px; grid-template-columns: minmax(0,1fr) auto; align-items: center; gap: 11px; padding: 12px 14px; }
.account-info { display: grid; gap: 7px; }
.account-info > span { display: grid; grid-template-columns: 48px minmax(0,1fr); align-items: baseline; gap: 8px; }
.account-info strong { overflow: hidden; font-size: 13px; font-weight: 560; text-overflow: ellipsis; white-space: nowrap; }
.account-info small { color: var(--v2-text-sub); font-size: 11px; }
.account-card { width: 100%; padding: 0; color: var(--v2-text-main); font: inherit; text-align: left; }
.account-card .profile-row > .q-icon { color: var(--v2-text-sub); }
.mode-segment { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; padding: 0; background: transparent; }
.mode-segment button { position: relative; display: grid; min-height: 96px; grid-template-columns: 24px minmax(0,1fr); align-items: center; gap: 9px; padding: 12px 11px; border: 1px solid var(--v2-border); border-radius: var(--v2-radius-lg); background: #fff; color: var(--v2-text-sub); box-shadow: 0 5px 14px rgba(28,18,60,.025); font: inherit; text-align: left; }
.mode-segment button > span { display: grid; gap: 5px; }.mode-segment button strong { font-size: 13px; }.mode-segment button small { color: inherit; font-size: 11px; line-height: 1.35; word-break: keep-all; }
.mode-segment button em { display: inline-flex; align-items: center; gap: 2px; margin-top: 2px; color: var(--v2-primary); font-size: 10px; font-style: normal; font-weight: 600; }
.mode-segment button em.is-placeholder { visibility: hidden; }
.mode-segment button.active { border-color: rgba(109,69,232,.35); background: var(--v2-primary-soft); color: var(--v2-primary); box-shadow: 0 5px 14px rgba(109,69,232,.08); }
.menu-card > button, .info-row { display: grid; width: 100%; min-height: 48px; grid-template-columns: 24px minmax(0,1fr) auto; align-items: center; gap: 9px; padding: 0 14px; border: 0; border-bottom: 1px solid var(--v2-border); background: #fff; color: var(--v2-text-main); font: inherit; font-size: 13px; text-align: left; }
.menu-card > :last-child { border-bottom: 0; }.menu-card > button > .q-icon:first-child, .info-row > .q-icon { color: var(--v2-primary); }.menu-card > button > .q-icon:last-child { color: var(--v2-text-sub); }
</style>
