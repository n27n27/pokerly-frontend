<template>
  <q-dialog v-model="dialogModel" :maximized="$q.screen.lt.sm">
    <q-card class="dialog-card">
      <q-card-section class="row items-center justify-between">
        <div>
          <div class="text-h6 text-weight-bold">상세 복기</div>
          <div class="text-caption text-grey-7">
            {{ log?.holeCards }} · {{ buildLogSummary(log) }}
          </div>
        </div>

        <q-btn flat round dense icon="close" v-close-popup />
      </q-card-section>

      <q-separator />

      <q-card-section class="q-gutter-md">
        <q-input v-model="form.preflop" outlined dense type="textarea" autogrow label="프리플랍" />

        <q-input v-model="form.flop" outlined dense type="textarea" autogrow label="플랍" />

        <q-input v-model="form.turn" outlined dense type="textarea" autogrow label="턴" />

        <q-input v-model="form.river" outlined dense type="textarea" autogrow label="리버" />

        <q-input v-model="form.opponentHand" outlined dense label="상대 핸드" />

        <q-input v-model="form.opponentType" outlined dense label="상대 성향" />

        <q-input v-model="form.myThought" outlined dense type="textarea" autogrow label="내 판단" />

        <q-input
          v-model="form.reviewResult"
          outlined
          dense
          type="textarea"
          autogrow
          label="복기 결론"
        />
      </q-card-section>

      <q-separator />

      <q-card-actions align="right">
        <q-btn flat label="닫기" v-close-popup />
        <q-btn color="dark" unelevated label="저장" @click="onSave" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { computed, reactive, watch } from 'vue'

import { buildLogSummary } from 'src/utils/handLogFormatters'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  log: {
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
  preflop: '',
  flop: '',
  turn: '',
  river: '',
  opponentHand: '',
  opponentType: '',
  myThought: '',
  reviewResult: '',
})

const loadReview = () => {
  form.preflop = props.log?.review?.preflop || ''
  form.flop = props.log?.review?.flop || ''
  form.turn = props.log?.review?.turn || ''
  form.river = props.log?.review?.river || ''
  form.opponentHand = props.log?.review?.opponentHand || ''
  form.opponentType = props.log?.review?.opponentType || ''
  form.myThought = props.log?.review?.myThought || ''
  form.reviewResult = props.log?.review?.reviewResult || ''
}

watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      loadReview()
    }
  },
)

const onSave = () => {
  emit('save', {
    preflop: form.preflop,
    flop: form.flop,
    turn: form.turn,
    river: form.river,
    opponentHand: form.opponentHand,
    opponentType: form.opponentType,
    myThought: form.myThought,
    reviewResult: form.reviewResult,
  })

  dialogModel.value = false
}
</script>

<style scoped>
.dialog-card {
  width: 100%;
  max-width: 560px;
  border-radius: 18px;
}
</style>
