<template>
  <q-page class="auth-page">
    <main class="auth-shell">
      <div class="top-nav">
        <button type="button" class="back-btn" aria-label="로그인으로 돌아가기" @click="logout">
          <q-icon name="chevron_left" size="29px" />
        </button>
      </div>

      <section class="connect-block">
        <div class="auth-header">
          <div class="auth-logo" aria-hidden="true">
            <svg viewBox="0 0 120 130">
              <defs>
                <linearGradient id="linkSpadeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#f6c8ff" />
                  <stop offset="48%" stop-color="#b94ff4" />
                  <stop offset="100%" stop-color="#6521da" />
                </linearGradient>
              </defs>
              <path d="M60 4C49 22 20 45 20 72C20 91 40 101 56 89C55 103 50 113 44 122H76C70 113 65 103 64 89C80 101 100 91 100 72C100 45 71 22 60 4Z" />
            </svg>
          </div>

          <h1 class="auth-title">계정 연결</h1>

          <p class="auth-subtitle">
            <strong>{{ auth.user?.nickname || '현재' }}</strong> 계정의 기존 기록을 유지하려면<br />
            Google 계정을 연결해주세요.
          </p>
        </div>

        <section class="connect-actions">
          <div class="google-slot">
            <div
              ref="googleButtonRef"
              class="google-button-wrap"
              :class="{ ready: googleReady }"
            ></div>
          </div>

          <button class="logout-btn" type="button" @click="logout">로그아웃</button>
        </section>

        <p class="brand-copy">TRACK. ANALYZE. IMPROVE.</p>
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

const logout = async () => {
  await auth.logout()
  router.replace('/login')
}

const initGoogleLink = async () => {
  if (!GOOGLE_CLIENT_ID) {
    alert.show('Google 로그인 설정이 누락되었습니다.', 'error')
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
          await auth.linkGoogle({
            idToken: response.credential,
          })

          alert.show('계정 연결이 완료되었습니다.', 'success')
          router.replace('/app/home')
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

          alert.show(message || '계정 연결에 실패했습니다.', 'error')
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
      text: 'continue_with',
      shape: 'rectangular',
      width: 328,
    })

    googleReady.value = true
  } catch (e) {
    console.error(e)
    googleReady.value = false
    alert.show('Google 로그인 버튼을 불러오지 못했습니다.', 'error')
  }
}

onMounted(() => {
  initGoogleLink()
})
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  min-height: 100dvh;
  overflow: hidden;
  background:
    radial-gradient(circle at 50% 30%, rgba(94, 31, 200, .17), transparent 30%),
    linear-gradient(180deg, #090719 0%, #070515 55%, #050410 100%);
  display: flex;
  justify-content: center;
  padding: 28px 24px;
  color: #fff;
}

.auth-shell {
  width: 100%;
  max-width: 420px;
  min-height: calc(100dvh - 56px);
  display: flex;
  flex-direction: column;
}

.top-nav {
  display: grid;
  width: 100%;
  min-height: 36px;
  grid-template-columns: 40px;
  align-items: center;
}

.back-btn {
  display: grid;
  width: 36px;
  height: 36px;
  place-items: center;
  padding: 0;
  border: 0;
  background: transparent;
  color: #fff;
  cursor: pointer;
}

.connect-block {
  width: 100%;
  margin-top: clamp(56px, 10vh, 94px);
}

.auth-header {
  text-align: center;
}

.auth-logo {
  width: 58px;
  height: 63px;
  margin: 0 auto 17px;
  filter: drop-shadow(0 9px 18px rgba(137, 52, 255, .3));
}

.auth-logo svg {
  display: block;
  width: 100%;
  height: 100%;
}

.auth-logo path {
  fill: url(#linkSpadeGradient);
  stroke: rgba(255, 255, 255, .56);
  stroke-width: 1.2;
}

.auth-title {
  margin: 0;
  color: #fff;
  font-size: 25px;
  line-height: 1.15;
  font-weight: 650;
  letter-spacing: -.035em;
}

.auth-subtitle {
  margin: 13px auto 0;
  color: rgba(255, 255, 255, .54);
  font-size: 12px;
  font-weight: 460;
  line-height: 1.55;
  letter-spacing: -.015em;
  word-break: keep-all;
}

.auth-subtitle strong {
  color: rgba(255, 255, 255, .88);
  font-weight: 650;
}

.connect-actions {
  width: 100%;
  max-width: 328px;
  margin: 34px auto 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.google-slot {
  width: 100%;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.google-button-wrap {
  width: 328px;
  max-width: 100%;
  height: 44px;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 140ms ease;
}

.google-button-wrap.ready {
  opacity: 1;
}

.logout-btn {
  display: grid;
  width: 100%;
  min-height: 40px;
  place-items: center;
  padding: 0;
  border: 0;
  background: transparent;
  color: #b76aff;
  font: inherit;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.brand-copy {
  margin: 48px 0 0;
  text-align: center;
  color: #a75cf0;
  font-size: 9px;
  font-weight: 600;
  letter-spacing: .23em;
}

@media (max-width: 420px) {
  .auth-page {
    padding: 24px;
  }

  .auth-shell {
    min-height: calc(100dvh - 48px);
  }

  .connect-block {
    margin-top: clamp(48px, 9vh, 76px);
  }

  .connect-actions {
    max-width: 328px;
    margin-top: 32px;
  }

  .google-button-wrap {
    width: 328px;
  }
}

@media (max-height: 700px) {
  .connect-block {
    margin-top: 28px;
  }

  .auth-subtitle {
    margin-top: 10px;
  }

  .connect-actions {
    margin-top: 24px;
    gap: 14px;
  }

  .brand-copy {
    margin-top: 26px;
  }
}
</style>
