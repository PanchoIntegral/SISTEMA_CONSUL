# HealthFlow — Documentación de arquitectura y endpoints

Este documento describe la arquitectura, módulos, endpoints y uso del proyecto "HealthFlow" (Backend Flask + Frontend Vue 3 + Supabase).

## Índice
- Arquitectura general
- Endpoints del backend (resumen por módulo)
- Frontend (vistas, stores y servicios)
- Variables de entorno requeridas
- Casos de uso principales y validaciones
- Riesgos y recomendaciones
- Diagrama lógico (texto)
- Ejemplos curl

## Arquitectura general

- Tipo: Aplicación full-stack (SPA + API REST).
- Backend: Flask con patrón Application Factory en [app/__init__.py](app/__init__.py#L1). Punto de entrada: [run.py](run.py#L1).
- Frontend: Vue 3 (Vite) + Pinia. Punto de entrada: [frontend/src/main.js](frontend/src/main.js#L1).
- Persistencia y Auth: Supabase (cliente global inicializado en [app/extensions.py](app/extensions.py#L1)).
- Blueprints backend: `auth`, `doctors`, `patients`, `appointments`, `dashboard` (cada uno en `app/<module>/`).
- Autorización: tokens Supabase verificados en backend con el decorador `@token_required` ([app/utils/decorators.py](app/utils/decorators.py#L1)).
- Utilidades: zona horaria y cálculos en [app/utils/helpers.py](app/utils/helpers.py#L1).

## Endpoints del backend (resumen por módulo)

> Todas las rutas se exponen bajo `/api/v1/` a través de Blueprints.

### Auth ([app/auth/routes.py](app/auth/routes.py#L1))
- POST `/api/v1/auth/login`
  - Body: `{ email, password }`.
  - Comportamiento: delega en Supabase, devuelve `access_token`, `refresh_token` y `user`.
- POST `/api/v1/auth/logout`
  - Requiere `Authorization` header (Bearer). Cierra sesión en Supabase.
- GET `/api/v1/auth/me`
  - Devuelve datos del usuario autenticado (ID, email, created_at).

### Appointments ([app/appointments/routes.py](app/appointments/routes.py#L1))
- POST `/api/v1/appointments`
  - Crear cita. Body mínimo: `{ patient_id, appointment_time }`.
  - Validaciones: ISO8601, no en días pasados (zona America/Tijuana), margen de 12 horas si es la misma fecha, verifica disponibilidad del doctor (±1 minuto).
  - Respuestas: 201 creado, 400 validación, 409 conflicto doctor.
- GET `/api/v1/appointments`
  - Parámetros: `date=YYYY-MM-DD`, `status`, `doctor_id`, `patient_name`, `shift` (`mañana`/`tarde`), `exclude_statuses[]`, `include_statuses[]`, `sort_by`, `sort_dir`.
  - Devuelve lista de citas con campos calculados (`calculated_wait_time_seconds`, `calculated_consultation_time_seconds`) y `is_recurring_patient`.
- GET `/api/v1/appointments/<id>`
  - Obtiene cita por ID.
- PUT `/api/v1/appointments/<id>`
  - Actualiza campos: `doctor_id`, `appointment_time`, `notes`, `medical_process_tag`, `status`.
  - Maneja transiciones válidas de estado y registra timestamps (`arrival_time`, `consultation_start_time`, `consultation_end_time`). Verifica disponibilidad del doctor al cambiar hora/doctor.
- DELETE `/api/v1/appointments/<id>`
  - Elimina una cita (204 o 404).

### Patients ([app/patients/routes.py](app/patients/routes.py#L1))
- POST `/api/v1/patients` — Crear paciente; valida duplicados exactos (`name`, `contact_info`, `date_of_birth`).
- GET `/api/v1/patients` — Listado paginado: `page`, `page_size`, `search`.
- GET/PUT/DELETE `/api/v1/patients/<id>` — Obtener, actualizar (verifica duplicado) y eliminar.

### Doctors ([app/doctors/routes.py](app/doctors/routes.py#L1))
- GET `/api/v1/doctors` — Lista doctores.
- POST `/api/v1/doctors/blocked-days` — Bloquear día para doctor: `{ doctor_id, blocked_date, reason? }`.
- GET `/api/v1/doctors/blocked-days?doctor_id=...` — Días bloqueados futuros.
- DELETE `/api/v1/doctors/blocked-days/<id>` — Eliminar día bloqueado.

### Dashboard ([app/dashboard/routes.py](app/dashboard/routes.py#L1))
- GET `/api/v1/dashboard/stats?month=&year=` — Totales y tiempos promedio.
- GET `/api/v1/dashboard/wait-time?month=&year=` — Tiempo de espera por día.
- GET `/api/v1/dashboard/consult-time?month=&year=` — Tiempo de consulta por día.
- GET `/api/v1/dashboard/appointments-by-doctor?month=&year=` — Conteo por doctor.
- GET `/api/v1/dashboard/appointments-by-day?month=&year=` — Conteo por día.
- GET `/api/v1/dashboard/doctors-details?month=&year=` — Detalles de doctores y sus citas.
- GET `/api/v1/dashboard/appointments-summary?month=&year=` — Resumen detallado de citas.

## Frontend (vistas, stores y servicios)

- Punto de entrada: [frontend/src/main.js](frontend/src/main.js#L1).
- Router: [frontend/src/router/index.js](frontend/src/router/index.js#L1) — protege rutas y redirige según estado de sesión.
- Cliente Supabase: [frontend/src/supabaseClient.js](frontend/src/supabaseClient.js#L1).
- API Client (Axios): [frontend/src/services/apiClient.js](frontend/src/services/apiClient.js#L1) — añade `Authorization` header, maneja refresh de token con `supabase.auth.refreshSession()` en 401.
- Servicios específicos: `apiAuthService.js`, `apiAppointmentsService.js` (formatos y manejo de arrays en query params), etc.
- Stores (Pinia):
  - `auth` ([frontend/src/stores/auth.js](frontend/src/stores/auth.js#L1)) — gestiona sesión y token en localStorage.
  - `appointments` ([frontend/src/stores/appointments.js](frontend/src/stores/appointments.js#L1)) — fetch por fecha, filtros locales (estado, doctor, paciente, turno), ordenamiento y operaciones optimistas.
  - `patients`, `doctors`, `dashboard` — stores de apoyo.
- Vistas destacadas: `LoginView.vue`, `AppointmentsView.vue`, `PatientsView.vue`, `DashboardView.vue`, `BlockedDaysView.vue`.

## Variables de entorno requeridas

- Backend (`.env`):
  - `SUPABASE_URL`
  - `SUPABASE_KEY` (requerido por [app/config.py](app/config.py#L1))
  - `SECRET_KEY` (opcional)
  - `PORT`, `FLASK_DEBUG` (opcionales)

- Frontend (Vite `.env`):
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_KEY`
  - `VITE_API_BASE_URL` (ej. `http://127.0.0.1:5000/api/v1`)

## Casos de uso principales y validaciones

1) Login
  - Frontend POST `/api/v1/auth/login` con `{ email, password }` -> guarda `access_token` y `refresh_token` en `authStore`.
  - Reintento de refresh: `apiClient` intenta `supabase.auth.refreshSession()` en 401.

2) Crear cita
  - Frontend POST `/api/v1/appointments` con `{ patient_id, appointment_time, doctor_id? }`.
  - Backend valida: formato ISO, no programar en fecha pasada (zona Tijuana), si es el mismo día la hora no puede ser muy anterior (margen 12h), conflicto de doctor (±1 minuto) -> 409 con `error_type: doctor_unavailable`.

3) Actualizar estado (llegada/inicio/fin)
  - PUT `/api/v1/appointments/<id>` con `status` cambia timestamps automáticamente (ej. `arrival_time` al pasar a `En Espera`, `consultation_start_time` al pasar a `En Consulta`, etc.).
  - Transiciones validadas contra tabla `allowed_transitions` en backend.

4) Gestión de pacientes
  - Crear/actualizar valida duplicados exactos por `name`, `contact_info`, `date_of_birth`.

5) Bloquear días para doctores
  - POST `/api/v1/doctors/blocked-days` con `{ doctor_id, blocked_date }`.

6) Reportes
  - Dashboard solicita datos por `month`/`year` y backend calcula rangos (inicio/fin mes) y métricas.

## Riesgos y recomendaciones

- Seguridad
  - No exponer `SUPABASE_KEY` de servicio en el frontend. Usar sólo keys públicas en frontend (`anon key`) y roles adecuados en Supabase.
  - Asegurar HTTPS en producción.

- Tokens/Refresh
  - Revisar y asegurar el flujo de refresh tokens (el front intenta refresh con supabase-js; decidir centralizar refresh en backend si se requiere mayor control).

- Validaciones y pruebas
  - Añadir tests unitarios e integración para endpoints críticos (citas, transiciones de estado, detección de duplicados).

- Escalabilidad
  - Si el volumen de citas crece, mover más filtros al backend y agregar paginación/limit en `/appointments`.

## Diagrama lógico (texto)

Usuario -> Frontend (Vue) -> Backend Flask (API) -> Supabase (Auth + Postgres)

- Flujo auth: Usuario -> `/auth/login` -> Supabase -> tokens -> Frontend guarda token -> Frontend llama API con `Authorization` -> Backend valida con Supabase.
- Flujo datos: Frontend solicita recursos -> Backend consulta Supabase (tablas `appointments`, `patients`, `doctors`, `doctor_blocked_days`) -> Backend aplica lógica y responde.

## Ejemplos curl

- Login:

```bash
curl -X POST "http://127.0.0.1:5000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"usuario@example.com","password":"tu-password"}'
```

- Crear cita (ejemplo con token):

```bash
curl -X POST "http://127.0.0.1:5000/api/v1/appointments" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -d '{"patient_id": 123, "doctor_id": 45, "appointment_time": "2025-12-20T16:30:00Z", "notes": "Consulta general"}'
```

---

Si deseas, puedo:
- Generar `DOCS/ENDPOINTS.md` con ejemplos detallados de request/response por endpoint.
- Añadir diagramas `mermaid` o ASCII.
- Crear tests básicos para endpoints críticos.

Indica la siguiente acción que prefieres.
