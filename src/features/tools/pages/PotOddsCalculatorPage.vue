<template>
  <q-page class="calc-page">
    <header class="calc-topbar">
      <button type="button" aria-label="도구로 돌아가기" @click="router.push('/app/tools')">
        <q-icon name="chevron_left" size="28px" />
      </button>
      <h1>팟 오즈 계산기</h1>
      <span aria-hidden="true"></span>
    </header>

    <section class="panel">
      <h2>상황 입력</h2>
      <label v-for="field in fields" :key="field.key" class="input-row">
        <span>{{ field.label }}</span>
        <div>
          <input
            :value="inputValues[field.key]"
            type="text"
            inputmode="decimal"
            :aria-label="field.label"
            @focus="beginEditing(field.key)"
            @input="updateField(field.key, $event.target.value)"
            @blur="finishEditing(field.key)"
          />
          <em>{{ field.unit }}</em>
        </div>
      </label>
    </section>

    <section v-if="hasInput" class="panel result-panel">
      <div class="panel-header">
        <h2>결과</h2>
      </div>

      <div class="result-grid">
        <div>
          <span>팟 오즈</span>
          <strong>{{ oddsRatio }} : 1</strong>
        </div>
        <div>
          <span>필요 에퀴티</span>
          <strong class="primary">{{ requiredEquity }}%</strong>
        </div>
        <div>
          <span>예상 에퀴티</span>
          <strong class="success">{{ myEquity }}%</strong>
        </div>
      </div>

      <div class="decision-card" :class="{ good: isProfitable }">
        <q-icon :name="isProfitable ? 'check_circle' : 'cancel'" size="20px" />
        <div>
          <strong>{{ isProfitable ? '콜이 수익적입니다' : '콜에 필요한 에퀴티가 부족합니다' }}</strong>
          <span>{{ equityComparisonMessage }}</span>
        </div>
      </div>
    </section>

    <section v-else class="panel empty-result">
      팟, 콜 비용과 예상 에퀴티를 입력하면 결과가 표시됩니다.
    </section>

    <section v-if="hasInput" class="panel detail-panel">
      <div class="panel-header">
        <h2>상세 계산 과정</h2>
        <button
          type="button"
          :aria-expanded="detailsOpen"
          :aria-label="`상세 계산 과정 ${detailsOpen ? '접기' : '펼치기'}`"
          @click="detailsOpen = !detailsOpen"
        >
          <q-icon :name="detailsOpen ? 'keyboard_arrow_up' : 'keyboard_arrow_down'" size="20px" />
        </button>
      </div>
      <dl v-if="detailsOpen">
        <div>
          <dt>총 팟 (현재 팟 + 콜 비용)</dt>
          <dd>{{ formatNumber(totalPot) }}</dd>
        </div>
        <div>
          <dt>팟 오즈 (현재 팟 : 콜 비용)</dt>
          <dd>{{ formatNumber(form.potSize) }} : {{ formatNumber(form.callAmount) }} ({{ oddsRatio }} : 1)</dd>
        </div>
        <div>
          <dt>필요한 에퀴티 = 1 / (팟 오즈 + 1)</dt>
          <dd>{{ requiredEquity }}%</dd>
        </div>
      </dl>
    </section>
  </q-page>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const form = reactive({
  potSize: null,
  callAmount: null,
  myEquity: null,
})
const inputValues = reactive({
  potSize: '',
  callAmount: '',
  myEquity: '',
})
const detailsOpen = ref(true)

const fields = [
  { key: 'potSize', label: '현재 팟', unit: '' },
  { key: 'callAmount', label: '콜 비용', unit: '' },
  { key: 'myEquity', label: '예상 에퀴티', unit: '%' },
]

const hasInput = computed(() =>
  inputValues.potSize !== '' &&
  inputValues.callAmount !== '' &&
  inputValues.myEquity !== '' &&
  Number(form.potSize) > 0 &&
  Number(form.callAmount) > 0,
)

const totalPot = computed(() => Math.max(0, form.potSize + form.callAmount))
const potOdds = computed(() => (form.callAmount > 0 ? form.potSize / form.callAmount : 0))
const oddsRatio = computed(() => potOdds.value.toFixed(2))
const requiredEquity = computed(() => (totalPot.value > 0 ? ((form.callAmount / totalPot.value) * 100).toFixed(2) : '0.00'))
const myEquity = computed(() => Number(form.myEquity || 0).toFixed(2))
const isProfitable = computed(() => Number(myEquity.value) >= Number(requiredEquity.value))
const equityComparisonMessage = computed(() => {
  const difference = Number(myEquity.value) - Number(requiredEquity.value)
  if (difference === 0) {
    return `예상 에퀴티(${myEquity.value}%)는 필요 에퀴티(${requiredEquity.value}%)와 같습니다.`
  }
  return `예상 에퀴티(${myEquity.value}%)가 필요 에퀴티(${requiredEquity.value}%)보다 ${difference > 0 ? '높습니다.' : '낮습니다.'}`
})

const formatNumber = (value) => Number(value || 0).toLocaleString('ko-KR')
const sanitizeNumber = (value) => {
  const cleaned = String(value).replace(/[^\d.]/g, '')
  const [integer = '', ...decimals] = cleaned.split('.')
  return decimals.length ? `${integer}.${decimals.join('')}` : integer
}
const beginEditing = (key) => {
  inputValues[key] = String(form[key] || '')
}
const updateField = (key, value) => {
  const sanitized = sanitizeNumber(value)
  inputValues[key] = sanitized
  form[key] = Number(sanitized || 0)
}
const finishEditing = (key) => {
  if (inputValues[key] === '') {
    form[key] = null
    return
  }
  const maximum = key === 'myEquity' ? 100 : Number.MAX_SAFE_INTEGER
  form[key] = Math.min(maximum, Math.max(0, Number(form[key]) || 0))
  inputValues[key] = formatNumber(form[key])
}
</script>

<style scoped>
.calc-page {
  display: grid;
  align-content: start;
  gap: 8px;
  min-height: 100%;
  padding: var(--v2-page-padding-top) var(--v2-page-padding-x) 104px;
}

.calc-topbar {
  display: grid;
  justify-items: start;
  margin: 0 0 12px;
}

.calc-topbar h1 {
  margin: 0;
  color: var(--v2-text-main);
  font-size: 22px;
  font-weight: 560;
  line-height: 1;
  text-align: left;
}

.panel {
  padding: 12px;
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-lg);
  background: #ffffff;
  box-shadow: 0 5px 14px rgba(28, 18, 60, 0.022);
  display: grid;
  gap: 8px;
}

.panel h2 {
  margin: 0;
  color: var(--v2-text-main);
  font-size: 14px;
  font-weight: 560;
  line-height: 1;
}

.empty-result {
  min-height: 88px;
  place-items: center;
  color: var(--v2-text-sub);
  font-size: 12px;
  text-align: center;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 0;
}

.panel-header button {
  display: grid;
  width: 30px;
  height: 30px;
  place-items: center;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--v2-text-main);
}

.input-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 156px;
  align-items: center;
  gap: 10px;
}

.input-row > span {
  color: #4f4a5e;
  font-size: 13px;
  font-weight: 520;
}

.input-row div {
  min-height: 34px;
  padding: 0 9px;
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-sm);
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 6px;
}

.input-row input {
  min-width: 0;
  border: 0;
  outline: 0;
  color: var(--v2-text-main);
  font: inherit;
  font-size: 13px;
  text-align: right;
}

.input-row em {
  color: #5f596b;
  font-size: 12px;
  font-style: normal;
}

.result-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  border-bottom: 1px solid var(--v2-border);
  padding-bottom: 8px;
}

.result-grid div {
  display: grid;
  justify-items: center;
  gap: 4px;
  border-right: 1px solid var(--v2-border);
  text-align: center;
}

.result-grid div:last-child {
  border-right: 0;
}

.result-grid span {
  color: var(--v2-text-sub);
  font-size: 11px;
}

.result-grid strong {
  color: var(--v2-text-main);
  font-size: 17px;
  font-weight: 560;
}

.primary {
  color: var(--v2-primary) !important;
}

.success {
  color: var(--v2-success) !important;
}

.decision-card {
  padding: 10px;
  border-radius: var(--v2-radius-md);
  background: rgba(239, 68, 68, 0.08);
  color: var(--v2-danger);
  display: grid;
  grid-template-columns: 22px minmax(0, 1fr);
  gap: 8px;
}

.decision-card.good {
  background: rgba(22, 163, 74, 0.1);
  color: var(--v2-success);
}

.decision-card div {
  display: grid;
  gap: 4px;
}

.decision-card strong {
  font-size: 13px;
  font-weight: 560;
}

.decision-card span {
  color: #4f4a5e;
  font-size: 11px;
  line-height: 1.45;
}

.detail-panel dl {
  margin: 0;
  display: grid;
  gap: 7px;
}

.detail-panel div {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.detail-panel dt,
.detail-panel dd {
  margin: 0;
  color: #4f4a5e;
  font-size: 12px;
}

.detail-panel dd {
  color: var(--v2-primary);
}

</style>
