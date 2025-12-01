import React, { useState, useEffect } from "react";
import axiosClient from "../../api/axiosClient"; // Necesitamos esto para cargar categorías
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import ProductCard from "../../components/products/ProductCard";
import { useProducts } from "../../hooks/useProducts";
import { FaFilter, FaThList, FaSearch } from "react-icons/fa";
import { useSearch } from "../../context/SearchContext";

const Home = () => {
  // Datos principales
  const { products, loading: productsLoading, error } = useProducts(false); // false = Solo públicos

  // Estado local para filtros
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("TODOS");
  const { searchTerm, setSearchTerm } = useSearch();

  // Cargar categorías al montar
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const { data } = await axiosClient.get("/categories");
        setCategories(data);
      } catch (error) {
        console.error("Error categorías", error);
      }
    };
    fetchCats();
  }, []);

  // Lógica de Filtrado (Magia ✨)
  const filteredProducts = products.filter((product) => {
    // 1. Filtro por Categoría
    if (
      selectedCategory !== "TODOS" &&
      product.category?._id !== selectedCategory
    ) {
      return false;
    }
    // 2. Filtro por Buscador (Texto)
    if (
      searchTerm &&
      !product.name.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8 flex-1">
        {/* BANNER (Opcional, texto bienvenida) */}
        <div className="mb-8 text-center md:text-left">
          <h1 className="text-3xl font-extrabold text-gray-800">
            Catálogo <span className="text-indigo-600">Online</span>
          </h1>
          <p className="text-gray-500 mt-1">
            Encuentra los mejores precios y financiación de Tucumán.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* 🟦 COLUMNA IZQUIERDA: FILTROS (Sidebar) */}
          <aside className="w-full lg:w-64 shrink-0 space-y-6">
            {/* Buscador Rápido Móvil/Desktop */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
                <FaSearch className="text-indigo-500" /> Buscar
              </h3>
              <input
                type="text"
                placeholder="Mesa, Sillón..."
                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filtro Categorías */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
                <FaFilter className="text-indigo-500" /> Categorías
              </h3>

              {/* Lista Desktop / Select Mobile si quisieras, pero lista va bien */}
              <div className="flex flex-row overflow-x-auto lg:flex-col gap-2 pb-2 lg:pb-0">
                <button
                  onClick={() => setSelectedCategory("TODOS")}
                  className={`px-4 py-2 rounded-lg text-sm text-left transition-colors whitespace-nowrap ${
                    selectedCategory === "TODOS"
                      ? "bg-indigo-600 text-white font-semibold shadow-md"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  Ver Todo
                </button>

                {categories.map((cat) => (
                  <button
                    key={cat._id}
                    onClick={() => setSelectedCategory(cat._id)}
                    className={`px-4 py-2 rounded-lg text-sm text-left transition-colors whitespace-nowrap ${
                      selectedCategory === cat._id
                        ? "bg-indigo-600 text-white font-semibold shadow-md"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* 🟩 COLUMNA DERECHA: GRILLA DE PRODUCTOS */}
          <main className="flex-1">
            {productsLoading && (
              <div className="flex justify-center p-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              </div>
            )}

            {error && <p className="text-red-500 text-center">{error}</p>}

            {!productsLoading && !error && (
              <>
                <div className="mb-4 text-sm text-gray-500 flex justify-between items-center">
                  <span>
                    Mostrando <b>{filteredProducts.length}</b> productos
                  </span>
                  {/* Aquí podrías agregar un ordenamiento (Precio Mayor/Menor) a futuro */}
                </div>

                {filteredProducts.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                    {filteredProducts.map((product) => (
                      <ProductCard key={product._id} product={product} />
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-xl p-10 text-center shadow-sm">
                    <div className="text-gray-300 text-6xl mb-4 block mx-auto w-fit">
                      <FaSearch />
                    </div>
                    <h3 className="text-lg font-bold text-gray-700">
                      Sin resultados
                    </h3>
                    <p className="text-gray-500">
                      Intenta cambiar la categoría o los términos de búsqueda.
                    </p>
                    <button
                      onClick={() => {
                        setSelectedCategory("TODOS");
                        setSearchTerm("");
                      }}
                      className="mt-4 text-indigo-600 font-semibold hover:underline"
                    >
                      Limpiar filtros
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Home;
