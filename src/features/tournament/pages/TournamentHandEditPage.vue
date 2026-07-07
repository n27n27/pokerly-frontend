<template>
  <q-page class="hand-edit-page">
    <header class="edit-topbar">
      <button class="icon-button" type="button" aria-label="뒤로 가기" @click="router.back()">
        <q-icon name="chevron_left" size="30px" />
      </button>
      <h1>핸드 수정 (상세 입력)</h1>
      <button class="bookmark-button" type="button">
        <q-icon name="bookmark_border" size="18px" />
        <span>북키</span>
      </button>
    </header>

    <section class="hero-summary">
      <span class="level-pill">{{ levelName }}</span>
      <div class="summary-body">
        <div class="playing-cards">
          <span v-for="card in heroCards" :key="card.rank + card.suit" :class="{ red: card.red }">
            <b>{{ card.rank }}</b>
            <em>{{ card.suit }}</em>
          </span>
        </div>

        <div class="summary-copy">
          <strong>AKs · CO</strong>
          <p>오픈 → BB 3Bet → Hero 콜</p>
          <span>
            <q-icon name="check_circle" size="16px" />
            쇼다운 승리
          </span>
        </div>
      </div>
    </section>

    <section class="edit-section">
      <h2>기본 정보</h2>
      <div class="basic-grid">
        <label v-for="item in basicInfo" :key="item.label" class="field-card">
          <span>{{ item.label }}</span>
          <input :value="item.value" readonly />
        </label>
        <label class="field-card field-card--wide">
          <span>액션 흐름</span>
          <input value="오픈 → BB 3Bet → Hero 콜" readonly />
        </label>
        <label class="field-card field-card--wide">
          <span>메모</span>
          <textarea v-model="form.memo" rows="3" />
        </label>
      </div>
    </section>

    <section class="edit-panel">
      <div class="panel-header">
        <h2>보드</h2>
        <button type="button">
          <q-icon name="refresh" size="15px" />
          보드 초기화
        </button>
      </div>

      <div class="street-grid">
        <div v-for="street in boardStreets" :key="street.label" class="street-group">
          <span>{{ street.label }}</span>
          <div class="card-row">
            <button
              v-for="card in street.cards"
              :key="street.label + card.rank + card.suit"
              class="mini-card"
              :class="{ red: card.red }"
              type="button"
            >
              <b>{{ card.rank }}</b>
              <em>{{ card.suit }}</em>
            </button>
          </div>
        </div>
      </div>
    </section>

    <section class="edit-panel">
      <div class="panel-header">
        <h2>상대 핸드 <span>(쇼다운 시 입력)</span></h2>
        <button type="button">
          <q-icon name="refresh" size="15px" />
          상대 초기화
        </button>
      </div>

      <div class="villain-grid">
        <div v-for="villain in villains" :key="villain.name" class="villain-group">
          <span>{{ villain.name }}</span>
          <div class="card-row">
            <button
              v-for="card in villain.cards"
              :key="villain.name + card.rank + card.suit"
              class="mini-card"
              :class="{ red: card.red, empty: card.empty }"
              type="button"
            >
              <template v-if="card.empty">+</template>
              <template v-else>
                <b>{{ card.rank }}</b>
                <em>{{ card.suit }}</em>
              </template>
            </button>
          </div>
        </div>
      </div>
      <p class="panel-caption">* 멀티웨이의 경우 여러 상대 핸드를 입력할 수 있습니다.</p>
    </section>

    <section class="edit-panel">
      <div class="panel-header">
        <h2>팟 사이즈 <span>(bb)</span></h2>
        <button type="button">
          <q-icon name="refresh" size="15px" />
          팟 초기화
        </button>
      </div>

      <div class="pot-grid">
        <label v-for="pot in form.pots" :key="pot.street">
          <span>{{ pot.street }}</span>
          <input v-model="pot.value" inputmode="decimal" />
          <small>총 {{ pot.total }}bb</small>
        </label>
      </div>
    </section>

    <section class="edit-panel">
      <h2>스택 정보 <span>(해당 핸드 시점)</span></h2>
      <div class="stack-grid">
        <div class="stack-box">
          <div>
            <span>Hero (나)</span>
            <strong>92.5 bb</strong>
          </div>
        </div>
        <div class="stack-box">
          <div>
            <span>상대</span>
            <strong>111.0 bb</strong>
          </div>
          <p>BB (상대 1) <b>111.0 bb</b></p>
          <button type="button">
            <q-icon name="add" size="17px" />
            상대 추가
          </button>
        </div>
      </div>
    </section>

    <section class="edit-panel">
      <h2>상세 메모 <span>(선택)</span></h2>
      <textarea v-model="form.detailMemo" maxlength="300" placeholder="이 핸드에 대한 추가 메모를 입력하세요." />
      <p class="text-count">{{ form.detailMemo.length }} / 300</p>
    </section>

    <div class="edit-actions">
      <AppButton label="취소" variant="secondary" block @click="router.back()" />
      <AppButton label="수정 완료" block @click="completeEdit" />
    </div>
  </q-page>
</template>

<script setup>
import { computed, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import AppButton from 'src/shared/components/AppButton.vue'

const route = useRoute()
const router = useRouter()

const levelName = computed(() => route.params.levelName || 'L8')
const handId = computed(() => route.params.handId || '1')

const heroCards = [
  { rank: 'A', suit: '♠' },
  { rank: 'K', suit: '♥', red: true },
]

const basicInfo = [
  { label: '핸드', value: 'AKs' },
  { label: '포지션', value: 'CO' },
  { label: '결과', value: '쇼다운 승리' },
  { label: '북키', value: '북키' },
]

const boardStreets = [
  {
    label: 'Flop',
    cards: [
      { rank: 'A', suit: '♠' },
      { rank: '8', suit: '♦', red: true },
      { rank: '3', suit: '♣' },
    ],
  },
  { label: 'Turn', cards: [{ rank: 'T', suit: '♠' }] },
  { label: 'River', cards: [{ rank: '2', suit: '♣' }] },
]

const villains = [
  {
    name: '상대 1 (BB)',
    cards: [
      { rank: 'Q', suit: '♠' },
      { rank: 'J', suit: '♣' },
    ],
  },
  {
    name: '상대 2 (선택)',
    cards: [{ empty: true }, { empty: true }],
  },
  {
    name: '상대 3 (선택)',
    cards: [{ empty: true }, { empty: true }],
  },
]

const form = reactive({
  memo: 'BB가 평소보다 루즈하게 3Bet.\n플랍에서 백도어 플러쉬 노리고 콜.',
  detailMemo: '',
  pots: [
    { street: 'Preflop', value: '3.2', total: '16.0' },
    { street: 'Flop', value: '10.4', total: '26.4' },
    { street: 'Turn', value: '20.8', total: '47.2' },
    { street: 'River', value: '20.8', total: '68.0' },
  ],
})

const completeEdit = () => {
  router.push(`/app/tournament/running/level/${levelName.value}/hand/${handId.value}`)
}
</script>

<style scoped>
.hand-edit-page {
  display: grid;
  align-content: start;
  gap: 12px;
  min-height: 100%;
  padding: 18px 18px 112px;
}

.edit-topbar {
  display: grid;
  grid-template-columns: 40px minmax(0, 1fr) auto;
  align-items: center;
  min-height: 40px;
  gap: 8px;
}

.icon-button,
.bookmark-button,
.panel-header button,
.stack-box button {
  border: 0;
  background: transparent;
  color: var(--v2-text-main);
  font: inherit;
}

.icon-button {
  width: 38px;
  height: 38px;
  padding: 0;
}

.edit-topbar h1 {
  margin: 0;
  color: var(--v2-text-main);
  font-size: 17px;
  font-weight: 520;
  text-align: left;
}

.bookmark-button {
  min-height: 36px;
  padding: 0 12px;
  border-radius: var(--v2-radius-sm);
  background: var(--v2-primary-soft);
  color: var(--v2-primary);
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
  font-weight: 520;
}

.hero-summary,
.edit-panel,
.field-card {
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-lg);
  background: #ffffff;
  box-shadow: 0 5px 14px rgba(28, 18, 60, 0.022);
}

.hero-summary {
  padding: 11px 12px;
}

.level-pill {
  display: inline-flex;
  min-height: 23px;
  align-items: center;
  padding: 0 8px;
  border-radius: var(--v2-radius-sm);
  background: var(--v2-primary-soft);
  color: var(--v2-primary);
  font-size: 12px;
  font-weight: 560;
}

.summary-body {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  gap: 14px;
  margin-top: 9px;
}

.playing-cards,
.card-row {
  display: flex;
  gap: 8px;
}

.playing-cards span,
.mini-card {
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-sm);
  background: #ffffff;
  color: var(--v2-text-main);
  display: grid;
  place-items: center;
  align-content: center;
}

.playing-cards span {
  width: 52px;
  height: 72px;
  gap: 4px;
}

.playing-cards .red,
.mini-card.red {
  color: #e11d48;
}

.playing-cards b {
  font-size: 24px;
  font-weight: 560;
  line-height: 1;
}

.playing-cards em,
.mini-card em {
  font-style: normal;
  line-height: 1;
}

.summary-copy strong {
  color: var(--v2-text-main);
  font-size: 19px;
  font-weight: 560;
}

.summary-copy p {
  overflow: hidden;
  margin: 8px 0;
  color: #5b5668;
  font-size: 13px;
  font-weight: 430;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.summary-copy span {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: var(--v2-success);
  font-size: 13px;
  font-weight: 520;
}

.edit-section,
.edit-panel {
  display: grid;
  gap: 10px;
}

.edit-section h2,
.edit-panel h2 {
  margin: 0;
  color: var(--v2-text-main);
  font-size: 15px;
  font-weight: 520;
}

.edit-panel h2 span,
.panel-caption {
  color: var(--v2-text-sub);
  font-weight: 430;
}

.basic-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.field-card {
  min-width: 0;
  padding: 11px 12px;
  display: grid;
  gap: 8px;
}

.field-card--wide {
  grid-column: 1 / -1;
}

.field-card span,
.street-group > span,
.villain-group > span,
.pot-grid label > span,
.stack-box span {
  color: #5f596b;
  font-size: 12px;
  font-weight: 520;
}

input,
textarea {
  width: 100%;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--v2-text-main);
  font: inherit;
  font-size: 13px;
  font-weight: 430;
}

textarea {
  min-height: 52px;
  resize: none;
  line-height: 1.55;
}

.edit-panel {
  padding: 12px;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.panel-header button {
  min-height: 32px;
  padding: 0 10px;
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-sm);
  color: #5d586b;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
}

.street-grid,
.villain-grid,
.pot-grid,
.stack-grid {
  display: grid;
  gap: 12px;
}

.street-grid {
  grid-template-columns: 1.4fr 1fr 1fr;
}

.street-group,
.villain-group,
.pot-grid label {
  display: grid;
  align-content: start;
  gap: 8px;
  min-width: 0;
}

.mini-card {
  width: 40px;
  height: 54px;
  padding: 0;
  border-style: solid;
  font: inherit;
}

.mini-card.empty {
  border-style: dashed;
  color: var(--v2-text-sub);
  font-size: 20px;
}

.mini-card b {
  font-size: 16px;
  font-weight: 560;
  line-height: 1;
}

.mini-card em {
  font-size: 13px;
}

.villain-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.panel-caption {
  margin: -2px 0 0;
  font-size: 11px;
  line-height: 1.4;
}

.pot-grid {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.pot-grid input {
  height: 36px;
  padding: 0 10px;
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-sm);
}

.pot-grid small {
  color: var(--v2-text-sub);
  font-size: 11px;
}

.stack-grid {
  grid-template-columns: 1fr 1fr;
}

.stack-box {
  overflow: hidden;
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-md);
}

.stack-box > div,
.stack-box p,
.stack-box button {
  min-height: 42px;
  padding: 0 12px;
  border-bottom: 1px solid var(--v2-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.stack-box p {
  margin: 0;
  color: #6b6577;
  font-size: 12px;
}

.stack-box strong,
.stack-box b {
  color: var(--v2-primary);
  font-size: 13px;
  font-weight: 560;
}

.stack-box button {
  width: 100%;
  border-bottom: 0;
  color: var(--v2-primary);
  justify-content: flex-start;
  font-size: 13px;
  font-weight: 520;
}

.edit-panel > textarea {
  min-height: 78px;
  padding: 11px 12px;
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-sm);
}

.text-count {
  margin: -4px 0 0;
  color: var(--v2-text-sub);
  font-size: 11px;
  text-align: right;
}

.edit-actions {
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  gap: 10px;
}

@media (max-width: 420px) {
  .hand-edit-page {
    padding-inline: 16px;
  }

  .street-grid,
  .villain-grid {
    overflow-x: auto;
    grid-auto-flow: column;
    grid-auto-columns: minmax(128px, 1fr);
    grid-template-columns: none;
    padding-bottom: 2px;
    scrollbar-width: none;
  }

  .street-grid::-webkit-scrollbar,
  .villain-grid::-webkit-scrollbar {
    display: none;
  }

  .pot-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .stack-grid {
    grid-template-columns: 1fr;
  }
}
</style>
