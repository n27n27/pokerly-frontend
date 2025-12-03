<template>
  <div class="row q-col-gutter-md q-mb-lg">
    <!-- 최근 6개월 추세 -->
    <div class="col-12 col-md-6">
      <q-card flat bordered class="q-pa-md dashboard-card">
        <div class="row items-center justify-between q-mb-sm">
          <div class="text-subtitle1 text-weight-bold">최근 6개월 손익 추세</div>
          <div class="text-caption text-grey-6">월별 바인 / 프라이즈 / 이익</div>
        </div>

        <div v-if="!last6Months?.length" class="text-caption text-grey-6">
          아직 통계 데이터가 없습니다.
        </div>

        <DashboardTrendChart v-else :last6Months="last6Months" />
      </q-card>
    </div>

    <!-- 최근 세션 -->
    <div class="col-12 col-md-6">
      <q-card flat bordered class="q-pa-md dashboard-card">
        <div class="row items-center justify-between q-mb-sm">
          <div class="text-subtitle1 text-weight-bold">최근 세션</div>
          <div class="text-caption text-grey-6">최신 3개 세션</div>
        </div>

        <div v-if="!recentSessions?.length" class="text-caption text-grey-6">
          최근 세션이 없습니다.
        </div>

        <q-list v-else dense separator class="rounded-borders">
          <q-item v-for="s in recentSessions" :key="s.id">
            <q-item-section>
              <q-item-label class="text-body2">
                {{ s.playDate }} · {{ s.venueName || '매장 없음' }}
              </q-item-label>
              <q-item-label caption class="text-grey-7">
                바인 {{ formatMoney(s.totalBuyIn) }} · 프라이즈 {{ formatMoney(s.prize) }}
              </q-item-label>
            </q-item-section>

            <q-item-section side top>
              <span
                class="text-weight-bold"
                :class="s.profit >= 0 ? 'text-positive' : 'text-negative'"
              >
                {{ formatMoney(s.profit) }}
              </span>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card>
    </div>
  </div>
</template>

<script setup>
import DashboardTrendChart from 'src/components/dashboard/DashboardTrendChart.vue'

defineProps({
  last6Months: {
    default: () => [],
  },
  recentSessions: {
    default: () => [],
  },
})

function formatMoney(value) {
  if (value == null) return '-'
  return value.toLocaleString('ko-KR')
}
</script>

<style scoped>
.dashboard-card {
  border-radius: 14px;
  background: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  transition:
    transform 0.15s ease,
    box-shadow 0.2s ease;
}

.dashboard-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
}
</style>
