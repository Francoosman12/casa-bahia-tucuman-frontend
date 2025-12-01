export const formatPrice = (amount) => {
    // Usamos el estándar de Argentina (es-AR)
    return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 0, // Sin decimales (00 centavos molesta en precios grandes)
        maximumFractionDigits: 0,
    }).format(amount);
};