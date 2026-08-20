<template>
  <q-page class="tools-page">
    <header class="tools-header">
      <div class="tools-brand">
        <span class="tools-brand__mark" aria-hidden="true">
          <q-icon name="auto_awesome" size="20px" />
        </span>
        <span class="tools-brand__copy">
          <small>POKERLY</small>
          <h1>Tools</h1>
        </span>
      </div>
    </header>

    <section class="tools-intro">
      <h2>실전에서 바로 쓰는 계산 도구들</h2>
    </section>

    <section class="tool-list">
      <button v-for="tool in visibleTools" :key="tool.title" class="tool-card" type="button" @click="openTool(tool.to)">
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
import { computed } from 'vue'
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
  {
    title: '기본 확률표',
    description: '자주 쓰는 홀덤 확률을 빠르게 확인하세요.',
    icon: 'percent',
    tone: 'odds',
    to: '/app/tools/basic-probabilities',
  },
]

const visibleTools = computed(() => tools.filter((tool) => !tool.hidden))

const openTool = (to) => {
  if (to) router.push(to)
}
</script>

<style scoped>
.tools-page {
  display: grid;
  gap: 16px;
  min-height: 100%;
  align-content: start;
  padding: var(--v2-page-padding-top) var(--v2-page-padding-x)
    calc(24px + env(safe-area-inset-bottom));
}

.tools-header {
  display: grid;
  align-items: center;
}

.tools-brand {
  display: inline-flex;
  width: fit-content;
  align-items: center;
  gap: 10px;
}

.tools-brand__mark {
  position: relative;
  display: grid;
  width: 38px;
  height: 38px;
  flex: 0 0 auto;
  place-items: center;
  overflow: hidden;
  border: 1px solid rgba(109, 69, 232, 0.14);
  border-radius: 13px;
  background: linear-gradient(145deg, #7550ed 0%, #5d38d6 100%);
  box-shadow: 0 7px 18px rgba(109, 69, 232, 0.2);
  color: #fff;
}

.tools-brand__mark::after {
  position: absolute;
  top: -11px;
  right: -9px;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  content: '';
}

.tools-brand__copy {
  display: grid;
  gap: 1px;
}

.tools-brand__copy small {
  color: var(--v2-primary);
  font-size: 8px;
  font-weight: 750;
  line-height: 1;
  letter-spacing: 0.16em;
}

.tools-brand h1 {
  margin: 0;
  color: var(--v2-text-main);
  font-size: 20px;
  font-weight: 680;
  line-height: 1;
  letter-spacing: -0.02em;
}

.tools-intro {
  padding: 0;
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
    padding: var(--v2-page-padding-top) var(--v2-page-padding-x)
      calc(24px + env(safe-area-inset-bottom));
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

@media (max-height: 620px) {
  .tools-page {
    padding-bottom: calc(88px + env(safe-area-inset-bottom));
  }
}
</style>
