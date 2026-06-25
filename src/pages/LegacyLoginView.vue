<template>
  <q-page class="auth-page">
    <main class="auth-shell">
      <div class="top-nav">
        <button type="button" class="back-btn" @click="router.replace('/login')">
          <q-icon name="arrow_back" size="22px" />
          <span>로그인</span>
        </button>
      </div>

      <section class="login-block">
        <div class="auth-header">
          <q-img src="~assets/logo.png" alt="Pokerly Logo" class="auth-logo" />

          <h1 class="auth-title">기존 계정 로그인</h1>
        </div>

        <section class="login-form">
          <q-input
            v-model="nickname"
            label="아이디"
            outlined
            dense
            color="dark"
            autofocus
            :disable="loading"
            class="auth-input"
          />

          <q-input
            v-model="password"
            label="비밀번호"
            type="password"
            outlined
            dense
            color="dark"
            :disable="loading"
            class="auth-input"
            @keyup.enter="onLogin"
          />

          <q-btn
            unelevated
            no-caps
            class="login-btn"
            label="로그인"
            :loading="loading"
            :disable="loading"
            @click="onLogin"
          />
        </section>

        <p class="brand-copy">Record. Review. Improve.</p>
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

    router.replace('/app/dashboard')
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
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 0;
  background: transparent;
  color: #111827;
  font-size: 16px;
  font-weight: 800;
  letter-spacing: -0.035em;
  padding: 0;
  cursor: pointer;
}

.login-block {
  width: 100%;
  margin-top: 68px;
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
  font-size: 24px;
  line-height: 1.15;
  font-weight: 800;
  color: #111827;
  letter-spacing: -0.05em;
}

.login-form {
  width: 100%;
  max-width: 312px;
  margin: 32px auto 0;
}

.auth-input {
  margin-bottom: 12px;
}

.login-btn {
  width: 100%;
  height: 42px;
  margin-top: 6px;
  border-radius: 4px;
  background: #0f172a !important;
  color: #ffffff;
  font-size: 15px;
  font-weight: 800;
  letter-spacing: -0.02em;
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

  .top-nav {
    max-width: 304px;
  }

  .login-block {
    margin-top: 58px;
  }

  .login-form {
    max-width: 304px;
    margin-top: 30px;
  }

  .brand-copy {
    margin-top: 50px;
  }
}

@media (max-height: 700px) {
  .login-block {
    margin-top: 34px;
  }

  .login-form {
    margin-top: 24px;
  }

  .brand-copy {
    margin-top: 32px;
  }
}
</style>
