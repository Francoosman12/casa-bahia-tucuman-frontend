import React from "react";
import { useCart } from "../../context/CartContext";
import { formatPrice } from "../../utils/formatPrice";
import { FaTimes, FaTrash, FaWhatsapp, FaMinus, FaPlus } from "react-icons/fa";

const CartSidebar = () => {
  const {
    cartItems,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    totalAmount,
    sendOrder,
  } = useCart();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      {/* FONDO OSCURO (Backdrop) */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      ></div>

      {/* PANEL BLANCO DESLIZABLE */}
      <aside className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col transform transition-transform animate-slide-in-right">
        {/* CABECERA */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            🛒 Tu Carrito
            <span className="text-sm bg-indigo-600 text-white px-2 py-0.5 rounded-full">
              {cartItems.length}
            </span>
          </h2>
          <button
            onClick={() => setIsCartOpen(false)}
            className="text-gray-400 hover:text-gray-600 p-2"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* LISTA DE ITEMS */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 text-center opacity-70">
              <span className="text-6xl mb-4">🛍️</span>
              <p className="text-lg font-medium">El carrito está vacío</p>
              <p className="text-sm">Agrega productos para consultar.</p>
            </div>
          ) : (
            cartItems.map((item) => (
              <div
                key={item._id}
                className="flex gap-4 p-3 border border-gray-100 rounded-xl hover:border-indigo-100 transition-colors bg-white shadow-sm"
              >
                {/* FOTO MINI */}
                <div className="h-20 w-20 shrink-0 rounded-lg overflow-hidden border border-gray-200">
                  <img
                    src={item.images?.[0]?.url || "placeholder.jpg"}
                    className="w-full h-full object-cover"
                    alt=""
                  />
                </div>

                {/* INFO */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-gray-800 text-sm line-clamp-1">
                      {item.name}
                    </h4>
                    <p className="text-xs text-gray-500 mb-1">
                      {item.category?.name}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="font-bold text-indigo-600 text-sm">
                      {formatPrice(item.prices.cash)} c/u
                    </span>

                    {/* CONTROLES CANTIDAD */}
                    <div className="flex items-center gap-3 bg-gray-50 rounded-lg px-2 py-1 border border-gray-200">
                      <button
                        onClick={() => updateQuantity(item._id, item.qty - 1)}
                        className="text-gray-500 hover:text-indigo-600"
                      >
                        <FaMinus size={10} />
                      </button>
                      <span className="text-xs font-bold text-gray-800 w-4 text-center">
                        {item.qty}
                      </span>
                      <button
                        onClick={() => updateQuantity(item._id, item.qty + 1)}
                        className="text-gray-500 hover:text-indigo-600"
                      >
                        <FaPlus size={10} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* ELIMINAR */}
                <button
                  onClick={() => removeFromCart(item._id)}
                  className="text-gray-300 hover:text-red-500 self-start p-1 transition-colors"
                >
                  <FaTrash size={14} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* PIE (TOTAL Y BOTÓN) */}
        {cartItems.length > 0 && (
          <div className="p-5 border-t border-gray-100 bg-gray-50">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-600 font-medium">Total Estimado</span>
              <span className="text-2xl font-black text-gray-900">
                {formatPrice(totalAmount)}
              </span>
            </div>
            <button
              onClick={sendOrder}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-green-200 transition-transform active:scale-[0.99] flex items-center justify-center gap-2"
            >
              <FaWhatsapp size={24} /> Enviar Pedido
            </button>
          </div>
        )}
      </aside>
    </div>
  );
};

export default CartSidebar;
