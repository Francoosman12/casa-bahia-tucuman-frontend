import { useState, useEffect, useCallback } from 'react';
import axiosClient from '../api/axiosClient';

// Recibimos "includeAll" (false por defecto)
export const useProducts = (includeAll = false) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Usamos useCallback para que la función no se recree en cada render
    const fetchProducts = useCallback(async () => {
        try {
            setLoading(true);
            
            // 👇 Construcción de la URL: ¿Pido todo o solo activos?
            const endpoint = includeAll ? '/products?all=true' : '/products';
            
            const { data } = await axiosClient.get(endpoint);
            setProducts(data);
            setError(null);
        } catch (err) {
            console.error(error);
            setError("No se pudo cargar el catálogo.");
        } finally {
            setLoading(false);
        }
    }, [includeAll]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    return { products, loading, error, refetch: fetchProducts };
};