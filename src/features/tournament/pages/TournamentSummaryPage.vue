<template>
  <q-page class="summary-page" @click="menuOpen = false">
    <header class="topbar">
      <button type="button" aria-label="뒤로 가기" @click="router.back()"><q-icon name="chevron_left" size="30px" /></button>
      <h1>{{ eventId ? '대회 요약' : '기록 상세' }}</h1>
      <button type="button" aria-label="대회 메뉴" @click.stop="menuOpen = !menuOpen"><q-icon name="more_vert" size="22px" /></button>
      <div v-if="menuOpen" class="page-menu" @click.stop>
        <template v-if="eventId">
          <button type="button" @click="copyTournamentText">텍스트 복사</button>
          <button v-if="!legacyEventId" type="button" @click="editTournament">토너먼트 결과 수정</button>
          <button v-if="!legacyEventId" type="button" @click="resumeTournament">토너먼트 재개</button>
        </template>
        <button v-else type="button" @click="editBankRecord">기록 수정</button>
      </div>
    </header>

    <section class="title-row"><h2>{{ tournamentDisplayName(result) }}</h2><time>{{ result.playDate || '-' }}</time></section>

    <section v-if="resultMetrics.length" class="result-card">
      <div v-for="metric in resultMetrics" :key="metric.label">
        <span>{{ metric.label }}</span>
        <strong :class="{ primary: metric.primary }">
          <i v-if="metric.icon"><q-icon :name="metric.icon" size="16px" /></i>
          {{ metric.value }}
        </strong>
      </div>
    </section>

    <section v-if="!eventId" class="legacy-summary-note">
      <span aria-hidden="true"><q-icon name="info" size="20px" /></span>
      <p><strong>기본 결과만 기록된 세션이에요</strong><small>핸드와 레벨을 기록하지 않아 상세 분석은 표시되지 않습니다.</small></p>
    </section>

    <section v-if="eventId" class="content-section">
      <div class="section-head"><h2>기록 핸드</h2><button v-if="hands.length" type="button" @click="goReviewHands">전체 보기 <q-icon name="chevron_right" size="17px" /></button></div>
      <div v-if="hands.length" class="hand-grid">
        <button v-for="hand in hands" :key="hand.id" type="button" @click="openHand(hand)">
          <strong>{{ hand.name }}</strong><span>{{ hand.level }} · <b :class="hand.tone">{{ hand.result }}</b></span>
        </button>
      </div>
      <div v-else class="section-empty">기록된 핸드가 없습니다.</div>
    </section>

    <section v-if="eventId" class="content-section">
      <div class="section-head"><h2>레벨별 요약</h2></div>
      <div v-if="levels.length" class="level-table">
        <div class="table-head"><span>레벨</span><span>스택</span><span>스택 변화</span><span></span></div>
        <button v-for="level in levels" :key="level.name" type="button" @click="openLevel(level.name)">
          <strong>{{ level.name }}</strong><span>{{ level.stack }}</span><span :class="level.tone">{{ level.change }}</span><q-icon name="chevron_right" size="18px" />
        </button>
      </div>
      <div v-else class="section-empty">기록된 레벨이 없습니다.</div>
    </section>

    <section v-if="tournamentHands.length" class="content-section">
      <div class="rank-distribution__heading">
        <h2>순위 구간 분포</h2>
        <span>169개 스타팅 핸드 기준</span>
      </div>
      <div class="rank-distribution__card">
        <div class="rank-meter" aria-hidden="true">
          <span
            v-for="bucket in rankDistribution.buckets"
            :key="bucket.key"
            :class="`rank-tone--${bucket.tone}`"
            :style="{ width: `${bucket.percent}%` }"
          ></span>
        </div>
        <div class="rank-distribution__list">
          <div v-for="bucket in rankDistribution.buckets" :key="bucket.key">
            <i :class="`rank-tone--${bucket.tone}`"></i>
            <span>
              <strong>{{ bucket.label }}</strong>
              <small>{{ bucket.description }}</small>
            </span>
            <b>{{ bucket.count }}개</b>
            <em>{{ bucket.percent }}%</em>
          </div>
        </div>
      </div>
    </section>

    <section v-if="tournamentHands.length" class="content-section">
      <div class="section-head"><h2>프리플랍 분석</h2></div>
      <div class="stats-list">
        <button type="button" @click="goStats">
          <i><q-icon name="style" size="19px" /></i>
          <span><strong>VPIP 23% · PFR 17% · 3Bet 8%</strong></span>
          <b>상세 보기 <q-icon name="chevron_right" size="16px" /></b>
        </button>
      </div>
    </section>

    <section v-if="tournamentHands.length" class="content-section">
      <div class="section-head"><h2>주요 핸드</h2></div>
      <div class="major-hands">
        <article v-for="group in majorHandGroups" :key="group.key">
          <header>
            <span><strong>{{ group.label }}</strong><small>{{ group.description }}</small></span>
            <b>{{ group.count }}개</b>
          </header>
          <div v-if="group.items.length" class="major-hand-chips">
            <button
              v-for="item in group.items"
              :key="item.name"
              type="button"
              :class="{ active: selectedMajorHand === `${group.key}:${item.name}` }"
              @click="toggleMajorHand(group.key, item.name)"
            >
              {{ item.name }} <small>×{{ item.hands.length }}</small>
            </button>
          </div>
          <p v-else>기록 없음</p>
          <div
            v-if="selectedMajorHand.startsWith(`${group.key}:`)"
            class="major-hand-details"
          >
            <button
              v-for="hand in selectedMajorHands(group)"
              :key="hand.id"
              type="button"
              @click="openHand(hand)"
            >
              <strong>{{ hand.level }} · {{ hand.name }}</strong>
              <span>{{ hand.position }} · {{ hand.action }} · {{ hand.result }}</span>
            </button>
          </div>
        </article>
      </div>
    </section>

    <section v-if="eventId" class="content-section">
      <div class="section-head"><h2>대회 메모</h2></div>
      <div class="memo-box">
        <p :class="{ empty: !tournamentMemo }">
          {{ tournamentMemo || '작성된 메모가 없습니다.' }}
        </p>
      </div>
    </section>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { copyToClipboard } from 'quasar'

import { useAlert } from 'src/composables/useAlert'
import { useHandLogStore } from 'src/stores/handLog'
import { createStartingHandRunSummary } from 'src/utils/handLogHandAnalysis'
import { tournamentDisplayName } from 'src/utils/tournamentName'
import { buildEventReviewText } from 'src/utils/handLogExportText'
import { fetchTournamentSeats } from 'src/api/tournamentParticipant'
import {
  fetchGameSession,
  fetchRunningGameSession,
  updateGameSession,
} from 'src/api/gameSession'

const router = useRouter()
const route = useRoute()
const alert = useAlert()
const handLogStore = useHandLogStore()
const menuOpen = ref(false)
const selectedMajorHand = ref('')
const tournamentSeats = ref([])
const tournamentId = route.params.tournamentId || '1'
const legacyEventId = computed(() => route.query.legacyEventId || null)
const runningTournament = (() => {
  try {
    return JSON.parse(localStorage.getItem('pokerly-running-tournament')) || {}
  } catch {
    return {}
  }
})()
const session = ref(null)
const eventId = computed(() => legacyEventId.value || session.value?.handLogEventId || runningTournament.eventId)
const event = computed(() => handLogStore.selectedEvent)
const cachedResult = (() => {
  try {
    return JSON.parse(localStorage.getItem('pokerly-last-tournament-result')) || {}
  } catch {
    return {}
  }
})()
const result = computed(() => {
  if (session.value) {
    return {
      ...session.value,
      tournamentName: session.value.tournamentName || event.value?.name,
    }
  }
  if (legacyEventId.value && event.value) {
    return {
      tournamentName: event.value.name,
      playDate: event.value.date || String(event.value.eventAt || event.value.createdAt || '').slice(0, 10),
    }
  }
  return cachedResult
})
const tournamentMemo = computed(() =>
  String(result.value?.notes || result.value?.memo || '').trim(),
)
const resultLabel = computed(
  () =>
    ({
      BUST: '탈락',
      BUBBLE: 'Bubble',
      ITM: 'ITM',
      CHOP: '찹',
      WIN: '우승',
    })[result.value.tournamentResult] || '-',
)
const resultIcon = computed(
  () =>
    ({
      BUST: 'cancel',
      BUBBLE: 'bubble_chart',
      ITM: 'workspace_premium',
      CHOP: 'handshake',
      WIN: 'emoji_events',
    })[result.value.tournamentResult] || '',
)
const totalBuyIn = computed(() => {
  const stored = Number(result.value?.totalBuyIn)
  if (Number.isFinite(stored) && stored > 0) return stored
  const perEntry = Number(result.value?.buyInPerEntry) || 0
  const entries = Math.max(1, Number(result.value?.entries) || 1)
  return Math.max(0, perEntry * entries - (Number(result.value?.discount) || 0))
})
const resultMetrics = computed(() => {
  const current = result.value || {}
  const metrics = []

  if (current.tournamentResult) {
    metrics.push({ label: '최종 결과', value: resultLabel.value, icon: resultIcon.value, primary: true })
  }
  if (Number(current.finalRank) > 0) {
    metrics.push({ label: '최종 순위', value: `${current.finalRank}위` })
  }
  if (current.prize != null) {
    metrics.push({ label: '총 상금', value: Number(current.prize || 0).toLocaleString('ko-KR') })
  }
  if (totalBuyIn.value > 0) {
    metrics.push({ label: '총 바인', value: totalBuyIn.value.toLocaleString('ko-KR') })
  }
  if (Number(current.entries) > 0) {
    metrics.push({ label: '참가', value: `${current.entries}회` })
  }
  if (current.satelliteAwarded) {
    metrics.push({ label: '새틀 획득', value: current.satelliteName?.trim() || '획득', primary: true })
  }

  return metrics
})

const handName = (hand) => {
  const stored = String(hand.holeCards || hand.hand || '').trim()
  if (stored) return stored

  const ranks = [hand.firstRank, hand.secondRank].filter(Boolean)
  if (ranks.length !== 2) return '-'
  if (ranks[0] === ranks[1]) return ranks.join('')
  return `${ranks.join('')}${hand.suited ? 's' : 'o'}`
}

const handResult = (hand) => {
  const value = hand.resultType || hand.result
  if (['SHOWDOWN_WIN', 'NON_SHOWDOWN_WIN', 'WIN'].includes(value)) {
    return { result: '승리', tone: 'win' }
  }
  if (['CHOP', 'DRAW'].includes(value)) return { result: '찹', tone: 'draw' }
  if (['SHOWDOWN_LOSS', 'PREFLOP_FOLD', 'POSTFLOP_FOLD', 'LOSS', 'FOLD'].includes(value)) {
    return { result: '패배', tone: 'lose' }
  }
  return { result: '미기록', tone: '' }
}

const hands = computed(() =>
  (event.value?.blindLevels || [])
    .flatMap((level) =>
      (level.hands || [])
        .map((hand) => ({
          id: hand.id,
          levelId: level.id,
          level: `L${level.levelNo}`,
          name: handName(hand),
          reviewRequired: Boolean(hand.reviewRequired),
          ...handResult(hand),
        })),
    )
    .sort((a, b) => Number(b.reviewRequired) - Number(a.reviewRequired))
    .slice(0, 4),
)

const normalizeHandName = (hand) => {
  const ranks =
    [hand.firstRank, hand.secondRank].filter(Boolean).length === 2
      ? [hand.firstRank, hand.secondRank]
      : String(hand.holeCards || hand.hand || '').match(/10|[AKQJT2-9]/gi)?.slice(0, 2) || []
  if (ranks.length !== 2) return ''

  const normalized = ranks.map((rank) =>
    String(rank).toUpperCase() === '10' ? 'T' : String(rank).toUpperCase(),
  )
  if (normalized[0] === normalized[1]) return normalized.join('')

  const order = 'AKQJT98765432'
  normalized.sort((a, b) => order.indexOf(a) - order.indexOf(b))
  const raw = String(hand.holeCards || hand.hand || '')
  const suffix = /s$/i.test(raw) || hand.suited === true ? 's' : /o$/i.test(raw) ? 'o' : ''
  return `${normalized.join('')}${suffix}`
}

const actionLabel = (hand) =>
  ({
    FOLD: '폴드',
    CHECK: '체크',
    CALL: '콜',
    WALK: '앞에서 올폴드',
    LIMP: '림프',
    OPEN: '오픈',
    THREE_BET: '3벳',
    THREE_BET_PLUS: '3벳+',
    FOUR_BET_PLUS: '4벳+',
  })[hand.actionType || hand.preflopAction] ||
  hand.actionLabel ||
  '-'

const tournamentHands = computed(() =>
  (event.value?.blindLevels || []).flatMap((level) =>
    (level.hands || []).map((hand) => ({
      ...hand,
      levelId: level.id,
      level: `L${level.levelNo}`,
      name: normalizeHandName(hand),
      position: hand.position || '-',
      action: actionLabel(hand),
      ...handResult(hand),
    })),
  ),
)
const rankDistribution = computed(() => createStartingHandRunSummary(tournamentHands.value))

const groupMajorHands = (matcher) => {
  const grouped = new Map()
  tournamentHands.value.forEach((hand) => {
    if (!hand.name || !matcher(hand.name)) return
    if (!grouped.has(hand.name)) grouped.set(hand.name, [])
    grouped.get(hand.name).push(hand)
  })
  return [...grouped.entries()].map(([name, groupedHands]) => ({
    name,
    hands: groupedHands,
  }))
}

const majorHandGroups = computed(() => {
  const premium = groupMajorHands((name) =>
    ['AA', 'KK', 'QQ', 'JJ', 'TT', 'AKs', 'AKo', 'AK', 'AQs'].includes(name),
  )
  const strongHands = groupMajorHands((name) =>
    ['99', '88', '77', 'AJs', 'AQs', 'AKs', 'AQo', 'AKo', 'AQ', 'AK', 'KQs'].includes(name),
  )
  const pocketPairs = groupMajorHands((name) => name.length === 2 && name[0] === name[1])
  return [
    {
      key: 'premium',
      label: '프리미엄',
      description: 'AA~TT, AK, AQs',
      items: premium,
      count: premium.reduce((sum, item) => sum + item.hands.length, 0),
    },
    {
      key: 'strong',
      label: '강한 핸드',
      description: '99~77, AJs+, AQo+, KQs',
      items: strongHands,
      count: strongHands.reduce((sum, item) => sum + item.hands.length, 0),
    },
    {
      key: 'pocket-pair',
      label: '포켓 페어',
      description: 'AA~22',
      items: pocketPairs,
      count: pocketPairs.reduce((sum, item) => sum + item.hands.length, 0),
    },
  ]
})

const toggleMajorHand = (groupKey, handNameValue) => {
  const key = `${groupKey}:${handNameValue}`
  selectedMajorHand.value = selectedMajorHand.value === key ? '' : key
}

const selectedMajorHands = (group) => {
  const name = selectedMajorHand.value.split(':')[1]
  return group.items.find((item) => item.name === name)?.hands || []
}

const levels = computed(() => {
  let previousStack = null

  return [...(event.value?.blindLevels || [])]
    .sort((a, b) => Number(a.levelNo || 0) - Number(b.levelNo || 0))
    .map((level) => {
      const rawStack = level.endStack ?? level.displayStartStack ?? level.startStack
      const stack = rawStack == null ? null : Number(rawStack)
      const difference =
        stack != null && previousStack != null ? stack - previousStack : null
      const row = {
        id: level.id,
        name: `L${level.levelNo}`,
        stack: stack == null ? '-' : stack.toLocaleString('ko-KR'),
        change:
          difference == null || difference === 0
            ? '-'
            : `${difference > 0 ? '▲' : '▼'} ${Math.abs(difference).toLocaleString('ko-KR')}`,
        tone: difference > 0 ? 'up' : difference < 0 ? 'down' : '',
      }
      if (stack != null) previousStack = stack
      return row
    })
})
const editTournament = () => { menuOpen.value = false; router.push({ path: '/app/tournament/running/finish', query: { mode: 'edit', tournamentId } }) }
const editBankRecord = () => {
  menuOpen.value = false
  router.push({ path: '/app/simple-record', query: { recordId: tournamentId } })
}
const resumeTournament = async () => {
  menuOpen.value = false

  try {
    const currentRunning = await fetchRunningGameSession()
    if (
      currentRunning &&
      String(currentRunning.id) !== String(tournamentId)
    ) {
      alert.show('진행 중인 토너먼트를 먼저 종료해 주세요.', 'warning')
      return
    }
    if (!session.value) return

    await updateGameSession(tournamentId, {
      ...session.value,
      playDate: session.value.playDate,
      tournamentStatus: 'RUNNING',
      tournamentResult: null,
    })
    const running = {
      ...runningTournament,
      sessionId: session.value.id,
      eventId: session.value.handLogEventId,
      status: 'RUNNING',
    }
    localStorage.setItem('pokerly-running-tournament', JSON.stringify(running))
    const savedResults = JSON.parse(localStorage.getItem('pokerly-tournament-results')) || []
    localStorage.setItem(
      'pokerly-tournament-results',
      JSON.stringify(
        savedResults.filter((item) => String(item.id) !== String(tournamentId)),
      ),
    )
    localStorage.removeItem('pokerly-last-tournament-result')
    router.replace('/app/tournament/running')
  } catch (error) {
    const message =
      error?.response?.data?.error?.message ||
      '토너먼트를 재개하지 못했습니다.'
    alert.show(message, 'error')
  }
}
const openHand = (hand) => router.push({
  name: 'tournament-hand-detail',
  params: { levelName: hand.levelId, handId: hand.id },
  query: { levelName: hand.level, ...legacyQuery.value },
})
const openLevel = (name) => {
  const level = levels.value.find((item) => item.name === name)
  if (!level) return
  router.push({
  name: 'tournament-level-detail',
  params: { levelName: level.id },
    query: { view: 'summary', levelName: level.name, ...legacyQuery.value },
})
}
const legacyQuery = computed(() => legacyEventId.value ? { legacyEventId: legacyEventId.value } : {})
const goReviewHands = () => router.push({
  name: 'tournament-review-hands',
  params: { tournamentId },
  query: legacyQuery.value,
})
const goStats = () => router.push({
  name: 'tournament-stats',
  params: { tournamentId, statType: 'preflop' },
  query: legacyQuery.value,
})

const copyTournamentText = async () => {
  menuOpen.value = false
  if (!event.value) {
    alert.show('복사할 핸드 기록이 없습니다.', 'warning')
    return
  }

  try {
    await copyToClipboard(buildEventReviewText(event.value, { seats: tournamentSeats.value }))
    alert.show('대회 전체 복기 텍스트를 복사했습니다.', 'success')
  } catch {
    alert.show('텍스트를 복사하지 못했습니다.', 'error')
  }
}

onMounted(async () => {
  if (!legacyEventId.value) {
    try {
      session.value = await fetchGameSession(tournamentId)
      localStorage.setItem('pokerly-last-tournament-result', JSON.stringify(session.value))
    } catch {
      alert.show('대회 기록을 불러오지 못했습니다.', 'error')
      return
    }
  }

  if (!eventId.value) {
    handLogStore.selectedEvent = null
    return
  }

  try {
    const [, seats] = await Promise.all([
      handLogStore.fetchEventDetail(eventId.value),
      legacyEventId.value ? Promise.resolve([]) : fetchTournamentSeats(tournamentId).catch(() => []),
    ])
    tournamentSeats.value = seats || []
  } catch (error) {
    handLogStore.selectedEvent = null
    if (error?.response?.status !== 404) {
      alert.show('핸드 기록을 불러오지 못했습니다.', 'error')
    }
  }
})
</script>

<style scoped>
.summary-page { display: flex; min-height: 100%; flex-direction: column; padding: 0 var(--v2-page-padding-x) 180px; }
.summary-page * { box-sizing: border-box; }
.topbar { position: relative; display: grid; width: 100%; height: 36px; min-height: 36px; max-height: 36px; flex: 0 0 36px; grid-template-columns: 40px 1fr 40px; align-items: center; }
.topbar > button { display: grid; width: 36px; height: 36px; place-items: center; padding: 0; border: 0; background: transparent; color: var(--v2-text-main); }
.topbar > button:last-of-type { justify-self: end; }
.topbar h1 { margin: 0; font-size: 17px; font-weight: 560; text-align: center; }
.page-menu { position: absolute; z-index: 5; top: 42px; right: 0; width: 156px; overflow: hidden; border: 1px solid var(--v2-border); border-radius: 12px; background: #fff; box-shadow: 0 12px 28px rgba(28,18,60,.16); }
.page-menu button { display: flex; width: 100%; min-height: 42px; align-items: center; padding: 0 14px; border: 0; border-bottom: 1px solid var(--v2-border); background: #fff; color: var(--v2-text-main); font: inherit; font-size: 13px; font-weight: 520; }
.page-menu button:last-child { border-bottom: 0; }
.title-row { display: flex; min-height: 28px; flex: 0 0 auto; align-items: center; justify-content: space-between; margin-top: 24px; }
.title-row h2 { margin: 0; font-size: 20px; font-weight: 620; }
.title-row time { color: var(--v2-text-sub); font-size: 13px; }
.result-card, .level-table, .stat-card, .memo-box, .hand-grid button { border: 1px solid var(--v2-border); border-radius: var(--v2-radius-lg); background: #fff; box-shadow: 0 5px 14px rgba(28,18,60,.025); }
.result-card { display: grid; grid-template-columns: repeat(auto-fit,minmax(88px,1fr)); margin-top: 5px; padding: 12px 14px; }
.result-card > div { display: grid; min-width: 0; min-height: 58px; place-items: center; align-content: center; gap: 6px; padding: 0 8px; text-align: center; }
.result-card > div + div { border-left: 1px solid var(--v2-border); }
.result-card > div > span { color: #706a7f; font-size: 11px; font-weight: 580; }
.result-card strong { font-size: clamp(13px,3.8vw,17px); font-weight: 620; white-space: nowrap; }
.result-card strong > i { display: inline-grid; width: 20px; height: 20px; margin-right: 3px; place-items: center; border-radius: 50%; background: var(--v2-primary-soft); color: var(--v2-primary); vertical-align: middle; }
.result-card .primary, .result-card p b { color: var(--v2-primary); }
.legacy-summary-note { display: flex; align-items: center; gap: 11px; margin-top: 13px; padding: 14px; border: 1px solid var(--v2-border); border-radius: var(--v2-radius-lg); background: #fff; }
.legacy-summary-note > span { display: grid; width: 36px; height: 36px; flex: 0 0 36px; place-items: center; border-radius: 10px; background: var(--v2-primary-soft); color: var(--v2-primary); }
.legacy-summary-note p { display: grid; gap: 4px; margin: 0; }
.legacy-summary-note strong { font-size: 12px; font-weight: 620; }
.legacy-summary-note small { color: var(--v2-text-sub); font-size: 10px; line-height: 1.4; }
.content-section { display: grid; gap: 4px; margin-top: 13px; }
.section-empty { display: grid; min-height: 68px; place-items: center; border: 1px solid var(--v2-border); border-radius: var(--v2-radius-lg); background: #fff; color: var(--v2-text-sub); font-size: 12px; }
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
.rank-distribution__heading { display: flex; align-items: baseline; justify-content: space-between; gap: 10px; }.rank-distribution__heading h2 { margin: 0; font-size: 16px; font-weight: 600; }.rank-distribution__heading > span { color: var(--v2-text-sub); font-size: 10px; white-space: nowrap; }
.rank-distribution__card { padding: 14px; border: 1px solid var(--v2-border); border-radius: var(--v2-radius-lg); background: #fff; box-shadow: 0 5px 14px rgba(28,18,60,.025); }
.rank-meter { display: flex; height: 10px; overflow: hidden; border-radius: 999px; background: #f0edf5; }.rank-meter > span { height: 100%; }
.rank-distribution__list { display: grid; margin-top: 10px; }.rank-distribution__list > div { display: grid; min-height: 43px; grid-template-columns: 8px minmax(0,1fr) auto 32px; align-items: center; gap: 8px; border-bottom: 1px solid var(--v2-border); }.rank-distribution__list > div:last-child { border-bottom: 0; }.rank-distribution__list i { width: 7px; height: 7px; border-radius: 50%; }.rank-distribution__list span { display: grid; min-width: 0; gap: 1px; }.rank-distribution__list strong, .rank-distribution__list b { font-size: 11px; font-weight: 600; }.rank-distribution__list small, .rank-distribution__list em { color: var(--v2-text-sub); font-size: 9px; font-style: normal; }.rank-distribution__list em { text-align: right; }
.rank-tone--premium { background: #7143df; }.rank-tone--strong { background: #2983d8; }.rank-tone--middle { background: #159487; }.rank-tone--low { background: #f58a0a; }
.major-hands { overflow: hidden; border: 1px solid var(--v2-border); border-radius: var(--v2-radius-lg); background: #fff; }
.major-hands > article { padding: 13px; border-bottom: 1px solid var(--v2-border); }.major-hands > article:last-child { border-bottom: 0; }
.major-hands header { display: flex; align-items: start; justify-content: space-between; gap: 12px; }.major-hands header > span { display: grid; gap: 3px; }.major-hands header strong { font-size: 13px; font-weight: 620; }.major-hands header small, .major-hands article > p { color: var(--v2-text-sub); font-size: 10px; }.major-hands header b { font-size: 13px; font-weight: 620; }
.major-hands article > p { margin: 8px 0 0; }
.major-hand-chips { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; }.major-hand-chips button { min-height: 29px; padding: 0 10px; border: 1px solid var(--v2-border); border-radius: 999px; background: #fff; color: var(--v2-text-main); font: inherit; font-size: 11px; font-weight: 600; }.major-hand-chips button.active { border-color: var(--v2-primary); background: var(--v2-primary-soft); color: var(--v2-primary); }.major-hand-chips small { color: var(--v2-text-sub); font-size: 10px; }
.major-hand-details { overflow: hidden; margin-top: 10px; border: 1px solid var(--v2-border); border-radius: var(--v2-radius-sm); background: #faf9fd; }.major-hand-details button { display: grid; width: 100%; min-height: 49px; justify-items: start; gap: 3px; padding: 8px 10px; border: 0; border-bottom: 1px solid var(--v2-border); background: transparent; color: var(--v2-text-main); font: inherit; text-align: left; }.major-hand-details button:last-child { border-bottom: 0; }.major-hand-details strong { font-size: 11px; font-weight: 620; }.major-hand-details span { color: var(--v2-text-sub); font-size: 10px; }
.memo-box { padding: 12px; }.memo-box p { margin: 0; color: #403b4b; font-size: 11px; line-height: 1.55; }
.memo-box p.empty { color: var(--v2-text-sub); }
@media (min-width: 521px) { .table-head, .level-table > button { grid-template-columns: 70px minmax(0,1fr) minmax(0,1fr) 18px; } }
</style>
