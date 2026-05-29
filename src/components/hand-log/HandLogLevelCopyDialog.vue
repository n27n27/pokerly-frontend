<template>
  <q-dialog v-model="dialogModel" :maximized="$q.screen.lt.sm">
    <q-card class="dialog-card">
      <q-card-section>
        <div class="text-h6 text-weight-bold">레벨 복기 텍스트</div>
        <div class="text-caption text-grey-7 q-mt-xs">
          현재 스택 정보를 추가해서 복기용 텍스트를 복사합니다.
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section class="form-section">
        <q-input
          v-model="form.heroStack"
          outlined
          dense
          inputmode="numeric"
          label="내 스택"
          placeholder="예: 45000"
        />

        <q-input
          v-model="form.averageStack"
          outlined
          dense
          inputmode="numeric"
          label="에버 스택"
          placeholder="예: 82000"
        />

        <q-input
          v-model="form.note"
          outlined
          dense
          type="textarea"
          autogrow
          label="추가 메모"
          placeholder="예: 필드가 루즈함, 3벳 콜이 많음, 내가 숏스택 운영 중"
        />
      </q-card-section>

      <q-separator />

      <q-card-actions align="right" class="q-pa-md">
        <q-btn flat label="취소" color="grey-8" v-close-popup />
        <q-btn color="dark" unelevated icon="content_copy" label="복사" @click="copyText" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { computed, reactive, watch } from 'vue'
import { copyToClipboard } from 'quasar'
import { useAlert } from 'src/composables/useAlert'

import { buildLevelReviewText } from 'src/utils/handLogExportText'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  event: {
    type: Object,
    default: null,
  },
  blindLevel: {
    type: Object,
    default: null,
  },
  hands: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['update:modelValue'])
const alert = useAlert()
const dialogModel = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const form = reactive({
  heroStack: '',
  averageStack: '',
  note: '',
})

watch(dialogModel, (value) => {
  if (!value) {
    resetForm()
  }
})

const resetForm = () => {
  form.heroStack = ''
  form.averageStack = ''
  form.note = ''
}

const copyText = async () => {
  const text = buildLevelReviewText({
    event: props.event,
    blindLevel: props.blindLevel,
    hands: props.hands,
    heroStack: form.heroStack,
    averageStack: form.averageStack,
    note: form.note,
  })

  try {
    await copyToClipboard(text)

    alert.show('레벨 복기 텍스트를 복사했습니다.', 'positive')

    dialogModel.value = false
  } catch (error) {
    console.error(error)

    alert.show('복사에 실패했습니다.', 'error')
  }
}
</script>

<style scoped>
.dialog-card {
  width: 100%;
  max-width: 460px;
  border-radius: 18px;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>
