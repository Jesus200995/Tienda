<script setup lang="ts">
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'
import { 
  LayoutDashboard, 
  ShoppingBag, 
  FolderTree, 
  ClipboardList, 
  Settings, 
  LogOut, 
  Home,
  UserCheck
} from 'lucide-vue-next'

const authStore = useAuthStore()
const router = useRouter()

const handleLogout = () => {
  authStore.logout()
  router.push({ name: 'home' })
}
</script>

<template>
  <div class="min-h-screen bg-[#0b0c15] text-slate-100 flex flex-col md:flex-row font-body selection:bg-secondary selection:text-white">
    <!-- Left: Sidebar Navigation -->
    <aside class="w-full md:w-64 bg-[#121324] border-b md:border-b-0 md:border-r border-slate-800 flex flex-col justify-between flex-shrink-0">
      <div class="p-6">
        <!-- Logo -->
        <RouterLink :to="{ name: 'home' }" class="text-lg font-display font-black tracking-widest text-white flex items-center gap-2 mb-8 select-none">
          🛡️ <span class="bg-gradient-to-r from-secondary to-indigo-400 bg-clip-text text-transparent">ADMIN PANEL</span>
        </RouterLink>

        <!-- Navigation Links -->
        <nav class="space-y-1.5 text-left text-xs uppercase font-extrabold tracking-wider">
          <RouterLink 
            :to="{ name: 'admin-dashboard' }" 
            class="flex items-center gap-3 px-4 py-3 rounded-md text-slate-400 hover:bg-white/5 hover:text-white transition-colors"
            active-class="bg-secondary text-white hover:bg-secondary"
          >
            <LayoutDashboard class="w-4 h-4" />
            Dashboard
          </RouterLink>
          
          <RouterLink 
            :to="{ name: 'admin-products' }" 
            class="flex items-center gap-3 px-4 py-3 rounded-md text-slate-400 hover:bg-white/5 hover:text-white transition-colors"
            active-class="bg-secondary text-white hover:bg-secondary"
          >
            <ShoppingBag class="w-4 h-4" />
            Productos
          </RouterLink>

          <RouterLink 
            :to="{ name: 'admin-categories' }" 
            class="flex items-center gap-3 px-4 py-3 rounded-md text-slate-400 hover:bg-white/5 hover:text-white transition-colors"
            active-class="bg-secondary text-white hover:bg-secondary"
          >
            <FolderTree class="w-4 h-4" />
            Categorías
          </RouterLink>

          <RouterLink 
            :to="{ name: 'admin-orders' }" 
            class="flex items-center gap-3 px-4 py-3 rounded-md text-slate-400 hover:bg-white/5 hover:text-white transition-colors"
            active-class="bg-secondary text-white hover:bg-secondary"
          >
            <ClipboardList class="w-4 h-4" />
            Pedidos
          </RouterLink>

          <RouterLink 
            :to="{ name: 'admin-settings' }" 
            class="flex items-center gap-3 px-4 py-3 rounded-md text-slate-400 hover:bg-white/5 hover:text-white transition-colors"
            active-class="bg-secondary text-white hover:bg-secondary"
          >
            <Settings class="w-4 h-4" />
            Configuración
          </RouterLink>
        </nav>
      </div>

      <!-- Sidebar footer tools -->
      <div class="p-6 border-t border-slate-800/60 space-y-4">
        <!-- Profile info -->
        <div class="flex items-center gap-3 text-left">
          <div class="p-2 bg-indigo-500/10 rounded-full text-indigo-400">
            <UserCheck class="w-4 h-4" />
          </div>
          <div class="min-w-0">
            <p class="text-xs font-bold text-white truncate leading-none mb-1">Administrador</p>
            <p class="text-[9px] text-slate-400 truncate leading-none">{{ authStore.user?.email }}</p>
          </div>
        </div>

        <div class="h-px bg-slate-800/40"></div>

        <div class="flex gap-2">
          <!-- Back to storefront -->
          <RouterLink 
            :to="{ name: 'home' }" 
            class="flex-1 flex items-center justify-center p-2.5 rounded bg-slate-800 hover:bg-slate-750 transition-colors text-white hover:text-white"
            title="Ir a tienda"
          >
            <Home class="w-4 h-4" />
          </RouterLink>
          
          <!-- Logout -->
          <button 
            @click="handleLogout"
            class="flex-1 flex items-center justify-center p-2.5 rounded bg-danger/10 hover:bg-danger/20 transition-colors text-danger cursor-pointer"
            title="Cerrar sesión"
          >
            <LogOut class="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>

    <!-- Right: Page Container (Scrollable) -->
    <main class="flex-grow h-screen overflow-y-auto bg-[#07080f] p-6 sm:p-10">
      <router-view v-slot="{ Component }">
        <Transition name="page" mode="out-in">
          <component :is="Component" />
        </Transition>
      </router-view>
    </main>
  </div>
</template>
