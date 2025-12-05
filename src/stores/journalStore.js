import { defineStore } from 'pinia'
import {
  createJournal,
  updateJournal,
  deleteJournal,
  fetchJournalByDate,
  fetchMonthlyJournals,
} from 'src/api/journal'
import { ref } from 'vue'

export const useJournalStore = defineStore('journal', () => {
  const journal = ref(null)
  const monthly = ref([])
  const loading = ref(false)

  // 날짜 기준 로드
  const loadByDate = async (date) => {
    if (!date) {
      journal.value = null
      return
    }
    loading.value = true
    try {
      const res = await fetchJournalByDate(date)
      journal.value = res
    } catch (e) {
      // 해당 날짜에 일지가 없는 경우
      journal.value = null
      // 다른 에러는 그대로 throw 해도 됨
      if (e?.response?.status !== 404) throw e
    } finally {
      loading.value = false
    }
  }

  // 월별 데이터 로딩
  const loadMonthly = async (year, month) => {
    monthly.value = await fetchMonthlyJournals(year, month)
  }

  // 생성
  const create = async (payload) => {
    const res = await createJournal(payload)
    journal.value = res
    return res
  }

  // 수정
  const update = async (id, payload) => {
    const res = await updateJournal(id, payload)
    journal.value = res
    return res
  }

  // 삭제
  const remove = async (id) => {
    await deleteJournal(id)
    journal.value = null
  }

  return {
    journal,
    monthly,
    loading,
    loadByDate,
    loadMonthly,
    create,
    update,
    remove,
  }
})
