<template>
  <q-dialog
    :model-value="modelValue"
    :maximized="maximized"
    :persistent="persistent"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <q-card class="base-dialog-card">
      <q-card-section class="base-dialog-header">
        <div>
          <div class="base-dialog-title">{{ title }}</div>

          <div v-if="description" class="base-dialog-description">
            {{ description }}
          </div>
        </div>

        <q-btn
          v-if="showClose"
          flat
          round
          dense
          icon="close"
          class="base-dialog-close"
          :disable="persistent"
          @click="$emit('update:modelValue', false)"
        />
      </q-card-section>

      <q-separator />

      <q-card-section class="base-dialog-body">
        <slot />
      </q-card-section>

      <q-separator v-if="$slots.actions" />

      <q-card-actions v-if="$slots.actions" align="right" class="base-dialog-actions">
        <slot name="actions" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  persistent: {
    type: Boolean,
    default: false,
  },
  maximized: {
    type: Boolean,
    default: false,
  },
  showClose: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['update:modelValue'])
</script>

<style scoped>
.base-dialog-card {
  width: 100%;
  max-width: 560px;
  border-radius: 18px;
  background: #ffffff;
}

.base-dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px;
}

.base-dialog-title {
  font-size: 20px;
  font-weight: 700;
  line-height: 1.3;
  color: #111111;
  letter-spacing: -0.4px;
}

.base-dialog-description {
  margin-top: 4px;
  font-size: 12px;
  line-height: 1.4;
  color: #777777;
  letter-spacing: -0.2px;
}

.base-dialog-close {
  flex: 0 0 auto;
}

.base-dialog-body {
  padding: 16px;
}

.base-dialog-actions {
  padding: 16px;
  gap: 8px;
}

.base-dialog-actions :deep(.q-btn) {
  min-width: 64px;
  height: 36px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 700;
}

@media (max-width: 599px) {
  .base-dialog-card {
    max-width: 100%;
    border-radius: 0;
  }
}
</style>
