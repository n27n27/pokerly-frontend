<template>
  <q-page class="management-page">
    <header class="page-header">
      <button type="button" aria-label="뒤로 가기" @click="router.back()">
        <q-icon name="chevron_left" />
      </button>
      <h1>매장·플레이어 관리</h1>
      <span aria-hidden="true"></span>
    </header>

    <div class="data-tabs" role="tablist" aria-label="저장 데이터 종류">
      <button
        v-for="item in tabs"
        :key="item.value"
        type="button"
        role="tab"
        :aria-selected="tab === item.value"
        :class="{ active: tab === item.value }"
        @click="tab = item.value"
      >
        {{ item.label }}
        <small>{{ item.value === 'venues' ? venues.length : players.length }}</small>
      </button>
    </div>

    <div class="search-field">
      <q-icon name="search" size="19px" />
      <input v-model="keyword" :placeholder="`${activeLabel} 검색`" />
      <button v-if="keyword" type="button" aria-label="검색어 지우기" @click="keyword = ''">
        <q-icon name="cancel" size="17px" />
      </button>
    </div>

    <section class="list-section">
      <div v-if="loading" class="empty-card">불러오는 중...</div>
      <div v-else-if="filteredItems.length === 0" class="empty-card">
        <q-icon :name="tab === 'venues' ? 'storefront' : 'group'" size="30px" />
        <strong>{{
          keyword ? '검색 결과가 없습니다.' : `저장된 ${activeLabel} 정보가 없습니다.`
        }}</strong>
      </div>
      <div v-else class="data-list">
        <button v-for="item in filteredItems" :key="item.id" type="button" @click="openEdit(item)">
          <span class="item-copy">
            <strong>{{ item.name || item.nickname }}</strong>
            <small>{{ itemDescription(item) }}</small>
            <em v-if="itemMeta(item)">{{ itemMeta(item) }}</em>
          </span>
          <q-icon name="chevron_right" class="chevron" />
        </button>
      </div>
    </section>

    <q-dialog v-model="editorOpen" position="bottom">
      <q-card class="editor-sheet">
        <div class="sheet-handle"></div>
        <header>
          <h2>{{ tab === 'venues' ? '매장 수정' : '플레이어 수정' }}</h2>
        </header>

        <div v-if="tab === 'venues'" class="form-body">
          <label><span>매장명</span><input v-model="venueForm.name" /></label>
          <label
            ><span>지역 <small>선택</small></span
            ><input v-model="venueForm.location" placeholder="예) 서울 강남"
          /></label>
          <label
            ><span>포인트 잔액</span
            ><input
              :value="venueForm.pointBalance"
              inputmode="numeric"
              class="number-input"
              @input="formatPointInput"
          /></label>
          <label
            ><span>메모 <small>선택</small></span
            ><textarea v-model="venueForm.notes" rows="3"></textarea>
          </label>
        </div>

        <div v-else class="form-body">
          <label><span>닉네임</span><input v-model="playerForm.nickname" /></label>
          <fieldset>
            <legend>핸드 선택</legend>
            <div class="chips">
              <button
                v-for="value in handSelections"
                :key="value"
                type="button"
                :class="{ selected: playerForm.handSelection === value }"
                @click="toggleSingle('handSelection', value)"
              >
                {{ value }}
              </button>
            </div>
          </fieldset>
          <fieldset>
            <legend>공격성</legend>
            <div class="chips">
              <button
                v-for="value in aggressions"
                :key="value"
                type="button"
                :class="{ selected: playerForm.aggression === value }"
                @click="toggleSingle('aggression', value)"
              >
                {{ value }}
              </button>
            </div>
          </fieldset>
          <fieldset>
            <legend>플레이 유형 <small>중복 선택</small></legend>
            <div class="chips">
              <button
                v-for="value in playerTypes"
                :key="value"
                type="button"
                :class="{ selected: playerForm.types.includes(value) }"
                @click="toggleArray(playerForm.types, value)"
              >
                {{ value }}
              </button>
            </div>
          </fieldset>
          <fieldset>
            <legend>공략 포인트 <small>중복 선택</small></legend>
            <div class="chips">
              <button
                v-for="value in exploitPoints"
                :key="value"
                type="button"
                :class="{ selected: playerForm.exploitPoints.includes(value) }"
                @click="toggleArray(playerForm.exploitPoints, value)"
              >
                {{ value }}
              </button>
            </div>
          </fieldset>
          <label
            ><span>메모 <small>선택</small></span
            ><textarea v-model="playerForm.memo" rows="3"></textarea>
          </label>
        </div>

        <footer>
          <button class="delete-button" type="button" :disabled="saving" @click="confirmDelete">
            삭제
          </button>
          <button class="save-button" type="button" :disabled="saving" @click="save">
            {{ saving ? '저장 중...' : '수정하기' }}
          </button>
        </footer>
      </q-card>
    </q-dialog>

    <q-dialog v-model="deleteDialog">
      <div class="delete-confirm" @click.stop>
        <h2>{{ activeLabel }} 정보 삭제</h2>
        <p>{{ deleteMessage }}</p>
        <div>
          <button type="button" v-close-popup>취소</button>
          <button class="danger" type="button" @click="remove">삭제</button>
        </div>
      </div>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import {
  deleteTournamentPlayer,
  fetchTournamentPlayers,
  updateTournamentPlayer,
} from 'src/api/tournamentParticipant'
import { deleteVenue, fetchVenues, updateVenue } from 'src/api/venue'
import { useAlert } from 'src/composables/useAlert'

const router = useRouter()
const alert = useAlert()
const tab = ref('venues')
const keyword = ref('')
const venues = ref([])
const players = ref([])
const loading = ref(true)
const saving = ref(false)
const editorOpen = ref(false)
const deleteDialog = ref(false)
const selectedId = ref(null)
const tabs = [
  { value: 'venues', label: '매장' },
  { value: 'players', label: '플레이어' },
]
const handSelections = ['타이트', '보통', '루즈']
const aggressions = ['소극적', '보통', '공격적']
const playerTypes = ['콜링 스테이션', '니트', '매니악']
const exploitPoints = [
  '림프 자주',
  '3베팅 자주',
  '트래피',
  '블러프 자주',
  '체크레이즈 자주',
  '슬로우플레이 자주',
  '틸트 잘 함',
  '콜다운 심함',
  '쉽게 폴드',
]
const venueForm = reactive({ name: '', location: '', pointBalance: '', notes: '' })
const playerForm = reactive({
  nickname: '',
  handSelection: '',
  aggression: '',
  types: [],
  exploitPoints: [],
  memo: '',
})

const activeLabel = computed(() => (tab.value === 'venues' ? '매장' : '플레이어'))
const filteredItems = computed(() => {
  const list = tab.value === 'venues' ? venues.value : players.value
  const query = keyword.value.trim().toLocaleLowerCase('ko')
  if (!query) return list
  return list.filter((item) =>
    `${item.name || item.nickname} ${item.location || ''}`.toLocaleLowerCase('ko').includes(query),
  )
})
const deleteMessage = computed(() =>
  tab.value === 'venues'
    ? '게임 기록이 연결되지 않은 매장만 삭제할 수 있습니다. 연결된 기록은 영향을 받지 않습니다.'
    : '저장 목록에서 삭제합니다. 기존 좌석과 핸드 기록에 저장된 정보는 유지됩니다.',
)

watch(tab, () => {
  keyword.value = ''
  editorOpen.value = false
})
onMounted(async () => {
  try {
    const [venueList, playerList] = await Promise.all([fetchVenues(), fetchTournamentPlayers()])
    venues.value = venueList || []
    players.value = playerList || []
  } catch {
    alert.show('저장 데이터를 불러오지 못했습니다.', 'error')
  } finally {
    loading.value = false
  }
})

const formatNumber = (value) => Number(value || 0).toLocaleString('ko-KR')
const itemDescription = (item) => {
  if (tab.value === 'venues') return item.location || '지역 정보 없음'
  const tags = [item.handSelection, item.aggression, ...(item.types || [])].filter(Boolean)
  return tags.length ? tags.join(' · ') : '성향 정보 없음'
}
const itemMeta = (item) => {
  if (tab.value === 'venues') {
    const values = [`포인트 ${formatNumber(item.pointBalance)}`]
    if (item.notes) values.push('메모 있음')
    return values.join(' · ')
  }
  const values = []
  if (item.exploitPoints?.length) values.push(`공략 포인트 ${item.exploitPoints.length}개`)
  if (item.memo) values.push('메모 있음')
  return values.join(' · ')
}
const openEdit = (item) => {
  selectedId.value = item.id
  if (tab.value === 'venues')
    Object.assign(venueForm, {
      name: item.name || '',
      location: item.location || '',
      pointBalance: formatNumber(item.pointBalance),
      notes: item.notes || '',
    })
  else
    Object.assign(playerForm, {
      nickname: item.nickname || '',
      handSelection: item.handSelection || '',
      aggression: item.aggression || '',
      types: [...(item.types || [])],
      exploitPoints: [...(item.exploitPoints || [])],
      memo: item.memo || '',
    })
  editorOpen.value = true
}
const toggleSingle = (key, value) => {
  playerForm[key] = playerForm[key] === value ? '' : value
}
const toggleArray = (array, value) => {
  const index = array.indexOf(value)
  index >= 0 ? array.splice(index, 1) : array.push(value)
}
const formatPointInput = (event) => {
  const digits = event.target.value.replace(/[^0-9]/g, '')
  venueForm.pointBalance = digits ? Number(digits).toLocaleString('ko-KR') : ''
  event.target.value = venueForm.pointBalance
}
const parsePoint = () => Number(String(venueForm.pointBalance || 0).replaceAll(',', '')) || 0
const save = async () => {
  const name = tab.value === 'venues' ? venueForm.name.trim() : playerForm.nickname.trim()
  if (!name) {
    alert.show(
      `${activeLabel.value}${tab.value === 'venues' ? '명' : ' 닉네임'}을 입력해 주세요.`,
      'warning',
    )
    return
  }
  saving.value = true
  try {
    if (tab.value === 'venues') {
      const updated = await updateVenue(selectedId.value, {
        name,
        location: venueForm.location.trim() || null,
        notes: venueForm.notes.trim() || null,
        pointBalance: parsePoint(),
      })
      venues.value = venues.value.map((item) => (item.id === updated.id ? updated : item))
    } else {
      const updated = await updateTournamentPlayer(selectedId.value, {
        nickname: name,
        handSelection: playerForm.handSelection || null,
        aggression: playerForm.aggression || null,
        types: playerForm.types,
        exploitPoints: playerForm.exploitPoints,
        memo: playerForm.memo.trim() || null,
      })
      players.value = players.value.map((item) => (item.id === updated.id ? updated : item))
    }
    editorOpen.value = false
    alert.show('정보를 수정했습니다.', 'success')
  } catch (error) {
    alert.show(error.response?.data?.error?.message || '정보를 수정하지 못했습니다.', 'error')
  } finally {
    saving.value = false
  }
}
const confirmDelete = () => {
  deleteDialog.value = true
}
const remove = async () => {
  saving.value = true
  try {
    if (tab.value === 'venues') {
      await deleteVenue(selectedId.value)
      venues.value = venues.value.filter((item) => item.id !== selectedId.value)
    } else {
      await deleteTournamentPlayer(selectedId.value)
      players.value = players.value.filter((item) => item.id !== selectedId.value)
    }
    deleteDialog.value = false
    editorOpen.value = false
    alert.show('저장 목록에서 삭제했습니다.', 'success')
  } catch (error) {
    deleteDialog.value = false
    alert.show(error.response?.data?.error?.message || '삭제하지 못했습니다.', 'error')
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.management-page {
  min-height: 100%;
  padding: var(--v2-page-padding-top) var(--v2-page-padding-x) 92px;
  color: var(--v2-text-main);
}
.management-page * {
  box-sizing: border-box;
}
.management-page > .page-header {
  position: sticky;
  z-index: 20;
  top: var(--v2-page-padding-top);
  display: grid;
  height: 36px;
  min-height: 36px;
  grid-template-columns: 40px minmax(0, 1fr) 40px;
  align-items: center;
  background: var(--v2-page-bg);
}
.page-header button {
  display: grid;
  width: 36px;
  height: 36px;
  place-items: center;
  padding: 0;
  border: 0;
  background: transparent;
  color: inherit;
}
.page-header .q-icon {
  font-size: 28px;
}
.page-header h1 {
  margin: 0;
  font-size: 21px;
  font-weight: 650;
  line-height: 1.2;
  text-align: center;
}
.data-tabs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  margin-top: 12px;
  padding: 4px;
  border-radius: 14px;
  background: #efedf5;
}
.data-tabs button {
  height: 42px;
  border: 0;
  border-radius: 11px;
  background: transparent;
  color: var(--v2-text-sub);
  font: inherit;
  font-size: 14px;
  font-weight: 620;
}
.data-tabs button.active {
  background: #fff;
  color: var(--v2-primary);
  box-shadow: 0 2px 8px rgba(31, 22, 52, 0.08);
}
.data-tabs small {
  margin-left: 3px;
  font-size: 11px;
}
.search-field {
  display: grid;
  height: 46px;
  grid-template-columns: 24px 1fr 28px;
  align-items: center;
  gap: 5px;
  margin-top: 14px;
  padding: 0 12px;
  border: 1px solid var(--v2-border);
  border-radius: 14px;
  background: #fff;
  color: var(--v2-text-sub);
}
.search-field input {
  min-width: 0;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--v2-text-main);
  font: inherit;
  font-size: 14px;
}
.search-field button {
  border: 0;
  background: transparent;
  color: var(--v2-text-sub);
}
.list-section {
  margin-top: 16px;
}
.empty-card {
  display: grid;
  min-height: 180px;
  place-items: center;
  align-content: center;
  gap: 10px;
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-lg);
  background: #fff;
  color: var(--v2-text-sub);
  font-size: 13px;
}
.data-list {
  overflow: hidden;
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-lg);
  background: #fff;
}
.data-list > button {
  display: grid;
  width: 100%;
  min-height: 68px;
  grid-template-columns: minmax(0, 1fr) 24px;
  align-items: center;
  gap: 11px;
  padding: 12px 15px;
  border: 0;
  border-bottom: 1px solid var(--v2-border);
  background: #fff;
  color: inherit;
  font: inherit;
  text-align: left;
}
.data-list > button:last-child {
  border-bottom: 0;
}
.item-copy {
  display: grid;
  min-width: 0;
  gap: 3px;
}
.item-copy strong,
.item-copy small,
.item-copy em {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.item-copy strong {
  font-size: 14px;
}
.item-copy small {
  color: var(--v2-text-sub);
  font-size: 11px;
}
.item-copy em {
  color: var(--v2-primary);
  font-size: 10px;
  font-style: normal;
}
.chevron {
  color: var(--v2-text-sub);
  font-size: 21px;
}
.editor-sheet {
  width: min(100%, 430px);
  max-height: 88vh;
  padding: 8px 16px calc(16px + env(safe-area-inset-bottom));
  border-radius: 24px 24px 0 0;
}
.sheet-handle {
  width: 38px;
  height: 4px;
  margin: 0 auto 10px;
  border-radius: 3px;
  background: #bbb5ce;
}
.editor-sheet > header {
  padding: 4px 0 18px;
}
.editor-sheet h2 {
  margin: 0;
  font-size: 17px;
  font-weight: 680;
  line-height: 1.35;
}
.form-body {
  display: grid;
  max-height: 61vh;
  gap: 15px;
  overflow-y: auto;
  padding: 2px 1px 16px;
}
.form-body label {
  display: grid;
  gap: 7px;
}
.form-body label > span,
fieldset legend {
  font-size: 12px;
  font-weight: 620;
}
.form-body small,
fieldset small {
  color: var(--v2-text-sub);
  font-weight: 450;
}
.form-body input,
.form-body textarea {
  width: 100%;
  padding: 12px 13px;
  border: 1px solid var(--v2-border);
  border-radius: 12px;
  outline: 0;
  background: #fbfaff;
  color: var(--v2-text-main);
  font: inherit;
  font-size: 14px;
}
.form-body input:focus,
.form-body textarea:focus {
  border-color: var(--v2-primary);
}
.form-body textarea {
  resize: none;
}
.number-input {
  text-align: right;
}
fieldset {
  display: grid;
  gap: 8px;
  margin: 0;
  padding: 0;
  border: 0;
}
.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
}
.chips button {
  min-height: 34px;
  padding: 0 11px;
  border: 1px solid var(--v2-border);
  border-radius: 999px;
  background: #fff;
  color: var(--v2-text-sub);
  font: inherit;
  font-size: 12px;
}
.chips button.selected {
  border-color: var(--v2-primary);
  background: var(--v2-primary-soft);
  color: var(--v2-primary);
  font-weight: 620;
}
.editor-sheet > footer {
  display: grid;
  grid-template-columns: 92px 1fr;
  gap: 9px;
  padding-top: 10px;
  border-top: 1px solid var(--v2-border);
}
.editor-sheet > footer button {
  height: 48px;
  border-radius: 13px;
  font: inherit;
  font-size: 14px;
  font-weight: 650;
}
.delete-button {
  border: 1px solid #ffd1d1;
  background: #fff;
  color: #ed4b4b;
}
.save-button {
  border: 0;
  background: var(--v2-primary);
  color: #fff;
}
.confirm-card {
  width: min(calc(100vw - 48px), 340px);
  padding: 22px;
  border-radius: 18px;
}
.confirm-card h2 {
  margin: 0;
  font-size: 17px;
}
.confirm-card p {
  margin: 12px 0 20px;
  color: var(--v2-text-sub);
  font-size: 13px;
  line-height: 1.55;
}
.confirm-card > div {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
.confirm-card button {
  height: 42px;
  border: 0;
  border-radius: 11px;
  background: #f1eff6;
  font: inherit;
  font-weight: 620;
}
.confirm-card button.danger {
  color: var(--v2-danger);
}

.delete-confirm {
  width: min(calc(100vw - 40px), 360px);
  padding: 24px;
  border-radius: var(--v2-radius-lg);
  background: #ffffff;
}

.delete-confirm h2 {
  margin: 0;
  color: var(--v2-text-main);
  font-size: 19px;
  font-weight: 620;
}

.delete-confirm p {
  margin: 10px 0 22px;
  color: var(--v2-text-sub);
  font-size: 14px;
}

.delete-confirm > div {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.delete-confirm button {
  height: 44px;
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-sm);
  background: #ffffff;
  color: var(--v2-text-main);
  font: inherit;
  font-size: 14px;
  font-weight: 560;
}

.delete-confirm button.danger {
  border-color: var(--v2-danger);
  color: var(--v2-danger);
}
</style>
