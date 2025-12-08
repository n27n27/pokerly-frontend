<template>
  <q-page class="q-pa-md bg-grey-1">
    <div class="dashboard-container column">
      <!-- ================== 상단: 월 선택 ================== -->
      <div class="row items-center justify-between q-mb-sm">
        <div class="row items-center q-gutter-xs">
          <q-btn flat round dense icon="chevron_left" @click="shiftMonth(-1)" />
          <div class="text-h6 text-weight-bold">
            {{ currentMonthLabel }}
          </div>
          <q-btn flat round dense icon="chevron_right" @click="shiftMonth(1)" />
        </div>
      </div>

      <!-- ================== 이번 달 요약 뱃지 ================== -->
      <div v-if="monthly" class="row items-center q-gutter-sm q-mb-lg">
        <!-- 세션 수 -->
        <q-badge outline color="grey-8" class="q-px-sm q-py-xs">
          {{ monthly.summary?.totalSessions ?? 0 }}회 플레이
        </q-badge>

        <!-- 총 이익 -->
        <q-badge
          outline
          :color="(monthly.kpis?.totalProfit ?? 0) >= 0 ? 'positive' : 'negative'"
          class="q-px-sm q-py-xs"
        >
          총 이익
          <span class="q-ml-xs">
            {{ formatMoney(monthly.kpis?.totalProfit ?? 0) }}
          </span>
        </q-badge>

        <!-- ROI -->
        <q-badge outline color="primary" class="q-px-sm q-py-xs">
          ROI
          <span class="q-ml-xs">
            {{ monthly.kpis?.roiPercent != null ? monthly.kpis.roiPercent.toFixed(1) + '%' : '-' }}
          </span>
        </q-badge>

        <!-- 최다 이익 매장 또는 가장 자주 간 매장 -->
        <q-badge v-if="bestVenueName" outline color="secondary" class="q-px-sm q-py-xs">
          {{ bestVenueLabel }}:
          <span class="q-ml-xs">
            {{ bestVenueName }}
          </span>
        </q-badge>
      </div>

      <!-- ================== 로딩 ================== -->
      <div v-if="store.loading" class="row justify-center q-mt-xl">
        <q-spinner size="40px" color="primary" />
      </div>

      <!-- ================== 에러 ================== -->
      <div v-else-if="store.error" class="text-negative">
        {{ store.error }}
      </div>

      <!-- ================== 실제 대시보드 본문 ================== -->
      <template v-else-if="monthly">
        <DashboardKpiSection :kpis="monthly.kpis" />

        <DashboardTrendAndRecent
          :last6Months="monthly.last6Months"
          :recentSessions="monthly.recentSessions"
        />

        <DashboardVenueAndPoints
          :topProfitVenues="monthly.topProfitVenues"
          :remainingPointVenues="monthly.remainingPointVenues"
        />
      </template>

      <!-- monthly 데이터 없음 -->
      <div v-else class="text-caption text-grey-6 q-mt-xl">
        대시보드 데이터를 불러오지 못했습니다.
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useDashboardStore } from 'src/stores/dashboard'

import DashboardKpiSection from 'src/components/dashboard/DashboardKpiSection.vue'
import DashboardTrendAndRecent from 'src/components/dashboard/DashboardTrendAndRecent.vue'
import DashboardVenueAndPoints from 'src/components/dashboard/DashboardVenueAndPoints.vue'

const store = useDashboardStore()
const monthly = computed(() => store.monthly)

onMounted(() => {
  store.loadMonthly()
})

const currentMonthLabel = computed(() => {
  if (!store.year || !store.month) return ''
  return `${store.year}년 ${store.month}월`
})

function shiftMonth(delta) {
  const y = store.year
  const m = store.month
  if (!y || !m) return

  let newYear = y
  let newMonth = m + delta

  if (newMonth <= 0) {
    newMonth += 12
    newYear -= 1
  } else if (newMonth > 12) {
    newMonth -= 12
    newYear += 1
  }

  store.loadMonthly(newYear, newMonth)
}

function formatMoney(v) {
  if (v == null) return '-'
  return v.toLocaleString('ko-KR')
}

function getProfit(v) {
  // 순이익 후보 키들
  return Number(v.totalProfit ?? v.profit ?? v.monthlyProfit ?? v.profitCashRealized ?? 0)
}

function getPrize(v) {
  // 프라이즈(상금) 후보 키들
  return Number(v.totalPrize ?? v.prize ?? v.totalCashOut ?? 0)
}

/**
 * 최상단 매장 뱃지 로직
 * 1) 순이익 > 0 인 매장이 있으면 → 그 중 순이익 1등 = "최다 이익 매장"
 * 2) 없고, 프라이즈 > 0 인 매장이 있으면 → 그 중 프라이즈 1등 = "가장 상금을 많이 받은 매장"
 * 3) 둘 다 없으면 → 세션 수 1등 = "가장 자주 간 매장"
 */
const bestVenueInfo = computed(() => {
  const m = monthly.value
  if (!m) return { label: '', name: '' }

  const profitVenues = Array.isArray(m.topProfitVenues) ? m.topProfitVenues : []
  const visitVenues = Array.isArray(m.topVisitVenues) ? m.topVisitVenues : []

  // 1) 양수 이익 매장 있으면 → 최다 이익 매장
  const positiveProfit = profitVenues.filter((v) => getProfit(v) > 0)
  if (positiveProfit.length > 0) {
    const best = positiveProfit.reduce((acc, cur) => (getProfit(cur) > getProfit(acc) ? cur : acc))
    return { label: '최다 이익 매장', name: best.venueName }
  }

  // 2) 수익은 0 이하지만 상금 있는 매장 → 가장 상금을 많이 받은 매장
  const prizeVenues = profitVenues.filter((v) => getPrize(v) > 0)
  if (prizeVenues.length > 0) {
    const best = prizeVenues.reduce((acc, cur) => (getPrize(cur) > getPrize(acc) ? cur : acc))
    return { label: '가장 상금을 많이 받은 매장', name: best.venueName }
  }

  // 3) 상금도 0 → topVisitVenues[0] = 가장 자주 간 매장
  if (visitVenues.length > 0) {
    return {
      label: '가장 자주 간 매장',
      name: visitVenues[0].venueName,
    }
  }

  return { label: '', name: '' }
})

const bestVenueLabel = computed(() => bestVenueInfo.value.label)
const bestVenueName = computed(() => bestVenueInfo.value.name)
</script>

<style scoped>
.dashboard-container {
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 8px;
}
</style>
