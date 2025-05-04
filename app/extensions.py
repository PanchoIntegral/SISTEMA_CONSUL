# Inicialización de extensiones y clientes externos

from supabase import create_client, Client
from flask_cors import CORS

# Crear instancias globales (se inicializarán en la fábrica de la app)
cors = CORS()
supabase: Client = None # Se inicializará en create_app

def init_supabase(url: str, key: str):
    """Inicializa el cliente global de Supabase."""
    global supabase
    if not url or not key:
         raise ValueError("Supabase URL y Key son requeridos para inicializar el cliente.")
    try:
        supabase = create_client(url, key)
        # print("Supabase client initialized via extensions.") # Debug print
    except Exception as e:
        # print(f"Error initializing Supabase client via extensions: {e}") # Debug print
        raise e # Relanzar excepción para que la app falle si no se puede conectar

def get_supabase() -> Client:
    """Devuelve la instancia inicializada del cliente Supabase."""
    if supabase is None:
        raise RuntimeError("Supabase client no ha sido inicializado.")
    return supabase