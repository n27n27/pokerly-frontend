<template>
  <q-page class="summary-page" @click="menuOpen = false">
    <header class="topbar">
      <button type="button" aria-label="뒤로 가기" @click="router.back()"><q-icon name="chevron_left" size="30px" /></button>
      <h1>대회 요약</h1>
      <button type="button" aria-label="대회 메뉴" @click.stop="menuOpen = !menuOpen"><q-icon name="more_vert" size="22px" /></button>
      <div v-if="menuOpen" class="page-menu" @click.stop>
        <button type="button" @click="editTournament"><q-icon name="edit" size="18px" />대회 수정</button>
        <button type="button" @click="resumeTournament"><q-icon name="play_circle_outline" size="18px" />다시 진행</button>
      </div>
    </header>

    <section class="title-row"><h2>프라임 0702</h2><time>2026.07.23</time></section>

    <section class="result-card">
      <div class="result-main">
        <i><q-icon name="emoji_events" size="25px" /></i>
        <span><small>최종 결과</small><strong class="primary">ITM</strong></span>
      </div>
      <div><span>최종 순위</span><strong>17위</strong></div>
      <div><span>상금</span><strong class="primary">+32만</strong></div>
      <div class="result-sub">
        <span><small>총 바인</small><strong>2회</strong></span>
      </div>
      <div class="result-sub">
        <span><small>기록 핸드</small><strong>125핸드</strong></span>
      </div>
    </section>

    <section class="content-section">
      <div class="section-head"><h2>복기 핸드</h2><button type="button" @click="goReviewHands">전체 보기 <q-icon name="chevron_right" size="17px" /></button></div>
      <div class="hand-grid">
        <button v-for="hand in hands" :key="hand.id" type="button" @click="openHand(hand)">
          <strong>{{ hand.name }}</strong><span>{{ hand.level }} · <b :class="hand.tone">{{ hand.result }}</b></span>
        </button>
      </div>
    </section>

    <section class="content-section">
      <div class="section-head"><h2>레벨별 요약</h2></div>
      <div class="level-table">
        <div class="table-head"><span>레벨</span><span>스택</span><span>스택 변화</span><span></span></div>
        <button v-for="level in levels" :key="level.name" type="button" @click="openLevel(level.name)">
          <strong>{{ level.name }}</strong><span>{{ level.stack }}</span><span :class="level.tone">{{ level.change }}</span><q-icon name="chevron_right" size="18px" />
        </button>
      </div>
    </section>

    <section class="content-section">
      <div class="section-head"><h2>프리플랍 분석</h2></div>
      <div class="stats-list">
        <button type="button" @click="goStats">
          <i><q-icon name="style" size="19px" /></i>
          <span><strong>VPIP 23% · PFR 17% · 3Bet 8%</strong></span>
          <b>상세 보기 <q-icon name="chevron_right" size="16px" /></b>
        </button>
      </div>
    </section>

    <section class="content-section">
      <div class="section-head"><h2>대회 메모</h2></div>
      <div class="memo-box">
        <p>초반 타이트하게 운영 후, L10 이후 적극적으로 플레이.</p><p>CO, BTN에서 좋은 핸드로 승부 많이 가져감.</p><p>L15~L20 구간 스택 관리가 아쉬웠음.</p>
        <button type="button" aria-label="대회 메모 수정" @click="editTournament"><q-icon name="more_horiz" size="19px" /></button>
      </div>
    </section>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const menuOpen = ref(false)
const tournamentId = route.params.tournamentId || '1'
const hands = [
  { id: 1, level: 'L7', name: 'AKs', result: '승리', tone: 'win' },
  { id: 2, level: 'L11', name: 'QTo', result: '패배', tone: 'lose' },
  { id: 3, level: 'L14', name: 'AJo', result: '승리', tone: 'win' },
  { id: 4, level: 'L16', name: '99', result: '패배', tone: 'lose' },
]
const levels = [
  { name: 'L1', blinds: '100 / 200 (200)', stack: '100,000', change: '-', tone: '' },
  { name: 'L5', blinds: '500 / 1,000 (1,000)', stack: '118,000', change: '▲ 18,000', tone: 'up' },
  { name: 'L10', blinds: '1,000 / 2,000 (2,000)', stack: '142,000', change: '▲ 24,000', tone: 'up' },
  { name: 'L15', blinds: '2,000 / 4,000 (4,000)', stack: '98,000', change: '▼ 44,000', tone: 'down' },
  { name: 'L20', blinds: '3,000 / 6,000 (6,000)', stack: '122,000', change: '▲ 24,000', tone: 'up' },
  { name: 'L25', blinds: '4,000 / 8,000 (8,000)', stack: '85,000', change: '▼ 37,000', tone: 'down' },
]
const editTournament = () => { menuOpen.value = false; router.push({ path: '/app/tournament/running/finish', query: { mode: 'edit', tournamentId } }) }
const resumeTournament = () => { menuOpen.value = false; router.push('/app/tournament/running') }
const openHand = (hand) => router.push(`/app/tournament/running/level/${hand.level}/hand/${hand.id}`)
const openLevel = (name) => router.push({
  path: `/app/tournament/running/level/${name}`,
  query: { view: 'summary' },
})
const goReviewHands = () => router.push(`/app/tournament/${tournamentId}/review-hands`)
const goStats = () => router.push(`/app/tournament/${tournamentId}/stats/preflop`)
</script>

<style scoped>
.summary-page { display: flex; min-height: 100%; flex-direction: column; padding: 0 var(--v2-page-padding-x) 180px; }
.summary-page * { box-sizing: border-box; }
.topbar { position: relative; display: grid; width: 100%; height: 36px; min-height: 36px; max-height: 36px; flex: 0 0 36px; grid-template-columns: 40px 1fr 40px; align-items: center; }
.topbar > button { display: grid; width: 36px; height: 36px; place-items: center; padding: 0; border: 0; background: transparent; color: var(--v2-text-main); }
.topbar > button:last-of-type { justify-self: end; }
.topbar h1 { margin: 0; font-size: 17px; font-weight: 560; text-align: center; }
.page-menu { position: absolute; z-index: 5; top: 42px; right: 0; width: 156px; overflow: hidden; border: 1px solid var(--v2-border); border-radius: 12px; background: #fff; box-shadow: 0 12px 28px rgba(28,18,60,.16); }
.page-menu button { display: flex; width: 100%; min-height: 42px; align-items: center; gap: 9px; padding: 0 12px; border: 0; border-bottom: 1px solid var(--v2-border); background: #fff; color: var(--v2-text-main); font: inherit; font-size: 13px; font-weight: 520; }
.page-menu button:last-child { border-bottom: 0; }
.title-row { display: flex; min-height: 28px; flex: 0 0 auto; align-items: center; justify-content: space-between; margin-top: 24px; }
.title-row h2 { margin: 0; font-size: 20px; font-weight: 620; }
.title-row time { color: var(--v2-text-sub); font-size: 13px; }
.result-card, .level-table, .stat-card, .memo-box, .hand-grid button { border: 1px solid var(--v2-border); border-radius: var(--v2-radius-lg); background: #fff; box-shadow: 0 5px 14px rgba(28,18,60,.025); }
.result-card { display: grid; grid-template-columns: repeat(6,minmax(0,1fr)); margin-top: 5px; padding: 12px 14px; }
.result-card > div { display: grid; min-width: 0; min-height: 58px; grid-column: span 2; place-items: center; align-content: center; gap: 4px; padding: 0 5px; text-align: center; }
.result-card > div:nth-child(2), .result-card > div:nth-child(3), .result-card > div:nth-child(5) { border-left: 1px solid var(--v2-border); }
.result-card .result-main { grid-template-columns: 36px auto; place-content: center; gap: 8px; text-align: left; }
.result-card .result-main > i, .result-card .result-sub > i { display: grid; place-items: center; background: var(--v2-primary-soft); color: var(--v2-primary); }
.result-card .result-main > i { width: 36px; height: 36px; border-radius: 50%; }
.result-card .result-main > span, .result-card .result-sub > span { display: grid; gap: 3px; }
.result-card .result-sub { grid-template-columns: auto; grid-column: span 3; place-content: center; margin-top: 10px; padding-top: 11px; border-top: 1px solid var(--v2-border); text-align: center; }
.result-card > div > span, .result-card small { color: #706a7f; font-size: 11px; font-weight: 580; }
.result-card small { font-family: inherit; line-height: 1.2; }
.result-card strong { font-size: clamp(13px,3.8vw,17px); font-weight: 620; white-space: nowrap; }
.result-card .primary, .result-card p b { color: var(--v2-primary); }
.result-card p { margin: 0; color: var(--v2-text-sub); font-size: 11px; font-weight: 500; }
.content-section { display: grid; gap: 4px; margin-top: 13px; }
.section-head { display: flex; align-items: center; justify-content: space-between; }
.section-head h2 { margin: 0; font-size: 16px; font-weight: 600; }
.section-head button { display: flex; align-items: center; padding: 0; border: 0; background: transparent; color: var(--v2-primary); font: inherit; font-size: 12px; font-weight: 520; }
.hand-grid { display: grid; grid-template-columns: repeat(4,minmax(0,1fr)); gap: 8px; }
.hand-grid button { display: grid; min-width: 0; min-height: 68px; grid-template-rows: 22px 16px; place-items: center; align-content: center; gap: 5px; padding: 10px 7px; color: var(--v2-text-main); font: inherit; text-align: center; }
.hand-grid strong { overflow: hidden; font-size: clamp(12px,3.7vw,16px); text-overflow: ellipsis; }
.hand-grid span { overflow: hidden; color: #4f4a5e; font-size: 9px; text-overflow: ellipsis; white-space: nowrap; }
.hand-grid b { font-weight: 520; }.hand-grid .win { color: var(--v2-success); }.hand-grid .lose { color: var(--v2-danger); }
.level-table { overflow: hidden; padding: 10px; }
.table-head, .level-table > button { display: grid; grid-template-columns: 48px minmax(84px,1fr) minmax(94px,1fr) 18px; align-items: center; gap: 8px; }
.table-head { padding: 2px 10px 8px; color: var(--v2-text-sub); font-size: 12px; }
.level-table > button { width: 100%; min-height: 42px; padding: 0 10px; border: 0; background: transparent; color: var(--v2-text-main); font: inherit; font-size: 12px; text-align: left; }
.table-head > span:nth-child(2), .table-head > span:nth-child(3), .level-table > button > span { justify-self: end; text-align: right; }
.level-table > button strong { font-weight: 600; }
.level-table .up { color: var(--v2-success); font-weight: 540; }
.level-table .down { color: var(--v2-danger); font-weight: 540; }
.level-table .q-icon { justify-self: end; color: var(--v2-text-sub); }
.stats-list { overflow: hidden; border: 1px solid var(--v2-border); border-radius: var(--v2-radius-lg); background: #fff; box-shadow: 0 5px 14px rgba(28,18,60,.025); }
.stats-list button { display: grid; width: 100%; min-height: 67px; grid-template-columns: 38px minmax(0,1fr) auto; align-items: center; gap: 10px; padding: 10px 12px; border: 0; border-bottom: 1px solid var(--v2-border); background: #fff; color: var(--v2-text-main); font: inherit; text-align: left; }
.stats-list button:last-child { border-bottom: 0; }
.stats-list button > i { display: grid; width: 36px; height: 36px; place-items: center; border-radius: 10px; background: var(--v2-primary-soft); color: var(--v2-primary); }
.stats-list button > span { display: grid; min-width: 0; gap: 5px; }
.stats-list strong { font-size: 13px; font-weight: 620; }
.stats-list small { overflow: hidden; color: var(--v2-text-sub); font-size: 10px; text-overflow: ellipsis; white-space: nowrap; }
.stats-list button > b { display: flex; align-items: center; color: var(--v2-primary); font-size: 10px; font-weight: 540; white-space: nowrap; }
.memo-box { position: relative; padding: 12px 42px 12px 12px; }.memo-box p { margin: 0; color: #403b4b; font-size: 11px; line-height: 1.55; }.memo-box button { position: absolute; top: 10px; right: 10px; display: grid; width: 29px; height: 25px; place-items: center; padding: 0; border: 1px solid var(--v2-border); border-radius: 7px; background: #fff; color: var(--v2-primary); }
@media (min-width: 521px) { .table-head, .level-table > button { grid-template-columns: 70px minmax(0,1fr) minmax(0,1fr) 18px; } }
</style>
