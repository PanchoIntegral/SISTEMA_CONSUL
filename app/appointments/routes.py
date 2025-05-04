# Rutas para Citas

from flask import request, jsonify, current_app
from datetime import datetime, timezone, timedelta # Asegúrate de importar timedelta
from . import appointments_bp
from app.extensions import get_supabase
from app.utils.decorators import token_required
from app.utils.helpers import calculate_durations # Importar helper

supabase = get_supabase()

# CORRECCIÓN: Ruta base del blueprint debe ser "" si el prefijo ya tiene el nombre
@appointments_bp.route("", methods=["POST"])
@token_required
def create_appointment(current_user):
    """Endpoint para crear una nueva cita."""
    current_app.logger.info(f"Solicitud POST /appointments por user ID: {current_user.id}")
    data = request.get_json()

    required_fields = ["patient_id", "appointment_time"]
    if not data or not all(field in data and data[field] is not None for field in required_fields):
        return jsonify({"message": f"Campos requeridos faltantes o nulos: {required_fields}"}), 400

    try:
        # Validar formato de fecha/hora
        try:
            datetime.fromisoformat(data["appointment_time"].replace('Z', '+00:00'))
        except ValueError:
            return jsonify({"message": "Formato inválido para appointment_time. Usar formato ISO 8601 (ej: geliştirmeler-MM-DDTHH:mm:ssZ)"}), 400

        appointment_data = {
            "patient_id": data.get("patient_id"),
            "doctor_id": data.get("doctor_id"),
            "appointment_time": data.get("appointment_time"),
            "notes": data.get("notes"),
            "status": "Programada"
        }
        if "doctor_id" not in data:
             appointment_data["doctor_id"] = None
        appointment_data_filtered = {k: v for k, v in appointment_data.items() if k == "doctor_id" or v is not None}

        # Ejecutar insert SIN encadenar .select()
        response = supabase.table('appointments').insert(appointment_data_filtered).execute()
        current_app.logger.debug(f"Respuesta de Supabase (create appointment): {response}")

        if response.data:
            current_app.logger.info(f"Cita creada con ID: {response.data[0]['id']}")
            return jsonify(response.data[0]), 201
        else:
            error_message = "Error al crear la cita"
            if hasattr(response, 'error') and response.error:
                 error_message = response.error.message
                 if "violates foreign key constraint" in error_message:
                      if "appointments_patient_id_fkey" in error_message:
                           return jsonify({"message": "ID de paciente inválido"}), 400
                      if "appointments_doctor_id_fkey" in error_message:
                           return jsonify({"message": "ID de doctor inválido"}), 400
            current_app.logger.error(f"Error en Supabase al crear cita: {error_message}")
            return jsonify({"message": error_message or "Error inesperado al crear cita"}), 500

    except Exception as e:
        current_app.logger.exception("Error creando cita")
        return jsonify({"message": "Error interno al crear la cita"}), 500

# CORRECCIÓN: Ruta base del blueprint debe ser "" si el prefijo ya tiene el nombre
@appointments_bp.route("", methods=["GET"])
@token_required
def get_appointments(current_user):
    """Endpoint para obtener la lista de citas, con filtro opcional por fecha."""
    current_app.logger.info(f"Solicitud GET /appointments por user ID: {current_user.id}")
    try:
        query = supabase.table('appointments').select('''
            id, appointment_time, status, notes, created_at,
            arrival_time, consultation_start_time, consultation_end_time,
            patient:patients (id, name),
            doctor:doctors (id, name)
        ''').order('appointment_time')

        filter_date = request.args.get('date')
        if filter_date:
            try:
                valid_date = datetime.strptime(filter_date, '%Y-%m-%d').date()

                # --- NUEVA LÓGICA DE FILTRO (Rango UTC Explícito) ---
                # Crear objetos datetime conscientes de UTC para inicio y fin del día
                start_dt = datetime(valid_date.year, valid_date.month, valid_date.day, 0, 0, 0, tzinfo=timezone.utc)
                # El fin es el inicio del día siguiente (exclusivo)
                end_dt = start_dt + timedelta(days=1)

                # Convertir a strings ISO 8601 (aunque la librería podría aceptar objetos datetime)
                start_dt_iso = start_dt.isoformat()
                end_dt_iso = end_dt.isoformat()

                current_app.logger.info(f"Filtrando citas por fecha UTC: >= {start_dt_iso} y < {end_dt_iso}")
                # Aplicar filtros gte (>=) y lt (<)
                query = query.gte('appointment_time', start_dt_iso)
                query = query.lt('appointment_time', end_dt_iso)
                # --- FIN NUEVA LÓGICA ---
            except ValueError:
                return jsonify({"message": "Formato de fecha inválido, usar YYYY-MM-DD"}), 400
            except Exception as filter_error:
                current_app.logger.error(f"Error aplicando filtro de fecha: {filter_error}")
                return jsonify({"message": "Error interno al aplicar filtro de fecha"}), 500

        response = query.execute()
        current_app.logger.debug(f"Respuesta de Supabase (get appointments): {response}")

        appointments_with_times = []
        if response.data:
            # Procesar cada cita y verificar si el paciente es recurrente
            for appt in response.data:
                appt_with_times = calculate_durations(appt)
                
                # Verificar si el paciente es recurrente
                if 'patient' in appt and appt['patient']:
                    patient_id = appt['patient']['id']
                    appointments_count = supabase.table('appointments')\
                        .select('id', count='exact')\
                        .eq('patient_id', patient_id)\
                        .execute()
                    
                    # Si tiene más de 1 cita, es recurrente
                    if appointments_count.count > 1:
                        appt_with_times['is_recurring_patient'] = True
                    else:
                        appt_with_times['is_recurring_patient'] = False
                
                appointments_with_times.append(appt_with_times)

        return jsonify(appointments_with_times), 200

    except Exception as e:
        current_app.logger.exception("Error obteniendo la lista de citas")
        return jsonify({"message": "Error obteniendo la lista de citas"}), 500


@appointments_bp.route("/<int:appointment_id>", methods=["GET"])
@token_required
def get_appointment_by_id(current_user, appointment_id):
    """Endpoint para obtener una cita por su ID, incluyendo tiempos calculados."""
    current_app.logger.info(f"Solicitud GET /appointments/{appointment_id} por user ID: {current_user.id}")
    try:
        response = supabase.table('appointments').select('''
            id, appointment_time, status, notes, created_at,
            arrival_time, consultation_start_time, consultation_end_time,
            patient:patients (id, name),
            doctor:doctors (id, name)
        ''').eq('id', appointment_id).maybe_single().execute()
        current_app.logger.debug(f"Respuesta de Supabase (get appointment by id): {response}")

        if response.data:
            appointment_with_times = calculate_durations(response.data)
            
            # Verificar si el paciente es recurrente (tiene más de una cita)
            if 'patient' in response.data and response.data['patient']:
                patient_id = response.data['patient']['id']
                appointments_count = supabase.table('appointments')\
                    .select('id', count='exact')\
                    .eq('patient_id', patient_id)\
                    .execute()
                
                current_app.logger.debug(f"Conteo de citas para paciente {patient_id}: {appointments_count.count}")
                
                # Si tiene más de 1 cita, es recurrente
                if appointments_count.count > 1:
                    # Agregar indicador de paciente recurrente
                    appointment_with_times['is_recurring_patient'] = True
                    # Si no hay notas, inicializar como string vacío
                    if not appointment_with_times.get('notes'):
                        appointment_with_times['notes'] = ''
                    # # Agregar nota solo si no existe ya
                    # if 'Paciente recurrente' not in str(appointment_with_times.get('notes', '')):
                    #     prefix = appointment_with_times['notes'] + '\n\n' if appointment_with_times.get('notes') else ''
                    #     appointment_with_times['notes'] = prefix + 'Paciente recurrente - Ha visitado la clínica anteriormente.'
                else:
                    appointment_with_times['is_recurring_patient'] = False
            
            return jsonify(appointment_with_times), 200
        else:
            return jsonify({"message": "Cita no encontrada"}), 404

    except Exception as e:
        current_app.logger.exception(f"Error obteniendo cita ID: {appointment_id}")
        return jsonify({"message": "Error obteniendo datos de la cita"}), 500


@appointments_bp.route("/<int:appointment_id>", methods=["PUT"])
@token_required
def update_appointment(current_user, appointment_id):
    """Endpoint para actualizar una cita (hora, doctor, notas, estado y timestamps)."""
    current_app.logger.info(f"Solicitud PUT /appointments/{appointment_id} por user ID: {current_user.id}")
    data = request.get_json()
    if not data:
        return jsonify({"message": "Datos requeridos en el body"}), 400

    try:
        # Obtener estado actual para validación
        current_appointment_response = supabase.table('appointments').select('status, arrival_time, consultation_start_time, consultation_end_time').eq('id', appointment_id).maybe_single().execute()
        if not current_appointment_response.data:
             return jsonify({"message": "Cita no encontrada"}), 404
        current_appointment = current_appointment_response.data
        current_status = current_appointment.get('status')

        # Preparar datos generales para actualizar (excluyendo status por ahora)
        update_data = {}
        allowed_fields_to_update_anytime = ["doctor_id", "appointment_time", "notes"]
        for field in allowed_fields_to_update_anytime:
            if field in data:
                 # Validaciones específicas
                if field == "doctor_id" and data[field] is not None:
                    try:
                        update_data[field] = int(data[field])
                    except (ValueError, TypeError):
                         return jsonify({"message": "doctor_id debe ser un número entero o null"}), 400
                elif field == "appointment_time" and data[field] is not None:
                     try:
                          datetime.fromisoformat(data[field].replace('Z', '+00:00'))
                          update_data[field] = data[field]
                     except ValueError:
                          return jsonify({"message": "Formato inválido para appointment_time. Usar formato ISO 8601"}), 400
                else: # Para 'notes'
                    update_data[field] = data[field]


        # --- VALIDACIÓN Y MANEJO DE ESTADO (CORREGIDO Y APLICADO) ---
        new_status = data.get("status")

        if new_status and new_status != current_status:
            # Define allowed transitions
            allowed_transitions = {
                "Programada": ["En Espera", "Cancelada", "No Asistió"],
                "En Espera": ["En Consulta", "Cancelada", "No Asistió"],
                "En Consulta": ["Completada", "Cancelada", "No Asistió"],
                "Completada": [], "Cancelada": [], "No Asistió": []
            }

            # Check if transition is allowed
            if new_status not in allowed_transitions.get(current_status, []):
                current_app.logger.warning(f"Transición de estado inválida de '{current_status}' a '{new_status}' para cita {appointment_id}")
                return jsonify({"message": f"No se puede cambiar el estado de '{current_status}' a '{new_status}'"}), 400
            else:
                # If transition is valid, add status and potentially timestamps to update_data
                update_data["status"] = new_status
                now_utc_iso = datetime.now(timezone.utc).isoformat()
                if new_status == "En Espera" and not current_appointment.get('arrival_time'):
                    update_data["arrival_time"] = now_utc_iso
                    current_app.logger.info(f"Registrando arrival_time para cita {appointment_id}")
                elif new_status == "En Consulta" and not current_appointment.get('consultation_start_time'):
                    update_data["consultation_start_time"] = now_utc_iso
                    current_app.logger.info(f"Registrando consultation_start_time para cita {appointment_id}")
                elif new_status == "Completada" and not current_appointment.get('consultation_end_time'):
                     update_data["consultation_end_time"] = now_utc_iso
                     current_app.logger.info(f"Registrando consultation_end_time para cita {appointment_id}")
        # --- FIN VALIDACIÓN Y MANEJO DE ESTADO ---


        # Check if there's anything to update
        if not update_data:
             if "status" in data and data["status"] == current_status:
                  # Devolver los datos actuales sin hacer update si solo se envió el mismo estado
                  fetch_response = supabase.table('appointments').select('''
                      id, appointment_time, status, notes, created_at,
                      arrival_time, consultation_start_time, consultation_end_time,
                      patient:patients (id, name),
                      doctor:doctors (id, name)
                  ''').eq('id', appointment_id).maybe_single().execute()
                  if fetch_response.data:
                      return jsonify(calculate_durations(fetch_response.data)), 200
                  else:
                      return jsonify({"message": "Cita no encontrada"}), 404
             else:
                  return jsonify({"message": "No hay campos válidos para actualizar o el estado no cambió/es inválido"}), 400


        # --- Ejecutar la actualización ---
        update_response = supabase.table('appointments').update(update_data).eq('id', appointment_id).execute()
        current_app.logger.debug(f"Respuesta de Supabase (update appointment): {update_response}")

        # Verificar si hubo error en la actualización
        if hasattr(update_response, 'error') and update_response.error:
            error_message = update_response.error.message
            current_app.logger.error(f"Error en Supabase al actualizar cita {appointment_id}: {error_message}")
            if "matching rows not found" in error_message.lower():
                 return jsonify({"message": "Cita no encontrada para actualizar"}), 404
            if "violates foreign key constraint" in error_message and "appointments_doctor_id_fkey" in error_message:
                 return jsonify({"message": "ID de doctor inválido"}), 400
            return jsonify({"message": error_message}), 400

        # Si la actualización no dio error, obtener los datos actualizados para devolverlos
        fetch_response = supabase.table('appointments').select('''
            id, appointment_time, status, notes, created_at,
            arrival_time, consultation_start_time, consultation_end_time,
            patient:patients (id, name),
            doctor:doctors (id, name)
        ''').eq('id', appointment_id).maybe_single().execute()
        current_app.logger.debug(f"Respuesta de Supabase (fetch after update appointment): {fetch_response}")

        if fetch_response.data:
            current_app.logger.info(f"Cita actualizada con ID: {appointment_id}")
            updated_appointment_with_times = calculate_durations(fetch_response.data) # Calcular tiempos aquí
            return jsonify(updated_appointment_with_times), 200
        else:
            current_app.logger.error(f"Cita {appointment_id} actualizada (sin error en update) pero no encontrada inmediatamente después.")
            return jsonify({"message": "Cita actualizada pero no se pudo recuperar"}), 500

    except Exception as e:
        current_app.logger.exception(f"Error actualizando cita ID: {appointment_id}")
        return jsonify({"message": "Error interno al actualizar la cita"}), 500


@appointments_bp.route("/<int:appointment_id>", methods=["DELETE"])
@token_required
def delete_appointment(current_user, appointment_id):
    """Endpoint para eliminar una cita."""
    current_app.logger.info(f"Solicitud DELETE /appointments/{appointment_id} por user ID: {current_user.id}")
    try:
        check_response = supabase.table('appointments').select('id', count='exact').eq('id', appointment_id).execute()
        if check_response.count == 0:
             return jsonify({"message": "Cita no encontrada"}), 404

        response = supabase.table('appointments').delete().eq('id', appointment_id).execute()
        current_app.logger.debug(f"Respuesta de Supabase (delete appointment): {response}")

        if hasattr(response, 'error') and response.error:
             current_app.logger.error(f"Error en Supabase al eliminar cita {appointment_id}: {response.error.message}")
             return jsonify({"message": response.error.message}), 500

        current_app.logger.info(f"Cita eliminada con ID: {appointment_id}")
        return '', 204

    except Exception as e:
        current_app.logger.exception(f"Error eliminando cita ID: {appointment_id}")
        return jsonify({"message": "Error interno al eliminar la cita"}), 500
