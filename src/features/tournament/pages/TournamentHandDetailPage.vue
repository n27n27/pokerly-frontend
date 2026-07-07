<template>
  <q-page class="hand-detail-page">
    <header class="hand-detail-topbar">
      <button class="icon-button" type="button" aria-label="뒤로 가기" @click="router.back()">
        <q-icon name="chevron_left" size="30px" />
      </button>
      <h1>핸드 상세</h1>
      <button class="icon-button" type="button" aria-label="더보기">
        <q-icon name="more_vert" size="22px" />
      </button>
    </header>

    <section class="hero-summary">
      <span class="level-pill">{{ levelName }}</span>
      <div class="summary-body">
        <div class="detail-cards">
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

    <section class="detail-section">
      <div class="section-title-row">
        <h2>메모</h2>
        <button class="edit-link" type="button" aria-label="메모 수정">
          <q-icon name="edit" size="18px" />
        </button>
      </div>
      <div class="memo-card">
        <p>BB가 평소보다 루즈하게 3Bet.</p>
        <p>플랍에서 백도어 플러쉬 노리고 콜.</p>
      </div>
      <div class="tag-row">
        <span>북키 필요</span>
        <span>중요 핸드</span>
      </div>
    </section>

    <section class="detail-info">
      <button class="detail-info__header" type="button" @click="isExpanded = !isExpanded">
        <span>상세 정보</span>
        <q-icon :name="isExpanded ? 'expand_less' : 'expand_more'" size="22px" />
      </button>

      <div v-if="isExpanded" class="detail-info__content">
        <dl class="info-list">
          <div v-for="row in preflopRows" :key="row.actor">
            <dt>{{ row.actor }}</dt>
            <dd class="primary">{{ row.position }}</dd>
            <dd>{{ row.action }}</dd>
            <dd>{{ row.size }}</dd>
          </div>
        </dl>

        <dl class="board-list">
          <div>
            <dt>보드</dt>
            <dd>
              <span>Flop</span>
              <div class="mini-cards">
                <i v-for="card in board.flop" :key="card.rank + card.suit" :class="{ red: card.red }">
                  <b>{{ card.rank }}</b>
                  <em>{{ card.suit }}</em>
                </i>
              </div>
            </dd>
            <dd>
              <span>Turn</span>
              <div class="mini-cards">
                <i :class="{ red: board.turn.red }">
                  <b>{{ board.turn.rank }}</b>
                  <em>{{ board.turn.suit }}</em>
                </i>
              </div>
            </dd>
            <dd>
              <span>River</span>
              <div class="mini-cards">
                <i :class="{ red: board.river.red }">
                  <b>{{ board.river.rank }}</b>
                  <em>{{ board.river.suit }}</em>
                </i>
              </div>
            </dd>
          </div>

          <div>
            <dt>상대 핸드</dt>
            <dd>
              <span>BB</span>
              <div class="mini-cards">
                <i v-for="card in villainCards" :key="card.rank + card.suit" :class="{ red: card.red }">
                  <b>{{ card.rank }}</b>
                  <em>{{ card.suit }}</em>
                </i>
              </div>
            </dd>
          </div>
        </dl>

        <dl class="pot-list">
          <div>
            <dt>팟 사이즈</dt>
            <dd v-for="pot in pots" :key="pot.street">
              <span>{{ pot.street }}</span>
              <strong>{{ pot.amount }}</strong>
            </dd>
          </div>
        </dl>

        <p class="info-caption">* 사용자가 입력한 정보만 표시됩니다.</p>
      </div>
    </section>

    <div class="detail-actions">
      <AppButton label="수정하기" variant="secondary" block @click="goEdit" />
      <AppButton label="삭제하기" variant="danger" block />
    </div>
  </q-page>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import AppButton from 'src/shared/components/AppButton.vue'

const route = useRoute()
const router = useRouter()

const isExpanded = ref(true)
const levelName = computed(() => route.params.levelName || 'L8')
const handId = computed(() => route.params.handId || '1')

const heroCards = [
  { rank: 'A', suit: '♠' },
  { rank: 'K', suit: '♥', red: true },
]

const villainCards = [
  { rank: 'Q', suit: '♠' },
  { rank: 'J', suit: '♣' },
]

const board = {
  flop: [
    { rank: 'A', suit: '♣' },
    { rank: '8', suit: '♦', red: true },
    { rank: '3', suit: '♠' },
  ],
  turn: { rank: 'T', suit: '♠' },
  river: { rank: '2', suit: '♣' },
}

const preflopRows = [
  { actor: '프리플랍', position: 'CO (Hero)', action: '오픈', size: '2.5bb' },
  { actor: '', position: 'BB', action: '3Bet', size: '8bb' },
  { actor: '', position: 'Hero', action: '콜', size: '5.5bb' },
]

const pots = [
  { street: 'Preflop', amount: '3,200' },
  { street: 'Flop', amount: '10,400' },
  { street: 'Turn', amount: '20,800' },
  { street: 'River', amount: '20,800' },
]

const goEdit = () => {
  router.push(`/app/tournament/running/level/${levelName.value}/hand/${handId.value}/edit`)
}
</script>

<style scoped>
.hand-detail-page {
  display: grid;
  align-content: start;
  gap: 14px;
  min-height: 100%;
  padding: 20px 20px 112px;
}

.hand-detail-topbar {
  display: grid;
  grid-template-columns: 40px minmax(0, 1fr) 40px;
  align-items: center;
  min-height: 40px;
}

.icon-button {
  width: 38px;
  height: 38px;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--v2-text-main);
}

.hand-detail-topbar h1 {
  margin: 0;
  color: var(--v2-text-main);
  font-size: 17px;
  font-weight: 520;
  line-height: 1.2;
  text-align: center;
}

.hero-summary,
.detail-info {
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-lg);
  background: #ffffff;
  box-shadow: 0 5px 14px rgba(28, 18, 60, 0.025);
}

.hero-summary {
  padding: 12px;
}

.level-pill {
  display: inline-flex;
  min-height: 24px;
  align-items: center;
  padding: 0 9px;
  border-radius: var(--v2-radius-sm);
  background: var(--v2-primary-soft);
  color: var(--v2-primary);
  font-size: 12px;
  font-weight: 560;
  line-height: 1;
}

.summary-body {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  gap: 14px;
  margin-top: 10px;
}

.detail-cards {
  display: flex;
  gap: 8px;
}

.detail-cards span {
  width: 58px;
  height: 78px;
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-sm);
  background: #ffffff;
  color: var(--v2-text-main);
  display: grid;
  place-items: center;
  align-content: center;
  gap: 5px;
}

.detail-cards span.red,
.mini-cards .red {
  color: #e11d48;
}

.detail-cards b {
  font-size: 25px;
  font-weight: 560;
  line-height: 1;
}

.detail-cards em,
.mini-cards em {
  font-style: normal;
  line-height: 1;
}

.summary-copy {
  min-width: 0;
}

.summary-copy strong {
  color: var(--v2-text-main);
  font-size: 20px;
  font-weight: 560;
  line-height: 1.2;
}

.summary-copy p {
  overflow: hidden;
  margin: 9px 0 8px;
  color: #5b5668;
  font-size: 13px;
  font-weight: 430;
  line-height: 1.35;
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

.detail-section {
  display: grid;
  gap: 8px;
}

.section-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 28px;
}

.section-title-row h2 {
  margin: 0;
  color: var(--v2-text-main);
  font-size: 15px;
  font-weight: 520;
  line-height: 1.2;
}

.edit-link {
  width: 32px;
  height: 32px;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--v2-primary);
}

.memo-card {
  min-height: 76px;
  padding: 13px 14px;
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-md);
  background: #ffffff;
  color: #3f3a4e;
  font-size: 14px;
  font-weight: 430;
  line-height: 1.6;
}

.memo-card p {
  margin: 0;
}

.tag-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-row span {
  display: inline-flex;
  min-height: 28px;
  align-items: center;
  padding: 0 10px;
  border-radius: var(--v2-radius-sm);
  background: #f3f1fa;
  color: #5f4fd6;
  font-size: 12px;
  font-weight: 520;
}

.detail-info {
  overflow: hidden;
}

.detail-info__header {
  width: 100%;
  min-height: 48px;
  padding: 0 14px;
  border: 0;
  background: #ffffff;
  color: var(--v2-text-main);
  display: flex;
  align-items: center;
  justify-content: space-between;
  font: inherit;
  font-size: 15px;
  font-weight: 520;
}

.detail-info__content {
  border-top: 1px solid var(--v2-border);
}

.info-list,
.board-list,
.pot-list {
  margin: 0;
}

.info-list div,
.board-list > div,
.pot-list > div {
  padding: 13px 14px;
  border-bottom: 1px solid var(--v2-border);
}

.info-list div {
  display: grid;
  grid-template-columns: 80px minmax(0, 1fr) 56px 56px;
  align-items: center;
  gap: 10px;
}

.info-list dt,
.board-list dt,
.pot-list dt {
  color: #4c4658;
  font-size: 13px;
  font-weight: 520;
}

.info-list dd,
.board-list dd,
.pot-list dd {
  margin: 0;
  color: #4f4a5e;
  font-size: 13px;
  font-weight: 430;
}

.info-list dd.primary {
  color: var(--v2-primary);
  font-weight: 560;
}

.board-list > div {
  display: grid;
  grid-template-columns: 80px minmax(0, 1fr);
  gap: 10px;
}

.board-list dd {
  display: grid;
  grid-template-columns: 54px minmax(0, 1fr);
  align-items: center;
  gap: 10px;
  min-height: 34px;
}

.board-list dd + dd {
  margin-top: 8px;
}

.board-list dd > span,
.pot-list span {
  color: var(--v2-text-sub);
  font-size: 12px;
}

.mini-cards {
  display: flex;
  gap: 6px;
}

.mini-cards i {
  width: 29px;
  height: 34px;
  border: 1px solid var(--v2-border);
  border-radius: 6px;
  background: #ffffff;
  color: var(--v2-text-main);
  display: grid;
  place-items: center;
  align-content: center;
  gap: 1px;
  font-style: normal;
}

.mini-cards b {
  font-size: 13px;
  font-weight: 560;
  line-height: 1;
}

.mini-cards em {
  font-size: 11px;
}

.pot-list > div {
  display: grid;
  grid-template-columns: 80px repeat(4, minmax(0, 1fr));
  gap: 8px;
}

.pot-list dd {
  display: grid;
  gap: 6px;
  text-align: center;
}

.pot-list strong {
  color: #4f4a5e;
  font-size: 13px;
  font-weight: 520;
}

.info-caption {
  margin: 0;
  padding: 11px 14px 13px;
  color: var(--v2-text-sub);
  font-size: 11px;
  font-weight: 430;
}

.detail-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

@media (max-width: 420px) {
  .hand-detail-page {
    gap: 12px;
    padding: 18px 18px 112px;
  }

  .summary-body {
    gap: 12px;
  }

  .detail-cards span {
    width: 52px;
    height: 72px;
  }

  .detail-cards b {
    font-size: 23px;
  }

  .summary-copy strong {
    font-size: 18px;
  }

  .info-list div {
    grid-template-columns: 68px minmax(0, 1fr) 48px 50px;
    gap: 7px;
  }

  .pot-list > div {
    grid-template-columns: 64px repeat(4, minmax(0, 1fr));
    gap: 6px;
  }
}
</style>
