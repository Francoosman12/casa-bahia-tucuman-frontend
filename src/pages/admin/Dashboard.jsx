import React from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../../components/layout/AdminLayout";
import { useProducts } from "../../hooks/useProducts";
import { formatPrice } from "../../utils/formatPrice";
import { FaPlus, FaEdit, FaTrash, FaSpinner } from "react-icons/fa";
import axiosClient from "../../api/axiosClient";
import { toast } from "react-toastify";

const Dashboard = () => {
  // 1. Pasamos 'true' para traer TODOS los productos (incluso los ocultos)
  const { products, loading, error, refetch } = useProducts(true);

  // --- BORRAR PRODUCTO ---
  const handleDelete = async (id) => {
    if (window.confirm("¿Seguro que quieres eliminar este producto?")) {
      try {
        await axiosClient.delete(`/products/${id}`);
        toast.success("Producto eliminado");
        refetch();
      } catch (error) {
        console.error(error);
        toast.error("No se pudo eliminar el producto");
      }
    }
  };

  // --- CAMBIAR ESTADO (SWITCH) ---
  const handleToggleStatus = async (product) => {
    try {
      // Calculamos el nuevo estado (lo contrario al actual)
      const newStatus = !product.isActive;

      // Enviamos la actualización al backend
      // Nota: Si tu backend usa Multer estricto, quizás requiera FormData,
      // pero usualmente Express acepta JSON si no van archivos.
      await axiosClient.put(`/products/${product._id}`, {
        isActive: newStatus,
      });

      toast.info(newStatus ? "Producto PUBLICADO 🟢" : "Producto PAUSADO ⚫");
      refetch(); // Recargamos la lista visualmente
    } catch (error) {
      console.error(error);
      toast.error("Error al actualizar estado");
    }
  };

  return (
    <AdminLayout>
      {/* ENCABEZADO */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Inventario</h1>
          <p className="text-gray-500">Gestiona tus productos y stock</p>
        </div>
        <Link
          to="/admin/products/new"
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-lg shadow-lg shadow-indigo-200 flex items-center gap-2 font-medium transition-all transform hover:-translate-y-1"
        >
          <FaPlus /> Nuevo Producto
        </Link>
      </div>

      {/* TABLA DE DATOS */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading && (
          <div className="p-10 text-center flex justify-center text-indigo-500">
            <FaSpinner className="animate-spin text-2xl" />
          </div>
        )}

        {error && <div className="p-10 text-center text-red-500">{error}</div>}

        {!loading && !error && (
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider font-semibold border-b border-gray-100">
              <tr>
                <th className="p-4">Producto</th>
                <th className="p-4 text-center">Estado</th>{" "}
                {/* Nueva Columna */}
                <th className="p-4">SKU / Categoría</th>
                <th className="p-4 text-center">Stock</th> {/* Nueva Columna */}
                <th className="p-4 text-right">Precio Final</th>
                <th className="p-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((product) => (
                <tr
                  key={product._id}
                  className={`hover:bg-indigo-50/30 transition-colors ${
                    !product.isActive ? "bg-gray-50 opacity-90" : ""
                  }`}
                >
                  {/* 1. INFO BÁSICA */}
                  <td className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 shrink-0">
                        {product.images?.[0]?.url ? (
                          <img
                            src={product.images[0].url}
                            className="w-full h-full object-cover"
                            alt={product.name}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
                            Sin Foto
                          </div>
                        )}
                      </div>
                      <span className="font-semibold text-gray-800 line-clamp-1">
                        {product.name}
                      </span>
                    </div>
                  </td>

                  {/* 2. SWITCH ESTADO (NUEVO) */}
                  <td className="p-4 text-center">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={product.isActive}
                        onChange={() => handleToggleStatus(product)}
                      />
                      <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500"></div>
                    </label>
                    <div className="text-[10px] font-bold text-gray-400 uppercase mt-1">
                      {product.isActive ? "Publicado" : "Oculto"}
                    </div>
                  </td>

                  {/* 3. SKU */}
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded w-fit mb-1">
                        {product.sku}
                      </span>
                      <span className="text-xs text-indigo-500 font-medium">
                        {product.category?.name || "Sin Categoría"}
                      </span>
                    </div>
                  </td>

                  {/* 4. STOCK (NUEVO) */}
                  <td className="p-4 text-center">
                    <span
                      className={`px-3 py-1 rounded-lg text-sm font-bold border 
                        ${
                          product.stock === 0
                            ? "bg-red-50 text-red-600 border-red-100"
                            : "bg-gray-50 text-gray-700 border-gray-200"
                        }`}
                    >
                      {product.stock}
                    </span>
                  </td>

                  {/* 5. PRECIO */}
                  <td className="p-4 text-right">
                    <p className="font-bold text-green-600 text-lg">
                      {formatPrice(product.prices?.cash)}
                    </p>
                    <p className="text-xs text-gray-400 line-through">
                      {formatPrice(product.prices?.base)}
                    </p>
                  </td>

                  {/* 6. ACCIONES */}
                  <td className="p-4 text-center">
                    <div className="flex justify-center gap-2">
                      <Link
                        to={`/admin/products/edit/${product._id}`}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <FaEdit />
                      </Link>

                      <button
                        onClick={() => handleDelete(product._id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {products.length === 0 && (
                <tr>
                  <td
                    colSpan="6"
                    className="p-8 text-center text-gray-400 italic"
                  >
                    No hay productos cargados en el sistema.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
