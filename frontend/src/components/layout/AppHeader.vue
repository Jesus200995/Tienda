<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useCartStore } from '../../stores/cart'
import { useAuthStore } from '../../stores/auth'
import { useNotificationsStore } from '../../stores/notifications'
import UserMenu from './UserMenu.vue'
import NotificationCenter from './NotificationCenter.vue'
import { ShoppingCart, User, Settings, Bell } from 'lucide-vue-next'

const emit = defineEmits(['toggle-cart'])

const cartStore = useCartStore()
const authStore = useAuthStore()
const notificationsStore = useNotificationsStore()

// Local State
const isUserMenuOpen = ref(false)
const isNotificationsOpen = ref(false)

const cartCount = computed(() => cartStore.itemCount)
const unreadNotificationsCount = computed(() => notificationsStore.unreadCount)
const isAuthenticated = computed(() => authStore.isAuthenticated)
const isAdmin = computed(() => authStore.isAdmin)

// Click outside handling for UserMenu
const closeUserMenu = () => {
  isUserMenuOpen.value = false
}

onMounted(() => {
  document.addEventListener('click', closeUserMenu)
})

onUnmounted(() => {
  document.removeEventListener('click', closeUserMenu)
})
</script>

<template>
  <header class="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-slate-100/80 transition-all duration-300">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-20 flex items-center justify-between">
      
      <!-- Left: Navigation Links (Desktop Only) -->
      <div class="flex items-center gap-1">
        <!-- Desktop Nav -->
        <nav class="hidden md:flex items-center gap-8">
          <RouterLink :to="{ name: 'home' }" class="text-sm font-semibold tracking-wide uppercase text-primary hover:text-secondary transition-colors" active-class="text-secondary font-bold">
            Inicio
          </RouterLink>
          <RouterLink :to="{ name: 'catalog' }" class="text-sm font-semibold tracking-wide uppercase text-primary hover:text-secondary transition-colors" active-class="text-secondary font-bold">
            Catálogo
          </RouterLink>
          <RouterLink v-if="isAdmin" :to="{ name: 'admin-dashboard' }" class="text-sm font-semibold tracking-wide uppercase text-accent hover:text-secondary transition-colors flex items-center gap-1.5" active-class="text-secondary font-bold">
            <Settings class="w-4 h-4" />
            Panel Admin
          </RouterLink>
        </nav>
      </div>

      <!-- Center: Logo -->
      <div class="absolute left-1/2 transform -translate-x-1/2 flex items-center w-full max-w-[200px] sm:max-w-none justify-center pointer-events-none">
        <RouterLink :to="{ name: 'home' }" class="pointer-events-auto text-base sm:text-2xl font-display font-black tracking-wider text-primary select-none flex items-center justify-center gap-1.5 whitespace-nowrap leading-none">
          <ShoppingCart class="w-5 h-5 sm:w-6 sm:h-6 text-secondary shrink-0" /> 
          <span class="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent truncate pb-1">EL COMERCIAMBRE</span>
        </RouterLink>
      </div>

      <!-- Right: Action Icons (Cart, Notifications, Account) -->
      <!-- Only showing Cart and Notifications on mobile, Account handled by bottom nav -->
      <div class="flex items-center gap-1 sm:gap-2 relative">
        
        <template v-if="isAuthenticated">
          <!-- Auth / Profile (Desktop Only) -->
          <div class="relative hidden md:block">
            <button 
              @click.stop="isUserMenuOpen = !isUserMenuOpen"
              class="p-2 rounded-full text-primary hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-center"
              title="Mi cuenta"
            >
              <User class="w-5.5 h-5.5" />
            </button>
            
            <UserMenu 
              :show="isUserMenuOpen" 
              @close="isUserMenuOpen = false"
              @open-notifications="isNotificationsOpen = true"
            />
          </div>

          <!-- Notifications Bell Icon with Badge -->
          <button 
            @click="isNotificationsOpen = !isNotificationsOpen"
            class="relative p-2 rounded-full text-primary hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-center"
            aria-label="Ver notificaciones"
          >
            <Bell class="w-5 h-5 sm:w-5.5 sm:h-5.5" />
            <Transition
              enter-active-class="transition duration-300 ease-out"
              enter-from-class="scale-0"
              enter-to-class="scale-100"
              leave-active-class="transition duration-200 ease-in"
              leave-from-class="scale-100"
              leave-to-class="scale-0"
            >
              <span 
                v-if="unreadNotificationsCount > 0" 
                class="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-secondary text-[8px] font-bold text-white shadow-sm ring-1.5 ring-white animate-bounce"
              >
                {{ unreadNotificationsCount }}
              </span>
            </Transition>
          </button>
        </template>
        
        <!-- Guest Login Link (Desktop Only) -->
        <RouterLink 
          v-if="!isAuthenticated" 
          to="/auth" 
          class="hidden md:flex px-4 py-2 text-xs font-black uppercase tracking-wider bg-slate-900 text-white rounded-xl hover:bg-indigo-650 hover:shadow-lg transition-all shadow-sm hover:shadow-indigo-100 items-center justify-center cursor-pointer"
        >
          Ingresar
        </RouterLink>

        <!-- Cart Trigger (Always visible) -->
        <button 
          @click="emit('toggle-cart')"
          class="relative p-2 rounded-full text-primary hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-center"
          aria-label="Ver carrito"
        >
          <ShoppingCart class="w-5 h-5 sm:w-5.5 sm:h-5.5" />
          <Transition
            enter-active-class="transition duration-300 ease-out"
            enter-from-class="scale-0"
            enter-to-class="scale-100"
            leave-active-class="transition duration-200 ease-in"
            leave-from-class="scale-100"
            leave-to-class="scale-0"
          >
            <span 
              v-if="cartCount > 0" 
              class="absolute -top-0.5 -right-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-secondary text-[9px] font-bold text-white shadow-sm ring-1.5 ring-white animate-bounce"
            >
              {{ cartCount }}
            </span>
          </Transition>
        </button>
      </div>

    </div>

    <!-- Slide-out In-App Notification Center Drawer -->
    <NotificationCenter 
      :show="isNotificationsOpen" 
      @close="isNotificationsOpen = false" 
    />
  </header>
</template>
