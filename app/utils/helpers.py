# Funciones auxiliares

from datetime import datetime, timezone
from flask import current_app # Importar current_app para logger

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