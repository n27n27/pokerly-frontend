<template>
  <q-page class="hand-log-level-page q-pa-md">
    <div class="page-container">
      <q-card v-if="isInitialLoading" flat bordered class="empty-card">
        <q-card-section class="text-center q-py-xl">
          <q-spinner size="32px" color="primary" />
          <div class="text-body2 text-grey-7 q-mt-md">블라인드 구간을 불러오는 중입니다.</div>
        </q-card-section>
      </q-card>

      <q-card v-else-if="!event || !blindLevel" flat bordered class="empty-card">
        <q-card-section class="text-center q-py-xl">
          <q-icon name="error_outline" size="42px" color="grey-5" />
          <div class="text-subtitle1 text-weight-bold q-mt-md">
            블라인드 구간을 찾을 수 없습니다
          </div>
          <div class="text-body2 text-grey-7 q-mt-xs">
            삭제되었거나 접근할 수 없는 구간일 수 있습니다.
          </div>
          <q-btn
            class="q-mt-md"
            color="dark"
            unelevated
            icon="arrow_back"
            label="대회"
            @click="goEventDetail"
          />
        </q-card-section>
      </q-card>

      <template v-else>
        <div class="level-header q-mb-md">
          <q-btn
            flat
            dense
            icon="arrow_back"
            label="대회"
            class="back-btn"
            @click="goEventDetail"
          />

          <div class="level-heading">
            <div class="level-heading-main">L{{ blindLevel.levelNo }}</div>
            <div class="level-heading-sub">{{ formatBlind(blindLevel) }}</div>
          </div>

          <div class="level-actions">
            <q-btn
              class="copy-btn"
              color="dark"
              outline
              icon="content_copy"
              label="복사용 텍스트"
              :disable="saving || bulkMoving"
              @click="copyLevelReviewText"
            />

            <q-btn
              class="hand-add-btn"
              color="primary"
              unelevated
              icon="add"
              label="핸드 기록"
              :disable="saving || bulkMoving"
              @click="quickLogDialog = true"
            />
          </div>
        </div>

        <q-card flat bordered class="section-card level-info-card q-mb-md">
          <q-card-section>
            <div class="level-info-header" @click="levelInfoExpanded = !levelInfoExpanded">
              <div class="row items-center q-gutter-sm">
                <q-icon
                  :name="levelInfoExpanded ? 'expand_more' : 'chevron_right'"
                  size="24px"
                  color="grey-8"
                />
                <div class="section-title">레벨 정보</div>
              </div>

              <q-btn
                v-if="levelInfoExpanded"
                flat
                dense
                round
                icon="edit"
                class="section-edit-btn"
                :disable="saving || bulkMoving"
                @click.stop="openLevelInfoDialog"
              />
            </div>

            <div v-if="levelInfoExpanded" class="level-info-body">
              <div class="level-stat-grid">
                <div class="stat-box">
                  <div class="stat-value">
                    {{ formatOptionalStack(displayStartStackValue) }}
                  </div>
                  <div class="stat-label">시작 스택</div>
                </div>

                <div class="stat-box">
                  <div class="stat-value">{{ formatOptionalStack(blindLevel.endStack) }}</div>
                  <div class="stat-label">마감 스택</div>
                </div>

                <div class="stat-box">
                  <div class="stat-value">{{ formatOptionalStack(blindLevel.averageStack) }}</div>
                  <div class="stat-label">에버 스택</div>
                </div>
              </div>

              <div v-if="blindLevel.memo" class="level-memo-box q-mt-md">
                <div class="level-memo-title">레벨 메모</div>
                <div class="level-memo-text">{{ blindLevel.memo }}</div>
              </div>

              <div v-else class="empty-level-memo q-mt-md">레벨 메모가 없습니다.</div>
            </div>
          </q-card-section>
        </q-card>

        <q-card flat bordered class="section-card q-mb-md">
          <q-card-section>
            <div class="section-head q-mb-md">
              <div>
                <div class="section-title">핸드 목록</div>
                <div v-if="selectionMode" class="section-desc">이동할 핸드를 선택해 주세요.</div>
              </div>

              <q-btn
                v-if="levelHands.length > 0"
                flat
                dense
                round
                icon="more_vert"
                color="grey-7"
                :disable="saving || bulkMoving"
              >
                <q-menu auto-close anchor="bottom right" self="top right">
                  <q-list dense class="hand-list-menu">
                    <q-item clickable @click="toggleSelectionMode">
                      <q-item-section avatar>
                        <q-icon
                          :name="selectionMode ? 'close' : 'checklist'"
                          size="18px"
                          color="grey-8"
                        />
                      </q-item-section>
                      <q-item-section>
                        {{ selectionMode ? '선택 취소' : '선택해서 이동' }}
                      </q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-btn>
            </div>

            <q-card v-if="levelHands.length === 0" flat bordered class="empty-hand-card">
              <q-card-section class="text-center q-py-lg">
                <q-icon name="style" size="36px" color="grey-5" />
                <div class="text-subtitle2 text-weight-bold q-mt-md">기록된 핸드가 없습니다</div>
                <div class="text-body2 text-grey-7 q-mt-xs">
                  상단의 핸드 기록 버튼으로 이 구간의 핸드를 추가해 주세요.
                </div>
              </q-card-section>
            </q-card>

            <div v-else class="column q-gutter-sm">
              <q-card
                v-for="hand in levelHands"
                :key="hand.id"
                flat
                bordered
                class="hand-card"
                :class="{
                  'cursor-pointer': !selectionMode,
                  'hand-card--selected': isHandSelected(hand.id),
                }"
                @click="handleHandCardClick(hand)"
              >
                <q-card-section class="hand-card-section">
                  <div class="row items-center justify-between q-col-gutter-md no-wrap">
                    <div v-if="selectionMode" class="col-auto">
                      <q-checkbox
                        :model-value="isHandSelected(hand.id)"
                        :disable="bulkMoving"
                        @update:model-value="toggleHandSelection(hand.id)"
                        @click.stop
                      />
                    </div>

                    <div class="col">
                      <div class="row items-center q-gutter-xs">
                        <div class="hand-title">
                          {{ hand.holeCards || hand.hand || '핸드 미입력' }}
                        </div>

                        <q-badge
                          rounded
                          :color="getHandStrengthColor(hand)"
                          text-color="white"
                          :label="getHandStrengthLabel(hand)"
                        />
                      </div>

                      <div v-if="getHandMetaText(hand)" class="hand-meta q-mt-xs">
                        {{ getHandMetaText(hand) }}
                      </div>

                      <div v-if="hand.memo" class="hand-memo q-mt-sm">
                        {{ hand.memo }}
                      </div>
                    </div>

                    <div class="col-auto hand-card-side">
                      <q-badge
                        v-if="hand.reviewRequired"
                        color="orange"
                        text-color="white"
                        label="복기"
                      />
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </q-card-section>
        </q-card>

        <q-card v-if="levelHands.length > 0" flat bordered class="section-card">
          <q-card-section>
            <div class="section-title">레벨 통계</div>

            <div class="section-desc q-mt-xs">
              기록한 핸드만 기준으로 계산됩니다. 모든 핸드를 기록하지 않으면 실제 VPIP/PFR과 다를 수
              있습니다.
            </div>

            <div class="stat-grid q-mt-sm">
              <div class="stat-box">
                <div class="stat-value">{{ levelHands.length }}</div>
                <div class="stat-label">기록 핸드</div>
              </div>

              <div class="stat-box">
                <div class="stat-value">{{ reviewHandCount }}</div>
                <div class="stat-label">복기 필요</div>
              </div>

              <div class="stat-box">
                <div class="stat-value">{{ vpipPercent }}</div>
                <div class="stat-label">기록 기준 VPIP</div>
              </div>

              <div class="stat-box">
                <div class="stat-value">{{ pfrPercent }}</div>
                <div class="stat-label">기록 기준 PFR</div>
              </div>

              <div class="stat-box">
                <div class="stat-value">{{ threeBetPlusCount }}</div>
                <div class="stat-label">3Bet+</div>
              </div>

              <div class="stat-box">
                <div class="stat-value">{{ showdownCount }}</div>
                <div class="stat-label">쇼다운</div>
              </div>
            </div>

            <StartingHandSummary
              class="q-mt-lg"
              :hands="levelHandsForSummary"
              @open-hand="openHand"
            />
          </q-card-section>
        </q-card>
      </template>
    </div>

    <QuickHandLogDialog
      v-model="quickLogDialog"
      :event="event"
      :level-label="levelLabel"
      :loading="saving"
      @save="addHand"
    />

    <BaseDialog
      v-model="levelInfoDialog"
      title="레벨 정보 수정"
      :description="`L${blindLevel?.levelNo || '-'} · ${blindLevel ? formatBlind(blindLevel) : ''}`"
      :maximized="$q.screen.lt.sm"
      :persistent="saving"
    >
      <div class="form-section">
        <q-input
          v-model="levelInfoForm.startStack"
          outlined
          dense
          inputmode="numeric"
          label="시작 스택"
          placeholder="예: 52000"
          :disable="saving || !canEditStartStack"
        >
          <template #hint>
            {{ startStackHint }}
          </template>
        </q-input>

        <q-input
          v-model="levelInfoForm.endStack"
          outlined
          dense
          inputmode="numeric"
          label="마감 스택"
          placeholder="예: 34000"
          :disable="saving"
        />

        <q-input
          v-model="levelInfoForm.averageStack"
          outlined
          dense
          inputmode="numeric"
          label="에버 스택"
          placeholder="예: 79000"
          :disable="saving"
        />

        <q-input
          v-model="levelInfoForm.memo"
          outlined
          dense
          type="textarea"
          autogrow
          label="레벨 메모"
          placeholder="예: 레마 직전, 카드 안 들어옴, 콜이 너무 많음"
          :disable="saving"
        />
      </div>

      <template #actions>
        <q-btn
          flat
          label="취소"
          color="grey-8"
          :disable="saving"
          @click="levelInfoDialog = false"
        />

        <q-btn
          color="dark"
          unelevated
          label="저장"
          :loading="saving"
          :disable="saving"
          @click="saveLevelInfo"
        />
      </template>
    </BaseDialog>

    <q-dialog v-model="bulkMoveDialog" :persistent="bulkMoving">
      <q-card class="bulk-move-dialog-card">
        <q-card-section>
          <div class="text-h6 text-weight-bold">선택한 핸드 이동</div>
          <div class="text-body2 text-grey-7 q-mt-xs">
            선택한 {{ selectedHandIds.length }}개 핸드를 다른 블라인드 구간으로 이동합니다.
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section class="bulk-move-form">
          <q-select
            v-model="bulkTargetLevelId"
            :options="bulkMovableLevelOptions"
            outlined
            emit-value
            map-options
            options-dense
            label="이동할 레벨"
            behavior="menu"
            :disable="bulkMoving"
          />

          <q-banner dense rounded class="bulk-move-hint">
            이동 후 현재 레벨 목록에서 해당 핸드들이 사라집니다.
          </q-banner>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn
            flat
            label="취소"
            color="grey-8"
            :disable="bulkMoving"
            @click="closeBulkMoveDialog"
          />

          <q-btn
            unelevated
            color="primary"
            label="이동"
            :loading="bulkMoving"
            :disable="!canBulkMove || bulkMoving"
            @click="moveSelectedHands"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-page-sticky
      v-if="event && blindLevel && !selectionMode"
      position="bottom-right"
      :offset="[16, 16]"
    >
      <q-btn
        round
        size="lg"
        color="primary"
        icon="add"
        :disable="saving || bulkMoving"
        @click="quickLogDialog = true"
      />
    </q-page-sticky>

    <q-page-sticky v-if="event && blindLevel && selectionMode" position="bottom" :offset="[16, 16]">
      <q-card class="bulk-action-bar">
        <q-card-section class="bulk-action-section">
          <div>
            <div class="bulk-action-title">{{ selectedHandIds.length }}개 선택됨</div>
            <div class="bulk-action-subtitle">선택한 핸드를 다른 레벨로 이동</div>
          </div>

          <div class="bulk-action-buttons">
            <q-btn
              flat
              label="취소"
              color="grey-8"
              :disable="bulkMoving"
              @click="exitSelectionMode"
            />

            <q-btn
              unelevated
              color="primary"
              label="레벨 이동"
              :disable="selectedHandIds.length === 0 || bulkMoving"
              @click="openBulkMoveDialog"
            />
          </div>
        </q-card-section>
      </q-card>
    </q-page-sticky>
  </q-page>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { copyToClipboard } from 'quasar'
import { useAlert } from 'src/composables/useAlert'
import { useRoute, useRouter } from 'vue-router'

import BaseDialog from 'components/common/BaseDialog.vue'
import QuickHandLogDialog from 'src/components/hand-log/QuickHandLogDialog.vue'
import StartingHandSummary from 'src/components/hand-log/StartingHandSummary.vue'
import { useHandLogStore } from 'src/stores/handLog'
import { buildLevelReviewText } from 'src/utils/handLogExportText'
import {
  getActionLabel,
  getHandInputValue,
  getHandStrength,
  getResultLabel,
  isPfrAction,
  isShowdownResult,
  isThreeBetPlusAction,
  isVpipAction,
} from 'src/utils/handLogHandAnalysis'

const route = useRoute()
const router = useRouter()
const alert = useAlert()
const handLogStore = useHandLogStore()

const { detailLoading, levelLoading, saving } = storeToRefs(handLogStore)

const quickLogDialog = ref(false)
const selectionMode = ref(false)
const selectedHandIds = ref([])
const bulkMoveDialog = ref(false)
const bulkTargetLevelId = ref(null)
const bulkMoving = ref(false)
const levelInfoDialog = ref(false)
const levelInfoExpanded = ref(false)

const levelInfoForm = reactive({
  startStack: '',
  endStack: '',
  averageStack: '',
  memo: '',
})

const eventId = computed(() => route.params.eventId)
const levelId = computed(() => route.params.levelId)

const event = computed(() => handLogStore.getEventById(eventId.value))
const blindLevel = computed(() => handLogStore.getBlindLevelById(eventId.value, levelId.value))
const blindLevels = computed(() => event.value?.blindLevels || [])

const displayStartStackValue = computed(() => {
  return blindLevel.value?.displayStartStack ?? blindLevel.value?.startStack ?? null
})

const canEditStartStack = computed(() => {
  return Boolean(blindLevel.value?.editableStartStack)
})

const isInitialLoading = computed(() => {
  return (detailLoading.value || levelLoading.value) && (!event.value || !blindLevel.value)
})

const levelHands = computed(() => {
  const hands = blindLevel.value?.hands || []
  return [...hands].sort((a, b) =>
    String(b.createdAt || '').localeCompare(String(a.createdAt || '')),
  )
})

const levelHandsForSummary = computed(() => {
  return levelHands.value.map((hand) => ({
    ...hand,
    __levelId: levelId.value,
    __levelNo: blindLevel.value?.levelNo || null,
    __levelLabel: blindLevel.value ? `L${blindLevel.value.levelNo}` : '',
  }))
})

const levelLabel = computed(() => {
  if (!blindLevel.value) return ''
  return `L${blindLevel.value.levelNo} · ${formatBlind(blindLevel.value)}`
})

const reviewHandCount = computed(() => levelHands.value.filter((hand) => isReviewHand(hand)).length)

const vpipCount = computed(() => {
  return levelHands.value.filter((hand) => isVpipAction(getActionValue(hand))).length
})

const pfrCount = computed(() => {
  return levelHands.value.filter((hand) => isPfrAction(getActionValue(hand))).length
})

const threeBetPlusCount = computed(() => {
  return levelHands.value.filter((hand) => isThreeBetPlusAction(getActionValue(hand))).length
})

const showdownCount = computed(() => {
  return levelHands.value.filter((hand) => isShowdownResult(getResultValue(hand))).length
})

const vpipPercent = computed(() => formatPercent(vpipCount.value, levelHands.value.length))
const pfrPercent = computed(() => formatPercent(pfrCount.value, levelHands.value.length))

const bulkMovableLevelOptions = computed(() => {
  return blindLevels.value
    .filter((level) => String(level.id) !== String(levelId.value))
    .map((level) => ({
      label: `L${level.levelNo} · ${formatBlind(level)}`,
      value: level.id,
    }))
})

const canBulkMove = computed(() => {
  return selectedHandIds.value.length > 0 && Boolean(bulkTargetLevelId.value)
})

watch(
  [eventId, levelId],
  async ([newEventId, newLevelId]) => {
    if (!newEventId || !newLevelId) return

    try {
      await handLogStore.fetchEventDetail(newEventId)
      await handLogStore.fetchBlindLevelDetail(newEventId, newLevelId)
      resetBulkMoveState()
      levelInfoExpanded.value = false
    } catch (error) {
      console.error(error)
      alert.show('블라인드 구간 정보를 불러오지 못했습니다.', 'error')
    }
  },
  { immediate: true },
)

const goEventDetail = () => {
  router.push(`/app/mypoker/hand-log/${eventId.value}`)
}

const openLevelInfoDialog = () => {
  if (!blindLevel.value) return

  levelInfoForm.startStack = displayStartStackValue.value ?? ''
  levelInfoForm.endStack = blindLevel.value.endStack ?? ''
  levelInfoForm.averageStack = blindLevel.value.averageStack ?? ''
  levelInfoForm.memo = blindLevel.value.memo ?? ''

  levelInfoDialog.value = true
}

const saveLevelInfo = async () => {
  if (!blindLevel.value || saving.value) return

  try {
    await handLogStore.updateBlindLevel(eventId.value, levelId.value, {
      levelNo: blindLevel.value.levelNo,
      smallBlind: blindLevel.value.smallBlind,
      bigBlind: blindLevel.value.bigBlind,
      ante: blindLevel.value.ante,
      startStack: canEditStartStack.value ? toNullableNumber(levelInfoForm.startStack) : null,
      endStack: toNullableNumber(levelInfoForm.endStack),
      averageStack: toNullableNumber(levelInfoForm.averageStack),
      memo: String(levelInfoForm.memo || '').trim() || null,
    })

    await handLogStore.fetchBlindLevelDetail(eventId.value, levelId.value)

    alert.show('레벨 정보를 저장했습니다.', 'positive')
    levelInfoDialog.value = false
    levelInfoExpanded.value = true
  } catch (error) {
    console.error(error)
    alert.show('레벨 정보를 저장하지 못했습니다.', 'error')
  }
}

const copyLevelReviewText = async () => {
  if (!event.value || !blindLevel.value) return

  const text = buildLevelReviewText({
    event: event.value,
    blindLevel: blindLevel.value,
    hands: levelHands.value,
  })

  try {
    await copyToClipboard(text)
    alert.show('레벨 복기 텍스트를 복사했습니다.', 'positive')
  } catch (error) {
    console.error(error)
    alert.show('복사에 실패했습니다.', 'error')
  }
}

const openHand = (hand) => {
  if (!hand?.id) return

  const targetLevelId = hand.__levelId || levelId.value

  router.push({
    path: `/app/mypoker/hand-log/${eventId.value}/levels/${targetLevelId}/hands/${hand.id}`,
    query: { from: 'level' },
  })
}

const handleHandCardClick = (hand) => {
  if (selectionMode.value) {
    toggleHandSelection(hand.id)
    return
  }

  openHand(hand)
}

const addHand = async (payload) => {
  if (saving.value) return

  try {
    await handLogStore.addHandToBlindLevel(eventId.value, levelId.value, {
      ...payload,
      levelNo: blindLevel.value?.levelNo || null,
      blindText: blindLevel.value ? formatBlind(blindLevel.value) : '',
    })

    quickLogDialog.value = false
  } catch (error) {
    console.error(error)
    alert.show('핸드를 기록하지 못했습니다.', 'error')
  }
}

const toggleSelectionMode = () => {
  selectionMode.value = !selectionMode.value

  if (!selectionMode.value) {
    selectedHandIds.value = []
  }
}

const exitSelectionMode = () => {
  selectionMode.value = false
  selectedHandIds.value = []
  closeBulkMoveDialog()
}

const toggleHandSelection = (handId) => {
  if (!handId || bulkMoving.value) return

  const index = selectedHandIds.value.indexOf(handId)

  if (index >= 0) {
    selectedHandIds.value.splice(index, 1)
    return
  }

  selectedHandIds.value.push(handId)
}

const isHandSelected = (handId) => {
  return selectedHandIds.value.includes(handId)
}

const openBulkMoveDialog = () => {
  if (selectedHandIds.value.length === 0) return

  bulkTargetLevelId.value = null
  bulkMoveDialog.value = true
}

const closeBulkMoveDialog = () => {
  if (bulkMoving.value) return

  bulkMoveDialog.value = false
  bulkTargetLevelId.value = null
}

const resetBulkMoveState = () => {
  selectionMode.value = false
  selectedHandIds.value = []
  bulkMoveDialog.value = false
  bulkTargetLevelId.value = null
  bulkMoving.value = false
}

const moveSelectedHands = async () => {
  if (!canBulkMove.value || bulkMoving.value) return

  bulkMoving.value = true

  const targetLevelId = bulkTargetLevelId.value
  const handIds = [...selectedHandIds.value]

  try {
    await handLogStore.moveHandsToBlindLevel(eventId.value, levelId.value, handIds, targetLevelId)

    alert.show(`${handIds.length}개 핸드를 이동했습니다.`, 'positive')

    resetBulkMoveState()
  } catch (error) {
    console.error(error)
    alert.show('선택한 핸드를 이동하지 못했습니다.', 'error')
  } finally {
    bulkMoving.value = false
  }
}

const formatBlind = (level) => {
  return `${formatNumber(level.smallBlind)} / ${formatNumber(level.bigBlind)} / ${formatNumber(
    level.ante || 0,
  )}`
}

const formatNumber = (value) => Number(value || 0).toLocaleString('ko-KR')

const formatOptionalStack = (value) => {
  if (value === null || value === undefined || value === '') return '-'
  return formatNumber(value)
}

const toNullableNumber = (value) => {
  if (value === null || value === undefined || String(value).trim() === '') return null

  const numberValue = Number(value)
  if (Number.isNaN(numberValue)) return null

  return numberValue
}

const formatPercent = (count, total) => {
  if (!total) return '0%'
  return `${Math.round((count / total) * 100)}%`
}

const getHandStrengthLabel = (hand) => getHandStrength(getHandInputValue(hand)).label
const getHandStrengthColor = (hand) => getHandStrength(getHandInputValue(hand)).color

const getHandMetaText = (hand) => {
  const parts = []

  const positionText = hand.positionLabel || hand.position || ''
  const actionText = hand.actionLabel || getActionLabel(hand.actionType)
  const resultText =
    hand.resultType && hand.resultType !== 'NOT_RECORDED'
      ? hand.resultLabel || getResultLabel(hand.resultType)
      : ''

  if (positionText) parts.push(positionText)
  if (actionText) parts.push(actionText)
  if (hand.preflopAllIn) parts.push('올인')
  if (resultText) parts.push(resultText)

  return parts.join(' · ')
}

const isReviewHand = (hand) => Boolean(hand?.reviewRequired)
const getActionValue = (hand) => hand?.actionType || ''
const getResultValue = (hand) => hand?.resultType || ''
</script>

<style scoped>
.hand-log-level-page {
  background: #f7f7f8;
}

.page-container {
  max-width: 1080px;
  margin: 0 auto;
  padding-bottom: 96px;
}

.empty-card,
.section-card,
.empty-hand-card,
.hand-card {
  border-radius: 16px;
  background: #ffffff;
}

.level-header {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.back-btn {
  align-self: flex-start;
  color: #111111;
  font-size: 14px;
  font-weight: 600;
}

.level-heading {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.level-heading-main {
  font-size: 28px;
  font-weight: 700;
  line-height: 1.05;
  color: #050505;
  letter-spacing: -0.8px;
}

.level-heading-sub {
  font-size: 23px;
  font-weight: 600;
  line-height: 1.12;
  color: #111111;
  letter-spacing: -0.7px;
  word-break: keep-all;
}

.level-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.copy-btn,
.hand-add-btn {
  width: 100%;
  height: 42px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 700;
}

.section-card {
  border: 1px solid #e5e5e8;
}

.section-head,
.level-info-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.level-info-card {
  overflow: hidden;
}

.level-info-header {
  cursor: pointer;
  user-select: none;
}

.level-info-body {
  margin-top: 12px;
}

.section-title {
  font-size: 17px;
  font-weight: 700;
  line-height: 1.3;
  color: #111111;
  letter-spacing: -0.4px;
}

.section-desc {
  margin-top: 4px;
  font-size: 13px;
  font-weight: 500;
  line-height: 1.45;
  color: #777777;
  letter-spacing: -0.25px;
}

.level-stat-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin-top: 14px;
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.stat-box {
  border: 1px solid #ececef;
  border-radius: 14px;
  padding: 13px 8px;
  text-align: center;
  background: #fafafa;
}

.stat-value {
  font-size: 18px;
  font-weight: 600;
  line-height: 1.2;
  color: #111111;
  letter-spacing: -0.3px;
}

.stat-label {
  margin-top: 5px;
  font-size: 12px;
  font-weight: 500;
  color: #777777;
  letter-spacing: -0.2px;
}

.stat-caption {
  margin-top: 4px;
  font-size: 10px;
  font-weight: 600;
  color: #999999;
  line-height: 1.25;
  letter-spacing: -0.2px;
}

.level-memo-box {
  border: 1px solid #ececef;
  border-radius: 14px;
  padding: 14px;
  background: #fafafa;
}

.level-memo-title {
  font-size: 13px;
  font-weight: 700;
  color: #555555;
}

.level-memo-text {
  margin-top: 6px;
  font-size: 14px;
  font-weight: 500;
  color: #222222;
  white-space: pre-wrap;
  word-break: break-word;
}

.empty-level-memo {
  border: 1px dashed #dedee3;
  border-radius: 14px;
  padding: 13px 14px;
  background: #fafafa;
  font-size: 13px;
  font-weight: 600;
  color: #888888;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.empty-hand-card {
  border-style: dashed;
}

.hand-list-menu {
  min-width: 144px;
}

.hand-card {
  transition:
    transform 0.12s ease,
    box-shadow 0.12s ease,
    border-color 0.12s ease,
    background 0.12s ease;
}

.hand-card-section {
  padding: 14px 16px;
}

.hand-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.05);
}

.hand-card--selected {
  border-color: #3367e8;
  background: #f7f9ff;
}

.hand-title {
  font-size: 17px;
  font-weight: 700;
  line-height: 1.25;
  color: #111111;
  letter-spacing: -0.35px;
}

.hand-meta {
  font-size: 13px;
  font-weight: 500;
  color: #777777;
  line-height: 1.4;
}

.hand-memo {
  font-size: 14px;
  font-weight: 500;
  color: #222222;
  line-height: 1.45;
  white-space: pre-wrap;
  word-break: break-word;
}

.hand-card-side {
  display: flex;
  align-items: center;
  gap: 8px;
}

.bulk-action-bar {
  width: min(640px, calc(100vw - 32px));
  border-radius: 18px;
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.18);
}

.bulk-action-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 14px;
}

.bulk-action-title {
  font-size: 14px;
  font-weight: 800;
  color: #111111;
}

.bulk-action-subtitle {
  margin-top: 2px;
  font-size: 11px;
  font-weight: 600;
  color: #777777;
}

.bulk-action-buttons {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 0 0 auto;
}

.bulk-move-dialog-card {
  width: 100%;
  max-width: 520px;
  border-radius: 18px;
}

.bulk-move-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.bulk-move-hint {
  background: #f6f7fb;
  color: #333333;
}

@media (max-width: 599px) {
  .page-container {
    padding-bottom: 110px;
  }

  .level-actions {
    grid-template-columns: 1fr;
  }

  .level-stat-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .level-stat-grid .stat-box:last-child {
    grid-column: 1 / -1;
  }

  .stat-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .bulk-action-section {
    align-items: stretch;
    flex-direction: column;
  }

  .bulk-action-buttons {
    justify-content: flex-end;
  }
}
</style>
