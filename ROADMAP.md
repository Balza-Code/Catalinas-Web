<div align="center">

🥐 Catalina's Web: Contexto y Roadmap de Desarrollo

Aplicación Full Stack (MERN) para la gestión de ventas, inventario, producción y cobranza de repostería artesanal.

</div>

## LOGROS RECIENTES

- CRM Corregido: el saldoDeudor ahora queda en $0 para pedidos en estado 'Pago Completado' o 'Cancelado'.
- Fase 2 completada: el admin usa un `<select>` para cambiar estados de pedidos.
- El cliente puede cancelar sus propios pedidos solo cuando están en estado 'Pendiente'.
- Correcciones realizadas en validación de Hooks y anidamiento correcto de tablas HTML (`tbody`).
- Migración de datos exitosa: se asignó `costoProduccion: 0.91` a pedidos antiguos.
- Dashboard financiero refleja datos reales y muestra $76.50 en Ventas Totales este mes.

📌 1. Contexto y Arquitectura del Proyecto

🛠️ Stack Tecnológico

Frontend: React 19 + Vite, Tailwind CSS, React Router Dom, Recharts.

Estado Global: Context API (AuthContext, ModalContext) y Custom Hooks (useAdmin, useCatalinas, useOrders).

Backend: Node.js, Express.js.

Base de Datos: MongoDB / Mongoose.

Autenticación & Archivos: JWT, Multer + Cloudinary.

🏗️ Reglas de Código (Para Copilot)

Componentes: PascalCase (ej. AdminDashboard.jsx).

Hooks: camelCase con prefijo use (ej. useOrders.js).

Backend: Rutas REST montadas en /api/auth, /api/catalinas, /api/orders, /api/admin. Separación clara entre routers y controllers.

Estilos: Clases utilitarias de Tailwind CSS directamente en el JSX.

Idioma: Variables y funciones en inglés/español camelCase, comentarios explicativos en español.

🚀 2. Roadmap de Mejoras Funcionales (Priorizado)

Fase 1: Inteligencia Financiera ("El Contador Automático")

Objetivo: Separar automáticamente el dinero que es ganancia del que es capital de reinversión.

Progreso: 90% (Falta desglose detallado)

[x] Modelos: Añadir campo costoProduccion al schema de Catalina y a los items de Order.

[x] Backend: Crear controlador en adminRoutes que calcule: Ingresos Totales, Capital de Reinversión y Ganancia Neta.

[x] Frontend: Actualizar useAdmin hook y mostrar estas métricas en el Dashboard usando Bento Grid.

Fase 2: Control y Flexibilidad de Pedidos

Objetivo: Dar margen de error y corrección tanto al admin como al cliente en el flujo de ventas.

Fase 2: 100% COMPLETADA

[x] Admin: Cambiar celda de estado a un <select>. Al cambiar, abrir un modal de confirmación usando el ModalContext para revertir a estados anteriores.

[x] Cliente: Añadir botón de "Cancelar Pedido" (funcional únicamente si el estado es "Pendiente") comunicándose con orderRoutes.

Fase 3: Control de Cobranza (Mini CRM Base)

Objetivo: Control visual y estricto de los clientes con pagos pendientes o fraccionados.

Progreso: 60% (Faltan filtros de búsqueda)

[x ] Backend: Endpoint en adminRoutes con Aggregation Pipeline que cruce Usuarios y Pedidos para calcular el "Saldo Deudor" (Total - Pagado).

[ x] Frontend: Crear componente ClientDirectory.jsx en pages/ consumiendo un nuevo hook useClients.

[ x] UI: Resaltar visualmente (badges rojos/verdes) a los clientes con deudas activas.

## Mejoras Post-Implementación (Fases 1 y 3)

Mejoras para la Fase 1 (Inteligencia Financiera):

[ ] Desglose de Ingresos: Añadir un botón o modal en el FinancialDashboard que despliegue una lista detallada de los pedidos específicos que están sumando a los 'Ingresos Totales' y 'Capital a Reinvertir', para no tener que ir al historial general a adivinar.

[ ] Memoria de la Calculadora: Modificar InvestmentCalculator.jsx para que guarde los precios de los ingredientes (en localStorage o en la base de datos) y actúen como valores por defecto al entrar, evitando tener que reescribirlos desde cero cada vez.

Mejoras para la Fase 3 (CRM y Clientes):

[ ] Filtros de Búsqueda: Añadir una barra de búsqueda por nombre y botones de filtro rápidos (ej. 'Todos', 'Con Deuda', 'Solventes') en ClientDirectory.jsx para manejar grandes volúmenes de clientes.

[x] Bugfix Saldo Deudor: Corregir la lógica matemática en el backend/frontend del CRM. Actualmente, si un cliente paga una parte o la totalidad, el sistema está duplicando o manteniendo el monto en 'Deuda Pendiente' en lugar de restarlo al total.

Bugfixes Prioritarios (Dashboard Principal):

[x] Corrección de KPIs del Dashboard: Revisar la lógica de cálculo de las tarjetas superiores ('Total de Cuentas por Cobrar' e 'Ingresos Totales'). Los números actuales están inflados o mezclando estados incorrectos.

[x] Corrección del Gráfico (Rendimiento Mensual): El gráfico de Recharts está mostrando dineroRecibido: 0 a pesar de existir pedidos con estado 'Pago Completado'. Actualizar el filtro de estados en el controlador que alimenta este gráfico para que coincida con la lógica usada en la Inteligencia Financiera.

Fase 4: Punto de Venta (POS) Dinámico

Objetivo: Agilizar ventas al detal presenciales sin crear combos fijos en BD.

[ ] Frontend: Crear nueva página POS.jsx con formulario ágil de contadores (+/-) por unidad.

[ ] Lógica: Hook local para armar paquetes personalizados al instante, calcular precio y enviar a /api/orders como tipo de venta "detal".

Fase 5: Sistema de Notificaciones en Tiempo Real

Objetivo: Avisar al Admin de acciones clave usando WebSockets.

[ ] Backend/Frontend: Integrar Socket.IO al servidor Express y al layout de React.

[ ] UI: Implementar campanita de notificaciones In-App en el Header del Admin.

[ ] Eventos: Emitir alerta cuando un cliente suba un comprobante a Cloudinary o realice un nuevo pedido.

Fase 6: Módulo de Devoluciones y Saldos

Objetivo: Mantener la integridad de inventario y caja.

[ ] Crear el estado "Devuelto" en el flujo de pedidos.

[ ] Lógica en controlador para decidir reintegro de inventario y manejo de "saldos a favor" del cliente en su perfil.

Fase 7: Control de Producción (Tandas de Horneado)

Objetivo: Asistir en la planificación y automatizar el stock.

[ ] Frontend: Formulario en panel admin para "Inicio de Tanda" (kilos de masa) y "Cierre de Tanda" (catalinas logradas).

[ ] Backend: Actualización automática del stock global en la colección catalinas basado en el rendimiento de la tanda.

🛠️ 3. Backlog Técnico (Deuda Técnica y Optimización)

[ ] Implementar ProductSkeleton en components/ para estados de carga en vistas de cliente y admin.

[ ] Refinar experiencia móvil (Responsive Design) en la vista de la tienda del cliente y tablas del Admin.

[ ] Completar validación de datos (ej. con Zod o Express Validator) y manejo de errores estandarizado en la API.

[ ] Mejorar gráficos de rendimiento usando Recharts (AreaCharts con degradados suaves).