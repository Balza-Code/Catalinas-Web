import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { useAdmin } from "../hooks/useAdmin";
import { useModal } from "../context/ModalContext.jsx";
import { createAdminCliente } from "../services/adminService.js";
import { getOrdersByUser } from "../services/orderService.js";
import ResumenVentasRecientes from "../components/ResumenVentasRecientes.jsx";

const CreateClientForm = ({
  userToken,
  refreshClientes,
  showModal,
  hideModal,
}) => {
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    telefono: "",
    direccion: "",
    notasCRM: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!formData.nombre.trim()) {
      showModal({
        title: "Nombre requerido",
        message: "Debes ingresar el nombre del cliente.",
      });
      return;
    }

    try {
      setSubmitting(true);
      await createAdminCliente(userToken, formData);
      refreshClientes();
      hideModal();
      showModal({
        title: "Cliente creado",
        message: "El cliente físico se ha registrado correctamente.",
      });
    } catch (err) {
      showModal({
        title: "Error",
        message: err.message || "No se pudo crear el cliente.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-semibold mb-1">Nombre</label>
        <input
          name="nombre"
          value={formData.nombre}
          onChange={handleChange}
          required
          className="w-full rounded-3xl border border-slate-300 px-4 py-3"
          placeholder="Nombre completo"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold mb-1">Email</label>
        <input
          name="email"
          value={formData.email}
          onChange={handleChange}
          type="email"
          className="w-full rounded-3xl border border-slate-300 px-4 py-3"
          placeholder="Email opcional"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold mb-1">Teléfono</label>
          <input
            name="telefono"
            value={formData.telefono}
            onChange={handleChange}
            className="w-full rounded-3xl border border-slate-300 px-4 py-3"
            placeholder="Teléfono"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Dirección</label>
          <input
            name="direccion"
            value={formData.direccion}
            onChange={handleChange}
            className="w-full rounded-3xl border border-slate-300 px-4 py-3"
            placeholder="Dirección"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold mb-1">Notas CRM</label>
        <textarea
          name="notasCRM"
          value={formData.notasCRM}
          onChange={handleChange}
          className="w-full min-h-[120px] rounded-3xl border border-slate-300 px-4 py-3"
          placeholder="Ej. Cliente habitual, prefiere envíos en la mañana"
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-3xl bg-amber-500 px-4 py-3 text-white font-semibold hover:bg-amber-600 disabled:opacity-50"
      >
        {submitting ? "Creando..." : "Crear cliente"}
      </button>
    </form>
  );
};

const RecentOrdersPanel = ({ userId }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) return;

    let isMounted = true;
    setError(null);
    setLoading(true);

    getOrdersByUser(userId)
      .then((data) => {
        if (isMounted) setOrders(data);
      })
      .catch((err) => {
        if (isMounted) setError(err.message || "Error al cargar el historial de pedidos");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [userId]);

  if (loading) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-5 text-slate-500">
        Cargando historial de pedidos...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-5 text-red-700">
        {error}
      </div>
    );
  }

  const filteredOrders = orders.filter((order) => {
    const orderUserId = order.user?._id ? order.user._id : order.user;
    return orderUserId?.toString() === userId?.toString();
  });

  return <ResumenVentasRecientes orders={filteredOrders} />;
};

const ClientDirectory = () => {
  const { user } = useContext(AuthContext);
  const token = localStorage.getItem("token");
  const { clientes, loading, error, refreshClientes } = useAdmin(token);

  const { showModal, hideModal } = useModal();
  const [searchTerm, setSearchTerm] = useState("");
  const [showOnlyDebtors, setShowOnlyDebtors] = useState(false);

  const filteredClientes = clientes.filter((cliente) => {
    const matchesName = cliente.nombre
      ? cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase())
      : false;
    const matchesDebt = showOnlyDebtors ? cliente.saldoDeudor > 0 : true;
    return matchesName && matchesDebt;
  });

  const openClientProfile = (cliente) => {
    showModal({
      title: cliente.nombre,
      children: (
        <div className="max-h-full space-y-6">
          <div className="rounded-3xl bg-slate-50 p-6 border border-slate-200">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-sm text-slate-500">Email</p>
                <p className="text-lg font-semibold text-slate-900">
                  {cliente.email}
                </p>
              </div>
              <div className="rounded-3xl bg-white p-4 border border-slate-200">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  Cliente ID
                </p>
                <p className="mt-2 font-semibold text-slate-900">
                  {cliente.userId}
                </p>
              </div>
            </div>
          </div>

          <section className="rounded-3xl bg-slate-50 p-6 border border-slate-200">
            <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-4">
              Resumen Financiero
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl bg-white p-5 border border-slate-200">
                <p className="text-xs text-slate-400 uppercase mb-2">
                  Total Gastado
                </p>
                <p className="text-3xl font-semibold text-slate-900">
                  ${cliente.montoTotalGastado.toFixed(2)}
                </p>
              </div>
              <div className="rounded-3xl bg-white p-5 border border-slate-200">
                <p className="text-xs text-slate-400 uppercase mb-2">Deuda</p>
                <p
                  className={`text-3xl font-semibold ${cliente.saldoDeudor > 0 ? "text-red-600" : "text-emerald-600"}`}
                >
                  ${cliente.saldoDeudor.toFixed(2)}
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-3xl bg-slate-50 p-6 border border-slate-200">
            <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-4">
              Historial de Pedidos Recientes
            </h3>
            <RecentOrdersPanel userId={cliente.userId} />
          </section>

          <section className="rounded-3xl bg-slate-50 p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
                Notas del Cliente
              </h3>
            </div>
            <textarea
              className="w-full min-h-40 rounded-3xl border border-slate-200 bg-white p-4 text-sm text-slate-700 resize-none focus:outline-none focus:ring-2 focus:ring-amber-300"
              placeholder="Le gustan las catalinas muy tostadas"
              defaultValue={cliente.notas || ""}
            />
          </section>
        </div>
      ),
    });
  };

  const openCreateClientModal = () => {
    showModal({
      title: "Crear cliente físico",
      children: (
        <CreateClientForm
          userToken={token}
          refreshClientes={refreshClientes}
          showModal={showModal}
          hideModal={hideModal}
        />
      ),
    });
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <h1 className="text-2xl font-bold">Directorio de Clientes</h1>
        <button
          onClick={openCreateClientModal}
          className="rounded-3xl bg-amber-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-amber-600"
        >
          Crear cliente físico
        </button>
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-md">
          <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-slate-400">🔍</span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre..."
            className="w-full rounded-3xl border border-slate-300 bg-white px-12 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-200"
          />
        </div>
        <button
          type="button"
          onClick={() => setShowOnlyDebtors((current) => !current)}
          className={`rounded-3xl px-4 py-3 text-sm font-semibold transition ${showOnlyDebtors ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-slate-100 text-slate-700 border border-slate-200'}`}
        >
          Mostrar solo deudores
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-sm p-6 animate-pulse"
            >
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      ) : clientes.length === 0 ? (
        <div className="rounded-3xl border border-amber-200 bg-white p-10 text-center shadow-sm">
          <p className="text-lg font-semibold text-slate-900 mb-2">
            Aún no hay clientes visibles
          </p>
          <p className="text-sm text-slate-500">
            El directorio muestra clientes registrados en la base de datos. Si
            tu colección de usuarios está vacía, crea clientes o ejecuta pedidos
            para que aparezcan aquí.
          </p>
        </div>
      ) : filteredClientes.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <p className="text-lg font-semibold text-slate-900 mb-2">
            No se encontraron clientes con esos filtros
          </p>
          <p className="text-sm text-slate-500">
            Ajusta el término de búsqueda o desactiva "Mostrar solo deudores" para ver más resultados.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClientes.map((cliente) => (
            <div
              key={cliente.userId}
              className="bg-white rounded-2xl shadow-sm p-6"
            >
              <h3 className="text-lg font-semibold mb-4">{cliente.nombre}</h3>
              <p className="text-sm text-gray-600 mb-2">
                Email: {cliente.email || "Sin email"}
              </p>
              {cliente.telefono && (
                <p className="text-sm text-gray-600 mb-2">
                  Teléfono: {cliente.telefono}
                </p>
              )}
              {cliente.direccion && (
                <p className="text-sm text-gray-600 mb-2">
                  Dirección: {cliente.direccion}
                </p>
              )}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Total de Pedidos:</span>
                  <span className="text-sm">{cliente.totalPedidos}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Total Comprado:</span>
                  <span className="text-sm">
                    ${cliente.montoTotalGastado.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Deuda Pendiente:</span>
                  <span
                    className={`text-sm px-2 py-1 rounded-full ${
                      cliente.saldoDeudor > 0
                        ? "text-red-600 bg-red-50"
                        : "text-green-600 bg-green-50"
                    }`}
                  >
                    ${cliente.saldoDeudor.toFixed(2)}
                  </span>
                </div>
              </div>
              <button
                onClick={() => openClientProfile(cliente)}
                className="mt-6 w-full rounded-2xl bg-amber-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-amber-600"
              >
                Ver Perfil
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClientDirectory;
