<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import BaseInput from '../../components/ui/BaseInput.vue'
import BaseButton from '../../components/ui/BaseButton.vue'
import { ShoppingCart, CheckCircle, Package, ArrowRight, LogOut } from 'lucide-vue-next'

const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()

// State
const activeTab = ref<'orders' | 'profile'>('orders')

const name = ref(authStore.user?.name || '')
const phone = ref(authStore.user?.phone || '')
const address = ref(authStore.user?.address || '')
const email = ref(authStore.user?.email || '')

const showProfileSuccess = ref(false)

// Tab routing synchronization (Mercado Libre Style)
watch(() => route.query.tab, (newTab) => {
  if (newTab === 'profile') {
    activeTab.value = 'profile'
  } else {
    activeTab.value = 'orders'
  }
}, { immediate: true })

// Load customer orders from localStorage
const orders = computed(() => {
  const allOrders = JSON.parse(localStorage.getItem('comerciambre_orders') || '[]')
  return allOrders.filter((order: any) => order.user_id === authStore.user?.id)
})

const handleUpdateProfile = () => {
  authStore.updateProfile({
    name: name.value,
    phone: phone.value,
    address: address.value,
    email: email.value
  })
  
  showProfileSuccess.value = true
  setTimeout(() => {
    showProfileSuccess.value = false
  }, 2000)
}

const getStatusBadgeClass = (status: string) => {
  const classes = {
    pending: 'bg-warning/15 text-warning',
    paid: 'bg-emerald-500/15 text-emerald-600',
    preparing: 'bg-accent/15 text-accent',
    shipped: 'bg-blue-500/15 text-blue-600',
    delivered: 'bg-slate-500/15 text-slate-500',
    cancelled: 'bg-danger/15 text-danger'
  }
  return classes[status as keyof typeof classes] || 'bg-slate-200 text-slate-700'
}

const getStatusTranslation = (status: string) => {
  const statusTranslations = {
    pending: 'Pendiente de Pago',
    paid: 'Pagado',
    preparing: 'Preparando Envío',
    shipped: 'Enviado / En camino',
    delivered: 'Entregado',
    cancelled: 'Cancelado'
  }
  return statusTranslations[status as keyof typeof statusTranslations] || status
}
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6 pb-12 text-left">
    
    <!-- Title -->
    <div class="mb-8">
      <span class="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block mb-1">
        Bandeja de Cliente
      </span>
      <h1 class="text-3xl font-display font-black text-primary">
        Mi Cuenta
      </h1>
      <p class="text-xs text-slate-400 mt-1 font-semibold">
        Hola, {{ authStore.user?.name }}. Administra tus pedidos y perfil.
      </p>
    </div>

    <!-- Navigation Tabs -->
    <div class="flex border-b border-slate-100 mb-8 gap-6 font-bold text-xs uppercase tracking-wider">
      <button 
        @click="router.push({ path: '/account', query: { tab: 'orders' } })"
        :class="[
          'pb-3 border-b-2 transition-all cursor-pointer',
          activeTab === 'orders' ? 'border-secondary text-secondary font-black' : 'border-transparent text-slate-400 hover:text-primary'
        ]"
      >
        Mis Pedidos ({{ orders.length }})
      </button>
      <button 
        @click="router.push({ path: '/account', query: { tab: 'profile' } })"
        :class="[
          'pb-3 border-b-2 transition-all cursor-pointer',
          activeTab === 'profile' ? 'border-secondary text-secondary font-black' : 'border-transparent text-slate-400 hover:text-primary'
        ]"
      >
        Detalles del Perfil
      </button>
    </div>

    <!-- TAB 1: Orders list -->
    <div v-if="activeTab === 'orders'" class="space-y-4">
      
      <!-- Empty state -->
      <div v-if="orders.length === 0" class="bg-white border border-slate-100 rounded-lg p-8 text-center space-y-4 shadow-soft py-16">
        <div class="p-4 bg-slate-50 rounded-full text-slate-400 inline-block">
          <ShoppingCart class="w-8 h-8" />
        </div>
        <p class="text-sm font-semibold text-primary">No tienes pedidos activos</p>
        <p class="text-xs text-slate-400 max-w-xs mx-auto leading-normal">
          ¡Aún no has realizado compras! Visita nuestro catálogo e inicia tu estilo hoy.
        </p>
      </div>

      <!-- Orders listing (Mercado Libre Style overview cards) -->
      <div 
        v-else 
        v-for="order in orders" 
        :key="order.id"
        class="bg-white border border-slate-100 rounded-2xl shadow-soft overflow-hidden transition-all duration-300 hover:border-slate-200"
      >
        <!-- Header of order card -->
        <div class="px-6 py-4.5 bg-slate-50/50 border-b border-slate-100/70 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div class="flex gap-6">
            <div>
              <p class="text-slate-400 font-bold uppercase tracking-wider text-[9px] mb-0.5">Pedido</p>
              <p class="font-bold text-primary">#{{ order.order_number }}</p>
            </div>
            <div>
              <p class="text-slate-400 font-bold uppercase tracking-wider text-[9px] mb-0.5">Fecha</p>
              <p class="font-semibold text-slate-600">{{ new Date(order.created_at).toLocaleDateString() }}</p>
            </div>
            <div>
              <p class="text-slate-400 font-bold uppercase tracking-wider text-[9px] mb-0.5">Total</p>
              <p class="font-bold text-primary">${{ order.total.toLocaleString() }}</p>
            </div>
          </div>
          
          <span :class="['px-2.5 py-0.75 rounded-md font-bold text-[9px] tracking-wider uppercase', getStatusBadgeClass(order.status)]">
            {{ getStatusTranslation(order.status) }}
          </span>
        </div>

        <!-- Body of order card (Brief summary & Navigation) -->
        <div class="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div class="space-y-2 text-xs font-semibold pr-4">
            <p class="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Prendas del pedido:</p>
            <div class="flex flex-wrap gap-x-4 gap-y-1.5 text-primary">
              <span 
                v-for="item in order.items" 
                :key="item.id"
                class="flex items-center gap-1.5"
              >
                <Package class="w-3.5 h-3.5 text-slate-400" />
                {{ item.product_name }}
                <span class="text-slate-400 font-bold">x{{ item.quantity }}</span>
              </span>
            </div>
          </div>

          <!-- Quick Navigation Link to Detail Page -->
          <BaseButton 
            variant="outline" 
            size="sm" 
            class="w-full sm:w-auto h-10 text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
            @click="router.push(`/account/orders/${order.id}`)"
          >
            Detalle de Pedido
            <ArrowRight class="w-3.5 h-3.5" />
          </BaseButton>
        </div>
      </div>

    </div>

    <!-- TAB 2: Profile settings -->
    <div v-else-if="activeTab === 'profile'" class="bg-white border border-slate-100 rounded-lg p-6 sm:p-8 shadow-soft max-w-xl">
      <h2 class="text-lg font-display font-bold text-primary border-b border-slate-50 pb-3 mb-6">
        Información Personal
      </h2>

      <!-- Profile Success Alert -->
      <Transition
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="transform -translate-y-2 opacity-0"
        enter-to-class="transform translate-y-0 opacity-100"
      >
        <div v-if="showProfileSuccess" class="p-3 bg-success/5 text-success border border-success/15 rounded-md text-xs font-semibold mb-6 flex items-center gap-2">
          <CheckCircle class="w-4 h-4" />
          <span>¡Perfil guardado y actualizado con éxito!</span>
        </div>
      </Transition>

      <form @submit.prevent="handleUpdateProfile" class="space-y-4">
        <BaseInput 
          id="profile-name"
          v-model="name"
          label="Nombre completo"
          required
        />
        
        <BaseInput 
          id="profile-email"
          v-model="email"
          type="email"
          label="Correo electrónico"
          disabled
        />

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <BaseInput 
            id="profile-phone"
            v-model="phone"
            label="Teléfono"
          />
          <BaseInput 
            id="profile-address"
            v-model="address"
            label="Dirección de envío principal"
          />
        </div>

        <div class="pt-4 border-t border-slate-50 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <BaseButton 
            type="submit" 
            variant="secondary" 
            class="w-full sm:w-auto cursor-pointer"
          >
            Guardar cambios
          </BaseButton>

          <!-- Mobile friendly logout button -->
          <button 
            type="button"
            @click="() => { authStore.logout(); router.push('/') }"
            class="w-full sm:w-auto flex items-center justify-center gap-2 py-3 px-6 rounded-lg text-danger font-bold bg-danger/5 border border-danger/10 hover:bg-danger/10 transition-colors cursor-pointer"
          >
            <LogOut class="w-4 h-4" />
            Cerrar Sesión
          </button>
        </div>
      </form>
    </div>

  </div>
</template>
