<template>
  <q-page class="hand-detail-page">
    <header class="hand-detail-topbar">
      <button class="icon-button" type="button" aria-label="뒤로 가기" @click="router.back()">
        <q-icon name="chevron_left" size="30px" />
      </button>
      <h1>핸드 상세</h1>
      <button class="icon-button" type="button" aria-label="핸드 메뉴" @click="menuOpen = !menuOpen">
        <q-icon name="more_vert" size="22px" />
      </button>

      <div v-if="menuOpen" class="overflow-menu">
        <button type="button" @click="goHandEdit">
          <q-icon name="edit" size="18px" />
          핸드 수정
        </button>
        <button class="danger" type="button" @click="openDeleteDialog">
          <q-icon name="delete_outline" size="18px" />
          삭제
        </button>
      </div>
    </header>

    <section class="hand-overview">
      <div class="overview-meta">
        <span class="level-pill">{{ levelName }}</span>
        <strong>AKs <i>·</i> CO</strong>
        <b>#{{ handNumber }}</b>
      </div>

      <div class="hero-cards" aria-label="A 스페이드, K 하트">
        <span v-for="card in heroCards" :key="card.rank + card.suit" :class="{ red: card.red }">
          <b>{{ card.rank }}</b>
          <em>{{ card.suit }}</em>
        </span>
      </div>

      <div class="hand-facts">
        <div>
          <span>프리플랍 액션</span>
          <p>
            <i v-for="action in preflopActions" :key="action">{{ action }}</i>
          </p>
        </div>
        <div>
          <span>결과</span>
          <strong>승리</strong>
        </div>
      </div>
    </section>

    <section v-if="!hasReview" class="review-empty">
      <div class="review-empty__icon"><q-icon name="edit_note" size="34px" /></div>
      <strong>복기 기록이 없습니다.</strong>
      <button class="outline-action" type="button" @click="goReviewEdit">
        <q-icon name="edit" size="17px" />
        복기 작성
      </button>
    </section>

    <section v-else class="review-summary">
      <h2><q-icon name="info" size="17px" /> 복기 요약</h2>

      <div class="summary-row summary-row--memo">
        <span>메모</span>
        <p>{{ review.memo }}</p>
      </div>

      <div class="summary-row">
        <span>보드</span>
        <div class="board-cards">
          <i v-for="card in review.board" :key="card.rank + card.suit" :class="{ red: card.red }">
            <b>{{ card.rank }}</b><em>{{ card.suit }}</em>
          </i>
        </div>
      </div>

      <div class="summary-row">
        <span>액션</span>
        <p class="street-list">
          <i v-for="street in review.streets" :key="street">{{ street }}</i>
        </p>
      </div>

      <button class="outline-action" type="button" @click="goReviewEdit">
        <q-icon name="edit" size="17px" />
        복기 수정
      </button>
    </section>

    <q-dialog v-model="deleteDialogOpen">
      <q-card class="delete-dialog">
        <q-card-section>
          <div class="delete-dialog__icon"><q-icon name="delete_outline" size="24px" /></div>
          <h2>이 핸드를 삭제할까요?</h2>
          <p>삭제한 핸드 기록과 복기는 다시 복구할 수 없어요.</p>
        </q-card-section>
        <q-card-actions>
          <button class="dialog-button cancel" type="button" @click="deleteDialogOpen = false">취소</button>
          <button class="dialog-button delete" type="button" @click="confirmDelete">삭제</button>
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useAlert } from 'src/composables/useAlert'

const route = useRoute()
const router = useRouter()
const alert = useAlert()

const menuOpen = ref(false)
const deleteDialogOpen = ref(false)
const levelName = computed(() => route.params.levelName || 'L3')
const handId = computed(() => route.params.handId || '128')
const handNumber = computed(() => route.params.handId || '128')
const hasReview = computed(() => route.query.review === '1')

const heroCards = [
  { rank: 'A', suit: '♠' },
  { rank: 'K', suit: '♥', red: true },
]
const preflopActions = ['오픈']
const review = {
  memo: 'CO에서 오픈 후 SB가 3bet.\n플랍에서 C-bet 후 콜 받고\n리버에서 벳, 폴드로 승리.',
  board: [
    { rank: 'Q', suit: '♠' },
    { rank: '7', suit: '♥', red: true },
    { rank: '2', suit: '♣' },
    { rank: '6', suit: '♣' },
    { rank: 'A', suit: '♥', red: true },
  ],
  streets: ['프리플랍', '플랍', '턴', '리버'],
}

const goReviewEdit = () => {
  router.push({
    path: `/app/tournament/running/level/${levelName.value}/hand/${handId.value}/edit`,
    query: { section: 'review', review: hasReview.value ? '1' : undefined },
  })
}
const goHandEdit = () => {
  menuOpen.value = false
  router.push({
    path: `/app/tournament/running/level/${levelName.value}/hand/${handId.value}/edit`,
    query: { section: 'hand' },
  })
}
const openDeleteDialog = () => {
  menuOpen.value = false
  deleteDialogOpen.value = true
}
const confirmDelete = () => {
  deleteDialogOpen.value = false
  alert.show('핸드 기록을 삭제했어요.', 'success')
  router.replace(`/app/tournament/running/level/${levelName.value}`)
}
</script>

<style scoped>
.hand-detail-page {
  display: grid;
  align-content: start;
  gap: 20px;
  min-height: 100%;
  padding: var(--v2-page-padding-top) var(--v2-page-padding-x) 180px;
}
.hand-detail-topbar {
  position: relative;
  display: grid;
  grid-template-columns: 40px minmax(0, 1fr) 40px;
  align-items: center;
  gap: 10px;
  min-height: 36px;
}
.hand-detail-topbar h1 { margin: 0; color: var(--v2-text-main); font-size: 17px; font-weight: 560; line-height: 1.2; text-align: center; }
.icon-button { display: grid; width: 36px; height: 36px; place-items: center; padding: 0; border: 0; border-radius: 50%; background: transparent; color: var(--v2-text-main); }
.hand-detail-topbar .icon-button:last-of-type { justify-self: end; }
.icon-button:active { background: #efedf6; }
.overflow-menu { position: absolute; z-index: 5; top: 42px; right: 0; width: 156px; overflow: hidden; border: 1px solid var(--v2-border); border-radius: 12px; background: #fff; box-shadow: 0 12px 28px rgba(28, 18, 60, .16); }
.overflow-menu button { display: flex; width: 100%; min-height: 42px; align-items: center; gap: 9px; padding: 0 12px; border: 0; border-bottom: 1px solid var(--v2-border); background: #fff; color: var(--v2-text-main); font: inherit; font-size: 13px; font-weight: 520; text-align: left; }
.overflow-menu button:last-child { border-bottom: 0; }
.overflow-menu button:active { background: #faf9ff; }
.overflow-menu .danger { color: #e23d48; }
.hand-overview, .review-empty, .review-summary { border: 1px solid var(--v2-border); border-radius: var(--v2-radius-lg); background: #fff; box-shadow: 0 5px 14px rgba(28, 18, 60, .025); }
.hand-overview { padding: 12px 14px 13px; }
.overview-meta { display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; }
.overview-meta > strong { font-size: 17px; font-weight: 600; }
.overview-meta > strong i { color: var(--v2-text-sub); font-style: normal; }
.overview-meta > b { justify-self: end; font-size: 14px; font-weight: 600; }
.level-pill { justify-self: start; padding: 5px 8px; border-radius: 7px; background: var(--v2-primary-soft); color: var(--v2-primary); font-size: 12px; font-weight: 600; }
.hero-cards { display: flex; justify-content: center; gap: 8px; margin: 12px 0 14px; }
.hero-cards span { display: grid; width: 56px; height: 76px; place-items: center; align-content: center; gap: 5px; border: 1px solid var(--v2-border); border-radius: var(--v2-radius-sm); color: var(--v2-text-main); }
.hero-cards .red, .board-cards .red { color: #e11d48; }
.hero-cards b { font-size: 26px; line-height: 1; }
.hero-cards em, .board-cards em { font-style: normal; line-height: 1; }
.hand-facts { overflow: hidden; border: 1px solid var(--v2-border); border-radius: var(--v2-radius-md); }
.hand-facts > div { display: grid; grid-template-columns: 92px 1fr; align-items: center; min-height: 44px; padding: 7px 13px; }
.hand-facts > div + div { border-top: 1px solid var(--v2-border); }
.hand-facts span, .summary-row > span { color: #504a5b; font-size: 12px; font-weight: 600; }
.hand-facts p { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 6px; margin: 0; }
.hand-facts p i { padding: 6px 10px; border-radius: 7px; background: #f3f1fa; color: #554c75; font-size: 11px; font-style: normal; }
.hand-facts strong { justify-self: end; color: var(--v2-success); font-size: 13px; }
.review-empty { display: grid; place-items: center; gap: 8px; padding: 22px 14px 14px; text-align: center; }
.review-empty__icon { color: #a59bcf; }
.review-empty > strong { margin-bottom: 9px; font-size: 15px; }
.outline-action { display: flex; width: 100%; min-height: 47px; align-items: center; justify-content: center; gap: 7px; border: 1.5px solid var(--v2-primary); border-radius: var(--v2-radius-md); background: #fff; color: var(--v2-primary); font: inherit; font-size: 14px; font-weight: 600; }
.review-summary { padding: 14px; }
.review-summary h2 { display: flex; align-items: center; gap: 6px; margin: 0 0 12px; color: var(--v2-primary); font-size: 15px; font-weight: 600; }
.summary-row { display: grid; grid-template-columns: 45px 1fr; gap: 8px; align-items: start; margin-bottom: 12px; }
.summary-row p { margin: 0; color: #3f3a4e; font-size: 12px; line-height: 1.55; white-space: pre-line; }
.board-cards { display: flex; flex-wrap: wrap; gap: 6px; }
.board-cards i { display: inline-flex; min-width: 34px; height: 34px; align-items: center; justify-content: center; gap: 2px; border: 1px solid var(--v2-border); border-radius: 7px; font-style: normal; }
.board-cards b { font-size: 13px; }
.street-list { display: flex; flex-wrap: wrap; align-items: center; gap: 7px; }
.street-list i { font-style: normal; }
.street-list i + i::before { margin-right: 7px; color: #aaa3b8; content: '·'; }
.review-summary .outline-action { margin-top: 5px; }
.delete-dialog { width: min(320px, calc(100vw - 40px)); padding: 22px 20px 16px; border-radius: 20px; text-align: center; }
.delete-dialog__icon { display: grid; width: 48px; height: 48px; place-items: center; margin: 0 auto 14px; border-radius: 50%; background: #fff0f1; color: #e23d48; }
.delete-dialog h2 { margin: 0; font-size: 18px; }
.delete-dialog p { margin: 8px 0 0; color: var(--v2-text-sub); font-size: 13px; line-height: 1.5; }
.delete-dialog :deep(.q-card__section) { padding: 0; }
.delete-dialog :deep(.q-card__actions) { display: grid; grid-template-columns: 1fr 1fr; gap: 9px; padding: 22px 0 0; }
.dialog-button { min-height: 46px; border: 0; border-radius: 12px; font: inherit; font-size: 14px; font-weight: 600; }
.dialog-button.cancel { background: #f1eff5; color: var(--v2-text-main); }
.dialog-button.delete { background: #e23d48; color: #fff; }
</style>
