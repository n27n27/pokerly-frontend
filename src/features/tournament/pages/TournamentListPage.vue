<template>
  <q-page class="tournament-list-page" @click="venueMenuOpen = false">
    <header class="list-topbar">
      <button class="list-topbar__back" type="button" aria-label="뒤로 가기" @click="goBack">
        <q-icon name="chevron_left" size="28px" />
      </button>
      <h1>전체 토너먼트</h1>
      <span aria-hidden="true"></span>
    </header>

    <div class="control-row">
      <label class="search-field">
        <q-icon name="search" size="18px" />
        <input v-model="search" placeholder="대회명 검색" type="search" />
      </label>

      <div class="venue-filter">
        <button class="filter-button" type="button" @click.stop="venueMenuOpen = !venueMenuOpen">
          {{ selectedVenueLabel }}
          <q-icon name="expand_more" size="18px" />
        </button>
        <div v-if="venueMenuOpen" class="venue-menu" @click.stop>
          <button type="button" :class="{ selected: selectedVenue === 'all' }" @click="selectVenue('all')">
            매장 전체
          </button>
          <button
            v-for="venue in venues"
            :key="venue.id"
            type="button"
            :class="{ selected: selectedVenue === String(venue.id) }"
            @click="selectVenue(String(venue.id))"
          >
            {{ venue.name }}
          </button>
          <button type="button" :class="{ selected: selectedVenue === 'other' }" @click="selectVenue('other')">
            기타
          </button>
        </div>
      </div>
      <button class="filter-button filter-button--sort" type="button" @click="toggleSort">
        {{ sortOrder === 'desc' ? '최신순' : '오래된순' }}
        <q-icon name="swap_vert" size="17px" />
      </button>
    </div>

    <section class="tournament-section">
      <h2>토너먼트 목록</h2>

      <div class="tournament-card">
        <div v-if="filteredTournaments.length === 0" class="tournament-empty">
          조건에 맞는 토너먼트가 없습니다.
        </div>
        <button
          v-for="tournament in filteredTournaments"
          :key="tournament.key"
          class="tournament-row"
          type="button"
          @click="openTournament(tournament)"
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
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { fetchAllGameSessions } from 'src/api/gameSession'
import { fetchHandLogEvents } from 'src/api/handLogApi'
import { fetchVenues } from 'src/api/venue'
import { tournamentDisplayName } from 'src/utils/tournamentName'

const router = useRouter()
const route = useRoute()
const search = ref('')
const venues = ref([])
const isStatisticsEvidence = route.query.from === 'statistics'
const statisticsVenueId = String(route.query.venueId || '').trim()
const selectedVenue = ref(
  isStatisticsEvidence && statisticsVenueId ? statisticsVenueId : 'all',
)
const venueMenuOpen = ref(false)
const sortOrder = ref('desc')

const tournaments = ref([])
const labels = { BUST: '탈락', BUBBLE: 'Bubble', ITM: 'ITM', CHOP: '찹', WIN: '우승' }

const fetchAllLegacyEvents = async () => {
  const events = []
  let page = 0
  let hasNext = true
  while (hasNext && page < 100) {
    const response = await fetchHandLogEvents({ page, size: 100 })
    events.push(...(Array.isArray(response?.content) ? response.content : []))
    hasNext = Boolean(response?.hasNext)
    page += 1
  }
  return events
}

onMounted(async () => {
  const [sessions, venueItems] = await Promise.all([
    fetchAllGameSessions(),
    fetchVenues(),
  ])
  venues.value = venueItems || []
  const venueById = new Map(venues.value.map((venue) => [String(venue.id), venue.name]))
  const completedSessions = (sessions || [])
    .filter((session) => session.tournamentStatus !== 'RUNNING')

  const buildSessionItems = (eventById = new Map()) =>
    completedSessions.map((session) => {
      const venueName =
        venueById.get(String(session.venueId)) ||
        session.collabLabel ||
        '기타'
      const isSimpleRecord = !session.handLogEventId
      const result = session.tournamentResult || (Number(session.prize || 0) > 0 ? 'ITM' : 'BUST')
      const linkedEventName = eventById.get(String(session.handLogEventId))?.name
      const tournamentName = session.tournamentName || linkedEventName

      return {
        key: `session-${session.id}`,
        id: session.id,
        source: isSimpleRecord ? 'simple-record' : 'session',
        title: tournamentName
          ? tournamentDisplayName(tournamentName)
          : `${venueName} 간편 기록`,
        date: session.playDate?.replaceAll('-', '.') || '-',
        rawDate: session.playDate || '',
        venueId: session.venueId == null ? null : String(session.venueId),
        venueName,
        badge: labels[result] || '완료',
        tone: String(result || 'default').toLowerCase(),
      }
    })

  // 신규 데이터는 세션에 표시 정보가 모두 있으므로 느린 레거시 이벤트 조회를 생략한다.
  tournaments.value = buildSessionItems()
  const needsLegacyEvents = completedSessions.some((session) =>
    (!session.handLogEventId && !session.tournamentName && !session.tournamentResult)
    || (session.handLogEventId && !session.tournamentName),
  )
  if (!needsLegacyEvents) return

  const legacyEvents = await fetchAllLegacyEvents()
  const eventById = new Map((legacyEvents || []).map((event) => [String(event.id), event]))
  const linkedEventIds = new Set(
    (sessions || []).map((session) => session.handLogEventId).filter(Boolean).map(String),
  )
  const legacyItems = (legacyEvents || [])
    .filter((event) => !linkedEventIds.has(String(event.id)))
    .map((event) => {
      const rawDate = event.date || String(event.eventAt || event.createdAt || '').slice(0, 10)
      return {
        key: `event-${event.id}`,
        id: event.id,
        source: 'event',
        title: String(event.name || '').trim() || '이름 없는 토너먼트',
        date: rawDate ? rawDate.replaceAll('-', '.') : '-',
        rawDate,
        venueId: null,
        venueName: '기타',
        badge: '',
        tone: 'default',
      }
    })

  tournaments.value = [...buildSessionItems(eventById), ...legacyItems]
})

const selectedVenueLabel = computed(() => {
  if (selectedVenue.value === 'all') return '매장 전체'
  if (selectedVenue.value === 'other') return '기타'
  return venues.value.find((venue) => String(venue.id) === selectedVenue.value)?.name || '매장 전체'
})

const filteredTournaments = computed(() => {
  const keyword = search.value.trim().toLowerCase()
  const statisticsMonth = `${route.query.year}-${String(route.query.month || '').padStart(2, '0')}`
  const shouldFilterStatisticsMonth =
    isStatisticsEvidence
    && route.query.allPeriod !== '1'
    && /^\d{4}-\d{2}$/.test(statisticsMonth)

  return tournaments.value
    .filter((item) => !keyword || item.title.toLowerCase().includes(keyword))
    .filter((item) => !shouldFilterStatisticsMonth || item.rawDate.startsWith(statisticsMonth))
    .filter((item) => {
      if (selectedVenue.value === 'all') return true
      if (selectedVenue.value === 'other') return item.venueId == null
      return item.venueId === selectedVenue.value
    })
    .sort((a, b) => {
      const dateCompare = String(a.rawDate).localeCompare(String(b.rawDate))
      const idCompare = Number(a.id || 0) - Number(b.id || 0)
      return sortOrder.value === 'desc'
        ? -(dateCompare || idCompare)
        : dateCompare || idCompare
    })
})

const selectVenue = (venueId) => {
  selectedVenue.value = venueId
  venueMenuOpen.value = false
}
const toggleSort = () => {
  sortOrder.value = sortOrder.value === 'desc' ? 'asc' : 'desc'
}

const statisticsRoute = () => ({
  name: 'statistics',
  query: {
    year: route.query.year,
    month: route.query.month,
    allPeriod: route.query.allPeriod,
    venueId: route.query.venueId,
    venueName: route.query.venueName,
  },
})
const goBack = () => {
  if (route.query.from === 'statistics') {
    void router.replace(statisticsRoute())
    return
  }
  router.back()
}

const openTournament = (tournament) => {
  const returnQuery = route.query.from === 'statistics'
    ? {
        from: 'statistics',
        year: route.query.year,
        month: route.query.month,
        allPeriod: route.query.allPeriod,
        venueId: route.query.venueId,
        venueName: route.query.venueName,
      }
    : { from: 'tournaments' }
  if (tournament.source === 'event') {
    router.push({
      name: 'tournament-summary',
      params: { tournamentId: `event-${tournament.id}` },
      query: { legacyEventId: tournament.id, ...returnQuery },
    })
    return
  }
  if (tournament.source === 'simple-record') {
    router.push({
      name: 'simple-record',
      query: { recordId: tournament.id },
    })
    return
  }
  router.push({
    name: 'tournament-summary',
    params: { tournamentId: tournament.id },
    query: returnQuery,
  })
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
  align-items: center;
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
  font-size: 21px;
  font-weight: 650;
  line-height: 36px;
  text-align: center;
}

.control-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 90px 90px;
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
  width: 100%;
  min-width: 0;
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
  min-width: 0;
}

.venue-filter {
  position: relative;
}

.venue-menu {
  position: absolute;
  z-index: 10;
  top: calc(100% + 7px);
  right: 0;
  width: max(142px, 100%);
  max-height: 260px;
  overflow-y: auto;
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-md);
  background: #fff;
  box-shadow: 0 12px 28px rgba(28, 18, 60, .14);
}

.venue-menu button {
  display: flex;
  width: 100%;
  min-height: 42px;
  align-items: center;
  padding: 0 13px;
  border: 0;
  border-bottom: 1px solid var(--v2-border);
  background: #fff;
  color: var(--v2-text-main);
  font: inherit;
  font-size: 12px;
  text-align: left;
}

.venue-menu button:last-child {
  border-bottom: 0;
}

.venue-menu button.selected {
  background: var(--v2-primary-soft);
  color: var(--v2-primary);
  font-weight: 600;
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

.tournament-empty {
  display: grid;
  min-height: 108px;
  place-items: center;
  padding: 20px;
  color: var(--v2-text-sub);
  font-size: 13px;
  text-align: center;
}

.tournament-row {
  width: 100%;
  min-height: 68px;
  padding: 0 17px 0 18px;
  border: 0;
  border-bottom: 1px solid var(--v2-border);
  background: #ffffff;
  color: var(--v2-text-main);
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto 24px;
  align-items: center;
  gap: 10px;
  font: inherit;
  text-align: left;
}

.tournament-row:last-child {
  border-bottom: 0;
}

.tournament-row__main {
  min-width: 0;
  display: grid;
  gap: 6px;
}

.tournament-row__main strong {
  overflow: hidden;
  color: var(--v2-text-main);
  font-size: 14px;
  font-weight: 570;
  line-height: 1.2;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tournament-row__main span {
  color: var(--v2-text-sub);
  font-size: 12px;
  font-weight: 430;
  line-height: 1;
}

.tournament-row__badge {
  grid-column: 2;
  display: inline-flex;
  align-items: center;
  padding: 5px 8px;
  border-radius: 999px;
  color: #5f5969;
  background: #f6f5f8;
  font-size: 11px;
  font-weight: 600;
  line-height: 1;
  white-space: nowrap;
  border: 0;
}

.tournament-row__badge--bust,
.tournament-row__badge--default {
  color: #6b6475;
  background: #f5f4f6;
}

.tournament-row__badge--bubble {
  color: #a16207;
  background: #fbf8ef;
}

.tournament-row__badge--itm {
  color: #6552b8;
  background: #f4f2fb;
}

.tournament-row__badge--chop {
  color: #287b91;
  background: #f0f7f8;
}

.tournament-row__badge--win {
  color: #9a6a10;
  background: #faf6e9;
}

.tournament-row__arrow {
  grid-column: 3;
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
    min-width: 0;
    padding: 0 8px;
  }

  .filter-button--sort {
    min-width: 0;
  }

  .tournament-row {
    padding: 0 15px 0 16px;
  }
}
</style>
