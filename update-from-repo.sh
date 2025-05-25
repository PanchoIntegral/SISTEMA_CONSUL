#!/bin/bash

# Script para actualizar SISTEMA_CONSUL desde el repositorio
# Ejecutar cuando hagas cambios en tu código y quieras desplegar

set -e  # Salir si hay algún error

echo "🔄 Actualizando SISTEMA_CONSUL desde repositorio..."

# Variables
PROJECT_DIR="/opt/sistema-consul"
FRONTEND_DIR="$PROJECT_DIR/frontend"
BACKUP_DIR="/opt/sistema-consul-backup-$(date +%Y%m%d-%H%M%S)"

# Función para mostrar errores
error_exit() {
    echo "❌ Error: $1" >&2
    exit 1
}

# Verificar que estamos en el directorio correcto
if [ ! -d "$PROJECT_DIR" ]; then
    error_exit "El directorio $PROJECT_DIR no existe. Ejecuta primero deploy-script.sh"
fi

cd $PROJECT_DIR

# Verificar que es un repositorio git
if [ ! -d ".git" ]; then
    error_exit "Este directorio no es un repositorio git. Usa deploy-script.sh para configurar desde cero."
fi

# 1. Hacer backup de archivos de configuración
echo "💾 Haciendo backup de configuraciones..."
mkdir -p $BACKUP_DIR
cp .env $BACKUP_DIR/ 2>/dev/null || echo "⚠️  No se encontró .env"
cp frontend/.env.production $BACKUP_DIR/ 2>/dev/null || echo "⚠️  No se encontró frontend/.env.production"

# 2. Detener servicios
echo "⏹️  Deteniendo servicios..."
pm2 stop sistema-consul-backend 2>/dev/null || echo "Backend no estaba ejecutándose"

# 3. Actualizar código desde repositorio
echo "📥 Actualizando código desde repositorio..."
git fetch origin
git reset --hard origin/$(git branch --show-current)
git pull origin $(git branch --show-current)

# 4. Restaurar archivos de configuración
echo "🔧 Restaurando configuraciones..."
if [ -f "$BACKUP_DIR/.env" ]; then
    cp $BACKUP_DIR/.env .env
    echo "✅ Archivo .env restaurado"
else
    echo "⚠️  No se pudo restaurar .env - verifica la configuración"
fi

if [ -f "$BACKUP_DIR/.env.production" ]; then
    cp $BACKUP_DIR/.env.production frontend/.env.production
    echo "✅ Archivo frontend/.env.production restaurado"
else
    echo "⚠️  No se pudo restaurar frontend/.env.production - verifica la configuración"
fi

# 5. Actualizar dependencias del backend
echo "🐍 Actualizando dependencias del backend..."
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

# 6. Actualizar y compilar frontend
echo "🎨 Actualizando frontend..."
cd $FRONTEND_DIR
npm install
npm run build

# 7. Reiniciar servicios
echo "🔄 Reiniciando servicios..."
cd $PROJECT_DIR
pm2 start sistema-consul-backend 2>/dev/null || pm2 restart sistema-consul-backend

# Esperar un momento para que el servicio inicie
sleep 3

# 8. Verificar estado
echo "📊 Verificando estado de los servicios..."
pm2 status

# 9. Probar configuración de Nginx
echo "🌐 Verificando configuración de Nginx..."
sudo nginx -t

# 10. Recargar Nginx
sudo systemctl reload nginx

# 11. Limpiar backup si todo salió bien
echo "🧹 Limpiando archivos temporales..."
rm -rf $BACKUP_DIR

echo ""
echo "✅ Actualización completada!"
echo ""
echo "🌍 Tu aplicación actualizada está disponible en:"
echo "   http://167.99.24.105"
echo ""
echo "📋 Comandos útiles:"
echo "   pm2 logs sistema-consul-backend  - Ver logs del backend"
echo "   pm2 restart sistema-consul-backend - Reiniciar backend"
echo "   sudo systemctl status nginx - Ver estado de Nginx"
echo ""
echo "🔍 Si hay problemas, revisa los logs:"
echo "   pm2 logs"
echo "   sudo tail -f /var/log/nginx/sistema-consul.error.log" 