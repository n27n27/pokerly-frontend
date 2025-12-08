<!-- src/pages/statistics/SessionPage.vue -->
<template>
  <q-page class="q-pa-md bg-grey-1">
    <div class="session-page-container">
      <!-- 제목 -->
      <div class="q-mb-md">
        <div class="text-h6 text-weight-bold q-mb-xs">세션 분석 요약</div>
        <div class="text-caption text-grey-7">전체 기간의 누적 결과를 요약한 영역입니다.</div>
      </div>

      <!-- 로딩 -->
      <q-inner-loading :showing="loading">
        <q-spinner size="40px" />
      </q-inner-loading>

      <!-- 에러 -->
      <div v-if="error" class="q-pa-sm q-mb-md bg-red-1 text-negative text-caption rounded-borders">
        통계를 불러오는 중 오류가 발생했습니다.
      </div>

      <div v-if="!loading">
        <!-- KPI 카드들 -->
        <div class="kpi-grid q-mb-lg">
          <KpiCard
            title="총 세션"
            :value="summary ? summary.totalSessions.toLocaleString() : '-'"
            icon="analytics"
          />
          <KpiCard
            title="총 바인"
            :value="summary ? formatMoney(summary.totalBuyIn) : '-'"
            icon="account_balance_wallet"
          />
          <KpiCard
            title="총 프라이즈"
            :value="summary ? formatMoney(summary.totalPrize) : '-'"
            icon="payments"
          />
          <KpiCard
            title="총 손익"
            :value="summary ? formatSigned(summary.totalProfit) : '-'"
            :positive="summary && summary.totalProfit > 0"
            :negative="summary && summary.totalProfit < 0"
            icon="trending_up"
          />
          <KpiCard
            title="전체 ROI"
            :value="summary ? formatPercent(summary.roi) : '-'"
            icon="percent"
          />
          <KpiCard
            title="ITM 횟수"
            :value="
              summary
                ? `${summary.itmCount.toLocaleString()} (${formatPercent(summary.itmRatio * 100)})`
                : '-'
            "
            icon="military_tech"
          />
        </div>

        <!-- 세션 타입별 성과 -->
        <q-card flat bordered class="bg-white q-mb-md">
          <q-card-section>
            <div class="text-subtitle1 text-weight-medium q-mb-xs">세션 타입별 성과</div>
            <div class="text-caption text-grey-6 q-mb-sm">
              매장 토너 / 메이저 대회 / 온라인 등 타입별로 몇 번 쳤고, 얼마나 벌었는지 정리한
              표입니다.
            </div>

            <q-separator />

            <q-table
              v-if="mappedTypeRows.length"
              :rows="mappedTypeRows"
              :columns="typeColumns"
              row-key="type"
              flat
              dense
              hide-pagination
            >
              <template #body-cell-totalProfit="props">
                <q-td :props="props">
                  {{ formatMoney(props.row.totalProfit) }}
                </q-td>
              </template>
              <template #body-cell-totalBuyIn="props">
                <q-td :props="props">
                  {{ formatMoney(props.row.totalBuyIn) }}
                </q-td>
              </template>
              <template #body-cell-roi="props">
                <q-td :props="props">
                  {{ formatPercent(props.row.roi) }}
                </q-td>
              </template>
              <template #body-cell-itmRatio="props">
                <q-td :props="props">
                  {{ formatPercent(props.row.itmRatio * 100) }}
                </q-td>
              </template>
            </q-table>

            <div v-else class="q-pa-md text-grey-6 text-caption">데이터가 없습니다.</div>
          </q-card-section>
        </q-card>

        <!-- 매장별 손익 (Top 3) -->
        <q-card flat bordered class="bg-white q-mb-md">
          <q-card-section>
            <div class="text-subtitle1 text-weight-medium q-mb-xs">매장별 손익 (Top 3)</div>
            <div class="text-caption text-grey-6 q-mb-sm">
              누적 손익 기준 상위 3개 매장을 보여줍니다. (마이너스 매장도 포함)
            </div>

            <q-separator />

            <q-table
              v-if="byVenue && byVenue.length"
              :rows="byVenue"
              :columns="venueColumns"
              row-key="venueId"
              flat
              dense
              hide-pagination
            >
              <template #body-cell-totalProfit="props">
                <q-td :props="props">
                  {{ formatMoney(props.row.totalProfit) }}
                </q-td>
              </template>
              <template #body-cell-totalBuyIn="props">
                <q-td :props="props">
                  {{ formatMoney(props.row.totalBuyIn) }}
                </q-td>
              </template>
              <template #body-cell-roi="props">
                <q-td :props="props">
                  {{ formatPercent(props.row.roi) }}
                </q-td>
              </template>
              <template #body-cell-itmRatio="props">
                <q-td :props="props">
                  {{ formatPercent(props.row.itmRatio * 100) }}
                </q-td>
              </template>
            </q-table>

            <div v-else class="q-pa-md text-grey-6 text-caption">표기할 매장이 없습니다.</div>
          </q-card-section>
        </q-card>

        <!-- ITM 패턴 -->
        <q-card flat bordered class="bg-white q-mb-md">
          <q-card-section>
            <div class="text-subtitle1 text-weight-medium q-mb-xs">ITM 패턴</div>
            <div class="text-caption text-grey-6 q-mb-sm">
              최대 연속 ITM / 탈락 횟수로, 최근 운의 변동성을 간단히 확인할 수 있습니다.
            </div>

            <q-separator class="q-mb-sm" />

            <div class="row q-col-gutter-sm">
              <div class="col-12 col-sm-6">
                <KpiCard
                  title="최대 연속 ITM"
                  :value="itmPattern ? itmPattern.maxConsecutiveItm.toString() : '-'"
                  icon="emoji_events"
                  positive
                />
              </div>
              <div class="col-12 col-sm-6">
                <KpiCard
                  title="최대 연속 탈락"
                  :value="itmPattern ? itmPattern.maxConsecutiveLose.toString() : '-'"
                  icon="sentiment_dissatisfied"
                  negative
                />
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- 컨디션 기반 성과 분석 -->
        <q-card flat bordered class="bg-white q-mb-md">
          <q-card-section>
            <div class="text-subtitle1 text-weight-medium q-mb-xs">컨디션 기반 성과 분석</div>
            <div class="text-caption text-grey-6 q-mb-md">
              일지에 기록한 컨디션 / 집중도 / 피로·에너지 점수와 그날 손익을 함께 보는 간단한
              분석입니다. (점수가 없는 날은 제외)
            </div>

            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-4">
                <ConditionTable title="기분(컨디션)" :rows="conditionAnalysis.byCondition || []" />
              </div>
              <div class="col-12 col-md-4">
                <ConditionTable title="집중도" :rows="conditionAnalysis.byMental || []" />
              </div>
              <div class="col-12 col-md-4">
                <ConditionTable title="피로 / 에너지" :rows="conditionAnalysis.byFatigue || []" />
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- Top / Worst 세션 -->
        <div class="row q-col-gutter-md q-mb-xl">
          <div class="col-12 col-md-6">
            <q-card flat bordered class="bg-white">
              <q-card-section>
                <div class="text-subtitle1 text-weight-medium text-positive q-mb-xs">Top 세션</div>
                <div class="text-caption text-grey-6 q-mb-sm">
                  손익 기준 상위 세션 몇 개를 빠르게 복기할 수 있는 목록입니다.
                </div>

                <q-separator class="q-mb-sm" />

                <div v-if="topSessions && topSessions.length">
                  <SessionListCard v-for="s in topSessions" :key="s.id" :session="s" />
                </div>
                <div v-else class="q-pa-md text-grey-6 text-caption">표시할 세션이 없습니다.</div>
              </q-card-section>
            </q-card>
          </div>

          <div class="col-12 col-md-6">
            <q-card flat bordered class="bg-white">
              <q-card-section>
                <div class="text-subtitle1 text-weight-medium text-negative q-mb-xs">
                  Worst 세션
                </div>
                <div class="text-caption text-grey-6 q-mb-sm">
                  크게 잃은 세션들을 모아서 복기할 수 있는 목록입니다.
                </div>

                <q-separator class="q-mb-sm" />

                <div v-if="worstSessions && worstSessions.length">
                  <SessionListCard v-for="s in worstSessions" :key="s.id" :session="s" />
                </div>
                <div v-else class="q-pa-md text-grey-6 text-caption">표시할 세션이 없습니다.</div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { onMounted, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useStatisticsSessionStore } from 'src/stores/statisticsSessionStore'

import KpiCard from 'src/components/statistics/KpiCard.vue'
import ConditionTable from 'src/components/statistics/ConditionTable.vue'
import SessionListCard from 'src/components/statistics/SessionListCard.vue'

const store = useStatisticsSessionStore()

const {
  loading,
  error,
  summary,
  byType,
  byVenue,
  itmPattern,
  conditionAnalysis,
  topSessions,
  worstSessions,
} = storeToRefs(store)

const { load } = store

onMounted(() => {
  load()
})

// ----- 테이블 컬럼 -----
const typeColumns = [
  { name: 'typeLabel', label: '타입', field: 'typeLabel', align: 'left' },
  { name: 'sessions', label: '세션 수', field: 'sessions', align: 'right' },
  { name: 'totalBuyIn', label: '총 바인', field: 'totalBuyIn', align: 'right' },
  { name: 'totalProfit', label: '총 손익', field: 'totalProfit', align: 'right' },
  { name: 'roi', label: 'ROI', field: 'roi', align: 'right' },
  { name: 'itmCount', label: 'ITM 횟수', field: 'itmCount', align: 'right' },
  { name: 'itmRatio', label: 'ITM 비율', field: 'itmRatio', align: 'right' },
]

const venueColumns = [
  { name: 'venueName', label: '매장', field: 'venueName', align: 'left' },
  { name: 'sessions', label: '세션 수', field: 'sessions', align: 'right' },
  { name: 'totalBuyIn', label: '총 바인', field: 'totalBuyIn', align: 'right' },
  { name: 'totalProfit', label: '총 손익', field: 'totalProfit', align: 'right' },
  { name: 'roi', label: 'ROI', field: 'roi', align: 'right' },
  { name: 'itmRatio', label: 'ITM 비율', field: 'itmRatio', align: 'right' },
]

// 타입 라벨 변환
const mappedTypeRows = computed(() =>
  (byType.value ?? []).map((row) => ({
    ...row,
    typeLabel: translateType(row.type),
  })),
)

function translateType(type) {
  switch (type) {
    case 'VENUE':
      return '매장 토너'
    case 'MAJOR':
      return '메이저 대회'
    case 'ONLINE':
      return '온라인'
    default:
      return type || '기타'
  }
}

// ----- 포맷터 -----
function formatMoney(v) {
  if (typeof v !== 'number') return v ?? '-'
  return v.toLocaleString()
}

function formatSigned(v) {
  if (typeof v !== 'number') return v ?? '-'
  if (v > 0) return `+${v.toLocaleString()}`
  if (v < 0) return v.toLocaleString()
  return '0'
}

function formatPercent(v) {
  if (typeof v !== 'number') return '-'
  return `${v.toFixed(1)}%`
}
</script>

<style scoped>
.session-page-container {
  max-width: 900px;
  margin: 0 auto;
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 12px;
}
</style>
