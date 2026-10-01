# Especificación del Proyecto: Sistema de Facturación e Inventario (On-Premise)

> **Contexto del Negocio:** Tienda de regalos personalizados (Referencia: https://www.instagram.com/papeleria_creativard/). 

---

## 1. Control de Ejecución (Directivas para el Agente AI)
- **Fase Activa:** Fase 1
- **Regla de IA:** Lee todo este documento para comprender la arquitectura y el contexto del sistema. Sin embargo, **debes generar código y estructurar archivos EXCLUSIVAMENTE para los objetivos de la "Fase Activa"**. Las fases posteriores proporcionan contexto de diseño a futuro, pero no deben programarse aún.

---

## 2. Visión General
Aplicación web local (on-premise) para la gestión de facturación, control de inventario y reportes. Debe soportar configuración multinegocio (marca blanca local) permitiendo personalizar el logo, nombre y colores para instalarse en otros negocios a futuro. Por el momento, NO generará comprobantes fiscales digitales (e-CF), pero dejará la estructura lista para ello.

## 3. Stack Tecnológico
- **Frontend:** React, Vite, Tailwind CSS, Zustand (estado global), React Router.
- **Backend:** Python, FastAPI, SQLAlchemy (ORM), Pydantic (Validación).
- **Base de Datos:** PostgreSQL.
- **Infraestructura:** Docker y Docker Compose (Despliegue unificado en Mac, Linux y Windows).
- **Pruebas:** Pytest (Backend), Vitest / React Testing Library (Frontend).
- **Calidad de Código:** Ruff (Python), ESLint + Prettier (React).

---

## 4. Modelos de Datos (Entidades Principales)
*Nota: Todas las entidades principales deben incluir un campo `is_active` o `deleted_at` para implementar Soft Deletes.*

### `StoreSettings` (Configuración de la Tienda)
- `id` (UUID, PK)
- `name` (String, ej. "Papelería Creativa RD")
- `logo_url` (String/Base64)
- `primary_color` (String, Hex)
- `currency` (String, default "DOP")
- `receipt_footer_text` (String)

### `User` (Usuarios y Roles)
- `id` (UUID, PK)
- `username` (String, Unique)
- `password_hash` (String)
- `role` (Enum: ADMIN, CASHIER)
- `is_active` (Boolean, default True)

### `Product` (Catálogo)
- `id` (UUID, PK)
- `sku` (String, Unique, Index)
- `name` (String)
- `description` (Text, Nullable)
- `price` (Decimal)
- `cost` (Decimal) /* Solo visible para ADMIN */
- `stock_quantity` (Integer, default 0)
- `min_stock_alert` (Integer, default 5)
- `is_active` (Boolean, default True)

### `Invoice` (Facturas)
- `id` (UUID, PK)
- `invoice_number` (String, Unique, Auto-incremental)
- `date` (DateTime, default NOW)
- `total_amount` (Decimal)
- `payment_method` (Enum: CASH, CARD, TRANSFER)
- `user_id` (UUID, FK -> User)
- `status` (Enum: PAID, CANCELLED)
- `idempotency_key` (String, Unique, Nullable)

### `InvoiceItem` (Detalle de Factura)
- `id` (UUID, PK)
- `invoice_id` (UUID, FK -> Invoice)
- `product_id` (UUID, FK -> Product)
- `quantity` (Integer)
- `unit_price` (Decimal)
- `subtotal` (Decimal)

### `InventoryTransaction` (Auditoría de Inventario)
- `id` (UUID, PK)
- `product_id` (UUID, FK -> Product)
- `type` (Enum: SALE, RETURN, MANUAL_IN, MANUAL_OUT)
- `quantity` (Integer) /* Positivo o negativo */
- `reference_id` (String, Nullable) /* Ej. ID de la factura */
- `date` (DateTime, default NOW)
- `user_id` (UUID, FK -> User)
- `notes` (String, Nullable)

---

## 5. Requisitos No Funcionales y Buenas Prácticas

- **Arquitectura de Software (DRY & Clean Code):** Uso del patrón de repositorios (Repository Pattern) en el backend para separar la lógica de negocio de las consultas a la base de datos.
- **Integridad de Datos (ACID):** Las operaciones de "Crear Factura" y "Descontar Inventario" deben ejecutarse en una única transacción de base de datos. Si una falla, se hace *rollback* de todo.
- **Evolución del Esquema:** Uso de `Alembic` para gestionar migraciones de base de datos de manera segura sin pérdida de información en equipos locales.
- **Soft Deletes (Borrado Lógico):** Prohibido el uso de `DELETE` físico en productos y usuarios para mantener intacta la reportería histórica.
- **Resiliencia UI/UX:** Implementar llaves de idempotencia (`idempotency keys`) al cobrar para prevenir facturas duplicadas si el usuario hace doble clic o la red local falla.
- **Seguridad:** 
  - Autenticación por JWT. Contraseñas hasheadas con `bcrypt`.
  - Rutas de frontend y endpoints de backend protegidos por roles (Admin vs Cajero).
  - SQLAlchemy para mitigar inyecciones SQL. Validación estricta con Pydantic.
- **Rendimiento:** Paginación estandarizada (`limit` y `offset`) en catálogos, inventarios y listados de facturas.
- **Observabilidad On-Premise:** Middleware en FastAPI para captura centralizada de errores. Rotación de logs locales en un archivo físico (`app.log`) guardando solo los últimos 30 días para auditoría técnica.

---

## 6. Estrategia de Pruebas
- **Unitarias Backend:** `Pytest` para cálculos de totales de facturas y lógica de deducción de stock.
- **Integración Backend:** Base de datos en memoria (SQLite) para probar el flujo de endpoints completo.
- **Frontend:** `Vitest` / `React Testing Library` para probar la lógica del carrito de compras (sumatorias, agregar/quitar ítems).

---

## 7. Plan de Ejecución Incremental (Fases)

### Fase 1: Prototipo Interactivo (Frontend Mock) - *[FASE ACTUAL]*
- Configurar el repositorio base (Vite + React + Tailwind + Zustand).
- Desarrollar vistas principales: Punto de Venta (POS), Dashboard de Reportes, Gestión de Inventario y Configuración.
- Integrar Zustand con datos estáticos (mock data) simulados.
- **Objetivo:** Entregar un diseño navegable 100% funcional visualmente para aprobación del cliente. (SIN BACKEND AÚN).

### Fase 2: Infraestructura y Base de Datos
- Configurar `docker-compose.yml` integrando PostgreSQL y el servicio backend (Python).
- Programar modelos de SQLAlchemy y configurar Alembic para migraciones.
- Implementar esquema de autenticación (JWT) y roles.
- **Objetivo:** Contenedores funcionales y esquema de base de datos desplegado correctamente.

### Fase 3: Integración, Lógica Transaccional y Testing
- Reemplazar mock data del frontend con llamadas reales a la API vía `fetch` o `axios`.
- Implementar la lógica ACID de facturación y movimientos de inventario en FastAPI.
- Escribir pruebas unitarias y de integración.
- **Objetivo:** Flujo completo de venta, actualización de inventario en tiempo real y reportes reales.

### Fase 4: Preparación On-Premise (Despliegue Local)
- Implementar scripts/tareas programadas para respaldos (`.sql`) automáticos locales.
- Configurar rotación de logs.
- Integrar bibliotecas (`react-to-print` o `@react-pdf/renderer`) para la generación de facturas térmicas y PDF.
- **Objetivo:** Sistema empaquetado, seguro, con backups automáticos y listo para instalarse en Windows, Mac o Linux.