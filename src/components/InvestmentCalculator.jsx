import { useMemo, useState, useEffect } from "react";
import { getCatalinas, updateCatalina } from "../services/catalinaService";
import { getRecipes, createRecipe, updateRecipe } from "../services/recipeService";
import { FiPlus, FiTrash2, FiSave, FiAlertCircle } from "react-icons/fi";

const formatCurrency = (value) => {
  return Number(value).toLocaleString("es-VE", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const defaultTemplate = {
  nombre: "Nueva Receta Tradicional",
  rendimientoEstimado: 28, // Paquetes que rinde
  unidadesPorPaquete: 1,
  tipoProductoAsociado: 'Paquete',
  usaMelado: true, // Por defecto, es receta completa
  rendimientoMelado: 24, // Litros totales del melado
  meladoUsadoPorTanda: 6.8, // Litros usados por cada tanda
  productoAsociado: "",
  ingredientes: [
    { nombre: "Papelón", cantidad: 12, unidad: "kg", costoUnitario: 0, categoria: "Melado" },
    { nombre: "Azúcar", cantidad: 7, unidad: "kg", costoUnitario: 0, categoria: "Melado" },
    { nombre: "Anís", cantidad: 0.04, unidad: "kg", costoUnitario: 0, categoria: "Melado" },
    { nombre: "Clavitos", cantidad: 0.01, unidad: "kg", costoUnitario: 0, categoria: "Melado" },
    { nombre: "Sal", cantidad: 0.2, unidad: "kg", costoUnitario: 0, categoria: "Melado" },
    { nombre: "Harina", cantidad: 9.5, unidad: "kg", costoUnitario: 0, categoria: "Masa" },
    { nombre: "Bicarbonato", cantidad: 0.08, unidad: "kg", costoUnitario: 0, categoria: "Masa" },
    { nombre: "Margarina", cantidad: 0.9, unidad: "kg", costoUnitario: 0, categoria: "Masa" },
    { nombre: "Canela", cantidad: 0.015, unidad: "kg", costoUnitario: 0, categoria: "Masa" },
  ],
};

export default function InvestmentCalculator() {
  const [recipes, setRecipes] = useState([]);
  const [catalinas, setCatalinas] = useState([]);
  const [activeRecipe, setActiveRecipe] = useState(null);
  
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [fetchedRecipes, fetchedCatalinas] = await Promise.all([
        getRecipes(),
        getCatalinas(),
      ]);
      setRecipes(fetchedRecipes || []);
      setCatalinas(fetchedCatalinas || []);

      if (fetchedRecipes && fetchedRecipes.length > 0) {
        loadRecipeIntoState(fetchedRecipes[0]);
      } else {
        setActiveRecipe(JSON.parse(JSON.stringify(defaultTemplate)));
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadRecipeIntoState = (recipe) => {
    const recipeCopy = JSON.parse(JSON.stringify(recipe));
    if (recipeCopy.productoAsociado && typeof recipeCopy.productoAsociado === "object") {
      recipeCopy.productoAsociado = recipeCopy.productoAsociado._id;
    }
    setActiveRecipe(recipeCopy);
  };

  const handleRecipeSelection = (e) => {
    const id = e.target.value;
    if (id === "new") {
      setActiveRecipe(JSON.parse(JSON.stringify(defaultTemplate)));
    } else {
      const selected = recipes.find((r) => r._id === id);
      if (selected) loadRecipeIntoState(selected);
    }
    setStatusMessage("");
  };

  const handleGeneralChange = (field, value) => {
    if (field === 'usaMelado') {
       setActiveRecipe((prev) => ({ ...prev, [field]: value === 'true' || value === true }));
    } else {
       setActiveRecipe((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleIngredientChange = (index, field, value) => {
    const newIngredients = [...activeRecipe.ingredientes];
    if (field === 'cantidad' || field === 'costoUnitario') {
       newIngredients[index][field] = value === '' ? '' : Number(value);
    } else {
       newIngredients[index][field] = value;
    }
    setActiveRecipe((prev) => ({ ...prev, ingredientes: newIngredients }));
  };

  const handleAddIngredient = () => {
    setActiveRecipe((prev) => ({
      ...prev,
      ingredientes: [
        ...prev.ingredientes,
        { nombre: "", cantidad: 0, unidad: "kg", costoUnitario: 0, categoria: prev.usaMelado ? "Masa" : "General" },
      ],
    }));
  };

  const handleRemoveIngredient = (index) => {
    const newIngredients = [...activeRecipe.ingredientes];
    newIngredients.splice(index, 1);
    setActiveRecipe((prev) => ({ ...prev, ingredientes: newIngredients }));
  };

  // ----------------------------------------------------
  // CÁLCULOS MATEMÁTICOS (INCLUYE LÓGICA DE FASES / MELADO)
  // ----------------------------------------------------
  const calculos = useMemo(() => {
    if (!activeRecipe || !activeRecipe.ingredientes) return { totalTanda: 0, costoUnidad: 0 };
    
    let totalMelado = 0;
    let totalMasa = 0;

    activeRecipe.ingredientes.forEach(ing => {
      const costoIngrediente = (Number(ing.cantidad) || 0) * (Number(ing.costoUnitario) || 0);
      
      if (activeRecipe.usaMelado && ing.categoria === 'Melado') {
        totalMelado += costoIngrediente;
      } else {
        // Todo lo demás (Masa o "General") se suma a la Tanda Principal
        totalMasa += costoIngrediente;
      }
    });

    let costoTotalTanda = totalMasa;
    let costoTotalMelado = 0;
    let proporcionMeladoElegida = 0;

    // Si tiene la opción de "Calculo de Melado" activa:
    if (activeRecipe.usaMelado) {
       const rendMeladoTotal = Number(activeRecipe.rendimientoMelado) || 1; 
       const cantMeladoUsado = Number(activeRecipe.meladoUsadoPorTanda) || 0;
       
       const costoPorLitroMelado = totalMelado / rendMeladoTotal;
       proporcionMeladoElegida = costoPorLitroMelado * cantMeladoUsado;
       
       // El costo base del total de la tanda es la suma de la masa más el costo (redondeado hacia arriba) 
       // de la proporción de melado que usaremos
       costoTotalTanda = Math.ceil(proporcionMeladoElegida) + totalMasa;
       costoTotalMelado = totalMelado; // referencial
    }

    const rendEstimadoGeneral = Number(activeRecipe.rendimientoEstimado) || 1;
    const costoPorPaquete = costoTotalTanda / rendEstimadoGeneral;
    const unidades = Number(activeRecipe.unidadesPorPaquete) || 1;
    const costoIndividual = costoPorPaquete / unidades;

    const costoFinalUtilizadoDBSincronizacion = activeRecipe.tipoProductoAsociado === 'Unidad' 
      ? costoIndividual 
      : costoPorPaquete;

    return { 
      totalTanda: costoTotalTanda, 
      costoUnidad: costoPorPaquete, // Mantenemos el nombre variable por compatibilidad (es el costo base de su "rendimientoEstimado")
      costoIndividual: costoIndividual,
      costoElegidoMargen: costoFinalUtilizadoDBSincronizacion,
      totalMasa, 
      totalMelado: costoTotalMelado, 
      costoMeladoUsado: proporcionMeladoElegida 
    };
  }, [activeRecipe]);

  const productoVinculado = useMemo(() => {
    if (!activeRecipe || !activeRecipe.productoAsociado) return null;
    return catalinas.find((c) => c._id === activeRecipe.productoAsociado) || null;
  }, [activeRecipe, catalinas]);

  const margenReal = useMemo(() => {
    if (!productoVinculado || !productoVinculado.precio || calculos.costoElegidoMargen === 0) return 0;
    const precio = productoVinculado.precio;
    return ((precio - calculos.costoElegidoMargen) / precio) * 100; // Margen sobre la Venta
  }, [productoVinculado, calculos.costoElegidoMargen]);

  const marcajeSobreCosto = useMemo(() => {
    if (!productoVinculado || !productoVinculado.precio || calculos.costoElegidoMargen === 0) return 0;
    const precio = productoVinculado.precio;
    return ((precio - calculos.costoElegidoMargen) / calculos.costoElegidoMargen) * 100; // Marcaje sobre el Costo
  }, [productoVinculado, calculos.costoElegidoMargen]);

  const gananciaNetaBruta = useMemo(() => {
    if (!productoVinculado || !productoVinculado.precio) return 0;
    return productoVinculado.precio - calculos.costoElegidoMargen;
  }, [productoVinculado, calculos.costoElegidoMargen]);


  const saveRecipeData = async () => {
    setIsSaving(true);
    setStatusMessage("");
    try {
      const dataToSave = { ...activeRecipe };
      if (dataToSave.productoAsociado === "") {
        dataToSave.productoAsociado = null;
      }
      
      let resRecipe;
      if (dataToSave._id) {
        resRecipe = await updateRecipe(dataToSave._id, dataToSave);
        setStatusMessage("Receta actualizada con éxito.");
      } else {
        resRecipe = await createRecipe(dataToSave);
        setStatusMessage("Receta creada con éxito.");
      }

      // Automatically update the Catalina product cost if tied
      if (resRecipe.productoAsociado) {
        const prodId = typeof resRecipe.productoAsociado === 'object' ? resRecipe.productoAsociado._id : resRecipe.productoAsociado;
        const linkedCat = catalinas.find(c => c._id === prodId);
        if (linkedCat) {
          const catUpdate = { ...linkedCat, costoProduccion: Number(calculos.costoElegidoMargen.toFixed(2)) };
          await updateCatalina(prodId, catUpdate);
          setStatusMessage(`Receta y costo de BD actualizados (Costo guardado: ${formatCurrency(calculos.costoElegidoMargen)} por ${activeRecipe.tipoProductoAsociado})`);
        }
      }

      const [fetchedRecipes, fetchedCatalinas] = await Promise.all([
        getRecipes(),
        getCatalinas(),
      ]);
      setRecipes(fetchedRecipes || []);
      setCatalinas(fetchedCatalinas || []);
      
      const newSelected = (fetchedRecipes || []).find((r) => r._id === resRecipe._id);
      if (newSelected) loadRecipeIntoState(newSelected);

    } catch (error) {
      console.error(error);
      setStatusMessage("Error guardando receta.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return <div className="p-6 text-center text-slate-500">Cargando calculadora...</div>;
  }

  return (
    <section className="space-y-6 sm:space-y-8 p-4 sm:p-6 bg-slate-50 rounded-3xl shadow-sm border border-slate-200">
      {/* Header & Selector */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="w-full lg:max-w-md">
          <p className="text-xs sm:text-sm text-slate-500 uppercase tracking-[0.25em]">Gestión de Recetas</p>
          <div className="mt-2 text-2xl font-semibold text-slate-900 select-wrapper">
             <select 
               value={activeRecipe?._id || "new"}
               onChange={handleRecipeSelection}
               className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2 mt-2 text-lg focus:ring-2 focus:ring-amber-200 focus:border-amber-400 outline-none transition"
             >
               {recipes.map(r => (
                 <option key={r._id} value={r._id}>{r.nombre}</option>
               ))}
               <option value="new">+ Crear nueva receta</option>
             </select>
          </div>
        </div>
        <button
          type="button"
          onClick={saveRecipeData}
          disabled={isSaving}
          className="w-full lg:w-auto flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-6 py-3 text-sm font-semibold text-white shadow transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <FiSave size={18} />
          {isSaving ? "Guardando..." : "Guardar Receta & Costos"}
        </button>
      </div>

      {statusMessage && (
        <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-xl text-sm">
          <FiAlertCircle size={18} />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Bento Grid Stats */}
      {activeRecipe && (
        <>
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            <div className="rounded-3xl bg-white p-4 sm:p-5 shadow-sm border border-slate-200 flex flex-col justify-between">
              <p className="text-[10px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.3em] text-slate-400">Total Tanda</p>
              <p className="mt-2 sm:mt-4 text-xl sm:text-3xl font-semibold text-slate-900 break-words">{formatCurrency(calculos.totalTanda)}</p>
              <p className="mt-1 sm:mt-2 text-[10px] sm:text-xs text-slate-500">
                {activeRecipe.usaMelado ? `(Hechura: Masa + Melado proporc.)` : "Masa (Todos los ingredientes)"}
              </p>
            </div>
            <div className="rounded-3xl bg-white p-4 sm:p-5 shadow-sm border border-slate-200 flex flex-col justify-between">
              <p className="text-[10px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.3em] text-slate-400">Por {activeRecipe.unidadesPorPaquete > 1 ? "Empaque" : "Unidad (C)"}</p>
              <div className="mt-2 sm:mt-4">
                 <p className="text-xl sm:text-3xl font-semibold text-slate-900 break-words">{formatCurrency(calculos.costoUnidad)}</p>
                 {activeRecipe.unidadesPorPaquete > 1 && (
                    <p className="text-sm font-medium text-slate-500 mt-1">C/U Individual: <span className="text-slate-700">{formatCurrency(calculos.costoIndividual)}</span></p>
                 )}
              </div>
            </div>
            <div className="rounded-3xl bg-slate-900 p-4 sm:p-5 shadow-sm border border-slate-800 flex flex-col justify-between">
              <p className="text-[10px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.3em] text-slate-400">Costo vs Venta</p>
              <div className="mt-2 sm:mt-3 flex flex-col">
                <p className="text-xs sm:text-sm font-medium text-slate-400">
                  Costo: <span className="font-semibold">{formatCurrency(calculos.costoElegidoMargen)}</span>
                </p>
                <p className="text-xl sm:text-3xl font-semibold text-white mt-1">
                  {productoVinculado ? formatCurrency(productoVinculado.precio) : "$0.00"}
                </p>
              </div>
              <p className="mt-2 sm:mt-3 border-t border-slate-800 pt-2 text-xs sm:text-sm text-slate-400">
                Limpio: <span className="text-green-400 font-semibold">{formatCurrency(gananciaNetaBruta)}</span>
              </p>
            </div>
            <div className="rounded-3xl bg-amber-500 p-4 sm:p-5 shadow-sm border border-amber-600 flex flex-col justify-between">
              <p className="text-[10px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.3em] text-amber-100">Margen / Marcaje</p>
              <div className="mt-2 sm:mt-4">
                 <p className="text-xl sm:text-3xl font-semibold text-white break-words">
                   {marcajeSobreCosto.toFixed(2)}% <span className="text-sm font-normal opacity-80">(Marcaje)</span>
                 </p>
                 <p className="text-sm font-medium text-amber-100 mt-1">
                   {margenReal.toFixed(2)}% <span className="font-normal opacity-80">(Margen de Venta)</span>
                 </p>
              </div>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1fr_2fr]">
            {/* Formulario Principal de Receta */}
            <div className="space-y-6">
               <div className="rounded-3xl bg-white p-5 sm:p-6 shadow-sm border border-slate-200">
                  <h2 className="text-lg font-semibold text-slate-900 mb-4">Configuración Básica</h2>
                  <div className="space-y-4">
                    <label className="block">
                      <span className="text-sm font-medium text-slate-700">Nombre de la Receta</span>
                      <input 
                        type="text" 
                        value={activeRecipe.nombre} 
                        onChange={(e) => handleGeneralChange('nombre', e.target.value)}
                        className="mt-1 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200"
                      />
                    </label>
                    <label className="block">
                      <div className="flex justify-between">
                         <span className="text-sm font-medium text-slate-700">Producto en Inventario</span>
                         {activeRecipe.productoAsociado && (
                           <select 
                             value={activeRecipe.tipoProductoAsociado || "Paquete"}
                             onChange={(e) => handleGeneralChange('tipoProductoAsociado', e.target.value)}
                             className="text-[10px] bg-slate-100 uppercase tracking-widest px-2 py-0.5 rounded text-amber-700 border border-slate-200 outline-none"
                           >
                             <option value="Paquete">Se vende al mayor</option>
                             <option value="Unidad">Se vende detallado</option>
                           </select>
                         )}
                      </div>
                      <select 
                        value={activeRecipe.productoAsociado || ""}
                        onChange={(e) => handleGeneralChange('productoAsociado', e.target.value)}
                        className="mt-1 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200"
                      >
                        <option value="">Ninguno</option>
                        {catalinas.map(c => (
                          <option key={c._id} value={c._id}>{c.nombre} (Venta: {c.precio}$)</option>
                        ))}
                      </select>
                      <p className="text-[10px] text-slate-400 mt-1">Margen calculado usando el costo del <strong className="text-slate-500">{activeRecipe.tipoProductoAsociado === 'Unidad' ? 'Individual' : 'Empaque'}</strong></p>
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <label className="block">
                        <span className="text-sm font-medium text-slate-700">Rinde (Empaques)</span>
                        <input 
                          type="number" 
                          value={activeRecipe.rendimientoEstimado} 
                          onChange={(e) => handleGeneralChange('rendimientoEstimado', e.target.value)}
                          className="mt-1 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200"
                        />
                      </label>
                      <label className="block">
                        <span className="text-sm font-medium text-slate-700">Trae (Unidades x Emp)</span>
                        <input 
                          type="number" 
                          min="1"
                          value={activeRecipe.unidadesPorPaquete || 1} 
                          onChange={(e) => handleGeneralChange('unidadesPorPaquete', e.target.value)}
                          className="mt-1 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200"
                        />
                      </label>
                    </div>
                  </div>
               </div>

               <div className="rounded-3xl bg-white shadow-sm border border-slate-200 overflow-hidden">
                  <div className="p-4 bg-amber-50/50 border-b border-slate-200 flex items-center justify-between">
                     <span className="font-semibold text-slate-800 text-sm">Separar Fases: Usa Melado Madre</span>
                     <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={activeRecipe.usaMelado} onChange={(e) => handleGeneralChange('usaMelado', e.target.checked)} className="sr-only peer"/>
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                     </label>
                  </div>
                  {activeRecipe.usaMelado && (
                    <div className="p-5 space-y-4">
                      <p className="text-xs text-slate-500">Esta opción te permite añadir ingredientes tipo "Melado/Base" cuyo costo se divide antes de sumarse a tu tanda.</p>
                      <div className="grid grid-cols-2 gap-4">
                        <label className="block">
                          <span className="text-[10px] uppercase text-slate-500 font-semibold mb-1 block">Rendimiento (Ollas)</span>
                          <input 
                            type="number" step="0.01"
                            value={activeRecipe.rendimientoMelado} onChange={(e) => handleGeneralChange('rendimientoMelado', e.target.value)}
                            className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200"
                          />
                        </label>
                        <label className="block">
                          <span className="text-[10px] uppercase text-slate-500 font-semibold mb-1 block">Uso por Tanda</span>
                          <input 
                            type="number" step="0.01"
                            value={activeRecipe.meladoUsadoPorTanda} onChange={(e) => handleGeneralChange('meladoUsadoPorTanda', e.target.value)}
                            className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200"
                          />
                        </label>
                      </div>
                      <div className="text-xs text-amber-700 bg-amber-50 p-2 rounded-lg font-medium">
                         El melado rinde {activeRecipe.rendimientoMelado}. Por cada lit/unid sale en {formatCurrency((calculos.totalMelado / (activeRecipe.rendimientoMelado || 1)))}. Como usas {activeRecipe.meladoUsadoPorTanda}, se suman <strong className="text-slate-900">{formatCurrency(calculos.costoMeladoUsado)}</strong> (redondeado) a la Masa para la Totalización.
                      </div>
                    </div>
                  )}
               </div>
            </div>

            {/* Listado de Ingredientes */}
            <div className="rounded-3xl bg-white p-5 sm:p-6 shadow-sm border border-slate-200 flex flex-col h-full">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">Ingredientes 
                   <span className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded-md">{activeRecipe.ingredientes.length} items</span>
                </h2>
                <button 
                  onClick={handleAddIngredient}
                  className="p-2 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 transition"
                  title="Añadir ingrediente"
                >
                  <FiPlus size={20} />
                </button>
              </div>
              
              {activeRecipe.ingredientes.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-4">No hay ingredientes. Añade uno nuevo.</p>
              ) : (
                <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                  {activeRecipe.ingredientes.map((ing, idx) => (
                    <div key={idx} className={`relative flex flex-col sm:flex-row gap-3 rounded-2xl p-4 border transition ${activeRecipe.usaMelado && ing.categoria === 'Melado' ? 'bg-amber-50/30 border-amber-200' : 'bg-slate-50 border-slate-200'}`}>
                      <div className="flex-1 space-y-3">
                         <div className="flex justify-between items-center gap-2 border-b border-slate-200 pb-2">
                           <input 
                             type="text" 
                             value={ing.nombre} 
                             onChange={(e) => handleIngredientChange(idx, 'nombre', e.target.value)}
                             className="font-medium text-slate-900 bg-transparent outline-none w-full"
                             placeholder="Ej. Harina"
                           />
                           {activeRecipe.usaMelado && (
                             <select 
                               value={ing.categoria || "Masa"} 
                               onChange={(e) => handleIngredientChange(idx, 'categoria', e.target.value)}
                               className="text-xs bg-white border border-slate-300 rounded px-2 py-1 outline-none font-medium text-slate-600 focus:border-amber-400"
                             >
                               <option value="Masa">M/Masa</option>
                               <option value="Melado">B/Melado</option>
                             </select>
                           )}
                           {!activeRecipe.usaMelado && <span className="text-[10px] text-slate-400 px-2 uppercase tracking-wide">General</span>}
                         </div>
                         
                         <div className="grid grid-cols-[1fr_80px_1fr] sm:grid-cols-[1fr_80px_1fr_auto] items-end gap-2">
                            <label className="block">
                               <span className="text-[10px] uppercase text-slate-500 mb-1 block">KGs / Uds</span>
                               <input type="number" min="0" step="0.01" value={ing.cantidad} onChange={(e) => handleIngredientChange(idx, 'cantidad', e.target.value)} className="w-full text-sm rounded-lg border border-slate-300 px-3 py-1.5 outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-200"/>
                            </label>
                            <label className="block">
                               <span className="text-[10px] uppercase text-slate-500 mb-1 block">Tipo</span>
                               <input type="text" value={ing.unidad} onChange={(e) => handleIngredientChange(idx, 'unidad', e.target.value)} className="w-full text-sm rounded-lg border border-slate-300 px-3 py-1.5 outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-200 text-center"/>
                            </label>
                            <label className="block">
                               <span className="text-[10px] uppercase text-slate-500 mb-1 block">Precio x U.</span>
                               <input type="number" min="0" step="0.01" value={ing.costoUnitario} onChange={(e) => handleIngredientChange(idx, 'costoUnitario', e.target.value)} className="w-full text-sm rounded-lg border border-slate-300 px-3 py-1.5 outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-200"/>
                            </label>
                            <div className="hidden sm:block pb-1.5 min-w-[70px] text-right">
                               <span className="text-xs font-semibold text-slate-700">{formatCurrency((Number(ing.cantidad) || 0) * (Number(ing.costoUnitario) || 0))}</span>
                            </div>
                         </div>
                      </div>
                      
                      <div className="absolute top-3 right-3 sm:relative sm:top-0 sm:right-0 flex items-start">
                        <button 
                          onClick={() => handleRemoveIngredient(idx)}
                          className="text-slate-400 hover:text-red-500 hover:bg-slate-200 p-2 rounded-lg transition"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </section>
  );
}

