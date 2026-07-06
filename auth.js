// js/auth.js
import CONFIG from './config.js';
import { supabase } from './supabase.js';

let currentUser = null;
let currentProfile = null;
let authListeners = [];

// ============================================
// FUNCIONES DE AUTENTICACIÓN
// ============================================
export async function initAuth() {
    console.log('🔐 Inicializando auth...');
    try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log('📦 Session:', session);
        
        if (!session) {
            console.log('🔓 No hay sesión activa');
            return { success: false };
        }
        
        const { data: { user } } = await supabase.auth.getUser();
        console.log('👤 Usuario:', user);
        
        if (user) {
            currentUser = user;
            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();
            
            currentProfile = profile;
            console.log('📋 Perfil:', profile);
            
            return { success: true, user, profile };
        }
        
        return { success: false };
    } catch (error) {
        console.error('Error en initAuth:', error);
        return { success: false };
    }
}

export async function loginWithGoogle() {
    console.log('🔄 Iniciando login con Google...');
    try {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin + window.location.pathname,
                queryParams: {
                    access_type: 'offline',
                    prompt: 'consent'
                }
            }
        });
        
        if (error) throw error;
        console.log('✅ Redirigiendo a Google...');
        return { success: true };
    } catch (error) {
        console.error('❌ Error en login:', error);
        return { success: false, error: error.message };
    }
}

export async function loginWithEmail(email, password) {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        if (error) throw error;
        currentUser = data.user;
        return { success: true, user: data.user };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function logout() {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        currentUser = null;
        currentProfile = null;
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export function getUser() { 
    return currentUser; 
}

export function getProfile() { 
    return currentProfile; 
}

export function isAuthenticated() { 
    return !!currentUser; 
}

export function isPremium() { 
    return currentProfile?.is_premium || false; 
}

export function isAdmin() { 
    return currentProfile?.is_admin || false; 
}

export function onAuthChange(callback) {
    authListeners.push(callback);
    return () => {
        authListeners = authListeners.filter(cb => cb !== callback);
    };
}

export async function updateProfile(updates) {
    if (!currentUser) return { success: false, error: 'No autenticado' };
    
    try {
        const { data, error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', currentUser.id)
            .select()
            .single();
        
        if (error) throw error;
        currentProfile = data;
        return { success: true, profile: data };
    } catch (error) {
        return { success: false, error: error.message };
    }
}
