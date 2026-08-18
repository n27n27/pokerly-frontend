<template>
  <q-header class="app-header">
    <q-toolbar class="app-toolbar">
      <div class="app-title">Pokerly</div>
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

.app-title {
  color: #121044;
  font-size: 25px;
  font-weight: 620;
  line-height: 1;
  letter-spacing: 0;
}
</style>
