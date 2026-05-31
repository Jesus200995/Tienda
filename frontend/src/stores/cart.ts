import { defineStore } from 'pinia'
import type { CartItem, Product, ProductVariant } from '../types'
import { useSettingsStore } from './settings'

interface CartState {
  items: CartItem[];
}

export const useCartStore = defineStore('cart', {
  state: (): CartState => ({
    items: JSON.parse(localStorage.getItem('cart_items') || '[]')
  }),
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
    isEmpty: (state) => state.items.length === 0
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
      } else {
        this.items.push({
          product,
          variant,
          quantity: Math.min(quantity, availableStock)
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
    
    clearCart() {
      this.items = []
      this.saveToLocalStorage()
    },
    
    saveToLocalStorage() {
      localStorage.setItem('cart_items', JSON.stringify(this.items))
    }
  }
})
