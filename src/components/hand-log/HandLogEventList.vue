<template>
  <div class="hand-log-event-list">
    <div class="list-header">
      <div class="title-area">
        <div class="page-title">대회 목록</div>

        <div v-if="!hasEvents" class="page-desc">대회를 생성한 뒤 핸드를 기록할 수 있습니다.</div>
      </div>

      <q-btn unelevated color="dark" class="create-btn" @click="emit('create-event')">
        <q-icon name="add_circle" size="20px" class="q-mr-xs" />
        대회 생성
      </q-btn>
    </div>

    <div v-if="!hasEvents" class="empty-card">
      <q-icon name="event_note" size="42px" class="empty-icon" />

      <div class="empty-title">아직 등록된 대회가 없습니다</div>

      <div class="empty-desc">대회를 생성하고 핸드 기록을 시작해보세요.</div>
    </div>

    <template v-else>
      <section v-if="recentEvents.length > 0" class="event-section">
        <div class="section-header">
          <div>
            <div class="section-title">최근 대회</div>
            <div class="section-desc">최근 날짜 기준 최대 5개</div>
          </div>
        </div>

        <div class="event-grid">
          <div
            v-for="event in recentEvents"
            :key="event.id"
            class="event-card"
            @click="openEvent(event)"
          >
            <div class="event-left">
              <div class="event-name">
                {{ event.name || '이름 없는 대회' }}
              </div>

              <div class="event-meta">
                {{ formatEventDate(event.date) }}
              </div>
            </div>

            <div class="event-right">
              <q-btn flat dense round icon="more_vert" class="menu-btn" @click.stop>
                <q-menu anchor="bottom right" self="top right" class="event-action-menu">
                  <q-list dense class="event-action-list">
                    <q-item clickable v-close-popup @click.stop="editEvent(event)">
                      <q-item-section avatar>
                        <q-icon name="edit" size="18px" />
                      </q-item-section>
                      <q-item-section> 대회 수정 </q-item-section>
                    </q-item>

                    <q-separator />

                    <q-item
                      clickable
                      v-close-popup
                      class="delete-action"
                      @click.stop="deleteEvent(event)"
                    >
                      <q-item-section avatar>
                        <q-icon name="delete_outline" size="18px" />
                      </q-item-section>
                      <q-item-section> 대회 삭제 </q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-btn>

              <div class="hand-count">
                {{ formatHandCount(event.handCount) }}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section v-if="previousEvents.length > 0" class="event-section previous-section">
        <div class="section-header">
          <div>
            <div class="section-title">이전 대회</div>
            <div class="section-desc">최근 대회를 제외한 나머지</div>
          </div>
        </div>

        <div class="event-grid">
          <div
            v-for="event in previousEvents"
            :key="event.id"
            class="event-card previous-card"
            @click="openEvent(event)"
          >
            <div class="event-left">
              <div class="event-name">
                {{ event.name || '이름 없는 대회' }}
              </div>

              <div class="event-meta">
                {{ formatEventDate(event.date) }}
              </div>
            </div>

            <div class="event-right">
              <q-btn flat dense round icon="more_vert" class="menu-btn" @click.stop>
                <q-menu anchor="bottom right" self="top right" class="event-action-menu">
                  <q-list dense class="event-action-list">
                    <q-item clickable v-close-popup @click.stop="editEvent(event)">
                      <q-item-section avatar>
                        <q-icon name="edit" size="18px" />
                      </q-item-section>
                      <q-item-section> 대회 수정 </q-item-section>
                    </q-item>

                    <q-separator />

                    <q-item
                      clickable
                      v-close-popup
                      class="delete-action"
                      @click.stop="deleteEvent(event)"
                    >
                      <q-item-section avatar>
                        <q-icon name="delete_outline" size="18px" />
                      </q-item-section>
                      <q-item-section> 대회 삭제 </q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-btn>

              <div class="hand-count">
                {{ formatHandCount(event.handCount) }}
              </div>
            </div>
          </div>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  events: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['create-event', 'open-event', 'edit-event', 'delete-event'])

const RECENT_EVENT_LIMIT = 5

const hasEvents = computed(() => props.events.length > 0)

const sortedEvents = computed(() => {
  return [...props.events].sort((a, b) => {
    const dateResult = compareDesc(a.date, b.date)

    if (dateResult !== 0) {
      return dateResult
    }

    return compareDesc(a.createdAt, b.createdAt)
  })
})

const recentEvents = computed(() => {
  return sortedEvents.value.slice(0, RECENT_EVENT_LIMIT)
})

const previousEvents = computed(() => {
  return sortedEvents.value.slice(RECENT_EVENT_LIMIT)
})

function compareDesc(a, b) {
  const valueA = a || ''
  const valueB = b || ''

  if (valueA < valueB) return 1
  if (valueA > valueB) return -1
  return 0
}

function openEvent(event) {
  if (!event?.id) {
    return
  }

  emit('open-event', event.id)
}

function editEvent(event) {
  emit('edit-event', event)
}

function deleteEvent(event) {
  emit('delete-event', event)
}

function formatEventDate(date) {
  // event.date는 LocalDate 문자열이므로 timezone 변환 없이 그대로 표시
  return date || '-'
}

function formatHandCount(count) {
  const safeCount = Number(count || 0)
  return `${safeCount.toLocaleString('ko-KR')}핸드`
}
</script>

<style scoped>
.hand-log-event-list {
  width: 100%;
  max-width: 420px;
  margin: 0 auto;
  padding: 14px 16px 28px;
}

.list-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.title-area {
  min-width: 0;
  flex: 1;
}

.page-title {
  font-size: 18px;
  font-weight: 800;
  line-height: 1.2;
  color: #171717;
  letter-spacing: -0.4px;
}

.page-desc {
  margin-top: 6px;
  font-size: 12px;
  line-height: 1.35;
  color: #8a8a8a;
  letter-spacing: -0.2px;
}

.create-btn {
  height: 34px;
  min-height: 34px;
  padding: 0 12px;
  border-radius: 9px;
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
}

.empty-card {
  margin-top: 18px;
  padding: 36px 18px;
  border: 1px solid #eeeeee;
  border-radius: 18px;
  background: #ffffff;
  text-align: center;
}

.empty-icon {
  color: #b5b5b5;
}

.empty-title {
  margin-top: 12px;
  font-size: 15px;
  font-weight: 800;
  color: #222222;
  letter-spacing: -0.3px;
}

.empty-desc {
  margin-top: 6px;
  font-size: 12px;
  color: #888888;
  letter-spacing: -0.2px;
}

.event-section {
  margin-top: 14px;
}

.previous-section {
  margin-top: 26px;
}

.section-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin: 0 2px 10px;
}

.section-title {
  font-size: 12px;
  font-weight: 800;
  color: #777777;
  letter-spacing: -0.2px;
}

.section-desc {
  display: none;
  margin-top: 4px;
  font-size: 11px;
  color: #aaaaaa;
  letter-spacing: -0.2px;
}

.event-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 9px;
}

.event-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 68px;
  padding: 12px 10px 12px 16px;
  border: 1px solid #e8e8e8;
  border-radius: 15px;
  background: #ffffff;
  cursor: pointer;
  transition:
    transform 0.12s ease,
    background-color 0.12s ease,
    border-color 0.12s ease,
    box-shadow 0.12s ease;
}

.event-card:active {
  transform: scale(0.985);
  background-color: #fafafa;
  border-color: #dddddd;
}

.previous-card {
  background: #ffffff;
}

.event-left {
  min-width: 0;
  flex: 1;
}

.event-name {
  font-size: 14px;
  font-weight: 800;
  line-height: 1.25;
  color: #191919;
  letter-spacing: -0.35px;
  word-break: break-word;
}

.event-meta {
  margin-top: 7px;
  font-size: 12px;
  line-height: 1;
  color: #7f7f7f;
  letter-spacing: -0.2px;
}

.event-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;
  min-width: 58px;
}

.menu-btn {
  margin-top: -5px;
  margin-right: -6px;
  color: #777777;
}

.hand-count {
  margin-top: 1px;
  font-size: 13px;
  font-weight: 800;
  line-height: 1.1;
  color: #191919;
  white-space: nowrap;
  letter-spacing: -0.25px;
}

.event-action-menu {
  border-radius: 12px;
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.12);
}

.event-action-list {
  min-width: 136px;
  padding: 6px;
}

.event-action-list :deep(.q-item) {
  min-height: 36px;
  border-radius: 8px;
  font-size: 13px;
  letter-spacing: -0.2px;
}

.event-action-list :deep(.q-item__section--avatar) {
  min-width: 30px;
}

.delete-action {
  color: #d64545;
}

@media (min-width: 768px) {
  .hand-log-event-list {
    max-width: 760px;
    padding: 18px 18px 36px;
  }

  .list-header {
    align-items: center;
    margin-bottom: 18px;
  }

  .page-title {
    font-size: 20px;
  }

  .section-desc {
    display: block;
  }

  .event-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

  .event-card {
    min-height: 74px;
    padding: 14px 12px 14px 18px;
  }

  .event-card:hover {
    background-color: #fafafa;
    border-color: #dcdcdc;
    box-shadow: 0 8px 22px rgba(0, 0, 0, 0.045);
  }
}

@media (min-width: 1180px) {
  .hand-log-event-list {
    max-width: 960px;
    padding-top: 22px;
  }

  .event-grid {
    gap: 14px;
  }

  .event-card {
    min-height: 76px;
  }
}
</style>
