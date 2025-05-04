# Definición del Blueprint de Citas

from flask import Blueprint

appointments_bp = Blueprint('appointments', __name__, url_prefix='/api/v1/appointments')

from . import routes