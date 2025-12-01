import React, { useState, useEffect } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import axiosClient from "../../api/axiosClient";
import { toast } from "react-toastify";
import { FaPlus, FaTags, FaTrash } from "react-icons/fa";

const CategoryManager = () => {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [loading, setLoading] = useState(false);

  // 1. Cargar categorías existentes
  const fetchCategories = async () => {
    try {
      const { data } = await axiosClient.get("/categories");
      setCategories(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // 2. Crear nueva categoría
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newCategory.trim()) return;

    setLoading(true);
    try {
      // El backend espera { name: "..." }
      await axiosClient.post("/categories", { name: newCategory });

      toast.success("✅ Categoría creada");
      setNewCategory(""); // Limpiar input
      fetchCategories(); // Recargar lista
    } catch (error) {
      toast.error("Error al crear categoría");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <FaTags className="text-indigo-600" /> Categorías
          </h1>
          <p className="text-gray-500">
            Organiza los departamentos de tu tienda.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* --- IZQUIERDA: FORMULARIO --- */}
          <div className="md:col-span-1">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-24">
              <h3 className="font-bold text-gray-700 mb-4">Nueva Categoría</h3>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                    Nombre
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="Ej: Colchones"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg transition-all flex justify-center items-center gap-2"
                >
                  {loading ? (
                    "Guardando..."
                  ) : (
                    <>
                      <FaPlus /> Crear
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* --- DERECHA: LISTADO --- */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                <span className="font-semibold text-gray-600">
                  Listado Actual
                </span>
                <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full font-bold">
                  {categories.length} total
                </span>
              </div>

              <ul className="divide-y divide-gray-100">
                {categories.map((cat) => (
                  <li
                    key={cat._id}
                    className="p-4 flex justify-between items-center hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-medium text-gray-800">
                      {cat.name}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-400 font-mono bg-gray-100 px-2 py-1 rounded">
                        /{cat.slug}
                      </span>
                      {/* Botón Borrar (Visual por ahora, o conecta DELETE si quieres) */}
                      {/* <button className="text-red-400 hover:text-red-600"><FaTrash/></button> */}
                    </div>
                  </li>
                ))}
                {categories.length === 0 && (
                  <li className="p-8 text-center text-gray-400 italic">
                    No hay categorías creadas aún.
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default CategoryManager;
