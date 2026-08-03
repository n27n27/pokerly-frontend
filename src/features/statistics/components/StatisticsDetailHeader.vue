<template>
  <header class="detail-header">
    <button class="detail-header__back" type="button" :aria-label="`${title} 닫기`" @click="router.back()">
      <q-icon name="chevron_left" size="27px" />
    </button>
    <div class="detail-header__filters">
      <div class="month-filter" :class="{ 'month-filter--all': showAllPeriod }">
        <button type="button" aria-label="이전 달" :disabled="showAllPeriod" @click="moveMonth(-1)">
          <q-icon name="chevron_left" size="19px" />
        </button>
        <button class="month-filter__label" type="button">
          <span>{{ periodLabel }}</span>
          <q-menu class="stats-filter-menu" anchor="bottom middle" self="top middle">
            <q-list>
              <q-item clickable v-close-popup @click="showAllPeriod = false">
                <q-item-section>{{ monthLabel }}</q-item-section>
              </q-item>
              <q-item clickable v-close-popup @click="showAllPeriod = true">
                <q-item-section>전체 기간</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </button>
        <button type="button" aria-label="다음 달" :disabled="showAllPeriod || isCurrentMonth" @click="moveMonth(1)">
          <q-icon name="chevron_right" size="19px" />
        </button>
      </div>

      <button class="venue-filter" type="button">
        <q-icon name="store" size="18px" />
        <span>{{ selectedVenueLabel }}</span>
        <q-icon name="expand_more" size="18px" />
        <q-menu class="stats-filter-menu" anchor="bottom right" self="top right">
          <q-list>
            <q-item clickable v-close-popup @click="venueId = null">
              <q-item-section>전체 매장</q-item-section>
            </q-item>
            <q-item v-for="venue in venues" :key="venue.id" clickable v-close-popup @click="venueId = venue.id">
              <q-item-section>{{ venue.name }}</q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="venueId = 'other'">
              <q-item-section>기타</q-item-section>
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
import { fetchVenues } from 'src/api/venue'

defineProps({
  title: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['change'])
const router = useRouter()
const now = new Date()
const selectedYear = ref(now.getFullYear())
const selectedMonth = ref(now.getMonth() + 1)
const showAllPeriod = ref(false)
const venueId = ref(null)
const venues = ref([])

const monthLabel = computed(() => `${selectedYear.value}년 ${selectedMonth.value}월`)
const periodLabel = computed(() => showAllPeriod.value ? '전체 기간' : monthLabel.value)
const isCurrentMonth = computed(() =>
  selectedYear.value === now.getFullYear() && selectedMonth.value === now.getMonth() + 1,
)
const selectedVenueLabel = computed(() => venueId.value === null
  ? '전체 매장'
  : venueId.value === 'other'
    ? '기타'
    : venues.value.find((item) => Number(item.id) === Number(venueId.value))?.name || '전체 매장')

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
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 6px 10px;
  align-items: start;
  min-height: 38px;
}

.detail-header__back {
  width: 38px;
  height: 38px;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--v2-text-main);
  display: grid;
  place-items: center;
  transform: translateY(-8px);
}

.detail-header__filters {
  display: flex;
  justify-content: flex-end;
  gap: 6px;
  transform: translateY(-8px);
}

.venue-filter {
  min-width: 112px;
  min-height: 38px;
  padding: 0 8px;
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-md);
  background: #fff;
  color: #4f4a5e;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  column-gap: 7px;
  font: inherit;
  font-size: 12px;
}

.month-filter {
  min-width: 156px;
  min-height: 38px;
  display: grid;
  grid-template-columns: 32px minmax(88px, 1fr) 32px;
  align-items: center;
  overflow: hidden;
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-md);
  background: #fff;
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
  font-weight: 520;
  line-height: 1;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (max-width: 420px) {
  .detail-header {
    gap: 6px 8px;
  }

  .detail-header__filters {
    gap: 5px;
  }

  .venue-filter {
    min-width: 104px;
  }

  .month-filter {
    min-width: 148px;
  }
}

@media (max-width: 360px) {
  .venue-filter {
    min-width: 98px;
  }

  .month-filter {
    min-width: 138px;
  }
}
</style>
