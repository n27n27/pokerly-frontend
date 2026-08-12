<template>
  <section class="play-summary" :aria-label="title">
    <div class="play-summary__grid">
      <div v-for="item in items" :key="item.label" :class="`play-summary__item--${item.tone || 'default'}`">
        <span>{{ item.label }}</span>
        <strong>{{ item.value }}</strong>
      </div>
    </div>
  </section>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
  items: { type: Array, required: true },
})
</script>

<style scoped>
.play-summary {
  min-width: 0;
}

.play-summary__grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  overflow: hidden;
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-md);
  background: rgba(255, 255, 255, 0.78);
  box-shadow: 0 4px 12px rgba(28, 18, 60, 0.02);
}

.play-summary__grid > div {
  min-width: 0;
  min-height: 52px;
  display: grid;
  grid-template-rows: auto auto;
  align-content: center;
  justify-items: center;
  gap: 4px;
  padding: 8px 5px;
  text-align: center;
}

.play-summary__grid > div + div {
  border-left: 1px solid var(--v2-border);
}

.play-summary span {
  overflow: hidden;
  max-width: 100%;
  color: var(--v2-text-sub);
  font-size: 9px;
  line-height: 13px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.play-summary strong {
  max-width: 100%;
  color: var(--v2-text-main);
  font-size: 14px;
  font-weight: 700;
  line-height: 19px;
  white-space: nowrap;
}

.play-summary__item--primary strong { color: var(--v2-primary); }
.play-summary__item--success strong { color: #168b85; }
</style>
