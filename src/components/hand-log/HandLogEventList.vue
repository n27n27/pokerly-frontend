<template>
  <q-card flat bordered class="section-card q-mb-md">
    <q-card-section>
      <div class="row items-center justify-between q-mb-sm">
        <div>
          <div class="text-subtitle1 text-weight-bold">대회 목록</div>
          <div class="text-caption text-grey-7">기록할 대회를 선택한 뒤 핸드를 추가합니다.</div>
        </div>

        <q-btn
          color="dark"
          unelevated
          dense
          icon="add_circle"
          label="대회 생성"
          @click="$emit('create-event')"
        />
      </div>

      <div class="column q-gutter-sm">
        <q-card
          v-for="event in events"
          :key="event.id"
          flat
          bordered
          class="event-card"
          :class="{ 'event-card--active': event.id === selectedEventId }"
          @click="onClickEvent(event.id)"
        >
          <q-card-section>
            <div class="row items-start justify-between q-gutter-sm">
              <div class="col">
                <div class="row items-center q-gutter-sm">
                  <div class="text-weight-bold">{{ event.name }}</div>

                  <q-badge
                    v-if="event.id === selectedEventId"
                    color="blue-7"
                    text-color="white"
                    rounded
                    label="선택됨"
                  />
                </div>

                <div class="text-caption text-grey-7 q-mt-xs">
                  {{ event.date || '날짜 미입력' }}
                  <span v-if="event.venueName"> · {{ event.venueName }}</span>
                </div>
              </div>

              <div class="text-right">
                <div class="text-caption text-grey-7">기록 핸드</div>
                <div class="text-weight-bold">{{ event.handCount }}개</div>

                <div v-if="event.importantCount > 0" class="text-caption text-amber-9 q-mt-xs">
                  중요 {{ event.importantCount }}개
                </div>
              </div>
            </div>

            <div v-if="event.id === selectedEventId" class="q-mt-sm">
              <q-btn
                class="full-width"
                color="primary"
                unelevated
                icon="add"
                label="이 대회에 기록"
                @click.stop="$emit('quick-log')"
              />
            </div>
          </q-card-section>
        </q-card>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
defineProps({
  events: {
    type: Array,
    default: () => [],
  },
  selectedEventId: {
    type: Number,
    default: null,
  },
})

const emit = defineEmits(['create-event', 'open-event'])
const onClickEvent = (eventId) => {
  emit('open-event', eventId)
}
</script>

<style scoped>
.section-card {
  border-radius: 16px;
  background: #ffffff;
}

.event-card {
  border-radius: 14px;
  background: #ffffff;
  cursor: pointer;
  transition:
    border-color 0.15s ease,
    background-color 0.15s ease,
    transform 0.15s ease;
}

.event-card:hover {
  background: #fafafa;
}

.event-card--active {
  border-color: #1976d2;
  background: #f3f8ff;
}
</style>
