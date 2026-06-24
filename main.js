// main.js
import { CONFIG } from './config.js';
import { initAuth, getUser, getProfile, isAuthenticated, isPremium, isAdmin, loginWithGoogle, logout, onAuthChange, updateProfile } from './auth.js';
import { ProgressAPI, StickerAPI, FavoritesAPI, AdminAPI } from './supabase.js';

// ============================================
// ESTADO GLOBAL
// ============================================
const APP = {
    user: null,
    profile: null,
    currentSection: 'colores',
    colDone: new Set(),
    stickerCollection: new Set(),
    favorites: new Set(),
    progress: {},
    isPremium: false,
    isAdmin: false
};

// ============================================
// INICIALIZACIÓN
// ============================================
export async function initApp() {
    console.log(`🚀 ${CONFIG.APP_NAME} v${CONFIG.VERSION}`);
    
    // Inicializar autenticación
    const authResult = await initAuth();
    console.log('📦 Resultado initAuth:', authResult);
    
    if (authResult.success && !authResult.blocked) {
        APP.user = authResult.user;
        APP.profile = authResult.profile;
        APP.isPremium = authResult.profile?.is_premium || false;
        APP.isAdmin = authResult.profile?.is_admin || false;
        
        // Cargar datos del usuario
        await loadUserData();
        showMainApp();
    } else if (authResult.blocked) {
        showBlockedMessage();
    } else {
        showLoginScreen();
    }
    
    // Escuchar cambios en autenticación
    onAuthChange((user, profile) => {
        if (user && profile) {
            APP.user = user;
            APP.profile = profile;
            APP.isPremium = profile.is_premium || false;
            APP.isAdmin = profile.is_admin || false;
            loadUserData();
            showMainApp();
        } else {
            APP.user = null;
            APP.profile = null;
            APP.isPremium = false;
            APP.isAdmin = false;
            showLoginScreen();
        }
    });
    
    // Configurar botón de Google
    setupGoogleButton();
}

// ============================================
// CONFIGURAR BOTÓN DE GOOGLE
// ============================================
function setupGoogleButton() {
    const googleBtn = document.getElementById('google-login-btn');
    if (googleBtn) {
        console.log('✅ Botón de Google encontrado');
        // Eliminar eventos anteriores
        const newBtn = googleBtn.cloneNode(true);
        googleBtn.parentNode.replaceChild(newBtn, googleBtn);
        // Agregar evento
        newBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('🖱️ Click en botón Google');
            window.loginWithGoogle();
        });
    } else {
        console.log('⚠️ Botón de Google no encontrado, buscando...');
        // Buscar por texto
        const allButtons = document.querySelectorAll('button');
        for (const btn of allButtons) {
            if (btn.textContent.includes('Google')) {
                console.log('✅ Botón de Google encontrado por texto');
                btn.addEventListener('click', function(e) {
                    e.preventDefault();
                    console.log('🖱️ Click en botón Google');
                    window.loginWithGoogle();
                });
                break;
            }
        }
    }
}

// ============================================
// CARGAR DATOS DEL USUARIO
// ============================================
async function loadUserData() {
    if (!APP.user) return;
    
    try {
        // Cargar progreso
        const progress = await ProgressAPI.getUserProgress(APP.user.id);
        APP.progress = progress.reduce((acc, p) => {
            if (!acc[p.category]) acc[p.category] = [];
            acc[p.category].push(p.item_id);
            return acc;
        }, {});
        
        // Cargar colores completados
        APP.colDone = new Set(
            progress.filter(p => p.category === 'colores').map(p => p.item_id)
        );
        
        // Cargar stickers
        const stickers = await StickerAPI.getUserStickers(APP.user.id);
        APP.stickerCollection = new Set(stickers.map(s => s.sticker_id));
        
        // Actualizar UI
        updateUI();
        renderAllSections();
        
    } catch (error) {
        console.error('Error cargando datos:', error);
    }
}

// ============================================
// FUNCIONES DE UI - CORREGIDAS
// ============================================
function showLoginScreen() {
    console.log('🔓 Mostrando pantalla de login');
    
    // Mostrar login
    const loginScreen = document.getElementById('login-screen');
    if (loginScreen) {
        loginScreen.style.display = 'flex';
    } else {
        console.warn('⚠️ login-screen no encontrado');
    }
    
    // Ocultar contenido principal
    const mainContent = document.getElementById('mainContent');
    if (mainContent) {
        mainContent.style.display = 'none';
    } else {
        console.warn('⚠️ mainContent no encontrado');
    }
    
    // Ocultar cualquier otro contenedor
    const appContent = document.getElementById('app-content');
    if (appContent) {
        appContent.style.display = 'none';
    }
}

function showMainApp() {
    console.log('📱 Mostrando contenido principal');
    
    // Ocultar login
    const loginScreen = document.getElementById('login-screen');
    if (loginScreen) {
        loginScreen.style.display = 'none';
    }
    
    // Mostrar contenido principal
    const mainContent = document.getElementById('mainContent');
    if (mainContent) {
        mainContent.style.display = 'block';
    }
    
    // Mostrar app-content si existe
    const appContent = document.getElementById('app-content');
    if (appContent) {
        appContent.style.display = 'block';
    }
    
    renderAllSections();
    updateUI();
}

function showBlockedMessage() {
    console.log('🚫 Cuenta bloqueada');
    const loginScreen = document.getElementById('login-screen');
    if (loginScreen) {
        loginScreen.innerHTML = `
            <div style="background:#EB5757;color:#fff;padding:20px;border-radius:16px;text-align:center;">
                <div style="font-size:48px;">🚫</div>
                <h2>Cuenta Bloqueada</h2>
                <p>Tu cuenta ha sido bloqueada por el administrador.</p>
                <p style="font-size:12px;opacity:0.8;margin-top:8px;">Si crees que es un error, contacta al soporte.</p>
            </div>
        `;
        loginScreen.style.display = 'flex';
    }
    const mainContent = document.getElementById('mainContent');
    if (mainContent) mainContent.style.display = 'none';
}

function updateUI() {
    console.log('🔄 Actualizando UI');
    const userName = document.getElementById('user-name');
    const userAvatar = document.getElementById('user-avatar');
    const levelDisplay = document.getElementById('level-display');
    const levelBadge = document.getElementById('level-badge');
    const starCount = document.getElementById('star-count');
    const coinCount = document.getElementById('coin-count');
    
    if (userName) userName.textContent = APP.profile?.username || 'Explorador';
    if (userAvatar) userAvatar.textContent = APP.profile?.avatar || '🦊';
    if (levelDisplay) levelDisplay.textContent = APP.profile?.level || 1;
    if (levelBadge) levelBadge.textContent = APP.profile?.level || 1;
    if (starCount) starCount.textContent = APP.profile?.stars || 0;
    if (coinCount) coinCount.textContent = APP.profile?.coins || 50;
}

function renderAllSections() {
    console.log('🎨 Renderizando todas las secciones');
    // Las secciones se renderizan cuando se navega a ellas
    // Por ahora solo mostramos la sección de colores
    showSection('colores');
}

// ============================================
// NAVEGACIÓN
// ============================================
export function showSection(id) {
    console.log('📱 Mostrando sección:', id);
    APP.currentSection = id;
    
    // Ocultar todas las secciones
    document.querySelectorAll('.section-content').forEach(el => {
        el.classList.add('hidden');
    });
    
    // Mostrar la sección seleccionada
    const section = document.getElementById('sec-' + id);
    if (section) {
        section.classList.remove('hidden');
    } else {
        console.warn('⚠️ Sección no encontrada:', id);
    }
    
    // Actualizar tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.section === id);
    });
    
    document.querySelectorAll('.bnav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.section === id);
    });
    
    // Renderizar contenido específico de la sección
    renderSectionContent(id);
}

function renderSectionContent(id) {
    // Aquí se llamarían las funciones de renderizado de cada sección
    console.log('📦 Renderizando contenido de:', id);
}

// ============================================
// TOAST NOTIFICATIONS
// ============================================
export function showToast(message, type = '') {
    console.log('🔔 Toast:', message, type);
    const container = document.getElementById('toast-area');
    if (!container) {
        console.warn('⚠️ toast-area no encontrado');
        return;
    }
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// ============================================
// RECOMPENSAS
// ============================================
export async function addStars(n, element) {
    if (!APP.user) return;
    console.log('⭐ Añadiendo', n, 'estrellas');
    
    try {
        const profile = await updateProfile({
            stars: (APP.profile?.stars || 0) + n
        });
        APP.profile = profile;
        updateUI();
        
        if (element) {
            const pop = document.createElement('div');
            pop.className = 'stars-pop';
            pop.textContent = `+${n} ⭐`;
            element.style.position = 'relative';
            element.appendChild(pop);
            setTimeout(() => pop.remove(), 1000);
        }
    } catch (error) {
        console.error('Error añadiendo estrellas:', error);
    }
}

export async function addCoins(n, element) {
    if (!APP.user) return;
    console.log('🪙 Añadiendo', n, 'monedas');
    
    try {
        const profile = await updateProfile({
            coins: (APP.profile?.coins || 0) + n
        });
        APP.profile = profile;
        updateUI();
        
        if (element) {
            const pop = document.createElement('div');
            pop.className = 'coin-pop';
            pop.textContent = `+${n} 🪙`;
            element.style.position = 'relative';
            element.appendChild(pop);
            setTimeout(() => pop.remove(), 1000);
        }
    } catch (error) {
        console.error('Error añadiendo monedas:', error);
    }
}

// ============================================
// LOGIN CON GOOGLE (global para el botón)
// ============================================
window.loginWithGoogle = async function() {
    console.log('🔄 Iniciando login con Google...');
    try {
        const result = await loginWithGoogle();
        console.log('📦 Resultado:', result);
        if (result.success) {
            showToast('✅ ¡Bienvenido!', 'warning');
        } else {
            showToast('❌ Error: ' + (result.error || 'No se pudo iniciar sesión'), 'error');
        }
    } catch (error) {
        console.error('❌ Error en login:', error);
        showToast('❌ Error al iniciar sesión: ' + error.message, 'error');
    }
};

// ============================================
// LOGOUT
// ============================================
window.logout = async function() {
    console.log('🚪 Cerrando sesión...');
    await logout();
    showToast('👋 Sesión cerrada', 'warning');
    location.reload();
};

// ============================================
// EXPORTAR
// ============================================
export { APP };
