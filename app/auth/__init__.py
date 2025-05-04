# Definición del Blueprint de Autenticación

from flask import Blueprint

# Definir el Blueprint. El prefijo de URL se aplica a todas las rutas en routes.py
auth_bp = Blueprint('auth', __name__, url_prefix='/api/v1/auth')

# Importar las rutas DESPUÉS de definir el blueprint para evitar importación circular
from . import routes