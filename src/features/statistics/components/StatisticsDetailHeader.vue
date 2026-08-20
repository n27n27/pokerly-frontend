<template>
  <header class="detail-header">
    <button class="detail-header__back" type="button" :aria-label="`${title}에서 뒤로가기`" @click="goBack">
      <q-icon name="chevron_left" size="28px" />
    </button>
    <h1 class="detail-header__title">{{ title }}</h1>
    <div class="detail-header__filters" aria-label="통계 조회 조건">
      <div class="month-filter" :class="{ 'month-filter--all': showAllPeriod }">
        <button v-if="!showAllPeriod" type="button" aria-label="이전 달" @click="moveMonth(-1)">
          <q-icon name="chevron_left" size="19px" />
        </button>
        <button class="month-filter__label" type="button">
          <span>{{ periodLabel }}</span>
          <q-menu
            v-model="periodMenuOpen"
            class="stats-filter-menu stats-filter-menu--period"
            anchor="bottom middle"
            self="top middle"
            transition-show="jump-down"
            transition-hide="jump-up"
            :offset="[0, 6]"
          >
            <q-list aria-label="조회 기간 선택">
              <q-item
                clickable
                v-close-popup
                :active="!showAllPeriod"
                active-class="stats-filter-menu__active"
                @click="showAllPeriod = false"
              >
                <q-item-section>{{ monthLabel }}</q-item-section>
                <q-item-section side>
                  <q-icon v-if="!showAllPeriod" name="check" size="17px" />
                </q-item-section>
              </q-item>
              <q-item
                clickable
                v-close-popup
                :active="showAllPeriod"
                active-class="stats-filter-menu__active"
                @click="showAllPeriod = true"
              >
                <q-item-section>전체 기간</q-item-section>
                <q-item-section side>
                  <q-icon v-if="showAllPeriod" name="check" size="17px" />
                </q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </button>
        <button
          v-if="!showAllPeriod"
          type="button"
          aria-label="다음 달"
          :disabled="isCurrentMonth"
          @click="moveMonth(1)"
        >
          <q-icon name="chevron_right" size="19px" />
        </button>
      </div>

      <button class="venue-filter" type="button">
        <q-icon name="store" size="18px" />
        <span :title="selectedVenueLabel">{{ selectedVenueLabel }}</span>
        <q-icon name="expand_more" size="18px" />
        <q-menu
          v-model="venueMenuOpen"
          class="stats-filter-menu stats-filter-menu--venue"
          anchor="bottom right"
          self="top right"
          transition-show="jump-down"
          transition-hide="jump-up"
          :offset="[0, 6]"
        >
          <q-list aria-label="매장 선택">
            <q-item
              clickable
              v-close-popup
              :active="venueId === null"
              active-class="stats-filter-menu__active"
              @click="venueId = null"
            >
              <q-item-section>전체 매장</q-item-section>
              <q-item-section side><q-icon v-if="venueId === null" name="check" size="17px" /></q-item-section>
            </q-item>
            <q-item
              v-for="venue in venues"
              :key="venue.id"
              clickable
              v-close-popup
              :active="Number(venueId) === Number(venue.id)"
              active-class="stats-filter-menu__active"
              @click="venueId = venue.id"
            >
              <q-item-section>{{ venue.name }}</q-item-section>
              <q-item-section side>
                <q-icon v-if="Number(venueId) === Number(venue.id)" name="check" size="17px" />
              </q-item-section>
            </q-item>
            <q-item
              clickable
              v-close-popup
              :active="venueId === 'other'"
              active-class="stats-filter-menu__active"
              @click="venueId = 'other'"
            >
              <q-item-section>기타</q-item-section>
              <q-item-section side><q-icon v-if="venueId === 'other'" name="check" size="17px" /></q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </button>
    </div>
  </header>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useBodyScrollLock } from 'src/composables/useBodyScrollLock'
import { fetchVenues } from 'src/api/venue'

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  initialFilter: {
    type: Object,
    default: null,
  },
  backTo: {
    type: [String, Object],
    default: null,
  },
})

const emit = defineEmits(['change'])
const router = useRouter()
const now = new Date()
const selectedYear = ref(Number(props.initialFilter?.year) || now.getFullYear())
const selectedMonth = ref(Number(props.initialFilter?.month) || now.getMonth() + 1)
const showAllPeriod = ref(Boolean(props.initialFilter?.allPeriod))
const venueId = ref(props.initialFilter?.venueId ?? null)
const venues = ref([])
const periodMenuOpen = ref(false)
const venueMenuOpen = ref(false)

useBodyScrollLock(computed(() => periodMenuOpen.value || venueMenuOpen.value))

const monthLabel = computed(() => `${selectedYear.value}년 ${selectedMonth.value}월`)
const periodLabel = computed(() => showAllPeriod.value ? '전체 기간' : monthLabel.value)
const isCurrentMonth = computed(() =>
  selectedYear.value === now.getFullYear() && selectedMonth.value === now.getMonth() + 1,
)
const selectedVenueLabel = computed(() => venueId.value === null
  ? '전체 매장'
  : venueId.value === 'other'
    ? '기타'
    : venues.value.find((item) => Number(item.id) === Number(venueId.value))?.name
      || props.initialFilter?.venueName
      || '전체 매장')
const goBack = () => {
  if (props.backTo) {
    void router.replace(props.backTo)
    return
  }
  router.back()
}

const moveMonth = (delta) => {
  const date = new Date(selectedYear.value, selectedMonth.value - 1 + delta, 1)
  selectedYear.value = date.getFullYear()
  selectedMonth.value = date.getMonth() + 1
}

watch([selectedYear, selectedMonth, showAllPeriod, venueId], () => {
  emit('change', {
    year: selectedYear.value,
    month: selectedMonth.value,
    allPeriod: showAllPeriod.value,
    venueId: venueId.value,
    venueName: selectedVenueLabel.value,
  })
})

onMounted(async () => {
  try {
    const response = await fetchVenues()
    venues.value = Array.isArray(response) ? response : response?.data?.data || response?.data || []
  } catch {
    venues.value = []
  }
})
</script>

<style scoped>
.detail-header {
  display: grid;
  grid-template-columns: 44px minmax(0, 1fr);
  gap: 8px;
  align-items: center;
  min-height: var(--v2-detail-topbar-height);
}

.detail-header__back {
  width: 44px;
  height: 44px;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--v2-text-main);
  display: grid;
  place-items: center;
}

.detail-header__title {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  margin: -1px;
  padding: 0;
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  white-space: nowrap;
}

.detail-header__filters {
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr);
  width: min(256px, 100%);
  gap: 8px;
  justify-self: end;
}

.venue-filter {
  width: 100%;
  min-width: 0;
  min-height: 38px;
  padding: 0 8px;
  border: 1px solid rgba(109, 69, 232, 0.14);
  border-radius: var(--v2-radius-md);
  background: #fff;
  color: #4f4a5e;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  column-gap: 7px;
  font: inherit;
  font-size: 12px;
  box-shadow: 0 4px 12px rgba(28, 18, 60, 0.035);
}

.month-filter {
  width: 100%;
  min-width: 0;
  min-height: 38px;
  display: grid;
  grid-template-columns: 28px minmax(0, 1fr) 28px;
  align-items: center;
  overflow: hidden;
  border: 1px solid rgba(109, 69, 232, 0.14);
  border-radius: var(--v2-radius-md);
  background: #fff;
  box-shadow: 0 4px 12px rgba(28, 18, 60, 0.035);
}

.month-filter--all {
  grid-template-columns: 1fr;
}

.month-filter > button {
  min-width: 0;
  min-height: 36px;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--v2-text-main);
  display: grid;
  place-items: center;
  font: inherit;
}

.month-filter > button:disabled {
  color: #d6d1df;
}

.month-filter .month-filter__label {
  display: flex;
  gap: 3px;
  justify-content: center;
  color: var(--v2-text-main);
  font-size: 12px;
  font-weight: 560;
  white-space: nowrap;
}

.venue-filter span {
  overflow: hidden;
  min-width: 0;
  color: var(--v2-text-main);
  font-size: 12px;
  font-weight: 650;
  line-height: 1;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (max-width: 360px) {
  .detail-header__filters {
    grid-template-columns: minmax(0, 1.08fr) minmax(0, 1fr);
    gap: 6px;
  }
}
</style>
