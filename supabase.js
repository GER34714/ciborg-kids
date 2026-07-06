// js/supabase.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import CONFIG from './config.js';

// ============================================
// CLIENTE SUPABASE
// ============================================
export const supabase = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_KEY);

// ============================================
// AUTENTICACIÓN
// ============================================
export const AuthAPI = {
    async getSession() {
        try {
            const { data, error } = await supabase.auth.getSession();
            if (error) throw error;
            return data.session;
        } catch (error) {
            if (error.message?.includes('Auth session missing')) {
                return null;
            }
            console.error('Error obteniendo sesión:', error);
            return null;
        }
    },

    async signInWithGoogle() {
        try {
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: window.location.origin + window.location.pathname
                }
            });
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error en login con Google:', error);
            throw error;
        }
    },

    async signOut() {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error cerrando sesión:', error);
            throw error;
        }
    },

    async getCurrentUser() {
        try {
            const { data: { user }, error } = await supabase.auth.getUser();
            if (error) throw error;
            return user;
        } catch (error) {
            return null;
        }
    },

    async getProfile(userId) {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();
            
            if (error && error.code !== 'PGRST116') throw error;
            return data;
        } catch (error) {
            console.error('Error obteniendo perfil:', error);
            return null;
        }
    },

    async updateProfile(userId, updates) {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .update(updates)
                .eq('id', userId)
                .select()
                .single();
            
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error actualizando perfil:', error);
            throw error;
        }
    }
};

// ============================================
// PROGRESO
// ============================================
export const ProgressAPI = {
    async getUserProgress(userId) {
        try {
            const { data, error } = await supabase
                .from('progress')
                .select('*')
                .eq('user_id', userId);
            
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error obteniendo progreso:', error);
            return [];
        }
    },

    async completeItem(userId, category, itemId) {
        try {
            const { data, error } = await supabase
                .from('progress')
                .upsert({
                    user_id: userId,
                    category,
                    item_id: itemId,
                    completed: true,
                    completed_at: new Date().toISOString()
                })
                .select();
            
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error completando item:', error);
            throw error;
        }
    }
};

// ============================================
// STICKERS
// ============================================
export const StickerAPI = {
    async collectSticker(userId, stickerId) {
        try {
            const { data, error } = await supabase
                .from('sticker_collection')
                .insert({ 
                    user_id: userId, 
                    sticker_id: stickerId,
                    collected_at: new Date().toISOString()
                })
                .select();
            
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error coleccionando sticker:', error);
            throw error;
        }
    },

    async getUserStickers(userId) {
        try {
            const { data, error } = await supabase
                .from('sticker_collection')
                .select('sticker_id, collected_at')
                .eq('user_id', userId);
            
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error obteniendo stickers:', error);
            return [];
        }
    }
};

// ============================================
// FAVORITOS
// ============================================
export const FavoritesAPI = {
    async addFavorite(userId, videoId) {
        try {
            const { data, error } = await supabase
                .from('favorites')
                .insert({ 
                    user_id: userId, 
                    video_id: videoId,
                    added_at: new Date().toISOString()
                })
                .select();
            
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error agregando favorito:', error);
            throw error;
        }
    },

    async removeFavorite(userId, videoId) {
        try {
            const { error } = await supabase
                .from('favorites')
                .delete()
                .eq('user_id', userId)
                .eq('video_id', videoId);
            
            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error eliminando favorito:', error);
            throw error;
        }
    },

    async getUserFavorites(userId) {
        try {
            const { data, error } = await supabase
                .from('favorites')
                .select('video_id, added_at')
                .eq('user_id', userId);
            
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error obteniendo favoritos:', error);
            return [];
        }
    }
};

export default supabase;
