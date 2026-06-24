// js/vowels.js
import { ProgressAPI } from './supabase.js';

export const VOWELS_DATA = [
    { id: 'a', es: 'A', en: 'A', emoji: '🦅', bg: '#E74C3C', word_es: 'Águila', word_en: 'Eagle', sound_es: 'a', sound_en: 'ei' },
    { id: 'e', es: 'E', en: 'E', emoji: '🐘', bg: '#3498DB', word_es: 'Elefante', word_en: 'Elephant', sound_es: 'e', sound_en: 'i' },
    { id: 'i', es: 'I', en: 'I', emoji: '🦎', bg: '#27AE60', word_es: 'Iguana', word_en: 'Iguana', sound_es: 'i', sound_en: 'ai' },
    { id: 'o', es: 'O', en: 'O', emoji: '🐻', bg: '#E67E22', word_es: 'Oso', word_en: 'Bear', sound_es: 'o', sound_en: 'ou' },
    { id: 'u', es: 'U', en: 'U', emoji: '🍇', bg: '#9B59B6', word_es: 'Uva', word_en: 'Grape', sound_es: 'u', sound_en: 'iu' }
];

let currentUser = null;

export function renderVocals(userId) {
    currentUser = userId;
    const grid = document.getElementById('vocal-list');
    if (!grid) return;
    
    grid.innerHTML = '';
    VOWELS_DATA.forEach(v => {
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

    const wrong = VOWELS_DATA.filter(x => x.id !== v.id).sort(() => Math.random() - 0.5).slice(0, 3);
    const opts = [v, ...wrong].sort(() => Math.random() - 0.5);

    panel.innerHTML = `
        <button class="back-btn" onclick="closeVocalDetail()">← Volver</button>
        <div style="background:${v.bg};border-radius:24px;padding:24px 32px;margin-bottom:16px;width:100%;cursor:pointer" onclick="speak('${v.es}','es')">
            <div style="font-size:90px;font-weight:900;color:#fff;line-height:1">${v.es}</div>
            <div style="font-size:52px;margin:8px 0;animation:bounceIn 0.5s ease">${v.emoji}</div>
            <div style="font-size:22px;font-weight:900;color:#fff">${v.word_es}</div>
            <div style="font-size:14px;color:rgba(255,255,255,0.85);font-weight:700">${v.word_en}</div>
        </div>
        <div class="detail-flags">
            <button class="flag-btn es" onclick="speak('${v.es} ${v.word_es}','es')">🇦🇷 "${v.sound_es}" · ${v.word_es}</button>
            <button class="flag-btn en" onclick="speak('${v.sound_en} ${v.word_en}','en')">🇺🇸 "${v.sound_en}" · ${v.word_en}</button>
        </div>
        <div class="detail-quiz">
            <div class="quiz-q">¿Cuál es la vocal <strong>${v.es}</strong>?</div>
            <div class="quiz-opts">
                ${opts.map(x => `<button class="quiz-btn" style="font-size:36px;font-weight:900;color:${x.bg}" onclick="checkVocalQuiz('${x.id}','${v.id}',this)">${x.es}</button>`).join('')}
            </div>
        </div>
    `;
}

function checkVocalQuiz(chosen, correct, btn) {
    const btns = document.querySelectorAll('.quiz-btn');
    btns.forEach(b => b.disabled = true);
    if (chosen === correct) {
        btn.classList.add('correct');
        speak('¡Muy bien! La vocal ' + correct.toUpperCase(), 'es');
        if (window.showToastGlobal) window.showToastGlobal('🎉 ¡Correcto! +5 ⭐');
        if (window.addStarsGlobal) window.addStarsGlobal(5, document.getElementById('vocal-detail'));
        if (window.addCoinsGlobal) window.addCoinsGlobal(2, document.getElementById('vocal-detail'));
    } else {
        btn.classList.add('wrong');
        speak('Intenta de nuevo', 'es');
        setTimeout(() => {
            btns.forEach(b => { b.disabled = false;
                b.classList.remove('wrong'); });
        }, 800);
    }
}

function closeVocalDetail() {
    document.getElementById('vocal-list').style.display = '';
    document.getElementById('vocal-detail').classList.remove('visible');
    document.getElementById('vocal-detail').innerHTML = '';
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

export { renderVocals };
