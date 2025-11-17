<template>
  <q-page class="flex flex-center bg-pokerly">
    <q-card flat bordered class="q-pa-lg shadow-2 card-pokerly">
      <!-- 상단 로고 + 타이틀 -->
      <q-card-section class="column items-center q-mb-md">
        <q-img
          src="src/assets/logo.png"
          alt="Pokerly Logo"
          class="login-logo q-mb-sm"
          spinner-color="primary"
        />
        <div class="text-h5 text-weight-bold text-primary">Pokerly</div>
      </q-card-section>

      <!-- 입력 필드 -->
      <q-card-section class="q-gutter-md">
        <q-input v-model="nickname" label="아이디" filled color="primary" autofocus />
        <q-input v-model="password" label="비밀번호" type="password" filled color="primary" />
      </q-card-section>

      <!-- 버튼 -->
      <q-card-actions align="between">
        <q-btn flat color="primary" label="회원가입" to="/signup" />
        <q-btn
          unelevated
          color="primary"
          label="로그인"
          :loading="loading"
          :disable="loading"
          @click="onLogin"
        />
      </q-card-actions>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from 'stores/auth'
import { useAlert } from 'src/composables/useAlert'

const alert = useAlert()

const nickname = ref('')
const password = ref('')
const loading = ref(false)
const router = useRouter()
const auth = useAuthStore()

const onLogin = async () => {
  if (!nickname.value || !password.value) {
    alert.show('아이디와 비밀번호를 입력하세요.', 'warning')
    return
  }

  loading.value = true
  try {
    await auth.login({
      nickname: nickname.value.trim(),
      password: password.value,
    })
    alert.show('로그인 성공! 🎉', 'success')
    router.replace('/ledger')
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
/* 부드러운 Pokerly 브랜드 배경 */
.bg-pokerly {
  background: linear-gradient(135deg, #e8f5e9 0%, #f1f8f6 100%);
  min-height: 100vh;
}

/* 카드 스타일: 브랜드 톤 반영 */
.card-pokerly {
  width: 360px;
  max-width: 90vw;
  border-radius: 18px;
  background: #ffffff;
  border: 1px solid #dceee2;
  box-shadow: 0 4px 10px rgba(15, 157, 88, 0.15);
}

/* 로고 크기 */
.login-logo {
  width: 64px;
  height: 64px;
}

/* 입력 필드 모서리 라운드 */
.q-input__control {
  border-radius: 10px;
}

/* 버튼 강조 */
.q-btn[color='primary'] {
  font-weight: 600;
}

/* 기본 브랜드 색상 */
.text-primary {
  color: #0f9d58 !important;
}
</style>
