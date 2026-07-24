<template>
  <q-page class="running-page" @click="showLevelMenu = false">
    <header class="running-topbar">
      <button class="running-topbar__back" type="button" aria-label="뒤로 가기" @click="router.back()">
        <q-icon name="chevron_left" size="28px" />
      </button>
      <h1>진행 중 토너먼트</h1>
      <span aria-hidden="true"></span>
    </header>

    <section class="running-summary">
      <div class="running-summary__main">
        <div>
          <strong>프라임 0704</strong>
          <p>바인 100,000 <span>·</span> 리바인 2회</p>
        </div>

        <button class="manage-link" type="button" @click="openManage">
          <q-icon name="settings" size="18px" />
          대회 관리
        </button>
      </div>
    </section>

    <section class="level-section">
      <div class="level-section__header">
        <h2>레벨 목록</h2>
        <button type="button">
          <q-icon name="add" size="19px" />
          레벨 추가
        </button>
      </div>

      <div class="level-list">
        <article class="current-level-card" role="button" tabindex="0" @click="openLevel(currentLevel.name)">
          <div class="current-level-card__accent"></div>
          <button
            class="level-menu-button"
            type="button"
            aria-label="레벨 메뉴"
            @click.stop="showLevelMenu = !showLevelMenu"
          >
            <q-icon name="more_vert" size="22px" />
          </button>
          <div v-if="showLevelMenu" class="level-menu" @click.stop>
            <button type="button" @click.stop="closeLevelMenu">
              <q-icon name="edit" size="18px" />
              수정
            </button>
            <button class="danger" type="button" @click.stop="closeLevelMenu">
              <q-icon name="delete_outline" size="18px" />
              삭제
            </button>
          </div>

          <div class="current-level-card__head">
            <strong>{{ currentLevel.name }}</strong>
            <span>{{ currentLevel.blinds }}</span>
          </div>

          <div class="current-level-card__body">
            <div>
              <span>현재 스택</span>
              <strong>{{ currentLevel.endStack }}</strong>
              <em>{{ currentLevel.bb }}</em>
            </div>
            <div>
              <span>핸드</span>
              <strong>{{ currentLevel.hands }}</strong>
              <em>핸드</em>
            </div>
          </div>
        </article>

        <button
          v-for="level in otherLevels"
          :key="level.name"
          class="level-row"
          type="button"
          @click="openLevel(level.name)"
        >
          <strong>{{ level.name }}</strong>
          <span class="level-row__blinds">{{ level.blinds }}</span>
          <span class="level-row__metric">
            <small>핸드</small>
            {{ level.hands }}
          </span>
          <span class="level-row__stack">
            <small>스택</small>
            {{ level.endStack }}
            <em v-if="level.bb">{{ level.bb }}</em>
          </span>
          <span class="level-row__menu" aria-hidden="true">
            <q-icon name="more_vert" size="22px" />
          </span>
        </button>
      </div>
    </section>

    <section class="finish-panel">
      <div>
        <strong>세션 종료</strong>
        <p>대회를 종료하고 결과를 생성합니다.</p>
      </div>
      <button type="button" @click="openFinish">대회 종료</button>
    </section>
  </q-page>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const levels = [
  { name: 'L1', blinds: '100 / 200 / 200', hands: '7', endStack: '132,000', bb: '(264BB)' },
  { name: 'L2', blinds: '200 / 300 / 300', hands: '16', endStack: '138,500', bb: '(231BB)' },
  { name: 'L3', blinds: '300 / 500 / 500', hands: '11', endStack: '132,000', bb: '176 BB', current: true },
  { name: 'L4', blinds: '400 / 800 / 800', hands: '0', endStack: '-', bb: '' },
  { name: 'L5', blinds: '600 / 1,200 / 1,200', hands: '0', endStack: '-', bb: '' },
  { name: 'L8', blinds: '1,500 / 3,000 / 3,000', hands: '0', endStack: '-', bb: '' },
]

const currentLevel = computed(() => levels.find((level) => level.current) || levels[0])
const otherLevels = computed(() => levels.filter((level) => !level.current))
const showLevelMenu = ref(false)

const openLevel = (levelName) => {
  router.push(`/app/tournament/running/level/${levelName}`)
}

const openManage = () => {
  router.push('/app/tournament/running/manage')
}

const openFinish = () => {
  router.push('/app/tournament/running/finish')
}

const closeLevelMenu = () => {
  showLevelMenu.value = false
}
</script>

<style scoped>
.running-page {
  display: grid;
  align-content: start;
  gap: 20px;
  min-height: 100%;
  padding: var(--v2-page-padding-top) var(--v2-page-padding-x) 112px;
}

.running-topbar {
  display: grid;
  grid-template-columns: 40px minmax(0, 1fr) 40px;
  align-items: center;
  min-height: 36px;
}

.running-topbar__back {
  width: 36px;
  height: 36px;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--v2-text-main);
}

.running-topbar h1 {
  margin: 0;
  color: var(--v2-text-main);
  font-size: 17px;
  font-weight: 560;
  line-height: 1.2;
  text-align: center;
}

.running-summary {
  overflow: hidden;
  padding: 18px 20px;
  border: 1px solid var(--v2-border);
  border-radius: var(--v2-radius-lg);
  background: #ffffff;
  box-shadow: 0 8px 24px rgba(28, 18, 60, 0.045);
}

.running-summary__main {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 16px;
}

.running-summary strong {
  color: var(--v2-text-main);
  font-size: 19px;
  font-weight: 560;
  line-height: 1.2;
}

.running-summary p {
  margin: 10px 0 0;
  color: #5f596b;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 430;
  line-height: 1.2;
}

.running-summary p span {
  color: var(--v2-text-sub);
}

.manage-link {
  min-height: 36px;
  padding: 0 13px;
  border: 1px solid rgba(109, 69, 232, 0.38);
  border-radius: var(--v2-radius-sm);
  background: #ffffff;
  color: var(--v2-primary);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  font: inherit;
  font-size: 13px;
  font-weight: 520;
  white-space: nowrap;
}

.level-section {
  display: grid;
  gap: 14px;
}

.level-section__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.level-section__header h2 {
  margin: 0;
  color: var(--v2-text-main);
  font-size: 17px;
  font-weight: 560;
  line-height: 1.2;
}

.level-section__header button {
  min-height: 34px;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--v2-primary);
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font: inherit;
  font-size: 14px;
  font-weight: 520;
}

.level-list {
  display: grid;
  gap: 8px;
}

.current-level-card {
  position: relative;
  overflow: visible;
  padding: 22px 20px 20px 24px;
  border: 1px solid rgba(109, 69, 232, 0.45);
  border-radius: var(--v2-radius-lg);
  background: linear-gradient(135deg, #ffffff 0%, #fbf8ff 100%);
  box-shadow: 0 10px 26px rgba(109, 69, 232, 0.09);
  color: var(--v2-text-main);
  cursor: pointer;
}

.current-level-card__accent {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 8px;
  border-radius: var(--v2-radius-lg) 0 0 var(--v2-radius-lg);
  background: var(--v2-primary);
}

.level-menu-button {
  position: absolute;
  right: 14px;
  top: 16px;
  width: 32px;
  height: 32px;
  padding: 0;
  border: 0;
  background: transparent;
  color: #5f596b;
  outline: 0;
}

.level-menu {
  position: absolute;
  top: 52px;
  right: 14px;
  z-index: 2;
  width: 156px;
  overflow: hidden;
  border: 1px solid rgba(230, 226, 240, 0.95);
  border-radius: 12px;
  background: #ffffff;
  box-shadow: 0 14px 30px rgba(28, 18, 60, 0.18);
  display: grid;
}

.level-menu button {
  width: 100%;
  min-height: 42px;
  padding: 0 12px;
  border: 0;
  border-bottom: 1px solid var(--v2-border);
  background: #ffffff;
  color: var(--v2-text-main);
  display: flex;
  align-items: center;
  gap: 9px;
  font: inherit;
  font-size: 13px;
  font-weight: 520;
  text-align: left;
  cursor: pointer;
}

.level-menu button:last-child {
  border-bottom: 0;
}

.level-menu button:active {
  background: #faf9ff;
}

.level-menu button.danger {
  color: var(--v2-danger);
}

.current-level-card__head {
  display: flex;
  align-items: baseline;
  gap: 28px;
  padding-right: 40px;
  padding-bottom: 18px;
  border-bottom: 1px solid var(--v2-border);
}

.current-level-card__head strong {
  color: var(--v2-primary);
  font-size: 44px;
  font-weight: 620;
  line-height: 1;
}

.current-level-card__head span {
  color: var(--v2-primary);
  font-size: 20px;
  font-weight: 560;
  line-height: 1.2;
}

.current-level-card__body {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(120px, 0.72fr);
  gap: 22px;
  padding-top: 18px;
}

.current-level-card__body div + div {
  padding-left: 22px;
  border-left: 1px solid var(--v2-border);
}

.current-level-card__body span,
.level-row small {
  color: var(--v2-text-sub);
  font-size: 12px;
  font-weight: 430;
  line-height: 1.2;
}

.current-level-card__body strong {
  display: inline-block;
  margin-top: 9px;
  color: var(--v2-text-main);
  font-size: 34px;
  font-weight: 620;
  line-height: 1;
}

.current-level-card__body em {
  display: block;
  margin-top: 8px;
  color: var(--v2-primary);
  font-size: 15px;
  font-style: normal;
  font-weight: 520;
}

.current-level-card__body div:last-child strong {
  color: var(--v2-primary);
}

.current-level-card__body div:last-child em {
  display: inline;
  margin-left: 6px;
  color: #5f596b;
}

.level-row {
  width: 100%;
  min-height: 62px;
  padding: 12px 12px 12px 16px;
  border: 1px solid rgba(230, 226, 240, 0.9);
  border-radius: var(--v2-radius-lg);
  background: #ffffff;
  box-shadow: 0 4px 12px rgba(28, 18, 60, 0.018);
  color: var(--v2-text-main);
  display: grid;
  grid-template-columns: 54px minmax(0, 1.35fr) minmax(54px, 0.55fr) minmax(94px, 0.85fr) 24px;
  align-items: center;
  gap: 8px;
  font: inherit;
  text-align: left;
}

.level-row > strong {
  color: var(--v2-text-main);
  font-size: 22px;
  font-weight: 620;
}

.level-row__blinds {
  overflow: hidden;
  color: var(--v2-text-main);
  font-size: 14px;
  font-weight: 450;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.level-row__metric,
.level-row__stack {
  min-width: 0;
  padding-left: 14px;
  border-left: 1px solid var(--v2-border);
  display: grid;
  gap: 3px;
  color: var(--v2-text-main);
  font-size: 14px;
  font-weight: 540;
  line-height: 1.1;
}

.level-row__stack em {
  color: #5f596b;
  font-size: 12px;
  font-style: normal;
  font-weight: 430;
}

.level-row__menu {
  color: #8a8498;
  display: flex;
  justify-content: flex-end;
}

.finish-panel {
  margin-top: 6px;
  padding: 16px 16px;
  border: 1px solid rgba(239, 68, 68, 0.28);
  border-radius: var(--v2-radius-md);
  background: #fffdfc;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 12px;
}

.finish-panel strong {
  color: var(--v2-text-main);
  font-size: 16px;
  font-weight: 560;
}

.finish-panel p {
  margin: 6px 0 0;
  color: #5f596b;
  font-size: 13px;
  font-weight: 430;
}

.finish-panel button {
  min-height: 42px;
  padding: 0 20px;
  border: 1px solid var(--v2-danger);
  border-radius: var(--v2-radius-sm);
  background: #ffffff;
  color: var(--v2-danger);
  font: inherit;
  font-size: 14px;
  font-weight: 560;
}

@media (max-width: 420px) {
  .running-page {
    padding: var(--v2-page-padding-top) var(--v2-page-padding-x) 112px;
  }

  .running-summary {
    padding: 16px 18px;
  }

  .running-summary__main {
    grid-template-columns: minmax(0, 1fr) auto;
  }

  .manage-link {
    margin-top: 0;
  }

  .current-level-card {
    padding: 20px 18px 18px 22px;
  }

  .current-level-card__head {
    gap: 20px;
  }

  .current-level-card__head strong {
    font-size: 39px;
  }

  .current-level-card__head span {
    font-size: 18px;
  }

  .current-level-card__body strong {
    font-size: 30px;
  }

  .level-row {
    grid-template-columns: 46px minmax(0, 1.2fr) 54px minmax(76px, 0.75fr) 20px;
    gap: 7px;
    padding: 11px 10px 11px 14px;
  }

  .level-row > strong {
    font-size: 20px;
  }

  .level-row__blinds,
  .level-row__metric,
  .level-row__stack {
    font-size: 13px;
  }

  .finish-panel {
    padding: 14px;
  }

  .finish-panel button {
    padding: 0 16px;
  }
}
</style>
