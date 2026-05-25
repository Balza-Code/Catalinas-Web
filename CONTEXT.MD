# CONTEXT

## Objetivo del Proyecto
Catalina's Web es una aplicación full stack para gestionar pedidos, roles y ventas de productos artesanales con panel de administración y experiencia de cliente.

## Stack Tecnológico
- Lenguajes: JavaScript, HTML, CSS
- Frontend: React 19 + Vite
- UI: Tailwind CSS
- Backend: Node.js, Express.js
- Base de datos: MongoDB / Mongoose
- Autenticación: JSON Web Tokens (JWT)
- Carga de archivos: Multer + Cloudinary
- Herramientas adicionales: ESLint, React Router Dom, Recharts

## Arquitectura
- `src/`: frontend React
  - `components/`: componentes UI reutilizables y secciones de panel
  - `pages/`: rutas principales (Login, Registro, Historial, Venta al Detal, etc.)
  - `context/`: `AuthContext`, `ModalContext`
  - `hooks/`: hooks personalizados (`useAdmin`, `useCatalinas`, `useOrders`)
  - `services/`: llamadas a API y servicios HTTP
  - `layout/`: layouts específicos para admin y cliente
- `backend/`: servidor Express
  - `controllers/`: lógica de negocio para auth, admin, catalinas y pedidos
  - `middleware/`: autenticación y autorización
  - `models/`: esquemas de MongoDB para usuario, orden, catalina
  - `routers/`: rutas REST (`authRoutes`, `catalinaRoutes`, `orderRoutes`, `adminRoutes`)
- Flujo de datos principal
  1. El usuario se autentica en el frontend mediante `AuthContext`.
  2. El frontend consume `/api/auth`, `/api/catalinas`, `/api/orders` y `/api/admin`.
  3. El backend valida JWT, accede a MongoDB y responde con JSON.
  4. El estado global se administra con hooks y context, y las rutas protegidas se renderizan según el rol.

## Estado Actual
- Autenticación básica con inicio de sesión y logout.
- Soporte de roles `admin` y `cliente` para mostrar dashboards distintos.
- Rutas protegidas y separación de layouts.
- CRUD de productos (`catalinas`) y gestión de pedidos desde backend.
- Estructura de API REST con rutas montadas en `/api/auth`, `/api/catalinas`, `/api/orders`, `/api/admin`, `/api/expenses`.
- Frontend organizado con componentes, páginas y servicios dedicados.
- Soporte completo y experiencia fluida en dispositivos móviles con menús de navegación adaptados (Mobile Bottom Nav, Sidebars móviles).
- Dashboard financiero avanzado con reportes de períodos y matemáticas de reinversión vs ganancias netas.
- Módulo avanzado de Flujo de Caja (Egresos) con conversión nativa a 3 cajones: Efectivo USD, Efectivo Bs, Digital.
- Sistema de historial de gastos con funcionalidad para revertir extracciones compensando cajas automáticamente, topes visuales interactivos y atajos de 1-Click Nómina en el Form.
- Gestión Avanzada de Recetas (Calculadora 2.0): Sistema dinámico con persistencia MongoDB para crear recetarios, segmentar matemática de producción (Masa vs Melado Madre), configurar unidades vs empaques y calcular simultáneamente el Margen Neto y el Marcaje sobre Costo en tarjeta Bento Grid, todo unificado a la coleccion de Catálogado de Catalinas.
- Despliegue optimizado en producción (Render).
- Fase 8 (Producción) Completada: Módulo de control de tandas de horneado refactorizado con arquitectura limpia (Capa de Servicios) y UI optimizada en Tailwind. Actualiza el inventario en tiempo real.
- Evolución Omnicanal (POS 2.0): El Punto de Venta pasó de ser solo para ventas presenciales a ser el "Centro de Mando Maestro". Permite asignar clientes, deudas y estados de entrega sin cerrar sesión, ideal para pedidos por WhatsApp.
- Optimización UX Diaria: El GeneralDashboard fue transformado en un "Action Center" (métricas de urgencia diaria en lugar de históricos), y el Formulario de Gastos se extrajo a un Modal Global en el Header para acceso inmediato desde cualquier pantalla.

## Logros Recientes
- Refactorización de Producción y control de tandas con actualización de inventario en tiempo real.
- POS transformado en Centro de Mando de Ventas Omnicanal con cliente, estado y deuda sin salir de sesión.
- GeneralDashboard renovado como Action Center y ExpenseForm convertido en modal global accesible desde el header.
- Rediseño Operativo UX (Fase 12 completada): Transición exitosa de tablas planas a Vistas Ágiles. Se implementó un Tablero de Despacho (Kanban/Tabs) con acciones Zero-Click. El CRM incluye píldoras reactivas de filtrado y el módulo de gastos se globalizó en el Header.
- Implementación del Clean UI Design System (Fase 12.5): Se erradicó el CSS duro antiguo en favor de "Tokens Semánticos" en Tailwind (`surface-bg`, `brand-600`, etc.), y se corrigieron los z-index y overflow de toda la app (Sidebars fijos, headers persistentes y modales funcionales).
- Reinvención de la Landing Page B2B: El Home.jsx se transformó en una página estilo SaaS moderna, orientada visualmente a convencer a bodegueros y minoristas.
- Unificación Arquitectónica de Tienda: Se eliminaron 3 componentes obsoletos (`OrderSection.jsx`, `VentaDetalForm.jsx`, `VentaAlDetalPage.jsx`), clonando la potente UI del POS en un nuevo y seguro `CustomerStorefront.jsx` para los clientes.
- Inteligencia de Negocio y Proyecciones (Fase 13 completada): El Dashboard Financiero ahora automatiza la subdivisión de Ganancia Neta Libre.
- Manufactura Predictiva: El Control de Producción proyecta "Valor en Horno" y "Margen Estimado", calculando "Merma vs Excedente".

## Fase 1 (Inteligencia Financiera)
- [x] Implementada: modelo con `costoProduccion`, controlador de estadísticas, Dashboard Financiero y meta dinámica persistida en `Setting`.

## Fase 3 (Control de Cobranza / Mini CRM Base)
- [x] Backend: Endpoint en adminRoutes con Aggregation Pipeline que cruce Usuarios y Pedidos para calcular el "Saldo Deudor" (Total - Pagado). (También logramos que Mongoose permita crear clientes físicos sin email/password requerido).
- [x] Frontend: Crear componente ClientDirectory.jsx en pages/ consumiendo un nuevo hook useAdmin.
- [x] UI: Resaltar visualmente (badges rojos/verdes) a los clientes con deudas activas, con cabeceras fijas para mejor legibilidad en móviles.
- [x] Historial de compras del cliente implementado en el perfil de cliente.

## Tareas Pendientes (Backlog)
1. Implementar la capa de notificaciones en tiempo real con Socket.IO en backend y frontend.
2. Completar la validación de datos y manejo de errores tanto en la API como en la UI.
3. Añadir pruebas básicas unitarias/integración y documentación mínima de API.
4. Refinar el flujo de pedidos y estados con botones de acción claros, reporte de ventas y experiencia móvil.

## Reglas de Estilo
- Componentes React en archivos PascalCase (`AdminDashboard.jsx`, `CustomerSidebar.jsx`).
- Hooks personalizados en camelCase con prefijo `use` (`useAdmin.js`, `useOrders.js`).
- Contextos en `context/` para estado global compartido (`AuthContext.jsx`).
- Rutas y servicios con nombres en inglés o español consistentes según la capa (`authRoutes`, `orderService`).
- Variables y funciones en camelCase, comentarios explicativos en español.
- Uso de Tailwind CSS para estilos de clases utilitarias en JSX.

## Reglas de Código (Para Copilot)
- Autenticación: El token de sesión NUNCA debe leerse desde el objeto `user` del `AuthContext`. Siempre debe extraerse explícitamente usando `localStorage.getItem("token")` antes de pasarlo a los custom hooks o servicios.
