import { inject } from 'vue'

export function useAlert() {
  const alert = inject('alert')
  if (!alert) throw new Error('Alert provider not found')
  return alert
}
