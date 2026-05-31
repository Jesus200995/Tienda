import { defineStore } from 'pinia'
import type { User } from '../types'

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: JSON.parse(localStorage.getItem('auth_user') || 'null'),
    token: localStorage.getItem('auth_token') || null,
    loading: false,
    error: null
  }),
  getters: {
    isAuthenticated: (state) => !!state.token,
    isAdmin: (state) => state.user?.role === 'admin',
    isCustomer: (state) => state.user?.role === 'customer'
  },
  actions: {
    async login(email: string, password: string): Promise<boolean> {
      this.loading = true
      this.error = null
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // Mock validation
      if (email === 'admin@elcomerciambre.com' && password === 'admin') {
        const adminUser: User = {
          id: 1,
          name: 'Administrador Principal',
          email: 'admin@elcomerciambre.com',
          role: 'admin',
          phone: '+52 55 9988 7766'
        }
        this.setUserSession(adminUser, 'mock-jwt-admin-token')
        this.loading = false
        return true
      } else if (email === 'cliente@gmail.com' && password === 'password') {
        const customerUser: User = {
          id: 2,
          name: 'Jesús Ramírez',
          email: 'cliente@gmail.com',
          role: 'customer',
          phone: '+52 55 1234 5678',
          address: 'Av. Reforma 123, Ciudad de México'
        }
        this.setUserSession(customerUser, 'mock-jwt-customer-token')
        this.loading = false
        return true
      } else {
        this.error = 'Credenciales incorrectas. Intenta con admin@elcomerciambre.com (admin) o cliente@gmail.com (password)'
        this.loading = false
        return false
      }
    },
    
    async register(name: string, email: string, _password: string): Promise<boolean> {
      this.loading = true
      this.error = null
      await new Promise(resolve => setTimeout(resolve, 800))
      
      if (email.includes('@')) {
        const newUser: User = {
          id: Math.floor(Math.random() * 1000) + 10,
          name,
          email,
          role: 'customer'
        }
        this.setUserSession(newUser, `mock-jwt-token-${newUser.id}`)
        this.loading = false
        return true
      } else {
        this.error = 'Formato de correo electrónico inválido.'
        this.loading = false
        return false
      }
    },
    
    logout() {
      this.user = null
      this.token = null
      localStorage.removeItem('auth_user')
      localStorage.removeItem('auth_token')
    },
    
    updateProfile(updatedFields: Partial<User>) {
      if (this.user) {
        this.user = { ...this.user, ...updatedFields }
        localStorage.setItem('auth_user', JSON.stringify(this.user))
      }
    },
    
    setUserSession(user: User, token: string) {
      this.user = user
      this.token = token
      localStorage.setItem('auth_user', JSON.stringify(user))
      localStorage.setItem('auth_token', token)
    }
  }
})
