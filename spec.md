# Especificación del Proyecto: Sistema de Facturación e Inventario (Desktop App)

> **Contexto del Negocio:** Tienda de regalos personalizados (Referencia: https://www.instagram.com/papeleria_creativard/). 

---

## 1. Control de Ejecución (Directivas para el Agente AI)
- **Fase Activa:** Fase 6
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

### `Product` (Catálogo e Insumos)
- `id` (UUID o CUID, PK)
- `sku` (String, Unique, Index)
- `name` (String)
- `description` (Text, Nullable)
- `type` (String Enum: STANDARD, MATERIAL, SERVICE, COMPOSITE) 
  /* MATERIAL: Insumos (madera, tinta). SERVICE: No maneja stock (grabado). COMPOSITE: Ensamblado basado en receta. STANDARD: Producto regular (un peluche). */
- `manage_stock` (Boolean, default True) /* False para servicios */
- `price` (Decimal/Float) /* Precio de venta al público */
- `cost` (Decimal/Float) /* Costo dinámico si es COMPOSITE, fijo si es MATERIAL/STANDARD */
- `stock_quantity` (Decimal/Float, default 0) /* Decimal para permitir 0.5 planchas */
- `min_stock_alert` (Decimal/Float, default 5)
- `location` (String, Nullable) /* Ubicación o estante en el almacén */
- `is_active` (Boolean, default True)

### `ProductRecipe` (Receta de Producción / Bill of Materials)
- `id` (UUID o CUID, PK)
- `composite_product_id` (UUID, FK -> Product) /* El producto que se va a vender */
- `component_product_id` (UUID, FK -> Product) /* El insumo o servicio utilizado */
- `quantity` (Decimal/Float) /* Ej. 0.5 planchas de madera */

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
- `quantity` (Decimal/Float)
- `unit_price` (Decimal/Float)
- `subtotal` (Decimal/Float)

### `InventoryTransaction` (Auditoría de Inventario)
- `id` (UUID o CUID, PK)
- `product_id` (UUID, FK -> Product)
- `type` (String Enum: SALE, RETURN, MANUAL_IN, MANUAL_OUT)
- `quantity` (Decimal/Float) /* Positivo o negativo */
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
- **Arquitectura Desacoplada (Service Layer):** La lógica de negocio (consultas a base de datos, transacciones) debe estar aislada en servicios independientes (ej. `services/`), sin depender directamente de Electron. Los handlers IPC solo deben actuar como controladores que conectan con estos servicios, permitiendo una fácil migración a un backend web en el futuro.

---

## 6. Plan de Ejecución Incremental (Fases)

### Fase 1: Prototipo Interactivo (Frontend Mock)
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
### Fase 5: Reportes, Auditoría y Autenticación
- Integrar la Pantalla de Login al flujo principal para restringir el acceso al sistema mediante autenticación (validación de `username` y `password_hash` del modelo `User`).
- Implementar el Dashboard de Reportes (mencionado en Fase 1) con consultas SQL agregadas para visualizar la situación general del negocio.
- Desarrollar módulo de Ganancias y Pérdidas: calcular el costo de los bienes vendidos (COGS) frente a las ventas (usando el campo `cost` reservado para ADMIN).
- Crear el reporte del estado de inventario: productos con bajo stock (`min_stock_alert`), valorizaciones del inventario, y auditoría histórica (`InventoryTransaction`).
- Aprovechar los registros de Soft Deletes para garantizar que la reportería histórica (productos y usuarios borrados) sea precisa y no cause errores referenciales.
- **Objetivo:** Brindar a los administradores una vista analítica clara de las finanzas y asegurar el acceso al sistema únicamente a personal autorizado.

### Fase 6: Inventario de Producción y Recetas (Bill of Materials) - *[FASE ACTUAL]*
- Modificar el esquema de la base de datos para soportar tipos de productos (`MATERIAL`, `SERVICE`, `COMPOSITE`) y cantidades fraccionales (`Decimal`).
- Crear el modelo `ProductRecipe` para enlazar productos compuestos con sus insumos.
- Desarrollar una interfaz en React para que el Admin pueda crear "Recetas" (ej. Placa = 0.5 Madera + 1 Grabado).
- Actualizar la lógica transaccional de facturación: al vender un producto `COMPOSITE`, el sistema debe iterar sobre su receta y deducir automáticamente el stock de los materiales correspondientes, ignorando los que sean `SERVICE`.
- Calcular el `cost` de los productos `COMPOSITE` dinámicamente sumando el costo de sus materiales.
