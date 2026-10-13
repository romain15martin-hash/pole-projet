<script setup lang="ts">
import { onMounted } from 'vue'
import { useEventsState } from './composables/useEventsState'
import { useCoinState } from './composables/useCoinState'
import AppHeader from './components/AppHeader.vue'
import HeroFeatured from './components/HeroFeatured.vue'
import EventFilters from './components/EventFilters.vue'
import WeekPlanner from './components/WeekPlanner.vue'
import SearchView from './components/SearchView.vue'
import AssoSpaceView from './components/AssoSpaceView.vue'
import CoinCsView from './components/CoinCsView.vue'
import EventDetailModal from './components/EventDetailModal.vue'
import ToastNotification from './components/ToastNotification.vue'
import AppFooter from './components/AppFooter.vue'

const { currentView, init: initEvents } = useEventsState()
const { init: initCoin } = useCoinState()

onMounted(() => {
  initEvents()
  initCoin()
})
</script>

<template>
  <div class="min-h-screen flex flex-col bg-cs-dark text-cs-light selection:bg-cs-pink selection:text-white font-sans">
    <!-- Top Header Navigation -->
    <AppHeader />

    <!-- Hero Featured Banner (shown on home page) -->
    <HeroFeatured v-if="currentView === 'home'" />

    <!-- Main Content Body -->
    <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      <!-- Home View: Filters + Weekly Planning -->
      <div v-if="currentView === 'home'" class="space-y-6">
        <EventFilters />
        <WeekPlanner />
      </div>

      <!-- Search View -->
      <SearchView v-else-if="currentView === 'search'" />

      <!-- CoinCS View (Native Elo & Gaming) -->
      <CoinCsView v-else-if="currentView === 'coincs'" />

      <!-- Asso Space & Moderation View -->
      <AssoSpaceView v-else-if="currentView === 'asso'" />
    </main>

    <!-- Global Modals & Toasts -->
    <EventDetailModal />
    <ToastNotification />

    <!-- Global Footer -->
    <AppFooter />
  </div>
</template>
