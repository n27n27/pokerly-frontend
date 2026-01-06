const nfInt = new Intl.NumberFormat('ko-KR', {
  maximumFractionDigits: 0,
})

export function formatNumber(value, opts = {}) {
  const {
    fractionDigits = 0, // 기본은 정수(칩/금액)
    empty = '-', // null/undefined 표시
  } = opts

  if (value === null || value === undefined || value === '') return empty

  const num = typeof value === 'number' ? value : Number(String(value).replace(/,/g, ''))
  if (!Number.isFinite(num)) return empty

  if (fractionDigits > 0) {
    return new Intl.NumberFormat('ko-KR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: fractionDigits,
    }).format(num)
  }

  // 정수는 성능 좋게 캐시된 formatter 사용
  return nfInt.format(Math.trunc(num))
}

export function parseNumber(input) {
  if (input === null || input === undefined) return null
  const s = String(input).trim()
  if (!s) return null

  // 콤마, 공백 제거 + 숫자/소수점/음수만 허용
  const cleaned = s.replace(/,/g, '').replace(/[^\d.-]/g, '')
  if (!cleaned || cleaned === '-' || cleaned === '.' || cleaned === '-.') return null

  const n = Number(cleaned)
  return Number.isFinite(n) ? n : null
}
