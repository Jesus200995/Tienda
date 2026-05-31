<script setup lang="ts">
import { ref } from 'vue'
import AppHeader from '../components/layout/AppHeader.vue'
import AppFooter from '../components/layout/AppFooter.vue'
import CartDrawer from '../components/layout/CartDrawer.vue'

// Cart Drawer open state
const isCartOpen = ref(false)

const toggleCart = () => {
  isCartOpen.value = !isCartOpen.value
}
</script>

<template>
  <div class="min-h-screen flex flex-col justify-between bg-surface selection:bg-secondary selection:text-white">
    <!-- Header -->
    <AppHeader @toggle-cart="toggleCart" />

    <!-- Main Content -->
    <main class="flex-grow">
      <router-view v-slot="{ Component }">
        <Transition name="page" mode="out-in">
          <component :is="Component" @toggle-cart="toggleCart" />
        </Transition>
      </router-view>
    </main>

    <!-- Footer -->
    <AppFooter />

    <!-- Global Cart Drawer -->
    <CartDrawer :show="isCartOpen" @close="isCartOpen = false" />
  </div>
</template>
