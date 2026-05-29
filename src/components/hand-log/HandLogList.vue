<template>
  <q-card flat bordered class="section-card">
    <q-card-section>
      <div class="row items-center justify-between q-mb-md">
        <div>
          <div class="text-subtitle1 text-weight-bold">대회 목록</div>
          <div class="text-caption text-grey-7">
            기록할 대회를 선택하면 상세 화면으로 이동합니다.
          </div>
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
          @click="$emit('open-event', event.id)"
        >
          <q-card-section>
            <div class="row items-start justify-between q-gutter-sm">
              <div class="col">
                <div class="row items-center q-gutter-sm">
                  <div class="text-weight-bold">{{ event.name }}</div>
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

              <q-item-section side>
                <q-icon name="chevron_right" color="grey-5" />
              </q-item-section>
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
})

defineEmits(['create-event', 'open-event'])
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
  border-color: #c9d7ff;
}
</style>
