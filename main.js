// js/main.js - VERSIÓN COMPLETA CORREGIDA (SIN DUPLICADOS)
import CONFIG from './config.js';
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

// Idioma actual
let currentLanguage = 'es';

// ============================================
// DATOS CON VERSIÓN BILINGÜE
// ============================================
const COLORS = [
    { id: 'rojo', es: 'Rojo', en: 'Red', emoji: '🔴', bg: '#E74C3C' },
    { id: 'azul', es: 'Azul', en: 'Blue', emoji: '🔵', bg: '#3498DB' },
    { id: 'verde', es: 'Verde', en: 'Green', emoji: '🟢', bg: '#27AE60' },
    { id: 'amarillo', es: 'Amarillo', en: 'Yellow', emoji: '🟡', bg: '#F1C40F' },
    { id: 'naranja', es: 'Naranja', en: 'Orange', emoji: '🟠', bg: '#E67E22' },
    { id: 'rosa', es: 'Rosa', en: 'Pink', emoji: '🩷', bg: '#E91E8C' },
    { id: 'morado', es: 'Morado', en: 'Purple', emoji: '🟣', bg: '#9B59B6' },
    { id: 'celeste', es: 'Celeste', en: 'Light Blue', emoji: '🩵', bg: '#56CCF2' }
];

const VOCALS = [
    { id: 'a', es: 'A', en: 'A', emoji: '🦅', bg: '#E74C3C', word_es: 'Águila', word_en: 'Eagle' },
    { id: 'e', es: 'E', en: 'E', emoji: '🐘', bg: '#3498DB', word_es: 'Elefante', word_en: 'Elephant' },
    { id: 'i', es: 'I', en: 'I', emoji: '🦎', bg: '#27AE60', word_es: 'Iguana', word_en: 'Iguana' },
    { id: 'o', es: 'O', en: 'O', emoji: '🐻', bg: '#E67E22', word_es: 'Oso', word_en: 'Bear' },
    { id: 'u', es: 'U', en: 'U', emoji: '🍇', bg: '#9B59B6', word_es: 'Uva', word_en: 'Grape' }
];

const ALPHABET = [
    { l: 'A', en: 'ei', bg: '#E74C3C' }, { l: 'B', en: 'bi', bg: '#3498DB' }, 
    { l: 'C', en: 'si', bg: '#27AE60' }, { l: 'D', en: 'di', bg: '#E67E22' }, 
    { l: 'E', en: 'i', bg: '#9B59B6' }, { l: 'F', en: 'ef', bg: '#E91E8C' },
    { l: 'G', en: 'yi', bg: '#F1C40F' }, { l: 'H', en: 'eich', bg: '#56CCF2' }, 
    { l: 'I', en: 'ai', bg: '#E74C3C' }, { l: 'J', en: 'yei', bg: '#3498DB' }, 
    { l: 'K', en: 'kei', bg: '#27AE60' }, { l: 'L', en: 'el', bg: '#E67E22' },
    { l: 'M', en: 'em', bg: '#9B59B6' }, { l: 'N', en: 'en', bg: '#E91E8C' }, 
    { l: 'Ñ', en: 'enie', bg: '#F1C40F' }, { l: 'O', en: 'ou', bg: '#56CCF2' },
    { l: 'P', en: 'pi', bg: '#E74C3C' }, { l: 'Q', en: 'kiu', bg: '#3498DB' }, 
    { l: 'R', en: 'ar', bg: '#27AE60' }, { l: 'S', en: 'es', bg: '#E67E22' }, 
    { l: 'T', en: 'ti', bg: '#9B59B6' },
    { l: 'U', en: 'iu', bg: '#E91E8C' }, { l: 'V', en: 'vi', bg: '#F1C40F' }, 
    { l: 'W', en: 'doble u', bg: '#56CCF2' }, { l: 'X', en: 'ekis', bg: '#E74C3C' }, 
    { l: 'Y', en: 'ye', bg: '#3498DB' }, { l: 'Z', en: 'zeta', bg: '#27AE60' }
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
    { id: 'circulo', nombre: 'Círculo', en: 'Circle', emoji: '⭕', lados: '0', bg: '#E74C3C' },
    { id: 'cuadrado', nombre: 'Cuadrado', en: 'Square', emoji: '🟦', lados: '4', bg: '#3498DB' },
    { id: 'triangulo', nombre: 'Triángulo', en: 'Triangle', emoji: '🔺', lados: '3', bg: '#F1C40F' },
    { id: 'rectangulo', nombre: 'Rectángulo', en: 'Rectangle', emoji: '▬', lados: '4', bg: '#27AE60' },
    { id: 'pentagono', nombre: 'Pentágono', en: 'Pentagon', emoji: '⬠', lados: '5', bg: '#9B59B6' },
    { id: 'hexagono', nombre: 'Hexágono', en: 'Hexagon', emoji: '⬡', lados: '6', bg: '#E67E22' }
];

const STICKERS = [
    { id: 's1', nombre: 'Estrella', en: 'Star', emoji: '⭐', precio: 20 },
    { id: 's2', nombre: 'Corazón', en: 'Heart', emoji: '❤️', precio: 15 },
    { id: 's3', nombre: 'Dragón', en: 'Dragon', emoji: '🐉', precio: 30 },
    { id: 's4', nombre: 'Sirena', en: 'Mermaid', emoji: '🧜‍♀️', precio: 25 },
    { id: 's5', nombre: 'Robot', en: 'Robot', emoji: '🤖', precio: 20 },
    { id: 's6', nombre: 'Gato', en: 'Cat', emoji: '🐱', precio: 15 },
    { id: 's7', nombre: 'Perro', en: 'Dog', emoji: '🐶', precio: 15 },
    { id: 's8', nombre: 'Mariposa', en: 'Butterfly', emoji: '🦋', precio: 20 },
    { id: 's9', nombre: 'Arcoíris', en: 'Rainbow', emoji: '🌈', precio: 35 },
    { id: 's10', nombre: 'Cohete', en: 'Rocket', emoji: '🚀', precio: 40 },
    { id: 's11', nombre: 'Pizza', en: 'Pizza', emoji: '🍕', precio: 15 },
    { id: 's12', nombre: 'Castillo', en: 'Castle', emoji: '🏰', precio: 45 }
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

// ============================================
// FUNCIONES DE IDIOMA
// ============================================
function getText(es, en) {
    return currentLanguage === 'es' ? es : en;
}

export function toggleLanguage() {
    currentLanguage = currentLanguage === 'es' ? 'en' : 'es';
    const btn = document.getElementById('lang-toggle');
    if (btn) {
        btn.textContent = currentLanguage === 'es' ? '🇪🇸 Español' : '🇺🇸 English';
    }
    showToast(currentLanguage === 'es' ? '🔊 Modo Español' : '🔊 English Mode', 'warning');
    renderAllSections();
}

export function speakBilingual(textEs, textEn) {
    const text = currentLanguage === 'es' ? textEs : textEn;
    const lang = currentLanguage === 'es' ? 'es-AR' : 'en-US';
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    u.rate = 0.85;
    u.pitch = 1.0;
    window.speechSynthesis.speak(u);
}

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
    container.innerHTML = `<div class="toast ${type}">${message}</div>`;
    setTimeout(() => container.innerHTML = '', 2800);
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

export function showSection(id) {
    console.log('📱 Mostrando sección:', id);
    document.querySelectorAll('.section-content').forEach(el => {
        el.classList.add('hidden');
    });
    const section = document.getElementById('sec-' + id);
    if (section) section.classList.remove('hidden');
}

export function addLanguageButton() {
    const topbar = document.querySelector('.topbar .tb-right');
    if (!topbar) return;
    
    if (document.getElementById('lang-toggle')) return;
    
    const langBtn = document.createElement('div');
    langBtn.id = 'lang-toggle';
    langBtn.className = 'pill';
    langBtn.style.cssText = 'background:rgba(255,255,255,0.25);border:2px solid rgba(255,255,255,0.5);border-radius:50px;padding:5px 12px;color:#fff;font-size:12px;font-weight:900;cursor:pointer;transition:all 0.2s;';
    langBtn.textContent = currentLanguage === 'es' ? '🇪🇸 Español' : '🇺🇸 English';
    langBtn.onclick = toggleLanguage;
    langBtn.onmouseover = () => langBtn.style.transform = 'scale(1.05)';
    langBtn.onmouseout = () => langBtn.style.transform = 'scale(1)';
    
    topbar.appendChild(langBtn);
}

// ============================================
// RENDERS BÁSICOS (VERSIÓN BILINGÜE)
// ============================================
export function renderColors() {
    const grid = document.getElementById('color-list');
    if (!grid) return;
    grid.innerHTML = '';
    COLORS.forEach(c => {
        const card = document.createElement('div');
        card.className = 'lesson-card';
        card.style.background = c.bg;
        const label = currentLanguage === 'es' ? c.es : c.en;
        card.innerHTML = `
            <span class="lc-emoji">${c.emoji}</span>
            <div class="lc-word">${label}</div>
            <div class="lc-en" style="font-size:10px;opacity:0.7;">${currentLanguage === 'es' ? '🔊 Toca para escuchar' : '🔊 Tap to listen'}</div>
        `;
        card.onclick = () => {
            speakBilingual(c.es, c.en);
            showToast(`🎨 ${label}`, 'warning');
            addStars(2, card);
        };
        grid.appendChild(card);
    });
}

export function renderVocales() {
    const grid = document.getElementById('vocal-list');
    if (!grid) return;
    grid.innerHTML = '';
    VOCALS.forEach(v => {
        const card = document.createElement('div');
        card.className = 'lesson-card';
        card.style.background = v.bg;
        const label = currentLanguage === 'es' ? v.es : v.en;
        const word = currentLanguage === 'es' ? v.word_es : v.word_en;
        card.innerHTML = `
            <span class="lc-emoji" style="font-size:52px;font-weight:900;color:#fff">${label}</span>
            <div class="lc-word" style="color:#fff;">${word}</div>
            <div class="lc-en" style="font-size:10px;opacity:0.7;color:#fff;">${currentLanguage === 'es' ? '🔊 Toca para escuchar' : '🔊 Tap to listen'}</div>
        `;
        card.onclick = () => {
            speakBilingual(`Vocal ${v.es}... ${v.word_es}`, `Vowel ${v.en}... ${v.word_en}`);
            showToast(`🔤 ${label}`, 'warning');
        };
        grid.appendChild(card);
    });
}

export function renderAlphabet() {
    const grid = document.getElementById('alpha-list');
    if (!grid) return;
    grid.innerHTML = '';
    ALPHABET.forEach(a => {
        const card = document.createElement('div');
        card.className = 'alpha-card';
        card.style.background = a.bg;
        const label = currentLanguage === 'es' ? `Letra ${a.l}` : `Letter ${a.l}`;
        card.innerHTML = `
            <span class="letter">${a.l}</span>
            <span class="letter-en">${currentLanguage === 'es' ? a.l : a.en}</span>
        `;
        card.onclick = () => {
            speakBilingual(`Letra ${a.l}`, `Letter ${a.l}`);
            showToast(`🔤 ${label}`, 'warning');
            addStars(1, card);
        };
        grid.appendChild(card);
    });
}

export function renderNumeros() {
    const grid = document.getElementById('num-list');
    if (!grid) return;
    grid.innerHTML = '';
    NUMBERS.forEach(n => {
        const card = document.createElement('div');
        card.className = 'num-card';
        card.style.background = n.bg;
        const label = currentLanguage === 'es' ? n.es : n.en;
        card.innerHTML = `
            <span class="num-big">${n.n}</span>
            <div class="num-dots">${n.dots}</div>
            <div class="num-word">${label}</div>
        `;
        card.onclick = () => {
            speakBilingual(`Número ${n.es}... ${n.n}`, `Number ${n.en}... ${n.n}`);
            showToast(`🔢 ${label}`, 'warning');
            addStars(2, card);
        };
        grid.appendChild(card);
    });
}

export function renderAnimales() {
    const grid = document.getElementById('animal-list');
    if (!grid) return;
    grid.innerHTML = '';
    ANIMALS.forEach(a => {
        const card = document.createElement('div');
        card.className = 'lesson-card';
        card.style.background = a.bg;
        const label = currentLanguage === 'es' ? a.es : a.en;
        const sound = currentLanguage === 'es' ? a.sound : (a.sound_en || a.sound);
        card.innerHTML = `
            <span class="lc-emoji">${a.emoji}</span>
            <div class="lc-word">${label}</div>
            <div class="lc-en" style="font-size:10px;opacity:0.7;">${sound}</div>
        `;
        card.onclick = () => {
            speakBilingual(`${a.es}... ${a.sound}`, `${a.en}... ${a.sound_en || a.sound}`);
            showToast(`🐾 ${label}`, 'warning');
            addStars(2, card);
        };
        grid.appendChild(card);
    });
}

export function renderGeometry() {
    const grid = document.getElementById('geometry-list');
    if (!grid) return;
    grid.innerHTML = '';
    GEOMETRY.forEach(g => {
        const card = document.createElement('div');
        card.className = 'lesson-card';
        card.style.background = g.bg;
        const label = currentLanguage === 'es' ? g.nombre : g.en;
        card.innerHTML = `
            <span class="lc-emoji">${g.emoji}</span>
            <div class="lc-word">${label}</div>
            <div class="lc-en" style="font-size:10px;opacity:0.7;">${g.lados} ${currentLanguage === 'es' ? 'lados' : 'sides'}</div>
        `;
        card.onclick = () => {
            speakBilingual(g.nombre, g.en);
            showToast(`🔺 ${label}`, 'warning');
            addStars(2, card);
        };
        grid.appendChild(card);
    });
}

// ============================================
// RENDER: ÁLBUM Y TIENDA
// ============================================
export function renderAlbum() {
    const area = document.getElementById('album-area');
    if (!area) return;
    const total = STICKERS.length;
    const collected = APP.stickerCollection.size;

    area.innerHTML = `
        <div class="album-container">
            <div class="album-header">
                <div class="album-title">${currentLanguage === 'es' ? '📒 Mi Álbum de Figuritas' : '📒 My Sticker Album'}</div>
                <div class="album-progress">${collected} / ${total} (${Math.round(collected/total*100)}%)</div>
            </div>
            <div class="prog-wrap">
                <div class="prog-track"><div class="prog-fill" style="width:${(collected/total)*100}%"></div></div>
            </div>
            <div class="sticker-grid">
                ${STICKERS.map(s => `
                    <div class="sticker-slot ${APP.stickerCollection.has(s.id) ? 'filled' : ''}">
                        ${APP.stickerCollection.has(s.id) ? s.emoji : '❓'}
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

export function renderShop() {
    const area = document.getElementById('shop-area');
    if (!area) return;

    area.innerHTML = `
        <div class="shop-container">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;flex-wrap:wrap;gap:8px;">
                <div class="album-title">${currentLanguage === 'es' ? '🛒 Tienda de Figuritas' : '🛒 Sticker Shop'}</div>
                <div style="font-size:16px;font-weight:900;color:#FFA500;">🪙 ${APP.coins}</div>
            </div>
            <div class="shop-grid">
                ${STICKERS.map(s => {
                    const owned = APP.stickerCollection.has(s.id);
                    const label = currentLanguage === 'es' ? s.nombre : s.en;
                    return `
                        <div class="shop-item ${owned ? 'owned' : ''}" onclick="window.buySticker('${s.id}')">
                            <span class="shop-emoji">${s.emoji}</span>
                            <div class="shop-name">${label}</div>
                            <div class="shop-price">${owned ? '✅' : '🪙 ' + s.precio}</div>
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
        showToast(currentLanguage === 'es' ? '💡 Ya tienes esta figurita' : '💡 You already have this sticker', 'warning');
        return;
    }

    if (APP.coins < sticker.precio) {
        showToast(currentLanguage === 'es' ? '😅 No tienes suficientes monedas' : '😅 Not enough coins', 'error');
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
    
    showToast(`🎉 ${currentLanguage === 'es' ? '¡Compraste' : 'You bought'} ${sticker.nombre}!`, 'warning');
    renderShop();
    renderAlbum();
}

// ============================================
// JUEGO 1: MEMORY MATCH
// ============================================
let memoryCards = [];
let memoryFlipped = [];
let memoryMatched = [];
let memoryLocked = false;

export function startMatchGame() {
    const area = document.getElementById('game-area');
    if (!area) return;
    
    const emojis = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'];
    const deck = [...emojis, ...emojis];
    
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    
    memoryCards = deck;
    memoryFlipped = [];
    memoryMatched = [];
    memoryLocked = false;
    
    area.innerHTML = `
        <div style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);border-radius:24px;padding:24px;color:#fff;text-align:center;">
            <h3>🧩 ${currentLanguage === 'es' ? 'Memory Match' : 'Memory Match'}</h3>
            <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;max-width:350px;margin:16px auto;">
                ${deck.map((emoji, index) => `
                    <div class="memory-card" data-index="${index}" 
                         style="aspect-ratio:1;background:rgba(255,255,255,0.2);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:32px;cursor:pointer;border:2px solid rgba(255,255,255,0.1);"
                         onclick="window.flipCard(${index})">
                        <span style="opacity:0;transition:opacity 0.3s;">${emoji}</span>
                    </div>
                `).join('')}
            </div>
            <div id="memory-score" style="font-weight:900;">${currentLanguage === 'es' ? 'Parejas' : 'Pairs'}: 0 / 8</div>
            <button onclick="window.startMatchGame()" style="margin-top:12px;padding:8px 24px;border-radius:50px;border:none;background:rgba(255,255,255,0.2);color:#fff;font-weight:900;cursor:pointer;">🔄 ${currentLanguage === 'es' ? 'Reiniciar' : 'Restart'}</button>
            <button onclick="window.closeGame()" style="margin-top:12px;margin-left:8px;padding:8px 24px;border-radius:50px;border:none;background:rgba(255,255,255,0.2);color:#fff;font-weight:900;cursor:pointer;">✕ ${currentLanguage === 'es' ? 'Cerrar' : 'Close'}</button>
        </div>
    `;
}

window.flipCard = function(index) {
    if (memoryLocked) return;
    if (memoryFlipped.includes(index)) return;
    if (memoryMatched.includes(index)) return;
    
    const card = document.querySelector(`.memory-card[data-index="${index}"]`);
    card.style.background = '#fff';
    card.querySelector('span').style.opacity = '1';
    memoryFlipped.push(index);
    
    if (memoryFlipped.length === 2) {
        memoryLocked = true;
        const [idx1, idx2] = memoryFlipped;
        
        if (memoryCards[idx1] === memoryCards[idx2]) {
            memoryMatched.push(idx1, idx2);
            memoryFlipped = [];
            memoryLocked = false;
            
            const score = document.getElementById('memory-score');
            if (score) score.textContent = `${currentLanguage === 'es' ? 'Parejas' : 'Pairs'}: ${memoryMatched.length / 2} / 8`;
            
            if (memoryMatched.length === memoryCards.length) {
                showToast('🎉 ¡Ganaste! +20 ⭐', 'warning');
                addStars(20);
                addCoins(10);
            }
        } else {
            setTimeout(() => {
                const card1 = document.querySelector(`.memory-card[data-index="${idx1}"]`);
                const card2 = document.querySelector(`.memory-card[data-index="${idx2}"]`);
                if (card1) { card1.style.background = 'rgba(255,255,255,0.2)'; card1.querySelector('span').style.opacity = '0'; }
                if (card2) { card2.style.background = 'rgba(255,255,255,0.2)'; card2.querySelector('span').style.opacity = '0'; }
                memoryFlipped = [];
                memoryLocked = false;
            }, 800);
        }
    }
};

// ============================================
// JUEGO 2: ACIERTA EL COLOR
// ============================================
let colorGameScore = 0;
let colorGameRound = 0;

export function startColorGame() {
    const area = document.getElementById('game-area');
    if (!area) return;
    
    colorGameScore = 0;
    colorGameRound = 0;
    playColorRound();
}

function playColorRound() {
    const area = document.getElementById('game-area');
    if (!area) return;
    
    const colors = [
        { es: 'Rojo', en: 'Red', bg: '#E74C3C' },
        { es: 'Azul', en: 'Blue', bg: '#3498DB' },
        { es: 'Verde', en: 'Green', bg: '#27AE60' },
        { es: 'Amarillo', en: 'Yellow', bg: '#F1C40F' },
        { es: 'Naranja', en: 'Orange', bg: '#E67E22' },
        { es: 'Morado', en: 'Purple', bg: '#9B59B6' }
    ];
    
    colorGameRound++;
    const correct = colors[Math.floor(Math.random() * colors.length)];
    const options = [correct];
    
    const shuffled = colors.filter(c => c.es !== correct.es);
    for (let i = 0; i < 3; i++) {
        if (shuffled.length > 0) {
            const idx = Math.floor(Math.random() * shuffled.length);
            options.push(shuffled[idx]);
            shuffled.splice(idx, 1);
        }
    }
    
    for (let i = options.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [options[i], options[j]] = [options[j], options[i]];
    }
    
    const label = currentLanguage === 'es' ? correct.es : correct.en;
    
    area.innerHTML = `
        <div style="background:linear-gradient(135deg,#f093fb 0%,#f5576c 100%);border-radius:24px;padding:24px;color:#fff;text-align:center;">
            <h3>🎯 ${currentLanguage === 'es' ? '¿Qué color es este?' : 'What color is this?'}</h3>
            <div style="width:100px;height:100px;border-radius:50%;margin:16px auto;border:3px solid rgba(255,255,255,0.3);background:${correct.bg};"></div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;max-width:280px;margin:0 auto;">
                ${options.map(opt => {
                    const optLabel = currentLanguage === 'es' ? opt.es : opt.en;
                    return `
                        <button onclick="window.checkColorAnswer('${opt.es}','${correct.es}')" 
                                style="padding:12px;border-radius:12px;border:2px solid rgba(255,255,255,0.3);background:rgba(255,255,255,0.1);color:#fff;font-size:16px;font-weight:900;cursor:pointer;">
                            ${optLabel}
                        </button>
                    `;
                }).join('')}
            </div>
            <div style="margin-top:12px;font-weight:900;">${currentLanguage === 'es' ? 'Ronda' : 'Round'} ${colorGameRound} · ${currentLanguage === 'es' ? 'Puntaje' : 'Score'}: ${colorGameScore}</div>
            <button onclick="window.startColorGame()" style="margin-top:12px;padding:8px 24px;border-radius:50px;border:none;background:rgba(255,255,255,0.2);color:#fff;font-weight:900;cursor:pointer;">🔄 ${currentLanguage === 'es' ? 'Reiniciar' : 'Restart'}</button>
            <button onclick="window.closeGame()" style="margin-top:12px;margin-left:8px;padding:8px 24px;border-radius:50px;border:none;background:rgba(255,255,255,0.2);color:#fff;font-weight:900;cursor:pointer;">✕ ${currentLanguage === 'es' ? 'Cerrar' : 'Close'}</button>
        </div>
    `;
}

window.checkColorAnswer = function(selected, correct) {
    if (selected === correct) {
        colorGameScore += 10;
        showToast('✅ ¡Correcto! +10 ⭐', 'warning');
        addStars(10);
        setTimeout(playColorRound, 800);
    } else {
        const correctLabel = currentLanguage === 'es' ? correct : COLORS.find(c => c.id === correct)?.en || correct;
        showToast(`❌ ${currentLanguage === 'es' ? 'Era' : 'It was'} ${correctLabel}`, 'error');
        if (colorGameScore > 0) colorGameScore -= 5;
        setTimeout(playColorRound, 1200);
    }
};

// ============================================
// JUEGO 3: ORDENA LOS NÚMEROS
// ============================================
let numberSelected = [];

export function startNumberGame() {
    const area = document.getElementById('game-area');
    if (!area) return;
    
    const numbers = Array.from({length: 10}, (_, i) => i + 1);
    numberSelected = [];
    
    for (let i = numbers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
    }
    
    area.innerHTML = `
        <div style="background:linear-gradient(135deg,#2C3E50 0%,#3498DB 100%);border-radius:24px;padding:24px;color:#fff;text-align:center;">
            <h3>🔢 ${currentLanguage === 'es' ? 'Ordena los Números' : 'Order the Numbers'}</h3>
            <p style="font-size:14px;opacity:0.8;">${currentLanguage === 'es' ? 'Toca los números en orden del 1 al 10' : 'Tap numbers in order from 1 to 10'}</p>
            <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:8px;max-width:300px;margin:16px auto;">
                ${numbers.map(n => `
                    <div class="num-game-card" data-num="${n}" 
                         style="background:rgba(255,255,255,0.2);border-radius:12px;padding:16px;font-size:24px;font-weight:900;cursor:pointer;border:2px solid rgba(255,255,255,0.1);"
                         onclick="window.selectNumber(${n})">
                        ${n}
                    </div>
                `).join('')}
            </div>
            <div id="num-progress" style="font-weight:900;">${currentLanguage === 'es' ? 'Progreso' : 'Progress'}: 0 / 10</div>
            <button onclick="window.startNumberGame()" style="margin-top:12px;padding:8px 24px;border-radius:50px;border:none;background:rgba(255,255,255,0.2);color:#fff;font-weight:900;cursor:pointer;">🔄 ${currentLanguage === 'es' ? 'Reiniciar' : 'Restart'}</button>
            <button onclick="window.closeGame()" style="margin-top:12px;margin-left:8px;padding:8px 24px;border-radius:50px;border:none;background:rgba(255,255,255,0.2);color:#fff;font-weight:900;cursor:pointer;">✕ ${currentLanguage === 'es' ? 'Cerrar' : 'Close'}</button>
        </div>
    `;
}

window.selectNumber = function(n) {
    const expected = numberSelected.length + 1;
    const card = document.querySelector(`.num-game-card[data-num="${n}"]`);
    const progress = document.getElementById('num-progress');
    
    if (!card) return;
    if (card.style.opacity === '0.3') return;
    
    if (n === expected) {
        numberSelected.push(n);
        card.style.background = '#6FCF97';
        card.style.opacity = '0.3';
        if (progress) progress.textContent = `${currentLanguage === 'es' ? 'Progreso' : 'Progress'}: ${numberSelected.length} / 10`;
        
        if (numberSelected.length === 10) {
            showToast('🎉 ¡Completaste el orden! +20 ⭐', 'warning');
            addStars(20);
            addCoins(10);
        }
    } else {
        showToast(`❌ ${currentLanguage === 'es' ? 'Debería ser' : 'Should be'} ${expected}`, 'error');
        card.style.background = '#EB5757';
        setTimeout(() => {
            card.style.background = 'rgba(255,255,255,0.2)';
        }, 500);
    }
};

// ============================================
// JUEGO 4: RULETA DE PREMIOS
// ============================================
let wheelSpinning = false;

export function startWheelGame() {
    const area = document.getElementById('game-area');
    if (!area) return;
    
    area.innerHTML = `
        <div style="background:linear-gradient(135deg,#FF6B6B 0%,#FFE66D 100%);border-radius:24px;padding:24px;text-align:center;color:#2d2d2d;">
            <h3>🎡 ${currentLanguage === 'es' ? 'Ruleta de Premios' : 'Prize Wheel'}</h3>
            <div id="wheel-icon" style="font-size:80px;cursor:pointer;user-select:none;transition:transform 0.1s;" onclick="window.spinWheel()">
                🎡
            </div>
            <div id="wheel-result" style="font-size:20px;font-weight:900;margin-top:16px;min-height:40px;">${currentLanguage === 'es' ? 'Toca la ruleta para girar' : 'Tap the wheel to spin'}</div>
            <button onclick="window.closeGame()" style="margin-top:12px;padding:8px 24px;border-radius:50px;border:none;background:rgba(0,0,0,0.1);color:#2d2d2d;font-weight:900;cursor:pointer;">✕ ${currentLanguage === 'es' ? 'Cerrar' : 'Close'}</button>
        </div>
    `;
}

window.spinWheel = function() {
    if (wheelSpinning) return;
    wheelSpinning = true;
    
    const wheel = document.getElementById('wheel-icon');
    const result = document.getElementById('wheel-result');
    const premios = [
        { icon: '⭐', nombre: '10 Estrellas', en: '10 Stars', valor: 10 },
        { icon: '🪙', nombre: '5 Monedas', en: '5 Coins', valor: 5 },
        { icon: '⭐', nombre: '20 Estrellas', en: '20 Stars', valor: 20 },
        { icon: '🪙', nombre: '10 Monedas', en: '10 Coins', valor: 10 },
        { icon: '⭐', nombre: '5 Estrellas', en: '5 Stars', valor: 5 },
        { icon: '🎯', nombre: '¡Nada!', en: 'Nothing!', valor: 0 }
    ];
    
    let rotations = 0;
    const interval = setInterval(() => {
        rotations += 10;
        wheel.style.transform = `rotate(${rotations}deg)`;
    }, 50);
    
    setTimeout(() => {
        clearInterval(interval);
        const premio = premios[Math.floor(Math.random() * premios.length)];
        
        const finalRotation = rotations + Math.floor(Math.random() * 360) + 360;
        wheel.style.transition = 'transform 0.5s ease-out';
        wheel.style.transform = `rotate(${finalRotation}deg)`;
        
        setTimeout(() => {
            if (premio.valor > 0) {
                if (premio.icon === '⭐') {
                    addStars(premio.valor);
                    result.innerHTML = `🎉 ${currentLanguage === 'es' ? 'Ganaste' : 'You won'} ${premio.valor} ⭐!`;
                } else {
                    addCoins(premio.valor);
                    result.innerHTML = `🎉 ${currentLanguage === 'es' ? 'Ganaste' : 'You won'} ${premio.valor} 🪙!`;
                }
                showToast(result.textContent, 'warning');
            } else {
                result.innerHTML = currentLanguage === 'es' ? '😅 ¡Sigue participando!' : '😅 Keep trying!';
            }
            wheelSpinning = false;
            wheel.style.transition = 'none';
        }, 600);
    }, 3000);
};

// ============================================
// JUEGO 5: AHORCADO
// ============================================
let hangmanWord = '';
let hangmanGuessed = [];
let hangmanWrong = [];

export function startHangmanGame() {
    const area = document.getElementById('game-area');
    if (!area) return;
    
    const palabras = ['GATO', 'PERRO', 'CASA', 'SOL', 'LUNA', 'MAR', 'NUBE', 'FLOR', 'TREN'];
    hangmanWord = palabras[Math.floor(Math.random() * palabras.length)];
    hangmanGuessed = [];
    hangmanWrong = [];
    
    renderHangman();
}

function renderHangman() {
    const area = document.getElementById('game-area');
    if (!area) return;
    
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    const wordDisplay = hangmanWord.split('').map(l => 
        hangmanGuessed.includes(l) ? l : '_'
    ).join(' ');
    const remaining = 6 - hangmanWrong.length;
    
    area.innerHTML = `
        <div style="background:linear-gradient(135deg,#2C3E50 0%,#3498DB 100%);border-radius:24px;padding:24px;color:#fff;text-align:center;">
            <h3>🪢 ${currentLanguage === 'es' ? 'Ahorcado' : 'Hangman'}</h3>
            <div style="font-size:28px;font-weight:900;letter-spacing:8px;margin:16px 0;font-family:monospace;">${wordDisplay}</div>
            <div style="font-weight:900;margin-bottom:8px;">${currentLanguage === 'es' ? 'Intentos restantes' : 'Tries left'}: ${remaining}</div>
            <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(40px,1fr));gap:6px;max-width:300px;margin:0 auto;">
                ${letters.map(l => `
                    <button onclick="window.guessLetter('${l}')" 
                            style="padding:6px;border-radius:6px;border:2px solid rgba(255,255,255,0.3);background:${hangmanGuessed.includes(l) ? '#6FCF97' : hangmanWrong.includes(l) ? '#EB5757' : 'rgba(255,255,255,0.1)'};color:#fff;font-size:16px;font-weight:900;cursor:${hangmanGuessed.includes(l) || hangmanWrong.includes(l) ? 'not-allowed' : 'pointer'};">
                        ${l}
                    </button>
                `).join('')}
            </div>
            <div id="hangman-status" style="margin-top:12px;font-weight:900;min-height:24px;"></div>
            <button onclick="window.startHangmanGame()" style="margin-top:12px;padding:8px 24px;border-radius:50px;border:none;background:rgba(255,255,255,0.2);color:#fff;font-weight:900;cursor:pointer;">🔄 ${currentLanguage === 'es' ? 'Nueva palabra' : 'New word'}</button>
            <button onclick="window.closeGame()" style="margin-top:12px;margin-left:8px;padding:8px 24px;border-radius:50px;border:none;background:rgba(255,255,255,0.2);color:#fff;font-weight:900;cursor:pointer;">✕ ${currentLanguage === 'es' ? 'Cerrar' : 'Close'}</button>
        </div>
    `;
}

window.guessLetter = function(letter) {
    if (hangmanGuessed.includes(letter) || hangmanWrong.includes(letter)) return;
    const status = document.getElementById('hangman-status');
    
    if (hangmanWord.includes(letter)) {
        hangmanGuessed.push(letter);
        status.textContent = '✅ ¡Bien!';
        status.style.color = '#6FCF97';
        
        const allGuessed = hangmanWord.split('').every(l => hangmanGuessed.includes(l));
        if (allGuessed) {
            status.textContent = '🎉 ¡Ganaste! +20 ⭐';
            addStars(20);
            addCoins(10);
            showToast('🎉 ¡Ganaste el Ahorcado! +20 ⭐', 'warning');
        }
    } else {
        hangmanWrong.push(letter);
        const remaining = 6 - hangmanWrong.length;
        status.textContent = `❌ ${currentLanguage === 'es' ? 'Te quedan' : 'You have'} ${remaining} ${currentLanguage === 'es' ? 'intentos' : 'tries'}`;
        status.style.color = '#EB5757';
        
        if (remaining === 0) {
            status.textContent = `💀 ${currentLanguage === 'es' ? 'Perdiste. Era' : 'You lost. It was'}: ${hangmanWord}`;
            showToast(`💀 ${currentLanguage === 'es' ? 'Era' : 'It was'}: ${hangmanWord}`, 'error');
        }
    }
    
    renderHangman();
};

// ============================================
// JUEGO 6: TRIVIA
// ============================================
let triviaQuestions = [];
let triviaIndex = 0;
let triviaScore = 0;

export function startTriviaGame() {
    const area = document.getElementById('game-area');
    if (!area) return;
    
    triviaQuestions = [
        { es: '¿Qué color es el cielo?', en: 'What color is the sky?', opciones: { es: ['Rojo', 'Azul', 'Verde'], en: ['Red', 'Blue', 'Green'] }, correcta: 1 },
        { es: '¿Cuántas patas tiene un perro?', en: 'How many legs does a dog have?', opciones: { es: ['2', '3', '4'], en: ['2', '3', '4'] }, correcta: 2 },
        { es: '¿Qué animal dice "Miau"?', en: 'What animal says "Meow"?', opciones: { es: ['Perro', 'Gato', 'Vaca'], en: ['Dog', 'Cat', 'Cow'] }, correcta: 1 },
        { es: '¿Cuánto es 2 + 3?', en: 'What is 2 + 3?', opciones: { es: ['3', '4', '5'], en: ['3', '4', '5'] }, correcta: 2 },
        { es: '¿Qué forma tiene una pelota?', en: 'What shape is a ball?', opciones: { es: ['Cuadrado', 'Círculo', 'Triángulo'], en: ['Square', 'Circle', 'Triangle'] }, correcta: 1 }
    ];
    
    for (let i = triviaQuestions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [triviaQuestions[i], triviaQuestions[j]] = [triviaQuestions[j], triviaQuestions[i]];
    }
    
    triviaIndex = 0;
    triviaScore = 0;
    showTriviaQuestion();
}

function showTriviaQuestion() {
    const area = document.getElementById('game-area');
    if (!area) return;
    
    if (triviaIndex >= triviaQuestions.length) {
        area.innerHTML = `
            <div style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);border-radius:24px;padding:24px;color:#fff;text-align:center;">
                <div style="font-size:48px;">🏆</div>
                <h2>${currentLanguage === 'es' ? '¡Trivia Completada!' : 'Trivia Completed!'}</h2>
                <p style="font-size:24px;font-weight:900;">${currentLanguage === 'es' ? 'Puntaje' : 'Score'}: ${triviaScore} / ${triviaQuestions.length}</p>
                <button onclick="window.startTriviaGame()" style="margin-top:12px;padding:8px 24px;border-radius:50px;border:none;background:rgba(255,255,255,0.2);color:#fff;font-weight:900;cursor:pointer;">🔄 ${currentLanguage === 'es' ? 'Jugar de nuevo' : 'Play again'}</button>
                <button onclick="window.closeGame()" style="margin-top:12px;margin-left:8px;padding:8px 24px;border-radius:50px;border:none;background:rgba(255,255,255,0.2);color:#fff;font-weight:900;cursor:pointer;">✕ ${currentLanguage === 'es' ? 'Cerrar' : 'Close'}</button>
            </div>
        `;
        return;
    }
    
    const q = triviaQuestions[triviaIndex];
    const total = triviaQuestions.length;
    const pregunta = currentLanguage === 'es' ? q.es : q.en;
    const opciones = currentLanguage === 'es' ? q.opciones.es : q.opciones.en;
    
    area.innerHTML = `
        <div style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);border-radius:24px;padding:24px;color:#fff;text-align:center;">
            <h3>🧠 ${currentLanguage === 'es' ? 'Pregunta' : 'Question'} ${triviaIndex + 1}/${total}</h3>
            <div style="font-size:20px;font-weight:900;margin:16px 0;">${pregunta}</div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;max-width:280px;margin:0 auto;">
                ${opciones.map((opt, idx) => `
                    <button onclick="window.checkTriviaAnswer(${idx}, ${q.correcta})" 
                            style="padding:12px;border-radius:12px;border:2px solid rgba(255,255,255,0.3);background:rgba(255,255,255,0.1);color:#fff;font-size:16px;font-weight:900;cursor:pointer;">
                        ${opt}
                    </button>
                `).join('')}
            </div>
            <div id="trivia-message" style="margin-top:12px;font-weight:900;min-height:24px;"></div>
            <button onclick="window.closeGame()" style="margin-top:12px;padding:8px 24px;border-radius:50px;border:none;background:rgba(255,255,255,0.2);color:#fff;font-weight:900;cursor:pointer;">✕ ${currentLanguage === 'es' ? 'Cerrar' : 'Close'}</button>
        </div>
    `;
}

window.checkTriviaAnswer = function(selected, correct) {
    const message = document.getElementById('trivia-message');
    if (!message) return;
    
    if (selected === correct) {
        triviaScore++;
        message.textContent = '✅ ¡Correcto! +5 ⭐';
        message.style.color = '#6FCF97';
        addStars(5);
        showToast('✅ ¡Correcto! +5 ⭐', 'warning');
    } else {
        const opciones = currentLanguage === 'es' ? triviaQuestions[triviaIndex].opciones.es : triviaQuestions[triviaIndex].opciones.en;
        message.textContent = `❌ ${currentLanguage === 'es' ? 'Era' : 'It was'}: ${opciones[correct]}`;
        message.style.color = '#EB5757';
    }
    
    setTimeout(() => {
        triviaIndex++;
        showTriviaQuestion();
    }, 1500);
};

// ============================================
// JUEGO 7: MATEMÁTICAS
// ============================================
export function startMath(type) {
    const area = document.getElementById('math-area');
    if (!area) return;
    
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    let operador, resultado;
    
    if (type === 'suma' || (type === 'mixto' && Math.random() > 0.5)) {
        operador = '+';
        resultado = num1 + num2;
    } else {
        operador = '-';
        if (num1 < num2) {
            const temp = num1;
            const num1 = num2;
            const num2 = temp;
            resultado = num1 - num2;
        } else {
            resultado = num1 - num2;
        }
    }
    
    const opciones = [resultado];
    while (opciones.length < 4) {
        const r = resultado + Math.floor(Math.random() * 7) - 3;
        if (!opciones.includes(r) && r >= 0) {
            opciones.push(r);
        }
    }
    
    for (let i = opciones.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [opciones[i], opciones[j]] = [opciones[j], opciones[i]];
    }
    
    const titulo = currentLanguage === 'es' ? 
        (type === 'suma' ? 'Suma' : type === 'resta' ? 'Resta' : 'Mixto') :
        (type === 'suma' ? 'Addition' : type === 'resta' ? 'Subtraction' : 'Mixed');
    
    area.innerHTML = `
        <div style="background:linear-gradient(135deg,#f093fb 0%,#f5576c 100%);border-radius:24px;padding:24px;color:#fff;text-align:center;">
            <h3>🧮 ${titulo}</h3>
            <div style="font-size:36px;font-weight:900;margin:16px 0;">${num1} ${operador} ${num2} = ?</div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;max-width:280px;margin:0 auto;">
                ${opciones.map(opt => `
                    <button onclick="window.checkMathAnswer(${opt}, ${resultado})" 
                            style="padding:12px;border-radius:12px;border:2px solid rgba(255,255,255,0.3);background:rgba(255,255,255,0.1);color:#fff;font-size:24px;font-weight:900;cursor:pointer;">
                        ${opt}
                    </button>
                `).join('')}
            </div>
            <div id="math-result" style="margin-top:12px;font-weight:900;min-height:24px;"></div>
            <button onclick="window.startMath('${type}')" style="margin-top:12px;padding:8px 24px;border-radius:50px;border:none;background:rgba(255,255,255,0.2);color:#fff;font-weight:900;cursor:pointer;">🔄 ${currentLanguage === 'es' ? 'Nueva' : 'New'}</button>
            <button onclick="window.closeGame()" style="margin-top:12px;margin-left:8px;padding:8px 24px;border-radius:50px;border:none;background:rgba(255,255,255,0.2);color:#fff;font-weight:900;cursor:pointer;">✕ ${currentLanguage === 'es' ? 'Cerrar' : 'Close'}</button>
        </div>
    `;
}

window.checkMathAnswer = function(selected, correct) {
    const result = document.getElementById('math-result');
    if (!result) return;
    
    if (selected === correct) {
        result.textContent = '✅ ¡Correcto! +10 ⭐';
        result.style.color = '#6FCF97';
        addStars(10);
        addCoins(5);
        showToast('✅ ¡Correcto! +10 ⭐ +5 🪙', 'warning');
    } else {
        result.textContent = `❌ ${currentLanguage === 'es' ? 'Era' : 'It was'} ${correct}`;
        result.style.color = '#EB5757';
    }
};

// ============================================
// JUEGO 8: PIZARRA INTERACTIVA
// ============================================
let drawingColor = '#E74C3C';
let drawingSize = 4;
let isDrawing = false;
let lastX = 0;
let lastY = 0;
let canvasRef = null;
let ctxRef = null;

export function startPizarra() {
    const area = document.getElementById('game-area');
    if (!area) return;
    
    area.innerHTML = `
        <div style="background:linear-gradient(135deg,#f5f7fa 0%,#c3cfe2 100%);border-radius:24px;padding:24px;text-align:center;">
            <h3>🎨 ${currentLanguage === 'es' ? 'Pizarra Mágica' : 'Magic Board'}</h3>
            
            <div style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin:12px 0;">
                <div style="display:flex;gap:4px;flex-wrap:wrap;justify-content:center;">
                    ${['#E74C3C','#3498DB','#27AE60','#F1C40F','#E67E22','#9B59B6','#E91E8C','#2C3E50'].map(c => `
                        <button onclick="window.setDrawingColor('${c}')" 
                                style="width:30px;height:30px;border-radius:50%;border:2px solid ${c === drawingColor ? '#333' : 'transparent'};background:${c};cursor:pointer;transition:all 0.2s;hover:transform:scale(1.1);">
                        </button>
                    `).join('')}
                </div>
                <div style="display:flex;gap:4px;align-items:center;">
                    <button onclick="window.setDrawingSize(2)" style="padding:4px 8px;border-radius:8px;border:2px solid ${drawingSize === 2 ? '#333' : '#ddd'};background:${drawingSize === 2 ? '#ddd' : 'white'};cursor:pointer;font-size:12px;font-weight:900;">●</button>
                    <button onclick="window.setDrawingSize(6)" style="padding:4px 8px;border-radius:8px;border:2px solid ${drawingSize === 6 ? '#333' : '#ddd'};background:${drawingSize === 6 ? '#ddd' : 'white'};cursor:pointer;font-size:16px;font-weight:900;">●</button>
                    <button onclick="window.setDrawingSize(12)" style="padding:4px 8px;border-radius:8px;border:2px solid ${drawingSize === 12 ? '#333' : '#ddd'};background:${drawingSize === 12 ? '#ddd' : 'white'};cursor:pointer;font-size:20px;font-weight:900;">●</button>
                </div>
            </div>
            
            <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-bottom:12px;">
                <button onclick="window.clearCanvas()" style="padding:6px 16px;border-radius:20px;border:none;background:#EB5757;color:#fff;font-weight:900;cursor:pointer;">🧹 ${currentLanguage === 'es' ? 'Borrar' : 'Clear'}</button>
                <button onclick="window.addShape('circle')" style="padding:6px 16px;border-radius:20px;border:none;background:#3498DB;color:#fff;font-weight:900;cursor:pointer;">⭕ ${currentLanguage === 'es' ? 'Círculo' : 'Circle'}</button>
                <button onclick="window.addShape('square')" style="padding:6px 16px;border-radius:20px;border:none;background:#27AE60;color:#fff;font-weight:900;cursor:pointer;">🟦 ${currentLanguage === 'es' ? 'Cuadrado' : 'Square'}</button>
                <button onclick="window.addShape('triangle')" style="padding:6px 16px;border-radius:20px;border:none;background:#F1C40F;color:#2d2d2d;font-weight:900;cursor:pointer;">🔺 ${currentLanguage === 'es' ? 'Triángulo' : 'Triangle'}</button>
                <button onclick="window.addShape('star')" style="padding:6px 16px;border-radius:20px;border:none;background:#E67E22;color:#fff;font-weight:900;cursor:pointer;">⭐ ${currentLanguage === 'es' ? 'Estrella' : 'Star'}</button>
            </div>
            
            <div style="background:#fff;border-radius:16px;overflow:hidden;border:3px solid #ddd;touch-action:none;">
                <canvas id="pizarra-canvas" 
                        style="width:100%;height:300px;display:block;touch-action:none;cursor:crosshair;"
                        width="600" height="400">
                </canvas>
            </div>
            
            <div style="margin-top:12px;display:flex;gap:8px;justify-content:center;flex-wrap:wrap;">
                <button onclick="window.closeGame()" style="padding:8px 24px;border-radius:50px;border:none;background:#888;color:#fff;font-weight:900;cursor:pointer;">✕ ${currentLanguage === 'es' ? 'Cerrar' : 'Close'}</button>
            </div>
            <div id="pizarra-message" style="margin-top:8px;font-size:12px;color:#888;">${currentLanguage === 'es' ? '🎨 Dibuja con el mouse o el dedo' : '🎨 Draw with mouse or finger'}</div>
        </div>
    `;
    
    setTimeout(() => {
        const canvas = document.getElementById('pizarra-canvas');
        if (canvas) {
            canvasRef = canvas;
            ctxRef = canvas.getContext('2d');
            ctxRef.fillStyle = '#fff';
            ctxRef.fillRect(0, 0, canvas.width, canvas.height);
            
            canvas.addEventListener('mousedown', startDraw);
            canvas.addEventListener('mousemove', draw);
            canvas.addEventListener('mouseup', endDraw);
            canvas.addEventListener('mouseleave', endDraw);
            
            canvas.addEventListener('touchstart', handleTouchStart);
            canvas.addEventListener('touchmove', handleTouchMove);
            canvas.addEventListener('touchend', endDraw);
        }
    }, 100);
}

function getCanvasCoords(e) {
    const rect = canvasRef.getBoundingClientRect();
    const scaleX = canvasRef.width / rect.width;
    const scaleY = canvasRef.height / rect.height;
    return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
    };
}

function startDraw(e) {
    isDrawing = true;
    const coords = getCanvasCoords(e);
    lastX = coords.x;
    lastY = coords.y;
}

function draw(e) {
    if (!isDrawing) return;
    const coords = getCanvasCoords(e);
    ctxRef.beginPath();
    ctxRef.moveTo(lastX, lastY);
    ctxRef.lineTo(coords.x, coords.y);
    ctxRef.strokeStyle = drawingColor;
    ctxRef.lineWidth = drawingSize;
    ctxRef.lineCap = 'round';
    ctxRef.lineJoin = 'round';
    ctxRef.stroke();
    lastX = coords.x;
    lastY = coords.y;
}

function endDraw() {
    isDrawing = false;
}

function handleTouchStart(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvasRef.getBoundingClientRect();
    const scaleX = canvasRef.width / rect.width;
    const scaleY = canvasRef.height / rect.height;
    lastX = (touch.clientX - rect.left) * scaleX;
    lastY = (touch.clientY - rect.top) * scaleY;
    isDrawing = true;
}

function handleTouchMove(e) {
    e.preventDefault();
    if (!isDrawing) return;
    const touch = e.touches[0];
    const rect = canvasRef.getBoundingClientRect();
    const scaleX = canvasRef.width / rect.width;
    const scaleY = canvasRef.height / rect.height;
    const x = (touch.clientX - rect.left) * scaleX;
    const y = (touch.clientY - rect.top) * scaleY;
    
    ctxRef.beginPath();
    ctxRef.moveTo(lastX, lastY);
    ctxRef.lineTo(x, y);
    ctxRef.strokeStyle = drawingColor;
    ctxRef.lineWidth = drawingSize;
    ctxRef.lineCap = 'round';
    ctxRef.lineJoin = 'round';
    ctxRef.stroke();
    lastX = x;
    lastY = y;
}

window.setDrawingColor = function(color) {
    drawingColor = color;
    showToast(`🎨 ${currentLanguage === 'es' ? 'Color seleccionado' : 'Color selected'}`, 'warning');
};

window.setDrawingSize = function(size) {
    drawingSize = size;
};

window.clearCanvas = function() {
    if (!ctxRef) return;
    ctxRef.fillStyle = '#fff';
    ctxRef.fillRect(0, 0, canvasRef.width, canvasRef.height);
    showToast('🧹 ' + (currentLanguage === 'es' ? 'Pizarra limpia' : 'Board cleared'), 'warning');
};

window.addShape = function(type) {
    if (!ctxRef) return;
    const cx = Math.random() * (canvasRef.width - 100) + 50;
    const cy = Math.random() * (canvasRef.height - 100) + 50;
    const size = Math.random() * 40 + 20;
    
    ctxRef.fillStyle = drawingColor;
    ctxRef.strokeStyle = drawingColor;
    ctxRef.lineWidth = 2;
    
    switch(type) {
        case 'circle':
            ctxRef.beginPath();
            ctxRef.arc(cx, cy, size, 0, Math.PI * 2);
            ctxRef.fill();
            break;
        case 'square':
            ctxRef.fillRect(cx - size/2, cy - size/2, size, size);
            break;
        case 'triangle':
            ctxRef.beginPath();
            ctxRef.moveTo(cx, cy - size);
            ctxRef.lineTo(cx - size, cy + size);
            ctxRef.lineTo(cx + size, cy + size);
            ctxRef.closePath();
            ctxRef.fill();
            break;
        case 'star':
            ctxRef.beginPath();
            for (let i = 0; i < 5; i++) {
                const angle = (i * 4 * Math.PI / 5) - Math.PI / 2;
                const r = i % 2 === 0 ? size : size * 0.4;
                const x = cx + Math.cos(angle) * r;
                const y = cy + Math.sin(angle) * r;
                i === 0 ? ctxRef.moveTo(x, y) : ctxRef.lineTo(x, y);
            }
            ctxRef.closePath();
            ctxRef.fill();
            break;
    }
    showToast(`✅ ${currentLanguage === 'es' ? 'Forma agregada' : 'Shape added'}`, 'warning');
};

// ============================================
// JUEGO 9: CONECTAR LOS CABLES
// ============================================
let cablePairs = [];
let cableSelected = null;
let cableMatches = 0;

export function startCableGame() {
    const area = document.getElementById('game-area');
    if (!area) return;
    
    const palabras = [
        { es: 'Perro', en: 'Dog', emoji: '🐶' },
        { es: 'Gato', en: 'Cat', emoji: '🐱' },
        { es: 'Vaca', en: 'Cow', emoji: '🐮' },
        { es: 'Pato', en: 'Duck', emoji: '🦆' },
        { es: 'Sol', en: 'Sun', emoji: '☀️' },
        { es: 'Luna', en: 'Moon', emoji: '🌙' }
    ];
    
    const shuffled = [...palabras].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 4);
    cablePairs = selected;
    cableSelected = null;
    cableMatches = 0;
    
    const words = selected.map((p, i) => ({ id: i, text: currentLanguage === 'es' ? p.es : p.en, type: 'word', pairId: i }));
    const emojis = selected.map((p, i) => ({ id: i + 10, text: p.emoji, type: 'emoji', pairId: i }));
    
    const items = [...words, ...emojis];
    for (let i = items.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [items[i], items[j]] = [items[j], items[i]];
    }
    
    area.innerHTML = `
        <div style="background:linear-gradient(135deg,#ffecd2 0%,#fcb69f 100%);border-radius:24px;padding:24px;text-align:center;">
            <h3>🔌 ${currentLanguage === 'es' ? 'Conecta los Cables' : 'Connect the Cables'}</h3>
            <p style="font-size:14px;color:#555;">${currentLanguage === 'es' ? 'Une cada palabra con su emoji' : 'Match each word with its emoji'}</p>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;max-width:350px;margin:16px auto;">
                ${items.map(item => `
                    <div class="cable-item" data-id="${item.id}" data-pair="${item.pairId}" data-type="${item.type}"
                         style="background:#fff;border-radius:12px;padding:16px;font-size:24px;font-weight:900;cursor:pointer;border:3px solid ${item.type === 'word' ? '#3498DB' : '#E67E22'};transition:all 0.3s;hover:transform:scale(1.05);">
                        ${item.text}
                    </div>
                `).join('')}
            </div>
            <div id="cable-status" style="font-weight:900;margin:8px 0;">${currentLanguage === 'es' ? 'Parejas' : 'Pairs'}: ${cableMatches}/4</div>
            <button onclick="window.startCableGame()" style="margin-top:8px;padding:8px 24px;border-radius:50px;border:none;background:#27AE60;color:#fff;font-weight:900;cursor:pointer;">🔄 ${currentLanguage === 'es' ? 'Reiniciar' : 'Restart'}</button>
            <button onclick="window.closeGame()" style="margin-top:8px;margin-left:8px;padding:8px 24px;border-radius:50px;border:none;background:#888;color:#fff;font-weight:900;cursor:pointer;">✕ ${currentLanguage === 'es' ? 'Cerrar' : 'Close'}</button>
        </div>
    `;
    
    document.querySelectorAll('.cable-item').forEach(el => {
        el.addEventListener('click', function() {
            const id = parseInt(this.dataset.id);
            const pairId = parseInt(this.dataset.pair);
            const type = this.dataset.type;
            
            if (cableSelected === null) {
                cableSelected = { id, pairId, type, element: this };
                this.style.borderColor = '#F1C40F';
                this.style.transform = 'scale(1.05)';
            } else {
                if (cableSelected.id === id) {
                    cableSelected.element.style.borderColor = cableSelected.type === 'word' ? '#3498DB' : '#E67E22';
                    cableSelected.element.style.transform = 'scale(1)';
                    cableSelected = null;
                    return;
                }
                
                if (cableSelected.pairId === pairId && cableSelected.type !== type) {
                    this.style.borderColor = '#6FCF97';
                    this.style.background = '#6FCF97';
                    this.style.color = '#fff';
                    cableSelected.element.style.borderColor = '#6FCF97';
                    cableSelected.element.style.background = '#6FCF97';
                    cableSelected.element.style.color = '#fff';
                    
                    cableMatches++;
                    document.getElementById('cable-status').textContent = `${currentLanguage === 'es' ? 'Parejas' : 'Pairs'}: ${cableMatches}/4`;
                    
                    if (cableMatches === 4) {
                        showToast('🎉 ¡Conectaste todos! +15 ⭐', 'warning');
                        addStars(15);
                        addCoins(8);
                    }
                    
                    cableSelected = null;
                } else {
                    this.style.borderColor = '#EB5757';
                    cableSelected.element.style.borderColor = '#EB5757';
                    setTimeout(() => {
                        this.style.borderColor = '#ddd';
                        cableSelected.element.style.borderColor = cableSelected.type === 'word' ? '#3498DB' : '#E67E22';
                        cableSelected.element.style.transform = 'scale(1)';
                        cableSelected = null;
                    }, 500);
                }
            }
        });
    });
}

// ============================================
// JUEGO 10: SOPA DE LETRAS
// ============================================
let sopaPalabras = [];
let sopaFound = [];
let sopaGrid = [];
let sopaDifficulty = 'facil';

export function startSopaLetras() {
    const area = document.getElementById('game-area');
    if (!area) return;
    
    area.innerHTML = `
        <div style="background:linear-gradient(135deg,#a8edea 0%,#fed6e3 100%);border-radius:24px;padding:24px;text-align:center;">
            <h3>🔤 ${currentLanguage === 'es' ? 'Sopa de Letras' : 'Word Search'}</h3>
            <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin:8px 0;">
                <button onclick="window.startSopaLevel('facil')" style="padding:6px 16px;border-radius:20px;border:2px solid ${sopaDifficulty === 'facil' ? '#27AE60' : '#ddd'};background:${sopaDifficulty === 'facil' ? '#27AE60' : 'white'};color:${sopaDifficulty === 'facil' ? '#fff' : '#555'};font-weight:900;cursor:pointer;">🟢 ${currentLanguage === 'es' ? 'Fácil' : 'Easy'}</button>
                <button onclick="window.startSopaLevel('medio')" style="padding:6px 16px;border-radius:20px;border:2px solid ${sopaDifficulty === 'medio' ? '#F1C40F' : '#ddd'};background:${sopaDifficulty === 'medio' ? '#F1C40F' : 'white'};color:${sopaDifficulty === 'medio' ? '#2d2d2d' : '#555'};font-weight:900;cursor:pointer;">🟡 ${currentLanguage === 'es' ? 'Medio' : 'Medium'}</button>
                <button onclick="window.startSopaLevel('dificil')" style="padding:6px 16px;border-radius:20px;border:2px solid ${sopaDifficulty === 'dificil' ? '#EB5757' : '#ddd'};background:${sopaDifficulty === 'dificil' ? '#EB5757' : 'white'};color:${sopaDifficulty === 'dificil' ? '#fff' : '#555'};font-weight:900;cursor:pointer;">🔴 ${currentLanguage === 'es' ? 'Difícil' : 'Hard'}</button>
            </div>
            <div id="sopa-grid" style="display:grid;gap:4px;max-width:400px;margin:12px auto;"></div>
            <div id="sopa-palabras" style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin:8px 0;"></div>
            <div id="sopa-status" style="font-weight:900;margin:4px 0;">${currentLanguage === 'es' ? 'Palabras encontradas' : 'Words found'}: 0</div>
            <button onclick="window.startSopaLevel(sopaDifficulty)" style="margin-top:8px;padding:8px 24px;border-radius:50px;border:none;background:#3498DB;color:#fff;font-weight:900;cursor:pointer;">🔄 ${currentLanguage === 'es' ? 'Nueva sopa' : 'New puzzle'}</button>
            <button onclick="window.closeGame()" style="margin-top:8px;margin-left:8px;padding:8px 24px;border-radius:50px;border:none;background:#888;color:#fff;font-weight:900;cursor:pointer;">✕ ${currentLanguage === 'es' ? 'Cerrar' : 'Close'}</button>
        </div>
    `;
    
    startSopaLevel('facil');
}

window.startSopaLevel = function(difficulty) {
    sopaDifficulty = difficulty;
    
    const palabras = {
        facil: ['GATO', 'PERRO', 'SOL', 'LUNA', 'MAR'],
        medio: ['CASA', 'NUBE', 'FLOR', 'TREN', 'SER', 'CIELO', 'AGUA'],
        dificil: ['ELEFANTE', 'MARIPOSA', 'ARCOIRIS', 'CASTILLO', 'SIRENA', 'COHETE', 'PIZZA', 'DRAGON']
    };
    
    const selectedWords = palabras[difficulty] || palabras.facil;
    const gridSize = difficulty === 'facil' ? 8 : difficulty === 'medio' ? 10 : 12;
    
    generateSopa(selectedWords, gridSize);
    renderSopa();
};

function generateSopa(words, size) {
    sopaPalabras = words;
    sopaFound = [];
    
    sopaGrid = Array(size).fill().map(() => Array(size).fill(''));
    
    const directions = [
        [0, 1], [1, 0], [1, 1], [1, -1],
        [0, -1], [-1, 0], [-1, -1], [-1, 1]
    ];
    
    words.forEach(word => {
        let placed = false;
        let attempts = 0;
        while (!placed && attempts < 100) {
            attempts++;
            const dir = directions[Math.floor(Math.random() * directions.length)];
            const row = Math.floor(Math.random() * size);
            const col = Math.floor(Math.random() * size);
            
            if (canPlaceWord(word, row, col, dir, size)) {
                placeWord(word, row, col, dir);
                placed = true;
            }
        }
    });
    
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            if (sopaGrid[i][j] === '') {
                sopaGrid[i][j] = letters[Math.floor(Math.random() * letters.length)];
            }
        }
    }
}

function canPlaceWord(word, row, col, dir, size) {
    for (let i = 0; i < word.length; i++) {
        const r = row + i * dir[0];
        const c = col + i * dir[1];
        if (r < 0 || r >= size || c < 0 || c >= size) return false;
        if (sopaGrid[r][c] !== '' && sopaGrid[r][c] !== word[i]) return false;
    }
    return true;
}

function placeWord(word, row, col, dir) {
    for (let i = 0; i < word.length; i++) {
        sopaGrid[row + i * dir[0]][col + i * dir[1]] = word[i];
    }
}

function renderSopa() {
    const grid = document.getElementById('sopa-grid');
    const palabrasDiv = document.getElementById('sopa-palabras');
    const status = document.getElementById('sopa-status');
    
    if (!grid) return;
    
    grid.style.gridTemplateColumns = `repeat(${sopaGrid.length}, 1fr)`;
    grid.innerHTML = '';
    
    sopaGrid.forEach((row, i) => {
        row.forEach((letter, j) => {
            const cell = document.createElement('div');
            cell.style.cssText = `
                aspect-ratio:1;
                display:flex;
                align-items:center;
                justify-content:center;
                font-size:${sopaGrid.length <= 10 ? '18px' : '14px'};
                font-weight:900;
                background:${sopaFound.some(f => f[0] === i && f[1] === j) ? '#6FCF97' : 'white'};
                border-radius:6px;
                border:1px solid #ddd;
                cursor:pointer;
                transition:all 0.2s;
                color:#2d2d2d;
            `;
            cell.textContent = letter;
            cell.dataset.row = i;
            cell.dataset.col = j;
            
            cell.addEventListener('click', function() {
                const r = parseInt(this.dataset.row);
                const c = parseInt(this.dataset.col);
                const word = findWordAt(r, c);
                if (word) {
                    const wordIndex = sopaPalabras.indexOf(word);
                    if (wordIndex !== -1 && !sopaFound.some(f => f[0] === r && f[1] === c)) {
                        const positions = getWordPositions(word, r, c);
                        positions.forEach(pos => {
                            sopaFound.push(pos);
                        });
                        renderSopa();
                        const found = sopaFound.length / word.length;
                        if (status) status.textContent = `${currentLanguage === 'es' ? 'Palabras encontradas' : 'Words found'}: ${found}/${sopaPalabras.length}`;
                        if (found === sopaPalabras.length) {
                            showToast('🎉 ¡Sopa completada! +20 ⭐', 'warning');
                            addStars(20);
                            addCoins(10);
                        }
                    }
                }
            });
            
            grid.appendChild(cell);
        });
    });
    
    if (palabrasDiv) {
        palabrasDiv.innerHTML = sopaPalabras.map(p => `
            <span style="background:${sopaFound.some(f => f[0] !== undefined) ? '#6FCF97' : '#f0f0f0'};padding:4px 12px;border-radius:20px;font-weight:900;font-size:12px;color:#2d2d2d;">
                ${p}
            </span>
        `).join('');
    }
    
    if (status) {
        const found = sopaFound.length > 0 ? Math.floor(sopaFound.length / sopaPalabras[0].length) : 0;
        status.textContent = `${currentLanguage === 'es' ? 'Palabras encontradas' : 'Words found'}: ${found}/${sopaPalabras.length}`;
    }
}

function findWordAt(row, col) {
    const letter = sopaGrid[row][col];
    const directions = [
        [0, 1], [1, 0], [1, 1], [1, -1]
    ];
    
    for (const word of sopaPalabras) {
        if (word[0] !== letter) continue;
        for (const dir of directions) {
            let found = true;
            for (let i = 0; i < word.length; i++) {
                const r = row + i * dir[0];
                const c = col + i * dir[1];
                if (r < 0 || r >= sopaGrid.length || c < 0 || c >= sopaGrid.length) {
                    found = false;
                    break;
                }
                if (sopaGrid[r][c] !== word[i]) {
                    found = false;
                    break;
                }
            }
            if (found) return word;
        }
    }
    return null;
}

function getWordPositions(word, row, col) {
    const positions = [];
    const directions = [
        [0, 1], [1, 0], [1, 1], [1, -1]
    ];
    
    for (const dir of directions) {
        let valid = true;
        const temp = [];
        for (let i = 0; i < word.length; i++) {
            const r = row + i * dir[0];
            const c = col + i * dir[1];
            if (r < 0 || r >= sopaGrid.length || c < 0 || c >= sopaGrid.length) {
                valid = false;
                break;
            }
            if (sopaGrid[r][c] !== word[i]) {
                valid = false;
                break;
            }
            temp.push([r, c]);
        }
        if (valid) {
            positions.push(...temp);
            break;
        }
    }
    return positions;
}

// ============================================
// LECTURA
// ============================================
export function startReading() {
    const area = document.getElementById('reading-area');
    if (!area) return;
    area.innerHTML = `
        <div style="background:linear-gradient(135deg,#a8edea 0%,#fed6e3 100%);border-radius:24px;padding:24px;text-align:center;">
            <div style="font-size:48px;">📚</div>
            <h3 style="color:#2d2d2d;">${currentLanguage === 'es' ? 'Aprender a Leer' : 'Learn to Read'}</h3>
            <p style="color:#555;">${currentLanguage === 'es' ? 'Próximamente: Sílabas y palabras' : 'Coming soon: Syllables and words'}</p>
            <div style="margin-top:16px;font-size:24px;color:#888;">🔤 ABC</div>
        </div>
    `;
}

// ============================================
// FUNCIONES GLOBALES (window)
// ============================================
window.buySticker = buySticker;
window.startMatchGame = startMatchGame;
window.startColorGame = startColorGame;
window.startNumberGame = startNumberGame;
window.startWheelGame = startWheelGame;
window.startHangmanGame = startHangmanGame;
window.startTriviaGame = startTriviaGame;
window.startMath = startMath;
window.startPizarra = startPizarra;
window.startCableGame = startCableGame;
window.startSopaLetras = startSopaLetras;
window.startSopaLevel = startSopaLevel;
window.closeGame = function() {
    const area = document.getElementById('game-area');
    if (area) {
        area.innerHTML = '';
        showToast(currentLanguage === 'es' ? '👋 Juego cerrado' : '👋 Game closed', 'warning');
    }
};
window.openVideo = function(videoId, titulo) {
    const area = document.getElementById('cartoons-area');
    if (!area) return;
    area.innerHTML += `
        <div style="margin-bottom:16px;">
            <iframe src="https://www.youtube.com/embed/${videoId}?autoplay=1" 
                    style="width:100%;aspect-ratio:16/9;border:none;border-radius:16px;" 
                    allow="autoplay; encrypted-media" 
                    allowfullscreen>
            </iframe>
            <button onclick="window.closeVideo()" style="margin-top:4px;padding:4px 12px;border-radius:20px;border:none;background:#EB5757;color:#fff;font-weight:900;cursor:pointer;">✕ ${currentLanguage === 'es' ? 'Cerrar' : 'Close'}</button>
        </div>
    `;
    addStars(2);
};
window.closeVideo = function() {
    const videos = document.querySelectorAll('#cartoons-area iframe');
    if (videos.length > 0) {
        videos[videos.length - 1].parentElement.remove();
    }
};

// ============================================
// RENDER TODAS LAS SECCIONES
// ============================================
function renderAllSections() {
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
}

function renderCuentos() {
    const list = document.getElementById('story-list');
    if (!list) return;
    list.innerHTML = '';
    STORIES.forEach(c => {
        const card = document.createElement('div');
        card.className = 'story-container';
        card.innerHTML = `
            <span class="story-emoji">${c.emoji}</span>
            <div class="story-title">${c.titulo}</div>
            <div class="story-desc">${c.desc}</div>
        `;
        card.onclick = () => showToast('📖 ' + c.titulo + ' - ' + (currentLanguage === 'es' ? 'Próximamente' : 'Coming soon'), 'warning');
        list.appendChild(card);
    });
}

function renderCartoons() {
    const area = document.getElementById('cartoons-area');
    if (!area) return;
    area.innerHTML = `
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:16px;">
            ${CARTOONS.map(v => `
                <div style="background:#fff;border-radius:16px;overflow:hidden;cursor:pointer;border:3px solid #eee;" onclick="window.openVideo('${v.video_id}','${v.titulo}')">
                    <img src="https://img.youtube.com/vi/${v.video_id}/0.jpg" style="width:100%;aspect-ratio:16/9;object-fit:cover">
                    <div style="padding:12px;font-weight:900;font-size:14px;">${v.titulo}</div>
                </div>
            `).join('')}
        </div>
    `;
}

// ============================================
// INICIALIZACIÓN
// ============================================
export async function initApp() {
    console.log(`🚀 ${CONFIG.APP_NAME} v${CONFIG.VERSION}`);
    
    try {
        const authResult = await initAuth();
        console.log('📦 Resultado initAuth:', authResult);
        
        const loginScreen = document.getElementById('login-screen');
        const appContent = document.getElementById('app-content');
        
        if (appContent) appContent.style.display = 'block';
        
        document.querySelectorAll('.section-content').forEach(el => {
            el.style.display = 'block';
            el.classList.remove('hidden');
        });
        
        if (loginScreen) loginScreen.style.display = 'none';
        
        if (authResult.success && !authResult.blocked) {
            APP.user = authResult.user;
            APP.profile = authResult.profile;
            APP.stars = authResult.profile?.stars || 0;
            APP.coins = authResult.profile?.coins || 50;
            APP.level = authResult.profile?.level || 1;
            console.log('✅ Usuario autenticado:', APP.user?.email);
            showToast('🌟 ¡Bienvenido ' + (APP.profile?.username || 'Explorador') + '!', 'warning');
        } else {
            console.log('🔓 Modo demo');
            APP.user = { id: 'demo', email: 'demo@ciborgkids.com' };
            APP.profile = { username: 'Explorador', avatar: '🦊', coins: 50, stars: 0, level: 1 };
            APP.coins = 50;
            APP.stars = 0;
            APP.level = 1;
            showToast('👋 Modo demo - toca para aprender', 'warning');
        }
        
        updateUI();
        addLanguageButton();
        renderAllSections();
        showSection('colores');
        
    } catch (error) {
        console.error('❌ Error en initApp:', error);
        showToast('❌ Error al iniciar: ' + error.message, 'error');
    }
}

// ============================================
// EXPORTAR SOLO APP (TODAS LAS DEMÁS FUNCIONES YA TIENEN export)
// ============================================
export { APP };
