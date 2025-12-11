<template>
  <div class="row q-col-gutter-md">
    <!-- ================== 매장별 이익 TOP ================== -->
    <div class="col-12 col-md-6">
      <!-- 이익 난 매장이 있을 때만 TOP 카드 표시 -->
      <q-card
        v-if="positiveProfitVenues.length"
        flat
        bordered
        class="q-pa-md bg-white dashboard-card"
      >
        <div class="row items-center justify-between q-mb-sm">
          <div class="text-subtitle1 text-weight-bold">매장별 이익 TOP</div>
          <div class="text-caption text-grey-6">이번 달 기준</div>
        </div>

        <q-list dense>
          <q-item
            v-for="(venue, index) in positiveProfitVenues"
            :key="venue.venueId || venue.venueName || index"
          >
            <!-- 순위 뱃지 -->
            <q-item-section avatar>
              <q-badge rounded color="primary" text-color="white">
                {{ index + 1 }}
              </q-badge>
            </q-item-section>

            <!-- 매장 이름 -->
            <q-item-section>
              <div class="text-body1 text-weight-medium">
                {{ venue.venueName }}
              </div>
            </q-item-section>

            <!-- 수익금 -->
            <q-item-section side>
              <div class="text-body1 text-weight-bold text-positive">
                {{ formatMoney(getProfit(venue)) }}
              </div>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card>

      <!-- 이익이 양수인 매장이 하나도 없을 때 -->
      <q-card v-else flat bordered class="q-pa-md bg-white dashboard-card">
        <div class="row items-center justify-between q-mb-xs">
          <div class="text-subtitle1 text-weight-bold">매장별 이익</div>
          <div class="text-caption text-grey-6">이번 달 기준</div>
        </div>
        <div class="text-caption text-grey-7 q-mt-sm">이번 달에는 이익이 난 매장이 없습니다.</div>
      </q-card>
    </div>

    <!-- ================== 잔여 포인트 매장 ================== -->
    <div class="col-12 col-md-6">
      <q-card flat bordered class="q-pa-md bg-white dashboard-card">
        <div class="row items-center justify-between q-mb-sm">
          <div class="text-subtitle1 text-weight-bold">잔여 포인트 매장</div>
          <div class="text-caption text-grey-6">포인트 많은 순</div>
        </div>

        <template v-if="sortedRemainingPointVenues.length">
          <q-list dense>
            <q-item
              v-for="(venue, index) in sortedRemainingPointVenues"
              :key="venue.venueId || venue.venueName || index"
            >
              <!-- 순위 -->
              <q-item-section avatar>
                <q-badge rounded outline color="grey-7">
                  {{ index + 1 }}
                </q-badge>
              </q-item-section>

              <!-- 매장 이름 -->
              <q-item-section>
                <div class="text-body1 text-weight-medium">
                  {{ venue.venueName }}
                </div>
                <div class="text-caption text-grey-7">잔여 포인트</div>
              </q-item-section>

              <!-- 잔여 포인트 -->
              <q-item-section side>
                <div class="text-body1 text-weight-bold">
                  {{ formatMoney(venue.remainingPoint ?? venue.point ?? 0) }}
                </div>
              </q-item-section>
            </q-item>
          </q-list>
        </template>

        <template v-else>
          <div class="text-caption text-grey-7 q-mt-sm">잔여 포인트가 등록된 매장이 없습니다.</div>
        </template>
      </q-card>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  topProfitVenues: {
    type: Array,
    default: () => [],
  },
  remainingPointVenues: {
    type: Array,
    default: () => [],
  },
})

// 부모에서 쓰는 것과 동일한 후보 키 우선순위
function getProfit(v) {
  return Number(v.totalProfit ?? v.profit ?? v.monthlyProfit ?? v.profitCashRealized ?? 0)
}

function formatMoney(v) {
  if (v == null) return '-'
  return Number(v).toLocaleString('ko-KR')
}

// 1) 이익이 양수인 매장만 필터
// 2) 내림차순 정렬
// 3) 상위 3개만 사용 (원하면 slice 부분 수정)
const positiveProfitVenues = computed(() =>
  [...props.topProfitVenues]
    .filter((v) => getProfit(v) > 0)
    .sort((a, b) => getProfit(b) - getProfit(a))
    .slice(0, 3),
)

// 잔여 포인트는 많은 순으로 정렬
const sortedRemainingPointVenues = computed(() => {
  return [...props.remainingPointVenues].sort((a, b) => {
    const pa = Number(a.remainingPoint ?? a.point ?? 0)
    const pb = Number(b.remainingPoint ?? b.point ?? 0)
    return pb - pa
  })
})
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

/* 공통 hover 효과 */
.dashboard-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
}
</style>
