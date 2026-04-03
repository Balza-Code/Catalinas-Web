<div align="center">

🥐 Catalina's Web: Contexto y Roadmap de Desarrollo

Aplicación Full Stack (MERN) para la gestión de ventas, inventario, producción y cobranza de repostería artesanal.

</div>

## LOGROS RECIENTES

- Refactorización Móvil Completa: Se implementó un menú de navegación tipo drawer (`MobileBottomNav`), optimización táctil en el Client Directory (cabeceras fijas) y tarjetas ordenadas responsivas.
- Dashboard Financiero Mejorado: Se agregaron vistas de datos de 30 y 90 días, resolviendo problemas de sincronización en las gráficas y métricas de reportes.
- Solución de Despliegue en Render: Se corrigieron problemas de case-sensitivity en los imports de modelos (ej. `order.js`), permitiendo un build de producción estable.
- Tarjetas Móviles de Admin: El panel de admin cuenta con tarjetas táctiles con selectores de estados y visualización clara de metadatos de pago.
- CRM Corregido: el saldoDeudor y filtros aplicados correctos; migración de datos al nuevo costoProduccion completada.
- Calculadora de Inversión 2.0: Módulo avanzado para calcular costos con soporte para sub-recetas (Melado vs Masa real), unidades métricas dinámicas, manejo de porciones/empaques, cálculo simultáneo de Margen vs Marcaje y conexión directa a la Base de Datos mediante `Recipe` model.

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

Fase 3: 100% COMPLETADA

[x] Backend: Endpoint en adminRoutes con Aggregation Pipeline que cruce Usuarios y Pedidos para calcular el "Saldo Deudor" (Total - Pagado).

[x] Frontend: Crear componente ClientDirectory.jsx en pages/ consumiendo un nuevo hook useClients.

[x] UI: Resaltar visualmente (badges rojos/verdes) a los clientes con deudas activas. Diseño de listas adaptado a mobile con headers fijados (Sticky).

## Mejoras Post-Implementación (Fases 1 y 3)

Mejoras para la Fase 1 (Inteligencia Financiera):

[x] Desglose de Ingresos: Añadir un botón o modal en el FinancialDashboard que despliegue una lista detallada de los pedidos específicos que están sumando a los 'Ingresos Totales' y 'Capital a Reinvertir', para no tener que ir al historial general a adivinar.

[x] Memoria de la Calculadora: Se rediseñó totalmente `InvestmentCalculator.jsx` junto al backend creando un sistema de Gestión Dinámico con persistencia de Recetas en MongoDB, guardando todas las variables métricas (tipo de envase, precios de lista por ingredientes separados en fases y rendimientos) actualizando el producto final en 1 clic.

Mejoras para la Fase 3 (CRM y Clientes):

[x] Filtros de Búsqueda: Añadir una barra de búsqueda por nombre y botones de filtro rápidos (ej. 'Todos', 'Con Deuda', 'Solventes') en ClientDirectory.jsx para manejar grandes volúmenes de clientes.

[x] Bugfix Saldo Deudor: Corregir la lógica matemática en el backend/frontend del CRM. Actualmente, si un cliente paga una parte o la totalidad, el sistema está duplicando o manteniendo el monto en 'Deuda Pendiente' en lugar de restarlo al total.

Bugfixes Prioritarios (Dashboard Principal):

[x] Corrección de KPIs del Dashboard: Revisar la lógica de cálculo de las tarjetas superiores ('Total de Cuentas por Cobrar' e 'Ingresos Totales'). Los números actuales están inflados o mezclando estados incorrectos.

[x] Corrección del Gráfico (Rendimiento Mensual): El gráfico de Recharts está mostrando dineroRecibido: 0 a pesar de existir pedidos con estado 'Pago Completado'. Actualizar el filtro de estados en el controlador que alimenta este gráfico para que coincida con la lógica usada en la Inteligencia Financiera.

Fase 4: Gestión de Flujo de Caja y Egresos (Completa)
**ESTADO: 100% COMPLETADA**
- [x] Backend creado con `Expense` model, multi-moneda (Efectivo USD, Efectivo Bs, Digital) y cruzando cálculos internamente y restas lógicas.
- [x] Frontend con `ExpenseForm` que reporta saldos disponibles nativos usando Inteligencia Financiera.
- [x] Conciliación cruzada de Gastos Operativos y de Reinversión impactando los topes de ganancias y capital de producción.

Fase 4.5: Sistema de Nómina e Historial de Gastos (Completa)
**ESTADO: 100% COMPLETADA**
Objetivo: Integrar el formulario de gastos con topes de ganancia y añadir gestión de nómina (pago fijo a personal/dueños).
- [x] UI de Límite de Gasto: Reflejado en `ExpenseForm` el monto máximo disponible de la `Ganancia Neta` y `Capital a Reinvertir`.
- [x] Módulo Nómina: Atajos rápidos de 1-click para registrar nómina, categorizándolos como deducciones limpias.
- [x] Historial de Egresos: Modal centralizado con la lista de los gastos y funcionalidad de [Revertir] para eliminar el gasto y readaptar la caja automáticamente.

Fase 5: Punto de Venta (POS) Dinámico
**ESTADO: 100% COMPLETADA**
Objetivo: Agilizar ventas al detal presenciales sin crear combos fijos en BD.

[x] Frontend: Crear nueva página POS.jsx con formulario ágil de contadores (+/-) por unidad.

[x] Lógica: Hook local para armar paquetes personalizados al instante, calcular precio y enviar a /api/orders como tipo de venta "detal".

Fase 6: Sistema de Notificaciones en Tiempo Real

Objetivo: Avisar al Admin de acciones clave usando WebSockets.

[ ] Backend/Frontend: Integrar Socket.IO al servidor Express y al layout de React.

[ ] UI: Implementar campanita de notificaciones In-App en el Header del Admin.

[ ] Eventos: Emitir alerta cuando un cliente suba un comprobante a Cloudinary o realice un nuevo pedido.

Fase 7: Módulo de Devoluciones y Saldos

Objetivo: Mantener la integridad de inventario y caja.

[ ] Crear el estado "Devuelto" en el flujo de pedidos.

[ ] Lógica en controlador para decidir reintegro de inventario y manejo de "saldos a favor" del cliente en su perfil.

Fase 8: Control de Producción (Tandas de Horneado)

Objetivo: Asistir en la planificación y automatizar el stock.

[ ] Frontend: Formulario en panel admin para "Inicio de Tanda" (kilos de masa) y "Cierre de Tanda" (catalinas logradas).

[ ] Backend: Actualización automática del stock global en la colección catalinas basado en el rendimiento de la tanda.

Fase 9: Portal de Reabastecimiento Mayorista (B2B Bodegas)

Objetivo: Diseñar una interfaz ultrabásica y de alta legibilidad para clientes al mayor (bodegueros, adultos mayores) que se enfoque en accesibilidad, rapidez y rentabilidad, omitiendo cualquier distracción visual innecesaria.

[ ] UI Abasto Minimalista: Adiós al formulario tradicional. Un catálogo de letras inmensas, botones gigantes (+/-) con altísimo contraste. Sin animaciones ni videos que consuman sus datos o confundan.

[ ] Enfoque en la Ganancia (Psicología B2B): Mostrar directamente debajo de cada paquete la rentabilidad esperada. Ej: "Llevas 20 cat por X$. Si vendes a Y$, ganas Z$".

[ ] Re-Pedido en 1 Clic: Implementar un botón masivo de "Repetir mi último pedido" en la pantalla de inicio, ya que los bodegueros suelen tener rutinas de reposición fijas.

[ ] Checkout Cero-Letras y Pago Asistido: Eliminar cualquier tipeo innecesario en el checkout. La pantalla de pago mostrará el QR gigante, los datos bancarios en letras súper grandes y un botón colosal que diga "Subir Capture de Pago Mívil" para facilitar el proceso incluso con presbicia.

Fase 10: Storefront B2C Directo (Contexto Minorista / Eventos Futuros)

Objetivo: Experiencia "Tienda de Conveniencia Móvil" (estilo Delivery App), puramente visual y orientada al consumidor final (jóvenes, compras impulsivas). *Archivado para futuras expansiones del modelo de negocio.*

[ ] Escaparate Visual: Catálogo dominado por fotos HD, sin formularios. Animaciones fluidas y diseño estético orientado al apetito.

[ ] Upselling y Cross-selling: Barras de recomendaciones dinámicas ("¿Te provoca acompañarlo con...?") justo antes de pagar.

[ ] Smart Checkout B2C: Tarjeta digital de pago con "Tocar para copiar" y subida ágil de comprobantes.
[ ] Banners 'Hero': Integración de videos cortos del proceso de horneado en el inicio de la app para atrapar la atención.

🛠️ 3. Backlog Técnico (Deuda Técnica y Optimización)

[ ] Implementar ProductSkeleton en components/ para estados de carga en vistas de cliente y admin.

[x] Refinar experiencia móvil (Responsive Design) en la vista de la tienda del cliente y tablas del Admin. (Implementado Bottom Nav, tarjetas móviles y vistas modulares).

[ ] Completar validación de datos (ej. con Zod o Express Validator) y manejo de errores estandarizado en la API.

[ ] Mejorar gráficos de rendimiento usando Recharts (AreaCharts con degradados suaves).