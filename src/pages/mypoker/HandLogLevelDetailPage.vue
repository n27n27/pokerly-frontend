<template>
  <q-page class="hand-log-level-page q-pa-md">
    <div class="page-container">
      <!-- 상세 로딩 -->
      <q-card v-if="isInitialLoading" flat bordered class="empty-card">
        <q-card-section class="text-center q-py-xl">
          <q-spinner size="32px" color="primary" />

          <div class="text-body2 text-grey-7 q-mt-md">블라인드 구간을 불러오는 중입니다.</div>
        </q-card-section>
      </q-card>

      <!-- 대회 또는 레벨이 없을 때 -->
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
            label="대회 상세로"
            @click="goEventDetail"
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
            label="대회 상세"
            class="q-mb-sm"
            @click="goEventDetail"
          />

          <div class="row items-start justify-between q-col-gutter-md">
            <div class="col-12 col-md">
              <div class="text-h5 text-weight-bold">
                L{{ blindLevel.levelNo }} · {{ formatBlind(blindLevel) }}
              </div>

              <div class="text-body2 text-grey-7 q-mt-xs">
                {{ event.name }}
                <span v-if="event.eventAt || event.createdAt">
                  · {{ formatDateTime(event.eventAt || event.createdAt) }}
                </span>
              </div>
            </div>

            <div class="col-12 col-md-auto">
              <div class="row q-col-gutter-sm">
                <div class="col-12 col-sm-auto">
                  <q-btn
                    class="copy-btn"
                    color="dark"
                    outline
                    icon="content_copy"
                    label="복사용 텍스트"
                    :disable="saving"
                    @click="copyDialog = true"
                  />
                </div>

                <div class="col-12 col-sm-auto">
                  <q-btn
                    class="hand-add-btn"
                    color="primary"
                    unelevated
                    icon="add"
                    label="핸드 기록"
                    :disable="saving"
                    @click="quickLogDialog = true"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 핸드 목록 -->
        <q-card flat bordered class="section-card q-mb-md">
          <q-card-section>
            <div class="q-mb-md">
              <div class="section-title">핸드 목록</div>
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
              <q-card v-for="hand in levelHands" :key="hand.id" flat bordered class="hand-card">
                <q-card-section>
                  <div class="row items-center justify-between q-col-gutter-md">
                    <div class="col">
                      <div class="row items-center q-gutter-xs">
                        <div class="text-subtitle1 text-weight-bold">
                          {{ hand.holeCards || hand.hand || '핸드 미입력' }}
                        </div>

                        <q-badge
                          rounded
                          :color="getHandStrengthColor(hand)"
                          text-color="white"
                          :label="getHandStrengthLabel(hand)"
                        />
                      </div>

                      <div v-if="getHandMetaText(hand)" class="text-body2 text-grey-7 q-mt-xs">
                        {{ getHandMetaText(hand) }}
                      </div>

                      <div v-if="hand.memo" class="text-body2 q-mt-sm">
                        {{ hand.memo }}
                      </div>
                    </div>

                    <div v-if="hand.reviewRequired" class="col-auto">
                      <q-badge color="orange" text-color="white" label="복기" />
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </q-card-section>
        </q-card>

        <!-- 레벨 통계 -->
        <q-card v-if="levelHands.length > 0" flat bordered class="section-card">
          <q-card-section>
            <div class="section-title">레벨 통계</div>

            <div class="text-caption text-grey-7 q-mt-xs">
              기록한 핸드만 기준으로 계산됩니다. 모든 핸드를 기록하지 않으면 실제 VPIP/PFR과 다를 수
              있습니다.
            </div>

            <div class="row q-col-gutter-sm q-mt-sm">
              <div class="col-6 col-sm-4">
                <div class="stat-box">
                  <div class="stat-value">{{ levelHands.length }}</div>
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
    <HandLogLevelCopyDialog
      v-model="copyDialog"
      :event="event"
      :blind-level="blindLevel"
      :hands="levelHands"
    />
    <q-page-sticky v-if="event && blindLevel" position="bottom-right" :offset="[16, 16]">
      <q-btn
        round
        size="lg"
        color="primary"
        icon="add"
        :disable="saving"
        @click="quickLogDialog = true"
      />
    </q-page-sticky>
  </q-page>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useAlert } from 'src/composables/useAlert'
import { useRoute, useRouter } from 'vue-router'

import QuickHandLogDialog from 'src/components/hand-log/QuickHandLogDialog.vue'
import HandLogLevelCopyDialog from 'src/components/hand-log/HandLogLevelCopyDialog.vue'
import { useHandLogStore } from 'src/stores/handLog'
import { getHandStrength } from 'src/utils/handLogHandAnalysis'

const VPIP_ACTIONS = new Set(['LIMP', 'CALL', 'OPEN', 'THREE_BET', 'FOUR_BET_PLUS', 'BB_DEFENSE'])
const PFR_ACTIONS = new Set(['OPEN', 'THREE_BET', 'FOUR_BET_PLUS'])
const THREE_BET_PLUS_ACTIONS = new Set(['THREE_BET', 'FOUR_BET_PLUS'])
const SHOWDOWN_RESULTS = new Set(['SHOWDOWN_WIN', 'SHOWDOWN_LOSS'])

const ACTION_LABEL_MAP = {
  FOLD: '폴드',
  CHECK: '체크',
  LIMP: '림프',
  CALL: '콜',
  OPEN: '오픈',
  THREE_BET: '3벳',
  FOUR_BET_PLUS: '4벳+',
  BB_DEFENSE: 'BB 방어',
}

const RESULT_LABEL_MAP = {
  FOLD: '폴드',
  NON_SHOWDOWN_WIN: '노쇼다운 승리',
  SHOWDOWN_WIN: '쇼다운 승리',
  SHOWDOWN_LOSS: '쇼다운 패배',
  CHOP: '찹',
}

const route = useRoute()
const router = useRouter()
const alert = useAlert()
const handLogStore = useHandLogStore()
const copyDialog = ref(false)

const { detailLoading, levelLoading, saving } = storeToRefs(handLogStore)

const quickLogDialog = ref(false)

const eventId = computed(() => route.params.eventId)
const levelId = computed(() => route.params.levelId)

const event = computed(() => {
  return handLogStore.getEventById(eventId.value)
})

const blindLevel = computed(() => {
  return handLogStore.getBlindLevelById(eventId.value, levelId.value)
})

const isInitialLoading = computed(() => {
  return (detailLoading.value || levelLoading.value) && (!event.value || !blindLevel.value)
})

const levelHands = computed(() => {
  const hands = blindLevel.value?.hands || []

  return [...hands].sort((a, b) => {
    return String(b.createdAt || '').localeCompare(String(a.createdAt || ''))
  })
})

const levelLabel = computed(() => {
  if (!blindLevel.value) {
    return ''
  }

  return `L${blindLevel.value.levelNo} · ${formatBlind(blindLevel.value)}`
})

const reviewHandCount = computed(() => {
  return levelHands.value.filter((hand) => isReviewHand(hand)).length
})

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

const vpipPercent = computed(() => {
  return formatPercent(vpipCount.value, levelHands.value.length)
})

const pfrPercent = computed(() => {
  return formatPercent(pfrCount.value, levelHands.value.length)
})

watch(
  [eventId, levelId],
  async ([newEventId, newLevelId]) => {
    if (!newEventId || !newLevelId) {
      return
    }

    try {
      await handLogStore.fetchEventDetail(newEventId)
      await handLogStore.fetchBlindLevelDetail(newEventId, newLevelId)
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

const addHand = async (payload) => {
  if (saving.value) {
    return
  }

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

const formatBlind = (level) => {
  return `${formatNumber(level.smallBlind)} / ${formatNumber(level.bigBlind)} / ${formatNumber(
    level.ante || 0,
  )}`
}

const formatNumber = (value) => {
  return Number(value || 0).toLocaleString('ko-KR')
}

const formatPercent = (count, total) => {
  if (!total) {
    return '0%'
  }

  return `${Math.round((count / total) * 100)}%`
}

const formatDateTime = (value) => {
  if (!value) {
    return ''
  }

  return new Date(value).toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const getHandValue = (hand) => {
  return hand.holeCards || hand.hand || ''
}

const getHandStrengthLabel = (hand) => {
  return getHandStrength(getHandValue(hand)).label
}

const getHandStrengthColor = (hand) => {
  return getHandStrength(getHandValue(hand)).color
}

const getHandMetaText = (hand) => {
  const parts = []

  const positionText = hand.positionLabel || hand.position || ''
  const actionText = hand.actionLabel || ACTION_LABEL_MAP[hand.actionType] || ''
  const resultText =
    hand.resultType && hand.resultType !== 'NOT_RECORDED'
      ? hand.resultLabel || RESULT_LABEL_MAP[hand.resultType] || ''
      : ''

  if (positionText) {
    parts.push(positionText)
  }

  if (actionText) {
    parts.push(actionText)
  }

  if (hand.preflopAllIn) {
    parts.push('올인')
  }

  if (resultText) {
    parts.push(resultText)
  }

  return parts.join(' · ')
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

const isVpipAction = (action) => {
  return VPIP_ACTIONS.has(action)
}

const isPfrAction = (action) => {
  return PFR_ACTIONS.has(action)
}

const isThreeBetPlusAction = (action) => {
  return THREE_BET_PLUS_ACTIONS.has(action)
}

const isShowdownResult = (result) => {
  return SHOWDOWN_RESULTS.has(result)
}
</script>

<style scoped>
.hand-log-level-page {
  background: #f7f7f8;
}

.page-container {
  max-width: 1080px;
  margin: 0 auto;
}

.empty-card,
.section-card,
.empty-hand-card,
.hand-card {
  border-radius: 16px;
  background: #ffffff;
}

.section-title {
  font-size: 16px;
  font-weight: 700;
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

.empty-hand-card {
  border-style: dashed;
}

.hand-card {
  transition:
    transform 0.12s ease,
    box-shadow 0.12s ease;
}

.hand-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.05);
}

.hand-add-btn {
  min-width: 120px;
}

.copy-btn {
  min-width: 132px;
}

@media (max-width: 599px) {
  .hand-add-btn,
  .copy-btn {
    width: 100%;
  }
}
</style>
