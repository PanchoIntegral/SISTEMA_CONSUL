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
            appointment_dt = datetime.fromisoformat(data["appointment_time"].replace('Z', '+00:00'))
        except ValueError:
            return jsonify({"message": "Formato inválido para appointment_time. Usar formato ISO 8601 (ej: geliştirmeler-MM-DDTHH:mm:ssZ)"}), 400

        # Verificar si el doctor ya tiene una cita en la misma hora
        doctor_id = data.get("doctor_id")
        if doctor_id is not None and doctor_id != "":
            # Definir ventana de tiempo para verificar (±30 minutos)
            time_window = timedelta(minutes=30)
            start_time = (appointment_dt - time_window).isoformat()
            end_time = (appointment_dt + time_window).isoformat()
            
            # Buscar citas del doctor en la ventana de tiempo
            existing_appointments = supabase.table('appointments')\
                .select('id, appointment_time')\
                .eq('doctor_id', doctor_id)\
                .gte('appointment_time', start_time)\
                .lte('appointment_time', end_time)\
                .execute()
                
            if hasattr(existing_appointments, 'data') and existing_appointments.data:
                current_app.logger.info(f"Doctor ID {doctor_id} ya tiene cita(s) en horario similar: {existing_appointments.data}")
                return jsonify({
                    "message": "El doctor seleccionado ya tiene una cita programada en este horario.",
                    "error_type": "doctor_unavailable",
                    "conflict_time": data["appointment_time"]
                }), 409  # Conflict status code

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
    """Endpoint para obtener la lista de citas, con filtros opcionales."""
    current_app.logger.info(f"Solicitud GET /appointments por user ID: {current_user.id}")
    try:
        # Determinar campo y dirección de ordenamiento
        sort_by = request.args.get('sort_by', 'appointment_time')  # Por defecto ordenar por fecha
        sort_dir = request.args.get('sort_dir', 'asc')  # Por defecto ascendente
        
        # Validar campos permitidos para ordenamiento
        allowed_sort_fields = {'appointment_time', 'status', 'patient.name'}
        if sort_by not in allowed_sort_fields:
            sort_by = 'appointment_time'  # Valor seguro por defecto
        
        # Validar dirección de ordenamiento
        if sort_dir.lower() not in ['asc', 'desc']:
            sort_dir = 'asc'  # Valor seguro por defecto
            
        # Para ordenar por nombre de paciente, vamos a realizar un ordenamiento manual
        # después de obtener los datos, así que para ese caso no incluimos ordenamiento en la consulta
        if sort_by == 'patient.name':
            query = supabase.table('appointments').select('''
                id, appointment_time, status, notes, created_at,
                arrival_time, consultation_start_time, consultation_end_time,
                patient:patients (id, name),
                doctor:doctors (id, name)
            ''')
        else:
            # Para otros campos, aplicamos el ordenamiento directamente en la consulta
            query = supabase.table('appointments').select('''
                id, appointment_time, status, notes, created_at,
                arrival_time, consultation_start_time, consultation_end_time,
                patient:patients (id, name),
                doctor:doctors (id, name)
            ''').order(sort_by, desc=(sort_dir.lower() == 'desc'))
            
        current_app.logger.info(f"Ordenando por {sort_by} ({sort_dir})")

        # Aplicar filtros desde los query parameters
        filter_date = request.args.get('date')
        filter_status = request.args.get('status')
        filter_doctor_id = request.args.get('doctor_id')
        filter_patient_name = request.args.get('patient_name')
        filter_exclude_statuses = request.args.getlist('exclude_statuses[]')  # Obtener lista de estados a excluir
        filter_include_statuses = request.args.getlist('include_statuses[]')  # Obtener lista de estados a incluir

        # Filtro por fecha
        if filter_date:
            try:
                valid_date = datetime.strptime(filter_date, '%Y-%m-%d').date()

                # Crear objetos datetime conscientes de UTC para inicio y fin del día
                start_dt = datetime(valid_date.year, valid_date.month, valid_date.day, 0, 0, 0, tzinfo=timezone.utc)
                # El fin es el inicio del día siguiente (exclusivo)
                end_dt = start_dt + timedelta(days=1)

                # Convertir a strings ISO 8601
                start_dt_iso = start_dt.isoformat()
                end_dt_iso = end_dt.isoformat()

                current_app.logger.info(f"Filtrando citas por fecha UTC: >= {start_dt_iso} y < {end_dt_iso}")
                # Aplicar filtros gte (>=) y lt (<)
                query = query.gte('appointment_time', start_dt_iso)
                query = query.lt('appointment_time', end_dt_iso)
            except ValueError:
                return jsonify({"message": "Formato de fecha inválido, usar YYYY-MM-DD"}), 400
            except Exception as filter_error:
                current_app.logger.error(f"Error aplicando filtro de fecha: {filter_error}")
                return jsonify({"message": "Error interno al aplicar filtro de fecha"}), 500
        
        # Filtro por estado
        if filter_status:
            query = query.eq('status', filter_status)
            current_app.logger.info(f"Filtrando citas por estado: {filter_status}")
        
        # Filtro para excluir estados
        if filter_exclude_statuses:
            for status_to_exclude in filter_exclude_statuses:
                query = query.neq('status', status_to_exclude)
            current_app.logger.info(f"Excluyendo citas con estados: {filter_exclude_statuses}")
        
        # Filtro para incluir solo ciertos estados
        if filter_include_statuses:
            # Usar or() para incluir cualquiera de los estados específicos
            status_conditions = []
            for status_to_include in filter_include_statuses:
                status_conditions.append(f"status.eq.{status_to_include}")
            
            if status_conditions:
                query = query.or_(",".join(status_conditions))
                current_app.logger.info(f"Incluyendo solo citas con estados: {filter_include_statuses}")
        
        # Filtro por doctor_id
        if filter_doctor_id:
            try:
                doctor_id = int(filter_doctor_id)
                query = query.eq('doctor_id', doctor_id)
                current_app.logger.info(f"Filtrando citas por doctor_id: {doctor_id}")
            except ValueError:
                return jsonify({"message": "doctor_id debe ser un número entero"}), 400
        
        # Filtro por nombre de paciente (texto parcial)
        if filter_patient_name:
            # Usamos Postgres ilike para búsqueda case-insensitive
            # Necesitamos usar la sintaxis especial para filtrar en relaciones anidadas
            query = query.filter('patient.name', 'ilike', f'%{filter_patient_name}%')
            current_app.logger.info(f"Filtrando citas por nombre de paciente: {filter_patient_name}")

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

            # Ordenar manualmente por nombre de paciente si es necesario
            if sort_by == 'patient.name':
                try:
                    # Ordenar por nombre de paciente, manejando casos donde patient o name sean None
                    def get_patient_name(appt):
                        if appt.get('patient') and appt['patient'].get('name'):
                            return appt['patient']['name'].lower()  # Convertir a minúsculas para ordenar de forma insensible a mayúsculas
                        return ""  # Si no hay paciente o nombre, usar cadena vacía
                    
                    # Ordenar la lista según la dirección solicitada
                    appointments_with_times = sorted(
                        appointments_with_times, 
                        key=get_patient_name,
                        reverse=(sort_dir.lower() == 'desc')
                    )
                    current_app.logger.debug("Ordenamiento manual aplicado por nombre de paciente")
                except Exception as sort_error:
                    current_app.logger.error(f"Error al ordenar por nombre de paciente: {sort_error}")
                    # Continuamos sin ordenar si hay un error

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
                          appointment_dt = datetime.fromisoformat(data[field].replace('Z', '+00:00'))
                          update_data[field] = data[field]
                     except ValueError:
                          return jsonify({"message": "Formato inválido para appointment_time. Usar formato ISO 8601"}), 400
                else: # Para 'notes'
                    update_data[field] = data[field]

        # Verificar disponibilidad del doctor si se está actualizando doctor_id o appointment_time
        if ("doctor_id" in update_data or "appointment_time" in update_data) and "doctor_id" in update_data and update_data["doctor_id"] is not None:
            doctor_id = update_data["doctor_id"]
            
            # Si solo se actualiza doctor_id, necesitamos obtener el appointment_time actual
            if "appointment_time" not in update_data:
                appt_time_query = supabase.table('appointments').select('appointment_time').eq('id', appointment_id).maybe_single().execute()
                if appt_time_query.data and "appointment_time" in appt_time_query.data:
                    appointment_dt = datetime.fromisoformat(appt_time_query.data["appointment_time"].replace('Z', '+00:00'))
                else:
                    return jsonify({"message": "Error al obtener la hora de la cita"}), 500
            else:
                appointment_dt = datetime.fromisoformat(update_data["appointment_time"].replace('Z', '+00:00'))
            
            # Definir ventana de tiempo para verificar (±30 minutos)
            time_window = timedelta(minutes=30)
            start_time = (appointment_dt - time_window).isoformat()
            end_time = (appointment_dt + time_window).isoformat()
            
            # Buscar citas del doctor en la ventana de tiempo (excluyendo la cita actual)
            existing_appointments = supabase.table('appointments')\
                .select('id, appointment_time')\
                .eq('doctor_id', doctor_id)\
                .neq('id', appointment_id)\
                .gte('appointment_time', start_time)\
                .lte('appointment_time', end_time)\
                .execute()
                
            if hasattr(existing_appointments, 'data') and existing_appointments.data:
                current_app.logger.info(f"Doctor ID {doctor_id} ya tiene cita(s) en horario similar: {existing_appointments.data}")
                return jsonify({
                    "message": "El doctor seleccionado ya tiene una cita programada en este horario.",
                    "error_type": "doctor_unavailable",
                    "conflict_time": update_data.get("appointment_time") or appt_time_query.data.get("appointment_time")
                }), 409  # Conflict status code


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
