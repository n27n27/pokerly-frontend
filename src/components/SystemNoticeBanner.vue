<template>
  <q-banner v-if="visible" class="bg-red-2 text-dark q-px-md q-py-sm" rounded inline-actions>
    <div class="text-weight-bold">[긴급 안내] 서비스 데이터 초기화</div>

    <div class="text-caption q-mt-xs">
      보안 이슈 대응 과정에서 <b>회원정보/기록 데이터가 초기화</b>되었습니다.
      <b>기존 계정으로 로그인할 수 없으며, 회원가입부터 다시</b> 진행해 주세요.
    </div>

    <template #action>
      <q-btn flat dense label="자세히" @click="open = true" />
      <q-btn flat dense label="닫기" @click="dismiss" />
    </template>
  </q-banner>

  <q-dialog v-model="open">
    <q-card style="max-width: 560px; width: 92vw">
      <q-card-section class="text-h6 text-weight-bold"> 서비스 데이터 초기화 안내 </q-card-section>

      <q-card-section class="text-body2">
        <div class="q-mb-sm">
          서버 보안 이슈로 인해 긴급 조치가 진행되었고, 그 과정에서 데이터가 초기화되었습니다.
        </div>

        <q-separator class="q-my-md" />

        <div class="text-weight-bold q-mb-xs">사용자 영향</div>
        <ul class="q-pl-md q-mt-xs q-mb-md">
          <li><b>기존 회원 계정 정보가 초기화</b>되어 로그인 불가</li>
          <li><b>가계부/매장/세션/툴 사용 기록 등</b> 저장 데이터 초기화</li>
        </ul>

        <div class="text-weight-bold q-mb-xs">해야 할 일</div>
        <ul class="q-pl-md q-mt-xs q-mb-md">
          <li><b>회원가입부터 다시</b> 진행</li>
        </ul>

        <div class="text-grey-7 text-caption">
          불편을 드려 죄송합니다. 안정화와 재발 방지를 위해 추가 보안 강화 작업을 진행 중입니다.
          데이터 손실이 일어나지 않게 DB 백업 및 복원 체계도 재점검하고 있습니다.
        </div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="확인" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, onMounted } from 'vue'

/**
 * NOTICE_ID만 바꾸면, 이전에 "닫기" 눌렀던 사람도 다시 공지가 뜸.
 * (긴급 공지 업데이트할 때 유용)
 */
const NOTICE_ID = '2026-01-08-incident-reset-v1'
const DISMISS_KEY = `notice_dismissed_${NOTICE_ID}`

const visible = ref(false)
const open = ref(false)

onMounted(() => {
  visible.value = localStorage.getItem(DISMISS_KEY) !== '1'
})

function dismiss() {
  localStorage.setItem(DISMISS_KEY, '1')
  visible.value = false
}
</script>
