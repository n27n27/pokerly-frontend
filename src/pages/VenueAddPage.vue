<template>
  <q-page class="q-pa-md flex flex-center">
    <q-card style="min-width: 360px; max-width: 480px">
      <q-card-section>
        <div class="text-h6">매장 등록</div>
        <div class="text-caption text-grey-7 q-mt-xs">
          자주 가는 매장을 등록해 두면 세션 기록 시 선택할 수 있어요.
        </div>
      </q-card-section>

      <q-card-section class="q-gutter-md">
        <q-input v-model="form.name" label="매장 이름" filled autofocus />

        <q-input
          v-model="form.location"
          label="위치 (선택)"
          filled
          placeholder="예: 강남역 11번 출구 근처"
        />

        <q-input v-model="form.notes" label="메모 (선택)" type="textarea" filled />
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="취소" @click="goBack" />
        <q-btn color="primary" label="저장" @click="save" :loading="saving" :disable="saving" />
      </q-card-actions>
    </q-card>
  </q-page>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAlert } from 'src/composables/useAlert'
import { useVenueStore } from 'stores/venue'

const alert = useAlert()
const router = useRouter()
const venueStore = useVenueStore()
const saving = ref(false)

const form = reactive({
  name: '',
  location: '',
  notes: '',
})

function goBack() {
  router.back()
}

async function save() {
  if (!form.name.trim()) {
    alert.show('매장 이름을 입력해 주세요.', 'warning')
    return
  }

  if (saving.value) return
  saving.value = true

  try {
    const payload = {
      name: form.name,
      location: form.location,
      notes: form.notes,
    }

    const created = await venueStore.addVenue(payload)
    console.log('created venue:', created)
    alert.show('매장이 등록되었습니다.')

    router.back()
  } catch (e) {
    console.error(e)
    if (e.status === 409) {
      alert.show('이미 등록된 매장 이름입니다.', 'warning')
      return
    }
    alert.show('매장 등록 중 오류가 발생했습니다.', 'error')
  } finally {
    saving.value = false
  }
}
</script>
