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

  // 월 배열 정렬 (journalDate 기준)
  const sortMonthly = () => {
    monthly.value.sort((a, b) => {
      const da = String(a.journalDate || '')
      const db = String(b.journalDate || '')
      return da.localeCompare(db)
    })
  }

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
      // 다른 에러는 그대로 throw
      if (e?.response?.status !== 404) throw e
    } finally {
      loading.value = false
    }
  }

  // 월별 데이터 로딩
  const loadMonthly = async (year, month) => {
    monthly.value = await fetchMonthlyJournals(year, month)
    sortMonthly()
  }

  // 생성
  const create = async (payload) => {
    const res = await createJournal(payload)
    journal.value = res

    // ✅ monthly에도 반영
    if (res) {
      const idx = monthly.value.findIndex((m) => m.id === res.id)
      if (idx >= 0) {
        monthly.value[idx] = res
      } else {
        monthly.value.push(res)
      }
      sortMonthly()
    }

    return res
  }

  // 수정
  const update = async (id, payload) => {
    const res = await updateJournal(id, payload)
    journal.value = res

    // ✅ monthly에도 반영
    if (res) {
      const idx = monthly.value.findIndex((m) => m.id === res.id)
      if (idx >= 0) {
        monthly.value[idx] = res
      } else {
        monthly.value.push(res)
      }
      sortMonthly()
    }

    return res
  }

  // 삭제
  const remove = async (id) => {
    await deleteJournal(id)
    journal.value = null

    // ✅ monthly에서도 제거
    monthly.value = monthly.value.filter((m) => m.id !== id)
    // 정렬은 크게 의미 없지만, 일관성 위해 유지
    sortMonthly()
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
