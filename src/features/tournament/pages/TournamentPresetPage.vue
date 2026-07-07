<template>
  <q-page class="preset-page">
    <header class="preset-topbar">
      <button class="preset-topbar__back" type="button" aria-label="뒤로 가기" @click="router.back()">
        <q-icon name="chevron_left" size="28px" />
      </button>
      <h1>등록된 대회</h1>
      <span aria-hidden="true"></span>
    </header>

    <section class="preset-intro">
      <h2>시작할 대회를<br />선택해주세요.</h2>
      <p>등록된 대회 목록입니다.<br />선택한 대회로 바로 시작합니다.</p>
    </section>

    <label class="search-field">
      <q-icon name="search" size="22px" />
      <input v-model="search" placeholder="대회명 또는 매장 검색" type="search" />
    </label>

    <section class="preset-list-section">
      <div class="preset-list-section__header">
        <h3>내 대회 목록</h3>
        <button type="button">
          최근 사용순
          <q-icon name="expand_more" size="20px" />
        </button>
      </div>

      <div class="preset-list">
        <button
          v-for="tournament in filteredTournaments"
          :key="tournament.id"
          class="preset-card"
          :class="{ 'preset-card--selected': selectedId === tournament.id }"
          type="button"
          @click="selectedId = tournament.id"
        >
          <span class="preset-card__content">
            <strong>{{ tournament.name }}</strong>
            <span class="preset-card__venue">
              <q-icon name="storefront" size="15px" />
              {{ tournament.venue }}
            </span>
            <span class="preset-card__meta">
              <span>
                <q-icon name="stacks" size="15px" />
                시작 스택
                <b>{{ tournament.stack }}</b>
              </span>
              <span>
                <q-icon name="currency_exchange" size="15px" />
                바인 금액
                <b>{{ tournament.buyIn }}</b>
              </span>
            </span>
          </span>

          <span class="preset-card__check">
            <q-icon v-if="selectedId === tournament.id" name="check" size="18px" />
          </span>
        </button>
      </div>
    </section>

    <AppButton label="이 대회로 시작" block @click="startSelectedTournament" />

    <p class="preset-info">
      <q-icon name="info" size="18px" />
      대회 정보는 필요할 때 언제든 추가하거나 수정할 수 있습니다.
    </p>
  </q-page>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

import AppButton from 'src/shared/components/AppButton.vue'

const router = useRouter()
const search = ref('')
const selectedId = ref(1)

const tournaments = [
  { id: 1, name: 'Prime Daily', venue: 'Prime', stack: '60,000', buyIn: '100,000' },
  { id: 2, name: 'Royce Daily', venue: 'Royce', stack: '60,000', buyIn: '100,000' },
  { id: 3, name: 'Mango Daily', venue: 'Mango', stack: '60,000', buyIn: '100,000' },
  { id: 4, name: 'Prime Championship', venue: 'Prime', stack: '100,000', buyIn: '200,000' },
  { id: 5, name: 'Ati Daily', venue: 'Ati', stack: '60,000', buyIn: '100,000' },
]

const filteredTournaments = computed(() => {
  const keyword = search.value.trim().toLowerCase()
  if (!keyword) return tournaments

  return tournaments.filter((item) => {
    return item.name.toLowerCase().includes(keyword) || item.venue.toLowerCase().includes(keyword)
  })
})

const startSelectedTournament = () => {
  router.push({
    path: '/app/tournament/start/setup',
    query: { presetId: selectedId.value },
  })
}
</script>

<style scoped>
.preset-page {
  display: grid;
  align-content: start;
  gap: 22px;
  min-height: 100%;
  padding: 34px 20px 112px;
}

.preset-topbar {
  display: grid;
  grid-template-columns: 40px minmax(0, 1fr) 40px;
  align-items: center;
  min-height: 36px;
}

.preset-topbar__back {
  width: 36px;
  height: 36px;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--v2-text-main);
}

.preset-topbar h1 {
  margin: 0;
  color: var(--v2-text-main);
  font-size: 17px;
  font-weight: 560;
  line-height: 1.2;
  text-align: center;
}

.preset-intro h2 {
  margin: 20px 0 18px;
  color: var(--v2-text-main);
  font-size: 26px;
  font-weight: 560;
  line-height: 1.32;
  letter-spacing: 0;
}

.preset-intro p {
  margin: 0;
  color: var(--v2-text-main);
  font-size: 14px;
  font-weight: 430;
  line-height: 1.6;
}

.search-field {
  min-height: 46px;
  padding: 0 14px;
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-md);
  background: #ffffff;
  display: flex;
  align-items: center;
  gap: 10px;
}

.search-field .q-icon {
  color: #9c97ac;
}

.search-field input {
  min-width: 0;
  flex: 1;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--v2-text-main);
  font: inherit;
  font-size: 14px;
}

.search-field input::placeholder {
  color: #aaa5b8;
}

.preset-list-section {
  display: grid;
  gap: 14px;
}

.preset-list-section__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.preset-list-section__header h3 {
  margin: 0;
  color: var(--v2-text-main);
  font-size: 17px;
  font-weight: 560;
  line-height: 1.2;
}

.preset-list-section__header button {
  min-height: 32px;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--v2-text-main);
  display: inline-flex;
  align-items: center;
  gap: 2px;
  font: inherit;
  font-size: 13px;
  font-weight: 430;
}

.preset-list {
  display: grid;
  gap: 12px;
}

.preset-card {
  width: 100%;
  min-height: 110px;
  padding: 16px;
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-lg);
  background: #ffffff;
  box-shadow: 0 6px 18px rgba(28, 18, 60, 0.03);
  color: var(--v2-text-main);
  display: grid;
  grid-template-columns: minmax(0, 1fr) 24px;
  gap: 12px;
  text-align: left;
}

.preset-card--selected {
  border-color: var(--v2-primary);
  box-shadow: 0 8px 20px rgba(109, 69, 232, 0.08);
}

.preset-card__content {
  display: grid;
  gap: 10px;
  min-width: 0;
}

.preset-card__content > strong {
  color: var(--v2-text-main);
  font-size: 16px;
  font-weight: 560;
  line-height: 1.2;
}

.preset-card__venue,
.preset-card__meta,
.preset-card__meta span {
  display: flex;
  align-items: center;
}

.preset-card__venue {
  gap: 8px;
  color: #363147;
  font-size: 13px;
  font-weight: 430;
}

.preset-card__meta {
  flex-wrap: wrap;
  gap: 10px 24px;
  color: #363147;
  font-size: 13px;
  font-weight: 430;
}

.preset-card__meta span {
  gap: 6px;
}

.preset-card__meta b {
  margin-left: 4px;
  color: var(--v2-text-main);
  font-weight: 500;
}

.preset-card__venue .q-icon,
.preset-card__meta .q-icon {
  color: #4d4760;
}

.preset-card__check {
  display: flex;
  width: 22px;
  height: 22px;
  align-items: center;
  justify-content: center;
  border: 1px solid #d9d5e6;
  border-radius: 50%;
  color: #ffffff;
}

.preset-card--selected .preset-card__check {
  border-color: var(--v2-primary);
  background: var(--v2-primary);
}

.preset-info {
  margin: 0;
  color: var(--v2-text-sub);
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 12px;
  font-weight: 430;
  line-height: 1.45;
}

.preset-info .q-icon {
  flex: 0 0 auto;
  color: #9c97ac;
}

@media (max-width: 420px) {
  .preset-page {
    padding-top: 30px;
  }

  .preset-intro h2 {
    font-size: 24px;
  }

  .preset-card {
    min-height: 104px;
    padding: 14px;
  }

  .preset-card__meta {
    gap: 8px 18px;
    font-size: 12px;
  }
}
</style>
