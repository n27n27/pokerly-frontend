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
        <HandLogEmptyState v-if="eventItems.length === 0" @create-event="openCreateEventDialog" />

        <HandLogEventList
          v-else
          :events="eventItems"
          @create-event="openCreateEventDialog"
          @open-event="goEventDetail"
          @edit-event="openEditEventDialog"
          @delete-event="confirmDeleteEvent"
        />
      </template>
    </div>

    <HandLogEventDialog
      v-model="eventDialog"
      :mode="eventDialogMode"
      :initial-event="editingEvent"
      :loading="eventDialogLoading"
      @save="handleSaveEvent"
    />

    <q-dialog v-model="deleteDialog" :persistent="deleting">
      <q-card class="delete-dialog-card">
        <q-card-section class="delete-dialog-section">
          <div class="delete-question">
            <span class="delete-event-name">{{ deleteTargetName }}</span>
            대회를 삭제할까요?
          </div>

          <div class="delete-warning">삭제한 대회는 복구할 수 없습니다.</div>
        </q-card-section>

        <q-card-actions align="right" class="delete-dialog-actions">
          <q-btn
            flat
            color="grey-8"
            label="취소"
            class="delete-cancel-btn"
            :disable="deleting"
            @click="closeDeleteDialog"
          />

          <q-btn
            unelevated
            color="negative"
            label="삭제"
            class="delete-submit-btn"
            :loading="deleting"
            @click="handleDeleteEvent"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useAlert } from 'src/composables/useAlert'

import HandLogEmptyState from 'components/hand-log/HandLogEmptyState.vue'
import HandLogEventList from 'components/hand-log/HandLogEventList.vue'
import HandLogEventDialog from 'components/hand-log/HandLogEventDialog.vue'

import { useHandLogStore } from 'stores/handLog'
import { updateHandLogEvent, deleteHandLogEvent } from 'src/api/handLogApi'

const router = useRouter()

const alert = useAlert()
const handLogStore = useHandLogStore()

const { eventItems, loading, saving } = storeToRefs(handLogStore)

const eventDialog = ref(false)
const eventDialogMode = ref('create')
const editingEvent = ref(null)

const updating = ref(false)

const deleteDialog = ref(false)
const deleteTargetEvent = ref(null)
const deleting = ref(false)

const eventDialogLoading = computed(() => {
  return saving.value || updating.value
})

const deleteTargetName = computed(() => {
  return deleteTargetEvent.value?.name || '이름 없는 대회'
})

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

const openCreateEventDialog = () => {
  eventDialogMode.value = 'create'
  editingEvent.value = null
  eventDialog.value = true
}

const openEditEventDialog = (event) => {
  if (!event?.id) {
    return
  }

  eventDialogMode.value = 'edit'
  editingEvent.value = event
  eventDialog.value = true
}

const handleSaveEvent = async (payload) => {
  if (eventDialogLoading.value) {
    return
  }

  if (eventDialogMode.value === 'edit') {
    await handleUpdateEvent(payload)
    return
  }

  await handleCreateEvent(payload)
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

const handleUpdateEvent = async (payload) => {
  if (!editingEvent.value?.id || updating.value) {
    return
  }

  try {
    updating.value = true

    await updateHandLogEvent(editingEvent.value.id, payload)

    eventDialog.value = false
    editingEvent.value = null

    await loadEvents()

    alert.show('대회가 수정되었습니다.', 'success')
  } catch (error) {
    console.error(error)

    alert.show('대회를 수정하지 못했습니다.', 'error')
  } finally {
    updating.value = false
  }
}

const confirmDeleteEvent = (event) => {
  if (!event?.id || deleting.value) {
    return
  }

  const handCount = Number(event.handCount || 0)

  if (handCount > 0) {
    alert.show('기록된 핸드가 있는 대회는 삭제할 수 없습니다.', 'warning')
    return
  }

  deleteTargetEvent.value = event
  deleteDialog.value = true
}

const closeDeleteDialog = () => {
  if (deleting.value) {
    return
  }

  deleteDialog.value = false
  deleteTargetEvent.value = null
}

const handleDeleteEvent = async () => {
  if (!deleteTargetEvent.value?.id || deleting.value) {
    return
  }

  try {
    deleting.value = true

    await deleteHandLogEvent(deleteTargetEvent.value.id)

    deleteDialog.value = false
    deleteTargetEvent.value = null

    await loadEvents()

    alert.show('대회가 삭제되었습니다.', 'success')
  } catch (error) {
    console.error(error)

    const status = error?.response?.status
    const code = error?.response?.data?.error?.code

    if (status === 409 || code === 'EVENT_HAS_HANDS') {
      alert.show('기록된 핸드가 있는 대회는 삭제할 수 없습니다.', 'warning')
      return
    }

    alert.show('대회를 삭제하지 못했습니다.', 'error')
  } finally {
    deleting.value = false
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

.delete-dialog-card {
  width: calc(100vw - 48px);
  max-width: 320px;
  border-radius: 14px;
  background: #ffffff;
  overflow: hidden;
}

.delete-dialog-section {
  padding: 22px 20px 12px;
}

.delete-question {
  font-size: 15px;
  font-weight: 500;
  line-height: 1.45;
  color: #222222;
  letter-spacing: -0.35px;
}

.delete-event-name {
  font-weight: 800;
  color: #111111;
}

.delete-warning {
  margin-top: 8px;
  font-size: 12px;
  line-height: 1.4;
  color: #d64545;
  letter-spacing: -0.25px;
}

.delete-dialog-actions {
  padding: 8px 14px 14px;
}

.delete-cancel-btn,
.delete-submit-btn {
  min-width: 60px;
  height: 34px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 700;
}

.delete-cancel-btn {
  color: #666666;
}
</style>
