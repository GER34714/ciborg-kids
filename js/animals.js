// js/animals.js
import { ProgressAPI } from './supabase.js';

export const ANIMALS_DATA = [
    { id: 'perro', es: 'Perro', en: 'Dog', emoji: '🐶', bg: '#E67E22', sound: 'Guau guau', sound_en: 'Woof woof' },
    { id: 'gato', es: 'Gato', en: 'Cat', emoji: '🐱', bg: '#E74C3C', sound: 'Miau', sound_en: 'Meow' },
    { id: 'vaca', es: 'Vaca', en: 'Cow', emoji: '🐮', bg: '#27AE60', sound: 'Muuu', sound_en: 'Moo' },
    { id: 'pato', es: 'Pato', en: 'Duck', emoji: '🦆', bg: '#3498DB', sound: 'Cuac cuac', sound_en: 'Quack' },
    { id: 'leon', es: 'León', en: 'Lion', emoji: '🦁', bg: '#F1C40F', sound: 'Roaar', sound_en: 'Roar' },
    { id: 'elefante', es: 'Elefante', en: 'Elephant', emoji: '🐘', bg: '#9B59B6', sound: 'Barritar', sound_en: 'Trumpet' },
    { id: 'mono', es: 'Mono', en: 'Monkey', emoji: '🐒', bg: '#16A085', sound: 'Uh uh ah', sound_en: 'Ooh ooh' },
    { id: 'conejo', es: 'Conejo', en: 'Rabbit', emoji: '🐰', bg: '#E91E8C', sound: 'Silencio', sound_en: 'Silent' }
];

let currentUser = null;

export function renderAnimals(userId) {
    currentUser = userId;
    const grid = document.getElementById('animal-list');
    if (!grid) return;
    
    grid.innerHTML = '';
    ANIMALS_DATA.forEach(a => {
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

    const wrong = ANIMALS_DATA.filter(x => x.id !== a.id).sort(() => Math.random() - 0.5).slice(0, 3);
    const opts = [a, ...wrong].sort(() => Math.random() - 0.5);

    panel.innerHTML = `
        <button class="back-btn" onclick="closeAnimalDetail()">← Volver</button>
        <div style="background:${a.bg};border-radius:24px;padding:24px 32px;margin-bottom:16px;width:100%;cursor:pointer" onclick="speak('${a.es}. ${a.sound}','es')">
            <span style="font-size:80px;display:block;animation:bounceIn 0.5s ease">${a.emoji}</span>
            <div style="font-size:36px;font-weight:900;color:#fff;margin:8px 0">${a.es}</div>
            <div style="font-size:18px;color:rgba(255,255,255,0.85);font-weight:700">${a.en}</div>
        </div>
        <div class="detail-flags">
            <button class="flag-btn es" onclick="speak('El ${a.es.toLowerCase()} hace... ${a.sound}','es')">🇦🇷 "${a.sound}"</button>
            <button class="flag-btn en" onclick="speak('The ${a.en.toLowerCase()} goes... ${a.sound_en}','en')">🇺🇸 "${a.sound_en}"</button>
        </div>
        <div class="detail-quiz">
            <div class="quiz-q">¿Cuál es el <strong>${a.es}</strong>?</div>
            <div class="quiz-opts">
                ${opts.map(x => `<button class="quiz-btn" style="font-size:42px" onclick="checkAnimalQuiz('${x.id}','${a.id}',this)">${x.emoji}</button>`).join('')}
            </div>
        </div>
    `;
}

function checkAnimalQuiz(chosen, correct, btn) {
    const btns = document.querySelectorAll('.quiz-btn');
    btns.forEach(b => b.disabled = true);
    if (chosen === correct) {
        btn.classList.add('correct');
        const a = ANIMALS_DATA.find(x => x.id === correct);
        speak('¡Muy bien! Es el ' + a.es, 'es');
        if (window.showToastGlobal) window.showToastGlobal('🎉 ¡Correcto! +5 ⭐');
        if (window.addStarsGlobal) window.addStarsGlobal(5, document.getElementById('animal-detail'));
        if (window.addCoinsGlobal) window.addCoinsGlobal(2, document.getElementById('animal-detail'));
    } else {
        btn.classList.add('wrong');
        speak('Intenta de nuevo', 'es');
        setTimeout(() => {
            btns.forEach(b => { b.disabled = false;
                b.classList.remove('wrong'); });
        }, 900);
    }
}

function closeAnimalDetail() {
    document.getElementById('animal-list').style.display = '';
    document.getElementById('animal-detail').classList.remove('visible');
    document.getElementById('animal-detail').innerHTML = '';
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

export { renderAnimals };
