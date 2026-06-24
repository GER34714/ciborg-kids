// js/cartoons.js
export const CARTOONS_DATA = [
    { id: 'v1', titulo: 'Canción del ABC', video_id: 't5jv0zZnNkU', categoria: 'educativo', thumbnail: 'https://img.youtube.com/vi/t5jv0zZnNkU/0.jpg' },
    { id: 'v2', titulo: 'Números 1-10', video_id: 'bRNfZ3r_1zA', categoria: 'educativo', thumbnail: 'https://img.youtube.com/vi/bRNfZ3r_1zA/0.jpg' },
    { id: 'v3', titulo: 'Colores', video_id: 'dQw4w9WgXcQ', categoria: 'educativo', thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/0.jpg' },
    { id: 'v4', titulo: 'Animales de la Granja', video_id: 'XqZsoesa55w', categoria: 'animales', thumbnail: 'https://img.youtube.com/vi/XqZsoesa55w/0.jpg' },
    { id: 'v5', titulo: 'Cuento de la Sirenita', video_id: 'vZ7Tf2k5Xxo', categoria: 'cuentos', thumbnail: 'https://img.youtube.com/vi/vZ7Tf2k5Xxo/0.jpg' }
];

let currentVideo = null;
let favorites = new Set();

export function renderCartoons() {
    const area = document.getElementById('cartoons-area');
    if (!area) {
        // Crear la sección si no existe
        createCartoonsSection();
        return;
    }
    
    area.innerHTML = `
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:16px;margin-bottom:16px">
            ${CARTOONS_DATA.map(v => `
                <div style="background:#fff;border-radius:16px;overflow:hidden;cursor:pointer;border:3px solid #eee;transition:all 0.3s" onclick="window.openVideoGlobal('${v.id}')">
                    <img src="${v.thumbnail}" alt="${v.titulo}" style="width:100%;aspect-ratio:16/9;object-fit:cover">
                    <div style="padding:12px">
                        <div style="font-size:14px;font-weight:900;color:#2d2d2d">${v.titulo}</div>
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:4px">
                            <span style="font-size:10px;color:#888;text-transform:capitalize">${v.categoria}</span>
                            <button onclick="event.stopPropagation();window.toggleFavoriteGlobal('${v.id}')" style="background:none;border:none;font-size:20px;cursor:pointer">
                                ${favorites.has(v.id) ? '❤️' : '🤍'}
                            </button>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
        <div id="video-player" style="display:none;background:#000;border-radius:16px;overflow:hidden;position:relative;padding-bottom:56.25%;height:0">
            <iframe id="video-frame" style="position:absolute;top:0;left:0;width:100%;height:100%;border:none" allowfullscreen></iframe>
            <button onclick="window.closeVideoGlobal()" style="position:absolute;top:10px;right:10px;background:rgba(0,0,0,0.7);color:#fff;border:none;border-radius:50%;width:40px;height:40px;font-size:20px;cursor:pointer;z-index:10">✕</button>
        </div>
    `;
}

function createCartoonsSection() {
    const content = document.querySelector('.content');
    if (!content) return;
    
    const section = document.createElement('div');
    section.id = 'sec-cartoons';
    section.className = 'hidden';
    section.innerHTML = `
        <div class="sec-hdr">
            <div class="sec-icon" style="background:#FCE4EC">🎬</div>
            <div>
                <div class="sec-title">Dibujos Animados</div>
                <div class="sec-sub">Videos educativos para niños</div>
            </div>
        </div>
        <div id="cartoons-area"></div>
    `;
    content.appendChild(section);
    
    // Agregar el tab de navegación
    const navTabs = document.querySelector('.nav-tabs');
    if (navTabs) {
        const btn = document.createElement('button');
        btn.className = 'tab-btn';
        btn.textContent = '🎬 Dibujos';
        btn.onclick = () => window.showSection('cartoons');
        navTabs.appendChild(btn);
    }
    
    renderCartoons();
}

function openVideo(videoId) {
    const video = CARTOONS_DATA.find(v => v.id === videoId);
    if (!video) return;
    
    currentVideo = video;
    const player = document.getElementById('video-player');
    const frame = document.getElementById('video-frame');
    if (player && frame) {
        player.style.display = 'block';
        frame.src = `https://www.youtube.com/embed/${video.video_id}?autoplay=1&rel=0&modestbranding=1&iv_load_policy=3`;
        // Registrar actividad
        if (window.AdminAPI) {
            window.AdminAPI.logActivity(window.currentUserId, 'watch_video', { video_id: video.id, titulo: video.titulo });
        }
    }
}

function closeVideo() {
    const player = document.getElementById('video-player');
    const frame = document.getElementById('video-frame');
    if (player && frame) {
        player.style.display = 'none';
        frame.src = '';
    }
}

function toggleFavorite(videoId) {
    if (favorites.has(videoId)) {
        favorites.delete(videoId);
        if (window.showToastGlobal) window.showToastGlobal('💔 Eliminado de favoritos', 'warning');
    } else {
        favorites.add(videoId);
        if (window.showToastGlobal) window.showToastGlobal('❤️ Agregado a favoritos', 'warning');
        if (window.addCoinsGlobal) window.addCoinsGlobal(1, document.getElementById('cartoons-area'));
    }
    renderCartoons();
}

export { renderCartoons, openVideo, closeVideo, toggleFavorite };
