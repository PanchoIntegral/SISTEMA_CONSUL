# Fábrica de la aplicación Flask (Application Factory)

import logging
from flask import Flask, request, make_response, jsonify
from .config import Config # Importar la configuración
from .extensions import cors, init_supabase # Importar instancias/funciones de extensiones
from flask_cors import CORS

def create_app(config_class=Config):
    """Crea y configura una instancia de la aplicación Flask."""
    app = Flask(__name__)
    app.config.from_object(config_class) # Cargar configuración desde el objeto Config
    
    # Configuración adicional para CORS
    app.config['CORS_HEADERS'] = 'Content-Type,Authorization'

    # Configurar el logger
    app.logger.setLevel(logging.INFO)
    if not app.debug and not app.testing:
        # Configurar handlers (ej. StreamHandler) solo si no están ya configurados
        if not app.logger.handlers:
            stream_handler = logging.StreamHandler()
            stream_handler.setFormatter(logging.Formatter(
                '%(asctime)s %(levelname)s %(name)s : %(message)s'
            ))
            app.logger.addHandler(stream_handler)

    app.logger.info("Flask App Logger Initialized")

    # Configurar CORS a nivel global
    CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)
    # No usar la instancia previa de cors para evitar duplicación
    
    # Definir un manejador global para preflight OPTIONS
    @app.before_request
    def handle_preflight():
        if request.method == "OPTIONS":
            response = make_response()
            return response
    
    # Agregar un endpoint de health check con CORS habilitado
    @app.route("/api/v1/health", methods=["GET", "OPTIONS"])
    def health_check():
        if request.method == "OPTIONS":
            return make_response()
        return jsonify({"status": "ok", "message": "API funcionando correctamente"})
    
    try:
        init_supabase(app.config['SUPABASE_URL'], app.config['SUPABASE_KEY'])
        app.logger.info("Supabase client initialized successfully via Factory.")
    except Exception as e:
        app.logger.error(f"Failed to initialize Supabase client: {e}")
        # Decidir si la app debe fallar o continuar sin Supabase
        raise e # Fallar si Supabase es esencial

    # Registrar Blueprints
    # Importar Blueprints aquí para evitar importaciones circulares
    from .auth import auth_bp
    from .doctors import doctors_bp
    from .patients import patients_bp
    from .appointments import appointments_bp
    from .dashboard import dashboard_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(doctors_bp)
    app.register_blueprint(patients_bp)
    app.register_blueprint(appointments_bp)
    app.register_blueprint(dashboard_bp)

    app.logger.info("Blueprints registered.")

    # Ruta raíz simple (opcional)
    @app.route('/')
    def index():
        return "API Backend Running!"

    return app
