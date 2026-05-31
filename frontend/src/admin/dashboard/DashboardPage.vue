<script setup lang="ts">
import { computed } from 'vue'
import { useProductStore } from '../../stores/products'
import { DollarSign, ShoppingCart, ClipboardList, CheckCircle } from 'lucide-vue-next'

const productStore = useProductStore()

// Orders
const allOrders = computed(() => {
  return JSON.parse(localStorage.getItem('comerciambre_orders') || '[]')
})

const recentOrders = computed(() => {
  return allOrders.value.slice(0, 5)
})

// Metrics
const totalSales = computed(() => {
  return allOrders.value
    .filter((o: any) => o.status === 'paid' || o.status === 'preparing' || o.status === 'shipped' || o.status === 'delivered')
    .reduce((sum: number, o: any) => sum + o.total, 0)
})

const pendingOrders = computed(() => {
  return allOrders.value.filter((o: any) => o.status === 'paid' || o.status === 'preparing').length
})

const activeProductsCount = computed(() => {
  return productStore.products.filter(p => p.active).length
})

const totalOrdersCount = computed(() => allOrders.value.length)

const getStatusBadgeClass = (status: string) => {
  const classes = {
    pending: 'bg-amber-50 text-amber-700 border border-amber-200',
    paid: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    preparing: 'bg-sky-50 text-sky-700 border border-sky-200',
    shipped: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
    delivered: 'bg-slate-50 text-slate-700 border border-slate-200',
    cancelled: 'bg-rose-50 text-rose-700 border border-rose-200'
  }
  return classes[status as keyof typeof classes] || 'bg-slate-50 text-slate-600 border border-slate-200'
}

const getStatusTranslation = (status: string) => {
  const statusTranslations = {
    pending: 'Pendiente',
    paid: 'Pagado',
    preparing: 'Preparando',
    shipped: 'Enviado',
    delivered: 'Entregado',
    cancelled: 'Cancelado'
  }
  return statusTranslations[status as keyof typeof statusTranslations] || status
}
</script>

<template>
  <div class="space-y-8 text-left">
    
    <!-- Title -->
    <div>
      <h1 class="text-2xl sm:text-3xl font-display font-black text-slate-800">
        Dashboard General
      </h1>
      <p class="text-xs text-slate-500 mt-1 font-semibold">
        Monitorea el rendimiento de El Comerciambre en tiempo real.
      </p>
    </div>

    <!-- Cards Stats Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      
      <!-- Sales stat card -->
      <div class="bg-white border border-slate-200 rounded-xl p-6 flex items-center justify-between shadow-sm">
        <div class="space-y-1">
          <span class="block text-[10px] font-extrabold uppercase tracking-widest text-slate-500">Ventas totales</span>
          <span class="block text-2xl font-black text-slate-800">${{ totalSales.toLocaleString() }}</span>
        </div>
        <div class="p-3 bg-emerald-50 rounded-lg text-emerald-600 border border-emerald-100">
          <DollarSign class="w-6 h-6" />
        </div>
      </div>

      <!-- Orders count card -->
      <div class="bg-white border border-slate-200 rounded-xl p-6 flex items-center justify-between shadow-sm">
        <div class="space-y-1">
          <span class="block text-[10px] font-extrabold uppercase tracking-widest text-slate-500">Pedidos totales</span>
          <span class="block text-2xl font-black text-slate-800">{{ totalOrdersCount }}</span>
        </div>
        <div class="p-3 bg-indigo-50 rounded-lg text-indigo-600 border border-indigo-100">
          <ClipboardList class="w-6 h-6" />
        </div>
      </div>

      <!-- Pending orders count card -->
      <div class="bg-white border border-slate-200 rounded-xl p-6 flex items-center justify-between shadow-sm">
        <div class="space-y-1">
          <span class="block text-[10px] font-extrabold uppercase tracking-widest text-slate-500">Pedidos pendientes</span>
          <span class="block text-2xl font-black text-slate-800">{{ pendingOrders }}</span>
        </div>
        <div class="p-3 bg-amber-50 rounded-lg text-amber-600 border border-amber-100">
          <ShoppingCart class="w-6 h-6" />
        </div>
      </div>

      <!-- Active products card -->
      <div class="bg-white border border-slate-200 rounded-xl p-6 flex items-center justify-between shadow-sm">
        <div class="space-y-1">
          <span class="block text-[10px] font-extrabold uppercase tracking-widest text-slate-500">Prendas Activas</span>
          <span class="block text-2xl font-black text-slate-800">{{ activeProductsCount }}</span>
        </div>
        <div class="p-3 bg-sky-50 rounded-lg text-sky-600 border border-sky-100">
          <CheckCircle class="w-6 h-6" />
        </div>
      </div>

    </div>

    <!-- Recent Orders list -->
    <div class="bg-white border border-slate-200 rounded-xl p-4 sm:p-6 shadow-sm space-y-4">
      <h3 class="text-sm font-bold uppercase tracking-wider text-slate-800">
        Últimos Pedidos Realizados
      </h3>
      
      <div v-if="recentOrders.length === 0" class="py-8 text-center text-slate-450 text-xs font-semibold">
        No se han registrado compras recientemente.
      </div>
      
      <div v-else>
        <!-- Desktop Table -->
        <div class="hidden md:block overflow-x-auto">
          <table class="w-full min-w-[550px] text-xs font-semibold text-slate-600">
          <thead>
            <tr class="border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[9px]">
              <th class="py-3 text-left">Pedido</th>
              <th class="py-3 text-left">Cliente</th>
              <th class="py-3 text-left">Fecha</th>
              <th class="py-3 text-left">Total</th>
              <th class="py-3 text-left">Estado</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="order in recentOrders" :key="order.id">
              <td class="py-3.5 font-bold text-slate-800">{{ order.order_number }}</td>
              <td class="py-3.5">{{ order.shipping_address.name }}</td>
              <td class="py-3.5">{{ new Date(order.created_at).toLocaleDateString() }}</td>
              <td class="py-3.5 font-bold text-slate-800">${{ order.total.toLocaleString() }}</td>
              <td class="py-3.5">
                <span :class="['px-2 py-0.5 rounded-md text-[9px] uppercase tracking-wide font-extrabold', getStatusBadgeClass(order.status)]">
                  {{ getStatusTranslation(order.status) }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
        </div>

        <!-- Mobile Stacked Cards -->
        <div class="md:hidden space-y-3 mt-2">
          <div 
            v-for="order in recentOrders" 
            :key="`mobile-${order.id}`"
            class="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col gap-2 shadow-sm"
          >
            <div class="flex justify-between items-start">
              <div>
                <p class="font-black text-slate-800 text-sm">{{ order.order_number }}</p>
                <p class="text-[10px] text-slate-500">{{ order.shipping_address.name }} &bull; {{ new Date(order.created_at).toLocaleDateString() }}</p>
              </div>
              <span :class="['px-2 py-0.5 rounded-md text-[9px] uppercase tracking-wide font-extrabold', getStatusBadgeClass(order.status)]">
                {{ getStatusTranslation(order.status) }}
              </span>
            </div>
            <div class="flex justify-between items-center border-t border-slate-100 pt-2 mt-1">
              <span class="text-xs text-slate-500 font-bold">Total Pagado:</span>
              <span class="font-black text-slate-800">${{ order.total.toLocaleString() }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

