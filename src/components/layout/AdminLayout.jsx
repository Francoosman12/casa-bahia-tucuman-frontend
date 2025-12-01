import React from "react";
import AdminSidebar from "../admin/AdminSidebar";

const AdminLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      {/* 1. MENÚ LATERAL FIJO */}
      <AdminSidebar />

      {/* 2. CONTENIDO PRINCIPAL */}
      <main className="flex-1 p-8 overflow-y-auto h-screen">
        <div className="max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  );
};

export default AdminLayout;
