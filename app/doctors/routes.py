from flask import jsonify, current_app
from . import doctors_bp
from app.extensions import get_supabase
from app.utils.decorators import token_required

supabase = get_supabase()

# CORRECCIÓN: Ruta base del blueprint debe ser "" si el prefijo ya tiene el nombre
@doctors_bp.route("", methods=["GET"])
@token_required
def get_doctors(current_user):
    """Endpoint para obtener la lista de doctores."""
    current_app.logger.info(f"Solicitud GET /doctors por user ID: {current_user.id}")
    try:
        response = supabase.table('doctors').select('*').order('name').execute()
        current_app.logger.debug(f"Respuesta de Supabase (doctores): {response}")
        return jsonify(response.data or []), 200

    except Exception as e:
        current_app.logger.exception("Error obteniendo la lista de doctores")
        return jsonify({"message": "Error obteniendo la lista de doctores"}), 500