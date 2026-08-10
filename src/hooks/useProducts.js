import { useState, useEffect, useCallback } from 'react';
import axiosClient from '../api/axiosClient';

// Caché en memoria (fuera del componente) para evitar el flash de "cargando"
// cuando el usuario vuelve a una página que ya había pedido el catálogo antes.
const cache = {};

// Recibimos "includeAll" (false por defecto)
export const useProducts = (includeAll = false) => {
    const cacheKey = includeAll ? 'all' : 'public';
    const [products, setProducts] = useState(cache[cacheKey] || []);
    const [loading, setLoading] = useState(!cache[cacheKey]);
    const [error, setError] = useState(null);

    // Usamos useCallback para que la función no se recree en cada render
    const fetchProducts = useCallback(async () => {
        try {
            // Si ya tenemos datos en caché, refrescamos en segundo plano sin mostrar el spinner
            if (!cache[cacheKey]) setLoading(true);

            // 👇 Construcción de la URL: ¿Pido todo o solo activos?
            const endpoint = includeAll ? '/products?all=true' : '/products';

            const { data } = await axiosClient.get(endpoint);
            cache[cacheKey] = data;
            setProducts(data);
            setError(null);
        } catch (err) {
            console.error(err);
            setError("No se pudo cargar el catálogo.");
        } finally {
            setLoading(false);
        }
    }, [includeAll, cacheKey]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    return { products, loading, error, refetch: fetchProducts };
};