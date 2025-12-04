# 🛍️ Catalina's Web: Gestión de Pedidos Artesanales (MERN Stack)

## 🌟 Visión General del Proyecto

Catalina's Web es una aplicación **Full Stack MERN** (MongoDB, Express, React, Node.js) diseñada para modernizar el proceso de venta y gestión de pedidos de productos artesanales. El sistema ofrece una experiencia de compra fluida para los clientes y un panel de administración robusto capaz de gestionar el flujo de trabajo de los pedidos y recibir notificaciones en **tiempo real**.

| Estado | Licencia | Live Demo |
| :--- | :--- | :--- |
| ![Estado](https://img.shields.io/badge/Estado-Producci%C3%B3n-green) | ![Licencia](https://img.shields.io/badge/Licencia-MIT-blue.svg) | https://www.youtube.com/watch?v=yxLOBFXSkv0 |

---

## ✨ Características Clave

* **Autenticación de Usuarios:** Registro e inicio de sesión seguro basado en tokens **JWT**.
* **Gestión de Roles:** Diferenciación entre `Administrador` (con permisos CRUD) y `Cliente`.
* **Gestión de Órdenes:** Ciclo de vida completo del pedido (Pendiente, En preparación, Entregado, Pagado, Cancelado).
* **Notificaciones en Tiempo Real (Socket.IO):** El administrador recibe una alerta inmediata en el panel de control cuando un cliente realiza un nuevo pedido.
* **Carga de Archivos:** Los clientes pueden subir comprobantes de pago. Uso de **Cloudinary** para el almacenamiento de media.
* **Diseño Responsivo:** Arquitectura de **Tabla** para Desktop y **Card List** (tarjetas de resumen) para dispositivos móviles, optimizando la visualización de órdenes.

---

## 💻 Stack Tecnológico

| Componente | Tecnología | Propósito |
| :--- | :--- | :--- |
| **Frontend** | React (Vite) | Interfaz de Usuario. |
| **Estilos** | Tailwind CSS | Estilizado atómico y diseño responsivo. |
| **Backend** | Node.js, Express.js | API RESTful y Servidor. |
| **Real-time** | Socket.IO | Conexión persistente para notificaciones inmediatas. |
| **Base de Datos**| MongoDB Atlas | Base de datos NoSQL escalable en la nube. |
| **Archivos** | Cloudinary | Gestión de media y comprobantes. |
| **Despliegue** | Vercel (FE), Render (BE) | Plataformas de Hosting. |

---

## ⚙️ Instalación y Configuración Local

El proyecto está estructurado en un monorepo simple con las carpetas `backend` y `frontend`.

### 1. Prerrequisitos

* Node.js (v18+)
* MongoDB Atlas Account
* Cloudinary Account

### 2. Clonar el Repositorio

```bash
git clone [https://docs.github.com/es/repositories/creating-and-managing-repositories/quickstart-for-repositories](https://docs.github.com/es/repositories/creating-and-managing-repositories/quickstart-for-repositories)
cd catalinas-web