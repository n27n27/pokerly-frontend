<template>
  <q-dialog
    :model-value="modelValue"
    maximized
    transition-show="slide-left"
    transition-hide="slide-right"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <q-card class="policy-page">
      <header class="policy-top">
        <button type="button" class="back-btn" @click="close">
          <q-icon name="arrow_back" size="24px" />
        </button>

        <div class="top-title">{{ shortTitle }}</div>
      </header>

      <main class="policy-content">
        <div class="policy-meta">Pokerly</div>
        <h1 class="policy-title">{{ title }}</h1>
        <div class="policy-version">{{ versionText }}</div>

        <section class="policy-body">
          <slot />
        </section>
      </main>

      <footer class="policy-footer">
        <q-btn unelevated no-caps class="confirm-btn" label="확인" @click="close" />
      </footer>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  versionText: {
    type: String,
    default: '임시 v1 · 정식 출시 전 교체 예정',
  },
})

const emit = defineEmits(['update:modelValue'])

const shortTitle = computed(() => {
  return props.title.replace('Pokerly ', '')
})

const close = () => {
  emit('update:modelValue', false)
}
</script>

<style scoped>
.policy-page {
  min-height: 100vh;
  min-height: 100dvh;
  background: linear-gradient(180deg, #f8f8f9 0%, #f3f4f6 100%);
  color: #111827;
  display: flex;
  flex-direction: column;
}

.policy-top {
  height: 64px;
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: calc(env(safe-area-inset-top) + 14px) 24px 12px;
}

.back-btn {
  width: 36px;
  height: 36px;
  border: 0;
  background: transparent;
  color: #111827;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  cursor: pointer;
}

.top-title {
  font-size: 17px;
  font-weight: 900;
  letter-spacing: -0.04em;
}

.policy-content {
  width: 100%;
  max-width: 560px;
  margin: 0 auto;
  padding: 42px 28px 28px;
  flex: 1 1 auto;
  overflow-y: auto;
}

.policy-meta {
  color: #9ca3af;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.policy-title {
  margin: 8px 0 0;
  color: #111827;
  font-size: 30px;
  line-height: 1.16;
  font-weight: 900;
  letter-spacing: -0.06em;
}

.policy-version {
  margin-top: 10px;
  color: #9ca3af;
  font-size: 12px;
  font-weight: 700;
}

.policy-body {
  margin-top: 34px;
  color: #111827;
  font-size: 16px;
  font-weight: 500;
  line-height: 1.9;
  word-break: keep-all;
}

.policy-body p {
  margin: 0 0 22px;
}

.policy-body p:last-child {
  margin-bottom: 0;
}

.policy-footer {
  flex: 0 0 auto;
  padding: 16px 28px calc(env(safe-area-inset-bottom) + 24px);
  border-top: 1px solid #e5e7eb;
  background: rgba(248, 248, 249, 0.96);
}

.confirm-btn {
  width: 100%;
  max-width: 420px;
  height: 44px;
  margin: 0 auto;
  display: flex;
  border-radius: 4px;
  background: #0f172a !important;
  color: #ffffff;
  font-size: 15px;
  font-weight: 900;
  letter-spacing: -0.02em;
}

@media (max-width: 420px) {
  .policy-top {
    padding-left: 22px;
    padding-right: 22px;
  }

  .policy-content {
    padding: 34px 26px 28px;
  }

  .policy-title {
    font-size: 28px;
  }

  .policy-body {
    margin-top: 30px;
    font-size: 15px;
    line-height: 1.85;
  }

  .policy-footer {
    padding-left: 26px;
    padding-right: 26px;
  }
}
</style>
