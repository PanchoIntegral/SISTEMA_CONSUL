# Rutas para Dashboard y Estadísticas

from flask import request, jsonify, current_app
from datetime import datetime, timezone
from calendar import monthrange
from . import dashboard_bp
from app.extensions import get_supabase
from app.utils.decorators import token_required
from collections import Counter
from datetime import timedelta

supabase = get_supabase()

@dashboard_bp.route("/stats", methods=["GET"])
@token_required
def get_dashboard_stats(current_user):
    """Endpoint para obtener estadísticas generales del dashboard."""
    try:
        # Obtener parámetros de consulta
        month = request.args.get('month', type=int)
        year = request.args.get('year', type=int)
        
        if not month or not year:
            return jsonify({"message": "Se requieren los parámetros 'month' y 'year'"}), 400
            
        # Validar rango de mes
        if month < 1 or month > 12:
            return jsonify({"message": "El mes debe estar entre 1 y 12"}), 400
            
        # Calcular primer y último día del mes
        days_in_month = monthrange(year, month)[1]
        start_date = f"{year}-{month:02d}-01T00:00:00Z"
        end_date = f"{year}-{month:02d}-{days_in_month}T23:59:59Z"
        
        # Consultar total de citas en el mes
        appointments_query = supabase.table('appointments')\
            .select('id, status, arrival_time, consultation_start_time, consultation_end_time')\
            .gte('appointment_time', start_date)\
            .lte('appointment_time', end_date)\
            .execute()
            
        if hasattr(appointments_query, 'error') and appointments_query.error:
            current_app.logger.error(f"Error en Supabase al consultar citas: {appointments_query.error}")
            return jsonify({"message": "Error al consultar datos de citas"}), 500
            
        appointments = appointments_query.data
        total_appointments = len(appointments)
        
        # Calcular tiempos promedio
        wait_times = []
        consult_times = []
        
        for appointment in appointments:
            # Calcular tiempo de espera (desde llegada hasta inicio de consulta)
            if appointment.get('arrival_time') and appointment.get('consultation_start_time'):
                try:
                    arrival = datetime.fromisoformat(appointment['arrival_time'].replace('Z', '+00:00'))
                    start = datetime.fromisoformat(appointment['consultation_start_time'].replace('Z', '+00:00'))
                    if start >= arrival:
                        wait_time_minutes = int((start - arrival).total_seconds() / 60)
                        wait_times.append(wait_time_minutes)
                except Exception as e:
                    current_app.logger.error(f"Error calculando tiempo de espera: {e}")
            
            # Calcular tiempo de consulta
            if appointment.get('consultation_start_time') and appointment.get('consultation_end_time'):
                try:
                    start = datetime.fromisoformat(appointment['consultation_start_time'].replace('Z', '+00:00'))
                    end = datetime.fromisoformat(appointment['consultation_end_time'].replace('Z', '+00:00'))
                    if end >= start:
                        consult_time_minutes = int((end - start).total_seconds() / 60)
                        consult_times.append(consult_time_minutes)
                except Exception as e:
                    current_app.logger.error(f"Error calculando tiempo de consulta: {e}")
        
        # Calcular promedios
        avg_wait_time = round(sum(wait_times) / len(wait_times)) if wait_times else 0
        avg_consult_time = round(sum(consult_times) / len(consult_times)) if consult_times else 0
        
        # Preparar respuesta
        stats = {
            "totalAppointments": total_appointments,
            "avgWaitTime": avg_wait_time,
            "avgConsultTime": avg_consult_time
        }
        
        return jsonify(stats), 200
        
    except Exception as e:
        current_app.logger.exception(f"Error obteniendo estadísticas del dashboard: {e}")
        return jsonify({"message": f"Error interno: {str(e)}"}), 500


@dashboard_bp.route("/wait-time", methods=["GET"])
@token_required
def get_wait_time_by_day(current_user):
    """Endpoint para obtener tiempo promedio de espera por día."""
    try:
        # Obtener parámetros de consulta
        month = request.args.get('month', type=int)
        year = request.args.get('year', type=int)
        
        if not month or not year:
            return jsonify({"message": "Se requieren los parámetros 'month' y 'year'"}), 400
            
        # Validar rango de mes
        if month < 1 or month > 12:
            return jsonify({"message": "El mes debe estar entre 1 y 12"}), 400
            
        # Calcular primer y último día del mes
        days_in_month = monthrange(year, month)[1]
        start_date = f"{year}-{month:02d}-01T00:00:00Z"
        end_date = f"{year}-{month:02d}-{days_in_month}T23:59:59Z"
        
        # Consultar citas en el mes
        appointments_query = supabase.table('appointments')\
            .select('id, appointment_time, arrival_time, consultation_start_time')\
            .gte('appointment_time', start_date)\
            .lte('appointment_time', end_date)\
            .execute()
            
        if hasattr(appointments_query, 'error') and appointments_query.error:
            current_app.logger.error(f"Error en Supabase al consultar citas: {appointments_query.error}")
            return jsonify({"message": "Error al consultar datos de citas"}), 500
            
        appointments = appointments_query.data
        
        # Agrupar por día y calcular promedios
        daily_wait_times = {}
        
        for appointment in appointments:
            if appointment.get('arrival_time') and appointment.get('consultation_start_time'):
                try:
                    # Extraer fecha del appointment_time
                    appointment_datetime = datetime.fromisoformat(appointment['appointment_time'].replace('Z', '+00:00'))
                    day = appointment_datetime.day
                    
                    # Calcular tiempo de espera
                    arrival = datetime.fromisoformat(appointment['arrival_time'].replace('Z', '+00:00'))
                    start = datetime.fromisoformat(appointment['consultation_start_time'].replace('Z', '+00:00'))
                    
                    if start >= arrival:
                        wait_time_minutes = int((start - arrival).total_seconds() / 60)
                        
                        # Agregar al diccionario por día
                        if day not in daily_wait_times:
                            daily_wait_times[day] = []
                        daily_wait_times[day].append(wait_time_minutes)
                except Exception as e:
                    current_app.logger.error(f"Error procesando tiempo de espera: {e}")
        
        # Calcular promedios por día
        result = []
        for day in range(1, days_in_month + 1):
            if day in daily_wait_times and daily_wait_times[day]:
                avg_wait_time = round(sum(daily_wait_times[day]) / len(daily_wait_times[day]))
            else:
                avg_wait_time = 0
                
            result.append({
                "day": day,
                "avgWaitTime": avg_wait_time
            })
        
        return jsonify(result), 200
        
    except Exception as e:
        current_app.logger.exception(f"Error obteniendo tiempos de espera por día: {e}")
        return jsonify({"message": f"Error interno: {str(e)}"}), 500


@dashboard_bp.route("/consult-time", methods=["GET"])
@token_required
def get_consult_time_by_day(current_user):
    """Endpoint para obtener tiempo promedio de consulta por día."""
    try:
        # Obtener parámetros de consulta
        month = request.args.get('month', type=int)
        year = request.args.get('year', type=int)
        
        if not month or not year:
            return jsonify({"message": "Se requieren los parámetros 'month' y 'year'"}), 400
            
        # Validar rango de mes
        if month < 1 or month > 12:
            return jsonify({"message": "El mes debe estar entre 1 y 12"}), 400
            
        # Calcular primer y último día del mes
        days_in_month = monthrange(year, month)[1]
        start_date = f"{year}-{month:02d}-01T00:00:00Z"
        end_date = f"{year}-{month:02d}-{days_in_month}T23:59:59Z"
        
        # Consultar citas en el mes
        appointments_query = supabase.table('appointments')\
            .select('id, appointment_time, consultation_start_time, consultation_end_time')\
            .gte('appointment_time', start_date)\
            .lte('appointment_time', end_date)\
            .execute()
            
        if hasattr(appointments_query, 'error') and appointments_query.error:
            current_app.logger.error(f"Error en Supabase al consultar citas: {appointments_query.error}")
            return jsonify({"message": "Error al consultar datos de citas"}), 500
            
        appointments = appointments_query.data
        
        # Agrupar por día y calcular promedios
        daily_consult_times = {}
        
        for appointment in appointments:
            if appointment.get('consultation_start_time') and appointment.get('consultation_end_time'):
                try:
                    # Extraer fecha del appointment_time
                    appointment_datetime = datetime.fromisoformat(appointment['appointment_time'].replace('Z', '+00:00'))
                    day = appointment_datetime.day
                    
                    # Calcular tiempo de consulta
                    start = datetime.fromisoformat(appointment['consultation_start_time'].replace('Z', '+00:00'))
                    end = datetime.fromisoformat(appointment['consultation_end_time'].replace('Z', '+00:00'))
                    
                    if end >= start:
                        consult_time_minutes = int((end - start).total_seconds() / 60)
                        
                        # Agregar al diccionario por día
                        if day not in daily_consult_times:
                            daily_consult_times[day] = []
                        daily_consult_times[day].append(consult_time_minutes)
                except Exception as e:
                    current_app.logger.error(f"Error procesando tiempo de consulta: {e}")
        
        # Calcular promedios por día
        result = []
        for day in range(1, days_in_month + 1):
            if day in daily_consult_times and daily_consult_times[day]:
                avg_consult_time = round(sum(daily_consult_times[day]) / len(daily_consult_times[day]))
            else:
                avg_consult_time = 0
                
            result.append({
                "day": day,
                "avgConsultTime": avg_consult_time
            })
        
        return jsonify(result), 200
        
    except Exception as e:
        current_app.logger.exception(f"Error obteniendo tiempos de consulta por día: {e}")
        return jsonify({"message": f"Error interno: {str(e)}"}), 500


@dashboard_bp.route("/appointments-by-doctor", methods=["GET"])
@token_required
def get_appointments_by_doctor(current_user):
    """Endpoint para obtener número de citas por doctor."""
    try:
        
        month = request.args.get('month', type=int)
        year = request.args.get('year', type=int)
        
        if not month or not year:
            return jsonify({"message": "Se requieren los parámetros 'month' y 'year'"}), 400
            
        # Validar rango de mes
        if month < 1 or month > 12:
            return jsonify({"message": "El mes debe estar entre 1 y 12"}), 400
            
        # Calcular primer y último día del mes
        days_in_month = monthrange(year, month)[1]
        start_date = f"{year}-{month:02d}-01T00:00:00Z"
        end_date = f"{year}-{month:02d}-{days_in_month}T23:59:59Z"
        
        # Consultar citas en el mes con información del doctor
        appointments_query = supabase.table('appointments')\
            .select('id, doctor:doctors(id, name)')\
            .gte('appointment_time', start_date)\
            .lte('appointment_time', end_date)\
            .not_.is_('doctor_id', None)\
            .execute()
            
        if hasattr(appointments_query, 'error') and appointments_query.error:
            current_app.logger.error(f"Error en Supabase al consultar citas: {appointments_query.error}")
            return jsonify({"message": "Error al consultar datos de citas"}), 500
            
        appointments = appointments_query.data
        
        # Contar citas por doctor
        doctor_counts = {}
        
        for appointment in appointments:
            if appointment.get('doctor') and appointment['doctor'].get('id'):
                doctor_id = appointment['doctor']['id']
                doctor_name = appointment['doctor']['name']
                
                if doctor_id not in doctor_counts:
                    doctor_counts[doctor_id] = {
                        "doctorName": doctor_name,
                        "appointmentCount": 0
                    }
                
                doctor_counts[doctor_id]["appointmentCount"] += 1
        
        # Convertir a lista para la respuesta
        result = list(doctor_counts.values())
        
        return jsonify(result), 200
    
    
    except Exception as e:
        current_app.logger.exception(f"Error obteniendo citas por doctor: {e}")
        return jsonify({"message": f"Error interno: {str(e)}"}), 500
    
@dashboard_bp.route("/appointments-by-day", methods=["GET"])
@token_required
def get_appointments_by_day(current_user):
    """Endpoint para obtener número de citas por día."""
    try:
        month = request.args.get('month', type=int)
        year = request.args.get('year', type=int)

        if not month or not year:
            return jsonify({"message": "Se requieren los parámetros 'month' y 'year'"}), 400
        if month < 1 or month > 12:
            return jsonify({"message": "El mes debe estar entre 1 y 12"}), 400

        days_in_month = monthrange(year, month)[1]
        # Asegúrate que el formato coincida con tu columna y zona horaria
        start_dt = datetime(year, month, 1, tzinfo=timezone.utc)
        end_dt = datetime(year, month, days_in_month, 23, 59, 59, 999999, tzinfo=timezone.utc)
        start_date_str = start_dt.isoformat()
        end_date_str = end_dt.isoformat()


        # Consultar solo las fechas de las citas en el mes
        appointments_query = supabase.table('appointments')\
            .select('appointment_time')\
            .gte('appointment_time', start_date_str)\
            .lte('appointment_time', end_date_str)\
            .execute()

        if not hasattr(appointments_query, 'data'):
             error_details = getattr(appointments_query, 'error', 'Unknown Supabase error')
             current_app.logger.error(f"Error en Supabase al consultar citas por día: {error_details}")
             return jsonify({"message": "Error al consultar datos de citas"}), 500

        appointments = appointments_query.data
        daily_counts = Counter()
        for app in appointments:
            try:
                app_time = datetime.fromisoformat(app['appointment_time'])
                day = app_time.day
                daily_counts[day] += 1
            except (ValueError, TypeError, KeyError):
                 current_app.logger.warning(f"No se pudo procesar fecha: {app.get('appointment_time')}")
                 continue 

        
        result = []
        for day_num in range(1, days_in_month + 1):
            result.append({
                "day": day_num,
                "count": daily_counts.get(day_num, 0) 
            })

        return jsonify(result), 200

    except Exception as e:
        current_app.logger.exception(f"Error obteniendo citas por día: {e}")
        return jsonify({"message": "Error interno del servidor"}), 500