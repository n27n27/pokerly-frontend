import { api } from 'boot/axios'

export const createJournal = async (payload) => {
  const res = await api.post('/journals', payload)
  return res.data.data
}

export const updateJournal = async (id, payload) => {
  const res = await api.put(`/journals/${id}`, payload)
  return res.data.data
}

export const deleteJournal = async (id) => {
  const res = await api.delete(`/journals/${id}`)
  return res.data.data
}

export const fetchJournalByDate = async (date) => {
  const res = await api.get('/journals', {
    params: { date },
  })
  return res.data.data
}

export const fetchJournalById = async (id) => {
  const res = await api.get(`/journals/${id}`)
  return res.data.data
}

export const fetchMonthlyJournals = async (year, month) => {
  const res = await api.get('/journals/monthly', {
    params: { year, month },
  })
  return res.data.data
}
