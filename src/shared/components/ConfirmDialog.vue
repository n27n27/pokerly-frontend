<template>
  <q-dialog
    :model-value="modelValue"
    :persistent="persistent"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <q-card class="confirm-dialog">
      <h2>{{ title }}</h2>
      <p v-if="description">{{ description }}</p>
      <div class="confirm-dialog__actions">
        <button
          type="button"
          :class="{ preferred: preferredAction === 'cancel' }"
          :disabled="loading"
          @click="$emit('update:modelValue', false)"
        >
          {{ cancelLabel }}
        </button>
        <button
          type="button"
          :class="{ danger, preferred: preferredAction === 'confirm' }"
          :disabled="loading"
          @click="$emit('confirm')"
        >
          {{ loading ? loadingLabel : confirmLabel }}
        </button>
      </div>
    </q-card>
  </q-dialog>
</template>

<script setup>
defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  cancelLabel: { type: String, default: '취소' },
  confirmLabel: { type: String, default: '확인' },
  loadingLabel: { type: String, default: '처리 중...' },
  danger: { type: Boolean, default: false },
  preferredAction: {
    type: String,
    default: 'confirm',
    validator: (value) => ['cancel', 'confirm'].includes(value),
  },
  loading: { type: Boolean, default: false },
  persistent: { type: Boolean, default: false },
})

defineEmits(['update:modelValue', 'confirm'])
</script>

<style scoped>
:deep(.q-dialog__backdrop) {
  background: rgba(23, 21, 31, 0.42);
}

.confirm-dialog {
  width: min(calc(100vw - 48px), 332px);
  overflow: hidden;
  padding: 20px;
  border: 1px solid var(--v2-border);
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 16px 42px rgba(28, 18, 60, 0.16);
}

.confirm-dialog h2 {
  margin: 0;
  color: var(--v2-text-main);
  font-size: 18px;
  font-weight: 690;
  line-height: 1.35;
  letter-spacing: -0.02em;
}

.confirm-dialog p {
  margin: 9px 0 22px;
  color: var(--v2-text-sub);
  font-size: 13px;
  line-height: 1.5;
  word-break: keep-all;
}

.confirm-dialog__actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.confirm-dialog__actions button {
  height: 46px;
  border: 1px solid transparent;
  border-radius: 13px;
  outline: 0;
  background: #f4f2f8;
  color: #4f4a5e;
  font: inherit;
  font-size: 14px;
  font-weight: 620;
  transition: transform 120ms ease, background-color 120ms ease, box-shadow 120ms ease;
}

.confirm-dialog__actions button.danger {
  background: #fff4f4;
  color: var(--v2-danger);
}

.confirm-dialog__actions button.preferred {
  background: var(--v2-primary);
  color: #fff;
  box-shadow: 0 6px 15px rgba(109, 69, 232, 0.18);
}

.confirm-dialog__actions button.danger.preferred {
  background: var(--v2-danger);
  color: #fff;
  box-shadow: 0 6px 15px rgba(239, 68, 68, 0.16);
}

.confirm-dialog__actions button:active:not(:disabled) {
  transform: scale(0.985);
}

.confirm-dialog__actions button:focus-visible {
  box-shadow: 0 0 0 3px rgba(109, 69, 232, 0.16);
}

.confirm-dialog__actions button:disabled {
  opacity: 0.55;
}
</style>
