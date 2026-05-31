import { defineStore } from 'pinia'
import type { CartItem, Product, ProductVariant } from '../types'
import { useSettingsStore } from './settings'

interface CartState {
  items: CartItem[];
}

export const useCartStore = defineStore('cart', {
  state: (): CartState => {
    const items = JSON.parse(localStorage.getItem('cart_items') || '[]') as CartItem[]
    const normalizedItems = items.map(item => ({
      ...item,
      selected: item.selected !== undefined ? item.selected : true
    }))
    return {
      items: normalizedItems
    }
  },
  getters: {
    itemCount: (state) => {
      return state.items.reduce((sum, item) => sum + item.quantity, 0)
    },
    cartSubtotal: (state) => {
      return state.items.reduce((sum, item) => {
        const adjustment = item.variant?.price_adjustment || 0
        const price = item.product.price + adjustment
        return sum + (price * item.quantity)
      }, 0)
    },
    shippingCost(): number {
      const settingsStore = useSettingsStore()
      const minFree = settingsStore.settings.free_shipping_min || 2000
      const cost = settingsStore.settings.shipping_cost || 150
      
      if (this.cartSubtotal >= minFree || this.cartSubtotal === 0) {
        return 0
      }
      return cost
    },
    cartTotal(): number {
      return this.cartSubtotal + this.shippingCost
    },
    isEmpty: (state) => state.items.length === 0,

    // Mercado Libre Selection Getters
    selectedItems: (state) => {
      return state.items.filter(item => item.selected)
    },
    selectedCount(): number {
      return this.selectedItems.reduce((sum, item) => sum + item.quantity, 0)
    },
    selectedSubtotal(): number {
      return this.selectedItems.reduce((sum, item) => {
        const adjustment = item.variant?.price_adjustment || 0
        const price = item.product.price + adjustment
        return sum + (price * item.quantity)
      }, 0)
    },
    selectedShippingCost(): number {
      const settingsStore = useSettingsStore()
      const minFree = settingsStore.settings.free_shipping_min || 2000
      const cost = settingsStore.settings.shipping_cost || 150
      
      if (this.selectedSubtotal >= minFree || this.selectedSubtotal === 0) {
        return 0
      }
      return cost
    },
    selectedTotal(): number {
      return this.selectedSubtotal + this.selectedShippingCost
    },
    allSelected: (state) => {
      if (state.items.length === 0) return false
      return state.items.every(item => item.selected)
    }
  },
  actions: {
    addItem(product: Product, quantity = 1, variant?: ProductVariant) {
      const existingItem = this.items.find(item => {
        const sameProduct = item.product.id === product.id
        const sameVariant = (!variant && !item.variant) || 
                            (variant && item.variant && item.variant.id === variant.id)
        return sameProduct && sameVariant
      })

      const availableStock = variant ? variant.stock : product.stock

      if (existingItem) {
        const newQty = existingItem.quantity + quantity
        existingItem.quantity = Math.min(newQty, availableStock)
        existingItem.selected = true // Select automatically on re-add
      } else {
        this.items.push({
          product,
          variant,
          quantity: Math.min(quantity, availableStock),
          selected: true
        })
      }
      
      this.saveToLocalStorage()
    },
    
    updateQuantity(productId: number, quantity: number, variantId?: number) {
      const item = this.items.find(item => {
        const sameProduct = item.product.id === productId
        const sameVariant = (!variantId && !item.variant) || 
                            (item.variant && item.variant.id === variantId)
        return sameProduct && sameVariant
      })

      if (item) {
        const availableStock = item.variant ? item.variant.stock : item.product.stock
        item.quantity = Math.max(1, Math.min(quantity, availableStock))
        this.saveToLocalStorage()
      }
    },
    
    removeItem(productId: number, variantId?: number) {
      this.items = this.items.filter(item => {
        const sameProduct = item.product.id === productId
        const sameVariant = (!variantId && !item.variant) || 
                            (item.variant && item.variant.id === variantId)
        return !(sameProduct && sameVariant)
      })
      
      this.saveToLocalStorage()
    },

    // Mercado Libre Selection Actions
    toggleItemSelection(productId: number, variantId?: number) {
      const item = this.items.find(item => {
        const sameProduct = item.product.id === productId
        const sameVariant = (!variantId && !item.variant) || 
                            (item.variant && item.variant.id === variantId)
        return sameProduct && sameVariant
      })

      if (item) {
        item.selected = !item.selected
        this.saveToLocalStorage()
      }
    },

    selectAll() {
      this.items.forEach(item => {
        item.selected = true
      })
      this.saveToLocalStorage()
    },

    deselectAll() {
      this.items.forEach(item => {
        item.selected = false
      })
      this.saveToLocalStorage()
    },

    toggleSelectAll() {
      const target = !this.allSelected
      this.items.forEach(item => {
        item.selected = target
      })
      this.saveToLocalStorage()
    },

    removeSelected() {
      this.items = this.items.filter(item => !item.selected)
      this.saveToLocalStorage()
    },
    
    clearCart() {
      this.items = []
      this.saveToLocalStorage()
    },
    
    saveToLocalStorage() {
      localStorage.setItem('cart_items', JSON.stringify(this.items))
    }
  }
})

