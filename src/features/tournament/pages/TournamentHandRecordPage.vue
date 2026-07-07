<template>
  <q-page class="hand-record-page">
    <header class="record-topbar">
      <button type="button" aria-label="닫기" @click="router.back()">
        <q-icon name="close" size="24px" />
      </button>
      <h1>핸드 기록</h1>
      <span aria-hidden="true"></span>
    </header>

    <p class="level-caption">{{ levelName }} · {{ levelInfo.blinds }}</p>

    <form class="record-form" @submit.prevent="saveHand">
      <section class="record-block">
        <h2>1. 핸드 <span>(Hero 핸드)</span></h2>
        <div class="hero-cards">
          <button class="card-placeholder" type="button">
            <q-icon name="style" size="20px" />
            카드 선택
          </button>
          <button
            v-for="card in selectedCards"
            :key="card.rank + card.suit"
            class="playing-card"
            :class="{ red: card.red }"
            type="button"
          >
            <b>{{ card.rank }}</b>
            <em>{{ card.suit }}</em>
          </button>
        </div>
      </section>

      <section class="record-block">
        <h2>2. 포지션</h2>
        <div class="chip-grid chip-grid--positions">
          <button
            v-for="position in positions"
            :key="position"
            type="button"
            :class="{ selected: form.position === position }"
            @click="form.position = position"
          >
            {{ position }}
          </button>
        </div>
      </section>

      <section class="record-block">
        <h2>3. 액션 흐름 <span>(프리플랍)</span></h2>
        <div class="action-flow">
          <button
            v-for="(action, index) in form.actions"
            :key="action.actor"
            type="button"
            :class="{ selected: index === 0 }"
          >
            <strong>{{ index + 1 }}. {{ action.actor }}</strong>
            <span>{{ action.detail }}</span>
          </button>
          <button class="action-flow__add" type="button">
            <q-icon name="add" size="18px" />
          </button>
        </div>
      </section>

      <section class="record-block">
        <h2>4. 결과 <span>(자동 계산)</span></h2>
        <button class="result-card" type="button">
          <span>
            <q-icon name="check_circle" size="18px" />
            <strong>쇼다운 승</strong>
          </span>
          <small>상대 KQ</small>
          <q-icon name="chevron_right" size="22px" />
        </button>
      </section>

      <section class="record-block record-block--inline">
        <h2>5. 북키</h2>
        <label class="toggle-row">
          <q-icon name="bookmark_border" size="20px" />
          <span>북키</span>
          <input v-model="form.bookmarked" type="checkbox" />
        </label>
      </section>

      <section class="record-block">
        <h2>6. 메모 <span>(선택)</span></h2>
        <textarea v-model="form.memo" maxlength="100" placeholder="왜 이 핸드를 북키했는지 간단히 적어보세요. (선택)" />
        <p>{{ form.memo.length }} / 100</p>
      </section>

      <section class="preview-card">
        <div class="preview-card__header">
          <h2>미리보기</h2>
          <button type="button">초기화</button>
        </div>
        <dl>
          <div>
            <dt>Hero 핸드</dt>
            <dd class="preview-cards">
              <span v-for="card in selectedCards" :key="card.rank + card.suit" :class="{ red: card.red }">
                <b>{{ card.rank }}</b>
                <em>{{ card.suit }}</em>
              </span>
            </dd>
          </div>
          <div>
            <dt>포지션</dt>
            <dd class="preview-text primary">{{ form.position }}</dd>
          </div>
          <div>
            <dt>액션 흐름</dt>
            <dd>
              <ol>
                <li v-for="action in form.actions" :key="action.actor">
                  <b>{{ action.actor }}</b> {{ action.detail }}
                </li>
              </ol>
            </dd>
          </div>
          <div>
            <dt>결과</dt>
            <dd class="preview-text success">쇼다운 승</dd>
          </div>
          <div>
            <dt>북키</dt>
            <dd class="preview-text primary">북키 체크됨</dd>
          </div>
          <div>
            <dt>메모</dt>
            <dd class="preview-text muted">-</dd>
          </div>
        </dl>
      </section>

      <div class="record-actions">
        <AppButton label="취소" variant="secondary" block @click="router.back()" />
        <AppButton label="저장" block @click="saveHand" />
      </div>
    </form>
  </q-page>
</template>

<script setup>
import { computed, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import AppButton from 'src/shared/components/AppButton.vue'

const route = useRoute()
const router = useRouter()

const levelName = computed(() => route.params.levelName || 'L6')
const levelMap = {
  L1: '100 / 200 / 200',
  L2: '200 / 300 / 300',
  L3: '300 / 500 / 500',
  L4: '400 / 800 / 800',
  L5: '600 / 1,200 / 1,200',
  L6: '400 / 800 / 800',
}

const levelInfo = computed(() => ({
  blinds: levelMap[levelName.value] || '400 / 800 / 800',
}))

const selectedCards = [
  { rank: 'A', suit: '♠' },
  { rank: 'K', suit: '♥', red: true },
]

const positions = ['UTG', 'UTG+1', 'MP', 'LJ', 'HJ', 'CO', 'BTN', 'SB', 'BB']

const form = reactive({
  position: 'CO',
  bookmarked: true,
  memo: '',
  actions: [
    { actor: '오픈', detail: 'CO · 2.5bb' },
    { actor: '상대 3Bet', detail: 'BB · 9bb' },
    { actor: 'Hero 콜', detail: 'CO' },
  ],
})

const saveHand = () => {
  router.push(`/app/tournament/running/level/${levelName.value}/hand/1`)
}
</script>

<style scoped>
.hand-record-page {
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  display: grid;
  align-content: start;
  gap: 8px;
  min-height: 100%;
  overflow-x: hidden;
  padding: 24px 20px 112px;
}

.hand-record-page *,
.hand-record-page *::before,
.hand-record-page *::after {
  box-sizing: border-box;
}

.record-topbar {
  display: grid;
  grid-template-columns: 40px minmax(0, 1fr) 40px;
  align-items: center;
  min-height: 36px;
}

.record-topbar button {
  width: 36px;
  height: 36px;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--v2-text-main);
}

.record-topbar h1 {
  margin: 0;
  color: var(--v2-text-main);
  font-size: 17px;
  font-weight: 560;
  text-align: center;
}

.level-caption {
  margin: 0;
  color: #4f4a5e;
  font-size: 13px;
  font-weight: 430;
}

.record-form {
  width: 100%;
  min-width: 0;
  max-width: 100%;
  display: grid;
  gap: 8px;
}

.record-block,
.preview-card {
  width: 100%;
  min-width: 0;
  max-width: 100%;
  overflow: hidden;
  padding: 6px 10px 8px;
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-lg);
  background: #ffffff;
  box-shadow: 0 5px 14px rgba(28, 18, 60, 0.025);
}

.record-block h2,
.preview-card h2 {
  margin: 0 0 5px;
  color: var(--v2-primary);
  font-size: 13px;
  font-weight: 560;
}

.record-block h2 span {
  color: var(--v2-text-sub);
  font-weight: 430;
}

.hero-cards {
  width: 100%;
  min-width: 0;
  max-width: 100%;
  display: flex;
  gap: 8px;
}

.chip-grid::-webkit-scrollbar {
  display: none;
}

.card-placeholder,
.playing-card,
.chip-grid button,
.action-flow button {
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-sm);
  background: #ffffff;
  color: var(--v2-text-main);
  font: inherit;
}

.card-placeholder,
.playing-card {
  flex: 0 0 auto;
  width: 48px;
  height: 56px;
  display: grid;
  place-items: center;
  align-content: center;
  gap: 3px;
}

.card-placeholder {
  color: var(--v2-text-sub);
  font-size: 10px;
}

.playing-card b {
  font-size: 18px;
  font-weight: 560;
  line-height: 1;
}

.playing-card em {
  font-size: 16px;
  font-style: normal;
  line-height: 1;
}

.playing-card.red {
  color: #e11d48;
}

.chip-grid {
  width: 100%;
  min-width: 0;
  max-width: 100%;
  display: flex;
  gap: 7px;
  max-width: 100%;
  overflow-x: auto;
  padding-bottom: 2px;
  overscroll-behavior-x: contain;
  scrollbar-width: none;
}

.chip-grid--positions {
  padding-right: 4px;
}

.chip-grid button {
  flex: 0 0 auto;
  min-width: 42px;
  min-height: 30px;
  padding: 0 9px;
  font-size: 11px;
  font-weight: 430;
  white-space: nowrap;
}

.chip-grid button.selected,
.action-flow button.selected {
  border-color: var(--v2-primary);
  background: var(--v2-primary-soft);
  color: var(--v2-primary);
}

.action-flow {
  width: 100%;
  min-width: 0;
  max-width: 100%;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr)) 34px;
  gap: 8px;
}

.action-flow button {
  min-height: 58px;
  min-width: 0;
  padding: 7px 6px;
  display: grid;
  align-content: center;
  gap: 6px;
  text-align: left;
}

.action-flow strong {
  font-size: 12px;
  font-weight: 520;
}

.action-flow span {
  font-size: 11px;
  font-weight: 430;
}

.action-flow__add {
  place-items: center;
}

.result-card {
  width: 100%;
  min-height: 54px;
  padding: 0 12px;
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-md);
  background: #ffffff;
  color: var(--v2-text-main);
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 8px;
  text-align: left;
}

.result-card span {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--v2-success);
}

.result-card strong {
  color: var(--v2-text-main);
  font-size: 14px;
  font-weight: 520;
}

.result-card small {
  grid-column: 1 / 2;
  margin-left: 26px;
  color: var(--v2-text-sub);
  font-size: 11px;
}

.record-block--inline {
  padding-block: 8px;
}

.toggle-row {
  display: grid;
  grid-template-columns: 24px minmax(0, 1fr) auto;
  align-items: center;
  gap: 8px;
  color: var(--v2-text-main);
  font-size: 14px;
  font-weight: 430;
}

.toggle-row input {
  width: 38px;
  height: 22px;
  accent-color: var(--v2-primary);
}

textarea {
  width: 100%;
  min-height: 68px;
  padding: 8px 10px;
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-md);
  outline: 0;
  resize: none;
  color: var(--v2-text-main);
  font: inherit;
  font-size: 13px;
}

textarea::placeholder {
  color: #aaa5b8;
}

.record-block > p {
  margin: 5px 0 0;
  color: var(--v2-text-sub);
  font-size: 11px;
  text-align: right;
}

.preview-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.preview-card__header button {
  min-height: 30px;
  padding: 0 10px;
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-sm);
  background: #ffffff;
  color: var(--v2-text-sub);
  font: inherit;
  font-size: 12px;
}

.preview-card dl,
.preview-card dd {
  margin: 0;
}

.preview-card dl {
  display: grid;
  gap: 8px;
}

.preview-card dt {
  margin-bottom: 4px;
  color: var(--v2-text-sub);
  font-size: 12px;
}

.preview-cards {
  display: flex;
  gap: 6px;
}

.preview-cards span {
  width: 38px;
  height: 46px;
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-sm);
  display: grid;
  place-items: center;
  align-content: center;
  gap: 2px;
}

.preview-cards .red {
  color: #e11d48;
}

.preview-text {
  color: var(--v2-text-main);
  font-size: 13px;
}

.preview-text.primary {
  color: var(--v2-primary);
}

.preview-text.success {
  color: var(--v2-success);
}

.preview-text.muted {
  color: var(--v2-text-sub);
}

ol {
  margin: 0;
  padding-left: 18px;
  color: var(--v2-text-main);
  font-size: 12px;
  line-height: 1.7;
}

ol b {
  color: var(--v2-primary);
  font-weight: 560;
}

.record-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

@media (max-width: 420px) {
  .hand-record-page {
    padding-top: 24px;
  }
}
</style>
