// js/auth.js
import { AuthAPI } from './supabase.js';

// ============================================
// ESTADO DE AUTENTICACIÓN
// ============================================
let currentUser = null;
let currentProfile = null;
let authListeners = [];
let isInitialized = false;

// ============================================
// FUNCIONES DE AUTENTICACIÓN
// ============================================
export async function initAuth() {
    // Evitar inicializar múltiples veces
    if (isInitialized) {
        return { success: !!currentUser, user: currentUser, profile: currentProfile };
    }
    isInitialized = true;
    
    try {
        // Verificar si hay sesión activa
        const session = await AuthAPI.getSession();
        
        if (!session) {
            console.log('🔓 No hay sesión activa - Mostrando login');
            return { success: false };
        }
        
        const user = await AuthAPI.getCurrentUser();
        if (user) {
            currentUser = user;
            const profile = await AuthAPI.getProfile(user.id);
            currentProfile = profile;
            
            // Verificar si está bloqueado
            if (profile?.is_blocked) {
                await logout();
                return { success: false, blocked: true };
            }
            
            console.log('✅ Sesión activa - Usuario:', user.email);
            notifyAuthListeners();
            return { success: true, user, profile };
        }
        
        return { success: false };
    } catch (error) {
        console.error('Error inicializando auth:', error);
        return { success: false };
    }
}

export function getUser() { return currentUser; }
export function getProfile() { return currentProfile; }
export function isAuthenticated() { return !!currentUser; }
export function isPremium() { return currentProfile?.is_premium || false; }
export function isAdmin() { return currentProfile?.is_admin || false; }

export async function loginWithGoogle() {
    try {
        const data = await AuthAPI.signInWithGoogle();
        return { success: true };
    } catch (error) {
        console.error('Error en login:', error);
        return { success: false, error: error.message };
    }
}

export async function loginWithEmail(email, password) {
    try {
        const data = await AuthAPI.signInWithEmail(email, password);
        currentUser = data.user;
        currentProfile = await AuthAPI.getProfile(data.user.id);
        
        if (currentProfile?.is_blocked) {
            await logout();
            return { success: false, blocked: true };
        }
        
        notifyAuthListeners();
        return { success: true, user: data.user, profile: currentProfile };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function registerWithEmail(email, password, username) {
    try {
        const data = await AuthAPI.signUpWithEmail(email, password, username);
        currentUser = data.user;
        currentProfile = await AuthAPI.getProfile(data.user.id);
        notifyAuthListeners();
        return { success: true, user: data.user, profile: currentProfile };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function logout() {
    try {
        await AuthAPI.signOut();
        currentUser = null;
        currentProfile = null;
        notifyAuthListeners();
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// ============================================
// LISTENERS PARA CAMBIOS DE AUTENTICACIÓN
// ============================================
export function onAuthChange(callback) {
    authListeners.push(callback);
    return () => {
        authListeners = authListeners.filter(cb => cb !== callback);
    };
}

function notifyAuthListeners() {
    authListeners.forEach(cb => {
        try {
            cb(currentUser, currentProfile);
        } catch (e) {
            console.error('Error en listener:', e);
        }
    });
}

// ============================================
// ACTUALIZAR PERFIL
// ============================================
export async function updateProfile(updates) {
    if (!currentUser) return { success: false, error: 'No autenticado' };
    
    try {
        const profile = await AuthAPI.updateProfile(currentUser.id, updates);
        currentProfile = profile;
        notifyAuthListeners();
        return { success: true, profile };
    } catch (error) {
        return { success: false, error: error.message };
    }
}
