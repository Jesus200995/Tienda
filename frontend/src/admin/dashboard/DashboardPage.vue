<script setup lang="ts">
import { computed } from 'vue'
import { useProductStore } from '../../stores/products'
import { DollarSign, ShoppingBag, ClipboardList, CheckCircle } from 'lucide-vue-next'

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
    pending: 'bg-warning/10 text-warning border border-warning/20',
    paid: 'bg-success/10 text-success border border-success/20',
    preparing: 'bg-accent/10 text-accent border border-accent/20',
    shipped: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20',
    delivered: 'bg-slate-500/10 text-slate-400 border border-slate-500/20',
    cancelled: 'bg-danger/10 text-danger border border-danger/20'
  }
  return classes[status as keyof typeof classes] || 'bg-slate-800 text-slate-400'
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
      <h1 class="text-2xl sm:text-3xl font-display font-black text-white">
        Dashboard General
      </h1>
      <p class="text-xs text-slate-400 mt-1 font-semibold">
        Monitorea el rendimiento de El Comerciambre en tiempo real.
      </p>
    </div>

    <!-- Cards Stats Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      
      <!-- Sales stat card -->
      <div class="bg-[#121324] border border-slate-800 rounded-xl p-6 flex items-center justify-between shadow-soft">
        <div class="space-y-1">
          <span class="block text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Ventas totales</span>
          <span class="block text-2xl font-black text-white">${{ totalSales.toLocaleString() }}</span>
        </div>
        <div class="p-3 bg-success/15 rounded-lg text-success">
          <DollarSign class="w-6 h-6" />
        </div>
      </div>

      <!-- Orders count card -->
      <div class="bg-[#121324] border border-slate-800 rounded-xl p-6 flex items-center justify-between shadow-soft">
        <div class="space-y-1">
          <span class="block text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Pedidos totales</span>
          <span class="block text-2xl font-black text-white">{{ totalOrdersCount }}</span>
        </div>
        <div class="p-3 bg-secondary/15 rounded-lg text-secondary">
          <ClipboardList class="w-6 h-6" />
        </div>
      </div>

      <!-- Pending orders count card -->
      <div class="bg-[#121324] border border-slate-800 rounded-xl p-6 flex items-center justify-between shadow-soft">
        <div class="space-y-1">
          <span class="block text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Pedidos pendientes</span>
          <span class="block text-2xl font-black text-white">{{ pendingOrders }}</span>
        </div>
        <div class="p-3 bg-warning/15 rounded-lg text-warning">
          <ShoppingBag class="w-6 h-6" />
        </div>
      </div>

      <!-- Active products card -->
      <div class="bg-[#121324] border border-slate-800 rounded-xl p-6 flex items-center justify-between shadow-soft">
        <div class="space-y-1">
          <span class="block text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Prendas Activas</span>
          <span class="block text-2xl font-black text-white">{{ activeProductsCount }}</span>
        </div>
        <div class="p-3 bg-indigo-500/15 rounded-lg text-indigo-400">
          <CheckCircle class="w-6 h-6" />
        </div>
      </div>

    </div>

    <!-- Recent Orders list -->
    <div class="bg-[#121324] border border-slate-800 rounded-xl p-6 shadow-soft space-y-4">
      <h3 class="text-sm font-bold uppercase tracking-wider text-white">
        Últimos Pedidos Realizados
      </h3>
      
      <div v-if="recentOrders.length === 0" class="py-8 text-center text-slate-400 text-xs font-semibold">
        No se han registrado compras recientemente.
      </div>
      
      <div v-else class="overflow-x-auto">
        <table class="w-full text-xs font-semibold text-slate-300">
          <thead>
            <tr class="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[9px]">
              <th class="py-3 text-left">Pedido</th>
              <th class="py-3 text-left">Cliente</th>
              <th class="py-3 text-left">Fecha</th>
              <th class="py-3 text-left">Total</th>
              <th class="py-3 text-left">Estado</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800/40">
            <tr v-for="order in recentOrders" :key="order.id">
              <td class="py-3.5 font-bold text-white">{{ order.order_number }}</td>
              <td class="py-3.5">{{ order.shipping_address.name }}</td>
              <td class="py-3.5">{{ new Date(order.created_at).toLocaleDateString() }}</td>
              <td class="py-3.5 font-bold text-white">${{ order.total.toLocaleString() }}</td>
              <td class="py-3.5">
                <span :class="['px-2 py-0.5 rounded-md text-[9px] uppercase tracking-wide font-extrabold', getStatusBadgeClass(order.status)]">
                  {{ getStatusTranslation(order.status) }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

  </div>
</template>
