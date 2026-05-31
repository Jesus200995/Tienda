<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '../stores/auth'
import AppHeader from '../components/layout/AppHeader.vue'
import AppFooter from '../components/layout/AppFooter.vue'
import CartDrawer from '../components/layout/CartDrawer.vue'
import { Home, Grid, User, Settings } from 'lucide-vue-next'

const authStore = useAuthStore()

// Cart Drawer open state
const isCartOpen = ref(false)

const toggleCart = () => {
  isCartOpen.value = !isCartOpen.value
}

const isAdmin = computed(() => authStore.isAdmin)
const isAuthenticated = computed(() => authStore.isAuthenticated)

const bottomNavItems = computed(() => {
  const items = [
    { name: 'home', label: 'Inicio', icon: Home },
    { name: 'catalog', label: 'Catálogo', icon: Grid },
    { name: 'auth', label: 'Cuenta', icon: User },
  ]
  if (isAdmin.value) {
    items.push({ name: 'admin-dashboard', label: 'Admin', icon: Settings })
  }
  return items
})
</script>

<template>
  <!-- pb-16 or pb-safe to clear the fixed bottom navigation on mobile -->
  <div class="min-h-screen flex flex-col justify-between bg-surface selection:bg-secondary selection:text-white md:pb-0 pb-[72px]">
    <!-- Header -->
    <AppHeader @toggle-cart="toggleCart" />

    <!-- Main Content -->
    <main class="flex-grow w-full max-w-[100vw] overflow-x-hidden">
      <router-view v-slot="{ Component }">
        <Transition name="page" mode="out-in">
          <component :is="Component" @toggle-cart="toggleCart" />
        </Transition>
      </router-view>
    </main>

    <!-- Footer -->
    <AppFooter />

    <!-- Mobile Bottom Navigation Bar -->
    <nav class="md:hidden fixed bottom-0 left-0 w-full z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 pb-safe shadow-[0_-5px_20px_-10px_rgba(0,0,0,0.1)]">
      <div class="flex justify-around items-center h-16 px-2">
        <RouterLink 
          v-for="item in bottomNavItems"
          :key="item.name"
          :to="item.name === 'auth' && isAuthenticated ? '/account' : { name: item.name }" 
          class="flex flex-col items-center justify-center w-full h-full text-slate-400 hover:text-secondary transition-colors group"
          active-class="text-secondary"
        >
          <component 
            :is="item.icon" 
            class="w-5 h-5 mb-1 group-[.active]:scale-110 transition-transform" 
          />
          <span class="text-[9px] font-bold uppercase tracking-wider">{{ item.label }}</span>
        </RouterLink>
      </div>
    </nav>

    <!-- Global Cart Drawer / Bottom Sheet -->
    <CartDrawer :show="isCartOpen" @close="isCartOpen = false" />
  </div>
</template>

<style scoped>
.pb-safe {
  padding-bottom: env(safe-area-inset-bottom, 0px);
}
</style>
