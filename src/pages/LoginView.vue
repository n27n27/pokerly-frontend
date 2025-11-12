<template>
  <q-page class="flex flex-center bg-page">
    <q-card flat bordered class="q-pa-lg shadow-2 card-modern">
      <q-card-section class="text-h5 text-primary text-center"> Pokerly </q-card-section>

      <q-card-section class="q-gutter-md">
        <q-input v-model="nickname" label="아이디" filled color="primary" autofocus />
        <q-input v-model="password" label="비밀번호" type="password" filled color="primary" />
      </q-card-section>

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

// 상태 변수
const nickname = ref('')
const password = ref('')
const loading = ref(false)

// 기본 구성 요소
const router = useRouter()
const auth = useAuthStore()

// 로그인 처리
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
.bg-page {
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  min-height: 100vh;
}

.card-modern {
  width: 360px;
  max-width: 90vw;
  border-radius: 20px;
  background: #ffffff;
}

.q-input__control {
  border-radius: 10px;
}
</style>
