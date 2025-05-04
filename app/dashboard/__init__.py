from flask import Blueprint

dashboard_bp = Blueprint('dashboard', __name__, url_prefix='/api/v1/dashboard')

from . import routes