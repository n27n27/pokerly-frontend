import { api } from 'src/boot/axios'

// 1) 내 핸드 목록 가져오기 (이미 분석 + 저장된 것들)
export const fetchHands = async () => {
  const res = await api.get('/hand-review')
  return res.data.data || []
}

// 2) Simple 분석 + 저장 (백엔드 기준: analyzeAndCreate)
export const simpleAnalyzeAndSave = async (payload) => {
  const res = await api.post('/hand-review/simple', payload)
  return res.data.data // HandReviewResponse
}
