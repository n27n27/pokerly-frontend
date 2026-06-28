<template>
  <q-card flat bordered class="section-card">
    <q-card-section>
      <div class="row items-center justify-between q-mb-md">
        <div>
          <div class="section-title">대회 목록</div>
          <div class="section-desc">기록할 대회를 선택하면 상세 화면으로 이동합니다.</div>
        </div>

        <q-btn
          color="dark"
          unelevated
          dense
          icon="add_circle"
          label="대회 생성"
          class="create-btn"
          @click="$emit('create-event')"
        />
      </div>

      <q-infinite-scroll :offset="160" :disable="!hasNext || loadingMore" @load="handleLoadMore">
        <div class="column q-gutter-sm">
          <q-card
            v-for="event in events"
            :key="event.id"
            flat
            bordered
            class="event-card"
            @click="$emit('open-event', event.id)"
          >
            <q-card-section class="event-card-section">
              <div class="row items-center no-wrap">
                <div class="col event-main">
                  <div class="event-name">{{ event.name }}</div>

                  <div class="event-meta">
                    {{ event.date || '날짜 미입력' }}
                    <span v-if="event.venueName"> · {{ event.venueName }}</span>
                  </div>
                </div>

                <div class="event-count">
                  <div class="hand-count">{{ event.handCount || 0 }}핸드</div>

                  <div v-if="event.importantCount > 0" class="review-count">
                    복기 {{ event.importantCount }}개
                  </div>
                </div>

                <q-btn
                  flat
                  round
                  dense
                  icon="more_vert"
                  color="grey-7"
                  class="event-menu-btn"
                  @click.stop
                >
                  <q-menu>
                    <q-list dense style="min-width: 120px">
                      <q-item clickable v-close-popup @click="$emit('edit-event', event)">
                        <q-item-section>수정</q-item-section>
                      </q-item>

                      <q-item clickable v-close-popup @click="$emit('delete-event', event)">
                        <q-item-section class="text-negative">삭제</q-item-section>
                      </q-item>
                    </q-list>
                  </q-menu>
                </q-btn>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <template #loading>
          <div class="infinite-loading">
            <q-spinner size="22px" color="primary" />
            <div class="loading-text">이전 대회를 불러오는 중입니다.</div>
          </div>
        </template>
      </q-infinite-scroll>

      <div v-if="!hasNext && events.length > 0" class="end-text">모든 대회를 불러왔습니다.</div>
    </q-card-section>
  </q-card>
</template>

<script setup>
const props = defineProps({
  events: {
    type: Array,
    default: () => [],
  },
  hasNext: {
    type: Boolean,
    default: false,
  },
  loadingMore: {
    type: Boolean,
    default: false,
  },
  onLoadMore: {
    type: Function,
    default: null,
  },
})

defineEmits(['create-event', 'open-event', 'edit-event', 'delete-event'])

const handleLoadMore = async (_index, done) => {
  if (!props.hasNext || props.loadingMore || !props.onLoadMore) {
    done()
    return
  }

  try {
    await props.onLoadMore()
  } finally {
    done()
  }
}
</script>

<style scoped>
.section-card {
  border-radius: 18px;
  background: #ffffff;
}

.section-title {
  font-size: 20px;
  font-weight: 700;
  color: #111111;
  letter-spacing: -0.4px;
}

.section-desc {
  margin-top: 3px;
  font-size: 13px;
  line-height: 1.45;
  color: #777777;
  letter-spacing: -0.25px;
}

.create-btn {
  height: 34px;
  border-radius: 10px;
  padding: 0 13px;
  font-size: 13px;
  font-weight: 700;
}

.event-card {
  border-radius: 16px;
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

.event-card-section {
  padding: 16px 18px;
}

.event-main {
  min-width: 0;
}

.event-name {
  font-size: 16px;
  font-weight: 700;
  line-height: 1.35;
  color: #111111;
  letter-spacing: -0.35px;
  word-break: keep-all;
}

.event-meta {
  margin-top: 5px;
  font-size: 13px;
  line-height: 1.3;
  color: #777777;
}

.event-count {
  flex: 0 0 auto;
  margin-left: 12px;
  text-align: right;
  white-space: nowrap;
}

.hand-count {
  font-size: 15px;
  font-weight: 700;
  color: #111111;
  letter-spacing: -0.3px;
}

.review-count {
  margin-top: 3px;
  font-size: 12px;
  font-weight: 600;
  color: #f08c00;
}

.event-menu-btn {
  margin-left: 6px;
}

.infinite-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 18px 0 6px;
}

.loading-text {
  font-size: 13px;
  color: #777777;
  letter-spacing: -0.25px;
}

.end-text {
  padding: 18px 0 4px;
  text-align: center;
  font-size: 12px;
  color: #999999;
  letter-spacing: -0.25px;
}

@media (max-width: 599px) {
  .section-card {
    border-radius: 16px;
  }

  .section-desc {
    display: none;
  }

  .event-card-section {
    padding: 15px 16px;
  }

  .event-name {
    font-size: 15px;
  }

  .hand-count {
    font-size: 14px;
  }
}
</style>
