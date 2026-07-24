<template>
  <q-page class="tools-page">
    <header class="tools-header">
      <h1>Tools</h1>
      <p>포커 실력을 높여주는 다양한 도구를 활용해보세요.</p>
    </header>

    <section class="tools-intro">
      <h2>실전에서 바로 쓰는 계산 도구들</h2>
    </section>

    <section class="tool-list">
      <button v-for="tool in tools" :key="tool.title" class="tool-card" type="button" @click="openTool(tool.to)">
        <span class="tool-card__icon" :class="`tool-card__icon--${tool.tone}`">
          <q-icon :name="tool.icon" size="30px" />
        </span>

        <span class="tool-card__copy">
          <strong>{{ tool.title }}</strong>
          <span>{{ tool.description }}</span>
        </span>
      </button>
    </section>
  </q-page>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const tools = [
  {
    title: '에퀴티 계산기',
    description: '두 핸드의 승률을 빠르고 쉽게 계산해보세요.',
    icon: 'pie_chart',
    tone: 'equity',
    to: '/app/tools/equity-calculator',
  },
  {
    title: '팟 오즈 계산기',
    description: '필요 승률과 팟 오즈를 계산하여 콜/폴드 결정을 도와드립니다.',
    icon: 'track_changes',
    tone: 'odds',
    to: '/app/tools/pot-odds-calculator',
  },
  {
    title: 'ICM 계산기',
    description: '토너먼트 상황에서 ICM과 칩 EV를 계산해보세요.',
    icon: 'emoji_events',
    tone: 'icm',
    to: '/app/tools/icm-calculator',
  },
]

const openTool = (to) => {
  if (to) router.push(to)
}
</script>

<style scoped>
.tools-page {
  display: grid;
  gap: 12px;
  min-height: 100%;
  align-content: start;
  padding: var(--v2-page-padding-top) var(--v2-page-padding-x) 88px;
}

.tools-header {
  display: grid;
  gap: 8px;
}

.tools-header h1 {
  margin: 0;
  color: var(--v2-text-main);
  font-size: 22px;
  font-weight: 560;
  line-height: 1;
  letter-spacing: 0;
}

.tools-header p {
  margin: 0;
  color: var(--v2-text-sub);
  font-size: 12px;
  font-weight: 430;
  line-height: 1.35;
}

.tools-intro {
  padding: 4px 0 2px;
}

.tools-intro h2 {
  margin: 0;
  color: var(--v2-text-main);
  font-size: 20px;
  font-weight: 560;
  line-height: 1.3;
  letter-spacing: 0;
}

.tool-list {
  display: grid;
  gap: 12px;
}

.tool-card {
  width: 100%;
  min-height: 98px;
  padding: 17px 18px;
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-lg);
  background: #ffffff;
  box-shadow: 0 5px 14px rgba(28, 18, 60, 0.025);
  color: var(--v2-text-main);
  display: grid;
  grid-template-columns: 44px minmax(0, 1fr);
  align-items: center;
  gap: 14px;
  text-align: left;
}

.tool-card__icon {
  display: flex;
  width: 36px;
  height: 36px;
  align-items: center;
  justify-content: center;
  color: var(--v2-primary);
}

.tool-card__copy {
  display: grid;
  gap: 7px;
  min-width: 0;
}

.tool-card__copy strong {
  color: var(--v2-text-main);
  font-size: 17px;
  font-weight: 560;
  line-height: 1.2;
}

.tool-card__copy span {
  color: var(--v2-text-sub);
  font-size: 13px;
  font-weight: 430;
  line-height: 1.45;
}

@media (max-width: 720px) {
  .tools-page {
    padding: var(--v2-page-padding-top) var(--v2-page-padding-x) 88px;
  }

  .tools-intro h2 {
    font-size: 19px;
  }

  .tool-card {
    grid-template-columns: 40px minmax(0, 1fr);
    min-height: 94px;
    padding: 16px 14px;
    gap: 12px;
  }

  .tool-card__icon {
    width: 34px;
    height: 34px;
  }

  .tool-card__copy strong {
    font-size: 16px;
  }

  .tool-card__copy span {
    font-size: 13px;
  }
}
</style>
