<template>
  <q-page class="start-setup-page">
    <header class="setup-topbar">
      <button class="setup-topbar__back" type="button" aria-label="뒤로 가기" @click="router.back()">
        <q-icon name="chevron_left" size="28px" />
      </button>
      <h1>Tournament Start A</h1>
      <span aria-hidden="true"></span>
    </header>

    <section class="setup-intro">
      <h2>시작 정보를 설정해주세요.</h2>
      <p>오늘의 토너먼트 조건을 입력하고 시작합니다.</p>
    </section>

    <section class="tournament-summary">
      <span class="tournament-summary__icon">
        <q-icon name="storefront" size="24px" />
      </span>

      <div class="tournament-summary__main">
        <strong>{{ selectedTournament.name }}</strong>
        <span>{{ selectedTournament.venue }}</span>
      </div>

      <dl>
        <div>
          <dt>기본 시작 스택</dt>
          <dd>{{ selectedTournament.stack }}</dd>
        </div>
        <div>
          <dt>기본 바인 금액</dt>
          <dd>{{ selectedTournament.buyIn }}</dd>
        </div>
      </dl>
    </section>

    <form class="setup-form" @submit.prevent="startTournament">
      <div class="setup-card">
        <label class="setup-label" for="startLevel">시작 레벨</label>
        <button id="startLevel" class="select-field" type="button" @click="levelOpen = !levelOpen">
          <span>{{ form.level }}</span>
          <q-icon name="expand_more" size="24px" />
        </button>

        <div v-if="levelOpen" class="level-list">
          <button v-for="level in levels" :key="level" type="button" @click="selectLevel(level)">
            <span>{{ level }}</span>
            <q-icon v-if="form.level === level" name="check" size="20px" />
          </button>
        </div>

        <p class="field-help">드롭다운으로 현재 합류할 레벨을 선택하세요.</p>
      </div>

      <div class="setup-card">
        <label class="setup-label" for="startingStack">시작 스택</label>
        <div class="text-field">
          <input id="startingStack" v-model="form.stack" inputmode="numeric" />
          <span>칩</span>
        </div>
        <p class="field-help">자동으로 기본값이 입력됩니다. 필요시 수정할 수 있습니다.</p>
      </div>

      <div class="setup-card">
        <label class="setup-label" for="buyIn">바인 금액 <em>(총 바인)</em></label>
        <div class="text-field">
          <input id="buyIn" v-model="form.buyIn" inputmode="numeric" />
          <span>원</span>
        </div>
        <p class="field-help">자동으로 기본값이 입력됩니다. 필요시 수정할 수 있습니다.</p>
      </div>

      <AppButton class="setup-submit" label="토너먼트 시작" block @click="startTournament" />
    </form>
  </q-page>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import AppButton from 'src/shared/components/AppButton.vue'

const route = useRoute()
const router = useRouter()
const levelOpen = ref(false)

const tournaments = [
  { id: 1, name: 'Prime Daily', venue: 'Prime', stack: '60,000', buyIn: '100,000' },
  { id: 2, name: 'Royce Daily', venue: 'Royce', stack: '60,000', buyIn: '100,000' },
  { id: 3, name: 'Mango Daily', venue: 'Mango', stack: '60,000', buyIn: '100,000' },
  { id: 4, name: 'Prime Championship', venue: 'Prime', stack: '100,000', buyIn: '200,000' },
  { id: 5, name: 'Ati Daily', venue: 'Ati', stack: '60,000', buyIn: '100,000' },
]

const selectedTournament = computed(() => {
  const presetId = Number(route.query.presetId)
  return tournaments.find((item) => item.id === presetId) || tournaments[0]
})

const levels = ['L1', 'L2', 'L3', 'L4', 'L5']

const form = reactive({
  level: 'L1',
  stack: selectedTournament.value.stack,
  buyIn: selectedTournament.value.buyIn,
})

const selectLevel = (level) => {
  form.level = level
  levelOpen.value = false
}

const startTournament = () => {
  router.push({
    path: '/app/home',
    query: { running: '1' },
  })
}
</script>

<style scoped>
.start-setup-page {
  display: grid;
  align-content: start;
  gap: 22px;
  min-height: 100%;
  padding: 34px 20px 112px;
}

.setup-topbar {
  display: grid;
  grid-template-columns: 40px minmax(0, 1fr) 40px;
  align-items: center;
  min-height: 36px;
}

.setup-topbar__back {
  width: 36px;
  height: 36px;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--v2-text-main);
}

.setup-topbar h1 {
  margin: 0;
  color: var(--v2-text-main);
  font-size: 17px;
  font-weight: 560;
  line-height: 1.2;
  text-align: center;
}

.setup-intro h2 {
  margin: 20px 0 16px;
  color: var(--v2-text-main);
  font-size: 26px;
  font-weight: 560;
  line-height: 1.28;
  letter-spacing: 0;
}

.setup-intro p {
  margin: 0;
  color: var(--v2-text-main);
  font-size: 14px;
  font-weight: 430;
  line-height: 1.55;
}

.tournament-summary {
  padding: 16px;
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-lg);
  background: rgba(241, 236, 255, 0.42);
  display: grid;
  grid-template-columns: 48px minmax(0, 1fr);
  gap: 14px;
}

.tournament-summary__icon {
  display: flex;
  width: 44px;
  height: 44px;
  align-items: center;
  justify-content: center;
  border-radius: var(--v2-radius-md);
  background: #ffffff;
  color: var(--v2-primary);
}

.tournament-summary__main {
  display: grid;
  gap: 6px;
  align-content: center;
  min-width: 0;
}

.tournament-summary__main strong {
  color: var(--v2-text-main);
  font-size: 17px;
  font-weight: 560;
  line-height: 1.2;
}

.tournament-summary__main span {
  color: var(--v2-text-main);
  font-size: 14px;
  font-weight: 430;
  line-height: 1.2;
}

.tournament-summary dl {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin: 12px 0 0;
  padding-top: 14px;
  border-top: 1px solid rgba(109, 69, 232, 0.12);
}

.tournament-summary dt,
.tournament-summary dd {
  margin: 0;
}

.tournament-summary dt {
  color: var(--v2-text-sub);
  font-size: 12px;
  font-weight: 430;
  line-height: 1.3;
}

.tournament-summary dd {
  margin-top: 8px;
  color: var(--v2-text-main);
  font-size: 15px;
  font-weight: 520;
  line-height: 1.2;
}

.setup-form {
  display: grid;
  gap: 16px;
}

.setup-card {
  display: grid;
  gap: 12px;
  padding: 16px;
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-lg);
  background: #ffffff;
  box-shadow: 0 6px 18px rgba(28, 18, 60, 0.03);
}

.setup-label {
  color: var(--v2-text-main);
  font-size: 17px;
  font-weight: 560;
  line-height: 1.2;
}

.setup-label em {
  color: var(--v2-text-sub);
  font-size: 13px;
  font-style: normal;
  font-weight: 430;
}

.text-field,
.select-field {
  min-height: 48px;
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-md);
  background: #ffffff;
  color: var(--v2-text-main);
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 12px;
}

.text-field:focus-within,
.select-field:focus {
  border-color: rgba(109, 69, 232, 0.45);
  outline: none;
}

.text-field input {
  min-width: 0;
  flex: 1;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--v2-text-main);
  font: inherit;
  font-size: 18px;
  font-weight: 520;
}

.text-field span {
  flex: 0 0 auto;
  color: var(--v2-text-main);
  font-size: 13px;
  font-weight: 430;
}

.select-field {
  width: 100%;
  justify-content: space-between;
  font: inherit;
  font-size: 16px;
  font-weight: 520;
  text-align: left;
}

.select-field .q-icon {
  color: var(--v2-text-main);
}

.level-list {
  overflow: hidden;
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-md);
  background: #ffffff;
}

.level-list button {
  width: 100%;
  min-height: 42px;
  padding: 0 12px;
  border: 0;
  border-bottom: 1px solid var(--v2-border);
  background: transparent;
  color: var(--v2-text-main);
  display: flex;
  align-items: center;
  justify-content: space-between;
  font: inherit;
  font-size: 14px;
  font-weight: 430;
}

.level-list button:last-child {
  border-bottom: 0;
}

.level-list .q-icon {
  color: var(--v2-primary);
}

.field-help {
  margin: 0;
  color: var(--v2-text-sub);
  font-size: 12px;
  font-weight: 430;
  line-height: 1.45;
}

.setup-submit {
  margin-top: 78px;
}

@media (max-width: 420px) {
  .start-setup-page {
    padding-top: 30px;
  }

  .setup-intro h2 {
    font-size: 24px;
  }

  .setup-submit {
    margin-top: 62px;
  }
}
</style>
