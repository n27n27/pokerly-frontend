<template>
  <q-page class="bank-record-page">
    <header class="bank-record-topbar">
      <button type="button" aria-label="뒤로 가기" @click="goBack">
        <q-icon name="chevron_left" size="28px" />
      </button>
      <h1>뱅크 기록</h1>
      <nav class="record-month-navigation" aria-label="기록 월 선택">
        <button type="button" aria-label="이전 달" @click="moveMonth(-1)">
          <q-icon name="chevron_left" size="18px" />
        </button>
        <strong>{{ selectedMonthLabel }}</strong>
        <button type="button" aria-label="다음 달" :disabled="isCurrentMonth" @click="moveMonth(1)">
          <q-icon name="chevron_right" size="18px" />
        </button>
      </nav>
    </header>

    <section class="record-overview">
      <article>
        <span>순수익</span>
        <strong :class="summary.totalProfit >= 0 ? 'win' : 'lose'">{{
          signed(summary.totalProfit)
        }}</strong>
      </article>
      <article>
        <span>기록</span>
        <strong>{{ summary.totalSessions }}회</strong>
      </article>
      <article>
        <span>ROI</span>
        <strong>{{ Number(summary.roi || 0).toFixed(1) }}%</strong>
      </article>
    </section>

    <section class="record-list-section">
      <div class="list-heading">
        <h2>{{ selectedMonth }}월 기록</h2>
        <div class="view-switch" aria-label="기록 보기 방식">
          <button
            type="button"
            :class="{ active: viewMode === 'list' }"
            @click="viewMode = 'list'"
          >
            목록
          </button>
          <button
            type="button"
            :class="{ active: viewMode === 'calendar' }"
            @click="viewMode = 'calendar'"
          >
            달력
          </button>
        </div>
      </div>

      <div v-if="viewMode === 'list'" class="list-sort">
        <button type="button" @click="sortOrder = sortOrder === 'desc' ? 'asc' : 'desc'">
          {{ sortOrder === 'desc' ? '최신순' : '오래된순' }}
          <q-icon name="expand_more" size="18px" />
        </button>
      </div>

      <div v-if="viewMode === 'list'" class="record-list">
        <div v-if="records.length === 0" class="record-list__empty">
          선택한 달의 기록이 없습니다.
        </div>
        <button
          v-for="record in records"
          :key="record.id"
          type="button"
          @click="openRecord(record.id)"
        >
          <span class="record-date">
            <strong>{{ record.day }}</strong>
            <small>{{ record.month }}</small>
          </span>
          <span class="record-main">
            <strong>{{ record.title }}</strong>
            <small>총 바인 {{ record.totalBuyIn }} · {{ record.entries }}회</small>
          </span>
          <strong v-if="record.result" class="record-result" :class="record.tone">{{
            record.result
          }}</strong>
          <span v-else class="record-pending">결과 미입력</span>
          <q-icon name="chevron_right" size="21px" />
        </button>
      </div>

      <div v-else class="calendar-view">
        <div class="calendar-weekdays" aria-hidden="true">
          <span v-for="weekday in weekdays" :key="weekday">{{ weekday }}</span>
        </div>
        <div class="calendar-grid">
          <span v-for="index in calendarLeadingBlankCount" :key="`blank-${index}`"></span>
          <button
            v-for="day in calendarDays"
            :key="day.dateKey"
            type="button"
            :class="[
              day.tone,
              { selected: selectedDateKey === day.dateKey, recorded: day.sessions.length > 0 },
            ]"
            :aria-label="day.ariaLabel"
            @click="selectCalendarDay(day)"
          >
            <strong>{{ day.day }}</strong>
            <small :class="{ placeholder: !day.displayProfit }">{{
              day.displayProfit || '\u00a0'
            }}</small>
          </button>
        </div>

        <section v-if="selectedCalendarDay" class="calendar-day-detail">
          <div class="calendar-day-heading">
            <div>
              <h3>{{ selectedMonth }}월 {{ selectedCalendarDay.day }}일</h3>
              <span>{{ selectedCalendarDay.sessions.length }}개 기록</span>
            </div>
            <strong :class="selectedCalendarDay.tone">
              {{ selectedCalendarDay.totalLabel }}
            </strong>
          </div>

          <div v-if="selectedCalendarDay.records.length" class="calendar-day-records">
            <button
              v-for="record in selectedCalendarDay.records"
              :key="record.id"
              type="button"
              @click="openRecord(record.id)"
            >
              <span>
                <strong>{{ record.title }}</strong>
                <small>총 바인 {{ record.totalBuyIn }} · {{ record.entries }}회</small>
              </span>
              <strong v-if="record.result" :class="record.tone">{{ record.result }}</strong>
              <small v-else class="record-pending">결과 미입력</small>
              <q-icon name="chevron_right" size="19px" />
            </button>
          </div>
          <div v-else class="calendar-day-empty">이 날짜에 기록이 없습니다.</div>
        </section>
      </div>
    </section>

    <button class="record-fab" type="button" aria-label="새 기록 추가" @click="openRecord()">
      <q-icon name="add" size="28px" />
    </button>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { fetchAllGameSessions } from 'src/api/gameSession'
import { formatCompactNumber } from 'src/utils/numberFormat'
import { tournamentDisplayName } from 'src/utils/tournamentName'

const router = useRouter()
const route = useRoute()
const now = new Date()
const queryYear = Number(route.query.year)
const queryMonth = Number(route.query.month)
const hasValidQueryMonth =
  Number.isInteger(queryYear) && Number.isInteger(queryMonth) && queryMonth >= 1 && queryMonth <= 12
const selectedYear = ref(hasValidQueryMonth ? queryYear : now.getFullYear())
const selectedMonth = ref(hasValidQueryMonth ? queryMonth : now.getMonth() + 1)
const sessions = ref([])
const sortOrder = ref('desc')
const viewMode = ref('list')
const selectedDateKey = ref('')
const weekdays = ['월', '화', '수', '목', '금', '토', '일']
const signed = (value) =>
  formatCompactNumber(Number(value) || 0, {
    signDisplay: 'exceptZero',
  })
const selectedMonthLabel = computed(() => `${selectedYear.value}년 ${selectedMonth.value}월`)
const isCurrentMonth = computed(
  () => selectedYear.value === now.getFullYear() && selectedMonth.value === now.getMonth() + 1,
)
const scopedSessions = computed(() => {
  const prefix = `${selectedYear.value}-${String(selectedMonth.value).padStart(2, '0')}-`
  return sessions.value.filter((session) => String(session.playDate || '').startsWith(prefix))
})
const totalBuyInOf = (session) => {
  const perEntry = Number(session.buyInPerEntry) || 0
  const entries = Math.max(1, Number(session.entries) || 1)
  return Math.max(0, perEntry * entries - (Number(session.discount) || 0))
}
const summary = computed(() => {
  const completed = scopedSessions.value.filter((session) => session.tournamentStatus !== 'RUNNING')
  const totalProfit = completed.reduce((sum, session) => sum + (Number(session.netProfit) || 0), 0)
  const totalBuyIn = completed.reduce((sum, session) => sum + totalBuyInOf(session), 0)
  return {
    totalProfit,
    totalSessions: completed.length,
    roi: totalBuyIn > 0 ? (totalProfit * 100) / totalBuyIn : 0,
  }
})
const recordFromSession = (session) => {
  const [, month = '', day = ''] = String(session.playDate || '').split('-')
  return {
    id: session.id,
    day,
    month: month ? `${Number(month)}월` : '-',
    title: tournamentDisplayName(session),
    totalBuyIn: totalBuyInOf(session).toLocaleString('ko-KR'),
    entries: session.entries || 1,
    result: session.tournamentStatus === 'RUNNING' ? '' : signed(session.netProfit),
    tone: Number(session.netProfit) >= 0 ? 'win' : 'lose',
  }
}
const records = computed(() =>
  [...scopedSessions.value]
    .sort((a, b) =>
      sortOrder.value === 'desc'
        ? String(b.playDate || '').localeCompare(String(a.playDate || ''))
        : String(a.playDate || '').localeCompare(String(b.playDate || '')),
    )
    .map(recordFromSession),
)
const sessionsByDate = computed(() => {
  const grouped = new Map()
  scopedSessions.value.forEach((session) => {
    const dateKey = String(session.playDate || '').slice(0, 10)
    if (!dateKey) return
    if (!grouped.has(dateKey)) grouped.set(dateKey, [])
    grouped.get(dateKey).push(session)
  })
  return grouped
})
const calendarLeadingBlankCount = computed(() => {
  const firstDay = new Date(selectedYear.value, selectedMonth.value - 1, 1).getDay()
  return (firstDay + 6) % 7
})
const calendarDays = computed(() => {
  const daysInMonth = new Date(selectedYear.value, selectedMonth.value, 0).getDate()
  return Array.from({ length: daysInMonth }, (_, index) => {
    const day = index + 1
    const dateKey = `${selectedYear.value}-${String(selectedMonth.value).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const daySessions = sessionsByDate.value.get(dateKey) || []
    const completed = daySessions.filter((session) => session.tournamentStatus !== 'RUNNING')
    const totalProfit = completed.reduce((sum, session) => sum + (Number(session.netProfit) || 0), 0)
    const hasCompleted = completed.length > 0
    const tone = !hasCompleted ? 'pending' : totalProfit > 0 ? 'win' : totalProfit < 0 ? 'lose' : 'even'
    const displayProfit = hasCompleted
      ? formatCompactNumber(totalProfit, { signDisplay: 'exceptZero', maximumFractionDigits: 1 })
      : daySessions.length
        ? '진행 중'
        : ''
    return {
      day,
      dateKey,
      sessions: daySessions,
      completed,
      totalProfit,
      tone,
      displayProfit,
      totalLabel: hasCompleted ? signed(totalProfit) : daySessions.length ? '진행 중' : '-',
      records: [...daySessions]
        .sort((a, b) => Number(b.id || 0) - Number(a.id || 0))
        .map(recordFromSession),
      ariaLabel: `${selectedMonth.value}월 ${day}일${displayProfit ? `, ${displayProfit}` : ''}`,
    }
  })
})
const selectedCalendarDay = computed(
  () => calendarDays.value.find((day) => day.dateKey === selectedDateKey.value) || null,
)

onMounted(async () => {
  const result = await fetchAllGameSessions()
  sessions.value = Array.isArray(result) ? result : []
})

const moveMonth = (delta) => {
  const date = new Date(selectedYear.value, selectedMonth.value - 1 + delta, 1)
  if (date > new Date(now.getFullYear(), now.getMonth(), 1)) return
  selectedYear.value = date.getFullYear()
  selectedMonth.value = date.getMonth() + 1
  selectedDateKey.value = ''
}

const selectCalendarDay = (day) => {
  selectedDateKey.value = day.dateKey
}

const openRecord = (recordId) => {
  router.push({
    path: '/app/simple-record',
    query: recordId ? { recordId } : {},
  })
}

const goBack = () => {
  router.push({ name: 'home' })
}
</script>

<style scoped>
.bank-record-page {
  display: flex;
  min-height: 100%;
  flex-direction: column;
  gap: 16px;
  padding: var(--v2-page-padding-top) var(--v2-page-padding-x) 112px;
}

.bank-record-page * {
  box-sizing: border-box;
}
.bank-record-topbar {
  display: grid;
  min-height: 38px;
  grid-template-columns: 40px minmax(0, 1fr) 156px;
  align-items: center;
  gap: 6px;
}
.bank-record-topbar button {
  display: grid;
  width: 36px;
  height: 36px;
  place-items: center;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--v2-text-main);
}
.bank-record-topbar h1 {
  margin: 0;
  font-size: 21px;
  font-weight: 650;
  line-height: 1.2;
  text-align: left;
  white-space: nowrap;
}
.record-month-navigation {
  display: grid;
  width: 156px;
  min-height: 38px;
  grid-template-columns: 32px minmax(0, 1fr) 32px;
  align-items: center;
  overflow: hidden;
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-md);
  background: #fff;
}
.record-month-navigation button {
  display: grid;
  width: 32px;
  height: 36px;
  place-items: center;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--v2-text-main);
}
.record-month-navigation button:disabled {
  color: #d6d1df;
}
.record-month-navigation strong {
  font-size: 12px;
  font-weight: 650;
  text-align: center;
  white-space: nowrap;
}
.record-overview {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}
.record-overview article {
  display: grid;
  min-height: 70px;
  place-items: center;
  align-content: center;
  gap: 6px;
  padding: 10px 6px;
  border: 1px solid rgba(109, 69, 232, 0.08);
  border-radius: 13px;
  background: #fff;
  box-shadow: 0 5px 14px rgba(28, 18, 60, 0.035);
  text-align: center;
}
.record-overview span {
  color: var(--v2-text-sub);
  font-size: 10px;
}
.record-overview strong {
  font-size: 15px;
  font-weight: 620;
  white-space: nowrap;
}
.win {
  color: var(--v2-danger);
}
.lose {
  color: #2563eb;
}
.record-list-section {
  display: grid;
  gap: 10px;
  margin-top: 4px;
}
.list-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.list-heading h2 {
  margin: 0;
  font-size: 16px;
  font-weight: 620;
}
.view-switch {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2px;
  padding: 3px;
  border-radius: 10px;
  background: #f0edf6;
}
.view-switch button {
  min-width: 50px;
  height: 30px;
  padding: 0 9px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: var(--v2-text-sub);
  font: inherit;
  font-size: 11px;
  font-weight: 600;
}
.view-switch button.active {
  background: #fff;
  color: var(--v2-primary);
  box-shadow: 0 2px 8px rgba(28, 18, 60, 0.08);
}
.list-sort {
  display: flex;
  justify-content: flex-end;
  margin-top: -4px;
}
.list-sort button {
  display: flex;
  min-height: 32px;
  align-items: center;
  gap: 2px;
  padding: 0 8px;
  border: 0;
  border-radius: 8px;
  outline: 0;
  background: transparent;
  color: var(--v2-text-sub);
  font: inherit;
  font-size: 11px;
}
.list-sort button:focus-visible,
.view-switch button:focus-visible {
  box-shadow: 0 0 0 2px rgba(109, 69, 232, 0.18);
}
.record-list {
  overflow: hidden;
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-lg);
  background: #fff;
  box-shadow: var(--v2-shadow-card);
}
.record-list__empty {
  display: grid;
  min-height: 92px;
  place-items: center;
  padding: 16px;
  color: var(--v2-text-sub);
  font-size: 12px;
  text-align: center;
}
.record-list > button {
  display: grid;
  width: 100%;
  min-height: 76px;
  grid-template-columns: 38px minmax(0, 1fr) auto 20px;
  align-items: center;
  gap: 10px;
  padding: 11px 12px;
  border: 0;
  border-bottom: 1px solid var(--v2-border);
  background: transparent;
  color: var(--v2-text-main);
  font: inherit;
  text-align: left;
}
.record-list > button:last-child {
  border-bottom: 0;
}
.record-date {
  display: grid;
  justify-items: center;
  gap: 2px;
  padding-right: 9px;
  border-right: 1px solid var(--v2-border);
}
.record-date strong {
  font-size: 15px;
  font-weight: 620;
}
.record-date small {
  color: var(--v2-text-sub);
  font-size: 9px;
}
.record-main {
  display: grid;
  min-width: 0;
  gap: 6px;
}
.record-main strong {
  overflow: hidden;
  font-size: 14px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.record-main small {
  overflow: hidden;
  color: var(--v2-text-sub);
  font-size: 10px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.record-result {
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}
.record-pending {
  padding: 5px 7px;
  border-radius: 7px;
  background: #f2f0f7;
  color: var(--v2-text-sub);
  font-size: 9px;
  white-space: nowrap;
}
.record-list .q-icon {
  color: var(--v2-text-sub);
}
.calendar-view {
  display: grid;
  gap: 12px;
}
.calendar-weekdays,
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
}
.calendar-weekdays {
  padding: 0 4px;
}
.calendar-weekdays span {
  color: var(--v2-text-sub);
  font-size: 10px;
  font-weight: 600;
  text-align: center;
}
.calendar-grid {
  gap: 4px;
  padding: 8px;
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-lg);
  background: #fff;
  box-shadow: var(--v2-shadow-card);
}
.calendar-grid > span,
.calendar-grid > button {
  min-width: 0;
  min-height: 52px;
}
.calendar-grid > button {
  display: grid;
  grid-template-rows: 14px 12px;
  align-content: center;
  justify-items: center;
  gap: 4px;
  padding: 5px 1px;
  border: 1px solid transparent;
  border-radius: 9px;
  background: transparent;
  color: var(--v2-text-main);
  font: inherit;
}
.calendar-grid > button.recorded {
  background: #faf9fc;
}
.calendar-grid > button.selected {
  border-color: rgba(109, 69, 232, 0.32);
  background: #f2edff;
}
.calendar-grid strong {
  font-size: 11px;
  font-weight: 620;
}
.calendar-grid small {
  max-width: 100%;
  overflow: hidden;
  font-size: 8px;
  font-weight: 650;
  line-height: 1.2;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.calendar-grid button.win small,
.calendar-day-heading strong.win,
.calendar-day-records .win {
  color: var(--v2-danger);
}
.calendar-grid button.lose small,
.calendar-day-heading strong.lose,
.calendar-day-records .lose {
  color: #2563eb;
}
.calendar-grid button.even small,
.calendar-grid button.pending small,
.calendar-day-heading strong.even,
.calendar-day-heading strong.pending {
  color: var(--v2-text-sub);
}
.calendar-grid small.placeholder {
  visibility: hidden;
}
.calendar-day-detail {
  overflow: hidden;
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-lg);
  background: #fff;
  box-shadow: var(--v2-shadow-card);
}
.calendar-day-heading {
  display: flex;
  min-height: 64px;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px;
  border-bottom: 1px solid var(--v2-border);
}
.calendar-day-heading > div {
  display: grid;
  gap: 4px;
}
.calendar-day-heading h3 {
  margin: 0;
  font-size: 14px;
  font-weight: 650;
}
.calendar-day-heading span {
  color: var(--v2-text-sub);
  font-size: 10px;
}
.calendar-day-heading > strong {
  font-size: 14px;
  font-weight: 650;
  white-space: nowrap;
}
.calendar-day-records > button {
  display: grid;
  width: 100%;
  min-height: 64px;
  grid-template-columns: minmax(0, 1fr) auto 18px;
  align-items: center;
  gap: 9px;
  padding: 10px 14px;
  border: 0;
  border-bottom: 1px solid var(--v2-border);
  background: transparent;
  color: var(--v2-text-main);
  font: inherit;
  text-align: left;
}
.calendar-day-records > button:last-child {
  border-bottom: 0;
}
.calendar-day-records > button > span {
  display: grid;
  min-width: 0;
  gap: 5px;
}
.calendar-day-records > button > span strong {
  overflow: hidden;
  font-size: 13px;
  font-weight: 620;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.calendar-day-records > button > span small {
  overflow: hidden;
  color: var(--v2-text-sub);
  font-size: 9px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.calendar-day-records > button > strong {
  font-size: 11px;
  font-weight: 650;
  white-space: nowrap;
}
.calendar-day-records .q-icon {
  color: var(--v2-text-sub);
}
.calendar-day-empty {
  display: grid;
  min-height: 76px;
  place-items: center;
  padding: 14px;
  color: var(--v2-text-sub);
  font-size: 11px;
}
.record-fab {
  position: fixed;
  z-index: 5;
  right: max(20px, calc((100vw - 480px) / 2 + 20px));
  bottom: 92px;
  display: grid;
  width: 56px;
  height: 56px;
  place-items: center;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: var(--v2-primary);
  color: #fff;
  box-shadow: 0 10px 24px rgba(109, 69, 232, 0.3);
  backface-visibility: hidden;
  transform: translateZ(0);
}
.record-fab:active {
  transform: translate3d(0, 1px, 0);
}
</style>
