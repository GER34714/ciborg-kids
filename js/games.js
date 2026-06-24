// js/games.js
import { COLORS_DATA } from './colors.js';
import { NUMBERS_DATA } from './numbers.js';

let matchGameState = { selected: null, pairs: [], matched: new Set() };
let numGameState = { nums: [], order: [] };

export function startMatchGame() {
    const area = document.getElementById('game-area');
    if (!area) return;
    
    const items = ['🔴', '🔵', '🟢', '🟡', '🟠', '🩷'];
    const pairs = [...items, ...items].sort(() => Math.random() - 0.5);
    matchGameState = { selected: null, pairs: pairs, matched: new Set() };

    area.innerHTML = `
        <div style="font-size:18px;font-weight:900;margin-bottom:12px">🧩 Memory Match · Encuentra las parejas</div>
        <div class="match-grid" id="match-grid">
            ${pairs.map((p, i) => `<div class="match-item" data-idx="${i}" data-emoji="${p}" onclick="window.matchClickGlobal(${i})">❓</div>`).join('')}
        </div>
        <div style="text-align:center;font-size:14px;font-weight:700;color:#888" id="match-status">🔍 Encuentra las parejas</div>
    `;
}

export function matchClick(idx) {
    const grid = document.getElementById('match-grid');
    if (!grid) return;
    
    const items = grid.querySelectorAll('.match-item');
    if (matchGameState.matched.has(idx)) return;

    if (matchGameState.selected === null) {
        matchGameState.selected = idx;
        items[idx].textContent = items[idx].dataset.emoji;
        items[idx].classList.add('selected');
    } else if (matchGameState.selected === idx) {
        items[idx].textContent = '❓';
        items[idx].classList.remove('selected');
        matchGameState.selected = null;
    } else {
        const first = matchGameState.selected;
        items[idx].textContent = items[idx].dataset.emoji;

        if (items[first].dataset.emoji === items[idx].dataset.emoji) {
            items[first].classList.add('correct');
            items[idx].classList.add('correct');
            matchGameState.matched.add(first);
            matchGameState.matched.add(idx);
            matchGameState.selected = null;
            if (window.showToastGlobal) window.showToastGlobal('🎉 Pareja encontrada! +3 ⭐');
            if (window.addStarsGlobal) window.addStarsGlobal(3, document.getElementById('game-area'));

            if (matchGameState.matched.size === items.length) {
                document.getElementById('match-status').textContent = '🏆 ¡Ganaste! +5 🪙';
                if (window.addCoinsGlobal) window.addCoinsGlobal(5, document.getElementById('game-area'));
                if (window.player) window.player.gamesWon = (window.player.gamesWon || 0) + 1;
                speak('¡Ganaste! Eres el mejor', 'es');
            }
        } else {
            items[first].classList.add('wrong');
            items[idx].classList.add('wrong');
            document.getElementById('match-status').textContent = '❌ No coinciden';
            setTimeout(() => {
                items[first].textContent = '❓';
                items[idx].textContent = '❓';
                items[first].classList.remove('wrong', 'selected');
                items[idx].classList.remove('wrong');
                matchGameState.selected = null;
                document.getElementById('match-status').textContent = '🔍 Encuentra las parejas';
            }, 700);
        }
    }
}

export function startColorGame() {
    const area = document.getElementById('game-area');
    if (!area) return;
    
    const color = COLORS_DATA[Math.floor(Math.random() * COLORS_DATA.length)];
    const wrong = COLORS_DATA.filter(c => c.id !== color.id).sort(() => Math.random() - 0.5).slice(0, 3);
    const options = [color, ...wrong].sort(() => Math.random() - 0.5);

    area.innerHTML = `
        <div style="font-size:18px;font-weight:900;margin-bottom:12px">🎯 ¿Qué color es este?</div>
        <div style="font-size:80px;text-align:center;padding:20px;background:#f8f9fa;border-radius:20px;margin-bottom:16px;cursor:pointer" onclick="speak('${color.es}','es')">${color.emoji}</div>
        <div class="color-game-options">
            ${options.map(c => `<button class="color-game-btn" style="background:${c.bg}" onclick="window.checkColorGameGlobal('${c.id}','${color.id}',this)">${c.es}</button>`).join('')}
        </div>
        <div style="text-align:center;font-size:14px;font-weight:700;color:#888;margin-top:12px" id="color-game-status">🎨 ¡Elige el color correcto!</div>
    `;
}

export function checkColorGame(chosen, correct, btn) {
    const btns = document.querySelectorAll('.color-game-btn');
    btns.forEach(b => b.disabled = true);

    if (chosen === correct) {
        btn.classList.add('correct');
        document.getElementById('color-game-status').textContent = '✅ ¡Correcto! +5 ⭐';
        if (window.showToastGlobal) window.showToastGlobal('🎉 ¡Acertaste! +5 ⭐');
        if (window.addStarsGlobal) window.addStarsGlobal(5, document.getElementById('game-area'));
        if (window.addCoinsGlobal) window.addCoinsGlobal(2, document.getElementById('game-area'));
        speak('¡Muy bien! Es ' + COLORS_DATA.find(c => c.id === correct).es, 'es');
        setTimeout(() => {
            btns.forEach(b => { b.disabled = false;
                b.classList.remove('correct'); });
            startColorGame();
        }, 1500);
    } else {
        btn.classList.add('wrong');
        document.getElementById('color-game-status').textContent = '❌ Intenta de nuevo';
        speak('Casi, intenta de nuevo', 'es');
        setTimeout(() => {
            btns.forEach(b => { b.disabled = false;
                b.classList.remove('wrong'); });
        }, 800);
    }
}

export function startNumberGame() {
    const area = document.getElementById('game-area');
    if (!area) return;
    
    const numbersData = [
        { n: 1, bg: '#E74C3C' }, { n: 2, bg: '#E67E22' }, { n: 3, bg: '#F1C40F' },
        { n: 4, bg: '#27AE60' }, { n: 5, bg: '#3498DB' }, { n: 6, bg: '#9B59B6' },
        { n: 7, bg: '#E91E8C' }, { n: 8, bg: '#16A085' }, { n: 9, bg: '#E74C3C' },
        { n: 10, bg: '#2980B9' }
    ];
    
    const nums = [...numbersData].sort(() => Math.random() - 0.5);
    numGameState = { nums: nums, order: [] };

    area.innerHTML = `
        <div style="font-size:18px;font-weight:900;margin-bottom:12px">🔢 Ordena los números del 1 al 10</div>
        <div class="num-game-grid" id="num-game-grid">
            ${nums.map((n, i) => `<div class="num-game-card" style="background:${n.bg}" onclick="window.numGameClickGlobal(${i})" data-idx="${i}">${n.n}</div>`).join('')}
        </div>
        <div style="text-align:center;font-size:14px;font-weight:700;color:#888;margin-top:12px" id="num-game-status">🔢 Ordena los números correctamente</div>
    `;
}

export function numGameClick(idx) {
    const grid = document.getElementById('num-game-grid');
    if (!grid) return;
    
    const items = grid.querySelectorAll('.num-game-card');
    if (numGameState.order.includes(idx)) return;

    const expected = numGameState.order.length + 1;
    const num = numGameState.nums[idx];

    if (num.n === expected) {
        items[idx].classList.add('correct');
        numGameState.order.push(idx);
        document.getElementById('num-game-status').textContent = '✅ Bien! Sigue así';
        speak('Número ' + num.n, 'es');

        if (numGameState.order.length === 10) {
            document.getElementById('num-game-status').textContent = '🏆 ¡Excelente! +10 🪙';
            if (window.addCoinsGlobal) window.addCoinsGlobal(10, document.getElementById('game-area'));
            if (window.player) window.player.gamesWon = (window.player.gamesWon || 0) + 1;
            speak('¡Ganaste! Eres un genio', 'es');
        }
    } else {
        items[idx].classList.add('wrong');
        document.getElementById('num-game-status').textContent = '❌ El número ' + expected + ' era el siguiente';
        speak('El número ' + expected + ' es el que sigue', 'es');
        setTimeout(() => {
            items[idx].classList.remove('wrong');
        }, 600);
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

export { startMatchGame, matchClick, startColorGame, checkColorGame, startNumberGame, numGameClick };
