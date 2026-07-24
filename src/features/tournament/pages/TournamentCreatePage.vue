<template>
  <q-page class="tournament-create-page">
    <header class="create-topbar">
      <button class="create-topbar__back" type="button" aria-label="뒤로 가기" @click="router.back()">
        <q-icon name="chevron_left" size="28px" />
      </button>
      <h1>대회 생성</h1>
      <span aria-hidden="true"></span>
    </header>

    <section class="create-intro">
      <h2>새 대회를 생성하세요.</h2>
      <p>필요한 정보만 입력하면 바로<br />토너먼트를 시작할 수 있습니다.</p>
    </section>

    <form class="create-form" @submit.prevent="submitTournament">
      <div class="form-field">
        <label class="form-label" for="tournamentName">대회명 <span>필수</span></label>
        <div class="text-field">
          <input
            id="tournamentName"
            v-model="form.name"
            maxlength="50"
            placeholder="예) Prime Daily"
            type="text"
          />
          <span>{{ form.name.length }}/50</span>
        </div>
      </div>

      <div class="form-field">
        <div class="form-label">장소 <span>선택</span></div>
        <button class="select-field" type="button" @click="venueOpen = !venueOpen">
          <span>{{ selectedVenue }}</span>
          <q-icon name="expand_more" size="24px" />
        </button>
        <div v-if="venueOpen" class="venue-list">
          <button
            v-for="venue in venues"
            :key="venue"
            type="button"
            class="venue-list__item"
            @click="selectVenue(venue)"
          >
            <span>{{ venue }}</span>
            <q-icon v-if="selectedVenue === venue" name="check" size="22px" />
          </button>
          <button class="venue-list__add" type="button" @click="showVenueSheet = true">
            <q-icon name="add" size="20px" />
            <span>새 장소 추가</span>
          </button>
        </div>
      </div>

      <div class="venue-empty">
        <q-icon name="location_on" size="36px" />
        <p>등록된 장소가 없습니다.</p>
        <button type="button" @click="showVenueSheet = true">
          <q-icon name="add" size="18px" />
          장소 추가
        </button>
      </div>

      <div class="form-field">
        <label class="form-label" for="startingStack">시작 스택 <span>선택</span></label>
        <div class="text-field text-field--currency">
          <input id="startingStack" v-model="form.startingStack" inputmode="numeric" placeholder="예) 60,000" />
          <span>칩</span>
        </div>
        <p class="field-help">대회 시작 시 지급되는 기본 스택입니다.</p>
      </div>

      <div class="form-field">
        <label class="form-label" for="buyIn">바인 금액 <span>선택</span></label>
        <div class="text-field text-field--currency">
          <input id="buyIn" v-model="form.buyIn" inputmode="numeric" placeholder="예) 100,000" />
        </div>
        <p class="field-help">바인 금액 또는 엔트리 비용을 입력하세요.</p>
      </div>

    </form>

    <div class="create-info">
      <q-icon name="info" size="24px" />
      <p><strong>입력은 언제든 수정할 수 있어요</strong><br />생성 후에도 대회 설정은 수정할 수 있습니다.</p>
    </div>

    <q-dialog v-model="showVenueSheet" position="bottom">
      <div class="venue-sheet">
        <h2>새 장소 추가</h2>

        <label class="form-label" for="venueName">매장명 <span>필수</span></label>
        <div class="text-field">
          <input id="venueName" v-model="venueForm.name" maxlength="50" placeholder="예) Prime 강남" />
          <span>{{ venueForm.name.length }}/50</span>
        </div>

        <label class="form-label" for="venueArea">지역 <em>(선택)</em></label>
        <div class="text-field">
          <input id="venueArea" v-model="venueForm.area" maxlength="50" placeholder="예) 서울 강남구" />
          <span>{{ venueForm.area.length }}/50</span>
        </div>

        <div class="venue-sheet__actions">
          <AppButton label="취소" variant="secondary" block @click="showVenueSheet = false" />
          <AppButton label="추가" block @click="addVenue" />
        </div>
      </div>
    </q-dialog>
    <StickyPrimaryAction label="대회 생성" @click="submitTournament" />
  </q-page>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

import AppButton from 'src/shared/components/AppButton.vue'
import StickyPrimaryAction from 'src/shared/components/StickyPrimaryAction.vue'

const router = useRouter()
const venueOpen = ref(true)
const showVenueSheet = ref(false)
const venues = ref(['Prime 강남', 'Royce 잠실', 'Ati 홍대', 'Mango 신촌'])
const selectedVenue = ref('Prime 강남')

const form = reactive({
  name: '',
  startingStack: '',
  buyIn: '',
})

const venueForm = reactive({
  name: '',
  area: '',
})

const selectVenue = (venue) => {
  selectedVenue.value = venue
  venueOpen.value = false
}

const addVenue = () => {
  if (!venueForm.name.trim()) return

  venues.value.push(venueForm.name.trim())
  selectedVenue.value = venueForm.name.trim()
  venueForm.name = ''
  venueForm.area = ''
  showVenueSheet.value = false
  venueOpen.value = false
}

const submitTournament = () => {
  router.push('/app/tournament/start')
}
</script>

<style scoped>
.tournament-create-page {
  display: grid;
  align-content: start;
  gap: 22px;
  min-height: 100%;
  padding: var(--v2-page-padding-top) var(--v2-page-padding-x) 180px;
}

.create-topbar {
  display: grid;
  grid-template-columns: 40px minmax(0, 1fr) 40px;
  align-items: center;
  min-height: 36px;
}

.create-topbar__back {
  width: 36px;
  height: 36px;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--v2-text-main);
}

.create-topbar h1 {
  margin: 0;
  color: var(--v2-text-main);
  font-size: 17px;
  font-weight: 560;
  line-height: 1.2;
  text-align: center;
}

.create-intro h2 {
  margin: 22px 0 18px;
  color: var(--v2-text-main);
  font-size: 26px;
  font-weight: 560;
  line-height: 1.25;
  letter-spacing: 0;
}

.create-intro p {
  margin: 0;
  color: var(--v2-text-main);
  font-size: 15px;
  font-weight: 430;
  line-height: 1.55;
}

.create-form {
  display: grid;
  gap: 20px;
}

.form-field {
  display: grid;
  gap: 8px;
}

.form-label {
  color: var(--v2-text-main);
  font-size: 14px;
  font-weight: 560;
  line-height: 1;
}

.form-label span,
.form-label em {
  display: inline-flex;
  margin-left: 6px;
  padding: 3px 7px;
  border-radius: 999px;
  background: var(--v2-primary-soft);
  color: var(--v2-primary);
  font-size: 10px;
  font-style: normal;
  font-weight: 520;
  vertical-align: 1px;
}

.text-field,
.select-field {
  min-height: 44px;
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-md);
  background: #ffffff;
  color: var(--v2-text-main);
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 12px;
}

.text-field:focus-within,
.select-field:focus {
  border-color: rgba(109, 69, 232, 0.45);
  outline: none;
}

.text-field input {
  min-width: 0;
  flex: 1;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--v2-text-main);
  font: inherit;
  font-size: 14px;
}

.text-field input::placeholder {
  color: #aaa5b8;
}

.text-field span,
.text-field strong,
.select-field .q-icon {
  flex: 0 0 auto;
  color: var(--v2-text-sub);
  font-size: 12px;
  font-weight: 430;
}

.select-field {
  width: 100%;
  justify-content: space-between;
  font: inherit;
  font-size: 14px;
  font-weight: 450;
  text-align: left;
}

.venue-list {
  overflow: hidden;
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-md);
  background: #ffffff;
}

.venue-list__item,
.venue-list__add {
  width: 100%;
  min-height: 44px;
  padding: 0 14px;
  border: 0;
  border-bottom: 1px solid var(--v2-border);
  background: transparent;
  color: var(--v2-text-main);
  display: flex;
  align-items: center;
  justify-content: space-between;
  font: inherit;
  font-size: 14px;
  font-weight: 430;
  text-align: left;
}

.venue-list__item .q-icon,
.venue-list__add {
  color: var(--v2-primary);
}

.venue-list__add {
  justify-content: flex-start;
  gap: 8px;
  border-bottom: 0;
  font-weight: 520;
}

.venue-empty {
  min-height: 152px;
  border: 1px dashed rgba(109, 69, 232, 0.24);
  border-radius: var(--v2-radius-lg);
  background: rgba(241, 236, 255, 0.44);
  display: grid;
  place-items: center;
  align-content: center;
  gap: 10px;
}

.venue-empty .q-icon {
  color: var(--v2-primary);
}

.venue-empty p {
  margin: 0;
  color: var(--v2-text-main);
  font-size: 14px;
  font-weight: 450;
}

.venue-empty button {
  min-height: 34px;
  padding: 0 14px;
  border: 1px solid var(--v2-primary);
  border-radius: var(--v2-radius-sm);
  background: #ffffff;
  color: var(--v2-primary);
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font: inherit;
  font-size: 13px;
  font-weight: 520;
}

.field-help {
  margin: 0;
  color: var(--v2-text-sub);
  font-size: 12px;
  font-weight: 430;
  line-height: 1.45;
}

.create-info {
  padding: 18px;
  border-radius: var(--v2-radius-lg);
  background: var(--v2-primary-soft);
  color: var(--v2-text-main);
  display: grid;
  grid-template-columns: 30px minmax(0, 1fr);
  align-items: start;
  gap: 10px;
}

.create-info .q-icon {
  color: var(--v2-primary);
}

.create-info p {
  margin: 0;
  font-size: 13px;
  font-weight: 430;
  line-height: 1.5;
}

.create-info strong {
  font-weight: 560;
}

.venue-sheet {
  width: 100%;
  padding: 22px 20px calc(20px + env(safe-area-inset-bottom));
  border-radius: 18px 18px 0 0;
  background: #ffffff;
  display: grid;
  gap: 14px;
}

.venue-sheet h2 {
  margin: 0 0 4px;
  color: var(--v2-text-main);
  font-size: 17px;
  font-weight: 560;
  line-height: 1.2;
  text-align: center;
}

.venue-sheet__actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 4px;
}

@media (max-width: 420px) {
  .tournament-create-page {
    padding-top: var(--v2-page-padding-top);
  }

  .create-intro h2 {
    margin-top: 18px;
    font-size: 24px;
  }
}
</style>
