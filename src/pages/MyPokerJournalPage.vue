<template>
  <!-- 배경은 살짝 회색, 실제 내용은 가운데 컨테이너에 모으기 -->
  <q-page class="q-pa-md bg-grey-2">
    <div class="journal-container">
      <!-- 상단 헤더 -->
      <div class="journal-header">
        <div class="text-h5">일지</div>
        <div class="text-caption text-grey-7">
          하루 컨디션·멘탈·플레이 총평을 기록하는 탭입니다.
        </div>
      </div>

      <q-separator spaced />

      <!-- 메인 레이아웃 -->
      <div class="row q-col-gutter-md items-start">
        <!-- 좌측: 달력 카드 -->
        <div class="col-12 col-md-4">
          <q-card flat bordered class="q-pa-md bg-white">
            <div class="text-subtitle1 q-mb-sm">날짜 선택</div>
            <JournalCalendar
              :selected-date="selectedDate"
              :monthly="monthly"
              @select-date="onSelectDate"
              @month-changed="onMonthChanged"
            />
          </q-card>
        </div>

        <!-- 우측: 일지 카드 -->
        <div class="col-12 col-md-8">
          <q-card flat bordered class="q-pa-md bg-white">
            <!-- 카드 헤더 -->
            <div class="row items-center justify-between q-mb-sm">
              <div class="text-subtitle1">{{ selectedDate }} 일지</div>

              <div v-if="!editing && !loading">
                <q-btn
                  v-if="!journal"
                  color="primary"
                  label="일지 작성하기"
                  icon="add"
                  dense
                  @click="openCreate"
                />
              </div>
            </div>

            <q-separator />

            <!-- 로딩 -->
            <div v-if="loading" class="q-my-md flex flex-center">
              <q-spinner />
            </div>

            <!-- 조회 모드 -->
            <JournalView
              v-if="journal && !editing && !loading"
              :journal="journal"
              @edit="startEdit"
              @delete="deleteJournal"
            />

            <!-- 작성/수정 폼 -->
            <JournalForm
              v-if="editing"
              :initial="journal"
              :date="selectedDate"
              @cancel="cancelEdit"
              @submit="submitJournal"
            />

            <!-- 일지 없음 + 비편집 -->
            <div v-if="!journal && !editing && !loading" class="text-grey text-body2 q-mt-md">
              아직 이 날짜의 일지가 없습니다. “일지 작성하기” 버튼을 눌러 오늘의 컨디션과 플레이를
              기록해 보세요.
            </div>
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useJournalStore } from 'src/stores/journalStore'
import JournalCalendar from 'src/components/journal/JournalCalendar.vue'
import JournalView from 'src/components/journal/JournalView.vue'
import JournalForm from 'src/components/journal/JournalForm.vue'
import { storeToRefs } from 'pinia'

const journalStore = useJournalStore()
// 🔹 state, getter 는 항상 storeToRefs 로
const { journal, monthly, loading } = storeToRefs(journalStore)

// 🔹 함수(action)은 그대로 구조 분해해도 됨
const { loadMonthly, loadByDate, create, update, remove } = journalStore

const d = new Date()
const today = [
  d.getFullYear(),
  String(d.getMonth() + 1).padStart(2, '0'),
  String(d.getDate()).padStart(2, '0'),
].join('-')

const selectedDate = ref(today)
const editing = ref(false)

const onSelectDate = async (date) => {
  if (!date) return
  selectedDate.value = date
  await loadByDate(date)
  editing.value = false
}

const onMonthChanged = async ({ year, month }) => {
  await loadMonthly(year, month)
}

const openCreate = () => {
  editing.value = true
}

const startEdit = () => {
  editing.value = true
}

const cancelEdit = () => {
  editing.value = false
}

const submitJournal = async (form) => {
  if (journal && journal.value && journal.value.id) {
    await update(journal.value.id, form)
  } else {
    await create(form)
  }

  editing.value = false
}

const deleteJournal = async () => {
  if (!journal.value) return
  await remove(journal.value.id)
  editing.value = false
}

onMounted(async () => {
  const [year, month] = today.split('-')
  await loadMonthly(Number(year), Number(month))
  await loadByDate(selectedDate.value)
})
</script>

<style scoped>
/* 전체 내용을 왼쪽 기준으로 두고, 너무 넓어지지 않게 최대 폭만 제한 */
.journal-container {
  max-width: 1100px;
  width: 100%;
  margin: 0 auto;
  padding: 0 8px;
}

/* 헤더와 카드가 하나의 블록처럼 보이도록 약간만 간격 */
.journal-header {
  margin-bottom: 4px;
}
</style>
