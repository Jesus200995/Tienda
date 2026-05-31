<script setup lang="ts">
import { ref } from 'vue'
import BaseInput from '../../components/ui/BaseInput.vue'
import BaseButton from '../../components/ui/BaseButton.vue'
import BaseModal from '../../components/ui/BaseModal.vue'
import { Eye, Truck } from 'lucide-vue-next'

// State
const orders = ref<any[]>(JSON.parse(localStorage.getItem('comerciambre_orders') || '[]'))
const isDetailModalOpen = ref(false)
const selectedOrder = ref<any>(null)

// Tracking fields
const trackingNumber = ref('')
const selectedStatus = ref('')

const saveOrdersToLocalStorage = () => {
  localStorage.setItem('comerciambre_orders', JSON.stringify(orders.value))
}

const openDetailModal = (order: any) => {
  selectedOrder.value = order
  trackingNumber.value = order.tracking_number || ''
  selectedStatus.value = order.status
  isDetailModalOpen.value = true
}

const handleUpdateOrder = () => {
  if (!selectedOrder.value) return
  
  const idx = orders.value.findIndex(o => o.id === selectedOrder.value.id)
  if (idx !== -1) {
    orders.value[idx].status = selectedStatus.value
    orders.value[idx].tracking_number = trackingNumber.value
    saveOrdersToLocalStorage()
    
    // Update local modal state
    selectedOrder.value = { ...orders.value[idx] }
  }
  isDetailModalOpen.value = false
}

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
  <div class="space-y-8 text-left text-slate-100">
    
    <!-- Title -->
    <div>
      <h1 class="text-2xl sm:text-3xl font-display font-black text-white">
        Pedidos de Clientes
      </h1>
      <p class="text-xs text-slate-400 mt-1 font-semibold">
        Gestiona los flujos de preparación, envío, entrega y números de guías de rastreo.
      </p>
    </div>

    <!-- Table of Orders -->
    <div class="bg-[#121324] border border-slate-800 rounded-xl overflow-hidden shadow-soft p-6">
      <div v-if="orders.length === 0" class="py-12 text-center text-slate-400 text-xs font-semibold">
        No se han registrado compras en el sistema.
      </div>
      
      <div v-else class="overflow-x-auto">
        <table class="w-full text-xs font-semibold text-slate-350">
          <thead>
            <tr class="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[9px]">
              <th class="py-3 text-left">Pedido</th>
              <th class="py-3 text-left">Cliente</th>
              <th class="py-3 text-left">Fecha</th>
              <th class="py-3 text-left">Total</th>
              <th class="py-3 text-left">Estado</th>
              <th class="py-3 text-left">Guía</th>
              <th class="py-3 text-center">Detalles</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800/40">
            <tr v-for="order in orders" :key="order.id">
              <td class="py-4 font-bold text-white">{{ order.order_number }}</td>
              <td class="py-4">{{ order.shipping_address.name }}</td>
              <td class="py-4 text-slate-400">{{ new Date(order.created_at).toLocaleDateString() }}</td>
              <td class="py-4 font-bold text-white">${{ order.total.toLocaleString() }}</td>
              <td class="py-4">
                <span :class="['px-2 py-0.5 rounded-md text-[9px] uppercase tracking-wide font-extrabold', getStatusBadgeClass(order.status)]">
                  {{ getStatusTranslation(order.status) }}
                </span>
              </td>
              <td class="py-4">
                <span v-if="order.tracking_number" class="text-indigo-400 font-bold flex items-center gap-1">
                  <Truck class="w-3.5 h-3.5" />
                  {{ order.tracking_number }}
                </span>
                <span v-else class="text-slate-500 italic">No asignado</span>
              </td>
              <td class="py-4 text-center">
                <button 
                  @click="openDetailModal(order)"
                  class="p-1.5 rounded-full hover:bg-white/5 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  title="Detalles"
                >
                  <Eye class="w-4.5 h-4.5" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Order Detail & Modifier Modal -->
    <BaseModal 
      v-if="selectedOrder"
      :show="isDetailModalOpen" 
      @close="isDetailModalOpen = false"
      :title="`Gestionar Pedido: ${selectedOrder.order_number}`"
      size="lg"
      class="text-[#1a1a2e]"
    >
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 text-left text-sm text-[#1a1a2e]">
        
        <!-- Left: Order detail & items -->
        <div class="space-y-5">
          <div>
            <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Artículos comprados</h4>
            <div class="bg-slate-50 rounded-lg p-4 divide-y divide-slate-200/60 border border-slate-100">
              <div 
                v-for="item in selectedOrder.items" 
                :key="item.id"
                class="flex justify-between items-center py-2 first:pt-0 last:pb-0 text-xs font-semibold"
              >
                <span>{{ item.product_name }} <span class="text-slate-400 font-bold ml-1">x{{ item.quantity }}</span></span>
                <span class="font-bold text-primary">${{ item.total.toLocaleString() }}</span>
              </div>
            </div>
          </div>

          <div class="space-y-1">
            <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider">Dirección de Envío</h4>
            <div class="bg-slate-50 rounded-lg p-4 border border-slate-100 text-xs leading-relaxed space-y-1">
              <p class="font-bold text-primary">{{ selectedOrder.shipping_address.name }}</p>
              <p class="text-slate-500">Dirección: {{ selectedOrder.shipping_address.address }}, {{ selectedOrder.shipping_address.city }}</p>
              <p class="text-slate-500">Tel: {{ selectedOrder.shipping_address.phone }} | CP: {{ selectedOrder.shipping_address.zip }}</p>
              <p v-if="selectedOrder.shipping_address.notes" class="text-slate-400 mt-2 bg-white p-2 rounded border border-slate-100 italic">
                Notas: "{{ selectedOrder.shipping_address.notes }}"
              </p>
            </div>
          </div>
        </div>

        <!-- Right: Status Modifier and Guía number -->
        <div class="space-y-5 flex flex-col justify-between">
          <div class="space-y-4">
            <!-- Status Dropdown -->
            <div>
              <label class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Modificar Estado</label>
              <select 
                v-model="selectedStatus"
                class="w-full px-4 py-2.5 text-xs font-bold bg-white border border-slate-200 rounded-md outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-300"
              >
                <option value="pending">Pendiente</option>
                <option value="paid">Pagado (Aprobado)</option>
                <option value="preparing">Preparando pedido</option>
                <option value="shipped">Enviado (Paquetería)</option>
                <option value="delivered">Entregado</option>
                <option value="cancelled">Cancelar Pedido</option>
              </select>
            </div>

            <!-- Tracking number input -->
            <BaseInput 
              id="order-tracking"
              v-model="trackingNumber"
              label="Número de Guía (Rastreo)"
              placeholder="FEDEX-99887766"
            />
          </div>

          <div class="border-t border-slate-100 pt-4 flex gap-4 justify-end">
            <BaseButton variant="outline" class="cursor-pointer" @click.prevent="isDetailModalOpen = false">
              Cerrar
            </BaseButton>
            <BaseButton variant="secondary" class="cursor-pointer font-bold" @click="handleUpdateOrder">
              Guardar Cambios
            </BaseButton>
          </div>
        </div>

      </div>
    </BaseModal>

  </div>
</template>
