<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { useNotificationsStore } from '../../stores/notifications'
import { useRouter } from 'vue-router'
import { 
  ShoppingCart, 
  User, 
  Settings, 
  LogOut, 
  Bell, 
  ChevronRight
} from 'lucide-vue-next'

const props = defineProps<{
  show: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'open-notifications'): void
}>()

const authStore = useAuthStore()
const notificationsStore = useNotificationsStore()
const router = useRouter()

const user = computed(() => authStore.user)
const unreadNotifications = computed(() => notificationsStore.unreadCount)

const getInitials = (name: string) => {
  if (!name) return 'U'
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
}

// Generate consistent background color based on name
const getAvatarColor = (name: string) => {
  if (!name) return 'bg-gradient-to-tr from-secondary to-pink-500'
  const charCodeSum = name.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0)
  const gradients = [
    'from-indigo-500 to-purple-500',
    'from-blue-500 to-teal-500',
    'from-emerald-500 to-teal-500',
    'from-amber-500 to-orange-500',
    'from-rose-500 to-pink-500',
    'from-secondary to-red-500'
  ]
  const index = charCodeSum % gradients.length
  return `bg-gradient-to-tr ${gradients[index]}`
}

const handleNavigate = (path: string, tab?: string) => {
  emit('close')
  if (tab) {
    router.push({ path, query: { tab } })
  } else {
    router.push(path)
  }
}

const handleLogout = () => {
  emit('close')
  authStore.logout()
  router.push('/')
}
</script>

<template>
  <Transition name="fade-scale">
    <div 
      v-if="show"
      class="absolute right-0 top-full mt-2 w-72 bg-white border border-slate-100 rounded-2xl shadow-hover overflow-hidden z-40 text-left pointer-events-auto"
      @click.stop
    >
      <!-- User Profile Info Header -->
      <div v-if="authStore.isAuthenticated" class="p-5 border-b border-slate-100 bg-slate-50/50 flex gap-3.5 items-center">
        <!-- Avatar Initials Circle -->
        <div 
          class="w-12 h-12 rounded-full flex items-center justify-center text-white font-extrabold text-sm shadow-sm flex-shrink-0"
          :class="getAvatarColor(user?.name || '')"
        >
          {{ getInitials(user?.name || '') }}
        </div>
        
        <div class="flex-grow min-w-0">
          <h4 class="text-sm font-black text-primary truncate leading-tight">
            {{ user?.name }}
          </h4>
          <p class="text-[10px] text-slate-400 font-semibold truncate mt-0.5">
            {{ user?.email }}
          </p>
          <button 
            @click="handleNavigate('/account', 'profile')"
            class="text-[10px] font-bold text-secondary hover:underline transition-all mt-1 flex items-center gap-0.5 cursor-pointer"
          >
            Editar perfil
            <ChevronRight class="w-2.5 h-2.5" />
          </button>
        </div>
      </div>

      <!-- Links menu -->
      <div class="p-2 space-y-0.5">
        <template v-if="authStore.isAuthenticated">
          <!-- Mis compras link -->
          <button 
            @click="handleNavigate('/account', 'orders')"
            class="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors text-slate-700 hover:text-primary text-xs font-semibold cursor-pointer group"
          >
            <div class="flex items-center gap-3">
              <ShoppingCart class="w-4.5 h-4.5 text-slate-400 group-hover:text-primary transition-colors" />
              <span>Mis compras</span>
            </div>
            <ChevronRight class="w-4 h-4 text-slate-300" />
          </button>

          <!-- Perfil link -->
          <button 
            @click="handleNavigate('/account', 'profile')"
            class="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors text-slate-700 hover:text-primary text-xs font-semibold cursor-pointer group"
          >
            <div class="flex items-center gap-3">
              <User class="w-4.5 h-4.5 text-slate-400 group-hover:text-primary transition-colors" />
              <span>Mi perfil</span>
            </div>
            <ChevronRight class="w-4 h-4 text-slate-300" />
          </button>

          <!-- In-App Notifications link -->
          <button 
            @click="() => { emit('close'); emit('open-notifications') }"
            class="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors text-slate-700 hover:text-primary text-xs font-semibold cursor-pointer group"
          >
            <div class="flex items-center justify-between w-full">
              <div class="flex items-center gap-3">
                <Bell class="w-4.5 h-4.5 text-slate-400 group-hover:text-primary transition-colors" />
                <span>Notificaciones</span>
              </div>
              <div class="flex items-center gap-1.5">
                <span v-if="unreadNotifications > 0" class="px-1.5 py-0.5 bg-secondary text-white text-[8px] font-black rounded-full">
                  {{ unreadNotifications }}
                </span>
                <ChevronRight class="w-4 h-4 text-slate-300" />
              </div>
            </div>
          </button>

          <!-- Admin dashboard link (conditionally rendered) -->
          <button 
            v-if="authStore.isAdmin"
            @click="handleNavigate('/admin/dashboard')"
            class="w-full flex items-center justify-between p-3 rounded-xl bg-accent/5 hover:bg-accent/10 border border-accent/5 transition-colors text-accent hover:text-accent font-bold text-xs cursor-pointer group mt-1"
          >
            <div class="flex items-center gap-3">
              <Settings class="w-4.5 h-4.5 text-accent" />
              <span>Panel Administrativo</span>
            </div>
            <ChevronRight class="w-4 h-4 text-accent/60" />
          </button>
        </template>
        
        <template v-else>
          <!-- Guest CTA -->
          <div class="p-4 text-center space-y-3">
            <p class="text-xs text-slate-400 font-semibold leading-normal">
              Inicia sesión para ver tu historial de compras, rastrear tus pedidos y más.
            </p>
            <BaseButton 
              variant="secondary" 
              class="w-full h-9 text-xs font-bold shadow-sm cursor-pointer"
              @click="handleNavigate('/auth')"
            >
              Ingresar / Registrarse
            </BaseButton>
          </div>
        </template>
      </div>

      <!-- Logout bottom section -->
      <div v-if="authStore.isAuthenticated" class="p-2 border-t border-slate-100">
        <button 
          @click="handleLogout"
          class="w-full flex items-center gap-3 p-3 rounded-xl text-slate-500 hover:text-danger hover:bg-danger/5 transition-all text-xs font-bold cursor-pointer"
        >
          <LogOut class="w-4.5 h-4.5" />
          <span>Cerrar sesión</span>
        </button>
      </div>

    </div>
  </Transition>
</template>

<style scoped>
.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(-10px);
}
</style>
