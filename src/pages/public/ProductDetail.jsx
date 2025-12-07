import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import { formatPrice } from "../../utils/formatPrice";
import {
  FaWhatsapp,
  FaArrowLeft,
  FaShieldAlt,
  FaTruck,
  FaPlay,
  FaShoppingCart, // 👈 Importado para el botón
} from "react-icons/fa";
import Navbar from "../../components/layout/Navbar";
import { useCart } from "../../context/CartContext";

// --- HELPER ROBUSTO PARA YOUTUBE ---
const getYouTubeId = (url) => {
  if (!url) return null;
  // Soporta: youtube.com, youtu.be, shorts, embed, m.youtube
  const regExp =
    /^(?:https?:\/\/)?(?:www\.|m\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/|watch\?.+&v=))([\w-]{11})(?:.+)?$/;
  const match = url.match(regExp);
  return match && match[1] ? match[1] : null;
};

// --- HELPER PARA TIKTOK ---
const getTikTokId = (url) => {
  if (!url) return null;
  // Busca el patrón /video/NUMEROS
  const regExp = /\/video\/(\d+)/;
  const match = url.match(regExp);
  return match && match[1] ? match[1] : null;
};

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart } = useCart(); // 👈 Hook del carrito

  // Estados de datos
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados de la Galería
  const [mediaList, setMediaList] = useState([]);
  const [activeMedia, setActiveMedia] = useState(null);

  useEffect(() => {
    const fetchOne = async () => {
      try {
        setLoading(true);
        // Si tienes el endpoint específico usa: axiosClient.get(`/products/${id}`)
        // Usamos el filtro global por ahora:
        const { data: allProducts } = await axiosClient.get(
          "/products?all=true"
        );
        const found = allProducts.find((p) => p._id === id);

        if (found) {
          setProduct(found);

          // --- CONSTRUIR GALERÍA MIXTA ---
          const media = [];

          // 1. Fotos
          if (found.images && found.images.length > 0) {
            found.images.forEach((img) => {
              media.push({
                type: "image",
                url: img.url,
                id: img._id || img.url,
              });
            });
          }

          // 2. Agregar Video (YouTube o TikTok)
          if (found.videoUrl) {
            const ytId = getYouTubeId(found.videoUrl);
            const tkId = getTikTokId(found.videoUrl);

            if (ytId) {
              // CASO YOUTUBE
              media.push({
                type: "video_youtube", // Cambiamos nombre para diferenciar
                url: `https://www.youtube.com/embed/${ytId}`,
                thumbnail: `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`,
                id: "video-item",
              });
            } else if (tkId) {
              // CASO TIKTOK
              media.push({
                type: "video_tiktok",
                // URL oficial de embed de TikTok
                url: `https://www.tiktok.com/embed/v2/${tkId}`,
                // Usamos un logo de TikTok estático porque ellos no dan la foto gratis por URL
                thumbnail:
                  "https://upload.wikimedia.org/wikipedia/en/a/a9/TikTok_logo.svg",
                id: "video-item",
              });
            }
          }

          setMediaList(media);
          if (media.length > 0) setActiveMedia(media[0]);
        } else {
          setError("Producto no encontrado");
        }
      } catch (err) {
        console.error(err);
        setError("Error al cargar el producto");
      } finally {
        setLoading(false);
      }
    };
    fetchOne();
  }, [id]);

  const handleWhatsAppBuy = () => {
    if (!product) return;
    const phone = "5493816436214";
    const message = `Hola Casa Bahia, consulta por: *${product.name}* (SKU: ${product.sku}).`;
    window.open(
      `https://wa.me/${phone}?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  };

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  if (error)
    return (
      <div className="text-center p-20 text-red-600 font-bold">{error}</div>
    );

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <Link
          to="/"
          className="inline-flex items-center text-gray-500 hover:text-indigo-600 mb-6 font-medium text-sm transition-colors"
        >
          <FaArrowLeft className="mr-2" /> Volver al catálogo
        </Link>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
            {/* ========================================================= */}
            {/* 🖼️ IZQUIERDA: GALERÍA MULTIMEDIA                         */}
            {/* ========================================================= */}
            <div className="lg:col-span-7 p-6 md:p-10 bg-white flex flex-col gap-6">
              {/* Visor Grande */}
              {/* 1. VISOR PRINCIPAL GRANDE */}
              <div className="relative w-full aspect-square md:aspect-[4/3] bg-black rounded-2xl overflow-hidden shadow-sm flex items-center justify-center">
                {!activeMedia ? (
                  <img
                    src="https://via.placeholder.com/600?text=Sin+Imagen"
                    alt="Placeholder"
                    className="w-full h-full object-cover opacity-50"
                  />
                ) : activeMedia.type === "image" ? (
                  // FOTO
                  <img
                    src={activeMedia.url}
                    alt={product.name}
                    className="w-full h-full object-contain p-1 bg-white"
                  />
                ) : (
                  // VIDEO (YouTube o TikTok)
                  <iframe
                    src={activeMedia.url}
                    title="Video Producto"
                    className="w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                )}
              </div>

              {/* Tira de Miniaturas */}
              {mediaList.length > 1 && (
                <div className="flex gap-4 overflow-x-auto pb-2 px-1 justify-center md:justify-start">
                  {mediaList.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveMedia(item)}
                      className={`
                        relative group h-20 w-20 md:h-24 md:w-24 shrink-0 rounded-xl overflow-hidden border-2 transition-all duration-200
                        ${
                          activeMedia?.id === item.id
                            ? "border-indigo-600 ring-2 ring-indigo-100 shadow-md scale-102"
                            : "border-gray-200 hover:border-gray-400 opacity-70 hover:opacity-100"
                        }
                      `}
                    >
                      {/* ... dentro del .map del carrusel ... */}
                      <img
                        src={
                          item.type.includes("video")
                            ? item.thumbnail
                            : item.url
                        }
                        alt="Vista Previa"
                        className={`w-full h-full ${
                          item.type === "video_tiktok"
                            ? "object-contain p-2 bg-black"
                            : "object-cover"
                        }`}
                        // 👇 AGREGA ESTO: Si falla la carga, pone una imagen gris por defecto
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src =
                            "https://via.placeholder.com/150/cccccc/000000?text=No+Img";
                        }}
                      />
                      {/* Icono Overlay si es video (YouTube o TikTok) */}
                      {(item.type === "video_youtube" ||
                        item.type === "video_tiktok") && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/10 transition-colors">
                          <div
                            className={`text-white rounded-full p-2 shadow-lg ${
                              item.type === "video_tiktok"
                                ? "bg-black"
                                : "bg-red-600"
                            }`}
                          >
                            <FaPlay size={10} className="ml-0.5" />
                          </div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ========================================================= */}
            {/* 📝 DERECHA: INFO Y BOTONES                               */}
            {/* ========================================================= */}
            <div className="lg:col-span-5 p-6 md:p-10 bg-gray-50/50 border-l border-gray-100 flex flex-col">
              <div className="mb-6">
                <span className="inline-block bg-indigo-100 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide mb-3">
                  {product.category?.name || "Muebles"}
                </span>
                <h1 className="text-3xl font-extrabold text-gray-900 leading-tight mb-2">
                  {product.name}
                </h1>
                <p className="text-gray-400 text-sm font-mono">
                  SKU: {product.sku}
                </p>
              </div>

              {/* CARD PRECIOS */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 mb-8">
                <div className="mb-4">
                  <p className="text-gray-400 text-sm line-through">
                    Lista: {formatPrice(product.prices.base)}
                  </p>
                  <div className="flex flex-col">
                    <span className="text-4xl font-black text-gray-800">
                      {formatPrice(product.prices.cash)}
                    </span>
                    <span className="text-green-600 font-bold text-sm bg-green-50 w-fit px-2 rounded mt-1">
                      Pago en Efectivo / Débito
                    </span>
                  </div>
                </div>

                <div className="border-t border-dashed border-gray-200 pt-4 space-y-3">
                  <p className="text-xs font-bold text-gray-400 uppercase">
                    Financiación
                  </p>
                  {product.prices.financing?.length > 0 ? (
                    product.prices.financing.map((plan, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-gray-600 font-medium">
                          {plan.planName}
                        </span>
                        <span className="text-indigo-700 font-bold">
                          {plan.installments} cuotas de{" "}
                          {formatPrice(plan.installmentValue)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 italic text-sm">
                      Consultar planes de tarjeta.
                    </p>
                  )}
                </div>
              </div>

              {/* ZONA DE BOTONES (CARRITO + WHATSAPP) */}
              <div className="flex flex-col gap-3 mb-8">
                {/* 1. AGREGAR AL CARRITO (Principal) */}
                <button
                  onClick={() => addToCart(product)}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-100 transition-all flex items-center justify-center gap-3 text-lg"
                >
                  <FaShoppingCart size={22} />
                  Agregar al Carrito
                </button>

                {/* 2. CONSULTA DIRECTA (Secundario) */}
                <button
                  onClick={handleWhatsAppBuy}
                  className="w-full bg-white border-2 border-green-500 text-green-600 hover:bg-green-50 font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <FaWhatsapp size={22} />
                  Consultar solo este producto
                </button>
              </div>

              {/* CARACTERÍSTICAS Y GARANTÍA */}
              <div className="prose prose-sm text-gray-600 mb-6">
                <h3 className="text-gray-900 font-bold mb-2">Descripción</h3>
                <p className="whitespace-pre-line">
                  {product.description || "Sin descripción."}
                </p>
              </div>

              <div className="mt-auto grid grid-cols-2 gap-4 border-t border-gray-200 pt-6">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <FaTruck className="text-indigo-500 text-lg" /> Envío a
                  Domicilio
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <FaShieldAlt className="text-indigo-500 text-lg" /> Garantía
                  Escrita
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
