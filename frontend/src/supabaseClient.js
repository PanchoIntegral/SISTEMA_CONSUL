import { createClient } from '@supabase/supabase-js'

// Obtener variables de entorno de Vite (deben empezar con VITE_)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Error: Supabase URL or Key not found in environment variables.");
  // Podrías lanzar un error o manejarlo de otra forma
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)