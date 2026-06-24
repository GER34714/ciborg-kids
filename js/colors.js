// js/colors.js
import { ProgressAPI } from './supabase.js';

export const COLORS_DATA = [
    { id: 'rojo', es: 'Rojo', en: 'Red', emoji: '🔴', bg: '#E74C3C', ex: ['🍎', '🌹', '🚒'] },
    { id: 'azul', es: 'Azul', en: 'Blue', emoji: '🔵', bg: '#3498DB', ex: ['🐋', '🌊', '☁️'] },
    { id: 'verde', es: 'Verde', en: 'Green', emoji: '🟢', bg: '#27AE60', ex: ['🌿', '🐸', '🌲'] },
    { id: 'amarillo', es: 'Amarillo', en: 'Yellow', emoji: '🟡', bg: '#F1C40F', ex: ['🌻', '🍋', '⭐'] },
    { id: 'naranja', es: 'Naranja', en: 'Orange', emoji: '🟠', bg: '#E67E22', ex: ['🍊', '🎃', '🦊'] },
    { id: 'rosa', es: 'Rosa', en: 'Pink', emoji: '🩷', bg: '#E91E8C', ex: ['🌸', '🍬', '🦩'] },
    { id: 'morado', es: 'Morado', en: 'Purple', emoji: '🟣', bg: '#9B59B6', ex: ['🍇', '🌷', '🦄'] },
    { id: 'celeste', es: 'Celeste', en: 'Light Blue', emoji: '🩵', bg: '#56CCF2', ex: ['🌤️', '🧊', '💙'] }
];

let colDone = new Set();
let currentUser = null;

export function renderColors(userId) {
    currentUser = userId;
    const grid = document.getElementById('color-list');
    if (!grid) return;
    
    grid.innerHTML = '';
    COLORS_DATA.forEach((c) => {
        const card = document.createElement('div');
        card.className = 'lesson-card';
        card.style.background = c.bg;
        const isDone = colDone.has(c.id);
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
    updateColorProg();
}

export async function loadColorProgress(userId) {
    try {
        const progress = await ProgressAPI.getCategoryProgress(userId, 'colores');
        colDone = new Set(progress.filter(p => p.completed).map(p => p.item_id));
        renderColors(userId);
        updateColorProg();
        return colDone;
    } catch (error) {
        console.error('Error cargando progreso de colores:', error);
        return colDone;
    }
}

function openColorDetail(c, card) {
    speak(c.es, 'es');
    document.getElementById('color-list').style.display = 'none';
    const panel = document.getElementById('color-detail');
    panel.classList.add('visible');

    const wrong = COLORS_DATA.filter(x => x.id !== c.id).sort(() => Math.random() - 0.5).slice(0, 3);
    const opts = [c, ...wrong].sort(() => Math.random() - 0.5);

    panel.innerHTML = `
        <button class="back-btn" onclick="closeColorDetail()">← Volver</button>
        <div style="background:${c.bg};border-radius:24px;padding:24px 32px;margin-bottom:16px;width:100%;cursor:pointer" onclick="speak('${c.es}','es')">
            <span style="font-size:80px;display:block;animation:bounceIn 0.6s ease">${c.emoji}</span>
            <div style="font-size:44px;font-weight:900;color:#fff;margin:8px 0">${c.es}</div>
            <div style="font-size:20px;color:rgba(255,255,255,0.85);font-weight:700">${c.en}</div>
        </div>
        <div class="detail-flags">
            <button class="flag-btn es" onclick="speak('${c.es}','es')">🇦🇷 Español</button>
            <button class="flag-btn en" onclick="speak('${c.en}','en')">🇺🇸 English</button>
        </div>
        <div style="font-size:14px;font-weight:900;color:#888;margin-bottom:10px">Ejemplos:</div>
        <div class="detail-examples">
            ${c.ex.map(e => `<span class="ex-item" style="background:${c.bg}">${e}</span>`).join('')}
        </div>
        <div class="detail-quiz">
            <div class="quiz-q">¿Cuál es el color <strong>${c.es}</strong>?</div>
            <div class="quiz-opts">
                ${opts.map(x => `<button class="quiz-btn" style="font-size:28px" onclick="checkColorQuiz('${x.id}','${c.id}',this)">${x.emoji}</button>`).join('')}
            </div>
        </div>
    `;
    
    if (!colDone.has(c.id) && currentUser) {
        completeColor(c.id, card);
    }
}

async function completeColor(colorId, card) {
    if (!currentUser) return;
    try {
        await ProgressAPI.completeItem(currentUser, 'colores', colorId);
        colDone.add(colorId);
        updateColorProg();
        if (window.addStarsGlobal) window.addStarsGlobal(5, card);
        if (window.addCoinsGlobal) window.addCoinsGlobal(2, card);
        card.innerHTML += '<div class="lc-completed">✅</div>';
        card.classList.add('done');
        speak('¡Bien hecho! Has aprendido el color ' + COLORS_DATA.find(c => c.id === colorId).es, 'es');
        if (colDone.size === COLORS_DATA.length) {
            if (window.showToastGlobal) window.showToastGlobal('🎉 ¡Completaste todos los colores! +10 🪙', 'warning');
            if (window.addCoinsGlobal) window.addCoinsGlobal(10, document.getElementById('color-detail'));
        }
    } catch (error) {
        console.error('Error completando color:', error);
    }
}

function checkColorQuiz(chosen, correct, btn) {
    const btns = document.querySelectorAll('.quiz-btn');
    btns.forEach(b => b.disabled = true);
    if (chosen === correct) {
        btn.classList.add('correct');
        speak('¡Muy bien! ¡Correcto!', 'es');
        if (window.showToastGlobal) window.showToastGlobal('🎉 ¡Excelente! +5 ⭐');
        if (window.addStarsGlobal) window.addStarsGlobal(5, document.getElementById('color-detail'));
    } else {
        btn.classList.add('wrong');
        speak('Casi, intenta de nuevo', 'es');
        setTimeout(() => {
            btns.forEach(b => { b.disabled = false;
                b.classList.remove('wrong'); });
        }, 800);
    }
}

function updateColorProg() {
    const total = COLORS_DATA.length;
    const done = colDone.size;
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
    const progFill = document.getElementById('col-prog');
    const progTxt = document.getElementById('col-prog-txt');
    if (progFill) progFill.style.width = pct + '%';
    if (progTxt) progTxt.textContent = done + ' / ' + total;
}

function closeColorDetail() {
    document.getElementById('color-list').style.display = '';
    document.getElementById('color-detail').classList.remove('visible');
    document.getElementById('color-detail').innerHTML = '';
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

export { colDone, loadColorProgress, renderColors, updateColorProg };
