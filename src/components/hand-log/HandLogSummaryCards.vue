<template>
  <q-card flat bordered class="section-card q-mb-md">
    <q-card-section>
      <div class="row items-center justify-between q-mb-sm">
        <div>
          <div class="text-subtitle1 text-weight-bold">선택된 대회 요약</div>
          <div class="text-caption text-grey-7">
            {{ event?.name }}
          </div>
        </div>
      </div>

      <div class="row q-col-gutter-sm">
        <div class="col-6 col-md-3">
          <q-card flat class="summary-card">
            <div class="summary-label">기록 핸드</div>
            <div class="summary-value">{{ totalHandCount }}개</div>
          </q-card>
        </div>

        <div class="col-6 col-md-3">
          <q-card flat class="summary-card">
            <div class="summary-label">중요 핸드</div>
            <div class="summary-value">{{ importantHandCount }}개</div>
          </q-card>
        </div>

        <div class="col-6 col-md-3">
          <q-card flat class="summary-card">
            <div class="summary-label">승리 기록</div>
            <div class="summary-value text-positive">{{ resultStats.winCount }}개</div>
          </q-card>
        </div>

        <div class="col-6 col-md-3">
          <q-card flat class="summary-card">
            <div class="summary-label">패배 기록</div>
            <div class="summary-value text-negative">{{ resultStats.lossCount }}개</div>
          </q-card>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
defineProps({
  event: {
    type: Object,
    default: null,
  },
  totalHandCount: {
    type: Number,
    default: 0,
  },
  importantHandCount: {
    type: Number,
    default: 0,
  },
  resultStats: {
    type: Object,
    default: () => ({
      winCount: 0,
      lossCount: 0,
      foldCount: 0,
      showdownCount: 0,
    }),
  },
})
</script>

<style scoped>
.section-card {
  border-radius: 16px;
  background: #ffffff;
}

.summary-card {
  border-radius: 14px;
  background: #f4f5f7;
  padding: 12px;
}

.summary-label {
  font-size: 12px;
  color: #777;
}

.summary-value {
  font-size: 18px;
  font-weight: 700;
  margin-top: 2px;
}
</style>
