import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../../components/layout/AdminLayout";
import { useProducts } from "../../hooks/useProducts";
import { formatPrice } from "../../utils/formatPrice";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSpinner,
  FaSearch,
  FaAngleLeft,
  FaAngleRight,
  FaCheckSquare,
} from "react-icons/fa";
import axiosClient from "../../api/axiosClient";
import { toast } from "react-toastify";

const Dashboard = () => {
  // 1. Data del Backend
  const { products, loading, error, refetch } = useProducts(true);

  // 2. Estados Locales para UI
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); // Default: 10 por página
  const [selectedIds, setSelectedIds] = useState([]); // Para selección múltiple

  // --- LÓGICA DE FILTRADO ---
  const filteredProducts = products.filter((product) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      product.name.toLowerCase().includes(term) ||
      product.sku.toLowerCase().includes(term) ||
      product.category?.name.toLowerCase().includes(term)
    );
  });

  // --- LÓGICA DE PAGINACIÓN ---
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentProducts = filteredProducts.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Resetear a página 1 si se busca algo
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, itemsPerPage]);

  // --- ACCIONES INDIVIDUALES ---
  const handleDelete = async (id) => {
    if (window.confirm("¿Eliminar este producto?")) {
      try {
        await axiosClient.delete(`/products/${id}`);
        toast.success("Producto eliminado");
        refetch();
      } catch (error) {
        toast.error("Error al eliminar");
      }
    }
  };

  const handleToggleStatus = async (product) => {
    try {
      const newStatus = !product.isActive;
      await axiosClient.put(`/products/${product._id}`, {
        isActive: newStatus,
      });
      toast.info(newStatus ? "Publicado 🟢" : "Pausado ⚫");
      refetch();
    } catch (error) {
      toast.error("Error al cambiar estado");
    }
  };

  // --- ACCIONES MÚLTIPLES (BULK) ---
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      // Seleccionar TODOS los de la página actual (o todos los filtrados)
      const idsOnPage = currentProducts.map((p) => p._id);
      setSelectedIds(idsOnPage);
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleBulkDelete = async () => {
    if (
      window.confirm(
        `¿Estás SEGURO de eliminar ${selectedIds.length} productos? Esta acción no se deshace.`
      )
    ) {
      try {
        // Opción Pro: Crear endpoint de deleteMany en backend.
        // Opción Rápida (Loop):
        const promises = selectedIds.map((id) =>
          axiosClient.delete(`/products/${id}`)
        );
        await Promise.all(promises);

        toast.success(`Se eliminaron ${selectedIds.length} productos`);
        setSelectedIds([]);
        refetch();
      } catch (error) {
        toast.error("Error al eliminar algunos productos");
      }
    }
  };

  return (
    <AdminLayout>
      {/* 1. ENCABEZADO Y CONTROLES SUPERIORES */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Inventario</h1>
          <p className="text-gray-500 text-sm">
            Total productos: <b>{products.length}</b>
          </p>
        </div>

        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          {/* BUSCADOR */}
          <div className="relative group w-full md:w-64">
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar nombre, SKU..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* BOTÓN NUEVO */}
          <Link
            to="/admin/products/new"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow-md flex items-center gap-2 font-bold text-sm transition-transform active:scale-95"
          >
            <FaPlus /> Nuevo
          </Link>
        </div>
      </div>

      {/* 2. BARRA DE ACCIONES MÚLTIPLES (Aparece si seleccionas) */}
      {selectedIds.length > 0 && (
        <div className="bg-indigo-50 border border-indigo-200 p-3 rounded-lg mb-4 flex justify-between items-center animate-pulse-slow">
          <span className="text-indigo-800 font-bold text-sm flex items-center gap-2">
            <FaCheckSquare /> {selectedIds.length} seleccionados
          </span>
          <div className="flex gap-2">
            <button
              onClick={handleBulkDelete}
              className="bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-2 rounded-lg font-bold shadow-sm transition-colors"
            >
              <FaTrash /> Eliminar Selección
            </button>
            <button
              onClick={() => setSelectedIds([])}
              className="text-gray-500 text-xs px-3 hover:underline"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* 3. TABLA DE DATOS */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading && (
          <div className="p-20 text-center flex justify-center text-indigo-500">
            <FaSpinner className="animate-spin text-3xl" />
          </div>
        )}

        {error && <div className="p-10 text-center text-red-500">{error}</div>}

        {!loading && !error && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left whitespace-nowrap">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider font-semibold border-b border-gray-100">
                  <tr>
                    {/* CHECKBOX CABECERA */}
                    <th className="p-4 w-10">
                      <input
                        type="checkbox"
                        className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer w-4 h-4"
                        onChange={handleSelectAll}
                        checked={
                          currentProducts.length > 0 &&
                          currentProducts.every((p) =>
                            selectedIds.includes(p._id)
                          )
                        }
                      />
                    </th>
                    <th className="p-4">Producto</th>
                    <th className="p-4 text-center">Estado</th>
                    <th className="p-4">SKU / Categoría</th>
                    <th className="p-4 text-center">Stock</th>
                    <th className="p-4 text-right">Precio</th>
                    <th className="p-4 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {currentProducts.map((product) => (
                    <tr
                      key={product._id}
                      className={`hover:bg-indigo-50/30 transition-colors ${
                        selectedIds.includes(product._id) ? "bg-indigo-50" : ""
                      }`}
                    >
                      {/* CHECKBOX FILA */}
                      <td className="p-4">
                        <input
                          type="checkbox"
                          className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer w-4 h-4"
                          checked={selectedIds.includes(product._id)}
                          onChange={() => handleSelectRow(product._id)}
                        />
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded border border-gray-200 bg-white shrink-0 overflow-hidden">
                            <img
                              src={
                                product.images?.[0]?.url ||
                                "https://via.placeholder.com/50"
                              }
                              className="w-full h-full object-cover"
                              alt=""
                            />
                          </div>
                          <span
                            className="font-semibold text-gray-700 text-sm max-w-[200px] truncate block"
                            title={product.name}
                          >
                            {product.name}
                          </span>
                        </div>
                      </td>

                      <td className="p-4 text-center">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={product.isActive}
                            onChange={() => handleToggleStatus(product)}
                          />
                          <div className="w-8 h-4 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-green-500"></div>
                        </label>
                      </td>

                      <td className="p-4">
                        <div className="flex flex-col text-xs">
                          <span className="font-mono text-gray-500 bg-gray-100 px-1 rounded w-fit mb-1">
                            {product.sku}
                          </span>
                          <span className="text-indigo-500">
                            {product.category?.name || "Sin Cat"}
                          </span>
                        </div>
                      </td>

                      <td className="p-4 text-center">
                        <span
                          className={`text-xs font-bold px-2 py-1 rounded border ${
                            product.stock === 0
                              ? "bg-red-50 text-red-600 border-red-100"
                              : "bg-green-50 text-green-700 border-green-100"
                          }`}
                        >
                          {product.stock}
                        </span>
                      </td>

                      <td className="p-4 text-right">
                        <p className="font-bold text-gray-800 text-sm">
                          {formatPrice(product.prices?.cash)}
                        </p>
                      </td>

                      <td className="p-4 text-center">
                        <div className="flex justify-center gap-2">
                          <Link
                            to={`/admin/products/edit/${product._id}`}
                            className="text-gray-400 hover:text-indigo-600 transition-colors"
                          >
                            <FaEdit size={16} />
                          </Link>
                          <button
                            onClick={() => handleDelete(product._id)}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <FaTrash size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 4. FOOTER PAGINACIÓN Y CONTROL */}
            {filteredProducts.length > 0 && (
              <div className="bg-gray-50 p-4 border-t border-gray-200 flex flex-col md:flex-row items-center justify-between gap-4">
                {/* Selector Items por página */}
                <div className="flex items-center text-sm text-gray-500">
                  <span className="mr-2">Ver filas:</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
                    className="border border-gray-300 rounded p-1 bg-white focus:outline-indigo-500"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                </div>

                {/* Texto Info */}
                <div className="text-xs text-gray-400">
                  Mostrando {startIndex + 1} -{" "}
                  {Math.min(startIndex + itemsPerPage, filteredProducts.length)}{" "}
                  de {filteredProducts.length}
                </div>

                {/* Botones Prev/Next */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className="p-2 border rounded hover:bg-white disabled:opacity-50 disabled:hover:bg-transparent"
                  >
                    <FaAngleLeft />
                  </button>
                  <span className="text-sm font-bold text-gray-700 px-2">
                    Página {currentPage} de {totalPages}
                  </span>
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className="p-2 border rounded hover:bg-white disabled:opacity-50 disabled:hover:bg-transparent"
                  >
                    <FaAngleRight />
                  </button>
                </div>
              </div>
            )}

            {filteredProducts.length === 0 && (
              <div className="p-10 text-center text-gray-400 italic">
                No se encontraron productos con tu búsqueda.
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
