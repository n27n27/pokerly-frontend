<template>
  <q-page class="policy-document-page">
    <header class="detail-topbar">
      <button type="button" aria-label="뒤로 가기" @click="router.back()">
        <q-icon name="chevron_left" size="28px" />
      </button>
      <h1>{{ document.title }}</h1>
      <span aria-hidden="true"></span>
    </header>

    <article class="document policy-document">
      <div class="document-meta">
        <span>최초 시행일: {{ document.effectiveDate }}</span>
        <span>최종 개정일: {{ document.revisedDate }}</span>
      </div>

      <section v-for="section in document.sections" :key="section.title" class="document-section">
        <h2>{{ section.title }}</h2>
        <p v-for="paragraph in section.paragraphs" :key="paragraph">{{ paragraph }}</p>
      </section>
    </article>
  </q-page>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const documents = {
  terms: {
    title: '이용약관',
    effectiveDate: '2026.07.23',
    revisedDate: '2026.07.23',
    sections: [
      { title: '제1조 목적', paragraphs: ['본 약관은 Pokerly가 제공하는 포커 기록 및 복기 서비스의 이용 조건과 사용자 및 서비스의 권리와 의무를 정하는 것을 목적으로 합니다.'] },
      { title: '제2조 서비스 이용', paragraphs: ['사용자는 관련 법령과 본 약관을 준수하여 서비스를 이용해야 합니다.', 'Pokerly는 게임 참여나 금전 거래를 중개하지 않으며 기록과 분석 기능만 제공합니다.'] },
      { title: '제3조 계정 관리', paragraphs: ['사용자는 자신의 계정 정보를 안전하게 관리해야 하며 타인에게 계정을 양도하거나 공유해서는 안 됩니다.'] },
      { title: '제4조 서비스 변경', paragraphs: ['서비스 품질 개선을 위해 기능의 일부가 변경되거나 중단될 수 있으며 중요한 변경은 서비스 내에서 안내합니다.'] },
      { title: '제5조 책임 제한', paragraphs: ['서비스가 제공하는 통계와 계산 결과는 참고 정보이며 사용자의 의사결정과 그 결과에 대한 책임은 사용자에게 있습니다.'] },
    ],
  },
  privacy: {
    title: '개인정보처리방침',
    effectiveDate: '2026.07.23',
    revisedDate: '2026.07.23',
    sections: [
      { title: '제1조 처리하는 개인정보', paragraphs: ['Pokerly는 계정 생성과 서비스 제공을 위해 이메일, 닉네임 및 소셜 로그인 식별 정보를 처리할 수 있습니다.'] },
      { title: '제2조 이용 목적', paragraphs: ['개인정보는 사용자 식별, 계정 관리, 기록 동기화, 문의 대응 및 서비스 개선을 위해 사용됩니다.'] },
      { title: '제3조 보유 기간', paragraphs: ['개인정보는 회원 탈퇴 또는 처리 목적 달성 시까지 보유하며 관련 법령에 따라 보존이 필요한 경우 해당 기간 동안 보관합니다.'] },
      { title: '제4조 제3자 제공', paragraphs: ['Pokerly는 사용자의 동의나 법적 근거 없이 개인정보를 제3자에게 제공하지 않습니다.'] },
      { title: '제5조 사용자 권리', paragraphs: ['사용자는 자신의 개인정보에 대한 열람, 정정, 삭제 및 처리 정지를 요청할 수 있습니다.'] },
      { title: '제6조 문의', paragraphs: ['개인정보 관련 요청은 앱의 문의하기를 통해 접수할 수 있습니다.'] },
    ],
  },
}
const document = computed(() => documents[route.params.documentType] || documents.terms)
</script>

<style scoped>
.policy-document-page {
  display: flex;
  min-height: 100%;
  flex-direction: column;
  align-items: stretch;
  justify-content: flex-start;
  gap: 12px;
  padding: var(--v2-page-padding-top) var(--v2-page-padding-x) 100px;
}

.policy-document-page > * { flex: 0 0 auto; }
.policy-document-page > .detail-topbar {
  display: grid;
  height: var(--v2-detail-topbar-height);
  min-height: var(--v2-detail-topbar-height);
  max-height: var(--v2-detail-topbar-height);
  grid-template-columns: 40px minmax(0, 1fr) 40px;
  align-items: center;
  background: var(--v2-page-bg);
}

.detail-topbar button { display: grid; width: 36px; height: 36px; place-items: center; padding: 0; border: 0; background: transparent; color: var(--v2-text-main); }
.detail-topbar h1 { margin: 0; font-size: 18px; font-weight: 620; line-height: 1.2; text-align: center; }
.document { padding: 18px; border: 1px solid var(--v2-border); border-radius: var(--v2-radius-lg); background: #fff; }
.policy-document { padding: 0; overflow: hidden; }
.document-meta { display: grid; gap: 3px; padding: 18px; border-bottom: 1px solid var(--v2-border); background: #faf9fd; color: var(--v2-text-sub); font-size: 10px; font-weight: 430; line-height: 1.45; }
.document-section { padding: 18px 16px; border-bottom: 1px solid var(--v2-border); }
.document-section:last-child { border-bottom: 0; }
.document-section h2 { margin: 0 0 9px; color: var(--v2-text-main); font-size: 15px; font-weight: 620; }
.document-section p { margin: 0; color: #4f4a5e; font-size: 13px; line-height: 1.7; }
.document-section p + p { margin-top: 8px; }
</style>
