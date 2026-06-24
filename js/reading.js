// js/reading.js
export const READING_DATA = [
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

let readingState = { current: 0, used: new Set() };

export function startReading() {
    readingState.used = new Set();
    readingState.current = 0;
    generateReadingProblem();
}

function generateReadingProblem() {
    const available = READING_DATA.filter((_, i) => !readingState.used.has(i));
    const area = document.getElementById('reading-area');
    if (!area) return;
    
    if (available.length === 0) {
        area.innerHTML = `
            <div style="text-align:center;padding:40px;background:#f8f9fa;border-radius:24px">
                <div style="font-size:48px">🎉</div>
                <div style="font-size:20px;font-weight:900;margin-top:12px">¡Completaste todas las palabras!</div>
                <div style="font-size:14px;color:#888;margin-top:8px">+10 🪙 por completar el desafío</div>
                <button class="flag-btn" style="background:#4A90E2;color:#fff;margin-top:16px" onclick="startReading()">🔄 Jugar de nuevo</button>
            </div>
        `;
        if (window.addCoinsGlobal) window.addCoinsGlobal(10, area);
        return;
    }

    const idx = Math.floor(Math.random() * available.length);
    const originalIdx = READING_DATA.indexOf(available[idx]);
    readingState.used.add(originalIdx);
    readingState.current = originalIdx;

    const item = READING_DATA[originalIdx];
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
                ${item.opciones.map(opt => `<button class="reading-btn" onclick="checkReadingAnswer('${opt}','${item.faltante}',this)">${opt}</button>`).join('')}
            </div>
            <div style="margin-top:12px;font-size:14px;font-weight:700;color:#2d2d2d" id="reading-status">🔍 ¿Cuál es la letra que falta?</div>
        </div>
    `;
    speak('¿Qué letra falta en ' + item.palabra + '?', 'es', 0.8);
}

function checkReadingAnswer(chosen, correct, btn) {
    const btns = document.querySelectorAll('.reading-btn');
    btns.forEach(b => b.disabled = true);

    if (chosen === correct) {
        btn.classList.add('correct');
        document.getElementById('reading-status').textContent = '✅ ¡Correcto! La letra es ' + correct;
        speak('¡Muy bien! La letra es ' + correct, 'es');
        if (window.showToastGlobal) window.showToastGlobal('🎉 ¡Correcto! +5 ⭐');
        if (window.addStarsGlobal) window.addStarsGlobal(5, document.getElementById('reading-area'));
        if (window.addCoinsGlobal) window.addCoinsGlobal(2, document.getElementById('reading-area'));
        setTimeout(() => {
            btns.forEach(b => { b.disabled = false;
                b.classList.remove('correct'); });
            generateReadingProblem();
        }, 1500);
    } else {
        btn.classList.add('wrong');
        document.getElementById('reading-status').textContent = '❌ Intenta de nuevo';
        speak('Casi, intenta de nuevo', 'es');
        setTimeout(() => {
            btns.forEach(b => { b.disabled = false;
                b.classList.remove('wrong'); });
        }, 800);
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

export { startReading };
