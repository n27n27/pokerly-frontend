<template>
  <BaseDialog
    v-model="dialogModel"
    :title="dialogTitle"
    :description="dialogDescription"
    :maximized="$q.screen.lt.sm"
    :persistent="loading"
  >
    <div class="form-section">
      <q-input
        v-model="form.name"
        outlined
        dense
        label="대회명"
        placeholder="예: 키키 그랑프리"
        autofocus
        :disable="loading"
        @keyup.enter="onSave"
      />

      <q-input
        v-model="form.startingStack"
        outlined
        dense
        inputmode="numeric"
        label="대회 시작 스택"
        placeholder="예: 30000"
        :disable="loading"
        @keyup.enter="onSave"
      />
    </div>

    <template #actions>
      <q-btn flat label="취소" color="grey-8" :disable="loading" v-close-popup />

      <q-btn
        color="dark"
        unelevated
        :label="saveButtonLabel"
        :loading="loading"
        :disable="!canSave || loading"
        @click="onSave"
      />
    </template>
  </BaseDialog>
</template>

<script setup>
import { computed, reactive, watch } from 'vue'
import BaseDialog from 'components/common/BaseDialog.vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  mode: {
    type: String,
    default: 'create',
    validator: (value) => ['create', 'edit'].includes(value),
  },
  initialEvent: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['update:modelValue', 'save'])

const dialogModel = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const form = reactive({
  name: '',
  startingStack: '',
})

const isEditMode = computed(() => props.mode === 'edit')

const dialogTitle = computed(() => {
  return isEditMode.value ? '대회 수정' : '대회 생성'
})

const dialogDescription = computed(() => {
  return isEditMode.value ? '대회 정보를 수정합니다.' : '핸드 로그를 기록할 대회를 만듭니다.'
})

const saveButtonLabel = computed(() => {
  return isEditMode.value ? '수정' : '생성'
})

const canSave = computed(() => {
  return form.name.trim().length > 0
})

watch(
  () => props.modelValue,
  (value) => {
    if (value) {
      setForm()
      return
    }

    resetForm()
  },
)

watch(
  () => props.initialEvent,
  () => {
    if (props.modelValue) {
      setForm()
    }
  },
)

const setForm = () => {
  form.name = props.initialEvent?.name || ''
  form.startingStack = props.initialEvent?.startingStack ?? ''
}

const resetForm = () => {
  form.name = ''
  form.startingStack = ''
}

const onSave = () => {
  if (!canSave.value || props.loading) {
    return
  }

  emit('save', {
    name: form.name.trim(),
    startingStack: toNullableNumber(form.startingStack),
  })
}

const toNullableNumber = (value) => {
  if (value === null || value === undefined || String(value).trim() === '') {
    return null
  }

  const numberValue = Number(value)

  if (Number.isNaN(numberValue)) {
    return null
  }

  return numberValue
}
</script>

<style scoped>
.form-section {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
</style>
