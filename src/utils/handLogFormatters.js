export const getChipDeltaNumber = (value) => {
  return Number(value || 0)
}

export const formatNumber = (value) => {
  return Number(value || 0).toLocaleString('ko-KR')
}

export const formatChipDelta = (value) => {
  const numberValue = Number(value || 0)
  const formatted = Math.abs(numberValue).toLocaleString('ko-KR')

  if (numberValue > 0) {
    return `+${formatted}`
  }

  if (numberValue < 0) {
    return `-${formatted}`
  }

  return '0'
}

export const buildLevelLabel = (log) => {
  if (!log?.levelNo && !log?.blindText) {
    return '레벨 미지정'
  }

  if (!log?.levelNo) {
    return log.blindText
  }

  if (!log?.blindText) {
    return `${log.levelNo}레벨`
  }

  return `${log.levelNo}레벨 ${log.blindText}`
}

export const buildLogSummary = (log) => {
  if (!log) {
    return ''
  }

  const parts = [log.actionType, log.resultType].filter(Boolean)

  if (parts.length === 0) {
    return '간단 기록'
  }

  return parts.join(' · ')
}
