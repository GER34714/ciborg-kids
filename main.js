// js/main.js
import { CONFIG } from './config.js';
import { initAuth, getUser, getProfile, isAuthenticated, isPremium, isAdmin, loginWithGoogle, logout, onAuthChange } from './auth.js';
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
    
    // Inicializar navegación
    initNavigation();
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
        
        // Cargar favoritos
        const favorites = await FavoritesAPI.getUserFavorites(APP.user.id);
        APP.favorites = new Set(favorites.map(f => f.video_id));
        
        // Actualizar UI
        updateUI();
        renderAllSections();
        
    } catch (error) {
        console.error('Error cargando datos:', error);
    }
}

// ============================================
// FUNCIONES DE UI
// ============================================
function showLoginScreen() {
    document.getElementById('login-screen').classList.remove('hidden');
    document.getElementById('app-content').classList.add('hidden');
    document.getElementById('admin-content')?.classList.add('hidden');
}

function showMainApp() {
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('app-content').classList.remove('hidden');
    renderAllSections();
    updateUI();
}

function showBlockedMessage() {
    document.getElementById('login-screen').classList.remove('hidden');
    document.getElementById('app-content').classList.add('hidden');
    document.getElementById('login-message').innerHTML = `
        <div style="background:#EB5757;color:#fff;padding:20px;border-radius:16px;text-align:center;">
            <div style="font-size:48px;">🚫</div>
            <h2>Cuenta Bloqueada</h2>
            <p>Tu cuenta ha sido bloqueada por el administrador.</p>
            <p style="font-size:12px;opacity:0.8;margin-top:8px;">Si crees que es un error, contacta al soporte.</p>
        </div>
    `;
}

function updateUI() {
    // Actualizar barra superior
    document.getElementById('user-avatar').textContent = APP.profile?.avatar || '🦊';
    document.getElementById('user-name').textContent = APP.profile?.username || 'Explorador';
    document.getElementById('user-level').textContent = `Nivel ${APP.profile?.level || 1}`;
    document.getElementById('star-count').textContent = APP.profile?.stars || 0;
    document.getElementById('coin-count').textContent = APP.profile?.coins || 0;
    
    // Mostrar badge premium si corresponde
    const premiumBadge = document.getElementById('premium-badge');
    if (APP.isPremium) {
        premiumBadge.classList.remove('hidden');
    } else {
        premiumBadge.classList.add('hidden');
    }
    
    // Mostrar botón admin si es admin
    const adminBtn = document.getElementById('admin-btn');
    if (APP.isAdmin) {
        adminBtn.classList.remove('hidden');
    } else {
        adminBtn.classList.add('hidden');
    }
}

// ============================================
// NAVEGACIÓN
// ============================================
function initNavigation() {
    // Tabs de navegación
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const section = btn.dataset.section;
            if (section) showSection(section);
        });
    });
    
    // Bottom nav
    document.querySelectorAll('.bnav-item').forEach(item => {
        item.addEventListener('click', () => {
            const section = item.dataset.section;
            if (section) showSection(section);
        });
    });
    
    // Botón de login
    document.getElementById('google-login-btn')?.addEventListener('click', async () => {
        const result = await loginWithGoogle();
        if (!result.success) {
            showToast('Error al iniciar sesión', 'error');
        }
    });
    
    // Botón de logout
    document.getElementById('logout-btn')?.addEventListener('click', async () => {
        await logout();
        showToast('Sesión cerrada', 'warning');
    });
    
    // Botón de admin
    document.getElementById('admin-btn')?.addEventListener('click', () => {
        window.open('admin.html', '_blank');
    });
}

export function showSection(id) {
    APP.currentSection = id;
    
    // Ocultar todas las secciones
    document.querySelectorAll('.section-content').forEach(el => {
        el.classList.add('hidden');
    });
    
    // Mostrar la sección seleccionada
    const section = document.getElementById(`sec-${id}`);
    if (section) {
        section.classList.remove('hidden');
    }
    
    // Actualizar tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.section === id);
    });
    
    document.querySelectorAll('.bnav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.section === id);
    });
    
    // Renderizar contenido específico
    renderSection(id);
}

function renderSection(id) {
    // Cada módulo exporta su función de renderizado
    switch(id) {
        case 'colores':
            if (typeof renderColors === 'function') renderColors();
            break;
        case 'vocales':
            if (typeof renderVocals === 'function') renderVocals();
            break;
        case 'animales':
            if (typeof renderAnimals === 'function') renderAnimals();
            break;
        // ... etc
    }
}

function renderAllSections() {
    renderSection('colores');
    renderSection('vocales');
    renderSection('animales');
    // ... etc
}

// ============================================
// TOAST NOTIFICATIONS
// ============================================
export function showToast(message, type = '') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// ============================================
// FUNCIONES DE RECOMPENSAS
// ============================================
export async function addStars(n, element) {
    if (!APP.user) return;
    
    try {
        const profile = await AuthAPI.updateProfile(APP.user.id, {
            stars: (APP.profile?.stars || 0) + n
        });
        APP.profile = profile;
        updateUI();
        
        // Animación de estrellas
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
    
    try {
        const profile = await AuthAPI.updateProfile(APP.user.id, {
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
// EXPORTAR
// ============================================
export { APP };

// Iniciar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', initApp);
