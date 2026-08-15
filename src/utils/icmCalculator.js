export const allocateRoundedTotal = (values, total) => {
  if (!values.length) return []

  const roundedTotal = Math.round(Number(total) || 0)
  const allocated = values.map((value) => Math.floor(Number(value) || 0))
  let remainder = roundedTotal - allocated.reduce((sum, value) => sum + value, 0)
  const fractionalOrder = values
    .map((value, index) => ({ index, fraction: Number(value) - Math.floor(Number(value)) }))
    .sort((a, b) => b.fraction - a.fraction || a.index - b.index)

  for (let index = 0; index < remainder; index += 1) {
    allocated[fractionalOrder[index % fractionalOrder.length].index] += 1
  }
  return allocated
}
