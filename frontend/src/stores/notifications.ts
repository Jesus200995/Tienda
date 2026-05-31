import { defineStore } from 'pinia'
import type { Notification } from '../types'

interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info' | 'cart'
  message: string
  duration?: number
  product?: {
    id: number
    name: string
    price: number
    image: string
    variantText?: string
  }
}

interface NotificationsState {
  toasts: Toast[]
  notifications: Notification[]
}

export const useNotificationsStore = defineStore('notifications', {
  state: (): NotificationsState => ({
    toasts: [],
    notifications: JSON.parse(localStorage.getItem('user_notifications') || '[]')
  }),

  getters: {
    unreadCount: (state) => state.notifications.filter(n => !n.read).length,
    sortedNotifications: (state) => {
      return [...state.notifications].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    }
  },

  actions: {
    // Toast Management
    showToast(
      message: string,
      type: 'success' | 'error' | 'warning' | 'info' = 'success',
      duration = 4000
    ) {
      const id = Math.random().toString(36).substring(2, 9)
      this.toasts.push({ id, type, message, duration })

      if (duration > 0) {
        setTimeout(() => {
          this.dismissToast(id)
        }, duration)
      }
    },

    showCartToast(product: any, variant: any, _quantity = 1) {
      const id = Math.random().toString(36).substring(2, 9)
      const variantText = variant ? `${variant.color} / Talla ${variant.size}` : undefined
      const image = product.images && product.images.length > 0 ? product.images[0].url : '/placeholder.png'

      this.toasts.push({
        id,
        type: 'cart',
        message: '¡Producto añadido al carrito!',
        duration: 5000,
        product: {
          id: product.id,
          name: product.name,
          price: product.price + (variant?.price_adjustment || 0),
          image,
          variantText
        }
      })
    },

    dismissToast(id: string) {
      this.toasts = this.toasts.filter(t => t.id !== id)
    },

    // Persistent Notifications Management (In-App notifications for order status changes, etc.)
    addNotification(notificationData: Omit<Notification, 'id' | 'read' | 'createdAt'>) {
      const newNotification: Notification = {
        ...notificationData,
        id: Math.random().toString(36).substring(2, 9),
        read: false,
        createdAt: new Date().toISOString()
      }

      this.notifications.push(newNotification)
      this.saveToLocalStorage()
    },

    markAsRead(id: string) {
      const notification = this.notifications.find(n => n.id === id)
      if (notification) {
        notification.read = true
        this.saveToLocalStorage()
      }
    },

    markAllAsRead() {
      this.notifications.forEach(n => {
        n.read = true
      })
      this.saveToLocalStorage()
    },

    removeNotification(id: string) {
      this.notifications = this.notifications.filter(n => n.id !== id)
      this.saveToLocalStorage()
    },

    clearAll() {
      this.notifications = []
      this.saveToLocalStorage()
    },

    saveToLocalStorage() {
      localStorage.setItem('user_notifications', JSON.stringify(this.notifications))
    }
  }
})
