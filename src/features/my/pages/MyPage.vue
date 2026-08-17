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
            <em v-if="recordMode === mode.value">
              <q-icon name="check" size="11px" /> 사용 중
            </em>
          </span>
        </button>
      </div>
    </section>

    <section class="settings-section">
      <h2>기록 정보</h2>
      <div class="settings-card menu-card">
        <button class="saved-data-button" type="button" @click="router.push('/app/my/saved-data')">
          <q-icon name="folder_open" size="20px" />
          <span class="menu-copy">
            <strong>매장·플레이어 관리</strong>
            <small>자주 가는 매장과 함께 플레이한 사람을 관리합니다.</small>
          </span>
          <q-icon name="chevron_right" size="20px" />
        </button>
      </div>
    </section>

    <section class="settings-section">
      <h2>수신 설정</h2>
      <div class="settings-card consent-card">
        <div>
          <strong>마케팅 정보 수신</strong>
          <small>이벤트와 새로운 기능 소식을 받을 수 있습니다.</small>
        </div>
        <button
          type="button"
          role="switch"
          :aria-checked="marketingAgreed"
          :aria-label="`마케팅 정보 수신 ${marketingAgreed ? '동의' : '미동의'}`"
          :class="{ active: marketingAgreed }"
          :disabled="marketingSaving"
          @click="toggleMarketingConsent"
        >
          <i></i>
          <span>{{ marketingAgreed ? '동의' : '미동의' }}</span>
        </button>
      </div>
    </section>

    <section class="settings-section">
      <h2>고객센터</h2>
      <div class="settings-card support-card">
        <q-icon name="mail_outline" size="20px" />
        <button class="support-email" type="button" @click="openSupportEmail">
          <span class="menu-copy">
            <strong>이메일 문의</strong>
            <small>help@pokerly.kr</small>
          </span>
        </button>
        <button class="copy-button" type="button" aria-label="고객센터 이메일 주소 복사" @click="copySupportEmail">
          <q-icon name="content_copy" size="18px" />
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
        <button type="button" @click="openDocument('opensource')">
          <q-icon name="code" size="20px" />
          <span>오픈소스 라이선스</span>
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
import { copyToClipboard } from 'src/utils/copyToClipboard'

const router = useRouter()
const alert = useAlert()
const auth = useAuthStore()
const savedRecordMode = auth.user?.recordMode || localStorage.getItem('pokerly-record-mode')
const normalizedRecordMode = savedRecordMode === 'detail' ? 'detailed' : savedRecordMode
const recordMode = ref(['simple', 'detailed'].includes(normalizedRecordMode) ? normalizedRecordMode : 'simple')
const marketingAgreed = ref(Boolean(auth.user?.marketingAgreed))
const marketingSaving = ref(false)

const nickname = computed(() => auth.user?.nickname || 'Pokerly 사용자')
const accountEmail = computed(() => auth.user?.email || (auth.isAuthenticated ? '이메일 정보 없음' : '로그인이 필요합니다'))
const recordModes = [
  { value: 'simple', label: '간편 모드', description: '뱅크만 관리합니다.', icon: 'bolt' },
  { value: 'detailed', label: '상세 모드', description: '토너먼트와 핸드를 함께 기록합니다.', icon: 'format_list_bulleted' },
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
const toggleMarketingConsent = async () => {
  if (marketingSaving.value) return
  const previous = marketingAgreed.value
  const next = !previous
  marketingAgreed.value = next
  marketingSaving.value = true
  try {
    await auth.updateMarketingConsent(next)
    marketingAgreed.value = Boolean(auth.user?.marketingAgreed)
    alert.show(
      next ? '마케팅 정보 수신에 동의했습니다.' : '마케팅 정보 수신 동의를 철회했습니다.',
      'success',
    )
  } catch {
    marketingAgreed.value = previous
    alert.show('마케팅 수신 설정을 저장하지 못했습니다.', 'error')
  } finally {
    marketingSaving.value = false
  }
}
const openSupportEmail = () => {
  window.location.href = 'mailto:help@pokerly.kr?subject=Pokerly%20%EB%AC%B8%EC%9D%98'
}
const copySupportEmail = async () => {
  try {
    await copyToClipboard('help@pokerly.kr')
    alert.show('이메일 주소를 복사했습니다.', 'success')
  } catch {
    alert.show('이메일 주소를 복사하지 못했습니다.', 'error')
  }
}
const openDocument = (type) => router.push(`/app/my/document/${type}`)
</script>

<style scoped>
.my-page { display: flex; min-height: 100%; flex-direction: column; align-items: stretch; justify-content: flex-start; padding: var(--v2-page-padding-top) var(--v2-page-padding-x) 88px; }
.my-page * { box-sizing: border-box; }
.my-header, .settings-section { flex: 0 0 auto; }
.my-header h1 { margin: 0; font-size: 22px; font-weight: 650; line-height: 1; }
.settings-section { display: grid; gap: 6px; margin-top: 8px; }
.my-header + .settings-section { margin-top: 12px; }
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
.mode-segment button { position: relative; display: grid; min-height: 84px; grid-template-columns: 24px minmax(0,1fr); align-content: start; align-items: start; gap: 9px; padding: 14px 11px 12px; border: 1px solid var(--v2-border); border-radius: var(--v2-radius-lg); background: #fff; color: var(--v2-text-sub); box-shadow: 0 5px 14px rgba(28,18,60,.025); font: inherit; text-align: left; }
.mode-segment button > .q-icon { margin-top: 1px; }
.mode-segment button > span { display: grid; gap: 5px; }.mode-segment button strong { font-size: 13px; line-height: 1.35; }.mode-segment button small { min-height: 30px; color: inherit; font-size: 11px; line-height: 1.35; word-break: keep-all; }
.mode-segment button em { position: absolute; top: 9px; right: 9px; display: inline-flex; align-items: center; gap: 1px; padding: 3px 5px; border-radius: 999px; background: #fff; color: var(--v2-primary); font-size: 9px; font-style: normal; font-weight: 650; line-height: 1; }
.mode-segment button.active { border-color: rgba(109,69,232,.35); background: var(--v2-primary-soft); color: var(--v2-primary); box-shadow: 0 5px 14px rgba(109,69,232,.08); }
.consent-card { display: grid; min-height: 70px; grid-template-columns: minmax(0,1fr) auto; align-items: center; gap: 12px; padding: 12px 14px; }
.consent-card > div { display: grid; gap: 5px; }.consent-card strong { font-size: 13px; font-weight: 580; }.consent-card small { color: var(--v2-text-sub); font-size: 11px; line-height: 1.35; }
.consent-card > button { display: grid; width: 70px; min-height: 32px; grid-template-columns: 25px 1fr; align-items: center; gap: 4px; padding: 3px 7px 3px 3px; border: 0; border-radius: 18px; background: #eeecf4; color: var(--v2-text-sub); font: inherit; transition: 150ms ease; }
.consent-card > button i { display: block; width: 26px; height: 26px; border-radius: 50%; background: #fff; box-shadow: 0 2px 6px rgba(35,28,54,.15); }.consent-card > button span { font-size: 10px; font-weight: 620; white-space: nowrap; }
.consent-card > button.active { grid-template-columns: 1fr 25px; padding: 3px 3px 3px 7px; background: var(--v2-primary-soft); color: var(--v2-primary); }.consent-card > button.active i { grid-column: 2; grid-row: 1; }.consent-card > button.active span { grid-column: 1; grid-row: 1; }
.consent-card > button:disabled { opacity: .65; }
.menu-card > button, .info-row { display: grid; width: 100%; min-height: 48px; grid-template-columns: 24px minmax(0,1fr) auto; align-items: center; gap: 9px; padding: 0 14px; border: 0; border-bottom: 1px solid var(--v2-border); background: #fff; color: var(--v2-text-main); font: inherit; font-size: 13px; text-align: left; }
.menu-card > :last-child { border-bottom: 0; }.menu-card > button > .q-icon:first-child, .info-row > .q-icon { color: var(--v2-primary); }.menu-card > button > .q-icon:last-child { color: var(--v2-text-sub); }
.menu-card > button.saved-data-button { min-height: 58px; padding: 0 14px; }
.menu-copy { display: grid; gap: 4px; }
.menu-copy strong { font-size: 13px; font-weight: 580; }
.menu-copy small { color: var(--v2-text-sub); font-size: 11px; }
.support-card { display: grid; min-height: 58px; grid-template-columns: 24px minmax(0,1fr) 36px; align-items: center; gap: 9px; padding: 0 10px 0 14px; }
.support-card > .q-icon { color: var(--v2-primary); }
.support-card button { padding: 0; border: 0; background: transparent; color: inherit; font: inherit; }
.support-email { align-self: stretch; text-align: left; }
.support-email .menu-copy { height: 100%; align-content: center; }
.copy-button { display: grid; width: 36px; height: 36px; place-items: center; border-radius: 10px !important; color: var(--v2-text-sub) !important; }
.copy-button:active { background: var(--v2-primary-soft); color: var(--v2-primary) !important; }
</style>
