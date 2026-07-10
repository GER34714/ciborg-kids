// js/auth.js - VERSIÓN COMPLETA CORREGIDA
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
        console.log('📦 Session:', session ? 'Activa' : 'No hay sesión');
        
        if (!session) {
            return { success: false };
        }
        
        const { data: { user } } = await supabase.auth.getUser();
        console.log('👤 Usuario:', user?.email);
        
        if (!user) {
            return { success: false };
        }
        
        currentUser = user;
        
        let profile = null;
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();
            
            if (error && error.code === 'PGRST116') {
                console.log('🆕 Creando perfil para usuario...');
                const newProfile = {
                    id: user.id,
                    email: user.email,
                    username: user.email?.split('@')[0] || 'Explorador',
                    avatar: '🦊',
                    coins: 50,
                    stars: 0,
                    level: 1,
                    is_admin: false,
                    is_premium: false,
                    is_blocked: false,
                    created_at: new Date().toISOString()
                };
                
                const { data: inserted, error: insertError } = await supabase
                    .from('profiles')
                    .insert(newProfile)
                    .select()
                    .single();
                
                if (insertError) {
                    console.error('❌ Error creando perfil:', insertError);
                } else {
                    profile = inserted;
                    console.log('✅ Perfil creado exitosamente');
                }
            } else if (error) {
                console.error('❌ Error obteniendo perfil:', error);
            } else {
                profile = data;
                console.log('📋 Perfil cargado');
            }
        } catch (error) {
            console.error('❌ Error en perfil:', error);
        }
        
        currentProfile = profile || {
            id: user.id,
            email: user.email,
            username: user.email?.split('@')[0] || 'Explorador',
            avatar: '🦊',
            coins: 50,
            stars: 0,
            level: 1
        };
        
        return { success: true, user, profile: currentProfile };
    } catch (error) {
        console.error('❌ Error en initAuth:', error);
        return { success: false, error: error.message };
    }
}

export async function loginWithGoogle() {
    console.log('🔄 Iniciando login con Google...');
    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            console.log('ℹ️ Ya hay sesión activa');
            return { success: true };
        }
        
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

// ============================================
// LOGOUT CORREGIDO - LIMPIA TODO
// ============================================
export async function logout() {
    console.log('🚪 Cerrando sesión...');
    try {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.warn('⚠️ Error en Supabase logout:', error);
        }
    } catch (error) {
        console.warn('⚠️ Error en Supabase logout:', error);
    }
    
    currentUser = null;
    currentProfile = null;
    authListeners = [];
    
    localStorage.removeItem('ciborg_user');
    localStorage.removeItem('ciborg_demo_user');
    
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('supabase') || key.includes('auth'))) {
            keysToRemove.push(key);
        }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    sessionStorage.clear();
    
    document.cookie.split(";").forEach(function(c) {
        document.cookie = c
            .replace(/^ +/, "")
            .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    
    console.log('✅ Sesión cerrada y todos los datos limpiados');
    return { success: true };
}

// ============================================
// EXPORTAR TODAS LAS FUNCIONES
// ============================================
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

export async function signInWithGoogle() {
    return loginWithGoogle();
}
