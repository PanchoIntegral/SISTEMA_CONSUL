# Decoradores personalizados

import functools
from flask import request, jsonify, current_app # Importar current_app para logger
from app.extensions import get_supabase # Importar el getter de Supabase

def token_required(f):
    """
    Decorador para verificar el token de autenticación de Supabase.
    El token debe venir en el header 'Authorization: Bearer <token>'
    """
    @functools.wraps(f)
    def decorated_function(*args, **kwargs):
        token = None
        supabase_client = get_supabase() # Obtener cliente Supabase

        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(" ")[1]
            except IndexError:
                current_app.logger.warning("Token mal formateado recibido.")
                return jsonify({"message": "Token inválido o mal formateado"}), 401

        if not token:
            current_app.logger.warning("Intento de acceso sin token.")
            return jsonify({"message": "Token de autorización faltante"}), 401

        try:
            user_response = supabase_client.auth.get_user(token)
            current_user = user_response.user
            if not current_user:
                 raise Exception("Token inválido o expirado (get_user devolvió None)")

            # Pasar el usuario autenticado a la función de la ruta
            kwargs['current_user'] = current_user

        except Exception as e:
            current_app.logger.error(f"Error de autenticación: {e}")
            return jsonify({"message": "Token inválido o expirado"}), 401

        return f(*args, **kwargs)
    return decorated_function
