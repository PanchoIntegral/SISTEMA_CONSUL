from flask import jsonify, current_app, request
from . import doctors_bp
from app.extensions import get_supabase
from app.utils.decorators import token_required
from datetime import datetime, timedelta

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

@doctors_bp.route("/blocked-days", methods=["POST"])
@token_required
def add_blocked_day(current_user):
    """Endpoint para bloquear un día específico para un doctor."""
    current_app.logger.info(f"Solicitud POST /doctors/blocked-days por user ID: {current_user.id}")
    data = request.get_json()

    required_fields = ["doctor_id", "blocked_date"]
    if not data or not all(field in data for field in required_fields):
        return jsonify({"message": f"Campos requeridos faltantes: {required_fields}"}), 400
    
    try:
        # Validar formato de fecha
        try:
            blocked_date = datetime.fromisoformat(data["blocked_date"].replace('Z', '+00:00')).date()
            # Convertir a formato ISO para almacenar en la base de datos
            blocked_date_iso = blocked_date.isoformat()
        except ValueError:
            return jsonify({"message": "Formato inválido para blocked_date. Usar formato ISO 8601 (YYYY-MM-DD)"}), 400
        
        # Verificar si ya existe un registro para esa fecha y doctor
        existing_block = supabase.table('doctor_blocked_days') \
            .select('id') \
            .eq('doctor_id', data["doctor_id"]) \
            .eq('blocked_date', blocked_date_iso) \
            .execute()
            
        if existing_block.data and len(existing_block.data) > 0:
            return jsonify({"message": "Esta fecha ya está bloqueada para este doctor"}), 409
        
        # Insertar el nuevo día bloqueado
        blocked_day_data = {
            "doctor_id": data["doctor_id"],
            "blocked_date": blocked_date_iso,
            "reason": data.get("reason", "No disponible")
        }
        
        response = supabase.table('doctor_blocked_days').insert(blocked_day_data).execute()
        
        if response.data:
            current_app.logger.info(f"Día bloqueado creado con ID: {response.data[0]['id']}")
            return jsonify(response.data[0]), 201
        else:
            error_message = "Error al bloquear el día"
            if hasattr(response, 'error') and response.error:
                error_message = response.error.message
                if "violates foreign key constraint" in error_message:
                    if "doctor_blocked_days_doctor_id_fkey" in error_message:
                        return jsonify({"message": "ID de doctor inválido"}), 400
            current_app.logger.error(f"Error en Supabase al bloquear día: {error_message}")
            return jsonify({"message": error_message or "Error inesperado al bloquear día"}), 500
            
    except Exception as e:
        current_app.logger.exception("Error bloqueando día")
        return jsonify({"message": "Error interno al bloquear el día"}), 500

@doctors_bp.route("/blocked-days", methods=["GET"])
@token_required
def get_blocked_days(current_user):
    """Endpoint para obtener los días bloqueados de un doctor."""
    current_app.logger.info(f"Solicitud GET /doctors/blocked-days por user ID: {current_user.id}")
    
    doctor_id = request.args.get('doctor_id')
    if not doctor_id:
        return jsonify({"message": "El parámetro doctor_id es requerido"}), 400
    
    try:
        # Obtener días bloqueados futuros para el doctor especificado
        today = datetime.now().date().isoformat()
        
        query = supabase.table('doctor_blocked_days') \
            .select('*') \
            .eq('doctor_id', doctor_id) \
            .gte('blocked_date', today) \
            .order('blocked_date') \
            .execute()
            
        current_app.logger.debug(f"Respuesta de Supabase (días bloqueados): {query}")
        return jsonify(query.data or []), 200
        
    except Exception as e:
        current_app.logger.exception("Error obteniendo días bloqueados")
        return jsonify({"message": "Error obteniendo los días bloqueados"}), 500

@doctors_bp.route("/blocked-days/<int:blocked_day_id>", methods=["DELETE"])
@token_required
def delete_blocked_day(current_user, blocked_day_id):
    """Endpoint para eliminar un día bloqueado."""
    current_app.logger.info(f"Solicitud DELETE /doctors/blocked-days/{blocked_day_id} por user ID: {current_user.id}")
    
    try:
        # Verificar si el día bloqueado existe
        block = supabase.table('doctor_blocked_days') \
            .select('*') \
            .eq('id', blocked_day_id) \
            .execute()
            
        if not block.data or len(block.data) == 0:
            return jsonify({"message": "Día bloqueado no encontrado"}), 404
        
        # Eliminar el día bloqueado
        response = supabase.table('doctor_blocked_days') \
            .delete() \
            .eq('id', blocked_day_id) \
            .execute()
            
        current_app.logger.debug(f"Respuesta de Supabase (eliminar día bloqueado): {response}")
        return jsonify({"message": "Día bloqueado eliminado correctamente"}), 200
        
    except Exception as e:
        current_app.logger.exception("Error eliminando día bloqueado")
        return jsonify({"message": "Error eliminando el día bloqueado"}), 500