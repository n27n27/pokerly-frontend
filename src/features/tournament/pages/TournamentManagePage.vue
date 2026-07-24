<template>
  <q-page class="manage-page">
    <header class="manage-topbar">
      <button type="button" aria-label="뒤로 가기" @click="router.back()">
        <q-icon name="chevron_left" size="28px" />
      </button>
      <h1>대회 관리</h1>
      <span aria-hidden="true"></span>
    </header>

    <section class="tournament-card">
      <div class="tournament-card__head">
        <div class="tournament-card__title-row">
          <strong>프라임 0704</strong>
          <button type="button">
            <q-icon name="edit" size="15px" />
            수정
          </button>
        </div>
        <dl>
          <div>
            <dt>바인 금액</dt>
            <dd>100,000</dd>
          </div>
          <div>
            <dt>엔트리 총 개수</dt>
            <dd>3개</dd>
          </div>
          <div>
            <dt>할인 금액</dt>
            <dd>0</dd>
          </div>
        </dl>
      </div>
      <button class="memo-row" type="button">
        <span>대회 메모</span>
        <strong>프라임 데일리, 리바인 2회까지 가능</strong>
      </button>
    </section>

    <section class="seat-section">
      <div class="section-header">
        <h2>Seat별 플레이어</h2>
        <button type="button">
          <q-icon name="refresh" size="15px" />
          전체 초기화
        </button>
      </div>

      <div class="seat-list">
        <details
          v-for="seat in seats"
          :key="seat.number"
          class="seat-row"
          :class="{ mine: seat.mine, empty: seat.empty }"
        >
          <summary>
            <span class="seat-badge">S{{ seat.number }}</span>
            <span class="seat-copy">
              <strong>{{ seat.nickname }}</strong>
              <span v-if="seat.tags.length" class="seat-tags">
                <span
                  v-for="tag in seat.tags"
                  :key="tag.label"
                  class="seat-tag"
                  :class="tag.tone"
                >
                  {{ tag.label }}
                </span>
              </span>
            </span>
            <q-icon class="seat-expand" name="expand_more" size="20px" />
          </summary>
          <div v-if="seat.empty" class="seat-memo seat-memo--empty">
            <input type="text" placeholder="닉네임 입력" />
            <button type="button">추가</button>
          </div>
          <div v-else class="seat-memo">
            <p :class="{ empty: !seat.memo }">{{ seat.memo || '아직 작성된 메모가 없습니다.' }}</p>
            <button type="button">
              <q-icon name="edit" size="14px" />
              {{ seat.memo ? '수정하기' : '작성하기' }}
            </button>
          </div>
        </details>
      </div>
    </section>
  </q-page>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const seats = [
  {
    number: 1,
    nickname: 'anonymous',
    tags: [{ label: '공격적', tone: 'danger' }],
    memo: '루즈하고 공격적. 프리플랍 레이즈/3벳 많음',
  },
  {
    number: 2,
    nickname: 'anonymous',
    tags: [{ label: '타이트', tone: 'primary' }],
    memo: '좋은 핸드에서만 액션하는 편',
  },
  {
    number: 3,
    nickname: '플레이어 추가',
    tags: [],
    memo: '클릭해서 이름을 입력하거나 기존 플레이어 리스트에서 선택하세요.',
    empty: true,
  },
  {
    number: 4,
    nickname: 'anonymous',
    tags: [{ label: '패시브', tone: 'warning' }],
    memo: '콜이 많고 폴드가 적음. 블러프 잘 안 통함',
  },
  {
    number: 5,
    nickname: 'anonymous',
    tags: [{ label: 'LAG', tone: 'success' }],
    memo: '',
  },
  {
    number: 6,
    nickname: 'Hero',
    tags: [{ label: '나', tone: 'mine' }],
    memo: '',
    mine: true,
  },
  {
    number: 7,
    nickname: '플레이어 추가',
    tags: [],
    memo: '클릭해서 이름을 입력하거나 기존 플레이어 리스트에서 선택하세요.',
    empty: true,
  },
  {
    number: 8,
    nickname: 'anonymous',
    tags: [{ label: '타이트', tone: 'primary' }],
    memo: '버블/ITM에서 타이트해짐',
  },
  {
    number: 9,
    nickname: 'anonymous',
    tags: [{ label: '공격적', tone: 'danger' }],
    memo: '오픈/스틸 많음. 리버 블러프 성향',
  },
  {
    number: 10,
    nickname: '플레이어 추가',
    tags: [],
    memo: '클릭해서 이름을 입력하거나 기존 플레이어 리스트에서 선택하세요.',
    empty: true,
  },
]
</script>

<style scoped>
.manage-page {
  display: grid;
  align-content: start;
  gap: 14px;
  min-height: 100%;
  padding: var(--v2-page-padding-top) var(--v2-page-padding-x) 112px;
}

.manage-topbar {
  display: grid;
  grid-template-columns: 40px minmax(0, 1fr) 40px;
  align-items: center;
  min-height: 36px;
}

.manage-topbar button {
  min-height: 36px;
  border: 0;
  background: transparent;
  color: var(--v2-text-main);
  font: inherit;
}

.manage-topbar > button:first-child {
  width: 36px;
  padding: 0;
}

.manage-topbar h1 {
  margin: 0;
  color: var(--v2-text-main);
  font-size: 17px;
  font-weight: 560;
  line-height: 1.2;
  text-align: center;
}

.tournament-card,
.seat-row {
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-lg);
  background: #ffffff;
  box-shadow: 0 5px 14px rgba(28, 18, 60, 0.022);
}

.tournament-card {
  overflow: hidden;
}

.tournament-card__head {
  padding: 16px;
  display: grid;
  gap: 14px;
}

.tournament-card__title-row {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 14px;
}

.tournament-card strong {
  color: var(--v2-text-main);
  font-size: 18px;
  font-weight: 560;
}

.tournament-card dl {
  display: grid;
  gap: 10px;
  margin: 0;
  max-width: none;
}

.tournament-card dl div {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 118px;
  align-items: baseline;
  gap: 16px;
}

.tournament-card dt,
.tournament-card dd {
  margin: 0;
  color: #5f596b;
  font-size: 12px;
}

.tournament-card dd {
  color: var(--v2-text-main);
  font-weight: 560;
  text-align: right;
}

.tournament-card__title-row > button,
.section-header button {
  min-height: 30px;
  padding: 0 10px;
  border: 1px solid rgba(109, 69, 232, 0.32);
  border-radius: var(--v2-radius-sm);
  background: #ffffff;
  color: var(--v2-primary);
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font: inherit;
  font-size: 12px;
  font-weight: 520;
}

.memo-row {
  width: 100%;
  min-height: 44px;
  padding: 0 16px;
  border: 0;
  border-top: 1px solid var(--v2-border);
  background: #ffffff;
  color: #5f596b;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  gap: 10px;
  font: inherit;
  font-size: 12px;
  text-align: left;
}

.memo-row strong {
  color: var(--v2-text-sub);
  font-size: 12px;
  font-weight: 430;
  overflow: hidden;
  text-align: right;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.seat-section {
  display: grid;
  gap: 10px;
}

.section-header h2 {
  margin: 0;
  color: var(--v2-text-main);
  font-size: 15px;
  font-weight: 520;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.seat-list {
  display: grid;
  gap: 7px;
}

.seat-row {
  overflow: hidden;
  min-height: 0;
  padding: 0;
  color: var(--v2-text-main);
}

.seat-row.mine {
  border-color: rgba(109, 69, 232, 0.72);
  background: rgba(241, 236, 255, 0.45);
}

.seat-row.empty {
  background: rgba(255, 255, 255, 0.72);
}

.seat-row.empty .seat-copy strong {
  color: var(--v2-text-sub);
  font-weight: 520;
}

.seat-row summary {
  min-height: 50px;
  padding: 8px 12px;
  display: grid;
  grid-template-columns: 36px minmax(0, 1fr) 24px;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  list-style: none;
}

.seat-row summary::-webkit-details-marker {
  display: none;
}

.seat-row summary:focus {
  outline: none;
}

.seat-row summary:focus-visible {
  outline: 1px solid rgba(109, 69, 232, 0.28);
  outline-offset: -1px;
}

.seat-badge {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: var(--v2-primary-soft);
  color: var(--v2-primary);
  display: grid;
  place-items: center;
  font-size: 12px;
  font-weight: 560;
}

.seat-copy {
  min-width: 0;
  display: grid;
  gap: 5px;
}

.seat-copy strong {
  color: var(--v2-text-main);
  font-size: 13px;
  font-weight: 560;
  line-height: 1.1;
}

.seat-tags {
  min-width: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.seat-tag {
  padding: 3px 7px;
  border-radius: var(--v2-radius-sm);
  background: #f4f3f8;
  color: #5f596b;
  font-size: 11px;
  font-weight: 520;
  white-space: nowrap;
}

.seat-tag.primary {
  background: var(--v2-primary-soft);
  color: var(--v2-primary);
}

.seat-tag.danger {
  background: rgba(239, 68, 68, 0.1);
  color: var(--v2-danger);
}

.seat-tag.warning {
  background: #fff6ed;
  color: #c35a11;
}

.seat-tag.success {
  background: rgba(22, 163, 74, 0.12);
  color: var(--v2-success);
}

.seat-tag.empty {
  background: #f4f3f8;
  color: var(--v2-text-sub);
}

.seat-tag.mine {
  background: var(--v2-primary);
  color: #ffffff;
}

.seat-expand {
  color: var(--v2-text-sub);
  justify-self: end;
  transition: transform 0.18s ease;
}

.seat-row[open] .seat-expand {
  transform: rotate(180deg);
}

.seat-memo {
  margin: 0 10px 10px;
  padding: 8px 10px;
  border-radius: var(--v2-radius-sm);
  background: #f8f7fb;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 8px;
}

.seat-memo button {
  min-height: 28px;
  padding: 0 8px;
  border: 1px solid rgba(109, 69, 232, 0.22);
  border-radius: var(--v2-radius-sm);
  background: #ffffff;
  color: var(--v2-primary);
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font: inherit;
  font-size: 11px;
  font-weight: 520;
}

.seat-memo p {
  min-width: 0;
  margin: 0;
  color: #5f596b;
  font-size: 12px;
  line-height: 1.45;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.seat-memo p.empty {
  color: var(--v2-text-sub);
}

.seat-memo--empty {
  grid-template-columns: minmax(0, 1fr) auto;
}

.seat-memo--empty input {
  box-sizing: border-box;
  width: 100%;
  min-height: 34px;
  padding: 0 11px;
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-sm);
  background: #ffffff;
  color: var(--v2-text-main);
  font: inherit;
  font-size: 12px;
}

.seat-memo--empty input::placeholder {
  color: var(--v2-text-sub);
}

.seat-memo--empty button {
  min-width: 52px;
  justify-content: center;
}

@media (max-width: 420px) {
  .seat-row summary {
    grid-template-columns: 34px minmax(0, 1fr) 22px;
    min-height: 48px;
    gap: 7px;
  }
}
</style>
