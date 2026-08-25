export const allocateRoundedTotal = (values, total, decimalPlaces = 0) => {
  if (!values.length) return []

  const precision = Math.max(0, Math.min(8, Math.trunc(Number(decimalPlaces) || 0)))
  const scale = 10 ** precision
  const roundedTotal = Math.round((Number(total) || 0) * scale)
  const scaledValues = values.map((value) => (Number(value) || 0) * scale)
  const allocated = scaledValues.map((value) => Math.floor(value))
  let remainder = roundedTotal - allocated.reduce((sum, value) => sum + value, 0)
  const fractionalOrder = values
    .map((_, index) => ({
      index,
      fraction: scaledValues[index] - Math.floor(scaledValues[index]),
    }))
    .sort((a, b) => b.fraction - a.fraction || a.index - b.index)

  for (let index = 0; index < remainder; index += 1) {
    allocated[fractionalOrder[index % fractionalOrder.length].index] += 1
  }
  return allocated.map((value) => value / scale)
}

export const calculateIcmFinishProbabilities = (stacks) => {
  const numericStacks = stacks.map((stack) => Number(stack) || 0)
  const probabilities = numericStacks.map(() => Array(numericStacks.length).fill(0))

  const recurse = (remainingPlayers, remainingPlaces, probability) => {
    if (!remainingPlaces.length || !remainingPlayers.length) return
    const total = remainingPlayers.reduce((sum, playerIndex) => sum + numericStacks[playerIndex], 0)
    if (total <= 0) return

    remainingPlayers.forEach((playerIndex, index) => {
      const place = remainingPlaces[0]
      const nextProbability = probability * (numericStacks[playerIndex] / total)
      probabilities[playerIndex][place] += nextProbability
      recurse(
        remainingPlayers.filter((_, remainingIndex) => remainingIndex !== index),
        remainingPlaces.slice(1),
        nextProbability,
      )
    })
  }

  recurse(numericStacks.map((_, index) => index), numericStacks.map((_, index) => index), 1)
  return probabilities
}
