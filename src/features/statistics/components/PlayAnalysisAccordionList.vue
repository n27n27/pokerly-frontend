<template>
  <div class="analysis-list">
    <article
      v-for="row in rows"
      :key="row.key"
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
        <span v-if="row.total" class="analysis-row__summary">
          <span>기록 {{ row.total }}회</span>
          <strong>{{ formatResult(row) }}</strong>
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
            <span>전체 결과</span>
            <strong>{{ formatResult(row) }}</strong>
            <small v-if="row.draws || row.unrecorded">{{ formatSupplement(row) }}</small>
            <small v-else aria-hidden="true">&nbsp;</small>
          </div>
        </div>

        <div class="action-analysis">
          <div class="action-analysis__head">
            <h3>프리플랍 액션</h3>
            <span>횟수</span>
            <span>결과</span>
          </div>
          <div v-for="action in row.actions" :key="action.key" class="action-analysis__row">
            <span>{{ action.label }}</span>
            <strong>{{ action.count }}회</strong>
            <small v-if="action.showResult">{{ formatResult(action) }}</small>
            <small v-else aria-hidden="true"></small>
          </div>
        </div>
      </div>
    </article>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { formatAnalysisRate } from '../utils/playAnalysis'

defineProps({
  rows: {
    type: Array,
    default: () => [],
  },
})

const expandedKeys = ref(new Set())
const isOpen = (key) => expandedKeys.value.has(key)
const toggle = (key) => {
  const next = new Set(expandedKeys.value)
  if (next.has(key)) next.delete(key)
  else next.add(key)
  expandedKeys.value = next
}

const formatRate = formatAnalysisRate
const formatResult = (item) => `${item.wins}승 · ${item.losses}패`
const formatSupplement = (item) => [
  item.draws ? `무승부 ${item.draws}회` : '',
  item.unrecorded ? `결과 미기록 ${item.unrecorded}회` : '',
].filter(Boolean).join(' · ')
</script>

<style scoped>
.analysis-list {
  display: grid;
  gap: 12px;
}

.analysis-row {
  overflow: hidden;
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-md);
  background: #fff;
  box-shadow: 0 4px 12px rgba(28, 18, 60, 0.025);
}

.analysis-row--open {
  border-color: rgba(109, 69, 232, 0.28);
  box-shadow: 0 8px 24px rgba(66, 41, 126, 0.07);
}

.analysis-row__trigger {
  width: 100%;
  min-height: 64px;
  padding: 14px 16px;
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

.analysis-row__trigger strong {
  font-size: 16px;
  font-weight: 700;
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
  color: var(--v2-text-main);
  font-size: 12px;
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
  padding: 16px;
  border-top: 1px solid var(--v2-border);
  background: linear-gradient(180deg, #fff 0%, #fdfcff 100%);
}

.analysis-overview {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  overflow: hidden;
  margin-bottom: 14px;
  border: 1px solid var(--v2-border);
  border-radius: 12px;
  background: #faf9fd;
}

.analysis-overview > div {
  min-width: 0;
  display: grid;
  grid-template-rows: 14px 22px 14px;
  align-content: center;
  justify-items: center;
  min-height: 76px;
  padding: 10px 6px;
  gap: 4px;
  text-align: center;
}

.analysis-overview > div + div {
  border-left: 1px solid var(--v2-border);
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
  overflow: hidden;
  border: 1px solid var(--v2-border);
  border-radius: 12px;
}

.action-analysis__head {
  min-height: 42px;
  padding: 0 14px;
  display: grid;
  grid-template-columns: minmax(82px, 1fr) 50px minmax(74px, auto);
  align-items: center;
  gap: 8px;
  background: #faf9fd;
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
  min-height: 42px;
  padding: 0 14px;
  display: grid;
  grid-template-columns: minmax(82px, 1fr) 50px minmax(74px, auto);
  align-items: center;
  gap: 8px;
  border-top: 1px solid var(--v2-border);
  font-size: 12px;
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
