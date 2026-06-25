<template>
  <q-page class="auth-page">
    <main class="auth-shell">
      <div class="top-nav">
        <button type="button" class="back-btn" aria-label="로그인으로 돌아가기" @click="logout">
          <q-icon name="arrow_back" size="24px" />
        </button>
      </div>

      <section class="connect-block">
        <div class="auth-header">
          <q-img src="~assets/logo.png" alt="Pokerly Logo" class="auth-logo" />

          <h1 class="auth-title">계정 연결</h1>

          <p class="auth-subtitle">
            <strong>{{ auth.user?.nickname || '현재' }}</strong> 계정의 기존 기록을 유지하려면<br />
            Google 계정을 연결해주세요.
          </p>
        </div>

        <section class="connect-actions">
          <div ref="googleButtonRef" class="google-button-wrap"></div>

          <q-btn flat no-caps class="logout-btn" label="로그아웃" @click="logout" />
        </section>

        <p class="brand-copy">Record. Review. Improve.</p>
      </section>
    </main>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from 'stores/auth'
import { useAlert } from 'src/composables/useAlert'

const router = useRouter()
const auth = useAuthStore()
const alert = useAlert()

const loading = ref(null)
const googleButtonRef = ref(null)

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID

const loadGoogleScript = () => {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) {
      resolve()
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

const logout = async () => {
  await auth.logout()
  router.replace('/login')
}

onMounted(async () => {
  if (!GOOGLE_CLIENT_ID) {
    alert.show('Google 로그인 설정이 누락되었습니다.', 'negative')
    return
  }

  await loadGoogleScript()

  window.google.accounts.id.initialize({
    client_id: GOOGLE_CLIENT_ID,
    callback: async (response) => {
      loading.value = 'google'

      try {
        await auth.linkGoogle({
          idToken: response.credential,
        })

        alert.show('계정 연결이 완료되었습니다.', 'success')
        router.replace('/app/dashboard')
      } catch (e) {
        console.error(e)

        const code = e?.response?.data?.error?.code
        const message = e?.response?.data?.error?.message

        if (code === 'SOCIAL_ALREADY_LINKED') {
          alert.show(
            '이미 다른 Pokerly 계정에 연결된 Google 계정입니다. 다른 Google 계정을 선택해주세요.',
            'warning',
          )
          return
        }

        if (code === 'GOOGLE_TOKEN_INVALID') {
          alert.show('Google 인증이 만료되었습니다. 다시 시도해주세요.', 'warning')
          return
        }

        alert.show(message || '계정 연결에 실패했습니다.', 'negative')
      } finally {
        loading.value = null
      }
    },
  })

  window.google.accounts.id.renderButton(googleButtonRef.value, {
    type: 'standard',
    theme: 'outline',
    size: 'large',
    text: 'continue_with',
    shape: 'pill',
    width: 312,
  })
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

.top-nav {
  width: 100%;
  max-width: 312px;
  margin: 0 auto;
}

.back-btn {
  width: 36px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0;
  background: transparent;
  color: #111827;
  padding: 0;
  cursor: pointer;
}

.connect-block {
  width: 100%;
  margin-top: 72px;
}

.auth-header {
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
  margin: 28px auto 0;
  color: #737373;
  font-size: 15px;
  font-weight: 500;
  line-height: 1.65;
  letter-spacing: -0.025em;
  word-break: keep-all;
}

.auth-subtitle strong {
  color: #111827;
  font-weight: 800;
}

.connect-actions {
  width: 100%;
  max-width: 312px;
  margin: 46px auto 0;
}

.google-button-wrap {
  width: 312px;
  max-width: 100%;
  min-height: 44px;
  display: flex;
  justify-content: center;
}

.logout-btn {
  width: 100%;
  height: 38px;
  margin-top: 18px;
  color: #777;
  font-size: 13px;
  font-weight: 800;
}

.brand-copy {
  margin: 56px 0 0;
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

  .top-nav,
  .connect-actions {
    max-width: 304px;
  }

  .connect-block {
    margin-top: 62px;
  }

  .google-button-wrap {
    width: 304px;
  }

  .auth-title {
    font-size: 30px;
  }

  .auth-subtitle {
    margin-top: 26px;
  }

  .connect-actions {
    margin-top: 40px;
  }

  .brand-copy {
    margin-top: 48px;
  }
}

@media (max-height: 700px) {
  .connect-block {
    margin-top: 34px;
  }

  .auth-subtitle {
    margin-top: 18px;
  }

  .connect-actions {
    margin-top: 30px;
  }

  .brand-copy {
    margin-top: 30px;
  }
}
</style>
