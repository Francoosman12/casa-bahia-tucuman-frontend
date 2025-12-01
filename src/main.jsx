import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { AuthProvider } from "./context/AuthContext.jsx"; // <--- IMPORTAR
import { CartProvider } from "./context/CartContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <CartProvider>
        {" "}
        {/* <--- ENVOLVER APP */}
        <App />
      </CartProvider>
    </AuthProvider>
  </React.StrictMode>
);
