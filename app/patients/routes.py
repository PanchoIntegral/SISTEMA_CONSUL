from flask import request, jsonify, current_app
from . import patients_bp
from app.extensions import get_supabase
from app.utils.decorators import token_required
from datetime import datetime, timedelta

supabase = get_supabase()

def check_duplicate_patient(name, contact_info, date_of_birth, exclude_id=None):
    """
    Verifica si ya existe un paciente con los mismos datos exactos.
    
    Args:
        name (str): Nombre del paciente
        contact_info (str): Información de contacto
        date_of_birth (str): Fecha de nacimiento
        exclude_id (int, optional): ID a excluir de la búsqueda (para actualizaciones)
    
    Returns:
        dict: Paciente duplicado encontrado o None si no hay duplicado
    """
    try:
        # Construir la consulta base
        query = supabase.table('patients').select('*')
        
        # Agregar filtros para los campos que no son None
        query = query.eq('name', name)
        
        if contact_info is not None:
            query = query.eq('contact_info', contact_info)
        else:
            query = query.is_('contact_info', None)
            
        if date_of_birth is not None:
            query = query.eq('date_of_birth', date_of_birth)
        else:
            query = query.is_('date_of_birth', None)
        
        # Excluir el ID especificado si se proporciona (para actualizaciones)
        if exclude_id is not None:
            query = query.neq('id', exclude_id)
        
        response = query.execute()
        
        if response.data and len(response.data) > 0:
            return response.data[0]  # Retornar el primer duplicado encontrado
        
        return None
        
    except Exception as e:
        current_app.logger.exception("Error verificando paciente duplicado")
        raise e

# CORRECCIÓN: Ruta base del blueprint debe ser "" si el prefijo ya tiene el nombre
@patients_bp.route("", methods=["POST"])
@token_required
def create_patient(current_user):
    """Endpoint para crear un nuevo paciente."""
    current_app.logger.info(f"Solicitud POST /patients por user ID: {current_user.id}")
    data = request.get_json()

    if not data or not data.get('name'):
        return jsonify({"message": "El campo 'name' es requerido"}), 400

    try:
        name = data.get("name")
        contact_info = data.get("contact_info")
        date_of_birth = data.get("date_of_birth")
        
        # Verificar si ya existe un paciente con los mismos datos
        duplicate_patient = check_duplicate_patient(name, contact_info, date_of_birth)
        if duplicate_patient:
            current_app.logger.warning(f"Intento de crear paciente duplicado: {name}")
            return jsonify({
                "message": "Ya existe un paciente con exactamente los mismos datos",
                "duplicate_patient": {
                    "id": duplicate_patient['id'],
                    "name": duplicate_patient['name']
                }
            }), 409  # Conflict

        patient_data = {
            "name": name,
            "contact_info": contact_info,
            "date_of_birth": date_of_birth
        }
        patient_data = {k: v for k, v in patient_data.items() if v is not None}

        response = supabase.table('patients').insert(patient_data).execute()
        current_app.logger.debug(f"Respuesta de Supabase (create patient): {response}")

        if response.data:
            current_app.logger.info(f"Paciente creado con ID: {response.data[0]['id']}")
            return jsonify(response.data[0]), 201
        else:
            error_message = "Error al crear el paciente"
            if hasattr(response, 'error') and response.error:
                 error_message = response.error.message
            current_app.logger.error(f"Error en Supabase al crear paciente: {error_message}")
            return jsonify({"message": error_message}), 400

    except Exception as e:
        current_app.logger.exception("Error creando paciente")
        return jsonify({"message": "Error interno al crear el paciente"}), 500

# CORRECCIÓN: Ruta base del blueprint debe ser "" si el prefijo ya tiene el nombre
@patients_bp.route("", methods=["GET"])
@token_required
def get_patients(current_user):
    """Endpoint para obtener la lista de pacientes con paginación."""
    current_app.logger.info(f"Solicitud GET /patients por user ID: {current_user.id}")
    try:
        # Obtener parámetros de consulta para paginación
        page = request.args.get('page', default=1, type=int)
        page_size = request.args.get('page_size', default=10, type=int)
        search_term = request.args.get('search')

        # Calcular el índice de inicio y fin para la paginación
        start_index = (page - 1) * page_size
        end_index = start_index + page_size

        # Construir la consulta base
        query = supabase.table('patients').select('*').order('name').range(start_index, end_index - 1)

        if search_term:
            query = query.ilike('name', f'%{search_term}%')

        response = query.execute()
        current_app.logger.debug(f"Respuesta de Supabase (get patients paginated): {response}")

        # Obtener el total de pacientes para calcular el número total de páginas
        total_response = supabase.table('patients').select('id', count='exact').execute()
        total_count = total_response.count
        total_pages = (total_count + page_size - 1) // page_size

        return jsonify({
            "data": response.data or [],
            "pagination": {
                "page": page,
                "page_size": page_size,
                "total_pages": total_pages,
                "total_count": total_count
            }
        }), 200

    except Exception as e:
        current_app.logger.exception("Error obteniendo la lista de pacientes con paginación")
        return jsonify({"message": "Error obteniendo la lista de pacientes"}), 500


@patients_bp.route("/<int:patient_id>", methods=["GET"])
@token_required
def get_patient_by_id(current_user, patient_id):
    """Endpoint para obtener un paciente por su ID."""
    current_app.logger.info(f"Solicitud GET /patients/{patient_id} por user ID: {current_user.id}")
    try:
        response = supabase.table('patients').select('*').eq('id', patient_id).maybe_single().execute()
        current_app.logger.debug(f"Respuesta de Supabase (get patient by id): {response}")

        if response.data:
            return jsonify(response.data), 200
        else:
            return jsonify({"message": "Paciente no encontrado"}), 404

    except Exception as e:
        current_app.logger.exception(f"Error obteniendo paciente ID: {patient_id}")
        return jsonify({"message": "Error obteniendo datos del paciente"}), 500


@patients_bp.route("/<int:patient_id>", methods=["PUT"])
@token_required
def update_patient(current_user, patient_id):
    """Endpoint para actualizar un paciente."""
    current_app.logger.info(f"Solicitud PUT /patients/{patient_id} por user ID: {current_user.id}")
    data = request.get_json()
    if not data:
        return jsonify({"message": "Datos requeridos en el body"}), 400

    try:
        # Primero verificar si el paciente existe
        existing_patient_response = supabase.table('patients').select('*').eq('id', patient_id).maybe_single().execute()
        if not existing_patient_response.data:
            return jsonify({"message": "Paciente no encontrado para actualizar"}), 404
        
        existing_patient = existing_patient_response.data
        
        update_data = {
            "name": data.get("name"),
            "contact_info": data.get("contact_info"),
            "date_of_birth": data.get("date_of_birth")
        }
        update_data = {k: v for k, v in update_data.items() if k in data}

        if not update_data:
             return jsonify({"message": "No hay campos válidos para actualizar"}), 400

        # Crear los datos finales combinando los existentes con las actualizaciones
        final_data = {**existing_patient, **update_data}
        
        # Verificar si ya existe un paciente con los mismos datos (excluyendo el actual)
        duplicate_patient = check_duplicate_patient(
            final_data.get("name"),
            final_data.get("contact_info"),
            final_data.get("date_of_birth"),
            exclude_id=patient_id
        )
        
        if duplicate_patient:
            current_app.logger.warning(f"Intento de actualizar paciente {patient_id} con datos duplicados")
            return jsonify({
                "message": "Ya existe otro paciente con exactamente los mismos datos",
                "duplicate_patient": {
                    "id": duplicate_patient['id'],
                    "name": duplicate_patient['name']
                }
            }), 409  # Conflict

        # 1. Ejecutar la actualización (sin .select())
        update_response = supabase.table('patients').update(update_data).eq('id', patient_id).execute()
        current_app.logger.debug(f"Respuesta de Supabase (update patient): {update_response}")

        # 2. Verificar si hubo error en la actualización
        if hasattr(update_response, 'error') and update_response.error:
            error_message = update_response.error.message
            current_app.logger.error(f"Error en Supabase al actualizar paciente {patient_id}: {error_message}")
            if "matching rows not found" in error_message.lower():
                 return jsonify({"message": "Paciente no encontrado para actualizar"}), 404
            return jsonify({"message": error_message}), 400

        # 3. Si la actualización no dio error, obtener los datos actualizados para devolverlos
        fetch_response = supabase.table('patients').select('*').eq('id', patient_id).maybe_single().execute()
        current_app.logger.debug(f"Respuesta de Supabase (fetch after update patient): {fetch_response}")

        if fetch_response.data:
            current_app.logger.info(f"Paciente actualizado con ID: {patient_id}")
            return jsonify(fetch_response.data), 200
        else:
            current_app.logger.error(f"Paciente {patient_id} actualizado (sin error en update) pero no encontrado inmediatamente después.")
            return jsonify({"message": "Paciente actualizado pero no se pudo recuperar"}), 500

    except Exception as e:
        current_app.logger.exception(f"Error actualizando paciente ID: {patient_id}")
        return jsonify({"message": "Error interno al actualizar el paciente"}), 500


@patients_bp.route("/<int:patient_id>", methods=["DELETE"])
@token_required
def delete_patient(current_user, patient_id):
    """Endpoint para eliminar un paciente."""
    current_app.logger.info(f"Solicitud DELETE /patients/{patient_id} por user ID: {current_user.id}")
    try:
        check_response = supabase.table('patients').select('id', count='exact').eq('id', patient_id).execute()
        if check_response.count == 0:
             return jsonify({"message": "Paciente no encontrado"}), 404

        response = supabase.table('patients').delete().eq('id', patient_id).execute()
        current_app.logger.debug(f"Respuesta de Supabase (delete patient): {response}")

        if hasattr(response, 'error') and response.error:
             current_app.logger.error(f"Error en Supabase al eliminar paciente {patient_id}: {response.error.message}")
             return jsonify({"message": response.error.message}), 500

        current_app.logger.info(f"Paciente eliminado con ID: {patient_id}")
        return '', 204

    except Exception as e:
        current_app.logger.exception(f"Error eliminando paciente ID: {patient_id}")
        return jsonify({"message": "Error interno al eliminar el paciente"}), 500