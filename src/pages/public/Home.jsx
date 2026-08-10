import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import axiosClient from "../../api/axiosClient";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import ProductCard from "../../components/products/ProductCard";
import ProductCardSkeleton from "../../components/products/ProductCardSkeleton";
import { useProducts } from "../../hooks/useProducts";
import { FaFilter, FaSearch, FaArrowDown } from "react-icons/fa";
import { useSearchParams, useNavigationType } from "react-router-dom";

const GRID_CLASSES =
  "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6";

const PAGE_SIZE = 12;

const Home = () => {
  // 1. Datos principales
  const { products, loading: productsLoading, error } = useProducts(false); // false = Solo públicos

  // 2. Filtros: viven en la URL (?cat=...&q=...) para que el botón "atrás" del
  // navegador los restaure solo, y para poder compartir/recargar con el filtro puesto.
  const [searchParams, setSearchParams] = useSearchParams();
  const navigationType = useNavigationType(); // "POP" = venimos de atrás/adelante del navegador
  const selectedCategory = searchParams.get("cat") || "TODOS";
  const searchTerm = searchParams.get("q") || "";

  const [categories, setCategories] = useState([]);

  // 3. Paginación (Cargar más). Si volvemos con el botón "atrás", restauramos
  // cuántos productos había cargados en vez de arrancar de nuevo en 12.
  const storageKey = `home-state:${searchParams.toString()}`;
  const [visibleCount, setVisibleCount] = useState(() => {
    if (navigationType === "POP") {
      const raw = sessionStorage.getItem(storageKey);
      if (raw) {
        try {
          const saved = JSON.parse(raw).visibleCount;
          if (saved) return saved;
        } catch {
          /* ignore */
        }
      }
    }
    return PAGE_SIZE;
  });

  // Refs para poder guardar el estado justo al desmontar (al ir al detalle)
  // sin depender de closures viejas.
  const visibleCountRef = useRef(visibleCount);
  const storageKeyRef = useRef(storageKey);
  useEffect(() => {
    visibleCountRef.current = visibleCount;
    storageKeyRef.current = storageKey;
  }, [visibleCount, storageKey]);

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

  // Resetear paginación solo cuando el usuario cambia filtros a mano (no al
  // restaurar el estado por un "volver atrás")
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setVisibleCount(PAGE_SIZE);
  }, [selectedCategory, searchTerm]);

  // Guardar scroll + paginación justo antes de salir de Home (por ejemplo al
  // hacer clic en un producto), para poder restaurarlo al volver.
  useEffect(() => {
    return () => {
      sessionStorage.setItem(
        storageKeyRef.current,
        JSON.stringify({
          scrollY: window.scrollY,
          visibleCount: visibleCountRef.current,
        })
      );
    };
  }, []);

  // Restaurar el scroll al volver con "atrás", una vez que ya hay productos
  // renderizados en pantalla.
  useLayoutEffect(() => {
    if (navigationType !== "POP" || productsLoading) return;
    const raw = sessionStorage.getItem(storageKey);
    if (!raw) return;
    try {
      const { scrollY } = JSON.parse(raw);
      if (typeof scrollY === "number") window.scrollTo(0, scrollY);
    } catch {
      /* ignore */
    }
    // Solo nos interesa la primera vez que termina de cargar tras volver
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productsLoading]);

  const setSelectedCategory = (catId) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (catId === "TODOS") next.delete("cat");
        else next.set("cat", catId);
        return next;
      },
      { replace: true }
    );
  };

  const setSearchTerm = (value) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (!value) next.delete("q");
        else next.set("q", value);
        return next;
      },
      { replace: true }
    );
  };

  // Lógica de Filtrado
  const filteredProducts = products.filter((product) => {
    // A. Filtro por Categoría
    if (
      selectedCategory !== "TODOS" &&
      product.category?._id !== selectedCategory
    ) {
      return false;
    }
    // B. Filtro por Buscador (Texto)
    if (
      searchTerm &&
      !product.name.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  // Lógica de Recorte (Paginación)
  // Mostramos solo desde el 0 hasta 'visibleCount'
  const productsToShow = filteredProducts.slice(0, visibleCount);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 font-sans">
      <Navbar />

      <div className="container mx-auto px-4 py-8 flex-1">
        {/* BANNER */}
        <Motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="mb-8 text-center md:text-left"
        >
          <h1 className="text-3xl font-extrabold text-gray-800">
            Catálogo <span className="text-indigo-600">Online</span>
          </h1>
          <p className="text-gray-500 mt-1">
            Encuentra los mejores precios y financiación de Tucumán.
          </p>
        </Motion.div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* 🟦 SIDEBAR (Filtros) */}
          <aside className="w-full lg:w-64 shrink-0 space-y-6">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
                <FaSearch className="text-indigo-500" /> Buscar
              </h3>
              <input
                type="text"
                placeholder="Mesa, Sillón..."
                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
                <FaFilter className="text-indigo-500" /> Categorías
              </h3>
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

          {/* 🟩 GRILLA DE PRODUCTOS */}
          <main className="flex-1">
            {productsLoading && (
              <div className={GRID_CLASSES}>
                {Array.from({ length: 8 }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            )}

            {error && <p className="text-red-500 text-center">{error}</p>}

            {!productsLoading && !error && (
              <>
                <div className="mb-4 text-sm text-gray-500 flex justify-between items-center">
                  {/* Texto de conteo dinámico */}
                  <span>
                    Mostrando <b>{productsToShow.length}</b> de{" "}
                    <b>{filteredProducts.length}</b> productos
                  </span>
                </div>

                {filteredProducts.length > 0 ? (
                  <>
                    <div className={GRID_CLASSES}>
                      {/* 👇 AQUI ESTABA EL ERROR: USAMOS 'productsToShow' */}
                      <AnimatePresence mode="popLayout">
                        {productsToShow.map((product) => (
                          <Motion.div
                            key={product._id}
                            layout
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.25, ease: "easeOut" }}
                          >
                            <ProductCard product={product} />
                          </Motion.div>
                        ))}
                      </AnimatePresence>
                    </div>

                    {/* 👇 BOTÓN VER MÁS */}
                    {visibleCount < filteredProducts.length && (
                      <div className="mt-10 text-center">
                        <button
                          onClick={() => setVisibleCount((prev) => prev + 12)}
                          className="bg-white border-2 border-indigo-600 text-indigo-700 font-bold px-8 py-3 rounded-full hover:bg-indigo-50 transition-colors shadow-sm flex items-center gap-2 mx-auto"
                        >
                          <FaArrowDown /> Cargar más productos
                        </button>
                        <p className="text-xs text-gray-400 mt-2">
                          Mostrando {productsToShow.length} de{" "}
                          {filteredProducts.length}
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="bg-white rounded-xl p-10 text-center shadow-sm">
                    <div className="text-gray-300 text-6xl mb-4 block mx-auto w-fit">
                      <FaSearch />
                    </div>
                    <h3 className="text-lg font-bold text-gray-700">
                      Sin resultados
                    </h3>
                    <p className="text-gray-500">
                      No encontramos productos con esos filtros.
                    </p>
                    <button
                      onClick={() => {
                        setSearchParams({}, { replace: true });
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
