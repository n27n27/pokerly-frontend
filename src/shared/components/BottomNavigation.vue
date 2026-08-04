<template>
  <q-footer class="bottom-nav">
    <nav class="bottom-nav-inner">
      <button
        v-for="item in items"
        :key="item.name"
        type="button"
        class="nav-item"
        :class="{ active: isActive(item) }"
        @click="go(item.to)"
      >
        <q-icon :name="item.icon" size="22px" />
        <span>{{ item.label }}</span>
      </button>
    </nav>
  </q-footer>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const items = [
  { name: 'home', label: '홈', icon: 'home', to: '/app/home', prefixes: ['/app/home', '/app/tournament', '/app/bank-records', '/app/simple-record'] },
  { name: 'statistics', label: '통계', icon: 'query_stats', to: '/app/statistics', prefixes: ['/app/statistics'] },
  { name: 'tools', label: '도구', icon: 'construction', to: '/app/tools', prefixes: ['/app/tools'] },
  { name: 'my', label: 'My', icon: 'person', to: '/app/my', prefixes: ['/app/my'] },
]

const isActive = (item) => item.prefixes.some((prefix) => route.path.startsWith(prefix))

const go = (to) => {
  if (route.path !== to) router.push(to)
}
</script>

<style scoped>
.bottom-nav {
  background: transparent;
  box-shadow: none;
  backface-visibility: hidden;
  transform: translateZ(0);
}

.bottom-nav-inner {
  height: 68px;
  margin: 0 14px 10px;
  padding: 8px;
  border-radius: 16px;
  background: #ffffff;
  border: 1px solid #ece9f5;
  box-shadow: 0 10px 30px rgba(31, 24, 64, 0.08);
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 4px;
  contain: paint;
}

.nav-item {
  border: 0;
  background: transparent;
  border-radius: 10px;
  color: #9a95a8;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  font-size: 11px;
  font-weight: 430;
}

.nav-item.active {
  background: #f1ecff;
  color: #6d45e8;
}
</style>
