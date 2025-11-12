<template>
  <q-page class="flex flex-center bg-page">
    <q-card flat bordered class="q-pa-lg shadow-2 card-modern">
      <q-card-section class="text-h5 text-primary text-center"> 회원가입 </q-card-section>

      <q-card-section class="q-gutter-md">
        <q-input v-model="nickname" label="닉네임" filled color="primary" />
        <q-input v-model="password" label="비밀번호" type="password" filled color="primary" />
        <q-input v-model="confirm" label="비밀번호 확인" type="password" filled color="primary" />
      </q-card-section>

      <q-card-actions align="between">
        <q-btn flat color="primary" label="로그인으로 돌아가기" @click="$router.push('/login')" />
        <q-btn unelevated color="primary" label="가입하기" @click="onSignup" />
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
    // ✅ 회원가입은 nickname + password
    await auth.register({
      nickname: nickname.value.trim(),
      password: password.value,
    })

    alert.show('회원가입 완료! 환영합니다 👋', 'success')
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
