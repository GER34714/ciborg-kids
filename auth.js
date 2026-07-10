// En el script principal de tu index.html, reemplaza el logout con esto:
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', async function(e) {
        e.preventDefault();
        console.log('🚪 Click en botón logout');
        
        try {
            // Importar auth y hacer logout
            const { logout } = await import('./js/auth.js');
            const result = await logout();
            console.log('📦 Resultado logout:', result);
            
            // Mostrar mensaje
            showToast('👋 Sesión cerrada', 'warning');
            
            // Esperar un momento y recargar
            setTimeout(() => {
                window.location.reload();
            }, 500);
            
        } catch (error) {
            console.error('❌ Error en logout:', error);
            // Forzar recarga
            window.location.reload();
        }
    });
}
