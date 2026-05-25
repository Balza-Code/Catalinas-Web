import { useState } from "react";
import { uploadReceipt } from "../services/orderService";
import { useModal } from "../context/ModalContext";

const UploadReceiptForm = ({ orderId, onReceiptUploaded }) => {
  const [file, setFile] = useState(null);
  const [metodoPago, setMetodoPago] = useState("Transferencia/Pago Móvil");
  const [monedaPago, setMonedaPago] = useState("Bs");
  const [uploading, setUploading] = useState(false);
  const { showModal } = useModal();

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      showModal({ title: 'Copiado', message: `${text} copiado al portapapeles.` });
    } catch (error) {
      console.error('Error copiando al portapapeles', error);
      showModal({ title: 'Error', message: 'No se pudo copiar. Intenta manualmente.' });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (metodoPago !== "Efectivo" && !file) {
      showModal({ title: 'Archivo faltante', message: 'Por favor, selecciona un archivo.' });
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("metodoPago", metodoPago);

    if (metodoPago === "Efectivo") {
      formData.append("monedaPago", monedaPago);
    } else {
      formData.append("comprobante", file);
    }

    try {
      const updatedOrder = await uploadReceipt(orderId, formData);
      showModal({ 
        title: 'Éxito', 
        message: metodoPago === 'Efectivo' ? '¡Pago en efectivo reportado!' : '¡Comprobante subido!' 
      });
      onReceiptUploaded(updatedOrder);
      
    } catch (error) {
      console.error("Error de red:", error);
      showModal({ title: 'Error', message: 'Error al procesar el pago.' });
    } finally {
      setUploading(false);
    }
  };

  return ( 
    <form
      onSubmit={handleSubmit}
      className="upload-form w-full mt-4 flex flex-col gap-6 bg-white p-4 rounded-3xl shadow-lg"
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-3xl bg-blue-50 p-4">
          <h3 className="text-xl font-bold text-slate-900">1. Realiza tu transferencia o Pago Móvil</h3>
          <div className="mt-4 flex justify-center">
            <img
              src="/qr-pago.png"
              alt="Código QR de Pago Móvil"
              className="w-32 h-32 rounded-3xl border border-blue-100 object-cover"
            />
          </div>
        </div>

        <div className="rounded-3xl bg-slate-50 p-4">
          <h3 className="text-xl font-bold text-slate-900">Datos para transferir</h3>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <p className="text-sm font-medium text-slate-700">Teléfono</p>
                <p className="text-lg font-semibold text-slate-900">04XX-XXXXXXX</p>
              </div>
              <button
                type="button"
                onClick={() => copyToClipboard('04XX-XXXXXXX')}
                className="text-sm font-semibold text-blue-700 hover:text-blue-900"
              >
                Copiar
              </button>
            </div>
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <p className="text-sm font-medium text-slate-700">Cédula</p>
                <p className="text-lg font-semibold text-slate-900">V-XXXXXXXX</p>
              </div>
              <button
                type="button"
                onClick={() => copyToClipboard('V-XXXXXXXX')}
                className="text-sm font-semibold text-blue-700 hover:text-blue-900"
              >
                Copiar
              </button>
            </div>
            <div className="flex items-center justify-between pt-3">
              <div>
                <p className="text-sm font-medium text-slate-700">Banco</p>
                <p className="text-lg font-semibold text-slate-900">Banco de Venezuela</p>
              </div>
              <button
                type="button"
                onClick={() => copyToClipboard('Banco de Venezuela')}
                className="text-sm font-semibold text-blue-700 hover:text-blue-900"
              >
                Copiar
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-3xl bg-amber-50 p-4">
        <h3 className="text-xl font-bold text-slate-900">2. Sube tu comprobante</h3>
        <p className="mt-2 text-sm text-slate-700">Selecciona el método de pago y adjunta tu comprobante para confirmar.</p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Método de Pago</label>
            <select
              value={metodoPago}
              onChange={(e) => setMetodoPago(e.target.value)}
              className="w-full border border-slate-300 rounded-2xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-amber-200"
            >
              <option value="Transferencia/Pago Móvil">Transferencia / Pago Móvil</option>
              <option value="Efectivo">Efectivo</option>
            </select>
          </div>

          {metodoPago === "Efectivo" ? (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Moneda</label>
              <select
                value={monedaPago}
                onChange={(e) => setMonedaPago(e.target.value)}
                className="w-full border border-slate-300 rounded-2xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-amber-200"
              >
                <option value="Bs">Bolívares (Bs)</option>
                <option value="USD">Dólares (USD)</option>
              </select>
            </div>
          ) : (
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Comprobante</label>
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={(e) => setFile(e.target.files[0])}
                className="block w-full text-sm text-slate-700 rounded-2xl border border-slate-300 bg-white px-4 py-3 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-amber-500 file:text-white hover:file:bg-amber-600"
              />
              <p className="text-xs text-slate-500 mt-1">Formatos permitidos: JPG, PNG, PDF</p>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={uploading}
          className={`mt-5 w-full rounded-3xl text-white text-center text-2xl font-bold px-6 py-4 transition ${uploading ? "bg-slate-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"}`}
        >
          {uploading ? "Procesando..." : "Subir Comprobante"}
        </button>
      </div>
    </form>
  );
};

export default UploadReceiptForm;
