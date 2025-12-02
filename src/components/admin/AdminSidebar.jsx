import React from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  FaBoxOpen,
  FaPercentage,
  FaTags,
  FaSignOutAlt,
  FaHome,
  FaTimes,
} from "react-icons/fa";

// Recibimos la prop onClose (opcional)
const AdminSidebar = ({ onClose }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Al hacer clic en un link, cerramos el menú (si estamos en mobile)
  const handleLinkClick = () => {
    if (onClose) onClose();
  };

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
      isActive
        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200 font-semibold"
        : "text-gray-500 hover:bg-indigo-50 hover:text-indigo-600"
    }`;

  return (
    <aside className="bg-white h-full flex flex-col justify-between overflow-y-auto">
      {/* BOTÓN CERRAR (Solo visible en Mobile) */}
      <div className="md:hidden absolute top-4 right-4">
        <button
          onClick={onClose}
          className="p-2 text-gray-500 hover:text-red-500"
        >
          <FaTimes size={24} />
        </button>
      </div>

      <div>
        {/* LOGO */}
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
          <NavLink
            to="/admin/dashboard"
            className={navLinkClass}
            end
            onClick={handleLinkClick}
          >
            <FaBoxOpen size={18} />
            Productos
          </NavLink>

          <NavLink
            to="/admin/financial"
            className={navLinkClass}
            onClick={handleLinkClick}
          >
            <FaPercentage size={18} />
            Tasas y Precios
          </NavLink>

          <NavLink
            to="/admin/categories"
            className={navLinkClass}
            onClick={handleLinkClick}
          >
            <FaTags size={18} />
            Categorías
          </NavLink>
        </nav>
      </div>

      {/* ZONA INFERIOR */}
      <div className="p-4 border-t border-gray-100 space-y-2 pb-8">
        <Link
          to="/"
          className="flex items-center gap-3 px-4 py-3 text-gray-500 hover:text-gray-900 text-sm"
          onClick={handleLinkClick}
        >
          <FaHome /> Ver Tienda Pública
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors font-medium"
        >
          <FaSignOutAlt /> Cerrar Sesión
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
