import React, { useState } from "react";
import AdminSidebar from "../admin/AdminSidebar";
import { FaBars } from "react-icons/fa"; // Necesitamos el ícono de hamburguesa

const AdminLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      {/* 1. OVERLAY OSCURO (Solo Mobile cuando está abierto) */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* 2. SIDEBAR RESPONSIVO */}
      {/* 
                - En Mobile: fixed, z-30, se mueve con translate-x 
                - En Desktop (md): relative, translate-0 siempre, border-r
            */}
      <div
        className={`
                fixed inset-y-0 left-0 z-30 w-64 bg-white transition-transform duration-300 transform 
                ${
                  isSidebarOpen
                    ? "translate-x-0 shadow-2xl"
                    : "-translate-x-full"
                }
                md:relative md:translate-x-0 md:shadow-none border-r border-gray-200
            `}
      >
        <AdminSidebar onClose={() => setIsSidebarOpen(false)} />
      </div>

      {/* 3. CONTENIDO PRINCIPAL */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header Mobile (Solo visible en pantallas chicas) */}
        <header className="bg-white border-b border-gray-200 p-4 flex items-center gap-4 md:hidden shadow-sm z-10">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="text-gray-600 hover:text-indigo-600 focus:outline-none"
          >
            <FaBars size={24} />
          </button>
          <span className="font-bold text-gray-800 text-lg">
            Panel de Control
          </span>
        </header>

        {/* El Children (Dashboard, Forms, etc) */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 relative scroll-smooth">
          <div className="max-w-6xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
