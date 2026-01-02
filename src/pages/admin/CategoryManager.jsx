import React, { useState, useEffect } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import axiosClient from "../../api/axiosClient";
import { toast } from "react-toastify";
import { FaPlus, FaTags, FaTrash, FaEdit, FaTimes } from "react-icons/fa"; // Agregamos FaEdit y FaTimes

const CategoryManager = () => {
  const [categories, setCategories] = useState([]);
  const [categoryName, setCategoryName] = useState("");
  const [loading, setLoading] = useState(false);

  // Estado para saber si estamos editando (Guarda el objeto categoría o null)
  const [editingCategory, setEditingCategory] = useState(null);

  // 1. Cargar categorías
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

  // 2. Manejar Submit (Crear O Editar)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!categoryName.trim()) return;

    setLoading(true);
    try {
      if (editingCategory) {
        // MODO EDICIÓN
        await axiosClient.put(`/categories/${editingCategory._id}`, {
          name: categoryName,
        });
        toast.success("✅ Categoría actualizada");
      } else {
        // MODO CREACIÓN
        await axiosClient.post("/categories", { name: categoryName });
        toast.success("✅ Categoría creada");
      }

      resetForm();
      fetchCategories();
    } catch (error) {
      toast.error("Error al guardar categoría");
    } finally {
      setLoading(false);
    }
  };

  // 3. Preparar el formulario para Editar
  const handleEditClick = (category) => {
    setEditingCategory(category);
    setCategoryName(category.name);
  };

  // 4. Cancelar edición
  const resetForm = () => {
    setEditingCategory(null);
    setCategoryName("");
  };

  // 5. Eliminar Categoría
  const handleDelete = async (id) => {
    if (
      window.confirm(
        "¿Eliminar esta categoría? Esto podría afectar productos asociados."
      )
    ) {
      try {
        await axiosClient.delete(`/categories/${id}`);
        toast.success("Categoría eliminada");
        // Si estábamos editando la que borramos, limpiar form
        if (editingCategory?._id === id) resetForm();
        fetchCategories();
      } catch (error) {
        toast.error("No se pudo eliminar");
      }
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
            Gestiona, edita o elimina los departamentos de la tienda.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* --- IZQUIERDA: FORMULARIO --- */}
          <div className="md:col-span-1">
            <div
              className={`p-6 rounded-xl shadow-sm border border-gray-100 sticky top-24 transition-colors ${
                editingCategory ? "bg-indigo-50 border-indigo-200" : "bg-white"
              }`}
            >
              <h3 className="font-bold text-gray-700 mb-4 flex justify-between items-center">
                {editingCategory ? "Editar Categoría" : "Nueva Categoría"}
                {editingCategory && (
                  <button
                    onClick={resetForm}
                    className="text-xs text-red-500 hover:underline flex items-center gap-1"
                  >
                    <FaTimes /> Cancelar
                  </button>
                )}
              </h3>

              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                    Nombre
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                    placeholder="Ej: Colchones"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full text-white font-bold py-3 rounded-lg transition-all flex justify-center items-center gap-2 ${
                    editingCategory
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-indigo-600 hover:bg-indigo-700"
                  }`}
                >
                  {loading ? (
                    "Guardando..."
                  ) : (
                    <>
                      {editingCategory ? <FaEdit /> : <FaPlus />}
                      {editingCategory ? " Actualizar" : " Crear"}
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
                    className={`p-4 flex justify-between items-center transition-colors ${
                      editingCategory?._id === cat._id
                        ? "bg-indigo-50"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-800">
                        {cat.name}
                      </span>
                      <span className="text-xs text-gray-400 font-mono">
                        /{cat.slug}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Botón Editar */}
                      <button
                        onClick={() => handleEditClick(cat)}
                        className="p-2 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <FaEdit />
                      </button>

                      {/* Botón Borrar */}
                      <button
                        onClick={() => handleDelete(cat._id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar"
                      >
                        <FaTrash />
                      </button>
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
