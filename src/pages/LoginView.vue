<template>
  <q-page class="auth-page">
    <div class="ambient ambient--one"></div>
    <div class="ambient ambient--two"></div>
    <div class="card-outline card-outline--left"><span>A</span><b>♠</b></div>
    <div class="card-outline card-outline--right"><span>K</span><b>♠</b></div>

    <main class="auth-shell">
      <section class="login-block">
        <div class="auth-header">
          <div class="brand-symbol" aria-label="Pokerly">
            <svg viewBox="0 0 120 130" role="img" aria-hidden="true">
              <defs>
                <linearGradient id="brandSpadeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#f6c8ff" />
                  <stop offset="46%" stop-color="#b94ff4" />
                  <stop offset="100%" stop-color="#6521da" />
                </linearGradient>
              </defs>
              <path
                class="spade-shape"
                d="M60 4C49 22 20 45 20 72C20 91 40 101 56 89C55 103 50 113 44 122H76C70 113 65 103 64 89C80 101 100 91 100 72C100 45 71 22 60 4Z"
              />
              <g class="chart-bars">
                <rect x="43" y="58" width="8" height="25" rx="4" />
                <rect x="56" y="43" width="8" height="40" rx="4" />
                <rect x="69" y="52" width="8" height="31" rx="4" />
              </g>
            </svg>
          </div>
          <h1 class="auth-title">Pokerly</h1>
          <p class="brand-tagline">TRACK. ANALYZE. IMPROVE.</p>
          <p class="brand-description">포커를 기록하고 분석하여<br />더 나은 플레이로.</p>
        </div>

        <section class="login-actions">
          <div class="google-slot">
            <div class="google-button-frame" :class="{ ready: googleReady }">
              <button
                class="google-button-placeholder"
                type="button"
                :disabled="!googleFallbackEnabled"
                @click="handleGoogleFallback"
              >
                <strong>G</strong>
                <span>{{ googleFallbackLabel }}</span>
              </button>
              <div ref="googleButtonRef" class="google-button-wrap"></div>
            </div>
          </div>

          <div class="login-divider"><span></span><em>또는</em><span></span></div>

          <button class="legacy-btn" type="button" @click="goLegacyLogin">
            <span>기존 계정으로 로그인</span>
            <q-icon name="chevron_right" size="20px" />
          </button>
        </section>
      </section>
    </main>
  </q-page>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from 'stores/auth'
import { useAlert } from 'src/composables/useAlert'
import { loadGoogleIdentity } from 'src/utils/googleIdentity'
import { isKakaoInAppBrowser, openInSystemBrowser } from 'src/utils/inAppBrowser'

const router = useRouter()
const auth = useAuthStore()
const alert = useAlert()

const loading = ref(null)
const googleButtonRef = ref(null)
const googleReady = ref(false)
const googleLoadFailed = ref(false)
const isKakaoBrowser = isKakaoInAppBrowser()

const googleFallbackEnabled = isKakaoBrowser || googleLoadFailed
const googleFallbackLabel = isKakaoBrowser ? '기본 브라우저에서 Google 로그인' : 'Google로 계속하기'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID

const handleGoogleFallback = () => {
  if (isKakaoBrowser) {
    openInSystemBrowser()
    return
  }

  googleLoadFailed.value = false
  initGoogleLogin()
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

  router.replace('/app/home')
}

const goLegacyLogin = () => {
  router.push('/legacy-login')
}

const initGoogleLogin = async () => {
  if (!GOOGLE_CLIENT_ID) {
    alert.show('Google 로그인 설정이 누락되었습니다.', 'error')
    return
  }

  if (isKakaoBrowser) return

  try {
    await loadGoogleIdentity()
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

          alert.show(message || 'Google 로그인에 실패했습니다.', 'error')
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
      width: 320,
    })

    googleReady.value = true
  } catch (e) {
    console.error(e)
    googleReady.value = false
    googleLoadFailed.value = true
    alert.show('Google 로그인을 불러오지 못했습니다. 버튼을 눌러 다시 시도해주세요.', 'error')
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
  overflow: hidden;
  background:
    radial-gradient(circle at 50% 38%, rgba(92, 28, 204, .2), transparent 31%),
    radial-gradient(circle at 50% 110%, rgba(63, 13, 129, .19), transparent 36%),
    linear-gradient(180deg, #090719 0%, #070515 52%, #050410 100%);
  display: flex;
  justify-content: center;
  padding: 30px 24px;
  color: #fff;
}

.auth-shell {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 420px;
  min-height: calc(100dvh - 60px);
  display: flex;
  flex-direction: column;
}

.login-block {
  width: 100%;
  margin-top: clamp(50px, 9vh, 92px);
}

.auth-header {
  text-align: center;
}

.brand-symbol {
  width: 112px;
  height: 122px;
  margin: 0 auto -2px;
  filter: drop-shadow(0 12px 26px rgba(137, 52, 255, .34));
}

.brand-symbol svg {
  display: block;
  width: 100%;
  height: 100%;
  overflow: visible;
}

.spade-shape {
  fill: url(#brandSpadeGradient);
  stroke: rgba(255, 255, 255, .58);
  stroke-width: 1.2;
}

.chart-bars rect {
  fill: rgba(250, 211, 255, .25);
  stroke: #331064;
  stroke-width: 3;
}

.ambient {
  position: absolute;
  z-index: 0;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: #8c2cff;
  box-shadow: 0 0 12px 3px rgba(140, 44, 255, .62);
}

.ambient--one { top: 17%; left: 67%; }
.ambient--two { top: 34%; left: 11%; }

.card-outline {
  position: absolute;
  z-index: 0;
  width: 102px;
  height: 148px;
  padding: 12px;
  border: 2px solid rgba(116, 37, 230, .14);
  border-radius: 10px;
  color: rgba(134, 44, 237, .18);
  font-family: Georgia, serif;
  transform: rotate(-18deg);
}

.card-outline span { display: block; font-size: 23px; }
.card-outline b { display: block; margin-top: 5px; font-size: 38px; }
.card-outline--left { top: 21%; left: -47px; }
.card-outline--right { top: 21%; right: -47px; transform: rotate(16deg); }

.card-outline--right b {
  font-size: 48px;
}

.auth-title {
  margin: 0;
  color: #fff;
  font-size: clamp(50px, 15vw, 64px);
  line-height: 1;
  font-weight: 720;
  letter-spacing: -.045em;
  text-shadow: 0 4px 20px rgba(255, 255, 255, .12);
}

.brand-tagline {
  margin: 13px 0 0;
  background: linear-gradient(90deg, #c85fff, #ae74ff);
  background-clip: text;
  color: transparent;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: .29em;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.brand-description {
  margin: 25px 0 0;
  color: rgba(255, 255, 255, .78);
  font-size: 14px;
  font-weight: 460;
  line-height: 1.55;
}

.login-actions {
  width: 100%;
  max-width: 320px;
  margin: 34px auto 0;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.google-slot {
  width: 100%;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.google-button-frame {
  position: relative;
  width: 320px;
  max-width: 100%;
  height: 44px;
  overflow: hidden;
  border-radius: 4px;
}

.google-button-placeholder {
  position: absolute;
  inset: 0;
  display: grid;
  grid-template-columns: 24px auto 24px;
  align-items: center;
  padding: 0 11px;
  border: 1px solid #dadce0;
  border-radius: 4px;
  background: #fff;
  color: #3c4043;
  font-family: Roboto, Arial, sans-serif;
  font-size: 14px;
  font-weight: 500;
  cursor: default;
}

.google-button-placeholder:not(:disabled) {
  cursor: pointer;
}

.google-button-placeholder strong {
  color: #4285f4;
  font-size: 18px;
  font-weight: 700;
}

.google-button-placeholder span {
  text-align: center;
}

.google-button-wrap {
  position: absolute;
  inset: 0;
  z-index: 1;
  width: 320px;
  max-width: 100%;
  height: 44px;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  visibility: hidden;
}

.google-button-frame.ready .google-button-wrap {
  visibility: visible;
}

.legacy-btn {
  position: relative;
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: center;
  min-height: 42px;
  padding: 0;
  border: 0;
  background: transparent;
  color: #b76aff;
  font: inherit;
  font-size: 14px;
  font-weight: 600;
}

.legacy-btn > .q-icon {
  position: absolute;
  left: calc(50% + 105px);
}

.login-divider {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 15px;
}

.login-divider span {
  height: 1px;
  background: rgba(255, 255, 255, .22);
}

.login-divider em {
  color: rgba(255, 255, 255, .38);
  font-size: 11px;
  font-style: normal;
}

@media (max-width: 420px) {
  .auth-page {
    padding: 24px;
  }

  .auth-shell {
    min-height: calc(100dvh - 48px);
  }

  .login-block {
    margin-top: clamp(42px, 8vh, 70px);
  }

  .login-actions {
    max-width: 320px;
    margin-top: 30px;
  }

  .google-button-wrap {
    width: 320px;
  }

}

@media (max-height: 700px) {
  .login-block {
    margin-top: 22px;
  }

  .brand-symbol { width: 92px; height: 100px; }
  .auth-title { font-size: 48px; }
  .brand-description { margin-top: 17px; }
  .login-actions {
    margin-top: 22px;
    gap: 13px;
  }
}
</style>
