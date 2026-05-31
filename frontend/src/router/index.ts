import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '../stores/auth'

// Lazy loaded page components
const HomePage = () => import('../features/home/HomePage.vue')
const CatalogPage = () => import('../features/catalog/CatalogPage.vue')
const ProductPage = () => import('../features/product/ProductPage.vue')
const CartPage = () => import('../features/cart/CartPage.vue')
const AuthPage = () => import('../features/auth/AuthPage.vue')
const CheckoutPage = () => import('../features/checkout/CheckoutPage.vue')
const AccountPage = () => import('../features/account/AccountPage.vue')
const FlashSalesPage = () => import('../features/offers/FlashSalesPage.vue')

// Admin components
const AdminLayout = () => import('../layouts/AdminLayout.vue')
const DashboardPage = () => import('../admin/dashboard/DashboardPage.vue')
const ProductsPage = () => import('../admin/products/ProductsPage.vue')
const CategoriesPage = () => import('../admin/categories/CategoriesPage.vue')
const OrdersPage = () => import('../admin/orders/OrdersPage.vue')
const SettingsPage = () => import('../admin/settings/SettingsPage.vue')
const OffersPage = () => import('../admin/offers/OffersPage.vue')

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('../layouts/DefaultLayout.vue'),
    children: [
      {
        path: '',
        name: 'home',
        component: HomePage
      },
      {
        path: 'catalog',
        name: 'catalog',
        component: CatalogPage
      },
      {
        path: 'product/:slug',
        name: 'product',
        component: ProductPage,
        props: true
      },
      {
        path: 'cart',
        name: 'cart',
        component: CartPage
      },
      {
        path: 'account',
        name: 'account',
        component: AccountPage,
        meta: { requiresAuth: true }
      },
      {
        path: 'account/orders/:id',
        name: 'order-detail',
        component: () => import('../features/account/OrderDetailPage.vue'),
        meta: { requiresAuth: true },
        props: true
      },
      {
        path: 'ofertas-relampago',
        name: 'flash-sales',
        component: FlashSalesPage
      }
    ]
  },
  {
    path: '/auth',
    name: 'auth',
    component: AuthPage,
    meta: { guestOnly: true }
  },
  {
    path: '/checkout',
    name: 'checkout',
    component: CheckoutPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/admin',
    component: AdminLayout,
    meta: { requiresAdmin: true },
    children: [
      {
        path: '',
        redirect: { name: 'admin-dashboard' }
      },
      {
        path: 'dashboard',
        name: 'admin-dashboard',
        component: DashboardPage
      },
      {
        path: 'products',
        name: 'admin-products',
        component: ProductsPage
      },
      {
        path: 'categories',
        name: 'admin-categories',
        component: CategoriesPage
      },
      {
        path: 'orders',
        name: 'admin-orders',
        component: OrdersPage
      },
      {
        path: 'settings',
        name: 'admin-settings',
        component: SettingsPage
      },
      {
        path: 'offers',
        name: 'admin-offers',
        component: OffersPage
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: { name: 'home' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    return { top: 0, behavior: 'smooth' }
  }
})

// Route Guards
router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore()
  
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin)
  const guestOnly = to.matched.some(record => record.meta.guestOnly)

  if (requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'auth', query: { redirect: to.fullPath } })
  } else if (requiresAdmin && !authStore.isAdmin) {
    next({ name: 'home' })
  } else if (guestOnly && authStore.isAuthenticated) {
    if (authStore.isAdmin) {
      next({ name: 'admin-dashboard' })
    } else {
      next({ name: 'account' })
    }
  } else {
    next()
  }
})

export default router
