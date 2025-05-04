from flask import request, jsonify, current_app
from . import auth_bp
from app.extensions import get_supabase
from app.utils.decorators import token_required

supabase = get_supabase()

@auth_bp.route("/login", methods=["POST"])
def login():
    """Endpoint para iniciar sesión."""
    try:
        data = request.get_json()
        if not data or not data.get('email') or not data.get('password'):
            return jsonify({"message": "Email y password requeridos"}), 400

        email = data.get('email')
        password = data.get('password')

        current_app.logger.info(f"Intento de login para email: {email}")
        auth_response = supabase.auth.sign_in_with_password({
            "email": email,
            "password": password
        })

        current_app.logger.info(f"Login exitoso para email: {email}, user ID: {auth_response.user.id}")
        return jsonify({
            "access_token": auth_response.session.access_token,
            "refresh_token": auth_response.session.refresh_token,
            "user": {
                "id": auth_response.user.id,
                "email": auth_response.user.email,
                "aud": auth_response.user.aud,
            }
        }), 200

    except Exception as e:
        current_app.logger.exception("Error en login")
        if hasattr(e, 'message') and ("Invalid login credentials" in e.message or "Email not confirmed" in e.message):
             return jsonify({"message": "Credenciales inválidas o email no confirmado"}), 401
        elif hasattr(e, 'status') and e.status == 400:
             return jsonify({"message": "Credenciales inválidas"}), 401
        return jsonify({"message": "Error en el servidor durante el login"}), 500


@auth_bp.route("/logout", methods=["POST"])
@token_required
def logout(current_user):
    """Endpoint para cerrar sesión."""
    try:
        token = request.headers['Authorization'].split(" ")[1]
        supabase.auth.sign_out(token)
        current_app.logger.info(f"Logout exitoso para user ID: {current_user.id}")
        return jsonify({"message": "Logout exitoso"}), 200
    except Exception as e:
        current_app.logger.exception("Error en logout")
        return jsonify({"message": "Error en el servidor durante el logout"}), 500


@auth_bp.route("/me", methods=["GET"])
@token_required
def get_me(current_user):
    """Endpoint para obtener datos del usuario autenticado."""
    current_app.logger.info(f"Solicitud /me para user ID: {current_user.id}")
    return jsonify({
        "id": current_user.id,
        "email": current_user.email,
        "aud": current_user.aud,
        "created_at": current_user.created_at,
    }), 200