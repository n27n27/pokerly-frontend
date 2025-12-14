<template>
  <q-page class="q-pa-md">
    <div class="column q-gutter-y-md" style="max-width: 720px; margin: 0 auto">
      <!-- ================== 헤더 ================== -->
      <div>
        <div class="text-h5 text-weight-bold q-mb-xs">SPR 계산기</div>
        <div class="text-body2 text-grey-7">
          히어로/상대 스택과 팟 크기를 이용해 Stack-to-Pot Ratio(SPR)를 계산하고, SPR 구간에 따른
          기본 전략 방향을 확인하는 계산기입니다.
        </div>
      </div>

      <!-- ================== 계산 기준 선택 ================== -->
      <q-card flat bordered class="q-pa-md">
        <div class="column q-gutter-sm">
          <div class="text-subtitle2 text-weight-bold">계산 기준</div>

          <q-toggle
            v-model="useEffectiveStack"
            left-label
            label="유효 스택 기준 (권장) : 둘 중 더 짧은 스택으로 계산"
          />

          <div class="text-body2 text-grey-7">
            올인은 ‘둘 중 더 짧은 스택’까지만 가능합니다. 그래서 보통 이걸로 계산합니다. 상대 스택을
            모르면 토글을 끄고 “내 스택 기준(간이)”로 보세요.
          </div>
        </div>
      </q-card>

      <!-- ================== 입력 영역 ================== -->
      <q-card flat bordered class="q-pa-md">
        <div class="column q-gutter-md">
          <q-input
            v-model.number="heroStack"
            type="number"
            label="히어로 스택"
            suffix="칩"
            outlined
          />

          <q-input
            v-if="useEffectiveStack"
            v-model.number="villainStack"
            type="number"
            label="상대 스택"
            suffix="칩"
            outlined
          />

          <q-input
            v-model.number="potSize"
            type="number"
            label="현재 팟 크기"
            suffix="칩"
            outlined
          />
        </div>
      </q-card>

      <!-- ================== 결과 ================== -->
      <q-card v-if="spr !== null" flat bordered class="q-pa-md">
        <div class="column q-gutter-sm">
          <div class="text-subtitle1 text-weight-bold">결과</div>

          <div class="text-body2 text-grey-7">
            기준 스택(최대로 들어갈 수 있는 스택): {{ baseStack.toLocaleString() }} 칩
          </div>

          <div class="text-h6">SPR {{ spr.toFixed(2) }}</div>

          <q-separator class="q-my-sm" />

          <div class="text-subtitle2 text-weight-bold">한 줄 결론</div>
          <div class="text-body1 text-weight-bold">
            {{ sprInfo.oneLine }}
          </div>

          <q-badge :color="sprInfo.color" outline class="spr-badge">
            {{ sprInfo.label }}
          </q-badge>

          <div class="text-body2 text-grey-7 q-mt-sm">
            {{ sprInfo.reason }}
          </div>

          <q-separator class="q-my-sm" />

          <div class="text-subtitle2 text-weight-bold">바로 써먹는 가이드</div>

          <q-list dense class="q-pa-none">
            <q-item dense class="q-pa-none">
              <q-item-section avatar class="guide-avatar">
                <q-icon name="check_circle" color="positive" />
              </q-item-section>
              <q-item-section>
                <div class="text-body2">
                  <span class="text-weight-bold">자주 OK:</span>
                  {{ sprInfo.ok }}
                </div>
              </q-item-section>
            </q-item>

            <q-item dense class="q-pa-none q-mt-xs">
              <q-item-section avatar class="guide-avatar">
                <q-icon name="warning" color="warning" />
              </q-item-section>
              <q-item-section>
                <div class="text-body2">
                  <span class="text-weight-bold">주의:</span>
                  {{ sprInfo.caution }}
                </div>
              </q-item-section>
            </q-item>

            <q-item dense class="q-pa-none q-mt-xs">
              <q-item-section avatar class="guide-avatar">
                <q-icon name="cancel" color="negative" />
              </q-item-section>
              <q-item-section>
                <div class="text-body2">
                  <span class="text-weight-bold">보통 비추:</span>
                  {{ sprInfo.avoid }}
                </div>
              </q-item-section>
            </q-item>
          </q-list>
        </div>
      </q-card>

      <q-card v-else flat bordered class="q-pa-md">
        <div class="text-body2 text-grey-7">스택과 팟을 입력하면 바로 계산됩니다.</div>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { logToolUsage } from 'src/api/tools'

const TOOL_CODE = 'SPR'

const heroStack = ref(null)
const villainStack = ref(null)
const potSize = ref(null)
const useEffectiveStack = ref(true)

onMounted(() => {
  logToolUsage(TOOL_CODE, 'OPEN').catch(() => {})
})

const baseStack = computed(() => {
  if (!heroStack.value || heroStack.value <= 0) return null

  if (useEffectiveStack.value) {
    if (!villainStack.value || villainStack.value <= 0) return null
    return Math.min(heroStack.value, villainStack.value)
  }

  return heroStack.value
})

const spr = computed(() => {
  if (!baseStack.value || !potSize.value || potSize.value <= 0) return null
  return baseStack.value / potSize.value
})

const sprInfo = computed(() => {
  if (spr.value === null) return {}

  // 0~3: 커밋이 쉬운 구조
  if (spr.value <= 3) {
    return {
      label: '낮은 SPR',
      color: 'negative',
      oneLine: '플랍에서 커밋 여부가 빨리 정해지는 구조입니다.',
      reason:
        '팟 대비 남은 스택이 얕아 베팅 1~2번이면 올인 구간에 들어갑니다. 라인을 단순하게 가져가는 편이 유리합니다.',
      ok: '탑페어 좋은 키커 / 오버페어 / 강한 드로우면 밸류·보호 위주로 밀도 있게.',
      caution:
        '약한 원페어는 큰 팟에서 밸류를 받기 어렵기 때문에 사이즈를 키우는 플레이는 주의가 필요합니다.',
      avoid:
        '좋은 패인데 체크만 하다 베팅할 타이밍을 놓치거나, 애매한 패로 억지로 올인 상황을 만드는 플레이.',
    }
  }

  // 3~6: 2스트릿 밸류가 흔한 구간
  if (spr.value <= 6) {
    return {
      label: '중간 SPR',
      color: 'warning',
      oneLine: '2스트릿 밸류가 자주 나오고, 리버는 상황 판단이 필요합니다.',
      reason:
        '플랍과 턴에서 베팅이 자연스럽지만, 리버에서 선택이 남는 깊이입니다. 상대 성향과 보드 변화에 따라 컨트롤도 고려됩니다.',
      ok: '좋은 탑페어/오버페어는 보통 플랍·턴 밸류 라인이 무난.',
      caution: '상대가 콜을 잘하면 밸류 중심, 타이트하면 블러프 빈도·사이즈 조절.',
      avoid: '약한 원페어로 플랍·턴·리버까지 계속 베팅하는 플레이, 의미 없는 오버베팅.',
    }
  }

  // 6~10: 딥에 가까워지는 구간
  if (spr.value <= 10) {
    return {
      label: '높은 SPR',
      color: 'positive',
      oneLine: '스택이 깊어질수록 원페어는 한계가 있고, 강한 핸드일수록 팟을 키우기 좋습니다.',
      reason:
        '턴·리버까지 진행될 가능성이 높아집니다. 원페어로 큰 팟을 만들기보다는 강한 밸류/드로우로 팟을 키우는 편이 안정적입니다.',
      ok: '셋/투페어/강한 드로우는 적극적으로 팟 빌드 가능(특히 포지션 있을 때).',
      caution: '탑페어는 보드·상대에 따라 체크백/작은 사이즈로 팟 컨트롤 고려.',
      avoid: '원페어로 큰 사이즈 3스트릿, 근거 없는 “희망 콜/희망 블러프”.',
    }
  }

  // 10+
  return {
    label: '매우 높은 SPR (딥)',
    color: 'primary',
    oneLine: '딥 스택에서는 포지션/핸드 강도 차이가 결과를 크게 만듭니다.',
    reason:
      '스택이 깊어 한 번의 큰 실수가 손실로 바로 연결됩니다. 강한 밸류·드로우 중심으로 팟을 키우고, 약한 원페어는 과투자를 피하는 편이 좋습니다.',
    ok: '강한 밸류/드로우로만 큰 팟. 나머지는 작게, 혹은 컨트롤.',
    caution: '리버까지의 라인(어디서 멈출지)과 베팅 사이즈를 미리 생각.',
    avoid: '약한 원페어로 큰 팟을 고집하거나, 근거 없이 크게 블러프하는 플레이.',
  }
})

/**
 * ================== 통계 (CALCULATE)
 * - 자동 계산형 페이지라 버튼 클릭이 없음
 * - 입력이 "완성"된 뒤 600ms 멈췄을 때 1회 로깅
 * - 동일 입력 상태는 중복 로깅 방지
 */
let calcTimer = null
let lastCalcKey = ''

function isCalcReady() {
  if (!heroStack.value || heroStack.value <= 0) return false
  if (!potSize.value || potSize.value <= 0) return false
  if (useEffectiveStack.value) {
    if (!villainStack.value || villainStack.value <= 0) return false
  }
  return true
}

function makeCalcKey() {
  return [
    useEffectiveStack.value ? 'E' : 'H',
    Number(heroStack.value || 0),
    Number(villainStack.value || 0),
    Number(potSize.value || 0),
  ].join('|')
}

function logCalculateDebounced() {
  // 입력이 유효하지 않으면 타이머도 제거
  if (!isCalcReady()) {
    if (calcTimer) {
      clearTimeout(calcTimer)
      calcTimer = null
    }
    return
  }

  if (calcTimer) clearTimeout(calcTimer)

  calcTimer = setTimeout(() => {
    if (!isCalcReady()) return

    const key = makeCalcKey()
    if (key === lastCalcKey) return

    lastCalcKey = key
    logToolUsage(TOOL_CODE, 'CALCULATE').catch(() => {})
  }, 600)
}

watch([heroStack, villainStack, potSize, useEffectiveStack], () => {
  logCalculateDebounced()
})
</script>

<style scoped>
.spr-badge {
  align-self: flex-start;
  display: inline-flex;
  max-width: 100%;
}

.guide-avatar {
  min-width: 28px;
  width: 28px;
  justify-content: center;
}
.q-item {
  padding: 0 !important;
}
</style>
