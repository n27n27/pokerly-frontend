<template>
  <q-dialog v-model="dialogModel" :maximized="$q.screen.lt.sm">
    <q-card class="dialog-card">
      <q-card-section class="row items-center justify-between">
        <div>
          <div class="text-h6 text-weight-bold">대회 생성</div>
          <div class="text-caption text-grey-7">핸드 로그를 기록할 대회를 만듭니다.</div>
        </div>

        <q-btn flat round dense icon="close" v-close-popup />
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
        />
      </q-card-section>

      <q-separator />

      <q-card-actions align="right">
        <q-btn flat label="취소" v-close-popup />
        <q-btn color="dark" unelevated label="생성" @click="onSave" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { computed, reactive } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
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

const getTodayDate = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

const resetForm = () => {
  form.name = ''
}

const onSave = () => {
  if (!form.name?.trim()) {
    return
  }

  emit('save', {
    name: form.name.trim(),
    date: getTodayDate(),
  })

  dialogModel.value = false
  resetForm()
}
</script>

<style scoped>
.dialog-card {
  width: 100%;
  max-width: 420px;
  border-radius: 18px;
}
</style>
