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
            <div style="font-size:36px;font-weight:900;margin:8px 0">${geometry.nombre}</div
