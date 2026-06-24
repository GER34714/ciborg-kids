// js/stories.js
export const STORIES_DATA = [
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

let storyData = { cuento: null, page: 0 };

export function renderStories() {
    const list = document.getElementById('story-list');
    if (!list) return;
    
    list.innerHTML = '';
    document.getElementById('story-viewer').classList.add('hidden');
    document.getElementById('story-viewer').innerHTML = '';

    STORIES_DATA.forEach(c => {
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
    viewer.innerHTML += `<button class="back-btn" style="margin-top:12px;align-self:center" onclick="closeStory()">← Cerrar cuento</button>`;
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
                <button class="flag-btn" style="background:rgba(255,255,255,0.2);color:#fff;border:2px solid rgba(255,255,255,0.3)" onclick="storyPrev()">◀</button>
                <button class="flag-btn" style="background:rgba(255,255,255,0.2);color:#fff;border:2px solid rgba(255,255,255,0.3)" onclick="storyNext()">▶</button>
            </div>
            <div style="margin-top:12px;font-size:12px;opacity:0.7">Página ${page+1} de ${c.escenas.length}</div>
        </div>
    `;
    speak(c.escenas[page], 'es', 0.8);
    viewer.innerHTML += `<button class="back-btn" style="margin-top:12px;align-self:center" onclick="closeStory()">← Cerrar cuento</button>`;
}

function storyNext() {
    if (storyData.page < storyData.cuento.escenas.length - 1) {
        storyData.page++;
        renderStoryPage();
        if (window.addStarsGlobal) window.addStarsGlobal(2, document.getElementById('story-viewer'));
        if (window.addCoinsGlobal) window.addCoinsGlobal(1, document.getElementById('story-viewer'));
    } else {
        if (window.showToastGlobal) window.showToastGlobal('📖 ¡Fin del cuento! +5 🪙', 'warning');
        if (window.addCoinsGlobal) window.addCoinsGlobal(5, document.getElementById('story-viewer'));
    }
}

function storyPrev() {
    if (storyData.page > 0) {
        storyData.page--;
        renderStoryPage();
    }
}

function closeStory() {
    document.getElementById('story-viewer').classList.add('hidden');
    document.getElementById('story-viewer').innerHTML = '';
    document.getElementById('story-list').style.display = '';
}

function speak(text, lang = 'es', rate = 0.9) {
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

export { renderStories };
