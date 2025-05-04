# Definición del Blueprint de Doctores

from flask import Blueprint

doctors_bp = Blueprint('doctors', __name__, url_prefix='/api/v1/doctors')

from . import routes