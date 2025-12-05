<template>
  <div class="journal-view q-gutter-md">
    <!-- 제목 + 내용 -->
    <div class="q-mb-md">
      <div class="text-subtitle1 q-mb-xs">
        {{ journal.title || '제목 없음' }}
      </div>

      <div v-if="journal.content" class="q-mt-xs">
        <div class="text-body2">
          {{ journal.content }}
        </div>
      </div>
    </div>

    <!-- 수정 / 삭제 버튼: 본문 아래, 우측 정렬 -->
    <div class="row justify-end q-gutter-sm q-mb-md action-area">
      <q-btn flat dense icon="edit" color="primary" label="수정" @click="$emit('edit')" />
      <q-btn flat dense round icon="delete" color="negative" @click="confirmDelete" />
    </div>

    <q-separator />

    <!-- 상태 점수 2 x 2 -->
    <div class="q-mb-md">
      <div class="text-caption text-grey-7 q-mb-xs">오늘의 상태</div>
      <div class="row q-col-gutter-md">
        <div class="col-6">
          <div class="row items-center no-wrap score-row">
            <span class="score-emoji">😊</span>
            <span class="text-body2">기분: {{ journal.moodScore }}</span>
          </div>
        </div>
        <div class="col-6">
          <div class="row items-center no-wrap score-row">
            <span class="score-emoji">🧠</span>
            <span class="text-body2">집중도: {{ journal.focusScore }}</span>
          </div>
        </div>
        <div class="col-6">
          <div class="row items-center no-wrap score-row">
            <span class="score-emoji">🔥</span>
            <span class="text-body2">틸트: {{ journal.tiltScore }}</span>
          </div>
        </div>
        <div class="col-6">
          <div class="row items-center no-wrap score-row">
            <span class="score-emoji">⚡️</span>
            <span class="text-body2">체력: {{ journal.energyScore }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 태그 -->
    <div v-if="tags.length">
      <div class="text-caption text-grey-7 q-mb-xs">태그</div>
      <div>
        <q-chip
          v-for="tag in tags"
          :key="tag"
          dense
          outline
          color="primary"
          text-color="primary"
          class="q-mr-xs q-mb-xs"
        >
          {{ tag }}
        </q-chip>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useQuasar } from 'quasar'

const props = defineProps({
  journal: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['edit', 'delete'])
const $q = useQuasar()

// 콤마 기준 태그 분리
const tags = computed(() =>
  (props.journal.tags || '')
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean),
)

// 삭제 확인 다이얼로그
const confirmDelete = () => {
  $q.dialog({
    title: '일지 삭제',
    message: '이 일지를 정말 삭제할까요? 되돌릴 수 없습니다.',
    cancel: { label: '취소', color: 'grey-7' },
    ok: { label: '삭제', color: 'negative' },
    persistent: true,
  }).onOk(() => {
    emit('delete')
  })
}
</script>

<style scoped>
/* 카드 헤더(날짜) 바로 밑에서 살짝 여백만 */
.journal-view {
  margin-top: 8px;
}

/* 본문과 액션 영역을 자연스럽게 분리 */
.action-area {
  margin-top: 4px;
  opacity: 0.9;
}

.action-area:hover {
  opacity: 1;
}

/* 상태 이모지 강조 */
.score-emoji {
  font-size: 20px;
  margin-right: 6px;
}

.score-row {
  padding: 4px 0;
}
</style>
