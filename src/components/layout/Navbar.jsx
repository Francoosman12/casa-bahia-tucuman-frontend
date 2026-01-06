import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosClient from "../../api/axiosClient"; // Para buscar productos
import {
  FaShoppingCart,
  FaUserLock,
  FaSearch,
  FaTachometerAlt,
  FaTimes,
  FaSpinner,
  FaChevronRight,
} from "react-icons/fa";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { useSearch } from "../../context/SearchContext";
import { formatPrice } from "../../utils/formatPrice"; // Importa tu formateador
import logo from "../../../public/casabahiamini.png";

const Navbar = () => {
  const navigate = useNavigate();
  const { setIsCartOpen, cartItems } = useCart();
  const { isAuthenticated } = useAuth();
  const { setSearchTerm } = useSearch(); // Contexto Global

  // --- ESTADOS LOCALES DEL BUSCADOR ---
  const [query, setQuery] = useState(""); // Lo que el usuario escribe
  const [suggestions, setSuggestions] = useState([]); // Resultados de la API
  const [isOpen, setIsOpen] = useState(false); // Abrir/Cerrar dropdown
  const [loading, setLoading] = useState(false);
  const searchContainerRef = useRef(null); // Para detectar clics fuera

  // --- EFECTO: BUSCADOR PREDICTIVO (DEBOUNCE) ---
  useEffect(() => {
    // Si está vacío, limpiamos y cerramos
    if (!query.trim()) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    // Esperamos 400ms después de que el usuario deje de escribir para buscar
    const delayDebounceFn = setTimeout(async () => {
      setLoading(true);
      try {
        // Pedimos productos (Optimizacion: idealmente un endpoint /search?q=...)
        // Usamos el endpoint público (solo activos)
        const { data } = await axiosClient.get("/products");

        // Filtramos en cliente (si tienes muchos, mejor filtrar en backend)
        const filtered = data.filter(
          (p) =>
            p.name.toLowerCase().includes(query.toLowerCase()) ||
            p.sku.toLowerCase().includes(query.toLowerCase()) ||
            p.category?.name?.toLowerCase().includes(query.toLowerCase())
        );

        setSuggestions(filtered.slice(0, 5)); // Solo los primeros 5
        setIsOpen(true);
      } catch (error) {
        console.error("Error buscando:", error);
      } finally {
        setLoading(false);
      }
    }, 400); // 400ms de retraso

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  // --- HANDLERS ---

  // 1. Ir a ver TODOS los resultados (Home)
  const handleShowAllResults = () => {
    setSearchTerm(query); // Ahora sí actualizamos el global
    setIsOpen(false);
    navigate("/"); // Vamos al home
  };

  // 2. Presionar Enter en el input
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleShowAllResults();
    }
  };

  // 3. Cerrar si clickean fuera (UX)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const itemsCount = cartItems.reduce((acc, item) => acc + item.qty, 0);

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* LOGO */}
        <Link
          to="/"
          className="flex items-center shrink-0"
          onClick={() => {
            setSearchTerm("");
            setQuery("");
          }}
        >
          <img
            src={logo}
            alt="Casa Bahía Logo"
            className="h-10 md:h-12 w-auto object-contain"
          />
        </Link>

        {/* --- BUSCADOR PROFESIONAL (DROPDOWN) --- */}
        <div
          ref={searchContainerRef}
          className="hidden md:flex flex-1 max-w-xl mx-8 relative"
        >
          <div className="relative w-full">
            <input
              type="text"
              placeholder="¿Qué estás buscando? (Sillones, Mesas...)"
              className={`w-full pl-4 pr-10 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-gray-50 transition-all ${
                isOpen
                  ? "rounded-b-none border-indigo-400 ring-2 ring-indigo-100"
                  : "border-gray-200"
              }`}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                if (query && suggestions.length > 0) setIsOpen(true);
              }}
            />
            {loading ? (
              <FaSpinner className="absolute right-3 top-3 text-indigo-500 animate-spin" />
            ) : query ? (
              <FaTimes
                className="absolute right-3 top-3 text-gray-400 cursor-pointer hover:text-red-500"
                onClick={() => {
                  setQuery("");
                  setIsOpen(false);
                  setSearchTerm("");
                }}
              />
            ) : (
              <FaSearch className="absolute right-3 top-3 text-gray-400" />
            )}
          </div>

          {/* --- MENÚ DESPLEGABLE (SUGERENCIAS) --- */}
          {isOpen && (
            <div className="absolute top-full left-0 w-full bg-white border border-t-0 border-indigo-200 rounded-b-xl shadow-xl z-50 overflow-hidden">
              {suggestions.length > 0 ? (
                <ul className="divide-y divide-gray-100">
                  {suggestions.map((prod) => {
                    // Optimizar imagen para miniatura (tiny)
                    const thumb =
                      prod.images?.[0]?.url?.replace(
                        "/upload/",
                        "/upload/f_auto,q_auto,w_100,h_100,c_fill/"
                      ) || "https://via.placeholder.com/50";

                    return (
                      <li key={prod._id}>
                        <Link
                          to={`/product/${prod._id}`}
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-4 p-3 hover:bg-gray-50 transition-colors group"
                        >
                          {/* Foto Izquierda */}
                          <div className="h-12 w-12 rounded border border-gray-200 overflow-hidden shrink-0">
                            <img
                              src={thumb}
                              alt={prod.name}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          {/* Texto Derecha */}
                          <div className="flex-1">
                            <h4 className="text-sm font-semibold text-gray-700 group-hover:text-indigo-600 line-clamp-1">
                              {prod.name}
                            </h4>
                            <p className="text-xs text-gray-400">
                              {prod.category?.name} •{" "}
                              <span className="font-medium text-green-600">
                                {formatPrice(prod.prices.cash)}
                              </span>
                            </p>
                          </div>

                          <FaChevronRight className="text-gray-300 text-xs" />
                        </Link>
                      </li>
                    );
                  })}

                  {/* Botón "Ver Todos" al final */}
                  <li className="p-2 bg-gray-50 text-center">
                    <button
                      onClick={handleShowAllResults}
                      className="text-sm font-bold text-indigo-600 hover:text-indigo-800 w-full py-2 flex items-center justify-center gap-2"
                    >
                      Ver todos los resultados para "{query}"{" "}
                      <FaChevronRight size={10} />
                    </button>
                  </li>
                </ul>
              ) : (
                // Sin resultados
                <div className="p-4 text-center text-gray-500 text-sm">
                  No encontramos productos con ese nombre.
                </div>
              )}
            </div>
          )}
        </div>

        {/* ICONOS (Panel y Carrito) */}
        <div className="flex items-center gap-6">
          {isAuthenticated ? (
            <Link
              to="/admin/dashboard"
              className="text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1 font-medium text-sm"
              title="Ir al Panel"
            >
              <FaTachometerAlt size={20} />
              <span className="hidden lg:inline">Panel</span>
            </Link>
          ) : (
            <Link
              to="/admin/login"
              className="text-gray-400 hover:text-gray-600 transition-colors"
              title="Acceso Admin"
            >
              <FaUserLock size={20} />
            </Link>
          )}

          <button
            onClick={() => setIsCartOpen(true)}
            className="relative group text-gray-600 hover:text-indigo-600 transition-colors"
          >
            <FaShoppingCart size={24} />
            {itemsCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full border-2 border-white animate-bounce-short">
                {itemsCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
