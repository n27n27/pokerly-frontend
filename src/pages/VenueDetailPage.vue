<template>
  <q-page class="q-pa-md column items-center">
    <!-- 가운데 정렬 + 최대 폭 제한 컨테이너 -->
    <div class="full-width column q-gutter-md" style="max-width: 720px">
      <!-- 헤더 -->
      <div class="row items-center q-mb-md">
        <q-btn flat round icon="arrow_back" @click="goBack" />
        <div class="text-h6 text-weight-bold q-ml-sm">
          {{ venue?.name || '매장 상세' }}
        </div>
        <q-space />
        <q-btn flat icon="delete" color="negative" :loading="deleting" @click="confirmDelete" />
      </div>

      <q-card flat bordered class="q-pa-md q-gutter-md">
        <!-- 기본 정보 -->
        <div class="text-subtitle2 text-grey-7">기본 정보</div>

        <q-input v-model="form.name" label="매장 이름" dense outlined />
        <q-input v-model="form.location" label="위치 (선택)" dense outlined />
        <q-input v-model="form.notes" type="textarea" label="메모 (선택)" dense outlined autogrow />

        <!-- 포인트 -->
        <div class="q-mt-md text-subtitle2 text-grey-7">포인트 잔액</div>
        <q-input v-model.number="form.pointBalance" type="number" dense outlined />

        <div class="row justify-end q-mt-md q-gutter-sm">
          <q-btn flat label="취소" @click="goBack" />
          <q-btn unelevated color="primary" label="저장" @click="save" />
        </div>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { onMounted, reactive, computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useQuasar } from 'quasar'
import { useVenueStore } from 'src/stores/venue'
import { useAlert } from 'src/composables/useAlert'

const alert = useAlert()
const route = useRoute()
const router = useRouter()
const $q = useQuasar()

const venueStore = useVenueStore()
const { currentVenue } = storeToRefs(venueStore)
const { loadVenue, editVenue, removeVenue } = venueStore

const venueId = Number(route.params.id)
const venue = computed(() => currentVenue.value)

const deleting = ref(false)

const form = reactive({
  name: '',
  location: '',
  notes: '',
  pointBalance: 0,
})

const fillFormFromVenue = () => {
  if (!venue.value) return
  form.name = venue.value.name || ''
  form.location = venue.value.location || ''
  form.notes = venue.value.notes || ''
  form.pointBalance = venue.value.pointBalance ?? 0
}

onMounted(async () => {
  await loadVenue(venueId)
  fillFormFromVenue()
})

const save = async () => {
  if (!form.name.trim()) {
    alert.show('매장 이름을 입력해 주세요.', 'warning')
    return
  }

  const payload = {
    name: form.name.trim(),
    location: form.location?.trim() || null,
    notes: form.notes?.trim() || null,
    pointBalance: form.pointBalance ?? 0,
  }

  try {
    await editVenue(venueId, payload)
    alert.show('저장되었습니다.', 'success')
    goBack()
  } catch (e) {
    console.error(e)
    alert.show('저장 중 오류가 발생했습니다.', 'error')
  }
}

const confirmDelete = () => {
  $q.dialog({
    title: '매장 삭제',
    message: '정말 삭제하시겠습니까?',
    cancel: true,
    persistent: true,
    ok: {
      label: '삭제',
      color: 'negative',
    },
    cancelLabel: '취소',
  }).onOk(async () => {
    deleting.value = true
    try {
      await removeVenue(venueId)
      alert.show('매장이 삭제되었습니다.', 'info')
      goBack()
    } catch (e) {
      console.error(e)
      alert.show('매장 삭제 중 오류가 발생했습니다.', 'error')
    } finally {
      deleting.value = false
    }
  })
}

const goBack = () => {
  router.back()
}
</script>
