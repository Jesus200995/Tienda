import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { MotionPlugin } from '@vueuse/motion'
import router from './router'
import './style.css'
import App from './App.vue'

// Import Google Fonts dynamically for premium styling
const playfairLink = document.createElement('link')
playfairLink.rel = 'stylesheet'
playfairLink.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Inter:wght@100..900&display=swap'
document.head.appendChild(playfairLink)

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(MotionPlugin)

app.mount('#app')
