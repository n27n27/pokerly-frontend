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
            label="레벨 상세로"
            @click="goLevelDetail"
          />
        </q-card-section>
      </q-card>

      <template v-else>
        <!-- 헤더 -->
        <div class="q-mb-md">
          <q-btn
            flat
            dense
            icon="arrow_back"
            label="레벨 상세"
            class="q-mb-sm"
            @click="goLevelDetail"
          />

          <div class="row items-start justify-between q-col-gutter-md">
            <div class="col-12 col-md">
              <div class="row items-center q-gutter-sm">
                <div class="text-h5 text-weight-bold">
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

            <div class="col-12 col-md-auto">
              <div class="row q-col-gutter-sm">
                <div class="col-6 col-sm-auto">
                  <q-btn
                    class="action-btn"
                    color="dark"
                    outline
                    icon="edit"
                    label="수정"
                    :disable="saving"
                    @click="editDialog = true"
                  />
                </div>

                <div class="col-6 col-sm-auto">
                  <q-btn
                    class="action-btn"
                    color="negative"
                    outline
                    icon="delete"
                    label="삭제"
                    :loading="saving"
                    :disable="saving"
                    @click="confirmDeleteHand"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 핸드 요약 -->
        <q-card flat bordered class="section-card q-mb-md">
          <q-card-section>
            <div class="section-title">핸드 요약</div>

            <div class="hand-summary-panel q-mt-md">
              <div class="hand-summary-main">
                <div>
                  <div class="hand-summary-value">{{ handRankText }}</div>
                </div>

                <q-badge
                  rounded
                  class="rank-group-badge"
                  color="grey-9"
                  text-color="white"
                  :label="handRankGroupText"
                />
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- 핸드 정보 -->
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

const eventId = computed(() => route.params.eventId)
const levelId = computed(() => route.params.levelId)
const handId = computed(() => route.params.handId)

const event = computed(() => {
  return handLogStore.getEventById(eventId.value)
})

const blindLevel = computed(() => {
  return handLogStore.getBlindLevelById(eventId.value, levelId.value)
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

const handRankGroupText = computed(() => {
  return handRankStat.value.summaryLabel || '-'
})

const levelLabel = computed(() => {
  if (!blindLevel.value) {
    return ''
  }

  return `L${blindLevel.value.levelNo} · ${formatBlind(blindLevel.value)}`
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

const goLevelDetail = () => {
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
    goLevelDetail()
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

.section-title {
  font-size: 16px;
  font-weight: 700;
}
.hand-summary-panel {
  border: 1px solid #ececef;
  border-radius: 16px;
  padding: 15px 16px;
  background: #fcfcfd;
}

.hand-summary-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.hand-summary-label {
  font-size: 12px;
  font-weight: 800;
  color: #777;
}

.hand-summary-value {
  margin-top: 3px;
  font-size: 26px;
  font-weight: 900;
  line-height: 1.1;
  color: #111;
}

.rank-group-badge {
  padding: 6px 10px;
  font-size: 12px;
  font-weight: 800;
}

.hand-summary-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.hand-summary-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.hand-summary-row span {
  font-size: 13px;
  font-weight: 700;
  color: #666;
}

.hand-summary-row strong {
  font-size: 14px;
  font-weight: 900;
  color: #222;
  text-align: right;
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

.action-btn {
  min-width: 96px;
}

@media (max-width: 599px) {
  .action-btn {
    width: 100%;
  }

  .info-row {
    align-items: flex-start;
    flex-direction: column;
    gap: 4px;
  }

  .info-value {
    text-align: left;
  }
}
</style>
