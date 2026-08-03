import phe from 'phe'

const ranks = '23456789TJQKA'
const suits = 'cdhs'
const deck = [...ranks].flatMap((rank) => [...suits].map((suit) => `${rank}${suit}`))
const distributionKeys = [
  'straightFlush',
  'quads',
  'fullHouse',
  'flush',
  'straight',
  'trips',
  'twoPair',
  'pair',
  'highCard',
]

const emptyDistribution = () => Object.fromEntries(distributionKeys.map((key) => [key, 0]))

const forEachCombination = (items, size, callback) => {
  if (size === 0) {
    callback([])
    return
  }

  const combination = Array(size)
  const walk = (start, depth) => {
    if (depth === size) {
      callback(combination)
      return
    }

    const remainingSlots = size - depth
    for (let index = start; index <= items.length - remainingSlots; index += 1) {
      combination[depth] = items[index]
      walk(index + 1, depth + 1)
    }
  }
  walk(0, 0)
}

const calculate = ({ players, board }) => {
  const usedCards = new Set([...players.flatMap((player) => player.cards), ...board])
  const remaining = phe.cardCodes(deck.filter((card) => !usedCards.has(card)))
  const boardCodes = phe.cardCodes(board)
  const playerCodes = players.map((player) => phe.cardCodes(player.cards))
  const cardsToCome = 5 - board.length
  const accumulators = players.map(() => ({
    equity: 0,
    wins: 0,
    ties: 0,
    distribution: emptyDistribution(),
  }))
  let total = 0

  forEachCombination(remaining, cardsToCome, (runout) => {
    total += 1
    const completedBoard = [...boardCodes, ...runout]
    const strengths = playerCodes.map((holeCards, index) => {
      const strength = phe.evaluateCardCodes([...holeCards, ...completedBoard])
      accumulators[index].distribution[distributionKeys[phe.handRank(strength)]] += 1
      return strength
    })
    const bestStrength = Math.min(...strengths)
    const winners = []

    strengths.forEach((strength, index) => {
      if (strength === bestStrength) winners.push(index)
    })
    winners.forEach((index) => {
      accumulators[index].equity += 1 / winners.length
      if (winners.length === 1) accumulators[index].wins += 1
      else accumulators[index].ties += 1
    })
  })

  const denominator = Math.max(1, total)
  return accumulators.map((item) => ({
    equity: (item.equity / denominator) * 100,
    win: (item.wins / denominator) * 100,
    tie: (item.ties / denominator) * 100,
    distribution: Object.fromEntries(
      Object.entries(item.distribution).map(([key, value]) => [key, (value / denominator) * 100]),
    ),
  }))
}

self.onmessage = ({ data }) => {
  const { requestId, payload } = data
  try {
    self.postMessage({ requestId, results: calculate(payload) })
  } catch (error) {
    self.postMessage({ requestId, error: error instanceof Error ? error.message : String(error) })
  }
}
