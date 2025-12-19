import React, { useState, useEffect } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import axiosClient from "../../api/axiosClient";
import { toast } from "react-toastify";
import {
  FaPercentage,
  FaCreditCard,
  FaSave,
  FaTrash,
  FaPlus,
} from "react-icons/fa";

const FinancialManager = () => {
  const [loading, setLoading] = useState(false);

  // Estado principal
  const [config, setConfig] = useState({
    cashDiscount: 10,
    cardPlans: [],
  });

  // 1. Cargar Configuración Actual
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const { data } = await axiosClient.get("/financial");
        // Si viene data, la usamos, sino dejamos defaults
        if (data)
          setConfig({
            cashDiscount: data.cashDiscount || 0,
            cardPlans: data.cardPlans || [],
          });
      } catch (error) {
        console.error(error);
        toast.error("Error al cargar configuración financiera");
      }
    };
    fetchConfig();
  }, []);

  // 2. Manejadores de cambios
  const handleDiscountChange = (e) => {
    setConfig({ ...config, cashDiscount: Number(e.target.value) });
  };

  // Cambios dentro de un plan específico (Array)
  const handlePlanChange = (index, field, value) => {
    const updatedPlans = [...config.cardPlans];
    updatedPlans[index][field] = field === "name" ? value : Number(value);
    setConfig({ ...config, cardPlans: updatedPlans });
  };

  // Agregar nuevo plan vacío
  const addPlan = () => {
    setConfig({
      ...config,
      cardPlans: [
        ...config.cardPlans,
        { name: "", installments: 3, interestRate: 0, isActive: true },
      ],
    });
  };

  // Borrar un plan
  const removePlan = (index) => {
    const updatedPlans = config.cardPlans.filter((_, i) => i !== index);
    setConfig({ ...config, cardPlans: updatedPlans });
  };

  // 3. Guardar cambios en Backend
  const handleSave = async () => {
    setLoading(true);
    try {
      // Enviamos todo el objeto config al backend
      await axiosClient.put("/financial", config);
      toast.success("✅ Precios actualizados en todo el catálogo");
    } catch (error) {
      console.error(error);
      toast.error("Error al guardar cambios");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <FaPercentage className="text-indigo-600" /> Configuración
              Financiera
            </h1>
            <p className="text-gray-500">
              Controla los precios y las cuotas de tu tienda.
            </p>
          </div>
          <button
            onClick={handleSave}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg shadow-lg font-bold flex items-center gap-2 transition-transform active:scale-95"
          >
            {loading ? (
              "Guardando..."
            ) : (
              <>
                <FaSave /> Guardar Cambios
              </>
            )}
          </button>
        </div>

        {/* SECCIÓN 1: PAGO CONTADO */}
        {/* SECCIÓN 1: CONFIGURACIÓN PRECIO LISTA */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
          <h2 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
            <span className="bg-green-100 text-green-700 p-2 rounded-lg">
              <FaPercentage />
            </span>
            {/* CAMBIAMOS EL TÍTULO */}
            Margen Precio de Lista
          </h2>
          <div className="flex items-center gap-4">
            <div className="relative w-full max-w-xs">
              <input
                type="number"
                value={config.cashDiscount} // Usamos la misma variable en DB para no migrar datos
                onChange={handleDiscountChange}
                className="w-full border-2 border-gray-200 rounded-lg p-3 pr-10 focus:border-indigo-500 outline-none text-lg font-bold text-gray-700"
              />
              <span className="absolute right-4 top-4 text-gray-400 font-bold">
                %
              </span>
            </div>

            {/* CAMBIAMOS LA EXPLICACIÓN */}
            <div className="text-sm text-gray-500">
              <p>
                Este porcentaje <strong>se sumará</strong> al Precio Base para
                mostrar el "Precio de Lista" tachado.
              </p>
              <p className="text-xs mt-1 text-gray-400">
                (Ej: Si pones 45%, un producto de $100 se mostrará con lista
                $145).
              </p>
            </div>
          </div>
        </div>

        {/* SECCIÓN 2: PLANES DE TARJETA */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-700 flex items-center gap-2">
              <span className="bg-indigo-100 text-indigo-700 p-2 rounded-lg">
                <FaCreditCard />
              </span>
              Planes de Cuotas (Tarjetas)
            </h2>
            <button
              onClick={addPlan}
              className="text-indigo-600 hover:text-indigo-800 font-bold text-sm flex items-center gap-1"
            >
              <FaPlus /> Agregar Plan
            </button>
          </div>

          <div className="space-y-4">
            {config.cardPlans.map((plan, index) => (
              <div
                key={index}
                className="flex flex-col md:flex-row gap-4 items-end md:items-center bg-gray-50 p-4 rounded-lg border border-gray-200"
              >
                <div className="flex-1 w-full">
                  <label className="text-xs font-bold text-gray-500 uppercase">
                    Nombre Plan
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Ahora 12"
                    value={plan.name}
                    onChange={(e) =>
                      handlePlanChange(index, "name", e.target.value)
                    }
                    className="w-full border rounded p-2"
                  />
                </div>

                <div className="w-24">
                  <label className="text-xs font-bold text-gray-500 uppercase">
                    Cuotas
                  </label>
                  <input
                    type="number"
                    value={plan.installments}
                    onChange={(e) =>
                      handlePlanChange(index, "installments", e.target.value)
                    }
                    className="w-full border rounded p-2 text-center font-bold"
                  />
                </div>

                <div className="w-32 relative">
                  <label className="text-xs font-bold text-gray-500 uppercase">
                    Interés (%)
                  </label>
                  <input
                    type="number"
                    value={plan.interestRate}
                    onChange={(e) =>
                      handlePlanChange(index, "interestRate", e.target.value)
                    }
                    className="w-full border rounded p-2 text-right pr-6"
                  />
                  <span className="absolute right-2 bottom-2 text-gray-500 text-sm">
                    %
                  </span>
                </div>

                <button
                  onClick={() => removePlan(index)}
                  className="p-3 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Eliminar este plan"
                >
                  <FaTrash />
                </button>
              </div>
            ))}

            {config.cardPlans.length === 0 && (
              <p className="text-center text-gray-400 py-4 italic">
                No tienes planes de tarjeta configurados.
              </p>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default FinancialManager;
