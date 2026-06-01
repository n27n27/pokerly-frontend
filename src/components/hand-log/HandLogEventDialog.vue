<template>
  <q-dialog v-model="dialogModel" :maximized="$q.screen.lt.sm" :persistent="loading">
    <q-card class="dialog-card">
      <q-card-section class="row items-center justify-between">
        <div>
          <div class="text-h6 text-weight-bold">{{ dialogTitle }}</div>
          <div class="text-caption text-grey-7">{{ dialogDescription }}</div>
        </div>

        <q-btn flat round dense icon="close" :disable="loading" v-close-popup />
      </q-card-section>

      <q-separator />

      <q-card-section class="q-gutter-y-md">
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
      </q-card-section>

      <q-separator />

      <q-card-actions align="right" class="q-pa-md">
        <q-btn flat label="취소" color="grey-8" :disable="loading" v-close-popup />

        <q-btn
          color="dark"
          unelevated
          :label="saveButtonLabel"
          :loading="loading"
          :disable="!canSave || loading"
          @click="onSave"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { computed, reactive, watch } from 'vue'

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
}

const resetForm = () => {
  form.name = ''
}

const onSave = () => {
  if (!canSave.value || props.loading) {
    return
  }

  emit('save', {
    name: form.name.trim(),
  })
}
</script>

<style scoped>
.dialog-card {
  width: 100%;
  max-width: 420px;
  border-radius: 18px;
}
</style>
