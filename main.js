// js/main.js - VERSIÓN COMPLETA v5.0
// Sílabas completas + Abecedario inmersivo + Lectura + Álbum/Tienda + Visor
// ============================================
import CONFIG from './config.js';
import {
    initAuth, getUser, getProfile, isAuthenticated,
    isPremium, isAdmin, loginWithGoogle, logout,
    onAuthChange, updateProfile
} from './auth.js';
import {
    ProgressAPI, StickerAPI, StickerCatalogAPI, StorageAPI,
    FavoritesAPI, AdminAPI, supabase
} from './supabase.js';
import soundManager, { playSound } from './sounds.js';

// ============================================
// ESTADO GLOBAL
// ============================================
const APP = {
    user: null,
    profile: null,
    currentSection: 'colores',
    colDone: new Set(),
    stickerCollection: new Set(),
    stickerCatalog: [],
    favorites: new Set(),
    progress: {},
    isPremium: false,
    isAdmin: false,
    coins: 50,
    stars: 0,
    level: 1,
    isDemo: false
};

let currentLanguage = 'es';

// ============================================
// DATOS
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

// ============================================
// SÍLABAS - CARTILLA COMPLETA (22 consonantes)
// ============================================
const SILABAS_TABLA = [
    { consonante: 'B', emoji: '⛵', palabra: 'BARCO',    palabra_en: 'BOAT',      bg: '#E74C3C', silabas: [
        { silaba: 'BA' }, { silaba: 'BE' }, { silaba: 'BI' }, { silaba: 'BO' }, { silaba: 'BU' }
    ]},
    { consonante: 'C', emoji: '🏠', palabra: 'CASA',     palabra_en: 'HOUSE',     bg: '#3498DB', silabas: [
        { silaba: 'CA' }, { silaba: 'CE' }, { silaba: 'CI' }, { silaba: 'CO' }, { silaba: 'CU' }
    ]},
    { consonante: 'D', emoji: '🎲', palabra: 'DADO',     palabra_en: 'DICE',      bg: '#27AE60', silabas: [
        { silaba: 'DA' }, { silaba: 'DE' }, { silaba: 'DI' }, { silaba: 'DO' }, { silaba: 'DU' }
    ]},
    { consonante: 'F', emoji: '🔥', palabra: 'FUEGO',    palabra_en: 'FIRE',      bg: '#E67E22', silabas: [
        { silaba: 'FA' }, { silaba: 'FE' }, { silaba: 'FI' }, { silaba: 'FO' }, { silaba: 'FU' }
    ]},
    { consonante: 'G', emoji: '🐱', palabra: 'GATO',     palabra_en: 'CAT',       bg: '#9B59B6', silabas: [
        { silaba: 'GA' }, { silaba: 'GE' }, { silaba: 'GI' }, { silaba: 'GO' }, { silaba: 'GU' }
    ]},
    { consonante: 'H', emoji: '🍦', palabra: 'HELADO',   palabra_en: 'ICE CREAM', bg: '#E91E8C', silabas: [
        { silaba: 'HA' }, { silaba: 'HE' }, { silaba: 'HI' }, { silaba: 'HO' }, { silaba: 'HU' }
    ]},
    { consonante: 'J', emoji: '🦒', palabra: 'JIRAFA',   palabra_en: 'GIRAFFE',   bg: '#F1C40F', silabas: [
        { silaba: 'JA' }, { silaba: 'JE' }, { silaba: 'JI' }, { silaba: 'JO' }, { silaba: 'JU' }
    ]},
    { consonante: 'K', emoji: '🐨', palabra: 'KOALA',    palabra_en: 'KOALA',     bg: '#56CCF2', silabas: [
        { silaba: 'KA' }, { silaba: 'KE' }, { silaba: 'KI' }, { silaba: 'KO' }, { silaba: 'KU' }
    ]},
    { consonante: 'L', emoji: '🌙', palabra: 'LUNA',     palabra_en: 'MOON',      bg: '#16A085', silabas: [
        { silaba: 'LA' }, { silaba: 'LE' }, { silaba: 'LI' }, { silaba: 'LO' }, { silaba: 'LU' }
    ]},
    { consonante: 'M', emoji: '🖐️', palabra: 'MANO',    palabra_en: 'HAND',      bg: '#E74C3C', silabas: [
        { silaba: 'MA' }, { silaba: 'ME' }, { silaba: 'MI' }, { silaba: 'MO' }, { silaba: 'MU' }
    ]},
    { consonante: 'N', emoji: '🍊', palabra: 'NARANJA',  palabra_en: 'ORANGE',    bg: '#3498DB', silabas: [
        { silaba: 'NA' }, { silaba: 'NE' }, { silaba: 'NI' }, { silaba: 'NO' }, { silaba: 'NU' }
    ]},
    { consonante: 'Ñ', emoji: '🦤', palabra: 'ÑANDÚ',    palabra_en: 'RHEA',      bg: '#27AE60', silabas: [
        { silaba: 'ÑA' }, { silaba: 'ÑE' }, { silaba: 'ÑI' }, { silaba: 'ÑO' }, { silaba: 'ÑU' }
    ]},
    { consonante: 'P', emoji: '🦆', palabra: 'PATO',     palabra_en: 'DUCK',      bg: '#E67E22', silabas: [
        { silaba: 'PA' }, { silaba: 'PE' }, { silaba: 'PI' }, { silaba: 'PO' }, { silaba: 'PU' }
    ]},
    { consonante: 'Q', emoji: '🧀', palabra: 'QUESO',    palabra_en: 'CHEESE',    bg: '#9B59B6', silabas: [
        { silaba: 'QUE' }, { silaba: 'QUI' }
    ]},
    { consonante: 'R', emoji: '🐸', palabra: 'RANA',     palabra_en: 'FROG',      bg: '#E91E8C', silabas: [
        { silaba: 'RA' }, { silaba: 'RE' }, { silaba: 'RI' }, { silaba: 'RO' }, { silaba: 'RU' }
    ]},
    { consonante: 'S', emoji: '☀️', palabra: 'SOL',     palabra_en: 'SUN',       bg: '#F1C40F', silabas: [
        { silaba: 'SA' }, { silaba: 'SE' }, { silaba: 'SI' }, { silaba: 'SO' }, { silaba: 'SU' }
    ]},
    { consonante: 'T', emoji: '☕', palabra: 'TAZA',     palabra_en: 'CUP',       bg: '#56CCF2', silabas: [
        { silaba: 'TA' }, { silaba: 'TE' }, { silaba: 'TI' }, { silaba: 'TO' }, { silaba: 'TU' }
    ]},
    { consonante: 'V', emoji: '🐮', palabra: 'VACA',     palabra_en: 'COW',       bg: '#16A085', silabas: [
        { silaba: 'VA' }, { silaba: 'VE' }, { silaba: 'VI' }, { silaba: 'VO' }, { silaba: 'VU' }
    ]},
    { consonante: 'W', emoji: '📶', palabra: 'WIFI',     palabra_en: 'WIFI',      bg: '#E74C3C', silabas: [
        { silaba: 'WA' }, { silaba: 'WE' }, { silaba: 'WI' }, { silaba: 'WO' }, { silaba: 'WU' }
    ]},
    { consonante: 'X', emoji: '🎶', palabra: 'XILÓFONO', palabra_en: 'XYLOPHONE', bg: '#3498DB', silabas: [
        { silaba: 'XA' }, { silaba: 'XE' }, { silaba: 'XI' }, { silaba: 'XO' }, { silaba: 'XU' }
    ]},
    { consonante: 'Y', emoji: '🛥️', palabra: 'YATE',    palabra_en: 'YACHT',     bg: '#27AE60', silabas: [
        { silaba: 'YA' }, { silaba: 'YE' }, { silaba: 'YI' }, { silaba: 'YO' }, { silaba: 'YU' }
    ]},
    { consonante: 'Z', emoji: '👟', palabra: 'ZAPATO',   palabra_en: 'SHOE',      bg: '#E67E22', silabas: [
        { silaba: 'ZA' }, { silaba: 'ZE' }, { silaba: 'ZI' }, { silaba: 'ZO' }, { silaba: 'ZU' }
    ]}
];

const SILABAS = [];
SILABAS_TABLA.forEach(grupo => {
    grupo.silabas.forEach(s => {
        SILABAS.push({
            id: s.silaba.toLowerCase(),
            silaba: s.silaba,
            consonante: grupo.consonante,
            vocal: s.silaba.slice(-1),
            emoji: grupo.emoji,
            palabra: grupo.palabra,
            palabra_en: grupo.palabra_en,
            bg: grupo.bg
        });
    });
});

// ============================================
// ABECEDARIO INMERSIVO
// ============================================
const ALPHABET_WORDS = [
    { l: 'A', word: 'ÁGUILA',   emoji: '🦅', bg: '#E74C3C' },
    { l: 'B', word: 'BALLENA',  emoji: '🐳', bg: '#3498DB' },
    { l: 'C', word: 'CASA',     emoji: '🏠', bg: '#27AE60' },
    { l: 'D', word: 'DADO',     emoji: '🎲', bg: '#E67E22' },
    { l: 'E', word: 'ELEFANTE', emoji: '🐘', bg: '#9B59B6' },
    { l: 'F', word: 'FUEGO',    emoji: '🔥', bg: '#E91E8C' },
    { l: 'G', word: 'GATO',     emoji: '🐱', bg: '#F1C40F' },
    { l: 'H', word: 'HELADO',   emoji: '🍦', bg: '#56CCF2' },
    { l: 'I', word: 'IGLÚ',     emoji: '🏔️', bg: '#16A085' },
    { l: 'J', word: 'JIRAFA',   emoji: '🦒', bg: '#E74C3C' },
    { l: 'K', word: 'KOALA',    emoji: '🐨', bg: '#3498DB' },
    { l: 'L', word: 'LUNA',     emoji: '🌙', bg: '#27AE60' },
    { l: 'M', word: 'MANO',     emoji: '🖐️', bg: '#E67E22' },
    { l: 'N', word: 'NARANJA',  emoji: '🍊', bg: '#9B59B6' },
    { l: 'Ñ', word: 'ÑANDÚ',    emoji: '🦤', bg: '#E91E8C' },
    { l: 'O', word: 'OSO',      emoji: '🐻', bg: '#F1C40F' },
    { l: 'P', word: 'PATO',     emoji: '🦆', bg: '#56CCF2' },
    { l: 'Q', word: 'QUESO',    emoji: '🧀', bg: '#16A085' },
    { l: 'R', word: 'RANA',     emoji: '🐸', bg: '#E74C3C' },
    { l: 'S', word: 'SOL',      emoji: '☀️', bg: '#3498DB' },
    { l: 'T', word: 'TAZA',     emoji: '☕', bg: '#27AE60' },
    { l: 'U', word: 'UVA',      emoji: '🍇', bg: '#E67E22' },
    { l: 'V', word: 'VACA',     emoji: '🐮', bg: '#9B59B6' },
    { l: 'W', word: 'WIFI',     emoji: '📶', bg: '#E91E8C' },
    { l: 'X', word: 'XILÓFONO', emoji: '🎶', bg: '#F1C40F' },
    { l: 'Y', word: 'YATE',     emoji: '🛥️', bg: '#56CCF2' },
    { l: 'Z', word: 'ZAPATO',   emoji: '👟', bg: '#16A085' }
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

const STORIES = [
    { id: 'c1', titulo: 'El Dragón y la Estrella', emoji: '🐉⭐', desc: 'Un dragón que quería ser amigo de una estrella fugaz.', escenas: ['🐉 En un castillo lejano vivía un dragón llamado Dino.', '🌠 Dino veía cada noche una estrella brillar en el cielo.', '🤝 Un día, la estrella cayó y Dino la ayudó a volver al cielo.', '✨ Desde entonces, son los mejores amigos del universo.'] },
    { id: 'c2', titulo: 'La Sirenita Aventurera', emoji: '🧜‍♀️🌊', desc: 'Una sirena que exploraba el fondo del mar en busca de tesoros.', escenas: ['🧜‍♀️ Coral era una sirena curiosa que amaba explorar.', '🐠 En su viaje conoció a un pez payaso muy divertido.', '💎 Juntos encontraron un cofre lleno de brillantes tesoros.', '🌈 Y compartieron la alegría con todos los seres del mar.'] },
    { id: 'c3', titulo: 'El Robot y el Gato', emoji: '🤖🐱', desc: 'Un robot y un gato aprenden que la amistad no tiene fronteras.', escenas: ['🤖 En una ciudad futurista, un robot llamado Bolt vivía solo.', '🐱 Un gato callejero se acercó a Bolt y se hicieron amigos.', '🎵 Bailaron juntos al ritmo de la música electrónica.', '❤️ Descubrieron que el cariño no necesita cables ni ladridos.'] }
];

// ============================================
// IDIOMA
// ============================================
export function toggleLanguage() {
    currentLanguage = currentLanguage === 'es' ? 'en' : 'es';
    const btn = document.getElementById('lang-toggle');
    if (btn) btn.textContent = currentLanguage === 'es' ? '🇪🇸 Español' : '🇺🇸 English';
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
// UI
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
    if (!APP.isDemo) {
        try { await updateProfile({ stars: APP.stars }); }
        catch (e) { console.error('Error guardando estrellas:', e); }
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
    if (!APP.isDemo) {
        try { await updateProfile({ coins: APP.coins }); }
        catch (e) { console.error('Error guardando monedas:', e); }
    }
}

export function showSection(id) {
    console.log('📱 Mostrando sección:', id);
    document.querySelectorAll('.section-content').forEach(el => el.classList.add('hidden'));
    const section = document.getElementById('sec-' + id);
    if (section) section.classList.remove('hidden');

    if (id === 'lectura') {
        const activeTab = document.querySelector('.reading-method-tab.active');
        const method = activeTab ? activeTab.dataset.method : 'letra-faltante';
        startReading(method);
    }
    if (id === 'album') renderAlbum();
    if (id === 'tienda') renderShop();
}

// ============================================
// RENDERS
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
            playSound('click');
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
            playSound('click');
        };
        grid.appendChild(card);
    });
}

// ============================================
// RENDER: SÍLABAS - CARTILLA COMPLETA
// ============================================
export function renderSilabas() {
    const container = document.getElementById('silaba-list');
    if (!container) return;

    let html = '<div class="silaba-cartilla">';

    // Header con vocales
    html += `
        <div class="silaba-fila silaba-header">
            <div class="silaba-celda silaba-celda-header silaba-celda-vacia"></div>
            <div class="silaba-celda silaba-celda-header" data-vocal="A">A</div>
            <div class="silaba-celda silaba-celda-header" data-vocal="E">E</div>
            <div class="silaba-celda silaba-celda-header" data-vocal="I">I</div>
            <div class="silaba-celda silaba-celda-header" data-vocal="O">O</div>
            <div class="silaba-celda silaba-celda-header" data-vocal="U">U</div>
        </div>
    `;

    // Filas por consonante
    SILABAS_TABLA.forEach(grupo => {
        html += `
            <div class="silaba-fila">
                <div class="silaba-celda silaba-celda-consonante" style="background:${grupo.bg};">
                    <span class="silaba-consonante-letra">${grupo.consonante}</span>
                    <span class="silaba-consonante-emoji">${grupo.emoji}</span>
                </div>
        `;
        grupo.silabas.forEach(s => {
            html += `
                <div class="silaba-celda silaba-celda-silaba"
                     data-silaba="${s.silaba}"
                     data-palabra="${grupo.palabra}"
                     data-palabra-en="${grupo.palabra_en}"
                     style="background:${grupo.bg};">
                    ${s.silaba}
                </div>
            `;
        });
        html += `</div>`;
    });

    html += '</div>';
    container.innerHTML = html;
    container.classList.add('silaba-grid-cartilla');

    // Click en sílabas
    container.querySelectorAll('.silaba-celda-silaba').forEach(celda => {
        celda.onclick = () => {
            const silaba = celda.dataset.silaba;
            const palabra = celda.dataset.palabra;
            const palabraEn = celda.dataset.palabraEn;

            speakBilingual(`Sílaba ${silaba}. ${palabra}`, `Syllable ${silaba}. ${palabraEn}`);
            showToast(`🔤 ${silaba} · ${palabra}`, 'warning');
            playSound('click');

            celda.style.transform = 'scale(1.18)';
            setTimeout(() => { celda.style.transform = ''; }, 250);

            addStars(2);
        };
    });

    // Click en vocales del header
    container.querySelectorAll('.silaba-celda-header[data-vocal]').forEach(celda => {
        celda.onclick = () => {
            const vocal = celda.dataset.vocal;
            speakBilingual(`Vocal ${vocal}`, `Vowel ${vocal}`);
            playSound('click');
        };
    });
}

// ============================================
// RENDER: ABECEDARIO INMERSIVO
// ============================================
export function renderAlphabet() {
    const grid = document.getElementById('alpha-list');
    if (!grid) return;
    grid.innerHTML = '';
    ALPHABET_WORDS.forEach(a => {
        const card = document.createElement('div');
        card.className = 'alpha-card';
        card.style.background = `linear-gradient(135deg, ${a.bg}, ${a.bg}dd)`;
        card.innerHTML = `
            <span class="letter">${a.l}</span>
            <span class="alpha-emoji">${a.emoji}</span>
            <span class="alpha-word">${a.word}</span>
        `;
        card.onclick = () => {
            speakBilingual(`${a.l} de ${a.word}`, `${a.l} for ${a.word}`);
            showToast(`🔤 ${a.l} · ${a.word}`, 'warning');
            addStars(1, card);
            playSound('click');
            card.style.transform = 'scale(1.15)';
            setTimeout(() => { card.style.transform = ''; }, 250);
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
            playSound('number', n.n);
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
            playSound('click');
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
            playSound('click');
        };
        grid.appendChild(card);
    });
}

// ============================================
// CELEBRATE WIN
// ============================================
export function celebrateWin() {
    playSound('victory');
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999;';
    const canvas = document.createElement('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.cssText = 'width:100%;height:100%;display:block;';
    overlay.appendChild(canvas);
    document.body.appendChild(overlay);
    const ctx = canvas.getContext('2d');
    const colors = ['#FF6B6B', '#FFE66D', '#4ECDC4', '#FF9FF3', '#54A0FF', '#FF9F43', '#00D2D3', '#F368E0', '#FFC312', '#12CBC4'];
    const particles = [];
    for (let i = 0; i < 150; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            size: Math.random() * 8 + 4,
            speedX: (Math.random() - 0.5) * 8,
            speedY: Math.random() * 6 + 4,
            color: colors[Math.floor(Math.random() * colors.length)],
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 10,
            shape: Math.random() > 0.5 ? 'circle' : 'square'
        });
    }
    let frameCount = 0;
    const maxFrames = 180;
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            p.x += p.speedX; p.y += p.speedY; p.rotation += p.rotationSpeed; p.speedY += 0.05;
            if (p.x < 0 || p.x > canvas.width) p.speedX *= -0.8;
            if (p.y > canvas.height + 50) { p.y = -50; p.x = Math.random() * canvas.width; p.speedY = Math.random() * 6 + 4; p.speedX = (Math.random() - 0.5) * 8; }
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rotation * Math.PI / 180);
            ctx.globalAlpha = Math.max(0, 1 - (frameCount / maxFrames));
            ctx.fillStyle = p.color;
            if (p.shape === 'circle') { ctx.beginPath(); ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2); ctx.fill(); }
            else { ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size); }
            ctx.shadowColor = p.color; ctx.shadowBlur = 10;
            ctx.restore();
        });
        frameCount++;
        if (frameCount < maxFrames) requestAnimationFrame(animate);
        else setTimeout(() => { if (overlay.parentNode) overlay.parentNode.removeChild(overlay); }, 300);
    }
    animate();
    window.addEventListener('resize', () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; });
}

export function addLanguageButton() {
    const topbar = document.querySelector('.topbar .tb-right');
    if (!topbar || document.getElementById('lang-toggle')) return;
    const langBtn = document.createElement('div');
    langBtn.id = 'lang-toggle';
    langBtn.className = 'pill';
    langBtn.style.cssText = 'background:rgba(255,255,255,0.25);border:2px solid rgba(255,255,255,0.5);border-radius:50px;padding:5px 12px;color:#fff;font-size:12px;font-weight:900;cursor:pointer;transition:all 0.2s;';
    langBtn.textContent = currentLanguage === 'es' ? '🇪🇸 Español' : '🇺🇸 English';
    langBtn.onclick = toggleLanguage;
    topbar.appendChild(langBtn);
}

// ============================================
// ÁLBUM CON PANEL DE DETALLE
// ============================================
let albumFilter = 'todas';
let albumSelectedId = null;

export async function renderAlbum() {
    const area = document.getElementById('album-area');
    if (!area) return;

    area.innerHTML = `
        <div class="empty-state">
            <div class="emoji">⏳</div>
            <p>Cargando álbum...</p>
        </div>
    `;

    try {
        APP.stickerCatalog = await StickerCatalogAPI.getAll();

        if (!APP.isDemo && APP.user) {
            const myStickers = await StickerAPI.getUserStickers(APP.user.id);
            APP.stickerCollection = new Set(myStickers.map(s => s.sticker_id));
        }

        const total = APP.stickerCatalog.length;
        const collected = APP.stickerCatalog.filter(s => APP.stickerCollection.has(s.id)).length;
        const percent = total > 0 ? Math.round((collected / total) * 100) : 0;

        let filtered = APP.stickerCatalog;
        if (albumFilter !== 'todas') {
            filtered = APP.stickerCatalog.filter(s => s.rareza === albumFilter);
        }

        const selected = albumSelectedId ? filtered.find(s => s.id === albumSelectedId) : null;
        const selectedIndex = selected ? filtered.findIndex(s => s.id === albumSelectedId) : -1;

        area.innerHTML = `
            <div class="album-stats">
                <div class="album-stat">
                    <div class="album-stat-num">${collected}</div>
                    <div class="album-stat-label">Conseguidas</div>
                </div>
                <div class="album-stat">
                    <div class="album-stat-num">${total}</div>
                    <div class="album-stat-label">Total</div>
                </div>
                <div class="album-stat">
                    <div class="album-stat-num">${percent}%</div>
                    <div class="album-stat-label">Completado</div>
                </div>
            </div>

            <div class="prog-wrap">
                <div class="prog-label">
                    <span>Progreso del álbum</span>
                    <span>${collected} / ${total}</span>
                </div>
                <div class="prog-track">
                    <div class="prog-fill" style="width:${percent}%"></div>
                </div>
            </div>

            <div class="filter-bar" id="album-filter-bar">
                <button class="filter-btn ${albumFilter === 'todas' ? 'active' : ''}" data-filter="todas">🎴 Todas</button>
                <button class="filter-btn comun ${albumFilter === 'comun' ? 'active' : ''}" data-filter="comun">⚪ Común</button>
                <button class="filter-btn rara ${albumFilter === 'rara' ? 'active' : ''}" data-filter="rara">🔵 Rara</button>
                <button class="filter-btn epica ${albumFilter === 'epica' ? 'active' : ''}" data-filter="epica">🟣 Épica</button>
                <button class="filter-btn legendaria ${albumFilter === 'legendaria' ? 'active' : ''}" data-filter="legendaria">🟡 Legendaria</button>
            </div>

            ${selected ? `
                <div class="sticker-detail-panel">
                    <button class="sticker-detail-close" id="detail-close" title="Cerrar">✕</button>
                    <button class="sticker-detail-nav sticker-detail-prev ${selectedIndex === 0 ? 'disabled' : ''}" id="detail-prev" title="Anterior">‹</button>
                    <button class="sticker-detail-nav sticker-detail-next ${selectedIndex === filtered.length - 1 ? 'disabled' : ''}" id="detail-next" title="Siguiente">›</button>

                    <div class="sticker-detail-image-wrapper ${APP.stickerCollection.has(selected.id) ? '' : 'locked'}" id="detail-image-wrapper">
                        <img src="${selected.image_url}" alt="${selected.nombre}">
                    </div>

                    <div class="sticker-detail-info">
                        <div class="sticker-detail-name">${selected.nombre}</div>
                        ${selected.descripcion ? `<div class="sticker-detail-desc">${selected.descripcion}</div>` : ''}
                        
                        <div class="sticker-detail-meta">
                            <span class="rarity-badge rarity-${selected.rareza}">${selected.rareza}</span>
                            <span class="detail-chip">🪙 ${selected.precio}</span>
                            <span class="detail-chip">${APP.stickerCollection.has(selected.id) ? '✅ La tenés' : '🔒 No la tenés'}</span>
                        </div>

                        <div class="sticker-detail-actions">
                            <button class="sticker-detail-btn primary" id="detail-view-full">🔍 Ver en grande</button>
                            ${!APP.stickerCollection.has(selected.id) ? `
                                <button class="sticker-detail-btn success" id="detail-buy">🪙 Comprar por ${selected.precio}</button>
                            ` : ''}
                        </div>
                    </div>
                </div>
            ` : ''}

            <div class="stickers-grid-album">
                ${filtered.length === 0 ? `
                    <div class="empty-state" style="grid-column:1/-1;">
                        <div class="emoji">📭</div>
                        <p>No hay figuritas en esta categoría todavía.</p>
                    </div>
                ` : filtered.map(s => {
                    const owned = APP.stickerCollection.has(s.id);
                    return `
                        <div class="sticker-slot ${owned ? 'filled' : 'locked'}" data-id="${s.id}" title="${s.nombre}">
                            ${owned ? `<img src="${s.image_url}" alt="${s.nombre}" loading="lazy">` : ''}
                        </div>
                    `;
                }).join('')}
            </div>
        `;

        area.querySelectorAll('.filter-btn').forEach(btn => {
            btn.onclick = () => { albumFilter = btn.dataset.filter; albumSelectedId = null; renderAlbum(); };
        });

        area.querySelectorAll('.sticker-slot').forEach(slot => {
            slot.onclick = () => {
                albumSelectedId = slot.dataset.id;
                renderAlbum();
                playSound('click');
                setTimeout(() => {
                    const panel = area.querySelector('.sticker-detail-panel');
                    if (panel) panel.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 100);
            };
        });

        const detailClose = document.getElementById('detail-close');
        if (detailClose) detailClose.onclick = () => { albumSelectedId = null; renderAlbum(); };

        const detailPrev = document.getElementById('detail-prev');
        const detailNext = document.getElementById('detail-next');
        if (detailPrev) detailPrev.onclick = () => { if (selectedIndex > 0) { albumSelectedId = filtered[selectedIndex - 1].id; renderAlbum(); playSound('click'); } };
        if (detailNext) detailNext.onclick = () => { if (selectedIndex < filtered.length - 1) { albumSelectedId = filtered[selectedIndex + 1].id; renderAlbum(); playSound('click'); } };

        const detailViewFull = document.getElementById('detail-view-full');
        if (detailViewFull && selected) detailViewFull.onclick = () => openImageViewer(filtered, selectedIndex);

        const detailImageWrapper = document.getElementById('detail-image-wrapper');
        if (detailImageWrapper && selected) {
            detailImageWrapper.onclick = () => {
                if (!APP.stickerCollection.has(selected.id)) { showToast('🔒 Todavía no la tenés. ¡Comprala en la Tienda!', 'error'); return; }
                openImageViewer(filtered, selectedIndex);
            };
        }

        const detailBuy = document.getElementById('detail-buy');
        if (detailBuy && selected) {
            detailBuy.onclick = () => {
                buySticker(selected.id);
                setTimeout(() => { albumSelectedId = selected.id; renderAlbum(); }, 1500);
            };
        }

    } catch (error) {
        console.error('Error cargando álbum:', error);
        area.innerHTML = `
            <div class="empty-state">
                <div class="emoji">❌</div>
                <p>Error al cargar el álbum</p>
                <button onclick="window.renderAlbum && window.renderAlbum()" style="margin-top:12px;padding:10px 24px;border-radius:50px;border:none;background:#4A90E2;color:#fff;font-weight:900;cursor:pointer;font-family:'Nunito',sans-serif;">🔄 Reintentar</button>
            </div>
        `;
    }
}

// ============================================
// TIENDA
// ============================================
let shopFilter = 'todas';

export async function renderShop() {
    const area = document.getElementById('shop-area');
    if (!area) return;

    area.innerHTML = '<div class="empty-state"><div class="emoji">⏳</div><p>Cargando tienda...</p></div>';

    try {
        if (APP.stickerCatalog.length === 0) APP.stickerCatalog = await StickerCatalogAPI.getAll();
        if (!APP.isDemo && APP.user) {
            const myStickers = await StickerAPI.getUserStickers(APP.user.id);
            APP.stickerCollection = new Set(myStickers.map(s => s.sticker_id));
        }

        let filtered = APP.stickerCatalog;
        if (shopFilter !== 'todas') filtered = APP.stickerCatalog.filter(s => s.rareza === shopFilter);

        area.innerHTML = `
            <div style="background:#EEF5FF;border-radius:16px;padding:12px 16px;margin-bottom:16px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
                <div style="font-weight:900;font-size:14px;color:#4A90E2;">🪙 Tus monedas:</div>
                <div style="font-weight:900;font-size:20px;color:#FFA500;">${APP.coins}</div>
            </div>

            <div class="filter-bar" id="shop-filter-bar">
                <button class="filter-btn ${shopFilter === 'todas' ? 'active' : ''}" data-filter="todas">🎴 Todas</button>
                <button class="filter-btn comun ${shopFilter === 'comun' ? 'active' : ''}" data-filter="comun">⚪ Común</button>
                <button class="filter-btn rara ${shopFilter === 'rara' ? 'active' : ''}" data-filter="rara">🔵 Rara</button>
                <button class="filter-btn epica ${shopFilter === 'epica' ? 'active' : ''}" data-filter="epica">🟣 Épica</button>
                <button class="filter-btn legendaria ${shopFilter === 'legendaria' ? 'active' : ''}" data-filter="legendaria">🟡 Legendaria</button>
            </div>

            <div class="shop-grid">
                ${filtered.length === 0 ? `
                    <div class="empty-state" style="grid-column:1/-1;">
                        <div class="emoji">📭</div>
                        <p>No hay figuritas en esta categoría todavía.</p>
                    </div>
                ` : filtered.map(s => {
                    const owned = APP.stickerCollection.has(s.id);
                    return `
                        <div class="shop-card ${owned ? 'owned' : ''}" data-id="${s.id}">
                            <img src="${s.image_url}" alt="${s.nombre}" loading="lazy">
                            <div class="shop-card-info">
                                <div class="shop-card-name">${s.nombre}</div>
                                <div class="rarity-badge rarity-${s.rareza}">${s.rareza}</div>
                                <div class="shop-card-price">${owned ? '✅ Ya la tenés' : '🪙 ' + s.precio}</div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;

        area.querySelectorAll('.filter-btn').forEach(btn => {
            btn.onclick = () => { shopFilter = btn.dataset.filter; renderShop(); };
        });

        area.querySelectorAll('.shop-card').forEach(card => {
            card.onclick = () => buySticker(card.dataset.id);
        });

    } catch (error) {
        console.error('Error cargando tienda:', error);
        area.innerHTML = `
            <div class="empty-state">
                <div class="emoji">❌</div>
                <p>Error al cargar la tienda</p>
                <button onclick="window.renderShop && window.renderShop()" style="margin-top:12px;padding:10px 24px;border-radius:50px;border:none;background:#4A90E2;color:#fff;font-weight:900;cursor:pointer;font-family:'Nunito',sans-serif;">🔄 Reintentar</button>
            </div>
        `;
    }
}

// ============================================
// COMPRAR FIGURITA
// ============================================
export async function buySticker(stickerId) {
    const sticker = APP.stickerCatalog.find(s => s.id === stickerId);
    if (!sticker) return;

    if (APP.stickerCollection.has(stickerId)) {
        showToast('💡 Ya tenés esta figurita', 'warning');
        return;
    }

    if (APP.coins < sticker.precio) {
        showToast('😅 No tenés suficientes monedas', 'error');
        return;
    }

    APP.coins -= sticker.precio;
    APP.stickerCollection.add(stickerId);
    updateUI();

    if (!APP.isDemo && APP.user) {
        try {
            await updateProfile({ coins: APP.coins });
            await StickerAPI.collectSticker(APP.user.id, stickerId);
        } catch (error) {
            console.error('Error guardando figurita:', error);
            showToast('⚠️ Se compró pero no se pudo guardar', 'error');
        }
    }

    showToast(`🎉 ¡Compraste ${sticker.nombre}!`, 'warning');
    playSound('star');
    celebrateWin();
    renderShop();
    renderAlbum();
}

// ============================================
// VISOR DE IMAGEN A PANTALLA COMPLETA
// ============================================
let viewerState = { open: false, items: [], currentIndex: 0, isZoomed: false, touchStartX: 0 };

export function openImageViewer(items, startIndex) {
    if (!items || items.length === 0) return;
    viewerState.items = items;
    viewerState.currentIndex = startIndex || 0;
    viewerState.isZoomed = false;
    const viewer = document.getElementById('image-viewer');
    if (!viewer) return;
    viewer.classList.remove('hidden');
    viewerState.open = true;
    updateViewerContent();
    document.body.style.overflow = 'hidden';
}

export function closeImageViewer() {
    const viewer = document.getElementById('image-viewer');
    if (!viewer) return;
    viewer.classList.add('hidden');
    viewerState.open = false;
    viewerState.isZoomed = false;
    const img = document.getElementById('viewer-img');
    if (img) { img.classList.remove('zoomed'); img.src = ''; }
    document.body.style.overflow = '';
}

function updateViewerContent() {
    const item = viewerState.items[viewerState.currentIndex];
    if (!item) return;
    const img = document.getElementById('viewer-img');
    const name = document.getElementById('viewer-name');
    const rarity = document.getElementById('viewer-rarity');
    const price = document.getElementById('viewer-price');
    const owned = document.getElementById('viewer-owned');

    if (img) { img.src = item.image_url || ''; img.alt = item.nombre || 'Figurita'; img.classList.remove('zoomed'); viewerState.isZoomed = false; }
    if (name) name.textContent = item.nombre || '—';
    if (rarity) {
        const rarezas = { comun: '⚪ Común', rara: '🔵 Rara', epica: '🟣 Épica', legendaria: '🟡 Legendaria' };
        rarity.textContent = rarezas[item.rareza] || item.rareza;
    }
    if (price) price.textContent = '🪙 ' + (item.precio || 0);
    if (owned) {
        const isOwned = APP.stickerCollection.has(item.id);
        owned.textContent = isOwned ? '✅ La tenés' : '🔒 No la tenés';
        owned.style.background = isOwned ? 'rgba(111, 207, 151, 0.3)' : 'rgba(235, 87, 87, 0.3)';
    }
    const prev = document.getElementById('viewer-prev');
    const next = document.getElementById('viewer-next');
    if (prev) prev.classList.toggle('disabled', viewerState.currentIndex === 0);
    if (next) next.classList.toggle('disabled', viewerState.currentIndex === viewerState.items.length - 1);
}

function viewerNext() {
    if (viewerState.currentIndex < viewerState.items.length - 1) { viewerState.currentIndex++; updateViewerContent(); playSound('click'); }
}
function viewerPrev() {
    if (viewerState.currentIndex > 0) { viewerState.currentIndex--; updateViewerContent(); playSound('click'); }
}
function viewerToggleZoom() {
    const img = document.getElementById('viewer-img');
    if (!img) return;
    viewerState.isZoomed = !viewerState.isZoomed;
    img.classList.toggle('zoomed', viewerState.isZoomed);
    playSound('click');
}

function initImageViewer() {
    const viewer = document.getElementById('image-viewer');
    const closeBtn = document.getElementById('viewer-close');
    const prevBtn = document.getElementById('viewer-prev');
    const nextBtn = document.getElementById('viewer-next');
    const img = document.getElementById('viewer-img');
    if (!viewer) return;

    if (closeBtn) closeBtn.onclick = closeImageViewer;
    viewer.addEventListener('click', (e) => { if (e.target === viewer) closeImageViewer(); });
    if (prevBtn) prevBtn.onclick = (e) => { e.stopPropagation(); viewerPrev(); };
    if (nextBtn) nextBtn.onclick = (e) => { e.stopPropagation(); viewerNext(); };
    if (img) img.onclick = (e) => { e.stopPropagation(); viewerToggleZoom(); };

    document.addEventListener('keydown', (e) => {
        if (!viewerState.open) return;
        if (e.key === 'Escape') closeImageViewer();
        if (e.key === 'ArrowRight') viewerNext();
        if (e.key === 'ArrowLeft') viewerPrev();
        if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); viewerToggleZoom(); }
    });

    viewer.addEventListener('touchstart', (e) => { viewerState.touchStartX = e.touches[0].clientX; }, { passive: true });
    viewer.addEventListener('touchend', (e) => {
        if (viewerState.isZoomed) return;
        const touchEndX = e.changedTouches[0].clientX;
        const diff = touchEndX - viewerState.touchStartX;
        if (Math.abs(diff) > 60) { if (diff < 0) viewerNext(); else viewerPrev(); }
    }, { passive: true });
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initImageViewer);
else initImageViewer();

// ============================================
// LECTURA — 3 MÉTODOS
// ============================================
let currentReadingMethod = 'letra-faltante';
let readingRound = 0;
let readingCorrect = 0;

export function startReading(method) {
    currentReadingMethod = method || currentReadingMethod;
    readingRound = 0;
    readingCorrect = 0;
    renderReadingRound();
}

function renderReadingRound() {
    const area = document.getElementById('reading-area');
    if (!area) return;
    if (readingRound >= 10) {
        area.innerHTML = `
            <div style="background:linear-gradient(135deg,#667eea,#764ba2);border-radius:24px;padding:32px;text-align:center;color:#fff;">
                <div style="font-size:80px;">🏆</div>
                <h2>¡Completaste las 10 rondas!</h2>
                <p style="font-size:24px;font-weight:900;">${readingCorrect} / 10 correctas</p>
                <button onclick="window.startReading('${currentReadingMethod}')" style="margin-top:16px;padding:12px 30px;border-radius:50px;border:none;background:#fff;color:#764ba2;font-weight:900;cursor:pointer;font-family:'Nunito',sans-serif;">🔄 Jugar de nuevo</button>
            </div>
        `;
        if (readingCorrect >= 7) celebrateWin();
        return;
    }
    if (currentReadingMethod === 'letra-faltante') renderReadingLetraFaltante(area);
    else if (currentReadingMethod === 'formar-palabra') renderReadingFormarPalabra(area);
    else if (currentReadingMethod === 'leer-elegir') renderReadingLeerElegir(area);
}

function renderReadingLetraFaltante(area) {
    const palabras = [
        { palabra: 'CASA', emoji: '🏠' }, { palabra: 'GATO', emoji: '🐱' },
        { palabra: 'LUNA', emoji: '🌙' }, { palabra: 'MESA', emoji: '🪑' },
        { palabra: 'PATO', emoji: '🦆' }, { palabra: 'ROSA', emoji: '🌹' },
        { palabra: 'SOPA', emoji: '🍲' }, { palabra: 'TELA', emoji: '🧵' },
        { palabra: 'VINO', emoji: '🍷' }, { palabra: 'ZAPATO', emoji: '👟' }
    ];
    const item = palabras[Math.floor(Math.random() * palabras.length)];
    const palabra = item.palabra;
    const posFalta = Math.floor(Math.random() * palabra.length);
    const letraCorrecta = palabra[posFalta];
    const palabraHTML = palabra.split('').map((l, i) => i === posFalta ? `<span class="reading-missing">?</span>` : l).join('');
    const letras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    const opciones = [letraCorrecta];
    while (opciones.length < 4) {
        const l = letras[Math.floor(Math.random() * letras.length)];
        if (!opciones.includes(l)) opciones.push(l);
    }
    opciones.sort(() => Math.random() - 0.5);
    const progreso = Math.round((readingRound / 10) * 100);

    area.innerHTML = `
        <div class="reading-container">
            <div style="display:flex;justify-content:space-between;font-size:14px;font-weight:900;color:#666;margin-bottom:8px;">
                <span>🔤 Letra faltante</span><span>⭐ ${readingCorrect} / ${readingRound}</span>
            </div>
            <div style="background:#fff;border-radius:50px;height:8px;overflow:hidden;margin-bottom:16px;">
                <div style="background:linear-gradient(90deg,#4A90E2,#6FCF97);height:100%;width:${progreso}%;transition:width 0.5s;"></div>
            </div>
            <div style="font-size:48px;">${item.emoji}</div>
            <div class="reading-word">${palabraHTML}</div>
            <div style="font-size:14px;color:#888;margin-bottom:16px;">¿Qué letra falta?</div>
            <div class="reading-options">
                ${opciones.map(l => `<button class="reading-btn" onclick="window.checkReadingLetra('${l}','${letraCorrecta}',this)">${l}</button>`).join('')}
            </div>
        </div>
    `;
}

window.checkReadingLetra = function(selected, correct, btn) {
    const isCorrect = selected === correct;
    btn.classList.add(isCorrect ? 'correct' : 'wrong');
    if (isCorrect) {
        readingCorrect++;
        playSound('correct');
        showToast('✅ ¡Muy bien!', 'warning');
        addStars(2); addCoins(1);
    } else {
        playSound('wrong');
        showToast(`❌ Era la letra ${correct}`, 'error');
    }
    readingRound++;
    setTimeout(() => renderReadingRound(), 1200);
};

function renderReadingFormarPalabra(area) {
    const silabasDisponibles = [
        { palabra: 'CASA', silabas: ['CA', 'SA'], emoji: '🏠' },
        { palabra: 'GATO', silabas: ['GA', 'TO'], emoji: '🐱' },
        { palabra: 'LUNA', silabas: ['LU', 'NA'], emoji: '🌙' },
        { palabra: 'MESA', silabas: ['ME', 'SA'], emoji: '🪑' },
        { palabra: 'PATO', silabas: ['PA', 'TO'], emoji: '🦆' },
        { palabra: 'ROSA', silabas: ['RO', 'SA'], emoji: '🌹' },
        { palabra: 'SOPA', silabas: ['SO', 'PA'], emoji: '🍲' },
        { palabra: 'MANO', silabas: ['MA', 'NO'], emoji: '🖐️' },
        { palabra: 'VINO', silabas: ['VI', 'NO'], emoji: '🍷' },
        { palabra: 'TELA', silabas: ['TE', 'LA'], emoji: '🧵' }
    ];
    const item = silabasDisponibles[Math.floor(Math.random() * silabasDisponibles.length)];
    const correcta = item.palabra;
    const distractoras = ['MA', 'PA', 'LA', 'TA', 'SO', 'CA', 'NA', 'TE', 'VI', 'RO'];
    const todasSilabas = [...item.silabas];
    while (todasSilabas.length < 6) {
        const d = distractoras[Math.floor(Math.random() * distractoras.length)];
        if (!todasSilabas.includes(d)) todasSilabas.push(d);
    }
    todasSilabas.sort(() => Math.random() - 0.5);
    const progreso = Math.round((readingRound / 10) * 100);

    area.innerHTML = `
        <div class="reading-container">
            <div style="display:flex;justify-content:space-between;font-size:14px;font-weight:900;color:#666;margin-bottom:8px;">
                <span>🧩 Formar palabra</span><span>⭐ ${readingCorrect} / ${readingRound}</span>
            </div>
            <div style="background:#fff;border-radius:50px;height:8px;overflow:hidden;margin-bottom:16px;">
                <div style="background:linear-gradient(90deg,#4A90E2,#6FCF97);height:100%;width:${progreso}%;transition:width 0.5s;"></div>
            </div>
            <div style="font-size:48px;">${item.emoji}</div>
            <div style="font-size:14px;color:#888;margin:8px 0;">Tocá las sílabas en orden para formar la palabra</div>
            <div id="formar-progress" style="font-size:28px;font-weight:900;color:#4A90E2;min-height:40px;margin:12px 0;">_ _</div>
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;max-width:320px;margin:16px auto;">
                ${todasSilabas.map(s => `<button class="reading-btn" style="font-size:20px;" onclick="window.checkReadingSilaba('${s}','${correcta}',this)">${s}</button>`).join('')}
            </div>
        </div>
    `;
    window._formarTarget = correcta;
    window._formarCurrent = '';
}

window.checkReadingSilaba = function(silaba, target, btn) {
    const expected = target.substring(window._formarCurrent.length, window._formarCurrent.length + 2);
    if (silaba === expected) {
        window._formarCurrent += silaba;
        btn.classList.add('correct');
        btn.disabled = true;
        const progress = document.getElementById('formar-progress');
        if (progress) progress.textContent = window._formarCurrent.split(/(?=[A-Z])/).join(' ') + ' _'.repeat(Math.ceil((target.length - window._formarCurrent.length) / 2));
        playSound('click');
        if (window._formarCurrent === target) {
            readingCorrect++;
            playSound('correct');
            showToast(`✅ ¡Formaste ${target}!`, 'warning');
            addStars(3); addCoins(2);
            readingRound++;
            setTimeout(() => renderReadingRound(), 1200);
        }
    } else {
        btn.classList.add('wrong');
        playSound('wrong');
        showToast('❌ Esa no va acá', 'error');
        setTimeout(() => btn.classList.remove('wrong'), 500);
    }
};

function renderReadingLeerElegir(area) {
    const palabras = [
        { palabra: 'CASA', emoji: '🏠', distractores: ['🐱', '🌙', '🦆'] },
        { palabra: 'GATO', emoji: '🐱', distractores: ['🏠', '🌙', '🦆'] },
        { palabra: 'LUNA', emoji: '🌙', distractores: ['🏠', '🐱', '🦆'] },
        { palabra: 'PATO', emoji: '🦆', distractores: ['🏠', '🐱', '🌙'] },
        { palabra: 'ROSA', emoji: '🌹', distractores: ['🏠', '🐱', '🦆'] },
        { palabra: 'SOPA', emoji: '🍲', distractores: ['🏠', '🐱', '🌙'] },
        { palabra: 'MANO', emoji: '🖐️', distractores: ['🏠', '🐱', '🦆'] },
        { palabra: 'VINO', emoji: '🍷', distractores: ['🏠', '🐱', '🌙'] },
        { palabra: 'TELA', emoji: '🧵', distractores: ['🏠', '🐱', '🦆'] },
        { palabra: 'MESA', emoji: '🪑', distractores: ['🏠', '🐱', '🌙'] }
    ];
    const item = palabras[Math.floor(Math.random() * palabras.length)];
    const opciones = [item.emoji, ...item.distractores].sort(() => Math.random() - 0.5);
    const progreso = Math.round((readingRound / 10) * 100);

    area.innerHTML = `
        <div class="reading-container">
            <div style="display:flex;justify-content:space-between;font-size:14px;font-weight:900;color:#666;margin-bottom:8px;">
                <span>🎯 Leer y elegir</span><span>⭐ ${readingCorrect} / ${readingRound}</span>
            </div>
            <div style="background:#fff;border-radius:50px;height:8px;overflow:hidden;margin-bottom:16px;">
                <div style="background:linear-gradient(90deg,#4A90E2,#6FCF97);height:100%;width:${progreso}%;transition:width 0.5s;"></div>
            </div>
            <div style="font-size:14px;color:#888;margin-bottom:8px;">¿Qué dibujo representa esta palabra?</div>
            <div class="reading-word" style="font-size:42px;">${item.palabra}</div>
            <div style="font-size:14px;color:#4A90E2;margin-bottom:16px;font-weight:900;">🔊 ${item.palabra}</div>
            <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:12px;max-width:320px;margin:0 auto;">
                ${opciones.map(op => `<button class="reading-btn" style="font-size:48px;padding:16px;" onclick="window.checkReadingEmoji('${op}','${item.emoji}',this)">${op}</button>`).join('')}
            </div>
        </div>
    `;
    speakBilingual(item.palabra, item.palabra);
}

window.checkReadingEmoji = function(selected, correct, btn) {
    const isCorrect = selected === correct;
    btn.classList.add(isCorrect ? 'correct' : 'wrong');
    if (isCorrect) {
        readingCorrect++;
        playSound('correct');
        showToast('✅ ¡Excelente!', 'warning');
        addStars(2); addCoins(1);
    } else {
        playSound('wrong');
        showToast('❌ Ese no era', 'error');
    }
    readingRound++;
    setTimeout(() => renderReadingRound(), 1200);
};

// ============================================
// JUEGOS
// ============================================
let memoryCards = [], memoryFlipped = [], memoryMatched = [], memoryLocked = false;

export function startMatchGame() {
    const area = document.getElementById('game-area');
    if (!area) return;
    playSound('click');
    const emojis = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'];
    const deck = [...emojis, ...emojis];
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    memoryCards = deck; memoryFlipped = []; memoryMatched = []; memoryLocked = false;
    area.innerHTML = `
        <div style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);border-radius:24px;padding:24px;color:#fff;text-align:center;">
            <h3>🧩 Memory Match</h3>
            <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;max-width:350px;margin:16px auto;">
                ${deck.map((emoji, index) => `
                    <div class="memory-card" data-index="${index}" style="aspect-ratio:1;background:rgba(255,255,255,0.2);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:32px;cursor:pointer;border:2px solid rgba(255,255,255,0.1);" onclick="window.flipCard(${index})">
                        <span style="opacity:0;transition:opacity 0.3s;">${emoji}</span>
                    </div>
                `).join('')}
            </div>
            <div id="memory-score" style="font-weight:900;">Parejas: 0 / 8</div>
            <button onclick="window.startMatchGame()" style="margin-top:12px;padding:8px 24px;border-radius:50px;border:none;background:rgba(255,255,255,0.2);color:#fff;font-weight:900;cursor:pointer;font-family:'Nunito',sans-serif;">🔄 Reiniciar</button>
            <button onclick="window.closeGame()" style="margin-top:12px;margin-left:8px;padding:8px 24px;border-radius:50px;border:none;background:rgba(255,255,255,0.2);color:#fff;font-weight:900;cursor:pointer;font-family:'Nunito',sans-serif;">✕ Cerrar</button>
        </div>
    `;
}

window.flipCard = function(index) {
    if (memoryLocked) return;
    if (memoryFlipped.includes(index)) return;
    if (memoryMatched.includes(index)) return;
    const card = document.querySelector(`.memory-card[data-index="${index}"]`);
    if (!card) return;
    card.style.background = '#fff';
    card.querySelector('span').style.opacity = '1';
    memoryFlipped.push(index);
    if (memoryFlipped.length === 2) {
        memoryLocked = true;
        const [idx1, idx2] = memoryFlipped;
        if (memoryCards[idx1] === memoryCards[idx2]) {
            memoryMatched.push(idx1, idx2);
            memoryFlipped = []; memoryLocked = false;
            playSound('correct');
            const score = document.getElementById('memory-score');
            if (score) score.textContent = `Parejas: ${memoryMatched.length / 2} / 8`;
            if (memoryMatched.length === memoryCards.length) {
                showToast('🎉 ¡Ganaste! +20 ⭐', 'warning');
                addStars(20); addCoins(10); celebrateWin();
            }
        } else {
            playSound('wrong');
            setTimeout(() => {
                const card1 = document.querySelector(`.memory-card[data-index="${idx1}"]`);
                const card2 = document.querySelector(`.memory-card[data-index="${idx2}"]`);
                if (card1) { card1.style.background = 'rgba(255,255,255,0.2)'; card1.querySelector('span').style.opacity = '0'; }
                if (card2) { card2.style.background = 'rgba(255,255,255,0.2)'; card2.querySelector('span').style.opacity = '0'; }
                memoryFlipped = []; memoryLocked = false;
            }, 800);
        }
    }
};

let colorGameScore = 0, colorGameRound = 0;

export function startColorGame() {
    const area = document.getElementById('game-area');
    if (!area) return;
    playSound('click');
    colorGameScore = 0; colorGameRound = 0;
    playColorRound();
}

function playColorRound() {
    const area = document.getElementById('game-area');
    if (!area) return;
    const colors = [
        { es: 'Rojo', en: 'Red', bg: '#E74C3C' }, { es: 'Azul', en: 'Blue', bg: '#3498DB' },
        { es: 'Verde', en: 'Green', bg: '#27AE60' }, { es: 'Amarillo', en: 'Yellow', bg: '#F1C40F' },
        { es: 'Naranja', en: 'Orange', bg: '#E67E22' }, { es: 'Morado', en: 'Purple', bg: '#9B59B6' }
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
    area.innerHTML = `
        <div style="background:linear-gradient(135deg,#f093fb 0%,#f5576c 100%);border-radius:24px;padding:24px;color:#fff;text-align:center;">
            <h3>🎯 ¿Qué color es este?</h3>
            <div style="width:100px;height:100px;border-radius:50%;margin:16px auto;border:3px solid rgba(255,255,255,0.3);background:${correct.bg};"></div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;max-width:280px;margin:0 auto;">
                ${options.map(opt => `<button onclick="window.checkColorAnswer('${opt.es}','${correct.es}')" style="padding:12px;border-radius:12px;border:2px solid rgba(255,255,255,0.3);background:rgba(255,255,255,0.1);color:#fff;font-size:16px;font-weight:900;cursor:pointer;font-family:'Nunito',sans-serif;">${opt.es}</button>`).join('')}
            </div>
            <div style="margin-top:12px;font-weight:900;">Ronda ${colorGameRound} · Puntaje: ${colorGameScore}</div>
            <button onclick="window.startColorGame()" style="margin-top:12px;padding:8px 24px;border-radius:50px;border:none;background:rgba(255,255,255,0.2);color:#fff;font-weight:900;cursor:pointer;font-family:'Nunito',sans-serif;">🔄 Reiniciar</button>
            <button onclick="window.closeGame()" style="margin-top:12px;margin-left:8px;padding:8px 24px;border-radius:50px;border:none;background:rgba(255,255,255,0.2);color:#fff;font-weight:900;cursor:pointer;font-family:'Nunito',sans-serif;">✕ Cerrar</button>
        </div>
    `;
}

window.checkColorAnswer = function(selected, correct) {
    if (selected === correct) {
        colorGameScore += 10;
        playSound('correct');
        showToast('✅ ¡Correcto! +10 ⭐', 'warning');
        addStars(10);
        setTimeout(playColorRound, 800);
    } else {
        playSound('wrong');
        showToast(`❌ Era ${correct}`, 'error');
        if (colorGameScore > 0) colorGameScore -= 5;
        setTimeout(playColorRound, 1200);
    }
};

let numberSelected = [];

export function startNumberGame() {
    const area = document.getElementById('game-area');
    if (!area) return;
    playSound('click');
    const numbers = Array.from({ length: 10 }, (_, i) => i + 1);
    numberSelected = [];
    for (let i = numbers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
    }
    area.innerHTML = `
        <div style="background:linear-gradient(135deg,#2C3E50 0%,#3498DB 100%);border-radius:24px;padding:24px;color:#fff;text-align:center;">
            <h3>🔢 Ordena los Números</h3>
            <p style="font-size:14px;opacity:0.8;">Tocá los números en orden del 1 al 10</p>
            <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:8px;max-width:300px;margin:16px auto;">
                ${numbers.map(n => `<div class="num-game-card" data-num="${n}" style="background:rgba(255,255,255,0.2);border-radius:12px;padding:16px;font-size:24px;font-weight:900;cursor:pointer;border:2px solid rgba(255,255,255,0.1);" onclick="window.selectNumber(${n})">${n}</div>`).join('')}
            </div>
            <div id="num-progress" style="font-weight:900;">Progreso: 0 / 10</div>
            <button onclick="window.startNumberGame()" style="margin-top:12px;padding:8px 24px;border-radius:50px;border:none;background:rgba(255,255,255,0.2);color:#fff;font-weight:900;cursor:pointer;font-family:'Nunito',sans-serif;">🔄 Reiniciar</button>
            <button onclick="window.closeGame()" style="margin-top:12px;margin-left:8px;padding:8px 24px;border-radius:50px;border:none;background:rgba(255,255,255,0.2);color:#fff;font-weight:900;cursor:pointer;font-family:'Nunito',sans-serif;">✕ Cerrar</button>
        </div>
    `;
}

window.selectNumber = function(n) {
    const expected = numberSelected.length + 1;
    const card = document.querySelector(`.num-game-card[data-num="${n}"]`);
    const progress = document.getElementById('num-progress');
    if (!card || card.style.opacity === '0.3') return;
    if (n === expected) {
        numberSelected.push(n);
        card.style.background = '#6FCF97';
        card.style.opacity = '0.3';
        playSound('correct');
        if (progress) progress.textContent = `Progreso: ${numberSelected.length} / 10`;
        if (numberSelected.length === 10) {
            showToast('🎉 ¡Completaste el orden! +20 ⭐', 'warning');
            addStars(20); addCoins(10); celebrateWin();
        }
    } else {
        playSound('wrong');
        showToast(`❌ Debería ser ${expected}`, 'error');
        card.style.background = '#EB5757';
        setTimeout(() => { card.style.background = 'rgba(255,255,255,0.2)'; }, 500);
    }
};

let hangmanWord = '', hangmanGuessed = [], hangmanWrong = [];

export function startHangmanGame() {
    const area = document.getElementById('game-area');
    if (!area) return;
    playSound('click');
    const palabras = ['GATO', 'PERRO', 'CASA', 'SOL', 'LUNA', 'MAR', 'NUBE', 'FLOR', 'TREN'];
    hangmanWord = palabras[Math.floor(Math.random() * palabras.length)];
    hangmanGuessed = []; hangmanWrong = [];
    renderHangman();
}

function renderHangman() {
    const area = document.getElementById('game-area');
    if (!area) return;
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    const wordDisplay = hangmanWord.split('').map(l => hangmanGuessed.includes(l) ? l : '_').join(' ');
    const remaining = 6 - hangmanWrong.length;
    area.innerHTML = `
        <div style="background:linear-gradient(135deg,#2C3E50 0%,#3498DB 100%);border-radius:24px;padding:24px;color:#fff;text-align:center;">
            <h3>🪢 Ahorcado</h3>
            <div style="font-size:28px;font-weight:900;letter-spacing:8px;margin:16px 0;font-family:monospace;">${wordDisplay}</div>
            <div style="font-weight:900;margin-bottom:8px;">Intentos restantes: ${remaining}</div>
            <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(40px,1fr));gap:6px;max-width:300px;margin:0 auto;">
                ${letters.map(l => `<button onclick="window.guessLetter('${l}')" style="padding:6px;border-radius:6px;border:2px solid rgba(255,255,255,0.3);background:${hangmanGuessed.includes(l) ? '#6FCF97' : hangmanWrong.includes(l) ? '#EB5757' : 'rgba(255,255,255,0.1)'};color:#fff;font-size:16px;font-weight:900;cursor:${hangmanGuessed.includes(l) || hangmanWrong.includes(l) ? 'not-allowed' : 'pointer'};font-family:'Nunito',sans-serif;">${l}</button>`).join('')}
            </div>
            <div id="hangman-status" style="margin-top:12px;font-weight:900;min-height:24px;"></div>
            <button onclick="window.startHangmanGame()" style="margin-top:12px;padding:8px 24px;border-radius:50px;border:none;background:rgba(255,255,255,0.2);color:#fff;font-weight:900;cursor:pointer;font-family:'Nunito',sans-serif;">🔄 Nueva palabra</button>
            <button onclick="window.closeGame()" style="margin-top:12px;margin-left:8px;padding:8px 24px;border-radius:50px;border:none;background:rgba(255,255,255,0.2);color:#fff;font-weight:900;cursor:pointer;font-family:'Nunito',sans-serif;">✕ Cerrar</button>
        </div>
    `;
}

window.guessLetter = function(letter) {
    if (hangmanGuessed.includes(letter) || hangmanWrong.includes(letter)) return;
    const status = document.getElementById('hangman-status');
    if (hangmanWord.includes(letter)) {
        hangmanGuessed.push(letter);
        playSound('correct');
        status.textContent = '✅ ¡Bien!';
        status.style.color = '#6FCF97';
        const allGuessed = hangmanWord.split('').every(l => hangmanGuessed.includes(l));
        if (allGuessed) {
            status.textContent = '🎉 ¡Ganaste! +20 ⭐';
            addStars(20); addCoins(10);
            showToast('🎉 ¡Ganaste el Ahorcado! +20 ⭐', 'warning');
            celebrateWin();
        }
    } else {
        hangmanWrong.push(letter);
        playSound('wrong');
        const remaining = 6 - hangmanWrong.length;
        status.textContent = `❌ Te quedan ${remaining} intentos`;
        status.style.color = '#EB5757';
        if (remaining === 0) {
            status.textContent = `💀 Perdiste. Era: ${hangmanWord}`;
            showToast(`💀 Era: ${hangmanWord}`, 'error');
            playSound('defeat');
        }
    }
    renderHangman();
};

let triviaQuestions = [], triviaIndex = 0, triviaScore = 0;

export function startTriviaGame() {
    const area = document.getElementById('game-area');
    if (!area) return;
    playSound('click');
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
    triviaIndex = 0; triviaScore = 0;
    showTriviaQuestion();
}

function showTriviaQuestion() {
    const area = document.getElementById('game-area');
    if (!area) return;
    if (triviaIndex >= triviaQuestions.length) {
        area.innerHTML = `
            <div style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);border-radius:24px;padding:24px;color:#fff;text-align:center;">
                <div style="font-size:48px;">🏆</div>
                <h2>¡Trivia Completada!</h2>
                <p style="font-size:24px;font-weight:900;">Puntaje: ${triviaScore} / ${triviaQuestions.length}</p>
                <button onclick="window.startTriviaGame()" style="margin-top:12px;padding:8px 24px;border-radius:50px;border:none;background:rgba(255,255,255,0.2);color:#fff;font-weight:900;cursor:pointer;font-family:'Nunito',sans-serif;">🔄 Jugar de nuevo</button>
                <button onclick="window.closeGame()" style="margin-top:12px;margin-left:8px;padding:8px 24px;border-radius:50px;border:none;background:rgba(255,255,255,0.2);color:#fff;font-weight:900;cursor:pointer;font-family:'Nunito',sans-serif;">✕ Cerrar</button>
            </div>
        `;
        if (triviaScore === triviaQuestions.length) celebrateWin();
        return;
    }
    const q = triviaQuestions[triviaIndex];
    const total = triviaQuestions.length;
    const pregunta = currentLanguage === 'es' ? q.es : q.en;
    const opciones = currentLanguage === 'es' ? q.opciones.es : q.opciones.en;
    area.innerHTML = `
        <div style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);border-radius:24px;padding:24px;color:#fff;text-align:center;">
            <h3>🧠 Pregunta ${triviaIndex + 1}/${total}</h3>
            <div style="font-size:20px;font-weight:900;margin:16px 0;">${pregunta}</div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;max-width:280px;margin:0 auto;">
                ${opciones.map((opt, idx) => `<button onclick="window.checkTriviaAnswer(${idx}, ${q.correcta})" style="padding:12px;border-radius:12px;border:2px solid rgba(255,255,255,0.3);background:rgba(255,255,255,0.1);color:#fff;font-size:16px;font-weight:900;cursor:pointer;font-family:'Nunito',sans-serif;">${opt}</button>`).join('')}
            </div>
            <div id="trivia-message" style="margin-top:12px;font-weight:900;min-height:24px;"></div>
            <button onclick="window.closeGame()" style="margin-top:12px;padding:8px 24px;border-radius:50px;border:none;background:rgba(255,255,255,0.2);color:#fff;font-weight:900;cursor:pointer;font-family:'Nunito',sans-serif;">✕ Cerrar</button>
        </div>
    `;
}

window.checkTriviaAnswer = function(selected, correct) {
    const message = document.getElementById('trivia-message');
    if (!message) return;
    if (selected === correct) {
        triviaScore++;
        playSound('correct');
        message.textContent = '✅ ¡Correcto! +5 ⭐';
        message.style.color = '#6FCF97';
        addStars(5);
        showToast('✅ ¡Correcto! +5 ⭐', 'warning');
    } else {
        playSound('wrong');
        const opciones = currentLanguage === 'es' ? triviaQuestions[triviaIndex].opciones.es : triviaQuestions[triviaIndex].opciones.en;
        message.textContent = `❌ Era: ${opciones[correct]}`;
        message.style.color = '#EB5757';
    }
    setTimeout(() => { triviaIndex++; showTriviaQuestion(); }, 1500);
};

export function startMath(type) {
    const area = document.getElementById('math-area');
    if (!area) return;
    playSound('click');
    let num1 = Math.floor(Math.random() * 10) + 1;
    let num2 = Math.floor(Math.random() * 10) + 1;
    let operador, resultado;
    if (type === 'suma' || (type === 'mixto' && Math.random() > 0.5)) {
        operador = '+'; resultado = num1 + num2;
    } else {
        operador = '-';
        if (num1 < num2) [num1, num2] = [num2, num1];
        resultado = num1 - num2;
    }
    const opciones = [resultado];
    while (opciones.length < 4) {
        const r = resultado + Math.floor(Math.random() * 7) - 3;
        if (!opciones.includes(r) && r >= 0) opciones.push(r);
    }
    for (let i = opciones.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [opciones[i], opciones[j]] = [opciones[j], opciones[i]];
    }
    const titulo = type === 'suma' ? 'Suma' : type === 'resta' ? 'Resta' : 'Mixto';
    area.innerHTML = `
        <div style="background:linear-gradient(135deg,#f093fb 0%,#f5576c 100%);border-radius:24px;padding:24px;color:#fff;text-align:center;">
            <h3>🧮 ${titulo}</h3>
            <div style="font-size:36px;font-weight:900;margin:16px 0;">${num1} ${operador} ${num2} = ?</div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;max-width:280px;margin:0 auto;">
                ${opciones.map(opt => `<button onclick="window.checkMathAnswer(${opt}, ${resultado})" style="padding:12px;border-radius:12px;border:2px solid rgba(255,255,255,0.3);background:rgba(255,255,255,0.1);color:#fff;font-size:24px;font-weight:900;cursor:pointer;font-family:'Nunito',sans-serif;">${opt}</button>`).join('')}
            </div>
            <div id="math-result" style="margin-top:12px;font-weight:900;min-height:24px;"></div>
            <button onclick="window.startMath('${type}')" style="margin-top:12px;padding:8px 24px;border-radius:50px;border:none;background:rgba(255,255,255,0.2);color:#fff;font-weight:900;cursor:pointer;font-family:'Nunito',sans-serif;">🔄 Nueva</button>
            <button onclick="window.closeGame()" style="margin-top:12px;margin-left:8px;padding:8px 24px;border-radius:50px;border:none;background:rgba(255,255,255,0.2);color:#fff;font-weight:900;cursor:pointer;font-family:'Nunito',sans-serif;">✕ Cerrar</button>
        </div>
    `;
}

window.checkMathAnswer = function(selected, correct) {
    const result = document.getElementById('math-result');
    if (!result) return;
    if (selected === correct) {
        playSound('correct');
        result.textContent = '✅ ¡Correcto! +10 ⭐';
        result.style.color = '#6FCF97';
        addStars(10); addCoins(5);
        showToast('✅ ¡Correcto! +10 ⭐ +5 🪙', 'warning');
    } else {
        playSound('wrong');
        result.textContent = `❌ Era ${correct}`;
        result.style.color = '#EB5757';
    }
};

// CONTANDO CON EL EXPLORADOR
let numeroJuego = { aciertos: 0, totalPreguntas: 10, preguntasHechas: 0, answered: false, vidas: 3, nivelActual: 1, racha: 0 };
const ESCENARIOS = [
    { nombre: '🌳 El Bosque', objetos: ['🍎', '🍌', '🍊', '🍇', '🍓', '🍉', '🥝', '🍑', '🍒', '🍋'], mensaje: '¡Ayuda al Explorador a contar la fruta del bosque!' },
    { nombre: '🌊 La Playa', objetos: ['🐚', '⭐', '🏖️', '🌴', '🐠', '🐟', '🦀', '🐙', '🐬', '🐳'], mensaje: '¡Cuenta los tesoros de la playa con el Explorador!' },
    { nombre: '🏡 La Granja', objetos: ['🐮', '🐷', '🐔', '🐑', '🐴', '🐶', '🐱', '🐰', '🦆', '🐥'], mensaje: '¡El Explorador necesita contar los animales de la granja!' }
];

function generarPreguntaContar() {
    const escenario = ESCENARIOS[numeroJuego.nivelActual - 1];
    const objetosDisponibles = [...escenario.objetos];
    const maxNumero = numeroJuego.nivelActual === 1 ? 5 : numeroJuego.nivelActual === 2 ? 8 : 10;
    const cantidad = Math.floor(Math.random() * maxNumero) + 1;
    const objetosSeleccionados = [];
    for (let i = 0; i < cantidad; i++) {
        const idx = Math.floor(Math.random() * objetosDisponibles.length);
        objetosSeleccionados.push(objetosDisponibles[idx]);
        objetosDisponibles.splice(idx, 1);
        if (objetosDisponibles.length === 0) break;
    }
    const opciones = new Set([cantidad]);
    while (opciones.size < 4) {
        const opcion = cantidad + Math.floor(Math.random() * 5) - 2;
        if (opcion >= 0 && opcion <= 12 && !opciones.has(opcion)) opciones.add(opcion);
    }
    const opcionesArray = Array.from(opciones);
    for (let i = opcionesArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [opcionesArray[i], opcionesArray[j]] = [opcionesArray[j], opcionesArray[i]];
    }
    return { escenario: escenario.nombre, objetos: objetosSeleccionados.slice(0, 10), cantidad, opciones: opcionesArray, correcta: opcionesArray.indexOf(cantidad) };
}

export function startNumeroJuego() {
    const area = document.getElementById('game-area');
    if (!area) return;
    playSound('click');
    numeroJuego = { aciertos: 0, totalPreguntas: 10, preguntasHechas: 0, answered: false, vidas: 3, nivelActual: 1, racha: 0 };
    mostrarPreguntaContar(area);
}

function mostrarPreguntaContar(area) {
    if (numeroJuego.preguntasHechas >= numeroJuego.totalPreguntas) { mostrarVictoriaContar(area); return; }
    if (numeroJuego.vidas <= 0) { mostrarDerrotaContar(area); return; }
    const pregunta = generarPreguntaContar();
    const progreso = Math.round((numeroJuego.preguntasHechas / numeroJuego.totalPreguntas) * 100);
    const escenarioActual = ESCENARIOS[numeroJuego.nivelActual - 1];
    const objetosHTML = pregunta.objetos.map(obj => `<span style="display:inline-block;font-size:36px;margin:2px;">${obj}</span>`).join('');
    area.innerHTML = `
        <div style="background:linear-gradient(135deg,#4A90E2 0%,#56CCF2 50%,#2ECC71 100%);border-radius:24px;padding:24px;color:#fff;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;flex-wrap:wrap;gap:8px;">
                <div style="display:flex;align-items:center;gap:8px;">
                    <span style="font-size:32px;">🦊</span>
                    <span style="font-weight:900;font-size:16px;">El Explorador y los Números</span>
                </div>
                <div style="display:flex;gap:12px;font-size:14px;font-weight:900;">
                    <span>${'❤️'.repeat(numeroJuego.vidas)}${'🖤'.repeat(3 - numeroJuego.vidas)}</span>
                    <span>⭐ ${numeroJuego.aciertos * 2}</span>
                </div>
            </div>
            <div style="margin-bottom:12px;">
                <div style="display:flex;justify-content:space-between;font-size:12px;opacity:0.8;margin-bottom:4px;">
                    <span>${escenarioActual.nombre}</span><span>${progreso}%</span>
                </div>
                <div style="background:rgba(255,255,255,0.2);border-radius:50px;height:8px;overflow:hidden;">
                    <div style="background:#FFD700;height:100%;width:${progreso}%;transition:width 0.5s;"></div>
                </div>
            </div>
            <div style="text-align:center;margin:8px 0;">
                <div style="font-size:16px;font-weight:900;background:rgba(255,255,255,0.15);padding:8px 16px;border-radius:20px;display:inline-block;">${escenarioActual.mensaje}</div>
            </div>
            <div style="text-align:center;margin:12px 0;padding:16px;background:rgba(255,255,255,0.1);border-radius:16px;min-height:80px;">
                <div style="font-size:14px;opacity:0.8;margin-bottom:8px;">🔍 ¿Cuántos ves?</div>
                <div style="display:flex;flex-wrap:wrap;justify-content:center;gap:4px;">${objetosHTML}</div>
            </div>
            <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;max-width:400px;margin:0 auto;">
                ${pregunta.opciones.map((opt, idx) => `<button onclick="window.responderNumero(${idx}, ${pregunta.correcta})" class="numero-option" style="padding:16px;border-radius:16px;border:3px solid rgba(255,255,255,0.3);background:rgba(255,255,255,0.15);color:#fff;font-size:28px;font-weight:900;cursor:pointer;font-family:'Nunito',sans-serif;">${opt}</button>`).join('')}
            </div>
            <div id="numero-feedback" style="margin-top:12px;text-align:center;font-weight:900;min-height:30px;font-size:16px;"></div>
            <div style="display:flex;justify-content:center;gap:10px;margin-top:8px;">
                <button onclick="window.closeGame()" style="padding:6px 16px;border-radius:50px;border:2px solid rgba(255,255,255,0.3);background:transparent;color:#fff;font-weight:900;cursor:pointer;font-family:'Nunito',sans-serif;font-size:12px;">✕ Cerrar</button>
            </div>
        </div>
    `;
    numeroJuego.answered = false;
}

window.responderNumero = function(selected, correct) {
    if (numeroJuego.answered) return;
    numeroJuego.answered = true;
    const feedback = document.getElementById('numero-feedback');
    document.querySelectorAll('.numero-option').forEach(btn => btn.disabled = true);
    if (selected === correct) {
        numeroJuego.aciertos++; numeroJuego.preguntasHechas++; numeroJuego.racha++;
        playSound('correct');
        const bonus = numeroJuego.racha >= 3 ? 3 : 0;
        const estrellas = 2 + bonus;
        const monedas = 1 + bonus;
        feedback.innerHTML = `✅ ¡Excelente! +${estrellas} ⭐ +${monedas} 🪙 ${bonus > 0 ? '🎉 ¡Bono!' : ''}`;
        feedback.style.color = '#6FCF97';
        showToast(`✅ ¡Correcto! +${estrellas} ⭐`, 'warning');
        addStars(estrellas); addCoins(monedas);
        if (numeroJuego.aciertos >= 4 && numeroJuego.nivelActual < 3) numeroJuego.nivelActual++;
        setTimeout(() => mostrarPreguntaContar(document.getElementById('game-area')), 1200);
    } else {
        numeroJuego.vidas--; numeroJuego.racha = 0;
        playSound('wrong');
        feedback.innerHTML = `❌ ¡Oh no! 🖤 Te quedan ${numeroJuego.vidas} vidas`;
        feedback.style.color = '#EB5757';
        setTimeout(() => { numeroJuego.preguntasHechas++; mostrarPreguntaContar(document.getElementById('game-area')); }, 2000);
    }
};

function mostrarVictoriaContar(area) {
    playSound('victory');
    area.innerHTML = `
        <div style="background:linear-gradient(135deg,#f093fb 0%,#f5576c 100%);border-radius:24px;padding:32px;text-align:center;color:#fff;">
            <div style="font-size:80px;">🏆</div>
            <h2>¡El Explorador completó su misión!</h2>
            <p style="font-size:18px;">⭐ ${numeroJuego.aciertos * 2} · 🪙 ${numeroJuego.aciertos} · Nivel ${numeroJuego.nivelActual}</p>
            <button onclick="window.startNumeroJuego()" style="margin-top:16px;padding:12px 30px;border-radius:50px;border:none;background:#fff;color:#f5576c;font-weight:900;cursor:pointer;font-family:'Nunito',sans-serif;">🔄 Jugar de nuevo</button>
            <button onclick="window.closeGame()" style="margin-top:16px;margin-left:8px;padding:12px 30px;border-radius:50px;border:none;background:rgba(255,255,255,0.2);color:#fff;font-weight:900;cursor:pointer;font-family:'Nunito',sans-serif;">✕ Cerrar</button>
        </div>
    `;
    celebrateWin();
}

function mostrarDerrotaContar(area) {
    playSound('defeat');
    area.innerHTML = `
        <div style="background:linear-gradient(135deg,#2C3E50 0%,#c0392b 100%);border-radius:24px;padding:32px;text-align:center;color:#fff;">
            <div style="font-size:80px;">😅</div>
            <h2>¡El Explorador se perdió!</h2>
            <p>¡Practica un poco más y volvé a intentarlo!</p>
            <button onclick="window.startNumeroJuego()" style="margin-top:16px;padding:12px 30px;border-radius:50px;border:none;background:#fff;color:#c0392b;font-weight:900;cursor:pointer;font-family:'Nunito',sans-serif;">🔄 Reintentar</button>
            <button onclick="window.closeGame()" style="margin-top:16px;margin-left:8px;padding:12px 30px;border-radius:50px;border:none;background:rgba(255,255,255,0.2);color:#fff;font-weight:900;cursor:pointer;font-family:'Nunito',sans-serif;">✕ Cerrar</button>
        </div>
    `;
}

let silabaJuego = { aciertos: 0, total: 10, hechas: 0, answered: false };

export function startSilabaGame() {
    const area = document.getElementById('game-area');
    if (!area) return;
    playSound('click');
    silabaJuego = { aciertos: 0, total: 10, hechas: 0, answered: false };
    mostrarPreguntaSilaba(area);
}

function mostrarPreguntaSilaba(area) {
    if (silabaJuego.hechas >= silabaJuego.total) {
        area.innerHTML = `
            <div style="background:linear-gradient(135deg,#667eea,#764ba2);border-radius:24px;padding:32px;text-align:center;color:#fff;">
                <div style="font-size:80px;">🏆</div>
                <h2>¡Completaste las sílabas!</h2>
                <p style="font-size:24px;font-weight:900;">${silabaJuego.aciertos} / ${silabaJuego.total}</p>
                <button onclick="window.startSilabaGame()" style="margin-top:16px;padding:12px 30px;border-radius:50px;border:none;background:#fff;color:#764ba2;font-weight:900;cursor:pointer;font-family:'Nunito',sans-serif;">🔄 Jugar de nuevo</button>
                <button onclick="window.closeGame()" style="margin-top:16px;margin-left:8px;padding:12px 30px;border-radius:50px;border:none;background:rgba(255,255,255,0.2);color:#fff;font-weight:900;cursor:pointer;font-family:'Nunito',sans-serif;">✕ Cerrar</button>
            </div>
        `;
        if (silabaJuego.aciertos >= 8) celebrateWin();
        return;
    }
    const silaba = SILABAS[Math.floor(Math.random() * SILABAS.length)];
    const vocales = ['A', 'E', 'I', 'O', 'U'];
    const vocalCorrecta = silaba.vocal;
    const opciones = [vocalCorrecta];
    const otrasVocales = vocales.filter(v => v !== vocalCorrecta);
    while (opciones.length < 4) {
        const v = otrasVocales[Math.floor(Math.random() * otrasVocales.length)];
        if (!opciones.includes(v)) opciones.push(v);
    }
    opciones.sort(() => Math.random() - 0.5);
    const progreso = Math.round((silabaJuego.hechas / silabaJuego.total) * 100);
    area.innerHTML = `
        <div style="background:linear-gradient(135deg,#4A90E2,#56CCF2);border-radius:24px;padding:24px;color:#fff;text-align:center;">
            <div style="display:flex;justify-content:space-between;font-size:14px;font-weight:900;margin-bottom:8px;">
                <span>🔤 Sílabas</span><span>⭐ ${silabaJuego.aciertos * 2}</span>
            </div>
            <div style="background:rgba(255,255,255,0.2);border-radius:50px;height:8px;overflow:hidden;margin-bottom:16px;">
                <div style="background:#FFD700;height:100%;width:${progreso}%;transition:width 0.5s;"></div>
            </div>
            <div style="font-size:48px;margin:8px 0;">${silaba.emoji}</div>
            <div style="font-size:24px;font-weight:900;margin-bottom:4px;">${silaba.palabra}</div>
            <div style="font-size:14px;opacity:0.8;margin-bottom:16px;">¿Qué vocal falta?</div>
            <div style="font-size:48px;font-weight:900;letter-spacing:8px;background:rgba(255,255,255,0.15);padding:16px;border-radius:16px;margin-bottom:16px;">
                ${silaba.consonante}<span style="color:#FFD700;">_</span>
            </div>
            <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;max-width:320px;margin:0 auto;">
                ${opciones.map(v => `<button onclick="window.checkSilaba('${v}','${vocalCorrecta}')" style="padding:16px;border-radius:14px;border:3px solid rgba(255,255,255,0.3);background:rgba(255,255,255,0.15);color:#fff;font-size:24px;font-weight:900;cursor:pointer;font-family:'Nunito',sans-serif;">${v}</button>`).join('')}
            </div>
            <div id="silaba-feedback" style="margin-top:12px;font-weight:900;min-height:24px;"></div>
            <button onclick="window.closeGame()" style="margin-top:12px;padding:8px 20px;border-radius:50px;border:2px solid rgba(255,255,255,0.3);background:transparent;color:#fff;font-weight:900;cursor:pointer;font-size:12px;font-family:'Nunito',sans-serif;">✕ Cerrar</button>
        </div>
    `;
    silabaJuego.answered = false;
}

window.checkSilaba = function(selected, correct) {
    if (silabaJuego.answered) return;
    silabaJuego.answered = true;
    const feedback = document.getElementById('silaba-feedback');
    if (selected === correct) {
        silabaJuego.aciertos++; silabaJuego.hechas++;
        playSound('correct');
        feedback.textContent = '✅ ¡Correcto! +2 ⭐';
        feedback.style.color = '#6FCF97';
        addStars(2); addCoins(1);
        showToast('✅ ¡Correcto!', 'warning');
    } else {
        silabaJuego.hechas++;
        playSound('wrong');
        feedback.textContent = `❌ Era: ${correct}`;
        feedback.style.color = '#EB5757';
    }
    setTimeout(() => mostrarPreguntaSilaba(document.getElementById('game-area')), 1200);
};

// ============================================
// CUENTOS Y DIBUJOS
// ============================================
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
        card.onclick = () => {
            playSound('click');
            showToast('📖 ' + c.titulo + ' - Próximamente', 'warning');
        };
        list.appendChild(card);
    });
}

function renderCartoons() {
    const area = document.getElementById('cartoons-area');
    if (!area) return;
    area.innerHTML = `
        <div class="empty-state">
            <div class="emoji">🎬</div>
            <p>Los videos se van a poder administrar desde el panel</p>
            <p style="font-size:12px;margin-top:8px;color:#bbb;">Próximamente: gestión de videos</p>
        </div>
    `;
}

// ============================================
// WINDOW EXPORTS
// ============================================
window.buySticker = buySticker;
window.startMatchGame = startMatchGame;
window.startColorGame = startColorGame;
window.startNumberGame = startNumberGame;
window.startHangmanGame = startHangmanGame;
window.startTriviaGame = startTriviaGame;
window.startMath = startMath;
window.startNumeroJuego = startNumeroJuego;
window.startSilabaGame = startSilabaGame;
window.startReading = startReading;
window.renderAlbum = renderAlbum;
window.renderShop = renderShop;
window.celebrateWin = celebrateWin;
window.openImageViewer = openImageViewer;
window.closeImageViewer = closeImageViewer;

window.closeGame = function() {
    const area = document.getElementById('game-area');
    if (area) {
        area.innerHTML = '';
        playSound('click');
        showToast('👋 Juego cerrado', 'warning');
    }
};

// ============================================
// RENDER ALL SECTIONS
// ============================================
function renderAllSections() {
    renderColors();
    renderVocales();
    renderSilabas();
    renderAlphabet();
    renderNumeros();
    renderAnimales();
    renderGeometry();
    renderCuentos();
    renderCartoons();
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
            APP.isAdmin = authResult.profile?.is_admin || false;
            APP.isDemo = false;
            console.log('✅ Usuario autenticado:', APP.user?.email);
            showToast('🌟 ¡Bienvenido ' + (APP.profile?.username || 'Explorador') + '!', 'warning');
        } else {
            console.log('🔓 Modo demo');
            APP.user = { id: 'demo', email: 'demo@ciborgkids.com' };
            APP.profile = { username: 'Explorador', avatar: '🦊', coins: 50, stars: 0, level: 1 };
            APP.coins = 50; APP.stars = 0; APP.level = 1;
            APP.isDemo = true;
            showToast('👋 Modo demo - iniciá sesión para guardar tu progreso', 'warning');
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
// EXPORTAR APP
// ============================================
export { APP };
