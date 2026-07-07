<template>
  <q-page class="running-page">
    <header class="running-topbar">
      <button class="running-topbar__back" type="button" aria-label="뒤로 가기" @click="router.back()">
        <q-icon name="chevron_left" size="28px" />
      </button>
      <h1>진행 중 토너먼트</h1>
      <span aria-hidden="true"></span>
    </header>

    <section class="running-summary">
      <span class="running-summary__icon">
        <q-icon name="emoji_events" size="27px" />
      </span>
      <div>
        <strong>프라임 0704</strong>
        <p>바인 <b>100,000</b><span></span>리바인 2회</p>
      </div>
    </section>

    <section class="level-section">
      <div class="level-section__header">
        <h2>레벨 목록</h2>
        <button type="button">
          <q-icon name="add" size="19px" />
          레벨 추가
        </button>
      </div>

      <div class="level-list">
        <button
          v-for="level in levels"
          :key="level.name"
          class="level-card"
          :class="{ 'level-card--current': level.current }"
          type="button"
          @click="openLevel(level.name)"
        >
          <div class="level-card__top">
            <strong>{{ level.name }}</strong>
            <span>{{ level.blinds }}</span>
            <em v-if="level.current">현재</em>
          </div>

          <dl>
            <div>
              <dt>핸드</dt>
              <dd>{{ level.hands }}</dd>
            </div>
            <div>
              <dt>시작 스택</dt>
              <dd>{{ level.startStack }}</dd>
            </div>
            <div>
              <dt>마감/현재 스택</dt>
              <dd>{{ level.endStack }}</dd>
            </div>
          </dl>
        </button>
      </div>
    </section>

    <button class="finish-button" type="button">토너먼트 종료</button>
  </q-page>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const levels = [
  { name: 'L1', blinds: '100 / 200 / 200', hands: '12', startStack: '100,000', endStack: '115,000' },
  { name: 'L2', blinds: '200 / 300 / 300', hands: '8', startStack: '115,000', endStack: '138,500' },
  { name: 'L3', blinds: '300 / 500 / 500', hands: '5', startStack: '138,500', endStack: '132,000', current: true },
  { name: 'L4', blinds: '400 / 800 / 800', hands: '0', startStack: '-', endStack: '-' },
  { name: 'L5', blinds: '600 / 1,200 / 1,200', hands: '0', startStack: '-', endStack: '-' },
  { name: 'L6', blinds: '800 / 1,600 / 1,600', hands: '0', startStack: '-', endStack: '-' },
  { name: 'L7', blinds: '1,000 / 2,000 / 2,000', hands: '0', startStack: '-', endStack: '-' },
  { name: 'L8', blinds: '1,500 / 3,000 / 3,000', hands: '0', startStack: '-', endStack: '-' },
]

const openLevel = (levelName) => {
  router.push(`/app/tournament/running/level/${levelName}`)
}
</script>

<style scoped>
.running-page {
  display: grid;
  align-content: start;
  gap: 22px;
  min-height: 100%;
  padding: 34px 20px 112px;
}

.running-topbar {
  display: grid;
  grid-template-columns: 40px minmax(0, 1fr) 40px;
  align-items: center;
  min-height: 36px;
}

.running-topbar__back {
  width: 36px;
  height: 36px;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--v2-text-main);
}

.running-topbar h1 {
  margin: 0;
  color: var(--v2-text-main);
  font-size: 17px;
  font-weight: 560;
  line-height: 1.2;
  text-align: center;
}

.running-summary {
  padding: 18px;
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-lg);
  background: #ffffff;
  box-shadow: 0 6px 18px rgba(28, 18, 60, 0.035);
  display: grid;
  grid-template-columns: 64px minmax(0, 1fr);
  align-items: center;
  gap: 12px;
}

.running-summary__icon {
  display: flex;
  width: 50px;
  height: 50px;
  align-items: center;
  justify-content: center;
  border-radius: var(--v2-radius-lg);
  background: var(--v2-primary-soft);
  color: var(--v2-primary);
}

.running-summary strong {
  color: var(--v2-text-main);
  font-size: 20px;
  font-weight: 560;
  line-height: 1.2;
}

.running-summary p {
  margin: 12px 0 0;
  color: var(--v2-text-main);
  display: flex;
  align-items: center;
  gap: 14px;
  font-size: 14px;
  font-weight: 430;
  line-height: 1.2;
}

.running-summary b {
  font-weight: 520;
}

.running-summary p span {
  width: 1px;
  height: 14px;
  background: var(--v2-border);
}

.level-section {
  display: grid;
  gap: 14px;
}

.level-section__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.level-section__header h2 {
  margin: 0;
  color: var(--v2-text-main);
  font-size: 17px;
  font-weight: 560;
  line-height: 1.2;
}

.level-section__header button {
  min-height: 34px;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--v2-primary);
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font: inherit;
  font-size: 14px;
  font-weight: 520;
}

.level-list {
  display: grid;
  gap: 10px;
}

.level-card {
  width: 100%;
  padding: 14px 16px;
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-lg);
  background: #ffffff;
  box-shadow: 0 5px 14px rgba(28, 18, 60, 0.025);
  color: var(--v2-text-main);
  font: inherit;
  text-align: left;
}

.level-card--current {
  border-color: rgba(109, 69, 232, 0.72);
  background: rgba(241, 236, 255, 0.5);
}

.level-card__top {
  display: grid;
  grid-template-columns: 52px minmax(0, 1fr) auto;
  align-items: center;
  gap: 12px;
}

.level-card__top strong {
  color: var(--v2-text-main);
  font-size: 23px;
  font-weight: 560;
  line-height: 1;
}

.level-card__top span {
  color: var(--v2-text-main);
  font-size: 17px;
  font-weight: 520;
  line-height: 1.2;
}

.level-card--current .level-card__top strong,
.level-card--current .level-card__top span {
  color: var(--v2-primary);
}

.level-card__top em {
  padding: 5px 8px;
  border-radius: var(--v2-radius-sm);
  background: var(--v2-primary-soft);
  color: var(--v2-primary);
  font-size: 11px;
  font-style: normal;
  font-weight: 520;
  line-height: 1;
}

.level-card dl {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin: 12px 0 0;
}

.level-card dl div {
  min-width: 0;
  padding: 0 8px;
  border-right: 1px solid var(--v2-border);
  text-align: center;
}

.level-card dl div:first-child {
  padding-left: 0;
}

.level-card dl div:last-child {
  padding-right: 0;
  border-right: 0;
}

.level-card dt,
.level-card dd {
  margin: 0;
}

.level-card dt {
  color: var(--v2-text-sub);
  font-size: 11px;
  font-weight: 430;
  line-height: 1.2;
}

.level-card dd {
  margin-top: 7px;
  color: var(--v2-text-main);
  font-size: 15px;
  font-weight: 520;
  line-height: 1.15;
}

.level-card--current dd {
  color: var(--v2-primary);
}

.finish-button {
  min-height: 46px;
  border: 1px solid rgba(239, 68, 68, 0.55);
  border-radius: var(--v2-radius-md);
  background: #ffffff;
  color: var(--v2-danger);
  font: inherit;
  font-size: 16px;
  font-weight: 560;
}

@media (max-width: 420px) {
  .running-page {
    padding-top: 30px;
  }

  .level-card {
    padding: 13px 14px;
  }

  .level-card__top {
    grid-template-columns: 46px minmax(0, 1fr) auto;
    gap: 10px;
  }

  .level-card__top strong {
    font-size: 21px;
  }

  .level-card__top span {
    font-size: 15px;
  }

  .level-card dd {
    font-size: 14px;
  }
}
</style>
