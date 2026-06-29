<template>
  <q-page class="auth-page">
    <main class="auth-shell">
      <section class="login-block">
        <div class="auth-header">
          <q-img src="~assets/logo.png" alt="Pokerly Logo" class="auth-logo" />

          <h1 class="auth-title">Pokerly</h1>
        </div>

        <section class="login-actions">
          <div class="google-slot">
            <div
              ref="googleButtonRef"
              class="google-button-wrap"
              :class="{ ready: googleReady }"
            ></div>
          </div>

          <q-btn
            no-caps
            unelevated
            class="legacy-btn"
            label="기존 계정으로 로그인"
            @click="goLegacyLogin"
          />
        </section>

        <p class="brand-copy">Record. Review. Improve.</p>
      </section>
    </main>
  </q-page>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from 'stores/auth'
import { useAlert } from 'src/composables/useAlert'

const router = useRouter()
const auth = useAuthStore()
const alert = useAlert()

const loading = ref(null)
const googleButtonRef = ref(null)
const googleReady = ref(false)

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID

const loadGoogleScript = () => {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) {
      resolve()
      return
    }

    const existingScript = document.querySelector(
      'script[src="https://accounts.google.com/gsi/client"]',
    )

    if (existingScript) {
      existingScript.addEventListener('load', resolve, { once: true })
      existingScript.addEventListener('error', reject, { once: true })
      return
    }

    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = resolve
    script.onerror = reject
    document.head.appendChild(script)
  })
}

const handleAuthResult = async (payload) => {
  if (payload.nextStep === 'LINK_SOCIAL') {
    router.replace('/link-social')
    return
  }

  if (payload.nextStep === 'ONBOARDING') {
    router.replace('/onboarding')
    return
  }

  router.replace('/app/dashboard')
}

const goLegacyLogin = () => {
  router.push('/legacy-login')
}

const initGoogleLogin = async () => {
  if (!GOOGLE_CLIENT_ID) {
    alert.show('Google 로그인 설정이 누락되었습니다.', 'negative')
    return
  }

  try {
    await loadGoogleScript()
    await nextTick()

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: async (response) => {
        loading.value = 'google'

        try {
          const payload = await auth.loginWithGoogle({
            idToken: response.credential,
            language: navigator.language?.startsWith('en') ? 'en' : 'ko',
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Seoul',
          })

          await handleAuthResult(payload)
        } catch (e) {
          console.error(e)

          const code = e?.response?.data?.error?.code
          const message = e?.response?.data?.error?.message

          if (code === 'GOOGLE_TOKEN_INVALID') {
            alert.show('Google 인증이 만료되었습니다. 다시 시도해주세요.', 'warning')
            return
          }

          alert.show(message || 'Google 로그인에 실패했습니다.', 'negative')
        } finally {
          loading.value = null
        }
      },
    })

    if (!googleButtonRef.value) return

    googleButtonRef.value.innerHTML = ''

    window.google.accounts.id.renderButton(googleButtonRef.value, {
      type: 'standard',
      theme: 'outline',
      size: 'large',
      text: 'signin_with',
      shape: 'pill',
      width: 320,
    })

    googleReady.value = true
  } catch (e) {
    console.error(e)
    googleReady.value = false
    alert.show('Google 로그인 버튼을 불러오지 못했습니다.', 'negative')
  }
}

onMounted(() => {
  initGoogleLogin()
})
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

.login-block {
  width: 100%;
  margin-top: 82px;
}

.auth-header {
  text-align: center;
}

.auth-logo {
  width: 70px;
  height: 70px;
  border-radius: 18px;
  margin: 0 auto 15px;
}

.auth-title {
  margin: 0;
  font-size: 42px;
  line-height: 1.05;
  font-weight: 800;
  color: #111827;
  letter-spacing: -0.055em;
}

.login-actions {
  width: 100%;
  max-width: 320px;
  margin: 42px auto 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.google-slot {
  width: 100%;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.google-button-wrap {
  width: 320px;
  max-width: 100%;
  height: 44px;
  min-height: 44px;
  display: flex;
  justify-content: center;
  opacity: 0;
  transition: opacity 140ms ease;
}

.google-button-wrap.ready {
  opacity: 1;
}

.legacy-btn {
  width: 100%;
  height: 44px;
  min-height: 44px;
  padding: 0;
  border-radius: 999px;
  border: 1px solid #d7dbe2;
  background: #ffffff;
  color: #374151;
  font-size: 15px;
  font-weight: 500;
  letter-spacing: -0.02em;
}

.legacy-btn :deep(.q-btn__content) {
  min-height: 44px;
}

.brand-copy {
  margin: 46px 0 0;
  text-align: center;
  color: #a3a3a3;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.015em;
}

@media (max-width: 420px) {
  .auth-page {
    padding: 34px 24px;
  }

  .auth-shell {
    min-height: calc(100dvh - 68px);
  }

  .login-block {
    margin-top: 72px;
  }

  .login-actions {
    max-width: 320px;
    margin-top: 38px;
  }

  .google-button-wrap {
    width: 320px;
  }

  .brand-copy {
    margin-top: 42px;
  }
}

@media (max-height: 700px) {
  .login-block {
    margin-top: 42px;
  }

  .login-actions {
    margin-top: 30px;
  }

  .brand-copy {
    margin-top: 30px;
  }
}
</style>
