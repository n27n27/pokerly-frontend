<template>
  <q-page class="bg-grey-1">
    <div class="stats-container">
      <!-- 상단: 타이틀 -->
      <header class="stats-header">
        <div class="text-h5 text-weight-bold">매장별 통계</div>
        <div class="text-caption text-grey-7">
          내가 자주 가는 매장별 수익, ROI, ITM률을 비교하는 화면입니다.
        </div>
      </header>

      <!-- 로딩 / 에러 -->
      <div v-if="loading" class="row justify-center q-my-xl">
        <q-spinner size="40px" />
      </div>

      <div v-else-if="error" class="q-pa-md bg-red-1 text-red-8 rounded-borders">
        데이터를 불러오는 중 오류가 발생했습니다.
      </div>

      <template v-else-if="stats">
        <!-- ======================== KPI TOP CARDS ======================== -->
        <section class="stats-grid">
          <!-- 총 세션 수 -->
          <q-card flat bordered class="kpi-card">
            <div class="kpi-main">
              <div>
                <div class="kpi-label">총 세션 수</div>
                <div class="kpi-value">
                  {{ stats.summary.totalSessions.toLocaleString() }}
                </div>
              </div>
              <q-avatar class="kpi-icon kpi-icon-blue" size="36px">
                <q-icon name="insights" size="22px" />
              </q-avatar>
            </div>
          </q-card>

          <!-- 누적 수익 -->
          <q-card flat bordered class="kpi-card">
            <div class="kpi-main">
              <div>
                <div class="kpi-label">누적 수익</div>
                <div
                  class="kpi-value"
                  :class="stats.summary.totalProfit >= 0 ? 'text-positive' : 'text-negative'"
                >
                  {{ formatCurrency(stats.summary.totalProfit) }}
                </div>
              </div>
              <q-avatar class="kpi-icon kpi-icon-green" size="36px">
                <q-icon
                  :name="stats.summary.totalProfit >= 0 ? 'trending_up' : 'trending_down'"
                  size="22px"
                />
              </q-avatar>
            </div>
          </q-card>

          <!-- 전체 ROI -->
          <q-card flat bordered class="kpi-card">
            <div class="kpi-main">
              <div>
                <div class="kpi-label">전체 ROI</div>
                <div class="kpi-value">
                  {{ formatPercent(stats.summary.roi) }}
                </div>
              </div>
              <q-avatar class="kpi-icon kpi-icon-indigo" size="36px">
                <q-icon name="percent" size="22px" />
              </q-avatar>
            </div>
          </q-card>

          <!-- 매장 수 -->
          <q-card flat bordered class="kpi-card">
            <div class="kpi-main">
              <div>
                <div class="kpi-label">매장 수</div>
                <div class="kpi-value">
                  {{ stats.summary.totalVenues.toLocaleString() }}
                </div>
              </div>
              <q-avatar class="kpi-icon kpi-icon-orange" size="36px">
                <q-icon name="storefront" size="22px" />
              </q-avatar>
            </div>
          </q-card>
        </section>

        <!-- ======================== TOP VENUES ======================== -->
        <section class="top-venues">
          <q-card flat bordered class="stats-card wide">
            <div class="text-subtitle2 q-mb-xs">최고 수익 매장</div>
            <div v-if="stats.topVenues.bestByProfit">
              <div class="text-body1 text-weight-medium">
                {{ stats.topVenues.bestByProfit.venueName }}
              </div>
              <div class="text-caption text-grey-7">
                수익 {{ formatCurrency(stats.topVenues.bestByProfit.totalProfit) }}, ROI
                {{ formatPercent(stats.topVenues.bestByProfit.roi) }}
              </div>
            </div>
            <div v-else class="text-caption text-grey-6">데이터가 부족합니다.</div>
          </q-card>

          <q-card flat bordered class="stats-card wide">
            <div class="text-subtitle2 q-mb-xs">최저 수익 매장</div>
            <div v-if="stats.topVenues.worstByProfit">
              <div class="text-body1 text-weight-medium">
                {{ stats.topVenues.worstByProfit.venueName }}
              </div>
              <div class="text-caption text-grey-7">
                수익 {{ formatCurrency(stats.topVenues.worstByProfit.totalProfit) }}, ROI
                {{ formatPercent(stats.topVenues.worstByProfit.roi) }}
              </div>
            </div>
            <div v-else class="text-caption text-grey-6">데이터가 부족합니다.</div>
          </q-card>

          <q-card flat bordered class="stats-card wide">
            <div class="text-subtitle2 q-mb-xs">ROI 기준 최고 매장</div>
            <div v-if="stats.topVenues.bestByRoi">
              <div class="text-body1 text-weight-medium">
                {{ stats.topVenues.bestByRoi.venueName }}
              </div>
              <div class="text-caption text-grey-7">
                수익 {{ formatCurrency(stats.topVenues.bestByRoi.totalProfit) }}, ROI
                {{ formatPercent(stats.topVenues.bestByRoi.roi) }}
              </div>
            </div>
            <div v-else class="text-caption text-grey-6">데이터가 부족합니다.</div>
          </q-card>
        </section>

        <!-- ======================== TABLE ======================== -->
        <section class="stats-table-section">
          <q-card flat bordered class="q-pa-md">
            <div class="text-subtitle1 q-mb-md">매장별 상세 성과</div>

            <div class="table-wrapper">
              <q-table
                flat
                :rows="stats.venues"
                :columns="columns"
                row-key="venueId"
                hide-pagination
                :rows-per-page-options="[0]"
              >
                <template #body-cell-totalBuyIn="props">
                  <q-td :props="props">
                    {{ formatCurrency(props.row.totalBuyIn) }}
                  </q-td>
                </template>

                <template #body-cell-totalPrize="props">
                  <q-td :props="props">
                    {{ formatCurrency(props.row.totalPrize) }}
                  </q-td>
                </template>

                <template #body-cell-totalProfit="props">
                  <q-td
                    :props="props"
                    :class="props.row.totalProfit >= 0 ? 'text-positive' : 'text-negative'"
                  >
                    {{ formatCurrency(props.row.totalProfit) }}
                  </q-td>
                </template>

                <template #body-cell-roi="props">
                  <q-td :props="props">
                    {{ formatPercent(props.row.roi) }}
                  </q-td>
                </template>

                <template #body-cell-itmRatio="props">
                  <q-td :props="props">
                    {{ formatRatioPercent(props.row.itmRatio) }}
                    <span class="text-caption text-grey-6">
                      ({{ props.row.itmCount }}/{{ props.row.sessions }})
                    </span>
                  </q-td>
                </template>

                <template #body-cell-avgEntry="props">
                  <q-td :props="props">
                    <span v-if="props.row.avgEntry !== null">
                      {{ props.row.avgEntry.toLocaleString() }}
                      <span class="text-caption text-grey-6">
                        (표본 {{ props.row.entrySampleCount }}개)
                      </span>
                    </span>
                    <span v-else class="text-grey-6 text-caption"> 기록된 엔트리 없음 </span>
                  </q-td>
                </template>
              </q-table>
            </div>

            <div class="text-caption text-grey-7 q-mt-sm">
              ⚠ 평균 엔트리는 <b>토너 전체 엔트리 수가 기록된 세션만</b> 기준으로 계산됩니다.
            </div>
          </q-card>
        </section>
      </template>

      <div v-else class="q-pa-md text-grey-7">데이터가 없습니다. 세션을 먼저 기록해 주세요.</div>
    </div>
  </q-page>
</template>

<script setup>
import { onMounted, computed } from 'vue'
import { useVenueStatsStore } from 'src/stores/useVenueStatsStore'

const store = useVenueStatsStore()

onMounted(() => {
  store.load()
})

const stats = computed(() => store.data)
const loading = computed(() => store.loading)
const error = computed(() => store.error)

const columns = [
  { name: 'venueName', label: '매장', field: 'venueName', align: 'left' },
  { name: 'sessions', label: '세션 수', field: 'sessions', align: 'right' },
  { name: 'totalBuyIn', label: '총 바인', field: 'totalBuyIn', align: 'right' },
  { name: 'totalPrize', label: '총 프라이즈', field: 'totalPrize', align: 'right' },
  { name: 'totalProfit', label: '누적 수익', field: 'totalProfit', align: 'right' },
  { name: 'roi', label: 'ROI', field: 'roi', align: 'right' },
  { name: 'itmRatio', label: 'ITM률', field: 'itmRatio', align: 'right' },
  { name: 'avgEntry', label: '평균 엔트리', field: 'avgEntry', align: 'right' },
]

const formatCurrency = (v) => (v == null ? '-' : v.toLocaleString() + '원')
const formatPercent = (v) => (v == null ? '-' : v.toFixed(1) + '%')
const formatRatioPercent = (v) => (v == null ? '-' : (v * 100).toFixed(1) + '%')
</script>

<style scoped>
.stats-container {
  max-width: 1120px;
  margin: 0 auto;
  padding: 16px 16px 24px;
}

/* 헤더 */
.stats-header {
  margin-bottom: 16px;
}

/* KPI 그리드 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}

.kpi-card {
  padding: 12px 16px;
  border-radius: 16px;
}

.kpi-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.kpi-label {
  font-size: 12px;
  color: #9e9e9e;
  margin-bottom: 4px;
}

.kpi-value {
  font-size: 20px;
  font-weight: 700;
}

/* 아이콘 */
.kpi-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.kpi-icon-blue {
  background: #e3f2fd;
  color: #1976d2;
}

.kpi-icon-green {
  background: #e8f5e9;
  color: #2e7d32;
}

.kpi-icon-indigo {
  background: #e8eaf6;
  color: #3949ab;
}

.kpi-icon-orange {
  background: #fff3e0;
  color: #fb8c00;
}

/* Top venues 3개 카드 */
.top-venues {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
  margin-bottom: 16px;
}

.stats-card {
  padding: 12px 16px;
  border-radius: 16px;
}

/* 테이블 */
.stats-table-section {
  margin-top: 8px;
}

.table-wrapper {
  width: 100%;
  overflow-x: auto;
}

/* 데스크탑 반응형 */
@media (min-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(4, 1fr);
  }

  .top-venues {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
