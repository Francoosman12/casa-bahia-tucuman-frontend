import React, { createContext, useState, useEffect, useContext } from "react";
import axiosClient from "../api/axiosClient";
import { toast } from "react-toastify";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Datos del usuario
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  // Verificar si ya estoy logueado al recargar la página
  useEffect(() => {
    if (token) {
      // (Opcional) Aquí podrías llamar a un endpoint /profile para verificar si el token sigue vivo
      // Por ahora asumimos que si hay token, está logueado
      setUser({ name: "Administrador" });
    }
    setLoading(false);
  }, [token]);

  const login = async (email, password) => {
    try {
      const { data } = await axiosClient.post("/users/login", {
        email,
        password,
      });

      // Si sale bien:
      localStorage.setItem("token", data.token); // 1. Guardar en disco
      setToken(data.token); // 2. Guardar en estado
      setUser(data); // 3. Guardar datos usuario
      toast.success(`Bienvenido, ${data.name}`);

      return true; // Éxito
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || "Error al iniciar sesión";
      toast.error(msg);
      return false; // Falló
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    toast.info("Sesión cerrada");
  };

  return (
    <AuthContext.Provider
      value={{ user, token, login, logout, isAuthenticated: !!token, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para usar esto fácil
export const useAuth = () => useContext(AuthContext);
