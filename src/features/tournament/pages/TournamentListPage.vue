<template>
  <q-page class="tournament-list-page">
    <header class="list-topbar">
      <button class="list-topbar__back" type="button" aria-label="뒤로 가기" @click="router.back()">
        <q-icon name="chevron_left" size="28px" />
      </button>
      <h1>전체 토너먼트</h1>
      <span aria-hidden="true"></span>
    </header>

    <div class="control-row">
      <label class="search-field">
        <q-icon name="search" size="18px" />
        <input v-model="search" placeholder="검색" type="search" />
      </label>

      <button class="filter-button" type="button">
        매장 전체
        <q-icon name="expand_more" size="18px" />
      </button>
      <button class="filter-button filter-button--sort" type="button">
        최신순
        <q-icon name="expand_more" size="18px" />
      </button>
    </div>

    <section class="tournament-section">
      <h2>토너먼트 목록</h2>

      <div class="tournament-card">
        <button
          v-for="tournament in filteredTournaments"
          :key="tournament.id"
          class="tournament-row"
          type="button"
          @click="openTournament(tournament.id)"
        >
          <span class="tournament-row__main">
            <strong>{{ tournament.title }}</strong>
            <span>{{ tournament.date }}</span>
          </span>

          <span v-if="tournament.badge" class="tournament-row__badge" :class="`tournament-row__badge--${tournament.tone}`">
            {{ tournament.badge }}
          </span>

          <q-icon class="tournament-row__arrow" name="chevron_right" size="24px" />
        </button>
      </div>
    </section>
  </q-page>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const search = ref('')

const tournaments = [
  { id: 'prime-0702', title: '프라임 0702', date: '2025.07.02', badge: '완료', tone: 'success' },
  { id: 'mango-0630', title: 'Mango 2nd', date: '2024.06.30', badge: '탈락', tone: 'default' },
  { id: 'kiki-3000-gtd', title: 'KIKI 3000 GTD', date: '2024.06.29', badge: 'Bubble', tone: 'default' },
  { id: 'royce-championship', title: '로이스 챔피언십', date: '2024.06.28', badge: '완료', tone: 'success' },
  { id: 'tt-masters-2500', title: 'TT 마스터즈 2500 GTD', date: '2024.06.27', badge: '탈락', tone: 'default' },
  { id: 'prime-0626', title: '프라임 0626', date: '2024.06.26', badge: '완료', tone: 'success' },
  { id: 'mango-deepstack', title: 'Mango Deepstack', date: '2024.06.25', badge: '탈락', tone: 'default' },
  { id: 'kiki-championship-0715', title: 'KIKI 챔피언십 0715', date: '2024.06.24', badge: '탈락', tone: 'default' },
]

const filteredTournaments = computed(() => {
  const keyword = search.value.trim().toLowerCase()
  if (!keyword) return tournaments

  return tournaments.filter((item) => {
    return item.title.toLowerCase().includes(keyword) || item.date.includes(keyword)
  })
})

const openTournament = (id) => {
  router.push(`/app/tournament/${id}/summary`)
}
</script>

<style scoped>
.tournament-list-page {
  display: grid;
  align-content: start;
  gap: 18px;
  min-height: 100%;
  padding: var(--v2-page-padding-top) var(--v2-page-padding-x) 112px;
}

.list-topbar {
  display: grid;
  grid-template-columns: 40px minmax(0, 1fr) 40px;
  align-items: start;
  min-height: 36px;
}

.list-topbar__back {
  width: 36px;
  height: 36px;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--v2-text-main);
}

.list-topbar h1 {
  margin: 0;
  color: var(--v2-text-main);
  font-size: 17px;
  font-weight: 560;
  line-height: 1.2;
  text-align: center;
}

.control-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto auto;
  align-items: center;
  gap: 8px;
}

.filter-button,
.search-field {
  min-height: 40px;
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-sm);
  background: #ffffff;
  color: var(--v2-text-main);
  box-shadow: 0 4px 12px rgba(28, 18, 60, 0.018);
}

.filter-button {
  min-width: 100px;
  padding: 0 9px 0 11px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  font: inherit;
  font-size: 12px;
  font-weight: 520;
  white-space: nowrap;
}

.filter-button--sort {
  min-width: 76px;
}

.search-field {
  min-width: 0;
  padding: 0 11px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #8d8799;
}

.search-field input {
  min-width: 0;
  flex: 1;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--v2-text-main);
  font: inherit;
  font-size: 13px;
  font-weight: 430;
}

.search-field input::placeholder {
  color: #a8a2b4;
}

.tournament-section {
  display: grid;
  gap: 12px;
}

.tournament-section h2 {
  margin: 4px 0 0;
  color: var(--v2-text-sub);
  font-size: 13px;
  font-weight: 520;
  line-height: 1.2;
}

.tournament-card {
  overflow: hidden;
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-lg);
  background: #ffffff;
  box-shadow: 0 8px 22px rgba(28, 18, 60, 0.035);
}

.tournament-row {
  width: 100%;
  min-height: 74px;
  padding: 0 17px 0 18px;
  border: 0;
  border-bottom: 1px solid var(--v2-border);
  background: #ffffff;
  color: var(--v2-text-main);
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto 24px;
  align-items: center;
  gap: 12px;
  font: inherit;
  text-align: left;
}

.tournament-row:last-child {
  border-bottom: 0;
}

.tournament-row__main {
  min-width: 0;
  display: grid;
  gap: 8px;
}

.tournament-row__main strong {
  overflow: hidden;
  color: var(--v2-text-main);
  font-size: 16px;
  font-weight: 560;
  line-height: 1.15;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tournament-row__main span {
  color: var(--v2-text-sub);
  font-size: 14px;
  font-weight: 430;
  line-height: 1;
}

.tournament-row__badge {
  padding: 7px 10px;
  border-radius: var(--v2-radius-sm);
  color: #383241;
  background: #f2f0f7;
  font-size: 12px;
  font-weight: 520;
  line-height: 1;
  white-space: nowrap;
}

.tournament-row__badge--success {
  color: #15803d;
  background: rgba(22, 163, 74, 0.14);
}

.tournament-row__arrow {
  color: #777188;
}

@media (max-width: 420px) {
  .tournament-list-page {
    padding: var(--v2-page-padding-top) var(--v2-page-padding-x) 112px;
  }

  .control-row {
    gap: 7px;
  }

  .filter-button {
    min-width: 90px;
    padding: 0 8px;
  }

  .filter-button--sort {
    min-width: 70px;
  }

  .tournament-row {
    padding: 0 15px 0 16px;
  }
}
</style>
