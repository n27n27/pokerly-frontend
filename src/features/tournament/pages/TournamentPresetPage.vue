<template>
  <q-page class="preset-page">
    <header class="preset-topbar">
      <button class="preset-topbar__back" type="button" aria-label="뒤로 가기" @click="goBack">
        <q-icon name="chevron_left" size="28px" />
      </button>
      <span aria-hidden="true"></span>
      <span aria-hidden="true"></span>
    </header>

    <div class="preset-control-row">
      <label class="search-field" :class="{ 'search-field--active': search }">
        <q-icon name="search" size="19px" />
        <input v-model="search" :placeholder="searchPlaceholder" type="search" @focus="handleSearchFocus" />
        <button v-if="search" type="button" aria-label="검색어 지우기" @click="clearSearch">
          <q-icon name="close" size="16px" />
        </button>
      </label>
    </div>

    <section class="preset-list-section">
      <div v-if="listTitle" class="preset-list-section__header">
        <h3>{{ listTitle }}</h3>
      </div>

      <div class="preset-list">
        <button
          v-for="tournament in visibleTournaments"
          :key="tournament.id"
          class="preset-card"
          :class="{ 'preset-card--selected': selectedId === tournament.id }"
          type="button"
          @click="toggleTournamentSelection(tournament.id)"
        >
          <span class="preset-card__content">
            <strong>{{ tournament.name }}</strong>
            <span class="preset-card__meta">
              <span>{{ tournament.venue }}</span>
              <i></i>
              <span>시작 스택</span>
              <b>{{ tournament.stack }}</b>
              <i></i>
              <span>바인 금액</span>
              <b>{{ tournament.buyIn }}</b>
            </span>
          </span>

          <span class="preset-card__check">
            <q-icon v-if="selectedId === tournament.id" name="check" size="17px" />
          </span>
        </button>
      </div>

      <button v-if="viewMode === 'recent'" class="secondary-action" type="button" @click="openAllTournaments">
        <span>
          <q-icon name="grid_view" size="17px" />
          전체 대회 찾기
        </span>
        <q-icon name="chevron_right" size="19px" />
      </button>

      <q-infinite-scroll v-if="viewMode === 'all'" :offset="120" @load="loadMore">
        <template v-if="canLoadMore" #loading>
          <div class="infinite-loader">
            <q-spinner-dots color="primary" size="24px" />
          </div>
        </template>
      </q-infinite-scroll>
    </section>

    <StickyPrimaryAction v-if="selectedId" label="시작하기" @click="startSelectedTournament" />
  </q-page>
</template>

<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import StickyPrimaryAction from 'src/shared/components/StickyPrimaryAction.vue'
import { fetchAllGameSessions } from 'src/api/gameSession'
import { fetchVenues } from 'src/api/venue'
import { tournamentDisplayName } from 'src/utils/tournamentName'

const router = useRouter()
const search = ref('')
const selectedId = ref(null)
const viewMode = ref('recent')
const returnMode = ref('recent')
const page = ref(1)

const tournaments = ref([])
onMounted(async () => {
  const [sessions, venues] = await Promise.all([
    fetchAllGameSessions(),
    fetchVenues(),
  ])
  const venueById = new Map(
    (venues || []).map((venue) => [String(venue.id), venue]),
  )

  tournaments.value = (sessions || [])
    .filter((session) => session.handLogEventId)
    .map((session, index) => ({
      id: session.id,
      name: tournamentDisplayName(session),
      venue:
        venueById.get(String(session.venueId))?.name ||
        session.collabLabel ||
        (session.sessionType === 'VENUE' ? '등록 장소' : '기타'),
      venueLocation: venueById.get(String(session.venueId))?.location || '',
      stack: Number(session.startingStack || 0).toLocaleString('ko-KR') || '-',
      buyIn: Number(session.buyInPerEntry || 0).toLocaleString('ko-KR') || '-',
      recent: index < 5,
    }))
})

const searchPlaceholder = computed(() => {
  if (viewMode.value === 'recent') return '대회명 또는 매장 검색'
  return '매장명 또는 대회명 검색'
})

const listTitle = computed(() => {
  if (viewMode.value === 'search') return '검색 결과'
  if (viewMode.value === 'all') return ''
  return '최근 사용'
})

const recentTournaments = computed(() => tournaments.value.filter((item) => item.recent).slice(0, 5))
const searchResults = computed(() => {
  const keyword = search.value.trim().toLowerCase()
  if (!keyword) return []

  return tournaments.value.filter(
    (item) =>
      item.name.toLowerCase().includes(keyword) ||
      item.venue.toLowerCase().includes(keyword) ||
      item.venueLocation.toLowerCase().includes(keyword),
  )
})

const visibleTournaments = computed(() => {
  if (viewMode.value === 'search') return searchResults.value
  if (viewMode.value === 'all') return tournaments.value.slice(0, page.value * 15)
  return recentTournaments.value
})

const canLoadMore = computed(() => visibleTournaments.value.length < tournaments.value.length)

const scrollToTop = () => {
  nextTick(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    document.scrollingElement?.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    document.querySelector('.q-page-container')?.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  })
}

watch(search, (value) => {
  if (value.trim()) {
    if (viewMode.value !== 'search') returnMode.value = viewMode.value
    viewMode.value = 'search'
    scrollToTop()
    return
  }

  viewMode.value = returnMode.value === 'all' ? 'all' : 'recent'
  scrollToTop()
})

const goBack = () => {
  if (viewMode.value === 'search') {
    search.value = ''
    return
  }

  if (viewMode.value === 'all') {
    page.value = 1
    viewMode.value = 'recent'
    scrollToTop()
    return
  }

  router.back()
}

const handleSearchFocus = () => {
  if (search.value.trim()) viewMode.value = 'search'
}

const clearSearch = () => {
  search.value = ''
}

const openAllTournaments = () => {
  page.value = 1
  search.value = ''
  viewMode.value = 'all'
  scrollToTop()
}

const loadMore = (_index, done) => {
  if (canLoadMore.value) page.value += 1
  done(!canLoadMore.value)
}

const toggleTournamentSelection = (tournamentId) => {
  selectedId.value = selectedId.value === tournamentId ? null : tournamentId
}

const startSelectedTournament = () => {
  if (!selectedId.value) return

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
  gap: 9px;
  min-height: 100%;
  padding:
    var(--v2-page-padding-top)
    var(--v2-page-padding-x)
    calc(180px + env(safe-area-inset-bottom));
}

.preset-topbar {
  display: grid;
  grid-template-columns: 40px minmax(0, 1fr) 40px;
  align-items: center;
  min-height: 28px;
}

.preset-topbar__back {
  width: 30px;
  height: 30px;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--v2-text-main);
  display: grid;
  place-items: center;
}

.preset-control-row {
  display: grid;
  gap: 8px;
}

.search-field {
  min-height: 40px;
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-sm);
  background: #ffffff;
  box-shadow: 0 4px 12px rgba(28, 18, 60, 0.018);
}

.search-field {
  padding: 0 13px;
  color: #9c97ac;
  display: flex;
  align-items: center;
  gap: 9px;
}

.search-field--active {
  border-color: rgba(109, 69, 232, 0.32);
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
  color: #aaa5b8;
}

.search-field button {
  width: 28px;
  height: 28px;
  padding: 0;
  border: 0;
  background: transparent;
  color: #8d8799;
}

.preset-list-section {
  display: grid;
  gap: 12px;
}

.preset-list-section__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.preset-list-section__header h3 {
  margin: 0;
  color: var(--v2-text-sub);
  font-size: 13px;
  font-weight: 520;
  line-height: 1.2;
}

.preset-list {
  overflow: hidden;
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-lg);
  background: #ffffff;
  box-shadow: 0 8px 22px rgba(28, 18, 60, 0.035);
}

.preset-card {
  width: 100%;
  border: 0;
  border-bottom: 1px solid var(--v2-border);
  background: #ffffff;
  color: var(--v2-text-main);
  font: inherit;
  text-align: left;
}

.preset-card:last-child {
  border-bottom: 0;
}

.preset-card {
  position: relative;
  min-height: 76px;
  padding: 13px 12px 13px 14px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 22px;
  align-items: center;
  gap: 12px;
}

.preset-card--selected {
  z-index: 1;
  box-shadow: none;
}

.preset-card__content {
  min-width: 0;
  display: grid;
  gap: 8px;
}

.preset-card__content > strong {
  overflow: hidden;
  color: var(--v2-text-main);
  font-size: 14px;
  font-weight: 560;
  line-height: 1.2;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.preset-card__meta {
  overflow: hidden;
  color: #504a5d;
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 11px;
  font-weight: 430;
  line-height: 1.2;
  white-space: nowrap;
}

.preset-card__meta i {
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: #8d8799;
}

.preset-card__meta b {
  color: var(--v2-text-main);
  font-weight: 500;
}

.preset-card__check {
  display: flex;
  width: 20px;
  height: 20px;
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

.secondary-action {
  width: 100%;
  min-height: 44px;
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-sm);
  background: #ffffff;
  color: var(--v2-text-main);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 14px;
  font: inherit;
  font-size: 13px;
  font-weight: 520;
}

.secondary-action span {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.infinite-loader {
  min-height: 48px;
  display: grid;
  place-items: center;
}

@media (max-width: 420px) {
  .preset-page {
    padding:
      var(--v2-page-padding-top)
      var(--v2-page-padding-x)
      calc(180px + env(safe-area-inset-bottom));
  }

  .preset-card__meta {
    gap: 6px;
  }
}
</style>
