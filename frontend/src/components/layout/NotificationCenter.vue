<script setup lang="ts">
import { computed } from 'vue'
import { useNotificationsStore } from '../../stores/notifications'
import { useProductStore } from '../../stores/products'
import { useRouter } from 'vue-router'
import { X, Bell, Package, CreditCard, ChevronRight, Tag } from 'lucide-vue-next'

defineProps<{
  show: boolean
}>()

const emit = defineEmits(['close'])

const notificationsStore = useNotificationsStore()
const productStore = useProductStore()
const router = useRouter()

const notifications = computed(() => notificationsStore.sortedNotifications)
const unreadCount = computed(() => notificationsStore.unreadCount)

const getIcon = (type: string) => {
  switch (type) {
    case 'order_status': return Package
    case 'payment': return CreditCard
    case 'shipping': return Package
    case 'offer': return Tag
    default: return Bell
  }
}

const getIconClass = (type: string) => {
  switch (type) {
    case 'order_status': return 'bg-amber-50 text-amber-500'
    case 'payment': return 'bg-emerald-50 text-emerald-500'
    case 'shipping': return 'bg-blue-50 text-blue-500'
    case 'offer': return 'bg-yellow-50 text-yellow-600'
    default: return 'bg-slate-50 text-slate-500'
  }
}

const handleNotificationClick = (notification: any) => {
  notificationsStore.markAsRead(notification.id)
  emit('close')
  if (notification.orderId) {
    router.push(`/account/orders/${notification.orderId}`)
  } else if (notification.type === 'offer' && notification.productId) {
    const prod = productStore.getProductById(notification.productId)
    if (prod) {
      router.push(`/product/${prod.slug}`)
    } else {
      router.push('/catalog')
    }
  } else {
    router.push('/account')
  }
}

const formatRelativeTime = (isoString: string) => {
  const date = new Date(isoString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  
  const diffMins = Math.floor(diffMs / 60000)
  if (diffMins < 1) return 'Hace un momento'
  if (diffMins < 60) return `Hace ${diffMins} min`
  
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `Hace ${diffHours} h`
  
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays === 1) return 'Ayer'
  return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })
}
</script>

<template>
  <Teleport to="body">
    <!-- Backdrop Overlay -->
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div 
        v-if="show" 
        class="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-end"
        @click.self="emit('close')"
      >
        <!-- Slide Panel -->
        <Transition
          enter-active-class="transition duration-400 ease-out-expo"
          enter-from-class="translate-x-full"
          enter-to-class="translate-x-0"
          leave-active-class="transition duration-300 ease-in"
          leave-from-class="translate-x-0"
          leave-to-class="translate-x-full"
        >
          <div 
            v-if="show"
            class="w-full max-w-md h-full bg-white shadow-xl flex flex-col justify-between"
          >
            <!-- Header -->
            <div class="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between">
              <div class="flex items-center gap-2">
                <Bell class="w-5 h-5 text-secondary" />
                <h3 class="text-base font-bold font-display uppercase tracking-wider text-primary">
                  Notificaciones
                </h3>
                <span v-if="unreadCount > 0" class="px-2 py-0.5 bg-secondary text-white text-[10px] font-black rounded-full animate-bounce-in">
                  {{ unreadCount }}
                </span>
              </div>
              <div class="flex items-center gap-3">
                <button 
                  v-if="unreadCount > 0" 
                  @click="notificationsStore.markAllAsRead()"
                  class="text-[10px] font-bold text-secondary uppercase hover:underline cursor-pointer"
                  title="Marcar todas como leídas"
                >
                  Leer todas
                </button>
                <button 
                  @click="emit('close')" 
                  class="p-1 rounded-full text-slate-400 hover:text-primary transition-colors cursor-pointer hover:bg-slate-50"
                  aria-label="Cerrar notificaciones"
                >
                  <X class="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <!-- List Content -->
            <div class="flex-grow overflow-y-auto px-4 py-4 bg-slate-50/30">
              
              <!-- Empty state -->
              <div v-if="notifications.length === 0" class="flex flex-col items-center justify-center h-full text-center space-y-4">
                <div class="p-4 bg-white rounded-full text-slate-300 shadow-soft">
                  <Bell class="w-10 h-10" />
                </div>
                <p class="text-sm font-semibold text-primary">No tienes notificaciones</p>
                <p class="text-xs text-slate-400 max-w-xs">
                  Aquí te avisaremos sobre las actualizaciones de tus compras y las ofertas exclusivas de la tienda.
                </p>
              </div>
              
              <!-- Notifications list -->
              <div v-else class="space-y-2.5">
                <div 
                  v-for="notification in notifications" 
                  :key="notification.id"
                  @click="handleNotificationClick(notification)"
                  class="bg-white border border-slate-100 rounded-xl p-4 flex gap-3 text-left transition-all duration-300 cursor-pointer shadow-soft hover:shadow-medium hover:border-slate-200 hover:-translate-y-0.5 relative overflow-hidden"
                  :class="!notification.read ? 'border-l-4 border-l-secondary' : ''"
                >
                  <!-- Read/Unread small pill overlay -->
                  <span v-if="!notification.read" class="absolute top-4 right-4 w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
 
                  <!-- Left icon -->
                  <div 
                    class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    :class="getIconClass(notification.type)"
                  >
                    <component :is="getIcon(notification.type)" class="w-5 h-5" />
                  </div>
                  
                  <!-- Main Info -->
                  <div class="flex-grow min-w-0 pr-4">
                    <h4 class="text-xs font-black text-primary leading-tight">
                      {{ notification.title }}
                    </h4>
                    <p class="text-[11px] text-slate-550 mt-1 leading-normal">
                      {{ notification.message }}
                    </p>
                    <span class="block text-[9px] font-semibold text-slate-400 mt-2.5">
                      {{ formatRelativeTime(notification.createdAt) }}
                    </span>
                  </div>
 
                  <!-- Arrow indicator -->
                  <ChevronRight class="w-4 h-4 text-slate-300 self-center" />
                </div>
              </div>
              
            </div>
 
            <!-- Footer block -->
            <div v-if="notifications.length > 0" class="px-6 py-4 border-t border-slate-100 bg-white flex justify-center">
              <button 
                @click="notificationsStore.clearAll()"
                class="text-xs font-bold text-slate-400 hover:text-danger transition-colors cursor-pointer"
              >
                Limpiar historial
              </button>
            </div>
 
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
