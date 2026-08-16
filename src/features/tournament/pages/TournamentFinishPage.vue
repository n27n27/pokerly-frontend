<template>
  <q-page class="finish-page">
    <header class="finish-topbar">
      <button type="button" aria-label="닫기" @click="goBack">
        <q-icon name="close" size="28px" />
      </button>
      <h1>{{ isEdit ? '대회 수정' : '대회 종료' }}</h1>
      <span aria-hidden="true"></span>
    </header>

    <section class="tournament-heading">
      <strong>{{ tournamentName }}</strong>
      <span>{{ tournamentDate }}</span>
    </section>

    <section class="result-section">
      <div class="section-title">
        <h2>이번 대회 결과</h2>
        <span>필수</span>
      </div>

      <div class="result-options">
        <button
          v-for="result in results"
          :key="result.value"
          type="button"
          :class="{ selected: form.result === result.value }"
          @click="selectResult(result.value)"
        >
          <q-icon :name="result.icon" size="25px" />
          <strong>{{ result.label }}</strong>
        </button>
      </div>
    </section>

    <section class="extra-section">
      <div class="section-title">
        <h2>추가 정보</h2>
        <small>선택</small>
      </div>

      <div class="field-list">
        <label class="field-row">
          <span>최종 순위</span>
          <input v-model="form.rank" inputmode="numeric" placeholder="예) 17" />
          <em>위</em>
        </label>

        <label class="field-row" :class="{ disabled: !canReceiveAward }">
          <span>포인트</span>
          <input
            :value="form.prize"
            :disabled="!canReceiveAward"
            inputmode="numeric"
            :placeholder="canReceiveAward ? '예) 450,000' : '획득 불가'"
            @input="updateMoneyField('prize', $event)"
          />
        </label>

        <div class="field-row satellite-toggle-row" :class="{ disabled: !canReceiveAward }">
          <span>새틀 획득</span>
          <button
            type="button"
            role="switch"
            :disabled="!canReceiveAward"
            :aria-checked="form.satelliteAwarded"
            :class="{ active: form.satelliteAwarded }"
            @click="toggleSatellite"
          >
            <i></i>
            <b>{{ form.satelliteAwarded ? 'ON' : 'OFF' }}</b>
          </button>
        </div>

        <label v-if="form.satelliteAwarded" class="field-row">
          <span>새틀명 <small>선택</small></span>
          <input
            v-model.trim="form.satelliteName"
            maxlength="100"
            placeholder="예) Prime Main Event"
          />
        </label>

        <label class="field-row">
          <span>총 엔트리</span>
          <input v-model="form.entries" inputmode="numeric" placeholder="예) 289" />
          <em>명</em>
        </label>

        <div class="field-row buy-in-row">
          <span>총 바인</span>
          <div class="stepper">
            <button
              type="button"
              aria-label="총 바인 감소"
              :disabled="form.buyIns <= 1"
              @click="form.buyIns -= 1"
            >
              <q-icon name="remove" size="19px" />
            </button>
            <strong>{{ form.buyIns }}</strong>
            <button type="button" aria-label="총 바인 증가" @click="form.buyIns += 1">
              <q-icon name="add" size="19px" />
            </button>
          </div>
          <em>회</em>
        </div>

        <label class="field-row">
          <span>할인 금액</span>
          <input
            :value="form.discount"
            inputmode="numeric"
            placeholder="예) 50,000"
            @input="updateMoneyField('discount', $event)"
          />
        </label>

        <label class="field-row memo-row">
          <span>대회 메모</span>
          <textarea v-model="form.memo" maxlength="200" placeholder="선택 입력" />
          <small>{{ form.memo.length }} / 200</small>
        </label>
      </div>
    </section>

    <StickyPrimaryAction
      :label="isEdit ? '수정 완료' : '결과 확정'"
      :disabled="!form.result"
      :loading="submitting"
      loading-label="저장 중..."
      @click="confirmResult"
    />
  </q-page>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useAlert } from 'src/composables/useAlert'
import StickyPrimaryAction from 'src/shared/components/StickyPrimaryAction.vue'
import { fetchGameSession, updateGameSession } from 'src/api/gameSession'
import { formatLocalDate } from 'src/utils/localDate'

const route = useRoute()
const router = useRouter()
const alert = useAlert()
const submitting = ref(false)
const sourceSession = ref(null)
const isEdit = computed(() => route.query.mode === 'edit')
const runningTournament = (() => {
  try {
    return JSON.parse(localStorage.getItem('pokerly-running-tournament')) || {}
  } catch {
    return {}
  }
})()
const tournamentName = computed(
  () => sourceSession.value?.tournamentName || runningTournament.name || '이름 없는 토너먼트',
)
const tournamentDate = computed(
  () =>
    sourceSession.value?.playDate?.replaceAll('-', '.') ||
    runningTournament.date ||
    formatLocalDate(new Date(), '.'),
)

const results = [
  { value: 'BUST', label: '탈락', icon: 'cancel' },
  { value: 'BUBBLE', label: 'Bubble', icon: 'circle' },
  { value: 'ITM', label: 'ITM', icon: 'workspace_premium' },
  { value: 'CHOP', label: '찹', icon: 'handshake' },
  { value: 'WIN', label: '우승', icon: 'emoji_events' },
]
const canReceiveAward = computed(() => ['ITM', 'CHOP', 'WIN'].includes(form.result))

const form = reactive({
  result: isEdit.value ? 'ITM' : '',
  rank: isEdit.value ? '17' : '',
  prize: isEdit.value ? '320,000' : '',
  entries: isEdit.value ? '289' : '',
  buyIns: isEdit.value ? 2 : 1,
  discount: '',
  memo: '',
  satelliteAwarded: false,
  satelliteName: '',
})

onMounted(async () => {
  const sessionId = route.query.tournamentId || runningTournament.sessionId
  if (!sessionId) return
  try {
    const session = await fetchGameSession(sessionId)
    sourceSession.value = session
    Object.assign(form, {
      result: session.tournamentResult || '',
      rank: session.finalRank || '',
      prize: formatMoneyInput(session.prize),
      entries: session.fieldEntries || '',
      buyIns: session.entries || 1,
      discount: formatMoneyInput(session.discount),
      memo: session.notes || '',
      satelliteAwarded: Boolean(session.satelliteAwarded),
      satelliteName: session.satelliteName || '',
    })
  } catch {
    if (isEdit.value) alert.show('대회 결과를 불러오지 못했습니다.', 'error')
  }
})

const selectResult = (result) => {
  form.result = result
  if (!canReceiveAward.value) {
    form.prize = ''
    form.satelliteAwarded = false
    form.satelliteName = ''
  }
}

const toggleSatellite = () => {
  if (!canReceiveAward.value) return
  form.satelliteAwarded = !form.satelliteAwarded
  if (!form.satelliteAwarded) form.satelliteName = ''
}

const formatMoneyInput = (value) => {
  const digits = String(value ?? '').replace(/\D/g, '')
  return digits ? Number(digits).toLocaleString('ko-KR') : ''
}

const updateMoneyField = (field, event) => {
  const formatted = formatMoneyInput(event.target.value)
  form[field] = formatted
  event.target.value = formatted
}

const confirmResult = async () => {
  if (!form.result || submitting.value) return
  const tournamentId = route.query.tournamentId || runningTournament.sessionId
  if (!tournamentId) return
  const source = sourceSession.value || runningTournament
  const hasSourceSession = Boolean(sourceSession.value)
  const awardEligible = canReceiveAward.value
  const result = {
    id: tournamentId,
    tournamentName: tournamentName.value,
    playDate: tournamentDate.value,
    tournamentResult: form.result,
    finalRank: Number(form.rank) || null,
    prize: awardEligible ? Number(String(form.prize).replaceAll(',', '')) || 0 : 0,
    fieldEntries: Number(form.entries) || null,
    entries: Number(form.buyIns) || 1,
    discount: Number(String(form.discount).replaceAll(',', '')) || 0,
    notes: form.memo,
    satelliteAwarded: awardEligible && form.satelliteAwarded,
    satelliteName: awardEligible && form.satelliteAwarded ? form.satelliteName : '',
  }
  const savedResults = (() => {
    try {
      return JSON.parse(localStorage.getItem('pokerly-tournament-results')) || []
    } catch {
      return []
    }
  })()
  const resultIndex = savedResults.findIndex((item) => String(item.id) === String(tournamentId))
  if (resultIndex >= 0) savedResults[resultIndex] = result
  else savedResults.unshift(result)
  submitting.value = true
  try {
    await updateGameSession(tournamentId, {
      venueId: source.venueId || null,
      playDate: String(tournamentDate.value).replaceAll('.', '-'),
      sessionType: source.sessionType || (source.venueId ? 'VENUE' : 'OTHER'),
      gameType: source.gameType || 'TOURNAMENT',
      tournamentName: tournamentName.value,
      tournamentResult: form.result,
      startLevel: source.startLevel,
      currentLevel: source.currentLevel,
      buyInPerEntry: hasSourceSession
        ? source.buyInPerEntry
        : Number(String(runningTournament.buyIn || '').replaceAll(',', '')) || null,
      entries: result.entries,
      discount: result.discount,
      prize: result.prize,
      satelliteAwarded: result.satelliteAwarded,
      satelliteName: result.satelliteName,
      notes: result.notes,
      gtdAmount: source.gtdAmount ?? null,
      fieldEntries: result.fieldEntries,
      isCollab: Boolean(source.isCollab),
      collabLabel: source.collabLabel || null,
      handLogEventId: hasSourceSession ? source.handLogEventId : runningTournament.eventId || null,
      tournamentStatus: 'COMPLETED',
      startingStack: hasSourceSession
        ? source.startingStack
        : Number(String(runningTournament.startingStack || '').replaceAll(',', '')) || null,
      currentStack: hasSourceSession
        ? source.currentStack
        : Number(String(runningTournament.currentStack || '').replaceAll(',', '')) || null,
      averageStack: hasSourceSession
        ? source.averageStack
        : Number(String(runningTournament.averageStack || '').replaceAll(',', '')) || null,
      currentSmallBlind: hasSourceSession
        ? source.currentSmallBlind
        : Number(String(runningTournament.currentBlinds?.smallBlind || '').replaceAll(',', '')) ||
          null,
      currentBigBlind: hasSourceSession
        ? source.currentBigBlind
        : Number(String(runningTournament.currentBlinds?.bigBlind || '').replaceAll(',', '')) ||
          null,
      currentAnte: hasSourceSession
        ? source.currentAnte
        : Number(String(runningTournament.currentBlinds?.ante || '').replaceAll(',', '')) || null,
      finalRank: result.finalRank,
    })
    localStorage.setItem('pokerly-tournament-results', JSON.stringify(savedResults))
    localStorage.setItem('pokerly-last-tournament-result', JSON.stringify(result))
  } catch {
    alert.show('대회 결과를 저장하지 못했습니다.', 'error')
    return
  } finally {
    submitting.value = false
  }
  router.replace(`/app/tournament/${tournamentId}/summary`)
}

const goBack = () => {
  router.push({ name: 'home' })
}
</script>

<style scoped>
.finish-page {
  display: grid;
  align-content: start;
  gap: 20px;
  min-height: 100%;
  padding: var(--v2-page-padding-top) var(--v2-page-padding-x) 180px;
}

.finish-topbar {
  display: grid;
  grid-template-columns: 40px minmax(0, 1fr) 40px;
  align-items: center;
  min-height: 36px;
}

.finish-topbar button {
  display: grid;
  width: 36px;
  height: 36px;
  place-items: center;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--v2-text-main);
}

.finish-topbar h1 {
  margin: 0;
  color: var(--v2-text-main);
  font-size: 21px;
  font-weight: 650;
  line-height: 1.2;
  text-align: center;
}

.tournament-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 2px 2px 16px;
  border-bottom: 1px solid var(--v2-border);
}

.tournament-heading strong {
  color: var(--v2-text-main);
  font-size: 19px;
  font-weight: 600;
}

.tournament-heading span {
  color: var(--v2-text-sub);
  font-size: 13px;
}

.result-section,
.extra-section {
  display: grid;
  gap: 12px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 7px;
}

.section-title h2 {
  margin: 0;
  color: var(--v2-text-main);
  font-size: 16px;
  font-weight: 600;
}

.section-title > span {
  padding: 4px 7px;
  border-radius: 6px;
  background: var(--v2-primary-soft);
  color: var(--v2-primary);
  font-size: 10px;
  font-weight: 600;
}

.section-title small {
  color: var(--v2-text-sub);
  font-size: 12px;
  font-weight: 430;
}

.result-options {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 8px;
}

.result-options button {
  display: grid;
  min-width: 0;
  min-height: 104px;
  place-items: center;
  align-content: center;
  gap: 10px;
  padding: 9px 3px;
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-lg);
  background: #ffffff;
  color: #8a8498;
  font: inherit;
}

.result-options strong {
  overflow: hidden;
  max-width: 100%;
  font-size: 13px;
  font-weight: 560;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.result-options button.selected {
  border-color: var(--v2-primary);
  background: #fbf9ff;
  box-shadow: 0 5px 14px rgba(109, 69, 232, 0.08);
  color: var(--v2-primary);
}

.field-list {
  overflow: hidden;
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-lg);
  background: #ffffff;
}

.field-row {
  display: grid;
  grid-template-columns: 94px minmax(0, 1fr) 26px;
  align-items: center;
  min-height: 58px;
  padding: 0 14px;
}

.field-row + .field-row {
  border-top: 1px solid var(--v2-border);
}

.field-row > span {
  color: var(--v2-text-main);
  font-size: 13px;
  font-weight: 520;
}
.field-row > span small {
  margin-left: 4px;
  color: var(--v2-text-sub);
  font-size: 10px;
  font-weight: 430;
}

.field-row input,
.field-row textarea {
  width: 100%;
  min-width: 0;
  padding: 0 10px;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--v2-text-main);
  font: inherit;
  font-size: 13px;
}

.field-row input::placeholder,
.field-row textarea::placeholder {
  color: #b5afc3;
}
.field-row.disabled > span,
.field-row.disabled input {
  color: #b5afc3;
}

.field-row em {
  justify-self: end;
  color: var(--v2-text-main);
  font-size: 12px;
  font-style: normal;
  font-weight: 520;
}
.satellite-toggle-row {
  grid-template-columns: 94px minmax(0, 1fr);
}
.satellite-toggle-row > button {
  display: flex;
  width: 62px;
  height: 32px;
  align-items: center;
  justify-self: end;
  gap: 5px;
  padding: 3px 7px 3px 4px;
  border: 0;
  border-radius: 999px;
  background: #efedf4;
  color: var(--v2-text-sub);
  font: inherit;
}
.satellite-toggle-row > button i {
  width: 26px;
  height: 26px;
  flex: 0 0 26px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 1px 4px rgba(28, 18, 60, 0.16);
  transition: transform 0.18s ease;
}
.satellite-toggle-row > button b {
  flex: 1;
  font-size: 9px;
  font-weight: 650;
}
.satellite-toggle-row > button.active {
  padding-right: 4px;
  padding-left: 7px;
  background: var(--v2-primary);
  color: #fff;
}
.satellite-toggle-row > button.active i {
  order: 2;
}
.satellite-toggle-row > button.active b {
  order: 1;
}
.satellite-toggle-row > button:disabled {
  cursor: not-allowed;
  opacity: 0.58;
}

.buy-in-row {
  grid-template-columns: 94px minmax(0, 1fr) 26px;
}

.stepper {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 16px;
  padding-right: 10px;
}

.stepper button {
  display: grid;
  width: 38px;
  height: 38px;
  place-items: center;
  padding: 0;
  border: 0;
  border-radius: var(--v2-radius-sm);
  background: #f5f3fa;
  color: var(--v2-text-main);
}

.stepper button:disabled {
  color: #c8c3d2;
}

.stepper strong {
  min-width: 18px;
  color: var(--v2-text-main);
  font-size: 14px;
  font-weight: 560;
  text-align: center;
}

.memo-row {
  position: relative;
  min-height: 78px;
  align-items: start;
  padding-top: 17px;
  padding-bottom: 12px;
}

.memo-row textarea {
  min-height: 48px;
  resize: none;
  line-height: 1.45;
}

.memo-row small {
  position: absolute;
  right: 14px;
  bottom: 9px;
  color: var(--v2-text-sub);
  font-size: 10px;
}

@media (max-width: 360px) {
  .result-options {
    gap: 6px;
  }

  .result-options button {
    min-height: 96px;
  }

  .result-options strong {
    font-size: 11px;
  }
}
</style>
