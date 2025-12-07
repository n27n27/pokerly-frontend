<!-- src/components/statistics/ConditionTable.vue -->
<template>
  <q-card flat bordered class="bg-white">
    <q-card-section>
      <div class="text-subtitle1 text-weight-medium q-mb-xs">
        {{ title }}
      </div>

      <q-separator />

      <div v-if="!rows || rows.length === 0" class="q-pa-md text-grey-6 text-caption">
        데이터가 없습니다.
      </div>

      <q-table v-else :rows="rows" :columns="columns" row-key="score" flat dense hide-pagination>
        <template #body-cell-avgProfit="props">
          <q-td :props="props">
            {{ formatMoney(props.row.avgProfit) }}
          </q-td>
        </template>
      </q-table>
    </q-card-section>
  </q-card>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
  rows: {
    type: Array,
    default: () => [],
  },
})

const columns = [
  { name: 'score', label: '점수', field: 'score', align: 'center' },
  { name: 'count', label: '횟수', field: 'count', align: 'right' },
  { name: 'avgProfit', label: '평균 손익', field: 'avgProfit', align: 'right' },
]

const formatMoney = (v) => (typeof v === 'number' ? v.toLocaleString() : (v ?? '-'))
</script>
