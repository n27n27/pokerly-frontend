<template>
  <q-page class="hand-log-hand-page q-pa-md">
    <div class="page-container">
      <!-- 상세 로딩 -->
      <q-card v-if="isInitialLoading" flat bordered class="empty-card">
        <q-card-section class="text-center q-py-xl">
          <q-spinner size="32px" color="primary" />

          <div class="text-body2 text-grey-7 q-mt-md">핸드 기록을 불러오는 중입니다.</div>
        </q-card-section>
      </q-card>

      <!-- 핸드가 없을 때 -->
      <q-card v-else-if="!hand" flat bordered class="empty-card">
        <q-card-section class="text-center q-py-xl">
          <q-icon name="error_outline" size="42px" color="grey-5" />

          <div class="text-subtitle1 text-weight-bold q-mt-md">핸드 기록을 찾을 수 없습니다</div>

          <div class="text-body2 text-grey-7 q-mt-xs">
            삭제되었거나 접근할 수 없는 핸드일 수 있습니다.
          </div>

          <q-btn
            class="q-mt-md"
            color="dark"
            unelevated
            icon="arrow_back"
            :label="backLabel"
            @click="goBack"
          />
        </q-card-section>
      </q-card>

      <template v-else>
        <!-- 헤더 -->
        <div class="q-mb-md">
          <q-btn flat dense icon="arrow_back" :label="backLabel" class="q-mb-sm" @click="goBack" />

          <div class="row items-start justify-between q-col-gutter-md">
            <div class="col">
              <div class="row items-center q-gutter-sm">
                <div class="text-h5 text-weight-bold hand-title">
                  {{ handTitle }}
                </div>

                <q-badge
                  rounded
                  :color="handStrength.color"
                  text-color="white"
                  :label="handStrength.label"
                />

                <q-badge
                  v-if="hand.reviewRequired"
                  rounded
                  color="orange"
                  text-color="white"
                  label="복기"
                />
              </div>
            </div>

            <div class="col-auto">
              <q-btn flat dense round icon="more_vert" color="grey-8" :disable="saving">
                <q-menu auto-close anchor="bottom right" self="top right">
                  <q-list dense class="hand-action-menu">
                    <q-item clickable v-close-popup @click.stop="editDialog = true">
                      <q-item-section avatar>
                        <q-icon name="edit" size="18px" color="grey-8" />
                      </q-item-section>

                      <q-item-section>수정</q-item-section>
                    </q-item>

                    <q-item
                      clickable
                      v-close-popup
                      :disable="movableLevelOptions.length === 0"
                      @click.stop="openMoveDialog"
                    >
                      <q-item-section avatar>
                        <q-icon
                          name="swap_horiz"
                          size="18px"
                          :color="movableLevelOptions.length === 0 ? 'grey-5' : 'primary'"
                        />
                      </q-item-section>

                      <q-item-section>
                        <div :class="{ 'text-grey-5': movableLevelOptions.length === 0 }">
                          레벨 이동
                        </div>
                      </q-item-section>
                    </q-item>

                    <q-separator />

                    <q-item
                      clickable
                      v-close-popup
                      class="delete-menu-item"
                      @click.stop="confirmDeleteHand"
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

        <!-- 핸드 랭크 -->
        <q-card flat bordered class="section-card q-mb-md">
          <q-card-section>
            <div class="section-title">핸드 랭크</div>

            <div class="hand-rank-panel q-mt-md">
              <div class="hand-rank-main">
                <div class="hand-rank-value">{{ handRankText }}</div>

                <div class="hand-rank-percent">
                  {{ handRankPercentText }}
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- 기록 정보 -->
        <q-card flat bordered class="section-card q-mb-md">
          <q-card-section>
            <div class="section-title">기록 정보</div>

            <div class="info-list q-mt-md">
              <div class="info-row">
                <div class="info-label">포지션</div>
                <div class="info-value">{{ getPositionText(hand) }}</div>
              </div>

              <div class="info-row">
                <div class="info-label">프리플랍 액션</div>
                <div class="info-value">{{ getActionText(hand) }}</div>
              </div>

              <div class="info-row">
                <div class="info-label">프리플랍 올인</div>
                <div class="info-value">{{ hand.preflopAllIn ? '예' : '아니오' }}</div>
              </div>

              <div class="info-row">
                <div class="info-label">결과</div>
                <div class="info-value">{{ getResultText(hand) }}</div>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- 메모 -->
        <q-card flat bordered class="section-card">
          <q-card-section>
            <div class="section-title">메모</div>

            <div v-if="hand.memo" class="memo-box q-mt-md">
              {{ hand.memo }}
            </div>

            <div v-else class="empty-memo q-mt-md">기록된 메모가 없습니다.</div>
          </q-card-section>
        </q-card>
      </template>
    </div>

    <QuickHandLogDialog
      v-model="editDialog"
      :event="event"
      :level-label="levelLabel"
      :loading="saving"
      :edit-hand="hand"
      @save="updateHand"
    />

    <q-dialog v-model="moveDialog" :persistent="saving">
      <q-card class="move-dialog-card">
        <q-card-section>
          <div class="text-h6 text-weight-bold">레벨 이동</div>

          <div class="text-body2 text-grey-7 q-mt-xs">
            이 핸드를 같은 대회의 다른 블라인드 구간으로 이동합니다.
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section class="move-form">
          <q-select
            v-model="targetBlindLevelId"
            :options="movableLevelOptions"
            outlined
            emit-value
            map-options
            options-dense
            label="이동할 레벨"
            behavior="menu"
            :disable="saving"
          />

          <q-banner dense rounded class="move-warning-banner">
            이동 후 대상 레벨의 핸드 상세 화면으로 이동합니다.
          </q-banner>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="취소" color="grey-8" :disable="saving" @click="closeMoveDialog" />

          <q-btn
            unelevated
            color="primary"
            label="이동"
            :loading="saving"
            :disable="!canMoveHand || saving"
            @click="moveHand"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useQuasar } from 'quasar'
import { useRoute, useRouter } from 'vue-router'
import { useAlert } from 'src/composables/useAlert'

import QuickHandLogDialog from 'src/components/hand-log/QuickHandLogDialog.vue'
import { useHandLogStore } from 'src/stores/handLog'
import {
  getActionLabel,
  getHandStrength,
  getPreflopRankStat,
  getResultLabel,
} from 'src/utils/handLogHandAnalysis'

const route = useRoute()
const router = useRouter()
const $q = useQuasar()
const alert = useAlert()
const handLogStore = useHandLogStore()

const { detailLoading, levelLoading, handLoading, saving } = storeToRefs(handLogStore)

const editDialog = ref(false)
const moveDialog = ref(false)
const targetBlindLevelId = ref(null)

const eventId = computed(() => route.params.eventId)
const levelId = computed(() => route.params.levelId)
const handId = computed(() => route.params.handId)

const event = computed(() => {
  return handLogStore.getEventById(eventId.value)
})

const blindLevel = computed(() => {
  return handLogStore.getBlindLevelById(eventId.value, levelId.value)
})

const blindLevels = computed(() => {
  return event.value?.blindLevels || []
})

const hand = computed(() => {
  return handLogStore.getHandById(eventId.value, levelId.value, handId.value)
})

const isInitialLoading = computed(() => {
  return (detailLoading.value || levelLoading.value || handLoading.value) && !hand.value
})

const handTitle = computed(() => {
  return getHandValue(hand.value) || '핸드 미입력'
})

const handStrength = computed(() => {
  return getHandStrength(handTitle.value)
})

const handRankStat = computed(() => {
  return getPreflopRankStat(handTitle.value)
})

const handRankText = computed(() => {
  if (!handRankStat.value.rank) {
    return '-'
  }

  return `${handRankStat.value.rank}위`
})

const handRankPercentText = computed(() => {
  if (!handRankStat.value.percentile) {
    return '상위 정보 없음'
  }

  return `상위 ${handRankStat.value.percentile}%`
})

const levelLabel = computed(() => {
  if (!blindLevel.value) {
    return ''
  }

  return `L${blindLevel.value.levelNo} · ${formatBlind(blindLevel.value)}`
})

const movableLevelOptions = computed(() => {
  return blindLevels.value
    .filter((level) => {
      return String(level.id) !== String(levelId.value)
    })
    .map((level) => ({
      label: `L${level.levelNo} · ${formatBlind(level)}`,
      value: level.id,
    }))
})

const canMoveHand = computed(() => {
  return Boolean(targetBlindLevelId.value)
})

watch(
  [eventId, levelId, handId],
  async ([newEventId, newLevelId, newHandId]) => {
    if (!newEventId || !newLevelId || !newHandId) {
      return
    }

    try {
      await handLogStore.fetchEventDetail(newEventId)
      await handLogStore.fetchBlindLevelDetail(newEventId, newLevelId)
      await handLogStore.fetchHandDetail(newEventId, newLevelId, newHandId)
    } catch (error) {
      console.error(error)

      alert.show('핸드 기록을 불러오지 못했습니다.', 'error')
    }
  },
  { immediate: true },
)

const goBack = () => {
  if (fromPage.value === 'event') {
    router.push(`/app/mypoker/hand-log/${eventId.value}`)
    return
  }

  router.push(`/app/mypoker/hand-log/${eventId.value}/levels/${levelId.value}`)
}

const updateHand = async (payload) => {
  if (saving.value) {
    return
  }

  try {
    await handLogStore.updateHandInBlindLevel(eventId.value, levelId.value, handId.value, payload)

    editDialog.value = false
    alert.show('핸드 기록을 수정했습니다.', 'positive')
  } catch (error) {
    console.error(error)

    alert.show('핸드 기록을 수정하지 못했습니다.', 'error')
  }
}

const openMoveDialog = () => {
  targetBlindLevelId.value = null
  moveDialog.value = true
}

const closeMoveDialog = () => {
  if (saving.value) {
    return
  }

  moveDialog.value = false
  targetBlindLevelId.value = null
}

const moveHand = async () => {
  if (!canMoveHand.value || saving.value) {
    return
  }

  try {
    const movedHand = await handLogStore.moveHandToBlindLevel(
      eventId.value,
      levelId.value,
      handId.value,
      targetBlindLevelId.value,
    )

    const nextLevelId = movedHand?.blindLevelId || targetBlindLevelId.value

    moveDialog.value = false
    targetBlindLevelId.value = null

    alert.show('핸드를 다른 레벨로 이동했습니다.', 'positive')

    router.replace(
      `/app/mypoker/hand-log/${eventId.value}/levels/${nextLevelId}/hands/${handId.value}`,
    )
  } catch (error) {
    console.error(error)

    alert.show('핸드를 이동하지 못했습니다.', 'error')
  }
}

const confirmDeleteHand = () => {
  $q.dialog({
    title: '핸드 삭제',
    message: '이 핸드 기록을 삭제할까요? 삭제 후에는 복구할 수 없습니다.',
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
    deleteHand()
  })
}

const deleteHand = async () => {
  if (saving.value) {
    return
  }

  try {
    await handLogStore.deleteHandFromBlindLevel(eventId.value, levelId.value, handId.value)

    alert.show('핸드 기록을 삭제했습니다.', 'positive')
    goBack()
  } catch (error) {
    console.error(error)

    alert.show('핸드 기록을 삭제하지 못했습니다.', 'error')
  }
}

const getHandValue = (targetHand) => {
  if (!targetHand) {
    return ''
  }

  if (typeof targetHand === 'string') {
    return targetHand
  }

  return targetHand.holeCards || targetHand.hand || ''
}

const getPositionText = (targetHand) => {
  return targetHand?.positionLabel || targetHand?.position || '미기록'
}

const getActionText = (targetHand) => {
  if (!targetHand?.actionType) {
    return '미기록'
  }

  return targetHand.actionLabel || getActionLabel(targetHand.actionType) || targetHand.actionType
}

const getResultText = (targetHand) => {
  if (!targetHand?.resultType) {
    return '미기록'
  }

  return targetHand.resultLabel || getResultLabel(targetHand.resultType) || targetHand.resultType
}

const formatBlind = (level) => {
  return `${formatNumber(level.smallBlind)} / ${formatNumber(level.bigBlind)} / ${formatNumber(
    level.ante || 0,
  )}`
}

const formatNumber = (value) => {
  return Number(value || 0).toLocaleString('ko-KR')
}
const fromPage = computed(() => {
  return route.query.from || 'level'
})

const backLabel = computed(() => {
  return fromPage.value === 'event' ? '대회 통계' : '핸드 목록'
})
</script>

<style scoped>
.hand-log-hand-page {
  background: #f7f7f8;
}

.page-container {
  max-width: 1080px;
  margin: 0 auto;
}

.empty-card,
.section-card {
  border-radius: 16px;
  background: #ffffff;
}

.hand-title {
  line-height: 1.2;
}

.section-title {
  font-size: 16px;
  font-weight: 700;
}

.hand-action-menu {
  min-width: 148px;
}

.delete-menu-item {
  color: #c10015;
}

.hand-rank-panel {
  border: 1px solid #ececef;
  border-radius: 16px;
  padding: 16px;
  background: #fcfcfd;
}

.hand-rank-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.hand-rank-value {
  font-size: 28px;
  font-weight: 900;
  line-height: 1.1;
  color: #111;
}

.hand-rank-percent {
  flex: 0 0 auto;
  border: 1px solid #e5e7ee;
  border-radius: 999px;
  padding: 6px 10px;
  background: #ffffff;
  font-size: 12px;
  font-weight: 800;
  color: #555;
}

.info-list {
  border: 1px solid #ececef;
  border-radius: 14px;
  overflow: hidden;
  background: #ffffff;
}

.info-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 13px 14px;
  border-bottom: 1px solid #f0f0f2;
}

.info-row:last-child {
  border-bottom: none;
}

.info-label {
  flex: 0 0 auto;
  font-size: 13px;
  font-weight: 700;
  color: #666;
}

.info-value {
  min-width: 0;
  text-align: right;
  font-size: 14px;
  font-weight: 600;
  color: #222;
  word-break: break-word;
}

.memo-box {
  min-height: 90px;
  border: 1px solid #ececef;
  border-radius: 14px;
  padding: 14px;
  background: #fafafa;
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.6;
}

.empty-memo {
  border: 1px dashed #dedee3;
  border-radius: 14px;
  padding: 24px 14px;
  text-align: center;
  color: #777;
  background: #fafafa;
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

@media (max-width: 599px) {
  .info-row {
    align-items: flex-start;
    flex-direction: column;
    gap: 4px;
  }

  .info-value {
    text-align: left;
  }

  .hand-rank-main {
    align-items: center;
  }
}
</style>
