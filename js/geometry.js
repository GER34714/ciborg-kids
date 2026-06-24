// js/geometry.js
export const GEOMETRY_DATA = [
    { id: 'circulo', nombre: 'Círculo', emoji: '⭕', lados: '0', bg: '#E74C3C' },
    { id: 'cuadrado', nombre: 'Cuadrado', emoji: '🟦', lados: '4', bg: '#3498DB' },
    { id: 'triangulo', nombre: 'Triángulo', emoji: '🔺', lados: '3', bg: '#F1C40F' },
    { id: 'rectangulo', nombre: 'Rectángulo', emoji: '▬', lados: '4', bg: '#27AE60' },
    { id: 'pentagono', nombre: 'Pentágono', emoji: '⬠', lados: '5', bg: '#9B59B6' },
    { id: 'hexagono', nombre: 'Hexágono', emoji: '⬡', lados: '6', bg: '#E67E22' }
];

export function renderGeometry() {
    const container = document.getElementById('geometry-list');
    if (!container) {
        // Si no existe, crear la sección
        createGeometrySection();
        return;
    }
    
    container.innerHTML = '';
    GEOMETRY_DATA.forEach(g => {
        const card = document.createElement('div');
        card.className = 'lesson-card';
        card.style.background = g.bg;
        card.innerHTML = `
            <span class="lc-emoji">${g.emoji}</span>
            <div class="lc-word">${g.nombre}</div>
            <div class="lc-en">${g.lados} lados</div>
        `;
        card.onclick = () => openGeometryDetail(g);
        container.appendChild(card);
    });
}

function createGeometrySection() {
    // Crear la sección de geometría en el HTML si no existe
    const content = document.querySelector('.content');
    if (!content) return;
    
    const section = document.createElement('div');
    section.id = 'sec-geometria';
    section.className = 'hidden';
    section.innerHTML = `
        <div class="sec-hdr">
            <div class="sec-icon" style="background:#FFF3E0">🔺</div>
            <div>
                <div class="sec-title">Geometría</div>
                <div class="sec-sub">Aprende las figuras geométricas</div>
            </div>
        </div>
        <div id="geometry-list" class="lesson-grid"></div>
        <div id="geometry-detail" class="detail-panel"></div>
    `;
    content.appendChild(section);
    
    // Agregar el tab de navegación
    const navTabs = document.querySelector('.nav-tabs');
    if (navTabs) {
        const btn = document.createElement('button');
        btn.className = 'tab-btn';
        btn.textContent = '🔺 Geometría';
        btn.onclick = () => window.showSection('geometria');
        navTabs.appendChild(btn);
    }
    
    renderGeometry();
}

function openGeometryDetail(geometry) {
    const panel = document.getElementById('geometry-detail');
    if (!panel) return;
    
    document.getElementById('geometry-list').style.display = 'none';
    panel.classList.add('visible');
    
    const ladosNum = parseInt(geometry.lados) || 0;
    const options = ladosNum === 0 ? [0, 1, 2, 3, 4, 5, 6, 7, 8] : [0, 1, 2, 3, 4, 5, 6, 7, 8].filter(n => n !== ladosNum).slice(0, 3);
    options.push(ladosNum);
    options.sort(() => Math.random() - 0.5);
    
    panel.innerHTML = `
        <button class="back-btn" onclick="closeGeometryDetail()">← Volver</button>
        <div style="background:${geometry.bg};border-radius:24px;padding:32px;width:100%;text-align:center;color:#fff">
            <div style="font-size:80px">${geometry.emoji}</div>
            <div style="font-size:36px;font-weight:900;margin:8px 0">${geometry.nombre}</div>
            <div style="font-size:18px">Tiene ${geometry.lados} lados</div>
        </div>
        <div class="detail-quiz" style="margin-top:16px;width:100%">
            <div class="quiz-q">¿Cuántos lados tiene el ${geometry.nombre}?</div>
            <div class="quiz-opts">
                ${options.map(n => `
                    <button class="quiz-btn" onclick="checkGeometryQuiz(${n}, ${ladosNum}, this)">
                        ${n}
                    </button>
                `).join('')}
            </div>
        </div>
    `;
}

function checkGeometryQuiz(chosen, correct, btn) {
    const btns = document.querySelectorAll('.quiz-btn');
    btns.forEach(b => b.disabled = true);
    
    if (chosen === correct) {
        btn.classList.add('correct');
        if (window.showToastGlobal) window.showToastGlobal('🎉 ¡Correcto! +5 ⭐');
        if (window.addStarsGlobal) window.addStarsGlobal(5, document.getElementById('geometry-detail'));
        if (window.addCoinsGlobal) window.addCoinsGlobal(2, document.getElementById('geometry-detail'));
        speak('¡Muy bien! El ' + GEOMETRY_DATA.find(g => parseInt(g.lados) === correct)?.nombre + ' tiene ' + correct + ' lados', 'es');
    } else {
        btn.classList.add('wrong');
        speak('Casi, intenta de nuevo', 'es');
        setTimeout(() => {
            btns.forEach(b => { b.disabled = false;
                b.classList.remove('wrong'); });
        }, 800);
    }
}

function closeGeometryDetail() {
    document.getElementById('geometry-list').style.display = '';
    document.getElementById('geometry-detail').classList.remove('visible');
    document.getElementById('geometry-detail').innerHTML = '';
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

export { renderGeometry };
