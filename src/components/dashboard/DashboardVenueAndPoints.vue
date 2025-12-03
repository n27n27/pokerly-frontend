<template>
  <div class="row q-col-gutter-md q-mb-lg">
    <!-- 매장 이익 Top -->
    <div class="col-12 col-md-6">
      <q-card flat bordered class="q-pa-md dashboard-card">
        <div class="row items-center justify-between q-mb-sm">
          <div class="text-subtitle1 text-weight-bold">매장별 이익 TOP</div>
          <div class="text-caption text-grey-6">이번 달 기준</div>
        </div>

        <div v-if="!topProfitVenues?.length" class="text-caption text-grey-6">
          이번 달 세션이 없습니다.
        </div>

        <q-list v-else dense separator>
          <q-item v-for="(v, idx) in topProfitVenues" :key="v.venueId">
            <q-item-section side top>
              <q-badge outline color="primary" class="text-weight-bold">
                {{ idx + 1 }}
              </q-badge>
            </q-item-section>

            <q-item-section>
              <q-item-label class="text-body2">
                {{ v.venueName }}
              </q-item-label>
              <q-item-label caption class="text-grey-7">
                {{ v.sessionCount }}회 · 바인 {{ formatMoney(v.totalBuyIn) }} · 프라이즈
                {{ formatMoney(v.totalPrize) }}
              </q-item-label>
            </q-item-section>

            <q-item-section side top>
              <span
                class="text-weight-bold"
                :class="v.totalProfit >= 0 ? 'text-positive' : 'text-negative'"
              >
                {{ formatMoney(v.totalProfit) }}
              </span>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card>
    </div>

    <!-- 잔여 포인트 매장 -->
    <div class="col-12 col-md-6">
      <q-card flat bordered class="q-pa-md dashboard-card">
        <div class="row items-center justify-between q-mb-sm">
          <div class="text-subtitle1 text-weight-bold">잔여 포인트 매장</div>
          <div class="text-caption text-grey-6">포인트 많은 순</div>
        </div>

        <div v-if="!remainingPointVenues?.length" class="text-caption text-grey-6">
          잔여 포인트가 있는 매장이 없습니다.
        </div>

        <div v-else class="row no-wrap q-col-gutter-sm scroll-x q-mt-xs">
          <div v-for="v in remainingPointVenues" :key="v.venueId" class="col-auto">
            <q-card flat bordered class="q-pa-sm dashboard-card point-pill">
              <div class="text-body2 text-weight-bold">
                {{ v.venueName }}
              </div>
              <div class="text-caption text-grey-7 q-mt-xs">잔여 포인트</div>
              <div class="text-subtitle2 text-weight-bold">
                {{ formatMoney(v.remainingPoint) }}
              </div>
            </q-card>
          </div>
        </div>
      </q-card>
    </div>
  </div>
</template>

<script setup>
defineProps({
  topProfitVenues: {
    default: () => [],
  },
  remainingPointVenues: {
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

/* 포인트 카드 살짝 pill 느낌 */
.point-pill {
  min-width: 150px;
  border-radius: 12px;
}
.scroll-x {
  overflow-x: auto;
}
</style>
