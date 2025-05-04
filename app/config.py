# Configuración de la aplicación

import os
from dotenv import load_dotenv

load_dotenv() # Cargar variables de .env para que estén disponibles aquí

class Config:
    """Clase base de configuración."""
    # Clave secreta para sesiones, etc. Cambiar en producción.
    SECRET_KEY = os.environ.get('SECRET_KEY', 'una-clave-secreta-muy-segura')

    # Configuración de Supabase
    SUPABASE_URL = os.environ.get("SUPABASE_URL")
    SUPABASE_KEY = os.environ.get("SUPABASE_KEY")

    # Validar configuración esencial
    if not SUPABASE_URL or not SUPABASE_KEY:
        raise ValueError("SUPABASE_URL y SUPABASE_KEY deben estar definidas en .env")

    # Podrías añadir otras configuraciones aquí (ej. base de datos, mail)