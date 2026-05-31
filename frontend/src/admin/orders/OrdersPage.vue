<script setup lang="ts">
import { ref, computed } from 'vue'
import BaseModal from '../../components/ui/BaseModal.vue'
import OrderTimeline from '../../components/shared/OrderTimeline.vue'
import OrderStatusChanger from './OrderStatusChanger.vue'
import { useNotificationsStore } from '../../stores/notifications'
import { Eye, Truck, Search, Filter } from 'lucide-vue-next'
import type { OrderStatus } from '../../types'

const notificationsStore = useNotificationsStore()

// State
const orders = ref<any[]>(JSON.parse(localStorage.getItem('comerciambre_orders') || '[]'))
const isDetailModalOpen = ref(false)
const selectedOrder = ref<any>(null)

// Filtering and Searching
const searchQuery = ref('')
const filterStatus = ref<string>('all')

const saveOrdersToLocalStorage = () => {
  localStorage.setItem('comerciambre_orders', JSON.stringify(orders.value))
}

const openDetailModal = (order: any) => {
  selectedOrder.value = order
  isDetailModalOpen.value = true
}

const getStatusDefaultNote = (status: OrderStatus) => {
  const defaultNotes = {
    pending: 'Pedido registrado. Esperando confirmación de pago.',
    paid: '¡Tu pago de Mercado Pago fue aprobado!',
    preparing: 'Prendas seleccionadas y empaquetadas en bodega.',
    shipped: 'Paquete recolectado por DHL Express.',
    delivered: 'Pedido entregado en tu domicilio.',
    cancelled: 'El pedido fue cancelado y se inició el reembolso.'
  }
  return defaultNotes[status] || ''
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

const handleStatusUpdate = (data: { status: OrderStatus; trackingNumber: string; note: string; notifyCustomer: boolean }) => {
  if (!selectedOrder.value) return
  
  const idx = orders.value.findIndex(o => o.id === selectedOrder.value.id)
  if (idx !== -1) {
    const orderToUpdate = orders.value[idx]
    const oldStatus = orderToUpdate.status
    
    // Update order fields
    orderToUpdate.status = data.status
    orderToUpdate.tracking_number = data.trackingNumber
    
    // Add to history timeline
    const statusHistory = orderToUpdate.status_history || []
    
    // Check if this status is already in history to avoid redundant steps (except cancelled)
    const isRedundant = statusHistory.some((h: any) => h.status === data.status) && data.status !== 'cancelled'
    
    if (!isRedundant || data.note) {
      statusHistory.push({
        status: data.status,
        timestamp: new Date().toISOString(),
        note: data.note || getStatusDefaultNote(data.status),
        updatedBy: 'Admin'
      })
      orderToUpdate.status_history = statusHistory
    }

    saveOrdersToLocalStorage()
    
    // Dispatch in-app notification if checked
    if (data.notifyCustomer && oldStatus !== data.status) {
      notificationsStore.addNotification({
        type: data.status === 'shipped' ? 'shipping' : data.status === 'paid' ? 'payment' : 'order_status',
        title: `Tu pedido #${orderToUpdate.order_number} se actualizó`,
        message: `El pedido cambió a: ${getStatusTranslation(data.status)}. ${data.note || getStatusDefaultNote(data.status)}`,
        orderId: orderToUpdate.id
      })
    }

    // Success feedbacks
    notificationsStore.showToast(`Pedido #${orderToUpdate.order_number} actualizado con éxito.`, 'success')
    
    // Update local modal state
    selectedOrder.value = { ...orderToUpdate }
    isDetailModalOpen.value = false
  }
}

const getStatusBadgeClass = (status: string) => {
  const classes = {
    pending: 'bg-amber-50 text-amber-700 border border-amber-200',
    paid: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    preparing: 'bg-sky-50 text-sky-700 border border-sky-200',
    shipped: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
    delivered: 'bg-slate-50 text-slate-700 border border-slate-200',
    cancelled: 'bg-rose-50 text-rose-700 border border-rose-200'
  }
  return classes[status as keyof typeof classes] || 'bg-slate-50 text-slate-650 border border-slate-200'
}

// Advanced reactive filters & search
const filteredOrders = computed(() => {
  return orders.value.filter(order => {
    const matchesSearch = 
      order.order_number.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      order.shipping_address.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    
    const matchesStatus = 
      filterStatus.value === 'all' || 
      order.status === filterStatus.value

    return matchesSearch && matchesStatus
  })
})
</script>

<template>
  <div class="space-y-8 text-left text-slate-800">
    
    <!-- Title -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
      <div>
        <h1 class="text-2xl sm:text-3xl font-display font-black text-slate-800">
          Pedidos de Clientes
        </h1>
        <p class="text-xs text-slate-500 mt-1 font-semibold">
          Gestiona los flujos de preparación, envío, entrega y números de guías de rastreo.
        </p>
      </div>

      <!-- Live Search & Filtering Panel -->
      <div class="flex flex-wrap gap-3 w-full sm:w-auto">
        <div class="relative flex-grow sm:flex-grow-0 min-w-[200px]">
          <Search class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="Buscar por # o cliente..."
            class="w-full bg-white border border-slate-300 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-700 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors shadow-sm"
          />
        </div>

        <div class="relative">
          <Filter class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <select 
            v-model="filterStatus"
            class="bg-white border border-slate-300 rounded-lg pl-9 pr-8 py-1.5 text-xs text-slate-750 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors cursor-pointer appearance-none shadow-sm"
          >
            <option value="all">Todos los estados</option>
            <option value="pending">Pendiente de Pago</option>
            <option value="paid">Pagados</option>
            <option value="preparing">Preparando envío</option>
            <option value="shipped">En camino</option>
            <option value="delivered">Entregados</option>
            <option value="cancelled">Cancelados</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Table of Orders -->
    <div class="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm p-4 sm:p-6">
      <div v-if="filteredOrders.length === 0" class="py-12 text-center text-slate-400 text-xs font-semibold">
        No se han encontrado compras con los criterios seleccionados.
      </div>
      
      <div v-else>
        <!-- Desktop Table -->
        <div class="hidden md:block overflow-x-auto">
          <table class="w-full min-w-[750px] text-xs font-semibold text-slate-600">
          <thead>
            <tr class="border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[9px]">
              <th class="py-3 text-left">Pedido</th>
              <th class="py-3 text-left">Cliente</th>
              <th class="py-3 text-left">Fecha</th>
              <th class="py-3 text-left">Total</th>
              <th class="py-3 text-left">Estado</th>
              <th class="py-3 text-left">Guía</th>
              <th class="py-3 text-center">Acción</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="order in filteredOrders" :key="order.id">
              <td class="py-4 font-bold text-slate-800">{{ order.order_number }}</td>
              <td class="py-4 text-slate-650">{{ order.shipping_address.name }}</td>
              <td class="py-4 text-slate-500">{{ new Date(order.created_at).toLocaleDateString() }}</td>
              <td class="py-4 font-bold text-slate-800">${{ order.total.toLocaleString() }}</td>
              <td class="py-4">
                <span :class="['px-2 py-0.5 rounded-md text-[9px] uppercase tracking-wide font-extrabold', getStatusBadgeClass(order.status)]">
                  {{ getStatusTranslation(order.status) }}
                </span>
              </td>
              <td class="py-4">
                <span v-if="order.tracking_number" class="text-indigo-600 font-bold flex items-center gap-1">
                  <Truck class="w-3.5 h-3.5" />
                  {{ order.tracking_number }}
                </span>
                <span v-else class="text-slate-400 italic text-[10px]">Sin asignar</span>
              </td>
              <td class="py-4 text-center">
                <button 
                  @click="openDetailModal(order)"
                  class="p-1.5 rounded-full hover:bg-slate-50 text-slate-550 hover:text-indigo-650 transition-colors cursor-pointer"
                  title="Gestionar e Historial"
                >
                  <Eye class="w-4.5 h-4.5" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        </div>

        <!-- Mobile Stacked Cards -->
        <div class="md:hidden space-y-4 mt-2">
          <div 
            v-for="order in filteredOrders" 
            :key="`mobile-${order.id}`"
            class="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col gap-3"
          >
            <div class="flex justify-between items-start">
              <div>
                <p class="font-black text-slate-800 text-sm">{{ order.order_number }}</p>
                <p class="text-xs text-slate-500">{{ new Date(order.created_at).toLocaleDateString() }}</p>
              </div>
              <span :class="['px-2.5 py-1 rounded-lg text-[10px] uppercase tracking-wide font-black', getStatusBadgeClass(order.status)]">
                {{ getStatusTranslation(order.status) }}
              </span>
            </div>
            
            <div class="bg-slate-50 rounded-xl p-3 border border-slate-100 flex flex-col gap-1.5 text-xs">
              <p><span class="font-bold text-slate-500">Cliente:</span> {{ order.shipping_address.name }}</p>
              <p><span class="font-bold text-slate-500">Total:</span> <span class="font-black text-slate-800">${{ order.total.toLocaleString() }}</span></p>
              <p class="flex items-center gap-1.5">
                <span class="font-bold text-slate-500">Guía:</span> 
                <span v-if="order.tracking_number" class="text-indigo-600 font-bold flex items-center gap-1">
                  <Truck class="w-3.5 h-3.5" /> {{ order.tracking_number }}
                </span>
                <span v-else class="text-slate-400 italic text-[10px]">Sin asignar</span>
              </p>
            </div>

            <button 
              @click="openDetailModal(order)"
              class="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2"
            >
              <Eye class="w-4 h-4" />
              Gestionar Pedido
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Order Detail & Modifier Modal -->
    <BaseModal 
      v-if="selectedOrder"
      :show="isDetailModalOpen" 
      @close="isDetailModalOpen = false"
      :title="`Gestionar Pedido: ${selectedOrder.order_number}`"
      size="lg"
      class="text-slate-800"
    >
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 text-left text-sm text-slate-800">
        
        <!-- Left: Order detail & items -->
        <div class="space-y-6">
          <!-- Items List -->
          <div>
            <h4 class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">Artículos comprados</h4>
            <div class="bg-slate-50 rounded-xl p-4.5 divide-y divide-slate-250 border border-slate-200">
              <div 
                v-for="item in selectedOrder.items" 
                :key="item.id"
                class="flex justify-between items-center py-2.5 first:pt-0 last:pb-0 text-xs font-semibold"
              >
                <span class="text-slate-700 leading-tight">
                  {{ item.product_name }} 
                  <span class="text-slate-400 font-bold ml-1">x{{ item.quantity }}</span>
                </span>
                <span class="font-bold text-indigo-600">${{ item.total.toLocaleString() }}</span>
              </div>
            </div>
          </div>

          <!-- Shipping Details -->
          <div class="space-y-2">
            <h4 class="text-xs font-bold text-slate-500 uppercase tracking-wider">Dirección de Envío</h4>
            <div class="bg-slate-50 rounded-xl p-4.5 border border-slate-200 text-xs leading-normal space-y-1">
              <p class="font-black text-slate-800">{{ selectedOrder.shipping_address.name }}</p>
              <p class="text-slate-500">Dirección: {{ selectedOrder.shipping_address.address }}, {{ selectedOrder.shipping_address.city }}</p>
              <p class="text-slate-500">Tel: {{ selectedOrder.shipping_address.phone }} | CP: {{ selectedOrder.shipping_address.zip }}</p>
              <p v-if="selectedOrder.shipping_address.notes" class="text-slate-400 mt-2 bg-white p-2.5 rounded-lg border border-slate-200 italic">
                Notas: "{{ selectedOrder.shipping_address.notes }}"
              </p>
            </div>
          </div>

          <!-- Interactive Order Timeline Preview -->
          <div class="pt-2">
            <OrderTimeline 
              :status="selectedOrder.status" 
              :status-history="selectedOrder.status_history"
              :tracking-number="selectedOrder.tracking_number"
            />
          </div>
        </div>

        <!-- Right: Status Modifier and Guía number -->
        <div>
          <OrderStatusChanger 
            :current-status="selectedOrder.status"
            :current-tracking-number="selectedOrder.tracking_number"
            @update="handleStatusUpdate"
          />
        </div>

      </div>
    </BaseModal>

  </div>
</template>
