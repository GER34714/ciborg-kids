// js/main.js - VERSIÓN COMPLETA CORREGIDA
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
        card.onclick = () => {
            speak(c.es, 'es');
            if (!APP.colDone.has(c.id) && APP.user) {
                APP.colDone.add(c.id);
                addStars(5, card);
                card.innerHTML += '<div class="lc-completed">✅</div>';
                showToast('🎉 ¡Aprendiste el color ' + c.es + '! +5 ⭐', 'warning');
            }
        };
        grid.appendChild(card);
    });
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
        card.onclick = () => {
            speak(v.es, 'es');
            showToast('🔤 Vocal ' + v.es + ' - ' + v.word_es, 'warning');
        };
        grid.appendChild(card);
    });
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
            showToast('🔤 Letra ' + a.l + ' · en inglés: ' + a.en, 'warning');
            addStars(1, card);
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
        card.onclick = () => {
            speak(n.es + '... ' + n.n, 'es');
            showToast('🔢 Número ' + n.n + ' - ' + n.es, 'warning');
            addStars(2, card);
        };
        grid.appendChild(card);
    });
}

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
        card.onclick = () => {
            speak(a.es + '... ' + a.sound, 'es');
            showToast('🐾 ' + a.es + ' - ' + a.sound, 'warning');
            addStars(2, card);
        };
        grid.appendChild(card);
    });
}

// ============================================
// RENDER: GEOMETRÍA
// ============================================
export function renderGeometry() {
    const grid = document.getElementById('geometry-list');
    if (!grid) return;
    grid.innerHTML = '';
    GEOMETRY.forEach(g => {
        const card = document.createElement('div');
        card.className = 'lesson-card';
        card.style.background = g.bg;
        card.innerHTML = `
            <span class="lc-emoji">${g.emoji}</span>
            <div class="lc-word">${g.nombre}</div>
            <div class="lc-en">${g.lados} lados</div>
        `;
        card.onclick = () => {
            speak(g.nombre + ' tiene ' + g.lados + ' lados', 'es');
            showToast('🔺 ' + g.nombre + ' - ' + g.lados + ' lados', 'warning');
            addStars(2, card);
        };
        grid.appendChild(card);
    });
}

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
        showToast('😅 No tienes suficientes monedas', 'error');
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
}

// ============================================
// RENDER: CUENTOS
// ============================================
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
        card.onclick = () => {
            showToast('📖 ' + c.titulo + ' - Próximamente', 'warning');
        };
        list.appendChild(card);
    });
}

// ============================================
// RENDER: DIBUJOS
// ============================================
export function renderCartoons() {
    const area = document.getElementById('cartoons-area');
    if (!area) return;
    
    area.innerHTML = `
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:16px;margin-bottom:16px">
            ${CARTOONS.map(v => `
                <div style="background:#fff;border-radius:16px;overflow:hidden;cursor:pointer;border:3px solid #eee;transition:all 0.3s">
                    <img src="https://img.youtube.com/vi/${v.video_id}/0.jpg" alt="${v.titulo}" style="width:100%;aspect-ratio:16/9;object-fit:cover">
                    <div style="padding:12px">
                        <div style="font-size:14px;font-weight:900;color:#2d2d2d">${v.titulo}</div>
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:4px">
                            <span style="font-size:10px;color:#888;text-transform:capitalize">${v.categoria}</span>
                        </div>
                    </div>
                </div>
            `).join('')}
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
        <div class="math-container">
            <div style="font-size:18px;font-weight:900;opacity:0.9">🧮 ${type === 'suma' ? 'Sumas' : type === 'resta' ? 'Restas' : 'Mixto'}</div>
            <div style="font-size:24px;margin:16px 0">Próximamente</div>
            <button class="flag-btn" style="background:rgba(255,255,255,0.2);color:#fff;border:2px solid rgba(255,255,255,0.3)" onclick="window.showToast('🧮 Matemáticas - Próximamente')">
                Jugar
            </button>
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
        <div class="reading-container">
            <div style="font-size:18px;font-weight:900;color:#2d2d2d">📚 Aprender a Leer</div>
            <div style="font-size:24px;margin:16px 0;color:#666">Próximamente</div>
            <button class="flag-btn" style="background:#4A90E2;color:#fff" onclick="window.showToast('📚 Lectura - Próximamente')">
                Jugar
            </button>
        </div>
    `;
}

// ============================================
// JUEGOS
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
// FUNCIONES PLACEHOLDER
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
export function spinWheel() { console.log('spinWheel'); }
export function guessLetter() { console.log('guessLetter'); }
export function checkTriviaAnswer() { console.log('checkTriviaAnswer'); }

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

function renderSectionContent(id) {
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
        case 'juegos': break;
        case 'cuentos': renderCuentos(); break;
        case 'cartoons': renderCartoons(); break;
    }
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
        renderAllSections();
        showSection('colores');
    } else {
        document.getElementById('login-screen').style.display = 'flex';
        document.getElementById('app-content').style.display = 'none';
    }
}

// ============================================
// EXPORTAR TODO
// ============================================
export { APP };
