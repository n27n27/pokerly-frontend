import api from 'src/boot/axios'

export const SessionApi = {
  listByRange({ from, to }) {
    return api.get('/api/sessions', { params: { from, to } }).then((r) => r.data)
  },
  create(payload) {
    return api.post('/api/sessions', payload).then((r) => r.data)
  },
  update(id, payload) {
    return api.put(`/api/sessions/${id}`, payload).then((r) => r.data)
  },
  remove(id) {
    return api.delete(`/api/sessions/${id}`)
  },
}
