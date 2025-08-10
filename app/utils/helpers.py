# Funciones auxiliares

from datetime import datetime, timezone, timedelta
try:
    from zoneinfo import ZoneInfo
except ImportError:
    # Fallback for Python < 3.9 or systems without zoneinfo
    try:
        from backports.zoneinfo import ZoneInfo
    except ImportError:
        ZoneInfo = None

from flask import current_app # Importar current_app para logger

def get_tijuana_timezone():
    """Retorna la zona horaria de Tijuana, BC, México (America/Tijuana)."""
    if ZoneInfo:
        try:
            return ZoneInfo("America/Tijuana")
        except Exception as e:
            current_app.logger.warning(f"No se pudo cargar timezone America/Tijuana: {e}")
    
    # Fallback: Tijuana sigue el horario del Pacífico
    # Aproximación simple para horario de verano (segundo domingo de marzo a primer domingo de noviembre)
    import datetime as dt
    now_utc = dt.datetime.now(timezone.utc)
    year = now_utc.year
    
    # Calcular inicio del horario de verano (segundo domingo de marzo)
    march = dt.date(year, 3, 1)
    days_until_sunday = (6 - march.weekday()) % 7
    first_sunday_march = march + dt.timedelta(days=days_until_sunday)
    dst_start = first_sunday_march + dt.timedelta(days=7)  # Segundo domingo
    
    # Calcular fin del horario de verano (primer domingo de noviembre)
    november = dt.date(year, 11, 1)
    days_until_sunday = (6 - november.weekday()) % 7
    dst_end = november + dt.timedelta(days=days_until_sunday)
    
    current_date = now_utc.date()
    
    if dst_start <= current_date < dst_end:
        # Horario de verano: UTC-7
        current_app.logger.info("Usando fallback UTC-7 para zona horaria de Tijuana (horario de verano)")
        return timezone(timedelta(hours=-7))
    else:
        # Horario estándar: UTC-8
        current_app.logger.info("Usando fallback UTC-8 para zona horaria de Tijuana (horario estándar)")
        return timezone(timedelta(hours=-8))

def get_current_time_tijuana():
    """Retorna la fecha y hora actual en la zona horaria de Tijuana."""
    tijuana_tz = get_tijuana_timezone()
    return datetime.now(tijuana_tz)

def get_current_date_tijuana():
    """Retorna la fecha actual en la zona horaria de Tijuana."""
    return get_current_time_tijuana().date()

def get_shift_from_time(appointment_time_str: str) -> str:
    """
    Determina el turno (mañana o tarde) basado en la hora de la cita.
    Turno Mañana: 9:00 AM - 3:00 PM (15:00)
    Turno Tarde: 4:00 PM - 9:00 PM (21:00)
    """
    try:
        # Parsear la hora de la cita
        appointment_dt = datetime.fromisoformat(appointment_time_str.replace('Z', '+00:00'))
        
        # Convertir a zona horaria de Tijuana para obtener la hora local
        tijuana_tz = get_tijuana_timezone()
        local_time = appointment_dt.astimezone(tijuana_tz)
        
        # Extraer la hora (0-23)
        hour = local_time.hour
        
        # Determinar turno
        if 9 <= hour < 15:  # 9:00 AM - 2:59 PM
            return "mañana"
        elif 16 <= hour < 21:  # 4:00 PM - 8:59 PM  
            return "tarde"
        else:
            return "fuera_horario"  # Para citas fuera del horario normal
            
    except Exception as e:
        current_app.logger.error(f"Error determinando turno para hora {appointment_time_str}: {e}")
        return "indeterminado"

def filter_appointments_by_shift(appointments: list, shift: str) -> list:
    """
    Filtra las citas por turno (mañana/tarde).
    
    Args:
        appointments: Lista de citas
        shift: 'mañana', 'tarde', o 'todos'
    
    Returns:
        Lista filtrada de citas
    """
    if not appointments or shift == "todos" or not shift:
        return appointments
    
    filtered_appointments = []
    for appointment in appointments:
        appointment_time = appointment.get('appointment_time')
        if appointment_time:
            appointment_shift = get_shift_from_time(appointment_time)
            if appointment_shift == shift:
                filtered_appointments.append(appointment)
    
    return filtered_appointments

def calculate_durations(appointment_data: dict) -> dict:
    """Calcula tiempos de espera y consulta si los timestamps existen."""
    wait_seconds = None
    consult_seconds = None

    try:
        arrival_str = appointment_data.get('arrival_time')
        start_str = appointment_data.get('consultation_start_time')
        end_str = appointment_data.get('consultation_end_time')

        if arrival_str and start_str:
            arrival = datetime.fromisoformat(arrival_str).astimezone(timezone.utc)
            start = datetime.fromisoformat(start_str).astimezone(timezone.utc)
            if start >= arrival:
                wait_seconds = int((start - arrival).total_seconds())
            else:
                current_app.logger.warning(f"Tiempo de inicio de consulta anterior a llegada para cita {appointment_data.get('id')}")

        if start_str and end_str:
            start = datetime.fromisoformat(start_str).astimezone(timezone.utc)
            end = datetime.fromisoformat(end_str).astimezone(timezone.utc)
            if end >= start:
                consult_seconds = int((end - start).total_seconds())
            else:
                 current_app.logger.warning(f"Tiempo de fin de consulta anterior a inicio para cita {appointment_data.get('id')}")

    except Exception as e:
        current_app.logger.error(f"Error calculando duraciones para cita {appointment_data.get('id')}: {e}")

    appointment_data['calculated_wait_time_seconds'] = wait_seconds
    appointment_data['calculated_consultation_time_seconds'] = consult_seconds
    return appointment_data