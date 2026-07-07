<template>
  <q-layout view="lHh Lpr lFf" class="app-layout">
    <AppHeader v-if="!route.meta.hideHeader" />

    <q-page-container class="app-page-container">
      <router-view />
    </q-page-container>

    <BottomNavigation />
  </q-layout>
</template>

<script setup>
import { useRoute } from 'vue-router'

import AppHeader from 'src/shared/components/AppHeader.vue'
import BottomNavigation from 'src/shared/components/BottomNavigation.vue'

const route = useRoute()
</script>

<style scoped>
.app-layout {
  background: #f7f7fb;
}

.app-page-container {
  padding-bottom: 76px;
}
</style>
