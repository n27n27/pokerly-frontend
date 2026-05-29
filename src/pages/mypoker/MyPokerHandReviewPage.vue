<template>
  <q-page class="q-pa-md">
    <!-- ================= 상단 헤더 ================= -->
    <div class="row items-center justify-between q-mb-md">
      <div class="column">
        <div class="text-h6 text-weight-bold">핸드 복기</div>
        <div class="text-caption text-grey-7">
          인상 깊었던 핸드를 기록하고, Simple 분석으로 기본적인 코칭을 받아보세요.<br />
          추후 with AI / with Solver 탭이 추가될 예정입니다.
        </div>
      </div>

      <q-btn color="primary" unelevated icon="add" label="핸드 추가" @click="openAddDialog" />
    </div>

    <!-- ================ 본문: 좌측 리스트 + 우측 상세 ================= -->
    <div class="row q-col-gutter-md">
      <!-- 좌측: 핸드 리스트 -->
      <div class="col-12 col-md-4 col-lg-3">
        <q-card bordered flat>
          <q-card-section class="row items-center justify-between q-pb-sm">
            <div class="text-subtitle2 text-weight-medium">핸드 목록</div>
          </q-card-section>

          <q-separator />

          <q-card-section class="q-pa-none">
            <q-list separator>
              <template v-if="hands.length">
                <q-item
                  v-for="hand in hands"
                  :key="hand.id"
                  clickable
                  v-ripple
                  :active="hand.id === selectedHandId"
                  active-class="active-hand"
                  @click="selectHand(hand.id)"
                >
                  <q-item-section>
                    <div class="row items-center justify-between">
                      <div class="text-body2 ellipsis">{{ hand.title }}</div>
                      <div class="text-caption">{{ hand.position }}</div>
                    </div>

                    <div class="text-caption text-grey-7 q-mt-xs">
                      {{ hand.heroHand || '-' }} · {{ hand.stackBb }}bb
                    </div>

                    <div class="text-caption text-grey-6">
                      {{ hand.sessionLabel || '세션 미지정' }}
                    </div>
                  </q-item-section>
                </q-item>
              </template>

              <template v-else>
                <div class="q-pa-md text-caption text-grey-7">
                  아직 저장된 핸드가 없습니다.
                  <span class="text-primary text-weight-medium">[핸드 추가]</span>를 눌러
                  추가하세요.
                </div>
              </template>
            </q-list>
          </q-card-section>
        </q-card>
      </div>

      <!-- 우측: 상세 + 탭 -->
      <div class="col-12 col-md-8 col-lg-9">
        <q-card v-if="selectedHand" bordered flat class="full-height">
          <!-- 핸드 메타 정보 -->
          <q-card-section>
            <div class="row items-center justify-between q-mb-xs">
              <div class="column">
                <div class="text-subtitle1 text-weight-bold">{{ selectedHand.title }}</div>
                <div class="text-caption text-grey-7 q-mt-xs">
                  {{ selectedHand.heroHand || '-' }} · {{ selectedHand.blinds || '-' }} ·
                  {{ selectedHand.stackBb }}bb ·
                  {{ selectedHand.position }}
                </div>
              </div>

              <q-chip square size="sm" color="primary" text-color="white" class="text-uppercase">
                BASIC
              </q-chip>
            </div>

            <div class="text-caption text-grey-8">
              세션: {{ selectedHand.sessionLabel || '세션 미지정' }}
            </div>
          </q-card-section>

          <q-separator />

          <!-- ==================== 탭 헤더 ==================== -->
          <q-card-section class="q-pb-none">
            <q-tabs v-model="activeTab" shrink align="left" dense no-caps>
              <!-- Simple 탭 -->
              <q-tab name="simple">
                <div class="row items-center no-wrap">
                  Simple
                  <q-icon name="info" size="16px" class="q-ml-xs text-grey-7">
                    <q-tooltip>
                      Simple 분석은 빠르고 가벼운 기본 가이드입니다.<br />
                      Hero 핸드 / 포지션 / 스택 정보를 기반으로 프리플랍을 보고,<br />
                      옵션으로 플랍/턴 상황 태그를 추가해 좀 더 깊은 코멘트를 제공합니다.<br />
                      <b>※ 핸드 메모/질문은 Simple 분석에 직접 반영되지는 않습니다.</b>
                    </q-tooltip>
                  </q-icon>
                </div>
              </q-tab>

              <!-- with AI 탭 (추후 확장용, 현재 비활성/잠금) -->
              <q-tab name="ai" :disable="true">
                <div class="row items-center no-wrap">
                  with AI
                  <q-badge color="grey-6" text-color="white" floating transparent label="추후" />
                </div>
              </q-tab>

              <!-- with Solver 탭 (추후 확장용, 현재 비활성/잠금) -->
              <q-tab name="solver" :disable="true">
                <div class="row items-center no-wrap">
                  with Solver
                  <q-badge color="grey-6" text-color="white" floating transparent label="추후" />
                </div>
              </q-tab>
            </q-tabs>
          </q-card-section>

          <q-separator />

          <!-- ==================== 탭 내용 ==================== -->
          <q-card-section style="min-height: 260px">
            <q-tab-panels v-model="activeTab" animated>
              <!-- ---------------- Simple 탭 ---------------- -->
              <q-tab-panel name="simple" class="q-pa-none">
                <!-- 설명 -->
                <div class="q-mb-md">
                  <div class="text-subtitle2 text-weight-medium q-mb-xs">Simple 분석</div>
                  <div class="text-caption text-grey-7">
                    기본적으로는 <b>프리플랍 중심</b> 가이드를 제공하며,<br />
                    아래에서 플랍/턴 상황을 선택하면 해당 스팟에 대한
                    <b>추가 코멘트</b>를 제공합니다.<br />
                    핸드 메모/질문은 <b>기록용 및 추후 AI 모드에서 사용</b>되며,<br />
                    <b>지금 Simple 계산에는 직접 반영되지 않습니다.</b>
                  </div>
                </div>

                <!-- 핸드 설명 / 질문 -->
                <q-card flat bordered class="q-mb-md">
                  <q-card-section>
                    <div class="text-body2 text-weight-medium q-mb-xs">핸드 메모</div>
                    <div class="text-caption text-grey-8" style="white-space: pre-wrap">
                      {{ selectedHand.description || '핸드 메모가 없습니다.' }}
                    </div>

                    <q-separator class="q-my-md" />

                    <div class="text-body2 text-weight-medium q-mb-xs">나의 질문</div>
                    <div class="text-caption text-grey-8">
                      {{ selectedHand.question || '질문이 없습니다.' }}
                    </div>

                    <div class="text-caption text-grey-6 q-mt-sm">
                      ※ 위 메모/질문은 현재 Simple 분석에는 사용되지 않으며, 추후 AI 코치 기능에서
                      활용될 예정입니다.
                    </div>
                  </q-card-section>
                </q-card>

                <!-- ===== 핵심 스팟 설정 (프리/플랍/턴 태그) ===== -->
                <q-card flat bordered class="q-mb-md">
                  <q-card-section>
                    <div class="text-body2 text-weight-medium q-mb-xs">핵심 스팟 설정 (선택)</div>
                    <div class="text-caption text-grey-7 q-mb-sm">
                      이 핸드에서 제일 고민됐던 구간을 선택하고, 플랍/턴 상황을 간단히 태그로
                      남겨두면<br />
                      해당 스팟에 대한 추가 코멘트를 제공합니다. 설정하지 않으면 프리플랍 중심으로만
                      분석합니다.
                    </div>

                    <div class="row q-col-gutter-sm q-mb-sm">
                      <div class="col-6">
                        <q-select
                          v-model="simpleForm.mainStreet"
                          :options="mainStreetOptions"
                          option-label="label"
                          option-value="value"
                          emit-value
                          map-options
                          filled
                          dense
                          label="핵심 스팟 스트리트"
                        />
                      </div>
                      <div class="col-6">
                        <q-select
                          v-model="simpleForm.potType"
                          :options="potTypeOptions"
                          option-label="label"
                          option-value="value"
                          emit-value
                          map-options
                          filled
                          dense
                          label="팟 타입"
                        />
                      </div>
                    </div>

                    <!-- 플랍/턴일 때만 추가 태그 노출 -->
                    <div v-if="simpleForm.mainStreet !== 'PREFLOP'" class="column q-gutter-sm">
                      <q-select
                        v-model="simpleForm.boardTexture"
                        :options="boardTextureOptions"
                        option-label="label"
                        option-value="value"
                        emit-value
                        map-options
                        filled
                        dense
                        label="보드 타입"
                        hint="대략적인 보드 성향만 선택해 주세요."
                        persistent-hint
                      />

                      <q-select
                        v-model="simpleForm.heroHandStrength"
                        :options="heroHandStrengthOptions"
                        option-label="label"
                        option-value="value"
                        emit-value
                        map-options
                        filled
                        dense
                        label="내 핸드 타입"
                      />

                      <q-select
                        v-model="simpleForm.heroLine"
                        :options="heroLineOptions"
                        option-label="label"
                        option-value="value"
                        emit-value
                        map-options
                        filled
                        dense
                        label="내 액션 요약"
                      />
                    </div>

                    <div v-else class="text-caption text-grey-6 q-mt-sm">
                      ※ 프리플랍만 보고 싶으면 위 옵션을 그대로 두고 분석해도 됩니다.
                    </div>
                  </q-card-section>
                </q-card>

                <!-- Simple 분석 버튼 + 결과 -->
                <div class="row items-center justify-between q-mb-sm">
                  <div class="text-caption text-grey-7">
                    포지션: <b>{{ selectedHand.position }}</b
                    >, 스택: <b>{{ selectedHand.stackBb }}bb</b>, 핸드:
                    <b>{{ selectedHand.heroHand || '-' }}</b>
                  </div>

                  <q-btn
                    color="primary"
                    unelevated
                    label="Simple 분석하기"
                    :loading="simpleLoading"
                    @click="runSimpleAnalysis"
                  />
                </div>

                <q-card v-if="simpleResult" flat bordered>
                  <q-card-section>
                    <!-- 프리플랍 -->
                    <div class="q-mb-sm">
                      <div class="text-caption text-grey-7 text-weight-medium">프리플랍 추천</div>
                      <div class="text-caption text-grey-8">
                        {{ simpleResult.preflopRecommendation || 'UNKNOWN' }}
                        <span v-if="simpleResult.preflopDetail">
                          - {{ simpleResult.preflopDetail }}
                        </span>
                      </div>
                    </div>

                    <q-separator class="q-my-sm" />

                    <!-- 포스트플랍 / 스팟 코멘트 -->
                    <div v-if="simpleResult.postflopComment" class="q-mb-sm">
                      <div class="text-caption text-grey-7 text-weight-medium">
                        스팟 코멘트 (플랍/턴)
                      </div>
                      <div class="text-caption text-grey-8">
                        {{ simpleResult.postflopComment }}
                      </div>
                    </div>

                    <q-separator class="q-my-sm" v-if="simpleResult.postflopComment" />

                    <!-- 전체 코멘트 -->
                    <div v-if="simpleResult.overallSimpleComment">
                      <div class="text-caption text-grey-7 text-weight-medium q-mb-xs">
                        전체 코멘트
                      </div>
                      <div class="text-caption text-grey-8">
                        {{ simpleResult.overallSimpleComment }}
                      </div>
                    </div>
                  </q-card-section>
                </q-card>

                <div v-else class="text-caption text-grey-6 q-mt-sm">
                  아직 Simple 분석 결과가 없습니다. 위 옵션을 설정하고 "Simple 분석하기" 버튼을
                  눌러보세요.
                </div>
              </q-tab-panel>

              <!-- ---------------- with AI 탭 (추후) ---------------- -->
              <q-tab-panel name="ai" class="q-pa-none">
                <q-banner dense rounded class="bg-grey-2">
                  <div class="text-body2">with AI 분석은 추후 버전에서 제공될 예정입니다.</div>
                </q-banner>
              </q-tab-panel>

              <!-- ---------------- Solver 탭 (추후) ---------------- -->
              <q-tab-panel name="solver" class="q-pa-none">
                <q-banner dense rounded class="bg-grey-2">
                  <div class="text-body2">Solver 기반 분석은 추후 버전에서 제공될 예정입니다.</div>
                </q-banner>
              </q-tab-panel>
            </q-tab-panels>
          </q-card-section>
        </q-card>

        <div v-else class="text-caption text-grey-7 q-mt-md">
          왼쪽에서 핸드를 선택하거나, 새로운 핸드를 추가해 주세요.
        </div>
      </div>
    </div>

    <!-- =============== 핸드 추가 다이얼로그 =============== -->
    <q-dialog v-model="addDialog">
      <q-card style="min-width: 360px; max-width: 600px">
        <q-card-section>
          <div class="text-subtitle1 text-weight-bold q-mb-xs">핸드 추가</div>
          <div class="text-caption text-grey-7">
            Simple 분석에 필요한 최소 정보만 필수입니다. 현재 모드에서는 메모/질문은 기록용입니다.
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section class="q-gutter-md">
          <!-- 1) 핸드 한 줄 요약 -->
          <q-input
            v-model="form.title"
            label="핸드 한 줄 요약 *"
            filled
            dense
            :rules="[(v) => !!v || '반드시 입력하세요']"
            placeholder="예: A5s UTG+1 vs SB 올인"
          />

          <!-- 2) Hero 핸드 -->
          <q-input
            v-model="form.heroHand"
            label="Hero 핸드 *"
            filled
            dense
            placeholder="예: A5s, JJ, KTs"
          />

          <!-- 3) 세션 선택 -->
          <q-select
            v-model="form.sessionId"
            :options="sessionOptions"
            option-label="label"
            option-value="id"
            emit-value
            map-options
            filled
            dense
            label="세션 (선택)"
            clearable
            hint="선택 시 해당 세션과 핸드 복기가 연결됩니다. (통계에 활용 예정)"
            persistent-hint
          />

          <!-- 4) 포지션 + 스택(BB) -->
          <div class="row justify-between">
            <div class="col-6">
              <q-select
                v-model="form.position"
                :options="positionOptions"
                filled
                dense
                label="포지션"
                placeholder="예: UTG+1, CO, BTN"
              />
            </div>
            <div class="col-5">
              <q-input
                v-model.number="form.stackBb"
                type="number"
                filled
                dense
                label="스택 (BB 기준)"
                suffix="bb"
              />
            </div>
          </div>

          <!-- 5) 블라인드 -->
          <q-input
            v-model="form.blinds"
            label="블라인드"
            filled
            dense
            placeholder="예: 1000/2000"
          />

          <!-- 6) 핸드 메모 (옵션) -->
          <q-input
            v-model="form.description"
            type="textarea"
            autogrow
            filled
            label="핸드 메모 (선택)"
            placeholder="예: 프리플랍 오픈 → SB 콜, 플랍 A84 체크/체크, 턴 3 SB 2/3팟 배팅…"
          />

          <!-- 7) 메모 / 질문 (옵션) -->
          <q-input
            v-model="form.question"
            type="textarea"
            autogrow
            filled
            label="메모 / 질문 (선택)"
            placeholder="예: 턴에서 콜이 너무 루즈한지? 리버 콜이 맞는지?"
          />
        </q-card-section>

        <q-separator />

        <q-card-actions align="right">
          <q-btn flat label="취소" color="grey-7" v-close-popup />
          <q-btn unelevated label="저장" color="primary" @click="saveHand" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAlert } from 'src/composables/useAlert'
import { useHandReviewStore } from 'src/stores/handReview'

const alert = useAlert()
const handReviewStore = useHandReviewStore()

/* ==================== 스토어 바인딩 ==================== */
const hands = computed(() => handReviewStore.hands)
const sessionOptions = computed(() => handReviewStore.sessionOptions)

/* ==================== 선택된 핸드 ==================== */
const selectedHandId = ref(null)
const selectedHand = computed(() => hands.value.find((h) => h.id === selectedHandId.value) || null)

/* ==================== 탭 상태 ==================== */
const activeTab = ref('simple')

/* ==================== Simple 폼 기본값 ==================== */
const simpleFormDefault = () => ({
  mainStreet: 'PREFLOP', // PREFLOP / FLOP / TURN
  potType: 'HU', // HU / MW
  boardTexture: 'DRY', // DRY / SEMI_WET / WET / PAIRED / MONOTONE
  heroHandStrength: 'STRONG_MADE', // STRONG_MADE / MEDIUM_MADE / WEAK_MADE / DRAW / AIR
  heroLine: 'CBET', // CBET / XC / XF / XR / BET_CALL / BET_FOLD ...
})
const simpleForm = ref(simpleFormDefault())

const mainStreetOptions = [
  { label: '프리플랍', value: 'PREFLOP' },
  { label: '플랍', value: 'FLOP' },
  { label: '턴', value: 'TURN' },
]

const potTypeOptions = [
  { label: '헤즈업', value: 'HU' },
  { label: '멀티웨이', value: 'MW' },
]

const boardTextureOptions = [
  { label: '드라이 (T72r 등)', value: 'DRY' },
  { label: '세미 웻 (T98r 등)', value: 'SEMI_WET' },
  { label: '웻 (T98dd 등)', value: 'WET' },
  { label: '페어보드 (AAT 등)', value: 'PAIRED' },
  { label: '모노톤 (같은 무늬 3장)', value: 'MONOTONE' },
]

const heroHandStrengthOptions = [
  { label: '강한 메이드 (탑투페어+/오버페어)', value: 'STRONG_MADE' },
  { label: '중간 메이드 (탑페어/세컨페어)', value: 'MEDIUM_MADE' },
  { label: '약한 메이드 (언더페어/낮은 페어)', value: 'WEAK_MADE' },
  { label: '드로우 (FD, OESD 등)', value: 'DRAW' },
  { label: '에어 (히트 X)', value: 'AIR' },
]

const heroLineOptions = [
  { label: '내가 c-bet 했다', value: 'CBET' },
  { label: '체크 후 콜 (x/c)', value: 'XC' },
  { label: '체크 후 폴드 (x/f)', value: 'XF' },
  { label: '체크 후 레이즈 (x/r)', value: 'XR' },
  { label: '베팅 후 상대 콜', value: 'BET_CALL' },
  { label: '베팅 후 상대 폴드', value: 'BET_FOLD' },
]

/* ==================== Simple 결과 ==================== */
const simpleResult = ref(null)
const simpleLoading = ref(false)

/* ==================== 유틸: 핸드에 저장된 태그 → 폼 복원 ==================== */
const restoreSimpleFormFromHand = (hand) => {
  simpleForm.value = {
    mainStreet: hand.simpleMainStreet || 'PREFLOP',
    potType: hand.simplePotType || 'HU',
    boardTexture: hand.simpleBoardTexture || 'DRY',
    heroHandStrength: hand.simpleHeroStrength || 'STRONG_MADE',
    heroLine: hand.simpleHeroLine || 'CBET',
  }
}

/* ==================== 초기 로딩 ==================== */
onMounted(async () => {
  try {
    await handReviewStore.loadInitial()

    if (hands.value.length > 0) {
      selectedHandId.value = hands.value[0].id
      simpleResult.value = hands.value[0].simpleAnalysis || null
      restoreSimpleFormFromHand(hands.value[0])
    }
  } catch (e) {
    console.error(e)
    alert.show('초기 데이터를 불러오는 중 오류가 발생했습니다.', 'error')
  }
})

/* ==================== 선택 변경 ==================== */
const selectHand = (id) => {
  selectedHandId.value = id
  activeTab.value = 'simple'

  const hand = hands.value.find((h) => h.id === id)
  if (!hand) return

  simpleResult.value = hand.simpleAnalysis || null
  restoreSimpleFormFromHand(hand)
}

/* ==================== Simple 분석 ==================== */
const resetSimpleAnalysis = () => {
  simpleResult.value = null
  simpleForm.value = simpleFormDefault()
}

const runSimpleAnalysis = async () => {
  const hand = selectedHand.value
  if (!hand) return

  if (!hand.heroHand || !hand.position) {
    alert.show('Hero 핸드와 포지션이 있어야 Simple 분석이 가능합니다.', 'warning')
    return
  }

  simpleLoading.value = true
  try {
    const saved = await handReviewStore.analyzeAndSaveSimple(hand, simpleForm.value)

    simpleResult.value = saved.simpleAnalysis || null
    selectedHandId.value = saved.id
    restoreSimpleFormFromHand(saved)
  } catch (e) {
    console.error(e)
    alert.show('Simple 분석 중 오류가 발생했습니다.', 'error')
  } finally {
    simpleLoading.value = false
  }
}

/* ==================== 핸드 추가 다이얼로그 ==================== */
const addDialog = ref(false)
const positionOptions = ['UTG', 'UTG+1', 'LJ', 'HJ', 'CO', 'BTN', 'SB', 'BB']

const form = ref({
  title: '',
  heroHand: '',
  sessionId: null,
  blinds: '',
  stackBb: null,
  position: '',
  description: '',
  question: '',
})

const openAddDialog = () => {
  form.value = {
    title: '',
    heroHand: '',
    sessionId: null,
    blinds: '',
    stackBb: null,
    position: '',
    description: '',
    question: '',
  }
  addDialog.value = true
}

// 로컬 신규 핸드용 임시 id (음수로 내려감)
let tempIdSeq = -1

const saveHand = () => {
  if (!form.value.title) {
    alert.show('핸드 한 줄 요약은 필수입니다.', 'warning')
    return
  }
  if (!form.value.heroHand) {
    alert.show('Hero 핸드는 필수입니다.', 'warning')
    return
  }

  const newId = tempIdSeq--
  const sessionLabel =
    sessionOptions.value.find((s) => s.id === form.value.sessionId)?.label || null

  const newHand = {
    id: newId, // 임시 id (나중에 Simple 분석 시 서버 id로 대체)
    title: form.value.title,
    heroHand: form.value.heroHand,
    blinds: form.value.blinds || '-',
    stackBb: form.value.stackBb || 0,
    position: form.value.position || '-',
    sessionId: form.value.sessionId || null,
    sessionLabel,
    description: form.value.description,
    question: form.value.question,

    simpleMainStreet: null,
    simplePotType: null,
    simpleBoardTexture: null,
    simpleHeroStrength: null,
    simpleHeroLine: null,
    simpleAnalysis: null,
  }

  handReviewStore.addLocalHand(newHand)
  hands.value // 반응성 유지용 noop 접근

  selectedHandId.value = newId
  activeTab.value = 'simple'
  resetSimpleAnalysis()
  addDialog.value = false
}
</script>

<style scoped>
.full-height {
  min-height: 360px;
}
.ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 선택된 핸드 하이라이트 가독성 개선 */
.active-hand {
  background-color: #027be3; /* Quasar 기본 primary 색 계열 */
  color: #ffffff !important;
}

.active-hand .text-grey-7,
.active-hand .text-grey-6 {
  color: #ffffff !important;
}
</style>
