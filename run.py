

import os
from app import create_app 
from dotenv import load_dotenv

load_dotenv() # Cargar variables de .env

# Crear la instancia de la aplicación usando la fábrica
app = create_app()

if __name__ == '__main__':
    # Obtener puerto del entorno o usar 5000 por defecto
    port = int(os.environ.get('PORT', 5000))
    # Ejecutar en modo debug SOLO para desarrollo (leer desde variable de entorno es mejor)
    debug_mode = os.environ.get('FLASK_DEBUG', 'True').lower() == 'true'
    app.run(debug=debug_mode, host='0.0.0.0', port=port)