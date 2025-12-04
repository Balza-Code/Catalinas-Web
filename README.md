🛍️ Catalina's Web: Gestión de Pedidos Artesanales
🌟 Visión General del Proyecto
Catalina's Web es una aplicación Full Stack MERN (MongoDB, Express, React, Node.js) diseñada para modernizar el proceso de venta y gestión de pedidos de productos artesanales. El sistema ofrece una experiencia de compra fluida para los clientes y un panel de administración robusto para gestionar el flujo de trabajo de los pedidos en tiempo real.

Estado	Licencia	Live Demo
Enlace a la App Desplegada
✨ Características Clave
Autenticación de Usuarios: Registro e inicio de sesión con JWT.

Gestión de Roles: Diferenciación entre Administrador y Cliente.

CRUD de Órdenes: Los clientes pueden crear pedidos y los administradores pueden editarlos y gestionarlos.

Notificaciones en Tiempo Real: Uso de Socket.IO para notificar al administrador inmediatamente cuando un cliente realiza un nuevo pedido.

Gestión de Inventario (Catalinas): Panel CRUD para el administrador de productos.

Upload de Comprobantes: Los clientes pueden subir comprobantes de pago. Cloudinary para almacenamiento de imágenes.

Diseño Responsivo: Interfaz adaptativa que utiliza el diseño Table (Desktop) y Card List (Mobile) para la visualización de órdenes.

💻 Stack Tecnológico
Componente	Tecnología	Propósito
Frontend	React (Vite)	Interfaz de Usuario.
Estilos	Tailwind CSS	Estilizado rápido y responsivo.
Backend	Node.js, Express.js	API RESTful y Servidor.
Base de Datos	MongoDB Atlas	Base de datos NoSQL en la nube.
Real-time	Socket.IO	Notificaciones en tiempo real para el administrador.
Archivos	Cloudinary	Almacenamiento de imágenes de productos y comprobantes.
Despliegue	Vercel (Frontend), Render (Backend)	Plataformas de Hosting.

Exportar a Hojas de cálculo

⚙️ Instalación y Configuración Local
El proyecto está estructurado en un monorepo simple con carpetas backend y frontend.

1. Prerrequisitos
Node.js (v18+)

MongoDB Atlas Account

Cloudinary Account

2. Clonar el Repositorio
Bash

git clone https://docs.github.com/es/repositories/creating-and-managing-repositories/quickstart-for-repositories
cd catalinas-web
3. Configuración del Backend
Navega a la carpeta del backend:

Bash

cd backend
Instala las dependencias:

Bash

npm install
Crea un archivo .env en la carpeta backend y rellénalo con tus credenciales:

Fragmento de código

# CONEXIÓN A MONGODB
MONGO_URI=mongodb+srv://user:password@cluster/database?retryWrites=true&w=majority

# SEGURIDAD
JWT_SECRET=tu_clave_secreta_jwt_fuerte
PORT=4000

# CLOUDINARY (Subida de Imágenes)
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
Inicia el servidor:

Bash

npm run dev
4. Configuración del Frontend
Navega a la carpeta del frontend:

Bash

cd ../frontend
Instala las dependencias:

Bash

npm install
Crea un archivo .env en la carpeta frontend y apunta a tu servidor local:

Fragmento de código

# VITE exige el prefijo VITE_ en las variables
VITE_API_URL=http://localhost:4000/api
Inicia la aplicación de React:

Bash

npm run dev
La aplicación estará disponible en http://localhost:5173.

🚀 Despliegue (Producción)
El proyecto se despliega de forma separada utilizando dos servicios:

Componente	Host	Variables de Entorno Requeridas
Backend	Render	MONGO_URI, JWT_SECRET, CLOUDINARY_*
Frontend	Vercel	VITE_API_URL (Debe ser la URL final del backend en Render, ej: https://catalinas-api.onrender.com/api)

Exportar a Hojas de cálculo

⚠️ Nota de CORS: Asegúrate de actualizar la lista de orígenes permitidos (allowedOrigins) en backend/index.js para incluir la URL final de tu frontend en Vercel.

👨‍💻 Contribuciones
Si deseas contribuir a este proyecto, por favor sigue estos pasos:

Haz un fork del repositorio.

Crea una nueva rama (git checkout -b feature/nueva-funcionalidad).

Realiza tus cambios y commit (git commit -m 'feat: añadir gestión de pagos').

Empuja al branch (git push origin feature/nueva-funcionalidad).

Abre un Pull Request explicando los cambios realizados.