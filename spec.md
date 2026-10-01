# Especificación del Proyecto: Sistema de Facturación e Inventario (Desktop App)

> **Contexto del Negocio:** Tienda de regalos personalizados (Referencia: https://www.instagram.com/papeleria_creativard/). 

---

## 1. Control de Ejecución (Directivas para el Agente AI)
- **Fase Activa:** Fase 1
- **Regla de IA:** Lee todo este documento para comprender la arquitectura y el contexto del sistema. Sin embargo, **debes generar código y estructurar archivos EXCLUSIVAMENTE para los objetivos de la "Fase Activa"**. Las fases posteriores proporcionan contexto de diseño a futuro, pero no deben programarse aún.

---

## 2. Visión General
Aplicación de escritorio nativa (Desktop App) para la gestión de facturación, control de inventario y reportes en una **única terminal (PC)**. Al basarse en Electron, se instala con un simple doble clic (sin contenedores ni configuraciones de red). Debe soportar configuración multinegocio (marca blanca local) permitiendo personalizar el logo, nombre y colores. Por el momento, NO generará comprobantes fiscales digitales (e-CF), pero dejará la estructura lista para ello.

## 3. Stack Tecnológico
- **Frontend (Renderer Process):** React, Vite, Tailwind CSS, Zustand (estado global), React Router.
- **Backend (Main Process):** Node.js (nativo de Electron).
- **Base de Datos:** SQLite (archivo local único).
- **ORM:** Prisma o Drizzle ORM.
- **Empaquetado y Distribución:** Electron Builder (genera `.exe`, `.dmg`, `.AppImage`).
- **Comunicación:** Electron IPC (Inter-Process Communication) en lugar de peticiones HTTP/REST.
- **Pruebas:** Vitest (lógica) y Playwright (E2E para la app empaquetada).

---

## 4. Modelos de Datos (Entidades Principales)
*Nota: Todas las entidades principales deben incluir un campo `is_active` o `deleted_at` para implementar Soft Deletes.*

### `StoreSettings` (Configuración de la Tienda)
- `id` (UUID o CUID, PK)
- `name` (String, ej. "Papelería Creativa RD")
- `logo_url` (String/Base64)
- `primary_color` (String, Hex)
- `currency` (String, default "DOP")
- `receipt_footer_text` (String)

### `User` (Usuarios y Roles)
- `id` (UUID o CUID, PK)
- `username` (String, Unique)
- `password_hash` (String)
- `role` (String Enum: ADMIN, CASHIER)
- `is_active` (Boolean, default True)

### `Product` (Catálogo)
- `id` (UUID o CUID, PK)
- `sku` (String, Unique, Index)
- `name` (String)
- `description` (Text, Nullable)
- `price` (Decimal/Float)
- `cost` (Decimal/Float) /* Solo visible para ADMIN */
- `stock_quantity` (Integer, default 0)
- `min_stock_alert` (Integer, default 5)
- `is_active` (Boolean, default True)

### `Invoice` (Facturas)
- `id` (UUID o CUID, PK)
- `invoice_number` (String, Unique, Auto-incremental)
- `date` (DateTime, default NOW)
- `total_amount` (Decimal/Float)
- `payment_method` (String Enum: CASH, CARD, TRANSFER)
- `user_id` (UUID, FK -> User)
- `status` (String Enum: PAID, CANCELLED)
- `idempotency_key` (String, Unique, Nullable)

### `InvoiceItem` (Detalle de Factura)
- `id` (UUID o CUID, PK)
- `invoice_id` (UUID, FK -> Invoice)
- `product_id` (UUID, FK -> Product)
- `quantity` (Integer)
- `unit_price` (Decimal/Float)
- `subtotal` (Decimal/Float)

### `InventoryTransaction` (Auditoría de Inventario)
- `id` (UUID o CUID, PK)
- `product_id` (UUID, FK -> Product)
- `type` (String Enum: SALE, RETURN, MANUAL_IN, MANUAL_OUT)
- `quantity` (Integer) /* Positivo o negativo */
- `reference_id` (String, Nullable) /* Ej. ID de la factura */
- `date` (DateTime, default NOW)
- `user_id` (UUID, FK -> User)
- `notes` (String, Nullable)

---

## 5. Requisitos No Funcionales y Buenas Prácticas

- **Comunicación IPC Segura:** El frontend (React) no tiene acceso directo a la base de datos ni a Node.js. Toda comunicación debe hacerse a través de `contextBridge` mediante canales IPC seguros predefinidos en `preload.js`.
- **Integridad de Datos (ACID):** Las operaciones de "Crear Factura" y "Descontar Inventario" deben ejecutarse en una única transacción ($transaction en Prisma/Drizzle). Si una falla, se hace *rollback* de todo.
- **Evolución del Esquema:** Uso del sistema de migraciones del ORM elegido para actualizar la base de datos local en las futuras actualizaciones de la aplicación sin borrar datos.
- **Backups Triviales:** Implementar una función en el menú de la aplicación que permita al usuario "Exportar Copia de Seguridad", lo cual simplemente copiará el archivo `.db` de SQLite a una carpeta segura o USB.
- **Soft Deletes (Borrado Lógico):** Prohibido el uso de `DELETE` físico en productos y usuarios para mantener intacta la reportería histórica.
- **Resiliencia UI/UX:** Implementar llaves de idempotencia (`idempotency keys`) al cobrar para prevenir facturas duplicadas por clics múltiples.
- **Integración de Hardware Nativas:** Al usar Electron, la impresión térmica y la lectura de códigos de barras (que actúan como teclados USB) deben procesarse de forma nativa sin depender de diálogos del navegador.

---

## 6. Plan de Ejecución Incremental (Fases)

### Fase 1: Prototipo Interactivo (Frontend Mock) - *[FASE ACTUAL]*
- Configurar el repositorio base (Electron + React + Vite).
- Desarrollar vistas principales: Punto de Venta (POS), Dashboard de Reportes, Gestión de Inventario y Configuración.
- Integrar Zustand con datos estáticos (mock data) simulados.
- **Objetivo:** Entregar un diseño navegable 100% funcional visualmente, empaquetado como aplicación de escritorio de prueba para la aprobación del cliente. (Sin base de datos real aún).

### Fase 2: Configuración del Motor de Base de Datos
- Integrar SQLite y configurar el ORM (Prisma o Drizzle) en el *Main Process* de Electron.
- Crear las migraciones iniciales para construir el esquema de la base de datos.
- Configurar el `preload.js` y el `contextBridge` para exponer canales IPC de consulta y mutación.
- **Objetivo:** Backend local (Main Process) operativo y conectado a un archivo `app.db` persistente.

### Fase 3: Integración y Lógica Transaccional
- Reemplazar mock data del frontend (Zustand) con llamadas a través de IPC (ej. `window.api.getProducts()`).
- Implementar la lógica ACID de facturación y movimientos de inventario en Node.js.
- **Objetivo:** Flujo completo de venta, actualización de inventario en tiempo real y persistencia local garantizada.

### Fase 4: Periféricos y Empaquetado Final
- Implementar el módulo de impresión silenciosa (silent printing) en Electron para enviar tickets directamente a la impresora térmica POS.
- Configurar el menú nativo de la ventana (Archivo -> Respaldar Base de Datos).
- Configurar `electron-builder` para generar instaladores finales (`.exe` y `.dmg`).
- **Objetivo:** Aplicación instalable, lista para producción y conectada al hardware del mostrador.