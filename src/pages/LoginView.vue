<template>
  <q-page class="flex flex-center bg-page">
    <q-card flat bordered class="q-pa-lg shadow-2 card-modern">
      <q-card-section class="text-h5 text-primary text-center"> Pokerly</q-card-section>

      <q-card-section class="q-gutter-md">
        <q-input v-model="id" label="아이디" filled color="primary" />
        <q-input v-model="password" label="비밀번호" type="password" filled color="primary" />
      </q-card-section>

      <q-card-actions align="between">
        <q-btn flat color="primary" label="회원가입" @click="$router.push('/signup')" />
        <q-btn unelevated color="primary" label="로그인" @click="onLogin" />
      </q-card-actions>
    </q-card>
    <GlobalAlert ref="alert" />
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from 'stores/auth'
import GlobalAlert from 'src/components/common/GlobalAlert.vue'

const id = ref('')
const password = ref('')
const router = useRouter()
const auth = useAuthStore()
const alert = ref(null)

function onLogin() {
  localStorage.setItem('pokerly_user', JSON.stringify({ id: id.value, password: password.value }))

  const ok = auth.login({ id: id.value, password: password.value })
  if (ok) {
    router.push('/ledger')
  } else {
    alert.value.show('아이디 또는 비밀번호가 올바르지 않습니다.', 'error')
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
