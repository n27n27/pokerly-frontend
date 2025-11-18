<template>
  <q-page class="flex flex-center bg-pokerly">
    <q-card flat bordered class="q-pa-lg shadow-2 card-pokerly">
      <!-- 상단 로고 + 타이틀 -->
      <q-card-section class="column items-center q-mb-md">
        <q-img
          src="~assets/logo.png"
          alt="Pokerly Logo"
          class="signup-logo q-mb-sm"
          spinner-color="primary"
        />
        <div class="text-h5 text-weight-bold text-primary">회원가입</div>
      </q-card-section>

      <!-- 입력 필드 -->
      <q-card-section class="q-gutter-md">
        <q-input v-model="nickname" label="닉네임" filled color="primary" />
        <q-input v-model="password" label="비밀번호" type="password" filled color="primary" />
        <q-input v-model="confirm" label="비밀번호 확인" type="password" filled color="primary" />
      </q-card-section>

      <!-- 버튼 -->
      <q-card-actions align="between">
        <q-btn flat color="primary" label="로그인으로 돌아가기" @click="router.push('/login')" />
        <q-btn
          unelevated
          color="primary"
          label="가입하기"
          :loading="loading"
          :disable="loading"
          @click="onSignup"
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

const router = useRouter()
const nickname = ref('')
const password = ref('')
const confirm = ref('')
const loading = ref(false)
const auth = useAuthStore()
const alert = useAlert()

const onSignup = async () => {
  if (!nickname.value || !password.value) {
    alert.show('닉네임과 비밀번호를 입력하세요.', 'warning')
    return
  }
  if (password.value !== confirm.value) {
    alert.show('비밀번호가 일치하지 않습니다.', 'error')
    return
  }

  loading.value = true
  try {
    await auth.register({
      nickname: nickname.value.trim(),
      password: password.value,
    })
    alert.show('회원가입 완료! 🎉 Pokerly에 오신 것을 환영합니다.', 'success')
    router.replace('/login')
  } catch (e) {
    const msg = e?.response?.data?.message || '회원가입 중 오류가 발생했습니다.'
    alert.show(msg, 'error')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* Pokerly 브랜드 배경 */
.bg-pokerly {
  background: linear-gradient(135deg, #e8f5e9 0%, #f1f8f6 100%);
  min-height: 100vh;
}

/* 카드 스타일: 로그인 뷰와 동일 */
.card-pokerly {
  width: 360px;
  max-width: 90vw;
  border-radius: 18px;
  background: #ffffff;
  border: 1px solid #dceee2;
  box-shadow: 0 4px 10px rgba(15, 157, 88, 0.15);
}

/* 로고 크기 */
.signup-logo {
  width: 64px;
  height: 64px;
}

/* 입력 필드 라운드 */
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
