import React from "react";
import { formatPrice } from "../../utils/formatPrice";
import { Link } from "react-router-dom";

const ProductCard = ({ product }) => {
  // Si no hay imagen, usamos un placeholder gris
  const imageUrl =
    product.images?.[0]?.url ||
    "https://via.placeholder.com/300x200?text=Sin+Imagen";

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col h-full border border-gray-100">
      {/* 🖼️ ZONA IMAGEN */}
      <div className="h-48 overflow-hidden relative group">
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        {/* Badge de Oferta (Lógica simple: si hay descuento, es oferta) */}
        {product.prices?.discountPct > 0 && (
          <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            {product.prices.discountPct}% OFF
          </div>
        )}
      </div>

      {/* 📝 ZONA INFO */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <p className="text-gray-400 text-xs uppercase font-semibold tracking-wide">
            {product.category?.name || "Muebles"}
          </p>
          <h3 className="text-lg font-bold text-gray-800 mb-2 leading-tight line-clamp-2">
            {product.name}
          </h3>
        </div>

        {/* 💲 ZONA PRECIOS */}
        <div className="mt-4 space-y-1">
          {/* Precio Lista Tachado */}
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <span>Lista:</span>
            <span className="line-through">
              {formatPrice(product.prices?.base)}
            </span>
          </div>

          {/* Precio Efectivo (Destacado) */}
          <div className="flex items-center justify-between">
            <span className="text-gray-600 text-sm font-medium">
              Contado/Débito
            </span>
            <span className="text-2xl font-bold text-blue-600">
              {formatPrice(product.prices?.cash)}
            </span>
          </div>

          {/* Financiación (Muestra el primer plan destacado, ej: Ahora 12) */}
          {product.prices?.financing?.length > 0 && (
            <div className="mt-2 pt-2 border-t border-dashed border-gray-200">
              <p className="text-xs text-gray-500 font-medium mb-1">
                Financiación disponible:
              </p>
              {/* Mostramos solo el plan con MÁS cuotas como gancho */}
              {(() => {
                // Buscamos el plan con mayor cuotas
                const maxPlan = product.prices.financing.reduce(
                  (prev, current) =>
                    prev.installments > current.installments ? prev : current
                );
                return (
                  <div className="text-sm font-semibold text-gray-700">
                    💳 {maxPlan.installments} cuotas de{" "}
                    <span className="text-indigo-600">
                      {formatPrice(maxPlan.installmentValue)}
                    </span>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      </div>

      {/* 🛒 BOTÓN DE ACCIÓN */}
      <div className="p-3 bg-gray-50 border-t border-gray-100">
        <Link
          to={`/product/${product._id}`}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          Ver Detalles
        </Link>
      </div>
    </div>
  );
};

export default ProductCard;
