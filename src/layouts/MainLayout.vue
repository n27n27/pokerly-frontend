<template>
  <q-layout view="lHh Lpr lFf" class="app-layout">
    <AppHeader v-if="!route.meta.hideHeader" />

    <q-page-container
      ref="pageContainer"
      class="app-page-container"
      :class="{
        'app-page-container--header-hidden': route.meta.hideHeader,
      }"
    >
      <router-view />
    </q-page-container>

    <BottomNavigation :disabled="Boolean(route.meta.disableBottomNavigation)" />
  </q-layout>
</template>

<script setup>
import { nextTick, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import AppHeader from 'src/shared/components/AppHeader.vue'
import BottomNavigation from 'src/shared/components/BottomNavigation.vue'

const route = useRoute()
const pageContainer = ref(null)

const getPageContainer = () => pageContainer.value?.$el || pageContainer.value

const resetRouteScroll = () => {
  window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  document.scrollingElement?.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  const container = getPageContainer()
  if (container) {
    container.scrollTop = 0
    container.scrollLeft = 0
  }
}

watch(
  () => route.fullPath,
  async () => {
    await nextTick()
    resetRouteScroll()
    requestAnimationFrame(resetRouteScroll)
  },
  { flush: 'post' },
)
</script>

<style scoped>
.app-layout {
  height: 100dvh;
  overflow: hidden;
  background: #f7f7fb;
}

.app-page-container {
  box-sizing: border-box;
  height: 100dvh;
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior-y: none;
  -webkit-overflow-scrolling: touch;
}

.app-page-container--header-hidden {
  padding-top: 0 !important;
}

</style>
