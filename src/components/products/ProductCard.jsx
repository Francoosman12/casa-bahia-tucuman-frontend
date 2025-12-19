import React from "react";
import { formatPrice } from "../../utils/formatPrice";
import { Link } from "react-router-dom";

const ProductCard = ({ product }) => {
  // Optimización de imágenes Cloudinary
  let imageUrl =
    product.images?.[0]?.url ||
    "https://via.placeholder.com/300x200?text=Sin+Imagen";

  if (imageUrl && imageUrl.includes("cloudinary.com")) {
    imageUrl = imageUrl.replace("/upload/", "/upload/f_auto,q_auto,w_400/");
  }

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col h-full border border-gray-100">
      {/* 🖼️ ZONA IMAGEN */}
      <div className="h-48 overflow-hidden relative group">
        <img
          src={imageUrl}
          loading="lazy"
          alt={product.name}
          className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
        />

        {/* Etiqueta de Destacado (Reemplaza al % OFF) */}
        {product.isFeatured && (
          <div className="absolute top-2 right-2 bg-yellow-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm tracking-wide">
            DESTACADO
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
          {/* 1. PRECIO LISTA TACHADO (Campo Nuevo 'list') */}
          {/* Solo se muestra si es mayor al contado (evita errores visuales si es 0) */}
          {product.prices?.list > product.prices?.cash && (
            <div className="flex items-center space-x-2 text-xs text-gray-400">
              <span>Lista:</span>
              <span className="line-through decoration-red-300">
                {formatPrice(product.prices.list)}
              </span>
            </div>
          )}

          {/* 2. PRECIO CONTADO (Precio Base) */}
          <div className="flex items-center justify-between">
            <span className="text-gray-600 text-sm font-medium">
              Contado/Débito
            </span>
            <span className="text-2xl font-bold text-blue-600">
              {formatPrice(product.prices?.cash)}
            </span>
          </div>

          {/* 3. FINANCIACIÓN (Mejor Plan) */}
          {product.prices?.financing?.length > 0 && (
            <div className="mt-2 pt-2 border-t border-dashed border-gray-200">
              <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">
                Financiación
              </p>
              {(() => {
                // Buscamos el plan con MÁS cuotas para mostrar "Ahora 12..."
                const maxPlan = product.prices.financing.reduce(
                  (prev, current) =>
                    prev.installments > current.installments ? prev : current
                );
                return (
                  <div className="text-sm font-semibold text-gray-700">
                    <span className="text-indigo-600">
                      {maxPlan.installments} cuotas
                    </span>{" "}
                    de {formatPrice(maxPlan.installmentValue)}
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
