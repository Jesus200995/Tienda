<script setup lang="ts">
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'
import { 
  LayoutDashboard, 
  ShoppingCart, 
  FolderTree, 
  ClipboardList, 
  Settings, 
  LogOut, 
  Home,
  UserCheck,
  Tag,
  Shield
} from 'lucide-vue-next'

const authStore = useAuthStore()
const router = useRouter()

const handleLogout = () => {
  authStore.logout()
  router.push({ name: 'home' })
}

// Nav items for both sidebar (desktop) and bottom bar (mobile)
const primaryNavItems = [
  { name: 'admin-dashboard', label: 'Inicio', icon: LayoutDashboard },
  { name: 'admin-products', label: 'Ropa', icon: ShoppingCart },
  { name: 'admin-orders', label: 'Pedidos', icon: ClipboardList },
  { name: 'admin-offers', label: 'Ofertas', icon: Tag },
]

// Secondary nav items for "More" menu on desktop
const secondaryNavItems = [
  { name: 'admin-categories', label: 'Categorías', icon: FolderTree },
  { name: 'admin-settings', label: 'Configuración', icon: Settings },
]
</script>

<template>
  <div class="min-h-[100dvh] bg-slate-50 text-slate-800 font-body selection:bg-indigo-600 selection:text-white flex flex-col md:flex-row overflow-hidden">
    
    <!-- Mobile Top Header (Sticky) -->
    <header class="md:hidden sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-4 h-14 shadow-sm flex-shrink-0">
      <RouterLink :to="{ name: 'admin-dashboard' }" class="flex items-center gap-1.5 select-none">
        <Shield class="w-5 h-5 text-indigo-600" />
        <span class="text-sm font-display font-black tracking-widest bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
          ADMIN
        </span>
      </RouterLink>
      
      <div class="flex items-center gap-3">
        <RouterLink 
          :to="{ name: 'home' }" 
          class="p-2 rounded-full text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
        >
          <Home class="w-5 h-5" />
        </RouterLink>
        <button 
          @click="handleLogout"
          class="p-2 rounded-full text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
        >
          <LogOut class="w-5 h-5" />
        </button>
      </div>
    </header>

    <!-- Desktop Sidebar (Hidden on Mobile) -->
    <aside class="hidden md:flex flex-col w-64 h-screen sticky top-0 bg-white border-r border-slate-200 flex-shrink-0 shadow-sm z-30">
      <div class="p-6 overflow-y-auto flex-1">
        <!-- Logo -->
        <RouterLink :to="{ name: 'home' }" class="text-lg font-display font-black tracking-widest text-slate-800 flex items-center gap-2 mb-8 select-none">
          <Shield class="w-6 h-6 text-indigo-600" /> <span class="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">ADMIN PANEL</span>
        </RouterLink>

        <!-- Primary Navigation -->
        <nav class="space-y-1.5 text-left text-xs uppercase font-extrabold tracking-wider">
          <p class="text-[10px] text-slate-400 font-bold mb-3 px-2">Principal</p>
          <RouterLink 
            v-for="item in primaryNavItems"
            :key="item.name"
            :to="{ name: item.name }" 
            class="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-colors group"
            active-class="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 shadow-sm shadow-indigo-100/50"
          >
            <component :is="item.icon" class="w-4.5 h-4.5 group-hover:scale-110 transition-transform" />
            {{ item.label }}
          </RouterLink>

          <p class="text-[10px] text-slate-400 font-bold mb-3 px-2 mt-6">Administración</p>
          <RouterLink 
            v-for="item in secondaryNavItems"
            :key="item.name"
            :to="{ name: item.name }" 
            class="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-colors group"
            active-class="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 shadow-sm shadow-indigo-100/50"
          >
            <component :is="item.icon" class="w-4.5 h-4.5 group-hover:scale-110 transition-transform" />
            {{ item.label }}
          </RouterLink>
        </nav>
      </div>

      <!-- Desktop Sidebar Footer -->
      <div class="p-6 border-t border-slate-200 space-y-4">
        <div class="flex items-center gap-3 text-left">
          <div class="p-2 bg-indigo-50 rounded-xl text-indigo-600 border border-indigo-100">
            <UserCheck class="w-4.5 h-4.5" />
          </div>
          <div class="min-w-0">
            <p class="text-xs font-bold text-slate-800 truncate mb-0.5">Administrador</p>
            <p class="text-[9px] text-slate-500 truncate">{{ authStore.user?.email }}</p>
          </div>
        </div>

        <div class="flex gap-2">
          <RouterLink 
            :to="{ name: 'home' }" 
            class="flex-1 flex items-center justify-center p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
            title="Ir a tienda"
          >
            <Home class="w-4.5 h-4.5" />
          </RouterLink>
          <button 
            @click="handleLogout"
            class="flex-1 flex items-center justify-center p-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition-colors cursor-pointer"
            title="Cerrar sesión"
          >
            <LogOut class="w-4.5 h-4.5" />
          </button>
        </div>
      </div>
    </aside>

    <!-- Right/Main: Page Container (Scrollable) -->
    <!-- Note: pb-20 on mobile to account for bottom nav bar, ensuring content isn't hidden -->
    <main class="flex-1 w-full max-w-full h-[calc(100dvh-3.5rem)] md:h-screen overflow-y-auto bg-slate-50/50 p-4 pb-24 sm:p-6 md:p-10 md:pb-10 overscroll-none">
      <div class="max-w-7xl mx-auto w-full">
        <router-view v-slot="{ Component }">
          <Transition name="page" mode="out-in">
            <component :is="Component" />
          </Transition>
        </router-view>
      </div>
    </main>

    <!-- Mobile Bottom Navigation Bar (App-like UX) -->
    <nav class="md:hidden fixed bottom-0 left-0 w-full z-50 bg-white/95 backdrop-blur-md border-t border-slate-200 pb-safe">
      <div class="flex justify-around items-center h-16 px-2">
        <RouterLink 
          v-for="item in primaryNavItems"
          :key="item.name"
          :to="{ name: item.name }" 
          class="flex flex-col items-center justify-center w-full h-full text-slate-400 hover:text-indigo-600 transition-colors group"
          active-class="text-indigo-600"
        >
          <component 
            :is="item.icon" 
            class="w-5 h-5 mb-1 group-[.active]:scale-110 group-active:scale-95 transition-transform" 
          />
          <span class="text-[9px] font-bold uppercase tracking-wider">{{ item.label }}</span>
        </RouterLink>

        <!-- "More" menu for Categories and Settings on mobile -->
        <div class="relative group flex flex-col items-center justify-center w-full h-full cursor-pointer text-slate-400 hover:text-indigo-600">
          <div class="absolute bottom-16 right-2 w-48 bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform translate-y-2 group-hover:translate-y-0 origin-bottom-right z-50">
            <RouterLink 
              v-for="item in secondaryNavItems"
              :key="item.name"
              :to="{ name: item.name }" 
              class="flex items-center gap-3 p-3 text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-indigo-600 hover:bg-slate-50 rounded-xl transition-colors"
              active-class="text-indigo-600 bg-indigo-50"
            >
              <component :is="item.icon" class="w-4.5 h-4.5" />
              {{ item.label }}
            </RouterLink>
          </div>
          <Menu class="w-5 h-5 mb-1 group-active:scale-95 transition-transform" />
          <span class="text-[9px] font-bold uppercase tracking-wider">Más</span>
        </div>
      </div>
    </nav>
  </div>
</template>

<style scoped>
.pb-safe {
  padding-bottom: env(safe-area-inset-bottom);
}
/* Focus within for mobile dropdown */
.group:focus-within > div.absolute {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}
</style>
