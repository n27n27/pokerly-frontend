<template>
  <div class="starting-hand-summary">
    <div class="section-title">핸드 요약</div>

    <div class="text-caption text-grey-7 q-mt-xs">
      169개 스타팅 핸드 순위 기준, 주요 그룹은 실전 분류 기준입니다.
    </div>

    <div class="run-card q-mt-md">
      <div class="summary-subtitle"></div>

      <div class="run-meter q-mt-sm">
        <div
          v-for="bucket in runSummary.buckets"
          :key="bucket.key"
          class="run-meter-segment"
          :class="`run-tone--${bucket.tone}`"
          :style="{ width: `${bucket.percent}%`, minWidth: bucket.count > 0 ? '8px' : '0' }"
        >
          <span v-if="bucket.percent >= 12">{{ bucket.percent }}%</span>
        </div>
      </div>

      <div class="run-list q-mt-md">
        <div v-for="bucket in runSummary.buckets" :key="bucket.key" class="run-row">
          <div class="run-left">
            <span class="run-dot" :class="`run-tone--${bucket.tone}`" />

            <div>
              <div class="run-label">{{ bucket.label }}</div>
              <div class="run-description">{{ bucket.description }}</div>
            </div>
          </div>

          <div class="run-count">
            <strong>{{ bucket.count }}개</strong>
            <span>{{ bucket.percent }}%</span>
          </div>
        </div>
      </div>
    </div>

    <div class="group-card q-mt-md">
      <div class="summary-subtitle group-title">주요 그룹</div>

      <div class="group-list">
        <div v-for="group in groupSummary.groups" :key="group.key" class="group-row">
          <div class="group-header">
            <div>
              <div class="group-label" :class="{ 'group-label--empty': group.count === 0 }">
                {{ group.label }}
              </div>

              <div class="group-description">
                {{ group.description }}
              </div>
            </div>

            <strong class="group-count" :class="{ 'group-count--empty': group.count === 0 }">
              {{ group.count }}개
            </strong>
          </div>

          <div v-if="group.items.length > 0" class="hand-chip-list">
            <button
              v-for="item in group.items"
              :key="`${group.key}-${item.hand}`"
              type="button"
              class="hand-chip"
              :class="{ 'hand-chip--selected': selectedKey === getItemKey(group, item) }"
              @click="toggleItem(group, item)"
            >
              <span>{{ item.hand }}</span>
              <strong>×{{ item.count }}</strong>
            </button>
          </div>

          <div v-if="selectedItem && selectedItem.groupKey === group.key" class="hand-detail-list">
            <button
              v-for="hand in selectedItem.hands"
              :key="hand.id || `${hand.normalizedHand}-${hand.createdAt}`"
              type="button"
              class="hand-detail-row"
              @click="emitOpenHand(hand)"
            >
              <div class="hand-detail-title">
                {{ getHandTitle(hand) }}
              </div>

              <div v-if="getHandMetaText(hand)" class="hand-detail-meta">
                {{ getHandMetaText(hand) }}
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import {
  createStartingHandRunSummary,
  createStartingHandSummary,
  getActionLabel,
  getResultLabel,
} from 'src/utils/handLogHandAnalysis'

const props = defineProps({
  hands: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['open-hand'])

const selectedKey = ref('')

const runSummary = computed(() => {
  return createStartingHandRunSummary(props.hands)
})

const groupSummary = computed(() => {
  return createStartingHandSummary(props.hands)
})

const selectedItem = computed(() => {
  if (!selectedKey.value) {
    return null
  }

  for (const group of groupSummary.value.groups) {
    const item = group.items.find((target) => getItemKey(group, target) === selectedKey.value)

    if (item) {
      return {
        groupKey: group.key,
        ...item,
      }
    }
  }

  return null
})

const getItemKey = (group, item) => {
  return `${group.key}:${item.hand}`
}

const toggleItem = (group, item) => {
  const key = getItemKey(group, item)

  selectedKey.value = selectedKey.value === key ? '' : key
}

const emitOpenHand = (hand) => {
  emit('open-hand', hand)
}

const getHandTitle = (hand) => {
  const levelText = hand.__levelLabel || (hand.__levelNo ? `L${hand.__levelNo}` : '')
  const handText = hand.normalizedHand || hand.holeCards || hand.hand || '핸드'

  return [levelText, handText].filter(Boolean).join(' · ')
}

const getHandMetaText = (hand) => {
  const parts = []

  const positionText = hand.positionLabel || hand.position || ''
  const actionText = hand.actionLabel || getActionLabel(hand.actionType)
  const resultText =
    hand.resultType && hand.resultType !== 'NOT_RECORDED'
      ? hand.resultLabel || getResultLabel(hand.resultType)
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
</script>

<style scoped>
.starting-hand-summary {
  border-top: 1px solid #ececef;
  padding-top: 18px;
}

.section-title {
  font-size: 16px;
  font-weight: 700;
}

.summary-subtitle {
  font-size: 13px;
  font-weight: 900;
  color: #222;
}

.run-card,
.group-card {
  border: 1px solid #ececef;
  border-radius: 16px;
  overflow: hidden;
  background: #fcfcfd;
}

.run-card {
  padding: 14px;
}

.run-meter {
  display: flex;
  width: 100%;
  height: 18px;
  overflow: hidden;
  border-radius: 999px;
  background: #eeeef2;
}

.run-meter-segment {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  overflow: hidden;
  font-size: 10px;
  font-weight: 800;
  color: #ffffff;
  white-space: nowrap;
}

.run-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.run-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 0;
  border-bottom: 1px solid #f1f1f4;
}

.run-row:last-child {
  border-bottom: none;
}

.run-left {
  display: flex;
  align-items: center;
  gap: 9px;
  min-width: 0;
}

.run-dot {
  width: 9px;
  height: 9px;
  flex: 0 0 auto;
  border-radius: 999px;
}

.run-label {
  font-size: 13px;
  font-weight: 900;
  color: #222;
}

.run-description {
  margin-top: 2px;
  font-size: 11px;
  font-weight: 600;
  color: #777;
}

.run-count {
  display: flex;
  align-items: baseline;
  gap: 7px;
  flex: 0 0 auto;
}

.run-count strong {
  font-size: 14px;
  font-weight: 900;
  color: #111;
}

.run-count span {
  font-size: 12px;
  font-weight: 700;
  color: #777;
}

.run-tone--premium {
  background: #673ab7;
}

.run-tone--strong {
  background: #1976d2;
}

.run-tone--middle {
  background: #00897b;
}

.run-tone--low {
  background: #fb8c00;
}

.group-title {
  padding: 14px 16px 10px;
}

.group-list {
  display: flex;
  flex-direction: column;
}

.group-row {
  padding: 10px 14px;
  border-top: 1px solid #f1f1f4;
}

.group-header {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: start;
  gap: 12px;
}

.group-label {
  font-size: 13px;
  font-weight: 900;
  color: #222;
}

.group-label--empty {
  color: #999;
}

.group-description {
  margin-top: 2px;
  font-size: 11px;
  font-weight: 700;
  color: #777;
}

.group-count {
  font-size: 14px;
  font-weight: 900;
  color: #111;
  white-space: nowrap;
}

.group-count--empty {
  color: #999;
}

.hand-chip-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding-top: 8px;
}

.hand-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  min-height: 27px;
  padding: 4px 9px;
  border: 1px solid #e0e1e8;
  border-radius: 999px;
  background: #ffffff;
  cursor: pointer;
}

.hand-chip--selected {
  border-color: #3367e8;
  background: #f6f8ff;
}

.hand-chip span {
  font-size: 12px;
  font-weight: 900;
  color: #222;
}

.hand-chip strong {
  font-size: 11px;
  font-weight: 800;
  color: #666;
}

.hand-detail-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 8px;
  padding-left: 2px;
}

.hand-detail-row {
  width: 100%;
  min-height: 40px;
  padding: 8px 10px;
  border: 1px solid #ececef;
  border-radius: 10px;
  background: #ffffff;
  text-align: left;
  cursor: pointer;
}

.hand-detail-row:hover {
  background: #fafafa;
}

.hand-detail-title {
  font-size: 13px;
  font-weight: 900;
  color: #222;
}

.hand-detail-meta {
  margin-top: 2px;
  font-size: 11px;
  font-weight: 600;
  color: #777;
}

@media (max-width: 599px) {
  .run-row {
    align-items: flex-start;
  }

  .run-count {
    flex-direction: column;
    align-items: flex-end;
    gap: 1px;
  }
}
</style>
