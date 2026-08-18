<template>
  <q-page class="onboarding-page">
    <main class="onboarding-shell" :class="{ 'onboarding-shell--agreements': !policyView && step === 'agreements' }">
      <header v-if="policyView || step !== 'agreements'" class="onboarding-topbar">
        <button type="button" aria-label="뒤로 가기" @click="goBack">
          <q-icon name="chevron_left" size="29px" />
        </button>
        <strong>{{ topbarTitle }}</strong>
        <span aria-hidden="true"></span>
      </header>

      <template v-if="policyView">
        <section class="policy-view">
          <article>
            <div class="policy-dates">
              <span>최초 시행일: 2026.07.23</span>
              <span>최종 개정일: 2026.07.23</span>
            </div>
            <section v-for="section in currentPolicy.sections" :key="section.title">
              <h2>{{ section.title }}</h2>
              <p v-for="paragraph in section.paragraphs" :key="paragraph">{{ paragraph }}</p>
            </section>
          </article>
        </section>
      </template>

      <template v-else-if="step === 'agreements'">
        <section class="page-intro agreements-intro">
          <div class="agreements-intro__heading">
            <h1><strong>Pokerly</strong> 시작하기</h1>
            <button class="onboarding-exit" type="button" aria-label="가입 중단" @click="requestExit">
              <q-icon name="close" size="28px" />
            </button>
          </div>
          <p>서비스 이용을 위해<br />아래 약관에 동의해주세요.</p>
        </section>

        <section class="agreement-card">
          <button class="agreement-all-row" type="button" @click="toggleAll">
            <span :class="{ checked: allAgreed }">
              <q-icon v-if="allAgreed" name="check" size="18px" />
            </span>
            <strong>전체 동의</strong>
          </button>
          <article v-for="item in agreements" :key="item.key">
            <button
              class="agreement-check"
              type="button"
              :class="{ checked: item.model.value }"
              :aria-label="`${item.title} ${item.model.value ? '동의 취소' : '동의'}`"
              @click="item.model.value = !item.model.value"
            >
              <q-icon v-if="item.model.value" name="check" size="18px" />
            </button>
            <button class="agreement-copy" type="button" @click="item.model.value = !item.model.value">
              <strong>{{ item.title }}</strong>
              <small>{{ item.description }}</small>
            </button>
            <button class="view-policy" type="button" @click="item.open">
              보기 <q-icon name="chevron_right" size="18px" />
            </button>
          </article>
        </section>

        <div class="agreement-actions">
          <button class="continue-button" type="button" :disabled="!requiredAgreed" @click="step = 'profile'">
            동의하고 계속하기
          </button>
        </div>
      </template>

      <template v-else-if="step === 'mode'">
        <section class="page-intro mode-intro">
          <h1><strong>Pokerly</strong>를<br />어떻게 사용하시겠어요?</h1>
          <p>나에게 맞는 사용 방식을 선택해주세요.</p>
        </section>

        <section class="mode-options" aria-label="사용 모드 선택">
          <button
            v-for="mode in usageModes"
            :key="mode.value"
            class="mode-card"
            type="button"
            :class="{ selected: recordMode === mode.value }"
            :aria-pressed="recordMode === mode.value"
            @click="recordMode = mode.value"
          >
            <span v-if="recordMode === mode.value" class="mode-selected-mark">
              <q-icon name="check" size="16px" />
            </span>
            <span class="mode-content">
              <strong>{{ mode.title }}</strong>
              <small>{{ mode.description }}</small>
              <span class="mode-features">
                <span v-for="feature in mode.features" :key="feature.label">
                  <q-icon :name="feature.icon" size="18px" />
                  <span>
                    <b>{{ feature.label }}</b>
                    <small>{{ feature.description }}</small>
                  </span>
                </span>
              </span>
            </span>
          </button>
        </section>

        <p class="mode-note">
          <q-icon name="lightbulb" size="19px" />
          설정에서 언제든 변경할 수 있습니다.
        </p>

        <button class="continue-button mode-submit" type="button" :disabled="loading || !hasSelectedMode" @click="confirmMode">
          {{ loading ? '설정 중...' : (needsProfileSetup ? '시작하기' : '선택 완료') }}
        </button>
      </template>

      <template v-else>
        <section class="page-intro profile-intro">
          <p>사용할 닉네임을 설정해주세요.</p>
        </section>

        <section class="profile-card">
          <label>
            <span>닉네임 <b>*</b></span>
            <span class="nickname-control">
              <input
                v-model="nickname"
                maxlength="20"
                :disabled="loading"
                placeholder="닉네임을 입력해주세요"
                @keyup.enter="checkNickname"
              />
              <button type="button" :disabled="loading || !canCheckNickname" @click="checkNickname">
                {{ checkingNickname ? '확인 중' : '중복 확인' }}
              </button>
            </span>
          </label>
        </section>

        <button class="continue-button profile-submit" type="button" :disabled="!canStart" @click="confirmProfile">
          다음
        </button>
      </template>
    </main>

    <ConfirmDialog
      v-model="exitDialogOpen"
      title="가입을 중단할까요?"
      description="지금 나가면 선택한 내용이 저장되지 않아요."
      cancel-label="계속 진행"
      confirm-label="나가기"
      preferred-action="cancel"
      danger
      @confirm="confirmExit"
    />

  </q-page>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { onBeforeRouteLeave, useRouter } from 'vue-router'

import ConfirmDialog from 'src/shared/components/ConfirmDialog.vue'
import { useAlert } from 'src/composables/useAlert'
import { useAuthStore } from 'stores/auth'

const router = useRouter()
const auth = useAuthStore()
const alert = useAlert()

const normalizeRecordMode = (mode) => {
  if (mode === 'detail') return 'detailed'
  return ['simple', 'detailed'].includes(mode) ? mode : ''
}

const needsProfileSetup = ref(auth.user?.profileSetupRequired ?? true)
const step = ref(needsProfileSetup.value ? 'agreements' : 'mode')
const recordMode = ref(normalizeRecordMode(auth.user?.recordMode) || 'simple')
const nickname = ref('')
const loading = ref(false)
const checkingNickname = ref(false)
const termsAgreed = ref(false)
const privacyAgreed = ref(false)
const marketingAgreed = ref(false)
const nicknameChecked = ref(false)
const nicknameAvailable = ref(false)
const nicknameMessage = ref('')
const policyView = ref('')
const exitDialogOpen = ref(false)
const allowRouteLeave = ref(false)

const policies = {
  terms: {
    title: '이용약관',
    sections: [
      { title: '제1조 목적', paragraphs: ['본 약관은 Pokerly가 제공하는 포커 기록 및 복기 서비스의 이용 조건과 사용자 및 서비스의 권리와 의무를 정하는 것을 목적으로 합니다.'] },
      { title: '제2조 서비스 이용', paragraphs: ['사용자는 관련 법령과 본 약관을 준수하여 서비스를 이용해야 합니다.', 'Pokerly는 게임 참여나 금전 거래를 중개하지 않으며 기록과 분석 기능만 제공합니다.'] },
      { title: '제3조 계정 관리', paragraphs: ['사용자는 자신의 계정 정보를 안전하게 관리해야 하며 타인에게 계정을 양도하거나 공유해서는 안 됩니다.'] },
      { title: '제4조 서비스 변경', paragraphs: ['서비스 품질 개선을 위해 기능의 일부가 변경되거나 중단될 수 있으며 중요한 변경은 서비스 내에서 안내합니다.'] },
    ],
  },
  privacy: {
    title: '개인정보처리방침',
    sections: [
      { title: '제1조 처리하는 개인정보', paragraphs: ['Pokerly는 계정 생성과 서비스 제공을 위해 이메일, 닉네임 및 소셜 로그인 식별 정보를 처리할 수 있습니다.'] },
      { title: '제2조 이용 목적', paragraphs: ['개인정보는 사용자 식별, 계정 관리, 기록 동기화, 문의 대응 및 서비스 개선을 위해 사용됩니다.'] },
      { title: '제3조 보유 기간', paragraphs: ['개인정보는 회원 탈퇴 또는 처리 목적 달성 시까지 보유하며 관련 법령에 따라 보존이 필요한 경우 해당 기간 동안 보관합니다.'] },
      { title: '제4조 제3자 제공', paragraphs: ['Pokerly는 사용자의 동의나 법적 근거 없이 개인정보를 제3자에게 제공하지 않습니다.'] },
    ],
  },
  marketing: {
    title: '마케팅 정보 수신 안내',
    sections: [
      { title: '제1조 수신 정보', paragraphs: ['이벤트, 혜택 및 새로운 기능에 관한 안내를 받을 수 있습니다.'] },
      { title: '제2조 동의 철회', paragraphs: ['마케팅 정보 수신 동의는 선택 사항이며 언제든지 설정에서 철회할 수 있습니다.'] },
    ],
  },
}
const currentPolicy = computed(() => policies[policyView.value] || policies.terms)
const topbarTitle = computed(() => {
  if (policyView.value) return currentPolicy.value.title
  if (step.value === 'agreements') return '시작하기'
  if (step.value === 'profile') return '프로필 설정'
  return '사용 방식 선택'
})

const agreements = [
  {
    key: 'terms',
    title: '이용약관 동의 (필수)',
    description: 'Pokerly 서비스 이용을 위한 약관입니다.',
    model: termsAgreed,
    open: () => { policyView.value = 'terms' },
  },
  {
    key: 'privacy',
    title: '개인정보처리방침 동의 (필수)',
    description: '개인정보 수집 및 이용에 대한 안내입니다.',
    model: privacyAgreed,
    open: () => { policyView.value = 'privacy' },
  },
  {
    key: 'marketing',
    title: '마케팅 정보 수신 동의 (선택)',
    description: '이벤트와 혜택에 관한 소식을 받을 수 있습니다.',
    model: marketingAgreed,
    open: () => { policyView.value = 'marketing' },
  },
]

const usageModes = [
  {
    value: 'simple',
    title: '뱅크 관리 모드',
    description: '수입과 지출, 대회 결과를 간편하게 관리합니다.',
    features: [
      { icon: 'account_balance_wallet', label: '빠른 결과 기록', description: '참가비·리바인·포인트를 간편하게 입력' },
      { icon: 'trending_up', label: '수익 관리', description: 'ROI와 손익 흐름을 한눈에 확인' },
    ],
  },
  {
    value: 'detailed',
    title: '전체 기록 모드',
    description: '토너먼트와 핸드를 함께 기록하고 분석합니다.',
    features: [
      { icon: 'edit_note', label: '핸드 기록', description: '플레이한 주요 핸드를 빠르게 기록' },
      { icon: 'query_stats', label: '통계 분석', description: '포지션과 프리플랍 데이터를 분석' },
      { icon: 'account_balance', label: '뱅크 관리', description: '참가비와 포인트, 수익까지 함께 관리' },
    ],
  },
]

const trimmedNickname = computed(() => nickname.value.trim())
const canCheckNickname = computed(() => trimmedNickname.value.length >= 2)
const requiredAgreed = computed(() => termsAgreed.value && privacyAgreed.value)
const allAgreed = computed(() => termsAgreed.value && privacyAgreed.value && marketingAgreed.value)
const hasSelectedMode = computed(() => usageModes.some((mode) => mode.value === recordMode.value))
const canStart = computed(() => nicknameChecked.value && nicknameAvailable.value && requiredAgreed.value)

watch(nickname, () => {
  nicknameChecked.value = false
  nicknameAvailable.value = false
  nicknameMessage.value = ''
})

const goBack = async () => {
  if (policyView.value) {
    policyView.value = ''
    return
  }
  if (step.value === 'profile') {
    step.value = 'agreements'
    return
  }
  if (step.value === 'mode') {
    if (needsProfileSetup.value) {
      step.value = 'profile'
      return
    }
    requestExit()
    return
  }
  requestExit()
}

const requestExit = () => {
  exitDialogOpen.value = true
}

const confirmExit = async () => {
  allowRouteLeave.value = true
  exitDialogOpen.value = false
  await auth.logout()
  await router.replace('/login')
}

onBeforeRouteLeave(() => {
  if (allowRouteLeave.value) return true
  requestExit()
  return false
})

const toggleAll = () => {
  const next = !allAgreed.value
  termsAgreed.value = next
  privacyAgreed.value = next
  marketingAgreed.value = next
}

const confirmProfile = () => {
  if (!canStart.value) return
  step.value = 'mode'
}

const confirmMode = async () => {
  if (!hasSelectedMode.value) return
  loading.value = true
  try {
    if (needsProfileSetup.value) {
      await auth.completeOnboarding({
        nickname: trimmedNickname.value,
        language: navigator.language?.startsWith('ko') ? 'ko' : 'en',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Seoul',
        termsAgreed: true,
        privacyAgreed: true,
        marketingAgreed: marketingAgreed.value,
        recordMode: recordMode.value,
      })
    } else {
      await auth.updateRecordMode(recordMode.value)
    }
    allowRouteLeave.value = true
    router.replace('/app/home')
  } catch (error) {
    const message = error?.response?.data?.error?.message || '설정을 완료하지 못했습니다.'
    alert.show(message, 'error')
  } finally {
    loading.value = false
  }
}

const checkNickname = async () => {
  const name = trimmedNickname.value
  if (name.length < 2) {
    alert.show('닉네임은 2글자 이상 입력해주세요.', 'warning')
    return
  }
  checkingNickname.value = true
  try {
    const exists = await auth.checkNickname(name)
    nicknameChecked.value = true
    nicknameAvailable.value = !exists
    nicknameMessage.value = exists ? '이미 사용 중인 닉네임입니다.' : '사용 가능한 닉네임입니다.'
    alert.show(nicknameMessage.value, exists ? 'error' : 'success')
  } catch (error) {
    console.error(error)
    nicknameChecked.value = false
    nicknameAvailable.value = false
    nicknameMessage.value = '닉네임 확인 중 오류가 발생했습니다.'
    alert.show(nicknameMessage.value, 'error')
  } finally {
    checkingNickname.value = false
  }
}

</script>

<style scoped>
.onboarding-page {
  box-sizing: border-box;
  min-height: 100vh;
  min-height: 100dvh;
  padding: 0 22px 34px;
  background:
    radial-gradient(circle at 92% 8%, rgba(109, 69, 232, .07), transparent 26%),
    #faf9fd;
  color: var(--v2-text-main);
}

.onboarding-page * { box-sizing: border-box; }
.onboarding-shell { position: relative; display: flex; width: 100%; max-width: 420px; min-height: calc(100dvh - 34px); margin: 0 auto; flex-direction: column; }
.agreements-intro__heading { display: grid; grid-template-columns: minmax(0, 1fr) 44px; align-items: center; gap: 12px; }
.onboarding-exit { display: grid; width: 44px; height: 44px; place-items: center; justify-self: end; padding: 0; border: 0; border-radius: 50%; outline: 0; background: transparent; color: var(--v2-text-sub); }
.onboarding-exit:focus-visible { box-shadow: 0 0 0 3px rgba(109, 69, 232, .18); }
.onboarding-topbar { position: sticky; z-index: var(--v2-app-bar-z); top: 0; display: grid; min-height: 48px; grid-template-columns: 44px minmax(0, 1fr) 44px; align-items: end; margin: 0 -22px; padding: var(--app-safe-top) 22px 0; border-bottom: 1px solid var(--v2-app-bar-border); background: var(--v2-app-bar-bg); backdrop-filter: blur(18px); -webkit-backdrop-filter: blur(18px); }
.onboarding-topbar button { display: grid; width: 44px; height: 48px; place-items: center; padding: 0; border: 0; background: transparent; color: var(--v2-text-main); }
.onboarding-topbar > strong { font-size: 21px; font-weight: 650; text-align: center; }
.onboarding-topbar > strong, .onboarding-topbar > span { display: grid; min-height: 48px; align-items: center; }
.page-intro { margin-top: 24px; }
.page-intro h1 { margin: 0; font-size: 24px; font-weight: 650; letter-spacing: -.03em; }
.page-intro h1 strong { color: var(--v2-primary); font-weight: 680; }
.page-intro p { margin: 12px 0 0; color: var(--v2-text-sub); font-size: 13px; line-height: 1.6; }
.onboarding-shell--agreements .agreements-intro { margin-top: calc(36px + var(--app-safe-top)); }
.agreements-intro p { color: #756f86; }
.profile-intro { margin-top: 24px; }
.profile-intro p { margin-top: 0; color: #756f86; }
.agreement-card { margin-top: 22px; overflow: hidden; padding: 0 14px; border: 1px solid var(--v2-border); border-radius: 16px; background: #fff; box-shadow: var(--v2-shadow-card); }
.agreement-all-row { display: grid; width: 100%; min-height: 62px; grid-template-columns: 34px minmax(0, 1fr); align-items: center; gap: 8px; padding: 0; border: 0; border-bottom: 1px solid var(--v2-border); background: transparent; color: var(--v2-text-main); font: inherit; text-align: left; }
.agreement-all-row > span { display: grid; width: 24px; height: 24px; place-items: center; border: 1.5px solid #aaa4b5; border-radius: 6px; background: #fff; color: #fff; }
.agreement-all-row > span.checked { border-color: var(--v2-primary); background: linear-gradient(135deg, #7d4df0, #5e28d7); }
.agreement-all-row strong { font-size: 13px; font-weight: 660; }
.agreement-card article { display: grid; min-height: 84px; grid-template-columns: 34px minmax(0, 1fr) auto; align-items: center; gap: 8px; }
.agreement-card article + article { border-top: 1px solid var(--v2-border); }
.agreement-check { display: grid; width: 24px; height: 24px; place-items: center; padding: 0; border: 1.5px solid #aaa4b5; border-radius: 6px; background: #fff; color: #fff; }
.agreement-check.checked { border-color: var(--v2-primary); background: linear-gradient(135deg, #7d4df0, #5e28d7); }
.agreement-copy { display: grid; min-width: 0; gap: 6px; padding: 0; border: 0; background: transparent; color: var(--v2-text-main); font: inherit; text-align: left; }
.agreement-copy strong { font-size: 13px; font-weight: 610; }
.agreement-copy small { overflow: hidden; color: var(--v2-text-sub); font-size: 10px; text-overflow: ellipsis; white-space: nowrap; }
.view-policy { display: flex; align-items: center; padding: 7px 0 7px 8px; border: 0; background: transparent; color: var(--v2-primary); font: inherit; font-size: 11px; font-weight: 600; }
.agreement-actions { display: grid; gap: 10px; margin-top: clamp(32px, 5vh, 44px); }
.continue-button { width: 100%; min-height: 48px; border: 0; border-radius: 11px; background: linear-gradient(135deg, #7644eb, #5822d5); color: #fff; font: inherit; font-size: 14px; font-weight: 620; box-shadow: 0 10px 22px rgba(94, 40, 215, .2); }
.continue-button:disabled { border: 1px solid #ddd7ea; background: #eeeaf7; color: #aaa3b8; box-shadow: none; }
.profile-card { margin-top: 26px; padding: 16px; border: 1px solid #e2deeb; border-radius: 14px; background: #fff; box-shadow: 0 9px 25px rgba(28, 18, 60, .07); }
.profile-card label { display: grid; gap: 8px; }
.profile-card label > span:first-child { color: #4f4a5e; font-size: 11px; font-weight: 580; }
.profile-card label b { color: var(--v2-primary); }
.nickname-control { display: grid; grid-template-columns: minmax(0, 1fr) 80px; gap: 8px; }
.nickname-control input { width: 100%; height: 44px; padding: 0 12px; border: 1px solid #d8d3e2; border-radius: 10px; outline: 0; background: #fff; color: var(--v2-text-main); font: inherit; font-size: 13px; }
.nickname-control input:focus { border-color: rgba(109, 69, 232, .5); box-shadow: 0 0 0 3px rgba(109, 69, 232, .08); }
.nickname-control button { border: 1px solid rgba(109, 69, 232, .3); border-radius: 10px; background: var(--v2-primary-soft); color: var(--v2-primary); font: inherit; font-size: 11px; font-weight: 600; }
.nickname-control button:disabled { border-color: #cfc7e1; background: #f2eefb; color: #8f86a4; }
.profile-submit { margin-top: 18px; }
.profile-submit:disabled { border-color: #d5cee4; background: #eae5f4; color: #9f97ad; }
.mode-intro { margin-top: 13px; }
.mode-intro h1 { line-height: 1.25; }
.mode-options { display: grid; gap: 12px; margin-top: 20px; }
.mode-card { position: relative; display: block; width: 100%; padding: 17px 50px 17px 17px; border: 1px solid var(--v2-border); border-radius: 16px; background: #fff; color: var(--v2-text-main); font: inherit; text-align: left; box-shadow: var(--v2-shadow-card); }
.mode-card.selected { border-color: var(--v2-primary); background: linear-gradient(135deg, #fff 0%, #f7f2ff 100%); box-shadow: 0 0 0 1px rgba(109, 69, 232, .12), var(--v2-shadow-card); }
.mode-selected-mark { position: absolute; top: 16px; right: 16px; display: grid; width: 25px; height: 25px; place-items: center; border-radius: 8px; background: var(--v2-primary); color: #fff; }
.mode-content { display: grid; min-width: 0; gap: 5px; }
.mode-content > strong { font-size: 15px; font-weight: 650; }
.mode-content > small { color: var(--v2-text-sub); font-size: 11px; line-height: 1.45; }
.mode-features { display: grid; gap: 10px; margin-top: 9px; }
.mode-features > span { display: grid; grid-template-columns: 30px minmax(0, 1fr); align-items: center; gap: 8px; }
.mode-features .q-icon { display: grid; width: 30px; height: 30px; place-items: center; border-radius: 50%; background: var(--v2-primary-soft); color: var(--v2-primary); }
.mode-features > span > span { display: grid; gap: 1px; }
.mode-features b { font-size: 11px; font-weight: 620; }
.mode-features small { color: var(--v2-text-sub); font-size: 9px; line-height: 1.4; }
.mode-note { display: flex; align-items: center; gap: 8px; margin: 14px 2px 0; color: var(--v2-text-sub); font-size: 11px; }
.mode-note .q-icon { color: var(--v2-primary); }
.mode-submit { margin-top: auto; }
.policy-view { display: grid; gap: 18px; margin-top: 12px; }
.policy-view > article { padding: 18px; border: 1px solid var(--v2-border); border-radius: var(--v2-radius-lg); background: #fff; box-shadow: var(--v2-shadow-card); }
.policy-dates { display: grid; gap: 3px; margin-bottom: 22px; color: var(--v2-text-sub); font-size: 10px; line-height: 1.45; }
.policy-view article section + section { margin-top: 24px; }
.policy-view article h2 { margin: 0 0 9px; font-size: 15px; font-weight: 620; }
.policy-view article p { margin: 0; color: #4f4a5e; font-size: 13px; line-height: 1.7; }
.policy-view article p + p { margin-top: 8px; }

@media (max-height: 720px) {
  .page-intro { margin-top: 18px; }
  .agreement-card { margin-top: 15px; }
  .agreement-card article { min-height: 74px; }
  .agreement-actions { margin-top: 24px; }
  .mode-options { gap: 9px; margin-top: 14px; }
  .mode-intro { margin-top: 7px; }
  .mode-card { padding: 12px 44px 12px 14px; }
  .mode-features { gap: 7px; margin-top: 6px; }
  .mode-note { margin-top: 10px; }
}
</style>
