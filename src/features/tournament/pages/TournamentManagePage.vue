<template>
  <q-page class="manage-page" @click="closePageMenus">
    <div
      v-if="seatMenuNumber"
      class="seat-menu-dismiss-layer"
      aria-hidden="true"
      @click.stop="seatMenuNumber = null"
    ></div>

    <header class="manage-topbar">
      <button type="button" aria-label="뒤로 가기" @click="router.back()">
        <q-icon name="chevron_left" size="28px" />
      </button>
      <h1>대회 관리</h1>
      <span aria-hidden="true"></span>
    </header>

    <section class="tournament-card">
      <div class="tournament-card__head">
        <div class="tournament-card__title-row">
          <strong>{{ tournament.name }}</strong>
          <button
            class="tournament-menu-button"
            type="button"
            aria-label="대회 메뉴"
            @click.stop="tournamentMenuOpen = !tournamentMenuOpen"
          >
            <q-icon name="more_vert" size="22px" />
          </button>
          <div v-if="tournamentMenuOpen" class="tournament-menu" @click.stop>
            <button type="button" @click="openTournamentEdit">수정</button>
            <button class="destructive" type="button" @click="requestTournamentDelete">
              대회 삭제
            </button>
          </div>
        </div>
        <dl>
          <div>
            <dt>바인 금액</dt>
            <dd>{{ tournament.buyIn || '-' }}</dd>
          </div>
          <div>
            <dt>엔트리 총 개수</dt>
            <dd>{{ tournament.totalBuyIns }}개</dd>
          </div>
          <div>
            <dt>할인 금액</dt>
            <dd>{{ tournament.discountAmount || '0' }}</dd>
          </div>
        </dl>
      </div>
      <button class="memo-row" type="button">
        <span>대회 메모</span>
        <strong>{{ tournament.memo || '-' }}</strong>
      </button>
    </section>

    <section class="seat-section">
      <div class="section-header">
        <h2>좌석별 플레이어</h2>
        <div class="section-header__actions">
          <button type="button" @click="tableSizeSheetOpen = true">
            {{ tournament.tableMaxPlayers }}명
            <q-icon name="expand_more" size="16px" />
          </button>
          <button type="button" @click="resetSeats">
            <q-icon name="refresh" size="15px" />
            전체 초기화
          </button>
        </div>
      </div>

      <button class="my-seat-button" type="button" @click="mySeatSheetOpen = true">
        <span>내 자리</span>
        <strong>{{ mySeatNumber ? `${mySeatNumber}번` : '선택하세요' }}</strong>
        <q-icon name="expand_more" size="19px" />
      </button>

      <div class="seat-list">
        <div
          v-for="seat in seats"
          :key="seat.number"
          class="seat-row"
          :class="{
            mine: seat.mine,
            empty: seat.empty,
            inactive: !seat.active,
            'menu-open': seatMenuNumber === seat.number,
          }"
          :role="seat.empty ? 'button' : undefined"
          :tabindex="seat.empty ? 0 : undefined"
          @click="handleSeatRowClick(seat)"
          @keydown.enter="handleSeatRowClick(seat)"
        >
          <span class="seat-badge">S{{ seat.number }}</span>
          <span class="seat-copy">
            <span class="seat-copy__name">
              <strong>{{ seat.nickname }}</strong>
              <small v-if="seat.mine">내 자리</small>
              <small v-else-if="seat.saved">등록됨</small>
            </span>
            <span
              v-if="prioritizedTags(seat).length"
              class="seat-tags"
              :class="{ expanded: expandedSeatNumber === seat.number }"
              :role="expandedSeatNumber === seat.number ? 'button' : undefined"
              :tabindex="expandedSeatNumber === seat.number ? 0 : undefined"
              @click.stop="
                expandedSeatNumber === seat.number ? toggleSeatTags(seat) : undefined
              "
              @keydown.enter.stop="
                expandedSeatNumber === seat.number ? toggleSeatTags(seat) : undefined
              "
            >
              <span
                v-for="tag in visibleSeatTags(seat)"
                :key="tag"
                class="seat-tag type"
              >
                {{ tag }}
              </span>
              <button
                v-if="
                  prioritizedTags(seat).length > 2 &&
                  expandedSeatNumber !== seat.number
                "
                class="seat-tag count"
                type="button"
                :aria-expanded="expandedSeatNumber === seat.number"
                @click.stop="toggleSeatTags(seat)"
              >
                +{{ prioritizedTags(seat).length - 2 }}
              </button>
            </span>
            <small
              v-if="!seat.empty && !seat.mine && tendencySummary(seat)"
              class="seat-copy__tendency"
            >
              {{ tendencySummary(seat) }}
            </small>
            <small v-if="!seat.empty && !seat.mine" class="seat-copy__memo">
              {{ seat.memo || '관찰 메모 없음' }}
            </small>
          </span>
          <span class="seat-row__action">
            <button
              v-if="!seat.empty && !seat.mine"
              type="button"
              aria-label="좌석 메뉴"
              @click.stop="seatMenuNumber = seatMenuNumber === seat.number ? null : seat.number"
            >
              <q-icon name="more_vert" size="20px" />
            </button>
            <q-icon v-else class="seat-expand" name="chevron_right" size="20px" />
            <span v-if="seatMenuNumber === seat.number" class="seat-row__menu" @click.stop>
              <button type="button" @click="editParticipantFromMenu(seat)">수정</button>
              <button
                v-if="seat.saved"
                class="destructive"
                type="button"
                @click="requestRemoveFromPlayerList(seat)"
              >
                플레이어 목록에서 제거
              </button>
              <button v-else type="button" @click="saveSeatToPlayerList(seat)">
                플레이어 목록에 저장
              </button>
              <button class="destructive" type="button" @click="requestVacateSeat(seat)">
                좌석에서 제거
              </button>
            </span>
          </span>
        </div>
      </div>
    </section>

    <q-dialog v-model="editSheetOpen" position="bottom">
      <q-card class="tournament-edit-sheet">
        <div class="tournament-edit-sheet__handle" aria-hidden="true"></div>
        <h2>대회 정보 수정</h2>

        <label>
          <span>대회 이름</span>
          <input v-model="editForm.name" maxlength="50" />
        </label>

        <label>
          <span>바인 금액</span>
          <input
            :value="editForm.buyIn"
            inputmode="numeric"
            @input="setNumberField('buyIn', $event)"
          />
        </label>

        <label>
          <span>엔트리 총 개수</span>
          <input
            :value="editForm.totalBuyIns"
            inputmode="numeric"
            @input="setNumberField('totalBuyIns', $event, false)"
          />
        </label>

        <label>
          <span>할인 금액</span>
          <input
            :value="editForm.discountAmount"
            inputmode="numeric"
            @input="setNumberField('discountAmount', $event)"
          />
        </label>

        <label>
          <span>대회 메모</span>
          <textarea v-model="editForm.memo" rows="3"></textarea>
        </label>

        <button class="tournament-edit-sheet__save" type="button" @click="saveTournamentEdit">
          저장
        </button>
      </q-card>
    </q-dialog>

    <q-dialog v-model="participantSheetOpen" position="bottom">
      <q-card class="participant-sheet">
        <div class="participant-sheet__handle" aria-hidden="true"></div>
        <div class="participant-sheet__title">
          <div>
            <small>{{ participantForm.seatNumber }}번 좌석</small>
          </div>
        </div>

        <button
          v-if="participantForm.isNew"
          class="saved-player-search"
          type="button"
          @click="openPlayerPicker"
        >
          <q-icon name="search" size="19px" />
          기존 플레이어 선택
        </button>

        <div v-if="participantForm.isNew" class="participant-divider">
          <span>또는 새 플레이어 입력</span>
        </div>

        <label>
          <span>닉네임 <small class="required-label">필수</small></span>
          <input
            v-model="participantForm.nickname"
            placeholder="플레이어를 구분할 이름을 입력하세요."
          />
        </label>

        <fieldset class="profile-fieldset">
          <legend>플레이 성향 <small>각 항목에서 하나만 선택</small></legend>
          <span class="profile-group-label">핸드 선택</span>
          <div class="participant-tags participant-tags--radio" role="radiogroup" aria-label="핸드 선택">
            <button
              v-for="item in handSelectionOptions"
              :key="item"
              type="button"
              role="radio"
              :aria-checked="participantForm.handSelection === item"
              :class="{ selected: participantForm.handSelection === item }"
              @click="selectOptionalTendency('handSelection', item)"
            >
              {{ item }}
            </button>
          </div>
          <span class="profile-group-label">공격성</span>
          <div class="participant-tags participant-tags--radio" role="radiogroup" aria-label="공격성">
            <button
              v-for="item in playStyleOptions"
              :key="item"
              type="button"
              role="radio"
              :aria-checked="participantForm.aggression === item"
              :class="{ selected: participantForm.aggression === item }"
              @click="selectOptionalTendency('aggression', item)"
            >
              {{ item }}
            </button>
          </div>
        </fieldset>

        <fieldset class="profile-fieldset">
          <legend>플레이 유형 <small>중복 선택 가능</small></legend>
          <div class="participant-tags">
            <button
              v-for="item in playerTypeOptions"
              :key="item"
              type="button"
              :class="{ selected: participantForm.types.includes(item) }"
              @click="toggleSelection(participantForm.types, item)"
            >
              {{ item }}
            </button>
          </div>
        </fieldset>

        <fieldset class="profile-fieldset">
          <legend>공략 포인트 <small>중복 선택 가능</small></legend>
          <span class="profile-group-label">프리플랍</span>
          <div class="participant-tags participant-tags--points">
            <button
              v-for="item in preflopFeatureOptions"
              :key="item"
              type="button"
              :class="{ selected: participantForm.exploitPoints.includes(item) }"
              @click="toggleSelection(participantForm.exploitPoints, item)"
            >
              {{ item }}
            </button>
          </div>
          <span class="profile-group-label">포스트플랍</span>
          <div class="participant-tags participant-tags--points">
            <button
              v-for="item in postflopFeatureOptions"
              :key="item"
              type="button"
              :class="{ selected: participantForm.exploitPoints.includes(item) }"
              @click="toggleSelection(participantForm.exploitPoints, item)"
            >
              {{ item }}
            </button>
          </div>
          <span class="profile-group-label">대응 포인트</span>
          <div class="participant-tags participant-tags--points">
            <button
              v-for="item in otherFeatureOptions"
              :key="item"
              type="button"
              :class="{ selected: participantForm.exploitPoints.includes(item) }"
              @click="toggleSelection(participantForm.exploitPoints, item)"
            >
              {{ item }}
            </button>
          </div>
        </fieldset>

        <label>
          <span>메모</span>
          <textarea v-model="participantForm.memo" rows="3"></textarea>
        </label>

        <div class="participant-sheet__sticky-action">
          <button
            class="participant-sheet__save"
            type="button"
            :disabled="!participantForm.nickname.trim()"
            @click="saveParticipant"
          >
            {{ participantForm.isNew ? '플레이어 지정' : '수정' }}
          </button>
        </div>
      </q-card>
    </q-dialog>

    <q-dialog v-model="mySeatSheetOpen" position="bottom">
      <q-card class="my-seat-sheet">
        <div class="participant-sheet__handle" aria-hidden="true"></div>
        <h2>내 자리 선택</h2>
        <div class="my-seat-grid">
          <button
            v-for="seat in seats"
            :key="seat.number"
            type="button"
            :class="{ selected: mySeatNumber === seat.number }"
            @click="setMySeat(seat.number)"
          >
            {{ seat.number }}번
            <small v-if="!seat.empty && !seat.mine">플레이어 있음</small>
          </button>
        </div>
        <button class="my-seat-clear" type="button" @click="setMySeat('')">
          좌석 지정 안 함
        </button>
      </q-card>
    </q-dialog>

    <q-dialog v-model="tableSizeSheetOpen" position="bottom">
      <q-card class="table-size-sheet">
        <div class="participant-sheet__handle" aria-hidden="true"></div>
        <h2>테이블 인원</h2>
        <p>현재 테이블의 최대 좌석 수를 선택하세요.</p>
        <div class="table-size-grid">
          <button
            v-for="count in tableSizeOptions"
            :key="count"
            type="button"
            :class="{ selected: tournament.tableMaxPlayers === count }"
            @click="changeTableMaxPlayers(count)"
          >
            {{ count }}명
          </button>
        </div>
      </q-card>
    </q-dialog>

    <q-dialog v-model="playerPickerOpen" position="bottom">
      <q-card class="player-picker-sheet">
        <div class="participant-sheet__handle" aria-hidden="true"></div>
        <h2>기존 플레이어 선택</h2>
        <input v-model="savedPlayerQuery" placeholder="플레이어 검색" />
        <div v-if="filteredRegisteredOpponents.length" class="registered-opponent-list">
          <button
            v-for="opponent in filteredRegisteredOpponents"
            :key="opponent.id"
            type="button"
            :disabled="Boolean(assignedSeatNumber(opponent.id))"
            @click="selectRegisteredOpponent(opponent)"
          >
            <span class="registered-opponent-copy">
              <strong>{{ opponent.nickname }}</strong>
              <span v-if="prioritizedTags(opponent).length" class="seat-tags">
                <span
                  v-for="tag in prioritizedTags(opponent).slice(0, 2)"
                  :key="tag"
                  class="seat-tag type"
                >
                  {{ tag }}
                </span>
                <span v-if="prioritizedTags(opponent).length > 2" class="seat-tag count">
                  +{{ prioritizedTags(opponent).length - 2 }}
                </span>
              </span>
              <small v-if="tendencySummary(opponent)">{{ tendencySummary(opponent) }}</small>
              <small>{{ opponent.memo || '관찰 메모 없음' }}</small>
            </span>
            <em v-if="assignedSeatNumber(opponent.id)">
              S{{ assignedSeatNumber(opponent.id) }} 배치 중
            </em>
          </button>
        </div>
        <p v-else class="player-picker-sheet__empty">
          {{
            registeredOpponents.length ? '검색 결과가 없습니다.' : '등록된 플레이어가 없습니다.'
          }}
        </p>
      </q-card>
    </q-dialog>

    <ConfirmDialog
      v-model="confirmSheetOpen"
      :title="confirmState.title"
      :description="confirmState.message"
      :confirm-label="confirmState.confirmLabel"
      danger
      @confirm="runConfirmedAction"
    />
  </q-page>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { deleteGameSession, fetchRunningGameSession, updateGameSession } from 'src/api/gameSession'
import { useAlert } from 'src/composables/useAlert'
import ConfirmDialog from 'src/shared/components/ConfirmDialog.vue'
import { formatLocalDate } from 'src/utils/localDate'
import {
  createTournamentPlayer,
  deleteTournamentPlayer,
  deleteTournamentSeat,
  fetchTournamentPlayers,
  fetchTournamentSeats,
  resetTournamentSeats,
  saveTournamentSeat,
  updateTournamentPlayer,
} from 'src/api/tournamentParticipant'

const router = useRouter()
const alert = useAlert()
const tournamentMenuOpen = ref(false)
const editSheetOpen = ref(false)
const participantSheetOpen = ref(false)
const mySeatSheetOpen = ref(false)
const tableSizeSheetOpen = ref(false)
const playerPickerOpen = ref(false)
const savedPlayerQuery = ref('')
const seatMenuNumber = ref(null)
const expandedSeatNumber = ref(null)
const confirmSheetOpen = ref(false)
const confirmState = reactive({
  title: '',
  message: '',
  confirmLabel: '확인',
  action: null,
})

const storedTournament = (() => {
  try {
    return JSON.parse(localStorage.getItem('pokerly-running-tournament')) || {}
  } catch {
    return {}
  }
})()

const tournament = reactive({
  ...storedTournament,
  name: storedTournament.name || '프라임 0704',
  buyIn: storedTournament.buyIn || '100,000',
  totalBuyIns: storedTournament.totalBuyIns ?? storedTournament.entries ?? 3,
  discountAmount: storedTournament.discountAmount || '',
  memo: storedTournament.memo || '',
  tableMaxPlayers: Number(storedTournament.tableMaxPlayers) || 10,
})

const editForm = reactive({
  name: '',
  buyIn: '',
  totalBuyIns: '',
  discountAmount: '',
  memo: '',
})

const participantForm = reactive({
  seatNumber: null,
  isNew: false,
  nickname: '',
  handSelection: '',
  aggression: '',
  exploitPoints: [],
  types: [],
  memo: '',
  saved: false,
  registeredId: null,
})

const handSelectionOptions = ['타이트', '보통', '루즈']
const playStyleOptions = ['소극적', '보통', '공격적']
const preflopFeatureOptions = ['림프 자주', '3베팅 자주', '트래피']
const postflopFeatureOptions = ['블러프 자주', '체크레이즈 자주', '슬로우플레이 자주']
const otherFeatureOptions = ['틸트 잘 함', '콜다운 심함', '쉽게 폴드']
const playerTypeOptions = ['콜링 스테이션', '니트', '매니악']
const tableSizeOptions = Array.from({ length: 10 }, (_, index) => index + 2)
const exploitPointPriority = [
  '3베팅 자주',
  '콜다운 심함',
  '쉽게 폴드',
  '체크레이즈 자주',
  '슬로우플레이 자주',
  '블러프 자주',
  '트래피',
  '림프 자주',
  '틸트 잘 함',
]

const tagTone = {
  타이트: 'primary',
  루즈: 'success',
  공격적: 'danger',
  소극적: 'warning',
}

const formatNumber = (value, useGrouping = true) => {
  const digits = String(value ?? '').replace(/\D/g, '')
  if (!digits) return ''
  return useGrouping ? Number(digits).toLocaleString('ko-KR') : digits
}

const setNumberField = (field, event, useGrouping = true) => {
  editForm[field] = formatNumber(event.target.value, useGrouping)
}

const applyServerSession = (session) => {
  Object.assign(tournament, {
    sessionId: session.id,
    eventId: session.handLogEventId,
    name: session.tournamentName,
    venueId: session.venueId,
    date: session.playDate,
    buyIn: formatNumber(session.buyInPerEntry),
    totalBuyIns: session.entries || 1,
    discountAmount: formatNumber(session.discount),
    memo: session.notes || '',
    startLevel: session.startLevel,
    currentLevel: session.currentLevel,
    startingStack: formatNumber(session.startingStack),
    currentStack: formatNumber(session.currentStack),
    averageStack: formatNumber(session.averageStack),
    currentBlinds: {
      smallBlind: formatNumber(session.currentSmallBlind),
      bigBlind: formatNumber(session.currentBigBlind),
      ante: formatNumber(session.currentAnte),
    },
    tableMaxPlayers: Number(session.tableMaxPlayers) || 10,
  })
}

const persistSynchronizedTournament = () => {
  const synchronizedTournament = JSON.parse(JSON.stringify(tournament))
  localStorage.setItem('pokerly-running-tournament', JSON.stringify(synchronizedTournament))
  window.dispatchEvent(
    new CustomEvent('pokerly-running-tournament-updated', {
      detail: synchronizedTournament,
    }),
  )
}

const closePageMenus = () => {
  tournamentMenuOpen.value = false
  seatMenuNumber.value = null
}

const openTournamentEdit = () => {
  Object.assign(editForm, {
    name: tournament.name,
    buyIn: tournament.buyIn,
    totalBuyIns: String(tournament.totalBuyIns),
    discountAmount: tournament.discountAmount,
    memo: tournament.memo,
  })
  tournamentMenuOpen.value = false
  editSheetOpen.value = true
}

const tournamentUpdatePayload = () => ({
  venueId: tournament.venueId || null,
  playDate: tournament.date?.replaceAll('.', '-') || formatLocalDate(),
  sessionType: tournament.venueId ? 'VENUE' : 'OTHER',
  gameType: 'TOURNAMENT',
  tournamentName: tournament.name,
  tournamentResult: null,
  startLevel: tournament.startLevel,
  currentLevel: tournament.currentLevel,
  buyInPerEntry: Number(String(tournament.buyIn || '').replaceAll(',', '')) || null,
  entries: tournament.totalBuyIns,
  discount: Number(String(tournament.discountAmount || '').replaceAll(',', '')) || 0,
  prize: 0,
  satelliteAwarded: false,
  notes: tournament.memo,
  handLogEventId: tournament.eventId,
  tournamentStatus: 'RUNNING',
  startingStack: Number(String(tournament.startingStack || '').replaceAll(',', '')) || null,
  currentStack: Number(String(tournament.currentStack || '').replaceAll(',', '')) || null,
  averageStack: Number(String(tournament.averageStack || '').replaceAll(',', '')) || null,
  currentSmallBlind: Number(String(tournament.currentBlinds?.smallBlind || '').replaceAll(',', '')) || null,
  currentBigBlind: Number(String(tournament.currentBlinds?.bigBlind || '').replaceAll(',', '')) || null,
  currentAnte: Number(String(tournament.currentBlinds?.ante || '').replaceAll(',', '')) || null,
  tableMaxPlayers: tournament.tableMaxPlayers,
})

const saveTournamentEdit = async () => {
  if (!tournament.sessionId) return

  const previous = {
    name: tournament.name,
    buyIn: tournament.buyIn,
    totalBuyIns: tournament.totalBuyIns,
    discountAmount: tournament.discountAmount,
    memo: tournament.memo,
  }

  Object.assign(tournament, {
    name: editForm.name.trim() || tournament.name,
    buyIn: editForm.buyIn || null,
    totalBuyIns: Number(editForm.totalBuyIns) || 1,
    discountAmount: editForm.discountAmount || null,
    memo: editForm.memo.trim(),
  })

  try {
    const updatedSession = await updateGameSession(tournament.sessionId, tournamentUpdatePayload())
    applyServerSession(updatedSession)
    persistSynchronizedTournament()
    editSheetOpen.value = false
  } catch {
    Object.assign(tournament, previous)
    alert.show('대회 정보를 수정하지 못했습니다.', 'error')
  }
}

const createEmptySeat = (number) => ({
  number,
  nickname: '플레이어 지정',
  handSelection: '',
  aggression: '',
  exploitPoints: [],
  types: [],
  tags: [],
  memo: '',
  empty: true,
  active: false,
  saved: false,
  mine: false,
  playerId: null,
})

const seats = reactive(
  Array.from({ length: tournament.tableMaxPlayers }, (_, index) => createEmptySeat(index + 1)),
)
const mySeatNumber = ref('')
const registeredOpponents = reactive([])

onMounted(async () => {
  try {
    const session = await fetchRunningGameSession()
    if (!session) {
      localStorage.removeItem('pokerly-running-tournament')
      router.replace('/app/home')
      return
    }

    applyServerSession(session)
    seats.splice(
      0,
      seats.length,
      ...Array.from({ length: tournament.tableMaxPlayers }, (_, index) => createEmptySeat(index + 1)),
    )
    persistSynchronizedTournament()
  } catch {
    alert.show('진행 중인 대회 정보를 불러오지 못했습니다.', 'error')
    return
  }

  const [players, assignedSeats] = await Promise.all([
    fetchTournamentPlayers(),
    fetchTournamentSeats(tournament.sessionId),
  ])
  registeredOpponents.splice(0, registeredOpponents.length, ...(players || []))
  ;(assignedSeats || []).forEach((savedSeat) => {
    const seat = seats.find((item) => item.number === savedSeat.seatNumber)
    if (!seat) return
    Object.assign(seat, {
      nickname: savedSeat.nickname || (savedSeat.hero ? '나' : '플레이어 지정'),
      handSelection: savedSeat.handSelection || '',
      aggression: savedSeat.aggression || '',
      exploitPoints: [...(savedSeat.exploitPoints || [])],
      types: [...(savedSeat.types || [])],
      memo: savedSeat.memo || '',
      empty: false,
      active: true,
      saved: Boolean(savedSeat.playerId),
      mine: Boolean(savedSeat.hero),
      playerId: savedSeat.playerId,
    })
    if (savedSeat.hero) mySeatNumber.value = savedSeat.seatNumber
  })
})

const filteredRegisteredOpponents = computed(() => {
  const query = savedPlayerQuery.value.trim().toLowerCase()
  if (!query) return registeredOpponents
  return registeredOpponents.filter((opponent) =>
    `${opponent.nickname} ${opponent.memo} ${prioritizedTags(opponent).join(' ')}`
      .toLowerCase()
      .includes(query),
  )
})

const prioritizedTags = (player) => {
  const types = playerTypeOptions.filter((type) => player.types?.includes(type))
  const exploitPoints = exploitPointPriority.filter((point) =>
    player.exploitPoints?.includes(point),
  )
  return [...types, ...exploitPoints]
}

const tendencySummary = (seat) => {
  const selected = [seat.handSelection, seat.aggression].filter(Boolean)
  const tendencies = selected.filter(
    (value) => value && value !== '보통',
  )
  if (tendencies.length) return tendencies.join(' · ')
  return selected.length ? '보통' : ''
}

const openParticipantSheet = (seat) => {
  if (seat.mine) return
  Object.assign(participantForm, {
    seatNumber: seat.number,
    isNew: Boolean(seat.empty),
    nickname: seat.empty ? '' : seat.nickname,
    handSelection:
      seat.handSelection ||
      (seat.tendencies || []).find((item) => handSelectionOptions.includes(item)) ||
      '',
    aggression:
      seat.aggression ||
      (seat.tendencies || []).find((item) => playStyleOptions.includes(item)) ||
      '',
    exploitPoints: [...(seat.exploitPoints || seat.features || [])],
    types: [...(seat.types || [])],
    memo: seat.empty ? '' : seat.memo,
    saved: Boolean(seat.saved),
    registeredId: seat.playerId || null,
  })
  savedPlayerQuery.value = ''
  participantSheetOpen.value = true
}

const handleSeatRowClick = (seat) => {
  if (seatMenuNumber.value) {
    seatMenuNumber.value = null
    return
  }
  if (seat.empty) {
    openParticipantSheet(seat)
  }
}

const visibleSeatTags = (seat) =>
  expandedSeatNumber.value === seat.number
    ? prioritizedTags(seat)
    : prioritizedTags(seat).slice(0, 2)

const toggleSeatTags = (seat) => {
  expandedSeatNumber.value = expandedSeatNumber.value === seat.number ? null : seat.number
}

const editParticipantFromMenu = (seat) => {
  seatMenuNumber.value = null
  openParticipantSheet(seat)
}

const toggleSelection = (selection, label) => {
  const index = selection.indexOf(label)
  if (index >= 0) selection.splice(index, 1)
  else selection.push(label)
}

const selectOptionalTendency = (field, value) => {
  participantForm[field] = participantForm[field] === value ? '' : value
}

const assignedSeatNumber = (playerId) =>
  seats.find((seat) => !seat.empty && seat.playerId === playerId)?.number || null

const openPlayerPicker = () => {
  savedPlayerQuery.value = ''
  playerPickerOpen.value = true
}

const selectRegisteredOpponent = (opponent) => {
  if (assignedSeatNumber(opponent.id)) return
  Object.assign(participantForm, {
    nickname: opponent.nickname,
    handSelection: opponent.handSelection,
    aggression: opponent.aggression,
    exploitPoints: [...opponent.exploitPoints],
    types: [...opponent.types],
    memo: opponent.memo,
    saved: true,
    registeredId: opponent.id,
  })
  playerPickerOpen.value = false
  savedPlayerQuery.value = ''
}

const requestConfirmation = ({ title, message, confirmLabel, action }) => {
  Object.assign(confirmState, { title, message, confirmLabel, action })
  confirmSheetOpen.value = true
}

const runConfirmedAction = () => {
  const action = confirmState.action
  confirmSheetOpen.value = false
  confirmState.action = null
  action?.()
}

const clearTournamentCache = (sessionId) => {
  const runningKey = 'pokerly-running-tournament'
  try {
    const running = JSON.parse(localStorage.getItem(runningKey))
    if (String(running?.sessionId || running?.id) === String(sessionId)) {
      localStorage.removeItem(runningKey)
    }
  } catch {
    localStorage.removeItem(runningKey)
  }
}

const deleteTournament = async () => {
  if (!tournament.sessionId) return
  try {
    await deleteGameSession(tournament.sessionId)
    clearTournamentCache(tournament.sessionId)
    alert.show('토너먼트를 삭제했습니다.', 'success')
    await router.replace({ name: 'home' })
  } catch (error) {
    alert.show(error?.response?.data?.error?.message || '토너먼트를 삭제하지 못했습니다.', 'error')
  }
}

const requestTournamentDelete = () => {
  tournamentMenuOpen.value = false
  requestConfirmation({
    title: '토너먼트를 삭제할까요?',
    message: '레벨, 핸드, 복기 및 좌석 기록도 함께 삭제되며 되돌릴 수 없습니다.',
    confirmLabel: '삭제',
    action: deleteTournament,
  })
}

const applyMySeat = async (nextSeatNumber) => {
  const nextSeat = seats.find((seat) => seat.number === nextSeatNumber)
  const previousSeat = seats.find((seat) => seat.mine)
  if (previousSeat) Object.assign(previousSeat, createEmptySeat(previousSeat.number))

  if (nextSeat) {
    Object.assign(nextSeat, {
      ...createEmptySeat(nextSeat.number),
      nickname: '나',
      empty: false,
      active: true,
      mine: true,
    })
  }
  if (tournament.sessionId) {
    if (previousSeat) await deleteTournamentSeat(tournament.sessionId, previousSeat.number)
    if (nextSeat) {
      await saveTournamentSeat(tournament.sessionId, nextSeat.number, {
        playerId: null, nickname: '나', types: [], exploitPoints: [], hero: true,
      })
    }
  }
  mySeatNumber.value = nextSeatNumber
  mySeatSheetOpen.value = false
}

const setMySeat = (seatNumber) => {
  const nextSeatNumber = Number(seatNumber) || ''
  if (nextSeatNumber === mySeatNumber.value) {
    mySeatSheetOpen.value = false
    return
  }

  const nextSeat = seats.find((seat) => seat.number === nextSeatNumber)
  if (nextSeat && !nextSeat.empty && !nextSeat.mine) {
    requestConfirmation({
      title: '내 자리로 변경',
      message: `${nextSeatNumber}번 좌석의 플레이어 정보가 제거됩니다.`,
      confirmLabel: '변경',
      action: () => applyMySeat(nextSeatNumber),
    })
    return
  }
  applyMySeat(nextSeatNumber)
}

const resetSeats = () => {
  if (!seats.some((seat) => !seat.empty)) return
  requestConfirmation({
    title: '전체 초기화',
    message: '모든 좌석의 플레이어 정보가 제거됩니다.',
    confirmLabel: '초기화',
    action: async () => {
      seats.splice(
        0,
        seats.length,
        ...Array.from(
          { length: tournament.tableMaxPlayers },
          (_, index) => createEmptySeat(index + 1),
        ),
      )
      mySeatNumber.value = ''
      expandedSeatNumber.value = null
      if (tournament.sessionId) await resetTournamentSeats(tournament.sessionId)
    },
  })
}

const applyTableMaxPlayers = async (count) => {
  tournament.tableMaxPlayers = count
  seats.splice(
    0,
    seats.length,
    ...Array.from({ length: count }, (_, index) => seats[index] || createEmptySeat(index + 1)),
  )
  localStorage.setItem('pokerly-running-tournament', JSON.stringify(tournament))
  if (tournament.sessionId) {
    await updateGameSession(tournament.sessionId, tournamentUpdatePayload())
  }
  tableSizeSheetOpen.value = false
}

const changeTableMaxPlayers = (count) => {
  if (count === tournament.tableMaxPlayers) {
    tableSizeSheetOpen.value = false
    return
  }
  const assignedOutsideRange = seats.filter((seat) => seat.number > count && !seat.empty)
  if (assignedOutsideRange.length) {
    requestConfirmation({
      title: '테이블 인원을 줄일 수 없습니다',
      message: `${assignedOutsideRange.map((seat) => `${seat.number}번`).join(', ')} 좌석을 먼저 비워주세요.`,
      confirmLabel: '확인',
      action: () => { tableSizeSheetOpen.value = true },
    })
    tableSizeSheetOpen.value = false
    return
  }
  applyTableMaxPlayers(count)
}

const requestVacateSeat = (seat) => {
  seatMenuNumber.value = null
  requestConfirmation({
    title: '좌석에서 제거',
    message: `${seat.number}번 좌석에서 ${seat.nickname} 플레이어를 제거할까요?`,
    confirmLabel: '제거',
    action: async () => {
      Object.assign(seat, createEmptySeat(seat.number))
      if (tournament.sessionId) await deleteTournamentSeat(tournament.sessionId, seat.number)
      if (expandedSeatNumber.value === seat.number) expandedSeatNumber.value = null
      participantSheetOpen.value = false
    },
  })
}

const playerProfileFromSeat = (seat, id = seat.playerId || `${Date.now()}-${seat.number}`) => ({
  id,
  nickname: seat.nickname,
  handSelection: seat.handSelection,
  aggression: seat.aggression,
  exploitPoints: [...seat.exploitPoints],
  types: [...seat.types],
  memo: seat.memo,
})

const saveSeatToPlayerList = async (seat) => {
  const profile = tournament.sessionId
    ? await createTournamentPlayer(playerProfileFromSeat(seat))
    : playerProfileFromSeat(seat)
  registeredOpponents.push(profile)
  seat.saved = true
  seat.playerId = profile.id
  if (tournament.sessionId) await saveTournamentSeat(tournament.sessionId, seat.number, {
    ...playerProfileFromSeat(seat, profile.id), playerId: profile.id, hero: false,
  })
  seatMenuNumber.value = null
}

const requestRemoveFromPlayerList = (seat) => {
  seatMenuNumber.value = null
  requestConfirmation({
    title: '플레이어 목록에서 제거',
    message: `${seat.nickname} 플레이어를 목록에서 제거할까요? 좌석 정보는 유지됩니다.`,
    confirmLabel: '제거',
    action: async () => {
      const playerId = seat.playerId
      const profileIndex = registeredOpponents.findIndex((opponent) => opponent.id === playerId)
      if (profileIndex >= 0) registeredOpponents.splice(profileIndex, 1)
      seats.forEach((assignedSeat) => {
        if (assignedSeat.playerId !== playerId) return
        assignedSeat.saved = false
        assignedSeat.playerId = null
      })
      if (tournament.sessionId && playerId) await deleteTournamentPlayer(playerId)
    },
  })
}

const saveParticipant = async () => {
  const seat = seats.find((item) => item.number === participantForm.seatNumber)
  if (!seat || !participantForm.nickname.trim()) return

  Object.assign(seat, {
    nickname: participantForm.nickname.trim(),
    handSelection: participantForm.handSelection,
    aggression: participantForm.aggression,
    exploitPoints: [...participantForm.exploitPoints],
    types: [...participantForm.types],
    tags: [
      ...[participantForm.handSelection, participantForm.aggression].filter(
        (label) => label && label !== '보통',
      ),
      ...participantForm.exploitPoints,
      ...participantForm.types,
    ].map((label) => ({
      label,
      tone: tagTone[label] || 'neutral',
    })),
    memo: participantForm.memo.trim(),
    saved: participantForm.saved,
    playerId: participantForm.saved ? participantForm.registeredId : null,
    empty: false,
    active: true,
  })

  if (participantForm.saved) {
    const registered = registeredOpponents.find(
      (opponent) => opponent.id === participantForm.registeredId,
    )
    const profile = {
      id: registered?.id || `${Date.now()}-${seat.number}`,
      nickname: participantForm.nickname.trim(),
      handSelection: participantForm.handSelection,
      aggression: participantForm.aggression,
      exploitPoints: [...participantForm.exploitPoints],
      types: [...participantForm.types],
      memo: participantForm.memo.trim(),
    }
    const persisted = tournament.sessionId
      ? registered
        ? await updateTournamentPlayer(registered.id, profile)
        : await createTournamentPlayer(profile)
      : profile
    if (registered) Object.assign(registered, persisted)
    else registeredOpponents.push(persisted)
    seat.playerId = persisted.id
    participantForm.registeredId = persisted.id
  }

  if (tournament.sessionId) {
    await saveTournamentSeat(tournament.sessionId, seat.number, {
      playerId: seat.playerId,
      nickname: seat.nickname,
      handSelection: seat.handSelection,
      aggression: seat.aggression,
      exploitPoints: seat.exploitPoints,
      types: seat.types,
      memo: seat.memo,
      hero: false,
    })
  }

  participantSheetOpen.value = false
}
</script>

<style scoped>
.manage-page {
  display: grid;
  align-content: start;
  gap: 14px;
  min-height: 100%;
  padding: var(--v2-page-padding-top) var(--v2-page-padding-x)
    calc(24px + env(safe-area-inset-bottom));
}

.manage-topbar {
  display: grid;
  grid-template-columns: 40px minmax(0, 1fr) 40px;
  align-items: center;
  min-height: 36px;
}

.manage-topbar button {
  min-height: 36px;
  border: 0;
  background: transparent;
  color: var(--v2-text-main);
  font: inherit;
}

.manage-topbar > button:first-child {
  width: 36px;
  padding: 0;
}

.manage-topbar h1 {
  margin: 0;
  color: var(--v2-text-main);
  font-size: 21px;
  font-weight: 650;
  line-height: 1.2;
  text-align: center;
}

.tournament-card,
.seat-row {
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-lg);
  background: #ffffff;
  box-shadow: 0 5px 14px rgba(28, 18, 60, 0.022);
}

.tournament-card {
  overflow: hidden;
}

.tournament-card__head {
  padding: 16px;
  display: grid;
  gap: 14px;
}

.tournament-card__title-row {
  position: relative;
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 14px;
}

.tournament-card strong {
  color: var(--v2-text-main);
  font-size: 18px;
  font-weight: 560;
}

.tournament-card dl {
  display: grid;
  gap: 10px;
  margin: 0;
  max-width: none;
}

.tournament-card dl div {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 118px;
  align-items: baseline;
  gap: 16px;
}

.tournament-card dt,
.tournament-card dd {
  margin: 0;
  color: #5f596b;
  font-size: 12px;
}

.tournament-card dd {
  color: var(--v2-text-main);
  font-weight: 560;
  text-align: right;
}

.tournament-card__title-row > button,
.section-header button {
  min-height: 30px;
  padding: 0 10px;
  border: 1px solid rgba(109, 69, 232, 0.32);
  border-radius: var(--v2-radius-sm);
  background: #ffffff;
  color: var(--v2-primary);
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font: inherit;
  font-size: 12px;
  font-weight: 520;
}

.tournament-card__title-row > .tournament-menu-button {
  width: 32px;
  min-height: 32px;
  margin-right: -8px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: var(--v2-text-sub);
  justify-content: center;
}

.tournament-menu {
  position: absolute;
  top: 40px;
  right: 0;
  z-index: 3;
  width: 132px;
  padding: 6px;
  border: 1px solid rgba(230, 226, 240, 0.9);
  border-radius: 12px;
  background: #f8f7fb;
  box-shadow: 0 8px 20px rgba(28, 18, 60, 0.12);
}

.tournament-menu button {
  width: 100%;
  min-height: 38px;
  padding: 0 12px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: var(--v2-text-main);
  font: inherit;
  font-size: 13px;
  font-weight: 520;
  text-align: left;
}

.tournament-menu button:active {
  background: #f0edf8;
}

.tournament-menu button.destructive {
  color: var(--v2-danger, #ef4444);
}

.memo-row {
  width: 100%;
  min-height: 44px;
  padding: 0 16px;
  border: 0;
  border-top: 1px solid var(--v2-border);
  background: #ffffff;
  color: #5f596b;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  gap: 10px;
  font: inherit;
  font-size: 12px;
  text-align: left;
}

.memo-row strong {
  color: var(--v2-text-sub);
  font-size: 12px;
  font-weight: 430;
  overflow: hidden;
  text-align: right;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.seat-section {
  display: grid;
  gap: 10px;
}

.section-header h2 {
  margin: 0;
  color: var(--v2-text-main);
  font-size: 15px;
  font-weight: 520;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.section-header__actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.my-seat-button {
  width: 100%;
  min-height: 46px;
  padding: 0 13px;
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-sm);
  background: #ffffff;
  color: var(--v2-text-main);
  display: flex;
  align-items: center;
  gap: 8px;
  font: inherit;
  text-align: left;
}

.my-seat-button span {
  color: var(--v2-text-sub);
  font-size: 12px;
}

.my-seat-button strong {
  margin-left: auto;
  font-size: 13px;
  font-weight: 560;
}

.my-seat-button .q-icon {
  color: var(--v2-text-sub);
}

.seat-list {
  display: grid;
  gap: 7px;
}

.seat-row {
  position: relative;
  overflow: visible;
  width: 100%;
  min-height: 0;
  padding: 11px 6px 11px 12px;
  color: var(--v2-text-main);
  display: grid;
  grid-template-columns: 36px minmax(0, 1fr) 30px;
  align-items: center;
  gap: 10px;
  font: inherit;
  text-align: left;
}

.seat-row__action {
  position: relative;
  justify-self: end;
}

.seat-row__action > button {
  width: 30px;
  height: 30px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: var(--v2-text-sub);
}

.seat-row__menu {
  position: absolute;
  top: 32px;
  right: 0;
  z-index: 5;
  width: 174px;
  padding: 5px;
  border: 1px solid var(--v2-border);
  border-radius: 11px;
  background: #f8f7fb;
  box-shadow: 0 7px 18px rgba(28, 18, 60, 0.11);
}

.seat-row__menu button {
  width: 100%;
  min-height: 36px;
  padding: 0 10px;
  border: 0;
  border-radius: 7px;
  background: transparent;
  color: var(--v2-text-main);
  font: inherit;
  font-size: 12px;
  font-weight: 520;
  text-align: left;
}

.seat-row__menu button.destructive {
  color: #ef3f47;
  font-weight: 600;
}

.seat-row__menu button + button {
  border-top: 1px solid var(--v2-border);
}

.seat-row.mine {
  border-color: rgba(109, 69, 232, 0.72);
  background: rgba(241, 236, 255, 0.45);
}

.seat-row.menu-open {
  z-index: 22;
}

.seat-menu-dismiss-layer {
  position: fixed;
  inset: 0;
  z-index: 21;
  background: transparent;
}

.seat-row.empty {
  background: rgba(255, 255, 255, 0.72);
}

.seat-row.inactive:not(.empty) {
  opacity: 0.62;
}

.seat-row.empty .seat-copy strong {
  color: var(--v2-text-sub);
  font-weight: 520;
}

.seat-row summary {
  min-height: 50px;
  padding: 8px 12px;
  display: grid;
  grid-template-columns: 36px minmax(0, 1fr) 24px;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  list-style: none;
}

.seat-row summary::-webkit-details-marker {
  display: none;
}

.seat-row summary:focus {
  outline: none;
}

.seat-row summary:focus-visible {
  outline: 1px solid rgba(109, 69, 232, 0.28);
  outline-offset: -1px;
}

.seat-badge {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: var(--v2-primary-soft);
  color: var(--v2-primary);
  display: grid;
  place-items: center;
  font-size: 12px;
  font-weight: 560;
}

.seat-copy {
  min-width: 0;
  display: grid;
  gap: 5px;
}

.seat-copy__name {
  display: flex;
  align-items: center;
  gap: 7px;
}

.seat-copy__name small {
  padding: 2px 6px;
  border-radius: 999px;
  background: #f1eef9;
  color: var(--v2-text-sub);
  font-size: 9px;
  font-weight: 520;
}

.seat-copy__memo {
  overflow: hidden;
  color: var(--v2-text-sub);
  font-size: 11px;
  line-height: 1.3;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.seat-copy__tendency {
  color: #5f596b;
  font-size: 11px;
  font-weight: 520;
  line-height: 1.2;
}

.seat-status {
  color: var(--v2-text-sub);
  font-size: 10px;
  white-space: nowrap;
}

.seat-copy strong {
  color: var(--v2-text-main);
  font-size: 13px;
  font-weight: 560;
  line-height: 1.1;
}

.seat-tags {
  min-width: 0;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 5px;
}

.seat-tag {
  min-height: 26px;
  padding: 3px 7px;
  border-radius: var(--v2-radius-sm);
  background: #f4f3f8;
  color: #5f596b;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 520;
  line-height: 1;
  white-space: nowrap;
}

.seat-tag.primary {
  background: var(--v2-primary-soft);
  color: var(--v2-primary);
}

.seat-tag.danger {
  background: rgba(239, 68, 68, 0.1);
  color: var(--v2-danger);
}

.seat-tag.warning {
  background: #fff6ed;
  color: #c35a11;
}

.seat-tag.type {
  background: var(--v2-primary-soft);
  color: var(--v2-primary);
}

.seat-tag.count {
  border: 0;
  background: transparent;
  color: var(--v2-text-sub);
  padding-inline: 2px;
  font: inherit;
  cursor: pointer;
}

.seat-tag.success {
  background: rgba(22, 163, 74, 0.12);
  color: var(--v2-success);
}

.seat-tag.empty {
  background: #f4f3f8;
  color: var(--v2-text-sub);
}

.seat-tag.mine {
  background: var(--v2-primary);
  color: #ffffff;
}

.seat-expand {
  color: var(--v2-text-sub);
  justify-self: end;
  transition: transform 0.18s ease;
}

.seat-row[open] .seat-expand {
  transform: rotate(180deg);
}

.seat-memo {
  margin: 0 10px 10px;
  padding: 8px 10px;
  border-radius: var(--v2-radius-sm);
  background: #f8f7fb;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 8px;
}

.seat-memo button {
  min-height: 28px;
  padding: 0 8px;
  border: 1px solid rgba(109, 69, 232, 0.22);
  border-radius: var(--v2-radius-sm);
  background: #ffffff;
  color: var(--v2-primary);
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font: inherit;
  font-size: 11px;
  font-weight: 520;
}

.seat-memo p {
  min-width: 0;
  margin: 0;
  color: #5f596b;
  font-size: 12px;
  line-height: 1.45;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.seat-memo p.empty {
  color: var(--v2-text-sub);
}

.seat-memo--empty {
  grid-template-columns: minmax(0, 1fr) auto;
}

.seat-memo--empty input {
  box-sizing: border-box;
  width: 100%;
  min-height: 34px;
  padding: 0 11px;
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-sm);
  background: #ffffff;
  color: var(--v2-text-main);
  font: inherit;
  font-size: 12px;
}

.seat-memo--empty input::placeholder {
  color: var(--v2-text-sub);
}

.seat-memo--empty button {
  min-width: 52px;
  justify-content: center;
}

.tournament-edit-sheet {
  width: min(100%, 520px);
  max-height: 88vh;
  overflow-y: auto;
  margin: 0 auto;
  padding: 12px 24px calc(24px + env(safe-area-inset-bottom));
  border-radius: 24px 24px 0 0;
  background: #ffffff;
  display: grid;
  gap: 18px;
}

.tournament-edit-sheet__handle {
  width: 38px;
  height: 5px;
  margin: 0 auto 2px;
  border-radius: 999px;
  background: #d4d0dc;
}

.tournament-edit-sheet h2 {
  margin: 0 0 4px;
  color: var(--v2-text-main);
  font-size: 20px;
  font-weight: 620;
  text-align: center;
}

.tournament-edit-sheet label {
  display: grid;
  gap: 8px;
}

.tournament-edit-sheet label > span {
  color: var(--v2-text-main);
  font-size: 14px;
  font-weight: 560;
}

.tournament-edit-sheet input,
.tournament-edit-sheet textarea {
  box-sizing: border-box;
  width: 100%;
  padding: 0 14px;
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-sm);
  outline: 0;
  background: #ffffff;
  color: var(--v2-text-main);
  font: inherit;
  font-size: 16px;
}

.tournament-edit-sheet input {
  height: 52px;
}

.tournament-edit-sheet textarea {
  min-height: 96px;
  padding-top: 14px;
  resize: none;
}

.tournament-edit-sheet input:focus,
.tournament-edit-sheet textarea:focus {
  border-color: rgba(109, 69, 232, 0.6);
}

.tournament-edit-sheet__save {
  width: 100%;
  height: 52px;
  margin-top: 4px;
  border: 0;
  border-radius: var(--v2-radius-sm);
  background: var(--v2-primary);
  color: #ffffff;
  font: inherit;
  font-size: 16px;
  font-weight: 620;
}

.participant-sheet {
  width: min(100%, 520px);
  max-height: 90vh;
  overflow-y: auto;
  margin: 0 auto;
  padding: 12px 24px calc(104px + env(safe-area-inset-bottom));
  border-radius: 24px 24px 0 0;
  background: #ffffff;
  display: grid;
  gap: 18px;
}

.my-seat-sheet {
  width: min(100%, 520px);
  margin: 0 auto;
  padding: 12px 24px calc(24px + env(safe-area-inset-bottom));
  border-radius: 24px 24px 0 0;
  background: #ffffff;
  display: grid;
  gap: 18px;
}

.table-size-sheet {
  width: min(100%, 520px);
  margin: 0 auto;
  padding: 12px 24px calc(28px + env(safe-area-inset-bottom));
  border-radius: 24px 24px 0 0;
  background: #ffffff;
  display: grid;
  gap: 16px;
}

.table-size-sheet h2 {
  margin: 2px 0 0;
  color: var(--v2-text-main);
  font-size: 19px;
  font-weight: 620;
  text-align: center;
}

.table-size-sheet > p {
  margin: 0;
  color: var(--v2-text-sub);
  font-size: 13px;
  text-align: center;
}

.table-size-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 8px;
}

.table-size-grid button {
  height: 46px;
  padding: 0;
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-sm);
  background: #ffffff;
  color: var(--v2-text-main);
  font: inherit;
  font-size: 14px;
  font-weight: 560;
}

.table-size-grid button.selected {
  border-color: rgba(109, 69, 232, 0.62);
  background: var(--v2-primary-soft);
  color: var(--v2-primary);
}

.player-picker-sheet {
  width: min(100%, 520px);
  max-height: 78vh;
  margin: 0 auto;
  padding: 12px 20px calc(24px + env(safe-area-inset-bottom));
  border-radius: 24px 24px 0 0;
  background: #ffffff;
  display: grid;
  grid-template-rows: auto auto auto minmax(0, 1fr);
  gap: 14px;
}

.player-picker-sheet h2 {
  margin: 2px 0 4px;
  color: var(--v2-text-main);
  font-size: 19px;
  font-weight: 620;
  text-align: center;
}

.player-picker-sheet > input {
  box-sizing: border-box;
  width: 100%;
  height: 48px;
  padding: 0 14px;
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-sm);
  outline: 0;
  background: #ffffff;
  color: var(--v2-text-main);
  font: inherit;
  font-size: 14px;
}

.player-picker-sheet .registered-opponent-list {
  overflow-y: auto;
}

.player-picker-sheet__empty {
  min-height: 120px;
  margin: 0;
  color: var(--v2-text-sub);
  display: grid;
  place-items: center;
  font-size: 13px;
}

.confirm-dialog {
  width: min(calc(100vw - 40px), 360px);
  padding: 24px;
  border-radius: var(--v2-radius-lg);
  background: #ffffff;
}

.confirm-dialog h2 {
  margin: 0;
  color: var(--v2-text-main);
  font-size: 19px;
  font-weight: 620;
}

.confirm-dialog > p {
  margin: 10px 0 22px;
  color: var(--v2-text-sub);
  font-size: 14px;
}

.confirm-dialog > div:last-child {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.confirm-dialog > div:last-child button {
  height: 44px;
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-sm);
  background: #ffffff;
  color: var(--v2-text-main);
  font: inherit;
  font-size: 14px;
  font-weight: 560;
}

.confirm-dialog > div:last-child button.danger {
  border-color: var(--v2-danger);
  color: var(--v2-danger);
}

.my-seat-sheet h2 {
  margin: 2px 0 4px;
  color: var(--v2-text-main);
  font-size: 19px;
  font-weight: 620;
  text-align: center;
}

.my-seat-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 8px;
}

.my-seat-grid button {
  min-width: 0;
  height: 54px;
  padding: 0;
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-sm);
  background: #ffffff;
  color: var(--v2-text-main);
  display: grid;
  place-content: center;
  gap: 2px;
  font: inherit;
  font-size: 13px;
  font-weight: 560;
}

.my-seat-grid button.selected {
  border-color: rgba(109, 69, 232, 0.62);
  background: var(--v2-primary-soft);
  color: var(--v2-primary);
}

.my-seat-grid small {
  color: var(--v2-danger);
  font-size: 8px;
  font-weight: 430;
}

.my-seat-clear {
  width: 100%;
  height: 44px;
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-sm);
  background: #ffffff;
  color: var(--v2-text-sub);
  font: inherit;
  font-size: 13px;
  font-weight: 520;
}

.participant-sheet__handle {
  width: 38px;
  height: 5px;
  margin: 0 auto 2px;
  border-radius: 999px;
  background: #d4d0dc;
}

.participant-sheet__title {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 12px;
}

.participant-sheet__title small {
  color: var(--v2-text-sub);
  font-size: 12px;
}

.participant-sheet__title h2 {
  margin: 3px 0 0;
  color: var(--v2-text-main);
  font-size: 20px;
  font-weight: 620;
}

.participant-sheet__title > span {
  padding: 5px 8px;
  border-radius: 999px;
  background: #f3f1f8;
  color: var(--v2-text-sub);
  font-size: 10px;
  font-weight: 520;
  white-space: nowrap;
}

.participant-sheet__title > span.saved {
  background: var(--v2-primary-soft);
  color: var(--v2-primary);
}

.participant-sheet > label {
  display: grid;
  gap: 8px;
}

.participant-sheet > label > span,
.participant-sheet legend {
  color: var(--v2-text-main);
  font-size: 14px;
  font-weight: 560;
}

.participant-sheet legend small {
  margin-left: 3px;
  color: var(--v2-text-sub);
  font-size: 11px;
  font-weight: 430;
}

.participant-sheet .required-label {
  margin-left: 4px;
  color: var(--v2-primary);
  font-size: 10px;
  font-weight: 520;
}

.participant-sheet input:not([type='checkbox']),
.participant-sheet textarea,
.saved-player-search__field input {
  box-sizing: border-box;
  width: 100%;
  padding: 0 14px;
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-sm);
  outline: 0;
  background: #ffffff;
  color: var(--v2-text-main);
  font: inherit;
  font-size: 15px;
}

.participant-sheet input:not([type='checkbox']),
.saved-player-search__field input {
  height: 50px;
}

.participant-sheet textarea {
  min-height: 104px;
  padding-top: 13px;
  resize: none;
}

.participant-sheet input:focus,
.participant-sheet textarea:focus {
  border-color: rgba(109, 69, 232, 0.6);
}

.participant-sheet fieldset {
  min-width: 0;
  margin: 0;
  padding: 0;
  border: 0;
}

.participant-tags {
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.participant-tags button {
  min-height: 34px;
  padding: 0 12px;
  border: 1px solid var(--v2-border);
  border-radius: 999px;
  background: #ffffff;
  color: var(--v2-text-sub);
  font: inherit;
  font-size: 12px;
}

.participant-tags button.selected {
  border-color: rgba(109, 69, 232, 0.3);
  background: rgba(109, 69, 232, 0.07);
  color: var(--v2-primary);
  font-weight: 560;
}

.participant-tags--radio {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.participant-tags--radio button {
  justify-content: center;
  display: inline-flex;
  align-items: center;
  border-radius: var(--v2-radius-sm);
}

.profile-fieldset {
  display: grid;
  gap: 8px;
}

.profile-group-label {
  margin-top: 3px;
  color: var(--v2-text-sub);
  font-size: 11px;
  font-weight: 520;
}

.profile-fieldset .participant-tags {
  margin-top: 0;
}

.participant-tags--points {
  gap: 7px;
}

.participant-options {
  overflow: hidden;
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-sm);
}

.participant-options label {
  min-height: 58px;
  padding: 0 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.participant-options label + label {
  border-top: 1px solid var(--v2-border);
}

.participant-options label > span {
  display: grid;
  gap: 3px;
}

.participant-options strong {
  color: var(--v2-text-main);
  font-size: 13px;
  font-weight: 560;
}

.participant-options small {
  color: var(--v2-text-sub);
  font-size: 10px;
}

.participant-options input {
  width: 19px;
  height: 19px;
  accent-color: var(--v2-primary);
}

.saved-player-search,
.participant-save-player {
  width: 100%;
  height: 44px;
  border: 1px solid rgba(109, 69, 232, 0.38);
  border-radius: var(--v2-radius-sm);
  background: #ffffff;
  color: var(--v2-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  font: inherit;
  font-size: 13px;
  font-weight: 560;
}

.saved-player-search__field {
  display: grid;
  gap: 7px;
}

.saved-player-search__field p {
  margin: 0;
  color: var(--v2-text-sub);
  font-size: 10px;
}

.registered-opponent-list {
  overflow: hidden;
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-sm);
}

.registered-opponent-list button {
  width: 100%;
  min-height: 52px;
  padding: 9px 12px;
  border: 0;
  background: #ffffff;
  color: var(--v2-text-main);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font: inherit;
  text-align: left;
}

.registered-opponent-list button > span {
  min-width: 0;
  display: grid;
  gap: 3px;
}

.registered-opponent-copy .seat-tags {
  margin-top: 2px;
}

.registered-opponent-list button:disabled {
  background: #f7f6f9;
  color: var(--v2-text-sub);
}

.registered-opponent-list em {
  flex: 0 0 auto;
  color: var(--v2-primary);
  font-size: 10px;
  font-style: normal;
  font-weight: 520;
}

.registered-opponent-list button + button {
  border-top: 1px solid var(--v2-border);
}

.registered-opponent-list button:active {
  background: #f7f5fb;
}

.registered-opponent-list strong {
  font-size: 13px;
  font-weight: 560;
}

.registered-opponent-list small {
  overflow: hidden;
  color: var(--v2-text-sub);
  font-size: 10px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.participant-divider {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--v2-text-sub);
  font-size: 10px;
  white-space: nowrap;
}

.participant-divider::before,
.participant-divider::after {
  width: 100%;
  height: 1px;
  background: var(--v2-border);
  content: '';
}

.participant-sheet__sticky-action {
  position: fixed;
  bottom: 0;
  left: 50%;
  z-index: 7000;
  box-sizing: border-box;
  width: min(100%, 520px);
  margin: 0;
  padding: 12px 24px calc(24px + env(safe-area-inset-bottom));
  background: #ffffff;
  backface-visibility: hidden;
  transform: translate3d(-50%, 0, 0);
}

.participant-sheet__save {
  width: 100%;
  min-height: var(--v2-sticky-cta-height);
  padding: 0 18px;
  border: 0;
  border-radius: var(--v2-sticky-cta-radius);
  background: var(--v2-sticky-cta-primary);
  box-shadow: none;
  color: #ffffff;
  font: inherit;
  font-size: var(--v2-sticky-cta-font-size);
  font-weight: 600;
  line-height: 1;
}

.participant-sheet__save:disabled {
  background: #e9e4f7;
  color: #aaa3bc;
}

.participant-sheet__vacate {
  width: 100%;
  height: 42px;
  border: 0;
  background: transparent;
  color: var(--v2-danger);
  font: inherit;
  font-size: 13px;
  font-weight: 560;
}

@media (max-width: 420px) {
  .seat-row summary {
    grid-template-columns: 34px minmax(0, 1fr) 22px;
    min-height: 48px;
    gap: 7px;
  }
}
</style>
