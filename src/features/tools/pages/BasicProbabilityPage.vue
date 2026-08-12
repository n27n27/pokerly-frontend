<template>
  <q-page class="probability-page">
    <header class="probability-topbar">
      <h1>기본 확률표</h1>
    </header>

    <section
      v-for="section in sections"
      :id="section.id"
      :key="section.id"
      class="probability-section"
      :class="{ 'is-open': activeSectionId === section.id }"
    >
      <button
        class="section-header"
        type="button"
        :aria-expanded="activeSectionId === section.id"
        :aria-controls="`${section.id}-content`"
        @click="toggleSection(section.id)"
      >
        <span class="section-order">{{ section.order }}</span>
        <h2>{{ section.category }}</h2>
        <q-icon
          :name="activeSectionId === section.id ? 'keyboard_arrow_up' : 'keyboard_arrow_down'"
          size="22px"
        />
      </button>

      <div v-if="activeSectionId === section.id" :id="`${section.id}-content`" class="section-content">
        <p v-if="section.subtitle" class="section-subtitle">{{ section.subtitle }}</p>

        <div v-if="section.rows" class="outs-table-wrap">
          <table class="outs-table">
            <thead>
              <tr>
                <th v-for="column in section.columns" :key="column">{{ column }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in section.rows" :key="row[0]">
                <td
                  v-for="(cell, index) in row"
                  :key="`${row[0]}-${index}`"
                  :class="{ 'is-probability': section.probabilityColumns?.includes(index) }"
                >
                  {{ cell }}
                </td>
              </tr>
            </tbody>
          </table>
          <p v-if="section.tableNote" class="table-note">{{ section.tableNote }}</p>
        </div>

        <div v-if="section.commonOuts" class="common-outs">
          <h3>자주 쓰는 아웃</h3>
          <div v-for="item in section.commonOuts" :key="item.label" class="common-outs__row">
            <span>{{ item.label }}</span>
            <strong>{{ item.value }}</strong>
          </div>
        </div>

        <aside v-for="tip in section.tips" :key="tip.title" class="tip-box">
          <strong>{{ tip.title }}</strong>
          <span v-for="line in tip.lines" :key="line">{{ line }}</span>
          <small>{{ tip.description }}</small>
        </aside>

        <template v-if="section.groups">
          <article v-for="group in section.groups" :key="group.title" class="probability-group">
            <h3>{{ group.title }}</h3>
            <ProbabilityRows :items="group.items" />
            <p v-if="group.note" class="section-note">{{ group.note }}</p>
          </article>
        </template>

        <ProbabilityRows v-if="section.items" :items="section.items" />

        <p v-if="section.note" class="section-note">{{ section.note }}</p>
      </div>
    </section>
  </q-page>
</template>

<script setup>
import { defineComponent, h, ref } from 'vue'
import { basicProbabilitySections } from '../data/basicProbabilityData'

const sections = [...basicProbabilitySections].sort((a, b) => a.order - b.order)
const activeSectionId = ref(sections[0]?.id ?? null)
const toggleSection = (sectionId) => {
  activeSectionId.value = activeSectionId.value === sectionId ? null : sectionId
}

const ProbabilityRows = defineComponent({
  name: 'ProbabilityRows',
  props: {
    items: { type: Array, required: true },
  },
  setup(props) {
    return () => h('div', { class: 'probability-rows' }, [...props.items].sort((a, b) => a.order - b.order).map((item) =>
      h('div', { class: 'probability-row', key: item.title }, [
        h('span', { class: 'probability-row__copy' }, [
          h('strong', item.title),
          item.secondaryLabel ? h('small', item.secondaryLabel) : null,
          item.description ? h('em', item.description) : null,
        ]),
        h('b', { class: 'probability-row__value' }, item.probability),
      ]),
    ))
  },
})
</script>

<style scoped>
.probability-page {
  display: grid;
  gap: 8px;
  min-height: 100%;
  align-content: start;
  padding: var(--v2-page-padding-top) var(--v2-page-padding-x) 104px;
  color: var(--v2-text-main);
  scroll-behavior: smooth;
}

.probability-topbar {
  display: grid;
  justify-items: start;
  margin: 0 0 12px;
}

.probability-topbar h1 {
  margin: 0;
  color: var(--v2-text-main);
  font-size: 22px;
  font-weight: 560;
  line-height: 1;
  text-align: left;
}

.probability-section {
  border: 1px solid var(--v2-border);
  border-radius: 16px;
  background: var(--v2-surface);
  box-shadow: var(--v2-shadow-card, 0 8px 24px rgb(34 26 68 / 4%));
}

.section-header h2 {
  margin: 0;
}

.probability-section {
  overflow: hidden;
}

.section-header {
  width: 100%;
  display: grid;
  grid-template-columns: 30px minmax(0, 1fr) 24px;
  gap: 10px;
  align-items: center;
  padding: 14px 16px;
  border: 0;
  outline: 0;
  color: var(--v2-text-main);
  background: transparent;
  font: inherit;
  text-align: left;
  cursor: pointer;
}

.section-header:focus-visible {
  background: color-mix(in srgb, var(--v2-primary) 5%, white);
}

.probability-section.is-open .section-header {
  border-bottom: 1px solid var(--v2-border);
}

.section-header .q-icon {
  color: var(--v2-text-sub);
}

.section-order {
  display: grid;
  width: 28px;
  height: 28px;
  place-items: center;
  border-radius: 9px;
  color: var(--v2-primary);
  background: color-mix(in srgb, var(--v2-primary) 10%, white);
  font-size: 13px;
  font-weight: 700;
}

.section-header h2 {
  font-size: 16px;
  font-weight: 700;
  line-height: 1.35;
}

.probability-group + .probability-group {
  border-top: 8px solid var(--v2-page-bg, #f8f7fc);
}

.probability-group h3 {
  margin: 0;
  padding: 12px 16px 6px;
  font-size: 13px;
  font-weight: 700;
}

:deep(.probability-row) {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 16px;
  align-items: center;
  min-height: 48px;
  padding: 8px 16px;
  border-top: 1px solid var(--v2-border);
}

:deep(.probability-rows > .probability-row:first-child),
.probability-group h3 + :deep(.probability-rows > .probability-row:first-child) {
  border-top: 0;
}

:deep(.probability-row__copy) {
  display: flex;
  min-width: 0;
  flex-wrap: wrap;
  gap: 3px 7px;
  align-items: baseline;
}

:deep(.probability-row__copy strong) {
  font-size: 13px;
  font-weight: 600;
}

:deep(.probability-row__copy small) {
  color: var(--v2-primary);
  font-size: 11px;
  font-weight: 600;
}

:deep(.probability-row__copy em) {
  flex-basis: 100%;
  color: var(--v2-text-sub);
  font-size: 11px;
  font-style: normal;
  line-height: 1.4;
}

:deep(.probability-row__value) {
  width: 88px;
  color: var(--v2-primary);
  font-size: 16px;
  font-weight: 750;
  font-variant-numeric: tabular-nums;
  text-align: right;
  white-space: nowrap;
}

.section-note,
.table-note {
  margin: 0;
  padding: 10px 16px;
  color: var(--v2-text-sub);
  background: color-mix(in srgb, var(--v2-primary) 5%, white);
  font-size: 11px;
  line-height: 1.5;
}

.section-subtitle {
  margin: 0;
  padding: 10px 16px 2px;
  color: var(--v2-text-sub);
  font-size: 11px;
  font-weight: 500;
}

.common-outs {
  margin: 10px 12px;
  padding: 4px 12px;
  border: 1px solid var(--v2-border);
  border-radius: 12px;
  background: color-mix(in srgb, var(--v2-primary) 2%, white);
}

.common-outs h3 {
  margin: 0;
  padding: 9px 0 7px;
  color: var(--v2-text-main);
  font-size: 12px;
  font-weight: 700;
}

.common-outs__row {
  display: flex;
  min-height: 34px;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border-top: 1px solid var(--v2-border);
  color: var(--v2-text-sub);
  font-size: 11px;
}

.common-outs__row strong {
  color: var(--v2-primary);
  font-size: 11px;
  font-weight: 650;
  white-space: nowrap;
}

.tip-box {
  display: grid;
  gap: 3px;
  margin: 10px 12px;
  padding: 11px 12px;
  border-radius: 10px;
  color: var(--v2-text-main);
  background: color-mix(in srgb, var(--v2-primary) 6%, white);
  font-size: 12px;
  line-height: 1.45;
}

.tip-box strong {
  margin-bottom: 2px;
  color: var(--v2-primary);
  font-size: 12px;
}

.tip-box small {
  margin-top: 2px;
  color: var(--v2-text-sub);
  font-size: 10px;
}

.outs-table-wrap {
  overflow-x: auto;
}

.outs-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}

.outs-table th,
.outs-table td {
  padding: 9px 10px;
  border-bottom: 1px solid var(--v2-border);
  text-align: left;
}

.outs-table th {
  color: var(--v2-text-sub);
  background: color-mix(in srgb, var(--v2-primary) 4%, white);
  font-weight: 600;
}

.outs-table th:first-child,
.outs-table td:first-child { padding-left: 16px; }
.outs-table th:last-child,
.outs-table td:last-child { padding-right: 16px; }

.outs-table .is-probability {
  color: var(--v2-primary);
  font-weight: 700;
  white-space: nowrap;
}

@media (max-width: 360px) {
  :deep(.probability-row) { gap: 10px; }
  :deep(.probability-row__value) { font-size: 15px; }
}
</style>
