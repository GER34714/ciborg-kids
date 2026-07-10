// js/sounds.js - SISTEMA DE SONIDOS PARA TODOS LOS JUEGOS
// ============================================

class SoundManager {
    constructor() {
        this.audioCtx = null;
        this.enabled = true;
        this.initialized = false;
        this.init();
    }

    init() {
        try {
            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            this.initialized = true;
            console.log('🎵 Sistema de sonidos inicializado');
        } catch (e) {
            console.warn('⚠️ Web Audio API no soportada');
            this.enabled = false;
        }
    }

    // ============================================
    // SONIDOS BÁSICOS (para todos los juegos)
    // ============================================

    // ✅ Acierto - Melodía alegre
    playCorrect() {
        if (!this.enabled || !this.initialized) return;
        this.playTone(523, 0.1);
        setTimeout(() => this.playTone(659, 0.1), 100);
        setTimeout(() => this.playTone(784, 0.15), 200);
    }

    // ❌ Error - Sonido grave
    playWrong() {
        if (!this.enabled || !this.initialized) return;
        this.playTone(330, 0.3, 'sawtooth', 0.2);
    }

    // ⭐ Estrella - Sonido mágico
    playStar() {
        if (!this.enabled || !this.initialized) return;
        this.playTone(1200, 0.05, 'sine', 0.2);
        setTimeout(() => this.playTone(1500, 0.05, 'sine', 0.15), 50);
        setTimeout(() => this.playTone(1800, 0.1, 'sine', 0.1), 100);
    }

    // 🎉 Victoria - Fanfarria épica
    playVictory() {
        if (!this.enabled || !this.initialized) return;
        const notes = [523, 587, 659, 784, 880, 988, 1047, 1175];
        notes.forEach((freq, i) => {
            setTimeout(() => this.playTone(freq, 0.15, 'sine', 0.2), i * 100);
        });
    }

    // 💀 Derrota - Melodía descendente
    playDefeat() {
        if (!this.enabled || !this.initialized) return;
        const notes = [400, 350, 300, 250];
        notes.forEach((freq, i) => {
            setTimeout(() => this.playTone(freq, 0.3, 'sawtooth', 0.15), i * 200);
        });
    }

    // 🔥 Racha - 3 aciertos seguidos
    playStreak() {
        if (!this.enabled || !this.initialized) return;
        const notes = [523, 659, 784, 1047];
        notes.forEach((freq, i) => {
            setTimeout(() => this.playTone(freq, 0.1, 'sine', 0.25), i * 80);
        });
    }

    // 🔢 Número - Voz sintética
    playNumber(num, lang = 'es') {
        if (!this.enabled) return;
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
            const u = new SpeechSynthesisUtterance(num.toString());
            u.lang = lang === 'es' ? 'es-AR' : 'en-US';
            u.rate = 0.85;
            u.pitch = 1.2;
            window.speechSynthesis.speak(u);
        }
    }

    // 🖱️ Click - Feedback táctil
    playClick() {
        if (!this.enabled || !this.initialized) return;
        this.playTone(800, 0.05, 'sine', 0.1);
    }

    // ⬆️ Nivel completado
    playLevelComplete() {
        if (!this.enabled || !this.initialized) return;
        const notes = [523, 523, 523, 659, 784, 1047];
        notes.forEach((freq, i) => {
            setTimeout(() => this.playTone(freq, 0.12, 'sine', 0.2), i * 120);
        });
    }

    // 🎈 Celebración corta
    playCelebration() {
        if (!this.enabled || !this.initialized) return;
        const notes = [1047, 880, 784, 659, 523];
        notes.forEach((freq, i) => {
            setTimeout(() => this.playTone(freq, 0.08, 'sine', 0.15), i * 70);
        });
    }

    // ⏰ Tic - Para temporizadores
    playTick() {
        if (!this.enabled || !this.initialized) return;
        this.playTone(1000, 0.03, 'sine', 0.05);
    }

    // 🎯 Acierto especial
    playDart() {
        if (!this.enabled || !this.initialized) return;
        this.playTone(400, 0.1, 'sawtooth', 0.1);
        setTimeout(() => this.playTone(600, 0.05, 'sine', 0.1), 50);
    }

    // ============================================
    // FUNCIÓN PRINCIPAL DE TONOS
    // ============================================
    playTone(frequency, duration, type = 'sine', volume = 0.3) {
        if (!this.enabled || !this.initialized || !this.audioCtx) return;
        
        try {
            const oscillator = this.audioCtx.createOscillator();
            const gainNode = this.audioCtx.createGain();
            
            oscillator.type = type;
            oscillator.frequency.value = frequency;
            
            gainNode.gain.setValueAtTime(volume, this.audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + duration);
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioCtx.destination);
            
            oscillator.start();
            oscillator.stop(this.audioCtx.currentTime + duration);
        } catch (e) {
            // Silenciar errores de audio
        }
    }

    // ============================================
    // CONTROL
    // ============================================
    toggle() {
        this.enabled = !this.enabled;
        if (this.enabled && !this.initialized) {
            this.init();
        }
        return this.enabled;
    }

    isEnabled() {
        return this.enabled;
    }
}

// ============================================
// EXPORTAR INSTANCIA ÚNICA
// ============================================
const soundManager = new SoundManager();
export default soundManager;

// ============================================
// FUNCIÓN HELPER PARA USAR EN CUALQUIER LUGAR
// ============================================
export function playSound(type, ...args) {
    if (soundManager.isEnabled()) {
        switch(type) {
            case 'correct': soundManager.playCorrect(); break;
            case 'wrong': soundManager.playWrong(); break;
            case 'star': soundManager.playStar(); break;
            case 'victory': soundManager.playVictory(); break;
            case 'defeat': soundManager.playDefeat(); break;
            case 'streak': soundManager.playStreak(); break;
            case 'click': soundManager.playClick(); break;
            case 'level': soundManager.playLevelComplete(); break;
            case 'celebration': soundManager.playCelebration(); break;
            case 'tick': soundManager.playTick(); break;
            case 'dart': soundManager.playDart(); break;
            case 'number': soundManager.playNumber(...args); break;
            default: break;
        }
    }
}
