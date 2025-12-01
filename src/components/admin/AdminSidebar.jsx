import React from "react";
import { NavLink, Link, useNavigate } from "react-router-dom"; // 1. IMPORTAR useNavigate
import { useAuth } from "../../context/AuthContext";
import {
  FaBoxOpen,
  FaPercentage,
  FaTags,
  FaSignOutAlt,
  FaHome,
} from "react-icons/fa";

const AdminSidebar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate(); // 2. INICIALIZAR EL HOOK

  // 3. FUNCIÓN COMBINADA
  const handleLogout = () => {
    logout(); // Limpia el token y el estado
    navigate("/"); // Redirige al Home Público
  };

  // Función auxiliar para estilos de link activo
  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
      isActive
        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200 font-semibold"
        : "text-gray-500 hover:bg-indigo-50 hover:text-indigo-600"
    }`;

  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-screen sticky top-0 flex flex-col justify-between">
      <div>
        {/* LOGO ADMIN */}
        <div className="p-8">
          <h2 className="text-2xl font-black text-gray-800 tracking-tighter">
            PANEL<span className="text-indigo-600">BAHÍA</span>
          </h2>
          <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest font-semibold">
            Administración
          </p>
        </div>

        {/* MENÚ */}
        <nav className="px-4 space-y-2">
          <NavLink to="/admin/dashboard" className={navLinkClass} end>
            <FaBoxOpen size={18} />
            Productos
          </NavLink>

          <NavLink to="/admin/financial" className={navLinkClass}>
            <FaPercentage size={18} />
            Tasas y Precios
          </NavLink>

          <NavLink to="/admin/categories" className={navLinkClass}>
            <FaTags size={18} />
            Categorías
          </NavLink>
        </nav>
      </div>

      {/* ZONA INFERIOR */}
      <div className="p-4 border-t border-gray-100 space-y-2">
        <Link
          to="/"
          className="flex items-center gap-3 px-4 py-3 text-gray-500 hover:text-gray-900 transition-colors text-sm"
        >
          <FaHome /> Ver Tienda Pública
        </Link>
        <button
          onClick={handleLogout} // 4. CONECTAR AL NUEVO HANDLER
          to="/"
          className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors font-medium"
        >
          <FaSignOutAlt /> Cerrar Sesión
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
