<template>
  <q-page class="calc-page">
    <header class="calc-topbar">
      <button type="button" aria-label="뒤로 가기" @click="router.back()">
        <q-icon name="chevron_left" size="30px" />
      </button>
      <h1>팟 오즈 계산기</h1>
      <button type="button" aria-label="정보">
        <q-icon name="info" size="21px" />
      </button>
    </header>

    <p class="intro">현재 상황에서 콜이 수익적인지 확인하고, 필요한 에퀴티와 실제 에퀴티를 비교해 보세요.</p>

    <section class="panel">
      <h2>상황 입력</h2>
      <label v-for="field in fields" :key="field.key" class="input-row">
        <span>
          <q-icon :name="field.icon" size="18px" />
          {{ field.label }}
        </span>
        <div>
          <button v-if="field.stepper" type="button" @click="adjustPlayers(-1)">-</button>
          <input v-model.number="form[field.key]" type="number" inputmode="decimal" />
          <button v-if="field.stepper" type="button" @click="adjustPlayers(1)">+</button>
          <em>{{ field.unit }}</em>
        </div>
      </label>
    </section>

    <button class="primary-action" type="button">
      <q-icon name="calculate" size="18px" />
      계산하기
    </button>

    <section class="panel result-panel">
      <div class="panel-header">
        <h2>결과</h2>
        <button type="button" @click="reset">
          <q-icon name="refresh" size="16px" />
          초기화
        </button>
      </div>

      <div class="result-grid">
        <div>
          <span>팟 오즈</span>
          <strong>{{ oddsRatio }} : 1</strong>
        </div>
        <div>
          <span>필요한 에퀴티</span>
          <strong class="primary">{{ requiredEquity }}%</strong>
        </div>
        <div>
          <span>내 에퀴티</span>
          <strong class="success">{{ myEquity }}%</strong>
        </div>
      </div>

      <div class="decision-card" :class="{ good: isProfitable }">
        <q-icon :name="isProfitable ? 'check_circle' : 'cancel'" size="20px" />
        <div>
          <strong>{{ isProfitable ? '콜이 수익적입니다!' : '콜이 부족합니다' }}</strong>
          <span>
            내 에퀴티({{ myEquity }}%)가 필요한 에퀴티({{ requiredEquity }}%)보다
            {{ isProfitable ? '높습니다.' : '낮습니다.' }}
          </span>
        </div>
      </div>

      <div class="equity-bar">
        <div>
          <span>필요한 에퀴티</span>
          <span>내 에퀴티</span>
        </div>
        <i>
          <b class="required" :style="{ left: `${requiredEquity}%` }"></b>
          <b class="mine" :style="{ width: `${myEquity}%` }"></b>
        </i>
      </div>
    </section>

    <section class="panel detail-panel">
      <div class="panel-header">
        <h2>상세 계산 과정</h2>
        <q-icon name="keyboard_arrow_up" size="20px" />
      </div>
      <dl>
        <div>
          <dt>총 팟 (현재 팟 + 콜 비용)</dt>
          <dd>{{ formatNumber(totalPot) }}원</dd>
        </div>
        <div>
          <dt>팟 오즈 (콜 비용 : 총 팟)</dt>
          <dd>{{ formatNumber(form.callAmount) }} : {{ formatNumber(form.potSize) }} ({{ oddsRatio }} : 1)</dd>
        </div>
        <div>
          <dt>필요한 에퀴티 = 1 / (팟 오즈 + 1)</dt>
          <dd>{{ requiredEquity }}%</dd>
        </div>
      </dl>
      <p>내 에퀴티가 필요한 에퀴티보다 높으면 콜이 수익적입니다.</p>
    </section>
  </q-page>
</template>

<script setup>
import { computed, reactive } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const form = reactive({
  potSize: 100000,
  callAmount: 20000,
  remainingPlayers: 1,
  myEquity: 35,
})

const fields = [
  { key: 'potSize', label: '팟 크기', unit: '원', icon: 'poker_chip' },
  { key: 'callAmount', label: '콜 비용', unit: '원', icon: 'swap_horiz' },
  { key: 'remainingPlayers', label: '남은 플레이어 수', unit: '', icon: 'person', stepper: true },
  { key: 'myEquity', label: '내 에퀴티 (선택)', unit: '%', icon: 'show_chart' },
]

const totalPot = computed(() => Math.max(0, form.potSize + form.callAmount))
const potOdds = computed(() => (form.callAmount > 0 ? form.potSize / form.callAmount : 0))
const oddsRatio = computed(() => potOdds.value.toFixed(2))
const requiredEquity = computed(() => (totalPot.value > 0 ? ((form.callAmount / totalPot.value) * 100).toFixed(2) : '0.00'))
const myEquity = computed(() => Number(form.myEquity || 0).toFixed(2))
const isProfitable = computed(() => Number(myEquity.value) >= Number(requiredEquity.value))

const adjustPlayers = (amount) => {
  form.remainingPlayers = Math.min(9, Math.max(1, Number(form.remainingPlayers || 1) + amount))
}

const reset = () => {
  form.potSize = 100000
  form.callAmount = 20000
  form.remainingPlayers = 1
  form.myEquity = 35
}

const formatNumber = (value) => Number(value || 0).toLocaleString('ko-KR')
</script>

<style scoped>
.calc-page {
  display: grid;
  align-content: start;
  gap: 12px;
  min-height: 100%;
  padding: 18px 16px 112px;
}

.calc-topbar {
  display: grid;
  grid-template-columns: 40px minmax(0, 1fr) 40px;
  align-items: center;
}

.calc-topbar button {
  width: 38px;
  height: 38px;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--v2-text-main);
}

.calc-topbar h1 {
  margin: 0;
  color: var(--v2-text-main);
  font-size: 17px;
  font-weight: 520;
  text-align: center;
}

.intro {
  margin: 0;
  color: #5f596b;
  font-size: 12px;
  line-height: 1.55;
}

.panel {
  padding: 14px;
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-lg);
  background: #ffffff;
  box-shadow: 0 5px 14px rgba(28, 18, 60, 0.022);
  display: grid;
  gap: 12px;
}

.panel h2 {
  margin: 0;
  color: var(--v2-text-main);
  font-size: 14px;
  font-weight: 560;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.panel-header button {
  border: 0;
  background: transparent;
  color: var(--v2-primary);
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font: inherit;
  font-size: 12px;
}

.input-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 156px;
  align-items: center;
  gap: 12px;
}

.input-row > span {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: #4f4a5e;
  font-size: 13px;
  font-weight: 520;
}

.input-row .q-icon {
  color: var(--v2-primary);
}

.input-row div {
  min-height: 38px;
  padding: 0 9px;
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-sm);
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto auto;
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

.input-row button {
  width: 24px;
  height: 24px;
  border: 1px solid var(--v2-border);
  border-radius: 7px;
  background: #ffffff;
  color: var(--v2-primary);
}

.input-row em {
  color: #5f596b;
  font-size: 12px;
  font-style: normal;
}

.primary-action {
  min-height: 48px;
  border: 0;
  border-radius: var(--v2-radius-md);
  background: var(--v2-primary);
  color: #ffffff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  font: inherit;
  font-size: 14px;
  font-weight: 520;
}

.result-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  border-bottom: 1px solid var(--v2-border);
  padding-bottom: 10px;
}

.result-grid div {
  display: grid;
  justify-items: center;
  gap: 6px;
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
  font-size: 18px;
  font-weight: 560;
}

.primary {
  color: var(--v2-primary) !important;
}

.success {
  color: var(--v2-success) !important;
}

.decision-card {
  padding: 11px;
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

.equity-bar {
  display: grid;
  gap: 8px;
}

.equity-bar div {
  display: flex;
  justify-content: space-between;
  color: var(--v2-text-sub);
  font-size: 11px;
}

.equity-bar i {
  position: relative;
  height: 18px;
  overflow: hidden;
  border-radius: 999px;
  background: #ececf2;
}

.equity-bar b {
  position: absolute;
  top: 0;
  height: 100%;
}

.equity-bar .mine {
  left: 0;
  background: var(--v2-success);
}

.equity-bar .required {
  width: 2px;
  background: var(--v2-danger);
  z-index: 1;
}

.detail-panel dl {
  margin: 0;
  display: grid;
  gap: 9px;
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

.detail-panel p {
  margin: 0;
  padding: 12px;
  border-radius: var(--v2-radius-sm);
  background: var(--v2-primary-soft);
  color: #5f4fd6;
  font-size: 12px;
}
</style>
