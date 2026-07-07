<template>
  <q-page class="home-page">
    <section v-if="hasRunningTournament" class="running-section">
      <h2>진행 중 토너먼트</h2>

      <article class="running-card">
        <div class="running-card__header">
          <span>{{ runningTournament.name }}</span>
          <strong>Running</strong>
        </div>

        <div class="running-card__level">{{ runningTournament.level }}</div>
        <p>{{ runningTournament.blinds }}</p>

        <dl>
          <div>
            <dt>현재 스택</dt>
            <dd>{{ runningTournament.currentStack }}</dd>
            <span>{{ runningTournament.currentBb }} BB</span>
          </div>
          <div>
            <dt>평균 스택</dt>
            <dd>{{ runningTournament.averageStack }}</dd>
            <span>{{ runningTournament.averageBb }} BB</span>
          </div>
        </dl>

        <button class="running-card__action" type="button" @click="goTournamentRunning">
          <q-icon name="edit_square" size="18px" />
          이어서 기록하기
        </button>
      </article>
    </section>

    <AppCard v-else class="start-card" variant="interactive" padding="lg" @click="goTournamentStart">
      <div class="start-card__mark" aria-hidden="true">
        <div class="start-card__glyph"></div>
        <q-icon class="start-card__plus" name="add" size="22px" />
      </div>

      <div class="start-card__copy">
        <h1>새 토너먼트 시작</h1>
        <p>새로운 토너먼트<br />기록을 시작해보세요.</p>
      </div>

      <q-icon class="start-card__arrow" name="chevron_right" size="30px" />
    </AppCard>

    <AppSection :title="recentSection.title" action-label="더보기 ›">
      <AppCard padding="none">
        <button
          v-for="item in recentSection.items"
          :key="item.id"
          class="recent-row"
          type="button"
          @click="openRecentTournament(item)"
        >
          <span class="recent-row__main">
            <strong>{{ item.title }}</strong>
            <span>{{ item.meta }}</span>
          </span>

          <span v-if="item.badge" class="recent-row__badge" :class="`recent-row__badge--${item.tone}`">
            {{ item.badge }}
          </span>

          <strong v-if="item.result" class="recent-row__result" :class="`recent-row__result--${item.tone}`">
            {{ item.result }}
          </strong>

          <q-icon class="recent-row__arrow" name="chevron_right" size="24px" />
        </button>
      </AppCard>
      <p class="home-page__hint">최근 3개를 표시합니다. 더보기에서 전체 목록을 확인할 수 있어요.</p>
    </AppSection>

    <AppSection title="이번 달 요약">
      <div class="home-page__stats-grid">
        <StatCard label="Profit" value="+1132만" tone="success" icon="account_balance_wallet" />
        <StatCard label="ROI" value="+42.1%" tone="success" icon="show_chart" />
        <StatCard label="토너먼트" value="12" icon="emoji_events" />
        <StatCard label="ITM" value="3" icon="workspace_premium" />
      </div>
    </AppSection>
  </q-page>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import AppCard from 'src/shared/components/AppCard.vue'
import AppSection from 'src/shared/components/AppSection.vue'
import StatCard from 'src/shared/components/StatCard.vue'

const recordMode = 'tournament'
const router = useRouter()
const route = useRoute()

const hasRunningTournament = computed(() => route.query.running === '1')

const runningTournament = {
  name: 'Prime 3000 GTD',
  level: 'L12',
  blinds: '1,500 / 3,000 (3,000)',
  currentStack: '84,000',
  currentBb: '28',
  averageStack: '112,000',
  averageBb: '37',
}

const recentByMode = {
  tournament: {
    title: '최근 토너먼트',
    items: [
      { id: 'prime-0702', title: '프라임 0702', meta: '2025.07.02', badge: '완료', tone: 'success' },
      { id: 'mango-0630', title: 'Mango 2nd', meta: '2024.06.30', badge: '탈락', tone: 'default' },
      { id: 'kiki-0629', title: 'KIKI 3000 GTD', meta: '2024.06.29', badge: 'Bubble', tone: 'default' },
    ],
  },
  simple: {
    title: '최근 세션',
    items: [
      { title: 'Prime Daily', meta: '2024.07.03  |  바이인 120,000', result: '+200,000', tone: 'success' },
      { title: 'Royce Daily', meta: '2024.07.02  |  바이인 110,000', result: '-50,000', tone: 'danger' },
      { title: 'Mango Deepstack', meta: '2024.07.01  |  바이인 80,000', result: '+35,000', tone: 'success' },
    ],
  },
}

const recentSection = computed(() => recentByMode[recordMode])

const goTournamentStart = () => {
  router.push('/app/tournament/start')
}

const goTournamentRunning = () => {
  router.push('/app/tournament/running')
}

const openRecentTournament = (item) => {
  if (recordMode !== 'tournament') return
  router.push(`/app/tournament/${item.id}/summary`)
}
</script>

<style scoped>
.home-page {
  display: grid;
  gap: 26px;
  padding: 10px 20px 24px;
}

.running-section {
  display: grid;
  gap: 12px;
}

.running-section h2 {
  margin: 0;
  color: var(--v2-text-main);
  font-size: 15px;
  font-weight: 560;
  line-height: 1.2;
}

.running-card {
  padding: 16px;
  border-radius: var(--v2-radius-lg);
  background: linear-gradient(135deg, #6d45e8 0%, #5317f4 100%);
  color: #ffffff;
  box-shadow: 0 12px 24px rgba(83, 23, 244, 0.18);
}

.running-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.running-card__header span {
  overflow: hidden;
  min-width: 0;
  font-size: 13px;
  font-weight: 520;
  line-height: 1.2;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.running-card__header strong {
  flex: 0 0 auto;
  padding: 4px 9px;
  border-radius: 999px;
  background: #141329;
  color: #20e0a1;
  font-size: 10px;
  font-weight: 560;
  line-height: 1;
}

.running-card__level {
  margin-top: 12px;
  font-size: 34px;
  font-weight: 600;
  line-height: 1;
  letter-spacing: 0;
}

.running-card p {
  margin: 6px 0 16px;
  color: rgba(255, 255, 255, 0.88);
  font-size: 13px;
  font-weight: 430;
  line-height: 1.2;
}

.running-card dl {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  margin: 0;
  padding: 16px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.18);
  border-bottom: 1px solid rgba(255, 255, 255, 0.18);
}

.running-card dl div {
  min-width: 0;
  padding: 0 16px;
}

.running-card dl div:first-child {
  padding-left: 0;
  border-right: 1px solid rgba(255, 255, 255, 0.18);
}

.running-card dl div:last-child {
  padding-right: 0;
}

.running-card dt,
.running-card dd {
  margin: 0;
}

.running-card dt {
  color: rgba(255, 255, 255, 0.78);
  font-size: 12px;
  font-weight: 430;
  line-height: 1.2;
}

.running-card dd {
  margin-top: 6px;
  color: #ffffff;
  font-size: 22px;
  font-weight: 560;
  line-height: 1.1;
}

.running-card dl span {
  display: block;
  margin-top: 4px;
  color: rgba(255, 255, 255, 0.82);
  font-size: 12px;
  font-weight: 430;
  line-height: 1.2;
}

.running-card__action {
  width: 100%;
  min-height: 44px;
  margin-top: 14px;
  border: 0;
  border-radius: var(--v2-radius-md);
  background: #ffffff;
  color: var(--v2-primary);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font: inherit;
  font-size: 14px;
  font-weight: 560;
}

.start-card {
  display: grid;
  grid-template-columns: 82px minmax(0, 1fr) auto;
  align-items: center;
  gap: 14px;
  min-height: 122px;
  border-color: rgba(109, 69, 232, 0.12);
  background: linear-gradient(180deg, #fbf9ff 0%, #ffffff 100%);
}

.start-card__mark {
  position: relative;
  width: 64px;
  height: 64px;
}

.start-card__glyph {
  position: absolute;
  inset: 6px 10px 9px 6px;
  border: 10px solid rgba(109, 69, 232, 0.72);
  border-right: 0;
  border-bottom: 0;
  border-radius: 8px 3px 0 3px;
  box-shadow: 10px 8px 0 rgba(109, 69, 232, 0.1);
  transform: skewY(-7deg);
}

.start-card__plus {
  position: absolute;
  right: 0;
  bottom: 8px;
  display: grid;
  width: 28px;
  height: 28px;
  place-items: center;
  border-radius: 50%;
  background: var(--v2-primary);
  color: #ffffff;
  box-shadow: 0 8px 18px rgba(109, 69, 232, 0.24);
}

.start-card__copy {
  min-width: 0;
}

.start-card__copy h1 {
  margin: 0 0 8px;
  color: var(--v2-text-main);
  font-size: 20px;
  font-weight: 560;
  line-height: 1.2;
  letter-spacing: 0;
}

.start-card__copy p {
  margin: 0;
  color: var(--v2-text-sub);
  font-size: 13px;
  font-weight: 450;
  line-height: 1.55;
}

.start-card__arrow {
  color: #4b465b;
}

.recent-row {
  width: 100%;
  min-height: 80px;
  padding: 14px 14px 14px 24px;
  border: 0;
  border-bottom: 1px solid var(--v2-border);
  background: transparent;
  color: var(--v2-text-main);
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto auto;
  align-items: center;
  gap: 10px;
  text-align: left;
}

.recent-row:last-child {
  border-bottom: 0;
}

.recent-row__main {
  display: grid;
  gap: 6px;
  min-width: 0;
}

.recent-row__main strong {
  overflow: hidden;
  font-size: 16px;
  font-weight: 560;
  line-height: 1.2;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.recent-row__main span {
  overflow: hidden;
  color: var(--v2-text-sub);
  font-size: 14px;
  font-weight: 450;
  line-height: 1.2;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.recent-row__badge {
  min-width: 42px;
  padding: 6px 8px;
  border-radius: var(--v2-radius-sm);
  background: #f0eff5;
  color: #302c3d;
  font-size: 13px;
  font-weight: 520;
  line-height: 1;
  text-align: center;
}

.recent-row__badge--success {
  background: rgba(22, 163, 74, 0.16);
  color: #15803d;
}

.recent-row__result {
  font-size: 16px;
  font-weight: 560;
  line-height: 1;
  white-space: nowrap;
}

.recent-row__result--success {
  color: var(--v2-success);
}

.recent-row__result--danger {
  color: var(--v2-danger);
}

.recent-row__arrow {
  color: #777188;
}

.home-page__hint {
  margin: 12px 0 0;
  color: var(--v2-text-sub);
  font-size: 13px;
  font-weight: 450;
  line-height: 1.45;
}

.home-page__stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}

@media (max-width: 420px) {
  .start-card {
    grid-template-columns: 72px minmax(0, 1fr) auto;
    gap: 12px;
    min-height: 116px;
  }

  .start-card__mark {
    width: 58px;
    height: 58px;
  }

  .start-card__copy h1 {
    font-size: 19px;
  }

  .home-page__stats-grid {
    gap: 8px;
  }
}
</style>
