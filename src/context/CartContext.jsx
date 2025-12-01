import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "react-toastify";
import { formatPrice } from "../utils/formatPrice";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  // Inicializar con lo que haya en LocalStorage o array vacío
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem("cart");
    return saved ? JSON.parse(saved) : [];
  });

  const [isCartOpen, setIsCartOpen] = useState(false); // Para abrir/cerrar el sidebar

  // Guardar en LocalStorage cada vez que cambie
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

  // 1. Agregar Producto
  const addToCart = (product) => {
    setCartItems((prev) => {
      const exists = prev.find((item) => item._id === product._id);
      if (exists) {
        // Si ya existe, sumamos 1 a la cantidad
        toast.info("Se actualizó la cantidad en el carrito");
        return prev.map((item) =>
          item._id === product._id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      // Si es nuevo
      toast.success("Agregado al carrito 🛒");
      return [...prev, { ...product, qty: 1 }];
    });
    setIsCartOpen(true); // Abrimos el carrito para que vea que se agregó
  };

  // 2. Quitar Producto
  const removeFromCart = (id) => {
    setCartItems((prev) => prev.filter((item) => item._id !== id));
    toast.error("Producto eliminado");
  };

  // 3. Cambiar Cantidad (Incrementar/Decrementar)
  const updateQuantity = (id, newQty) => {
    if (newQty < 1) return;
    setCartItems((prev) =>
      prev.map((item) => (item._id === id ? { ...item, qty: newQty } : item))
    );
  };

  // 4. Calcular Total
  const totalAmount = cartItems.reduce((acc, item) => {
    // Usamos el precio en efectivo como base para el total
    return acc + item.prices.cash * item.qty;
  }, 0);

  // 5. Generar Pedido de WhatsApp
  const sendOrder = () => {
    if (cartItems.length === 0) return;

    const phone = "5493815123456"; // TU NÚMERO

    let message =
      "Hola *Casa Bahia*, quisiera consultar por el siguiente pedido web: \n\n";

    cartItems.forEach((item) => {
      message += `▪️ *${item.name}* (x${item.qty})\n`;
      message += `   SKU: ${item.sku}\n`;
      message += `   Subtotal: ${formatPrice(item.prices.cash * item.qty)}\n\n`;
    });

    message += `*TOTAL ESTIMADO (Efectivo): ${formatPrice(totalAmount)}*\n\n`;
    message += "¿Tienen stock disponible?";

    window.open(
      `https://wa.me/${phone}?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        totalAmount,
        sendOrder,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
