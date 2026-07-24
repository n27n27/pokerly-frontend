<template>
  <q-page class="finish-page">
    <header class="finish-topbar">
      <button type="button" aria-label="닫기" @click="router.back()">
        <q-icon name="close" size="28px" />
      </button>
      <h1>{{ isEdit ? '대회 수정' : '대회 종료' }}</h1>
      <span aria-hidden="true"></span>
    </header>

    <section class="tournament-heading">
      <strong>프라임 0704</strong>
      <span>2026.07.23</span>
    </section>

    <section class="result-section">
      <div class="section-title">
        <h2>이번 대회 결과</h2>
        <span>필수</span>
      </div>

      <div class="result-options">
        <button
          v-for="result in results"
          :key="result.value"
          type="button"
          :class="{ selected: form.result === result.value }"
          @click="form.result = result.value"
        >
          <q-icon :name="result.icon" size="25px" />
          <strong>{{ result.label }}</strong>
        </button>
      </div>
    </section>

    <section class="extra-section">
      <div class="section-title">
        <h2>추가 정보</h2>
        <small>선택</small>
      </div>

      <div class="field-list">
        <label class="field-row">
          <span>최종 순위</span>
          <input v-model="form.rank" inputmode="numeric" placeholder="예) 17" />
          <em>위</em>
        </label>

        <label class="field-row">
          <span>상금</span>
          <input v-model="form.prize" inputmode="numeric" placeholder="예) 450,000" />
        </label>

        <label class="field-row">
          <span>총 엔트리</span>
          <input v-model="form.entries" inputmode="numeric" placeholder="예) 289" />
          <em>명</em>
        </label>

        <div class="field-row buy-in-row">
          <span>총 바인</span>
          <div class="stepper">
            <button type="button" aria-label="총 바인 감소" :disabled="form.buyIns <= 1" @click="form.buyIns -= 1">
              <q-icon name="remove" size="19px" />
            </button>
            <strong>{{ form.buyIns }}</strong>
            <button type="button" aria-label="총 바인 증가" @click="form.buyIns += 1">
              <q-icon name="add" size="19px" />
            </button>
          </div>
          <em>회</em>
        </div>

        <label class="field-row">
          <span>할인 금액</span>
          <input v-model="form.discount" inputmode="numeric" placeholder="예) 50,000" />
        </label>

        <label class="field-row memo-row">
          <span>대회 메모</span>
          <textarea v-model="form.memo" maxlength="200" placeholder="선택 입력" />
          <small>{{ form.memo.length }} / 200</small>
        </label>
      </div>
    </section>

    <StickyPrimaryAction :label="isEdit ? '수정 완료' : '결과 확정'" :disabled="!form.result" @click="confirmResult" />
  </q-page>
</template>

<script setup>
import { computed, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import StickyPrimaryAction from 'src/shared/components/StickyPrimaryAction.vue'

const route = useRoute()
const router = useRouter()
const isEdit = computed(() => route.query.mode === 'edit')

const results = [
  { value: 'BUST', label: '탈락', icon: 'cancel' },
  { value: 'BUBBLE', label: 'Bubble', icon: 'circle' },
  { value: 'ITM', label: 'ITM', icon: 'workspace_premium' },
  { value: 'CHOP', label: '찹', icon: 'handshake' },
  { value: 'WIN', label: '우승', icon: 'emoji_events' },
]

const form = reactive({
  result: isEdit.value ? 'ITM' : '',
  rank: isEdit.value ? '17' : '',
  prize: isEdit.value ? '320,000' : '',
  entries: isEdit.value ? '289' : '',
  buyIns: isEdit.value ? 2 : 1,
  discount: '',
  memo: isEdit.value ? '초반 타이트하게 운영 후, L10 이후 적극적으로 플레이.' : '',
})

const confirmResult = () => {
  if (!form.result) return
  const tournamentId = route.query.tournamentId || '1'
  router.replace(`/app/tournament/${tournamentId}/summary`)
}
</script>

<style scoped>
.finish-page {
  display: grid;
  align-content: start;
  gap: 20px;
  min-height: 100%;
  padding: var(--v2-page-padding-top) var(--v2-page-padding-x) 180px;
}

.finish-topbar {
  display: grid;
  grid-template-columns: 40px minmax(0, 1fr) 40px;
  align-items: center;
  min-height: 36px;
}

.finish-topbar button {
  display: grid;
  width: 36px;
  height: 36px;
  place-items: center;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--v2-text-main);
}

.finish-topbar h1 {
  margin: 0;
  color: var(--v2-text-main);
  font-size: 17px;
  font-weight: 560;
  line-height: 1.2;
  text-align: center;
}

.tournament-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 2px 2px 16px;
  border-bottom: 1px solid var(--v2-border);
}

.tournament-heading strong {
  color: var(--v2-text-main);
  font-size: 19px;
  font-weight: 600;
}

.tournament-heading span {
  color: var(--v2-text-sub);
  font-size: 13px;
}

.result-section,
.extra-section {
  display: grid;
  gap: 12px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 7px;
}

.section-title h2 {
  margin: 0;
  color: var(--v2-text-main);
  font-size: 16px;
  font-weight: 600;
}

.section-title > span {
  padding: 4px 7px;
  border-radius: 6px;
  background: var(--v2-primary-soft);
  color: var(--v2-primary);
  font-size: 10px;
  font-weight: 600;
}

.section-title small {
  color: var(--v2-text-sub);
  font-size: 12px;
  font-weight: 430;
}

.result-options {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 8px;
}

.result-options button {
  display: grid;
  min-width: 0;
  min-height: 104px;
  place-items: center;
  align-content: center;
  gap: 10px;
  padding: 9px 3px;
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-lg);
  background: #ffffff;
  color: #8a8498;
  font: inherit;
}

.result-options strong {
  overflow: hidden;
  max-width: 100%;
  font-size: 13px;
  font-weight: 560;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.result-options button.selected {
  border-color: var(--v2-primary);
  background: #fbf9ff;
  box-shadow: 0 5px 14px rgba(109, 69, 232, 0.08);
  color: var(--v2-primary);
}

.field-list {
  overflow: hidden;
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-lg);
  background: #ffffff;
}

.field-row {
  display: grid;
  grid-template-columns: 94px minmax(0, 1fr) 26px;
  align-items: center;
  min-height: 58px;
  padding: 0 14px;
}

.field-row + .field-row {
  border-top: 1px solid var(--v2-border);
}

.field-row > span {
  color: var(--v2-text-main);
  font-size: 13px;
  font-weight: 520;
}

.field-row input,
.field-row textarea {
  width: 100%;
  min-width: 0;
  padding: 0 10px;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--v2-text-main);
  font: inherit;
  font-size: 13px;
}

.field-row input::placeholder,
.field-row textarea::placeholder {
  color: #b5afc3;
}

.field-row em {
  justify-self: end;
  color: var(--v2-text-main);
  font-size: 12px;
  font-style: normal;
  font-weight: 520;
}

.buy-in-row {
  grid-template-columns: 94px minmax(0, 1fr) 26px;
}

.stepper {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 16px;
  padding-right: 10px;
}

.stepper button {
  display: grid;
  width: 38px;
  height: 38px;
  place-items: center;
  padding: 0;
  border: 0;
  border-radius: var(--v2-radius-sm);
  background: #f5f3fa;
  color: var(--v2-text-main);
}

.stepper button:disabled {
  color: #c8c3d2;
}

.stepper strong {
  min-width: 18px;
  color: var(--v2-text-main);
  font-size: 14px;
  font-weight: 560;
  text-align: center;
}

.memo-row {
  position: relative;
  min-height: 78px;
  align-items: start;
  padding-top: 17px;
  padding-bottom: 12px;
}

.memo-row textarea {
  min-height: 48px;
  resize: none;
  line-height: 1.45;
}

.memo-row small {
  position: absolute;
  right: 14px;
  bottom: 9px;
  color: var(--v2-text-sub);
  font-size: 10px;
}

@media (max-width: 360px) {
  .result-options {
    gap: 6px;
  }

  .result-options button {
    min-height: 96px;
  }

  .result-options strong {
    font-size: 11px;
  }
}
</style>
