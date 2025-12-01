import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// PÁGINAS PÚBLICAS
import Home from "./pages/public/Home";
import ProductDetail from "./pages/public/ProductDetail";
import CartSidebar from "./components/layout/CartSidebar";

// PÁGINAS ADMIN
import Login from "./pages/admin/Login";
import Dashboard from "./pages/admin/Dashboard"; // 👈 IMPORTANTE: Usamos este
import ProductForm from "./pages/admin/ProductForm";
import CategoryManager from "./pages/admin/CategoryManager";
import FinancialManager from "./pages/admin/FinancialManager";

import RequireAuth from "./components/layout/RequireAuth";

function App() {
  return (
    <BrowserRouter>
      {/* Sistema de notificaciones global */}
      <ToastContainer
        position="bottom-right"
        theme="colored"
        autoClose={3000}
      />
      <CartSidebar />
      <Routes>
        {/* --- ZONA PÚBLICA --- */}
        <Route path="/" element={<Home />} />
        <Route path="/product/:id" element={<ProductDetail />} />

        {/* --- ZONA ADMIN --- */}
        {/* Si entran a /admin, redirigir a Login */}

        <Route path="/admin" element={<Navigate to="/admin/login" />} />

        {/* Formulario de Login Real */}
        <Route path="/admin/login" element={<Login />} />

        {/* Dashboard Real (Carga la tabla de productos) */}
        <Route element={<RequireAuth />}>
          <Route path="/admin/dashboard" element={<Dashboard />} />
          <Route path="/admin/products/new" element={<ProductForm />} />
          <Route path="/admin/products/edit/:id" element={<ProductForm />} />
          <Route path="/admin/categories" element={<CategoryManager />} />
          <Route path="/admin/financial" element={<FinancialManager />} />
        </Route>
        {/* Ruta 404 */}
        <Route
          path="*"
          element={
            <div className="flex justify-center items-center h-screen bg-gray-50">
              <h2 className="text-2xl font-bold text-red-500">
                ❌ Página no encontrada (404)
              </h2>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
