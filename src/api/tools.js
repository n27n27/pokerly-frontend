import { api } from 'boot/axios'

export function logToolUsage(toolCode, action) {
  return api.post('/tools/usage', {
    toolCode,
    action,
  })
}
