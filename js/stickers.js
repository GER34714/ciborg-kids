// js/stickers.js
export const STICKERS_DATA = [
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

let currentUser = null;
let stickerCollection = new Set();

export function renderStickers(userId) {
    currentUser = userId;
    const area = document.getElementById('album-area');
    if (!area) return;
    
    const total = STICKERS_DATA.length;
    const collected = stickerCollection.size;

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
                ${STICKERS_DATA.map(s => `
                    <div class="sticker-slot ${stickerCollection.has(s.id) ? 'filled' : ''}">
                        ${stickerCollection.has(s.id) ? s.emoji : '❓'}
                        ${stickerCollection.has(s.id) ? `<span class="sticker-name">${s.nombre}</span>` : ''}
                    </div>
                `).join('')}
            </div>
            <div style="text-align:center;margin-top:16px;font-size:14px;font-weight:700;color:#888">
                ${collected === total ? '🎉 ¡Álbum completo! Eres un coleccionista estrella ⭐' : '💡 Completa desafíos y compra figuritas en la tienda'}
            </div>
        </div>
    `;
}

export function renderShop() {
    const area = document.getElementById('shop-area');
    if (!area) return;

    area.innerHTML = `
        <div class="shop-container">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;flex-wrap:wrap;gap:10px">
                <div class="album-title">🛒 Tienda de Figuritas</div>
                <div style="font-size:16px;font-weight:900;color:#FFA500">🪙 ${window.player?.coins || 0} monedas</div>
            </div>
            <div class="shop-grid">
                ${STICKERS_DATA.map(s => {
                    const owned = stickerCollection.has(s.id);
                    return `
                        <div class="shop-item ${owned ? 'owned' : ''}" onclick="window.buyStickerGlobal('${s.id}')">
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

export function buySticker(stickerId) {
    const sticker = STICKERS_DATA.find(s => s.id === stickerId);
    if (!sticker) return;

    if (stickerCollection.has(stickerId)) {
        if (window.showToastGlobal) window.showToastGlobal('💡 Ya tienes esta figurita', 'warning');
        return;
    }

    if ((window.player?.coins || 0) < sticker.precio) {
        if (window.showToastGlobal) window.showToastGlobal('😅 No tienes suficientes monedas. ¡Gana más haciendo desafíos!', 'error');
        return;
    }

    if (window.player) {
        window.player.coins -= sticker.precio;
        stickerCollection.add(stickerId);
        if (window.updateUIGlobal) window.updateUIGlobal();
        if (window.showToastGlobal) window.showToastGlobal(`🎉 ¡Compraste ${sticker.nombre}! ${sticker.emoji}`, 'warning');
        speak('¡Has comprado la figurita ' + sticker.nombre + '!', 'es');
        renderShop();
        renderStickers(currentUser);

        if (stickerCollection.size === STICKERS_DATA.length) {
            if (window.showToastGlobal) window.showToastGlobal('🎊 ¡Álbum completado! +50 🪙', 'warning');
            if (window.addCoinsGlobal) window.addCoinsGlobal(50, document.getElementById('shop-area'));
        }
    }
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

export { stickerCollection, renderStickers, renderShop, buySticker };
