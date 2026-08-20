<template>
  <q-header class="app-header">
    <q-toolbar class="app-toolbar">
      <div class="app-brand">
        <span class="app-brand__mark" aria-hidden="true">
          <q-icon name="auto_awesome" size="20px" />
        </span>
        <div class="app-title">Pokerly</div>
      </div>
    </q-toolbar>
  </q-header>
</template>

<style scoped>
.app-header {
  background: var(--v2-app-bar-bg);
  color: #17151f;
  box-shadow: none;
  border-bottom: 1px solid var(--v2-app-bar-border);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
}

.app-toolbar {
  min-height: calc(var(--v2-app-header-height) + var(--app-safe-top));
  padding: calc(8px + var(--app-safe-top)) var(--v2-page-padding-x) 8px;
}

.app-brand {
  display: inline-flex;
  width: fit-content;
  align-items: center;
  gap: 10px;
}

.app-brand__mark {
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

.app-brand__mark::after {
  position: absolute;
  top: -11px;
  right: -9px;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  content: '';
}

.app-title {
  color: #121044;
  font-size: 25px;
  font-weight: 620;
  line-height: 1;
  letter-spacing: 0;
}
</style>
