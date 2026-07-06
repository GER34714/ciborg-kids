// js/main.js - PARTE 1: CONFIGURACIÓN Y DATOS

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
    isAdmin: false,
    coins: 50,
    stars: 0,
    level: 1
};

// ============================================
// DATOS DE LA APP
// ============================================
const COLORS = [
    { id: 'rojo', es: 'Rojo', en: 'Red', emoji: '🔴', bg: '#E74C3C', ex: ['🍎', '🌹', '🚒'] },
    { id: 'azul', es: 'Azul', en: 'Blue', emoji: '🔵', bg: '#3498DB', ex: ['🐋', '🌊', '☁️'] },
    { id: 'verde', es: 'Verde', en: 'Green', emoji: '🟢', bg: '#27AE60', ex: ['🌿', '🐸', '🌲'] },
    { id: 'amarillo', es: 'Amarillo', en: 'Yellow', emoji: '🟡', bg: '#F1C40F', ex: ['🌻', '🍋', '⭐'] },
    { id: 'naranja', es: 'Naranja', en: 'Orange', emoji: '🟠', bg: '#E67E22', ex: ['🍊', '🎃', '🦊'] },
    { id: 'rosa', es: 'Rosa', en: 'Pink', emoji: '🩷', bg: '#E91E8C', ex: ['🌸', '🍬', '🦩'] },
    { id: 'morado', es: 'Morado', en: 'Purple', emoji: '🟣', bg: '#9B59B6', ex: ['🍇', '🌷', '🦄'] },
    { id: 'celeste', es: 'Celeste', en: 'Light Blue', emoji: '🩵', bg: '#56CCF2', ex: ['🌤️', '🧊', '💙'] }
];

const VOCALS = [
    { id: 'a', es: 'A', en: 'A', emoji: '🦅', bg: '#E74C3C', word_es: 'Águila', word_en: 'Eagle', sound_es: 'a', sound_en: 'ei' },
    { id: 'e', es: 'E', en: 'E', emoji: '🐘', bg: '#3498DB', word_es: 'Elefante', word_en: 'Elephant', sound_es: 'e', sound_en: 'i' },
    { id: 'i', es: 'I', en: 'I', emoji: '🦎', bg: '#27AE60', word_es: 'Iguana', word_en: 'Iguana', sound_es: 'i', sound_en: 'ai' },
    { id: 'o', es: 'O', en: 'O', emoji: '🐻', bg: '#E67E22', word_es: 'Oso', word_en: 'Bear', sound_es: 'o', sound_en: 'ou' },
    { id: 'u', es: 'U', en: 'U', emoji: '🍇', bg: '#9B59B6', word_es: 'Uva', word_en: 'Grape', sound_es: 'u', sound_en: 'iu' }
];

const ALPHABET = [
    { l: 'A', en: 'ei', bg: '#E74C3C' }, { l: 'B', en: 'bi', bg: '#3498DB' }, { l: 'C', en: 'si', bg: '#27AE60' },
    { l: 'D', en: 'di', bg: '#E67E22' }, { l: 'E', en: 'i', bg: '#9B59B6' }, { l: 'F', en: 'ef', bg: '#E91E8C' },
    { l: 'G', en: 'yi', bg: '#F1C40F' }, { l: 'H', en: 'eich', bg: '#56CCF2' }, { l: 'I', en: 'ai', bg: '#E74C3C' },
    { l: 'J', en: 'yei', bg: '#3498DB' }, { l: 'K', en: 'kei', bg: '#27AE60' }, { l: 'L', en: 'el', bg: '#E67E22' },
    { l: 'M', en: 'em', bg: '#9B59B6' }, { l: 'N', en: 'en', bg: '#E91E8C' }, { l: 'Ñ', en: 'enie', bg: '#F1C40F' },
    { l: 'O', en: 'ou', bg: '#56CCF2' }, { l: 'P', en: 'pi', bg: '#E74C3C' }, { l: 'Q', en: 'kiu', bg: '#3498DB' },
    { l: 'R', en: 'ar', bg: '#27AE60' }, { l: 'S', en: 'es', bg: '#E67E22' }, { l: 'T', en: 'ti', bg: '#9B59B6' },
    { l: 'U', en: 'iu', bg: '#E91E8C' }, { l: 'V', en: 'vi', bg: '#F1C40F' }, { l: 'W', en: 'doble u', bg: '#56CCF2' },
    { l: 'X', en: 'ekis', bg: '#E74C3C' }, { l: 'Y', en: 'ye', bg: '#3498DB' }, { l: 'Z', en: 'zeta', bg: '#27AE60' }
];

const NUMBERS = [
    { n: 1, es: 'Uno', en: 'One', emoji: '1️⃣', dots: '●', bg: '#E74C3C' },
    { n: 2, es: 'Dos', en: 'Two', emoji: '2️⃣', dots: '●●', bg: '#E67E22' },
    { n: 3, es: 'Tres', en: 'Three', emoji: '3️⃣', dots: '●●●', bg: '#F1C40F' },
    { n: 4, es: 'Cuatro', en: 'Four', emoji: '4️⃣', dots: '●●●●', bg: '#27AE60' },
    { n: 5, es: 'Cinco', en: 'Five', emoji: '5️⃣', dots: '●●●●●', bg: '#3498DB' },
    { n: 6, es: 'Seis', en: 'Six', emoji: '6️⃣', dots: '●●●●●●', bg: '#9B59B6' },
    { n: 7, es: 'Siete', en: 'Seven', emoji: '7️⃣', dots: '●●●●●●●', bg: '#E91E8C' },
    { n: 8, es: 'Ocho', en: 'Eight', emoji: '8️⃣', dots: '●●●●●●●●', bg: '#16A085' },
    { n: 9, es: 'Nueve', en: 'Nine', emoji: '9️⃣', dots: '●●●●●●●●●', bg: '#E74C3C' },
    { n: 10, es: 'Diez', en: 'Ten', emoji: '🔟', dots: '●●●●●●●●●●', bg: '#2980B9' }
];

const ANIMALS = [
    { id: 'perro', es: 'Perro', en: 'Dog', emoji: '🐶', bg: '#E67E22', sound: 'Guau guau', sound_en: 'Woof woof' },
    { id: 'gato', es: 'Gato', en: 'Cat', emoji: '🐱', bg: '#E74C3C', sound: 'Miau', sound_en: 'Meow' },
    { id: 'vaca', es: 'Vaca', en: 'Cow', emoji: '🐮', bg: '#27AE60', sound: 'Muuu', sound_en: 'Moo' },
    { id: 'pato', es: 'Pato', en: 'Duck', emoji: '🦆', bg: '#3498DB', sound: 'Cuac cuac', sound_en: 'Quack' },
    { id: 'leon', es: 'León', en: 'Lion', emoji: '🦁', bg: '#F1C40F', sound: 'Roaar', sound_en: 'Roar' },
    { id: 'elefante', es: 'Elefante', en: 'Elephant', emoji: '🐘', bg: '#9B59B6', sound: 'Barritar', sound_en: 'Trumpet' },
    { id: 'mono', es: 'Mono', en: 'Monkey', emoji: '🐒', bg: '#16A085', sound: 'Uh uh ah', sound_en: 'Ooh ooh' },
    { id: 'conejo', es: 'Conejo', en: 'Rabbit', emoji: '🐰', bg: '#E91E8C', sound: 'Silencio', sound_en: 'Silent' }
];

const GEOMETRY = [
    { id: 'circulo', nombre: 'Círculo', emoji: '⭕', lados: '0', bg: '#E74C3C' },
    { id: 'cuadrado', nombre: 'Cuadrado', emoji: '🟦', lados: '4', bg: '#3498DB' },
    { id: 'triangulo', nombre: 'Triángulo', emoji: '🔺', lados: '3', bg: '#F1C40F' },
    { id: 'rectangulo', nombre: 'Rectángulo', emoji: '▬', lados: '4', bg: '#27AE60' },
    { id: 'pentagono', nombre: 'Pentágono', emoji: '⬠', lados: '5', bg: '#9B59B6' },
    { id: 'hexagono', nombre: 'Hexágono', emoji: '⬡', lados: '6', bg: '#E67E22' }
];

const STICKERS = [
    { id: 's1', nombre: 'Estrella', emoji: '⭐', precio: 20 },
    { id: 's2', nombre: 'Corazón', emoji: '❤️', precio: 15 },
    { id: 's3', nombre: 'Dragón', emoji: '🐉', precio: 30 },
    { id: 's4', nombre: 'Sirena', emoji: '🧜‍♀️', precio: 25 },
    { id: 's5', nombre: 'Robot', emoji: '🤖', precio: 20 },
    { id: 's6', nombre: 'Gato', emoji: '🐱', precio: 15 },
    { id: 's7', nombre: 'Perro', emoji: '🐶', precio: 15 },
    { id: 's8', nombre: 'Mariposa', emoji: '🦋', precio: 20 },
    { id: 's9', nombre: 'Arcoíris', emoji: '🌈', precio: 35 },
    { id: 's10', nombre: 'Cohete', emoji: '🚀', precio: 40 },
    { id: 's11', nombre: 'Pizza', emoji: '🍕', precio: 15 },
    { id: 's12', nombre: 'Castillo', emoji: '🏰', precio: 45 }
];

const STORIES = [
    {
        id: 'c1',
        titulo: 'El Dragón y la Estrella',
        emoji: '🐉⭐',
        desc: 'Un dragón que quería ser amigo de una estrella fugaz.',
        escenas: [
            '🐉 En un castillo lejano vivía un dragón llamado Dino.',
            '🌠 Dino veía cada noche una estrella brillar en el cielo.',
            '🤝 Un día, la estrella cayó y Dino la ayudó a volver al cielo.',
            '✨ Desde entonces, son los mejores amigos del universo.'
        ]
    },
    {
        id: 'c2',
        titulo: 'La Sirenita Aventurera',
        emoji: '🧜‍♀️🌊',
        desc: 'Una sirena que exploraba el fondo del mar en busca de tesoros.',
        escenas: [
            '🧜‍♀️ Coral era una sirena curiosa que amaba explorar.',
            '🐠 En su viaje conoció a un pez payaso muy divertido.',
            '💎 Juntos encontraron un cofre lleno de brillantes tesoros.',
            '🌈 Y compartieron la alegría con todos los seres del mar.'
        ]
    },
    {
        id: 'c3',
        titulo: 'El Robot y el Gato',
        emoji: '🤖🐱',
        desc: 'Un robot y un gato aprenden que la amistad no tiene fronteras.',
        escenas: [
            '🤖 En una ciudad futurista, un robot llamado Bolt vivía solo.',
            '🐱 Un gato callejero se acercó a Bolt y se hicieron amigos.',
            '🎵 Bailaron juntos al ritmo de la música electrónica.',
            '❤️ Descubrieron que el cariño no necesita cables ni ladridos.'
        ]
    }
];

const CARTOONS = [
    { id: 'v1', titulo: 'Canción del ABC', video_id: 't5jv0zZnNkU', categoria: 'educativo' },
    { id: 'v2', titulo: 'Números 1-10', video_id: 'bRNfZ3r_1zA', categoria: 'educativo' },
    { id: 'v3', titulo: 'Colores', video_id: 'dQw4w9WgXcQ', categoria: 'educativo' },
    { id: 'v4', titulo: 'Animales de la Granja', video_id: 'XqZsoesa55w', categoria: 'animales' },
    { id: 'v5', titulo: 'Cuento de la Sirenita', video_id: 'vZ7Tf2k5Xxo', categoria: 'cuentos' }
];

const READING = [
    { palabra: 'CASA', faltante: 'A', posicion: 1, opciones: ['A', 'E', 'I', 'O'] },
    { palabra: 'PERRO', faltante: 'E', posicion: 1, opciones: ['A', 'E', 'I', 'U'] },
    { palabra: 'GATO', faltante: 'A', posicion: 1, opciones: ['A', 'E', 'O', 'U'] },
    { palabra: 'SOL', faltante: 'O', posicion: 1, opciones: ['A', 'E', 'O', 'U'] },
    { palabra: 'LUNA', faltante: 'U', posicion: 1, opciones: ['A', 'E', 'I', 'U'] },
    { palabra: 'MAR', faltante: 'A', posicion: 1, opciones: ['A', 'E', 'I', 'O'] },
    { palabra: 'NUBE', faltante: 'U', posicion: 1, opciones: ['A', 'E', 'I', 'U'] },
    { palabra: 'FLOR', faltante: 'L', posicion: 0, opciones: ['L', 'R', 'M', 'N'] },
    { palabra: 'TREN', faltante: 'R', posicion: 1, opciones: ['L', 'R', 'M', 'N'] },
    { palabra: 'SER', faltante: 'E', posicion: 1, opciones: ['A', 'E', 'I', 'O'] }
];

// ============================================
// NUEVOS JUEGOS - DATOS ADICIONALES
// ============================================

// Datos para Trivia
const TRIVIA_QUESTIONS = [
    { pregunta: '¿Cuántas patas tiene un perro?', opciones: ['2', '3', '4', '5'], correcta: 2 },
    { pregunta: '¿Qué color es el sol?', opciones: ['Azul', 'Amarillo', 'Rojo', 'Verde'], correcta: 1 },
    { pregunta: '¿Cuántos dedos tiene una mano?', opciones: ['3', '4', '5', '6'], correcta: 2 },
    { pregunta: '¿Qué animal dice "muuu"?', opciones: ['Perro', 'Gato', 'Vaca', 'Pato'], correcta: 2 },
    { pregunta: '¿Cuál es el número después del 3?', opciones: ['1', '2', '4', '5'], correcta: 2 },
    { pregunta: '¿De qué color es el cielo en un día soleado?', opciones: ['Rojo', 'Amarillo', 'Azul', 'Verde'], correcta: 2 },
    { pregunta: '¿Qué forma tiene una pelota?', opciones: ['Cuadrado', 'Círculo', 'Triángulo', 'Rectángulo'], correcta: 1 },
    { pregunta: '¿Cuántas ruedas tiene un carro?', opciones: ['2', '3', '4', '5'], correcta: 2 }
];

// Datos para el Ahorcado
const HANGMAN_WORDS = [
    { palabra: 'MANZANA', pista: 'Fruta roja o verde' },
    { palabra: 'PERRO', pista: 'Animal que ladra' },
    { palabra: 'GATO', pista: 'Animal que maúlla' },
    { palabra: 'CASA', pista: 'Lugar donde vives' },
    { palabra: 'SOL', pista: 'Brilla en el cielo' },
    { palabra: 'LUNA', pista: 'Aparece de noche' },
    { palabra: 'FLOR', pista: 'Crece en el jardín' },
    { palabra: 'ARBOL', pista: 'Tiene hojas y tronco' }
];

// Datos para la Ruleta
const WHEEL_PRIZES = ['⭐ 5 Estrellas', '🪙 3 Monedas', '⭐ 10 Estrellas', '🪙 5 Monedas', '⭐ 2 Estrellas', '🪙 1 Moneda', '⭐ 15 Estrellas', '🪙 10 Monedas'];

// ============================================
// FUNCIONES DE INICIALIZACIÓN
// ============================================

export async function initApp() {
    console.log(`🚀 ${CONFIG.APP_NAME} v${CONFIG.VERSION}`);
    
    const authResult = await initAuth();
    console.log('📦 Resultado initAuth:', authResult);
    
    if (authResult.success && !authResult.blocked) {
        APP.user = authResult.user;
        APP.profile = authResult.profile;
        APP.isPremium = authResult.profile?.is_premium || false;
        APP.isAdmin = authResult.profile?.is_admin || false;
        APP.stars = authResult.profile?.stars || 0;
        APP.coins = authResult.profile?.coins || 50;
        APP.level = authResult.profile?.level || 1;
        
        await loadUserData();
        showMainApp();
    } else if (authResult.blocked) {
        showBlockedMessage();
    } else {
        showLoginScreen();
    }
    
    onAuthChange((user, profile) => {
        if (user && profile) {
            APP.user = user;
            APP.profile = profile;
            APP.isPremium = profile.is_premium || false;
            APP.isAdmin = profile.is_admin || false;
            APP.stars = profile.stars || 0;
            APP.coins = profile.coins || 50;
            APP.level = profile.level || 1;
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
    
    setupGoogleButton();
}// js/main.js - PARTE 2: FUNCIONES DE UI Y NAVEGACIÓN

// ============================================
// FUNCIONES DE UI
// ============================================

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
    if (levelDisplay) levelDisplay.textContent = APP.level || 1;
    if (levelBadge) levelBadge.textContent = APP.level || 1;
    if (starCount) starCount.textContent = APP.stars || 0;
    if (coinCount) coinCount.textContent = APP.coins || 50;
}

function showLoginScreen() {
    console.log('🔓 Mostrando pantalla de login');
    const loginScreen = document.getElementById('login-screen');
    if (loginScreen) loginScreen.style.display = 'flex';
    
    const mainContent = document.getElementById('mainContent');
    if (mainContent) mainContent.style.display = 'none';
    
    const appContent = document.getElementById('app-content');
    if (appContent) appContent.style.display = 'none';
}

function showMainApp() {
    console.log('📱 Mostrando contenido principal');
    const loginScreen = document.getElementById('login-screen');
    if (loginScreen) loginScreen.style.display = 'none';
    
    const mainContent = document.getElementById('mainContent');
    if (mainContent) mainContent.style.display = 'block';
    
    const appContent = document.getElementById('app-content');
    if (appContent) appContent.style.display = 'block';
    
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

function renderAllSections() {
    console.log('🎨 Renderizando todas las secciones');
    renderColors();
    renderVocales();
    renderAlphabet();
    renderNumeros();
    renderAnimales();
    renderGeometry();
    renderAlbum();
    renderShop();
    renderCuentos();
    renderCartoons();
    startMath('suma');
    startReading();
}

function renderSectionContent(id) {
    console.log('📦 Renderizando contenido de:', id);
    switch(id) {
        case 'colores': renderColors(); break;
        case 'vocales': renderVocales(); break;
        case 'abecedario': renderAlphabet(); break;
        case 'numeros': renderNumeros(); break;
        case 'animales': renderAnimales(); break;
        case 'geometria': renderGeometry(); break;
        case 'matematicas': startMath('suma'); break;
        case 'lectura': startReading(); break;
        case 'album': renderAlbum(); break;
        case 'tienda': renderShop(); break;
        case 'juegos': document.getElementById('game-area').innerHTML = ''; break;
        case 'cuentos': renderCuentos(); break;
        case 'cartoons': renderCartoons(); break;
    }
}

// ============================================
// NAVEGACIÓN
// ============================================

export function showSection(id) {
    console.log('📱 Mostrando sección:', id);
    APP.currentSection = id;
    
    document.querySelectorAll('.section-content').forEach(el => {
        el.classList.add('hidden');
    });
    
    const section = document.getElementById('sec-' + id);
    if (section) {
        section.classList.remove('hidden');
    } else {
        console.warn('⚠️ Sección no encontrada:', id);
    }
    
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.section === id);
    });
    
    document.querySelectorAll('.bnav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.section === id);
    });
    
    renderSectionContent(id);
}

// ============================================
// TOAST Y SPEECH
// ============================================

export function showToast(message, type = '') {
    console.log('🔔 Toast:', message, type);
    const container = document.getElementById('toast-area');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

export function speak(text, lang = 'es', rate = 0.9) {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang === 'es' ? 'es-AR' : 'en-US';
    u.rate = rate;
    u.pitch = 1.0;
    const voices = window.speechSynthesis.getVoices();
    const naturalVoice = voices.find(v =>
        v.lang.includes(lang === 'es' ? 'es' : 'en') &&
        (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Premium'))
    );
    if (naturalVoice) u.voice = naturalVoice;
    window.speechSynthesis.speak(u);
}

// ============================================
// RECOMPENSAS
// ============================================

export async function addStars(n, element) {
    if (!APP.user) return;
    APP.stars += n;
    updateUI();
    
    if (element) {
        const pop = document.createElement('div');
        pop.className = 'stars-pop';
        pop.textContent = `+${n} ⭐`;
        element.style.position = 'relative';
        element.appendChild(pop);
        setTimeout(() => pop.remove(), 1000);
    }
    
    try {
        await updateProfile({ stars: APP.stars });
    } catch (error) {
        console.error('Error saving stars:', error);
    }
}

export async function addCoins(n, element) {
    if (!APP.user) return;
    APP.coins += n;
    updateUI();
    
    if (element) {
        const pop = document.createElement('div');
        pop.className = 'coin-pop';
        pop.textContent = `+${n} 🪙`;
        element.style.position = 'relative';
        element.appendChild(pop);
        setTimeout(() => pop.remove(), 1000);
    }
    
    try {
        await updateProfile({ coins: APP.coins });
    } catch (error) {
        console.error('Error saving coins:', error);
    }
}

// ============================================
// CARGAR DATOS DEL USUARIO
// ============================================

async function loadUserData() {
    if (!APP.user) return;
    
    try {
        const progress = await ProgressAPI.getUserProgress(APP.user.id);
        APP.progress = progress.reduce((acc, p) => {
            if (!acc[p.category]) acc[p.category] = [];
            acc[p.category].push(p.item_id);
            return acc;
        }, {});
        
        APP.colDone = new Set(
            progress.filter(p => p.category === 'colores').map(p => p.item_id)
        );
        
        const stickers = await StickerAPI.getUserStickers(APP.user.id);
        APP.stickerCollection = new Set(stickers.map(s => s.sticker_id));
        
        updateUI();
        renderAllSections();
        
    } catch (error) {
        console.error('Error cargando datos:', error);
    }
}

function setupGoogleButton() {
    const googleBtn = document.getElementById('google-login-btn');
    if (googleBtn) {
        const newBtn = googleBtn.cloneNode(true);
        googleBtn.parentNode.replaceChild(newBtn, googleBtn);
        newBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('🖱️ Click en botón Google');
            window.loginWithGoogle();
        });
    }
}// js/main.js - PARTE 3: COLORES, VOCALES, ABECEDARIO, NÚMEROS

// ============================================
// RENDER: COLORES
// ============================================

export function renderColors() {
    const grid = document.getElementById('color-list');
    if (!grid) return;
    grid.innerHTML = '';
    COLORS.forEach(c => {
        const card = document.createElement('div');
        card.className = 'lesson-card';
        card.style.background = c.bg;
        const isDone = APP.colDone.has(c.id);
        card.innerHTML = `
            <div class="lc-stars">⭐ 5</div>
            ${isDone ? '<div class="lc-completed">✅</div>' : ''}
            <span class="lc-emoji">${c.emoji}</span>
            <div class="lc-word">${c.es}</div>
            <div class="lc-en">${c.en}</div>
        `;
        if (isDone) card.classList.add('done');
        card.onclick = () => openColorDetail(c, card);
        grid.appendChild(card);
    });
    updateColorProgress();
}

function updateColorProgress() {
    const total = COLORS.length;
    const done = APP.colDone.size;
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
    const progFill = document.getElementById('col-prog');
    const progTxt = document.getElementById('col-prog-txt');
    if (progFill) progFill.style.width = pct + '%';
    if (progTxt) progTxt.textContent = done + ' / ' + total;
}

function openColorDetail(c, card) {
    speak(c.es, 'es');
    document.getElementById('color-list').style.display = 'none';
    const panel = document.getElementById('color-detail');
    panel.classList.add('visible');

    const wrong = COLORS.filter(x => x.id !== c.id).sort(() => Math.random() - 0.5).slice(0, 3);
    const opts = [c, ...wrong].sort(() => Math.random() - 0.5);

    panel.innerHTML = `
        <button class="back-btn" onclick="window.closeColorDetail()">← Volver</button>
        <div style="background:${c.bg};border-radius:24px;padding:24px 32px;margin-bottom:16px;width:100%;cursor:pointer" onclick="window.speak('${c.es}','es')">
            <span style="font-size:80px;display:block;animation:bounceIn 0.6s ease">${c.emoji}</span>
            <div style="font-size:44px;font-weight:900;color:#fff;margin:8px 0">${c.es}</div>
            <div style="font-size:20px;color:rgba(255,255,255,0.85);font-weight:700">${c.en}</div>
        </div>
        <div class="detail-flags">
            <button class="flag-btn es" onclick="window.speak('${c.es}','es')">🇦🇷 Español</button>
            <button class="flag-btn en" onclick="window.speak('${c.en}','en')">🇺🇸 English</button>
        </div>
        <div style="font-size:14px;font-weight:900;color:#888;margin-bottom:10px">Ejemplos:</div>
        <div class="detail-examples">
            ${c.ex.map(e => `<span class="ex-item" style="background:${c.bg}">${e}</span>`).join('')}
        </div>
        <div class="detail-quiz">
            <div class="quiz-q">¿Cuál es el color <strong>${c.es}</strong>?</div>
            <div class="quiz-opts">
                ${opts.map(x => `<button class="quiz-btn" style="font-size:28px" onclick="window.checkColorQuiz('${x.id}','${c.id}',this)">${x.emoji}</button>`).join('')}
            </div>
        </div>
    `;

    if (!APP.colDone.has(c.id) && APP.user) {
        APP.colDone.add(c.id);
        updateColorProgress();
        addStars(5, card);
        card.innerHTML += '<div class="lc-completed">✅</div>';
        card.classList.add('done');
        speak('¡Bien hecho! Has aprendido el color ' + c.es, 'es');
        if (APP.colDone.size === COLORS.length) {
            showToast('🎉 ¡Completaste todos los colores! +10 🪙', 'warning');
            addCoins(10, document.getElementById('color-detail'));
        }
    }
}

export function closeColorDetail() {
    document.getElementById('color-list').style.display = '';
    document.getElementById('color-detail').classList.remove('visible');
    document.getElementById('color-detail').innerHTML = '';
}

export function checkColorQuiz(chosen, correct, btn) {
    const btns = document.querySelectorAll('.quiz-btn');
    btns.forEach(b => b.disabled = true);
    if (chosen === correct) {
        btn.classList.add('correct');
        speak('¡Muy bien! ¡Correcto!', 'es');
        showToast('🎉 ¡Excelente! +5 ⭐');
        addStars(5, document.getElementById('color-detail'));
    } else {
        btn.classList.add('wrong');
        speak('Casi, intenta de nuevo', 'es');
        setTimeout(() => {
            btns.forEach(b => { b.disabled = false; b.classList.remove('wrong'); });
        }, 800);
    }
}

// ============================================
// RENDER: VOCALES
// ============================================

export function renderVocales() {
    const grid = document.getElementById('vocal-list');
    if (!grid) return;
    grid.innerHTML = '';
    VOCALS.forEach(v => {
        const card = document.createElement('div');
        card.className = 'lesson-card';
        card.style.background = v.bg;
        card.innerHTML = `
            <span class="lc-emoji" style="font-size:52px;font-weight:900;color:#fff">${v.es}</span>
            <div class="lc-word">${v.word_es}</div>
            <div class="lc-en">${v.word_en}</div>
        `;
        card.onclick = () => openVocalDetail(v);
        grid.appendChild(card);
    });
}

function openVocalDetail(v) {
    speak(v.es, 'es');
    document.getElementById('vocal-list').style.display = 'none';
    const panel = document.getElementById('vocal-detail');
    panel.classList.add('visible');

    const wrong = VOCALS.filter(x => x.id !== v.id).sort(() => Math.random() - 0.5).slice(0, 3);
    const opts = [v, ...wrong].sort(() => Math.random() - 0.5);

    panel.innerHTML = `
        <button class="back-btn" onclick="window.closeVocalDetail()">← Volver</button>
        <div style="background:${v.bg};border-radius:24px;padding:24px 32px;margin-bottom:16px;width:100%;cursor:pointer" onclick="window.speak('${v.es}','es')">
            <div style="font-size:90px;font-weight:900;color:#fff;line-height:1">${v.es}</div>
            <div style="font-size:52px;margin:8px 0;animation:bounceIn 0.5s ease">${v.emoji}</div>
            <div style="font-size:22px;font-weight:900;color:#fff">${v.word_es}</div>
            <div style="font-size:14px;color:rgba(255,255,255,0.85);font-weight:700">${v.word_en}</div>
        </div>
        <div class="detail-flags">
            <button class="flag-btn es" onclick="window.speak('${v.es} ${v.word_es}','es')">🇦🇷 "${v.sound_es}" · ${v.word_es}</button>
            <button class="flag-btn en" onclick="window.speak('${v.sound_en} ${v.word_en}','en')">🇺🇸 "${v.sound_en}" · ${v.word_en}</button>
        </div>
        <div class="detail-quiz">
            <div class="quiz-q">¿Cuál es la vocal <strong>${v.es}</strong>?</div>
            <div class="quiz-opts">
                ${opts.map(x => `<button class="quiz-btn" style="font-size:36px;font-weight:900;color:${x.bg}" onclick="window.checkVocalQuiz('${x.id}','${v.id}',this)">${x.es}</button>`).join('')}
            </div>
        </div>
    `;
}

export function checkVocalQuiz(chosen, correct, btn) {
    const btns = document.querySelectorAll('.quiz-btn');
    btns.forEach(b => b.disabled = true);
    if (chosen === correct) {
        btn.classList.add('correct');
        speak('¡Muy bien! La vocal ' + correct.toUpperCase(), 'es');
        showToast('🎉 ¡Correcto! +5 ⭐');
        addStars(5, document.getElementById('vocal-detail'));
    } else {
        btn.classList.add('wrong');
        speak('Intenta de nuevo', 'es');
        setTimeout(() => {
            btns.forEach(b => { b.disabled = false; b.classList.remove('wrong'); });
        }, 800);
    }
}

export function closeVocalDetail() {
    document.getElementById('vocal-list').style.display = '';
    document.getElementById('vocal-detail').classList.remove('visible');
    document.getElementById('vocal-detail').innerHTML = '';
}

// ============================================
// RENDER: ABECEDARIO
// ============================================

export function renderAlphabet() {
    const grid = document.getElementById('alpha-list');
    if (!grid) return;
    grid.innerHTML = '';
    ALPHABET.forEach(a => {
        const card = document.createElement('div');
        card.className = 'alpha-card';
        card.style.background = a.bg;
        card.innerHTML = `<span class="letter">${a.l}</span><span class="letter-en">${a.en}</span>`;
        card.onclick = () => {
            speak(a.l, 'es');
            setTimeout(() => speak(a.en, 'en', 0.7), 800);
            card.style.transform = 'scale(1.2) rotate(-4deg)';
            card.style.border = '3px solid #fff';
            showToast('🔤 Letra ' + a.l + ' · en inglés: ' + a.en);
            addStars(1, card);
            setTimeout(() => {
                card.style.transform = '';
                card.style.border = '3px solid transparent';
            }, 600);
        };
        grid.appendChild(card);
    });
}

// ============================================
// RENDER: NÚMEROS
// ============================================

export function renderNumeros() {
    const grid = document.getElementById('num-list');
    if (!grid) return;
    grid.innerHTML = '';
    NUMBERS.forEach(n => {
        const card = document.createElement('div');
        card.className = 'num-card';
        card.style.background = n.bg;
        card.innerHTML = `
            <span class="num-big">${n.n}</span>
            <div class="num-dots">${n.dots}</div>
            <div class="num-word">${n.es} · ${n.en}</div>
        `;
        card.onclick = () => openNumDetail(n);
        grid.appendChild(card);
    });
}

function openNumDetail(n) {
    speak(n.es + '... ' + n.n, 'es');
    document.getElementById('num-list').style.display = 'none';
    const panel = document.getElementById('num-detail');
    panel.classList.add('visible');

    const wrong = NUMBERS.filter(x => x.n !== n.n).sort(() => Math.random() - 0.5).slice(0, 3);
    const opts = [n, ...wrong].sort(() => Math.random() - 0.5);

    panel.innerHTML = `
        <button class="back-btn" onclick="window.closeNumDetail()">← Volver</button>
        <div style="background:${n.bg};border-radius:24px;padding:24px 32px;margin-bottom:16px;width:100%;cursor:pointer" onclick="window.speak('${n.es}','es')">
            <div style="font-size:90px;font-weight:900;color:#fff;line-height:1;animation:bounceIn 0.5s ease">${n.n}</div>
            <div style="font-size:28px;color:rgba(255,255,255,0.9);margin:8px 0;letter-spacing:2px">${n.dots}</div>
            <div style="font-size:28px;font-weight:900;color:#fff">${n.es}</div>
            <div style="font-size:16px;color:rgba(255,255,255,0.85);font-weight:700">${n.en}</div>
        </div>
        <div class="detail-flags">
            <button class="flag-btn es" onclick="window.speak('${n.es}','es')">🇦🇷 ${n.es}</button>
            <button class="flag-btn en" onclick="window.speak('${n.en}','en')">🇺🇸 ${n.en}</button>
        </div>
        <div class="detail-quiz">
            <div class="quiz-q">¿Cuál es el número <strong>${n.n}</strong>?</div>
            <div class="quiz-opts">
                ${opts.map(x => `<button class="quiz-btn" style="font-size:32px;font-weight:900;background:${x.bg};color:#fff;border-color:${x.bg}" onclick="window.checkNumQuiz(${x.n},${n.n},this)">${x.n}</button>`).join('')}
            </div>
        </div>
    `;
}

export function checkNumQuiz(chosen, correct, btn) {
    const btns = document.querySelectorAll('.quiz-btn');
    btns.forEach(b => b.disabled = true);
    if (chosen === correct) {
        btn.classList.add('correct');
        speak('¡Muy bien! El número ' + correct, 'es');
        showToast('🎉 ¡Correcto! +5 ⭐');
        addStars(5, document.getElementById('num-detail'));
    } else {
        btn.classList.add('wrong');
        speak('Ese es el ' + chosen + '. Intenta de nuevo', 'es');
        setTimeout(() => {
            btns.forEach(b => { b.disabled = false; b.classList.remove('wrong'); });
        }, 900);
    }
}

export function closeNumDetail() {
    document.getElementById('num-list').style.display = '';
    document.getElementById('num-detail').classList.remove('visible');
    document.getElementById('num-detail').innerHTML = '';
}// js/main.js - PARTE 4: ANIMALES, GEOMETRÍA, MATEMÁTICAS, LECTURA

// ============================================
// RENDER: ANIMALES
// ============================================

export function renderAnimales() {
    const grid = document.getElementById('animal-list');
    if (!grid) return;
    grid.innerHTML = '';
    ANIMALS.forEach(a => {
        const card = document.createElement('div');
        card.className = 'lesson-card';
        card.style.background = a.bg;
        card.innerHTML = `
            <span class="lc-emoji">${a.emoji}</span>
            <div class="lc-word">${a.es}</div>
            <div class="lc-en">${a.en}</div>
            <div class="lc-badge">🔊</div>
        `;
        card.onclick = () => openAnimalDetail(a);
        grid.appendChild(card);
    });
}

function openAnimalDetail(a) {
    speak(a.es, 'es');
    document.getElementById('animal-list').style.display = 'none';
    const panel = document.getElementById('animal-detail');
    panel.classList.add('visible');

    const wrong = ANIMALS.filter(x => x.id !== a.id).sort(() => Math.random() - 0.5).slice(0, 3);
    const opts = [a, ...wrong].sort(() => Math.random() - 0.5);

    panel.innerHTML = `
        <button class="back-btn" onclick="window.closeAnimalDetail()">← Volver</button>
        <div style="background:${a.bg};border-radius:24px;padding:24px 32px;margin-bottom:16px;width:100%;cursor:pointer" onclick="window.speak('${a.es}. ${a.sound}','es')">
            <span style="font-size:80px;display:block;animation:bounceIn 0.5s ease">${a.emoji}</span>
            <div style="font-size:36px;font-weight:900;color:#fff;margin:8px 0">${a.es}</div>
            <div style="font-size:18px;color:rgba(255,255,255,0.85);font-weight:700">${a.en}</div>
        </div>
        <div class="detail-flags">
            <button class="flag-btn es" onclick="window.speak('El ${a.es.toLowerCase()} hace... ${a.sound}','es')">🇦🇷 "${a.sound}"</button>
            <button class="flag-btn en" onclick="window.speak('The ${a.en.toLowerCase()} goes... ${a.sound_en}','en')">🇺🇸 "${a.sound_en}"</button>
        </div>
        <div class="detail-quiz">
            <div class="quiz-q">¿Cuál es el <strong>${a.es}</strong>?</div>
            <div class="quiz-opts">
                ${opts.map(x => `<button class="quiz-btn" style="font-size:42px" onclick="window.checkAnimalQuiz('${x.id}','${a.id}',this)">${x.emoji}</button>`).join('')}
            </div>
        </div>
    `;
}

export function checkAnimalQuiz(chosen, correct, btn) {
    const btns = document.querySelectorAll('.quiz-btn');
    btns.forEach(b => b.disabled = true);
    if (chosen === correct) {
        btn.classList.add('correct');
        const a = ANIMALS.find(x => x.id === correct);
        speak('¡Muy bien! Es el ' + a.es, 'es');
        showToast('🎉 ¡Correcto! +5 ⭐');
        addStars(5, document.getElementById('animal-detail'));
    } else {
        btn.classList.add('wrong');
        speak('Intenta de nuevo', 'es');
        setTimeout(() => {
            btns.forEach(b => { b.disabled = false; b.classList.remove('wrong'); });
        }, 900);
    }
}

export function closeAnimalDetail() {
    document.getElementById('animal-list').style.display = '';
    document.getElementById('animal-detail').classList.remove('visible');
    document.getElementById('animal-detail').innerHTML = '';
}

// ============================================
// RENDER: GEOMETRÍA
// ============================================

export function renderGeometry() {
    const container = document.getElementById('geometry-list');
    if (!container) return;
    container.innerHTML = '';
    GEOMETRY.forEach(g => {
        const card = document.createElement('div');
        card.className = 'lesson-card';
        card.style.background = g.bg;
        card.innerHTML = `
            <span class="lc-emoji">${g.emoji}</span>
            <div class="lc-word">${g.nombre}</div>
            <div class="lc-en">${g.lados} lados</div>
        `;
        card.onclick = () => openGeometryDetail(g);
        container.appendChild(card);
    });
}

function openGeometryDetail(g) {
    const panel = document.getElementById('geometry-detail');
    if (!panel) return;
    document.getElementById('geometry-list').style.display = 'none';
    panel.classList.add('visible');

    const ladosNum = parseInt(g.lados) || 0;
    const options = [0, 1, 2, 3, 4, 5, 6, 7, 8].filter(n => n !== ladosNum).sort(() => Math.random() - 0.5).slice(0, 3);
    options.push(ladosNum);
    options.sort(() => Math.random() - 0.5);

    panel.innerHTML = `
        <button class="back-btn" onclick="window.closeGeometryDetail()">← Volver</button>
        <div style="background:${g.bg};border-radius:24px;padding:32px;width:100%;text-align:center;color:#fff">
            <div style="font-size:80px">${g.emoji}</div>
            <div style="font-size:36px;font-weight:900;margin:8px 0">${g.nombre}</div>
            <div style="font-size:18px">Tiene ${g.lados} lados</div>
        </div>
        <div class="detail-quiz" style="margin-top:16px;width:100%">
            <div class="quiz-q">¿Cuántos lados tiene el ${g.nombre}?</div>
            <div class="quiz-opts">
                ${options.map(n => `
                    <button class="quiz-btn" onclick="window.checkGeometryQuiz(${n}, ${ladosNum}, this)">
                        ${n}
                    </button>
                `).join('')}
            </div>
        </div>
    `;
}

export function checkGeometryQuiz(chosen, correct, btn) {
    const btns = document.querySelectorAll('.quiz-btn');
    btns.forEach(b => b.disabled = true);
    if (chosen === correct) {
        btn.classList.add('correct');
        showToast('🎉 ¡Correcto! +5 ⭐');
        addStars(5, document.getElementById('geometry-detail'));
        speak('¡Muy bien!', 'es');
    } else {
        btn.classList.add('wrong');
        speak('Casi, intenta de nuevo', 'es');
        setTimeout(() => {
            btns.forEach(b => { b.disabled = false; b.classList.remove('wrong'); });
        }, 800);
    }
}

export function closeGeometryDetail() {
    document.getElementById('geometry-list').style.display = '';
    document.getElementById('geometry-detail').classList.remove('visible');
    document.getElementById('geometry-detail').innerHTML = '';
}

// ============================================
// RENDER: MATEMÁTICAS
// ============================================

let mathState = { type: 'suma' };

export function startMath(type) {
    mathState.type = type;
    generateMathProblem();
}

function generateMathProblem() {
    const type = mathState.type;
    let num1, num2, answer, operator, operatorSymbol;

    if (type === 'suma' || (type === 'mixto' && Math.random() < 0.5)) {
        num1 = Math.floor(Math.random() * 9) + 1;
        num2 = Math.floor(Math.random() * (10 - num1)) + 1;
        answer = num1 + num2;
        operator = 'suma';
        operatorSymbol = '+';
    } else {
        num1 = Math.floor(Math.random() * 9) + 2;
        num2 = Math.floor(Math.random() * (num1 - 1)) + 1;
        answer = num1 - num2;
        operator = 'resta';
        operatorSymbol = '−';
    }

    let wrongAnswers = new Set();
    while (wrongAnswers.size < 3) {
        let wrong = answer + (Math.floor(Math.random() * 6) + 1) * (Math.random() < 0.5 ? 1 : -1);
        if (wrong !== answer && wrong >= 0 && wrong <= 20) {
            wrongAnswers.add(wrong);
        }
    }
    const options = [answer, ...wrongAnswers].sort(() => Math.random() - 0.5);

    const area = document.getElementById('math-area');
    if (!area) return;
    area.innerHTML = `
        <div class="math-container">
            <div style="font-size:18px;font-weight:900;opacity:0.9">${operator === 'suma' ? '➕ Suma' : '➖ Resta'}</div>
            <div class="math-question">${num1} ${operatorSymbol} ${num2} = ?</div>
            <div class="math-options">
                ${options.map(opt => `<button class="math-btn" onclick="window.checkMathAnswer(${opt},${answer},this)">${opt}</button>`).join('')}
            </div>
            <div style="margin-top:12px;font-size:14px;opacity:0.8" id="math-status">💡 ¿Cuál es el resultado?</div>
        </div>
    `;
}

export function checkMathAnswer(chosen, correct, btn) {
    const btns = document.querySelectorAll('.math-btn');
    btns.forEach(b => b.disabled = true);

    if (chosen === correct) {
        btn.classList.add('correct');
        document.getElementById('math-status').textContent = '✅ ¡Correcto! +5 ⭐';
        speak('¡Muy bien! Es ' + correct, 'es');
        showToast('🎉 ¡Correcto! +5 ⭐');
        addStars(5, document.getElementById('math-area'));
        setTimeout(() => {
            btns.forEach(b => { b.disabled = false; b.classList.remove('correct'); });
            generateMathProblem();
        }, 1500);
    } else {
        btn.classList.add('wrong');
        document.getElementById('math-status').textContent = '❌ Intenta de nuevo';
        speak('Casi, intenta de nuevo', 'es');
        setTimeout(() => {
            btns.forEach(b => { b.disabled = false; b.classList.remove('wrong'); });
        }, 800);
    }
}

// ============================================
// RENDER: LECTURA
// ============================================

let readingState = { used: new Set() };

export function startReading() {
    readingState.used = new Set();
    generateReadingProblem();
}

function generateReadingProblem() {
    const available = READING.filter((_, i) => !readingState.used.has(i));
    const area = document.getElementById('reading-area');
    if (!area) return;

    if (available.length === 0) {
        area.innerHTML = `
            <div style="text-align:center;padding:40px;background:#f8f9fa;border-radius:24px">
                <div style="font-size:48px">🎉</div>
                <div style="font-size:20px;font-weight:900;margin-top:12px">¡Completaste todas las palabras!</div>
                <button class="flag-btn" style="background:#4A90E2;color:#fff;margin-top:16px" onclick="window.startReading()">🔄 Jugar de nuevo</button>
            </div>
        `;
        return;
    }

    const idx = Math.floor(Math.random() * available.length);
    const originalIdx = READING.indexOf(available[idx]);
    readingState.used.add(originalIdx);

    const item = READING[originalIdx];
    const wordArray = item.palabra.split('');
    wordArray[item.posicion] = '?';

    area.innerHTML = `
        <div class="reading-container">
            <div style="font-size:16px;font-weight:900;color:#2d2d2d">📚 ¿Qué letra falta?</div>
            <div class="reading-word">
                ${wordArray.map((letter, i) => {
                    if (letter === '?') {
                        return `<span class="reading-missing">?</span>`;
                    }
                    return `<span style="display:inline-block;width:45px;height:45px;line-height:45px;font-size:28px;font-weight:900;color:#2d2d2d">${letter}</span>`;
                }).join('')}
            </div>
            <div style="font-size:14px;color:#666;margin-bottom:8px">Selecciona la letra correcta</div>
            <div class="reading-options">
                ${item.opciones.map(opt => `<button class="reading-btn" onclick="window.checkReadingAnswer('${opt}','${item.faltante}',this)">${opt}</button>`).join('')}
            </div>
            <div style="margin-top:12px;font-size:14px;font-weight:700;color:#2d2d2d" id="reading-status">🔍 ¿Cuál es la letra que falta?</div>
        </div>
    `;
    speak('¿Qué letra falta en ' + item.palabra + '?', 'es', 0.8);
}

export function checkReadingAnswer(chosen, correct, btn) {
    const btns = document.querySelectorAll('.reading-btn');
    btns.forEach(b => b.disabled = true);

    if (chosen === correct) {
        btn.classList.add('correct');
        document.getElementById('reading-status').textContent = '✅ ¡Correcto! La letra es ' + correct;
        speak('¡Muy bien! La letra es ' + correct, 'es');
        showToast('🎉 ¡Correcto! +5 ⭐');
        addStars(5, document.getElementById('reading-area'));
        setTimeout(() => {
            btns.forEach(b => { b.disabled = false; b.classList.remove('correct'); });
            generateReadingProblem();
        }, 1500);
    } else {
        btn.classList.add('wrong');
        document.getElementById('reading-status').textContent = '❌ Intenta de nuevo';
        speak('Casi, intenta de nuevo', 'es');
        setTimeout(() => {
            btns.forEach(b => { b.disabled = false; b.classList.remove('wrong'); });
        }, 800);
    }
}// js/main.js - PARTE 5: ÁLBUM, TIENDA, JUEGOS

// ============================================
// RENDER: ÁLBUM
// ============================================

export function renderAlbum() {
    const area = document.getElementById('album-area');
    if (!area) return;
    const total = STICKERS.length;
    const collected = APP.stickerCollection.size;

    area.innerHTML = `
        <div class="album-container">
            <div class="album-header">
                <div class="album-title">📒 Mi Álbum de Figuritas</div>
                <div class="album-progress">${collected} / ${total} (${Math.round(collected/total*100)}%)</div>
            </div>
            <div class="prog-wrap">
                <div class="prog-track"><div class="prog-fill" style="width:${(collected/total)*100}%"></div></div>
            </div>
            <div class="sticker-grid">
                ${STICKERS.map(s => `
                    <div class="sticker-slot ${APP.stickerCollection.has(s.id) ? 'filled' : ''}">
                        ${APP.stickerCollection.has(s.id) ? s.emoji : '❓'}
                        ${APP.stickerCollection.has(s.id) ? `<span class="sticker-name">${s.nombre}</span>` : ''}
                    </div>
                `).join('')}
            </div>
            <div style="text-align:center;margin-top:16px;font-size:14px;font-weight:700;color:#888">
                ${collected === total ? '🎉 ¡Álbum completo! Eres un coleccionista estrella ⭐' : '💡 Completa desafíos y compra figuritas en la tienda'}
            </div>
        </div>
    `;
}

// ============================================
// RENDER: TIENDA
// ============================================

export function renderShop() {
    const area = document.getElementById('shop-area');
    if (!area) return;

    area.innerHTML = `
        <div class="shop-container">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;flex-wrap:wrap;gap:10px">
                <div class="album-title">🛒 Tienda de Figuritas</div>
                <div style="font-size:16px;font-weight:900;color:#FFA500">🪙 ${APP.coins} monedas</div>
            </div>
            <div class="shop-grid">
                ${STICKERS.map(s => {
                    const owned = APP.stickerCollection.has(s.id);
                    return `
                        <div class="shop-item ${owned ? 'owned' : ''}" onclick="window.buySticker('${s.id}')">
                            <span class="shop-emoji">${s.emoji}</span>
                            <div class="shop-name">${s.nombre}</div>
                            <div class="shop-price">${owned ? '✅ Comprada' : '🪙 ' + s.precio}</div>
                            ${owned ? '<span class="shop-badge">En álbum</span>' : `<span class="shop-badge">Comprar</span>`}
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;
}

export async function buySticker(stickerId) {
    const sticker = STICKERS.find(s => s.id === stickerId);
    if (!sticker) return;

    if (APP.stickerCollection.has(stickerId)) {
        showToast('💡 Ya tienes esta figurita', 'warning');
        return;
    }

    if (APP.coins < sticker.precio) {
        showToast('😅 No tienes suficientes monedas. ¡Gana más haciendo desafíos!', 'error');
        return;
    }

    APP.coins -= sticker.precio;
    APP.stickerCollection.add(stickerId);
    updateUI();
    
    try {
        await updateProfile({ coins: APP.coins });
        await StickerAPI.collectSticker(APP.user.id, stickerId);
    } catch (error) {
        console.error('Error saving sticker:', error);
    }
    
    showToast(`🎉 ¡Compraste ${sticker.nombre}! ${sticker.emoji}`, 'warning');
    speak('¡Has comprado la figurita ' + sticker.nombre + '!', 'es');
    renderShop();
    renderAlbum();

    if (APP.stickerCollection.size === STICKERS.length) {
        showToast('🎊 ¡Álbum completado! +50 🪙', 'warning');
        await addCoins(50, document.getElementById('shop-area'));
    }
}

// ============================================
// JUEGOS EXISTENTES
// ============================================

let matchGameState = { selected: null, pairs: [], matched: new Set() };
let numGameState = { nums: [], order: [] };

export function startMatchGame() {
    const area = document.getElementById('game-area');
    if (!area) return;
    const items = ['🔴', '🔵', '🟢', '🟡', '🟠', '🩷'];
    const pairs = [...items, ...items].sort(() => Math.random() - 0.5);
    matchGameState = { selected: null, pairs: pairs, matched: new Set() };

    area.innerHTML = `
        <div style="font-size:18px;font-weight:900;margin-bottom:12px">🧩 Memory Match · Encuentra las parejas</div>
        <div class="match-grid" id="match-grid">
            ${pairs.map((p, i) => `<div class="match-item" data-idx="${i}" data-emoji="${p}" onclick="window.matchClick(${i})">❓</div>`).join('')}
        </div>
        <div style="text-align:center;font-size:14px;font-weight:700;color:#888" id="match-status">🔍 Encuentra las parejas</div>
    `;
}

export function matchClick(idx) {
    const grid = document.getElementById('match-grid');
    if (!grid) return;
    const items = grid.querySelectorAll('.match-item');
    if (matchGameState.matched.has(idx)) return;

    if (matchGameState.selected === null) {
        matchGameState.selected = idx;
        items[idx].textContent = items[idx].dataset.emoji;
        items[idx].classList.add('selected');
    } else if (matchGameState.selected === idx) {
        items[idx].textContent = '❓';
        items[idx].classList.remove('selected');
        matchGameState.selected = null;
    } else {
        const first = matchGameState.selected;
        items[idx].textContent = items[idx].dataset.emoji;

        if (items[first].dataset.emoji === items[idx].dataset.emoji) {
            items[first].classList.add('correct');
            items[idx].classList.add('correct');
            matchGameState.matched.add(first);
            matchGameState.matched.add(idx);
            matchGameState.selected = null;
            showToast('🎉 Pareja encontrada! +3 ⭐');
            addStars(3, document.getElementById('game-area'));

            if (matchGameState.matched.size === items.length) {
                document.getElementById('match-status').textContent = '🏆 ¡Ganaste! +5 🪙';
                addCoins(5, document.getElementById('game-area'));
                speak('¡Ganaste! Eres el mejor', 'es');
            }
        } else {
            items[first].classList.add('wrong');
            items[idx].classList.add('wrong');
            document.getElementById('match-status').textContent = '❌ No coinciden';
            setTimeout(() => {
                items[first].textContent = '❓';
                items[idx].textContent = '❓';
                items[first].classList.remove('wrong', 'selected');
                items[idx].classList.remove('wrong');
                matchGameState.selected = null;
                document.getElementById('match-status').textContent = '🔍 Encuentra las parejas';
            }, 700);
        }
    }
}

export function startColorGame() {
    const area = document.getElementById('game-area');
    if (!area) return;
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    const wrong = COLORS.filter(c => c.id !== color.id).sort(() => Math.random() - 0.5).slice(0, 3);
    const options = [color, ...wrong].sort(() => Math.random() - 0.5);

    area.innerHTML = `
        <div style="font-size:18px;font-weight:900;margin-bottom:12px">🎯 ¿Qué color es este?</div>
        <div style="font-size:80px;text-align:center;padding:20px;background:#f8f9fa;border-radius:20px;margin-bottom:16px;cursor:pointer" onclick="window.speak('${color.es}','es')">${color.emoji}</div>
        <div class="color-game-options">
            ${options.map(c => `<button class="color-game-btn" style="background:${c.bg}" onclick="window.checkColorGame('${c.id}','${color.id}',this)">${c.es}</button>`).join('')}
        </div>
        <div style="text-align:center;font-size:14px;font-weight:700;color:#888;margin-top:12px" id="color-game-status">🎨 ¡Elige el color correcto!</div>
    `;
}

export function checkColorGame(chosen, correct, btn) {
    const btns = document.querySelectorAll('.color-game-btn');
    btns.forEach(b => b.disabled = true);

    if (chosen === correct) {
        btn.classList.add('correct');
        document.getElementById('color-game-status').textContent = '✅ ¡Correcto! +5 ⭐';
        showToast('🎉 ¡Acertaste! +5 ⭐');
        addStars(5, document.getElementById('game-area'));
        speak('¡Muy bien! Es ' + COLORS.find(c => c.id === correct).es, 'es');
        setTimeout(() => {
            btns.forEach(b => { b.disabled = false; b.classList.remove('correct'); });
            startColorGame();
        }, 1500);
    } else {
        btn.classList.add('wrong');
        document.getElementById('color-game-status').textContent = '❌ Intenta de nuevo';
        speak('Casi, intenta de nuevo', 'es');
        setTimeout(() => {
            btns.forEach(b => { b.disabled = false; b.classList.remove('wrong'); });
        }, 800);
    }
}

export function startNumberGame() {
    const area = document.getElementById('game-area');
    if (!area) return;
    const nums = [...NUMBERS].sort(() => Math.random() - 0.5);
    numGameState = { nums: nums, order: [] };

    area.innerHTML = `
        <div style="font-size:18px;font-weight:900;margin-bottom:12px">🔢 Ordena los números del 1 al 10</div>
        <div class="num-game-grid" id="num-game-grid">
            ${nums.map((n, i) => `<div class="num-game-card" style="background:${n.bg}" onclick="window.numGameClick(${i})" data-idx="${i}">${n.n}</div>`).join('')}
        </div>
        <div style="text-align:center;font-size:14px;font-weight:700;color:#888;margin-top:12px" id="num-game-status">🔢 Ordena los números correctamente</div>
    `;
}

export function numGameClick(idx) {
    const grid = document.getElementById('num-game-grid');
    if (!grid) return;
    const items = grid.querySelectorAll('.num-game-card');
    if (numGameState.order.includes(idx)) return;

    const expected = numGameState.order.length + 1;
    const num = numGameState.nums[idx];

    if (num.n === expected) {
        items[idx].classList.add('correct');
        numGameState.order.push(idx);
        document.getElementById('num-game-status').textContent = '✅ Bien! Sigue así';
        speak('Número ' + num.n, 'es');

        if (numGameState.order.length === 10) {
            document.getElementById('num-game-status').textContent = '🏆 ¡Excelente! +10 🪙';
            addCoins(10, document.getElementById('game-area'));
            speak('¡Ganaste! Eres un genio', 'es');
        }
    } else {
        items[idx].classList.add('wrong');
        document.getElementById('num-game-status').textContent = '❌ El número ' + expected + ' era el siguiente';
        speak('El número ' + expected + ' es el que sigue', 'es');
        setTimeout(() => {
            items[idx].classList.remove('wrong');
        }, 600);
    }
}

// ============================================
// NUEVO JUEGO: RULETA DE PREMIOS
// ============================================

let wheelState = { spinning: false };

export function startWheelGame() {
    const area = document.getElementById('game-area');
    if (!area) return;

    area.innerHTML = `
        <div class="wheel-container">
            <div style="font-size:18px;font-weight:900;margin-bottom:12px">🎡 Ruleta de Premios</div>
            <div class="wheel-spin" id="wheel-spin" onclick="window.spinWheel()">🎰</div>
            <div class="wheel-result" id="wheel-result">¡Toca la ruleta para jugar!</div>
            <div style="margin-top:12px;font-size:14px;color:#666">Cada giro cuesta 2 monedas 🪙</div>
            <div style="margin-top:8px;display:flex;gap:8px;justify-content:center;flex-wrap:wrap">
                ${WHEEL_PRIZES.map(p => `<span style="background:rgba(255,255,255,0.5);padding:4px 12px;border-radius:50px;font-size:12px;font-weight:700">${p}</span>`).join('')}
            </div>
        </div>
    `;
}

export function spinWheel() {
    if (wheelState.spinning) return;
    
    if (APP.coins < 2) {
        showToast('😅 Necesitas 2 monedas para girar', 'error');
        return;
    }

    wheelState.spinning = true;
    const spinEl = document.getElementById('wheel-spin');
    const resultEl = document.getElementById('wheel-result');
    
    if (spinEl) {
        spinEl.classList.add('spinning');
        spinEl.style.animationDuration = '2s';
    }
    
    // Restar monedas
    addCoins(-2, document.getElementById('game-area'));
    
    // Resultado aleatorio después de 2 segundos
    setTimeout(() => {
        const prizeIndex = Math.floor(Math.random() * WHEEL_PRIZES.length);
        const prize = WHEEL_PRIZES[prizeIndex];
        
        if (spinEl) {
            spinEl.classList.remove('spinning');
            spinEl.style.animationDuration = '0s';
        }
        
        if (resultEl) {
            resultEl.textContent = '🎉 ¡' + prize + '!';
        }
        
        // Dar el premio
        const starsMatch = prize.match(/⭐\s*(\d+)/);
        const coinsMatch = prize.match(/🪙\s*(\d+)/);
        
        if (starsMatch) {
            const stars = parseInt(starsMatch[1]);
            addStars(stars, document.getElementById('game-area'));
            speak('¡Ganaste ' + stars + ' estrellas!', 'es');
        } else if (coinsMatch) {
            const coins = parseInt(coinsMatch[1]);
            addCoins(coins, document.getElementById('game-area'));
            speak('¡Ganaste ' + coins + ' monedas!', 'es');
        }
        
        wheelState.spinning = false;
        
        setTimeout(() => {
            if (resultEl) {
                resultEl.textContent = '¡Toca la ruleta para jugar!';
            }
        }, 3000);
    }, 2000);
}

// ============================================
// NUEVO JUEGO: AHORCADO
// ============================================

let hangmanState = {
    word: '',
    hint: '',
    guesses: [],
    maxTries: 6,
    tries: 0,
    gameOver: false
};

export function startHangmanGame() {
    const area = document.getElementById('game-area');
    if (!area) return;

    // Seleccionar palabra aleatoria
    const wordData = HANGMAN_WORDS[Math.floor(Math.random() * HANGMAN_WORDS.length)];
    hangmanState = {
        word: wordData.palabra.toUpperCase(),
        hint: wordData.pista,
        guesses: [],
        maxTries: 6,
        tries: 0,
        gameOver: false
    };

    renderHangmanGame(area);
}

function renderHangmanGame(area) {
    const state = hangmanState;
    const wordLetters = state.word.split('');
    const displayedWord = wordLetters.map(letter => 
        state.guesses.includes(letter) ? letter : '_'
    ).join(' ');

    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    
    // Dibujo del ahorcado
    const hangmanParts = ['', '🪢', '👤', '🙋', '🧍', '🪢👤', '💀'];
    const hangmanDisplay = hangmanParts[state.tries] || '💀';

    area.innerHTML = `
        <div class="hangman-container">
            <div style="font-size:18px;font-weight:900;margin-bottom:8px">🪢 Ahorcado</div>
            <div style="font-size:48px;margin:8px 0">${hangmanDisplay}</div>
            <div style="font-size:14px;color:#aaa">Intento ${state.tries} de ${state.maxTries}</div>
            <div class="hangman-tries">
                ${state.tries > 0 ? '❌'.repeat(state.tries) : ''}
            </div>
            <div style="font-size:14px;color:#FFD700;margin:4px 0">💡 Pista: ${state.hint}</div>
            <div class="hangman-word">${displayedWord}</div>
            <div class="hangman-status" id="hangman-status">
                ${state.gameOver ? (state.tries >= state.maxTries ? '💀 ¡Perdiste! La palabra era ' + state.word : '🎉 ¡Ganaste!') : 'Adivina la palabra'}
            </div>
            <div class="hangman-letters" id="hangman-letters">
                ${alphabet.map(letter => `
                    <button class="hangman-letter-btn" 
                            onclick="window.guessLetter('${letter}')"
                            ${state.guesses.includes(letter) || state.gameOver ? 'disabled' : ''}>
                        ${letter}
                    </button>
                `).join('')}
            </div>
            ${state.gameOver ? `
                <button class="flag-btn" style="background:#4A90E2;color:#fff;margin-top:12px" onclick="window.startHangmanGame()">
                    🔄 Jugar de nuevo
                </button>
            ` : ''}
        </div>
    `;
}

export function guessLetter(letter) {
    const state = hangmanState;
    if (state.gameOver || state.guesses.includes(letter)) return;

    state.guesses.push(letter);

    if (state.word.includes(letter)) {
        // Letra correcta
        const allLettersGuessed = state.word.split('').every(l => state.guesses.includes(l));
        if (allLettersGuessed) {
            state.gameOver = true;
            showToast('🎉 ¡Ganaste! +10 ⭐', 'warning');
            addStars(10, document.getElementById('game-area'));
            speak('¡Ganaste! La palabra era ' + state.word, 'es');
        }
    } else {
        state.tries++;
        if (state.tries >= state.maxTries) {
            state.gameOver = true;
            showToast('💀 ¡Perdiste! La palabra era ' + state.word, 'error');
            speak('La palabra era ' + state.word, 'es');
        }
    }

    renderHangmanGame(document.getElementById('game-area'));
}

// ============================================
// NUEVO JUEGO: TRIVIA
// ============================================

let triviaState = {
    questions: [],
    current: 0,
    score: 0,
    gameOver: false
};

export function startTriviaGame() {
    const area = document.getElementById('game-area');
    if (!area) return;

    // Mezclar preguntas
    const shuffled = [...TRIVIA_QUESTIONS].sort(() => Math.random() - 0.5);
    triviaState = {
        questions: shuffled.slice(0, 5), // 5 preguntas por juego
        current: 0,
        score: 0,
        gameOver: false
    };

    renderTriviaQuestion(area);
}

function renderTriviaQuestion(area) {
    const state = triviaState;
    if (state.gameOver || state.current >= state.questions.length) {
        // Fin del juego
        const total = state.questions.length;
        const correct = state.score;
        const bonus = correct * 3;
        
        area.innerHTML = `
            <div style="background:linear-gradient(135deg, #667eea 0%, #764ba2 100%);border-radius:24px;padding:32px;text-align:center;color:#fff">
                <div style="font-size:48px;">🧠</div>
                <div style="font-size:24px;font-weight:900;margin:12px 0">¡Trivia Completada!</div>
                <div style="font-size:18px">Acertaste ${correct} de ${total} preguntas</div>
                <div style="font-size:14px;margin:8px 0;opacity:0.8">+${bonus} ⭐ por participar</div>
                <button class="flag-btn" style="background:rgba(255,255,255,0.2);color:#fff;border:2px solid rgba(255,255,255,0.3);margin-top:12px" onclick="window.startTriviaGame()">
                    🔄 Jugar de nuevo
                </button>
            </div>
        `;
        
        if (correct > 0) {
            addStars(bonus, area);
            speak('¡Buen trabajo! Acertaste ' + correct + ' preguntas', 'es');
        }
        return;
    }

    const q = state.questions[state.current];
    const opciones = q.opciones.map((opt, i) => ({
        texto: opt,
        indice: i,
        esCorrecta: i === q.correcta
    }));

    area.innerHTML = `
        <div style="background:linear-gradient(135deg, #f093fb 0%, #f5576c 100%);border-radius:24px;padding:24px;color:#fff;text-align:center;margin-bottom:16px">
            <div style="font-size:14px;opacity:0.8">Pregunta ${state.current + 1} de ${state.questions.length}</div>
            <div style="font-size:20px;font-weight:900;margin:12px 0;min-height:60px">${q.pregunta}</div>
            <div class="quiz-opts" style="grid-template-columns:1fr 1fr;max-width:400px;margin:0 auto">
                ${opciones.map((opt, i) => `
                    <button class="quiz-btn" 
                            style="background:rgba(255,255,255,0.2);color:#fff;border:2px solid rgba(255,255,255,0.3);font-size:16px"
                            onclick="window.checkTriviaAnswer(${i}, ${q.correcta})">
                        ${opt.texto}
                    </button>
                `).join('')}
            </div>
            <div style="margin-top:12px;font-size:14px;opacity:0.8" id="trivia-status">💡 Elige la respuesta correcta</div>
        </div>
    `;
}

export function checkTriviaAnswer(chosen, correct) {
    const btns = document.querySelectorAll('.quiz-btn');
    btns.forEach(b => b.disabled = true);

    if (chosen === correct) {
        btns[chosen].classList.add('correct');
        document.getElementById('trivia-status').textContent = '✅ ¡Correcto! +2 ⭐';
        triviaState.score++;
        addStars(2, document.getElementById('game-area'));
        speak('¡Correcto!', 'es');
    } else {
        btns[chosen].classList.add('wrong');
        btns[correct].classList.add('correct');
        document.getElementById('trivia-status').textContent = '❌ La respuesta correcta era: ' + btns[correct].textContent;
        speak('Casi, intenta la siguiente', 'es');
    }

    setTimeout(() => {
        triviaState.current++;
        renderTriviaQuestion(document.getElementById('game-area'));
    }, 1500);
}// js/main.js - PARTE 6: CUENTOS, DIBUJOS Y EXPORTACIONES

// ============================================
// RENDER: CUENTOS
// ============================================

let storyData = { cuento: null, page: 0 };

export function renderCuentos() {
    const list = document.getElementById('story-list');
    if (!list) return;
    list.innerHTML = '';
    document.getElementById('story-viewer').classList.add('hidden');
    document.getElementById('story-viewer').innerHTML = '';

    STORIES.forEach(c => {
        const card = document.createElement('div');
        card.className = 'story-container';
        card.innerHTML = `
            <span class="story-emoji">${c.emoji}</span>
            <div class="story-title">${c.titulo}</div>
            <div class="story-desc">${c.desc}</div>
            <div style="margin-top:8px;font-size:12px;font-weight:700;opacity:0.8">📖 Toca para leer</div>
        `;
        card.onclick = () => openStory(c);
        list.appendChild(card);
    });
}

function openStory(c) {
    const viewer = document.getElementById('story-viewer');
    if (!viewer) return;
    viewer.classList.remove('hidden');
    document.getElementById('story-list').style.display = 'none';
    storyData = { cuento: c, page: 0 };
    renderStoryPage();
    viewer.innerHTML += `<button class="back-btn" style="margin-top:12px;align-self:center" onclick="window.closeStory()">← Cerrar cuento</button>`;
}

function renderStoryPage() {
    const viewer = document.getElementById('story-viewer');
    if (!viewer) return;
    const c = storyData.cuento;
    const page = storyData.page;

    const emojiMatch = c.escenas[page].match(/^(\S+)/);
    const sceneEmoji = emojiMatch ? emojiMatch[1] : '📖';

    viewer.innerHTML = `
        <div style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);border-radius:24px;padding:32px 24px;color:#fff;text-align:center;min-height:200px;display:flex;flex-direction:column;justify-content:center;animation:slideUp 0.4s ease">
            <div style="font-size:72px;margin-bottom:12px">${sceneEmoji}</div>
            <div style="font-size:20px;font-weight:900;margin-bottom:8px">${c.titulo}</div>
            <div style="font-size:16px;line-height:1.6;opacity:0.95">${c.escenas[page]}</div>
            <div style="margin-top:16px;display:flex;gap:10px;justify-content:center">
                <button class="flag-btn" style="background:rgba(255,255,255,0.2);color:#fff;border:2px solid rgba(255,255,255,0.3)" onclick="window.storyPrev()">◀</button>
                <button class="flag-btn" style="background:rgba(255,255,255,0.2);color:#fff;border:2px solid rgba(255,255,255,0.3)" onclick="window.storyNext()">▶</button>
            </div>
            <div style="margin-top:12px;font-size:12px;opacity:0.7">Página ${page+1} de ${c.escenas.length}</div>
        </div>
    `;
    speak(c.escenas[page], 'es', 0.8);
    viewer.innerHTML += `<button class="back-btn" style="margin-top:12px;align-self:center" onclick="window.closeStory()">← Cerrar cuento</button>`;
}

export function storyNext() {
    if (storyData.page < storyData.cuento.escenas.length - 1) {
        storyData.page++;
        renderStoryPage();
        addStars(2, document.getElementById('story-viewer'));
    } else {
        showToast('📖 ¡Fin del cuento! +5 🪙', 'warning');
        addCoins(5, document.getElementById('story-viewer'));
    }
}

export function storyPrev() {
    if (storyData.page > 0) {
        storyData.page--;
        renderStoryPage();
    }
}

export function closeStory() {
    document.getElementById('story-viewer').classList.add('hidden');
    document.getElementById('story-viewer').innerHTML = '';
    document.getElementById('story-list').style.display = '';
}

// ============================================
// RENDER: DIBUJOS
// ============================================

let currentVideo = null;

export function renderCartoons() {
    const area = document.getElementById('cartoons-area');
    if (!area) return;
    
    area.innerHTML = `
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:16px;margin-bottom:16px">
            ${CARTOONS.map(v => `
                <div style="background:#fff;border-radius:16px;overflow:hidden;cursor:pointer;border:3px solid #eee;transition:all 0.3s" onclick="window.openVideo('${v.id}')">
                    <img src="https://img.youtube.com/vi/${v.video_id}/0.jpg" alt="${v.titulo}" style="width:100%;aspect-ratio:16/9;object-fit:cover">
                    <div style="padding:12px">
                        <div style="font-size:14px;font-weight:900;color:#2d2d2d">${v.titulo}</div>
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:4px">
                            <span style="font-size:10px;color:#888;text-transform:capitalize">${v.categoria}</span>
                            <button onclick="event.stopPropagation();window.toggleFavorite('${v.id}')" style="background:none;border:none;font-size:20px;cursor:pointer">
                                ${APP.favorites.has(v.id) ? '❤️' : '🤍'}
                            </button>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
        <div id="video-player" style="display:none;background:#000;border-radius:16px;overflow:hidden;position:relative;padding-bottom:56.25%;height:0">
            <iframe id="video-frame" style="position:absolute;top:0;left:0;width:100%;height:100%;border:none" allowfullscreen></iframe>
            <button onclick="window.closeVideo()" style="position:absolute;top:10px;right:10px;background:rgba(0,0,0,0.7);color:#fff;border:none;border-radius:50%;width:40px;height:40px;font-size:20px;cursor:pointer;z-index:10">✕</button>
        </div>
    `;
}

export function openVideo(videoId) {
    const video = CARTOONS.find(v => v.id === videoId);
    if (!video) return;
    currentVideo = video;
    const player = document.getElementById('video-player');
    const frame = document.getElementById('video-frame');
    if (player && frame) {
        player.style.display = 'block';
        frame.src = `https://www.youtube.com/embed/${video.video_id}?autoplay=1&rel=0&modestbranding=1&iv_load_policy=3`;
    }
}

export function closeVideo() {
    const player = document.getElementById('video-player');
    const frame = document.getElementById('video-frame');
    if (player && frame) {
        player.style.display = 'none';
        frame.src = '';
    }
}

export function toggleFavorite(videoId) {
    if (APP.favorites.has(videoId)) {
        APP.favorites.delete(videoId);
        showToast('💔 Eliminado de favoritos', 'warning');
    } else {
        APP.favorites.add(videoId);
        showToast('❤️ Agregado a favoritos', 'warning');
        addCoins(1, document.getElementById('cartoons-area'));
    }
    renderCartoons();
}

// js/main.js - VERSIÓN COMPLETA CORREGIDA

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
    isAdmin: false,
    coins: 50,
    stars: 0,
    level: 1
};

// ============================================
// DATOS
// ============================================
const COLORS = [
    { id: 'rojo', es: 'Rojo', en: 'Red', emoji: '🔴', bg: '#E74C3C', ex: ['🍎', '🌹', '🚒'] },
    { id: 'azul', es: 'Azul', en: 'Blue', emoji: '🔵', bg: '#3498DB', ex: ['🐋', '🌊', '☁️'] },
    { id: 'verde', es: 'Verde', en: 'Green', emoji: '🟢', bg: '#27AE60', ex: ['🌿', '🐸', '🌲'] },
    { id: 'amarillo', es: 'Amarillo', en: 'Yellow', emoji: '🟡', bg: '#F1C40F', ex: ['🌻', '🍋', '⭐'] },
    { id: 'naranja', es: 'Naranja', en: 'Orange', emoji: '🟠', bg: '#E67E22', ex: ['🍊', '🎃', '🦊'] },
    { id: 'rosa', es: 'Rosa', en: 'Pink', emoji: '🩷', bg: '#E91E8C', ex: ['🌸', '🍬', '🦩'] },
    { id: 'morado', es: 'Morado', en: 'Purple', emoji: '🟣', bg: '#9B59B6', ex: ['🍇', '🌷', '🦄'] },
    { id: 'celeste', es: 'Celeste', en: 'Light Blue', emoji: '🩵', bg: '#56CCF2', ex: ['🌤️', '🧊', '💙'] }
];

// ============================================
// FUNCIONES DE UI
// ============================================
function updateUI() {
    const userName = document.getElementById('user-name');
    const userAvatar = document.getElementById('user-avatar');
    const levelDisplay = document.getElementById('level-display');
    const levelBadge = document.getElementById('level-badge');
    const starCount = document.getElementById('star-count');
    const coinCount = document.getElementById('coin-count');
    
    if (userName) userName.textContent = APP.profile?.username || 'Explorador';
    if (userAvatar) userAvatar.textContent = APP.profile?.avatar || '🦊';
    if (levelDisplay) levelDisplay.textContent = APP.level || 1;
    if (levelBadge) levelBadge.textContent = APP.level || 1;
    if (starCount) starCount.textContent = APP.stars || 0;
    if (coinCount) coinCount.textContent = APP.coins || 50;
}

export function showToast(message, type = '') {
    const container = document.getElementById('toast-area');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

export async function addStars(n, element) {
    if (!APP.user) return;
    APP.stars += n;
    updateUI();
    if (element) {
        const pop = document.createElement('div');
        pop.className = 'stars-pop';
        pop.textContent = `+${n} ⭐`;
        element.style.position = 'relative';
        element.appendChild(pop);
        setTimeout(() => pop.remove(), 1000);
    }
    try {
        await updateProfile({ stars: APP.stars });
    } catch (error) {
        console.error('Error saving stars:', error);
    }
}

export async function addCoins(n, element) {
    if (!APP.user) return;
    APP.coins += n;
    updateUI();
    if (element) {
        const pop = document.createElement('div');
        pop.className = 'coin-pop';
        pop.textContent = `+${n} 🪙`;
        element.style.position = 'relative';
        element.appendChild(pop);
        setTimeout(() => pop.remove(), 1000);
    }
    try {
        await updateProfile({ coins: APP.coins });
    } catch (error) {
        console.error('Error saving coins:', error);
    }
}

export function speak(text, lang = 'es', rate = 0.9) {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang === 'es' ? 'es-AR' : 'en-US';
    u.rate = rate;
    u.pitch = 1.0;
    window.speechSynthesis.speak(u);
}

// ============================================
// RENDER COLORES
// ============================================
export function renderColors() {
    const grid = document.getElementById('color-list');
    if (!grid) return;
    grid.innerHTML = '';
    COLORS.forEach(c => {
        const card = document.createElement('div');
        card.className = 'lesson-card';
        card.style.background = c.bg;
        const isDone = APP.colDone.has(c.id);
        card.innerHTML = `
            <div class="lc-stars">⭐ 5</div>
            ${isDone ? '<div class="lc-completed">✅</div>' : ''}
            <span class="lc-emoji">${c.emoji}</span>
            <div class="lc-word">${c.es}</div>
            <div class="lc-en">${c.en}</div>
        `;
        grid.appendChild(card);
    });
}

// ============================================
// RENDER VOCALES
// ============================================
export function renderVocales() {
    const grid = document.getElementById('vocal-list');
    if (!grid) return;
    grid.innerHTML = '<div style="padding:20px;text-align:center;color:#888">🔤 Vocales - Próximamente</div>';
}

// ============================================
// RENDER ABECEDARIO
// ============================================
export function renderAlphabet() {
    const grid = document.getElementById('alpha-list');
    if (!grid) return;
    grid.innerHTML = '<div style="padding:20px;text-align:center;color:#888">🔡 Abecedario - Próximamente</div>';
}

// ============================================
// RENDER NÚMEROS
// ============================================
export function renderNumeros() {
    const grid = document.getElementById('num-list');
    if (!grid) return;
    grid.innerHTML = '<div style="padding:20px;text-align:center;color:#888">🔢 Números - Próximamente</div>';
}

// ============================================
// RENDER ANIMALES
// ============================================
export function renderAnimales() {
    const grid = document.getElementById('animal-list');
    if (!grid) return;
    grid.innerHTML = '<div style="padding:20px;text-align:center;color:#888">🐾 Animales - Próximamente</div>';
}

// ============================================
// RENDER GEOMETRÍA
// ============================================
export function renderGeometry() {
    const grid = document.getElementById('geometry-list');
    if (!grid) return;
    grid.innerHTML = '<div style="padding:20px;text-align:center;color:#888">🔺 Geometría - Próximamente</div>';
}

// ============================================
// RENDER ÁLBUM
// ============================================
export function renderAlbum() {
    const area = document.getElementById('album-area');
    if (!area) return;
    area.innerHTML = `
        <div class="album-container" style="padding:20px;text-align:center;color:#888">
            📒 Álbum de Figuritas - Próximamente
        </div>
    `;
}

// ============================================
// RENDER TIENDA
// ============================================
export function renderShop() {
    const area = document.getElementById('shop-area');
    if (!area) return;
    area.innerHTML = `
        <div class="shop-container" style="padding:20px;text-align:center;color:#888">
            🛒 Tienda - Próximamente
        </div>
    `;
}

// ============================================
// RENDER CUENTOS
// ============================================
export function renderCuentos() {
    const list = document.getElementById('story-list');
    if (!list) return;
    list.innerHTML = `
        <div style="padding:20px;text-align:center;color:#888">
            📖 Cuentos - Próximamente
        </div>
    `;
}

// ============================================
// RENDER DIBUJOS
// ============================================
export function renderCartoons() {
    const area = document.getElementById('cartoons-area');
    if (!area) return;
    area.innerHTML = `
        <div style="padding:20px;text-align:center;color:#888">
            🎬 Dibujos - Próximamente
        </div>
    `;
}

// ============================================
// MATEMÁTICAS
// ============================================
export function startMath(type) {
    const area = document.getElementById('math-area');
    if (!area) return;
    area.innerHTML = `
        <div class="math-container" style="padding:20px;text-align:center">
            🧮 Matemáticas - Próximamente
        </div>
    `;
}

// ============================================
// LECTURA
// ============================================
export function startReading() {
    const area = document.getElementById('reading-area');
    if (!area) return;
    area.innerHTML = `
        <div class="reading-container" style="padding:20px;text-align:center">
            📚 Lectura - Próximamente
        </div>
    `;
}

// ============================================
// JUEGOS - VERSIÓN FUNCIONAL
// ============================================
export function startMatchGame() {
    const area = document.getElementById('game-area');
    if (!area) return;
    area.innerHTML = `
        <div style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);border-radius:24px;padding:24px;color:#fff;text-align:center">
            <div style="font-size:48px">🧩</div>
            <h3>Memory Match</h3>
            <p>Encuentra las parejas</p>
            <button class="flag-btn" style="background:rgba(255,255,255,0.2);color:#fff;border:2px solid rgba(255,255,255,0.3);margin-top:12px" onclick="window.showToast('🎮 Juego en desarrollo')">
                Jugar
            </button>
        </div>
    `;
}

export function startColorGame() {
    const area = document.getElementById('game-area');
    if (!area) return;
    area.innerHTML = `
        <div style="background:linear-gradient(135deg,#f093fb 0%,#f5576c 100%);border-radius:24px;padding:24px;color:#fff;text-align:center">
            <div style="font-size:48px">🎯</div>
            <h3>Acierta el Color</h3>
            <p>Elige el color correcto</p>
            <button class="flag-btn" style="background:rgba(255,255,255,0.2);color:#fff;border:2px solid rgba(255,255,255,0.3);margin-top:12px" onclick="window.showToast('🎮 Juego en desarrollo')">
                Jugar
            </button>
        </div>
    `;
}

export function startNumberGame() {
    const area = document.getElementById('game-area');
    if (!area) return;
    area.innerHTML = `
        <div style="background:linear-gradient(135deg,#2C3E50 0%,#3498DB 100%);border-radius:24px;padding:24px;color:#fff;text-align:center">
            <div style="font-size:48px">🔢</div>
            <h3>Ordena los Números</h3>
            <p>Ordena del 1 al 10</p>
            <button class="flag-btn" style="background:rgba(255,255,255,0.2);color:#fff;border:2px solid rgba(255,255,255,0.3);margin-top:12px" onclick="window.showToast('🎮 Juego en desarrollo')">
                Jugar
            </button>
        </div>
    `;
}

export function startWheelGame() {
    const area = document.getElementById('game-area');
    if (!area) return;
    area.innerHTML = `
        <div style="background:linear-gradient(135deg,#FF6B6B 0%,#FFE66D 100%);border-radius:24px;padding:24px;color:#2d2d2d;text-align:center">
            <div style="font-size:48px">🎡</div>
            <h3>Ruleta de Premios</h3>
            <p>Gira y gana premios</p>
            <button class="flag-btn" style="background:rgba(255,255,255,0.5);color:#2d2d2d;border:2px solid rgba(255,255,255,0.3);margin-top:12px" onclick="window.showToast('🎮 Juego en desarrollo')">
                Girar
            </button>
        </div>
    `;
}

export function startHangmanGame() {
    const area = document.getElementById('game-area');
    if (!area) return;
    area.innerHTML = `
        <div style="background:linear-gradient(135deg,#2C3E50 0%,#3498DB 100%);border-radius:24px;padding:24px;color:#fff;text-align:center">
            <div style="font-size:48px">🪢</div>
            <h3>Ahorcado</h3>
            <p>Adivina la palabra</p>
            <button class="flag-btn" style="background:rgba(255,255,255,0.2);color:#fff;border:2px solid rgba(255,255,255,0.3);margin-top:12px" onclick="window.showToast('🎮 Juego en desarrollo')">
                Jugar
            </button>
        </div>
    `;
}

export function startTriviaGame() {
    const area = document.getElementById('game-area');
    if (!area) return;
    area.innerHTML = `
        <div style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);border-radius:24px;padding:24px;color:#fff;text-align:center">
            <div style="font-size:48px">🧠</div>
            <h3>Trivia</h3>
            <p>Responde preguntas</p>
            <button class="flag-btn" style="background:rgba(255,255,255,0.2);color:#fff;border:2px solid rgba(255,255,255,0.3);margin-top:12px" onclick="window.showToast('🎮 Juego en desarrollo')">
                Jugar
            </button>
        </div>
    `;
}

// ============================================
// FUNCIONES PLACEHOLDER (para evitar errores)
// ============================================
export function closeColorDetail() { console.log('closeColorDetail'); }
export function closeVocalDetail() { console.log('closeVocalDetail'); }
export function closeNumDetail() { console.log('closeNumDetail'); }
export function closeAnimalDetail() { console.log('closeAnimalDetail'); }
export function closeGeometryDetail() { console.log('closeGeometryDetail'); }
export function checkColorQuiz() { console.log('checkColorQuiz'); }
export function checkVocalQuiz() { console.log('checkVocalQuiz'); }
export function checkNumQuiz() { console.log('checkNumQuiz'); }
export function checkAnimalQuiz() { console.log('checkAnimalQuiz'); }
export function checkGeometryQuiz() { console.log('checkGeometryQuiz'); }
export function checkMathAnswer() { console.log('checkMathAnswer'); }
export function checkReadingAnswer() { console.log('checkReadingAnswer'); }
export function matchClick() { console.log('matchClick'); }
export function checkColorGame() { console.log('checkColorGame'); }
export function numGameClick() { console.log('numGameClick'); }
export function storyNext() { console.log('storyNext'); }
export function storyPrev() { console.log('storyPrev'); }
export function closeStory() { console.log('closeStory'); }
export function openVideo() { console.log('openVideo'); }
export function closeVideo() { console.log('closeVideo'); }
export function toggleFavorite() { console.log('toggleFavorite'); }
export function buySticker() { console.log('buySticker'); }
export function spinWheel() { console.log('spinWheel'); }
export function guessLetter() { console.log('guessLetter'); }
export function checkTriviaAnswer() { console.log('checkTriviaAnswer'); }

// ============================================
// NAVEGACIÓN
// ============================================
export function showSection(id) {
    console.log('📱 Mostrando sección:', id);
    document.querySelectorAll('.section-content').forEach(el => {
        el.classList.add('hidden');
    });
    const section = document.getElementById('sec-' + id);
    if (section) section.classList.remove('hidden');
}

// ============================================
// INICIALIZACIÓN
// ============================================
export async function initApp() {
    console.log(`🚀 ${CONFIG.APP_NAME} v${CONFIG.VERSION}`);
    
    const authResult = await initAuth();
    console.log('📦 Resultado initAuth:', authResult);
    
    if (authResult.success && !authResult.blocked) {
        APP.user = authResult.user;
        APP.profile = authResult.profile;
        APP.stars = authResult.profile?.stars || 0;
        APP.coins = authResult.profile?.coins || 50;
        APP.level = authResult.profile?.level || 1;
        
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('app-content').style.display = 'block';
        updateUI();
        showSection('colores');
        renderColors();
    } else {
        document.getElementById('login-screen').style.display = 'flex';
        document.getElementById('app-content').style.display = 'none';
    }
}

// ============================================
// EXPORTAR TODO (SOLO UNA VEZ)
// ============================================
export { APP };
