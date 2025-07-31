// Servicio de Autenticación para OverWord
import { supabase } from '@/supabaseClient'

class AuthService {
  constructor() {
    this.currentUser = null
    this.isAuthenticated = false
  }

  // 🔑 Login automático con credenciales fijas para el sistema médico
  async autoLogin() {
    try {
      // Verificar si ya hay sesión activa
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session) {
        this.currentUser = session.user
        this.isAuthenticated = true
        console.log('✅ Sesión existente encontrada:', session.user.email)
        return { success: true, user: session.user }
      }

      // Si no hay sesión, hacer login automático con cuenta del sistema
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'sistema@overword.com',
        password: 'OverWord2024#'
      })

      if (error) {
        console.log('⚠️ Cuenta del sistema no existe, creándola...')
        return await this.createSystemAccount()
      }

      this.currentUser = data.user
      this.isAuthenticated = true
      console.log('✅ Login automático exitoso:', data.user.email)
      
      return { success: true, user: data.user }
      
    } catch (error) {
      console.error('❌ Error en auto-login:', error.message)
      return { success: false, error: error.message }
    }
  }

  // 🔧 Crear cuenta del sistema si no existe
  async createSystemAccount() {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: 'sistema@overword.com',
        password: 'OverWord2024#'
      })

      if (error) {
        console.error('❌ Error creando cuenta del sistema:', error.message)
        return { success: false, error: error.message }
      }

      // Intentar login inmediatamente
      const loginResult = await supabase.auth.signInWithPassword({
        email: 'sistema@overword.com',
        password: 'OverWord2024#'
      })

      if (loginResult.data?.user) {
        this.currentUser = loginResult.data.user
        this.isAuthenticated = true
        console.log('✅ Cuenta del sistema creada y login exitoso')
        return { success: true, user: loginResult.data.user }
      }

      return { success: false, error: 'No se pudo hacer login después de crear cuenta' }
      
    } catch (error) {
      console.error('❌ Error creando cuenta del sistema:', error.message)
      return { success: false, error: error.message }
    }
  }

  // 🔓 Logout
  async logout() {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      this.currentUser = null
      this.isAuthenticated = false
      console.log('✅ Logout exitoso')
      return { success: true }
      
    } catch (error) {
      console.error('❌ Error en logout:', error.message)
      return { success: false, error: error.message }
    }
  }

  // 👤 Obtener usuario actual
  getCurrentUser() {
    return this.currentUser
  }

  // ✅ Verificar si está autenticado
  isUserAuthenticated() {
    return this.isAuthenticated
  }

  // 🔄 Escuchar cambios de autenticación
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange((event, session) => {
      this.isAuthenticated = !!session
      this.currentUser = session?.user || null
      
      console.log(`🔄 Auth state changed: ${event}`, session?.user?.email || 'No user')
      callback(event, session)
    })
  }
}

// Instancia singleton
export const authService = new AuthService()
export default authService 