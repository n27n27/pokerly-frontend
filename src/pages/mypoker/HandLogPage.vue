<template>
  <q-page class="hand-log-page q-pa-md">
    <div class="page-container">
      <div class="q-mb-md">
        <div class="row items-center q-gutter-sm">
          <div class="text-h5 text-weight-bold">핸드 로그</div>
          <q-badge color="orange-8" text-color="white" rounded label="BETA" />
        </div>

        <div class="text-body2 text-grey-7 q-mt-xs">
          대회별로 주요 핸드를 기록하고, 나중에 복기와 상담에 활용합니다.
        </div>
      </div>

      <HandLogEmptyState v-if="events.length === 0" @create-event="eventDialog = true" />

      <HandLogEventList
        v-else
        :events="eventItems"
        @create-event="eventDialog = true"
        @open-event="goEventDetail"
      />
    </div>

    <HandLogEventDialog v-model="eventDialog" @save="handleCreateEvent" />
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'

import HandLogEmptyState from 'components/hand-log/HandLogEmptyState.vue'
import HandLogEventList from 'components/hand-log/HandLogEventList.vue'
import HandLogEventDialog from 'components/hand-log/HandLogEventDialog.vue'

import { useHandLogStore } from 'stores/handLog'

const router = useRouter()
const handLogStore = useHandLogStore()

const { events, eventItems } = storeToRefs(handLogStore)

const eventDialog = ref(false)

const handleCreateEvent = (payload) => {
  const eventId = handLogStore.createEvent(payload)

  if (!eventId) {
    return
  }

  goEventDetail(eventId)
}

const goEventDetail = (eventId) => {
  router.push(`/app/mypoker/hand-log/${eventId}`)
}
</script>

<style scoped>
.hand-log-page {
  background: #f7f7f8;
}

.page-container {
  max-width: 1080px;
  margin: 0 auto;
}
</style>
