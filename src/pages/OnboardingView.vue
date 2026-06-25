<template>
  <q-page class="auth-page">
    <main class="auth-shell">
      <section class="auth-header">
        <q-img src="~assets/logo.png" alt="Pokerly Logo" class="auth-logo" />

        <h1 class="auth-title">프로필 설정</h1>
        <p class="auth-subtitle">사용할 닉네임을 설정해주세요.</p>
      </section>

      <section class="setup-form">
        <div class="section-label">닉네임</div>

        <div class="nickname-row">
          <q-input
            v-model="nickname"
            label="닉네임"
            outlined
            dense
            color="dark"
            maxlength="20"
            :disable="loading"
            class="nickname-input"
          />

          <q-btn
            unelevated
            outline
            no-caps
            class="check-btn"
            label="확인"
            :loading="checkingNickname"
            :disable="loading || !canCheckNickname"
            @click="checkNickname"
          />
        </div>

        <div
          class="nickname-message"
          :class="[statusAvailable ? 'is-success' : 'is-error', { 'is-hidden': !statusMessage }]"
        >
          {{ statusMessage || 'placeholder' }}
        </div>

        <div class="section-label agreement-title">필수 동의</div>

        <div class="agreement-list">
          <q-checkbox v-model="termsAgreed" color="dark" :disable="loading" class="agreement-item">
            <template #default>
              <span>
                <a href="#" @click.stop.prevent="openTerms">이용약관</a>
                <span>에 동의합니다. (필수)</span>
              </span>
            </template>
          </q-checkbox>

          <q-checkbox
            v-model="privacyAgreed"
            color="dark"
            :disable="loading"
            class="agreement-item"
          >
            <template #default>
              <span>
                <a href="#" @click.stop.prevent="openPrivacy">개인정보처리방침</a>
                <span>에 동의합니다. (필수)</span>
              </span>
            </template>
          </q-checkbox>
        </div>

        <q-btn
          unelevated
          no-caps
          class="start-btn"
          label="시작하기"
          :loading="loading"
          :disable="loading || !canStart"
          @click="complete"
        />
      </section>

      <p class="brand-copy">Record. Review. Improve.</p>
    </main>

    <PolicyDialog v-model="termsDialog" title="Pokerly 이용약관">
      <p>
        본 약관은 Pokerly 서비스 이용과 관련하여 사용자와 서비스 제공자 사이의 기본적인 권리, 의무
        및 책임사항을 정합니다.
      </p>
      <p>
        사용자는 서비스를 부정한 목적으로 이용해서는 안 되며, 서비스 운영을 방해하는 행위를 해서는
        안 됩니다.
      </p>
      <p>
        Pokerly는 서비스 품질 개선, 보안 유지, 기능 제공을 위해 필요한 범위에서 서비스를 변경하거나
        중단할 수 있습니다.
      </p>
    </PolicyDialog>

    <PolicyDialog v-model="privacyDialog" title="Pokerly 개인정보처리방침">
      <p>
        Pokerly는 회원 식별, 로그인, 서비스 제공을 위해 이메일, 닉네임, 소셜 계정 식별자 등 필요한
        정보를 처리할 수 있습니다.
      </p>
      <p>수집된 정보는 계정 관리, 보안, 사용자 기록 보존 및 서비스 개선 목적에 한해 사용됩니다.</p>
      <p>사용자는 관련 법령에 따라 개인정보 열람, 정정, 삭제를 요청할 수 있습니다.</p>
    </PolicyDialog>
  </q-page>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from 'stores/auth'
import { useAlert } from 'src/composables/useAlert'
import PolicyDialog from 'src/components/common/PolicyDialog.vue'

const router = useRouter()
const auth = useAuthStore()
const alert = useAlert()

const nickname = ref('')
const loading = ref(false)
const checkingNickname = ref(false)

const termsAgreed = ref(false)
const privacyAgreed = ref(false)

const nicknameChecked = ref(false)
const nicknameAvailable = ref(false)
const nicknameMessage = ref('')

const termsDialog = ref(false)
const privacyDialog = ref(false)

const trimmedNickname = computed(() => nickname.value.trim())

const canCheckNickname = computed(() => trimmedNickname.value.length >= 2)

const statusMessage = computed(() => {
  if (trimmedNickname.value.length > 0 && trimmedNickname.value.length < 2) {
    return '닉네임은 2글자 이상 입력해주세요.'
  }

  return nicknameMessage.value
})

const statusAvailable = computed(() => {
  return nicknameChecked.value && nicknameAvailable.value
})

const canStart = computed(() => {
  return (
    nicknameChecked.value && nicknameAvailable.value && termsAgreed.value && privacyAgreed.value
  )
})

watch(nickname, () => {
  nicknameChecked.value = false
  nicknameAvailable.value = false
  nicknameMessage.value = ''
})

const openTerms = () => {
  termsDialog.value = true
}

const openPrivacy = () => {
  privacyDialog.value = true
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

    alert.show(nicknameMessage.value, exists ? 'warning' : 'success')
  } catch (e) {
    console.error(e)
    nicknameChecked.value = false
    nicknameAvailable.value = false
    nicknameMessage.value = '닉네임 확인 중 오류가 발생했습니다.'
    alert.show(nicknameMessage.value, 'error')
  } finally {
    checkingNickname.value = false
  }
}

const complete = async () => {
  const name = trimmedNickname.value

  if (!name) {
    alert.show('닉네임을 입력해주세요.', 'warning')
    return
  }

  if (name.length < 2) {
    alert.show('닉네임은 2글자 이상 입력해주세요.', 'warning')
    return
  }

  if (!nicknameChecked.value || !nicknameAvailable.value) {
    alert.show('닉네임 확인을 완료해주세요.', 'warning')
    return
  }

  if (!termsAgreed.value || !privacyAgreed.value) {
    alert.show('필수 항목에 동의해주세요.', 'warning')
    return
  }

  loading.value = true

  try {
    await auth.completeOnboarding({
      nickname: name,
      language: navigator.language?.startsWith('ko') ? 'ko' : 'en',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Seoul',
      termsAgreed: true,
      privacyAgreed: true,
    })

    alert.show('설정이 완료되었습니다.', 'success')
    router.replace('/app/dashboard')
  } catch (e) {
    const msg = e?.response?.data?.error?.message || '설정을 완료하지 못했습니다.'
    alert.show(msg, 'error')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  min-height: 100dvh;
  background: linear-gradient(180deg, #f8f8f9 0%, #f3f4f6 100%);
  display: flex;
  justify-content: center;
  padding: 40px 24px;
}

.auth-shell {
  width: 100%;
  max-width: 420px;
  min-height: calc(100dvh - 80px);
  display: flex;
  flex-direction: column;
}

.auth-header {
  padding-top: 58px;
  text-align: center;
}

.auth-logo {
  width: 62px;
  height: 62px;
  border-radius: 16px;
  margin: 0 auto 14px;
}

.auth-title {
  margin: 0;
  font-size: 30px;
  line-height: 1.12;
  font-weight: 900;
  color: #111827;
  letter-spacing: -0.055em;
}

.auth-subtitle {
  margin: 14px 0 0;
  font-size: 14px;
  color: #737373;
  font-weight: 500;
  letter-spacing: -0.025em;
  word-break: keep-all;
}

.setup-form {
  width: 100%;
  max-width: 304px;
  margin: 44px auto 0;
}

.section-label {
  margin-bottom: 10px;
  font-size: 15px;
  font-weight: 800;
  color: #111827;
  letter-spacing: -0.035em;
}

.nickname-row {
  display: flex;
  gap: 8px;
  align-items: flex-start;
}

.nickname-input {
  flex: 1;
}

.check-btn {
  width: 64px;
  height: 40px;
  border-radius: 4px;
  color: #111827;
  border-color: #111827;
  font-size: 14px;
  font-weight: 800;
}

.nickname-message {
  min-height: 30px;
  margin-top: 8px;
  padding: 6px 10px;
  border-radius: 7px;
  display: flex;
  align-items: center;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.nickname-message.is-hidden {
  visibility: hidden;
}

.nickname-message.is-success {
  background: #ecfdf5;
  color: #047857;
}

.nickname-message.is-error {
  background: #fef2f2;
  color: #b91c1c;
}

.agreement-title {
  margin-top: 20px;
}

.agreement-list {
  color: #374151;
  font-size: 14px;
  font-weight: 500;
}

.agreement-item {
  width: 100%;
  min-height: 40px;
  margin-bottom: 2px;
  border-radius: 8px;
}

.start-btn {
  width: 100%;
  height: 42px;
  margin-top: 22px;
  border-radius: 4px;
  background: #0f172a !important;
  color: #ffffff;
  font-size: 15px;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.start-btn.q-btn--disabled {
  background: #6b7280 !important;
  color: #ffffff !important;
  opacity: 1 !important;
}

.brand-copy {
  margin: 52px 0 0;
  text-align: center;
  color: #a3a3a3;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.015em;
}

a {
  color: #0f172a;
  font-weight: 800;
  text-decoration: underline;
  text-underline-offset: 3px;
}

@media (max-width: 420px) {
  .auth-page {
    padding: 34px 24px;
  }

  .auth-shell {
    min-height: calc(100dvh - 68px);
  }

  .auth-header {
    padding-top: 46px;
  }

  .setup-form {
    max-width: 304px;
    margin-top: 38px;
  }

  .brand-copy {
    margin-top: 44px;
  }
}

@media (max-height: 760px) {
  .auth-header {
    padding-top: 22px;
  }

  .setup-form {
    margin-top: 28px;
  }

  .agreement-title {
    margin-top: 16px;
  }

  .start-btn {
    margin-top: 18px;
  }

  .brand-copy {
    margin-top: 28px;
  }
}
</style>
