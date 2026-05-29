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

      <q-card v-if="loading" flat bordered class="loading-card">
        <q-card-section class="text-center q-py-xl">
          <q-spinner size="32px" color="primary" />
          <div class="text-body2 text-grey-7 q-mt-md">핸드 로그를 불러오는 중입니다.</div>
        </q-card-section>
      </q-card>

      <template v-else>
        <HandLogEmptyState v-if="eventItems.length === 0" @create-event="eventDialog = true" />

        <HandLogEventList
          v-else
          :events="eventItems"
          @create-event="eventDialog = true"
          @open-event="goEventDetail"
        />
      </template>
    </div>

    <HandLogEventDialog v-model="eventDialog" :loading="saving" @save="handleCreateEvent" />
  </q-page>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useAlert } from 'src/composables/useAlert'

import HandLogEmptyState from 'components/hand-log/HandLogEmptyState.vue'
import HandLogEventList from 'components/hand-log/HandLogEventList.vue'
import HandLogEventDialog from 'components/hand-log/HandLogEventDialog.vue'

import { useHandLogStore } from 'stores/handLog'

const router = useRouter()

const alert = useAlert()
const handLogStore = useHandLogStore()

const { eventItems, loading, saving } = storeToRefs(handLogStore)

const eventDialog = ref(false)

onMounted(() => {
  loadEvents()
})

const loadEvents = async () => {
  try {
    await handLogStore.fetchEvents()
  } catch (error) {
    console.error(error)

    alert.show('핸드 로그를 불러오지 못했습니다.', 'error')
  }
}

const handleCreateEvent = async (payload) => {
  if (saving.value) {
    return
  }

  try {
    const eventId = await handLogStore.createEvent(payload)

    if (!eventId) {
      return
    }

    eventDialog.value = false
    goEventDetail(eventId)
  } catch (error) {
    console.error(error)

    alert.show('대회를 생성하지 못했습니다.', 'error')
  }
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

.loading-card {
  border-radius: 16px;
  background: #ffffff;
}
</style>
