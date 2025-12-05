<template>
  <div class="journal-calendar">
    <q-date
      v-model="localDate"
      mask="YYYY-MM-DD"
      @update:model-value="emitDate"
      @navigation="onNavigation"
      :events="eventDates"
      event-color="primary"
      minimal
    />
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'

const props = defineProps({
  selectedDate: String,
  monthly: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['select-date', 'month-changed'])

const localDate = ref(props.selectedDate || '')

/**
 * 🔹 일지 있는 날짜를 QDate events 포맷(YYYY/MM/DD)으로 변환
 *   - 백엔드: "2025-12-05"
 *   - QDate:  "2025/12/05"
 */
const eventDates = computed(() =>
  (props.monthly || []).map((m) => String(m.journalDate || '').replace(/-/g, '/')).filter(Boolean),
)

/* 날짜 선택 emit */
const emitDate = (v) => {
  emit('select-date', v)
}

/* 월 변경 emit */
const onNavigation = ({ year, month }) => {
  emit('month-changed', { year, month })
}

/* selectedDate 변경 시 캘린더 선택도 맞춰주기 */
watch(
  () => props.selectedDate,
  (v) => {
    if (v && v !== localDate.value) {
      localDate.value = v
    }
  },
)
</script>

<style scoped>
.journal-calendar .q-date {
  width: 100%;
  max-width: 100%;
  margin: 0; /* 가운데 정렬 깨기 */
}
</style>
