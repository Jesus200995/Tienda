<script setup lang="ts">
import { ref, computed } from 'vue'
import { useCartStore } from '../../stores/cart'
import { useAuthStore } from '../../stores/auth'
import { Menu, X, ShoppingBag, User, Settings, LogOut } from 'lucide-vue-next'

const emit = defineEmits(['toggle-cart'])

const cartStore = useCartStore()
const authStore = useAuthStore()

// Local State
const isMobileMenuOpen = ref(false)

const cartCount = computed(() => cartStore.itemCount)
const isAuthenticated = computed(() => authStore.isAuthenticated)
const isAdmin = computed(() => authStore.isAdmin)
const user = computed(() => authStore.user)

const handleLogout = () => {
  authStore.logout()
}
</script>

<template>
  <header class="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-slate-100/80 transition-all duration-300">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
      
      <!-- Left: Mobile Menu Toggle / Navigation Links (Desktop) -->
      <div class="flex items-center gap-1">
        <button 
          @click="isMobileMenuOpen = !isMobileMenuOpen"
          class="md:hidden p-2 rounded-full text-primary hover:bg-slate-50 transition-colors cursor-pointer"
          aria-label="Abrir menú"
        >
          <Menu v-if="!isMobileMenuOpen" class="w-6 h-6" />
          <X v-else class="w-6 h-6" />
        </button>
        
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
      <div class="absolute left-1/2 transform -translate-x-1/2 flex items-center">
        <RouterLink :to="{ name: 'home' }" class="text-xl sm:text-2xl font-display font-black tracking-wider text-primary select-none flex items-center gap-1">
          🛍️ <span class="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">EL COMERCIAMBRE</span>
        </RouterLink>
      </div>

      <!-- Right: Action Icons -->
      <div class="flex items-center gap-1 sm:gap-3">
        
        <!-- Auth / Profile -->
        <div class="relative group">
          <RouterLink 
            :to="isAuthenticated ? { name: authStore.isAdmin ? 'admin-dashboard' : 'account' } : { name: 'auth' }" 
            class="p-2 rounded-full text-primary hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-center"
            title="Mi cuenta"
          >
            <User class="w-5 h-5 sm:w-5.5 sm:h-5.5" />
          </RouterLink>
          
          <!-- Auth Dropdown menu for desktop hover -->
          <div 
            v-if="isAuthenticated" 
            class="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-100 rounded-md shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-300 z-50 p-2.5"
          >
            <div class="px-2 py-1.5 mb-2 border-b border-slate-50">
              <p class="text-xs font-semibold text-primary truncate">{{ user?.name }}</p>
              <p class="text-[10px] text-slate-400 truncate">{{ user?.email }}</p>
            </div>
            
            <RouterLink 
              v-if="isAdmin" 
              :to="{ name: 'admin-dashboard' }" 
              class="flex items-center gap-2 px-2 py-1.5 text-xs text-primary hover:bg-slate-50 hover:text-secondary rounded-md transition-colors"
            >
              <Settings class="w-3.5 h-3.5" />
              Panel Administrativo
            </RouterLink>
            
            <RouterLink 
              v-else 
              :to="{ name: 'account' }" 
              class="flex items-center gap-2 px-2 py-1.5 text-xs text-primary hover:bg-slate-50 hover:text-secondary rounded-md transition-colors"
            >
              <User class="w-3.5 h-3.5" />
              Mi Cuenta
            </RouterLink>
            
            <button 
              @click="handleLogout"
              class="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-danger hover:bg-danger/5 rounded-md transition-colors text-left cursor-pointer"
            >
              <LogOut class="w-3.5 h-3.5" />
              Cerrar Sesión
            </button>
          </div>
        </div>

        <!-- Cart Trigger -->
        <button 
          @click="emit('toggle-cart')"
          class="relative p-2 rounded-full text-primary hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-center"
          aria-label="Ver carrito"
        >
          <ShoppingBag class="w-5 h-5 sm:w-5.5 sm:h-5.5" />
          <Transition
            enter-active-class="transition duration-300 ease-out-expo"
            enter-from-class="scale-0"
            enter-to-class="scale-100"
            leave-active-class="transition duration-200 ease-in"
            leave-from-class="scale-100"
            leave-to-class="scale-0"
          >
            <span 
              v-if="cartCount > 0" 
              class="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-secondary text-[9px] font-bold text-white shadow-sm ring-1.5 ring-white animate-bounce"
            >
              {{ cartCount }}
            </span>
          </Transition>
        </button>
      </div>

    </div>

    <!-- Mobile Navigation Drawer -->
    <Transition
      enter-active-class="transition duration-300 ease-out-expo"
      enter-from-class="-translate-x-full opacity-0"
      enter-to-class="translate-x-0 opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="translate-x-0 opacity-100"
      leave-to-class="-translate-x-full opacity-0"
    >
      <div v-if="isMobileMenuOpen" class="fixed inset-0 top-16 sm:top-20 z-30 md:hidden bg-white/95 backdrop-blur-md flex flex-col justify-between border-t border-slate-100">
        <nav class="flex flex-col gap-6 p-8 text-left">
          <RouterLink 
            :to="{ name: 'home' }" 
            @click="isMobileMenuOpen = false" 
            class="text-lg font-bold tracking-wide uppercase text-primary hover:text-secondary transition-colors"
            active-class="text-secondary font-black"
          >
            Inicio
          </RouterLink>
          <RouterLink 
            :to="{ name: 'catalog' }" 
            @click="isMobileMenuOpen = false" 
            class="text-lg font-bold tracking-wide uppercase text-primary hover:text-secondary transition-colors"
            active-class="text-secondary font-black"
          >
            Catálogo
          </RouterLink>
          <RouterLink 
            v-if="isAdmin" 
            :to="{ name: 'admin-dashboard' }" 
            @click="isMobileMenuOpen = false" 
            class="text-lg font-bold tracking-wide uppercase text-accent hover:text-secondary transition-colors flex items-center gap-2"
            active-class="text-secondary font-black"
          >
            <Settings class="w-5 h-5" />
            Panel Admin
          </RouterLink>
          
          <div class="h-px bg-slate-100 my-4"></div>
          
          <RouterLink 
            v-if="isAuthenticated" 
            :to="{ name: 'account' }" 
            @click="isMobileMenuOpen = false" 
            class="text-sm font-semibold text-primary/80 hover:text-secondary transition-colors"
          >
            Mi Cuenta ({{ user?.name }})
          </RouterLink>
          
          <button 
            v-if="isAuthenticated"
            @click="() => { isMobileMenuOpen = false; handleLogout() }"
            class="text-sm font-semibold text-danger/80 hover:underline text-left cursor-pointer"
          >
            Cerrar Sesión
          </button>
        </nav>

        <div class="p-8 border-t border-slate-50 text-slate-400 text-xs">
          <p class="font-medium text-slate-600 mb-1">© 2026 El Comerciambre</p>
          <p>La mejor ropa urbana y minimalista.</p>
        </div>
      </div>
    </Transition>
  </header>
</template>
