<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useOffersStore } from './stores/offers'
import ToastNotification from './components/ui/ToastNotification.vue'

const offersStore = useOffersStore()
let checkInterval: number | null = null

onMounted(() => {
  // Sync products with current active offers on app launch
  offersStore.syncOffersWithProducts()
  
  // Deactivate expired offers instantly if any
  offersStore.deactivateExpired()
  
  // Periodically check every 60 seconds
  checkInterval = window.setInterval(() => {
    offersStore.deactivateExpired()
  }, 60000)
})

onUnmounted(() => {
  if (checkInterval) {
    clearInterval(checkInterval)
  }
})
</script>

<template>
  <router-view />
  <ToastNotification />
</template>
