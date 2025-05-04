# Definición del Blueprint de Pacientes

from flask import Blueprint

patients_bp = Blueprint('patients', __name__, url_prefix='/api/v1/patients')

from . import routes