import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import AdminLayout from "../../components/layout/AdminLayout";
import { toast } from "react-toastify";
import {
  FaArrowLeft,
  FaSave,
  FaCloudUploadAlt,
  FaSpinner,
  FaTimes,
} from "react-icons/fa";

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(false);
  const [categories, setCategories] = useState([]);

  // Estado del Formulario
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    priceBase: "",
    category: "",
    stock: 0,
    description: "",
    videoUrl: "",
    isActive: true,
  });

  // MANEJO DE IMÁGENES
  // 1. Archivos NUEVOS seleccionados (Objetos File)
  const [files, setFiles] = useState([]);
  // 2. Previews de los nuevos (URLs temporales)
  const [previews, setPreviews] = useState([]);
  // 3. Imágenes VIEJAS que ya vienen de la DB (Objetos {url, public_id})
  const [existingImages, setExistingImages] = useState([]);

  // CARGAR DATOS INICIALES
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Categorías
        const catRes = await axiosClient.get("/categories");
        setCategories(catRes.data);
        if (!isEditing && catRes.data.length > 0) {
          setFormData((prev) => ({ ...prev, category: catRes.data[0]._id }));
        }

        // Datos Producto (Editar)
        if (isEditing) {
          setFetchingData(true);
          const prodRes = await axiosClient.get(`/products/${id}`);
          const prod = prodRes.data;

          setFormData({
            name: prod.name,
            sku: prod.sku,
            priceBase: prod.priceBase,
            category: prod.category?._id || prod.category,
            stock: prod.stock,
            description: prod.description || "",
            videoUrl: prod.videoUrl || "",
            isActive: prod.isActive,
          });
          setExistingImages(prod.images || []);
          setFetchingData(false);
        }
      } catch (error) {
        console.error(error);
        toast.error("Error al cargar datos");
        setFetchingData(false);
      }
    };
    loadInitialData();
  }, [isEditing, id]);

  // HANDLERS
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // 👇 VALIDACIÓN DE 3 IMÁGENES 👇
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);

    // Cantidad total = Viejas + Nuevas seleccionadas + Nuevas ya en espera
    const totalImages =
      existingImages.length + files.length + selectedFiles.length;

    if (totalImages > 3) {
      toast.warning(
        `⚠️ Solo se permiten 3 imágenes por producto. Ya tienes ${
          existingImages.length + files.length
        }.`
      );
      return;
    }

    // Agregar a la lista de archivos
    const newFiles = [...files, ...selectedFiles];
    setFiles(newFiles);

    // Generar previews
    const newPreviews = selectedFiles.map((file) => URL.createObjectURL(file));
    setPreviews([...previews, ...newPreviews]);
  };

  // Función para borrar una imagen NUEVA de la lista de espera
  const removeNewImage = (index) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    const updatedPreviews = previews.filter((_, i) => i !== index);
    setFiles(updatedFiles);
    setPreviews(updatedPreviews);
  };

  // Función para borrar visualmente una foto vieja
  const removeExistingImage = (imageId) => {
    // Filtramos el array para quitar la foto con ese ID
    setExistingImages((prev) => prev.filter((img) => img._id !== imageId));
  };

  // Nota: Para borrar imágenes VIEJAS (del backend) se requeriría un endpoint especial de 'deleteImage'
  // Por ahora solo permitimos subir más hasta llegar a 3.

  // ENVÍO
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.category) return toast.warning("Selecciona una categoría");

    const totalImages = existingImages.length + files.length;
    if (totalImages === 0)
      return toast.warning("Debes tener al menos 1 imagen.");

    setLoading(true);

    try {
      const dataToSend = new FormData();

      // 1. Datos normales (Nombre, Precio, SKU, etc.)
      Object.keys(formData).forEach((key) =>
        dataToSend.append(key, formData[key])
      );

      // 2. Imágenes Nuevas
      files.forEach((file) => dataToSend.append("images", file));

      // 3. Imágenes Existentes (Las viejas que NO borraste) 👇 NUEVO
      // Las convertimos a texto (JSON) para enviarlas dentro del FormData
      dataToSend.append("existingImages", JSON.stringify(existingImages));

      if (isEditing) {
        await axiosClient.put(`/products/${id}`, dataToSend);
        toast.success("✅ Producto actualizado");
      } else {
        await axiosClient.post("/products", dataToSend);
        toast.success("✅ Producto creado");
      }
      navigate("/admin/dashboard");
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Error al guardar");
    } finally {
      setLoading(false);
    }
  };

  if (fetchingData)
    return (
      <div className="p-20 text-center text-gray-500">Cargando producto...</div>
    );

  // --- LÍMITE DE PALABRAS ---
  const MAX_WORDS = 50;

  // Calculamos palabras actuales para el contador
  const currentWords = formData.description
    ? formData.description
        .trim()
        .split(/\s+/)
        .filter((w) => w !== "").length
    : 0;

  // Handler especial para descripción que bloquea si te pasas
  const handleDescriptionChange = (e) => {
    const text = e.target.value;
    const words = text
      .trim()
      .split(/\s+/)
      .filter((w) => w !== "");

    // Permitimos escribir si está bajo el límite o si está borrando (longitud menor)
    // También permitimos espacios al final (para seguir escribiendo)
    if (
      words.length <= MAX_WORDS ||
      text.length < formData.description.length
    ) {
      setFormData({ ...formData, description: text });
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link
            to="/admin/dashboard"
            className="p-2 bg-white rounded-lg border hover:bg-gray-50 text-gray-600"
          >
            <FaArrowLeft />
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">
            {isEditing ? `Editar Producto` : "Nuevo Producto"}
          </h1>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 space-y-6"
        >
          {/* Campos de Texto Básicos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Nombre
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                SKU
              </label>
              <input
                type="text"
                name="sku"
                required
                value={formData.sku}
                onChange={handleChange}
                className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Precio Base
              </label>
              <input
                type="number"
                name="priceBase"
                required
                value={formData.priceBase}
                onChange={handleChange}
                className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Stock
              </label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Categoría
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="" disabled>
                  Seleccionar...
                </option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* --- CAMPO DESCRIPCIÓN CON LÍMITE --- */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-bold text-gray-700">
                Descripción
              </label>
              <span
                className={`text-xs font-bold transition-colors ${
                  currentWords >= MAX_WORDS ? "text-red-500" : "text-gray-400"
                }`}
              >
                {currentWords} / {MAX_WORDS} palabras
              </span>
            </div>
            <textarea
              name="description"
              rows="4"
              value={formData.description}
              onChange={handleDescriptionChange} // Usa la función especial
              className={`w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500 resize-y ${
                currentWords >= MAX_WORDS
                  ? "focus:ring-red-500 border-red-200 bg-red-50"
                  : ""
              }`}
              placeholder="Ej: Mesa ratona estilo industrial de 80x40cm. Hierro estructural y madera paraíso laqueada."
            ></textarea>
            <p className="text-xs text-gray-400 mt-1">
              Breve resumen para el catálogo y el mensaje de venta.
            </p>
          </div>

          {/* --- GESTOR DE IMÁGENES MEJORADO --- */}
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <label className="block text-sm font-bold text-gray-700 flex justify-between">
              Galería de Imágenes
              <span className="text-xs font-normal text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
                {existingImages.length + files.length} / 3 Ocupadas
              </span>
            </label>

            <div className="flex gap-4 overflow-x-auto pb-4">
              {/* 1. Botón de Subida (Se oculta si ya hay 3 fotos) */}
              {existingImages.length + files.length < 3 && (
                <div className="h-28 w-28 shrink-0 relative group">
                  <div className="absolute inset-0 border-2 border-dashed border-indigo-300 rounded-xl flex flex-col items-center justify-center text-indigo-400 bg-indigo-50 hover:bg-indigo-100 transition-colors pointer-events-none">
                    <FaCloudUploadAlt size={24} />
                    <span className="text-xs font-bold mt-1">Agregar</span>
                  </div>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
              )}

              {/* 2. Fotos Existentes (Viejas) */}
              {/* 2. Fotos Existentes (Viejas) */}
              {existingImages.map((img) => (
                <div
                  key={img._id}
                  className="h-28 w-28 shrink-0 rounded-xl overflow-hidden border border-gray-200 relative group"
                >
                  <img
                    src={img.url}
                    alt="db"
                    className="w-full h-full object-cover"
                  />

                  {/* 👇 BOTÓN BORRAR NUEVO PARA VIEJAS 👇 */}
                  <button
                    type="button" // Importante: type button para que no envíe el form
                    onClick={() => removeExistingImage(img._id)}
                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full shadow hover:bg-red-600 transition-colors z-10"
                    title="Quitar imagen guardada"
                  >
                    <FaTimes size={10} />
                  </button>

                  <div className="absolute bottom-0 w-full bg-black/60 text-white text-[10px] text-center py-1">
                    Guardada
                  </div>
                </div>
              ))}

              {/* 3. Fotos Nuevas (Previews) - CON OPCIÓN DE BORRAR */}
              {previews.map((src, index) => (
                <div
                  key={index}
                  className="h-28 w-28 shrink-0 rounded-xl overflow-hidden border-2 border-green-400 relative group shadow-sm"
                >
                  <img
                    src={src}
                    alt="new"
                    className="w-full h-full object-cover"
                  />

                  {/* Botón Borrar (X) */}
                  <button
                    type="button"
                    onClick={() => removeNewImage(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full shadow hover:bg-red-600 transition-colors"
                    title="Quitar esta foto"
                  >
                    <FaTimes size={10} />
                  </button>

                  <div className="absolute bottom-0 w-full bg-green-500 text-white text-[10px] text-center py-1 font-bold">
                    NUEVA
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Link de Video */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Video (YouTube o TikTok)
            </label>
            <div className="relative">
              <input
                type="text"
                name="videoUrl"
                value={formData.videoUrl}
                onChange={handleChange}
                className="w-full border rounded-lg p-3 pl-10 outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Pega el link aquí (ej: youtu.be/... o tiktok.com/...)"
              />
              {/* Icono decorativo */}
              <div className="absolute left-3 top-3.5 text-gray-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M10 16.5l6-4.5-6-4.5v9zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                </svg>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Soporta enlaces normales, Shorts y TikToks.
            </p>
          </div>

          {/* Visibilidad */}
          <div className="bg-gray-50 p-4 rounded-lg flex items-center justify-between border border-gray-200">
            <span className="text-sm font-bold text-gray-700">
              Estado Público
            </span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData({ ...formData, isActive: e.target.checked })
                }
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-green-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
            </label>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-lg shadow-lg hover:bg-indigo-700 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin" /> Procesando...
                </>
              ) : (
                <>
                  <FaSave /> Guardar Producto
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default ProductForm;
