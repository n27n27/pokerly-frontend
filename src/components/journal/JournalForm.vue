<template>
  <q-form @submit.prevent="submit">
    <q-card flat class="q-pa-md q-gutter-md">
      <div class="text-subtitle1 q-mb-sm">일지 {{ isEdit ? '수정' : '작성' }}</div>

      <!-- 제목 -->
      <q-input v-model="form.title" label="제목" outlined dense />

      <!-- 내용 -->
      <q-input v-model="form.content" label="내용" type="textarea" autogrow outlined :rows="4" />

      <q-separator spaced />

      <!-- 상태 점수 -->
      <div class="text-subtitle2 q-mb-sm">오늘의 상태 (1 ~ 5)</div>

      <div class="row q-col-gutter-md">
        <div class="col-12 col-md-6">
          <div class="text-caption text-grey-7 q-mb-xs">기분</div>
          <q-slider v-model="form.moodScore" :min="1" :max="5" :step="1" snap label />
        </div>

        <div class="col-12 col-md-6">
          <div class="text-caption text-grey-7 q-mb-xs">집중도</div>
          <q-slider v-model="form.focusScore" :min="1" :max="5" :step="1" snap label />
        </div>
      </div>

      <div class="row q-col-gutter-md">
        <div class="col-12 col-md-6">
          <div class="text-caption text-grey-7 q-mb-xs">틸트</div>
          <q-slider v-model="form.tiltScore" :min="1" :max="5" :step="1" snap label />
        </div>

        <div class="col-12 col-md-6">
          <div class="text-caption text-grey-7 q-mb-xs">체력 / 컨디션</div>
          <q-slider v-model="form.energyScore" :min="1" :max="5" :step="1" snap label />
        </div>
      </div>

      <q-separator spaced />

      <!-- 태그 -->
      <q-input
        v-model="form.tags"
        label="태그 (콤마로 구분)"
        outlined
        dense
        hint="예: 멘탈, 프리플랍, 콜 과다, 장시간 플레이, 집중력 저하"
        clearable
      />

      <!-- 버튼 -->
      <div class="row justify-end q-gutter-sm q-mt-md">
        <q-btn flat color="grey" label="취소" @click="$emit('cancel')" />
        <q-btn color="primary" label="저장" type="submit" />
      </div>
    </q-card>
  </q-form>
</template>

<script setup>
import { reactive, computed, watch } from 'vue'

const props = defineProps({
  initial: Object,
  date: String,
})

const emit = defineEmits(['cancel', 'submit'])

const isEdit = computed(() => !!props.initial)

const form = reactive({
  journalDate: props.date,
  title: '',
  content: '',
  moodScore: 3,
  focusScore: 3,
  tiltScore: 3,
  energyScore: 3,
  tags: '',
})

// initial 변경되면 반영
watch(
  () => props.initial,
  (val) => {
    form.journalDate = props.date
    form.title = val?.title || ''
    form.content = val?.content || ''
    form.moodScore = val?.moodScore ?? 3
    form.focusScore = val?.focusScore ?? 3
    form.tiltScore = val?.tiltScore ?? 3
    form.energyScore = val?.energyScore ?? 3
    form.tags = val?.tags || ''
  },
  { immediate: true },
)

const submit = () => {
  emit('submit', { ...form })
}
</script>
