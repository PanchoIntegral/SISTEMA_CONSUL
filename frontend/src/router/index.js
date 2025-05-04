// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import AppointmentsView from '../views/AppointmentsView.vue'

const PatientsView = () => import('../views/PatientsView.vue')
const DashboardView = () => import('../views/DashboardView.vue')

// Importar el store de auth para la guarda de navegación
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { requiresGuest: true }
    },
    {
      // Ruta principal (Citas)
      path: '/',
      name: 'appointments',
      component: AppointmentsView,
      meta: { requiresAuth: true }
    },
    {
      
      path: '/patients',
      name: 'patients',
      component: PatientsView,
      meta: { requiresAuth: true } 
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView,
      meta: { requiresAuth: true }
    }
    
  ]
})

// Guardia de Navegación (Navigation Guard)
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore(); // Obtener store
  const isAuthenticated = authStore.isAuthenticated; // Usar getter del store


  if (to.meta.requiresAuth && !localStorage.getItem('authSession')) {
      authStore.clearAuth(); // Limpia el store si no hay sesión en localStorage
      next({ name: 'login' });
      return;
  }

  if (to.meta.requiresAuth && !isAuthenticated) {
    // Si requiere auth y no está autenticado (en el store), va a login
    next({ name: 'login' })
  } else if (to.meta.requiresGuest && isAuthenticated) {
    // Si es para invitados (login) y ya está autenticado, va a la raíz
    next({ name: 'appointments' })
  } else {
    // En cualquier otro caso, permite la navegación
    next()
  }
})

export default router