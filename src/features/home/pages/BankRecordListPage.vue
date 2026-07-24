<template>
  <q-page class="bank-record-page">
    <header class="bank-record-topbar">
      <button type="button" aria-label="뒤로 가기" @click="router.back()">
        <q-icon name="chevron_left" size="28px" />
      </button>
      <h1>뱅크 기록</h1>
      <button type="button" aria-label="새 기록 추가" @click="openRecord()">
        <q-icon name="add" size="23px" />
      </button>
    </header>

    <section class="record-overview">
      <article>
        <span>순수익</span>
        <strong class="win">+248,500</strong>
      </article>
      <article>
        <span>기록</span>
        <strong>12회</strong>
      </article>
      <article>
        <span>ROI</span>
        <strong>18.7%</strong>
      </article>
    </section>

    <section class="record-list-section">
      <div class="list-heading">
        <h2>전체 기록</h2>
        <button type="button">
          최신순
          <q-icon name="expand_more" size="18px" />
        </button>
      </div>

      <div class="record-list">
        <button
          v-for="record in records"
          :key="record.id"
          type="button"
          @click="openRecord(record.id)"
        >
          <span class="record-date">
            <strong>{{ record.day }}</strong>
            <small>{{ record.month }}</small>
          </span>
          <span class="record-main">
            <strong>{{ record.title }}</strong>
            <small>바인 {{ record.buyIn }} · {{ record.entries }} Entries</small>
          </span>
          <strong v-if="record.result" class="record-result" :class="record.tone">{{ record.result }}</strong>
          <span v-else class="record-pending">결과 미입력</span>
          <q-icon name="chevron_right" size="21px" />
        </button>
      </div>
    </section>
  </q-page>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()
const records = [
  { id: 'prime-0702', day: '23', month: '7월', title: 'Prime', buyIn: '100,000', entries: 2, result: '+320,000', tone: 'win' },
  { id: 'royce-0718', day: '18', month: '7월', title: 'Royce Daily', buyIn: '110,000', entries: 1, result: '-50,000', tone: 'lose' },
  { id: 'mango-0712', day: '12', month: '7월', title: 'Mango', buyIn: '80,000', entries: 1, result: '', tone: '' },
  { id: 'prime-0705', day: '05', month: '7월', title: 'Prime Weekend', buyIn: '150,000', entries: 1, result: '+95,000', tone: 'win' },
  { id: 'kiki-0629', day: '29', month: '6월', title: 'KIKI', buyIn: '90,000', entries: 2, result: '-180,000', tone: 'lose' },
  { id: 'mango-0622', day: '22', month: '6월', title: 'Mango Deepstack', buyIn: '80,000', entries: 1, result: '', tone: '' },
]

const openRecord = (recordId) => {
  router.push({
    path: '/app/simple-record',
    query: recordId ? { recordId } : {},
  })
}
</script>

<style scoped>
.bank-record-page {
  display: grid;
  min-height: 100%;
  align-content: start;
  gap: 20px;
  padding: 0 var(--v2-page-padding-x) 112px;
}

.bank-record-page * { box-sizing: border-box; }
.bank-record-topbar { display: grid; min-height: 36px; grid-template-columns: 40px minmax(0, 1fr) 40px; align-items: center; }
.bank-record-topbar button { display: grid; width: 36px; height: 36px; place-items: center; padding: 0; border: 0; background: transparent; color: var(--v2-text-main); }
.bank-record-topbar button:last-child { justify-self: end; color: var(--v2-primary); }
.bank-record-topbar h1 { margin: 0; font-size: 17px; font-weight: 560; text-align: center; }
.record-overview { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); overflow: hidden; border: 1px solid var(--v2-border); border-radius: var(--v2-radius-lg); background: #fff; box-shadow: var(--v2-shadow-card); }
.record-overview article { display: grid; min-height: 72px; place-items: center; align-content: center; gap: 6px; padding: 10px 6px; text-align: center; }
.record-overview article + article { border-left: 1px solid var(--v2-border); }
.record-overview span { color: var(--v2-text-sub); font-size: 10px; }
.record-overview strong { font-size: 15px; font-weight: 620; white-space: nowrap; }
.win { color: var(--v2-success); }
.lose { color: var(--v2-danger); }
.record-list-section { display: grid; gap: 10px; }
.list-heading { display: flex; align-items: center; justify-content: space-between; }
.list-heading h2 { margin: 0; font-size: 16px; font-weight: 620; }
.list-heading button { display: flex; align-items: center; gap: 2px; padding: 6px 0; border: 0; background: transparent; color: var(--v2-text-sub); font: inherit; font-size: 11px; }
.record-list { overflow: hidden; border: 1px solid var(--v2-border); border-radius: var(--v2-radius-lg); background: #fff; box-shadow: var(--v2-shadow-card); }
.record-list > button { display: grid; width: 100%; min-height: 76px; grid-template-columns: 38px minmax(0, 1fr) auto 20px; align-items: center; gap: 10px; padding: 11px 12px; border: 0; border-bottom: 1px solid var(--v2-border); background: transparent; color: var(--v2-text-main); font: inherit; text-align: left; }
.record-list > button:last-child { border-bottom: 0; }
.record-date { display: grid; justify-items: center; gap: 2px; padding-right: 9px; border-right: 1px solid var(--v2-border); }
.record-date strong { font-size: 15px; font-weight: 620; }
.record-date small { color: var(--v2-text-sub); font-size: 9px; }
.record-main { display: grid; min-width: 0; gap: 6px; }
.record-main strong { overflow: hidden; font-size: 14px; font-weight: 600; text-overflow: ellipsis; white-space: nowrap; }
.record-main small { overflow: hidden; color: var(--v2-text-sub); font-size: 10px; text-overflow: ellipsis; white-space: nowrap; }
.record-result { font-size: 12px; font-weight: 600; white-space: nowrap; }
.record-pending { padding: 5px 7px; border-radius: 7px; background: #f2f0f7; color: var(--v2-text-sub); font-size: 9px; white-space: nowrap; }
.record-list .q-icon { color: var(--v2-text-sub); }
</style>
