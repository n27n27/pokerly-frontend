<template>
  <div>
    <apex-chart type="line" height="260" :options="chartOptions" :series="series" />
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  last6Months: {
    default: () => [],
  },
})

const labels = computed(() => props.last6Months.map((m) => `${m.year % 100}/${m.month}`))

const series = computed(() => [
  {
    name: '이익',
    data: props.last6Months.map((m) => m.profit),
  },
  {
    name: '바인',
    data: props.last6Months.map((m) => m.totalBuyIn),
  },
  {
    name: '프라이즈',
    data: props.last6Months.map((m) => m.totalPrize),
  },
])

const chartOptions = computed(() => ({
  chart: {
    toolbar: { show: false },
    zoom: { enabled: false },
  },
  stroke: {
    curve: 'smooth',
    width: [3, 2, 2],
  },
  dataLabels: { enabled: false },
  xaxis: {
    categories: labels.value,
    labels: {
      style: { fontSize: '11px' },
    },
  },
  yaxis: {
    labels: {
      formatter: (val) => (val === 0 ? '0' : val.toLocaleString('ko-KR')),
    },
  },
  colors: ['#21ba45', '#9e9e9e', '#1976d2'], // 이익, 바인, 프라이즈
  legend: {
    position: 'top',
    horizontalAlign: 'right',
  },
  grid: {
    borderColor: '#eee',
  },
  tooltip: {
    y: {
      formatter: (val) => val.toLocaleString('ko-KR'),
    },
  },
}))
</script>
