<template>
  <button
    class="app-date-picker"
    type="button"
    :aria-label="ariaLabel"
    @click="openPicker"
  >
    <span :class="{ placeholder: !modelValue }">{{ displayValue }}</span>
    <q-icon name="calendar_month" size="20px" />
  </button>

  <q-dialog v-model="opened" position="bottom">
    <q-card class="date-picker-sheet">
      <span class="date-picker-sheet__handle" aria-hidden="true"></span>

      <header class="date-picker-sheet__header">
        <h2>날짜 선택</h2>
        <button type="button" @click="selectToday">오늘</button>
      </header>

      <q-date
        v-model="draftValue"
        class="date-picker-sheet__calendar"
        flat
        minimal
        color="primary"
        mask="YYYY-MM-DD"
        :locale="koreanLocale"
      />

      <footer class="date-picker-sheet__actions">
        <button type="button" @click="opened = false">취소</button>
        <button type="button" class="primary" :disabled="!draftValue" @click="confirmDate">
          선택하기
        </button>
      </footer>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { computed, ref } from 'vue'

import { formatLocalDate } from 'src/utils/localDate'

const props = defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: '날짜를 선택해주세요' },
  ariaLabel: { type: String, default: '날짜 선택' },
})

const emit = defineEmits(['update:modelValue'])

const opened = ref(false)
const draftValue = ref('')

const koreanLocale = {
  days: ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'],
  daysShort: ['일', '월', '화', '수', '목', '금', '토'],
  months: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
  monthsShort: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
  firstDayOfWeek: 0,
  format24h: true,
  pluralDay: '일',
}

const displayValue = computed(() => {
  if (!props.modelValue) return props.placeholder
  const [year, month, day] = props.modelValue.split('-')
  return year && month && day ? `${year}. ${month}. ${day}.` : props.modelValue
})

const openPicker = () => {
  draftValue.value = props.modelValue || formatLocalDate()
  opened.value = true
}

const selectToday = () => {
  draftValue.value = formatLocalDate()
}

const confirmDate = () => {
  if (!draftValue.value) return
  emit('update:modelValue', draftValue.value)
  opened.value = false
}
</script>

<style scoped>
.app-date-picker {
  display: flex;
  width: 100%;
  height: 44px;
  align-items: center;
  justify-content: space-between;
  padding: 0 11px 0 12px;
  border: 1px solid var(--v2-border);
  border-radius: 10px;
  outline: 0;
  background: #fbfaff;
  color: var(--v2-text-main);
  font: inherit;
  font-size: 13px;
  text-align: left;
}

.app-date-picker:focus-visible {
  border-color: rgba(109, 69, 232, .48);
  background: #fff;
  box-shadow: 0 0 0 3px rgba(109, 69, 232, .08);
}

.app-date-picker .placeholder,
.app-date-picker .q-icon {
  color: var(--v2-text-sub);
}

.date-picker-sheet {
  width: min(100%, 420px);
  padding: 10px 18px calc(18px + env(safe-area-inset-bottom));
  border-radius: 20px 20px 0 0;
  background: #fff;
}

.date-picker-sheet__handle {
  display: block;
  width: 46px;
  height: 5px;
  margin: 0 auto 15px;
  border-radius: 999px;
  background: #aaa5b7;
}

.date-picker-sheet__header {
  display: flex;
  min-height: 36px;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}

.date-picker-sheet__header h2 {
  margin: 0;
  color: var(--v2-text-main);
  font-size: 17px;
  font-weight: 620;
}

.date-picker-sheet__header button {
  min-height: 34px;
  padding: 0 10px;
  border: 0;
  border-radius: 9px;
  background: var(--v2-primary-soft);
  color: var(--v2-primary);
  font: inherit;
  font-size: 12px;
  font-weight: 600;
}

.date-picker-sheet__calendar {
  width: 100%;
  max-width: none;
  color: var(--v2-text-main);
  box-shadow: none;
}

.date-picker-sheet__calendar :deep(.q-date__view) {
  min-height: 290px;
  padding-inline: 0;
}

.date-picker-sheet__calendar :deep(.q-date__calendar-weekdays > div) {
  color: var(--v2-text-sub);
  font-weight: 560;
}

.date-picker-sheet__actions {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 8px;
  margin-top: 8px;
}

.date-picker-sheet__actions button {
  min-height: 46px;
  border: 0;
  border-radius: 11px;
  background: #f0edf7;
  color: var(--v2-text-main);
  font: inherit;
  font-size: 13px;
  font-weight: 600;
}

.date-picker-sheet__actions button.primary {
  background: var(--v2-primary);
  color: #fff;
}

.date-picker-sheet__actions button:disabled {
  background: var(--v2-primary-soft);
  color: #aaa5b7;
}
</style>
