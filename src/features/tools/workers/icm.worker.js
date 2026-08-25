import { calculateIcmFinishProbabilities } from '../../../utils/icmCalculator.js'

self.addEventListener('message', ({ data }) => {
  try {
    self.postMessage({
      requestId: data.requestId,
      probabilities: calculateIcmFinishProbabilities(data.stacks),
    })
  } catch (error) {
    self.postMessage({ requestId: data.requestId, error: error?.message || String(error) })
  }
})
