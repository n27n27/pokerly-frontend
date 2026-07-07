<template>
  <q-page class="tools-page">
    <header class="tools-topbar">
      <h1>Tools</h1>
    </header>

    <section class="tools-intro">
      <h2>실전에서 바로 쓰는 계산 도구들</h2>
      <p>포커 실력을 높여주는 다양한 도구를 활용해보세요.</p>
    </section>

    <section class="tool-list">
      <button v-for="tool in tools" :key="tool.title" class="tool-card" type="button" @click="openTool(tool.to)">
        <span class="tool-card__icon" :class="`tool-card__icon--${tool.tone}`">
          <q-icon :name="tool.icon" size="48px" />
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
    title: '프리플랍 차트',
    description: '포지션별 오픈, 콜, 3벳 추천 레인지를 확인할 수 있습니다.',
    icon: 'style',
    tone: 'cards',
    to: '/app/tools/preflop-chart',
  },
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
  min-height: 100%;
  padding: 0 20px 24px;
}

.tools-topbar {
  min-height: 76px;
  margin: 0 -20px;
  border-bottom: 1px solid var(--v2-border);
  background: var(--v2-page-bg);
  display: grid;
  place-items: center;
}

.tools-topbar h1 {
  margin: 0;
  color: var(--v2-text-main);
  font-size: 29px;
  font-weight: 560;
  line-height: 1;
  letter-spacing: 0;
}

.tools-intro {
  padding: 40px 6px 26px;
}

.tools-intro h2 {
  margin: 0;
  color: var(--v2-text-main);
  font-size: 24px;
  font-weight: 560;
  line-height: 1.3;
  letter-spacing: 0;
}

.tools-intro p {
  margin: 12px 0 0;
  color: var(--v2-text-sub);
  font-size: 17px;
  font-weight: 430;
  line-height: 1.45;
}

.tool-list {
  display: grid;
  gap: 16px;
}

.tool-card {
  width: 100%;
  min-height: 146px;
  padding: 20px 24px;
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-lg);
  background: #ffffff;
  box-shadow: 0 8px 22px rgba(28, 18, 60, 0.04);
  color: var(--v2-text-main);
  display: grid;
  grid-template-columns: 134px minmax(0, 1fr);
  align-items: center;
  gap: 18px;
  text-align: left;
}

.tool-card__icon {
  display: flex;
  width: 96px;
  height: 96px;
  align-items: center;
  justify-content: center;
  border-radius: var(--v2-radius-lg);
  background: var(--v2-primary-soft);
  color: var(--v2-primary);
}

.tool-card__copy {
  display: grid;
  gap: 12px;
  min-width: 0;
}

.tool-card__copy strong {
  color: var(--v2-text-main);
  font-size: 26px;
  font-weight: 560;
  line-height: 1.2;
}

.tool-card__copy span {
  color: var(--v2-text-sub);
  font-size: 17px;
  font-weight: 430;
  line-height: 1.55;
}

@media (max-width: 420px) {
  .tools-topbar {
    min-height: 70px;
  }

  .tools-intro {
    padding-top: 36px;
  }

  .tools-intro h2 {
    font-size: 22px;
  }

  .tools-intro p {
    font-size: 15px;
  }

  .tool-card {
    grid-template-columns: 96px minmax(0, 1fr);
    min-height: 126px;
    padding: 16px 18px;
    gap: 14px;
  }

  .tool-card__icon {
    width: 76px;
    height: 76px;
  }

  .tool-card__copy strong {
    font-size: 22px;
  }

  .tool-card__copy span {
    font-size: 15px;
  }
}
</style>
