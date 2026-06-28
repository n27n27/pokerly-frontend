<template>
  <q-page class="hand-log-detail-page q-pa-md">
    <div class="page-container">
      <q-card v-if="isInitialLoading" flat bordered class="empty-card">
        <q-card-section class="text-center q-py-xl">
          <q-spinner size="32px" color="primary" />
          <div class="text-body2 text-grey-7 q-mt-md">대회 정보를 불러오는 중입니다.</div>
        </q-card-section>
      </q-card>

      <q-card v-else-if="!event" flat bordered class="empty-card">
        <q-card-section class="text-center q-py-xl">
          <q-icon name="error_outline" size="42px" color="grey-5" />

          <div class="text-subtitle1 text-weight-bold q-mt-md">대회를 찾을 수 없습니다</div>

          <div class="text-body2 text-grey-7 q-mt-xs">
            삭제되었거나 접근할 수 없는 대회일 수 있습니다.
          </div>

          <q-btn
            class="q-mt-md"
            color="dark"
            unelevated
            icon="arrow_back"
            label="대회 목록으로"
            @click="goList"
          />
        </q-card-section>
      </q-card>

      <template v-else>
        <div class="q-mb-md">
          <q-btn flat dense icon="arrow_back" label="대회 목록" class="q-mb-sm" @click="goList" />

          <div class="row items-start justify-between q-col-gutter-md">
            <div class="col-12 col-md">
              <div class="text-h5 text-weight-bold event-title">
                {{ event.name }}
              </div>
            </div>

            <div class="col-12 col-md-auto">
              <q-btn
                class="copy-btn"
                color="dark"
                outline
                icon="content_copy"
                label="전체 복기 복사"
                @click="copyEventReviewText"
              />
            </div>
          </div>
        </div>

        <q-card flat bordered class="section-card q-mb-md">
          <q-card-section>
            <div class="row items-start justify-between q-col-gutter-md q-mb-md">
              <div class="col-12 col-sm">
                <div class="section-title">블라인드 구간</div>
                <div class="text-body2 text-grey-7 q-mt-xs">
                  레벨을 선택해 해당 구간의 핸드를 기록합니다.
                </div>
              </div>

              <div class="col-12 col-sm-auto">
                <div class="level-action-row">
                  <q-btn
                    v-if="canImportBlindStructure"
                    class="level-import-btn"
                    color="dark"
                    outline
                    icon="file_download"
                    label="구조 불러오기"
                    :disable="saving || sourceEventOptions.length === 0"
                    @click="openBlindImportDialog"
                  />

                  <q-btn
                    class="level-add-btn"
                    color="primary"
                    unelevated
                    icon="add"
                    label="레벨 추가"
                    :disable="saving"
                    @click="openLevelCreateDialog"
                  />
                </div>
              </div>
            </div>

            <q-card v-if="blindLevels.length === 0" flat bordered class="empty-level-card">
              <q-card-section class="text-center q-py-lg">
                <q-icon name="layers" size="36px" color="grey-5" />

                <div class="text-subtitle2 text-weight-bold q-mt-md">
                  등록된 블라인드 구간이 없습니다
                </div>

                <div class="text-body2 text-grey-7 q-mt-xs">
                  먼저 현재 레벨과 블라인드를 추가해 주세요.
                </div>
              </q-card-section>
            </q-card>

            <div v-else class="level-list">
              <div
                v-for="level in blindLevels"
                :key="getLevelKey(level)"
                class="level-row cursor-pointer"
                @click="openLevel(level)"
              >
                <div class="level-row-main">
                  <div class="level-title">L{{ level.levelNo }} · {{ formatBlind(level) }}</div>

                  <div class="level-meta">
                    {{ getLevelHandCount(level) }}핸드 · 복기 {{ getLevelReviewCount(level) }}개
                  </div>
                </div>

                <div class="level-row-action">
                  <q-btn
                    flat
                    dense
                    round
                    icon="more_vert"
                    color="grey-7"
                    :disable="saving"
                    @click.stop
                  >
                    <q-menu auto-close anchor="bottom right" self="top right">
                      <q-list dense class="level-menu-list">
                        <q-item clickable v-close-popup @click.stop="openLevelEditDialog(level)">
                          <q-item-section avatar>
                            <q-icon name="edit" size="18px" color="grey-8" />
                          </q-item-section>

                          <q-item-section>수정</q-item-section>
                        </q-item>

                        <q-separator />

                        <q-item
                          v-if="levelHasHands(level)"
                          clickable
                          v-close-popup
                          class="blocked-delete-item"
                          @click.stop="notifyBlockedDeleteLevel"
                        >
                          <q-item-section avatar>
                            <q-icon name="lock" size="18px" color="grey-6" />
                          </q-item-section>

                          <q-item-section>
                            <div class="blocked-delete-title">삭제 불가</div>
                            <div class="blocked-delete-caption">핸드 먼저 삭제</div>
                          </q-item-section>
                        </q-item>

                        <q-item
                          v-else
                          clickable
                          v-close-popup
                          class="delete-menu-item"
                          @click.stop="confirmDeleteLevel(level)"
                        >
                          <q-item-section avatar>
                            <q-icon name="delete" size="18px" color="negative" />
                          </q-item-section>

                          <q-item-section>삭제</q-item-section>
                        </q-item>
                      </q-list>
                    </q-menu>
                  </q-btn>
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <q-dialog v-model="blindImportDialog" :persistent="saving">
          <q-card class="blind-import-dialog-card">
            <q-card-section class="blind-import-header">
              <div class="text-h5 text-weight-bold">블라인드 구조 불러오기</div>

              <div class="text-body1 text-grey-7 q-mt-sm">
                기존 대회의 블라인드 구조를 현재 대회에 한 번에 생성합니다.
              </div>
            </q-card-section>

            <q-separator />

            <q-card-section class="blind-import-section">
              <div v-if="sourceEventOptions.length === 0" class="blind-empty-box">
                <q-icon name="inventory_2" size="30px" color="grey-5" />

                <div class="text-subtitle2 text-weight-bold q-mt-sm">
                  불러올 수 있는 대회가 없습니다
                </div>

                <div class="text-body2 text-grey-7 q-mt-xs">
                  블라인드 구간이 등록된 다른 대회가 있어야 합니다.
                </div>
              </div>

              <div v-else class="blind-source-list">
                <button
                  v-for="item in sourceEventOptions"
                  :key="item.value"
                  type="button"
                  class="blind-source-item"
                  :class="{
                    'blind-source-item--selected':
                      String(selectedSourceEventId) === String(item.value),
                  }"
                  @click="selectedSourceEventId = item.value"
                >
                  <div class="blind-source-main">
                    <div class="blind-source-name">{{ item.name }}</div>
                    <div class="blind-source-meta">{{ item.levelCount }}레벨</div>
                  </div>

                  <q-icon
                    :name="
                      String(selectedSourceEventId) === String(item.value)
                        ? 'radio_button_checked'
                        : 'radio_button_unchecked'
                    "
                    size="20px"
                    :color="
                      String(selectedSourceEventId) === String(item.value) ? 'primary' : 'grey-5'
                    "
                  />
                </button>
              </div>

              <div v-if="selectedSourceEvent" class="blind-selected-hint">
                선택됨: {{ selectedSourceEvent.name }} · {{ selectedSourceEvent.levelCount }}레벨
              </div>
            </q-card-section>

            <q-card-actions align="right" class="q-pa-md">
              <q-btn
                flat
                label="취소"
                color="grey-8"
                :disable="saving"
                @click="closeBlindImportDialog"
              />

              <q-btn
                unelevated
                color="dark"
                label="불러오기"
                :loading="saving"
                :disable="!canImportSelectedStructure || saving"
                @click="importBlindStructure"
              />
            </q-card-actions>
          </q-card>
        </q-dialog>

        <q-card flat bordered class="section-card">
          <q-card-section>
            <div class="section-title">대회 통계</div>

            <div v-if="totalHandCount === 0" class="empty-stat-box q-mt-md">
              <q-icon name="query_stats" size="34px" color="grey-5" />

              <div class="text-subtitle2 text-weight-bold q-mt-sm">아직 기록된 핸드가 없습니다</div>

              <div class="text-body2 text-grey-7 q-mt-xs">
                블라인드 구간 안에서 핸드를 기록하면 이 대회의 플레이 성향이 표시됩니다.
              </div>
            </div>

            <template v-else>
              <div class="text-caption text-grey-7 q-mt-xs">
                기록한 핸드만 기준으로 계산됩니다. 모든 핸드를 기록하지 않으면 실제 VPIP/PFR과 다를
                수 있습니다.
              </div>

              <div class="row q-col-gutter-sm q-mt-sm">
                <div class="col-6 col-sm-4">
                  <div class="stat-box">
                    <div class="stat-value">{{ totalHandCount }}</div>
                    <div class="stat-label">기록 핸드</div>
                  </div>
                </div>

                <div class="col-6 col-sm-4">
                  <div class="stat-box">
                    <div class="stat-value">{{ reviewHandCount }}</div>
                    <div class="stat-label">복기 필요</div>
                  </div>
                </div>

                <div class="col-6 col-sm-4">
                  <div class="stat-box">
                    <div class="stat-value">{{ vpipPercent }}</div>
                    <div class="stat-label">기록 기준 VPIP</div>
                  </div>
                </div>

                <div class="col-6 col-sm-4">
                  <div class="stat-box">
                    <div class="stat-value">{{ pfrPercent }}</div>
                    <div class="stat-label">기록 기준 PFR</div>
                  </div>
                </div>

                <div class="col-6 col-sm-4">
                  <div class="stat-box">
                    <div class="stat-value">{{ threeBetPlusCount }}</div>
                    <div class="stat-label">3Bet+</div>
                  </div>
                </div>

                <div class="col-6 col-sm-4">
                  <div class="stat-box">
                    <div class="stat-value">{{ showdownCount }}</div>
                    <div class="stat-label">쇼다운</div>
                  </div>
                </div>
              </div>

              <StartingHandSummary class="q-mt-lg" :hands="allHands" @open-hand="openSummaryHand" />
            </template>
          </q-card-section>
        </q-card>
      </template>
    </div>

    <BaseDialog
      v-model="levelDialog"
      :title="levelDialogTitle"
      :description="levelDialogDescription"
      :maximized="$q.screen.lt.sm"
      :persistent="saving"
    >
      <div class="level-form">
        <q-input
          v-model="levelForm.levelNo"
          type="number"
          outlined
          dense
          label="레벨"
          placeholder="예: 4"
          min="1"
          :disable="saving"
        />

        <q-input
          v-model="levelForm.smallBlind"
          type="number"
          outlined
          dense
          label="스몰 블라인드"
          placeholder="예: 300"
          min="0"
          :disable="saving"
        />

        <q-input
          v-model="levelForm.bigBlind"
          type="number"
          outlined
          dense
          label="빅 블라인드"
          placeholder="예: 600"
          min="0"
          :disable="saving"
        />

        <q-input
          v-model="levelForm.ante"
          type="number"
          outlined
          dense
          label="앤티"
          placeholder="예: 600"
          min="0"
          :disable="saving"
        />
      </div>

      <template #actions>
        <q-btn flat label="취소" color="grey-8" :disable="saving" @click="closeLevelDialog" />

        <q-btn
          unelevated
          :label="levelSaveButtonLabel"
          color="dark"
          :loading="saving"
          :disable="!canSaveLevel || saving"
          @click="saveLevel"
        />
      </template>
    </BaseDialog>
  </q-page>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { copyToClipboard, useQuasar } from 'quasar'
import { useRoute, useRouter } from 'vue-router'
import { useAlert } from 'src/composables/useAlert'

import BaseDialog from 'components/common/BaseDialog.vue'
import StartingHandSummary from 'src/components/hand-log/StartingHandSummary.vue'
import { useHandLogStore } from 'src/stores/handLog'
import { buildEventReviewText } from 'src/utils/handLogExportText'
import {
  isPfrAction,
  isShowdownResult,
  isThreeBetPlusAction,
  isVpipAction,
} from 'src/utils/handLogHandAnalysis'

const route = useRoute()
const router = useRouter()
const $q = useQuasar()
const alert = useAlert()
const handLogStore = useHandLogStore()

const { detailLoading, saving } = storeToRefs(handLogStore)

const levelDialog = ref(false)
const editingLevel = ref(null)
const blindImportDialog = ref(false)
const selectedSourceEventId = ref(null)

const levelForm = reactive({
  levelNo: '',
  smallBlind: '',
  bigBlind: '',
  ante: '',
})

const eventId = computed(() => route.params.eventId)

const event = computed(() => {
  return handLogStore.getEventById(eventId.value)
})

const isInitialLoading = computed(() => {
  return detailLoading.value && !event.value
})

const blindLevels = computed(() => {
  return event.value?.blindLevels || []
})

const allHands = computed(() => {
  return blindLevels.value.reduce((acc, level) => {
    if (Array.isArray(level.hands)) {
      const levelLabel = `L${level.levelNo}`

      acc.push(
        ...level.hands.map((hand) => ({
          ...hand,
          __levelId: level.id,
          __levelNo: level.levelNo,
          __levelLabel: levelLabel,
        })),
      )
    }

    return acc
  }, [])
})

const totalHandCount = computed(() => {
  return allHands.value.length
})

const reviewHandCount = computed(() => {
  return allHands.value.filter((hand) => isReviewHand(hand)).length
})

const vpipCount = computed(() => {
  return allHands.value.filter((hand) => isVpipAction(getActionValue(hand))).length
})

const pfrCount = computed(() => {
  return allHands.value.filter((hand) => isPfrAction(getActionValue(hand))).length
})

const threeBetPlusCount = computed(() => {
  return allHands.value.filter((hand) => isThreeBetPlusAction(getActionValue(hand))).length
})

const showdownCount = computed(() => {
  return allHands.value.filter((hand) => isShowdownResult(getResultValue(hand))).length
})

const vpipPercent = computed(() => {
  return formatPercent(vpipCount.value, totalHandCount.value)
})

const pfrPercent = computed(() => {
  return formatPercent(pfrCount.value, totalHandCount.value)
})

const canImportBlindStructure = computed(() => {
  return blindLevels.value.length === 0
})

const sourceEventOptions = computed(() => {
  return handLogStore.eventItems
    .filter((item) => String(item.id) !== String(eventId.value))
    .filter((item) => {
      return Number(item.levelCount || item.blindLevels?.length || 0) > 0
    })
    .map((item) => ({
      value: item.id,
      name: item.name,
      levelCount: Number(item.levelCount || item.blindLevels?.length || 0),
    }))
})

const selectedSourceEvent = computed(() => {
  return (
    sourceEventOptions.value.find(
      (item) => String(item.value) === String(selectedSourceEventId.value),
    ) || null
  )
})

const canImportSelectedStructure = computed(() => {
  return Boolean(selectedSourceEventId.value) && canImportBlindStructure.value
})

const isLevelEditMode = computed(() => {
  return Boolean(editingLevel.value?.id)
})

const levelDialogTitle = computed(() => {
  return isLevelEditMode.value ? '레벨 수정' : '레벨 추가'
})

const levelDialogDescription = computed(() => {
  return isLevelEditMode.value
    ? '블라인드 구간 정보를 수정합니다.'
    : '이 레벨 안에서 핸드를 기록하게 됩니다.'
})

const levelSaveButtonLabel = computed(() => {
  return isLevelEditMode.value ? '수정' : '저장'
})

const canSaveLevel = computed(() => {
  return (
    String(levelForm.levelNo || '').trim() !== '' &&
    String(levelForm.smallBlind || '').trim() !== '' &&
    String(levelForm.bigBlind || '').trim() !== ''
  )
})

watch(
  eventId,
  async (value) => {
    if (!value) {
      return
    }

    try {
      await handLogStore.fetchEventDetail(value)
      await handLogStore.fetchEvents()
    } catch (error) {
      console.error(error)

      alert.show('대회 정보를 불러오지 못했습니다.', 'error')
    }
  },
  { immediate: true },
)

const goList = () => {
  router.push('/app/mypoker/hand-log')
}

const openLevelCreateDialog = () => {
  editingLevel.value = null
  resetLevelForm()
  levelDialog.value = true
}

const openLevelEditDialog = (level) => {
  editingLevel.value = level

  levelForm.levelNo = level.levelNo ?? ''
  levelForm.smallBlind = level.smallBlind ?? ''
  levelForm.bigBlind = level.bigBlind ?? ''
  levelForm.ante = level.ante ?? 0

  levelDialog.value = true
}

const closeLevelDialog = () => {
  if (saving.value) {
    return
  }

  levelDialog.value = false
  editingLevel.value = null
  resetLevelForm()
}

const resetLevelForm = () => {
  levelForm.levelNo = ''
  levelForm.smallBlind = ''
  levelForm.bigBlind = ''
  levelForm.ante = ''
}

const saveLevel = async () => {
  if (!canSaveLevel.value || saving.value) {
    return
  }

  try {
    if (isLevelEditMode.value) {
      await handLogStore.updateBlindLevel(eventId.value, editingLevel.value.id, {
        levelNo: toNumber(levelForm.levelNo),
        smallBlind: toNumber(levelForm.smallBlind),
        bigBlind: toNumber(levelForm.bigBlind),
        ante: toNumber(levelForm.ante),
      })

      alert.show('레벨을 수정했습니다.', 'positive')
    } else {
      await handLogStore.addBlindLevel(eventId.value, {
        levelNo: toNumber(levelForm.levelNo),
        smallBlind: toNumber(levelForm.smallBlind),
        bigBlind: toNumber(levelForm.bigBlind),
        ante: toNumber(levelForm.ante),
      })

      alert.show('레벨을 추가했습니다.', 'positive')
    }

    closeLevelDialog()
  } catch (error) {
    console.error(error)

    alert.show(
      getErrorMessage(
        error,
        isLevelEditMode.value ? '레벨을 수정하지 못했습니다.' : '레벨을 추가하지 못했습니다.',
      ),
      'error',
    )
  }
}

const confirmDeleteLevel = (level) => {
  if (saving.value) {
    return
  }

  if (levelHasHands(level)) {
    alert.show('이 레벨에 기록된 핸드가 있어 삭제할 수 없습니다.', 'warning')
    return
  }

  $q.dialog({
    title: '레벨 삭제',
    message: `L${level.levelNo} · ${formatBlind(level)} 구간을 삭제할까요?`,
    cancel: {
      label: '취소',
      flat: true,
      color: 'grey-8',
    },
    ok: {
      label: '삭제',
      color: 'negative',
      unelevated: true,
    },
    persistent: true,
  }).onOk(() => {
    deleteLevel(level)
  })
}

const deleteLevel = async (level) => {
  if (saving.value || !level?.id) {
    return
  }

  try {
    await handLogStore.deleteBlindLevel(eventId.value, level.id)

    alert.show('레벨을 삭제했습니다.', 'positive')
  } catch (error) {
    console.error(error)

    alert.show(getErrorMessage(error, '레벨을 삭제하지 못했습니다.'), 'error')
  }
}

const openLevel = (level) => {
  if (!level.id) {
    return
  }

  router.push(`/app/mypoker/hand-log/${eventId.value}/levels/${level.id}`)
}

const getLevelKey = (level) => {
  return level.id
}

const copyEventReviewText = async () => {
  if (!event.value) {
    return
  }

  const text = buildEventReviewText(event.value)

  try {
    await copyToClipboard(text)

    alert.show('대회 전체 복기 텍스트를 복사했습니다.', 'positive')
  } catch (error) {
    console.error(error)

    alert.show('복사에 실패했습니다.', 'error')
  }
}

const formatBlind = (level) => {
  return `${formatNumber(level.smallBlind)} / ${formatNumber(level.bigBlind)} / ${formatNumber(
    level.ante || 0,
  )}`
}

const formatNumber = (value) => {
  return Number(value || 0).toLocaleString('ko-KR')
}

const toNumber = (value) => {
  const numberValue = Number(value)

  if (Number.isNaN(numberValue)) {
    return 0
  }

  return numberValue
}

const formatPercent = (count, total) => {
  if (!total) {
    return '0%'
  }

  return `${Math.round((count / total) * 100)}%`
}

const getLevelHandCount = (level) => {
  return level.handCount ?? level.hands?.length ?? 0
}

const getLevelReviewCount = (level) => {
  return level.reviewRequiredCount ?? level.hands?.filter((hand) => isReviewHand(hand)).length ?? 0
}

const levelHasHands = (level) => {
  return getLevelHandCount(level) > 0
}

const notifyBlockedDeleteLevel = () => {
  alert.show('이 레벨에 기록된 핸드가 있어 삭제할 수 없습니다.', 'warning')
}

const openSummaryHand = (hand) => {
  if (!hand?.id || !hand.__levelId) {
    return
  }

  router.push({
    path: `/app/mypoker/hand-log/${eventId.value}/levels/${hand.__levelId}/hands/${hand.id}`,
    query: { from: 'event' },
  })
}

const isReviewHand = (hand) => {
  return Boolean(hand?.reviewRequired)
}

const getActionValue = (hand) => {
  return hand?.actionType || ''
}

const getResultValue = (hand) => {
  return hand?.resultType || ''
}

const getErrorMessage = (error, fallback) => {
  return (
    error?.response?.data?.error?.message ||
    error?.response?.data?.message ||
    error?.message ||
    fallback
  )
}

const openBlindImportDialog = async () => {
  if (!canImportBlindStructure.value) {
    alert.show('이미 등록된 블라인드 구간이 있어 불러올 수 없습니다.', 'warning')
    return
  }

  try {
    await handLogStore.fetchEvents()
  } catch (error) {
    console.error(error)
  }

  selectedSourceEventId.value = null
  blindImportDialog.value = true
}

const closeBlindImportDialog = () => {
  if (saving.value) {
    return
  }

  blindImportDialog.value = false
  selectedSourceEventId.value = null
}

const importBlindStructure = async () => {
  if (!canImportSelectedStructure.value || saving.value) {
    return
  }

  try {
    await handLogStore.copyBlindLevelsFromEvent(eventId.value, selectedSourceEventId.value)

    blindImportDialog.value = false
    selectedSourceEventId.value = null

    alert.show('블라인드 구조를 불러왔습니다.', 'positive')
  } catch (error) {
    console.error(error)

    alert.show(getErrorMessage(error, '블라인드 구조를 불러오지 못했습니다.'), 'error')
  }
}
</script>

<style scoped>
.hand-log-detail-page {
  background: #f7f7f8;
}

.page-container {
  max-width: 1080px;
  margin: 0 auto;
}

.empty-card,
.section-card,
.empty-level-card {
  border-radius: 16px;
  background: #ffffff;
}

.event-title {
  line-height: 1.25;
}

.section-title {
  font-size: 16px;
  font-weight: 700;
}

.empty-stat-box {
  border: 1px dashed #dedee3;
  border-radius: 16px;
  padding: 24px 16px;
  text-align: center;
  background: #fafafa;
}

.stat-box {
  border: 1px solid #ececef;
  border-radius: 14px;
  padding: 14px 10px;
  text-align: center;
  background: #fafafa;
}

.stat-value {
  font-size: 20px;
  font-weight: 800;
  line-height: 1.2;
}

.stat-label {
  margin-top: 4px;
  font-size: 12px;
  color: #777;
}

.empty-level-card {
  border-style: dashed;
}

.level-list {
  border: 1px solid #ececef;
  border-radius: 16px;
  overflow: hidden;
  background: #ffffff;
}

.level-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 68px;
  padding: 13px 12px 13px 14px;
  border-bottom: 1px solid #f1f1f4;
  transition:
    background 0.12s ease,
    transform 0.12s ease;
}

.level-row:last-child {
  border-bottom: none;
}

.level-row:hover {
  background: #fafafa;
}

.level-row-main {
  min-width: 0;
  flex: 1 1 auto;
}

.level-title {
  font-size: 15px;
  font-weight: 900;
  line-height: 1.25;
  color: #111;
}

.level-meta {
  margin-top: 5px;
  font-size: 13px;
  font-weight: 600;
  color: #777;
}

.level-row-action {
  flex: 0 0 auto;
}

.level-menu-list {
  min-width: 138px;
}

.level-add-btn,
.copy-btn {
  min-width: 132px;
}

.level-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.blocked-delete-item {
  cursor: not-allowed;
}

.blocked-delete-title {
  font-size: 13px;
  font-weight: 700;
  color: #666;
}

.blocked-delete-caption {
  margin-top: 2px;
  font-size: 11px;
  color: #999;
}

.delete-menu-item {
  color: #c10015;
}

.level-action-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.level-import-btn,
.level-add-btn {
  min-width: 132px;
}

.blind-import-dialog-card {
  width: 100%;
  max-width: 520px;
  border-radius: 22px;
  overflow: hidden;
  background: #ffffff;
}

.blind-import-header {
  padding-bottom: 18px;
}

.blind-import-section {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding-top: 18px;
}

.blind-empty-box {
  border: 1px dashed #d8dbe2;
  border-radius: 16px;
  padding: 24px 16px;
  text-align: center;
  background: #fafafa;
}

.blind-source-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 320px;
  overflow-y: auto;
}

.blind-source-item {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 14px;
  border: 1px solid #e5e7ee;
  border-radius: 16px;
  background: #ffffff;
  text-align: left;
  cursor: pointer;
  transition:
    border-color 0.12s ease,
    background 0.12s ease,
    box-shadow 0.12s ease;
}

.blind-source-item:hover {
  border-color: #cfd6e6;
  background: #fafbff;
}

.blind-source-item--selected {
  border-color: #3367e8;
  background: #f6f8ff;
  box-shadow: 0 0 0 1px rgba(51, 103, 232, 0.06);
}

.blind-source-main {
  min-width: 0;
  flex: 1 1 auto;
}

.blind-source-name {
  font-size: 15px;
  font-weight: 800;
  color: #111;
  line-height: 1.3;
}

.blind-source-meta {
  margin-top: 4px;
  font-size: 13px;
  font-weight: 600;
  color: #777;
}

.blind-selected-hint {
  font-size: 13px;
  font-weight: 700;
  color: #555;
  padding: 2px 2px 0;
}

.import-preview-banner {
  background: #f6f7fb;
  color: #333;
}

.import-warning-banner {
  background: #fff8e1;
  color: #6d4c00;
}

@media (max-width: 599px) {
  .level-action-row {
    width: 100%;
    flex-direction: column;
  }

  .level-import-btn,
  .level-add-btn,
  .copy-btn {
    width: 100%;
  }

  .blind-import-dialog-card {
    max-width: 100%;
    border-radius: 20px;
  }

  .blind-source-list {
    max-height: 280px;
  }
}
</style>
