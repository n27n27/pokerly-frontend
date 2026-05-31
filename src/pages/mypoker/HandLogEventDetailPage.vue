<template>
  <q-page class="hand-log-detail-page q-pa-md">
    <div class="page-container">
      <!-- 상세 로딩 -->
      <q-card v-if="isInitialLoading" flat bordered class="empty-card">
        <q-card-section class="text-center q-py-xl">
          <q-spinner size="32px" color="primary" />

          <div class="text-body2 text-grey-7 q-mt-md">대회 정보를 불러오는 중입니다.</div>
        </q-card-section>
      </q-card>

      <!-- 대회가 없을 때 -->
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
        <!-- 헤더 -->
        <div class="q-mb-md">
          <q-btn flat dense icon="arrow_back" label="대회 목록" class="q-mb-sm" @click="goList" />

          <div class="row items-start justify-between q-col-gutter-md">
            <div class="col-12 col-md">
              <div class="text-h5 text-weight-bold">
                {{ event.name }}
              </div>

              <div class="text-body2 text-grey-7 q-mt-xs">
                {{ formatDateTime(event.eventAt || event.createdAt) }}
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

        <!-- 블라인드 구간 -->
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
                <q-btn
                  class="level-add-btn"
                  color="primary"
                  unelevated
                  icon="add"
                  label="레벨 추가"
                  :disable="saving"
                  @click="openLevelDialog"
                />
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

            <div v-else class="column q-gutter-sm">
              <q-card
                v-for="level in blindLevels"
                :key="getLevelKey(level)"
                flat
                bordered
                class="level-card cursor-pointer"
                @click="openLevel(level)"
              >
                <q-card-section>
                  <div class="row items-center justify-between q-col-gutter-md">
                    <div class="col">
                      <div class="text-subtitle1 text-weight-bold">
                        L{{ level.levelNo }} · {{ formatBlind(level) }}
                      </div>

                      <div class="text-body2 text-grey-7 q-mt-xs">
                        {{ getLevelHandCount(level) }}핸드 · 복기 {{ getLevelReviewCount(level) }}개
                      </div>
                    </div>

                    <div class="col-auto">
                      <q-icon name="chevron_right" size="24px" color="grey-6" />
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </q-card-section>
        </q-card>

        <!-- 대회 통계 -->
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

              <div class="rank-section q-mt-lg">
                <div class="section-title">핸드 랭크 요약</div>

                <div class="text-caption text-grey-7 q-mt-xs">
                  169개 스타팅 핸드 고정 순위 기준입니다. 이 대회에서 좋은 핸드를 얼마나 받았는지
                  빠르게 확인하는 용도입니다.
                </div>

                <div class="rank-overview-card q-mt-md">
                  <div class="rank-meter">
                    <div
                      v-for="bucket in eventRankSummary"
                      :key="`meter-${bucket.key}`"
                      class="rank-meter-segment"
                      :class="getRankToneClass(bucket)"
                      :style="getRankSegmentStyle(bucket)"
                    >
                      <span v-if="bucket.percent >= 12">{{ bucket.percent }}%</span>
                    </div>
                  </div>

                  <div class="rank-list q-mt-md">
                    <div v-for="bucket in eventRankSummary" :key="bucket.key" class="rank-list-row">
                      <div class="rank-list-left">
                        <span class="rank-dot" :class="getRankToneClass(bucket)" />

                        <div>
                          <div class="rank-list-label">{{ bucket.label }}</div>
                          <div class="rank-list-sub">{{ bucket.description }}</div>
                        </div>
                      </div>

                      <div class="rank-list-right">
                        <strong>{{ bucket.count }}개</strong>
                        <span>{{ bucket.percent }}%</span>
                      </div>
                    </div>
                  </div>

                  <div class="pocket-chip-row q-mt-md">
                    <div class="pocket-chip pocket-chip--high">
                      <span>하이 포켓 TT+</span>
                      <strong>{{ eventPocketSummary.highPocketCount }}개</strong>
                      <em>{{ eventPocketSummary.highPocketPercent }}%</em>
                    </div>

                    <div class="pocket-chip">
                      <span>포켓 전체</span>
                      <strong>{{ eventPocketSummary.pocketPairCount }}개</strong>
                      <em>{{ eventPocketSummary.pocketPairPercent }}%</em>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </q-card-section>
        </q-card>
      </template>
    </div>

    <!-- 레벨 추가 다이얼로그 -->
    <q-dialog v-model="levelDialog" :persistent="saving">
      <q-card class="level-dialog-card">
        <q-card-section>
          <div class="text-h6 text-weight-bold">레벨 추가</div>
          <div class="text-body2 text-grey-7 q-mt-xs">이 레벨 안에서 핸드를 기록하게 됩니다.</div>
        </q-card-section>

        <q-separator />

        <q-card-section class="level-form">
          <q-input
            v-model="levelForm.levelNo"
            type="number"
            outlined
            label="레벨"
            placeholder="예: 4"
            min="1"
            :disable="saving"
          />

          <q-input
            v-model="levelForm.smallBlind"
            type="number"
            outlined
            label="스몰 블라인드"
            placeholder="예: 300"
            min="0"
            :disable="saving"
          />

          <q-input
            v-model="levelForm.bigBlind"
            type="number"
            outlined
            label="빅 블라인드"
            placeholder="예: 600"
            min="0"
            :disable="saving"
          />

          <q-input
            v-model="levelForm.ante"
            type="number"
            outlined
            label="앤티"
            placeholder="예: 600"
            min="0"
            :disable="saving"
          />
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="취소" color="grey-8" :disable="saving" v-close-popup />

          <q-btn
            unelevated
            label="저장"
            color="primary"
            :loading="saving"
            :disable="!canSaveLevel || saving"
            @click="saveLevel"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { copyToClipboard } from 'quasar'
import { useRoute, useRouter } from 'vue-router'
import { useAlert } from 'src/composables/useAlert'

import { useHandLogStore } from 'src/stores/handLog'
import { buildEventReviewText } from 'src/utils/handLogExportText'
import {
  createHandRankOverview,
  getHandInputValue,
  isPfrAction,
  isShowdownResult,
  isThreeBetPlusAction,
  isVpipAction,
} from 'src/utils/handLogHandAnalysis'

const route = useRoute()
const router = useRouter()
const alert = useAlert()
const handLogStore = useHandLogStore()

const { detailLoading, saving } = storeToRefs(handLogStore)

const levelDialog = ref(false)

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
      acc.push(...level.hands)
    }

    return acc
  }, [])
})

const allHandNotations = computed(() => {
  return allHands.value.map((hand) => getHandInputValue(hand)).filter(Boolean)
})

const eventRankOverview = computed(() => {
  return createHandRankOverview(allHandNotations.value)
})

const eventRankSummary = computed(() => {
  return eventRankOverview.value.rankSummary
})

const eventPocketSummary = computed(() => {
  return eventRankOverview.value.pocketSummary
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

const openLevelDialog = () => {
  resetLevelForm()
  levelDialog.value = true
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
    await handLogStore.addBlindLevel(eventId.value, {
      levelNo: toNumber(levelForm.levelNo),
      smallBlind: toNumber(levelForm.smallBlind),
      bigBlind: toNumber(levelForm.bigBlind),
      ante: toNumber(levelForm.ante),
    })

    levelDialog.value = false
    resetLevelForm()
  } catch (error) {
    console.error(error)

    alert.show('레벨을 추가하지 못했습니다.', 'error')
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

const formatDateTime = (value) => {
  if (!value) {
    return '날짜 미입력'
  }

  return new Date(value).toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const getLevelHandCount = (level) => {
  return level.handCount ?? level.hands?.length ?? 0
}

const getLevelReviewCount = (level) => {
  return level.reviewRequiredCount ?? level.hands?.filter((hand) => isReviewHand(hand)).length ?? 0
}

const getRankToneClass = (bucket) => {
  if (bucket.key === 'TOP') {
    return 'rank-tone--top'
  }

  if (bucket.key === 'MIDDLE') {
    return 'rank-tone--middle'
  }

  return 'rank-tone--low'
}

const getRankSegmentStyle = (bucket) => {
  return {
    width: `${bucket.percent}%`,
    minWidth: bucket.count > 0 ? '8px' : '0',
  }
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
.empty-level-card,
.level-card,
.level-dialog-card {
  border-radius: 16px;
  background: #ffffff;
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

.level-card {
  transition:
    transform 0.12s ease,
    box-shadow 0.12s ease;
}

.level-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.05);
}

.rank-section {
  border-top: 1px solid #ececef;
  padding-top: 18px;
}

.rank-overview-card {
  border: 1px solid #ececef;
  border-radius: 16px;
  padding: 14px;
  background: #fcfcfd;
}

.rank-meter {
  display: flex;
  width: 100%;
  height: 18px;
  overflow: hidden;
  border-radius: 999px;
  background: #eeeef2;
}

.rank-meter-segment {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  overflow: hidden;
  font-size: 10px;
  font-weight: 800;
  color: #ffffff;
  white-space: nowrap;
  transition: width 0.15s ease;
}

.rank-meter-segment.rank-tone--top {
  background: #673ab7;
}

.rank-meter-segment.rank-tone--middle {
  background: #00897b;
}

.rank-meter-segment.rank-tone--low {
  background: #fb8c00;
}

.rank-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.rank-list-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 9px 0;
  border-bottom: 1px solid #f1f1f4;
}

.rank-list-row:last-child {
  border-bottom: none;
}

.rank-list-left {
  display: flex;
  align-items: center;
  gap: 9px;
  min-width: 0;
}

.rank-dot {
  width: 9px;
  height: 9px;
  flex: 0 0 auto;
  border-radius: 999px;
}

.rank-dot.rank-tone--top {
  background: #673ab7;
}

.rank-dot.rank-tone--middle {
  background: #00897b;
}

.rank-dot.rank-tone--low {
  background: #fb8c00;
}

.rank-list-label {
  font-size: 13px;
  font-weight: 800;
  color: #333;
}

.rank-list-sub {
  margin-top: 2px;
  font-size: 11px;
  color: #777;
}

.rank-list-right {
  display: flex;
  align-items: baseline;
  gap: 7px;
  flex: 0 0 auto;
}

.rank-list-right strong {
  font-size: 14px;
  font-weight: 900;
  color: #111;
}

.rank-list-right span {
  font-size: 12px;
  font-weight: 700;
  color: #777;
}

.pocket-chip-row {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.pocket-chip {
  display: grid;
  grid-template-columns: 1fr auto 42px;
  align-items: center;
  gap: 10px;
  min-height: 38px;
  padding: 8px 12px;
  border: 1px solid #ececef;
  border-radius: 12px;
  background: #fafafa;
}

.pocket-chip span {
  min-width: 0;
  font-size: 12px;
  font-weight: 800;
  color: #555;
}

.pocket-chip strong {
  font-size: 13px;
  font-weight: 900;
  color: #111;
  text-align: right;
  white-space: nowrap;
}

.pocket-chip em {
  font-size: 11px;
  font-style: normal;
  font-weight: 700;
  color: #777;
  text-align: right;
  white-space: nowrap;
}

.pocket-chip--high {
  border-color: #d8ccff;
  background: #fbf9ff;
}

.level-add-btn,
.copy-btn {
  min-width: 132px;
}

.level-dialog-card {
  width: 100%;
  max-width: 460px;
}

.level-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

@media (max-width: 599px) {
  .level-add-btn,
  .copy-btn {
    width: 100%;
  }

  .rank-overview-card {
    padding: 12px;
  }

  .rank-list-row {
    align-items: flex-start;
  }

  .rank-list-right {
    flex-direction: column;
    align-items: flex-end;
    gap: 1px;
  }
}
</style>
