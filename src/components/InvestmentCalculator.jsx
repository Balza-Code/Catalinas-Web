import { useMemo, useState } from "react";
import { getCatalinas, updateCatalina } from "../services/catalinaService";

const ingredientList = [
  { key: "papelon", label: "Papelón", kilos: 12 },
  { key: "azucar", label: "Azúcar", kilos: 7 },
  { key: "anis", label: "Anís", kilos: 0.04 },
  { key: "clavitos", label: "Clavitos", kilos: 0.01 },
  { key: "sal", label: "Sal", kilos: 0.2 },
  { key: "harina", label: "Harina", kilos: 9.5 },
  { key: "bicarbonato", label: "Bicarbonato", kilos: 0.08 },
  { key: "margarina", label: "Margarina", kilos: 0.9 },
  { key: "canela", label: "Canela", kilos: 0.015 },
];

const meladoKeys = ["papelon", "azucar", "anis", "clavitos", "sal"];
const masaKeys = ["harina", "bicarbonato", "margarina", "canela"];

const formatCurrency = (value) => {
  return Number(value).toLocaleString("es-VE", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const initialPrices = ingredientList.reduce((acc, ingredient) => {
  acc[ingredient.key] = 0;
  return acc;
}, {});

export default function InvestmentCalculator() {
  const [prices, setPrices] = useState(initialPrices);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const totalMelado = useMemo(() => {
    return ingredientList
      .filter((ingredient) => meladoKeys.includes(ingredient.key))
      .reduce((total, ingredient) => {
        const price = Number(prices[ingredient.key]) || 0;
        return total + price * ingredient.kilos;
      }, 0);
  }, [prices]);


  const totalMasa = useMemo(() => {
    return ingredientList
      .filter((ingredient) => masaKeys.includes(ingredient.key))
      .reduce((total, ingredient) => {
        const price = Number(prices[ingredient.key]) || 0;
        return total + price * ingredient.kilos;
      }, 0);
  }, [prices]);

  // 1. Calculamos a cómo sale cada litro de melado (rinde 24 litros)
  const costoPorLitroMelado = useMemo(() => totalMelado / 24, [totalMelado]);

  // 2. Multiplicamos ese costo por los 6.8 litros que lleva "la hechura"
  const costoMeladoUsado = useMemo(() => costoPorLitroMelado * 6.8, [costoPorLitroMelado]);

  // 3. Sumamos la masa + los 6.8 litros de melado real
  const totalHechura = useMemo(() => Math.ceil(costoMeladoUsado) + totalMasa, [costoMeladoUsado, totalMasa]);

  const costoPorPaquete = useMemo(() => totalHechura / 28, [totalHechura]);

  const handleInputChange = (key, value) => {
    const normalized = value === "" ? "" : value;
    setPrices((prev) => ({
      ...prev,
      [key]: normalized,
    }));
  };

  const handleUpdateAllProducts = async () => {
    setIsSaving(true);
    setStatusMessage("");

    try {
      const catalinas = await getCatalinas();
      const updates = catalinas.map((catalina) => {
        const updatedCatalina = {
          ...catalina,
          costoProduccion: Number(costoPorPaquete.toFixed(2)),
        };
        return updateCatalina(catalina._id, updatedCatalina);
      });

      await Promise.all(updates);
      setStatusMessage("Actualización completada: todos los productos existentes ahora tienen costoProduccion calculado.");
    } catch (error) {
      console.error("Error actualizando productos:", error);
      setStatusMessage("Error actualizando productos. Revisa la consola para más detalles.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="space-y-8 p-6 bg-slate-50 rounded-3xl shadow-sm border border-slate-200">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-slate-500 uppercase tracking-[0.25em]">Calculadora de inversión</p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-900">Costo de producción por lote</h1>
          <p className="mt-2 text-sm text-slate-600 max-w-2xl">
            Ajusta el precio por kilo de cada ingrediente y obtén el costo de producción del melado, la masa, el total del lote y el costo por paquete.
          </p>
        </div>
        <button
          type="button"
          onClick={handleUpdateAllProducts}
          disabled={isSaving}
          className="rounded-full bg-amber-500 px-5 py-3 text-sm font-semibold text-white shadow transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving ? "Actualizando productos..." : "Actualizar costo en DB"}
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-3xl bg-white p-5 shadow-sm border border-slate-200">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Melado</p>
          <p className="mt-4 text-3xl font-semibold text-slate-900">{formatCurrency(totalMelado)}</p>
          <p className="mt-2 text-sm text-slate-500">Costo total de ingredientes del melado</p>
        </div>
        <div className="rounded-3xl bg-white p-5 shadow-sm border border-slate-200">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Masa</p>
          <p className="mt-4 text-3xl font-semibold text-slate-900">{formatCurrency(totalMasa)}</p>
          <p className="mt-2 text-sm text-slate-500">Costo total de la masa</p>
        </div>
        <div className="rounded-3xl bg-white p-5 shadow-sm border border-slate-200">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Hechura</p>
          <p className="mt-4 text-3xl font-semibold text-slate-900">{formatCurrency(totalHechura)}</p>
          <p className="mt-2 text-sm text-slate-500">Costo total del lote</p>
        </div>
        <div className="rounded-3xl bg-white p-5 shadow-sm border border-slate-200">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Por paquete</p>
          <p className="mt-4 text-3xl font-semibold text-slate-900">{formatCurrency(costoPorPaquete)}</p>
          <p className="mt-2 text-sm text-slate-500">Costo estimado por paquete</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">Precios por kilo</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {ingredientList.map((ingredient) => (
              <label key={ingredient.key} className="space-y-2">
                <span className="block text-sm font-medium text-slate-700">{ingredient.label}</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={prices[ingredient.key]}
                  onChange={(event) => handleInputChange(ingredient.key, event.target.value)}
                  className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-200"
                  placeholder="0.00"
                />
              </label>
            ))}
          </div>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">Resumen rápido</h2>
          <div className="mt-5 space-y-4">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Melado</p>
              <p className="mt-2 text-xl font-semibold text-slate-900">{formatCurrency(totalMelado)}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Masa</p>
              <p className="mt-2 text-xl font-semibold text-slate-900">{formatCurrency(totalMasa)}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Costo total</p>
              <p className="mt-2 text-xl font-semibold text-slate-900">{formatCurrency(totalHechura)}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Costo por paquete</p>
              <p className="mt-2 text-xl font-semibold text-slate-900">{formatCurrency(costoPorPaquete)}</p>
            </div>
          </div>
          {statusMessage && (
            <p className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">{statusMessage}</p>
          )}
        </div>
      </div>
    </section>
  );
}
