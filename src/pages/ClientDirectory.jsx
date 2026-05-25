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
        <label className="block text-sm font-semibold mb-1 text-slate-700">Nombre</label>
        <input
          name="nombre"
          value={formData.nombre}
          onChange={handleChange}
          required
          className="w-full rounded-button border border-surface-border bg-surface-bg px-4 py-3 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          placeholder="Nombre completo"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold mb-1 text-slate-700">Email</label>
        <input
          name="email"
          value={formData.email}
          onChange={handleChange}
          type="email"
          className="w-full rounded-button border border-surface-border bg-surface-bg px-4 py-3 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          placeholder="Email opcional"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold mb-1 text-slate-700">Teléfono</label>
          <input
            name="telefono"
            value={formData.telefono}
            onChange={handleChange}
            className="w-full rounded-button border border-surface-border bg-surface-bg px-4 py-3 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            placeholder="Teléfono"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1 text-slate-700">Dirección</label>
          <input
            name="direccion"
            value={formData.direccion}
            onChange={handleChange}
            className="w-full rounded-button border border-surface-border bg-surface-bg px-4 py-3 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            placeholder="Dirección"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold mb-1 text-slate-700">Notas CRM</label>
        <textarea
          name="notasCRM"
          value={formData.notasCRM}
          onChange={handleChange}
          className="w-full min-h-[120px] rounded-button border border-surface-border bg-surface-bg px-4 py-3 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          placeholder="Ej. Cliente habitual, prefiere envíos en la mañana"
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-button bg-brand-500 px-4 py-3 text-white font-semibold hover:bg-brand-600 transition-colors disabled:opacity-50"
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
      <div className="rounded-card border border-dashed border-surface-border bg-surface-card p-5 text-slate-500 text-center shadow-sm">
        Cargando historial de pedidos...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-card border border-status-danger/20 bg-status-danger/10 p-5 text-status-danger shadow-sm">
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
  const [clienteFilter, setClienteFilter] = useState("all");

  const filteredClientes = clientes.filter((cliente) => {
    const matchesName = cliente.nombre
      ? cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase())
      : false;
    const matchesDebt = clienteFilter === "all"
      ? true
      : clienteFilter === "debtors"
      ? cliente.saldoDeudor > 0
      : cliente.saldoDeudor === 0;
    return matchesName && matchesDebt;
  });

  const openClientProfile = (cliente) => {
    showModal({
      title: cliente.nombre,
      children: (
        <div className="max-h-full space-y-6">
          <div className="rounded-card bg-surface-bg p-6 border border-surface-border shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-sm text-slate-500">Email</p>
                <p className="text-lg font-semibold text-slate-900">
                  {cliente.email}
                </p>
              </div>
              <div className="rounded-card bg-surface-card p-4 border border-surface-border shadow-sm">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  Cliente ID
                </p>
                <p className="mt-2 font-semibold text-slate-900">
                  {cliente.userId}
                </p>
              </div>
            </div>
          </div>

          <section className="rounded-card bg-surface-bg p-6 border border-surface-border shadow-sm">
            <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-4">
              Resumen Financiero
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-card bg-surface-card p-5 border border-surface-border shadow-sm">
                <p className="text-xs text-slate-400 uppercase mb-2">
                  Total Gastado
                </p>
                <p className="text-3xl font-semibold text-slate-900">
                  ${cliente.montoTotalGastado.toFixed(2)}
                </p>
              </div>
              <div className="rounded-card bg-surface-card p-5 border border-surface-border shadow-sm">
                <p className="text-xs text-slate-400 uppercase mb-2">Deuda</p>
                <p
                  className={`text-3xl font-semibold ${cliente.saldoDeudor > 0 ? "text-status-danger" : "text-status-success"}`}
                >
                  ${cliente.saldoDeudor.toFixed(2)}
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-card bg-surface-bg p-6 border border-surface-border shadow-sm">
            <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-4">
              Historial de Pedidos Recientes
            </h3>
            <RecentOrdersPanel userId={cliente.userId} />
          </section>

          <section className="rounded-card bg-surface-bg p-6 border border-surface-border shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
                Notas del Cliente
              </h3>
            </div>
            <textarea
              className="w-full min-h-40 rounded-card border border-surface-border bg-surface-card p-4 text-sm text-slate-700 resize-none focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500"
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
        <div className="bg-status-danger/10 border border-status-danger/20 text-status-danger px-4 py-3 rounded-card">
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
          className="rounded-button bg-brand-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-600"
        >
          Crear cliente físico
        </button>
      </div>

      <div className="relative z-10 bg-surface-bg/95 backdrop-blur-md pb-4 pt-2 mb-6 border-b border-surface-border">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-md">
            <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-slate-400">🔍</span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre..."
              className="w-full rounded-button border border-surface-border bg-surface-card px-12 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 shadow-sm"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { value: 'all', label: 'Todos' },
              { value: 'debtors', label: 'Con Deuda 🚨' },
              { value: 'solvent', label: 'Solventes ✅' },
            ].map((chip) => (
              <button
                key={chip.value}
                type="button"
                onClick={() => setClienteFilter(chip.value)}
                className={`rounded-button px-4 py-2 text-sm font-semibold transition border ${clienteFilter === chip.value ? 'bg-brand-500 text-white border-brand-500' : 'bg-surface-card border-surface-border text-slate-700 hover:bg-surface-bg'}`}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="bg-surface-card rounded-card shadow-sm border border-surface-border p-6 animate-pulse"
            >
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      ) : clientes.length === 0 ? (
        <div className="rounded-card border border-brand-200 bg-surface-card p-10 text-center shadow-sm">
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
        <div className="rounded-card border border-surface-border bg-surface-card p-10 text-center shadow-sm">
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
              className={`bg-surface-card rounded-card shadow-sm p-6 border transition ${cliente.saldoDeudor > 0 ? "border-status-danger" : "border-surface-border hover:shadow-md"}`}
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold text-slate-800">{cliente.nombre}</h3>
                {cliente.saldoDeudor > 0 && (
                  <span className="flex items-center gap-1 bg-status-danger/10 text-status-danger px-2 py-1 rounded-full text-xs font-bold">
                    ⚠️ Deuda Activa
                  </span>
                )}
              </div>
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
              <div className="space-y-2 mt-4">
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
                <div className="flex justify-between items-center mt-2 pt-2 border-t border-surface-border">
                  <span className="text-sm font-medium">Deuda Pendiente:</span>
                  <span
                    className={`text-sm px-2 py-1 rounded-button font-bold ${
                      cliente.saldoDeudor > 0
                        ? "text-status-danger bg-status-danger/10"
                        : "text-status-success bg-status-success/10"
                    }`}
                  >
                    ${cliente.saldoDeudor.toFixed(2)}
                  </span>
                </div>
              </div>
              <div className="mt-5 pt-4 border-t border-surface-border flex flex-wrap gap-2">
                <a
                  href={cliente.telefono ? `https://wa.me/${cliente.telefono.replace(/\D/g, '')}` : "#"}
                  target="_blank"
                  rel="noreferrer"
                  className={`inline-flex items-center justify-center rounded-button px-4 py-2 text-sm font-semibold transition ${cliente.telefono ? 'bg-[#25D366] text-white hover:bg-[#128C7E]' : 'bg-surface-bg text-slate-400 cursor-not-allowed border border-surface-border'}`}
                >
                  📱 WhatsApp
                </a>
                <a
                  href={cliente.telefono ? `tel:${cliente.telefono.replace(/\D/g, '')}` : "#"}
                  className={`inline-flex items-center justify-center rounded-button px-4 py-2 text-sm font-semibold transition ${cliente.telefono ? 'bg-sky-500 text-white hover:bg-sky-600' : 'bg-surface-bg text-slate-400 cursor-not-allowed border border-surface-border'}`}
                >
                  📞 Llamar
                </a>
                <button
                  onClick={() => openClientProfile(cliente)}
                  className="inline-flex items-center justify-center rounded-button px-4 py-2 text-sm font-semibold text-slate-700 bg-surface-bg border border-surface-border hover:bg-surface-border transition"
                >
                  Ver Perfil
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClientDirectory;
