<template>
  <q-page class="tournament-start-page">
    <header class="tournament-start-page__header">
      <h1>토너먼트 시작</h1>
    </header>

    <div class="tournament-start-page__options">
      <button
        v-for="option in options"
        :key="option.key"
        class="start-option"
        :class="{ 'start-option--disabled': option.disabled }"
        type="button"
        :disabled="option.disabled"
        @click="handleOption(option.key)"
      >
        <span class="start-option__icon-box">
          <q-icon :name="option.icon" size="38px" />
        </span>

        <span class="start-option__copy">
          <strong>{{ option.title }}</strong>
          <span>{{ option.description }}</span>
        </span>
      </button>
    </div>
  </q-page>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()
const registeredTournamentCount = 1

const options = [
  {
    key: 'registered',
    title: '등록된 대회',
    description: '가장 빠르게 토너먼트를 시작합니다.',
    icon: 'emoji_events',
    disabled: registeredTournamentCount === 0,
  },
  {
    key: 'create',
    title: '새 대회 만들기',
    description: '새로운 대회를 등록합니다.',
    icon: 'add_box',
    disabled: false,
  },
]

const handleOption = (key) => {
  if (key === 'create') {
    router.push('/app/tournament/create')
    return
  }

  if (key === 'registered') {
    router.push('/app/tournament/presets')
  }
}
</script>

<style scoped>
.tournament-start-page {
  display: grid;
  align-content: start;
  gap: 28px;
  min-height: 100%;
  padding: var(--v2-page-padding-top) var(--v2-page-padding-x) 24px;
}

.tournament-start-page__header h1 {
  margin: 0;
  color: var(--v2-text-main);
  font-size: 26px;
  font-weight: 560;
  line-height: 1.2;
  letter-spacing: 0;
}

.tournament-start-page__options {
  display: grid;
  gap: 16px;
}

.start-option {
  width: 100%;
  min-height: 116px;
  padding: 18px;
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-lg);
  background: var(--v2-surface);
  box-shadow: 0 6px 18px rgba(28, 18, 60, 0.035);
  color: var(--v2-text-main);
  display: grid;
  grid-template-columns: 76px minmax(0, 1fr);
  align-items: center;
  gap: 14px;
  text-align: left;
}

.start-option:active {
  transform: translateY(1px);
}

.start-option--disabled {
  opacity: 0.48;
}

.start-option__icon-box {
  display: flex;
  width: 44px;
  height: 44px;
  align-items: center;
  justify-content: center;
  color: var(--v2-primary);
}

.start-option__copy {
  display: grid;
  gap: 8px;
  min-width: 0;
}

.start-option__copy strong {
  color: var(--v2-text-main);
  font-size: 21px;
  font-weight: 540;
  line-height: 1.2;
}

.start-option__copy span {
  color: var(--v2-text-main);
  font-size: 14px;
  font-weight: 450;
  line-height: 1.45;
}

@media (max-width: 420px) {
  .tournament-start-page {
    gap: 28px;
    padding: var(--v2-page-padding-top) var(--v2-page-padding-x) 24px;
  }

  .start-option {
    grid-template-columns: 70px minmax(0, 1fr);
    gap: 12px;
    min-height: 108px;
    padding: 16px;
  }

  .start-option__icon-box {
    width: 42px;
    height: 42px;
  }

  .start-option__copy strong {
    font-size: 20px;
  }

  .start-option__copy span {
    font-size: 14px;
  }

}
</style>
