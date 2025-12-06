<template>
  <q-page class="stats-root bg-grey-1">
    <div class="stats-container">
      <!-- ================== 상단: 월 선택 + 오른쪽 요약 뱃지 ================== -->
      <div class="top-bar row items-center justify-between q-mb-md">
        <div class="row items-center q-gutter-xs">
          <q-btn flat round dense icon="chevron_left" @click="shiftMonth(-1)" />
          <div class="text-h6 text-weight-bold">
            {{ currentMonthLabel }}
          </div>
          <q-btn flat round dense icon="chevron_right" @click="shiftMonth(1)" />
        </div>

        <div v-if="summary" class="row items-center q-gutter-xs month-profit">
          <q-chip square outline icon="trending_up" color="primary" text-color="primary">
            월 손익
          </q-chip>
          <div
            class="text-h6 text-weight-bold"
            :class="
              summary.totalProfit > 0
                ? 'text-positive'
                : summary.totalProfit < 0
                  ? 'text-negative'
                  : 'text-grey-8'
            "
          >
            {{ formatValue(summary.totalProfit) }}
          </div>
        </div>
      </div>

      <!-- ================== 로딩 / 에러 ================== -->
      <q-inner-loading :showing="monthlyLoading">
        <q-spinner size="40px" />
      </q-inner-loading>

      <div v-if="monthlyError" class="text-negative text-caption q-mb-sm">
        {{ monthlyError }}
      </div>

      <!-- ================== 핵심 지표 ================== -->
      <div v-if="summary" class="q-mb-md">
        <div class="section-title q-mb-xs">핵심 지표</div>

        <div class="core-grid">
          <!-- 이번 달 손익 -->
          <q-card flat bordered class="core-card">
            <q-card-section class="row items-center no-wrap">
              <q-icon name="account_balance_wallet" size="26px" class="q-mr-sm text-primary" />
              <div>
                <div class="core-label">이번 달 손익</div>
                <div
                  class="core-value"
                  :class="
                    summary.totalProfit > 0
                      ? 'text-positive'
                      : summary.totalProfit < 0
                        ? 'text-negative'
                        : 'text-grey-8'
                  "
                >
                  {{ formatValue(summary.totalProfit) }}
                </div>
                <div class="core-sub text-grey-7">바인 · 프라이즈 합산</div>
              </div>
            </q-card-section>
          </q-card>

          <!-- ROI -->
          <q-card flat bordered class="core-card">
            <q-card-section class="row items-center no-wrap">
              <q-icon name="percent" size="24px" class="q-mr-sm text-indigo-6" />
              <div>
                <div class="core-label">ROI</div>
                <div
                  class="core-value"
                  :class="
                    summary.roi > 0
                      ? 'text-positive'
                      : summary.roi < 0
                        ? 'text-negative'
                        : 'text-grey-8'
                  "
                >
                  {{ summary.roi.toFixed(1) }}%
                </div>
                <div class="core-sub text-grey-7">수익률</div>
              </div>
            </q-card-section>
          </q-card>

          <!-- ITM -->
          <q-card flat bordered class="core-card">
            <q-card-section class="row items-center no-wrap">
              <q-icon name="emoji_events" size="24px" class="q-mr-sm text-amber-7" />
              <div>
                <div class="core-label">ITM</div>
                <div class="row items-baseline q-gutter-xs">
                  <div class="core-value">{{ summary.itmCount }}회</div>
                  <div class="text-caption text-grey-7">
                    ({{ (summary.itmRatio * 100).toFixed(1) }}%)
                  </div>
                </div>
                <div class="core-sub text-grey-7">머니인 빈도</div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- ================== 승/패/본전 칩 ================== -->
      <div v-if="daily && daily.length > 0" class="q-mb-md">
        <div class="row items-center q-gutter-sm">
          <q-chip dense color="positive" text-color="white" icon="arrow_upward">
            이긴 날 {{ winDays }}일
          </q-chip>
          <q-chip dense color="negative" text-color="white" icon="arrow_downward">
            잃은 날 {{ loseDays }}일
          </q-chip>
          <q-chip dense color="grey-6" text-color="white" icon="drag_handle">
            본전 {{ breakevenDays }}일
          </q-chip>
        </div>
      </div>

      <!-- ================== 손익 차트 ================== -->
      <div v-if="daily && daily.length > 0" class="q-mb-lg">
        <div class="section-title q-mb-sm">손익 그래프</div>

        <!-- 일자별 손익 -->
        <q-card flat bordered class="q-mb-md">
          <q-card-section>
            <div class="text-subtitle2 text-weight-bold q-mb-xs">일자별 손익</div>
            <div class="text-caption text-grey-7 q-mb-sm">날짜별 순수 손익 변화량</div>

            <apex-chart
              height="240"
              type="line"
              :options="dailyChartOptions"
              :series="dailyChartSeries"
            />
          </q-card-section>
        </q-card>

        <!-- 누적 손익 -->
        <q-card flat bordered>
          <q-card-section>
            <div class="text-subtitle2 text-weight-bold q-mb-xs">누적 손익 (Bankroll Flow)</div>
            <div class="text-caption text-grey-7 q-mb-sm">월 초부터 누적 수익 흐름</div>

            <apex-chart
              height="240"
              type="line"
              :options="cumulativeChartOptions"
              :series="cumulativeChartSeries"
            />
          </q-card-section>
        </q-card>
      </div>

      <!-- ================== 하이라이트 ================== -->
      <div v-if="highlights" class="q-mb-md">
        <div class="section-title q-mb-xs">하이라이트</div>

        <div class="highlight-grid">
          <q-card flat bordered class="kpi-card">
            <div class="kpi-label">최고 수익 세션</div>
            <div
              class="kpi-value"
              :class="
                highlights.bestSessionProfit > 0
                  ? 'text-positive'
                  : highlights.bestSessionProfit < 0
                    ? 'text-negative'
                    : 'text-grey-8'
              "
            >
              {{
                highlights.bestSessionProfit != null
                  ? formatValue(highlights.bestSessionProfit)
                  : '-'
              }}
            </div>
          </q-card>

          <q-card flat bordered class="kpi-card">
            <div class="kpi-label">최악 세션</div>
            <div
              class="kpi-value"
              :class="
                highlights.worstSessionProfit < 0
                  ? 'text-negative'
                  : highlights.worstSessionProfit > 0
                    ? 'text-positive'
                    : 'text-grey-8'
              "
            >
              {{
                highlights.worstSessionProfit != null
                  ? formatValue(highlights.worstSessionProfit)
                  : '-'
              }}
            </div>
          </q-card>

          <q-card flat bordered class="kpi-card">
            <div class="kpi-label">최대 연속 ITM</div>
            <div class="kpi-value">{{ highlights.maxConsecutiveITM ?? '-' }} 회</div>
          </q-card>
        </div>
      </div>

      <!-- ================== 일자별 리스트 ================== -->
      <q-card flat bordered>
        <q-card-section>
          <div class="text-subtitle1 text-weight-bold q-mb-sm">일자별 손익 요약</div>

          <div v-if="!daily || daily.length === 0" class="text-caption text-grey-7">
            이 달에는 아직 기록된 세션이 없습니다.
          </div>

          <q-list v-else separator>
            <q-item v-for="item in daily" :key="item.date">
              <q-item-section>
                <q-item-label>
                  {{ formatDate(item.date) }}
                </q-item-label>
                <q-item-label caption class="text-grey-7">
                  세션 {{ item.sessionCount }}회 · 바인 {{ formatValue(item.buyIn) }} · 프라이즈
                  {{ formatValue(item.prize) }}
                </q-item-label>
              </q-item-section>

              <q-item-section side top>
                <q-chip
                  square
                  dense
                  :color="item.profit > 0 ? 'positive' : item.profit < 0 ? 'negative' : 'grey-6'"
                  text-color="white"
                >
                  {{ formatValue(item.profit) }}
                </q-chip>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useStatisticsStore } from 'src/stores/statistics'

/* -----------------------------
    Store
----------------------------- */
const statisticsStore = useStatisticsStore()

const monthly = computed(() => statisticsStore.monthly)
const monthlyLoading = computed(() => statisticsStore.monthlyLoading)
const monthlyError = computed(() => statisticsStore.monthlyError)

const summary = computed(() => monthly.value?.summary)
const daily = computed(() => monthly.value?.daily || [])
const highlights = computed(() => monthly.value?.highlights)

/* -----------------------------
    현재 연/월
----------------------------- */
const today = new Date()
const currentYear = ref(today.getFullYear())
const currentMonth = ref(today.getMonth() + 1)

const currentMonthLabel = computed(() => `${currentYear.value}년 ${currentMonth.value}월`)

const load = () => {
  statisticsStore.loadMonthly(currentYear.value, currentMonth.value)
}

const shiftMonth = (delta) => {
  let y = currentYear.value
  let m = currentMonth.value + delta

  if (m <= 0) {
    m += 12
    y -= 1
  }
  if (m > 12) {
    m -= 12
    y += 1
  }

  currentYear.value = y
  currentMonth.value = m
}

watch([currentYear, currentMonth], load)
onMounted(load)

/* -----------------------------
    승/패/본전 일 수
----------------------------- */
const winDays = computed(() => daily.value.filter((d) => d.profit > 0).length)
const loseDays = computed(() => daily.value.filter((d) => d.profit < 0).length)
const breakevenDays = computed(() => daily.value.filter((d) => d.profit === 0).length)

/* -----------------------------
    ApexCharts 데이터
----------------------------- */
const chartLabels = computed(() =>
  daily.value.map((d) => {
    const parts = d.date ? d.date.split('-') : []
    const day = parts.length === 3 ? Number(parts[2]) : ''
    return day ? `${day}일` : ''
  }),
)

const dailyProfits = computed(() => daily.value.map((d) => (d.profit != null ? d.profit : 0)))

const cumulativeProfits = computed(() => {
  let acc = 0
  return daily.value.map((d) => {
    const v = d.profit != null ? d.profit : 0
    acc += v
    return acc
  })
})

/* 일자별 손익 차트 */
const dailyChartSeries = computed(() => [
  {
    name: '손익',
    data: dailyProfits.value,
  },
])

const dailyChartOptions = computed(() => ({
  chart: {
    toolbar: { show: false },
    zoom: { enabled: false },
  },
  xaxis: {
    categories: chartLabels.value,
  },
  colors: ['#3F51B5'],
  stroke: {
    curve: 'smooth',
    width: 3,
  },
  markers: {
    size: 4,
  },
  tooltip: {
    y: {
      formatter: (value) => `${value > 0 ? '+' : ''}${value.toLocaleString()}`,
    },
  },
}))

/* 누적 손익 차트 */
const cumulativeChartSeries = computed(() => [
  {
    name: '누적 손익',
    data: cumulativeProfits.value,
  },
])

const cumulativeChartOptions = computed(() => ({
  chart: {
    toolbar: { show: false },
    zoom: { enabled: false },
  },
  xaxis: {
    categories: chartLabels.value,
  },
  colors: ['#009688'],
  stroke: {
    curve: 'smooth',
    width: 3,
  },
  markers: {
    size: 4,
  },
  tooltip: {
    y: {
      formatter: (value) => `${value > 0 ? '+' : ''}${value.toLocaleString()}`,
    },
  },
}))

/* -----------------------------
    Utils
----------------------------- */
const formatValue = (v) => (v == null ? '-' : v.toLocaleString())

const formatDate = (iso) => {
  if (!iso) return ''
  const [, m, d] = iso.split('-')
  return `${Number(m)}월 ${Number(d)}일`
}
</script>

<style scoped>
.stats-root {
  padding: 16px;
  display: flex;
  justify-content: center;
}

.stats-container {
  width: 100%;
  max-width: 1120px;
  margin: 0 auto;
}

.section-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--q-grey-7);
}

.core-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 12px;
}

.core-card {
  padding: 10px 12px;
  border-radius: 10px;
  background: white;
}

.core-label {
  font-size: 12px;
  color: var(--q-grey-7);
}

.core-value {
  font-size: 20px;
  font-weight: 700;
}

.core-sub {
  font-size: 11px;
  color: var(--q-grey-6);
}

.highlight-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
}

.kpi-card {
  padding: 10px;
  border-radius: 8px;
  background: white;
}

.kpi-label {
  font-size: 11px;
  color: var(--q-grey-7);
}

.kpi-value {
  font-size: 16px;
  font-weight: 600;
}
</style>
