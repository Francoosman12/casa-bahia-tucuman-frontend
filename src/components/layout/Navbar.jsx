import React from "react";
import { Link } from "react-router-dom";
// Agregamos FaTachometerAlt (Icono de velocidad/dashboard)
import {
  FaShoppingCart,
  FaUserLock,
  FaSearch,
  FaTachometerAlt,
} from "react-icons/fa";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext"; // 👈 IMPORTANTE
import logo from "../../assets/casa-bahia.png";

const Navbar = () => {
  const { setIsCartOpen, cartItems } = useCart();
  const { isAuthenticated } = useAuth(); // 👈 Obtenemos el estado

  const itemsCount = cartItems.reduce((acc, item) => acc + item.qty, 0);

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* LOGO */}
        <Link to="/" className="flex items-center">
          <img
            src={logo}
            alt="Casa Bahía Logo"
            className="h-12 w-auto object-contain" // h-10 (40px) es un buen tamaño para navbar
          />
        </Link>

        {/* BUSCADOR */}
        <div className="hidden md:flex flex-1 max-w-lg mx-8 relative">
          <input
            type="text"
            placeholder="¿Qué estás buscando? (Sillones, Mesas...)"
            className="w-full pl-4 pr-10 py-2 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-gray-50 transition-all"
          />
          <FaSearch className="absolute right-3 top-3 text-gray-400" />
        </div>

        {/* ICONOS */}
        <div className="flex items-center gap-6">
          {/* 👇 LÓGICA CONDICIONAL AQUÍ 👇 */}
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

          {/* BOTÓN CARRITO */}
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
