<template>
  <div class="row q-col-gutter-md q-mb-lg">
    <div class="col-6 col-md-3" v-for="item in kpiItems" :key="item.key">
      <q-card flat bordered class="q-pa-md dashboard-card dashboard-card--kpi">
        <!-- 라벨 + 아이콘 -->
        <div class="row items-center justify-between q-mb-xs">
          <div class="text-caption text-grey-6">
            {{ item.label }}
          </div>
          <q-icon :name="item.icon" size="18px" :class="item.iconClass" />
        </div>

        <!-- 값 -->
        <div class="text-h6 text-weight-bold" :class="item.valueClass">
          {{ item.value }}
        </div>
      </q-card>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  kpis: {
    default: () => null,
  },
})

const kpiItems = computed(() => {
  const k = props.kpis
  if (!k) return []

  const formatMoney = (v) => (v == null ? '-' : v.toLocaleString('ko-KR'))

  // ROI 표현 로직
  let roiText = '-'
  let roiClass = 'text-secondary'

  if (k.roiPercent != null) {
    roiText = `${k.roiPercent.toFixed(1)}%`
    if (k.roiPercent > 0) {
      roiClass = 'text-positive'
    } else if (k.roiPercent < 0) {
      roiClass = 'text-negative'
    } else {
      roiClass = 'text-grey-8'
    }
  }

  return [
    {
      key: 'profit',
      label: '이번 달 총 이익',
      value: formatMoney(k.totalProfit),
      icon: 'trending_up',
      iconClass: k.totalProfit >= 0 ? 'text-positive' : 'text-negative',
      valueClass: k.totalProfit >= 0 ? 'text-positive' : 'text-negative',
    },
    {
      key: 'buyin',
      label: '이번 달 총 바인',
      value: formatMoney(k.totalBuyIn),
      icon: 'account_balance_wallet',
      iconClass: 'text-primary',
      valueClass: '',
    },
    {
      key: 'prize',
      label: '이번 달 총 프라이즈',
      value: formatMoney(k.totalPrize),
      icon: 'emoji_events',
      iconClass: 'text-warning',
      valueClass: '',
    },
    {
      key: 'roi',
      label: 'ROI',
      value: roiText,
      icon: 'percent',
      iconClass: roiClass,
      valueClass: roiClass,
    },
  ]
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

/* KPI 카드 상단 라인 */
.dashboard-card--kpi {
  border-top-width: 3px;
  border-top-style: solid;
  border-top-color: rgba(0, 0, 0, 0.03);
}
</style>
