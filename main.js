// js/main.js - VERSIÓN COMPLETA CON TODOS LOS JUEGOS
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
            showStory(c);
        };
        list.appendChild(card);
    });
}

let currentStoryIndex = 0;
let currentStory = null;

function showStory(story) {
    currentStory = story;
    currentStoryIndex = 0;
    renderStoryScene();
}

function renderStoryScene() {
    const viewer = document.getElementById('story-viewer');
    if (!viewer) return;
    
    viewer.classList.remove('hidden');
    const scene = currentStory.escenas[currentStoryIndex];
    
    viewer.innerHTML = `
        <div style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);border-radius:24px;padding:24px;color:#fff;min-height:200px;display:flex;flex-direction:column;justify-content:space-between">
            <div>
                <div style="font-size:14px;font-weight:700;opacity:0.7">${currentStory.titulo}</div>
                <div style="font-size:48px;text-align:center;margin:16px 0">${scene.match(/^.{1,2}/)?.[0] || '📖'}</div>
                <div style="font-size:20px;font-weight:900;text-align:center;line-height:1.6">${scene}</div>
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-top:16px">
                <div style="font-size:12px;opacity:0.7">${currentStoryIndex + 1} / ${currentStory.escenas.length}</div>
                <div style="display:flex;gap:8px">
                    ${currentStoryIndex > 0 ? `<button onclick="window.storyPrev()" style="padding:8px 20px;border-radius:50px;border:2px solid rgba(255,255,255,0.3);background:transparent;color:#fff;font-weight:900;cursor:pointer;font-family:'Nunito',sans-serif">⬅️</button>` : ''}
                    ${currentStoryIndex < currentStory.escenas.length - 1 ? `<button onclick="window.storyNext()" style="padding:8px 20px;border-radius:50px;border:2px solid rgba(255,255,255,0.3);background:transparent;color:#fff;font-weight:900;cursor:pointer;font-family:'Nunito',sans-serif">➡️</button>` : `<button onclick="window.closeStory()" style="padding:8px 20px;border-radius:50px;border:2px solid rgba(255,255,255,0.3);background:transparent;color:#fff;font-weight:900;cursor:pointer;font-family:'Nunito',sans-serif">✅ Leído</button>`}
                </div>
            </div>
        </div>
    `;
}

window.storyNext = function() {
    if (currentStory && currentStoryIndex < currentStory.escenas.length - 1) {
        currentStoryIndex++;
        renderStoryScene();
    }
};

window.storyPrev = function() {
    if (currentStory && currentStoryIndex > 0) {
        currentStoryIndex--;
        renderStoryScene();
    }
};

window.closeStory = function() {
    const viewer = document.getElementById('story-viewer');
    if (viewer) {
        viewer.classList.add('hidden');
        viewer.innerHTML = '';
        addStars(10);
        showToast('📖 ¡Cuento completado! +10 ⭐', 'warning');
    }
};

// ============================================
// RENDER: DIBUJOS
// ============================================
export function renderCartoons() {
    const area = document.getElementById('cartoons-area');
    if (!area) return;
    
    area.innerHTML = `
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:16px;margin-bottom:16px">
            ${CARTOONS.map(v => `
                <div style="background:#fff;border-radius:16px;overflow:hidden;cursor:pointer;border:3px solid #eee;transition:all 0.3s;hover:transform:scale(1.03);hover:border-color:#4A90E2" onclick="window.openVideo('${v.video_id}','${v.titulo}')">
                    <img src="https://img.youtube.com/vi/${v.video_id}/0.jpg" alt="${v.titulo}" style="width:100%;aspect-ratio:16/9;object-fit:cover">
                    <div style="padding:12px">
                        <div style="font-size:14px;font-weight:900;color:#2d2d2d">${v.titulo}</div>
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:4px">
                            <span style="font-size:10px;color:#888;text-transform:capitalize">${v.categoria}</span>
                            <button onclick="event.stopPropagation();window.toggleFavorite('${v.id}')" style="background:none;border:none;font-size:20px;cursor:pointer">❤️</button>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

window.openVideo = function(videoId, titulo) {
    const area = document.getElementById('cartoons-area');
    if (!area) return;
    
    // Cerrar video si ya está abierto
    const existing = document.getElementById('video-player');
    if (existing) {
        existing.remove();
        return;
    }
    
    const player = document.createElement('div');
    player.id = 'video-player';
    player.style.cssText = 'margin-bottom:16px';
    player.innerHTML = `
        <div style="background:#000;border-radius:16px;overflow:hidden;position:relative">
            <iframe src="https://www.youtube.com/embed/${videoId}?autoplay=1" 
                    style="width:100%;aspect-ratio:16/9;border:none" 
                    allow="autoplay; encrypted-media" 
                    allowfullscreen>
            </iframe>
            <button onclick="window.closeVideo()" 
                    style="position:absolute;top:10px;right:10px;background:rgba(0,0,0,0.7);color:#fff;border:none;border-radius:50%;width:36px;height:36px;font-size:20px;cursor:pointer">
                ✕
            </button>
        </div>
        <div style="padding:8px 0;font-weight:900;font-size:16px;color:#2d2d2d">🎬 ${titulo}</div>
    `;
    
    area.prepend(player);
    addStars(2);
};

window.closeVideo = function() {
    const player = document.getElementById('video-player');
    if (player) player.remove();
};

window.toggleFavorite = function(videoId) {
    if (APP.favorites.has(videoId)) {
        APP.favorites.delete(videoId);
        showToast('💔 Eliminado de favoritos', 'warning');
    } else {
        APP.favorites.add(videoId);
        showToast('❤️ Agregado a favoritos', 'warning');
    }
};

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
    
    const emojis = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮'];
    const selectedEmojis = emojis.slice(0, 8);
    const deck = [...selectedEmojis, ...selectedEmojis];
    
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    
    memoryCards = deck;
    memoryFlipped = [];
    memoryMatched = [];
    memoryLocked = false;
    
    area.innerHTML = `
        <div style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);border-radius:24px;padding:24px;color:#fff">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;flex-wrap:wrap;gap:8px">
                <h3 style="margin:0">🧩 Memory Match</h3>
                <div style="font-size:14px;font-weight:900">Parejas: <span id="memory-score">0</span>/8</div>
            </div>
            <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;max-width:400px;margin:0 auto">
                ${deck.map((emoji, index) => `
                    <div class="memory-card" data-index="${index}" 
                         style="aspect-ratio:1;background:rgba(255,255,255,0.2);border-radius:16px;display:flex;align-items:center;justify-content:center;font-size:36px;cursor:pointer;border:3px solid rgba(255,255,255,0.1);transition:all 0.3s"
                         onclick="window.flipCard(${index})">
                        <span style="opacity:0;transition:opacity 0.3s">${emoji}</span>
                    </div>
                `).join('')}
            </div>
            <div style="display:flex;justify-content:center;gap:10px;margin-top:16px;flex-wrap:wrap">
                <button onclick="window.startMatchGame()" 
                        style="padding:10px 30px;border-radius:50px;border:2px solid rgba(255,255,255,0.3);background:rgba(255,255,255,0.1);color:#fff;font-weight:900;cursor:pointer;font-family:'Nunito',sans-serif">
                    🔄 Reiniciar
                </button>
                <button onclick="window.closeGame()" 
                        style="padding:10px 30px;border-radius:50px;border:2px solid rgba(255,255,255,0.3);background:rgba(255,255,255,0.1);color:#fff;font-weight:900;cursor:pointer;font-family:'Nunito',sans-serif">
                    ✕ Cerrar
                </button>
            </div>
            <div id="memory-message" style="margin-top:12px;font-weight:700;min-height:24px;text-align:center"></div>
        </div>
    `;
}

window.flipCard = function(index) {
    if (memoryLocked) return;
    if (memoryFlipped.includes(index)) return;
    if (memoryMatched.includes(index)) return;
    
    const card = document.querySelector(`.memory-card[data-index="${index}"]`);
    const emoji = memoryCards[index];
    
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
            if (score) score.textContent = memoryMatched.length / 2;
            
            if (memoryMatched.length === memoryCards.length) {
                document.getElementById('memory-message').textContent = '🎉 ¡Ganaste! +20 ⭐';
                addStars(20);
                addCoins(10);
                showToast('🎉 ¡Completaste el Memory! +20 ⭐ +10 🪙', 'warning');
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
        { nombre: 'Rojo', bg: '#E74C3C' },
        { nombre: 'Azul', bg: '#3498DB' },
        { nombre: 'Verde', bg: '#27AE60' },
        { nombre: 'Amarillo', bg: '#F1C40F' },
        { nombre: 'Naranja', bg: '#E67E22' },
        { nombre: 'Morado', bg: '#9B59B6' },
        { nombre: 'Rosa', bg: '#E91E8C' },
        { nombre: 'Celeste', bg: '#56CCF2' }
    ];
    
    colorGameRound++;
    const correct = colors[Math.floor(Math.random() * colors.length)];
    const options = [correct];
    
    const shuffled = colors.filter(c => c.nombre !== correct.nombre);
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
    
    area.innerHTML = `
        <div style="background:linear-gradient(135deg,#f093fb 0%,#f5576c 100%);border-radius:24px;padding:24px;color:#fff;text-align:center">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;flex-wrap:wrap;gap:8px">
                <div style="font-size:48px">🎯</div>
                <div style="font-size:14px;font-weight:900">Ronda ${colorGameRound} · Puntaje: ${colorGameScore}</div>
            </div>
            <h3 style="margin:0">¿Qué color es este?</h3>
            <div style="width:120px;height:120px;border-radius:50%;margin:16px auto;border:4px solid rgba(255,255,255,0.3);background:${correct.bg};transition:transform 0.3s;hover:transform:scale(1.05)"></div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;max-width:300px;margin:0 auto">
                ${options.map(opt => `
                    <button onclick="window.checkColorAnswer('${opt.nombre}','${correct.nombre}')" 
                            style="padding:14px;border-radius:14px;border:3px solid rgba(255,255,255,0.3);background:rgba(255,255,255,0.1);color:#fff;font-size:18px;font-weight:900;cursor:pointer;font-family:'Nunito',sans-serif;transition:all 0.3s;hover:transform:scale(1.05)">
                        ${opt.nombre}
                    </button>
                `).join('')}
            </div>
            <div style="display:flex;justify-content:center;gap:10px;margin-top:16px;flex-wrap:wrap">
                <button onclick="window.startColorGame()" 
                        style="padding:10px 30px;border-radius:50px;border:2px solid rgba(255,255,255,0.3);background:rgba(255,255,255,0.1);color:#fff;font-weight:900;cursor:pointer;font-family:'Nunito',sans-serif">
                    🔄 Reiniciar
                </button>
                <button onclick="window.closeGame()" 
                        style="padding:10px 30px;border-radius:50px;border:2px solid rgba(255,255,255,0.3);background:rgba(255,255,255,0.1);color:#fff;font-weight:900;cursor:pointer;font-family:'Nunito',sans-serif">
                    ✕ Cerrar
                </button>
            </div>
            <div id="color-message" style="margin-top:12px;font-weight:700;min-height:24px"></div>
        </div>
    `;
}

window.checkColorAnswer = function(selected, correct) {
    const message = document.getElementById('color-message');
    if (!message) return;
    
    if (selected === correct) {
        colorGameScore += 10;
        message.textContent = '✅ ¡Correcto! +10 ⭐';
        message.style.color = '#6FCF97';
        addStars(10);
        showToast('✅ ¡Correcto! +10 ⭐', 'warning');
        setTimeout(playColorRound, 1000);
    } else {
        message.textContent = `❌ Era ${correct}`;
        message.style.color = '#EB5757';
        setTimeout(() => {
            if (colorGameScore > 0) colorGameScore -= 5;
            playColorRound();
        }, 1500);
    }
};

// ============================================
// JUEGO 3: ORDENA LOS NÚMEROS
// ============================================
let numberOrder = [];
let numberSelected = [];

export function startNumberGame() {
    const area = document.getElementById('game-area');
    if (!area) return;
    
    const numbers = Array.from({length: 10}, (_, i) => i + 1);
    numberOrder = [];
    numberSelected = [];
    
    for (let i = numbers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
    }
    
    area.innerHTML = `
        <div style="background:linear-gradient(135deg,#2C3E50 0%,#3498DB 100%);border-radius:24px;padding:24px;color:#fff;text-align:center">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;flex-wrap:wrap;gap:8px">
                <div style="font-size:48px">🔢</div>
                <div style="font-size:14px;font-weight:900">Orden: <span id="num-progress">0</span>/10</div>
            </div>
            <h3 style="margin:0">Ordena los números del 1 al 10</h3>
            <p style="font-size:14px;opacity:0.8;margin:8px 0">Toca los números en orden</p>
            <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:8px;max-width:350px;margin:16px auto">
                ${numbers.map(n => `
                    <div class="num-game-card" data-num="${n}" 
                         style="background:rgba(255,255,255,0.2);border-radius:12px;padding:16px;font-size:28px;font-weight:900;cursor:pointer;border:3px solid rgba(255,255,255,0.1);transition:all 0.3s;hover:transform:scale(1.08)"
                         onclick="window.selectNumber(${n})">
                        ${n}
                    </div>
                `).join('')}
            </div>
            <div style="display:flex;justify-content:center;gap:10px;margin-top:16px;flex-wrap:wrap">
                <button onclick="window.startNumberGame()" 
                        style="padding:10px 30px;border-radius:50px;border:2px solid rgba(255,255,255,0.3);background:rgba(255,255,255,0.1);color:#fff;font-weight:900;cursor:pointer;font-family:'Nunito',sans-serif">
                    🔄 Reiniciar
                </button>
                <button onclick="window.closeGame()" 
                        style="padding:10px 30px;border-radius:50px;border:2px solid rgba(255,255,255,0.3);background:rgba(255,255,255,0.1);color:#fff;font-weight:900;cursor:pointer;font-family:'Nunito',sans-serif">
                    ✕ Cerrar
                </button>
            </div>
            <div id="num-message" style="margin-top:12px;font-weight:700;min-height:24px"></div>
        </div>
    `;
}

window.selectNumber = function(n) {
    const expected = numberSelected.length + 1;
    const card = document.querySelector(`.num-game-card[data-num="${n}"]`);
    const message = document.getElementById('num-message');
    const progress = document.getElementById('num-progress');
    
    if (!card) return;
    if (card.style.opacity === '0.3') return;
    
    if (n === expected) {
        numberSelected.push(n);
        card.style.background = '#6FCF97';
        card.style.opacity = '0.3';
        card.style.cursor = 'default';
        if (progress) progress.textContent = numberSelected.length;
        
        if (numberSelected.length === 10) {
            message.textContent = '🎉 ¡Ordenaste todos los números! +20 ⭐';
            message.style.color = '#6FCF97';
            addStars(20);
            addCoins(10);
            showToast('🎉 ¡Completaste el orden! +20 ⭐ +10 🪙', 'warning');
        } else {
            message.textContent = `✅ Bien! Sigue con el ${expected + 1}`;
            message.style.color = '#6FCF97';
        }
    } else {
        message.textContent = `❌ Debería ser ${expected}`;
        message.style.color = '#EB5757';
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
    
    const premios = [
        { icon: '⭐', nombre: '10 Estrellas', valor: 10 },
        { icon: '🪙', nombre: '5 Monedas', valor: 5 },
        { icon: '⭐', nombre: '20 Estrellas', valor: 20 },
        { icon: '🪙', nombre: '10 Monedas', valor: 10 },
        { icon: '⭐', nombre: '5 Estrellas', valor: 5 },
        { icon: '🎯', nombre: '¡Nada!', valor: 0 },
        { icon: '⭐', nombre: '15 Estrellas', valor: 15 },
        { icon: '🪙', nombre: '15 Monedas', valor: 15 }
    ];
    
    area.innerHTML = `
        <div style="background:linear-gradient(135deg,#FF6B6B 0%,#FFE66D 100%);border-radius:24px;padding:24px;color:#2d2d2d;text-align:center">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;flex-wrap:wrap;gap:8px">
                <div style="font-size:48px">🎡</div>
                <div style="font-size:14px;font-weight:900">¡Gira y gana!</div>
            </div>
            <div class="wheel-spin" id="wheel-icon" style="font-size:100px;cursor:pointer;transition:transform 0.1s;user-select:none" onclick="window.spinWheel()">
                🎡
            </div>
            <div id="wheel-result" style="font-size:24px;font-weight:900;margin-top:16px;min-height:60px">Toca la ruleta para girar</div>
            <div style="display:flex;justify-content:center;gap:10px;margin-top:16px;flex-wrap:wrap">
                <button onclick="window.closeGame()" 
                        style="padding:10px 30px;border-radius:50px;border:2px solid rgba(0,0,0,0.2);background:rgba(255,255,255,0.5);color:#2d2d2d;font-weight:900;cursor:pointer;font-family:'Nunito',sans-serif">
                    ✕ Cerrar
                </button>
            </div>
        </div>
    `;
    
    window._premios = premios;
}

window.spinWheel = function() {
    if (wheelSpinning) return;
    wheelSpinning = true;
    
    const wheel = document.getElementById('wheel-icon');
    const result = document.getElementById('wheel-result');
    const premios = window._premios || [];
    
    if (!wheel || !result) return;
    
    // Animación de giro
    let rotations = 0;
    const interval = setInterval(() => {
        rotations += 10;
        wheel.style.transform = `rotate(${rotations}deg)`;
    }, 50);
    
    // Resultado después de 3 segundos
    setTimeout(() => {
        clearInterval(interval);
        const premio = premios[Math.floor(Math.random() * premios.length)];
        
        // Animación final
        const finalRotation = rotations + Math.floor(Math.random() * 360) + 360;
        wheel.style.transition = 'transform 0.5s ease-out';
        wheel.style.transform = `rotate(${finalRotation}deg)`;
        
        setTimeout(() => {
            if (premio.valor > 0) {
                if (premio.icon === '⭐') {
                    addStars(premio.valor);
                    result.innerHTML = `🎉 ¡Ganaste ${premio.valor} ⭐!`;
                    showToast(`🎉 ¡Ganaste ${premio.valor} ⭐!`, 'warning');
                } else {
                    addCoins(premio.valor);
                    result.innerHTML = `🎉 ¡Ganaste ${premio.valor} 🪙!`;
                    showToast(`🎉 ¡Ganaste ${premio.valor} 🪙!`, 'warning');
                }
            } else {
                result.innerHTML = '😅 ¡Sigue participando!';
                showToast('😅 ¡Sigue participando!', 'warning');
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
let hangmanMaxTries = 6;

export function startHangmanGame() {
    const area = document.getElementById('game-area');
    if (!area) return;
    
    const palabras = ['GATO', 'PERRO', 'CASA', 'SOL', 'LUNA', 'MAR', 'NUBE', 'FLOR', 'TREN', 'SER', 'CIELO', 'AGUA', 'FUEGO', 'TIERRA'];
    hangmanWord = palabras[Math.floor(Math.random() * palabras.length)];
    hangmanGuessed = [];
    hangmanWrong = [];
    hangmanMaxTries = 6;
    
    renderHangman();
}

function renderHangman() {
    const area = document.getElementById('game-area');
    if (!area) return;
    
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    const wordDisplay = hangmanWord.split('').map(l => 
        hangmanGuessed.includes(l) ? l : '_'
    ).join(' ');
    
    area.innerHTML = `
        <div style="background:linear-gradient(135deg,#2C3E50 0%,#3498DB 100%);border-radius:24px;padding:24px;color:#fff;text-align:center">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;flex-wrap:wrap;gap:8px">
                <div style="font-size:48px">🪢</div>
                <div style="font-size:14px;font-weight:900">Intentos: ${hangmanMaxTries - hangmanWrong.length}</div>
            </div>
            <div style="font-size:32px;font-weight:900;letter-spacing:8px;margin:16px 0;font-family:monospace">${wordDisplay}</div>
            <div style="display:flex;justify-content:center;gap:4px;flex-wrap:wrap;max-width:400px;margin:0 auto">
                ${letters.map(l => `
                    <button class="hangman-letter-btn" data-letter="${l}" 
                            style="padding:8px 12px;border-radius:8px;border:2px solid rgba(255,255,255,0.3);background:${hangmanGuessed.includes(l) ? '#6FCF97' : hangmanWrong.includes(l) ? '#EB5757' : 'rgba(255,255,255,0.1)'};color:#fff;font-size:18px;font-weight:900;cursor:${hangmanGuessed.includes(l) || hangmanWrong.includes(l) ? 'not-allowed' : 'pointer'};font-family:'Nunito',sans-serif;transition:all 0.3s;hover:transform:scale(1.1)"
                            onclick="${hangmanGuessed.includes(l) || hangmanWrong.includes(l) ? '' : `window.guessLetter('${l}')`}">
                        ${l}
                    </button>
                `).join('')}
            </div>
            <div id="hangman-status" style="margin-top:16px;font-weight:700;min-height:30px"></div>
            <div style="display:flex;justify-content:center;gap:10px;margin-top:16px;flex-wrap:wrap">
                <button onclick="window.startHangmanGame()" 
                        style="padding:10px 30px;border-radius:50px;border:2px solid rgba(255,255,255,0.3);background:rgba(255,255,255,0.1);color:#fff;font-weight:900;cursor:pointer;font-family:'Nunito',sans-serif">
                    🔄 Nueva palabra
                </button>
                <button onclick="window.closeGame()" 
                        style="padding:10px 30px;border-radius:50px;border:2px solid rgba(255,255,255,0.3);background:rgba(255,255,255,0.1);color:#fff;font-weight:900;cursor:pointer;font-family:'Nunito',sans-serif">
                    ✕ Cerrar
                </button>
            </div>
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
        
        // Verificar si ganó
        const allGuessed = hangmanWord.split('').every(l => hangmanGuessed.includes(l));
        if (allGuessed) {
            status.textContent = '🎉 ¡Ganaste! +20 ⭐';
            addStars(20);
            addCoins(10);
            showToast('🎉 ¡Ganaste el Ahorcado! +20 ⭐ +10 🪙', 'warning');
        }
    } else {
        hangmanWrong.push(letter);
        const remaining = hangmanMaxTries - hangmanWrong.length;
        status.textContent = `❌ Letra incorrecta. Te quedan ${remaining} intentos`;
        status.style.color = '#EB5757';
        
        if (remaining === 0) {
            status.textContent = `💀 Perdiste. La palabra era: ${hangmanWord}`;
            showToast(`💀 Perdiste. Era: ${hangmanWord}`, 'error');
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
        { pregunta: '¿Qué color es el cielo?', opciones: ['Rojo', 'Azul', 'Verde', 'Amarillo'], correcta: 1 },
        { pregunta: '¿Cuántas patas tiene un perro?', opciones: ['2', '3', '4', '5'], correcta: 2 },
        { pregunta: '¿Qué animal dice "Miau"?', opciones: ['Perro', 'Gato', 'Vaca', 'Pato'], correcta: 1 },
        { pregunta: '¿Cuánto es 2 + 3?', opciones: ['3', '4', '5', '6'], correcta: 2 },
        { pregunta: '¿Qué forma tiene una pelota?', opciones: ['Cuadrado', 'Círculo', 'Triángulo', 'Rectángulo'], correcta: 1 },
        { pregunta: '¿Qué animal tiene trompa?', opciones: ['Gato', 'Perro', 'Elefante', 'Conejo'], correcta: 2 },
        { pregunta: '¿Cuánto es 5 - 2?', opciones: ['2', '3', '4', '5'], correcta: 1 },
        { pregunta: '¿Qué color es la nieve?', opciones: ['Rojo', 'Azul', 'Blanco', 'Negro'], correcta: 2 }
    ];
    
    // Mezclar preguntas
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
            <div style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);border-radius:24px;padding:24px;color:#fff;text-align:center">
                <div style="font-size:64px">🏆</div>
                <h2>¡Trivia Completada!</h2>
                <p style="font-size:24px;font-weight:900">Puntaje: ${triviaScore} / ${triviaQuestions.length}</p>
                <p style="font-size:14px;opacity:0.8">${triviaScore === triviaQuestions.length ? '🎉 ¡Perfecto! Eres un genio!' : '¡Sigue practicando!'}</p>
                <button onclick="window.startTriviaGame()" 
                        style="margin-top:16px;padding:12px 40px;border-radius:50px;border:2px solid rgba(255,255,255,0.3);background:rgba(255,255,255,0.1);color:#fff;font-weight:900;cursor:pointer;font-family:'Nunito',sans-serif">
                    🔄 Jugar de nuevo
                </button>
                <button onclick="window.closeGame()" 
                        style="margin-left:10px;padding:12px 40px;border-radius:50px;border:2px solid rgba(255,255,255,0.3);background:rgba(255,255,255,0.1);color:#fff;font-weight:900;cursor:pointer;font-family:'Nunito',sans-serif">
                    ✕ Cerrar
                </button>
            </div>
        `;
        return;
    }
    
    const q = triviaQuestions[triviaIndex];
    const total = triviaQuestions.length;
    
    area.innerHTML = `
        <div style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);border-radius:24px;padding:24px;color:#fff;text-align:center">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;flex-wrap:wrap;gap:8px">
                <div style="font-size:48px">🧠</div>
                <div style="font-size:14px;font-weight:900">Pregunta ${triviaIndex + 1}/${total} · Puntaje: ${triviaScore}</div>
            </div>
            <h3 style="margin:0;font-size:24px">${q.pregunta}</h3>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;max-width:400px;margin:16px auto">
                ${q.opciones.map((opt, idx) => `
                    <button onclick="window.checkTriviaAnswer(${idx}, ${q.correcta})" 
                            style="padding:16px;border-radius:14px;border:3px solid rgba(255,255,255,0.3);background:rgba(255,255,255,0.1);color:#fff;font-size:18px;font-weight:900;cursor:pointer;font-family:'Nunito',sans-serif;transition:all 0.3s;hover:transform:scale(1.05)">
                        ${opt}
                    </button>
                `).join('')}
            </div>
            <div style="display:flex;justify-content:center;gap:10px;margin-top:16px;flex-wrap:wrap">
                <button onclick="window.closeGame()" 
                        style="padding:10px 30px;border-radius:50px;border:2px solid rgba(255,255,255,0.3);background:rgba(255,255,255,0.1);color:#fff;font-weight:900;cursor:pointer;font-family:'Nunito',sans-serif">
                    ✕ Cerrar
                </button>
            </div>
            <div id="trivia-message" style="margin-top:12px;font-weight:700;min-height:24px"></div>
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
        message.textContent = `❌ La respuesta correcta era: ${triviaQuestions[triviaIndex].opciones[correct]}`;
        message.style.color = '#EB5757';
    }
    
    setTimeout(() => {
        triviaIndex++;
        showTriviaQuestion();
    }, 1500);
};

// ============================================
// JUEGO 7: MATEMÁTICAS (Sumas y Restas)
// ============================================
export function startMath(type) {
    const area = document.getElementById('math-area');
    if (!area) return;
    
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    let operador, resultado, texto;
    
    if (type === 'suma' || (type === 'mixto' && Math.random() > 0.5)) {
        operador = '+';
        resultado = num1 + num2;
        texto = 'Suma';
    } else {
        operador = '-';
        resultado = num1 - num2;
        if (resultado < 0) {
            // Asegurar que el resultado no sea negativo
            const temp = num1;
            const num1 = num2;
            const num2 = temp;
            resultado = num1 - num2;
        }
        texto = 'Resta';
    }
    
    // Generar opciones (incluyendo la correcta)
    const opciones = [resultado];
    while (opciones.length < 4) {
        const r = resultado + Math.floor(Math.random() * 7) - 3;
        if (!opciones.includes(r) && r >= 0 && r <= 20) {
            opciones.push(r);
        }
    }
    
    // Mezclar opciones
    for (let i = opciones.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [opciones[i], opciones[j]] = [opciones[j], opciones[i]];
    }
    
    area.innerHTML = `
        <div class="math-container" style="background:linear-gradient(135deg,#f093fb 0%,#f5576c 100%);border-radius:24px;padding:24px;color:#fff;text-align:center">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;flex-wrap:wrap;gap:8px">
                <div style="font-size:24px">🧮 ${texto}</div>
                <div style="font-size:14px;font-weight:900">Nivel: ${APP.level || 1}</div>
            </div>
            <div class="math-question" style="font-size:42px;font-weight:900;margin:16px 0">
                ${num1} ${operador} ${num2} = ?
            </div>
            <div class="math-options" style="display:grid;grid-template-columns:repeat(2,1fr);gap:12px;max-width:300px;margin:0 auto">
                ${opciones.map(opt => `
                    <button onclick="window.checkMathAnswer(${opt}, ${resultado})" 
                            style="padding:16px;border-radius:16px;border:3px solid rgba(255,255,255,0.3);background:rgba(255,255,255,0.2);color:#fff;font-size:28px;font-weight:900;cursor:pointer;font-family:'Nunito',sans-serif;transition:all 0.3s;hover:transform:scale(1.05)">
                        ${opt}
                    </button>
                `).join('')}
            </div>
            <div style="display:flex;justify-content:center;gap:10px;margin-top:16px;flex-wrap:wrap">
                <button onclick="window.startMath('${type}')" 
                        style="padding:10px 30px;border-radius:50px;border:2px solid rgba(255,255,255,0.3);background:rgba(255,255,255,0.1);color:#fff;font-weight:900;cursor:pointer;font-family:'Nunito',sans-serif">
                    🔄 Nueva
                </button>
            </div>
            <div id="math-result" style="margin-top:12px;font-weight:900;min-height:30px;font-size:18px"></div>
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
        result.textContent = `❌ La respuesta correcta era: ${correct}`;
        result.style.color = '#EB5757';
    }
};

// ============================================
// CERRAR JUEGO
// ============================================
window.closeGame = function() {
    const area = document.getElementById('game-area');
    if (area) {
        area.innerHTML = '';
        showToast('👋 Juego cerrado', 'warning');
    }
};

// ============================================
// FUNCIONES PLACEHOLDER
// ============================================
export const closeColorDetail = () => {};
export const closeVocalDetail = () => {};
export const closeNumDetail = () => {};
export const closeAnimalDetail = () => {};
export const closeGeometryDetail = () => {};
export const checkColorQuiz = () => {};
export const checkVocalQuiz = () => {};
export const checkNumQuiz = () => {};
export const checkAnimalQuiz = () => {};
export const checkGeometryQuiz = () => {};

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
// LECTURA (placeholder)
// ============================================
export function startReading() {
    const area = document.getElementById('reading-area');
    if (!area) return;
    area.innerHTML = `
        <div class="reading-container" style="background:linear-gradient(135deg,#a8edea 0%,#fed6e3 100%);border-radius:24px;padding:24px;text-align:center">
            <div style="font-size:48px">📚</div>
            <h3 style="color:#2d2d2d">Aprender a Leer</h3>
            <p style="color:#555">Próximamente: Sílabas y palabras</p>
            <div style="margin-top:16px;font-size:24px;color:#888">🔤 ABC</div>
        </div>
    `;
}

// ============================================
// INICIALIZACIÓN - MODO DEMO
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
            console.log('🔓 Modo demo - mostrando contenido');
            APP.user = { id: 'demo', email: 'demo@ciborgkids.com' };
            APP.profile = {
                username: 'Explorador',
                avatar: '🦊',
                coins: 50,
                stars: 0,
                level: 1
            };
            APP.coins = 50;
            APP.stars = 0;
            APP.level = 1;
            showToast('👋 Modo demo - toca para aprender', 'warning');
        }
        
        updateUI();
        renderAllSections();
        showSection('colores');
        
    } catch (error) {
        console.error('❌ Error en initApp:', error);
        showToast('❌ Error al iniciar: ' + error.message, 'error');
    }
}

// ============================================
// EXPORTAR TODO
// ============================================
export { 
    APP,
    initApp,
    showToast,
    addStars,
    addCoins,
    speak,
    showSection,
    renderColors,
    renderVocales,
    renderAlphabet,
    renderNumeros,
    renderAnimales,
    renderGeometry,
    renderAlbum,
    renderShop,
    renderCuentos,
    renderCartoons,
    startMath,
    startReading,
    startMatchGame,
    startColorGame,
    startNumberGame,
    startWheelGame,
    startHangmanGame,
    startTriviaGame,
};
