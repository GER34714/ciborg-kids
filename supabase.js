// js/supabase.js - VERSIÓN COMPLETA CON FIGURITAS + STORAGE
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
// STICKERS — COLECCIÓN DEL USUARIO
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
// CATÁLOGO DE FIGURITAS (NUEVO)
// ============================================
export const StickerCatalogAPI = {
    /**
     * Trae todas las figuritas activas, ordenadas.
     * Se usa en el álbum y la tienda.
     */
    async getAll() {
        try {
            const { data, error } = await supabase
                .from('stickers')
                .select('*')
                .eq('activo', true)
                .order('orden', { ascending: true })
                .order('created_at', { ascending: true });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error obteniendo catálogo de figuritas:', error);
            return [];
        }
    },

    /**
     * Trae TODAS las figuritas (incluso inactivas) — solo admin.
     */
    async getAllAdmin() {
        try {
            const { data, error } = await supabase
                .from('stickers')
                .select('*')
                .order('orden', { ascending: true })
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error obteniendo catálogo admin:', error);
            return [];
        }
    },

    /**
     * Trae una figurita por id.
     */
    async getById(id) {
        try {
            const { data, error } = await supabase
                .from('stickers')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error obteniendo figurita:', error);
            return null;
        }
    },

    /**
     * Crea una figurita nueva (solo admin).
     */
    async create(sticker) {
        try {
            const { data, error } = await supabase
                .from('stickers')
                .insert(sticker)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error creando figurita:', error);
            throw error;
        }
    },

    /**
     * Actualiza una figurita (solo admin).
     */
    async update(id, updates) {
        try {
            const { data, error } = await supabase
                .from('stickers')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error actualizando figurita:', error);
            throw error;
        }
    },

    /**
     * Elimina una figurita (solo admin).
     */
    async delete(id) {
        try {
            const { error } = await supabase
                .from('stickers')
                .delete()
                .eq('id', id);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error eliminando figurita:', error);
            throw error;
        }
    }
};

// ============================================
// STORAGE — SUBIR IMÁGENES DE FIGURITAS
// ============================================
export const StorageAPI = {
    /**
     * Sube una imagen al bucket "stickers".
     * Devuelve la URL pública.
     *
     * @param {File} file - El archivo (input type=file)
     * @returns {Promise<{url: string, path: string}>}
     */
    async uploadStickerImage(file) {
        try {
            // Generar un nombre único
            const ext = file.name.split('.').pop().toLowerCase();
            const timestamp = Date.now();
            const random = Math.random().toString(36).substring(2, 8);
            const fileName = `sticker_${timestamp}_${random}.${ext}`;
            const filePath = fileName;

            // Subir el archivo
            const { data, error } = await supabase.storage
                .from('stickers')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (error) throw error;

            // Obtener URL pública
            const { data: urlData } = supabase.storage
                .from('stickers')
                .getPublicUrl(filePath);

            return {
                url: urlData.publicUrl,
                path: filePath
            };
        } catch (error) {
            console.error('Error subiendo imagen:', error);
            throw error;
        }
    },

    /**
     * Elimina una imagen del bucket.
     * Acepta la URL pública o el path.
     */
    async deleteStickerImage(urlOrPath) {
        try {
            let path = urlOrPath;

            // Si es una URL pública, extraer el path
            if (urlOrPath.startsWith('http')) {
                const parts = urlOrPath.split('/stickers/');
                if (parts.length > 1) {
                    path = parts[1];
                }
            }

            const { error } = await supabase.storage
                .from('stickers')
                .remove([path]);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error eliminando imagen:', error);
            throw error;
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

// ============================================
// ADMIN
// ============================================
export const AdminAPI = {
    async getAllUsers() {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error obteniendo usuarios:', error);
            return [];
        }
    },

    async blockUser(userId, isBlocked = true) {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .update({ is_blocked: isBlocked })
                .eq('id', userId)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error bloqueando usuario:', error);
            throw error;
        }
    },

    async setAdmin(userId, isAdmin = true) {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .update({ is_admin: isAdmin })
                .eq('id', userId)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error asignando admin:', error);
            throw error;
        }
    },

    async setPremium(userId, isPremium = true) {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .update({ is_premium: isPremium })
                .eq('id', userId)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error asignando premium:', error);
            throw error;
        }
    },

    async deleteUser(userId) {
        try {
            const { error } = await supabase
                .from('profiles')
                .delete()
                .eq('id', userId);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error eliminando usuario:', error);
            throw error;
        }
    }
};

export default supabase;
