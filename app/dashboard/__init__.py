from flask import Blueprint

dashboard_bp = Blueprint('dashboard', __name__, url_prefix='/api/v1/dashboard')

# No aplicamos CORS aquí para evitar duplicidad
# El CORS ya se aplica a nivel global en app/__init__.py

from . import routes