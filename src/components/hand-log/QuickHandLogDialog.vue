<template>
  <q-dialog v-model="dialogModel" :maximized="$q.screen.lt.sm" :persistent="loading">
    <q-card class="dialog-card">
      <q-card-section>
        <div class="text-h6 text-weight-bold">{{ dialogTitle }}</div>

        <div class="text-caption text-grey-7 q-mt-xs">
          {{ levelLabel || '현재 레벨에 기록합니다.' }}
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section class="form-section">
        <!-- 핸드 -->
        <div>
          <div class="field-label">핸드</div>

          <div class="hand-picker-row">
            <q-select
              v-model="form.firstRank"
              :options="CARD_RANK_OPTIONS"
              class="rank-select"
              outlined
              dense
              options-dense
              emit-value
              map-options
              label="카드 1"
              behavior="menu"
              popup-content-class="rank-select-popup"
              :disable="loading"
            />

            <q-select
              v-model="form.secondRank"
              :options="CARD_RANK_OPTIONS"
              class="rank-select"
              outlined
              dense
              options-dense
              emit-value
              map-options
              label="카드 2"
              behavior="menu"
              popup-content-class="rank-select-popup"
              :disable="loading"
            />

            <q-toggle
              v-model="form.suited"
              color="primary"
              label="수딧"
              :disable="isPair || loading"
            />

            <q-badge v-if="selectedHand" color="dark" class="hand-preview">
              {{ selectedHand }}
            </q-badge>
          </div>
        </div>

        <!-- 포지션 -->
        <q-select
          v-model="form.position"
          :options="POSITION_OPTIONS"
          outlined
          dense
          options-dense
          emit-value
          map-options
          label="포지션"
          behavior="menu"
          popup-content-class="form-select-popup"
          :disable="loading"
        />

        <!-- 액션 -->
        <q-select
          v-model="form.actionType"
          :options="ACTION_OPTIONS"
          outlined
          dense
          options-dense
          emit-value
          map-options
          label="프리플랍 액션"
          behavior="menu"
          popup-content-class="form-select-popup"
          :disable="loading"
        />

        <q-toggle
          v-if="canMarkPreflopAllIn"
          v-model="form.preflopAllIn"
          color="negative"
          label="올인으로 실행"
          :disable="loading"
        />

        <!-- 결과 -->
        <q-select
          v-model="form.resultType"
          :options="RESULT_OPTIONS"
          outlined
          dense
          options-dense
          emit-value
          map-options
          label="결과"
          behavior="menu"
          popup-content-class="form-select-popup"
          :disable="loading"
        />

        <q-toggle
          v-model="form.reviewRequired"
          color="amber-8"
          label="복기 필요"
          :disable="loading"
        />

        <q-input
          v-model="form.memo"
          outlined
          dense
          type="textarea"
          autogrow
          label="간단 메모"
          placeholder="예: 오픈 후 3벳 콜, 플랍 미스 후 폴드, BB 옵션 체크 후 한방 플러쉬"
          :disable="loading"
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

import {
  ACTION_OPTIONS,
  ALL_IN_COMPATIBLE_ACTIONS,
  POSITION_OPTIONS,
  RESULT_OPTIONS,
  getActionLabel,
  getHandStrength,
  getResultLabel,
  normalizeHand,
} from 'src/utils/handLogHandAnalysis'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  event: {
    type: Object,
    default: null,
  },
  levelLabel: {
    type: String,
    default: '',
  },
  loading: {
    type: Boolean,
    default: false,
  },
  editHand: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['update:modelValue', 'save'])

const CARD_RANKS = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2']

const CARD_RANK_OPTIONS = CARD_RANKS.map((rank) => ({
  label: rank,
  value: rank,
}))

const dialogModel = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const form = reactive({
  firstRank: null,
  secondRank: null,
  suited: false,
  position: null,
  actionType: null,
  preflopAllIn: false,
  resultType: 'NOT_RECORDED',
  reviewRequired: false,
  memo: '',
})

const isEditMode = computed(() => {
  return Boolean(props.editHand?.id)
})

const dialogTitle = computed(() => {
  return isEditMode.value ? '핸드 수정' : '핸드 기록'
})

const saveButtonLabel = computed(() => {
  return isEditMode.value ? '수정' : '저장'
})

const isPair = computed(() => {
  return Boolean(form.firstRank && form.secondRank && form.firstRank === form.secondRank)
})

const selectedHand = computed(() => {
  if (!form.firstRank || !form.secondRank) {
    return ''
  }

  if (form.firstRank === form.secondRank) {
    return `${form.firstRank}${form.secondRank}`
  }

  const firstIndex = CARD_RANKS.indexOf(form.firstRank)
  const secondIndex = CARD_RANKS.indexOf(form.secondRank)

  const highRank = firstIndex < secondIndex ? form.firstRank : form.secondRank
  const lowRank = firstIndex < secondIndex ? form.secondRank : form.firstRank
  const suitedText = form.suited ? 's' : 'o'

  return `${highRank}${lowRank}${suitedText}`
})

const canMarkPreflopAllIn = computed(() => {
  return ALL_IN_COMPATIBLE_ACTIONS.has(form.actionType)
})

const canSave = computed(() => {
  return Boolean(selectedHand.value)
})

watch(isPair, (value) => {
  if (value) {
    form.suited = false
  }
})

watch(
  () => form.actionType,
  () => {
    if (!canMarkPreflopAllIn.value) {
      form.preflopAllIn = false
    }
  },
)

watch(dialogModel, (value) => {
  if (value) {
    fillFormFromEditHand()
    return
  }

  resetForm()
})

watch(
  () => props.editHand,
  () => {
    if (dialogModel.value) {
      fillFormFromEditHand()
    }
  },
)

const resetForm = () => {
  form.firstRank = null
  form.secondRank = null
  form.suited = false
  form.position = null
  form.actionType = null
  form.preflopAllIn = false
  form.resultType = 'NOT_RECORDED'
  form.reviewRequired = false
  form.memo = ''
}

const normalizeLegacyResultType = (hand) => {
  const resultType = hand?.resultType || 'NOT_RECORDED'

  if (resultType !== 'FOLD') {
    return resultType
  }

  const actionType = hand?.actionType || ''

  if (actionType === 'FOLD' || actionType === 'OPEN_FOLD_TO_3BET') {
    return 'PREFLOP_FOLD'
  }

  return 'POSTFLOP_FOLD'
}

const fillFormFromEditHand = () => {
  resetForm()

  if (!props.editHand) {
    return
  }

  const normalized = normalizeHand(props.editHand.holeCards || props.editHand.hand || '')

  form.firstRank = props.editHand.firstRank || normalized[0] || null
  form.secondRank = props.editHand.secondRank || normalized[1] || null
  form.suited = Boolean(props.editHand.suited ?? normalized[2] === 's')

  if (form.firstRank && form.secondRank && form.firstRank === form.secondRank) {
    form.suited = false
  }

  form.position = props.editHand.position || null
  form.actionType = props.editHand.actionType || null
  form.preflopAllIn = Boolean(props.editHand.preflopAllIn)
  form.resultType = normalizeLegacyResultType(props.editHand)
  form.reviewRequired = Boolean(props.editHand.reviewRequired)
  form.memo = props.editHand.memo || ''
}

const onSave = () => {
  if (!canSave.value || props.loading) {
    return
  }

  const handStrength = getHandStrength(selectedHand.value)

  emit('save', {
    id: props.editHand?.id || null,

    holeCards: selectedHand.value,
    hand: selectedHand.value,

    firstRank: form.firstRank,
    secondRank: form.secondRank,
    suited: form.suited,

    position: form.position,

    actionType: form.actionType,
    actionLabel: getActionLabel(form.actionType),

    preflopAllIn: canMarkPreflopAllIn.value ? form.preflopAllIn : false,

    resultType: form.resultType,
    resultLabel: getResultLabel(form.resultType),

    reviewRequired: form.reviewRequired,

    memo: form.memo,

    handStrengthTier: handStrength.tier,
    handStrengthLabel: handStrength.label,
    handStrengthColor: handStrength.color,
  })
}
</script>

<style scoped>
.dialog-card {
  width: 100%;
  max-width: 560px;
  border-radius: 18px;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.field-label {
  margin-bottom: 6px;
  font-size: 13px;
  font-weight: 700;
  color: #333;
}

.hand-picker-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.rank-select {
  width: 96px;
}

.hand-preview {
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 700;
}

@media (max-width: 360px) {
  .rank-select {
    width: 88px;
  }
}
</style>

<style>
.rank-select-popup {
  width: 96px !important;
  min-width: 96px !important;
  max-width: 96px !important;
  max-height: 280px !important;
}

.rank-select-popup .q-item {
  min-height: 36px;
  padding-left: 12px;
  padding-right: 12px;
}

.form-select-popup {
  max-height: 280px !important;
}

.form-select-popup .q-item {
  min-height: 40px;
}

.move-dialog-card {
  width: 100%;
  max-width: 520px;
  border-radius: 16px;
}

.move-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.move-warning-banner {
  background: #f6f7fb;
  color: #333;
}
</style>
