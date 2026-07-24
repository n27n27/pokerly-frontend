<template>
  <q-page class="auth-page">
    <main class="auth-shell">
      <div class="top-nav">
        <button type="button" class="back-btn" aria-label="뒤로 가기" @click="router.replace('/login')">
          <q-icon name="chevron_left" size="29px" />
        </button>
      </div>

      <section class="login-block">
        <div class="auth-header">
          <div class="auth-logo" aria-hidden="true">
            <svg viewBox="0 0 120 130">
              <defs>
                <linearGradient id="legacySpadeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#f6c8ff" />
                  <stop offset="48%" stop-color="#b94ff4" />
                  <stop offset="100%" stop-color="#6521da" />
                </linearGradient>
              </defs>
              <path d="M60 4C49 22 20 45 20 72C20 91 40 101 56 89C55 103 50 113 44 122H76C70 113 65 103 64 89C80 101 100 91 100 72C100 45 71 22 60 4Z" />
            </svg>
          </div>
          <h1 class="auth-title">기존 계정 로그인</h1>
          <p>가입한 아이디와 비밀번호를 입력해주세요.</p>
        </div>

        <section class="login-form">
          <label class="auth-field">
            <span>아이디</span>
            <input
              v-model="nickname"
              autocomplete="username"
              autofocus
              :disabled="loading"
              placeholder="아이디를 입력해주세요"
            />
          </label>

          <label class="auth-field">
            <span>비밀번호</span>
            <span class="password-control">
              <input
                v-model="password"
                :type="passwordVisible ? 'text' : 'password'"
                autocomplete="current-password"
                :disabled="loading"
                placeholder="비밀번호를 입력해주세요"
                @keyup.enter="onLogin"
              />
              <button type="button" :aria-label="passwordVisible ? '비밀번호 숨기기' : '비밀번호 보기'" @click="passwordVisible = !passwordVisible">
                <q-icon :name="passwordVisible ? 'visibility_off' : 'visibility'" size="19px" />
              </button>
            </span>
          </label>

          <button class="login-btn" type="button" :disabled="loading" @click="onLogin">
            <q-spinner v-if="loading" size="20px" />
            <span v-else>로그인</span>
          </button>
        </section>

        <p class="brand-copy">TRACK. ANALYZE. IMPROVE.</p>
      </section>
    </main>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from 'stores/auth'
import { useAlert } from 'src/composables/useAlert'

const alert = useAlert()
const router = useRouter()
const auth = useAuthStore()

const nickname = ref('')
const password = ref('')
const loading = ref(false)
const passwordVisible = ref(false)

const onLogin = async () => {
  if (!nickname.value.trim() || !password.value) {
    alert.show('아이디와 비밀번호를 입력해주세요.', 'warning')
    return
  }

  loading.value = true

  try {
    const result = await auth.login({
      nickname: nickname.value.trim(),
      password: password.value,
    })

    if (result.nextStep === 'LINK_SOCIAL') {
      router.replace('/link-social')
      return
    }

    if (result.nextStep === 'ONBOARDING') {
      router.replace('/onboarding')
      return
    }

    router.replace('/app/home')
  } catch (e) {
    console.error(e)
    const msg = e?.response?.data?.message || '아이디 또는 비밀번호가 올바르지 않습니다.'
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
}

.login-block {
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
  fill: url(#legacySpadeGradient);
  stroke: rgba(255, 255, 255, .56);
  stroke-width: 1.2;
}

.auth-title {
  margin: 0;
  font-size: 25px;
  line-height: 1.15;
  font-weight: 650;
  color: #fff;
  letter-spacing: -.035em;
}

.auth-header p {
  margin: 10px 0 0;
  color: rgba(255, 255, 255, .54);
  font-size: 12px;
  line-height: 1.4;
}

.login-form {
  width: 100%;
  max-width: 328px;
  margin: 31px auto 0;
  display: grid;
  gap: 15px;
}

.auth-field {
  display: grid;
  gap: 8px;
}

.auth-field > span:first-child {
  color: rgba(255, 255, 255, .72);
  font-size: 11px;
  font-weight: 560;
}

.auth-field input {
  width: 100%;
  height: 48px;
  padding: 0 14px;
  border: 1px solid rgba(255, 255, 255, .16);
  border-radius: 11px;
  outline: 0;
  background: rgba(255, 255, 255, .07);
  color: #fff;
  font: inherit;
  font-size: 14px;
  transition: border-color 140ms ease, background 140ms ease, box-shadow 140ms ease;
}

.auth-field input::placeholder {
  color: rgba(255, 255, 255, .3);
}

.auth-field input:focus {
  border-color: rgba(183, 106, 255, .72);
  background: rgba(255, 255, 255, .095);
  box-shadow: 0 0 0 3px rgba(145, 63, 237, .12);
}

.password-control {
  position: relative;
  display: block;
}

.password-control input {
  padding-right: 46px;
}

.password-control button {
  position: absolute;
  top: 50%;
  right: 7px;
  display: grid;
  width: 34px;
  height: 34px;
  place-items: center;
  padding: 0;
  border: 0;
  background: transparent;
  color: rgba(255, 255, 255, .48);
  transform: translateY(-50%);
}

.login-btn {
  display: grid;
  width: 100%;
  height: 48px;
  place-items: center;
  margin-top: 5px;
  border: 0;
  border-radius: 11px;
  background: linear-gradient(135deg, #a33ff0, #6d32df);
  color: #fff;
  font: inherit;
  font-size: 14px;
  font-weight: 620;
  box-shadow: 0 10px 24px rgba(101, 33, 218, .24);
}

.login-btn:disabled {
  opacity: .65;
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

  .login-block {
    margin-top: clamp(48px, 9vh, 76px);
  }

  .login-form {
    max-width: 328px;
    margin-top: 30px;
  }

  .brand-copy {
    margin-top: 50px;
  }
}

@media (max-height: 700px) {
  .login-block {
    margin-top: 28px;
  }

  .login-form {
    margin-top: 22px;
  }

  .brand-copy {
    margin-top: 26px;
  }
}
</style>
