<template>
  <div class="analysis-list">
    <article
      v-for="row in rows"
      :key="row.key"
      :data-analysis-key="row.key"
      class="analysis-row"
      :class="{ 'analysis-row--empty': row.total === 0, 'analysis-row--open': isOpen(row.key) }"
    >
      <button
        class="analysis-row__trigger"
        type="button"
        :disabled="row.total === 0"
        :aria-expanded="isOpen(row.key)"
        @click="toggle(row.key)"
      >
        <strong>{{ row.label }}</strong>
        <span
          v-if="row.total"
          class="analysis-row__summary"
          :class="{ 'analysis-row__summary--rates': summaryMode === 'rates' }"
        >
          <template v-if="summaryMode === 'rates'">
            <span
              class="analysis-row__metric analysis-row__metric--participation"
              :class="{ 'is-zero': row.participationRate === 0 }"
            >
              참여 <strong>{{ formatRate(row.participationRate) }}</strong>
            </span>
            <span
              class="analysis-row__metric analysis-row__metric--win"
              :class="{ 'is-zero': row.winRate === 0 }"
              aria-label="참여했을 때 승률"
            >
              승률 <strong>{{ formatRate(row.winRate) }}</strong>
            </span>
          </template>
          <strong v-else>{{ formatParticipatedResult(row) }}</strong>
        </span>
        <span v-else class="analysis-row__summary">0회</span>
        <q-icon v-if="row.total" :name="isOpen(row.key) ? 'expand_less' : 'expand_more'" size="21px" />
      </button>

      <div v-if="row.total && isOpen(row.key)" class="analysis-row__body">
        <div class="analysis-overview">
          <div>
            <span>총 기록</span>
            <strong>{{ row.total }}회</strong>
            <small aria-hidden="true">&nbsp;</small>
          </div>
          <div>
            <span>참여</span>
            <strong>{{ row.participated }}회</strong>
            <small>{{ formatRate(row.participationRate) }}</small>
          </div>
          <div>
            <span>참여 결과</span>
            <strong>{{ formatParticipatedResult(row) }}</strong>
            <small aria-hidden="true">&nbsp;</small>
          </div>
        </div>

        <div class="action-analysis">
          <div class="action-analysis__head">
            <h3>프리플랍 액션</h3>
            <span>횟수</span>
            <span>결과</span>
          </div>
          <button
            v-for="action in row.actions"
            :key="action.key"
            class="action-analysis__row"
            :class="{ 'action-analysis__row--drilldown': actionDrilldown }"
            type="button"
            :disabled="!actionDrilldown"
            @click="actionDrilldown && $emit('action-select', { row, action })"
          >
            <span>{{ action.label }}</span>
            <strong>{{ action.count }}회</strong>
            <small v-if="action.showResult">{{ formatResultWithDraws(action) }}</small>
            <small v-else aria-hidden="true"></small>
            <q-icon v-if="actionDrilldown" name="chevron_right" size="18px" />
          </button>
        </div>

        <div v-if="showPositions && row.positions?.length" class="action-analysis position-analysis">
          <div class="action-analysis__head">
            <h3>포지션</h3>
            <span>횟수</span>
            <span>참여 결과</span>
          </div>
          <div
            v-for="position in row.positions"
            :key="position.key"
            class="action-analysis__row"
          >
            <span>{{ position.label }}</span>
            <strong>{{ position.count }}회</strong>
            <small v-if="position.participated">{{ formatResultWithDraws(position) }}</small>
            <small v-else aria-hidden="true"></small>
          </div>
        </div>
      </div>
    </article>
  </div>
</template>

<script setup>
import { nextTick, ref } from 'vue'
import { formatAnalysisRate } from '../utils/playAnalysis'

defineProps({
  rows: {
    type: Array,
    default: () => [],
  },
  summaryMode: {
    type: String,
    default: 'results',
  },
  actionDrilldown: {
    type: Boolean,
    default: false,
  },
  showPositions: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['action-select'])

const expandedKeys = ref(new Set())
const isOpen = (key) => expandedKeys.value.has(key)
const toggle = (key) => {
  const next = new Set(expandedKeys.value)
  if (next.has(key)) next.delete(key)
  else next.add(key)
  expandedKeys.value = next
}

const openAndScroll = async (key) => {
  expandedKeys.value = new Set([...expandedKeys.value, key])
  await nextTick()
  const target = document.querySelector(`[data-analysis-key="${key}"]`)
  target?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

defineExpose({ openAndScroll })

const formatRate = formatAnalysisRate
const formatResultWithDraws = (item) => [
  `${item.wins}승`,
  `${item.losses}패`,
  item.draws ? `${item.draws}무` : '',
].filter(Boolean).join(' · ')
const formatParticipatedResult = (item) => [
  `${item.participatedWins}승`,
  `${item.participatedLosses}패`,
  item.participatedDraws ? `${item.participatedDraws}무` : '',
].filter(Boolean).join(' · ')
</script>

<style scoped>
.analysis-list {
  display: grid;
  gap: 8px;
}

.analysis-row {
  overflow: hidden;
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-md);
  background: #fff;
  box-shadow: 0 4px 12px rgba(28, 18, 60, 0.025);
}

.analysis-row--open {
  border-color: rgba(109, 69, 232, 0.2);
  box-shadow: 0 8px 22px rgba(66, 41, 126, 0.06);
}

.analysis-row__trigger {
  width: 100%;
  min-height: 52px;
  padding: 10px 14px;
  border: 0;
  background: transparent;
  color: var(--v2-text-main);
  display: grid;
  grid-template-columns: 58px minmax(0, 1fr) 22px;
  align-items: center;
  gap: 10px;
  text-align: left;
  cursor: pointer;
}

.analysis-row--open .analysis-row__trigger {
  background: color-mix(in srgb, var(--v2-primary) 3%, white);
}

.analysis-row__trigger strong {
  font-size: 16px;
  font-weight: 650;
  letter-spacing: -0.01em;
}

.analysis-row__trigger > strong {
  color: #373240;
}

.analysis-row--empty .analysis-row__trigger > strong {
  color: var(--v2-text-sub);
}

.analysis-row__trigger > .q-icon {
  color: #625b70;
}

.analysis-row__summary {
  min-width: 0;
  color: var(--v2-text-sub);
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  white-space: nowrap;
}

.analysis-row__summary strong {
  color: #494352;
  font-size: 12px;
  font-weight: 620;
}

.analysis-row__metric {
  display: grid;
  grid-template-columns: auto 56px;
  gap: 4px;
  align-items: baseline;
  justify-content: end;
  font-weight: 600;
}

.analysis-row__summary--rates {
  display: grid;
  grid-template-columns: repeat(2, 96px);
  gap: 4px;
  justify-content: end;
}

.analysis-row__metric--participation strong {
  color: var(--v2-primary);
  text-align: right;
  font-weight: 680;
}

.analysis-row__metric--win {
  color: #657b79;
}

.analysis-row__metric--win strong {
  color: #625b70;
  text-align: right;
  font-weight: 620;
}

.analysis-row__metric.is-zero {
  color: #9d97aa;
}

.analysis-row__metric.is-zero strong {
  color: #aaa4b5;
  font-weight: 650;
}

.analysis-row--empty {
  background: rgba(255, 255, 255, 0.58);
}

.analysis-row--empty .analysis-row__trigger {
  grid-template-columns: 58px minmax(0, 1fr);
  cursor: default;
  opacity: 0.48;
}

.analysis-row__body {
  padding: 6px 12px 12px;
  background: color-mix(in srgb, var(--v2-primary) 3%, white);
}

.analysis-overview {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 6px;
  margin-bottom: 10px;
}

.analysis-overview > div {
  min-width: 0;
  display: grid;
  grid-template-rows: 14px 22px 14px;
  align-content: center;
  justify-items: center;
  min-height: 64px;
  padding: 8px 5px;
  gap: 4px;
  border: 1px solid rgba(109, 69, 232, 0.09);
  border-radius: 10px;
  background: #fff;
  text-align: center;
}

.analysis-overview span,
.analysis-overview small {
  color: var(--v2-text-sub);
  font-size: 10px;
  line-height: 14px;
}

.analysis-overview strong {
  font-size: 14px;
  font-weight: 680;
  line-height: 22px;
}

.action-analysis {
  display: grid;
  gap: 5px;
  padding: 7px;
  border: 1px solid rgba(109, 69, 232, 0.09);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.48);
}

.position-analysis {
  margin-top: 8px;
}

.action-analysis__head {
  min-height: 30px;
  padding: 0 4px;
  display: grid;
  grid-template-columns: minmax(82px, 1fr) 50px minmax(74px, auto) 18px;
  align-items: center;
  gap: 8px;
  color: var(--v2-text-sub);
  font-size: 10px;
}

.action-analysis__head h3 {
  margin: 0;
  color: var(--v2-text-main);
  font-size: 12px;
  font-weight: 650;
}

.action-analysis__head span {
  text-align: right;
}

.action-analysis__row {
  min-height: 38px;
  padding: 0 10px;
  display: grid;
  grid-template-columns: minmax(82px, 1fr) 50px minmax(74px, auto) 18px;
  align-items: center;
  gap: 8px;
  border: 1px solid rgba(109, 69, 232, 0.07);
  border-radius: 9px;
  background: #fff;
  font-size: 12px;
  color: var(--v2-text-main);
  font-family: inherit;
  text-align: left;
}

.action-analysis__row:disabled {
  grid-template-columns: minmax(82px, 1fr) 50px minmax(74px, auto);
  opacity: 1;
}

.action-analysis__row--drilldown {
  cursor: pointer;
}

.action-analysis__row--drilldown:active {
  background: color-mix(in srgb, var(--v2-primary) 5%, white);
}

.action-analysis__row .q-icon {
  color: var(--v2-text-sub);
}

.action-analysis__row strong,
.action-analysis__row small {
  text-align: right;
}

.action-analysis__row strong {
  font-weight: 620;
}

.action-analysis__row small {
  color: var(--v2-text-sub);
}

@media (max-width: 370px) {
  .analysis-row__trigger {
    grid-template-columns: 50px minmax(0, 1fr) 20px;
    padding-inline: 13px;
    gap: 7px;
  }

  .analysis-row--empty .analysis-row__trigger {
    grid-template-columns: 50px minmax(0, 1fr);
  }

  .analysis-row__summary {
    gap: 7px;
  }
}
</style>
