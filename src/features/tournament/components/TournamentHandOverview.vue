<template>
  <div class="hand-overview">
    <section>
      <div class="section-heading">
        <h2>{{ title }}</h2>
        <span>{{ hands.length }}핸드</span>
      </div>
      <div class="stats-grid">
        <div v-for="stat in stats" :key="stat.label">
          <strong>{{ stat.value }}</strong>
          <span>{{ stat.label }}</span>
        </div>
      </div>
    </section>

    <section>
      <div class="section-heading section-heading--spread">
        <h2>순위 구간 분포</h2>
        <span>169개 스타팅 핸드 기준</span>
      </div>
      <div class="rank-card">
        <div class="rank-meter">
          <i
            v-for="bucket in rankDistribution.buckets"
            :key="bucket.key"
            :class="`tone--${bucket.tone}`"
            :style="{ width: `${bucket.percent}%` }"
          ></i>
        </div>
        <div class="rank-list">
          <div v-for="bucket in rankDistribution.buckets" :key="bucket.key">
            <i :class="`tone--${bucket.tone}`"></i>
            <span><strong>{{ bucket.label }}</strong><small>{{ bucket.description }}</small></span>
            <b>{{ bucket.count }}개</b>
            <em>{{ bucket.percent }}%</em>
          </div>
        </div>
      </div>
    </section>

    <section>
      <h2>주요 핸드</h2>
      <div class="group-card">
        <article v-for="group in groups" :key="group.key">
          <div class="group-heading">
            <span><strong>{{ group.label }}</strong><small>{{ group.description }}</small></span>
            <b>{{ group.count }}개</b>
          </div>
          <div v-if="group.items.length" class="chips">
            <button
              v-for="item in group.items"
              :key="item.hand"
              type="button"
              :class="{ active: selectedKey === `${group.key}:${item.hand}` }"
              @click="toggle(group.key, item.hand)"
            >
              {{ item.hand }} <small>×{{ item.count }}</small>
            </button>
          </div>
          <p v-else>기록 없음</p>
          <div v-if="selectedKey.startsWith(`${group.key}:`)" class="details">
            <button
              v-for="hand in selectedHands(group)"
              :key="`${hand.__levelId}-${hand.id}`"
              type="button"
              @click="$emit('open-hand', hand)"
            >
              <strong>{{ hand.__levelLabel || '-' }} · {{ notation(hand) }}</strong>
              <span>{{ hand.position || '-' }} · {{ actionLabel(hand) }} · {{ resultLabel(hand) }}</span>
            </button>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import {
  createStartingHandRunSummary,
  isPfrAction,
  isThreeBetPlusAction,
  isVpipAction,
  normalizeHand,
} from 'src/utils/handLogHandAnalysis'

const props = defineProps({
  hands: { type: Array, default: () => [] },
  title: { type: String, default: '대회 요약' },
})
defineEmits(['open-hand'])

const selectedKey = ref('')
const normalizedHands = computed(() => props.hands.filter((hand) => normalizeHand(hand.holeCards || hand.hand)))
const percent = (count, total) => (total ? `${Math.round((count / total) * 100)}%` : '-')
const action = (hand) => hand.actionType || hand.preflopAction || ''

const stats = computed(() => {
  const total = props.hands.length
  const review = props.hands.filter((hand) => hand.reviewRequired).length
  const vpip = props.hands.filter((hand) => isVpipAction(action(hand))).length
  const pfr = props.hands.filter((hand) => isPfrAction(action(hand))).length
  const threeBet = props.hands.filter((hand) => isThreeBetPlusAction(action(hand))).length
  return [
    { label: '복기 필요', value: String(review) },
    { label: 'VPIP', value: percent(vpip, total) },
    { label: 'PFR', value: percent(pfr, total) },
    { label: '3Bet+', value: percent(threeBet, total) },
  ]
})

const notation = (hand) => normalizeHand(hand.holeCards || hand.hand)
const collect = (matcher) => {
  const map = new Map()
  normalizedHands.value.forEach((hand) => {
    const value = notation(hand)
    if (!matcher(value)) return
    const item = map.get(value) || { hand: value, count: 0, hands: [] }
    item.count += 1
    item.hands.push(hand)
    map.set(value, item)
  })
  return [...map.values()]
}
const groups = computed(() => {
  const premium = collect((hand) => ['AA', 'KK', 'QQ', 'JJ', 'TT', 'AKs', 'AKo', 'AQs'].includes(hand))
  const strongHands = collect((hand) =>
    ['99', '88', '77', 'AJs', 'ATs', 'AQo', 'AJo', 'AQ', 'KQs'].includes(hand),
  )
  const pairs = collect((hand) => hand.length === 2 && hand[0] === hand[1])
  return [
    { key: 'premium', label: '프리미엄', description: 'AA~TT, AK, AQs', items: premium, count: premium.reduce((sum, item) => sum + item.count, 0) },
    { key: 'strong', label: '강한 핸드', description: '99~77, AJs~ATs, AQo~AJo, KQs', items: strongHands, count: strongHands.reduce((sum, item) => sum + item.count, 0) },
    { key: 'pair', label: '포켓 페어', description: 'AA~22', items: pairs, count: pairs.reduce((sum, item) => sum + item.count, 0) },
  ]
})
const rankDistribution = computed(() => createStartingHandRunSummary(normalizedHands.value))
const toggle = (group, hand) => {
  const key = `${group}:${hand}`
  selectedKey.value = selectedKey.value === key ? '' : key
}
const selectedHands = (group) => {
  const value = selectedKey.value.split(':')[1]
  return group.items.find((item) => item.hand === value)?.hands || []
}
const actionLabel = (hand) => ({
  FOLD: '폴드', CHECK: '체크', CALL: '콜', WALK: '앞에서 올폴드',
  OPEN: '오픈', THREE_BET: '3벳', THREE_BET_PLUS: '3벳+', FOUR_BET_PLUS: '4벳+',
})[action(hand)] || action(hand) || '-'
const resultLabel = (hand) => {
  const value = hand.resultType || hand.result
  if (['SHOWDOWN_WIN', 'NON_SHOWDOWN_WIN', 'WIN'].includes(value)) return '승리'
  if (['CHOP', 'DRAW'].includes(value)) return '찹'
  if (['SHOWDOWN_LOSS', 'PREFLOP_FOLD', 'POSTFLOP_FOLD', 'LOSS', 'FOLD'].includes(value)) return '패배'
  return '미기록'
}
</script>

<style scoped>
.hand-overview, .hand-overview section { display: grid; gap: 12px; }
.hand-overview { gap: 20px; }
h2 { margin: 0; color: var(--v2-text-main); font-size: 17px; font-weight: 560; }
.section-heading { display: flex; align-items: baseline; gap: 8px; }
.section-heading--spread { justify-content: space-between; }
.section-heading > span { color: var(--v2-text-sub); font-size: 11px; white-space: nowrap; }
.stats-grid { overflow: hidden; border: 1px solid var(--v2-border); border-radius: var(--v2-radius-lg); background: #fff; display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); }
.stats-grid > div { min-height: 82px; padding: 12px 6px; border-right: 1px solid var(--v2-border); display: grid; place-items: center; align-content: center; gap: 8px; text-align: center; }
.stats-grid > div:last-child { border-right: 0; }
.stats-grid strong { color: var(--v2-primary); font-size: 20px; font-weight: 560; }
.stats-grid span { color: var(--v2-text-sub); font-size: 12px; white-space: nowrap; }
.rank-card, .group-card { overflow: hidden; border: 1px solid var(--v2-border); border-radius: var(--v2-radius-lg); background: #fff; }
.rank-card { padding: 16px; }
.rank-meter { height: 12px; overflow: hidden; border-radius: 999px; background: #f0edf5; display: flex; }
.rank-meter > i { height: 100%; }
.rank-list { margin-top: 12px; display: grid; }
.rank-list > div { min-height: 48px; border-bottom: 1px solid var(--v2-border); display: grid; grid-template-columns: 9px minmax(0, 1fr) auto 36px; align-items: center; gap: 9px; }
.rank-list > div:last-child { border-bottom: 0; }
.rank-list > div > i { width: 8px; height: 8px; border-radius: 50%; }
.rank-list span, .group-heading > span { display: grid; gap: 2px; }
.rank-list strong, .rank-list b { font-size: 13px; font-weight: 560; }
.rank-list small, .rank-list em { color: var(--v2-text-sub); font-size: 11px; font-style: normal; }
.rank-list em { text-align: right; }
.tone--premium { background: #7143df; } .tone--strong { background: #2983d8; }
.tone--middle { background: #159487; } .tone--low { background: #f58a0a; }
.group-card > article { padding: 16px; border-bottom: 1px solid var(--v2-border); }
.group-card > article:last-child { border-bottom: 0; }
.group-heading { display: flex; justify-content: space-between; gap: 12px; }
.group-heading strong, .group-heading b { font-size: 15px; font-weight: 600; }
.group-heading small, article > p { color: var(--v2-text-sub); font-size: 12px; }
.chips { margin-top: 12px; display: flex; flex-wrap: wrap; gap: 7px; }
.chips button { min-height: 32px; padding: 0 11px; border: 1px solid var(--v2-border); border-radius: 999px; background: #fff; color: var(--v2-text-main); font: inherit; font-size: 13px; font-weight: 600; }
.chips button.active { border-color: var(--v2-primary); background: var(--v2-primary-soft); color: var(--v2-primary); }
.chips small { color: var(--v2-text-sub); }
article > p { margin: 10px 0 0; }
.details { margin-top: 12px; overflow: hidden; border: 1px solid var(--v2-border); border-radius: 12px; background: #faf9fd; }
.details button { width: 100%; min-height: 58px; padding: 10px 12px; border: 0; border-bottom: 1px solid var(--v2-border); background: transparent; color: var(--v2-text-main); display: grid; justify-items: start; gap: 5px; font: inherit; text-align: left; }
.details button:last-child { border-bottom: 0; }
.details strong { font-size: 13px; font-weight: 600; }
.details span { color: var(--v2-text-sub); font-size: 12px; }
</style>
