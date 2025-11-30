<template>
  <q-page class="q-pa-md column items-center">
    <!-- 컨테이너: 최대 폭 제한 -->
    <div class="full-width column q-gutter-md" style="max-width: 720px">
      <!-- 상단 타이틀 + 추가 버튼 -->
      <div class="row items-center justify-between">
        <div class="text-h6 text-weight-bold">매장 목록</div>
        <q-btn color="primary" label="매장 추가" icon="add" @click="openCreateDialog" />
      </div>

      <!-- 검색 + 정렬 -->
      <div class="row q-gutter-sm items-center">
        <div class="col-grow">
          <q-input
            v-model="search"
            dense
            outlined
            placeholder="매장 이름 검색"
            clearable
            debounce="200"
          >
            <template #prepend>
              <q-icon name="search" />
            </template>
          </q-input>
        </div>

        <div>
          <q-select
            v-model="sortBy"
            :options="sortOptions"
            dense
            outlined
            emit-value
            map-options
            style="min-width: 140px"
          />
        </div>
      </div>

      <!-- 리스트 없음 -->
      <q-card flat bordered v-if="filteredVenues.length === 0">
        <q-card-section class="text-grey-7">
          등록된 매장이 없습니다. 오른쪽 상단의 <b>매장 추가</b> 버튼으로 등록하세요.
        </q-card-section>
      </q-card>

      <!-- 리스트 있음 -->
      <q-list v-else bordered class="rounded-borders">
        <q-item v-for="v in filteredVenues" :key="v.id" clickable @click="goDetail(v.id)">
          <q-item-section>
            <div class="row items-center justify-between">
              <!-- 왼쪽: 이름 + 위치 -->
              <div>
                <div class="text-subtitle1 text-weight-medium">
                  {{ v.name }}
                </div>
                <div class="text-caption text-grey-7" v-if="v.location">
                  {{ v.location }}
                </div>
              </div>

              <!-- 오른쪽: 포인트 잔액 -->
              <div class="column items-end">
                <div class="text-caption text-grey-7">포인트</div>
                <div class="text-body1 text-weight-bold">
                  {{ v.pointBalance ?? 0 }}
                </div>
              </div>
            </div>
          </q-item-section>

          <q-item-section side>
            <q-btn flat round icon="edit" @click.stop="openEditDialog(v)" />
          </q-item-section>
        </q-item>
      </q-list>
    </div>

    <!-- 다이얼로그 -->
    <q-dialog v-model="dialog.visible">
      <q-card style="min-width: 360px">
        <q-card-section class="text-h6 text-weight-bold">
          {{ dialog.mode === 'create' ? '매장 추가' : '매장 수정' }}
        </q-card-section>

        <q-card-section class="q-gutter-md">
          <q-input v-model="form.name" label="매장 이름" dense outlined />
          <q-input v-model="form.location" label="위치 (선택)" dense outlined />
          <q-input
            v-model="form.notes"
            type="textarea"
            label="메모 (선택)"
            dense
            outlined
            autogrow
          />
          <q-input
            v-model.number="form.pointBalance"
            type="number"
            label="포인트 잔액"
            dense
            outlined
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="취소" v-close-popup />
          <q-btn
            unelevated
            color="primary"
            :label="dialog.mode === 'create' ? '추가' : '저장'"
            @click="onSubmit"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { computed, reactive, ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useVenueStore } from 'src/stores/venue'
import { useAlert } from 'src/composables/useAlert'

const alert = useAlert()
const router = useRouter()

// Pinia 스토어
const venueStore = useVenueStore()
const { venues } = storeToRefs(venueStore) // ⭐ 반드시 storeToRefs 사용
const { loadVenues, addVenue, editVenue } = venueStore

const search = ref('')
const sortBy = ref('pointDesc')

const sortOptions = [
  { label: '포인트 많은 순', value: 'pointDesc' },
  { label: '이름순', value: 'name' },
]

// 다이얼로그 상태
const dialog = reactive({
  visible: false,
  mode: 'create',
  targetId: null,
})

// 폼 초기 값
const emptyForm = () => ({
  name: '',
  location: '',
  notes: '',
  pointBalance: 0,
})

const form = reactive(emptyForm())

// 최초 로드
onMounted(() => {
  loadVenues()
})

// 리스트 필터링/정렬
const filteredVenues = computed(() => {
  let list = [...(venues.value || [])] // ⭐ 꼭 venues.value

  if (search.value) {
    const s = search.value.toLowerCase()
    list = list.filter((v) => v.name?.toLowerCase().includes(s))
  }

  if (sortBy.value === 'name') {
    list.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
  } else if (sortBy.value === 'pointDesc') {
    list.sort((a, b) => (b.pointBalance || 0) - (a.pointBalance || 0))
  }

  return list
})

// 다이얼로그 열기
const openCreateDialog = () => {
  Object.assign(form, emptyForm())
  dialog.mode = 'create'
  dialog.targetId = null
  dialog.visible = true
}

const openEditDialog = (v) => {
  Object.assign(form, {
    name: v.name || '',
    location: v.location || '',
    notes: v.notes || '',
    pointBalance: v.pointBalance ?? 0,
  })
  dialog.mode = 'edit'
  dialog.targetId = v.id
  dialog.visible = true
}

// 저장 처리
const onSubmit = async () => {
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
    if (dialog.mode === 'create') {
      await addVenue(payload)
      alert.show('매장이 추가되었습니다.', 'success')
    } else {
      await editVenue(dialog.targetId, payload)
      alert.show('매장이 수정되었습니다.', 'success')
    }
    dialog.visible = false
  } catch (e) {
    console.error(e)
    alert.show('저장 중 오류가 발생했습니다.', 'error')
  }
}

// 상세로 이동
const goDetail = (id) => {
  router.push(`/app/venues/${id}`)
}
</script>
