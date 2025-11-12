import { ref } from 'vue'

const alertRef = ref(null)

export function registerAlert(instance) {
  alertRef.value = instance || null
}

export function useAlert() {
  return {
    show: (message, type = 'info') => {
      alertRef.value?.show(message, type)
    },
  }
}
