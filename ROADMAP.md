🥐 Proyecto Catalinas: Roadmap y Contexto

Aplicación web integral para la gestión de ventas, inventario, producción y cobranza de un negocio familiar de repostería.

</div>

📌 Contexto del Proyecto

👥 Usuarios Principales

Perfil

Rol y Capacidades

👑 Admin

Gestiona productos, aprueba pagos, administra estados de pedidos, controla producción y visualiza métricas financieras.

🛍️ Cliente

Explora la tienda, arma pedidos personalizados, sube comprobantes de pago y visualiza su historial de compras.

🛠️ Stack Tecnológico

Frontend: React Tailwind CSS Redux Toolkit React Router DOM

Backend: Node.js Express MongoDB Mongoose

UI/UX: Bento Grid Glassmorphism Skeletons Micro-interacciones

🚀 Roadmap de Mejoras (Priorizado)

Fase 1: Inteligencia Financiera ("El Contador Automático")

Objetivo: Separar automáticamente el dinero que es ganancia del dinero que se debe reinvertir.

[ ] Añadir campo costoProduccion al modelo de Catalina y a los items dentro del modelo Order.

[ ] Crear un controlador que calcule: Ingresos Totales (pagos recibidos), Capital de Reinversión (suma de costos) y Ganancia Neta.

[ ] Mostrar estas métricas en el Dashboard principal del Admin.

Fase 2: Control y Flexibilidad de Pedidos

Objetivo: Dar margen de error y corrección tanto al admin como al cliente en el flujo de ventas.

[ ] Admin: Cambiar la vista de estado de pedido a un menú desplegable (<select>) para regresar a estados anteriores previa confirmación.

[ ] Cliente: Añadir botón de "Cancelar Pedido" (funcional únicamente si el estado es "Pendiente").

Fase 3: Control de Cobranza (Mini CRM Base)

Objetivo: Tener un control visual y estricto de los clientes que tienen pagos pendientes.

[ ] Crear tabla "Directorio de Clientes" en el panel Admin.

[ ] Implementar un Endpoint con Aggregation Pipeline que cruce Usuarios con sus Pedidos para calcular el "Saldo Deudor" (Total - Pagado).

[ ] Resaltar visualmente (badges rojos/verdes) a los clientes con deudas activas.

Fase 4: Modernización de Interfaz (UI/UX)

Objetivo: Transmitir la sensación de una aplicación "Premium" ágil y fluida.

[ ] Implementar ProductSkeleton (con Tailwind animate-pulse) en la tienda y paneles.

[ ] Aplicar estructura "Bento Grid" al Dashboard de métricas financieras.

[ ] Mejorar los gráficos (Recharts) integrando curvas suaves (AreaChart) y degradados.

Fase 5: Sistema de Notificaciones

Objetivo: Avisar al Admin de acciones clave en tiempo real para agilizar los despachos.

[ ] Implementar campanita de notificaciones In-App en el Header del Admin.

[ ] Registrar alertas cuando un cliente suba un nuevo comprobante de pago o haga un pedido.

Fase 6: Punto de Venta (POS) Dinámico

Objetivo: Agilizar las ventas al detal presenciales sin necesidad de crear combos fijos en la BD.

[ ] Crear un formulario ágil para el Admin con contadores (+/-) por unidad.

[ ] Lógica para armar paquetes personalizados al instante y calcular el precio al vuelo.

Fase 7: Módulo de Devoluciones

Objetivo: Mantener la integridad de las finanzas y el stock ante eventualidades.

[ ] Crear el estado "Devuelto" en los pedidos.

[ ] Implementar lógica para decidir el reintegro de inventario (si el producto está bueno) y manejar "saldos a favor" del cliente.

Fase 8: CRM de Clientes (Perfiles Avanzados)

Objetivo: Centralizar la relación, historial y preferencias de cada comprador.

[ ] Desarrollar perfiles individuales con historial histórico de compras.

[ ] Añadir sección de "Notas de preferencias" (ej. Le gustan más las blancas).

[ ] Botón de contacto rápido por WhatsApp con mensaje pre-llenado.

Fase 9: Control de Producción (Tandas)

Objetivo: Asistir en la planificación del horneado y automatizar el inventario.

[ ] Formulario de "Inicio de Tanda": Registro de kilos de masa inicial y proyección de unidades esperadas.

[ ] Registro de "Cierre de Tanda": Unidades horneadas reales para calcular el rendimiento.

[ ] Actualización automática del stock en la tienda en base a lo producido.

💡 Backlog de Ideas Futuras

[Añade aquí nuevas ideas que vayan surgiendo]

[Idea 2...]