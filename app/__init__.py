from flask import Flask
from flask_cors import CORS
from .config import Config
import logging
from .extensions import cors, init_supabase  # Asegúrate de importar cors desde extensions

def create_app(config_name=None):
    app = Flask(__name__)
    
    app.config.from_object(Config)

    # Configurar el logger
    app.logger.setLevel(logging.INFO)
    if not app.debug and not app.testing:
        if not app.logger.handlers:
            stream_handler = logging.StreamHandler()
            stream_handler.setFormatter(logging.Formatter(
                '%(asctime)s %(levelname)s %(name)s : %(message)s'
            ))
            app.logger.addHandler(stream_handler)

    app.logger.info("Flask App Logger Initialized")

    CORS(app, resources={
        r"/api/*": {
            "origins": ["http://localhost:5174", "http://127.0.0.1:5174"],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"]
        }
    })
    

    try:
        init_supabase(app.config['SUPABASE_URL'], app.config['SUPABASE_KEY'])
        app.logger.info("Supabase client initialized successfully via Factory.")
    except Exception as e:
        app.logger.error(f"Failed to initialize Supabase client: {e}")
        raise e

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
    
    # Endpoint global de health para el frontend
    @app.route('/api/v1/health', methods=['GET', 'OPTIONS'])
    def global_health():
        return {'status': 'ok'}, 200

    app.logger.info("Blueprints registered.")

    # Ruta raíz simple (opcional)
    @app.route('/')
    def index():
        return "API Backend Running!"

    return app
