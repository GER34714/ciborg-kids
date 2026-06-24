// js/config.js
export const CONFIG = {
    // Configuración de Supabase
    SUPABASE_URL: 'https://ywchcaonnhwxvozzvzeb.supabase.co',
    SUPABASE_KEY: 'sb_publishable_mqas00OvI1kSuSfezoa7Ow_E5X3gdSO',
    
    // Configuración de la App
    APP_NAME: 'CIBORG KIDS',
    VERSION: '3.0.0',
    
    // Administradores (emails que serán admin automáticamente)
    ADMIN_EMAILS: ['tu-email-aqui@gmail.com'], // 👈 CAMBIA ESTO POR TU EMAIL
    
    // Configuración de pagos (MercadoPago)
    MERCADOPAGO_PUBLIC_KEY: '', // Lo agregas después
    
    // Configuración de YouTube
    YOUTUBE_API_KEY: '', // Opcional, para buscar videos
    
    // Planes de precios
    PRICES: {
        monthly: 5,    // $5 USD/mes
        quarterly: 12, // $12 USD/trimestre
        yearly: 40     // $40 USD/año
    }
};
