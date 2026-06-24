// js/math.js
let mathState = { type: 'suma', num1: 0, num2: 0, answer: 0 };

export function startMath(type) {
    mathState.type = type;
    generateMathProblem();
}

function generateMathProblem() {
    const type = mathState.type;
    let num1, num2, answer, operator, operatorSymbol;

    if (type === 'suma' || (type === 'mixto' && Math.random() < 0.5)) {
        num1 = Math.floor(Math.random() * 9) + 1;
        num2 = Math.floor(Math.random() * (10 - num1)) + 1;
        answer = num1 + num2;
        operator = 'suma';
        operatorSymbol = '+';
    } else {
        num1 = Math.floor(Math.random() * 9) + 2;
        num2 = Math.floor(Math.random() * (num1 - 1)) + 1;
        answer = num1 - num2;
        operator = 'resta';
        operatorSymbol = '−';
    }

    mathState.num1 = num1;
    mathState.num2 = num2;
    mathState.answer = answer;

    let wrongAnswers = new Set();
    while (wrongAnswers.size < 3) {
        let wrong = answer + (Math.floor(Math.random() * 6) + 1) * (Math.random() < 0.5 ? 1 : -1);
        if (wrong !== answer && wrong >= 0 && wrong <= 20) {
            wrongAnswers.add(wrong);
        }
    }

    const options = [answer, ...wrongAnswers].sort(() => Math.random() - 0.5);

    const area = document.getElementById('math-area');
    if (!area) return;
    
    area.innerHTML = `
        <div class="math-container">
            <div style="font-size:18px;font-weight:900;opacity:0.9">${operator === 'suma' ? '➕ Suma' : '➖ Resta'}</div>
            <div class="math-question">${num1} ${operatorSymbol} ${num2} = ?</div>
            <div class="math-options">
                ${options.map(opt => `<button class="math-btn" onclick="checkMathAnswer(${opt},${answer},this)">${opt}</button>`).join('')}
            </div>
            <div style="margin-top:12px;font-size:14px;opacity:0.8" id="math-status">💡 ¿Cuál es el resultado?</div>
        </div>
    `;
}

function checkMathAnswer(chosen, correct, btn) {
    const btns = document.querySelectorAll('.math-btn');
    btns.forEach(b => b.disabled = true);

    if (chosen === correct) {
        btn.classList.add('correct');
        document.getElementById('math-status').textContent = '✅ ¡Correcto! +5 ⭐';
        speak('¡Muy bien! ' + mathState.num1 + ' ' + (mathState.type === 'suma' ? 'más' : 'menos') + ' ' + mathState.num2 + ' es ' + correct, 'es');
        if (window.showToastGlobal) window.showToastGlobal('🎉 ¡Correcto! +5 ⭐');
        if (window.addStarsGlobal) window.addStarsGlobal(5, document.getElementById('math-area'));
        if (window.addCoinsGlobal) window.addCoinsGlobal(2, document.getElementById('math-area'));
        if (window.player) window.player.mathDone = (window.player.mathDone || 0) + 1;
        setTimeout(() => {
            btns.forEach(b => { b.disabled = false;
                b.classList.remove('correct'); });
            generateMathProblem();
        }, 1500);
    } else {
        btn.classList.add('wrong');
        document.getElementById('math-status').textContent = '❌ Intenta de nuevo';
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

export { startMath };
