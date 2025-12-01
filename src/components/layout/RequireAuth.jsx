import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const RequireAuth = () => {
  const { isAuthenticated, loading } = useAuth();

  // 1. Mientras verifica el token, mostramos carga (para que no parpadee)
  if (loading) {
    return (
      <div className="h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // 2. Si no está autenticado, lo mandamos al Login
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  // 3. Si todo ok, mostramos la página hija (Dashboard, Productos, etc.)
  return <Outlet />;
};

export default RequireAuth;
